import React from 'react';
import { Heart, Coins, Bell, Shield, Settings, Sparkles, User, MessageCircle, Gamepad2, Compass, Home, Trophy, MapPin } from 'lucide-react';
import { UserProfile, CertcoinLote, NotificacaoPush, EstadoConfig } from '../types';
import { StateSelector } from './StateSelector';

interface NavbarProps {
  currentUser: UserProfile | null;
  estadoConfig: EstadoConfig;
  onSelectEstado: (sigla: string) => void;
  lotes: CertcoinLote[];
  notificacoes: NotificacaoPush[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCertcoins: () => void;
  onOpenNotifications: () => void;
  onlineCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  estadoConfig,
  onSelectEstado,
  lotes,
  notificacoes,
  activeTab,
  setActiveTab,
  onOpenCertcoins,
  onOpenNotifications,
  onlineCount,
}) => {
  const totalTemp = lotes
    .filter((l) => l.tipo === 'temp')
    .reduce((acc, l) => acc + l.quantidade, 0);
  const totalVitalicio = lotes
    .filter((l) => l.tipo === 'vitalicio')
    .reduce((acc, l) => acc + l.quantidade, 0);

  const unreadNotifs = notificacoes.filter((n) => !n.lida).length;

  return (
    <header className="sticky top-0 z-50 bg-[#1E1915]/95 backdrop-blur-md border-b border-[#382E24] shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo, State Emblem & Online Counter */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('feed')}>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-md animate-heartbeat shrink-0 transition-all"
              style={{
                background: `linear-gradient(135deg, ${estadoConfig.cor} 0%, #D1704A 100%)`,
              }}
            >
              <Heart className="w-6 h-6 text-[#120F0D] fill-[#120F0D]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-base sm:text-lg text-[#F5E9D3] whitespace-nowrap">
                  Encontro Certo
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-black text-[#120F0D] shadow-2xs"
                  style={{ backgroundColor: estadoConfig.cor }}
                >
                  {estadoConfig.emblem} {estadoConfig.sigla}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] text-[#C8B8A0] font-medium whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping shrink-0"></span>
                <span>{onlineCount} pessoas online em {estadoConfig.sigla}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#120F0D] p-1 rounded-2xl border border-[#382E24]">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'feed'
                  ? 'bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] shadow-sm'
                  : 'text-[#C8B8A0] hover:text-[#E8A838]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Início</span>
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'discover'
                  ? 'bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] shadow-sm'
                  : 'text-[#C8B8A0] hover:text-[#E8A838]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Descobrir</span>
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'matches'
                  ? 'bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] shadow-sm'
                  : 'text-[#C8B8A0] hover:text-[#E8A838]'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Mensagens</span>
            </button>
            <button
              onClick={() => setActiveTab('games')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'games'
                  ? 'bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] shadow-sm'
                  : 'text-[#C8B8A0] hover:text-[#E8A838]'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Jogos ☕</span>
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] shadow-sm'
                  : 'text-[#C8B8A0] hover:text-[#E8A838]'
              }`}
            >
              <Trophy className="w-4 h-4 text-[#F0C040]" />
              <span>Ranking 🏆</span>
            </button>
            {currentUser?.isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-purple-400 hover:bg-purple-900/30'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Painel Admin</span>
              </button>
            )}
          </nav>

          {/* Right Actions: State Selector, Certcoins, Notifications, Settings, Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* State Indicator */}
            <div className="flex items-center space-x-1 bg-[#120F0D] px-3 py-1.5 rounded-full border border-[#382E24] text-[#E8A838] font-bold text-xs">
              <MapPin className="w-3 h-3" />
              <span>{estadoConfig.nome}</span>
            </div>

            {/* Certcoins Pill */}
            <button
              onClick={onOpenCertcoins}
              className="flex items-center space-x-1.5 bg-[#2A231D] hover:bg-[#382E24] border border-[#E8A838]/40 px-2.5 py-1.5 rounded-full shadow-xs transition-transform active:scale-95"
              title="Clique para ver os Certcoins"
            >
              <Coins className="w-4 h-4 text-[#E8A838] shrink-0" />
              <div className="text-[11px] sm:text-xs font-black text-[#F5E9D3] whitespace-nowrap">
                <span>{totalTemp} temp</span>
                <span className="mx-0.5 text-[#E8A838]">•</span>
                <span>{totalVitalicio} vit</span>
              </div>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-full hover:bg-[#2A231D] text-[#C8B8A0] transition-colors"
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#D1704A] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-full transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[#2A231D] text-[#E8A838]'
                  : 'hover:bg-[#2A231D] text-[#C8B8A0]'
              }`}
              title="Configurações"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Profile Avatar */}
            {currentUser && (
              <div
                onClick={() => setActiveTab('profile')}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#E8A838] cursor-pointer shadow-sm hover:opacity-95 transition-opacity shrink-0"
              >
                <img src={currentUser.foto} alt={currentUser.nome} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Início | Mensagens | Perfil */}
      <div className="md:hidden flex items-center justify-around bg-[#1E1915] border-t border-[#382E24] py-2 px-1 fixed bottom-0 left-0 right-0 z-50">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center text-[10px] font-black ${
            activeTab === 'feed' ? 'text-[#E8A838]' : 'text-[#C8B8A0]'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          Início
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center text-[10px] font-black ${
            activeTab === 'discover' ? 'text-[#E8A838]' : 'text-[#C8B8A0]'
          }`}
        >
          <Compass className="w-4 h-4 mb-0.5" />
          Descobrir
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex flex-col items-center text-[10px] font-black ${
            activeTab === 'matches' ? 'text-[#E8A838]' : 'text-[#C8B8A0]'
          }`}
        >
          <MessageCircle className="w-4 h-4 mb-0.5" />
          Mensagens
        </button>
        <button
          onClick={() => setActiveTab('games')}
          className={`flex flex-col items-center text-[10px] font-black ${
            activeTab === 'games' ? 'text-[#E8A838]' : 'text-[#C8B8A0]'
          }`}
        >
          <Gamepad2 className="w-4 h-4 mb-0.5" />
          Jogos
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center text-[10px] font-black ${
            activeTab === 'leaderboard' ? 'text-[#E8A838]' : 'text-[#C8B8A0]'
          }`}
        >
          <Trophy className="w-4 h-4 mb-0.5 text-[#F0C040]" />
          Ranking
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center text-[10px] font-black ${
            activeTab === 'profile' ? 'text-[#E8A838]' : 'text-[#C8B8A0]'
          }`}
        >
          <User className="w-4 h-4 mb-0.5" />
          Perfil
        </button>
      </div>
    </header>
  );
};
