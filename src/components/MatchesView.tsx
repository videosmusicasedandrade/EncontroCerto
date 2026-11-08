import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, MessageCircle, Send, Image, Mic, Eye, Gift, Sparkles, 
  Check, CheckCheck, Coins, Search, ArrowDown, Download, Play, 
  Pause, RotateCcw, X, Clock, Calendar, Volume2, ShieldCheck, ChevronRight, 
  ArrowLeft, User, Info, MapPin, Ruler, Smile
} from 'lucide-react';
import { Match, UserProfile, Mensagem, CertcoinLote, EstadoConfig } from '../types';

interface MatchesViewProps {
  currentUser: UserProfile;
  estadoConfig: EstadoConfig;
  matches: Match[];
  mensagens: Mensagem[];
  lotes: CertcoinLote[];
  readReceipts: string[]; // IDs de conversas com leitura desbloqueada
  initialActiveMatchId?: string | null;
  onSendMessage: (
    destinatarioId: string, 
    conteudo: string, 
    tipo?: 'texto' | 'foto' | 'audio' | 'presente', 
    destacada?: boolean,
    extraData?: { imagem_url?: string; audio_duracao?: number; qtd_presente?: number }
  ) => void;
  onUnlockReadReceipt: (alvoId: string) => void;
  onSendGift: (alvoId: string, qtd: number) => void;
  onClearChatHistory?: (alvoId: string) => void;
  onResetDemoHistory?: () => void;
  onRevealBlindMatch?: (matchId: string) => void;
  onPassBlindMatch?: (matchId: string) => void;
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  currentUser,
  estadoConfig,
  matches,
  mensagens,
  lotes,
  readReceipts,
  initialActiveMatchId,
  onSendMessage,
  onUnlockReadReceipt,
  onSendGift,
  onClearChatHistory,
  onResetDemoHistory,
  onRevealBlindMatch,
  onPassBlindMatch,
}) => {
  // Inicia com initialActiveMatchId (se fornecido, ex: ao vir de Encontro a Cegas)
  // No celular (<768px), se não tiver initialActiveMatchId, inicia null para exibir a lista
  const [activeMatchId, setActiveMatchId] = useState<string | null>(() => {
    if (initialActiveMatchId) return initialActiveMatchId;
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return null;
    }
    return matches[0]?.id || null;
  });

  // Atualiza activeMatchId caso initialActiveMatchId mude
  useEffect(() => {
    if (initialActiveMatchId) {
      setActiveMatchId(initialActiveMatchId);
    }
  }, [initialActiveMatchId]);

  const [textoMensagem, setTextoMensagem] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [giftQtd, setGiftQtd] = useState(5);
  const [destacadaMode, setDestacadaMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filterMatchQuery, setFilterMatchQuery] = useState('');
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);
  const [showMatchProfileModal, setShowMatchProfileModal] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recordingTimerRef = useRef<number | null>(null);

  const activeMatch = matches.find((m) => m.id === activeMatchId);
  const outroUsuario = activeMatch?.outro_usuario;

  const totalCertcoins = lotes.reduce((acc, l) => acc + l.quantidade, 0);

  // Filtra todas as mensagens históricas trocadas entre o usuário atual e o contato selecionado
  const chatMensagens = mensagens
    .filter(
      (m) =>
        outroUsuario &&
        ((m.remetente_id === currentUser.id && m.destinatario_id === outroUsuario.id) ||
         (m.remetente_id === outroUsuario.id && m.destinatario_id === currentUser.id))
    )
    .sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime());

  const hasReadReceipt = outroUsuario ? readReceipts.includes(outroUsuario.id) : false;

  // Auto-scroll para a última mensagem somente quando solicitado pelo usuário ou ao enviar
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  // Ao abrir ou trocar de conversa, garante que tudo fique no topo:
  // a janela inteira sobe e o container de mensagens fica no início para ver o perfil e topo
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [activeMatchId]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isScrolledUp = container.scrollHeight - container.scrollTop - container.clientHeight > 140;
    setShowScrollBottomBtn(isScrolledUp);
  };

  const formatDateGroup = (isoString: string): string => {
    const msgDate = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);

    if (msgDate.toDateString() === today.toDateString()) {
      return 'Hoje';
    }
    if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }
    return msgDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getLastMessageForMatch = (userId: string) => {
    const msgs = mensagens.filter(
      (m) =>
        (m.remetente_id === currentUser.id && m.destinatario_id === userId) ||
        (m.remetente_id === userId && m.destinatario_id === currentUser.id)
    ).sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime());

    return msgs[msgs.length - 1] || null;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textoMensagem.trim() || !outroUsuario) return;

    if (destacadaMode && totalCertcoins < 4) {
      alert('Eita, mensagem destacada custa 4 Certcoins!');
      return;
    }

    onSendMessage(outroUsuario.id, textoMensagem, 'texto', destacadaMode);
    setTextoMensagem('');
    setDestacadaMode(false);

    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 2500);
    }, 800);
  };

  const handleUnlockReceiptClick = () => {
    if (!outroUsuario) return;
    if (totalCertcoins < 5) {
      alert('Eita, a confirmação de leitura custa 5 Certcoins!');
      return;
    }
    if (
      confirm(
        'Isso vai usar 5 Certcoins para desbloquear a confirmação de leitura PARA SEMPRE com essa pessoa. Deseja prosseguir?'
      )
    ) {
      onUnlockReadReceipt(outroUsuario.id);
    }
  };

  const handleGiftSubmit = () => {
    if (!outroUsuario || giftQtd <= 0) return;
    if (totalCertcoins < giftQtd) {
      alert('Eita, cê não tem Certcoins suficientes para esse presente!');
      return;
    }
    onSendGift(outroUsuario.id, giftQtd);
    setShowGiftModal(false);
  };

  const startAudioRecording = () => {
    setShowAudioRecorder(true);
    setRecordingSeconds(0);
    recordingTimerRef.current = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const cancelAudioRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setShowAudioRecorder(false);
    setRecordingSeconds(0);
  };

  const sendAudioRecording = () => {
    if (!outroUsuario) return;
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    const duration = Math.max(recordingSeconds, 3);
    onSendMessage(
      outroUsuario.id,
      `Mensagem de voz gravada (${duration}s)`,
      'audio',
      false,
      { audio_duracao: duration }
    );
    setShowAudioRecorder(false);
    setRecordingSeconds(0);
  };

  const sendPhoto = (url: string, legenda: string) => {
    if (!outroUsuario) return;
    onSendMessage(
      outroUsuario.id,
      legenda || 'Foto compartilhada',
      'foto',
      false,
      { imagem_url: url }
    );
    setShowPhotoModal(false);
  };

  const handleExportHistory = () => {
    if (!outroUsuario || chatMensagens.length === 0) return;

    let content = `====================================================\n`;
    content += `ENCONTRO CERTO BRASIL - HISTÓRICO DE PROSA\n`;
    content += `Conversa entre: ${currentUser.nome} e ${outroUsuario.nome}\n`;
    content += `Exportado em: ${new Date().toLocaleString('pt-BR')}\n`;
    content += `Total de mensagens: ${chatMensagens.length}\n`;
    content += `====================================================\n\n`;

    chatMensagens.forEach((msg) => {
      const sender = msg.remetente_id === currentUser.id ? currentUser.nome : outroUsuario.nome;
      const dataHora = new Date(msg.criado_em).toLocaleString('pt-BR');
      const tipo = msg.tipo !== 'texto' ? ` [${msg.tipo.toUpperCase()}]` : '';
      const dest = msg.destacada ? ' [⭐ DESTACADA]' : '';
      content += `[${dataHora}] ${sender}${tipo}${dest}: ${msg.conteudo}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prosa_${outroUsuario.nome.toLowerCase().replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredChatMensagens = searchQuery.trim()
    ? chatMensagens.filter((m) => m.conteudo.toLowerCase().includes(searchQuery.toLowerCase()))
    : chatMensagens;

  const filteredMatches = matches.filter((m) => {
    if (!filterMatchQuery.trim()) return true;
    return m.outro_usuario?.nome.toLowerCase().includes(filterMatchQuery.toLowerCase()) ||
           m.outro_usuario?.cidade.toLowerCase().includes(filterMatchQuery.toLowerCase());
  });

  const quickPhotos = [
    {
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      title: 'Café com pão de queijo',
      desc: 'Olha que delícia de café da tarde! ☕🧀',
    },
    {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      title: 'Pôr do sol na serra',
      desc: 'Final de tarde lindo demais hoje!',
    },
    {
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      title: 'Passeio histórico',
      desc: 'Caminhando pelas ruazinhas de pedra 🏛️',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-1 sm:py-6 px-1 sm:px-4 pb-16 md:pb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6 bg-[#1E1915] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-[#382E24] h-[calc(100dvh-125px)] md:h-[calc(100vh-140px)] min-h-[460px]">
        
        {/* Matches Sidebar - Hidden on mobile if active match is selected */}
        <div className={`border-r border-[#382E24] flex flex-col h-full bg-[#1E1915] ${activeMatchId ? 'hidden md:flex' : 'flex'}`}>
          {/* Header da Sidebar */}
          <div className="p-4 border-b border-[#382E24] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-base sm:text-lg text-[#F5E9D3] flex items-center space-x-2">
                <Heart className="w-5 h-5 text-[#E8A838] fill-[#E8A838]" />
                <span>Matches & Conversas</span>
              </h2>
              {onResetDemoHistory && (
                <button
                  onClick={onResetDemoHistory}
                  className="text-[11px] font-bold text-[#E8A838] hover:underline flex items-center space-x-1"
                  title="Restaurar histórico demonstrativo"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar</span>
                </button>
              )}
            </div>

            {/* Campo de Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#C8B8A0]" />
              <input
                type="text"
                value={filterMatchQuery}
                onChange={(e) => setFilterMatchQuery(e.target.value)}
                placeholder="Filtrar matches e conversas..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#120F0D] border border-[#382E24] text-xs text-[#F5E9D3] placeholder-[#C8B8A0]/60 focus:outline-none focus:ring-1 focus:ring-[#E8A838]"
              />
            </div>
          </div>

          {/* Carrossel de Novos Matches (Estilo Tinder / Instagram DMs) */}
          <div className="p-3 border-b border-[#382E24] bg-[#120F0D]">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-xs font-extrabold text-[#E8A838] flex items-center space-x-1 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Novos Matches ({matches.length})</span>
              </h3>
              <span className="text-[10px] text-[#C8B8A0]">Escolha quem prosear</span>
            </div>
            
            <div className="flex items-center space-x-3 overflow-x-auto pb-1 scrollbar-none">
              {matches.length === 0 ? (
                <p className="text-[11px] text-[#C8B8A0] py-2">Nenhum match ainda. Curta pessoas no Descobrir!</p>
              ) : (
                matches.map((m) => {
                  const u = m.outro_usuario;
                  if (!u) return null;
                  const isSelected = m.id === activeMatchId;
                  const isBlindUnrevealed = m.isEncontroACegas && !m.isRevelado;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setActiveMatchId(m.id)}
                      className="flex flex-col items-center space-y-1 shrink-0 group focus:outline-none"
                      title={isBlindUnrevealed ? `Encontro a Cegas com ${u.nome}` : `Conversar com ${u.nome}`}
                    >
                      <div className={`relative p-0.5 rounded-full transition-transform group-hover:scale-105 ${
                        isSelected 
                          ? 'ring-2 ring-[#E8A838] bg-gradient-to-tr from-[#E8A838] to-[#D1704A]' 
                          : 'ring-2 ring-[#382E24] hover:ring-[#E8A838]'
                      }`}>
                        <img
                          src={u.foto}
                          alt={u.nome}
                          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-[#1E1915] ${
                            isBlindUnrevealed ? 'blind-face-blur overflow-hidden' : ''
                          }`}
                        />
                        {isBlindUnrevealed ? (
                          <span className="absolute bottom-0 right-0 text-[10px] bg-[#E8A838] text-[#120F0D] rounded-full w-4 h-4 flex items-center justify-center font-bold border border-[#1E1915]">
                            🎭
                          </span>
                        ) : (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#1E1915] rounded-full" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[#F5E9D3] truncate max-w-[64px]">
                        {isBlindUnrevealed ? '🎭 Cegas' : u.nome.split(' ')[0]}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Lista de Conversas Recentes */}
          <div className="overflow-y-auto flex-1 p-2 sm:p-3 space-y-1.5">
            <h3 className="text-[11px] font-extrabold text-[#C8B8A0] uppercase tracking-wider px-2 pt-1 pb-1">
              Conversas Recentes
            </h3>

            {filteredMatches.length === 0 ? (
              <div className="text-center py-12 text-[#C8B8A0] px-4">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#E8A838] opacity-60" />
                <p className="text-xs">Nenhum resultado para a busca.</p>
              </div>
            ) : (
              filteredMatches.map((m) => {
                const u = m.outro_usuario;
                if (!u) return null;
                const isActive = m.id === activeMatchId;
                const lastMsg = getLastMessageForMatch(u.id);
                const isBlindUnrevealed = m.isEncontroACegas && !m.isRevelado;

                return (
                  <div
                    key={m.id}
                    onClick={() => setActiveMatchId(m.id)}
                    className={`flex items-center space-x-3 p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] font-medium shadow-md'
                        : 'hover:bg-[#2A231D] text-[#F5E9D3]'
                    }`}
                  >
                    <div className="relative shrink-0 overflow-hidden rounded-full">
                      <img
                        src={u.foto}
                        alt={u.nome}
                        className={`w-12 h-12 rounded-full object-cover border-2 border-[#E8A838]/40 shadow-xs ${
                          isBlindUnrevealed ? 'blind-face-blur' : ''
                        }`}
                      />
                      {isBlindUnrevealed ? (
                        <span className="absolute bottom-0 right-0 text-[10px] bg-[#E8A838] text-[#120F0D] rounded-full w-4 h-4 flex items-center justify-center font-bold border border-[#1E1915]">
                          🎭
                        </span>
                      ) : (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#1E1915] rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-bold text-xs sm:text-sm truncate flex items-center space-x-1 ${isActive ? 'text-[#120F0D]' : 'text-[#F5E9D3]'}`}>
                          <span>{u.nome}</span>
                          {isBlindUnrevealed && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-[#E8A838]/20 text-[#E8A838] rounded-md font-bold shrink-0">
                              🎭 Cegas
                            </span>
                          )}
                        </h4>
                        {lastMsg && (
                          <span className={`text-[10px] shrink-0 ${isActive ? 'text-[#120F0D]/80' : 'text-[#C8B8A0]'}`}>
                            {new Date(lastMsg.criado_em).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-[#120F0D]/80' : 'text-[#C8B8A0]'}`}>
                        {lastMsg ? (
                          <>
                            {lastMsg.remetente_id === currentUser.id ? 'Você: ' : ''}
                            {lastMsg.tipo === 'foto' ? '📷 Foto' : lastMsg.tipo === 'audio' ? '🎤 Áudio' : lastMsg.tipo === 'presente' ? '🎁 Presente' : lastMsg.conteudo}
                          </>
                        ) : (
                          `${u.cidade} • Clique para prosear 💛`
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area - Full screen on mobile when active match is selected */}
        <div className={`md:col-span-2 flex flex-col h-full min-h-0 bg-[#120F0D] relative ${!activeMatchId ? 'hidden md:flex' : 'flex'}`}>
          {outroUsuario ? (
            <>
              {/* Chat Header com Perfil Clicável */}
              <div className="p-3 sm:p-4 bg-[#1E1915] border-b border-[#382E24] flex items-center justify-between shrink-0 shadow-md z-10">
                <div className="flex items-center space-x-2.5 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setActiveMatchId(null)}
                    className="md:hidden p-1.5 rounded-xl bg-[#2A231D] text-[#E8A838] hover:bg-[#382E24] transition-colors mr-1 shrink-0"
                    title="Voltar para a lista de conversas"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Clicável: Perfil do usuário em destaque */}
                  <div
                    onClick={() => setShowMatchProfileModal(true)}
                    className="flex items-center space-x-2.5 cursor-pointer hover:opacity-90 transition-opacity min-w-0 group"
                    title="Clique para ver o perfil completo"
                  >
                    <div className="relative shrink-0 overflow-hidden rounded-full">
                      <img
                        src={outroUsuario.foto}
                        alt={outroUsuario.nome}
                        className={`w-11 h-11 rounded-full object-cover border-2 border-[#E8A838] group-hover:scale-105 transition-transform ${
                          activeMatch?.isEncontroACegas && !activeMatch?.isRevelado ? 'blind-face-blur' : ''
                        }`}
                      />
                      {activeMatch?.isEncontroACegas && !activeMatch?.isRevelado ? (
                        <span className="absolute bottom-0 right-0 text-[10px] bg-[#E8A838] text-[#120F0D] rounded-full w-4 h-4 flex items-center justify-center font-bold border border-[#1E1915]">
                          🎭
                        </span>
                      ) : (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#1E1915] rounded-full" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[#F5E9D3] group-hover:text-[#E8A838] transition-colors flex items-center space-x-1.5 truncate">
                        <span className="truncate">{outroUsuario.nome}</span>
                        <span className="text-xs text-[#E8A838]">, {outroUsuario.idade}</span>
                        {activeMatch?.isEncontroACegas && !activeMatch?.isRevelado ? (
                          <span className="text-[10px] px-2 py-0.5 bg-[#E8A838] text-[#120F0D] rounded-full font-black ml-1">
                            🎭 Encontro a Cegas
                          </span>
                        ) : (
                          <Info className="w-3.5 h-3.5 text-[#E8A838] shrink-0 ml-1" />
                        )}
                      </h3>
                      <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-medium truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="truncate">
                          {activeMatch?.isEncontroACegas && !activeMatch?.isRevelado
                            ? 'Foto Oculta • Proseie para se conhecerem 💛'
                            : `${outroUsuario.cidade} • Toque p/ ver perfil 👤`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Header Action Tools */}
                <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                  {/* Ver Perfil Modal */}
                  <button
                    onClick={() => setShowMatchProfileModal(true)}
                    className="p-2 rounded-xl bg-[#2A231D] text-[#E8A838] hover:bg-[#382E24] transition-colors flex items-center space-x-1 text-xs font-bold"
                    title="Ver Perfil Completo"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">Perfil</span>
                  </button>

                  {/* Busca no Histórico */}
                  <button
                    onClick={() => {
                      setShowSearch(!showSearch);
                      if (showSearch) setSearchQuery('');
                    }}
                    className={`p-2 rounded-xl transition-colors ${
                      showSearch
                        ? 'bg-[#E8A838] text-[#120F0D]'
                        : 'bg-[#2A231D] text-[#F5E9D3] hover:bg-[#382E24]'
                    }`}
                    title="Buscar palavras no histórico"
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  {/* Confirmação de Leitura (5 Certcoins) */}
                  <button
                    onClick={handleUnlockReceiptClick}
                    className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                      hasReadReceipt
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                        : 'bg-[#2A231D] text-[#E8A838] hover:bg-[#382E24] border border-[#382E24]'
                    }`}
                    title="Confirmação de Leitura (5 Certcoins - Permanente nesta conversa)"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {hasReadReceipt ? 'Leitura Ativa 👁️' : 'Leitura (5 🪙)'}
                    </span>
                  </button>

                  {/* Enviar Presente */}
                  <button
                    onClick={() => setShowGiftModal(true)}
                    className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] font-bold text-[11px] sm:text-xs hover:opacity-95 transition-all shadow-xs"
                    title="Enviar carinho em Certcoins"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Presente 💛</span>
                  </button>

                  {/* Exportar histórico */}
                  <button
                    onClick={handleExportHistory}
                    className="p-2 rounded-xl bg-[#2A231D] text-[#F5E9D3] hover:bg-[#382E24] transition-colors"
                    title="Baixar histórico da conversa (.txt)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* BARRA FIXA DO ENCONTRO A CEGAS (REVELAR / PASSAR) */}
              {activeMatch?.isEncontroACegas && !activeMatch?.isRevelado && (
                <div className="bg-gradient-to-r from-[#2A231D] via-[#382E24] to-[#2A231D] border-b border-[#E8A838]/40 px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-inner z-10 shrink-0 animate-fadeIn">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-[#E8A838]/20 border border-[#E8A838]/40 flex items-center justify-center text-base">
                      🎭
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#E8A838] flex items-center space-x-1">
                        <span>ENCONTRO A CEGAS EM ANDAMENTO</span>
                      </div>
                      <div className="text-[11px] text-[#C8B8A0]">
                        Converse à vontade sem foto! Decida quando quiser:
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end mt-1 sm:mt-0">
                    <button
                      onClick={() => onPassBlindMatch && activeMatch && onPassBlindMatch(activeMatch.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-950/90 text-red-300 border border-red-700/50 hover:bg-red-900 font-bold text-xs transition-colors shadow-xs"
                    >
                      ❌ Passar Pretendente
                    </button>
                    <button
                      onClick={() => onRevealBlindMatch && activeMatch && onRevealBlindMatch(activeMatch.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] font-extrabold text-xs shadow-md hover:scale-102 transition-all flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#120F0D] fill-[#120F0D]" />
                      <span>💖 Revelar Pretendente</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Barra de Busca no Histórico Expandível */}
              {showSearch && (
                <div className="bg-[#1E1915] border-b border-[#382E24] px-4 py-2 flex items-center justify-between gap-3 shrink-0 animate-fadeIn">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#C8B8A0]" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Pesquisar mensagens antigas ou recentes..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#120F0D] border border-[#382E24] text-xs text-[#F5E9D3] focus:outline-none focus:ring-1 focus:ring-[#E8A838]"
                    />
                  </div>
                  <span className="text-[11px] text-[#C8B8A0] font-semibold whitespace-nowrap">
                    {filteredChatMensagens.length} {filteredChatMensagens.length === 1 ? 'mensagem' : 'mensagens'}
                  </span>
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                    className="p-1 rounded-lg text-[#C8B8A0] hover:text-[#F5E9D3]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Messages History List Container */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-3 sm:p-4 space-y-4 bg-[#120F0D]"
              >
                {/* Top of Chat History Banner com Botão de Perfil */}
                <div className="text-center py-5 px-4 my-2 border border-dashed border-[#382E24] bg-[#1E1915]/80 rounded-3xl shadow-sm">
                  <div
                    onClick={() => setShowMatchProfileModal(true)}
                    className="w-16 h-16 rounded-full mx-auto relative cursor-pointer group mb-2 overflow-hidden"
                  >
                    <img
                      src={outroUsuario.foto}
                      alt={outroUsuario.nome}
                      className={`w-16 h-16 rounded-full object-cover border-2 border-[#E8A838] shadow-md group-hover:scale-105 transition-transform ${
                        activeMatch?.isEncontroACegas && !activeMatch?.isRevelado ? 'blind-face-blur' : ''
                      }`}
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h4 className="font-extrabold text-sm text-[#F5E9D3]">
                    {activeMatch?.isEncontroACegas && !activeMatch?.isRevelado ? (
                      `Encontro a Cegas com ${outroUsuario.nome} 🎭`
                    ) : (
                      `Prosa com ${outroUsuario.nome}, ${outroUsuario.idade} anos 💛`
                    )}
                  </h4>
                  <p className="text-xs text-[#C8B8A0] mt-1 max-w-sm mx-auto">
                    {activeMatch?.isEncontroACegas && !activeMatch?.isRevelado ? (
                      'Vocês estão no Encontro a Cegas de Sexta-Feira! Proseiem à vontade e revelem o perfil quando der sintonia.'
                    ) : (
                      'Vocês deram match no Encontro Certo Brasil. Todas as conversas ficam salvas com carinho.'
                    )}
                  </p>

                  <div className="flex items-center justify-center space-x-2 mt-3">
                    {activeMatch?.isEncontroACegas && !activeMatch?.isRevelado ? (
                      <>
                        <button
                          onClick={() => onPassBlindMatch && activeMatch && onPassBlindMatch(activeMatch.id)}
                          className="px-3 py-1.5 rounded-xl bg-red-950/80 text-red-300 border border-red-700/50 text-xs font-bold hover:bg-red-900 transition-colors"
                        >
                          ❌ Passar
                        </button>
                        <button
                          onClick={() => onRevealBlindMatch && activeMatch && onRevealBlindMatch(activeMatch.id)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] text-xs font-black shadow hover:opacity-95 transition-all flex items-center space-x-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 fill-[#120F0D]" />
                          <span>💖 Revelar Pretendente</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowMatchProfileModal(true)}
                        className="px-3 py-1.5 rounded-xl bg-[#2A231D] text-[#E8A838] border border-[#382E24] text-xs font-bold hover:bg-[#382E24] transition-colors flex items-center space-x-1"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Ver Perfil Completo</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Renderização das mensagens */}
                {filteredChatMensagens.length === 0 ? (
                  <div className="text-center py-8 text-[#C8B8A0] text-xs">
                    {searchQuery ? 'Nenhuma mensagem encontrada com esse termo.' : 'Envie a primeira mensagem para começar a prosa!'}
                  </div>
                ) : (
                  filteredChatMensagens.map((msg, idx) => {
                    const isMe = msg.remetente_id === currentUser.id;
                    const prevMsg = filteredChatMensagens[idx - 1];
                    const isNewDate = !prevMsg || formatDateGroup(msg.criado_em) !== formatDateGroup(prevMsg.criado_em);

                    return (
                      <React.Fragment key={msg.id}>
                        {/* Divisor de Data no Histórico */}
                        {isNewDate && (
                          <div className="flex items-center justify-center my-4">
                            <span className="px-3 py-1 bg-[#2A231D] text-[#E8A838] rounded-full text-[10px] font-extrabold shadow-sm border border-[#382E24]">
                              {formatDateGroup(msg.criado_em)}
                            </span>
                          </div>
                        )}

                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[85%] sm:max-w-md rounded-2xl p-3.5 text-sm shadow-md transition-all relative group ${
                              isMe
                                ? 'bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] font-medium rounded-br-xs'
                                : 'bg-[#1E1915] text-[#F5E9D3] rounded-bl-xs border border-[#382E24]'
                            } ${msg.destacada ? 'ring-2 ring-[#E8A838] shadow-lg' : ''}`}
                          >
                            {/* Selo de Mensagem Destacada */}
                            {msg.destacada && (
                              <div className={`flex items-center space-x-1 text-[10px] font-extrabold uppercase mb-1.5 pb-1 border-b ${
                                isMe ? 'text-[#120F0D] border-[#120F0D]/20' : 'text-[#E8A838] border-[#382E24]'
                              }`}>
                                <Sparkles className="w-3 h-3" />
                                <span>Mensagem Destacada (4 Certcoins)</span>
                              </div>
                            )}

                            {/* Renderização de Foto */}
                            {msg.tipo === 'foto' && (
                              <div className="mb-2 rounded-xl overflow-hidden cursor-pointer" onClick={() => setSelectedPhotoPreview(msg.imagem_url || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80')}>
                                <img
                                  src={msg.imagem_url || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'}
                                  alt="Foto enviada"
                                  className="w-full max-h-60 object-cover rounded-xl hover:scale-102 transition-transform"
                                />
                              </div>
                            )}

                            {/* Renderização de Mensagem de Áudio */}
                            {msg.tipo === 'audio' && (
                              <div className="flex items-center space-x-3 py-1 px-1">
                                <button
                                  type="button"
                                  onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
                                    isMe
                                      ? 'bg-[#120F0D] text-[#E8A838] shadow-xs'
                                      : 'bg-[#E8A838] text-[#120F0D] shadow-xs'
                                  }`}
                                >
                                  {playingAudioId === msg.id ? (
                                    <Pause className="w-4 h-4 fill-current" />
                                  ) : (
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                  )}
                                </button>
                                <div className="flex-1">
                                  {/* Waveform animada */}
                                  <div className="flex items-center space-x-1 h-5">
                                    {[12, 24, 16, 28, 20, 10, 26, 18, 14, 22].map((height, i) => (
                                      <div
                                        key={i}
                                        style={{ height: `${playingAudioId === msg.id ? (i % 2 === 0 ? 22 : 12) : height}px` }}
                                        className={`w-1 rounded-full transition-all duration-200 ${
                                          isMe ? 'bg-[#120F0D]' : 'bg-[#E8A838]'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <div className={`text-[10px] mt-0.5 font-bold ${isMe ? 'text-[#120F0D]/80' : 'text-[#C8B8A0]'}`}>
                                    {playingAudioId === msg.id ? 'Reproduzindo...' : `Áudio (${msg.audio_duracao || 12}s)`}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Renderização de Presente */}
                            {msg.tipo === 'presente' && (
                              <div className={`p-3 rounded-xl border mb-1 flex items-center space-x-3 ${
                                isMe ? 'bg-[#120F0D]/20 border-[#120F0D]/30 text-[#120F0D]' : 'bg-[#2A231D] border-[#382E24] text-[#F5E9D3]'
                              }`}>
                                <div className="w-10 h-10 rounded-2xl bg-[#E8A838] text-[#120F0D] flex items-center justify-center font-black shadow-xs">
                                  <Gift className="w-5 h-5" />
                                </div>
                                <div>
                                  <span className="block font-black text-xs">
                                    Presente de {msg.qtd_presente || 5} Certcoins 💛
                                  </span>
                                  <span className={`text-[10px] ${isMe ? 'text-[#120F0D]/80' : 'text-[#C8B8A0]'}`}>
                                    Carinho enviado com carinho
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Conteúdo textual */}
                            {msg.tipo !== 'audio' && (
                              <p className="whitespace-pre-wrap leading-relaxed">{msg.conteudo}</p>
                            )}

                            {/* Rodapé da Mensagem */}
                            <div
                              className={`flex items-center justify-end space-x-1.5 text-[10px] mt-1 pt-0.5 ${
                                isMe ? 'text-[#120F0D]/80' : 'text-[#C8B8A0]'
                              }`}
                            >
                              <span>
                                {new Date(msg.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMe && (
                                hasReadReceipt || msg.lido_em ? (
                                  <span title="Mensagem lida">
                                    <CheckCheck className="w-3.5 h-3.5 text-[#120F0D]" />
                                  </span>
                                ) : (
                                  <span title="Entregue">
                                    <Check className="w-3.5 h-3.5 text-[#120F0D]/70" />
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}

                {/* Indicador de Digitação em Tempo Real */}
                {isTyping && (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="bg-[#1E1915] border border-[#382E24] p-3 rounded-2xl text-xs text-[#C8B8A0] italic flex items-center space-x-2 shadow-xs">
                      <div className="flex space-x-1">
                        <span className="w-1.5 h-1.5 bg-[#E8A838] rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-[#E8A838] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-[#E8A838] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                      <span>{outroUsuario.nome} está digitando uma prosa…</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Botão Flutuante: Rolar para o fim */}
              {showScrollBottomBtn && (
                <button
                  onClick={() => scrollToBottom(true)}
                  className="absolute bottom-24 right-6 p-2.5 bg-[#E8A838] text-[#120F0D] rounded-full shadow-lg hover:bg-[#F0C040] transition-all flex items-center space-x-1.5 text-xs font-bold animate-bounce z-20"
                >
                  <ArrowDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Última mensagem</span>
                </button>
              )}

              {/* Gravador de Áudio Ativo */}
              {showAudioRecorder && (
                <div className="p-3 bg-[#1E1915] border-t border-[#382E24] flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#E8A838]">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                    <span>Gravando voz... ({recordingSeconds}s)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={cancelAudioRecording}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#C8B8A0] bg-[#2A231D] border border-[#382E24]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={sendAudioRecording}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold text-[#120F0D] bg-[#E8A838] shadow-sm"
                    >
                      Enviar Áudio 🎤
                    </button>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 sm:p-4 bg-[#1E1915] border-t border-[#382E24] shrink-0">
                {destacadaMode && (
                  <div className="mb-2 p-2 bg-[#2A231D] text-[#E8A838] text-xs rounded-xl flex items-center justify-between border border-[#382E24]">
                    <span className="flex items-center space-x-1 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-[#E8A838]" />
                      <span>Mensagem Destacada (4 Certcoins)</span>
                    </span>
                    <button onClick={() => setDestacadaMode(false)} className="font-bold underline text-xs">
                      Cancelar
                    </button>
                  </div>
                )}

                <form onSubmit={handleSend} className="flex items-center space-x-2">
                  {/* Botão Foto */}
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="p-2.5 rounded-xl bg-[#2A231D] text-[#C8B8A0] hover:text-[#E8A838] border border-[#382E24] transition-colors"
                    title="Enviar foto para o histórico"
                  >
                    <Image className="w-5 h-5" />
                  </button>

                  {/* Botão Gravar Áudio */}
                  <button
                    type="button"
                    onClick={startAudioRecording}
                    className="p-2.5 rounded-xl bg-[#2A231D] text-[#C8B8A0] hover:text-[#E8A838] border border-[#382E24] transition-colors"
                    title="Gravar mensagem de voz"
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  {/* Botão Destacar */}
                  <button
                    type="button"
                    onClick={() => setDestacadaMode(!destacadaMode)}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      destacadaMode
                        ? 'bg-[#E8A838] text-[#120F0D] border-[#E8A838]'
                        : 'bg-[#2A231D] text-[#C8B8A0] border-[#382E24] hover:text-[#E8A838]'
                    }`}
                    title="Destacar Mensagem no histórico (4 Certcoins)"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>

                  {/* Campo de Texto */}
                  <input
                    type="text"
                    value={textoMensagem}
                    onChange={(e) => setTextoMensagem(e.target.value)}
                    placeholder="Escreva sua prosa aqui..."
                    className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl bg-[#120F0D] border border-[#382E24] text-sm text-[#F5E9D3] placeholder-[#C8B8A0]/60 focus:outline-none focus:ring-2 focus:ring-[#E8A838]"
                  />

                  {/* Botão Enviar */}
                  <button
                    type="submit"
                    disabled={!textoMensagem.trim()}
                    className="p-2.5 sm:p-3 bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] font-bold rounded-xl shadow hover:opacity-95 transition-all disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#C8B8A0]">
              <MessageCircle className="w-16 h-16 mb-3 text-[#E8A838] opacity-40" />
              <h3 className="font-extrabold text-base text-[#F5E9D3] mb-1">Escolha um Match para prosear 💛</h3>
              <p className="text-xs text-[#C8B8A0] max-w-sm">
                Selecione uma das pessoas da lista ao lado ou toque em um dos novos matches no topo!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Perfil do Match (Padrão Tinder / Instagram) */}
      {showMatchProfileModal && outroUsuario && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1E1915] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#382E24] relative">
            {/* Fechar Button */}
            <button
              onClick={() => setShowMatchProfileModal(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner com Foto de Capa / Perfil */}
            <div className="relative h-72 sm:h-80 w-full overflow-hidden">
              <img
                src={outroUsuario.foto}
                alt={outroUsuario.nome}
                className={`w-full h-full object-cover ${
                  activeMatch?.isEncontroACegas && !activeMatch?.isRevelado ? 'blind-face-blur-deep' : ''
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E1915] via-[#1E1915]/40 to-transparent" />
              
              {/* Badge de Estado no topo da foto */}
              <div className="absolute top-4 left-4 bg-[#120F0D]/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#E8A838] border border-[#382E24] flex items-center space-x-1">
                <span>{estadoConfig.emblem || '📍'}</span>
                <span>{outroUsuario.estado_sigla || estadoConfig.sigla}</span>
              </div>

              {/* Informações Básicas sobre a imagem */}
              <div className="absolute bottom-4 left-4 right-4 text-[#F5E9D3]">
                {activeMatch?.isEncontroACegas && !activeMatch?.isRevelado && (
                  <div className="inline-flex items-center space-x-1 text-[11px] font-black bg-[#E8A838] text-[#120F0D] px-2.5 py-0.5 rounded-full mb-1">
                    <span>🎭 ENCONTRO A CEGAS</span>
                  </div>
                )}
                <h2 className="text-2xl font-black flex items-center space-x-2">
                  <span>{outroUsuario.nome}</span>
                  <span className="text-[#E8A838] font-semibold">, {outroUsuario.idade}</span>
                </h2>
                <div className="flex items-center space-x-2 text-xs text-[#C8B8A0] mt-1">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-[#E8A838]" />
                    <span>{outroUsuario.cidade}</span>
                  </span>
                  <span>•</span>
                  <span>{outroUsuario.raio_busca || 25} km de distância</span>
                </div>
              </div>
            </div>

            {/* Conteúdo Detalhado do Perfil */}
            <div className="p-5 space-y-4 text-xs text-[#F5E9D3]">
              {/* Sobre Mim / Bio */}
              <div className="space-y-1.5 bg-[#120F0D] p-3.5 rounded-2xl border border-[#382E24]">
                <h4 className="font-extrabold text-[#E8A838] flex items-center space-x-1 text-xs">
                  <Smile className="w-4 h-4" />
                  <span>Sobre mim</span>
                </h4>
                <p className="text-[#C8B8A0] leading-relaxed">
                  {outroUsuario.descricao || 'Adoro tomar um bom café da tarde, prosear na praça e aproveitar a vida com leveza ☕💛'}
                </p>
              </div>

              {/* Atributos / Badges */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#2A231D] p-3 rounded-xl border border-[#382E24] flex items-center space-x-2">
                  <Ruler className="w-4 h-4 text-[#E8A838]" />
                  <div>
                    <span className="block text-[10px] text-[#C8B8A0]">Altura</span>
                    <span className="font-bold text-[#F5E9D3]">{outroUsuario.altura ? `${outroUsuario.altura} cm` : '1.70 m'}</span>
                  </div>
                </div>

                <div className="bg-[#2A231D] p-3 rounded-xl border border-[#382E24] flex items-center space-x-2">
                  <User className="w-4 h-4 text-[#E8A838]" />
                  <div>
                    <span className="block text-[10px] text-[#C8B8A0]">Tipo Corporal</span>
                    <span className="font-bold text-[#F5E9D3]">{outroUsuario.tipo_corporal || 'Atlético'}</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação Direta no Modal */}
              {activeMatch?.isEncontroACegas && !activeMatch?.isRevelado ? (
                <div className="pt-2 flex space-x-2">
                  <button
                    onClick={() => {
                      setShowMatchProfileModal(false);
                      if (activeMatch && onPassBlindMatch) {
                        onPassBlindMatch(activeMatch.id);
                      }
                    }}
                    className="flex-1 py-3 rounded-xl bg-red-950/90 text-red-300 border border-red-700/50 font-bold text-xs hover:bg-red-900 transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>❌ Passar Pretendente</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMatchProfileModal(false);
                      if (activeMatch && onRevealBlindMatch) {
                        onRevealBlindMatch(activeMatch.id);
                      }
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-[#120F0D] fill-[#120F0D]" />
                    <span>💖 Revelar Pretendente</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 flex space-x-2">
                  <button
                    onClick={() => {
                      setShowMatchProfileModal(false);
                      setShowGiftModal(true);
                    }}
                    className="flex-1 py-3 rounded-xl bg-[#2A231D] text-[#E8A838] border border-[#382E24] font-bold text-xs hover:bg-[#382E24] transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Mandar Presente</span>
                  </button>

                  <button
                    onClick={() => setShowMatchProfileModal(false)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center space-x-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Prosear Agora</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Enviar Presente */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1915] rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-[#382E24] space-y-4">
            <div className="w-14 h-14 bg-[#2A231D] rounded-full flex items-center justify-center mx-auto text-[#E8A838]">
              <Gift className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#F5E9D3]">
              Enviar Presente em Certcoins 💛
            </h3>
            <p className="text-xs text-[#C8B8A0]">
              Quantos Certcoins você quer enviar de carinho para {outroUsuario?.nome}? Ficará registrado na prosa!
            </p>
            <input
              type="number"
              min={1}
              value={giftQtd}
              onChange={(e) => setGiftQtd(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#382E24] bg-[#120F0D] text-center font-bold text-lg text-[#F5E9D3]"
            />
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowGiftModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#2A231D] font-bold text-xs text-[#C8B8A0] border border-[#382E24]"
              >
                Cancelar
              </button>
              <button
                onClick={handleGiftSubmit}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] font-bold text-xs shadow"
              >
                Enviar Carinho 🎁
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Enviar Foto Rápida */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1915] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#382E24] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F5E9D3] flex items-center space-x-2">
                <Image className="w-5 h-5 text-[#E8A838]" />
                <span>Compartilhar Foto no Chat</span>
              </h3>
              <button onClick={() => setShowPhotoModal(false)} className="p-1 rounded-lg text-[#C8B8A0] hover:text-[#F5E9D3]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#C8B8A0]">Escolha uma foto de exemplo para enviar ao histórico:</p>
            <div className="grid grid-cols-3 gap-2">
              {quickPhotos.map((photo, i) => (
                <div
                  key={i}
                  onClick={() => sendPhoto(photo.url, photo.desc)}
                  className="rounded-xl overflow-hidden border border-[#382E24] cursor-pointer hover:border-[#E8A838] transition-colors group relative"
                >
                  <img src={photo.url} alt={photo.title} className="w-full h-24 object-cover" />
                  <div className="p-1.5 text-[10px] font-bold text-center bg-[#120F0D] text-[#F5E9D3] truncate">
                    {photo.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Visualizar Foto em Tamanho Maior */}
      {selectedPhotoPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhotoPreview(null)}
        >
          <div className="max-w-xl w-full relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhotoPreview(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-[#E8A838]"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedPhotoPreview}
              alt="Visualização"
              className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-[#382E24]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
