import React, { useState, useEffect } from 'react';
import { Trophy, Coins, User, Search, X } from 'lucide-react';
import { UserProfile, EstadoConfig } from '../types';

interface ChessViewProps {
  currentUser: UserProfile;
  usuarios: UserProfile[];
  onAddCertcoins: (amount: number) => void;
}

export const ChessView: React.FC<ChessViewProps> = ({ currentUser, usuarios, onAddCertcoins }) => {
  const [gameState, setGameState] = useState<'menu' | 'searching' | 'betting' | 'playing'>('menu');
  const [opponent, setOpponent] = useState<UserProfile | null>(null);
  const [betAmount, setBetAmount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let osc1: OscillatorNode, osc2: OscillatorNode, gain: GainNode, ctx: AudioContext;

    if (isPlaying) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      ctx = new AudioCtx();
      gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.connect(ctx.destination);

      const playNote = (freq: number, time: number) => {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(freq, time);
        o.connect(gain);
        o.start(time);
        o.stop(time + 0.15);
      };

      const loop = () => {
        if (!isPlaying) return;
        const now = ctx.currentTime;
        [110, 165, 220, 330].forEach((f, i) => playNote(f * (Math.random() > 0.5 ? 2 : 1), now + i * 0.2));
        setTimeout(loop, 800);
      };
      loop();
    }
    return () => {
      if (ctx) ctx.close();
      setIsPlaying(false);
    };
  }, [isPlaying]);

  const startSearch = () => {
    setGameState('searching');
    setTimeout(() => {
      const availableOpponents = usuarios.filter(u => u.id !== currentUser.id);
      const randomOpponent = availableOpponents[Math.floor(Math.random() * availableOpponents.length)];
      setOpponent(randomOpponent);
      setGameState('betting');
      setIsPlaying(true);
    }, 2000);
  };

  const confirmBet = (amount: number) => {
    setBetAmount(amount);
    setGameState('playing');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-[#F5E9D3]">
      <button onClick={() => setIsPlaying(!isPlaying)} className="absolute top-4 right-4 text-xs">
        {isPlaying ? '🔇 Pausar Música' : '🔊 Música'}
      </button>
      {gameState === 'menu' && (
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-black text-amber-400">Xadrez 1x1</h2>
          <button 
            onClick={startSearch}
            className="flex items-center space-x-2 bg-amber-500 text-black px-6 py-3 rounded-full font-bold hover:bg-amber-400 transition"
          >
            <Search className="w-5 h-5" />
            <span>Buscar Oponente</span>
          </button>
        </div>
      )}

      {gameState === 'searching' && (
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
          <p>Buscando oponente...</p>
        </div>
      )}

      {gameState === 'betting' && opponent && (
        <div className="text-center space-y-6 bg-[#1E1915] p-6 rounded-2xl border border-[#382E24]">
          <h3 className="text-xl font-bold">Oponente encontrado: {opponent.nome}</h3>
          <p>Quanto deseja apostar?</p>
          <div className="flex space-x-4 justify-center">
            {[1, 5, 10].map(amount => (
              <button 
                key={amount}
                onClick={() => confirmBet(amount)}
                className="bg-[#382E24] px-4 py-2 rounded-lg hover:bg-amber-900 transition"
              >
                {amount} Certcoins
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="text-center">
          <h3 className="text-2xl font-black">Partida contra {opponent?.nome}</h3>
          <p className="text-amber-400 font-bold mt-2">Aposta: {betAmount} Certcoins</p>
          <div className="mt-8 border border-[#382E24] p-8 rounded-xl bg-[#120F0D]">
            [Tabuleiro de Xadrez em breve...]
          </div>
          <button onClick={() => { setGameState('menu'); setIsPlaying(false); }} className="mt-6 text-red-400 underline">Desistir</button>
        </div>
      )}
    </div>
  );
};
