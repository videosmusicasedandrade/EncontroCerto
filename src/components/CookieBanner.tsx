import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X } from 'lucide-react';
import { EstadoConfig } from '../types';

interface CookieBannerProps {
  estadoConfig: EstadoConfig;
  onOpenPrivacy: () => void;
}

export function CookieBanner({ estadoConfig, onOpenPrivacy }: CookieBannerProps) {
  const [accepted, setAccepted] = useState<boolean>(true);

  useEffect(() => {
    const consent = localStorage.getItem('encontro_certo_cookie_consent');
    if (!consent) {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('encontro_certo_cookie_consent', 'accepted');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 right-4 max-w-3xl mx-auto z-50 bg-[#1E1915] border border-[#382E24] shadow-2xl rounded-2xl p-4 md:p-5 text-[#F5E9D3] backdrop-blur-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
            style={{ backgroundColor: `${estadoConfig.cor}15`, borderColor: estadoConfig.cor, color: estadoConfig.cor }}
          >
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm flex items-center gap-2 text-[#F5E9D3]">
              Respeito à sua Privacidade e LGPD {estadoConfig.emblem}
            </h4>
            <p className="text-xs text-[#C8B8A0] leading-relaxed">
              Utilizamos cookies essenciais e identificadores para personalizar anúncios do <strong>Google AdSense</strong>, 
              medir audiência e oferecer a melhor experiência no {estadoConfig.nome}. Ao prosseguir, você concorda com nossos termos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
          <button
            onClick={onOpenPrivacy}
            className="text-xs text-[#C8B8A0] underline hover:text-[#F5E9D3] px-2 py-1"
          >
            Política de Privacidade
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#120F0D] transition-transform active:scale-95 shadow-md flex items-center gap-1.5"
            style={{ backgroundColor: estadoConfig.cor }}
          >
            <ShieldCheck className="w-4 h-4" />
            Entendi e Aceito
          </button>
        </div>
      </div>
    </div>
  );
}
