import React from 'react';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { LocationDetectionResult } from '../lib/geolocation';
import { getEstadoConfig } from '../lib/estados';

interface LocationBannerProps {
  currentEstadoSigla: string;
  locationResult: LocationDetectionResult | null;
}

export const LocationBanner: React.FC<LocationBannerProps> = ({
  currentEstadoSigla,
  locationResult,
}) => {
  const cfg = getEstadoConfig(currentEstadoSigla);
  const isGps = locationResult?.metodo === 'gps';
  const cidade = locationResult?.cidade || (currentEstadoSigla === 'MG' ? 'Belo Horizonte' : cfg.nome);

  return (
    <aside aria-label="Status de Localização" className="w-full bg-[#18130F] border-b border-[#382E24] px-3 py-2 sm:px-4 text-xs transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/25 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="text-left">
            <div className="flex items-center space-x-1.5 font-bold text-[#F5E9D3]">
              <span>{cfg.emblem}</span>
              <span>
                {cidade ? `${cidade}, ` : ''}{cfg.nome} ({cfg.sigla})
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black bg-emerald-950 text-emerald-400 border border-emerald-800">
                GPS Ativo 📍
              </span>
            </div>
            <p className="text-[11px] text-[#A89880]">
              Localização detectada automaticamente. Atualização a cada 30 minutos em segundo plano.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
