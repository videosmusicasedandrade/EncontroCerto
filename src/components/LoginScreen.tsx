import React, { useState } from 'react';
import { Heart, Sparkles, Lock, Mail, MapPin, ArrowRight } from 'lucide-react';
import { UserProfile, EstadoConfig } from '../types';
import { getEstadoConfig } from '../lib/estados';

interface LoginScreenProps {
  estadoConfig: EstadoConfig;
  onSelectEstado: (sigla: string) => void;
  onLogin: (email: string, pass: string) => void;
  onRegister: (profile: Omit<UserProfile, 'id' | 'idade' | 'criado_em'>) => void;
  protectionMsg?: string;
  onOpenStateModal?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  estadoConfig,
  onSelectEstado,
  onLogin,
  onRegister,
  protectionMsg,
  onOpenStateModal,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Buscando alguém especial…');

  // Login state (sem exibir senhas soltas na tela)
  const [email, setEmail] = useState('eddornelas02@gmail.com');
  const [senha, setSenha] = useState('demo123456');
  const [loginError, setLoginError] = useState('');

  // Register multi-step state (Passo 1 a 4)
  const [registerStep, setRegisterStep] = useState(1);
  const [nome, setNome] = useState('');
  const [nascimento, setNascimento] = useState('1998-05-20');
  const [estadoSigla, setEstadoSigla] = useState(estadoConfig.sigla);
  const [cidade, setCidade] = useState(estadoConfig.sigla === 'MG' ? 'Belo Horizonte' : 'Capital');
  const [bairro, setBairro] = useState('Centro');
  const [altura, setAltura] = useState('1.78');
  const [tipoCorporal, setTipoCorporal] = useState<UserProfile['tipo_corporal']>('Normal');
  const [foto, setFoto] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
  );
  const [descricao, setDescricao] = useState(estadoConfig.saudacao);
  const [tipoPerfil, setTipoPerfil] = useState<'publico' | 'privado'>('publico');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingText('Entrando na prosa… ☕');

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanSenha = senha.trim();
      onLogin(cleanEmail || 'eddornelas02@gmail.com', cleanSenha || 'demo123456');
      setIsLoading(false);
    }, 1200);
  };

  const triggerTestAccountLogin = () => {
    setEmail('eddornelas02@gmail.com');
    setSenha('demo123456');
    setIsLoading(true);
    setLoadingText('Entrando na prosa… ☕');
    setTimeout(() => {
      onLogin('eddornelas02@gmail.com', 'demo123456');
      setIsLoading(false);
    }, 1200);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerStep < 4) {
      setRegisterStep((prev) => prev + 1);
    } else {
      setIsLoading(true);
      setLoadingText('Buscando alguém especial… ' + estadoConfig.emblem);
      setTimeout(() => {
        onRegister({
          nome: nome.trim() || 'Pessoa do Coração',
          nascimento,
          cidade,
          bairro,
          estado_sigla: estadoSigla,
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
        setIsLoading(false);
      }, 1200);
    }
  };

  const samplePhotos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  ];

  return (
    <div className="min-h-screen bg-[#120F0D] text-[#F5E9D3] flex flex-col items-center justify-center p-4 sm:p-6 transition-all duration-300">
      
      {/* Top Bar for Location Indicator */}
      <div className="w-full max-w-md mb-3 flex items-center justify-[#C8B8A0] text-xs text-[#C8B8A0] px-2">
        <span className="font-bold flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#E8A838]" />
          <span>Sua região: <strong className="text-[#F5E9D3]">{estadoConfig.nome} ({estadoConfig.sigla})</strong></span>
        </span>
      </div>

      <div className="w-full max-w-md bg-[#1E1915] rounded-3xl p-6 sm:p-8 border border-[#382E24] shadow-[0_8px_30px_rgba(232,168,56,0.08)] space-y-6 relative overflow-hidden">
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-[#120F0D]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fadeIn">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center animate-heartbeat shadow-lg"
              style={{ background: `linear-gradient(135deg, ${estadoConfig.cor} 0%, #D1704A 100%)` }}
            >
              <Heart className="w-8 h-8 text-[#120F0D] fill-[#120F0D]" />
            </div>
            <p className="text-base font-extrabold text-[#F5E9D3] animate-pulse">
              {loadingText}
            </p>
          </div>
        )}

        {/* Header Logo & Dynamic State Phrase */}
        <div className="text-center space-y-2">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg animate-heartbeat border transition-all"
            style={{
              background: `linear-gradient(135deg, ${estadoConfig.cor} 0%, #D1704A 100%)`,
              borderColor: estadoConfig.cor,
            }}
          >
            <Heart className="w-9 h-9 text-[#120F0D] fill-[#120F0D]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F5E9D3]">
            Encontro Certo
          </h1>
          <p className="text-xs font-extrabold text-[#C8B8A0] px-2" style={{ color: estadoConfig.cor }}>
            {estadoConfig.saudacao}
          </p>
        </div>

        {/* Protection message if redirected */}
        {protectionMsg && (
          <div className="p-3.5 bg-[#2A231D] border border-[#E8A838]/50 rounded-2xl text-xs text-[#E8A838] font-bold text-center animate-fadeIn shadow-xs">
            {protectionMsg}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-[#120F0D] p-1.5 rounded-2xl border border-[#382E24]">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(false);
              setRegisterStep(1);
            }}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
              !isRegistering
                ? 'bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] shadow-md'
                : 'text-[#C8B8A0] hover:text-[#F5E9D3]'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setIsRegistering(true)}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${
              isRegistering
                ? 'bg-gradient-to-r from-[#E8A838] to-[#D1704A] text-[#120F0D] shadow-md'
                : 'text-[#C8B8A0] hover:text-[#F5E9D3]'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {!isRegistering ? (
          /* FORMULÁRIO DE LOGIN */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs font-bold rounded-2xl text-center">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold text-[#C8B8A0] uppercase mb-1.5">
                Teu e-mail pra gente te achar
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-[#C8B8A0]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#382E24] bg-[#120F0D] text-sm text-[#F5E9D3] placeholder-[#C8B8A0]/50 focus:outline-none focus:border-[#E8A838] transition-colors"
                  placeholder="seu_email@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#C8B8A0] uppercase mb-1.5">
                Tua senha, só tua 💛
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-[#C8B8A0]" />
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#382E24] bg-[#120F0D] text-sm text-[#F5E9D3] placeholder-[#C8B8A0]/50 focus:outline-none focus:border-[#E8A838] transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* BOTÃO CONTA DE TESTE (Preenche e Entra Automaticamente) */}
            <button
              type="button"
              onClick={triggerTestAccountLogin}
              disabled={isLoading}
              className="w-full py-3 bg-[#2A231D] hover:bg-[#382E24] text-[#E8A838] font-black text-xs rounded-2xl border border-[#E8A838]/40 transition-all flex items-center justify-center space-x-2 shadow-xs group disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#F0C040] group-hover:rotate-12 transition-transform" />
              <span>Entrar com Conta de Teste ☕</span>
            </button>

            {/* BOTÃO ENTRAR PRINCIPAL */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 golden-button rounded-2xl text-sm font-black shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{isLoading ? 'Entrando na prosa… ☕' : 'Entrar na Prosa ☕'}</span>
            </button>

            {/* Link para escolher outro estado */}
            {onOpenStateModal && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onOpenStateModal}
                  className="text-xs text-[#C8B8A0] hover:text-[#E8A838] transition-colors font-bold"
                >
                  Não é este o meu estado? Clica aqui 💛
                </button>
              </div>
            )}
          </form>
        ) : (
          /* FORMULÁRIO DE CADASTRO MULTI-PASSO */
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className="text-[#E8A838]">Passo {registerStep} de 4</span>
                <span className="text-[#C8B8A0]">
                  {registerStep === 1 && 'Dados Básicos'}
                  {registerStep === 2 && 'Localização'}
                  {registerStep === 3 && 'Aparência & Foto'}
                  {registerStep === 4 && 'Apresentação'}
                </span>
              </div>
              <div className="w-full h-2 bg-[#120F0D] rounded-full overflow-hidden border border-[#382E24]">
                <div
                  className="h-full bg-gradient-to-r from-[#E8A838] to-[#D1704A] transition-all duration-300 rounded-full"
                  style={{ width: `${(registerStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* PASSO 1: Nome e Nascimento */}
            {registerStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-extrabold text-[#C8B8A0] uppercase mb-1">
                    Como cê se chama? (Nome Completo)
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Ana Clara Ribeiro"
                    className="w-full px-4 py-3 rounded-2xl border border-[#382E24] bg-[#120F0D] text-sm text-[#F5E9D3] focus:outline-none focus:border-[#E8A838]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#C8B8A0] uppercase mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    required
                    value={nascimento}
                    onChange={(e) => setNascimento(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#382E24] bg-[#120F0D] text-sm text-[#F5E9D3] focus:outline-none focus:border-[#E8A838]"
                  />
                </div>
              </div>
            )}

            {/* PASSO 2: Localização e Cidade */}
            {registerStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-3 bg-[#120F0D] rounded-2xl border border-[#382E24] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-black text-[#C8B8A0] block">Estado Detectado por GPS</span>
                    <span className="text-sm font-black text-[#F5E9D3] flex items-center space-x-1.5 mt-0.5">
                      <span>{estadoConfig.emblem}</span>
                      <span style={{ color: estadoConfig.cor }}>{estadoConfig.nome} ({estadoConfig.sigla})</span>
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-[#2A231D] text-[10px] font-bold text-emerald-400 border border-emerald-800/50">
                    GPS Preciso 📍
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#C8B8A0] uppercase mb-1">
                    Sua Cidade em {estadoConfig.nome} ({estadoConfig.sigla})
                  </label>
                  <input
                    type="text"
                    required
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder={`Ex: Sua cidade em ${estadoConfig.nome}...`}
                    className="w-full px-4 py-3 rounded-2xl border border-[#382E24] bg-[#120F0D] text-sm text-[#F5E9D3] focus:outline-none focus:border-[#E8A838]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-[#C8B8A0] uppercase mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Centro"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#382E24] bg-[#120F0D] text-xs text-[#F5E9D3]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#C8B8A0] uppercase mb-1">
                      Altura (m)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={altura}
                      onChange={(e) => setAltura(e.target.value)}
                      placeholder="1.75"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#382E24] bg-[#120F0D] text-xs text-[#F5E9D3]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 3: Tipo Corporal e Foto */}
            {registerStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-extrabold text-[#C8B8A0] uppercase mb-1">
                    Tipo Corporal
                  </label>
                  <select
                    value={tipoCorporal}
                    onChange={(e) => setTipoCorporal(e.target.value as UserProfile['tipo_corporal'])}
                    className="w-full px-4 py-3 rounded-2xl border border-[#382E24] bg-[#120F0D] text-sm text-[#F5E9D3] focus:outline-none focus:border-[#E8A838]"
                  >
                    <option value="Atlético">Atlético</option>
                    <option value="Normal">Normal</option>
                    <option value="Um pouquinho a mais">Um pouquinho a mais</option>
                    <option value="Gordinho(a)">Gordinho(a)</option>
                    <option value="Prefiro não informar">Prefiro não informar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#C8B8A0] uppercase mb-1">
                    Foto de Perfil (URL ou escolha abaixo)
                  </label>
                  <input
                    type="url"
                    required
                    value={foto}
                    onChange={(e) => setFoto(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#382E24] bg-[#120F0D] text-xs text-[#F5E9D3] mb-2"
                  />
                  <div className="flex space-x-2 overflow-x-auto py-1">
                    {samplePhotos.map((p, idx) => (
                      <img
                        key={idx}
                        src={p}
                        alt="Sugestão"
                        onClick={() => setFoto(p)}
                        className={`w-11 h-11 rounded-xl object-cover cursor-pointer border-2 transition-transform ${
                          foto === p ? 'border-[#E8A838] scale-105' : 'border-transparent opacity-70'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 4: Apresentação */}
            {registerStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-extrabold text-[#C8B8A0] uppercase mb-1">
                    Apresentação / Descrição
                  </label>
                  <textarea
                    rows={3}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Conta um pouco sobre você, do que cê gosta..."
                    className="w-full p-3 rounded-2xl border border-[#382E24] bg-[#120F0D] text-sm text-[#F5E9D3] focus:outline-none focus:border-[#E8A838] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#C8B8A0] uppercase mb-1">
                    Tipo de Perfil
                  </label>
                  <div className="grid grid-cols-2 gap-2">
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
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              {registerStep > 1 && (
                <button
                  type="button"
                  onClick={() => setRegisterStep((prev) => prev - 1)}
                  className="py-3 px-4 bg-[#2A231D] text-[#C8B8A0] hover:text-[#F5E9D3] font-bold text-xs rounded-2xl border border-[#382E24]"
                >
                  Voltar
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3.5 golden-button rounded-2xl text-xs sm:text-sm font-black shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{registerStep === 4 ? 'Pronto! Entrar na Prosa 💛' : 'Próximo Passo'}</span>
                {registerStep < 4 && <ArrowRight className="w-4 h-4 text-[#120F0D]" />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
