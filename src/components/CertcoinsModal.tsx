import React, { useState } from 'react';
import { Coins, X, Send, Sparkles, AlertCircle } from 'lucide-react';
import { CertcoinLote, UserProfile } from '../types';

interface CertcoinsModalProps {
  lotes: CertcoinLote[];
  usuarios: UserProfile[];
  currentUserId: string;
  onClose: () => void;
  onTransfer: (destinatarioId: string, quantidade: number) => void;
}

export const CertcoinsModal: React.FC<CertcoinsModalProps> = ({
  lotes,
  usuarios,
  currentUserId,
  onClose,
  onTransfer,
}) => {
  const [destinatarioId, setDestinatarioId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');

  const totalTemp = lotes
    .filter((l) => l.tipo === 'temp')
    .reduce((acc, l) => acc + l.quantidade, 0);
  const totalVitalicio = lotes
    .filter((l) => l.tipo === 'vitalicio')
    .reduce((acc, l) => acc + l.quantidade, 0);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinatarioId || quantidade <= 0) return;
    if (quantidade > totalTemp + totalVitalicio) {
      alert('Eita, cê não tem Certcoins suficientes!');
      return;
    }

    onTransfer(destinatarioId, quantidade);
    setSuccessMsg(`Seu carinho de ${quantidade} Certcoins foi enviado com sucesso! 💛`);
    setTimeout(() => {
      setSuccessMsg('');
      setDestinatarioId('');
      setQuantidade(1);
    }, 3000);
  };

  const otherUsers = usuarios.filter((u) => u.id !== currentUserId);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-200 dark:border-zinc-800 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg mb-3 animate-bounce">
            <Coins className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100">
            Meus Certcoins 💛
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            A moeda oficial de Minas para espalhar carinho e prosa boa.
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-4 text-white shadow-md mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="border-r border-amber-400/50 pr-2">
              <span className="block text-2xl font-black">{totalTemp}</span>
              <span className="text-xs font-medium text-amber-100">Temporários (30d)</span>
            </div>
            <div>
              <span className="block text-2xl font-black">{totalVitalicio}</span>
              <span className="text-xs font-medium text-amber-100">Vitalícios 💎</span>
            </div>
          </div>
          <p className="text-[11px] text-amber-100/90 text-center mt-3 pt-2 border-t border-amber-400/40">
            * O sistema consome primeiro os temporários que vencem mais cedo (FIFO).
          </p>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-sm font-semibold rounded-2xl text-center">
            {successMsg}
          </div>
        )}

        {/* Transfer form */}
        <form onSubmit={handleSend} className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            Enviar Certcoins para outro(a) mineiro(a)
          </h3>
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              Escolher pessoa
            </label>
            <select
              required
              value={destinatarioId}
              onChange={(e) => setDestinatarioId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm"
            >
              <option value="">Selecione...</option>
              {otherUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} ({u.cidade})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              Quantidade (mínimo 1)
            </label>
            <input
              type="number"
              min={1}
              max={totalTemp + totalVitalicio}
              required
              value={quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Carinho 💛</span>
          </button>
        </form>
      </div>
    </div>
  );
};
