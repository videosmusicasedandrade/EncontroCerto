import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Image, Mic, Eye, Gift, ShieldAlert, Sparkles, Check, CheckCheck, Coins } from 'lucide-react';
import { Match, UserProfile, Mensagem, CertcoinLote } from '../types';

interface MatchesViewProps {
  currentUser: UserProfile;
  matches: Match[];
  mensagens: Mensagem[];
  lotes: CertcoinsLotesList[];
  readReceipts: string[]; // IDs de conversas com leitura desbloqueada
  onSendMessage: (destinatarioId: string, conteudo: string, tipo?: 'texto' | 'foto' | 'audio' | 'presente', destacada?: boolean) => void;
  onUnlockReadReceipt: (alvoId: string) => void;
  onSendGift: (alvoId: string, qtd: number) => void;
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
}) => {
  const [activeMatchId, setActiveMatchId] = useState<string | null>(matches[0]?.id || null);
  const [textoMensagem, setTextoMensagem] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftQtd, setGiftQtd] = useState(5);
  const [destacadaMode, setDestacadaMode] = useState(false);

  const activeMatch = matches.find((m) => m.id === activeMatchId);
  const outroUsuario = activeMatch?.outro_usuario;

  const totalCertcoins = lotes.reduce((acc, l) => acc + l.quantidade, 0);

  const chatMensagens = mensagens.filter(
    (m) =>
      (m.remetente_id === currentUser.id && m.destinatario_id === outroUsuario?.id) ||
      (m.remetente_id === outroUsuario?.id && m.destinatario_id === currentUser.id)
  );

  const hasReadReceipt = outroUsuario ? readReceipts.includes(outroUsuario.id) : false;

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

    // Simula indicador de digitação do outro
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }, 1000);
  };

  const handleUnlockReceiptClick = () => {
    if (!outroUsuario) return;
    if (totalCertcoins < 5) {
      alert('Eita, a confirmação de leitura custa 5 Certcoins!');
      return;
    }
    if (confirm('Isso vai usar 5 Certcoins para desbloquear a confirmação de leitura PARA SEMPRE com essa pessoa. Deseja prosseguir?')) {
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
    alert(`Seu carinho de ${giftQtd} Certcoins tá indo com todo amor e um cafezinho 💛`);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-orange-100 dark:border-zinc-800 h-[75vh]">
        
        {/* Matches Sidebar */}
        <div className="border-r border-orange-100 dark:border-zinc-800 flex flex-col">
          <div className="p-4 border-b border-orange-100 dark:border-zinc-800">
            <h2 className="font-black text-lg text-zinc-800 dark:text-zinc-100 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
              <span>Meus Matches & Prosa</span>
            </h2>
          </div>

          <div className="overflow-y-auto flex-1 p-3 space-y-2">
            {matches.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 px-4">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40 text-orange-400" />
                <p className="text-xs">Nenhum match ainda. Curta os perfis na aba Descobrir para prosear!</p>
              </div>
            ) : (
              matches.map((m) => {
                const u = m.outro_usuario;
                if (!u) return null;
                const isActive = m.id === activeMatchId;

                return (
                  <div
                    key={m.id}
                    onClick={() => setActiveMatchId(m.id)}
                    className={`flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                        : 'hover:bg-orange-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    <img src={u.foto} alt={u.nome} className="w-12 h-12 rounded-full object-cover border-2 border-white/40" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{u.nome}</h4>
                      <p className={`text-xs truncate ${isActive ? 'text-amber-100' : 'text-zinc-400'}`}>
                        {u.cidade}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2 flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/50">
          {outroUsuario ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white dark:bg-zinc-900 border-b border-orange-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={outroUsuario.foto} alt={outroUsuario.nome} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-100">{outroUsuario.nome}</h3>
                    <p className="text-[11px] text-zinc-400">{outroUsuario.cidade}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleUnlockReceiptClick}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      hasReadReceipt
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100'
                    }`}
                    title="Confirmação de Leitura (5 Certcoins - Para sempre nesta conversa)"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{hasReadReceipt ? 'Leitura Desbloqueada 👁️' : 'Desbloquear Leitura (5 🪙)'}</span>
                  </button>

                  <button
                    onClick={() => setShowGiftModal(true)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-200 transition-colors"
                    title="Enviar Presente em Certcoins"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Presente 💛</span>
                  </button>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMensagens.map((msg) => {
                  const isMe = msg.remetente_id === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-md rounded-2xl p-3.5 text-sm shadow-xs ${
                          isMe
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-xs'
                            : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 rounded-bl-xs border border-orange-100 dark:border-zinc-800'
                        } ${msg.destacada ? 'border-2 border-yellow-400 shadow-md ring-2 ring-yellow-200' : ''}`}
                      >
                        {msg.destacada && (
                          <span className="block text-[10px] font-bold text-amber-200 uppercase mb-1">
                            ⭐ Mensagem Destacada
                          </span>
                        )}
                        <p>{msg.conteudo}</p>
                        <div
                          className={`flex items-center justify-end space-x-1 text-[10px] mt-1 ${
                            isMe ? 'text-amber-100' : 'text-zinc-400'
                          }`}
                        >
                          <span>
                            {new Date(msg.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && hasReadReceipt && (
                            <CheckCheck className="w-3 h-3 text-emerald-200" title="Lido" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-zinc-900 border border-orange-100 dark:border-zinc-800 p-3 rounded-2xl text-xs text-zinc-400 italic flex items-center space-x-1.5 animate-pulse">
                      <span>{outroUsuario.nome} está digitando uma prosa…</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white dark:bg-zinc-900 border-t border-orange-100 dark:border-zinc-800">
                {destacadaMode && (
                  <div className="mb-2 p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs rounded-xl flex items-center justify-between">
                    <span>⭐ Modo Mensagem Destacada ativado (Custa 4 Certcoins)</span>
                    <button onClick={() => setDestacadaMode(false)} className="font-bold underline">Cancelar</button>
                  </div>
                )}

                <form onSubmit={handleSend} className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setDestacadaMode(!destacadaMode)}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      destacadaMode
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
                    }`}
                    title="Destacar Mensagem (4 Certcoins)"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    value={textoMensagem}
                    onChange={(e) => setTextoMensagem(e.target.value)}
                    placeholder="Escreva sua prosa aqui..."
                    className="flex-1 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />

                  <button
                    type="submit"
                    className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow hover:opacity-95 transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
              <MessageCircle className="w-14 h-14 mb-3 opacity-30 text-orange-400" />
              <p className="font-bold text-sm">Selecione um match para iniciar a conversa.</p>
            </div>
          )}
        </div>
      </div>

      {/* Gift Modal */}
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
              Quantos Certcoins você quer enviar como carinho para {outroUsuario?.nome}?
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
                Enviar Presente 🎁
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
