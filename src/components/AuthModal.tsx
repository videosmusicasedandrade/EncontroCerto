import React, { useState } from 'react';
import { Heart, Camera, MapPin, Sparkles, X } from 'lucide-react';
import { UserProfile, EstadoConfig } from '../types';
import { ESTADOS_BRASIL, getEstadoConfig } from '../lib/estados';

interface AuthModalProps {
  onCompleteProfile: (profile: Omit<UserProfile, 'id' | 'idade' | 'criado_em'>) => void;
  initialData?: UserProfile | null;
  estadoConfig?: EstadoConfig;
  onSelectEstado?: (sigla: string) => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onCompleteProfile,
  initialData,
  estadoConfig,
  onSelectEstado,
  onClose,
}) => {
  const [nome, setNome] = useState(initialData?.nome || '');
  const [nascimento, setNascimento] = useState(initialData?.nascimento || '1998-06-15');
  const [estadoSigla, setEstadoSigla] = useState(initialData?.estado_sigla || estadoConfig?.sigla || 'MG');
  const [cidade, setCidade] = useState(initialData?.cidade || 'Belo Horizonte');
  const [bairro, setBairro] = useState(initialData?.bairro || 'Savassi');
  const [altura, setAltura] = useState(initialData?.altura ? String(initialData.altura) : '1.75');
  const [tipoCorporal, setTipoCorporal] = useState<UserProfile['tipo_corporal']>(
    initialData?.tipo_corporal || 'Normal'
  );
  const [foto, setFoto] = useState(
    initialData?.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
  );
  const [descricao, setDescricao] = useState(initialData?.descricao || 'Apaixonado(a) por conexões verdadeiras! 💛');
  const [tipoPerfil, setTipoPerfil] = useState<'publico' | 'privado'>(initialData?.tipo_perfil || 'publico');

  const activeEstado = getEstadoConfig(estadoSigla);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    if (onSelectEstado) onSelectEstado(estadoSigla);

    onCompleteProfile({
      nome,
      nascimento,
      cidade,
      bairro,
      estado_sigla: estadoSigla,
      latitude: -19.9167,
      longitude: -43.9345,
      raio_busca: initialData?.raio_busca || 50,
      altura: parseFloat(altura) || 1.75,
      tipo_corporal: tipoCorporal,
      foto,
      descricao,
      tipo_perfil: tipoPerfil,
      exibir_na_busca: true,
    });
  };

  const samplePhotos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1E1915] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#382E24] my-8 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#C8B8A0] hover:text-[#F5E9D3]"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-3"
            style={{ background: `linear-gradient(135deg, ${activeEstado.cor} 0%, #D1704A 100%)` }}
          >
            <Heart className="w-8 h-8 text-[#120F0D] fill-[#120F0D]" />
          </div>
          <h2 className="text-2xl font-black text-[#F5E9D3]">
            {initialData ? 'Editar teu Perfil' : 'Seja muito bem-vindo(a)! 💛'}
          </h2>
          <p className="text-sm text-[#C8B8A0] mt-1">
            {activeEstado.apresentacao} {activeEstado.emblem}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#C8B8A0] uppercase mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Ana Clara Ribeiro"
              className="w-full px-4 py-3 rounded-2xl border border-[#382E24] bg-[#120F0D] text-[#F5E9D3] focus:outline-none"
              style={{ borderColor: activeEstado.cor }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#C8B8A0] uppercase mb-1">
                Estado (Fixo por Localização)
              </label>
              <div
                className="w-full px-3 py-3 rounded-2xl border border-[#382E24] bg-[#120F0D] text-[#F5E9D3] font-black text-xs flex items-center justify-between"
                title="Estado definido automaticamente pela sua localização"
              >
                <span className="truncate">{activeEstado.emblem} {activeEstado.sigla} — {activeEstado.nome}</span>
                <span className="text-[#E8A838] text-xs ml-1" title="Fixo por localização">🔒</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C8B8A0] uppercase mb-1">
                Cidade
              </label>
              <input
                type="text"
                required
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex: Belo Horizonte"
                className="w-full px-4 py-3 rounded-2xl border border-[#382E24] bg-[#120F0D] text-[#F5E9D3] focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C8B8A0] uppercase mb-1">
                Nascimento
              </label>
              <input
                type="date"
                required
                value={nascimento}
                onChange={(e) => setNascimento(e.target.value)}
                className="w-full px-3 py-3 rounded-2xl border border-[#382E24] bg-[#120F0D] text-[#F5E9D3] text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#C8B8A0] uppercase mb-1">
                Bairro / Região
              </label>
              <input
                type="text"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Ex: Savassi"
                className="w-full px-4 py-3 rounded-2xl border border-[#382E24] bg-[#120F0D] text-[#F5E9D3] focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C8B8A0] uppercase mb-1">
                Altura (m)
              </label>
              <input
                type="number"
                step="0.01"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                placeholder="1.75"
                className="w-full px-4 py-3 rounded-2xl border border-[#382E24] bg-[#120F0D] text-[#F5E9D3] focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#C8B8A0] uppercase mb-1">
                Tipo Corporal
              </label>
              <select
                value={tipoCorporal}
                onChange={(e) => setTipoCorporal(e.target.value as UserProfile['tipo_corporal'])}
                className="w-full px-3 py-3 rounded-2xl border border-[#382E24] bg-[#120F0D] text-[#F5E9D3] focus:outline-none text-xs"
              >
                <option value="Atlético">Atlético</option>
                <option value="Normal">Normal</option>
                <option value="Um pouquinho a mais">Um pouquinho a mais</option>
                <option value="Gordinho(a)">Gordinho(a)</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#C8B8A0] uppercase mb-1">
              Foto de Perfil (URL ou escolha abaixo)
            </label>
            <input
              type="url"
              required
              value={foto}
              onChange={(e) => setFoto(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#382E24] bg-[#120F0D] text-[#F5E9D3] text-xs focus:outline-none mb-2"
            />
            <div className="flex space-x-2 overflow-x-auto py-1">
              {samplePhotos.map((p, idx) => (
                <img
                  key={idx}
                  src={p}
                  alt="Sugestão"
                  onClick={() => setFoto(p)}
                  className={`w-11 h-11 rounded-xl object-cover cursor-pointer border-2 transition-transform hover:scale-105 ${
                    foto === p ? 'scale-105 border-[#E8A838]' : 'border-transparent opacity-70'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#C8B8A0] uppercase mb-1">
              Apresentação / Descrição
            </label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Conta um pouco sobre você..."
              className="w-full px-4 py-3 rounded-2xl border border-[#382E24] bg-[#120F0D] text-[#F5E9D3] focus:outline-none resize-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#C8B8A0] uppercase mb-1">
              Tipo de Perfil
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoPerfil('publico')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                  tipoPerfil === 'publico'
                    ? 'bg-[#E8A838] text-[#120F0D] border-[#E8A838]'
                    : 'bg-[#120F0D] text-[#C8B8A0] border-[#382E24]'
                }`}
              >
                Público (Aberto)
              </button>
              <button
                type="button"
                onClick={() => setTipoPerfil('privado')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                  tipoPerfil === 'privado'
                    ? 'bg-[#E8A838] text-[#120F0D] border-[#E8A838]'
                    : 'bg-[#120F0D] text-[#C8B8A0] border-[#382E24]'
                }`}
              >
                Privado (Aprovação)
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 golden-button rounded-2xl text-sm shadow-md transition-all active:scale-98"
          >
            {initialData ? 'Salvar Alterações 💛' : 'Começar a Prosear! 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
};
