import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, RefreshCw } from 'lucide-react';
import { LocationDetectionResult, requestDeviceGPS } from '../lib/geolocation';
import { getEstadoConfig } from '../lib/estados';

interface LocationBannerProps {
  currentEstadoSigla: string;
  locationResult: LocationDetectionResult | null;
  onLocationUpdated: (result: LocationDetectionResult) => void;
}

export const LocationBanner: React.FC<LocationBannerProps> = ({
  currentEstadoSigla,
  locationResult,
  onLocationUpdated,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const cfg = getEstadoConfig(currentEstadoSigla);
  const isGps = locationResult?.metodo === 'gps';
  const cidade = locationResult?.cidade || (currentEstadoSigla === 'MG' ? 'Belo Horizonte' : cfg.nome);

  const handleRequestGPS = async () => {
    setIsRequesting(true);
    setStatusMessage('Solicitando autorização do GPS ao navegador...');
    try {
      const res = await requestDeviceGPS();
      onLocationUpdated(res);
      if (res.metodo === 'gps') {
        setStatusMessage(`Localização confirmada via GPS: ${res.cidade || res.nome} (${res.sigla}) 📍`);
      } else if (res.error) {
        setStatusMessage(res.error);
      }
    } catch (e) {
      setStatusMessage('Não foi possível obter o GPS. Mantendo localização padrão.');
    } finally {
      setIsRequesting(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  if (dismissed && isGps) return null;

  return (
    <aside aria-label="Permissão e Detecção de Localização" className="w-full bg-[#18130F] border-b border-[#382E24] px-3 py-2 sm:px-4 text-xs transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left Side: Status */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                isGps ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-[#E8A838]/20 text-[#E8A838] border border-[#E8A838]/40'
              }`}
            >
              {isGps ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Navigation className="w-3.5 h-3.5 text-[#E8A838]" />}
            </div>

            <div className="text-left">
              <div className="flex items-center space-x-1.5 font-bold text-[#F5E9D3]">
                <span>{cfg.emblem}</span>
                <span>
                  {cidade ? `${cidade}, ` : ''}{cfg.nome} ({cfg.sigla})
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    isGps
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-[#2A231D] text-[#C8B8A0] border border-[#382E24]'
                  }`}
                >
                  {isGps ? 'GPS Ativo' : 'GPS Automático'}
                </span>
              </div>
              <p className="text-[11px] text-[#A89880]">
                {statusMessage ? (
                  <span className="text-[#E8A838] font-medium">{statusMessage}</span>
                ) : isGps ? (
                  'Conectando você com pessoas reais e próximas na sua região.'
                ) : (
                  'Autorize a localização no navegador para detectar sua cidade exata.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end">
          {!isGps && (
            <button
              onClick={handleRequestGPS}
              disabled={isRequesting}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-[#E8A838] to-[#D1704A] hover:brightness-110 active:scale-95 text-[#120F0D] font-black px-3 py-1.5 rounded-xl shadow-xs cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRequesting ? 'animate-spin' : ''}`} />
              <span>{isRequesting ? 'Detectando...' : 'Autorizar GPS do Aparelho'}</span>
            </button>
          )}

          {isGps && (
            <button
              onClick={handleRequestGPS}
              disabled={isRequesting}
              title="Atualizar coordenadas de GPS"
              className="flex items-center space-x-1 bg-[#231C16] hover:bg-[#2C241D] text-[#C8B8A0] hover:text-[#F5E9D3] border border-[#382E24] px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all"
            >
              <RefreshCw className={`w-3 h-3 ${isRequesting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar GPS</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
