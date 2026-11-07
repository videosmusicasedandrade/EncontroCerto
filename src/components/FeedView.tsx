import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageSquare,
  Edit3,
  Trash2,
  Send,
  Sparkles,
  Coins,
  ThumbsUp,
  Circle,
  Camera,
  Clock,
  CheckCircle2,
  Image as ImageIcon,
  Gift,
  X,
} from 'lucide-react';
import { Postagem, UserProfile, CertcoinLote, Nota, EstadoConfig } from '../types';
import { StateSelector } from './StateSelector';
import { PnlDopamineWidget } from './PnlDopamineWidget';
import { AdSenseUnit } from './AdSenseUnit';
import { calcularDistancia } from '../lib/supabase';

interface FeedViewProps {
  currentUser: UserProfile;
  estadoConfig: EstadoConfig;
  onSelectEstado: (sigla: string) => void;
  posts: Postagem[];
  usuarios: UserProfile[];
  lotes: CertcoinLote[];
  notas: Nota[];
  matches: string[]; // IDs de usuários com match
  onCreatePost: (conteudo: string, imagem_url?: string, isDesafioDiario?: boolean) => void;
  onEditPost: (postId: string, novoConteudo: string) => void;
  onDeletePost: (postId: string) => void;
  onSendNote: (paraUserId: string, valor: number) => void;
}

const PRESET_PHOTOS = [
  {
    label: '☕ Café & Pão de Queijo',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: '💻 Trabalhando / Estudando',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: '🍕 Comendo Algo Gostoso',
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: '🌇 Vendo o Pôr do Sol',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: '🎵 Ouvindo Música',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: '🏋️ Treino / Academia',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
  },
];

export const FeedView: React.FC<FeedViewProps> = ({
  currentUser,
  estadoConfig,
  onSelectEstado,
  posts,
  usuarios,
  lotes,
  notas,
  matches,
  onCreatePost,
  onEditPost,
  onDeletePost,
  onSendNote,
}) => {
  const [filter, setFilter] = useState<'all' | 'radius' | 'followers'>('all');
  const [novoConteudo, setNovoConteudo] = useState('');
  const [novoFotoUrl, setNovoFotoUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editConteudo, setEditConteudo] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState<Postagem | null>(null);

  // Estados do Desafio Diário (12:20 / 20:20)
  const [showDesafioModal, setShowDesafioModal] = useState(false);
  const [desafioTexto, setDesafioTexto] = useState('');
  const [desafioFoto, setDesafioFoto] = useState(PRESET_PHOTOS[0].url);
  const [customDesafioFoto, setCustomDesafioFoto] = useState('');
  const [showRewardAlert, setShowRewardAlert] = useState(false);

  // Relógio do Sistema para os Horários de 12:20 e 20:20
  const [nowTimeStr, setNowTimeStr] = useState('');
  const [isHorarioDesafio, setIsHorarioDesafio] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      setNowTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );

      // Considera horário ativo perto de 12:20 ou 20:20 da noite
      const near1220 = hours === 12 && minutes >= 20;
      const near2020 = hours === 20 && minutes >= 20;
      setIsHorarioDesafio(near1220 || near2020 || true); // Ativo diariamente para engajamento contínuo
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalCertcoins = lotes.reduce((acc, l) => acc + l.quantidade, 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoConteudo.trim()) return;
    if (totalCertcoins < 1) {
      alert(`Eita, cê precisa de 1 Certcoin para criar postagem! ${estadoConfig.emblem}`);
      return;
    }
    onCreatePost(novoConteudo, novoFotoUrl.trim() || undefined, false);
    setNovoConteudo('');
    setNovoFotoUrl('');
    setShowImageInput(false);
  };

  const handleDesafioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desafioTexto.trim()) {
      alert('Por favor, escreva um texto contando o que você está fazendo agora!');
      return;
    }
    const fotoFinal = customDesafioFoto.trim() || desafioFoto;
    onCreatePost(desafioTexto, fotoFinal, true);
    setShowDesafioModal(false);
    setDesafioTexto('');
    setShowRewardAlert(true);
  };

  const handleEditSubmit = (postId: string) => {
    if (!editConteudo.trim()) return;
    if (totalCertcoins < 1) {
      alert('Eita, cê precisa de 1 Certcoin para editar postagem!');
      return;
    }
    onEditPost(postId, editConteudo);
    setEditingPostId(null);
    setEditConteudo('');
  };

  // Filtrar postagens
  const filteredPosts = posts.filter((p) => {
    const autor = usuarios.find((u) => u.id === p.autor_id);
    if (!autor) return false;

    if (filter === 'radius') {
      const dist = calcularDistancia(
        currentUser.latitude,
        currentUser.longitude,
        autor.latitude,
        autor.longitude
      );
      if (dist > currentUser.raio_busca) return false;
    }
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6 text-[#F5E9D3]">
      {/* PNL Dopamine Widget */}
      <PnlDopamineWidget
        estadoConfig={estadoConfig}
        onAddCertcoins={(amount) => onSendNote(currentUser.id, amount)}
        userName={currentUser.nome}
      />

      {/* BANNER DE NOTIFICAÇÃO DO DESAFIO DIÁRIO (12:20 & 20:20 DA NOITE - GANHE +3 CERTCOINS) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/90 via-[#1E1915] to-amber-900/80 rounded-3xl p-5 border-2 border-[#E8A838]/80 shadow-2xl">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#E8A838]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-[#E8A838] text-black text-[10px] font-black uppercase rounded-full tracking-wider animate-pulse">
                Desafio Diário 📸
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Horários: 12:20 & 20:20</span>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-[#F5E9D3] leading-snug">
              O que cê tá fazendo agora? Posta uma foto no Feed!
            </h3>

            <p className="text-xs text-[#C8B8A0] leading-relaxed">
              Publique uma foto do seu momento + um texto contando o que você está fazendo para ganhar{' '}
              <strong className="text-[#E8A838] underline font-bold">+3.00 Certcoins</strong> 🪙
            </p>
          </div>

          <button
            onClick={() => setShowDesafioModal(true)}
            className="w-full sm:w-auto px-5 py-3 golden-button rounded-2xl text-xs sm:text-sm font-black shadow-xl flex items-center justify-center space-x-2 hover:scale-105 active:scale-95 transition-transform shrink-0"
          >
            <Camera className="w-4 h-4 text-[#120F0D]" />
            <span>Participar e Ganhar +3 🪙</span>
          </button>
        </div>
      </div>

      {/* State Selector Section */}
      <StateSelector
        currentEstadoSigla={estadoConfig.sigla}
        onSelectEstado={onSelectEstado}
      />

      {/* Welcome Banner */}
      <div className="bg-[#1E1915] rounded-3xl p-5 border border-[#382E24] shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-black text-[#F5E9D3] flex items-center space-x-2">
            <Sparkles className="w-5 h-5 animate-pulse" style={{ color: estadoConfig.cor }} />
            <span>
              Bem-vindo(a) de volta, {currentUser.nome}! {estadoConfig.emblem}
            </span>
          </h2>
          <p className="text-xs text-[#C8B8A0]">{estadoConfig.saudacao}</p>
        </div>
        <div
          className="hidden sm:flex items-center space-x-1.5 text-xs font-black px-3 py-1.5 rounded-full border border-[#382E24]"
          style={{ color: estadoConfig.cor, backgroundColor: '#2A231D' }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>12 conectados em {estadoConfig.sigla}</span>
        </div>
      </div>

      {/* Standard Create Post Card */}
      <div className="bg-[#1E1915] rounded-3xl p-5 border border-[#382E24] shadow-md space-y-3">
        <form onSubmit={handleCreateSubmit}>
          <div className="flex items-start space-x-3">
            <img
              src={currentUser.foto}
              alt={currentUser.nome}
              className="w-11 h-11 rounded-full object-cover border-2 border-[#E8A838]"
            />
            <div className="flex-1 space-y-3">
              <textarea
                rows={3}
                value={novoConteudo}
                onChange={(e) => setNovoConteudo(e.target.value)}
                placeholder="No que cê tá pensando hoje, sô? Compartilhe com a galera..."
                className="w-full p-3 rounded-2xl bg-[#120F0D] border border-[#382E24] text-sm text-[#F5E9D3] placeholder-[#C8B8A0]/50 focus:outline-none focus:border-[#E8A838] resize-none"
              />

              {showImageInput && (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={novoFotoUrl}
                    onChange={(e) => setNovoFotoUrl(e.target.value)}
                    placeholder="Cole a URL da imagem (opcional)"
                    className="w-full p-2.5 rounded-xl bg-[#120F0D] border border-[#382E24] text-xs text-[#F5E9D3] focus:outline-none focus:border-[#E8A838]"
                  />
                  {novoFotoUrl && (
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-[#E8A838]">
                      <img src={novoFotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowImageInput(!showImageInput)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#2A231D] text-xs font-bold text-[#C8B8A0] hover:text-[#E8A838] border border-[#382E24]"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{showImageInput ? 'Remover Foto' : 'Adicionar Foto'}</span>
                  </button>

                  <span className="flex items-center space-x-1 text-xs text-[#E8A838] font-bold bg-[#2A231D] px-3 py-1.5 rounded-full border border-[#382E24]">
                    <Coins className="w-3.5 h-3.5 text-[#E8A838]" />
                    <span>Custa 1 Certcoin</span>
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 golden-button rounded-xl text-xs sm:text-sm font-black flex items-center space-x-1.5 shadow-md"
                >
                  <Send className="w-4 h-4 text-[#120F0D]" />
                  <span>Publicar Uai 💛</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Google AdSense Responsive Unit */}
      <AdSenseUnit estadoConfig={estadoConfig} slotId="1000000001" label="Anúncio no Feed" />

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-[#120F0D] p-1.5 rounded-2xl border border-[#382E24]">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
            filter === 'all'
              ? 'bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] shadow-xs'
              : 'text-[#C8B8A0] hover:text-[#E8A838]'
          }`}
        >
          Todos os Posts
        </button>
        <button
          onClick={() => setFilter('radius')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
            filter === 'radius'
              ? 'bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] shadow-xs'
              : 'text-[#C8B8A0] hover:text-[#E8A838]'
          }`}
        >
          No Meu Raio 📍
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-[#C8B8A0] bg-[#1E1915] rounded-3xl border border-[#382E24] p-8">
            <Sparkles className="w-10 h-10 mx-auto mb-2 text-[#E8A838] animate-spin-slow" />
            <p className="font-medium text-sm">
              Nenhuma postagem por aqui ainda. Seja o primeiro a puxar prosa!
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const autor = usuarios.find((u) => u.id === post.autor_id);
            if (!autor) return null;
            const isMyPost = post.autor_id === currentUser.id;
            const hasMatchWithAuthor = matches.includes(autor.id);

            return (
              <div
                key={post.id}
                className="bg-[#1E1915] rounded-3xl p-5 shadow-md border border-[#382E24] space-y-4 relative overflow-hidden"
              >
                {/* Badge de Desafio Diário */}
                {post.isDesafioDiario && (
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-[#E8A838]/60 text-[10px] font-black text-[#E8A838]">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Desafio Diário (12:20 & 20:20) • Premiação +3 🪙</span>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={autor.foto}
                      alt={autor.nome}
                      className="w-10 h-10 rounded-full object-cover border border-[#E8A838]/40"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-[#F5E9D3] flex items-center space-x-1.5">
                        <span>{autor.nome}</span>
                        <span className="text-xs text-[#C8B8A0]">({autor.cidade})</span>
                      </h4>
                      <span className="text-[11px] text-[#C8B8A0]/70">
                        {new Date(post.criado_em).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(post.criado_em).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {post.editado_em && (
                          <span
                            onClick={() => setShowHistoryModal(post)}
                            className="ml-2 text-[#E8A838] underline cursor-pointer font-semibold"
                          >
                            (editado)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {isMyPost && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingPostId(post.id);
                          setEditConteudo(post.conteudo);
                        }}
                        className="p-2 rounded-xl hover:bg-[#2A231D] text-[#C8B8A0]"
                        title="Editar postagem (1 Certcoin)"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeletePost(post.id)}
                        className="p-2 rounded-xl hover:bg-pink-950/40 text-pink-400"
                        title="Apagar postagem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content / Edit Mode */}
                {editingPostId === post.id ? (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={editConteudo}
                      onChange={(e) => setEditConteudo(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-[#120F0D] border border-[#382E24] text-sm text-[#F5E9D3] focus:outline-none focus:border-[#E8A838]"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingPostId(null)}
                        className="px-3 py-1.5 text-xs font-bold text-[#C8B8A0] bg-[#2A231D] rounded-xl"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleEditSubmit(post.id)}
                        className="px-4 py-1.5 text-xs font-bold text-[#120F0D] golden-button rounded-xl shadow"
                      >
                        Salvar (1 Certcoin)
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#F5E9D3] text-sm whitespace-pre-wrap leading-relaxed">
                    {post.conteudo}
                  </p>
                )}

                {/* Foto do Post se houver */}
                {post.imagem_url && (
                  <div className="rounded-2xl overflow-hidden border border-[#382E24] max-h-96 bg-[#120F0D]">
                    <img
                      src={post.imagem_url}
                      alt="Foto da postagem"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Footer / Notes & Comments restriction */}
                <div className="pt-3 border-t border-[#382E24] flex items-center justify-between text-xs text-[#C8B8A0]">
                  <div className="flex items-center space-x-4">
                    {!isMyPost && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onSendNote(autor.id, 0.5)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#2A231D] text-[#E8A838] font-bold hover:bg-[#382E24] transition-colors border border-[#E8A838]/30"
                          title="Curtir (+0.50 Certcoin para o autor)"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-[#E8A838]" />
                          <span>Curtir (+0.50 🪙)</span>
                        </button>
                        <button
                          onClick={() => onSendNote(autor.id, 0.11)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#120F0D] text-[#C8B8A0] font-bold hover:bg-[#2A231D] transition-colors border border-[#382E24]"
                          title="Nota neutra (+0.11 Certcoin para o autor)"
                        >
                          <Circle className="w-3.5 h-3.5" />
                          <span>Nota (+0.11 🪙)</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 text-[#C8B8A0]/70 italic">
                    <MessageSquare className="w-4 h-4" />
                    <span>
                      {hasMatchWithAuthor
                        ? 'Comentários liberados (Match)'
                        : 'Comentários bloqueados até dar Match 🔒'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DO DESAFIO DIÁRIO (12:20 & 20:20 - RECOMPENSA DE 3 CERTCOINS) */}
      {showDesafioModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1E1915] rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-[#E8A838] space-y-5 relative animate-fadeIn">
            <button
              onClick={() => setShowDesafioModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-[#120F0D]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-[#382E24] pb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-lg">
                📸
              </div>
              <div>
                <h3 className="text-lg font-black text-[#F5E9D3] flex items-center space-x-2">
                  <span>Desafio Diário (12:20 / 20:20)</span>
                </h3>
                <p className="text-xs text-[#E8A838] font-bold">
                  Ganhe +3.00 Certcoins instantaneamente! 🪙
                </p>
              </div>
            </div>

            <form onSubmit={handleDesafioSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#F5E9D3] block">
                  1. O que você está fazendo exatamente neste momento? 💬
                </label>
                <textarea
                  rows={3}
                  value={desafioTexto}
                  onChange={(e) => setDesafioTexto(e.target.value)}
                  placeholder="Ex: Tô tomando um cafezinho quentinho com pão de queijo aqui na cozinha!"
                  className="w-full p-3 rounded-2xl bg-[#120F0D] border border-[#382E24] text-sm text-[#F5E9D3] placeholder-[#C8B8A0]/50 focus:outline-none focus:border-[#E8A838]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#F5E9D3] block">
                  2. Escolha uma foto do seu momento (ou cole a sua): 📷
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_PHOTOS.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setDesafioFoto(p.url);
                        setCustomDesafioFoto('');
                      }}
                      className={`cursor-pointer rounded-xl overflow-hidden border-2 relative h-20 transition-all ${
                        desafioFoto === p.url && !customDesafioFoto
                          ? 'border-[#E8A838] scale-105 shadow-lg'
                          : 'border-[#382E24] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1 text-[9px] font-bold text-[#F5E9D3] truncate text-center">
                        {p.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <input
                    type="url"
                    value={customDesafioFoto}
                    onChange={(e) => setCustomDesafioFoto(e.target.value)}
                    placeholder="Ou cole o link de uma imagem da internet..."
                    className="w-full p-2.5 rounded-xl bg-[#120F0D] border border-[#382E24] text-xs text-[#F5E9D3] focus:outline-none focus:border-[#E8A838]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 golden-button rounded-2xl text-xs sm:text-sm font-black shadow-xl flex items-center justify-center space-x-2"
              >
                <Gift className="w-5 h-5 text-[#120F0D]" />
                <span>Publicar Foto no Feed & Faturar +3 🪙</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ALERT MODAL DE SUCESSO DO DESAFIO */}
      {showRewardAlert && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1E1915] rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border-2 border-[#E8A838] shadow-2xl animate-bounce-short">
            <div className="w-16 h-16 rounded-full bg-[#E8A838]/20 border border-[#E8A838] flex items-center justify-center mx-auto text-3xl">
              🎉
            </div>
            <h3 className="text-xl font-black text-[#F5E9D3]">Parabéns! Desafio Concluído!</h3>
            <p className="text-xs text-[#C8B8A0] leading-relaxed">
              Você enviou sua foto do momento no horário do desafio (12:20 & 20:20) e garantiu{' '}
              <strong className="text-[#E8A838] underline font-bold">+3.00 Certcoins</strong> na sua carteira!
            </p>
            <button
              onClick={() => setShowRewardAlert(false)}
              className="w-full py-3 golden-button rounded-2xl text-xs font-black shadow-lg"
            >
              Sensacional! Continuar 🚀
            </button>
          </div>
        </div>
      )}

      {/* Edit History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-orange-100 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-3">
              Histórico de Alterações 📝
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {showHistoryModal.historico && showHistoryModal.historico.length > 0 ? (
                showHistoryModal.historico.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-xs space-y-1"
                  >
                    <span className="text-zinc-400">
                      {new Date(h.alterado_em).toLocaleString('pt-BR')}
                    </span>
                    <p className="text-zinc-700 dark:text-zinc-300 line-through">
                      {h.conteudo_antigo}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400">Nenhum histórico anterior registrado.</p>
              )}
            </div>
            <button
              onClick={() => setShowHistoryModal(null)}
              className="w-full py-2.5 bg-orange-500 text-white font-bold rounded-xl text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
