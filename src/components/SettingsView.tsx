import React, { useState } from 'react';
import { Settings, Bell, MapPin, Eye, DollarSign, Shield, Globe2, LogOut } from 'lucide-react';
import { UserProfile, EstadoConfig } from '../types';
import { StateSelector } from './StateSelector';
import { StateSelectorModal } from './StateSelectorModal';

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
  const [showStateModal, setShowStateModal] = useState(false);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6 text-[#F5E9D3]">
      {/* State Selector Card */}
      <StateSelector
        currentEstadoSigla={estadoConfig.sigla}
        onSelectEstado={onSelectEstado}
      />

      <div className="bg-[#1E1915] rounded-3xl p-6 shadow-md border border-[#382E24] space-y-6">
        <div>
          <h2 className="text-xl font-black text-[#F5E9D3] flex items-center space-x-2">
            <Settings className="w-5 h-5" style={{ color: estadoConfig.cor }} />
            <span>⚙️ Configurações & Preferências ({estadoConfig.nome})</span>
          </h2>
          <p className="text-xs text-[#C8B8A0] mt-0.5">
            Personalize sua experiência no Encontro Certo Brasil.
          </p>
        </div>

        {/* Localização Automática */}
        <div className="p-4 rounded-2xl bg-[#2A231D] border border-[#382E24] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe2 className="w-5 h-5" style={{ color: estadoConfig.cor }} />
            <div>
              <h4 className="font-bold text-sm text-[#F5E9D3]">Localização Automática 📍</h4>
              <p className="text-xs text-[#C8B8A0]">
                Definida automaticamente ({estadoConfig.nome} - {estadoConfig.sigla}) via GPS/IP
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-[#120F0D] text-[11px] font-bold text-[#E8A838] border border-[#382E24]">
            Automático
          </span>
        </div>

        {/* 2. Editar Perfil */}
        <div className="p-4 rounded-2xl bg-[#120F0D] border border-[#382E24] flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-[#F5E9D3]">Meu Perfil</h4>
            <p className="text-xs text-[#C8B8A0]">Alterar fotos, descrição e preferências</p>
          </div>
          <button
            onClick={onOpenProfileEdit}
            className="px-4 py-2 bg-[#2A231D] text-[#E8A838] border border-[#E8A838]/40 hover:bg-[#382E24] rounded-xl text-xs font-bold"
          >
            Editar Perfil {estadoConfig.emblem}
          </button>
        </div>

        {/* 3. Visibilidade na Busca */}
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

        {/* 4. Raio de Busca */}
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

        {/* 5. Notificações Push */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#120F0D] border border-[#382E24]">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5" style={{ color: estadoConfig.cor }} />
            <div>
              <h4 className="font-bold text-sm text-[#F5E9D3]">Notificações</h4>
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

        {/* AdSense & Transparência */}
        {onOpenCompliance && (
          <div className="p-4 rounded-2xl bg-[#2A231D] border border-[#382E24] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#F5E9D3] flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-[#E8A838]" />
                  Google AdSense & Transparência LGPD
                </h4>
                <p className="text-xs text-[#C8B8A0]">
                  Consulte Políticas de Privacidade, Termos e Arquivo ads.txt
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

        {/* 6. Sair (Prompt 3.1: "Ir embora… volta quando quiser 💛") */}
        <div className="pt-4 border-t border-[#382E24] space-y-2">
          <button
            onClick={() => {
              if (confirm(`Deseja realmente sair da sua conta?\n\nIr embora… volta quando quiser 💛`)) {
                localStorage.removeItem('encontro_certo_current_user');
                window.location.reload();
              }
            }}
            className="w-full py-3.5 rounded-2xl bg-[#2A231D] hover:bg-red-950/40 text-[#D1704A] font-black text-xs border border-[#382E24] transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4 text-[#D1704A]" />
            <span>Ir embora… volta quando quiser 💛</span>
          </button>
        </div>
      </div>
    </div>
  );
};
