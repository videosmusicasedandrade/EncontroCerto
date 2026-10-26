import React, { useState } from 'react';
import { Shield, Users, AlertTriangle, Coins, Search, CheckCircle, Trash2, Send } from 'lucide-react';
import { UserProfile, Denuncia, CertcoinLote } from '../types';

interface AdminViewProps {
  usuarios: UserProfile[];
  denuncias: Denuncia[];
  lotes: CertcoinLote[];
  onArchiveReport: (id: string) => void;
  onBanUser: (userId: string, motivo: string) => void;
  onSendAdminCertcoins: (userId: string, quantidade: number) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  usuarios,
  denuncias,
  lotes,
  onArchiveReport,
  onBanUser,
  onSendAdminCertcoins,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'denuncias' | 'usuarios' | 'enviar_certcoins'>('stats');
  const [searchQuery, setSearchQuery] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banningUserId, setBanningUserId] = useState<string | null>(null);

  // Send certcoins state
  const [targetUserId, setTargetUserId] = useState('');
  const [certQtd, setCertQtd] = useState(15);
  const [sendSuccess, setSendSuccess] = useState(false);

  const totalTemp = lotes.filter((l) => l.tipo === 'temp').reduce((acc, l) => acc + l.quantidade, 0);
  const totalVitalicio = lotes.filter((l) => l.tipo === 'vitalicio').reduce((acc, l) => acc + l.quantidade, 0);

  const filteredUsers = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.cidade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendAdminCertcoinsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId || certQtd <= 0) return;
    onSendAdminCertcoins(targetUserId, certQtd);
    setSendSuccess(true);
    setTimeout(() => {
      setSendSuccess(false);
      setTargetUserId('');
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-zinc-900 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-black">Painel Administrativo MG</h2>
          </div>
          <p className="text-xs text-purple-200">
            Gerenciamento de denúncias, usuários, circulação de Certcoins e moderação.
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex space-x-2 bg-purple-50/60 dark:bg-zinc-800/60 p-1.5 rounded-2xl border border-purple-100 dark:border-zinc-700">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'stats' ? 'bg-purple-600 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-300'
          }`}
        >
          Visão Geral 📊
        </button>
        <button
          onClick={() => setActiveTab('denuncias')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'denuncias' ? 'bg-purple-600 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-300'
          }`}
        >
          Denúncias ({denuncias.filter((d) => d.status === 'pendente').length}) ⚠️
        </button>
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'usuarios' ? 'bg-purple-600 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-300'
          }`}
        >
          Buscar Usuários 🔍
        </button>
        <button
          onClick={() => setActiveTab('enviar_certcoins')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'enviar_certcoins' ? 'bg-purple-600 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-300'
          }`}
        >
          Enviar Certcoins 🪙
        </button>
      </div>

      {/* TAB: STATS */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-purple-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-zinc-400 block mb-1">Total de Usuários</span>
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400">{usuarios.length}</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-purple-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-zinc-400 block mb-1">Online Agora</span>
            <span className="text-3xl font-black text-emerald-500">12</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-purple-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-zinc-400 block mb-1">Denúncias Pendentes</span>
            <span className="text-3xl font-black text-pink-600">
              {denuncias.filter((d) => d.status === 'pendente').length}
            </span>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-purple-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-zinc-400 block mb-1">Certcoins em Circulação</span>
            <span className="text-xl font-black text-amber-500">
              {totalTemp} temp • {totalVitalicio} vit
            </span>
          </div>
        </div>
      )}

      {/* TAB: DENUNCIAS */}
      {activeTab === 'denuncias' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-purple-100 dark:border-zinc-800 space-y-4">
          <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100">Lista de Denúncias</h3>
          {denuncias.length === 0 ? (
            <p className="text-xs text-zinc-400 text-py-8">Nenhuma denúncia registrada. Tudo em paz em Minas!</p>
          ) : (
            denuncias.map((d) => {
              const alvo = usuarios.find((u) => u.id === d.alvo_id);
              const denunciante = usuarios.find((u) => u.id === d.denunciante_id);

              return (
                <div key={d.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-100">
                      Alvo: {alvo?.nome || 'Usuário'} <span className="text-xs text-pink-600">({d.tipo})</span>
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">Motivo: {d.motivo}</p>
                    <span className="text-[10px] text-zinc-400 block mt-1">
                      Denunciado por {denunciante?.nome || 'Anônimo'} em {new Date(d.criado_em).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onArchiveReport(d.id)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 font-bold text-xs text-zinc-700 dark:text-zinc-200"
                    >
                      Arquivar
                    </button>
                    <button
                      onClick={() => setBanningUserId(d.alvo_id)}
                      className="px-3 py-1.5 rounded-xl bg-pink-600 font-bold text-xs text-white"
                    >
                      Banir Usuário
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB: USUARIOS */}
      {activeTab === 'usuarios' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-purple-100 dark:border-zinc-800 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou cidade..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-3">
            {filteredUsers.map((u) => (
              <div key={u.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={u.foto} alt={u.nome} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-100">{u.nome}</h4>
                    <p className="text-xs text-zinc-400">{u.cidade} • {u.tipo_perfil}</p>
                  </div>
                </div>
                <button
                  onClick={() => setBanningUserId(u.id)}
                  className="px-3 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 font-bold text-xs"
                >
                  Banir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: ENVIAR CERTCOINS */}
      {activeTab === 'enviar_certcoins' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-purple-100 dark:border-zinc-800 max-w-lg mx-auto space-y-4">
          <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100">Enviar Certcoins Manualmente</h3>
          {sendSuccess && (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-xl text-center">
              Certcoins enviados com sucesso! O usuário recebeu a notificação.
            </div>
          )}
          <form onSubmit={handleSendAdminCertcoinsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">Usuário Destino</label>
              <select
                required
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm"
              >
                <option value="">Selecione o usuário...</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nome} ({u.cidade})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">Quantidade de Certcoins (Temp 30d)</label>
              <input
                type="number"
                min={1}
                required
                value={certQtd}
                onChange={(e) => setCertQtd(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow text-sm"
            >
              Enviar Presente Especial do Admin 💛
            </button>
          </form>
        </div>
      )}

      {/* Ban Modal */}
      {banningUserId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-pink-200">
            <h3 className="text-lg font-bold text-pink-600">Banir Usuário</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Isso removerá todos os dados do usuário sem rastro. Informe o motivo:
            </p>
            <textarea
              rows={3}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Sua conta foi encerrada por..."
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-800 dark:text-zinc-100"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => setBanningUserId(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onBanUser(banningUserId, banReason || 'Violação das regras da comunidade');
                  setBanningUserId(null);
                  setBanReason('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-xs"
              >
                Confirmar Banimento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
