import React, { useState } from 'react';
import { X, MapPin, Search, Check, Sparkles } from 'lucide-react';
import { ESTADOS_BRASIL, getEstadoConfig } from '../lib/estados';
import { EstadoConfig } from '../types';

interface StateSelectorModalProps {
  isOpen: boolean;
  currentEstadoSigla: string;
  onClose: () => void;
  onSelectEstado: (sigla: string) => void;
}

export const StateSelectorModal: React.FC<StateSelectorModalProps> = ({
  isOpen,
  currentEstadoSigla,
  onClose,
  onSelectEstado,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('todos');

  if (!isOpen) return null;

  const regioes = ['todos', 'Sudeste', 'Nordeste', 'Sul', 'Norte', 'Centro-Oeste'];

  const filteredEstados = ESTADOS_BRASIL.filter((e) => {
    const matchName = e.nome.toLowerCase().includes(searchTerm.toLowerCase()) || e.sigla.toLowerCase().includes(searchTerm.toLowerCase());
    const matchReg = selectedRegion === 'todos' || e.regiao === selectedRegion;
    return matchName && matchReg;
  });

  const handleChoose = (sigla: string) => {
    onSelectEstado(sigla);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1E1915] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border-2 border-[#E8A838] space-y-5 relative max-h-[90vh] flex flex-col animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#C8B8A0] hover:text-[#F5E9D3] rounded-full bg-[#120F0D]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8 shrink-0">
          <div className="flex items-center space-x-2 text-[#E8A838] text-xs font-black uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Expansão Encontro Certo Brasil 🇧🇷</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#F5E9D3]">
            Escolha o Seu Estado 📍
          </h2>
          <p className="text-xs text-[#C8B8A0]">
            Selecione o seu estado para se conectar com pessoas da sua região e ver o app adaptado com o jeitinho de onde você mora! 💛
          </p>
        </div>

        {/* Search & Region Filter Bar */}
        <div className="space-y-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#C8B8A0]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar estado por nome ou sigla (ex: Minas, RJ, Bahia...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#120F0D] border border-[#382E24] text-xs text-[#F5E9D3] placeholder-[#C8B8A0]/50 focus:outline-none focus:border-[#E8A838]"
            />
          </div>

          <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {regioes.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 border ${
                  selectedRegion === reg
                    ? 'bg-[#E8A838] text-[#120F0D] border-[#E8A838] shadow-xs'
                    : 'bg-[#120F0D] text-[#C8B8A0] border-[#382E24] hover:border-[#E8A838]/40'
                }`}
              >
                {reg === 'todos' ? '🇧🇷 Todos os Estados' : reg}
              </button>
            ))}
          </div>
        </div>

        {/* States Grid List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {regioes
            .filter((r) => r !== 'todos' && (selectedRegion === 'todos' || selectedRegion === r))
            .map((regiao) => {
              const estadosDaRegiao = filteredEstados.filter((e) => e.regiao === regiao);
              if (estadosDaRegiao.length === 0) return null;

              return (
                <div key={regiao} className="space-y-2">
                  <div className="text-[11px] font-black uppercase text-[#E8A838] tracking-wider border-b border-[#382E24] pb-1 flex items-center justify-between">
                    <span>Região {regiao}</span>
                    <span className="text-[10px] text-[#C8B8A0]">({estadosDaRegiao.length} estados)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {estadosDaRegiao.map((est) => {
                      const isSelected = est.sigla === currentEstadoSigla;

                      return (
                        <div
                          key={est.sigla}
                          onClick={() => handleChoose(est.sigla)}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                            isSelected
                              ? 'bg-[#2A231D] border-[#E8A838] shadow-md'
                              : 'bg-[#120F0D] border-[#382E24] hover:border-[#E8A838]/50 hover:bg-[#1E1915]'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border font-black shrink-0"
                              style={{
                                backgroundColor: `${est.cor}20`,
                                borderColor: est.cor,
                              }}
                            >
                              {est.emblem}
                            </div>

                            <div>
                              <div className="flex items-center space-x-1.5">
                                <h4 className="font-bold text-xs text-[#F5E9D3]">
                                  {est.nome}
                                </h4>
                                <span
                                  className="text-[10px] font-black px-1.5 py-0.5 rounded-md text-[#120F0D]"
                                  style={{ backgroundColor: est.cor }}
                                >
                                  {est.sigla}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#C8B8A0] line-clamp-1 mt-0.5">
                                {est.saudacao}
                              </p>
                            </div>
                          </div>

                          {isSelected ? (
                            <span className="w-6 h-6 rounded-full bg-[#E8A838] text-[#120F0D] flex items-center justify-center font-bold text-xs shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="text-xs text-[#C8B8A0] opacity-0 group-hover:opacity-100 transition-opacity text-right">
                              Escolher ➔
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#382E24] flex items-center justify-between text-xs text-[#C8B8A0] shrink-0">
          <span>O estado selecionado será salvo no seu dispositivo 📱</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2A231D] text-[#F5E9D3] font-bold rounded-xl border border-[#382E24]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
