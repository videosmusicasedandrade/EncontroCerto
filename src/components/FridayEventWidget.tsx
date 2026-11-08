import React, { useState, useEffect } from 'react';
import { Lock, Sparkles, Gift, Clock, CheckCircle2, Eye, X, UserCheck, MessageCircle, Heart, Star } from 'lucide-react';
import { EstadoConfig, UserProfile } from '../types';

interface FridayEventWidgetProps {
  estadoConfig: EstadoConfig;
  currentUser?: UserProfile | null;
  onUseBrinde?: () => void;
  onStartBlindChat?: (botUser: UserProfile) => void;
}

interface BlindBot {
  id: string;
  nome: string;
  idade: number;
  cidade: string;
  foto: string;
  pista: string;
  bio: string;
  revelado: boolean;
}

export const FridayEventWidget: React.FC<FridayEventWidgetProps> = ({
  estadoConfig,
  currentUser,
  onUseBrinde,
  onStartBlindChat,
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const [usedCount, setUsedCount] = useState<number>(0);
  const [forceUnlockedDemo, setForceUnlockedDemo] = useState<boolean>(true); // Liberado para testes do usuário
  const [showBlindModal, setShowBlindModal] = useState<boolean>(false);
  const [isAdminUnlimited, setIsAdminUnlimited] = useState<boolean>(true); // Ativo para administradores e testes sem limite

  const isAdmin = currentUser?.isAdmin || isAdminUnlimited;

  // Lista de Bots para o Encontro a Cegas de Sexta
  const [bots, setBots] = useState<BlindBot[]>([
    {
      id: 'bot-camila',
      nome: 'Camila Mendonça',
      idade: 25,
      cidade: 'Uberlândia',
      foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
      pista: '🌸 Gosta de poesias de Drummond, pão de queijo fresquinho e violão ao pôr do sol.',
      bio: 'Sou designer, amo viagens por Minas, café quentinho e prosear sobre a vida.',
      revelado: false,
    },
    {
      id: 'bot-raimundo',
      nome: 'Raimundo Oliveira',
      idade: 28,
      cidade: 'Ouro Preto',
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      pista: '⛰️ Chef de cozinha regional, curte trilhas na serra e causos à beira da fogueira.',
      bio: 'Cozinho de coração, curto fotografia de paisagens e modão de viola no fim de semana.',
      revelado: false,
    },
    {
      id: 'bot-mariana',
      nome: 'Mariana Silva',
      idade: 27,
      cidade: 'Belo Horizonte',
      foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      pista: '☕ Engenheira em BH, fã de pão de queijo, MPB e passeios na Praça da Liberdade.',
      bio: 'Amo café com broa de milho, conversas calmas e assistir ao pôr do sol na Praça do Papa.',
      revelado: false,
    },
  ]);

  const handleGenerateAdminBot = () => {
    const pool = [
      { nome: 'Juliana Paes', cidade: 'Juiz de Fora', foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', pista: '🎸 Toca violão, ama montanhas e café forte.', bio: 'Amo cachoeiras, trilhas e prosear sobre a vida.' },
      { nome: 'Mateus Castro', cidade: 'Poços de Caldas', foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80', pista: '☕ Barista apaixonado por queijo Minas e literatura.', bio: 'Cozinho nas horas vagas e curto um boa roda de violão.' },
      { nome: 'Fernanda Lima', cidade: 'Montes Claros', foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80', pista: '🌸 Arquiteta fã de seresta e passeios na praça.', bio: 'Adoro viagens pelo interior de Minas e conversas profundas.' },
      { nome: 'Lucas Alencar', cidade: 'Governador Valadares', foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80', pista: '⛰️ Praticante de voo livre e ciclista de serra.', bio: 'Aventureiro e bom de prosa, procurando uma companhia leve.' },
    ];

    const idx = bots.length % pool.length;
    const item = pool[idx];
    const newBot: BlindBot = {
      id: `bot-admin-${Date.now()}-${bots.length}`,
      nome: `${item.nome}`,
      idade: 23 + ((bots.length * 3) % 12),
      cidade: item.cidade,
      foto: item.foto,
      pista: item.pista,
      bio: item.bio,
      revelado: false,
    };
    setBots((prev) => [...prev, newBot]);
  };

  const getLocalDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const todayStr = getLocalDateStr(now);
    const dayOfWeek = now.getDay();

    const savedDate = localStorage.getItem('encontro_certo_friday_event_date');
    const savedCount = localStorage.getItem('encontro_certo_friday_event_used_count');

    if (dayOfWeek === 5) {
      if (savedDate !== todayStr) {
        localStorage.setItem('encontro_certo_friday_event_date', todayStr);
        localStorage.setItem('encontro_certo_friday_event_used_count', '0');
        setUsedCount(0);
      } else if (savedCount !== null) {
        setUsedCount(parseInt(savedCount, 10) || 0);
      }
    } else if (savedCount !== null) {
      setUsedCount(parseInt(savedCount, 10) || 0);
    }
  }, [now]);

  const dayOfWeek = now.getDay();
  const hours = now.getHours();

  const isFriday = dayOfWeek === 5;
  const isUnlockedReal = isFriday && hours >= 18;
  const isUnlocked = isUnlockedReal || forceUnlockedDemo;

  const handleConsumeBrinde = () => {
    setShowBlindModal(true);
  };

  const handleSelectBotChat = (b: BlindBot) => {
    if (!isAdmin && usedCount >= 3) {
      alert('Você já usou seus 3 brindes do Evento de Sexta hoje! Sexta que vem tem mais 💛');
      return;
    }

    const nextCount = usedCount + 1;
    setUsedCount(nextCount);
    const todayStr = getLocalDateStr(now);
    localStorage.setItem('encontro_certo_friday_event_date', todayStr);
    localStorage.setItem('encontro_certo_friday_event_used_count', String(nextCount));

    // Mantém o bot com revelado: false (ou seja, Encontro a Cegas com foto oculta/borrada)
    // O pretendente só será revelado quando o usuário clicar em "💖 Revelar Pretendente" no chat
    const botUser: UserProfile = {
      id: b.id,
      nome: b.nome,
      nascimento: '1998-05-12',
      idade: b.idade,
      cidade: b.cidade,
      estado_sigla: 'MG',
      latitude: -19.92,
      longitude: -43.94,
      raio_busca: 50,
      tipo_corporal: 'Normal',
      foto: b.foto,
      descricao: b.bio,
      tipo_perfil: 'publico',
      exibir_na_busca: true,
      criado_em: new Date().toISOString(),
    };

    setShowBlindModal(false);

    if (onStartBlindChat) {
      onStartBlindChat(botUser);
    } else if (onUseBrinde) {
      onUseBrinde();
    }
  };

  const getNextFriday18 = () => {
    const nextFri = new Date(now);
    let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    if (dayOfWeek === 5 && hours >= 18) {
      daysUntilFriday = 7;
    }
    nextFri.setDate(now.getDate() + daysUntilFriday);
    nextFri.setHours(18, 0, 0, 0);
    return nextFri;
  };

  const getFridayEnd = () => {
    const friEnd = new Date(now);
    friEnd.setHours(23, 59, 59, 999);
    return friEnd;
  };

  const formatDiffTime = (diffMs: number) => {
    if (diffMs <= 0) return '00h 00m 00s';
    const diffSecs = Math.floor(diffMs / 1000);
    const d = Math.floor(diffSecs / (3600 * 24));
    const h = Math.floor((diffSecs % (3600 * 24)) / 3600);
    const m = Math.floor((diffSecs % 3600) / 60);
    const s = diffSecs % 60;

    if (d > 0) {
      return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
    }
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  };

  const availableBrindes = Math.max(0, 3 - usedCount);

  return (
    <>
      {/* CARD PRINCIPAL DO EVENTO DE SEXTA NA HOME */}
      {!isUnlocked ? (
        <div className="relative overflow-hidden bg-[#1E1915] rounded-3xl p-5 border-2 border-[#382E24] shadow-xl text-[#F5E9D3] transition-all">
          <div className="absolute -right-4 -bottom-4 text-[#382E24] opacity-30 pointer-events-none">
            <Lock className="w-32 h-32" />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-black text-[#F5E9D3] flex items-center space-x-2">
                <Lock className="w-5 h-5 text-[#E8A838]" />
                <span>🔒 EVENTO DE SEXTA-FEIRA</span>
              </h3>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-[#120F0D] text-[11px] font-black text-[#E8A838] border border-[#382E24] flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>TRANCADO ATÉ SEXTA ÀS 18:00</span>
                </span>

                <button
                  type="button"
                  onClick={() => setForceUnlockedDemo(true)}
                  className="text-[10px] text-[#C8B8A0] hover:text-[#E8A838] underline font-bold"
                  title="Testar Evento de Sexta com Bots (Encontro a Cegas)"
                >
                  (Testar Liberado)
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#C8B8A0] leading-relaxed">
              Aguarde sexta-feira às 18h para ganhar <strong className="text-[#E8A838] font-bold">3 revelações de perfil GRÁTIS no Encontro a Cegas! 💛</strong>
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2 text-xs text-[#E8A838] font-bold bg-[#120F0D] px-3.5 py-2 rounded-2xl border border-[#382E24]">
                <Clock className="w-4 h-4 text-[#E8A838] animate-pulse" />
                <span>⏳ Próxima liberação: Sexta às 18:00 ({formatDiffTime(getNextFriday18().getTime() - now.getTime())})</span>
              </div>

              <button
                disabled
                className="px-6 py-2.5 rounded-2xl bg-[#2A231D] text-[#C8B8A0] text-xs font-black border border-[#382E24] cursor-not-allowed opacity-80"
              >
                Em breve 🔒
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden bg-gradient-to-r from-[#2A231D] via-[#1E1915] to-[#2A231D] rounded-3xl p-5 sm:p-6 border-2 border-[#E8A838] shadow-[0_0_25px_rgba(232,168,56,0.25)] text-[#F5E9D3] animate-fadeIn">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8A838]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg sm:text-xl font-black text-[#F5E9D3] flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-[#E8A838] animate-spin-slow" />
                <span>🎉 É SEXTA-FEIRA! ENCONTRO A CEGAS 🎉</span>
              </h3>

              <div className="flex items-center space-x-2">
                {isAdmin ? (
                  <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 text-[#120F0D] text-xs font-black uppercase shadow-md flex items-center space-x-1">
                    <span>👑 Acesso Admin Ilimitado</span>
                  </span>
                ) : (
                  <span className="px-3.5 py-1 rounded-full bg-[#E8A838] text-[#120F0D] text-xs font-black uppercase shadow-md">
                    Liberado Hoje! 🎁
                  </span>
                )}
                {forceUnlockedDemo && (
                  <button
                    type="button"
                    onClick={() => setForceUnlockedDemo(false)}
                    className="text-[10px] text-[#C8B8A0] hover:text-[#E8A838] underline font-bold"
                  >
                    (Trancar)
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#F5E9D3] font-medium leading-relaxed">
              {isAdmin ? (
                <span>Você é <strong className="text-[#E8A838] font-black text-sm sm:text-base underline">Admin do Encontro Certo</strong>! Seu acesso aos Encontros a Cegas e ao app é <strong className="text-emerald-400 font-bold">100% ILIMITADO (Sem Limite de Usos)</strong>. 👑💛</span>
              ) : (
                <span>Você tem <strong className="text-[#E8A838] font-black text-sm sm:text-base underline">3 revelações de perfil GRÁTIS</strong> no Encontro a Cegas com Bots te esperando! 💛</span>
              )}
            </p>

            <div className="p-3 rounded-2xl bg-[#120F0D]/80 border border-[#382E24] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2 font-black text-[#F5E9D3]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  Usos disponíveis hoje:{' '}
                  <strong className="text-[#E8A838] text-sm">
                    {isAdmin ? '∞ ILIMITADOS (Modo Admin)' : `${availableBrindes} de 3`}
                  </strong>
                </span>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-[#E8A838] font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>⏳ Ev. Sexta ({formatDiffTime(getFridayEnd().getTime() - now.getTime())})</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                onClick={handleConsumeBrinde}
                className="w-full sm:w-auto px-6 py-3 golden-button rounded-2xl text-xs sm:text-sm font-black shadow-xl flex items-center justify-center space-x-2 hover:scale-105 active:scale-95 transition-transform"
              >
                <Gift className="w-4 h-4 text-[#120F0D]" />
                <span>{isAdmin ? '👑 Abrir Encontro a Cegas Ilimitado 💬' : 'Usar meus brindes (Encontro a Cegas) 🎁'}</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={handleGenerateAdminBot}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-800 to-amber-700 text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center space-x-1"
                >
                  <span>🔄 + Pretendente Admin</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DO ENCONTRO A CEGAS COM BOTS */}
      {showBlindModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-fadeIn">
          <div className="bg-[#1E1915] rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-[#E8A838] relative text-[#F5E9D3] my-auto">
            {/* Header Fixo */}
            <div className="p-4 sm:p-5 border-b border-[#382E24] flex items-center justify-between shrink-0 bg-[#1E1915] rounded-t-3xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E8A838] to-[#D1704A] flex items-center justify-center text-lg text-[#120F0D] font-black shadow-md">
                  🎭
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#F5E9D3] flex items-center space-x-1.5">
                    <span>Encontro a Cegas de Sexta</span>
                    <Sparkles className="w-4 h-4 text-[#E8A838]" />
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#E8A838] font-bold">
                    {isAdmin ? '👑 Acesso Admin: Usos Ilimitados (∞/3)' : `Brindes restantes: ${availableBrindes} de 3 🎁`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleGenerateAdminBot}
                    className="px-2.5 py-1 rounded-xl bg-[#2A231D] text-[#E8A838] border border-[#382E24] text-[11px] font-bold hover:bg-[#382E24]"
                    title="Adicionar novo pretendente para o teste Admin"
                  >
                    + Novo Bot 👑
                  </button>
                )}
                <button
                  onClick={() => setShowBlindModal(false)}
                  className="p-1.5 text-[#C8B8A0] hover:text-white rounded-full bg-[#120F0D] border border-[#382E24]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo com Scroll Próprio */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              <p className="text-xs text-[#C8B8A0] leading-relaxed">
                {isAdmin
                  ? 'Como Admin, você tem acesso ILIMITADO para conversar a cegas com quantos pretendentes quiser!'
                  : 'Escolha um dos candidatos misteriosos abaixo para iniciar o Encontro a Cegas de graça usando 1 brinde do evento!'}
              </p>

              <div className="space-y-4">
                {bots.map((b, idx) => (
                  <div
                    key={b.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      b.revelado
                        ? 'bg-gradient-to-r from-[#2A231D] to-[#1E1915] border-[#E8A838] shadow-md'
                        : 'bg-[#120F0D] border-[#382E24] hover:border-[#E8A838]/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Container da Foto Oculta ou Revelada */}
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-[#E8A838] shadow-md">
                        <img
                          src={b.foto}
                          alt="Candidato Misterioso"
                          className={`w-full h-full object-cover transition-all duration-700 ${
                            b.revelado ? 'blur-none scale-100' : 'blur-md scale-110 opacity-60'
                          }`}
                        />
                        {!b.revelado && (
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-1 text-center">
                            <Eye className="w-6 h-6 text-[#E8A838] animate-pulse mb-1" />
                            <span className="text-[9px] font-black uppercase text-[#E8A838]">Oculto</span>
                          </div>
                        )}
                      </div>

                      {/* Informações ou Pistas */}
                      <div className="flex-1 text-center sm:text-left space-y-1 min-w-0">
                        {b.revelado ? (
                          <>
                            <div className="flex items-center justify-center sm:justify-start space-x-2">
                              <h4 className="font-extrabold text-sm sm:text-base text-[#F5E9D3] truncate">{b.nome}, {b.idade}</h4>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 shrink-0">
                                Na Prosa 🎉
                              </span>
                            </div>
                            <p className="text-xs text-[#E8A838] font-semibold">{b.cidade}</p>
                            <p className="text-xs text-[#C8B8A0] leading-relaxed italic">"{b.bio}"</p>
                          </>
                        ) : (
                          <>
                            <h4 className="font-extrabold text-xs sm:text-sm text-[#E8A838] flex items-center justify-center sm:justify-start space-x-1">
                              <span>🎭 Candidato Misterioso #{idx + 1}</span>
                            </h4>
                            <p className="text-xs text-[#F5E9D3] leading-relaxed font-medium">
                              {b.pista}
                            </p>
                          </>
                        )}
                      </div>

                      {/* Botão de Ação */}
                      <div className="shrink-0 w-full sm:w-auto">
                        <button
                          onClick={() => handleSelectBotChat(b)}
                          disabled={!isAdmin && availableBrindes <= 0 && !b.revelado}
                          className="w-full px-4 py-2.5 golden-button rounded-xl text-xs font-black shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50"
                        >
                          <Gift className="w-4 h-4 text-[#120F0D]" />
                          <span>{isAdmin ? 'Conversar a Cegas 💬 (Admin Unlimited)' : 'Conversar a Cegas 💬 (1 Brinde)'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rodapé Fixo */}
            <div className="p-4 border-t border-[#382E24] bg-[#1E1915] rounded-b-3xl flex justify-center shrink-0">
              <button
                onClick={() => setShowBlindModal(false)}
                className="px-6 py-2.5 rounded-2xl bg-[#2A231D] text-[#C8B8A0] text-xs font-bold hover:bg-[#382E24] border border-[#382E24]"
              >
                Concluir e Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
