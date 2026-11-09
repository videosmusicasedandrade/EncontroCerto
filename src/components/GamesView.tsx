import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gamepad2,
  Trophy,
  Coins,
  Sparkles,
  Zap,
  Users,
  Crown,
  ChevronLeft,
  Shield,
  Scissors,
  X,
  Maximize2,
  ArrowRight,
  Crosshair,
  MapPin,
  Volume2,
  VolumeX,
  Music,
  Brain,
} from 'lucide-react';
import { UserProfile, EstadoConfig } from '../types';
import { ChessView } from './ChessView';
import { MemoryGame } from './MemoryGame';

interface GamesViewProps {
  currentUser: UserProfile;
  estadoConfig: EstadoConfig;
  usuarios?: UserProfile[];
  onAddCertcoins: (quantidade: number) => void;
}

interface PlayerCell {
  id: string;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  ejectVx: number;
  ejectVy: number;
  canMergeAt: number;
  score: number;
  isMain: boolean;
  spawnDelay?: number;
}

interface Competitor {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  isOnline: boolean;
  avatar?: string;
  score: number;
  targetX?: number;
  targetY?: number;
  vx: number;
  vy: number;
  ejectVx?: number;
  ejectVy?: number;
  canMergeAt?: number;
  parentId?: string;
  decisionCooldown?: number;
  splitCooldown?: number;
}

interface FoodPellet {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
}

// World Dimensions: Spacious, vast arena
const WORLD_WIDTH = 3200;
const WORLD_HEIGHT = 2400;

// Motor de Música Relaxante e Viciante baseado em PNL (Programação Neuro-Linguística & Frequências 432Hz / 528Hz)
class PnlAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: any = null;
  private masterGain: GainNode | null = null;
  private droneOscL: OscillatorNode | null = null;
  private droneOscR: OscillatorNode | null = null;

  start() {
    if (this.isPlaying && this.ctx && this.ctx.state === 'running') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.ctx || this.ctx.state === 'closed') {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Binaural Theta Flow State: 432 Hz Left / 438 Hz Right (6 Hz difference)
      const merger = this.ctx.createChannelMerger(2);

      this.droneOscL = this.ctx.createOscillator();
      this.droneOscL.type = 'sine';
      this.droneOscL.frequency.setValueAtTime(216, this.ctx.currentTime); // 432 Hz sub-octave root
      const gainL = this.ctx.createGain();
      gainL.gain.setValueAtTime(0.035, this.ctx.currentTime);
      this.droneOscL.connect(gainL);
      gainL.connect(merger, 0, 0);

      this.droneOscR = this.ctx.createOscillator();
      this.droneOscR.type = 'sine';
      this.droneOscR.frequency.setValueAtTime(222, this.ctx.currentTime); // 6 Hz Theta differential
      const gainR = this.ctx.createGain();
      gainR.gain.setValueAtTime(0.035, this.ctx.currentTime);
      this.droneOscR.connect(gainR);
      gainR.connect(merger, 0, 1);

      merger.connect(this.masterGain);
      this.droneOscL.start();
      this.droneOscR.start();

      // Happy & Addictive C Major Pentatonic (Faster Tempo: 600ms)
      const frequencies = [523.25, 587.33, 659.25, 783.99, 880.0];
      let noteIndex = 0;

      this.intervalId = setInterval(() => {
        if (!this.ctx || this.ctx.state === 'suspended' || this.ctx.state === 'closed') return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine';
        const freq = frequencies[noteIndex % frequencies.length];
        noteIndex = (noteIndex + 1 + Math.floor(Math.random() * 2)) % frequencies.length;
        osc.frequency.setValueAtTime(freq, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.05, now + 0.05); // Faster attack
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6); // Shorter decay

        osc.connect(noteGain);
        if (this.masterGain) {
          noteGain.connect(this.masterGain);
        }

        osc.start(now);
        osc.stop(now + 0.7);
      }, 600);

      this.isPlaying = true;
    } catch (e) {
      console.warn('Audio not available:', e);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.droneOscL) {
      try { this.droneOscL.stop(); } catch (e) {}
      this.droneOscL = null;
    }
    if (this.droneOscR) {
      try { this.droneOscR.stop(); } catch (e) {}
      this.droneOscR = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      try { this.ctx.close(); } catch (e) {}
      this.ctx = null;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const GamesView: React.FC<GamesViewProps & { activeTab: string }> = ({
  currentUser,
  estadoConfig,
  usuarios = [],
  onAddCertcoins,
  activeTab,
}) => {
  const [activeGame, setActiveGame] = useState<'menu' | 'agario' | 'chess' | 'memory'>('menu');

  // --- AGAR.IO STATE ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [totalPlayerScore, setTotalPlayerScore] = useState(10);
  const [highScore, setHighScore] = useState(10);
  const [agarioGameOver, setAgarioGameOver] = useState(false);
  const [agarioWonCoins, setAgarioWonCoins] = useState(0);
  const [leaderboard, setLeaderboard] = useState<
    { id: string; name: string; score: number; isPlayer: boolean; isOnline: boolean }[]
  >([]);
  const [killFeed, setKillFeed] = useState<string[]>([]);
  const [onlineCountInRoom, setOnlineCountInRoom] = useState(8);
  const [isBoostingUI, setIsBoostingUI] = useState(false);
  const isBoostingRef = useRef<boolean>(false);
  const [playerCellsCount, setPlayerCellsCount] = useState(1);
  const [isShieldActive, setIsShieldActive] = useState(true);
  const [mapDominanceCount, setMapDominanceCount] = useState(0);

  // Som de comer agradável e instigante (instante)
  const playEatSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // Alto e agradável
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  };

  // PNL Audio Engine ref
  const pnlAudioRef = useRef<PnlAudioEngine | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);

  // Direction vector (-1 to 1) controlled by responsive joystick or keyboard
  const directionRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const splitRequestedRef = useRef<boolean>(false);
  const boostRequestedRef = useRef<boolean>(false);

  // Joystick touch tracking
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const [joystickKnob, setJoystickKnob] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  // Alterna música relaxante PNL
  const toggleMusic = () => {
    if (!pnlAudioRef.current) {
      pnlAudioRef.current = new PnlAudioEngine();
    }
    const playing = pnlAudioRef.current.toggle();
    setIsMusicPlaying(playing);
  };

  // Gerencia ciclo de vida do áudio relaxante PNL
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && pnlAudioRef.current) {
        pnlAudioRef.current.stop();
      } else if (!document.hidden && activeGame === 'agario' && activeTab === 'games' && isMusicPlaying) {
        if (!pnlAudioRef.current) pnlAudioRef.current = new PnlAudioEngine();
        pnlAudioRef.current.start();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Também escuta por foco na janela
    window.addEventListener('blur', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    if (activeGame === 'agario' && activeTab === 'games' && isMusicPlaying && !document.hidden) {
      if (!pnlAudioRef.current) {
        pnlAudioRef.current = new PnlAudioEngine();
      }
      pnlAudioRef.current.start();
    } else {
      if (pnlAudioRef.current) {
        pnlAudioRef.current.stop();
      }
    }
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      if (pnlAudioRef.current) {
        pnlAudioRef.current.stop();
      }
    };
  }, [activeGame, activeTab, isMusicPlaying]);



  // High Sensitivity Joystick touch handlers (Right hand)
  const handleJoystickTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    handleJoystickMove(e);
  };

  const handleJoystickMove = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const maxRadius = rect.width / 2;
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist <= 2) {
      setJoystickKnob({ x: 0, y: 0, active: true });
      directionRef.current = { x: 0, y: 0, active: true };
      return;
    }

    // Clamp knob inside ring
    const clampedDist = Math.min(dist, maxRadius);
    const knobX = (dx / dist) * clampedDist;
    const knobY = (dy / dist) * clampedDist;

    // HIGH SENSITIVITY CURVE: Even a slight finger nudge outputs strong responsive vector
    const sensitivity = 1.6;
    const normalizedDist = Math.min(1, (clampedDist / maxRadius) * sensitivity);
    const factor = Math.pow(normalizedDist, 0.7); // Sublinear power curve for instant responsiveness
    const angle = Math.atan2(dy, dx);
    const normX = Math.cos(angle) * factor;
    const normY = Math.sin(angle) * factor;

    setJoystickKnob({ x: knobX, y: knobY, active: true });
    directionRef.current = { x: normX, y: normY, active: true };
  };

  const handleJoystickEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    setJoystickKnob({ x: 0, y: 0, active: false });
    directionRef.current = { x: 0, y: 0, active: false };
  };

  // Request cell division (Split in two)
  const handleTriggerSplit = () => {
    splitRequestedRef.current = true;
  };

  // --- AGAR.IO CANVAS GAME LOOP WITH CAMERA & LARGE WORLD ---
  useEffect(() => {
    if (activeGame !== 'agario') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isGameOver = false;

    // Full viewport setup
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let screenWidth = canvas.width;
    let screenHeight = canvas.height;

    // Camera Coordinates in World
    let cameraX = WORLD_WIDTH / 2 - screenWidth / 2;
    let cameraY = WORLD_HEIGHT / 2 - screenHeight / 2;

    // Online Users & Moderate/Medium AI Bots
    const otherUsers = usuarios.filter((u) => u.id !== currentUser.id);
    const onlineNames = otherUsers.slice(0, 4).map((u) => ({
      name: u.nome.split(' ')[0],
      avatar: u.foto,
      isOnline: true,
    }));

    const defaultOnline = [
      { name: 'Mariana', isOnline: true },
      { name: 'João Pedro', isOnline: true },
      { name: 'Camila', isOnline: true },
      { name: 'Lucas', isOnline: true },
    ];
    const activeOnline = onlineNames.length > 0 ? onlineNames : defaultOnline;
    const botColors = [
      '#8B5CF6',
      '#EC4899',
      '#3B82F6',
      '#10B981',
      '#F59E0B',
      '#06B6D4',
      '#E11D48',
      '#14B8A6',
      '#84CC16',
    ];

    let competitors: Competitor[] = [
      ...activeOnline.map((u, i) => ({
        id: `online-${i}`,
        name: u.name,
        x: 200 + Math.random() * (WORLD_WIDTH - 400),
        y: 200 + Math.random() * (WORLD_HEIGHT - 400),
        radius: 18 + Math.floor(Math.random() * 8),
        color: botColors[i % botColors.length],
        isOnline: true,
        avatar: (u as any).avatar,
        score: 16 + Math.floor(Math.random() * 16),
        vx: (Math.random() - 0.5) * 1.6,
        vy: (Math.random() - 0.5) * 1.6,
        decisionCooldown: Math.floor(Math.random() * 20),
        splitCooldown: 60 + Math.floor(Math.random() * 80),
      })),
      {
        id: 'bot-1',
        name: 'Bot Zé',
        x: 400,
        y: 500,
        radius: 20,
        color: '#06B6D4',
        isOnline: false,
        score: 20,
        vx: 1.2,
        vy: 1,
        decisionCooldown: 10,
        splitCooldown: 90,
      },
      {
        id: 'bot-2',
        name: 'Bot Raimundo',
        x: WORLD_WIDTH - 500,
        y: 400,
        radius: 24,
        color: '#8B5CF6',
        isOnline: false,
        score: 28,
        vx: -1.2,
        vy: 1.3,
        decisionCooldown: 15,
        splitCooldown: 70,
      },
      {
        id: 'bot-3',
        name: 'Bot Maria',
        x: WORLD_WIDTH / 2,
        y: WORLD_HEIGHT - 400,
        radius: 22,
        color: '#EF4444',
        isOnline: false,
        score: 24,
        vx: 0.9,
        vy: -1.2,
        decisionCooldown: 25,
        splitCooldown: 80,
      },
      {
        id: 'bot-4',
        name: 'Bot Tião',
        x: WORLD_WIDTH - 400,
        y: WORLD_HEIGHT - 500,
        radius: 21,
        color: '#EAB308',
        isOnline: false,
        score: 22,
        vx: -1.1,
        vy: -0.9,
        decisionCooldown: 18,
        splitCooldown: 100,
      },
      {
        id: 'bot-5',
        name: 'Bot Chico',
        x: 600,
        y: WORLD_HEIGHT - 600,
        radius: 19,
        color: '#10B981',
        isOnline: false,
        score: 18,
        vx: 1,
        vy: -1.1,
        decisionCooldown: 12,
        splitCooldown: 90,
      },
      {
        id: 'bot-6',
        name: 'Bot Tonho',
        x: WORLD_WIDTH / 2 - 300,
        y: 600,
        radius: 23,
        color: '#F43F5E',
        isOnline: false,
        score: 26,
        vx: -0.8,
        vy: 1.2,
        decisionCooldown: 20,
        splitCooldown: 85,
      },
      {
        id: 'bot-7',
        name: 'Bot Pedrinho',
        x: 800,
        y: 400,
        radius: 20,
        color: '#14B8A6',
        isOnline: false,
        score: 20,
        vx: -1,
        vy: 1,
        decisionCooldown: 12,
        splitCooldown: 90,
      },
      {
        id: 'bot-8',
        name: 'Bot Aninha',
        x: WORLD_WIDTH - 800,
        y: WORLD_HEIGHT - 300,
        radius: 22,
        color: '#A855F7',
        isOnline: false,
        score: 23,
        vx: 1.1,
        vy: -1,
        decisionCooldown: 15,
        splitCooldown: 80,
      },
      {
        id: 'bot-9',
        name: 'Bot Fernandão',
        x: 1200,
        y: WORLD_HEIGHT - 800,
        radius: 25,
        color: '#F97316',
        isOnline: false,
        score: 30,
        vx: -0.9,
        vy: 1.2,
        decisionCooldown: 18,
        splitCooldown: 75,
      },
      {
        id: 'bot-10',
        name: 'Bot Ju',
        x: WORLD_WIDTH - 1200,
        y: 700,
        radius: 19,
        color: '#EC4899',
        isOnline: false,
        score: 18,
        vx: 1.2,
        vy: 0.8,
        decisionCooldown: 10,
        splitCooldown: 95,
      },
      {
        id: 'bot-11',
        name: 'Bot Beto',
        x: 500,
        y: 1200,
        radius: 21,
        color: '#06B6D4',
        isOnline: false,
        score: 22,
        vx: -1.2,
        vy: -1.1,
        decisionCooldown: 14,
        splitCooldown: 85,
      },
      {
        id: 'bot-12',
        name: 'Bot Luiza',
        x: WORLD_WIDTH - 600,
        y: 1100,
        radius: 24,
        color: '#10B981',
        isOnline: false,
        score: 26,
        vx: 0.9,
        vy: -1.3,
        decisionCooldown: 16,
        splitCooldown: 80,
      },
    ];

    setOnlineCountInRoom(competitors.length + 1);

    // Calculate Safe Spawn Position in the vast world
    const findSafeSpawn = (): { x: number; y: number } => {
      let bestX = WORLD_WIDTH / 2;
      let bestY = WORLD_HEIGHT / 2;
      let maxDistance = -1;

      for (let i = 0; i < 40; i++) {
        const candX = 250 + Math.random() * (WORLD_WIDTH - 500);
        const candY = 250 + Math.random() * (WORLD_HEIGHT - 500);
        let minD = Infinity;

        for (const c of competitors) {
          const d = Math.hypot(candX - c.x, candY - c.y);
          if (d < minD) minD = d;
        }

        if (minD > maxDistance) {
          maxDistance = minD;
          bestX = candX;
          bestY = candY;
        }
      }
      return { x: bestX, y: bestY };
    };

    const initialSpawn = findSafeSpawn();

    // Initial Player with 1 cell (isMain = true)
    let playerCells: PlayerCell[] = [
      {
        id: 'cell-0',
        x: initialSpawn.x,
        y: initialSpawn.y,
        radius: 18,
        vx: 0,
        vy: 0,
        ejectVx: 0,
        ejectVy: 0,
        canMergeAt: 0,
        score: 10,
        isMain: true,
      },
    ];

    setPlayerCellsCount(1);
    setTotalPlayerScore(10);

    // Safe Shield at Spawn (3 seconds of invulnerability)
    let shieldUntil = Date.now() + 3000;
    setIsShieldActive(true);

    // Food Pellets in the vast world (480 pellets - Duplicado!)
    const foodCount = 480;
    let foods: FoodPellet[] = Array.from({ length: foodCount }, (_, idx) => ({
      id: idx,
      x: 40 + Math.random() * (WORLD_WIDTH - 80),
      y: 40 + Math.random() * (WORLD_HEIGHT - 80),
      radius: 4,
      color: ['#F59E0B', '#EC4899', '#10B981', '#3B82F6', '#E8A838', '#A855F7', '#14B8A6', '#F43F5E'][
        Math.floor(Math.random() * 8)
      ],
    }));

    // Touch on Canvas direct fallback
    const handleCanvasTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        if (t.clientX > screenWidth - 170 && t.clientY > screenHeight - 170) return; // joystick
        if (t.clientX < 170 && t.clientY > screenHeight - 170) return; // split

        // Transform screen touch coordinate to world coordinate using camera offset
        const worldTouchX = t.clientX + cameraX;
        const worldTouchY = t.clientY + cameraY;

        const primaryCell = playerCells[0];
        if (primaryCell) {
          const dx = worldTouchX - primaryCell.x;
          const dy = worldTouchY - primaryCell.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 5) {
            directionRef.current = {
              x: dx / dist,
              y: dy / dist,
              active: true,
            };
          }
        }
      }
    };

    // Keyboard support for PC (WASD / Arrows / Space for Split)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        splitRequestedRef.current = true;
      }
      if (e.code === 'KeyW' || e.code === 'ArrowUp') directionRef.current.y = -1;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') directionRef.current.y = 1;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') directionRef.current.x = -1;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') directionRef.current.x = 1;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') boostRequestedRef.current = true;
      if (directionRef.current.x !== 0 || directionRef.current.y !== 0) {
        directionRef.current.active = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') boostRequestedRef.current = false;
      if (
        (e.code === 'KeyW' || e.code === 'ArrowUp') &&
        directionRef.current.y < 0
      )
        directionRef.current.y = 0;
      if (
        (e.code === 'KeyS' || e.code === 'ArrowDown') &&
        directionRef.current.y > 0
      )
        directionRef.current.y = 0;
      if (
        (e.code === 'KeyA' || e.code === 'ArrowLeft') &&
        directionRef.current.x < 0
      )
        directionRef.current.x = 0;
      if (
        (e.code === 'KeyD' || e.code === 'ArrowRight') &&
        directionRef.current.x > 0
      )
        directionRef.current.x = 0;
    };

    canvas.addEventListener('touchmove', handleCanvasTouch, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const addFeed = (text: string) => {
      setKillFeed((prev) => [text, ...prev.slice(0, 3)]);
    };

    let frameCount = 0;

    // --- MAIN GAME LOOP ---
    const update = () => {
      if (isGameOver) return;
      frameCount++;
      const now = Date.now();
      screenWidth = canvas.width;
      screenHeight = canvas.height;

      // Update Shield state
      const shielded = now < shieldUntil;
      if (isShieldActive !== shielded) {
        setIsShieldActive(shielded);
      }

      // 1. Calculate Player Principal Cell for Smooth Camera Follow
      const currentMain = playerCells.find((c) => c.isMain) || playerCells[0];
      const pCenterX = currentMain ? currentMain.x : WORLD_WIDTH / 2;
      const pCenterY = currentMain ? currentMain.y : WORLD_HEIGHT / 2;

      // Smooth camera interpolation towards player center
      const targetCamX = pCenterX - screenWidth / 2;
      const targetCamY = pCenterY - screenHeight / 2;
      cameraX += (targetCamX - cameraX) * 0.14;
      cameraY += (targetCamY - cameraY) * 0.14;

      // Clamp camera within world bounds
      cameraX = Math.max(0, Math.min(WORLD_WIDTH - screenWidth, cameraX));
      cameraY = Math.max(0, Math.min(WORLD_HEIGHT - screenHeight, cameraY));

      ctx.clearRect(0, 0, screenWidth, screenHeight);

      // --- SAVE CTX AND APPLY CAMERA OFFSET TO WORLD ---
      ctx.save();
      ctx.translate(-cameraX, -cameraY);

      // 2. Draw World Background & Subtle Arena Grid
      ctx.fillStyle = '#080605';
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      ctx.strokeStyle = '#1D1713';
      ctx.lineWidth = 1.2;
      const gridSize = 50;
      for (let x = 0; x <= WORLD_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, WORLD_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y <= WORLD_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WORLD_WIDTH, y);
        ctx.stroke();
      }

      // Papel de parede cheio de emoticons de romance (corações, amor, flores) bem visíveis
      ctx.save();
      ctx.globalAlpha = 0.55; // Visibilidade clara e vibrante de papel de parede
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const bgEmojis = ['❤️', '💖', '💘', '💕', '🌸', '🌹', '✨', '💌', '💞', '🌺', '💐', '💓'];
      const bgGridStep = 80; // Padronagem densa de papel de parede
      const startX = Math.max(0, Math.floor(cameraX / bgGridStep) * bgGridStep);
      const endX = Math.min(WORLD_WIDTH, cameraX + screenWidth + bgGridStep);
      const startY = Math.max(0, Math.floor(cameraY / bgGridStep) * bgGridStep);
      const endY = Math.min(WORLD_HEIGHT, cameraY + screenHeight + bgGridStep);

      for (let x = startX; x <= endX; x += bgGridStep) {
        for (let y = startY; y <= endY; y += bgGridStep) {
          const emojiIdx = Math.abs(Math.floor((x * 41 + y * 23) / bgGridStep)) % bgEmojis.length;
          ctx.fillText(bgEmojis[emojiIdx], x + 40, y + 40);
        }
      }
      ctx.restore();

      // World Outer Boundary Walls
      ctx.strokeStyle = '#E8A838';
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // Subtle inner danger glow on world boundary
      ctx.strokeStyle = 'rgba(232, 168, 56, 0.2)';
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, WORLD_WIDTH - 14, WORLD_HEIGHT - 14);

      // 3. Draw Food Pellets
      foods.forEach((f) => {
        // Culling: only draw if within camera view
        if (
          f.x + f.radius < cameraX ||
          f.x - f.radius > cameraX + screenWidth ||
          f.y + f.radius < cameraY ||
          f.y - f.radius > cameraY + screenHeight
        ) {
          return;
        }

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.closePath();
      });

      // 4. Handle Player Split (Dividir em 2, 4, 8 ou mais!)
      if (splitRequestedRef.current) {
        splitRequestedRef.current = false;
        const currentDir = directionRef.current;
        let launchDirX = currentDir.x;
        let launchDirY = currentDir.y;

        if (Math.hypot(launchDirX, launchDirY) < 0.1) {
          launchDirX = 1;
          launchDirY = 0;
        } else {
          const lDist = Math.hypot(launchDirX, launchDirY);
          launchDirX /= lDist;
          launchDirY /= lDist;
        }

        const newCells: PlayerCell[] = [];
        let didSplit = false;

        playerCells.forEach((cell) => {
          // Can divide if score >= 10 or radius >= 13, up to 16 total parts
          if (cell.radius >= 13 && playerCells.length + newCells.length < 16) {
            didSplit = true;
            const splitRadius = Math.max(10, cell.radius * 0.71);
            const halfScore = Math.max(5, Math.floor(cell.score / 2));

            cell.radius = splitRadius;
            cell.score = halfScore;

            if (cell.isMain) {
              // A principal se projeta para frente na direção apontada pelo joystick!
              cell.ejectVx = launchDirX * 18;
              cell.ejectVy = launchDirY * 18;

              // A outra metade fica para trás com recuo inicial, depois volta seguindo a principal
              newCells.push({
                id: `cell-${Date.now()}-${Math.random()}`,
                x: cell.x - launchDirX * (splitRadius * 2.2),
                y: cell.y - launchDirY * (splitRadius * 2.2),
                radius: splitRadius,
                vx: 0,
                vy: 0,
                ejectVx: -launchDirX * 4,
                ejectVy: -launchDirY * 4,
                canMergeAt: 0,
                score: halfScore,
                isMain: false,
                spawnDelay: 10,
              });
            } else {
              // Subdivisão de células secundárias (2 -> 4 -> 8...)
              newCells.push({
                id: `cell-${Date.now()}-${Math.random()}`,
                x: cell.x - launchDirX * (splitRadius * 1.6),
                y: cell.y - launchDirY * (splitRadius * 1.6),
                radius: splitRadius,
                vx: 0,
                vy: 0,
                ejectVx: -launchDirX * 3,
                ejectVy: -launchDirY * 3,
                canMergeAt: 0,
                score: halfScore,
                isMain: false,
                spawnDelay: 8,
              });
            }
          }
        });

        if (didSplit) {
          playerCells = [...playerCells, ...newCells];
          setPlayerCellsCount(playerCells.length);
          addFeed(`➗ Dividido em ${playerCells.length} partes!`);
        }
      }

      // 5. Update and Move Player Cells
      // A pessoa controla diretamente a Célula Principal; as outras partes seguem a principal mais rápido!
      const dir = directionRef.current;

      // Localiza a célula principal
      let mainCell = playerCells.find((c) => c.isMain) || playerCells[0];
      if (mainCell && !mainCell.isMain) {
        mainCell.isMain = true;
      }

      // TURBO: gasta pontos para correr mais rápido enquanto pressiona!
      // Usado para escapar de adversários maiores ou perseguir alvos
      const boostActive = isBoostingRef.current || boostRequestedRef.current;
      const canBoost = Boolean(boostActive && mainCell && mainCell.score > 8);

      if (canBoost && mainCell) {
        // Gasta 1 ponto a cada 14 frames (~4x por segundo) enquanto turbo está ativo
        if (frameCount % 14 === 0 && mainCell.score > 8) {
          mainCell.score -= 1;
          mainCell.radius = Math.max(12, 12 + mainCell.score * 0.28);
          setTotalPlayerScore(playerCells.reduce((sum, c) => sum + c.score, 0));

          // Efeito Agar.io: ejeta massa para trás como impulso!
          const dirLen = Math.hypot(mainCell.vx, mainCell.vy) || 1;
          foods.push({
            id: Date.now() + Math.random(),
            x: mainCell.x - (mainCell.vx / dirLen) * (mainCell.radius + 6),
            y: mainCell.y - (mainCell.vy / dirLen) * (mainCell.radius + 6),
            radius: 3.5,
            color: estadoConfig.cor || '#E8A838',
          });
        }
      }

      // Velocidade Base: Normal 4.2 | Turbo 8.0 (Quase o dobro da velocidade!)
      const baseSpeed = canBoost ? 8.0 : 4.2;

      // 5A. Movimenta a Célula Principal através do Joystick
      if (mainCell) {
        mainCell.ejectVx *= 0.88;
        mainCell.ejectVy *= 0.88;
        if (Math.hypot(mainCell.ejectVx, mainCell.ejectVy) < 0.1) {
          mainCell.ejectVx = 0;
          mainCell.ejectVy = 0;
        }

        // Penalidade de Massa: bolinhas maiores ficam bem mais lentas; bolinhas menores com turbo conseguem escapar fácil!
        const massFactor = Math.max(0.48, 1 - (mainCell.radius - 12) * 0.013);
        const mainSpeed = baseSpeed * massFactor;

        if (dir.active) {
          mainCell.vx = dir.x * mainSpeed;
          mainCell.vy = dir.y * mainSpeed;
        } else {
          mainCell.vx *= 0.85;
          mainCell.vy *= 0.85;
        }

        mainCell.x += mainCell.vx + mainCell.ejectVx;
        mainCell.y += mainCell.vy + mainCell.ejectVy;

        mainCell.x = Math.max(mainCell.radius + 6, Math.min(WORLD_WIDTH - mainCell.radius - 6, mainCell.x));
        mainCell.y = Math.max(mainCell.radius + 6, Math.min(WORLD_HEIGHT - mainCell.radius - 6, mainCell.y));
      }

      // 5B. Partes secundárias seguem a principal MAIS RÁPIDO e entram para dentro dela ao se encontrarem
      if (mainCell) {
        for (let i = playerCells.length - 1; i >= 0; i--) {
          const subCell = playerCells[i];
          if (!subCell || subCell === mainCell || subCell.isMain) continue;

          subCell.ejectVx *= 0.88;
          subCell.ejectVy *= 0.88;
          if (Math.hypot(subCell.ejectVx, subCell.ejectVy) < 0.1) {
            subCell.ejectVx = 0;
            subCell.ejectVy = 0;
          }

          if (subCell.spawnDelay && subCell.spawnDelay > 0) {
            subCell.spawnDelay--;
            subCell.x += subCell.ejectVx;
            subCell.y += subCell.ejectVy;
          } else {
            const dx = mainCell.x - subCell.x;
            const dy = mainCell.y - subCell.y;
            const dist = Math.hypot(dx, dy);

            // "seguindo ela mais rápido q a principal"
            const followSpeed = baseSpeed * 1.5 + 1.2;

            if (dist > 2) {
              subCell.vx = (dx / dist) * followSpeed;
              subCell.vy = (dy / dist) * followSpeed;
            }

            subCell.x += subCell.vx + subCell.ejectVx;
            subCell.y += subCell.vy + subCell.ejectVy;

            // "quando se encontrar elas se juntam e vão entrando uma dentro da outra"
            const touchDistance = mainCell.radius + subCell.radius;
            if (dist < touchDistance) {
              // Atrai para o centro da principal
              subCell.x += (mainCell.x - subCell.x) * 0.45;
              subCell.y += (mainCell.y - subCell.y) * 0.45;

              // Entrando para dentro da principal: fusão completa!
              if (dist < mainCell.radius * 0.8 + subCell.radius * 0.25 || dist < 24) {
                mainCell.score += subCell.score;
                mainCell.radius = Math.min(105, Math.sqrt(mainCell.radius * mainCell.radius + subCell.radius * subCell.radius));
                playerCells.splice(i, 1);
                setPlayerCellsCount(playerCells.length);
                addFeed('✨ Parte absorvida de volta na principal!');
                continue;
              }
            }
          }

          subCell.x = Math.max(subCell.radius + 6, Math.min(WORLD_WIDTH - subCell.radius - 6, subCell.x));
          subCell.y = Math.max(subCell.radius + 6, Math.min(WORLD_HEIGHT - subCell.radius - 6, subCell.y));
        }
      }

      // 5C. Todas as células do jogador coletam orbes de energia
      playerCells.forEach((cell) => {
        for (let fi = foods.length - 1; fi >= 0; fi--) {
          const f = foods[fi];
          if (Math.hypot(cell.x - f.x, cell.y - f.y) < cell.radius + f.radius) {
            playEatSound();
            cell.score += 1;
            cell.radius = Math.min(80, cell.radius + 0.16);
            
            // Vitória ao atingir tamanho do mapa (exemplo: score 200)
            if (cell.score >= 200) {
              setMapDominanceCount(prev => prev + 1);
              setAgarioGameOver(true);
              setAgarioWonCoins(5);
              onAddCertcoins(5);
            }

            foods[fi] = {
              id: Date.now() + fi,
              x: 40 + Math.random() * (WORLD_WIDTH - 80),
              y: 40 + Math.random() * (WORLD_HEIGHT - 80),
              radius: 4,
              color: ['#F59E0B', '#EC4899', '#10B981', '#3B82F6', '#E8A838', '#A855F7', '#14B8A6'][
                Math.floor(Math.random() * 7)
              ],
            };
          }
        }
      });

      const currentTotalScore = playerCells.reduce((sum, c) => sum + c.score, 0);
      setTotalPlayerScore(currentTotalScore);
      setHighScore((prev) => Math.max(prev, currentTotalScore));

      // 7. Update Competitors (Medium AI: Hunt, Flee, Eat Bots, Split Attack)
      const newCompetitorSplits: Competitor[] = [];

      competitors.forEach((c) => {
        // Friction on competitor ejection
        if (c.ejectVx || c.ejectVy) {
          c.ejectVx = (c.ejectVx || 0) * 0.88;
          c.ejectVy = (c.ejectVy || 0) * 0.88;
        }

        c.decisionCooldown = (c.decisionCooldown || 0) - 1;
        c.splitCooldown = (c.splitCooldown || 0) - 1;

        if (c.decisionCooldown <= 0) {
          c.decisionCooldown = 15 + Math.floor(Math.random() * 15);

          let chosenTargetX = c.x + c.vx * 35;
          let chosenTargetY = c.y + c.vy * 35;

          // A. Check distance to closest player cell
          let closestPlayerCell: PlayerCell | null = null;
          let minPlayerDist = Infinity;
          playerCells.forEach((pCell) => {
            const d = Math.hypot(pCell.x - c.x, pCell.y - c.y);
            if (d < minPlayerDist) {
              minPlayerDist = d;
              closestPlayerCell = pCell;
            }
          });

          // B. Check distance to other competitors (Bots hunting other bots!)
          let closestThreatBot: Competitor | null = null;
          let minThreatDist = Infinity;
          let closestPreyBot: Competitor | null = null;
          let minPreyDist = Infinity;

          competitors.forEach((other) => {
            if (other.id === c.id || other.parentId === c.id || c.parentId === other.id) return;
            const d = Math.hypot(other.x - c.x, other.y - c.y);
            if (other.radius > c.radius * 1.15 && d < minThreatDist) {
              minThreatDist = d;
              closestThreatBot = other;
            } else if (c.radius > other.radius * 1.15 && d < minPreyDist) {
              minPreyDist = d;
              closestPreyBot = other;
            }
          });

          // DECISION TREE (Medium Level AI):
          if (closestThreatBot && minThreatDist < 180) {
            // FLEE from bigger bot!
            const tb = closestThreatBot as Competitor;
            const escapeAngle = Math.atan2(c.y - tb.y, c.x - tb.x);
            chosenTargetX = c.x + Math.cos(escapeAngle) * 110;
            chosenTargetY = c.y + Math.sin(escapeAngle) * 110;
          } else if (closestPlayerCell && minPlayerDist < 170 && (closestPlayerCell as PlayerCell).radius > c.radius * 1.15) {
            // FLEE from bigger player!
            const targetCell = closestPlayerCell as PlayerCell;
            const escapeAngle = Math.atan2(c.y - targetCell.y, c.x - targetCell.x);
            chosenTargetX = c.x + Math.cos(escapeAngle) * 110;
            chosenTargetY = c.y + Math.sin(escapeAngle) * 110;
          } else if (closestPreyBot && minPreyDist < 200) {
            // HUNT smaller bot!
            const pb = closestPreyBot as Competitor;
            chosenTargetX = pb.x;
            chosenTargetY = pb.y;

            // BOT SPLIT ATTACK: If in range, big enough, and cooldown is ready!
            if (
              (c.splitCooldown || 0) <= 0 &&
              c.radius >= 22 &&
              c.score >= 22 &&
              minPreyDist > 80 &&
              minPreyDist < 210 &&
              c.radius * 0.71 > pb.radius * 1.05 &&
              Math.random() < 0.45
            ) {
              c.splitCooldown = 180 + Math.floor(Math.random() * 100);
              const launchAngle = Math.atan2(pb.y - c.y, pb.x - c.x);
              const splitScore = Math.floor(c.score / 2);
              c.score = splitScore;
              c.radius = Math.max(14, c.radius * 0.71);
              c.canMergeAt = Date.now() + 12000;

              newCompetitorSplits.push({
                id: `bot-split-${Date.now()}-${Math.random()}`,
                name: c.name,
                x: c.x + Math.cos(launchAngle) * (c.radius * 1.8),
                y: c.y + Math.sin(launchAngle) * (c.radius * 1.8),
                radius: c.radius,
                color: c.color,
                isOnline: c.isOnline,
                avatar: c.avatar,
                score: splitScore,
                vx: Math.cos(launchAngle) * 2.8,
                vy: Math.sin(launchAngle) * 2.8,
                ejectVx: Math.cos(launchAngle) * 13, // Fast split dash towards prey!
                ejectVy: Math.sin(launchAngle) * 13,
                canMergeAt: Date.now() + 12000,
                parentId: c.id,
                decisionCooldown: 15,
                splitCooldown: 200,
              });
              addFeed(`⚡ ${c.name} se dividiu para caçar!`);
            }
          } else if (closestPlayerCell && minPlayerDist < 200 && c.radius > (closestPlayerCell as PlayerCell).radius * 1.15 && !shielded) {
            // HUNT smaller player!
            const targetCell = closestPlayerCell as PlayerCell;
            chosenTargetX = targetCell.x;
            chosenTargetY = targetCell.y;

            // BOT SPLIT ATTACK on player:
            if (
              (c.splitCooldown || 0) <= 0 &&
              c.radius >= 22 &&
              c.score >= 22 &&
              minPlayerDist > 80 &&
              minPlayerDist < 200 &&
              c.radius * 0.71 > targetCell.radius * 1.05 &&
              Math.random() < 0.4
            ) {
              c.splitCooldown = 180 + Math.floor(Math.random() * 100);
              const launchAngle = Math.atan2(targetCell.y - c.y, targetCell.x - c.x);
              const splitScore = Math.floor(c.score / 2);
              c.score = splitScore;
              c.radius = Math.max(14, c.radius * 0.71);
              c.canMergeAt = Date.now() + 12000;

              newCompetitorSplits.push({
                id: `bot-split-${Date.now()}-${Math.random()}`,
                name: c.name,
                x: c.x + Math.cos(launchAngle) * (c.radius * 1.8),
                y: c.y + Math.sin(launchAngle) * (c.radius * 1.8),
                radius: c.radius,
                color: c.color,
                isOnline: c.isOnline,
                avatar: c.avatar,
                score: splitScore,
                vx: Math.cos(launchAngle) * 2.8,
                vy: Math.sin(launchAngle) * 2.8,
                ejectVx: Math.cos(launchAngle) * 13,
                ejectVy: Math.sin(launchAngle) * 13,
                canMergeAt: Date.now() + 12000,
                parentId: c.id,
                decisionCooldown: 15,
                splitCooldown: 200,
              });
              addFeed(`⚡ ${c.name} se dividiu em você!`);
            }
          } else {
            // FORAGE: Navigate to closest food pellet
            let closestFood: FoodPellet | null = null;
            let minFoodDist = Infinity;
            foods.slice(0, 25).forEach((f) => {
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
          const botSpeed = Math.max(1.3, 2.7 - (c.radius - 15) * 0.018);
          if (cDist > 4) {
            c.vx = (cdx / cDist) * botSpeed;
            c.vy = (cdy / cDist) * botSpeed;
          }
        }

        c.x += c.vx + (c.ejectVx || 0);
        c.y += c.vy + (c.ejectVy || 0);

        // World boundary bouncing
        if (c.x < c.radius + 6) {
          c.x = c.radius + 6;
          c.vx *= -1;
        } else if (c.x > WORLD_WIDTH - c.radius - 6) {
          c.x = WORLD_WIDTH - c.radius - 6;
          c.vx *= -1;
        }
        if (c.y < c.radius + 6) {
          c.y = c.radius + 6;
          c.vy *= -1;
        } else if (c.y > WORLD_HEIGHT - c.radius - 6) {
          c.y = WORLD_HEIGHT - c.radius - 6;
          c.vy *= -1;
        }

        // Competitor eats food
        for (let fi = 0; fi < foods.length; fi++) {
          const f = foods[fi];
          if (Math.hypot(c.x - f.x, c.y - f.y) < c.radius + f.radius) {
            c.score += 1;
            c.radius = Math.min(65, 14 + c.score * 0.24);
            foods[fi] = {
              id: Date.now() + fi,
              x: 40 + Math.random() * (WORLD_WIDTH - 80),
              y: 40 + Math.random() * (WORLD_HEIGHT - 80),
              radius: 4,
              color: ['#F59E0B', '#EC4899', '#10B981', '#3B82F6', '#E8A838'][Math.floor(Math.random() * 5)],
            };
            break;
          }
        }

        // 8. BOTS DEVOURING OTHER BOTS!
        for (let otherIdx = competitors.length - 1; otherIdx >= 0; otherIdx--) {
          const other = competitors[otherIdx];
          if (other.id === c.id || other.parentId === c.id || c.parentId === other.id) continue;

          const distBots = Math.hypot(c.x - other.x, c.y - other.y);
          if (distBots < c.radius + other.radius - 3) {
            if (c.radius > other.radius * 1.12) {
              // Bot C devours Bot Other!
              const gain = Math.floor(other.score * 0.55);
              c.score += gain;
              c.radius = Math.min(85, c.radius + gain * 0.16);
              addFeed(`${c.name} devorou ${other.name} (+${gain} pts)!`);

              // Respawn devoured bot elsewhere safely
              other.x = 200 + Math.random() * (WORLD_WIDTH - 400);
              other.y = 200 + Math.random() * (WORLD_HEIGHT - 400);
              other.score = 14 + Math.floor(Math.random() * 6);
              other.radius = 16;
            }
          }
        }

        // 9. Check Player Cells vs Competitor Collisions
        for (let pIdx = playerCells.length - 1; pIdx >= 0; pIdx--) {
          const pCell = playerCells[pIdx];
          const distWithBot = Math.hypot(pCell.x - c.x, pCell.y - c.y);

          if (distWithBot < pCell.radius + c.radius - 3) {
            if (pCell.radius > c.radius * 1.1) {
              // Player devours competitor!
              const gain = Math.floor(c.score * 0.6);
              pCell.score += gain;
              pCell.radius = Math.min(95, pCell.radius + gain * 0.16);
              addFeed(`Você devorou ${c.name} (+${gain} pts)! 💥`);
              onAddCertcoins(0.25);

              // Respawn competitor safely
              c.x = 200 + Math.random() * (WORLD_WIDTH - 400);
              c.y = 200 + Math.random() * (WORLD_HEIGHT - 400);
              c.score = 14 + Math.floor(Math.random() * 6);
              c.radius = 16;
            } else if (c.radius > pCell.radius * 1.1 && !shielded) {
              // Competitor devours this player cell!
              addFeed(`${c.name} devorou uma célula sua! 💔`);
              const wasMain = pCell.isMain;
              playerCells.splice(pIdx, 1);
              setPlayerCellsCount(playerCells.length);

              // Se a principal foi comida, a maior parte restante vira a nova principal!
              if (wasMain && playerCells.length > 0) {
                playerCells.sort((a, b) => b.radius - a.radius);
                playerCells[0].isMain = true;
                addFeed('👑 Sua nova célula principal assumiu o controle!');
              }

              if (playerCells.length === 0) {
                isGameOver = true;
                setAgarioGameOver(true);
                const prize = currentTotalScore > 35 ? 1.0 : 0.5;
                setAgarioWonCoins(prize);
                onAddCertcoins(prize);
                addFeed(`${c.name} eliminou você completamente!`);
                break;
              }
            }
          }
        }

        // Recombine Bot Splits: if parent and twin meet after cooldown
        if (c.parentId) {
          const parentBot = competitors.find((p) => p.id === c.parentId);
          if (parentBot && now >= (c.canMergeAt || 0) && now >= (parentBot.canMergeAt || 0)) {
            const d = Math.hypot(c.x - parentBot.x, c.y - parentBot.y);
            if (d < c.radius + parentBot.radius) {
              parentBot.radius = Math.min(85, Math.sqrt(parentBot.radius * parentBot.radius + c.radius * c.radius));
              parentBot.score += c.score;
              c.score = 0; // marked for removal
            }
          }
        }

        // Draw Competitor Ball (only if within camera view)
        if (
          c.x + c.radius >= cameraX &&
          c.x - c.radius <= cameraX + screenWidth &&
          c.y + c.radius >= cameraY &&
          c.y - c.radius <= cameraY + screenHeight
        ) {
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
          ctx.fillStyle = c.color;
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = c.isOnline ? '#10B981' : '#ffffff';
          ctx.stroke();
          ctx.closePath();

          ctx.fillStyle = '#F5E9D3';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          const badge = c.isOnline ? ' 🟢' : '';
          ctx.fillText(`${c.name}${badge}`, c.x, c.y - c.radius - 6);

          ctx.fillStyle = '#C8B8A0';
          ctx.font = '9px monospace';
          ctx.fillText(`${c.score} pts`, c.x, c.y + c.radius + 12);
        }
      });

      // Filter out merged split bots and add new splits
      competitors = competitors.filter((c) => c.score > 0);
      if (newCompetitorSplits.length > 0) {
        competitors = [...competitors, ...newCompetitorSplits];
      }

      // 10. Draw Player Cells in World
      // Desenha linhas pontilhadas conectando partes secundárias voltando para a principal
      if (mainCell && playerCells.length > 1) {
        playerCells.forEach((cell) => {
          if (!cell.isMain) {
            ctx.save();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = 'rgba(232, 168, 56, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cell.x, cell.y);
            ctx.lineTo(mainCell.x, mainCell.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      }

      playerCells.forEach((cell, idx) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, cell.radius, 0, Math.PI * 2);
        ctx.clip(); // Clip to circle

        // Draw profile picture
        const img = new Image();
        img.src = currentUser.foto;
        ctx.drawImage(img, cell.x - cell.radius, cell.y - cell.radius, cell.radius * 2, cell.radius * 2);
        ctx.restore();

        // Draw Border
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, cell.radius, 0, Math.PI * 2);
        ctx.lineWidth = cell.isMain ? 4 : 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
        ctx.closePath();

        // Efeito visual de Turbo / Chamas de Propulsão ao fugir ou acelerar
        if (cell.isMain && canBoost) {
          ctx.save();
          const vLen = Math.hypot(cell.vx, cell.vy) || 1;
          const flameX = cell.x - (cell.vx / vLen) * (cell.radius + 6);
          const flameY = cell.y - (cell.vy / vLen) * (cell.radius + 6);
          ctx.beginPath();
          ctx.arc(flameX, flameY, 8 + Math.random() * 5, 0, Math.PI * 2);
          ctx.fillStyle = '#F59E0B';
          ctx.shadowColor = '#EF4444';
          ctx.shadowBlur = 14;
          ctx.fill();
          ctx.restore();
        }

        // Nome & Tag identificando Célula Principal ou Parte Voltando
        ctx.fillStyle = '#FFFFFF';
        ctx.font = cell.isMain ? 'bold 12px sans-serif' : '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(currentUser.nome.split(' ')[0], cell.x, cell.y - cell.radius - 8);

        ctx.fillStyle = '#F5E9D3';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`${cell.score} pts`, cell.x, cell.y + cell.radius + 12);
      });

      // --- RESTORE CTX TO SCREEN SPACE ---
      ctx.restore();

      // 11. Draw Minimap in Top-Left under Exit Button
      const minimapW = 110;
      const minimapH = 80;
      const minimapX = 14;
      const minimapY = 58;

      ctx.save();
      // Minimap background
      ctx.fillStyle = 'rgba(18, 15, 13, 0.85)';
      ctx.strokeStyle = '#382E24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(minimapX, minimapY, minimapW, minimapH, 10);
      ctx.fill();
      ctx.stroke();

      // World scale factor
      const scaleX = minimapW / WORLD_WIDTH;
      const scaleY = minimapH / WORLD_HEIGHT;

      // Draw Competitor dots on minimap (scales as competitor grows)
      competitors.forEach((c) => {
        const mx = minimapX + c.x * scaleX;
        const my = minimapY + c.y * scaleY;
        ctx.fillStyle = c.isOnline ? '#10B981' : '#A855F7';
        const compDotRadius = Math.max(2, Math.min(8, c.radius * scaleX * 1.8));
        ctx.beginPath();
        ctx.arc(mx, my, compDotRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Player dot on minimap (Glowing Gold, scales as player grows!)
      playerCells.forEach((c) => {
        const mx = minimapX + c.x * scaleX;
        const my = minimapY + c.y * scaleY;
        ctx.fillStyle = '#E8A838';
        ctx.shadowColor = '#E8A838';
        ctx.shadowBlur = 6;
        const playerDotRadius = Math.max(3.5, Math.min(12, c.radius * scaleX * 2.2));
        ctx.beginPath();
        ctx.arc(mx, my, playerDotRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Camera Viewport Box on minimap
      const camBoxX = minimapX + cameraX * scaleX;
      const camBoxY = minimapY + cameraY * scaleY;
      const camBoxW = screenWidth * scaleX;
      const camBoxH = screenHeight * scaleY;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(camBoxX, camBoxY, camBoxW, camBoxH);

      ctx.fillStyle = '#C8B8A0';
      ctx.font = '8px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('MAPA', minimapX + minimapW - 5, minimapY + 12);
      ctx.restore();

      // 12. Update Live Leaderboard
      if (frameCount % 10 === 0) {
        const allInRoom = [
          {
            id: 'player',
            name: `${currentUser.nome.split(' ')[0]} (Você)`,
            score: currentTotalScore,
            isPlayer: true,
            isOnline: true,
          },
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
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchmove', handleCanvasTouch);
    };
  }, [activeGame, currentUser.id, estadoConfig.cor, onAddCertcoins]);

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
              Jogue no mapa gigante com câmera que segue seu personagem, joystick de alta sensibilidade, bots médios que se dividem e comem outros bots!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* Card Certboll */}
            <div
              onClick={() => {
                setActiveGame('agario');
                setAgarioGameOver(false);
                setKillFeed([]);
                setTotalPlayerScore(10);
              }}
              className="bg-[#1E1915] hover:bg-[#2A231D] rounded-3xl p-6 border border-[#382E24] hover:border-[#E8A838]/60 cursor-pointer group transition-all flex flex-col justify-center items-center shadow-lg w-full max-w-xs"
            >
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border"
                style={{
                  backgroundColor: `${estadoConfig.cor}20`,
                  borderColor: estadoConfig.cor,
                  color: estadoConfig.cor,
                }}
              >
                <Gamepad2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-[#F5E9D3] mb-4">Certball</h3>
              <div className="text-xs font-bold text-[#C8B8A0] flex items-center space-x-2">
                <span>Dominações: {mapDominanceCount}</span>
              </div>
            </div>

            {/* Card Xadrez */}
            <div
              onClick={() => setActiveGame('chess')}
              className="bg-[#1E1915] hover:bg-[#2A231D] rounded-3xl p-6 border border-[#382E24] hover:border-purple-500/60 cursor-pointer group transition-all flex flex-col justify-center items-center shadow-lg w-full max-w-xs"
            >
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-purple-500/30 bg-purple-500/10 text-purple-400">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-[#F5E9D3] mb-4">Xadrez 1x1</h3>
              <div className="text-xs font-bold text-[#C8B8A0]">
                <span>Aposte Certcoins</span>
              </div>
            </div>

            {/* Card Memória */}
            <div
              onClick={() => setActiveGame('memory')}
              className="bg-[#1E1915] hover:bg-[#2A231D] rounded-3xl p-6 border border-[#382E24] hover:border-[#E8A838]/60 cursor-pointer group transition-all flex flex-col justify-center items-center shadow-lg w-full max-w-xs"
            >
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-[#E8A838]/30 bg-[#E8A838]/10 text-[#E8A838]">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-[#F5E9D3] mb-4">Memória MG</h3>
              <div className="text-xs font-bold text-[#C8B8A0]">
                <span>Ganhe 10 Certcoins</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* XADREZ */}
      {activeGame === 'chess' && (
        <div className="fixed inset-0 z-50 bg-[#120F0D] w-screen h-screen">
          <ChessView
            currentUser={currentUser}
            usuarios={usuarios || []}
            onAddCertcoins={onAddCertcoins}
            onClose={() => setActiveGame('menu')}
          />
        </div>
      )}
      {/* JOGO DA MEMÓRIA */}
      {activeGame === 'memory' && (
        <MemoryGame
          onWin={(coins) => {
            onAddCertcoins(coins);
          }}
          onClose={() => setActiveGame('menu')}
        />
      )}
      {activeGame === 'agario' && (
        <div
          ref={containerRef}
          className="fixed inset-0 z-50 bg-[#080605] w-screen h-screen overflow-hidden select-none touch-none flex flex-col pt-[env(safe-area-inset-top)]"
        >
          {/* Canvas de Tela Cheia com Câmera que Segue o Personagem */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full block cursor-crosshair z-0"
            style={{ touchAction: 'none' }}
          />

          {/* TOP BAR FIXA: BOTÃO SAIR, STATUS E PONTUAÇÃO */}
          <div className="relative z-30 p-3 sm:p-4 flex items-center justify-between pointer-events-none">
            {/* Controles no Topo Esquerdo: Botão Sair + Música PNL Relaxante */}
            <div className="flex items-center space-x-2 pointer-events-auto">
              <button
                onClick={() => {
                  if (pnlAudioRef.current) pnlAudioRef.current.stop();
                  setActiveGame('menu');
                }}
                className="px-3.5 py-2 bg-[#1E1915]/90 hover:bg-red-950/60 active:scale-95 text-xs font-bold rounded-2xl text-[#F5E9D3] border border-[#382E24] hover:border-red-500/60 backdrop-blur-md transition-all flex items-center space-x-1.5 shadow-2xl"
              >
                <X className="w-4 h-4 text-red-400" />
                <span>Sair</span>
              </button>

              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    containerRef.current?.requestFullscreen().catch(console.error);
                  } else {
                    document.exitFullscreen().catch(console.error);
                  }
                }}
                className="px-3 py-2 bg-[#1E1915]/90 hover:bg-[#2A231D] active:scale-95 text-xs font-bold rounded-2xl border border-[#382E24] backdrop-blur-md transition-all shadow-xl text-[#F5E9D3]"
                title="Tela Cheia"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                onClick={toggleMusic}
                className="px-3 py-2 bg-[#1E1915]/90 hover:bg-[#2A231D] active:scale-95 text-xs font-bold rounded-2xl border border-[#382E24] backdrop-blur-md transition-all flex items-center space-x-1.5 shadow-xl text-[#F5E9D3]"
                title="Música PNL Relaxante (Frequências 432Hz/528Hz)"
              >
                {isMusicPlaying ? (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="hidden xs:inline text-emerald-400 text-[11px]">PNL</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-zinc-400" />
                    <span className="hidden xs:inline text-zinc-400 text-[11px]">Mudo</span>
                  </>
                )}
              </button>
            </div>

            {/* Sala, Nível Médio e Escudo */}
            <div className="flex items-center space-x-2">
              {isShieldActive && (
                <div className="px-2.5 py-1 bg-cyan-950/80 border border-cyan-400/50 rounded-xl text-[10px] font-bold text-cyan-300 flex items-center space-x-1 animate-pulse backdrop-blur-sm shadow">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Escudo Ativo</span>
                </div>
              )}

              <div className="hidden xs:flex items-center space-x-1.5 text-[10px] font-bold text-amber-300 bg-amber-950/50 backdrop-blur-md px-2.5 py-1 rounded-xl border border-amber-500/30">
                <span>Nível: Médio ⚔️</span>
              </div>

              <div className="flex items-center space-x-2 text-[11px] font-bold text-[#C8B8A0] bg-[#1E1915]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#382E24]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden xs:inline">{onlineCountInRoom} na arena</span>
                <span className="font-mono text-[#E8A838]">({estadoConfig.sigla})</span>
              </div>
            </div>

            {/* Pontuação e Posição do Jogador */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 bg-[#1E1915]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E8A838]/50 text-[#E8A838] font-black text-xs sm:text-sm shadow-lg">
                <Coins className="w-4 h-4" />
                <span>{totalPlayerScore} pts</span>
              </div>

              <div className="flex items-center space-x-1 bg-[#1E1915]/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#382E24] text-xs font-bold text-[#F5E9D3]">
                <Crown className="w-3.5 h-3.5 text-yellow-400" />
                <span>#{leaderboard.findIndex((p) => p.isPlayer) + 1 || 1}</span>
              </div>
            </div>
          </div>

          {/* HUD DE RANKING AO VIVO (Canto Superior Direito) */}
          <div className="absolute top-16 right-3 sm:right-4 z-20 bg-[#120F0D]/85 backdrop-blur-md border border-[#382E24] rounded-2xl p-2.5 sm:p-3 text-[11px] w-[145px] sm:w-[180px] shadow-2xl pointer-events-none space-y-1">
            <div className="flex items-center justify-between border-b border-[#382E24] pb-1 text-[#E8A838] font-black text-[10px] uppercase tracking-wider">
              <span className="flex items-center space-x-1">
                <Trophy className="w-3 h-3 text-yellow-400" />
                <span>Ranking</span>
              </span>
              <span className="text-[9px] text-emerald-400 font-mono">LIVE</span>
            </div>

            <div className="space-y-1 pt-0.5">
              {leaderboard.slice(0, 5).map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between text-[10px] px-1.5 py-0.5 rounded-md ${
                    entry.isPlayer
                      ? 'bg-[#E8A838]/25 text-[#F5E9D3] font-black border border-[#E8A838]/60'
                      : 'text-[#C8B8A0]'
                  }`}
                >
                  <span className="truncate max-w-[90px] flex items-center space-x-1">
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

          {/* KILL FEED DE NOTIFICAÇÕES (Canto direito elevado, perfeitamente legível sem sobreposição) */}
          {killFeed.length > 0 && (
            <div className="absolute bottom-28 sm:bottom-32 right-3 sm:right-6 z-20 space-y-1.5 pointer-events-none max-w-[170px] sm:max-w-[210px] flex flex-col items-end">
              {killFeed.map((msg, i) => (
                <div
                  key={i}
                  className="bg-[#120F0D]/95 backdrop-blur-md border border-[#E8A838]/40 text-[9px] sm:text-[10px] px-2.5 py-1 rounded-xl text-[#F5E9D3] shadow-2xl animate-fadeIn text-right font-bold"
                >
                  {msg}
                </div>
              ))}
            </div>
          )}

          {/* ÁREA INFERIOR DE CONTROLES */}
          <div className="absolute bottom-6 sm:bottom-8 left-3 sm:left-6 right-3 sm:right-6 flex items-end justify-between pointer-events-none z-30">
            {/* LADO ESQUERDO: BOTÃO TURBO EM CIMA E BOTÃO DIVIDIR EM BAIXO */}
            <div className="flex flex-col items-center space-y-2.5 sm:space-y-3 pointer-events-auto">
              {/* Botão Turbo (Em Cima) */}
              <button
                onMouseDown={() => {
                  isBoostingRef.current = true;
                  setIsBoostingUI(true);
                }}
                onMouseUp={() => {
                  isBoostingRef.current = false;
                  setIsBoostingUI(false);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  isBoostingRef.current = true;
                  setIsBoostingUI(true);
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  isBoostingRef.current = false;
                  setIsBoostingUI(false);
                }}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-black transition-all shadow-2xl active:scale-95 border backdrop-blur-md ${
                  isBoostingUI
                    ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-black border-amber-300 scale-105 shadow-amber-500/40'
                    : 'bg-[#1E1915]/90 text-[#F5E9D3] border-[#382E24] hover:border-amber-400/50'
                }`}
                title="Acelera a bolinha gastando pontos para escapar ou caçar"
              >
                <Zap className={`w-5 h-5 ${isBoostingUI ? 'fill-black text-black animate-pulse' : 'text-amber-400'}`} />
                <span className="text-[9px] mt-0.5">Turbo</span>
                <span className="text-[7px] opacity-75 font-mono">-1 pt</span>
              </button>

              {/* Botão Dividir (Em Baixo, no lugar do Turbo) */}
              <button
                onClick={handleTriggerSplit}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleTriggerSplit();
                }}
                disabled={totalPlayerScore < 12 && playerCellsCount <= 1}
                className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center font-black transition-all shadow-2xl active:scale-95 border backdrop-blur-md ${
                  totalPlayerScore >= 12 || playerCellsCount > 1
                    ? 'bg-gradient-to-br from-purple-900/90 to-indigo-900/90 text-white border-purple-400 hover:border-purple-300 shadow-purple-900/40'
                    : 'bg-[#1E1915]/60 text-zinc-500 border-[#382E24] opacity-50 cursor-not-allowed'
                }`}
                title="Dividir bolinha: a principal vai para frente e as outras voltam para ela"
              >
                <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300 mb-0.5" />
                <span className="text-[10px] sm:text-[11px] font-black tracking-wider">DIVIDIR</span>
                <span className="text-[8px] opacity-80 font-mono">
                  {playerCellsCount > 1 ? `${playerCellsCount} partes` : '2x / 4x'}
                </span>
              </button>
            </div>

            {/* MEIO BAIXO: JOYSTICK ULTRA SENSÍVEL CENTRALIZADO */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-2 sm:bottom-3 flex flex-col items-center pointer-events-auto">
              <div
                ref={joystickBaseRef}
                onMouseDown={handleJoystickTouchStart}
                onMouseMove={(e) => {
                  if (joystickKnob.active) handleJoystickMove(e);
                }}
                onMouseUp={handleJoystickEnd}
                onMouseLeave={handleJoystickEnd}
                onTouchStart={handleJoystickTouchStart}
                onTouchMove={handleJoystickMove}
                onTouchEnd={handleJoystickEnd}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#1E1915]/85 backdrop-blur-md border-2 border-[#E8A838]/50 shadow-2xl flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing"
              >
                {/* Cruz central de mira */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                  <div className="w-full h-[1px] bg-amber-400" />
                  <div className="absolute h-full w-[1px] bg-amber-400" />
                </div>

                {/* Knob móvel do Joystick */}
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-white shadow-xl flex items-center justify-center pointer-events-none transition-transform duration-75"
                  style={{
                    transform: `translate(${joystickKnob.x}px, ${joystickKnob.y}px)`,
                  }}
                >
                  <Crosshair className="w-5 h-5 text-black" />
                </div>
              </div>
            </div>
          </div>

          {/* MODAL DE FIM DE PARTIDA (GAME OVER) */}
          {agarioGameOver && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fadeIn z-40">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-2xl border"
                style={{ backgroundColor: `${estadoConfig.cor}25`, borderColor: estadoConfig.cor }}
              >
                <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-black text-[#F5E9D3]">Eita! Fim de Partida!</h3>
                <p className="text-xs sm:text-sm text-[#C8B8A0]">
                  Você alcançou <strong>{totalPlayerScore} pontos</strong> e faturou{' '}
                  <strong className="text-[#E8A838]">+{agarioWonCoins.toFixed(2)} Certcoins</strong> 🪙
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  onClick={() => {
                    setAgarioGameOver(false);
                    setKillFeed([]);
                    setActiveGame('menu');
                    setTimeout(() => setActiveGame('agario'), 50);
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
      )}


    </div>
  );
};
