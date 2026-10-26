import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Trophy, Coins, RotateCcw, Sparkles, Heart } from 'lucide-react';
import { UserProfile } from '../types';

interface GamesViewProps {
  currentUser: UserProfile;
  onAddCertcoins: (quantidade: number) => void;
}

export const GamesView: React.FC<GamesViewProps> = ({ currentUser, onAddCertcoins }) => {
  const [activeGame, setActiveGame] = useState<'menu' | 'agario' | 'memory'>('menu');

  // --- AGAR.IO STATE ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [agarioScore, setAgarioScore] = useState(10);
  const [agarioGameOver, setAgarioGameOver] = useState(false);
  const [agarioWonCoins, setAgarioWonCoins] = useState(0);

  // --- MEMORY GAME STATE ---
  const [memoryCards, setMemoryCards] = useState<{ id: number; symbol: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [memoryPhase, setMemoryPhase] = useState(1);
  const [memoryWon, setMemoryWon] = useState(false);

  // Initialize Memory Game
  const startMemoryGame = () => {
    const symbols = ['🧀', '☕', '⛪', '🎸', ' pão ', '💛'];
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

        // Check if all matched
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

  // --- AGAR.IO CANVAS LOGIC ---
  useEffect(() => {
    if (activeGame !== 'agario') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let score = 10;
    let gameOver = false;

    // Player
    const player = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 15,
      color: '#f97316',
      speed: 3,
    };

    // Food pellets
    let foods = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 4,
      color: ['#f59e0b', '#ec4899', '#10b981', '#3b82f6'][Math.floor(Math.random() * 4)],
    }));

    // Smart Bots
    let bots = [
      { x: 100, y: 100, radius: 18, color: '#8b5cf6', name: 'Bot Raimundo', vx: 1.5, vy: 1 },
      { x: 500, y: 300, radius: 22, color: '#ef4444', name: 'Bot Maria', vx: -1, vy: 1.2 },
      { x: 300, y: 400, radius: 14, color: '#06b6d4', name: 'Bot Zé', vx: 1.2, vy: -1.5 },
    ];

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const angle = Math.atan2(mouseY - player.y, player.x); // simple follow
      player.x += (mouseX - player.x) * 0.05;
      player.y += (mouseY - player.y) * 0.05;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const update = () => {
      if (gameOver) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw foods
      foods.forEach((f) => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.fill();
        ctx.closePath();
      });

      // Update & Draw bots
      bots.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < 20 || b.x > canvas.width - 20) b.vx *= -1;
        if (b.y < 20 || b.y > canvas.height - 20) b.vy *= -1;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.name, b.x, b.y - b.radius - 4);

        // Collision with player
        const dist = Math.hypot(player.x - b.x, player.y - b.y);
        if (dist < player.radius + b.radius) {
          if (player.radius > b.radius) {
            // Eat bot
            score += Math.floor(b.radius);
            setAgarioScore(score);
            b.x = Math.random() * canvas.width;
            b.y = Math.random() * canvas.height;
          } else {
            // Eaten by bot
            gameOver = true;
            setAgarioGameOver(true);
            setAgarioWonCoins(0.50);
            onAddCertcoins(0.50);
          }
        }
      });

      // Check food collision
      foods.forEach((f, idx) => {
        const dist = Math.hypot(player.x - f.x, player.y - f.y);
        if (dist < player.radius + f.radius) {
          score += 1;
          setAgarioScore(score);
          player.radius = 15 + score * 0.2;
          foods.splice(idx, 1);
          foods.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 4,
            color: ['#f59e0b', '#ec4899', '#10b981', '#3b82f6'][Math.floor(Math.random() * 4)],
          });
        }
      });

      // Draw Player
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.closePath();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(currentUser.nome.split(' ')[0], player.x, player.y - player.radius - 6);

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(update);
      }
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [activeGame]);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {activeGame === 'menu' && (
        <div className="space-y-6">
          <div className="text-center bg-gradient-to-r from-orange-500 via-amber-500 to-pink-500 rounded-3xl p-8 text-white shadow-lg">
            <Gamepad2 className="w-14 h-14 mx-auto mb-3 animate-bounce" />
            <h2 className="text-3xl font-black mb-2">Joguinhos Mineiros ☕</h2>
            <p className="text-sm text-orange-100 max-w-lg mx-auto">
              Divirta-se jogando e ganhe Certcoins para enviar carinhos e destacar suas mensagens! Os jogos são 100% opcionais e sem limites.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Agar.io Card */}
            <div
              onClick={() => {
                setActiveGame('agario');
                setAgarioGameOver(false);
                setAgarioScore(10);
              }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-orange-100 dark:border-zinc-800 cursor-pointer group hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/60 rounded-2xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-zinc-800 dark:text-zinc-100 mb-1">
                  Encontro Certo.io 🟢
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Coma bolinhas, cresça e desvie dos bots inteligentes para ganhar Certcoins!
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-orange-600">
                <span>Prêmio até 1.00 Certcoin</span>
                <span>Jogar Agora →</span>
              </div>
            </div>

            {/* Memory Card */}
            <div
              onClick={() => {
                setActiveGame('memory');
                startMemoryGame();
              }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-orange-100 dark:border-zinc-800 cursor-pointer group hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-950/60 rounded-2xl flex items-center justify-center text-pink-600 mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-zinc-800 dark:text-zinc-100 mb-1">
                  Jogo da Memória Mineiro 🧠
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Encontre os pares com símbolos de Minas Gerais e ganhe +0.50 Certcoin por fase!
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-pink-600">
                <span>Prêmio +0.50 Certcoin</span>
                <span>Jogar Agora →</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agar.io Game View */}
      {activeGame === 'agario' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-orange-100 dark:border-zinc-800 text-center space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveGame('menu')}
              className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-xs font-bold rounded-xl text-zinc-600 dark:text-zinc-300"
            >
              ← Voltar ao Menu
            </button>
            <div className="flex items-center space-x-2 bg-amber-100 dark:bg-amber-950/60 px-4 py-2 rounded-xl text-amber-800 dark:text-amber-200 font-bold text-sm">
              <Coins className="w-4 h-4" />
              <span>Pontuação: {agarioScore}</span>
            </div>
          </div>

          <div className="relative border-2 border-orange-200 dark:border-zinc-700 rounded-2xl overflow-hidden inline-block bg-zinc-950 shadow-inner">
            <canvas ref={canvasRef} width={700} height={450} className="cursor-crosshair block" />

            {agarioGameOver && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white space-y-3">
                <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
                <h3 className="text-2xl font-black">Fim de Partida!</h3>
                <p className="text-sm text-zinc-300">Você fez {agarioScore} pontos e ganhou {agarioWonCoins} Certcoins!</p>
                <button
                  onClick={() => {
                    setAgarioGameOver(false);
                    setAgarioScore(10);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 font-bold rounded-xl shadow"
                >
                  Jogar de Novo 🚀
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Memory Game View */}
      {activeGame === 'memory' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-orange-100 dark:border-zinc-800 text-center space-y-6 max-w-xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveGame('menu')}
              className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-xs font-bold rounded-xl text-zinc-600 dark:text-zinc-300"
            >
              ← Voltar ao Menu
            </button>
            <h3 className="font-extrabold text-lg text-zinc-800 dark:text-zinc-100">Fase {memoryPhase}</h3>
          </div>

          {memoryWon ? (
            <div className="py-12 space-y-4">
              <Trophy className="w-16 h-16 mx-auto text-yellow-400 animate-bounce" />
              <h3 className="text-2xl font-black text-zinc-800 dark:text-zinc-100">Parabéns, sô! Fase Concluída!</h3>
              <p className="text-sm text-zinc-500">Você ganhou <strong className="text-amber-600">+0.50 Certcoin</strong>!</p>
              <button
                onClick={() => {
                  setMemoryPhase((p) => p + 1);
                  startMemoryGame();
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-xl shadow"
              >
                Próxima Fase 🚀
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
              {memoryCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`h-24 rounded-2xl flex items-center justify-center text-3xl font-black cursor-pointer transition-all shadow-sm ${
                    card.flipped || card.matched
                      ? 'bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-400 text-zinc-800 dark:text-zinc-100'
                      : 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white hover:opacity-95'
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
