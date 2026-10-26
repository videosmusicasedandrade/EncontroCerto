import React from 'react';
import { Heart, Coins, Bell, Shield, Settings, Sparkles, User, MessageCircle, Gamepad2, Compass, Home } from 'lucide-react';
import { UserProfile, CertcoinLote, NotificacaoPush } from '../types';

interface NavbarProps {
  currentUser: UserProfile | null;
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
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-orange-100 dark:border-zinc-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Online Counter - Fixed layout to prevent wrapping overlap */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('feed')}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-pink-500 flex items-center justify-center shadow-md animate-pulse shrink-0">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg bg-gradient-to-r from-orange-600 via-amber-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
                Encontro Certo MG
              </span>
              <div className="flex items-center space-x-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping shrink-0"></span>
                <span>{onlineCount} pessoas online</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-orange-50 dark:bg-zinc-800/60 p-1 rounded-2xl border border-orange-100 dark:border-zinc-700/50">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'feed'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Feed</span>
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'discover'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Descobrir</span>
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'matches'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Matches & Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('games')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'games'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Joguinhos ☕</span>
            </button>
            {currentUser?.isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Painel Admin</span>
              </button>
            )}
          </nav>

          {/* Right Actions: Certcoins, Notifications, Settings, Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Certcoins Pill */}
            <button
              onClick={onOpenCertcoins}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-950/60 dark:to-yellow-950/60 hover:from-amber-200 hover:to-yellow-200 border border-amber-300 dark:border-amber-700/50 px-2.5 py-1.5 rounded-full shadow-xs transition-transform active:scale-95"
              title="Clique para ver os Certcoins"
            >
              <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="text-[11px] sm:text-xs font-bold text-amber-900 dark:text-amber-200 whitespace-nowrap">
                <span>{totalTemp} temp</span>
                <span className="mx-0.5 text-amber-400">•</span>
                <span>{totalVitalicio} vit</span>
              </div>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-full hover:bg-orange-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-pink-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-full transition-colors ${
                activeTab === 'settings'
                  ? 'bg-orange-100 dark:bg-zinc-800 text-orange-600'
                  : 'hover:bg-orange-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
              title="Configurações"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Profile Avatar */}
            {currentUser && (
              <div
                onClick={() => setActiveTab('profile')}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-400 cursor-pointer shadow-sm hover:opacity-95 transition-opacity shrink-0"
              >
                <img src={currentUser.foto} alt={currentUser.nome} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden flex items-center justify-around bg-white dark:bg-zinc-900 border-t border-orange-100 dark:border-zinc-800 py-2 px-1">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center text-[10px] font-semibold ${
            activeTab === 'feed' ? 'text-orange-600' : 'text-zinc-500'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          Feed
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center text-[10px] font-semibold ${
            activeTab === 'discover' ? 'text-orange-600' : 'text-zinc-500'
          }`}
        >
          <Compass className="w-4 h-4 mb-0.5" />
          Descobrir
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex flex-col items-center text-[10px] font-semibold ${
            activeTab === 'matches' ? 'text-orange-600' : 'text-zinc-500'
          }`}
        >
          <MessageCircle className="w-4 h-4 mb-0.5" />
          Matches
        </button>
        <button
          onClick={() => setActiveTab('games')}
          className={`flex flex-col items-center text-[10px] font-semibold ${
            activeTab === 'games' ? 'text-orange-600' : 'text-zinc-500'
          }`}
        >
          <Gamepad2 className="w-4 h-4 mb-0.5" />
          Jogos
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center text-[10px] font-semibold ${
            activeTab === 'profile' ? 'text-orange-600' : 'text-zinc-500'
          }`}
        >
          <User className="w-4 h-4 mb-0.5" />
          Perfil
        </button>
      </div>
    </header>
  );
};
