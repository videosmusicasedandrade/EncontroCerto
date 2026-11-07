import React, { useState } from 'react';
import { getEstadoConfig } from '../lib/estados';
import { EstadoConfig } from '../types';
import { MapPin, Lock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { detectUserLocation } from '../lib/geolocation';

interface StateSelectorProps {
  currentEstadoSigla: string;
  onSelectEstado?: (sigla: string) => void;
  compact?: boolean;
}

export const StateSelector: React.FC<StateSelectorProps> = ({
  currentEstadoSigla,
  onSelectEstado,
  compact = false,
}) => {
  const currentConfig = getEstadoConfig(currentEstadoSigla);
  const [isDetecting, setIsDetecting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleRefreshLocation = async () => {
    setIsDetecting(true);
    setFeedbackMsg(null);
    try {
      const loc = await detectUserLocation((updated) => {
        if (onSelectEstado) {
          onSelectEstado(updated.sigla);
        }
      });

      if (onSelectEstado && loc.sigla) {
        onSelectEstado(loc.sigla);
      }
      setFeedbackMsg(`Localização confirmada: ${loc.nome} (${loc.sigla}) 📍`);
    } catch (err) {
      setFeedbackMsg('Localização mantida com sucesso.');
    } finally {
      setIsDetecting(false);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  // Modo Compacto (exibido na Barra de Navegação)
  if (compact) {
    return (
      <div
        className="flex items-center space-x-1.5 bg-[#120F0D] text-[#F5E9D3] text-xs font-black px-2.5 py-1.5 rounded-xl border shadow-xs"
        style={{ borderColor: currentConfig.cor }}
        title={`📍 Localização detectada automaticamente: ${currentConfig.nome} (${currentConfig.sigla}) - Fixo por localização`}
      >
        <span className="text-sm">{currentConfig.emblem}</span>
        <span className="font-extrabold tracking-wide">{currentConfig.sigla}</span>
        <span className="text-[10px] text-[#C8B8A0] flex items-center" title="Definido por geolocalização">
          <Lock className="w-3 h-3 text-[#C8B8A0]/70 ml-0.5" />
        </span>
      </div>
    );
  }

  // Modo Completo (exibido no Feed e Configurações)
  return (
    <div className="bg-[#1E1915] rounded-3xl p-5 border border-[#382E24] shadow-md space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-xs shrink-0"
            style={{ backgroundColor: `${currentConfig.cor}25`, border: `1px solid ${currentConfig.cor}` }}
          >
            {currentConfig.emblem}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-sm text-[#F5E9D3]">
                Localização Atual: <span style={{ color: currentConfig.cor }}>{currentConfig.nome} ({currentConfig.sigla})</span>
              </h3>
              <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#120F0D] text-[#C8B8A0] border border-[#382E24]">
                <Lock className="w-2.5 h-2.5 text-[#E8A838]" />
                <span>Fixado por GPS/Rede</span>
              </span>
            </div>
            <p className="text-xs text-[#C8B8A0] mt-0.5">
              Identificado automaticamente pela sua localização. O app está adaptado à cultura e gente de {currentConfig.nome}.
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <button
            onClick={handleRefreshLocation}
            disabled={isDetecting}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#120F0D] hover:bg-[#2A231D] text-[#F5E9D3] border border-[#382E24] transition-all flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
            title="Verificar novamente minha posição por GPS ou Rede"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#E8A838] ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'Detectando…' : 'Atualizar Localização'}</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="text-xs p-2.5 rounded-xl bg-[#120F0D] border border-emerald-500/30 text-emerald-400 flex items-center space-x-1.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}
    </div>
  );
};
