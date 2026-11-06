import React, { useState } from 'react';
import { 
  Trophy, Award, Crown, Medal, Sparkles, MessageSquare, Heart, 
  TrendingUp, Coffee, Flame, Shield, MapPin, User, ChevronRight 
} from 'lucide-react';
import { UserProfile, Postagem, Match } from '../types';
import { calcularMineiridade, MineiridadeInfo } from '../utils/mineiridade';
import { MineiridadeCard } from './MineiridadeCard';

interface LeaderboardViewProps {
  usuarios: UserProfile[];
  posts: Postagem[];
  matches: Match[];
  currentUser: UserProfile;
  onSelectUser?: (user: UserProfile) => void;
}

interface RankedUser {
  rank: number;
  user: UserProfile;
  postsCount: number;
  matchesCount: number;
  info: MineiridadeInfo;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  usuarios,
  posts,
  matches,
  currentUser,
  onSelectUser,
}) => {
  const [selectedUserDetail, setSelectedUserDetail] = useState<RankedUser | null>(null);

  // Calcula e ordena todos os usuários do aplicativo pelo Nível e Pontos de Mineiridade
  const rankedList: RankedUser[] = usuarios
    .map((u) => {
      const postsCount = posts.filter((p) => p.autor_id === u.id).length;
      const matchesCount = matches.filter(
        (m) => m.usuario1_id === u.id || m.usuario2_id === u.id
      ).length;
      const info = calcularMineiridade(postsCount, matchesCount);
      return { rank: 0, user: u, postsCount, matchesCount, info };
    })
    .sort((a, b) => {
      if (b.info.pontos !== a.info.pontos) {
        return b.info.pontos - a.info.pontos;
      }
      return (b.postsCount + b.matchesCount) - (a.postsCount + a.matchesCount);
    })
    .map((item, index) => ({ ...item, rank: index + 1 }));

  const top10 = rankedList.slice(0, 10);
  const currentUserRankInfo = rankedList.find((item) => item.user.id === currentUser.id);

  const top1 = top10[0];
  const top2 = top10[1];
  const top3 = top10[2];
  const restTop = top10.slice(3);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-8 animate-fadeIn">
      {/* Banner de Cabeçalho Temático */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-yellow-200" />
            <span>Hall da Fama Mineiro ☕</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Ranking de Nível de Mineiridade
          </h2>
          <p className="text-xs sm:text-sm text-orange-100 leading-relaxed">
            Conheça os 10 mineiros e mineiras mais ativos do Encontro Certo MG! Publique postagens no Feed e faça novos Matches para subir no ranking!
          </p>
        </div>

        {/* Card do Usuário Atual no Header */}
        {currentUserRankInfo && (
          <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-4 text-center shrink-0 w-full sm:w-auto shadow-md">
            <span className="block text-[10px] font-bold text-orange-100 uppercase">Sua Posição Atual</span>
            <div className="flex items-center justify-center space-x-2 my-1">
              <span className="text-2xl font-black">#{currentUserRankInfo.rank}</span>
              <span className="text-xl">{currentUserRankInfo.info.emoji}</span>
            </div>
            <span className="text-xs font-bold block text-white">{currentUserRankInfo.info.pontos} pt de Mineiridade</span>
          </div>
        )}
      </div>

      {/* PÓDIO DOS TOP 3 (1º, 2º e 3º Lugar) */}
      {top10.length >= 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-100 flex items-center space-x-2">
              <Crown className="w-5 h-5 text-amber-500 fill-amber-500 animate-bounce" />
              <span>Pódio dos Campeões da Prosa 👑</span>
            </h3>
            <span className="text-xs font-bold text-zinc-400">Atualizado em tempo real</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end">
            {/* 2º LUGAR (Prata) */}
            {top2 ? (
              <div
                onClick={() => setSelectedUserDetail(top2)}
                className="order-2 md:order-1 bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-md border-2 border-slate-300 dark:border-slate-700 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group flex flex-col items-center text-center space-y-3"
              >
                <div className="absolute top-3 left-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-black flex items-center space-x-1 shadow-2xs">
                  <span>🥈 2º Lugar</span>
                </div>
                <div className="relative pt-4">
                  <img
                    src={top2.user.foto}
                    alt={top2.user.nome}
                    className="w-20 h-20 rounded-full object-cover border-4 border-slate-300 dark:border-slate-600 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -bottom-2 right-0 w-7 h-7 bg-slate-500 text-white rounded-full flex items-center justify-center font-black text-xs shadow">
                    2
                  </div>
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-zinc-800 dark:text-zinc-100">{top2.user.nome}</h4>
                  <p className="text-xs text-zinc-400">{top2.user.cidade}</p>
                </div>

                <div className="w-full pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-400">{top2.info.emoji} {top2.info.titulo}</span>
                  <span className="font-black text-amber-600 dark:text-amber-400">{top2.info.pontos} pt</span>
                </div>
              </div>
            ) : null}

            {/* 1º LUGAR (Ouro - Destaque Maior no Centro) */}
            {top1 ? (
              <div
                onClick={() => setSelectedUserDetail(top1)}
                className="order-1 md:order-2 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-white dark:to-zinc-900 rounded-3xl p-6 shadow-xl border-2 border-amber-400 dark:border-amber-500 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden group flex flex-col items-center text-center space-y-3 md:-translate-y-2"
              >
                <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 px-3 py-1 rounded-full text-xs font-black flex items-center space-x-1 shadow-sm animate-pulse">
                  <Crown className="w-3.5 h-3.5 fill-amber-950" />
                  <span>🥇 1º LUGAR</span>
                </div>
                <div className="relative pt-4">
                  <img
                    src={top1.user.foto}
                    alt={top1.user.nome}
                    className="w-24 h-24 rounded-full object-cover border-4 border-amber-400 dark:border-amber-500 shadow-lg group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -bottom-2 right-1 w-8 h-8 bg-amber-500 text-amber-950 font-black rounded-full flex items-center justify-center text-sm shadow-md border-2 border-white">
                    1
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-lg text-zinc-900 dark:text-zinc-100">{top1.user.nome}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{top1.user.cidade}</p>
                </div>

                <div className="w-full pt-3 border-t border-amber-200/60 dark:border-amber-900/50 flex items-center justify-between text-xs">
                  <span className="font-black text-amber-700 dark:text-amber-300">{top1.info.emoji} {top1.info.titulo}</span>
                  <span className="font-black text-amber-600 dark:text-amber-400 text-sm">{top1.info.pontos} pt</span>
                </div>
              </div>
            ) : null}

            {/* 3º LUGAR (Bronze) */}
            {top3 ? (
              <div
                onClick={() => setSelectedUserDetail(top3)}
                className="order-3 bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-md border-2 border-amber-700/60 dark:border-amber-800 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group flex flex-col items-center text-center space-y-3"
              >
                <div className="absolute top-3 left-3 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 px-3 py-1 rounded-full text-xs font-black flex items-center space-x-1 shadow-2xs">
                  <span>🥉 3º Lugar</span>
                </div>
                <div className="relative pt-4">
                  <img
                    src={top3.user.foto}
                    alt={top3.user.nome}
                    className="w-20 h-20 rounded-full object-cover border-4 border-amber-700/60 dark:border-amber-800 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute -bottom-2 right-0 w-7 h-7 bg-amber-800 text-white rounded-full flex items-center justify-center font-black text-xs shadow">
                    3
                  </div>
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-zinc-800 dark:text-zinc-100">{top3.user.nome}</h4>
                  <p className="text-xs text-zinc-400">{top3.user.cidade}</p>
                </div>

                <div className="w-full pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-800 dark:text-amber-400">{top3.info.emoji} {top3.info.titulo}</span>
                  <span className="font-black text-amber-600 dark:text-amber-400">{top3.info.pontos} pt</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* POSIÇÕES DE 4º A 10º LUGAR */}
      {restTop.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-orange-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-base font-extrabold text-zinc-800 dark:text-zinc-100 flex items-center space-x-2">
              <Medal className="w-5 h-5 text-orange-500" />
              <span>Demais Destaques da Comunidade (4º ao 10º)</span>
            </h3>
            <span className="text-xs font-bold text-zinc-400">Total Top 10</span>
          </div>

          <div className="space-y-2.5">
            {restTop.map((item) => {
              const isCurrentUser = item.user.id === currentUser.id;

              return (
                <div
                  key={item.user.id}
                  onClick={() => setSelectedUserDetail(item)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isCurrentUser
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 shadow-xs'
                      : 'bg-zinc-50/70 dark:bg-zinc-800/50 hover:bg-orange-50/50 dark:hover:bg-zinc-800 border-zinc-200/80 dark:border-zinc-700/60'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {/* Número da Posição */}
                    <span className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 font-black text-xs text-zinc-700 dark:text-zinc-300 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shrink-0 shadow-2xs">
                      #{item.rank}
                    </span>

                    {/* Foto de Perfil */}
                    <img
                      src={item.user.foto}
                      alt={item.user.nome}
                      className="w-11 h-11 rounded-full object-cover border-2 border-orange-300/60 shrink-0"
                    />

                    {/* Informações do Usuário */}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-100 truncate">
                          {item.user.nome}
                        </h4>
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 rounded-md bg-orange-500 text-white font-extrabold text-[10px] shrink-0">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate">
                        {item.user.cidade} • <span className="font-semibold text-orange-600 dark:text-orange-400">{item.info.emoji} {item.info.titulo}</span>
                      </p>
                    </div>
                  </div>

                  {/* Pontos & Posts/Matches */}
                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="hidden sm:flex items-center space-x-2 text-xs text-zinc-400 font-medium">
                      <span title="Posts">{item.postsCount} posts</span>
                      <span>•</span>
                      <span title="Matches">{item.matchesCount} matches</span>
                    </div>

                    <div className="text-right">
                      <span className="block text-sm font-black text-amber-600 dark:text-amber-400">
                        {item.info.pontos} pt
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400">Nível {item.info.nivel}</span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PAINEL SE O USUÁRIO ATUAL NÃO ESTIVER NO TOP 10 */}
      {currentUserRankInfo && currentUserRankInfo.rank > 10 && (
        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-3xl p-6 border border-orange-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-orange-800 dark:text-orange-300 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span>Sua Posição Geral no Encontro Certo MG</span>
            </h4>
            <span className="px-3 py-1 rounded-full bg-orange-500 text-white font-black text-xs">
              #{currentUserRankInfo.rank} de {rankedList.length}
            </span>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            Você está na posição <strong>#{currentUserRankInfo.rank}</strong> com <strong>{currentUserRankInfo.info.pontos} pt</strong> de Mineiridade ({currentUserRankInfo.info.emoji} {currentUserRankInfo.info.titulo}). Continue publicando prosas e dando likes para entrar no Top 10!
          </p>

          <MineiridadeCard
            postsCount={currentUserRankInfo.postsCount}
            matchesCount={currentUserRankInfo.matchesCount}
          />
        </div>
      )}

      {/* MODAL DE DETALHES DO USUÁRIO DO RANKING */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-orange-100 dark:border-zinc-800 relative my-8 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-zinc-800 dark:text-zinc-100">
                  Destaque #{selectedUserDetail.rank} do Ranking
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
              >
                Fechar
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <img
                src={selectedUserDetail.user.foto}
                alt={selectedUserDetail.user.nome}
                className="w-16 h-16 rounded-full object-cover border-2 border-orange-400 shadow-md"
              />
              <div>
                <h4 className="font-black text-lg text-zinc-900 dark:text-zinc-100">
                  {selectedUserDetail.user.nome}, {selectedUserDetail.user.idade}
                </h4>
                <p className="text-xs text-zinc-500">
                  {selectedUserDetail.user.cidade} {selectedUserDetail.user.bairro ? `• ${selectedUserDetail.user.bairro}` : ''}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-orange-50/50 dark:bg-zinc-900/60 p-3 rounded-2xl border border-orange-100 dark:border-zinc-800">
              "{selectedUserDetail.user.descricao || 'Mineiro(a) de coração!'}"
            </p>

            <MineiridadeCard
              postsCount={selectedUserDetail.postsCount}
              matchesCount={selectedUserDetail.matchesCount}
            />
          </div>
        </div>
      )}
    </div>
  );
};
