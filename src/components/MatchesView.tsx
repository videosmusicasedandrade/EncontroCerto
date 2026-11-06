import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, MessageCircle, Send, Image, Mic, Eye, Gift, Sparkles, 
  Check, CheckCheck, Coins, Search, ArrowDown, Download, Play, 
  Pause, RotateCcw, X, Clock, Calendar, Volume2, ShieldCheck, ChevronRight
} from 'lucide-react';
import { Match, UserProfile, Mensagem, CertcoinLote, EstadoConfig } from '../types';

interface MatchesViewProps {
  currentUser: UserProfile;
  estadoConfig: EstadoConfig;
  matches: Match[];
  mensagens: Mensagem[];
  lotes: CertcoinLote[];
  readReceipts: string[]; // IDs de conversas com leitura desbloqueada
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
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  currentUser,
  matches,
  mensagens,
  lotes,
  readReceipts,
  onSendMessage,
  onUnlockReadReceipt,
  onSendGift,
  onClearChatHistory,
  onResetDemoHistory,
}) => {
  const [activeMatchId, setActiveMatchId] = useState<string | null>(matches[0]?.id || null);
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

  // Auto-scroll para a última mensagem ao trocar de contato ou enviar mensagem
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [activeMatchId]);

  useEffect(() => {
    // Se estiver perto do fim, rola automaticamente para acompanhar a nova mensagem
    const container = messagesContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 180;
      if (isNearBottom) {
        scrollToBottom(true);
      }
    }
  }, [chatMensagens.length, isTyping]);

  // Monitora a rolagem para mostrar o botão de "Ir para o fim" quando o usuário rolar para cima para ver o histórico
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isScrolledUp = container.scrollHeight - container.scrollTop - container.clientHeight > 140;
    setShowScrollBottomBtn(isScrolledUp);
  };

  // Helper para formatar grupos de data no histórico
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

  // Helper para obter a última mensagem de um match para exibir na sidebar
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

    // Simula indicador de digitação do contato no histórico
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

  // Gravação de áudio simulada
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

  // Envio de foto simulado
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

  // Exportar histórico da conversa em arquivo .txt
  const handleExportHistory = () => {
    if (!outroUsuario || chatMensagens.length === 0) return;

    let content = `====================================================\n`;
    content += `ENCONTRO CERTO MG - HISTÓRICO DE PROSA\n`;
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

  // Filtrar mensagens no histórico com base na pesquisa
  const filteredChatMensagens = searchQuery.trim()
    ? chatMensagens.filter((m) => m.conteudo.toLowerCase().includes(searchQuery.toLowerCase()))
    : chatMensagens;

  // Filtrar matches na barra lateral
  const filteredMatches = matches.filter((m) => {
    if (!filterMatchQuery.trim()) return true;
    return m.outro_usuario?.nome.toLowerCase().includes(filterMatchQuery.toLowerCase()) ||
           m.outro_usuario?.cidade.toLowerCase().includes(filterMatchQuery.toLowerCase());
  });

  // Fotos pré-definidas para envio rápido no chat
  const quickPhotos = [
    {
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      title: 'Café com pão de queijo',
      desc: 'Olha que delícia de café da tarde aqui em Minas! ☕🧀',
    },
    {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      title: 'Pôr do sol na serra',
      desc: 'Final de tarde lindo demais na serra hoje!',
    },
    {
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      title: 'Passeio histórico',
      desc: 'Caminhando pelas ruazinhas de pedra de Ouro Preto 🏛️',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-6 px-3 sm:px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-orange-100 dark:border-zinc-800 h-[82vh] sm:h-[80vh]">
        
        {/* Matches Sidebar */}
        <div className="border-r border-orange-100 dark:border-zinc-800 flex flex-col h-full bg-white dark:bg-zinc-900">
          <div className="p-4 border-b border-orange-100 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-base sm:text-lg text-zinc-800 dark:text-zinc-100 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                <span>Conversas & Histórico</span>
              </h2>
              {onResetDemoHistory && (
                <button
                  onClick={onResetDemoHistory}
                  className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center space-x-1"
                  title="Restaurar histórico demonstrativo com mensagens dos últimos 3 dias"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar</span>
                </button>
              )}
            </div>

            {/* Busca de conversas na barra lateral */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                value={filterMatchQuery}
                onChange={(e) => setFilterMatchQuery(e.target.value)}
                placeholder="Filtrar conversas..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-orange-50/60 dark:bg-zinc-800 border border-orange-100 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-2 sm:p-3 space-y-1.5">
            {filteredMatches.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 px-4">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40 text-orange-400" />
                <p className="text-xs">Nenhum match encontrado. Explore a aba Descobrir para prosear!</p>
              </div>
            ) : (
              filteredMatches.map((m) => {
                const u = m.outro_usuario;
                if (!u) return null;
                const isActive = m.id === activeMatchId;
                const lastMsg = getLastMessageForMatch(u.id);

                return (
                  <div
                    key={m.id}
                    onClick={() => setActiveMatchId(m.id)}
                    className={`flex items-center space-x-3 p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                        : 'hover:bg-orange-50/70 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={u.foto}
                        alt={u.nome}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/50 shadow-xs"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs sm:text-sm truncate">{u.nome}</h4>
                        {lastMsg && (
                          <span className={`text-[10px] shrink-0 ${isActive ? 'text-amber-100' : 'text-zinc-400'}`}>
                            {new Date(lastMsg.criado_em).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-amber-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        {lastMsg ? (
                          <>
                            {lastMsg.remetente_id === currentUser.id ? 'Você: ' : ''}
                            {lastMsg.tipo === 'foto' ? '📷 Foto' : lastMsg.tipo === 'audio' ? '🎤 Mensagem de voz' : lastMsg.tipo === 'presente' ? '🎁 Presente' : lastMsg.conteudo}
                          </>
                        ) : (
                          `${u.cidade} • Inicie a prosa 💛`
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area with Rich History */}
        <div className="md:col-span-2 flex flex-col h-full bg-zinc-50/60 dark:bg-zinc-950/60 relative">
          {outroUsuario ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border-b border-orange-100 dark:border-zinc-800 flex items-center justify-between shrink-0 shadow-xs z-10">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={outroUsuario.foto}
                      alt={outroUsuario.nome}
                      className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-100 flex items-center space-x-1.5">
                      <span>{outroUsuario.nome}</span>
                      <span className="text-[11px] font-normal text-zinc-400">({outroUsuario.cidade})</span>
                    </h3>
                    <div className="flex items-center space-x-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Online agora • Histórico ativo</span>
                    </div>
                  </div>
                </div>

                {/* Header Action Tools */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {/* Busca no Histórico */}
                  <button
                    onClick={() => {
                      setShowSearch(!showSearch);
                      if (showSearch) setSearchQuery('');
                    }}
                    className={`p-2 rounded-xl transition-colors ${
                      showSearch
                        ? 'bg-orange-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-orange-50'
                    }`}
                    title="Buscar palavras no histórico da conversa"
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  {/* Confirmação de Leitura (5 Certcoins) */}
                  <button
                    onClick={handleUnlockReceiptClick}
                    className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
                      hasReadReceipt
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100'
                    }`}
                    title="Confirmação de Leitura (5 Certcoins - Permanente nesta conversa)"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {hasReadReceipt ? 'Leitura Ativa 👁️' : 'Desbloquear Leitura (5 🪙)'}
                    </span>
                  </button>

                  {/* Enviar Presente */}
                  <button
                    onClick={() => setShowGiftModal(true)}
                    className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-[11px] sm:text-xs hover:bg-amber-200 transition-colors"
                    title="Enviar carinho em Certcoins"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Presente 💛</span>
                  </button>

                  {/* Exportar histórico */}
                  <button
                    onClick={handleExportHistory}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    title="Baixar histórico da conversa (.txt)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Barra de Busca no Histórico Expandível */}
              {showSearch && (
                <div className="bg-orange-50 dark:bg-zinc-800/90 border-b border-orange-200 dark:border-zinc-700 px-4 py-2 flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Pesquisar mensagens antigas ou recentes..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <span className="text-[11px] text-zinc-500 font-semibold whitespace-nowrap">
                    {filteredChatMensagens.length} {filteredChatMensagens.length === 1 ? 'mensagem' : 'mensagens'}
                  </span>
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                    className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Messages History List Container */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
              >
                {/* Top of Chat History Banner */}
                <div className="text-center py-6 px-4 my-2 border-b border-dashed border-orange-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 rounded-3xl shadow-xs">
                  <div className="w-12 h-12 bg-gradient-to-tr from-orange-400 to-pink-500 rounded-full mx-auto flex items-center justify-center text-white mb-2 shadow-sm">
                    <Heart className="w-6 h-6 fill-white" />
                  </div>
                  <h4 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-100">
                    Início da prosa com {outroUsuario.nome} 💛
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                    Vocês deram match no Encontro Certo MG. Todas as conversas ficam salvas de forma segura e permanente no seu histórico.
                  </p>
                  <div className="flex items-center justify-center space-x-3 text-[11px] text-orange-600 dark:text-orange-400 font-bold mt-2">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{chatMensagens.length} mensagens no histórico</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Histórico persistente</span>
                    </span>
                  </div>
                </div>

                {/* Renderização das mensagens com separador de data */}
                {filteredChatMensagens.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400 text-xs">
                    {searchQuery ? 'Nenhuma mensagem encontrada com esse termo no histórico.' : 'Envie a primeira mensagem para começar a prosa!'}
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
                            <span className="px-3 py-1 bg-orange-100/80 dark:bg-zinc-800 text-orange-800 dark:text-orange-300 rounded-full text-[10px] font-extrabold shadow-2xs border border-orange-200/50 dark:border-zinc-700">
                              {formatDateGroup(msg.criado_em)}
                            </span>
                          </div>
                        )}

                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[85%] sm:max-w-md rounded-2xl p-3.5 text-sm shadow-xs transition-all relative group ${
                              isMe
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-xs'
                                : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 rounded-bl-xs border border-orange-100 dark:border-zinc-800'
                            } ${msg.destacada ? 'border-2 border-yellow-400 shadow-md ring-2 ring-yellow-300/50' : ''}`}
                          >
                            {/* Selo de Mensagem Destacada */}
                            {msg.destacada && (
                              <div className="flex items-center space-x-1 text-[10px] font-extrabold text-amber-200 uppercase mb-1.5 pb-1 border-b border-amber-300/30">
                                <Sparkles className="w-3 h-3 text-amber-200" />
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
                                      ? 'bg-white text-orange-600 shadow-xs'
                                      : 'bg-orange-500 text-white shadow-xs'
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
                                          isMe ? 'bg-amber-100' : 'bg-orange-400'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <div className={`text-[10px] mt-0.5 font-bold ${isMe ? 'text-amber-100' : 'text-zinc-400'}`}>
                                    {playingAudioId === msg.id ? 'Reproduzindo...' : `Áudio (${msg.audio_duracao || 12}s)`}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Renderização de Presente em Certcoins */}
                            {msg.tipo === 'presente' && (
                              <div className="p-3 bg-amber-400/20 rounded-xl border border-amber-300/40 mb-1 flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shadow-xs">
                                  <Gift className="w-5 h-5" />
                                </div>
                                <div>
                                  <span className="block font-black text-xs text-amber-900 dark:text-amber-200">
                                    Presente de {msg.qtd_presente || 5} Certcoins 💛
                                  </span>
                                  <span className="text-[10px] text-amber-800/80 dark:text-amber-300/80">
                                    Carinho enviado com jeitinho mineiro
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Conteúdo textual da mensagem */}
                            {msg.tipo !== 'audio' && (
                              <p className="whitespace-pre-wrap leading-relaxed">{msg.conteudo}</p>
                            )}

                            {/* Rodapé da Mensagem: Horário e Status de Leitura */}
                            <div
                              className={`flex items-center justify-end space-x-1.5 text-[10px] mt-1 pt-0.5 ${
                                isMe ? 'text-amber-100' : 'text-zinc-400'
                              }`}
                            >
                              <span>
                                {new Date(msg.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMe && (
                                hasReadReceipt || msg.lido_em ? (
                                  <span title="Mensagem lida pelo destinatário">
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />
                                  </span>
                                ) : (
                                  <span title="Entregue">
                                    <Check className="w-3.5 h-3.5 text-amber-200" />
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
                    <div className="bg-white dark:bg-zinc-900 border border-orange-100 dark:border-zinc-800 p-3 rounded-2xl text-xs text-zinc-500 italic flex items-center space-x-2 shadow-xs">
                      <div className="flex space-x-1">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                      <span>{outroUsuario.nome} está digitando uma prosa…</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Botão Flutuante: "Rolar para o fim do histórico" */}
              {showScrollBottomBtn && (
                <button
                  onClick={() => scrollToBottom(true)}
                  className="absolute bottom-20 right-6 p-2.5 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all flex items-center space-x-1.5 text-xs font-bold animate-bounce z-20"
                >
                  <ArrowDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Última mensagem</span>
                </button>
              )}

              {/* Gravador de Áudio Ativo */}
              {showAudioRecorder && (
                <div className="p-3 bg-orange-50 dark:bg-zinc-800 border-t border-orange-200 dark:border-zinc-700 flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 dark:text-orange-400">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                    <span>Gravando áudio de voz... ({recordingSeconds}s)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={cancelAudioRecording}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={sendAudioRecording}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-orange-500 shadow-sm"
                    >
                      Enviar Áudio 🎤
                    </button>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border-t border-orange-100 dark:border-zinc-800 shrink-0">
                {destacadaMode && (
                  <div className="mb-2 p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs rounded-xl flex items-center justify-between border border-amber-200">
                    <span className="flex items-center space-x-1 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Modo Mensagem Destacada ativado (Custa 4 Certcoins)</span>
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
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-orange-500 border border-zinc-200 dark:border-zinc-700 transition-colors"
                    title="Enviar foto para o histórico"
                  >
                    <Image className="w-5 h-5" />
                  </button>

                  {/* Botão Gravar Áudio */}
                  <button
                    type="button"
                    onClick={startAudioRecording}
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-orange-500 border border-zinc-200 dark:border-zinc-700 transition-colors"
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
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
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
                    className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />

                  {/* Botão Enviar */}
                  <button
                    type="submit"
                    disabled={!textoMensagem.trim()}
                    className="p-2.5 sm:p-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow hover:opacity-95 transition-all disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
              <MessageCircle className="w-14 h-14 mb-3 opacity-30 text-orange-400" />
              <p className="font-bold text-sm">Selecione uma conversa ao lado para visualizar o histórico.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Enviar Presente */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-amber-200 dark:border-zinc-800 space-y-4">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <Gift className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
              Enviar Presente em Certcoins 💛
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Quantos Certcoins você quer enviar de carinho para {outroUsuario?.nome}? Ficará registrado na prosa de vocês!
            </p>
            <input
              type="number"
              min={1}
              value={giftQtd}
              onChange={(e) => setGiftQtd(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-center font-bold text-lg text-zinc-800 dark:text-zinc-100"
            />
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowGiftModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-bold text-xs text-zinc-600 dark:text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleGiftSubmit}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow"
              >
                Enviar Carinho 🎁
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Enviar Foto Rápida */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-orange-100 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center space-x-2">
                <Image className="w-5 h-5 text-orange-500" />
                <span>Compartilhar Foto no Chat</span>
              </h3>
              <button onClick={() => setShowPhotoModal(false)} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-zinc-500">Escolha uma foto mineira de exemplo para enviar ao histórico:</p>
            <div className="grid grid-cols-3 gap-2">
              {quickPhotos.map((photo, i) => (
                <div
                  key={i}
                  onClick={() => sendPhoto(photo.url, photo.desc)}
                  className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:opacity-90 group relative"
                >
                  <img src={photo.url} alt={photo.title} className="w-full h-24 object-cover" />
                  <div className="p-1.5 text-[10px] font-bold text-center bg-white dark:bg-zinc-800 truncate">
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
              className="absolute -top-10 right-0 p-2 text-white hover:text-orange-400"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedPhotoPreview}
              alt="Visualização"
              className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
