import React from 'react';
import { Settings, Bell, MapPin, Eye, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  currentUser: UserProfile;
  onUpdateSettings: (updates: Partial<UserProfile>) => void;
  onOpenProfileEdit: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onUpdateSettings,
  onOpenProfileEdit,
}) => {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-orange-100 dark:border-zinc-800 space-y-6">
        <div>
          <h2 className="text-xl font-black text-zinc-800 dark:text-zinc-100 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-orange-500" />
            <span>Configurações & Preferências</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Personalize sua experiência no Encontro Certo MG.
          </p>
        </div>

        {/* Edit Profile button */}
        <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-100">Meu Perfil</h4>
            <p className="text-xs text-zinc-500">Alterar fotos, descrição, tipo de perfil e dados</p>
          </div>
          <button
            onClick={onOpenProfileEdit}
            className="px-4 py-2 bg-orange-500 text-white font-bold text-xs rounded-xl shadow"
          >
            Editar Perfil 💛
          </button>
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-orange-500" />
            <div>
              <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-100">Aparecer na Busca</h4>
              <p className="text-xs text-zinc-500">Se desativado, você fica invisível na descoberta, mas continua vendo os outros</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={currentUser.exibir_na_busca}
            onChange={(e) => onUpdateSettings({ exibir_na_busca: e.target.checked })}
            className="w-5 h-5 accent-orange-500 cursor-pointer"
          />
        </div>

        {/* Search Radius */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-3">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-orange-500" />
            <div>
              <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-100">Raio de Busca Padrão</h4>
              <p className="text-xs text-zinc-500">Distância máxima para encontrar matches em Minas</p>
            </div>
          </div>
          <select
            value={currentUser.raio_busca}
            onChange={(e) => onUpdateSettings({ raio_busca: parseInt(e.target.value) })}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold"
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
            <option value={100}>100+ km</option>
          </select>
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-orange-500" />
            <div>
              <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-100">Notificações Push com PNL</h4>
              <p className="text-xs text-zinc-500">Receber avisos carinhosos quando alguém te mandar mensagem ou match</p>
            </div>
          </div>
          <input
            type="checkbox"
            defaultChecked
            className="w-5 h-5 accent-orange-500 cursor-pointer"
            onChange={(e) => {
              if (e.target.checked) {
                alert('Quer receber um aviso quando alguém te mandar mensagem? 💛 (Ativado com sucesso!)');
              }
            }}
          />
        </div>

        {/* Logout / Switch Account */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => {
              localStorage.removeItem('encontro_certo_current_user');
              window.location.reload();
            }}
            className="w-full py-3 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 font-bold text-xs hover:bg-pink-100 transition-colors"
          >
            Sair / Trocar de Conta 🚪
          </button>
        </div>
      </div>
    </div>
  );
};
