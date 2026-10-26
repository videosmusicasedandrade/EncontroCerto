import React, { useState } from 'react';
import { Heart, X, Sparkles, MapPin, Sliders, ShieldCheck, Star, Coins } from 'lucide-react';
import { UserProfile, CertcoinLote } from '../types';
import { calcularDistancia } from '../lib/supabase';

interface DiscoverViewProps {
  currentUser: UserProfile;
  usuarios: UserProfile[];
  lotes: CertcoinLote[];
  matches: string[];
  onUpdateRaio: (novoRaio: number) => void;
  onSendLike: (alvoId: string, superCerto: boolean) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  currentUser,
  usuarios,
  lotes,
  matches,
  onUpdateRaio,
  onSendLike,
}) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showSuperCertoConfirm, setShowSuperCertoConfirm] = useState<UserProfile | null>(null);

  const totalCertcoins = lotes.reduce((acc, l) => acc + l.quantidade, 0);

  // Regra de ouro da distância mútua:
  // 1. Usuário está dentro do raio do outro E o outro está dentro do raio do usuário.
  // 2. Perfil visível e não é o próprio usuário.
  const candidatos = usuarios.filter((u) => {
    if (u.id === currentUser.id) return false;
    if (!u.exibir_na_busca) return false;

    const distParaOutro = calcularDistancia(
      currentUser.latitude,
      currentUser.longitude,
      u.latitude,
      u.longitude
    );

    // Mão dupla: distParaOutro <= currentUser.raio_busca E distParaOutro <= u.raio_busca
    const dentroDoMeuRaio = distParaOutro <= currentUser.raio_busca;
    const estouNoRaioDoOutro = distParaOutro <= u.raio_busca;

    return dentroDoMeuRaio && estouNoRaioDoOutro;
  });

  const handleSuperCertoClick = (u: UserProfile) => {
    if (totalCertcoins < 3) {
      alert('Eita, o Super Certo custa 3 Certcoins! Jogue um pouquinho para ganhar mais 💛');
      return;
    }
    setShowSuperCertoConfirm(u);
  };

  const confirmSuperCerto = () => {
    if (!showSuperCertoConfirm) return;
    onSendLike(showSuperCertoConfirm.id, true);
    setShowSuperCertoConfirm(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Radius Filter Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-orange-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-800 dark:text-zinc-100 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            <span>Descobrir Mineiros(as) Próximos</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Sistema de Distância Mútua: só aparece quem está no teu raio e vice-versa.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Raio:</span>
          <select
            value={currentUser.raio_busca}
            onChange={(e) => onUpdateRaio(parseInt(e.target.value))}
            className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 text-xs font-bold"
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
            <option value={100}>100+ km</option>
          </select>
        </div>
      </div>

      {/* Grid of Profiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {candidatos.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-orange-100 dark:border-zinc-800 p-8">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-orange-400 animate-spin-slow" />
            <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100 mb-1">
              Nenhum(a) mineiro(a) encontrado(a) no raio atual
            </h3>
            <p className="text-xs text-zinc-500">
              Tente aumentar teu raio de busca nas configurações para ver mais gente boa!
            </p>
          </div>
        ) : (
          candidatos.map((u) => {
            const dist = calcularDistancia(
              currentUser.latitude,
              currentUser.longitude,
              u.latitude,
              u.longitude
            );
            const isMatch = matches.includes(u.id);

            return (
              <div
                key={u.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-orange-100 dark:border-zinc-800 flex flex-col group hover:shadow-md transition-shadow"
              >
                <div
                  className="relative h-72 cursor-pointer overflow-hidden"
                  onClick={() => setSelectedUser(u)}
                >
                  <img
                    src={u.foto}
                    alt={u.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-orange-500/80 backdrop-blur-xs text-[11px] font-bold">
                        Aprox. {dist}km
                      </span>
                      {isMatch && (
                        <span className="px-2.5 py-0.5 rounded-full bg-pink-500/80 backdrop-blur-xs text-[11px] font-bold">
                          Match 💛
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black">
                      {u.nome}, {u.idade}
                    </h3>
                    <p className="text-xs text-zinc-200">
                      {u.cidade} {u.bairro ? `• ${u.bairro}` : ''}
                    </p>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between gap-2 mt-auto">
                  <button
                    onClick={() => onSendLike(u.id, false)}
                    className="flex-1 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold text-xs hover:bg-orange-100 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Heart className="w-4 h-4 fill-orange-500 text-orange-500" />
                    <span>Curtir (+0.50 🪙)</span>
                  </button>
                  <button
                    onClick={() => handleSuperCertoClick(u)}
                    className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-xs hover:opacity-95 shadow transition-all flex items-center space-x-1"
                    title="Super Certo (3 Certcoins)"
                  >
                    <Star className="w-4 h-4 fill-white" />
                    <span>Super (3 🪙)</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Profile Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-orange-100 dark:border-zinc-800 relative my-8">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-96">
              <img src={selectedUser.foto} alt={selectedUser.nome} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <h3 className="text-2xl font-black">
                  {selectedUser.nome}, {selectedUser.idade}
                </h3>
                <p className="text-sm text-zinc-200">
                  {selectedUser.cidade} {selectedUser.bairro ? `• ${selectedUser.bairro}` : ''}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block mb-0.5">Altura</span>
                  <span className="text-zinc-800 dark:text-zinc-100">{selectedUser.altura || 'Não informada'}m</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block mb-0.5">Tipo Corporal</span>
                  <span className="text-zinc-800 dark:text-zinc-100">{selectedUser.tipo_corporal}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase mb-1">Sobre mim</h4>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {selectedUser.descricao || 'Nenhuma descrição informada.'}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex space-x-3">
                <button
                  onClick={() => {
                    onSendLike(selectedUser.id, false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow transition-colors"
                >
                  Curtir Perfil (+0.50 🪙)
                </button>
                <button
                  onClick={() => {
                    handleSuperCertoClick(selectedUser);
                    setSelectedUser(null);
                  }}
                  className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-extrabold text-sm shadow"
                >
                  Super Certo (3 🪙)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Super Certo Confirmation Modal */}
      {showSuperCertoConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-amber-200 dark:border-zinc-800 space-y-4">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <Coins className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
              Confirmar Super Certo 💛
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Isso vai usar <strong className="text-amber-600">3 Certcoins</strong> para destacar sua notificação para {showSuperCertoConfirm.nome}. Tem certeza?
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowSuperCertoConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-bold text-xs text-zinc-600 dark:text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSuperCerto}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow"
              >
                Sim, Enviar!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
