import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Gamepad2, Trophy, Coins, RotateCcw, Sparkles, Heart, Zap, Users, Crown, ChevronLeft, Shield } from 'lucide-react';
import { UserProfile, EstadoConfig } from '../types';

interface GamesViewProps {
  currentUser: UserProfile;
  estadoConfig: EstadoConfig;
  usuarios?: UserProfile[];
  onAddCertcoins: (quantidade: number) => void;
}

interface PlayerEntity {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  isPlayer: boolean;
  isOnline: boolean;
  avatar?: string;
  score: number;
  targetX?: number;
  targetY?: number;
  vx: number;
  vy: number;
  decisionCooldown?: number;
}

interface FoodPellet {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
}

export const GamesView: React.FC<GamesViewProps> = ({
  currentUser,
  estadoConfig,
  usuarios = [],
  onAddCertcoins,
}) => {
  const [activeGame, setActiveGame] = useState<'menu' | 'agario' | 'memory'>('menu');

  // --- AGAR.IO STATE ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [agarioScore, setAgarioScore] = useState(10);
  const [highScore, setHighScore] = useState(10);
  const [agarioGameOver, setAgarioGameOver] = useState(false);
  const [agarioWonCoins, setAgarioWonCoins] = useState(0);
  const [leaderboard, setLeaderboard] = useState<{ id: string; name: string; score: number; isPlayer: boolean; isOnline: boolean }[]>([]);
  const [killFeed, setKillFeed] = useState<string[]>([]);
  const [onlineCountInRoom, setOnlineCountInRoom] = useState(6);
  const [isBoosting, setIsBoosting] = useState(false);

  // Touch control ref
  const touchPosRef = useRef<{ x: number; y: number; active: boolean } | null>(null);

  // --- MEMORY GAME STATE ---
  const [memoryCards, setMemoryCards] = useState<{ id: number; symbol: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [memoryPhase, setMemoryPhase] = useState(1);
  const [memoryWon, setMemoryWon] = useState(false);

  // Initialize Memory Game with State Emojis
  const startMemoryGame = () => {
    const symbols = estadoConfig.emojisGame && estadoConfig.emojisGame.length >= 6
      ? estadoConfig.emojisGame
      : ['🧀', '☕', '⛪', '🎸', '🏖️', estadoConfig.emblem];
    const deck = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol, flipped: false, matched: false }));
    setMemoryCards(deck);
    setFlippedCards([]);
    setMemoryWon(false);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    const clicked = memoryCards.find((c) => c.id === id);
    if (!clicked || clicked.flipped || clicked.matched) return;

    const newCards = memoryCards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    setMemoryCards(newCards);
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [firstId, secondId] = newFlipped;
      const firstCard = memoryCards.find((c) => c.id === firstId);
      const secondCard = memoryCards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        setMemoryCards((prev) => prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, matched: true } : c)));
        setFlippedCards([]);

        setTimeout(() => {
          const allMatched = newCards.every((c) => c.matched || c.id === firstId || c.id === secondId);
          if (allMatched) {
            setMemoryWon(true);
            onAddCertcoins(0.50);
          }
        }, 300);
      } else {
        setTimeout(() => {
          setMemoryCards((prev) =>
            prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c))
          );
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  // --- AGAR.IO CANVAS GAME LOOP ---
  useEffect(() => {
    if (activeGame !== 'agario') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let currentScore = 10;
    let isGameOver = false;

    // Arena dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Player Object
    const player: PlayerEntity = {
      id: 'player',
      name: currentUser.nome.split(' ')[0] || 'Você',
      x: width / 2,
      y: height / 2,
      radius: 16,
      color: estadoConfig.cor || '#E8A838',
      isPlayer: true,
      isOnline: true,
      avatar: currentUser.foto,
      score: 10,
      vx: 0,
      vy: 0,
    };

    // Online Users & Moderate AI Bots
    const otherUsers = usuarios.filter((u) => u.id !== currentUser.id);
    const onlineNames = otherUsers.slice(0, 3).map((u) => ({
      name: u.nome.split(' ')[0],
      avatar: u.foto,
      isOnline: true,
    }));

    // Fallback names if few mock users
    const defaultOnline = [
      { name: 'Mariana', isOnline: true },
      { name: 'João Pedro', isOnline: true },
      { name: 'Camila', isOnline: true },
    ];

    const activeOnline = onlineNames.length > 0 ? onlineNames : defaultOnline;

    const botColors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#06B6D4'];

    let competitors: PlayerEntity[] = [
      // Online Real Users in the Room
      ...activeOnline.map((u, i) => ({
        id: `online-${i}`,
        name: u.name,
        x: 60 + Math.random() * (width - 120),
        y: 60 + Math.random() * (height - 120),
        radius: 15 + Math.floor(Math.random() * 8),
        color: botColors[i % botColors.length],
        isPlayer: false,
        isOnline: true,
        avatar: (u as any).avatar,
        score: 12 + Math.floor(Math.random() * 15),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        decisionCooldown: Math.floor(Math.random() * 20),
      })),
      // Moderate Bots with Natural Names
      {
        id: 'bot-1',
        name: 'Bot Zé',
        x: 80,
        y: 100,
        radius: 16,
        color: '#06B6D4',
        isPlayer: false,
        isOnline: false,
        score: 14,
        vx: 1.2,
        vy: 1,
        decisionCooldown: 10,
      },
      {
        id: 'bot-2',
        name: 'Bot Raimundo',
        x: width - 100,
        y: 120,
        radius: 20,
        color: '#8B5CF6',
        isPlayer: false,
        isOnline: false,
        score: 22,
        vx: -1,
        vy: 1.2,
        decisionCooldown: 15,
      },
      {
        id: 'bot-3',
        name: 'Bot Maria',
        x: width / 2,
        y: height - 80,
        radius: 18,
        color: '#EF4444',
        isPlayer: false,
        isOnline: false,
        score: 18,
        vx: 0.8,
        vy: -1.2,
        decisionCooldown: 25,
      },
    ];

    setOnlineCountInRoom(competitors.length + 1);

    // Food Pellets
    let foods: FoodPellet[] = Array.from({ length: 48 }, (_, idx) => ({
      id: idx,
      x: 20 + Math.random() * (width - 40),
      y: 20 + Math.random() * (height - 40),
      radius: 4,
      color: ['#F59E0B', '#EC4899', '#10B981', '#3B82F6', '#E8A838', '#A855F7'][Math.floor(Math.random() * 6)],
    }));

    // Mouse / Touch Position tracking
    let targetX = player.x;
    let targetY = player.y;

    const updateTarget = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      targetX = (clientX - rect.left) * scaleX;
      targetY = (clientY - rect.top) * scaleY;
      touchPosRef.current = { x: targetX, y: targetY, active: true };
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateTarget(e.clientX, e.clientY);
    };

    // Mobile Touch handlers with touch-action prevention
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        updateTarget(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        updateTarget(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      if (touchPosRef.current) {
        touchPosRef.current.active = false;
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    // Add kill feed notice
    const addFeed = (text: string) => {
      setKillFeed((prev) => [text, ...prev.slice(0, 3)]);
    };

    let frameCount = 0;

    // --- MAIN GAME LOOP ---
    const update = () => {
      if (isGameOver) return;
      frameCount++;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle arena grid
      ctx.strokeStyle = '#2A231D';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Touch Target Indicator if active on mobile
      if (touchPosRef.current && touchPosRef.current.active) {
        ctx.beginPath();
        ctx.arc(touchPosRef.current.x, touchPosRef.current.y, 14, 0, Math.PI * 2);
        ctx.strokeStyle = `${estadoConfig.cor}60`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
      }

      // 3. Draw Foods
      foods.forEach((f) => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.closePath();
      });

      // 4. Update Player Position smoothly based on Touch/Mouse target
      const dx = targetX - player.x;
      const dy = targetY - player.y;
      const distance = Math.hypot(dx, dy);

      // Realistic Agar.io Speed: Smaller = faster, larger = slightly slower
      const baseSpeed = isBoosting ? 5.5 : 3.8;
      const massPenalty = Math.max(0.6, 1 - (player.radius - 16) * 0.008);
      const moveSpeed = baseSpeed * massPenalty;

      if (distance > 4) {
        const step = Math.min(distance, moveSpeed);
        player.x += (dx / distance) * step;
        player.y += (dy / distance) * step;
      }

      // Keep player inside boundary
      player.x = Math.max(player.radius, Math.min(width - player.radius, player.x));
      player.y = Math.max(player.radius, Math.min(height - player.radius, player.y));

      // 5. Check Player Food Collision
      for (let i = foods.length - 1; i >= 0; i--) {
        const f = foods[i];
        if (Math.hypot(player.x - f.x, player.y - f.y) < player.radius + f.radius) {
          currentScore += 1;
          player.score = currentScore;
          setAgarioScore(currentScore);
          setHighScore((prev) => Math.max(prev, currentScore));
          player.radius = Math.min(45, 16 + currentScore * 0.25);

          // Respawn pellet
          foods[i] = {
            id: Date.now() + i,
            x: 20 + Math.random() * (width - 40),
            y: 20 + Math.random() * (height - 40),
            radius: 4,
            color: ['#F59E0B', '#EC4899', '#10B981', '#3B82F6', '#E8A838', '#A855F7'][Math.floor(Math.random() * 6)],
          };
        }
      }

      // 6. Update Competitors (Moderate AI Logic + Online Players)
      competitors.forEach((c) => {
        // Natural decision interval (every 15-25 frames) so bot acts with human-like moderation
        c.decisionCooldown = (c.decisionCooldown || 0) - 1;
        if (c.decisionCooldown <= 0) {
          c.decisionCooldown = 15 + Math.floor(Math.random() * 15);

          let chosenTargetX = c.x + c.vx * 30;
          let chosenTargetY = c.y + c.vy * 30;

          // AI Evaluation:
          // A. Is player nearby?
          const distToPlayer = Math.hypot(player.x - c.x, player.y - c.y);

          if (distToPlayer < 140) {
            if (player.radius > c.radius * 1.1) {
              // FLEE: Player is bigger! Run away moderately in opposite direction
              const escapeAngle = Math.atan2(c.y - player.y, c.x - player.x);
              chosenTargetX = c.x + Math.cos(escapeAngle) * 80;
              chosenTargetY = c.y + Math.sin(escapeAngle) * 80;
            } else if (c.radius > player.radius * 1.15 && distToPlayer < 110) {
              // HUNT: Bot is clearly bigger! Pursue player with moderate speed
              chosenTargetX = player.x;
              chosenTargetY = player.y;
            }
          } else {
            // FORAGE: Find the closest food pellet
            let closestFood: FoodPellet | null = null;
            let minFoodDist = Infinity;
            foods.slice(0, 15).forEach((f) => {
              const d = Math.hypot(f.x - c.x, f.y - c.y);
              if (d < minFoodDist) {
                minFoodDist = d;
                closestFood = f;
              }
            });

            if (closestFood) {
              chosenTargetX = (closestFood as FoodPellet).x;
              chosenTargetY = (closestFood as FoodPellet).y;
            }
          }

          c.targetX = chosenTargetX;
          c.targetY = chosenTargetY;
        }

        // Steer competitor towards chosen target
        if (c.targetX !== undefined && c.targetY !== undefined) {
          const cdx = c.targetX - c.x;
          const cdy = c.targetY - c.y;
          const cDist = Math.hypot(cdx, cdy);
          const botSpeed = Math.max(1.2, 2.6 - (c.radius - 15) * 0.02);
          if (cDist > 4) {
            c.vx = (cdx / cDist) * botSpeed;
            c.vy = (cdy / cDist) * botSpeed;
          }
        }

        c.x += c.vx;
        c.y += c.vy;

        // Bounce on boundary gently
        if (c.x < c.radius) {
          c.x = c.radius;
          c.vx *= -1;
        } else if (c.x > width - c.radius) {
          c.x = width - c.radius;
          c.vx *= -1;
        }
        if (c.y < c.radius) {
          c.y = c.radius;
          c.vy *= -1;
        } else if (c.y > height - c.radius) {
          c.y = height - c.radius;
          c.vy *= -1;
        }

        // Competitor eats food
        for (let fi = 0; fi < foods.length; fi++) {
          const f = foods[fi];
          if (Math.hypot(c.x - f.x, c.y - f.y) < c.radius + f.radius) {
            c.score += 1;
            c.radius = Math.min(42, 15 + c.score * 0.22);
            foods[fi] = {
              id: Date.now() + fi,
              x: 20 + Math.random() * (width - 40),
              y: 20 + Math.random() * (height - 40),
              radius: 4,
              color: ['#F59E0B', '#EC4899', '#10B981', '#3B82F6', '#E8A838'][Math.floor(Math.random() * 5)],
            };
            break;
          }
        }

        // 7. Check Player vs Competitor Collision
        const distWithPlayer = Math.hypot(player.x - c.x, player.y - c.y);
        if (distWithPlayer < player.radius + c.radius - 2) {
          if (player.radius > c.radius * 1.1) {
            // Player DEVOURS Competitor!
            currentScore += Math.floor(c.score * 0.6);
            player.score = currentScore;
            setAgarioScore(currentScore);
            setHighScore((prev) => Math.max(prev, currentScore));
            player.radius = Math.min(50, 16 + currentScore * 0.25);
            addFeed(`Você devorou ${c.name} (+${Math.floor(c.score * 0.6)} pts)! 💥`);

            // Reward Certcoin for eliminating a competitor
            onAddCertcoins(0.25);

            // Respawn competitor at a safe distance
            c.x = Math.random() < 0.5 ? 40 : width - 40;
            c.y = Math.random() * height;
            c.score = 12 + Math.floor(Math.random() * 6);
            c.radius = 15;
          } else if (c.radius > player.radius * 1.1) {
            // Player is DEVOURS by Competitor -> Game Over
            isGameOver = true;
            setAgarioGameOver(true);
            const prize = currentScore > 30 ? 1.00 : 0.50;
            setAgarioWonCoins(prize);
            onAddCertcoins(prize);
            addFeed(`${c.name} eliminou você! 💔`);
          }
        }

        // Draw Competitor Ball
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fillStyle = c.color;
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = c.isOnline ? '#10B981' : '#ffffff';
        ctx.stroke();
        ctx.closePath();

        // Label above competitor
        ctx.fillStyle = '#F5E9D3';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        const badge = c.isOnline ? ' 🟢' : '';
        ctx.fillText(`${c.name}${badge}`, c.x, c.y - c.radius - 6);

        // Competitor Score / Mass tag
        ctx.fillStyle = '#C8B8A0';
        ctx.font = '9px monospace';
        ctx.fillText(`${c.score} pts`, c.x, c.y + c.radius + 12);
      });

      // 8. Draw Player Ball (Highlighted in Gold / Glow)
      ctx.save();
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = estadoConfig.cor || '#E8A838';
      ctx.shadowColor = estadoConfig.cor || '#E8A838';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.closePath();

      // Player Name & Crown / Gold Badge
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`⭐ ${player.name}`, player.x, player.y - player.radius - 8);

      // Player Score label under ball
      ctx.fillStyle = '#F5E9D3';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${currentScore} pts`, player.x, player.y + player.radius + 14);
      ctx.restore();

      // 9. Update Live Leaderboard array every 10 frames
      if (frameCount % 10 === 0) {
        const allInRoom = [
          { id: 'player', name: `${player.name} (Você)`, score: currentScore, isPlayer: true, isOnline: true },
          ...competitors.map((c) => ({
            id: c.id,
            name: c.name,
            score: c.score,
            isPlayer: false,
            isOnline: c.isOnline,
          })),
        ].sort((a, b) => b.score - a.score);

        setLeaderboard(allInRoom);
      }

      if (!isGameOver) {
        animationFrameId = requestAnimationFrame(update);
      }
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeGame, currentUser, estadoConfig, isBoosting, onAddCertcoins, usuarios]);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 text-[#F5E9D3]">
      {/* MENU INICIAL DOS JOGOS */}
      {activeGame === 'menu' && (
        <div className="space-y-6">
          <div className="text-center bg-[#1E1915] border border-[#382E24] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div
              className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: estadoConfig.cor }}
            />
            <Gamepad2
              className="w-14 h-14 mx-auto mb-3 animate-bounce"
              style={{ color: estadoConfig.cor }}
            />
            <h2 className="text-2xl sm:text-3xl font-black mb-2 text-[#F5E9D3]">
              Joguinhos & Arena ({estadoConfig.nome}) {estadoConfig.emblem}
            </h2>
            <p className="text-xs sm:text-sm text-[#C8B8A0] max-w-lg mx-auto leading-relaxed">
              Jogue em tempo real com outras pessoas online da comunidade, suba no ranking ao vivo e acumule Certcoins para prosear e presentear!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Card Agar.io Arena */}
            <div
              onClick={() => {
                setActiveGame('agario');
                setAgarioGameOver(false);
                setAgarioScore(10);
                setKillFeed([]);
              }}
              className="bg-[#1E1915] hover:bg-[#2A231D] rounded-3xl p-6 border border-[#382E24] hover:border-[#E8A838]/60 cursor-pointer group transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border"
                  style={{ backgroundColor: `${estadoConfig.cor}20`, borderColor: estadoConfig.cor, color: estadoConfig.cor }}
                >
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-black text-[#F5E9D3]">
                    Arena Encontro Certo.io 🟢
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Ao Vivo
                  </span>
                </div>
                <p className="text-xs text-[#C8B8A0] leading-relaxed">
                  Controle sua bolinha no celular pelo toque, devore orbes, vença os bots e dispute o <strong>Top 1 do Ranking</strong> com pessoas online!
                </p>
              </div>
              <div
                className="mt-6 pt-4 border-t border-[#382E24] flex items-center justify-between text-xs font-bold"
                style={{ color: estadoConfig.cor }}
              >
                <span>🏆 Ranking + Certcoins</span>
                <span>Entrar na Arena →</span>
              </div>
            </div>

            {/* Card Jogo da Memória */}
            <div
              onClick={() => {
                setActiveGame('memory');
                startMemoryGame();
              }}
              className="bg-[#1E1915] hover:bg-[#2A231D] rounded-3xl p-6 border border-[#382E24] hover:border-[#E8A838]/60 cursor-pointer group transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border"
                  style={{ backgroundColor: '#EC489920', borderColor: '#EC4899', color: '#EC4899' }}
                >
                  <Heart className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-black text-[#F5E9D3]">
                    Jogo da Memória da Terra 🧠
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    Cultural
                  </span>
                </div>
                <p className="text-xs text-[#C8B8A0] leading-relaxed">
                  Encontre os pares com símbolos e costumes de {estadoConfig.nome} e ganhe +0.50 Certcoin por cada fase concluída.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#382E24] flex items-center justify-between text-xs font-bold text-pink-400">
                <span>Prêmio +0.50 Certcoin</span>
                <span>Jogar Agora →</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AGAR.IO ARENA VIEW COM CONTROLE MOBILE E RANKING AO VIVO */}
      {activeGame === 'agario' && (
        <div className="bg-[#1E1915] rounded-3xl p-4 sm:p-6 border border-[#382E24] shadow-2xl space-y-4">
          {/* Top Bar: Voltar, Pontuação, Posição e Jogadores Online */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-[#382E24]">
            <button
              onClick={() => setActiveGame('menu')}
              className="px-3.5 py-2 bg-[#2A231D] hover:bg-[#382E24] text-xs font-bold rounded-xl text-[#F5E9D3] border border-[#382E24] transition-colors flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sair da Sala</span>
            </button>

            {/* Status Online na Sala */}
            <div className="flex items-center space-x-2 text-xs font-bold text-[#C8B8A0] bg-[#120F0D] px-3 py-1.5 rounded-xl border border-[#382E24]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{onlineCountInRoom} na arena ({estadoConfig.sigla})</span>
            </div>

            {/* Pontuação e Posição Atual */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 bg-[#2A231D] px-3 py-1.5 rounded-xl border border-[#E8A838]/40 text-[#E8A838] font-black text-xs sm:text-sm">
                <Coins className="w-4 h-4" />
                <span>Pontos: {agarioScore}</span>
              </div>
              <div className="flex items-center space-x-1 bg-[#120F0D] px-2.5 py-1.5 rounded-xl border border-[#382E24] text-xs font-bold text-[#F5E9D3]">
                <Crown className="w-3.5 h-3.5 text-yellow-400" />
                <span>Top #{leaderboard.findIndex((p) => p.isPlayer) + 1 || 1}</span>
              </div>
            </div>
          </div>

          {/* Instrução rápida e clara de controle para Celular e Computador */}
          <div className="text-[11px] text-[#C8B8A0] flex flex-wrap items-center justify-between gap-2 bg-[#120F0D] p-2.5 rounded-xl border border-[#382E24]">
            <span className="flex items-center space-x-1.5">
              <span>📱 <strong>No celular:</strong> Toque e arraste o dedo na tela para onde a bola deve ir!</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span>💻 <strong>No PC:</strong> Movimente o cursor do mouse.</span>
            </span>
          </div>

          {/* Arena Canvas Container com HUD de Ranking Sobreposto */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-[#0A0807] border-2 border-[#382E24] shadow-inner flex justify-center">
            <canvas
              ref={canvasRef}
              width={680}
              height={440}
              className="w-full max-w-full h-auto cursor-crosshair block select-none"
              style={{ touchAction: 'none' }}
            />

            {/* HUD de Ranking em Tempo Real (Canto Superior Direito) */}
            <div className="absolute top-2.5 right-2.5 bg-[#120F0D]/90 backdrop-blur-md border border-[#382E24] rounded-2xl p-2.5 sm:p-3 text-[11px] max-w-[170px] sm:max-w-[200px] shadow-2xl pointer-events-none space-y-1.5">
              <div className="flex items-center justify-between border-b border-[#382E24] pb-1 text-[#E8A838] font-black text-[10px] uppercase tracking-wider">
                <span className="flex items-center space-x-1">
                  <Trophy className="w-3 h-3 text-yellow-400" />
                  <span>Ranking da Sala</span>
                </span>
                <span className="text-[9px] text-emerald-400 font-mono">LIVE</span>
              </div>

              <div className="space-y-1">
                {leaderboard.slice(0, 5).map((entry, idx) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between text-[10px] px-1.5 py-0.5 rounded-md ${
                      entry.isPlayer
                        ? 'bg-[#E8A838]/20 text-[#F5E9D3] font-black border border-[#E8A838]/50'
                        : 'text-[#C8B8A0]'
                    }`}
                  >
                    <span className="truncate max-w-[100px] flex items-center space-x-1">
                      <span className="font-bold text-zinc-400">#{idx + 1}</span>
                      <span className="truncate">{entry.name}</span>
                      {entry.isOnline && !entry.isPlayer && (
                        <span className="text-[8px] text-emerald-400">🟢</span>
                      )}
                    </span>
                    <span className="font-mono font-bold text-[#E8A838] shrink-0 ml-1">
                      {entry.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kill Feed / Avisos de Eliminação (Canto Superior Esquerdo) */}
            {killFeed.length > 0 && (
              <div className="absolute top-2.5 left-2.5 space-y-1 pointer-events-none">
                {killFeed.map((msg, i) => (
                  <div
                    key={i}
                    className="bg-[#120F0D]/85 backdrop-blur-xs border border-[#382E24] text-[10px] px-2.5 py-1 rounded-xl text-[#F5E9D3] animate-fadeIn shadow"
                  >
                    {msg}
                  </div>
                ))}
              </div>
            )}

            {/* Modal de Fim de Partida */}
            {agarioGameOver && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fadeIn">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-2xl border"
                  style={{ backgroundColor: `${estadoConfig.cor}25`, borderColor: estadoConfig.cor }}
                >
                  <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-[#F5E9D3]">Eita! Fim de Partida!</h3>
                  <p className="text-xs text-[#C8B8A0]">
                    Você alcançou <strong>{agarioScore} pontos</strong> e faturou{' '}
                    <strong className="text-[#E8A838]">+{agarioWonCoins.toFixed(2)} Certcoins</strong> 🪙
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => {
                      setAgarioGameOver(false);
                      setAgarioScore(10);
                      setKillFeed([]);
                    }}
                    className="px-6 py-3 golden-button rounded-xl text-xs sm:text-sm font-black shadow-lg transition-transform active:scale-95"
                  >
                    Jogar de Novo 🚀
                  </button>
                  <button
                    onClick={() => setActiveGame('menu')}
                    className="px-4 py-3 bg-[#2A231D] text-[#C8B8A0] hover:text-[#F5E9D3] rounded-xl text-xs font-bold border border-[#382E24]"
                  >
                    Voltar ao Menu
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botão de Turbo / Impulso para Mobile e Dica */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2 text-xs text-[#C8B8A0]">
              <Shield className="w-4 h-4 text-[#E8A838]" />
              <span>Devore bolinhas e adversários menores para crescer e pontuar!</span>
            </div>

            <button
              onMouseDown={() => setIsBoosting(true)}
              onMouseUp={() => setIsBoosting(false)}
              onTouchStart={() => setIsBoosting(true)}
              onTouchEnd={() => setIsBoosting(false)}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 shadow active:scale-95 border ${
                isBoosting
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-[#120F0D] border-amber-400'
                  : 'bg-[#2A231D] text-[#F5E9D3] border-[#382E24] hover:border-[#E8A838]/50'
              }`}
            >
              <Zap className={`w-4 h-4 ${isBoosting ? 'text-[#120F0D] fill-[#120F0D]' : 'text-[#E8A838]'}`} />
              <span>{isBoosting ? 'Turbo Ativado! ⚡' : 'Segurar para Turbo ⚡'}</span>
            </button>
          </div>
        </div>
      )}

      {/* JOGO DA MEMÓRIA VIEW */}
      {activeGame === 'memory' && (
        <div className="bg-[#1E1915] rounded-3xl p-6 border border-[#382E24] text-center space-y-6 max-w-xl mx-auto shadow-xl">
          <div className="flex items-center justify-between border-b border-[#382E24] pb-3">
            <button
              onClick={() => setActiveGame('menu')}
              className="px-3.5 py-1.5 bg-[#2A231D] hover:bg-[#382E24] text-xs font-bold rounded-xl text-[#F5E9D3] border border-[#382E24]"
            >
              ← Menu
            </button>
            <h3 className="font-extrabold text-base text-[#F5E9D3] flex items-center space-x-1.5">
              <span>Fase {memoryPhase}</span>
              <span>•</span>
              <span className="text-[#E8A838]">{estadoConfig.nome}</span>
            </h3>
          </div>

          {memoryWon ? (
            <div className="py-10 space-y-4 animate-fadeIn">
              <Trophy className="w-16 h-16 mx-auto text-yellow-400 animate-bounce" />
              <h3 className="text-2xl font-black text-[#F5E9D3]">Parabéns! Fase Concluída!</h3>
              <p className="text-xs text-[#C8B8A0]">
                Você ganhou <strong className="text-[#E8A838]">+0.50 Certcoin</strong> para aproveitar na comunidade!
              </p>
              <button
                onClick={() => {
                  setMemoryPhase((p) => p + 1);
                  startMemoryGame();
                }}
                className="px-6 py-3 golden-button font-black rounded-xl text-xs sm:text-sm shadow-md"
              >
                Próxima Fase 🚀
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2.5 max-w-md mx-auto">
              {memoryCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`h-20 sm:h-24 rounded-2xl flex items-center justify-center text-3xl font-black cursor-pointer transition-transform duration-200 shadow-md ${
                    card.flipped || card.matched
                      ? 'bg-[#2A231D] border-2 border-[#E8A838] text-[#F5E9D3] scale-100'
                      : 'bg-[#120F0D] border border-[#382E24] text-[#C8B8A0] hover:border-[#E8A838]/60 active:scale-95'
                  }`}
                >
                  {card.flipped || card.matched ? card.symbol : '☕'}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
