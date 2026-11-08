import React from 'react';
import { Award, Sparkles, MessageSquare, Heart, TrendingUp, Info } from 'lucide-react';
import { calcularMineiridade } from '../utils/mineiridade';
import { EstadoConfig } from '../types';

interface MineiridadeCardProps {
  postsCount: number;
  matchesCount: number;
  compact?: boolean; // Se true, exibe uma versão em miniatura (para badges curtos)
  estadoConfig?: EstadoConfig;
}

export const MineiridadeCard: React.FC<MineiridadeCardProps> = ({
  postsCount,
  matchesCount,
  compact = false,
}) => {
  const info = calcularMineiridade(postsCount, matchesCount);

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${info.corSelo} text-white font-extrabold text-xs shadow-sm`}>
        <span className="text-sm">{info.emoji}</span>
        <span>Nível {info.nivel} • {info.titulo}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl p-5 sm:p-6 bg-gradient-to-br ${info.bgGradient} border border-orange-200/80 dark:border-zinc-800 shadow-sm space-y-5 text-left relative overflow-hidden`}>
      {/* Elemento decorativo sutil no fundo */}
      <div className="absolute -right-6 -bottom-6 opacity-10 text-orange-600 dark:text-orange-400 pointer-events-none select-none text-9xl font-black">
        {info.emoji}
      </div>

      {/* Top Header: Selo & Nível */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          {/* Badge Selo de Mineiridade */}
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${info.corSelo} text-white flex items-center justify-center text-2xl shadow-md border-2 border-white/40 dark:border-zinc-800 shrink-0 animate-pulse`}>
            {info.emoji}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/10 dark:bg-orange-400/20 text-orange-600 dark:text-orange-400 border border-orange-300/40 dark:border-orange-500/30">
                Nível {info.nivel} de Mineiridade
              </span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-100 mt-0.5">
              {info.titulo}
            </h3>
          </div>
        </div>

        {/* Total de Pontos */}
        <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xs px-4 py-2 rounded-2xl border border-orange-100 dark:border-zinc-700/60 shadow-2xs self-stretch sm:self-auto text-center sm:text-right">
          <span className="block text-[10px] uppercase font-bold text-zinc-400">Pontuação Total</span>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400">
            {info.pontos} <span className="text-xs font-bold text-zinc-500">pt</span>
          </span>
        </div>
      </div>

      {/* Descrição do Nível */}
      <p className="text-xs text-zinc-600 dark:text-zinc-300 italic bg-white/60 dark:bg-zinc-800/50 p-3 rounded-2xl border border-orange-100/50 dark:border-zinc-800">
        "{info.descricao}"
      </p>

      {/* Barra de Progresso */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-zinc-600 dark:text-zinc-300 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
            <span>Progresso do Nível {info.nivel}</span>
          </span>
          <span className="text-orange-600 dark:text-orange-400">
            {info.progressoPorcentagem}%
          </span>
        </div>

        <div className="w-full h-3.5 bg-zinc-200/80 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200 dark:border-zinc-700">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${info.corSelo} transition-all duration-700 shadow-xs`}
            style={{ width: `${Math.max(5, info.progressoPorcentagem)}%` }}
          />
        </div>

        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between pt-0.5">
          <span>{info.pontosNoNivelAtual} pt no nível</span>
          {info.nivel < 5 ? (
            <span>Faltam <strong className="text-orange-600 dark:text-orange-400">{info.pontosParaProximoNivel} pt</strong> para o próximo nível</span>
          ) : (
            <span className="font-bold text-amber-600 dark:text-amber-400">Nível Máximo Atingido! 🏆</span>
          )}
        </div>
      </div>

      {/* Detalhamento dos Pontos (Posts + Matches) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="bg-white/70 dark:bg-zinc-800/70 p-3 rounded-2xl border border-orange-100 dark:border-zinc-700/50 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 block">Postagens</span>
            <span className="text-sm font-black text-zinc-800 dark:text-zinc-100">
              {postsCount} <span className="text-[10px] font-semibold text-zinc-400">({postsCount * 10} pt)</span>
            </span>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-800/70 p-3 rounded-2xl border border-orange-100 dark:border-zinc-700/50 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 block">Matches</span>
            <span className="text-sm font-black text-zinc-800 dark:text-zinc-100">
              {matchesCount} <span className="text-[10px] font-semibold text-zinc-400">({matchesCount * 20} pt)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Dica para subir de nível */}
      <div className="flex items-center space-x-2 text-[11px] text-amber-800 dark:text-amber-300/90 bg-amber-50/80 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/50">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          <strong>Como subir de nível?</strong> Cada post vale 10 pt e cada match vale 20 pt. Crie prosas no Feed e faça novos matches para se tornar Patrimônio de Minas!
        </span>
      </div>
    </div>
  );
};
