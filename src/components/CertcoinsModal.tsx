import React, { useState } from 'react';
import { Coins, X, Send, Sparkles, AlertCircle, Clock, Gem } from 'lucide-react';
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

    if (quantidade >= 3) {
      const confirmSpend = window.confirm(
        `Isso vai usar ${quantidade} Certcoins. Tem certeza que deseja enviar esse carinho?`
      );
      if (!confirmSpend) return;
    }

    onTransfer(destinatarioId, quantidade);
    setSuccessMsg(`Seu carinho de ${quantidade} Certcoins foi enviado com sucesso! Consumido do seu lote mais antigo 💛`);
    setTimeout(() => {
      setSuccessMsg('');
      setDestinatarioId('');
      setQuantidade(1);
    }, 4000);
  };

  const otherUsers = usuarios.filter((u) => u.id !== currentUserId);

  return (
    <div className="fixed inset-0 z-50 bg-[#120F0D]/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#1E1915] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#382E24] relative text-[#F5E9D3] space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#2A231D] text-[#C8B8A0] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#E8A838] via-[#F0C040] to-[#D1704A] rounded-3xl mx-auto flex items-center justify-center shadow-lg mb-3 animate-heartbeat text-[#120F0D]">
            <Coins className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-[#F5E9D3]">
            Carteira de Certcoins 💛
          </h2>
          <p className="text-xs text-[#C8B8A0] mt-1">
            A moeda oficial de Minas para espalhar carinho e prosa boa.
          </p>
        </div>

        {/* Separated Balances Card */}
        <div className="bg-[#2A231D] border border-[#382E24] rounded-2xl p-4 space-y-3 shadow-inner">
          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-[#1E1915] border border-[#382E24]">
            <Clock className="w-5 h-5 text-[#E8A838] shrink-0" />
            <div className="text-xs font-bold text-[#F5E9D3]">
              💛 Tens <strong className="text-[#E8A838] text-base">{totalTemp}</strong> Certcoins pra usar nos próximos 30 dias
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-[#1E1915] border border-[#382E24]">
            <Gem className="w-5 h-5 text-teal-400 shrink-0" />
            <div className="text-xs font-bold text-[#F5E9D3]">
              💎 Tens <strong className="text-teal-400 text-base">{totalVitalicio}</strong> Certcoins que não vencem nunca
            </div>
          </div>

          <p className="text-[11px] text-[#C8B8A0] text-center pt-1">
            * O sistema consome primeiro os lotes temporários que vencem mais cedo (FIFO).
          </p>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs font-bold rounded-2xl text-center">
            {successMsg}
          </div>
        )}

        {/* Transfer Form */}
        <form onSubmit={handleSend} className="space-y-4">
          <h3 className="text-xs font-black text-[#C8B8A0] uppercase">
            Mandar carinho em Certcoins para alguém
          </h3>
          <div>
            <label className="block text-xs text-[#C8B8A0] mb-1 font-bold">
              Escolher mineiro(a)
            </label>
            <select
              required
              value={destinatarioId}
              onChange={(e) => setDestinatarioId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#382E24] bg-[#120F0D] text-[#F5E9D3] text-xs font-bold focus:outline-none focus:border-[#E8A838]"
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
            <label className="block text-xs text-[#C8B8A0] mb-1 font-bold">
              Quantidade de Certcoins
            </label>
            <input
              type="number"
              min={1}
              max={totalTemp + totalVitalicio}
              required
              value={quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#382E24] bg-[#120F0D] text-[#F5E9D3] text-sm font-bold focus:outline-none focus:border-[#E8A838]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 golden-button rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4 text-[#120F0D]" />
            <span>Mandar com carinho 💛</span>
          </button>
        </form>
      </div>
    </div>
  );
};
