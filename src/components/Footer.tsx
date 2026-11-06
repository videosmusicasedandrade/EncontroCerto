import React from 'react';
import { Shield, FileText, Info, Mail, Heart, DollarSign, ExternalLink } from 'lucide-react';
import { EstadoConfig } from '../types';

interface FooterProps {
  estadoConfig: EstadoConfig;
  onOpenCompliance: (tab: 'privacy' | 'terms' | 'about' | 'contact' | 'adsense') => void;
}

export function Footer({ estadoConfig, onOpenCompliance }: FooterProps) {
  return (
    <footer className="w-full bg-[#120F0D] border-t border-[#382E24] pt-8 pb-20 md:pb-8 px-4 text-[#C8B8A0] text-xs mt-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-[#382E24]">
          {/* Col 1: Branding & State info */}
          <div className="space-y-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-[#120F0D]"
                style={{ backgroundColor: estadoConfig.cor }}
              >
                EC
              </div>
              <span className="font-black text-sm text-[#F5E9D3]">Encontro Certo Brasil</span>
            </div>
            <p className="text-[11px] text-[#C8B8A0] leading-relaxed">
              O aplicativo de amizade e relacionamento que fala a sua língua em qualquer estado do Brasil. 💛
            </p>
            <div className="pt-1 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] bg-[#1E1915] border border-[#382E24] text-[#F5E9D3]">
                {estadoConfig.emblem} Estado Ativo: <strong>{estadoConfig.nome} ({estadoConfig.sigla})</strong>
              </span>
            </div>
          </div>

          {/* Col 2: Compliance & Legal */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-[#F5E9D3] uppercase tracking-wider">Políticas e LGPD</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => onOpenCompliance('privacy')}
                  className="hover:text-[#F5E9D3] transition-colors flex items-center gap-1"
                >
                  <Shield className="w-3 h-3 text-[#E8A838]" />
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenCompliance('terms')}
                  className="hover:text-[#F5E9D3] transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-[#E8A838]" />
                  Termos de Uso e Serviço
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenCompliance('privacy')}
                  className="hover:text-[#F5E9D3] transition-colors flex items-center gap-1"
                >
                  <Info className="w-3 h-3 text-[#E8A838]" />
                  Preferências de Cookies
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Institucional */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-[#F5E9D3] uppercase tracking-wider">Institucional</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => onOpenCompliance('about')}
                  className="hover:text-[#F5E9D3] transition-colors flex items-center gap-1"
                >
                  <Info className="w-3 h-3 text-[#E8A838]" />
                  Sobre Nós (Quem Somos)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenCompliance('contact')}
                  className="hover:text-[#F5E9D3] transition-colors flex items-center gap-1"
                >
                  <Mail className="w-3 h-3 text-[#E8A838]" />
                  Fale Conosco & Suporte
                </button>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#F5E9D3] transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3 text-[#E8A838]" />
                  Sitemap XML
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Google AdSense Status */}
          <div className="space-y-2 bg-[#1E1915] p-3 rounded-2xl border border-[#382E24]">
            <h4 className="font-bold text-xs text-[#F5E9D3] flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#E8A838]" />
              Google AdSense Status
            </h4>
            <p className="text-[10px] text-[#C8B8A0]">
              Site configurado com arquivos estáticos <code>ads.txt</code>, <code>robots.txt</code>, dados estruturados JSON-LD e conformidade LGPD.
            </p>
            <button
              onClick={() => onOpenCompliance('adsense')}
              className="w-full py-1.5 px-2 bg-[#2A231D] hover:bg-[#382E24] text-[10px] font-bold text-[#E8A838] rounded-xl border border-[#382E24] transition-colors flex items-center justify-center gap-1"
            >
              Configurar ID de Publicador ➔
            </button>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[#C8B8A0]">
          <p>© {new Date().getFullYear()} Encontro Certo Brasil Tecnologia Ltda. Todos os direitos reservados.</p>
          <div className="flex items-center gap-1">
            <span>Feito com</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>para todo o Brasil</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
