import React from 'react';
import { Coins, AlertCircle, Sparkles, X } from 'lucide-react';
import { CertcoinLote } from '../types';

interface CertcoinSpendModalProps {
  isOpen: boolean;
  costAmount: number;
  actionTitle?: string;
  lotes: CertcoinLote[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const CertcoinSpendModal: React.FC<CertcoinSpendModalProps> = ({
  isOpen,
  costAmount,
  actionTitle = 'esta ação',
  lotes,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  // Lote que vence primeiro (FIFO: lotes temporários por expiração ou ordenação de criação)
  const sortedLotes = [...lotes].sort((a, b) => {
    if (a.tipo === 'temp' && b.tipo === 'vitalicio') return -1;
    if (a.tipo === 'vitalicio' && b.tipo === 'temp') return 1;
    return new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime();
  });

  const nextLoteToUse = sortedLotes[0];

  const getExpirationDays = (expiraEm?: string) => {
    if (!expiraEm) return null;
    const diff = new Date(expiraEm).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  };

  const daysLeft = nextLoteToUse ? getExpirationDays(nextLoteToUse.expira_em) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1E1915] rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-[#E8A838] space-y-5 relative animate-fadeIn text-center">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-[#C8B8A0] hover:text-[#F5E9D3] rounded-full bg-[#120F0D]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E8A838] to-[#D1704A] flex items-center justify-center mx-auto shadow-lg text-[#120F0D]">
          <Coins className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-black text-[#F5E9D3]">
            Isso usa {costAmount} Certcoins. Tem certeza? 💛
          </h3>
          <p className="text-xs text-[#C8B8A0] leading-relaxed">
            Você está prestes a usar {costAmount} Certcoins para {actionTitle}.
          </p>
        </div>

        {/* Informação do Lote Utilizado */}
        {nextLoteToUse && (
          <div className="p-3 rounded-2xl bg-[#120F0D] border border-[#382E24] text-xs space-y-1 text-left">
            <div className="flex items-center justify-between text-[#E8A838] font-bold">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Origem do Desconto (FIFO):</span>
              </span>
              <span className="capitalize">{nextLoteToUse.tipo}</span>
            </div>

            <p className="text-[#F5E9D3] font-medium text-[11px]">
              {nextLoteToUse.tipo === 'temp'
                ? `Lote de ${nextLoteToUse.quantidade} Certcoins (expira em ${daysLeft || 30} dias)`
                : `Lote de ${nextLoteToUse.quantidade} Certcoins Vitalícios 💎`}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-[#2A231D] text-[#C8B8A0] hover:text-[#F5E9D3] font-bold text-xs rounded-xl border border-[#382E24]"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-3 golden-button rounded-xl text-xs font-black shadow-md"
          >
            Confirmar e Gastar 💛
          </button>
        </div>
      </div>
    </div>
  );
};
