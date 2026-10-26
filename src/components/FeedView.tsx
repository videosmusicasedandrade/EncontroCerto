import React, { useState } from 'react';
import { Heart, MessageSquare, Edit3, Trash2, Send, Sparkles, Coins, ThumbsUp, Circle } from 'lucide-react';
import { Postagem, UserProfile, CertcoinLote, Nota } from '../types';
import { calcularDistancia } from '../lib/supabase';

interface FeedViewProps {
  currentUser: UserProfile;
  posts: Postagem[];
  usuarios: UserProfile[];
  lotes: CertcoinLote[];
  notas: Nota[];
  matches: string[]; // IDs de usuários com match
  onCreatePost: (conteudo: string) => void;
  onEditPost: (postId: string, novoConteudo: string) => void;
  onDeletePost: (postId: string) => void;
  onSendNote: (paraUserId: string, valor: number) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  currentUser,
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
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editConteudo, setEditConteudo] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState<Postagem | null>(null);

  const totalCertcoins = lotes.reduce((acc, l) => acc + l.quantidade, 0);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoConteudo.trim()) return;
    if (totalCertcoins < 1) {
      alert('Eita, cê precisa de 1 Certcoin para criar postagem! Jogue um pouquinho para ganhar mais 💛');
      return;
    }
    onCreatePost(novoConteudo);
    setNovoConteudo('');
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
      const dist = calcularDistancia(currentUser.latitude, currentUser.longitude, autor.latitude, autor.longitude);
      if (dist > currentUser.raio_busca) return false;
    }
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      {/* Create Post Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-orange-100 dark:border-zinc-800">
        <form onSubmit={handleCreateSubmit}>
          <div className="flex items-start space-x-3">
            <img src={currentUser.foto} alt={currentUser.nome} className="w-11 h-11 rounded-full object-cover" />
            <div className="flex-1">
              <textarea
                rows={3}
                value={novoConteudo}
                onChange={(e) => setNovoConteudo(e.target.value)}
                placeholder="No que cê tá pensando hoje, sô? Compartilhe com a galera..."
                className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Custa 1 Certcoin</span>
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-xl shadow hover:opacity-95 transition-all text-sm flex items-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Publicar Uai</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-orange-50/60 dark:bg-zinc-800/60 p-1.5 rounded-2xl border border-orange-100 dark:border-zinc-700">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            filter === 'all'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-orange-600'
          }`}
        >
          Todos os Posts
        </button>
        <button
          onClick={() => setFilter('radius')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            filter === 'radius'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-orange-600'
          }`}
        >
          No Meu Raio 📍
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 bg-white dark:bg-zinc-900 rounded-3xl border border-orange-100 dark:border-zinc-800 p-8">
            <Sparkles className="w-10 h-10 mx-auto mb-2 text-orange-400 animate-spin-slow" />
            <p className="font-medium text-sm">Nenhuma postagem por aqui ainda. Seja o primeiro a puxar prosa!</p>
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
                className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-orange-100 dark:border-zinc-800 space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={autor.foto} alt={autor.nome} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-100 flex items-center space-x-1.5">
                        <span>{autor.nome}</span>
                        <span className="text-xs text-zinc-400 font-normal">({autor.cidade})</span>
                      </h4>
                      <span className="text-[11px] text-zinc-400">
                        {new Date(post.criado_em).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(post.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {post.editado_em && (
                          <span
                            onClick={() => setShowHistoryModal(post)}
                            className="ml-2 text-orange-500 underline cursor-pointer font-semibold"
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
                        className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                        title="Editar postagem (1 Certcoin)"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeletePost(post.id)}
                        className="p-2 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-950/40 text-pink-600"
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
                      className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingPostId(null)}
                        className="px-3 py-1.5 text-xs font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-xl"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleEditSubmit(post.id)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-orange-500 rounded-xl shadow"
                      >
                        Salvar (1 Certcoin)
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {post.conteudo}
                  </p>
                )}

                {/* Footer / Notes & Comments restriction */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center space-x-4">
                    {!isMyPost && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onSendNote(autor.id, 0.50)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold hover:bg-orange-100 transition-colors"
                          title="Curtir (+0.50 Certcoin para o autor)"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Curtir (+0.50 🪙)</span>
                        </button>
                        <button
                          onClick={() => onSendNote(autor.id, 0.11)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold hover:bg-zinc-200 transition-colors"
                          title="Nota neutra (+0.11 Certcoin para o autor)"
                        >
                          <Circle className="w-3.5 h-3.5" />
                          <span>Nota (+0.11 🪙)</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 text-zinc-400 italic">
                    <MessageSquare className="w-4 h-4" />
                    <span>{hasMatchWithAuthor ? 'Comentários liberados (Match)' : 'Comentários bloqueados até dar Match 🔒'}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

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
                  <div key={i} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-xs space-y-1">
                    <span className="text-zinc-400">
                      {new Date(h.alterado_em).toLocaleString('pt-BR')}
                    </span>
                    <p className="text-zinc-700 dark:text-zinc-300 line-through">{h.conteudo_antigo}</p>
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
