import React, { useState } from 'react';
import { getEstadoConfig } from '../lib/estados';
import { MapPin, RefreshCw, CheckCircle2 } from 'lucide-react';
import { requestDeviceGPS } from '../lib/geolocation';

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
      const loc = await requestDeviceGPS();
      if (onSelectEstado && loc.sigla) {
        onSelectEstado(loc.sigla);
      }
      if (loc.metodo === 'gps') {
        setFeedbackMsg(`GPS confirmado: ${loc.cidade || loc.nome} (${loc.sigla}) 📍`);
      } else {
        setFeedbackMsg(`Localização mantida: ${loc.nome} (${loc.sigla}) 💛`);
      }
    } catch (err) {
      setFeedbackMsg('Mantendo localização atual.');
    } finally {
      setIsDetecting(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  // Modo Compacto
  if (compact) {
    return (
      <div
        className="flex items-center space-x-1.5 bg-[#120F0D] text-[#F5E9D3] text-xs font-black px-2.5 py-1.5 rounded-xl border shadow-xs"
        style={{ borderColor: currentConfig.cor }}
      >
        <span className="text-sm">{currentConfig.emblem}</span>
        <span className="font-extrabold tracking-wide" style={{ color: currentConfig.cor }}>
          {currentConfig.sigla}
        </span>
        <MapPin className="w-3 h-3 text-[#E8A838]" />
      </div>
    );
  }

  // Modo Completo (Feed e Perfil)
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
                Pessoas de <span style={{ color: currentConfig.cor }}>{currentConfig.nome} ({currentConfig.sigla})</span>
              </h3>
            </div>
            <p className="text-xs text-[#C8B8A0] mt-0.5">
              {currentConfig.saudacao}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleRefreshLocation}
            disabled={isDetecting}
            className="flex items-center space-x-1.5 text-xs text-[#C8B8A0] hover:text-[#F5E9D3] bg-[#120F0D] hover:bg-[#1A1512] px-3 py-1.5 rounded-xl border border-[#382E24] cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#E8A838] ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'Buscando GPS...' : 'Atualizar GPS'}</span>
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
