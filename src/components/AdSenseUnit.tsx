import React, { useEffect } from 'react';
import { DollarSign, ShieldAlert, Sparkles } from 'lucide-react';
import { EstadoConfig } from '../types';

interface AdSenseUnitProps {
  slotId?: string;
  pubId?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  estadoConfig: EstadoConfig;
  label?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdSenseUnit({ slotId = '1234567890', pubId, format = 'auto', estadoConfig, label = 'Espaço Patrocinado' }: AdSenseUnitProps) {
  const activePubId = pubId || localStorage.getItem('encontro_certo_adsense_pubid') || 'ca-pub-0000000000000000';

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && activePubId && activePubId !== 'ca-pub-0000000000000000') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.warn('AdSense block init notice:', err);
    }
  }, [activePubId, slotId]);

  const isConfigured = activePubId && activePubId !== 'ca-pub-0000000000000000';

  return (
    <div className="w-full my-4 rounded-2xl bg-[#1E1915] border border-[#382E24] p-3 text-center overflow-hidden shadow-md">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#382E24]/60 text-[10px] uppercase tracking-wider text-[#C8B8A0]">
        <span className="flex items-center gap-1 font-semibold">
          <Sparkles className="w-3 h-3 text-[#E8A838]" />
          {label} — Google AdSense
        </span>
        <span className="bg-[#2A231D] px-2 py-0.5 rounded text-[9px] border border-[#382E24]">
          {isConfigured ? 'Anúncio Ativo' : 'Aguardando Código do AdSense'}
        </span>
      </div>

      {isConfigured ? (
        <div className="min-h-[100px] flex items-center justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client={activePubId}
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        <div className="py-4 px-3 bg-[#120F0D] rounded-xl border border-dashed border-[#382E24] flex flex-col items-center justify-center gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5E9D3]">
            <DollarSign className="w-4 h-4 text-[#E8A838]" />
            Espaço Reservado para Anúncios
          </div>
          <p className="text-[11px] text-[#C8B8A0] max-w-md">
            Assim que seu site for aprovado no <strong>Google AdSense</strong>, os anúncios aparecerão automaticamente nesta área.
          </p>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-[#E8A838]">
            <ShieldAlert className="w-3 h-3" />
            <span>Configurado com as regras do Google AdSense (ads.txt, sitemap & LGPD)</span>
          </div>
        </div>
      )}
    </div>
  );
}
