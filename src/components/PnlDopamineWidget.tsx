import React, { useState, useEffect } from 'react';
import { Sparkles, Gift, Flame, Trophy, CheckCircle, ArrowRight, Clock, Star, Zap } from 'lucide-react';
import { EstadoConfig } from '../types';

interface PnlDopamineWidgetProps {
  estadoConfig: EstadoConfig;
  onAddCertcoins: (amount: number) => void;
  userName: string;
}

// Reproduz som de recompensa dopaminérgico nativo (Web Audio API)
const playDopamineChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    // Acorde ascendente estimulante de dopamina: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  } catch (e) {
    // Audio context fallback silencioso
  }
};

export const PnlDopamineWidget: React.FC<PnlDopamineWidgetProps> = ({
  estadoConfig,
  onAddCertcoins,
  userName,
}) => {
  const [streakDays, setStreakDays] = useState(3);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [awardedCoins, setAwardedCoins] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('14h 28m');

  // Afirmações de Programação Neuro-Linguística (PNL) para induzir empoderamento e conexão
  const pnlAffirmations = [
    'Sua presença atrai oportunidades e conexões autênticas.',
    'A cada retorno, sua visibilidade e magnetismo se multiplicam.',
    'Você está exatamente no lugar certo para novas histórias.',
    'A energia que você coloca no mundo retorna em conexões reais.',
  ];
  const [todayAffirmation, setTodayAffirmation] = useState(pnlAffirmations[0]);

  useEffect(() => {
    // Carrega dados de streak do localStorage
    const savedStreak = localStorage.getItem('pnl_streak_days');
    const lastClaimDate = localStorage.getItem('pnl_last_claim_date');
    const today = new Date().toDateString();

    if (savedStreak) {
      setStreakDays(parseInt(savedStreak, 10) || 1);
    }
    if (lastClaimDate === today) {
      setHasClaimedToday(true);
    }

    // Escolhe afirmação baseada no dia
    const dayIndex = new Date().getDate() % pnlAffirmations.length;
    setTodayAffirmation(pnlAffirmations[dayIndex]);

    // Calcula tempo restante até meia-noite
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${mins}m`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleClaimReward = () => {
    if (hasClaimedToday) return;

    playDopamineChime();
    const bonus = 3.0; // 3 Certcoins de bônus diário
    setAwardedCoins(bonus);
    onAddCertcoins(bonus);

    const newStreak = streakDays + 1;
    setStreakDays(newStreak);
    setHasClaimedToday(true);
    setShowCelebration(true);

    localStorage.setItem('pnl_streak_days', newStreak.toString());
    localStorage.setItem('pnl_last_claim_date', new Date().toDateString());

    setTimeout(() => {
      setShowCelebration(false);
    }, 4000);
  };

  return (
    <div className="w-full bg-gradient-to-r from-[#1E1915] via-[#2A211A] to-[#1E1915] border border-[#E8A838]/40 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden transition-all">
      {/* Luz ambiente de fundo */}
      <div
        className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: estadoConfig.cor || '#E8A838' }}
      />

      {/* Pop-up de Dopamina e Celebração */}
      {showCelebration && (
        <div className="absolute inset-0 bg-[#120F0D]/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-4 text-center animate-fadeIn">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-black mb-2 shadow-xl animate-bounce">
            <Gift className="w-7 h-7" />
          </div>
          <h4 className="text-base sm:text-lg font-black text-amber-300">
            +{awardedCoins} Certcoins Desbloqueados! 🎉
          </h4>
          <p className="text-xs text-[#F5E9D3] max-w-xs mt-1">
            Sua sequência subiu para <strong className="text-amber-400">{streakDays} dias</strong>! Volte amanhã para manter seu multiplicador ativo.
          </p>
          <div className="mt-3 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40">
            ✨ Magnetismo & Foco Ativados em {estadoConfig.sigla}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Lado Esquerdo: Sequência e Status PNL */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[11px] font-black">
              <Flame className="w-3.5 h-3.5 fill-orange-400 animate-pulse" />
              <span>Sequência: {streakDays} Dias</span>
            </span>

            <span className="text-[11px] font-bold text-amber-300/90 flex items-center space-x-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Multiplicador 2.0x</span>
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-black text-[#F5E9D3] flex items-center space-x-1.5">
            <span>Olá, {userName.split(' ')[0]}!</span>
            <span className="text-xs text-[#C8B8A0] font-normal hidden xs:inline">
              · {todayAffirmation}
            </span>
          </h3>

          <p className="text-[11px] text-[#C8B8A0] leading-snug">
            {hasClaimedToday ? (
              <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Presente diário resgatado! Próximo bônus em: <strong className="text-amber-300 font-mono">{timeRemaining}</strong></span>
              </span>
            ) : (
              <span>Abra sua caixa de recompensa diária para manter seu perfil em destaque no estado.</span>
            )}
          </p>
        </div>

        {/* Lado Direito: Botão Recompensa de Dopamina Diária */}
        <div className="flex items-center sm:justify-end shrink-0">
          {hasClaimedToday ? (
            <div className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#120F0D]/90 border border-[#382E24] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#C8B8A0]">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Volte em {timeRemaining}</span>
            </div>
          ) : (
            <button
              onClick={handleClaimReward}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-black font-black text-xs sm:text-sm rounded-2xl shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer group"
            >
              <Gift className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Resgatar Recompensa Diária</span>
              <Sparkles className="w-3.5 h-3.5 text-black animate-ping" />
            </button>
          )}
        </div>
      </div>

      {/* Mini Barra de Progresso Semanal de Hábitos (7 dias) */}
      <div className="mt-3 pt-3 border-t border-[#382E24]/80 flex items-center justify-between text-[10px] text-[#C8B8A0]">
        <span className="font-bold flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span>Meta da Semana: {streakDays}/7 dias</span>
        </span>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div
              key={day}
              className={`w-4 h-1.5 rounded-full ${
                day <= (streakDays % 7 || 7)
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                  : 'bg-[#382E24]'
              }`}
              title={`Dia ${day}`}
            />
          ))}
        </div>
        <span className="font-mono text-amber-400/90 font-bold hidden sm:inline">
          +10 Certcoins no 7º dia
        </span>
      </div>
    </div>
  );
};
