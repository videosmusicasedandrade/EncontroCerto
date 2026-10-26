import React, { useState } from 'react';
import { Heart, Sparkles, Lock, Mail, User, MapPin } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLogin: (email: string, pass: string) => void;
  onRegister: (profile: Omit<UserProfile, 'id' | 'idade' | 'criado_em'>) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister }) => {
  const [isRegistering, setIsRegistering] = useState(false);

  // Login state
  const [email, setEmail] = useState('eddornelas02@gmail.com');
  const [senha, setSenha] = useState('Edinho55@');
  const [loginError, setLoginError] = useState('');

  // Register state
  const [nome, setNome] = useState('');
  const [nascimento, setNascimento] = useState('1998-05-20');
  const [cidade, setCidade] = useState('Belo Horizonte');
  const [bairro, setBairro] = useState('Savassi');
  const [altura, setAltura] = useState('1.78');
  const [tipoCorporal, setTipoCorporal] = useState<UserProfile['tipo_corporal']>('Normal');
  const [foto, setFoto] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
  );
  const [descricao, setDescricao] = useState('Uai! Apaixonado(a) por Minas e boas conversas 💛');
  const [tipoPerfil, setTipoPerfil] = useState<'publico' | 'privado'>('publico');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'eddornelas02@gmail.com' && senha === 'Edinho55@') {
      onLogin(email, senha);
    } else {
      setLoginError('E-mail ou senha incorretos. Tente eddornelas02@gmail.com / Edinho55@');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    onRegister({
      nome,
      nascimento,
      cidade,
      bairro,
      latitude: -19.9167,
      longitude: -43.9345,
      raio_busca: 50,
      altura: parseFloat(altura) || 1.75,
      tipo_corporal: tipoCorporal,
      foto,
      descricao,
      tipo_perfil: tipoPerfil,
      exibir_na_busca: true,
    });
  };

  const fillTestCredentials = () => {
    setEmail('eddornelas02@gmail.com');
    setSenha('Edinho55@');
    setLoginError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-pink-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-orange-100 dark:border-zinc-800 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 via-amber-500 to-pink-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg animate-pulse">
            <Heart className="w-9 h-9 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Encontro Certo MG
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Onde o coração mineiro bate mais forte 💛
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-orange-50 dark:bg-zinc-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
              !isRegistering
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow'
                : 'text-zinc-600 dark:text-zinc-300'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setIsRegistering(true)}
            className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
              isRegistering
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow'
                : 'text-zinc-600 dark:text-zinc-300'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {!isRegistering ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-200 text-xs font-bold rounded-2xl text-center">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="seu_email@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={fillTestCredentials}
              className="w-full py-2 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-bold text-xs rounded-xl hover:bg-amber-200 transition-colors flex items-center justify-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Usar Conta de Teste (eddornelas02@gmail.com)</span>
            </button>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-pink-500 text-white font-extrabold rounded-2xl shadow-lg hover:opacity-95 transition-all text-sm"
            >
              Entrar na Prosa ☕
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
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
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                  Nascimento
                </label>
                <input
                  type="date"
                  required
                  value={nascimento}
                  onChange={(e) => setNascimento(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-100"
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
                  placeholder="Belo Horizonte"
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Foto de Perfil (URL)
              </label>
              <input
                type="url"
                required
                value={foto}
                onChange={(e) => setFoto(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                Apresentação
              </label>
              <textarea
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Conta um pouco sobre você..."
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-100 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-2xl shadow-lg hover:opacity-95 transition-all text-sm"
            >
              Criar Conta e Começar! 🚀
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
