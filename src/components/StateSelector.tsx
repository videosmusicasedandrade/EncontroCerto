import React from 'react';
import { ESTADOS_BRASIL, getEstadoConfig } from '../lib/estados';
import { EstadoConfig } from '../types';
import { MapPin, Sparkles } from 'lucide-react';

interface StateSelectorProps {
  currentEstadoSigla: string;
  onSelectEstado: (sigla: string) => void;
  compact?: boolean;
}

export const StateSelector: React.FC<StateSelectorProps> = ({
  currentEstadoSigla,
  onSelectEstado,
  compact = false,
}) => {
  const currentConfig = getEstadoConfig(currentEstadoSigla);

  if (compact) {
    return (
      <div className="relative inline-block">
        <select
          value={currentConfig.sigla}
          onChange={(e) => onSelectEstado(e.target.value)}
          style={{ borderColor: currentConfig.cor }}
          className="appearance-none bg-[#120F0D] text-[#F5E9D3] text-xs font-black px-3 py-1.5 pr-7 rounded-xl border border-[#382E24] cursor-pointer hover:bg-[#2A231D] transition-colors focus:outline-none"
        >
          {ESTADOS_BRASIL.map((est) => (
            <option key={est.sigla} value={est.sigla}>
              {est.emblem} {est.sigla} — {est.nome}
            </option>
          ))}
        </select>
        <span className="absolute right-2 top-2 pointer-events-none text-[10px] text-[#C8B8A0]">
          ▼
        </span>
      </div>
    );
  }

  const regioes = ['Sudeste', 'Nordeste', 'Sul', 'Norte', 'Centro-Oeste'] as const;

  return (
    <div className="bg-[#1E1915] rounded-3xl p-5 border border-[#382E24] shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-xs"
            style={{ backgroundColor: `${currentConfig.cor}25`, border: `1px solid ${currentConfig.cor}` }}
          >
            {currentConfig.emblem}
          </div>
          <div>
            <h3 className="font-black text-sm text-[#F5E9D3] flex items-center space-x-1.5">
              <span>Estado Atual:</span>
              <span style={{ color: currentConfig.cor }}>{currentConfig.nome} ({currentConfig.sigla})</span>
            </h3>
            <p className="text-xs text-[#C8B8A0]">
              Troque de estado e assista o app se transformar culturalmente e visualmente!
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-[#C8B8A0] font-bold">Troca Rápida:</span>
          <select
            value={currentConfig.sigla}
            onChange={(e) => onSelectEstado(e.target.value)}
            style={{ borderColor: currentConfig.cor }}
            className="bg-[#120F0D] text-[#F5E9D3] text-xs font-black px-3 py-2 rounded-xl border focus:outline-none"
          >
            {ESTADOS_BRASIL.map((est) => (
              <option key={est.sigla} value={est.sigla}>
                {est.emblem} {est.nome} ({est.sigla})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid das Regiões */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-[#382E24]">
        {regioes.map((reg) => {
          const estadosDaRegiao = ESTADOS_BRASIL.filter((e) => e.regiao === reg);
          return (
            <div key={reg} className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-[#C8B8A0] tracking-wider block">
                {reg}
              </span>
              <div className="flex flex-wrap gap-1">
                {estadosDaRegiao.map((est) => {
                  const isSelected = est.sigla === currentConfig.sigla;
                  return (
                    <button
                      key={est.sigla}
                      onClick={() => onSelectEstado(est.sigla)}
                      style={{
                        backgroundColor: isSelected ? est.cor : '#120F0D',
                        color: isSelected ? '#120F0D' : '#F5E9D3',
                        borderColor: isSelected ? est.cor : '#382E24',
                      }}
                      className="px-2 py-1 rounded-lg text-[11px] font-extrabold border transition-all hover:scale-105 active:scale-95 flex items-center space-x-1"
                      title={est.nome}
                    >
                      <span>{est.emblem}</span>
                      <span>{est.sigla}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
