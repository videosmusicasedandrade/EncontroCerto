import React, { useState } from 'react';
import { Heart, X, MapPin, Ruler, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserProfile, EstadoConfig } from '../types';

interface EncontroViewProps {
  currentUser: UserProfile;
  estadoConfig: EstadoConfig;
  usuarios: UserProfile[];
  matches: string[]; // IDs of users already matched
  onSendLike: (alvoId: string, superCerto: boolean) => void;
}

export const EncontroView: React.FC<EncontroViewProps> = ({
  currentUser,
  estadoConfig,
  usuarios,
  matches,
  onSendLike,
}) => {
  const [passedIds, setPassedIds] = useState<string[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const getSlang = () => {
    switch (estadoConfig.sigla) {
      case 'MG': return 'Bora procurar, uai! 🧀';
      case 'RJ': return 'Bora buscar, mermão! 🏖️';
      case 'SP': return 'Bora dar um rolê! 🏙️';
      case 'BA': return 'Bora ver o que tem de bom, pai! 🥥';
      case 'RS': return 'Bora buscar, tchê! 🧉';
      default: return 'Bora procurar gente nova! ✨';
    }
  };

  const handleRefresh = () => {
    setIsSearching(true);
    setTimeout(() => {
      setPassedIds([]);
      setIsSearching(false);
      setActivePhotoIndex(0);
    }, 5000);
  };

  const availableUsers = usuarios.filter(
    (u) =>
      u.id !== currentUser.id &&
      !matches.includes(u.id) &&
      !passedIds.includes(u.id) &&
      u.estado_sigla === currentUser.estado_sigla
  );

  const currentUserTarget = availableUsers[0];

  const handlePass = () => {
    if (!currentUserTarget) return;
    setPassedIds((prev) => [...prev, currentUserTarget.id]);
    setActivePhotoIndex(0);
  };

  const handleLike = (superCerto: boolean = false) => {
    if (!currentUserTarget) return;
    onSendLike(currentUserTarget.id, superCerto);
    setPassedIds((prev) => [...prev, currentUserTarget.id]);
    setActivePhotoIndex(0);
  };

  const photosList = currentUserTarget
    ? [currentUserTarget.foto, ...(currentUserTarget.fotos || [])]
    : [];

  const nextPhoto = () => setActivePhotoIndex((prev) => (prev + 1) % photosList.length);
  const prevPhoto = () => setActivePhotoIndex((prev) => (prev - 1 + photosList.length) % photosList.length);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] p-2 md:p-4 overflow-hidden">
      {/* Card Principal */}
      {isSearching ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#1E1915] rounded-3xl p-6 border border-[#382E24] text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-[#E8A838]/20 border-t-[#E8A838] rounded-full animate-spin"></div>
            <Heart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#E8A838] animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-[#F5E9D3]">{getSlang()}</h3>
            <p className="text-sm text-[#C8B8A0]">Estamos procurando as melhores conexões pra você...</p>
          </div>
        </div>
      ) : availableUsers.length === 0 || !currentUserTarget ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#1E1915] rounded-3xl p-6 border border-[#382E24] text-center space-y-4">
          <Heart className="w-16 h-16 text-[#E8A838] fill-[#E8A838]" />
          <h3 className="text-lg font-black text-[#F5E9D3]">Opa, o pessoal tá tímido! 💛</h3>
          <p className="text-xs text-[#C8B8A0]">Ainda não tem ninguém novo por aqui.</p>
          <button onClick={handleRefresh} className="px-5 py-2.5 bg-[#E8A838] hover:brightness-110 text-[#120F0D] rounded-2xl font-black text-sm transition-all cursor-pointer">Ver se chegou gente nova 🔄</button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-[#1E1915] rounded-3xl border border-[#382E24] overflow-hidden shadow-2xl relative">
          
          {/* Área de Foto (Ocupa a maior parte) */}
          <div className="relative flex-1 bg-[#120F0D] overflow-hidden group">
            <img
              src={photosList[activePhotoIndex] || currentUserTarget.foto}
              alt={currentUserTarget.nome}
              className="w-full h-full object-cover"
            />
            
            {/* Navegação de Fotos */}
            <button onClick={prevPhoto} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full text-white"><ChevronLeft /></button>
            <button onClick={nextPhoto} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 rounded-full text-white"><ChevronRight /></button>

            {/* Nome/Idade no rodapé da foto */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-2xl font-black text-white">{currentUserTarget.nome}, {currentUserTarget.idade || 25}</h3>
              <p className="text-sm text-white/90">{currentUserTarget.cidade} • {currentUserTarget.altura}m</p>
            </div>
          </div>

          {/* Área de Informações & Ações (Fixo no rodapé do card) */}
          <div className="p-4 bg-[#1E1915] space-y-3 shrink-0 border-t border-[#382E24]">
            <p className="text-xs text-[#C8B8A0] line-clamp-2">{currentUserTarget.descricao}</p>
            
            {/* Botões de Ação */}
            <div className="flex items-center justify-between gap-2">
              <button onClick={handlePass} className="flex-1 py-3 rounded-2xl bg-[#120F0D] hover:bg-[#2A231D] border border-red-900 text-red-400 font-black text-xs sm:text-sm">Não conectar</button>
              <button onClick={() => handleLike(true)} className="flex-1 py-3 rounded-2xl bg-[#E8A838]/20 text-[#E8A838] font-black border border-[#E8A838] text-xs sm:text-sm">Super conexão</button>
              <button onClick={() => handleLike(false)} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] font-black text-xs sm:text-sm">Conectar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
