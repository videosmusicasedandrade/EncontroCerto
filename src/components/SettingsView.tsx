import React from 'react';
import { Settings, Bell, MapPin, Eye, DollarSign, Shield, FileText, Info } from 'lucide-react';
import { UserProfile, EstadoConfig } from '../types';
import { StateSelector } from './StateSelector';

interface SettingsViewProps {
  currentUser: UserProfile;
  estadoConfig: EstadoConfig;
  onSelectEstado: (sigla: string) => void;
  onUpdateSettings: (updates: Partial<UserProfile>) => void;
  onOpenProfileEdit: () => void;
  onOpenCompliance?: (tab: 'privacy' | 'terms' | 'about' | 'contact' | 'adsense') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  estadoConfig,
  onSelectEstado,
  onUpdateSettings,
  onOpenProfileEdit,
  onOpenCompliance,
}) => {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      {/* State Selector */}
      <StateSelector
        currentEstadoSigla={estadoConfig.sigla}
        onSelectEstado={onSelectEstado}
      />

      <div className="bg-[#1E1915] rounded-3xl p-6 shadow-md border border-[#382E24] space-y-6">
        <div>
          <h2 className="text-xl font-black text-[#F5E9D3] flex items-center space-x-2">
            <Settings className="w-5 h-5" style={{ color: estadoConfig.cor }} />
            <span>Configurações & Preferências ({estadoConfig.nome})</span>
          </h2>
          <p className="text-xs text-[#C8B8A0] mt-0.5">
            Personalize sua experiência no Encontro Certo Brasil.
          </p>
        </div>

        {/* Edit Profile button */}
        <div className="p-4 rounded-2xl bg-[#2A231D] border border-[#382E24] flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-[#F5E9D3]">Meu Perfil</h4>
            <p className="text-xs text-[#C8B8A0]">Alterar fotos, descrição, tipo de perfil e estado</p>
          </div>
          <button
            onClick={onOpenProfileEdit}
            className="px-4 py-2 golden-button rounded-xl text-xs"
          >
            Editar Perfil {estadoConfig.emblem}
          </button>
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#120F0D] border border-[#382E24]">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5" style={{ color: estadoConfig.cor }} />
            <div>
              <h4 className="font-bold text-sm text-[#F5E9D3]">Aparecer na Busca</h4>
              <p className="text-xs text-[#C8B8A0]">Se desativado, você fica invisível na descoberta, mas continua vendo os outros</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={currentUser.exibir_na_busca}
            onChange={(e) => onUpdateSettings({ exibir_na_busca: e.target.checked })}
            className="w-5 h-5 cursor-pointer"
            style={{ accentColor: estadoConfig.cor }}
          />
        </div>

        {/* Search Radius */}
        <div className="p-4 rounded-2xl bg-[#120F0D] border border-[#382E24] space-y-3">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5" style={{ color: estadoConfig.cor }} />
            <div>
              <h4 className="font-bold text-sm text-[#F5E9D3]">Raio de Busca Padrão</h4>
              <p className="text-xs text-[#C8B8A0]">Distância máxima para encontrar matches em {estadoConfig.nome}</p>
            </div>
          </div>
          <select
            value={currentUser.raio_busca}
            onChange={(e) => onUpdateSettings({ raio_busca: parseInt(e.target.value) })}
            className="w-full px-4 py-2.5 rounded-xl border border-[#382E24] bg-[#1E1915] text-[#F5E9D3] text-sm font-bold focus:outline-none"
            style={{ borderColor: estadoConfig.cor }}
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
            <option value={100}>100+ km</option>
          </select>
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#120F0D] border border-[#382E24]">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5" style={{ color: estadoConfig.cor }} />
            <div>
              <h4 className="font-bold text-sm text-[#F5E9D3]">Notificações Push com PNL</h4>
              <p className="text-xs text-[#C8B8A0]">Receber avisos carinhosos quando alguém te mandar mensagem ou match</p>
            </div>
          </div>
          <input
            type="checkbox"
            defaultChecked
            className="w-5 h-5 cursor-pointer"
            style={{ accentColor: estadoConfig.cor }}
            onChange={(e) => {
              if (e.target.checked) {
                alert(`Quer receber um aviso quando alguém te mandar mensagem? ${estadoConfig.emblem} (Ativado com sucesso!)`);
              }
            }}
          />
        </div>

        {/* AdSense & Legal Section */}
        {onOpenCompliance && (
          <div className="p-4 rounded-2xl bg-[#2A231D] border border-[#382E24] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#F5E9D3] flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-[#E8A838]" />
                  Google AdSense & Transparência LGPD
                </h4>
                <p className="text-xs text-[#C8B8A0]">
                  Gere receita com anúncios e consulte Políticas de Privacidade, Termos e Arquivo ads.txt
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onOpenCompliance('adsense')}
                className="py-2 px-3 rounded-xl bg-[#120F0D] hover:bg-[#1E1915] border border-[#382E24] text-[11px] font-bold text-[#E8A838] flex items-center justify-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" />
                Painel AdSense
              </button>

              <button
                onClick={() => onOpenCompliance('privacy')}
                className="py-2 px-3 rounded-xl bg-[#120F0D] hover:bg-[#1E1915] border border-[#382E24] text-[11px] font-bold text-[#F5E9D3] flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-[#E8A838]" />
                Privacidade LGPD
              </button>
            </div>
          </div>
        )}

        {/* Logout / Switch Account with State Farewell phrase */}
        <div className="pt-4 border-t border-[#382E24] space-y-2">
          <p className="text-xs text-center text-[#C8B8A0] italic">
            "{estadoConfig.despedida}"
          </p>
          <button
            onClick={() => {
              if (confirm(`${estadoConfig.despedida}\n\nDeseja realmente sair da sua conta?`)) {
                localStorage.removeItem('encontro_certo_current_user');
                window.location.reload();
              }
            }}
            className="w-full py-3 rounded-2xl bg-[#2A231D] hover:bg-red-950/40 text-[#D1704A] font-extrabold text-xs border border-[#382E24] transition-colors"
          >
            Sair da Conta 🚪
          </button>
        </div>
      </div>
    </div>
  );
};
