import React from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import { NotificacaoPush } from '../types';

interface NotificationsModalProps {
  notificacoes: NotificacaoPush[];
  onClose: () => void;
  onMarkAllAsRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notificacoes,
  onClose,
  onMarkAllAsRead,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-orange-100 dark:border-zinc-800 relative max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
              Avisos & Prosa 💛
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 space-y-3 pr-1">
          {notificacoes.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p>Nenhum aviso por enquanto. Tá tudo tranquilo por aqui!</p>
            </div>
          ) : (
            notificacoes.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition-colors ${
                  n.lida
                    ? 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    : 'bg-orange-50/70 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/50 text-zinc-800 dark:text-zinc-200'
                }`}
              >
                <h4 className="font-bold text-sm text-orange-600 dark:text-orange-400 mb-1">
                  {n.titulo}
                </h4>
                <p className="text-sm">{n.mensagem}</p>
                <span className="text-[10px] text-zinc-400 mt-2 block">
                  {new Date(n.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>

        {notificacoes.length > 0 && (
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center space-x-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Marcar todas como lidas</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
