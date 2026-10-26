import React, { useState } from 'react';
import { Heart, Camera, MapPin, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  onCompleteProfile: (profile: Omit<UserProfile, 'id' | 'idade' | 'criado_em'>) => void;
  initialData?: UserProfile | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onCompleteProfile, initialData }) => {
  const [nome, setNome] = useState(initialData?.nome || '');
  const [nascimento, setNascimento] = useState(initialData?.nascimento || '1998-06-15');
  const [cidade, setCidade] = useState(initialData?.cidade || 'Belo Horizonte');
  const [bairro, setBairro] = useState(initialData?.bairro || 'Savassi');
  const [altura, setAltura] = useState(initialData?.altura ? String(initialData.altura) : '1.75');
  const [tipoCorporal, setTipoCorporal] = useState<UserProfile['tipo_corporal']>(
    initialData?.tipo_corporal || 'Normal'
  );
  const [foto, setFoto] = useState(
    initialData?.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
  );
  const [descricao, setDescricao] = useState(initialData?.descricao || 'Uai! Apaixonado(a) por Minas e boas conversas 💛');
  const [tipoPerfil, setTipoPerfil] = useState<'publico' | 'privado'>(initialData?.tipo_perfil || 'publico');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    onCompleteProfile({
      nome,
      nascimento,
      cidade,
      bairro,
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-orange-100 dark:border-zinc-800 my-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-3">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100">
            {initialData ? 'Editar teu Perfil' : 'Seja muito bem-vindo(a) uai! 💛'}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Aqui em Minas é onde as coisas boas acontecem. Conta pra gente quem tu és!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Ana Clara Ribeiro"
              className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                required
                value={nascimento}
                onChange={(e) => setNascimento(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Cidade (MG)
              </label>
              <input
                type="text"
                required
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex: Belo Horizonte"
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Bairro / Região
              </label>
              <input
                type="text"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Ex: Savassi"
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Altura (m)
              </label>
              <input
                type="number"
                step="0.01"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                placeholder="1.75"
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Tipo Corporal
              </label>
              <select
                value={tipoCorporal}
                onChange={(e) => setTipoCorporal(e.target.value as UserProfile['tipo_corporal'])}
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Foto de Perfil (URL ou escolha abaixo)
            </label>
            <input
              type="url"
              required
              value={foto}
              onChange={(e) => setFoto(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-2"
            />
            <div className="flex space-x-2 overflow-x-auto py-1">
              {samplePhotos.map((p, idx) => (
                <img
                  key={idx}
                  src={p}
                  alt="Sugestão"
                  onClick={() => setFoto(p)}
                  className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition-transform hover:scale-105 ${
                    foto === p ? 'border-orange-500 scale-105' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Apresentação / Descrição
            </label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Conta um pouco sobre o que cê curte fazer..."
              className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              Tipo de Perfil
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoPerfil('publico')}
                className={`py-3 px-4 rounded-2xl font-bold text-sm border transition-all ${
                  tipoPerfil === 'publico'
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                Público (Todo mundo vê)
              </button>
              <button
                type="button"
                onClick={() => setTipoPerfil('privado')}
                className={`py-3 px-4 rounded-2xl font-bold text-sm border transition-all ${
                  tipoPerfil === 'privado'
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                Privado (Só seguidores aprovados)
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-pink-500 text-white font-extrabold rounded-2xl shadow-lg hover:opacity-95 transition-all text-lg"
          >
            {initialData ? 'Salvar Alterações 💛' : 'Começar a Prosear! 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
};
