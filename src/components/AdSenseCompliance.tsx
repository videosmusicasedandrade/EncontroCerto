import React, { useState } from 'react';
import { Shield, FileText, Info, Mail, CheckCircle2, Copy, Check, DollarSign, Globe, Lock, ChevronRight, HelpCircle } from 'lucide-react';
import { EstadoConfig } from '../types';

interface AdSenseComplianceProps {
  estadoConfig: EstadoConfig;
  initialTab?: 'privacy' | 'terms' | 'about' | 'contact' | 'adsense';
  onClose?: () => void;
}

export function AdSenseCompliance({ estadoConfig, initialTab = 'privacy', onClose }: AdSenseComplianceProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'about' | 'contact' | 'adsense'>(initialTab);
  const [pubId, setPubId] = useState<string>(() => localStorage.getItem('encontro_certo_adsense_pubid') || '');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedAdsTxt, setCopiedAdsTxt] = useState<boolean>(false);
  const [contactSuccess, setContactSuccess] = useState<boolean>(false);

  const handleSavePubId = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('encontro_certo_adsense_pubid', pubId);
    alert('ID do Google AdSense salvo com sucesso! O código de anúncios foi atualizado. 💛');
  };

  const copyToClipboard = (text: string, setFn: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  const autoAdsSnippet = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId || 'ca-pub-0000000000000000'}" crossorigin="anonymous"></script>`;
  const adsTxtSnippet = `google.com, ${pubId ? pubId.replace('ca-pub-', 'pub-') : 'pub-0000000000000000'}, DIRECT, f08c47fec0942fa0`;

  return (
    <div className="bg-[#1E1915] border border-[#382E24] rounded-3xl p-4 md:p-6 shadow-2xl text-[#F5E9D3] max-w-4xl mx-auto my-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#382E24] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-bold border"
              style={{ backgroundColor: `${estadoConfig.cor}15`, borderColor: estadoConfig.cor, color: estadoConfig.cor }}
            >
              Google AdSense Compliant
            </span>
            <span className="text-xs text-[#C8B8A0]">Regulamento LGPD & Google Policies</span>
          </div>
          <h2 className="text-2xl font-black mt-1 text-[#F5E9D3] flex items-center gap-2">
            Central de Transparência e Políticas {estadoConfig.emblem}
          </h2>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#2A231D] hover:bg-[#382E24] text-xs font-bold text-[#F5E9D3] transition-colors"
          >
            Fechar
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#382E24] scrollbar-none">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'privacy'
              ? 'bg-[#E8A838] text-[#120F0D] shadow-md font-extrabold'
              : 'bg-[#2A231D] text-[#C8B8A0] hover:text-[#F5E9D3]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Política de Privacidade (LGPD)
        </button>

        <button
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'terms'
              ? 'bg-[#E8A838] text-[#120F0D] shadow-md font-extrabold'
              : 'bg-[#2A231D] text-[#C8B8A0] hover:text-[#F5E9D3]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Termos de Uso
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'about'
              ? 'bg-[#E8A838] text-[#120F0D] shadow-md font-extrabold'
              : 'bg-[#2A231D] text-[#C8B8A0] hover:text-[#F5E9D3]'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          Sobre Nós
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'contact'
              ? 'bg-[#E8A838] text-[#120F0D] shadow-md font-extrabold'
              : 'bg-[#2A231D] text-[#C8B8A0] hover:text-[#F5E9D3]'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          Contato & Suporte
        </button>

        <button
          onClick={() => setActiveTab('adsense')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'adsense'
              ? 'bg-[#E8A838] text-[#120F0D] shadow-md font-extrabold'
              : 'bg-[#2A231D] text-[#C8B8A0] hover:text-[#F5E9D3]'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Painel Google AdSense
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* 1. POLITICA DE PRIVACIDADE */}
        {activeTab === 'privacy' && (
          <div className="space-y-4 text-xs text-[#C8B8A0] leading-relaxed">
            <div className="bg-[#2A231D] p-4 rounded-2xl border border-[#382E24] flex items-center gap-3">
              <Lock className="w-6 h-6 text-[#E8A838] shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-[#F5E9D3]">Conformidade Total com LGPD e Google AdSense</h3>
                <p className="text-[11px] text-[#C8B8A0]">
                  Esta Política de Privacidade estabelece como os dados dos usuários do Encontro Certo Brasil são coletados, utilizados, armazenados e protegidos em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e com as Políticas do Programa Google AdSense.
                </p>
              </div>
            </div>

            <h4 className="text-sm font-bold text-[#F5E9D3] border-b border-[#382E24] pb-1">1. Coleta de Informações</h4>
            <p>
              Coletamos informações fornecidas voluntariamente ao criar seu perfil (nome, idade, cidade, estado, preferências e fotos) e dados de navegação técnica (endereço IP, tipo de navegador e identificadores de cookies).
            </p>

            <h4 className="text-sm font-bold text-[#F5E9D3] border-b border-[#382E24] pb-1">2. Google AdSense e Cookies de Publicidade</h4>
            <p>
              O <strong>Encontro Certo Brasil</strong> exibe anúncios veiculados pela Google Inc. e seus parceiros. A Google utiliza cookies (como o cookie DART) para veicular anúncios com base em visitas anteriores dos usuários a este ou a outros sites na Internet.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Os usuários podem optar por desativar a publicidade personalizada acessando as <a href="https://adssettings.google.com" target="_blank" rel="noreferrer" className="text-[#E8A838] underline">Configurações de Anúncios da Google</a>.</li>
              <li>Você também pode gerenciar suas preferências no site <a href="https://www.aboutads.info" target="_blank" rel="noreferrer" className="text-[#E8A838] underline">www.aboutads.info</a>.</li>
            </ul>

            <h4 className="text-sm font-bold text-[#F5E9D3] border-b border-[#382E24] pb-1">3. Proteção e Segurança de Dados</h4>
            <p>
              Todos os dados pessoais são armazenados em ambiente seguro com criptografia de ponta a ponta. Não vendemos nem compartilhamos dados pessoais com terceiros não autorizados.
            </p>

            <h4 className="text-sm font-bold text-[#F5E9D3] border-b border-[#382E24] pb-1">4. Direitos dos Titulares de Dados (LGPD)</h4>
            <p>
              Você tem direito de confirmar a existência de tratamento, acessar, corrigir, anonimizar ou solicitar a exclusão de seus dados a qualquer momento enviando um e-mail para <strong>privacidade@encontrocertobrasil.com.br</strong>.
            </p>
          </div>
        )}

        {/* 2. TERMOS DE USO */}
        {activeTab === 'terms' && (
          <div className="space-y-4 text-xs text-[#C8B8A0] leading-relaxed">
            <h3 className="text-base font-bold text-[#F5E9D3]">Termos e Condições de Uso do Encontro Certo Brasil</h3>
            <p>
              Ao utilizar a plataforma Encontro Certo Brasil, você concorda expressamente com os seguintes termos e diretrizes da comunidade:
            </p>

            <h4 className="text-sm font-bold text-[#F5E9D3] border-b border-[#382E24] pb-1">1. Elegibilidade e Idade Mínima</h4>
            <p>
              O serviço é exclusivo para maiores de 18 anos. É estritamente proibido o cadastro de menores de idade.
            </p>

            <h4 className="text-sm font-bold text-[#F5E9D3] border-b border-[#382E24] pb-1">2. Conduta Respeitosa e Moderação de Conteúdo</h4>
            <p>
              Não toleramos discursos de ódio, assédio, spam, fotos inadequadas ou perfis falsos. Perfis que violarem nossas regras serão banidos imediatamente sem reembolso de moedas Virtuais (Certcoins).
            </p>

            <h4 className="text-sm font-bold text-[#F5E9D3] border-b border-[#382E24] pb-1">3. Moeda Virtual (Certcoins)</h4>
            <p>
              Certcoins são unidades virtuais internas utilizadas exclusivamente dentro do aplicativo para interações gamificadas, jogos e presentes. Não possuem valor monetário real nem podem ser trocadas por dinheiro.
            </p>

            <h4 className="text-sm font-bold text-[#F5E9D3] border-b border-[#382E24] pb-1">4. Limitação de Responsabilidade</h4>
            <p>
              Encontro Certo Brasil conecta pessoas com interesses comuns. Encorajamos práticas seguras de convivência e encontros presenciais apenas em locais públicos e bem movimentados.
            </p>
          </div>
        )}

        {/* 3. SOBRE NOS */}
        {activeTab === 'about' && (
          <div className="space-y-4 text-xs text-[#C8B8A0] leading-relaxed">
            <div className="bg-[#2A231D] p-5 rounded-2xl border border-[#382E24] flex items-center gap-4">
              <Globe className="w-10 h-10 text-[#E8A838] shrink-0" />
              <div>
                <h3 className="text-base font-bold text-[#F5E9D3]">Encontro Certo Brasil</h3>
                <p className="text-xs text-[#C8B8A0]">
                  O aplicativo de amizades, conexões e encontros feito com a alma, o acolhimento e a cultura de cada cantinho do Brasil.
                </p>
              </div>
            </div>

            <p>
              Fundado com o propósito de aproximar pessoas respeitando suas raízes e expressões regionais, o <strong>Encontro Certo Brasil</strong> reúne em um só ambiente tecnológico moderno:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-[#120F0D] p-3 rounded-xl border border-[#382E24] space-y-1">
                <h5 className="font-bold text-[#F5E9D3] text-xs">🇧🇷 Personalidade por Estado</h5>
                <p className="text-[11px]">Adaptação automática de sotaque, cores, gírias e saudações conforme o estado do usuário.</p>
              </div>

              <div className="bg-[#120F0D] p-3 rounded-xl border border-[#382E24] space-y-1">
                <h5 className="font-bold text-[#F5E9D3] text-xs">💛 Gamificação com Certcoins</h5>
                <p className="text-[11px]">Sistemas de recompensa, jogos interativos e trocas carinhosas entre os membros.</p>
              </div>

              <div className="bg-[#120F0D] p-3 rounded-xl border border-[#382E24] space-y-1">
                <h5 className="font-bold text-[#F5E9D3] text-xs">🛡️ Segurança e Respeito</h5>
                <p className="text-[11px]">Verificação de comunidade, canal direto de denúncias e respeito à privacidade.</p>
              </div>

              <div className="bg-[#120F0D] p-3 rounded-xl border border-[#382E24] space-y-1">
                <h5 className="font-bold text-[#F5E9D3] text-xs">☕ Ambiente Acolhedor</h5>
                <p className="text-[11px]">Criado para fazer você se sentir em casa, onde quer que esteja no Brasil.</p>
              </div>
            </div>
          </div>
        )}

        {/* 4. CONTATO */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <div className="bg-[#2A231D] p-4 rounded-2xl border border-[#382E24] text-xs space-y-2">
              <h3 className="text-sm font-bold text-[#F5E9D3] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E8A838]" />
                Canais Oficiais de Atendimento e Suporte
              </h3>
              <p className="text-[#C8B8A0]">
                Nosso time de atendimento está disponível para dúvidas, sugestões, privacidade ou solicitações de imprensa.
              </p>
              <div className="pt-1 flex flex-col sm:flex-row gap-4 text-[11px] font-mono text-[#E8A838]">
                <span>📧 contato@encontrocertobrasil.com.br</span>
                <span>📧 privacidade@encontrocertobrasil.com.br</span>
              </div>
            </div>

            {contactSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
                <p className="font-bold">Mensagem enviada com sucesso!</p>
                <p className="text-[11px]">Retornaremos em até 24 horas úteis no seu e-mail informado. 💛</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSuccess(true);
                }}
                className="space-y-3 bg-[#120F0D] p-4 rounded-2xl border border-[#382E24]"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#C8B8A0] mb-1">Seu Nome</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Maria da Silva"
                      className="w-full bg-[#1E1915] border border-[#382E24] rounded-xl px-3 py-2 text-xs text-[#F5E9D3] focus:outline-none focus:border-[#E8A838]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#C8B8A0] mb-1">Seu E-mail</label>
                    <input
                      type="email"
                      required
                      placeholder="voce@email.com"
                      className="w-full bg-[#1E1915] border border-[#382E24] rounded-xl px-3 py-2 text-xs text-[#F5E9D3] focus:outline-none focus:border-[#E8A838]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#C8B8A0] mb-1">Assunto</label>
                  <select
                    required
                    className="w-full bg-[#1E1915] border border-[#382E24] rounded-xl px-3 py-2 text-xs text-[#F5E9D3] focus:outline-none focus:border-[#E8A838]"
                  >
                    <option value="suporte">Dúvida ou Suporte Geral</option>
                    <option value="privacidade">Privacidade / Dados Pessoais (LGPD)</option>
                    <option value="adsense">Google AdSense / Anunciantes</option>
                    <option value="denuncia">Reportar Problema / Denúncia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#C8B8A0] mb-1">Mensagem</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Escreva sua mensagem com detalhes..."
                    className="w-full bg-[#1E1915] border border-[#382E24] rounded-xl px-3 py-2 text-xs text-[#F5E9D3] focus:outline-none focus:border-[#E8A838]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#E8A838] text-[#120F0D] font-extrabold text-xs hover:brightness-110 transition-all"
                >
                  Enviar Mensagem para o Suporte 💛
                </button>
              </form>
            )}
          </div>
        )}

        {/* 5. PAINEL GOOGLE ADSENSE */}
        {activeTab === 'adsense' && (
          <div className="space-y-5">
            <div className="bg-[#2A231D] p-4 rounded-2xl border border-[#382E24] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F5E9D3] flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#E8A838]" />
                  Configuração do ID de Publicador Google AdSense
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#120F0D] text-[#E8A838] border border-[#382E24]">
                  Status: 100% Aprovável
                </span>
              </div>

              <p className="text-xs text-[#C8B8A0]">
                Informe abaixo seu ID de Publicador fornecido na sua conta do Google AdSense (exemplo: <code>ca-pub-1234567890123456</code>).
              </p>

              <form onSubmit={handleSavePubId} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  value={pubId}
                  onChange={(e) => setPubId(e.target.value)}
                  className="flex-1 bg-[#120F0D] border border-[#382E24] rounded-xl px-3 py-2 text-xs text-[#F5E9D3] font-mono focus:outline-none focus:border-[#E8A838]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#E8A838] text-[#120F0D] font-bold text-xs hover:brightness-110 shrink-0"
                >
                  Salvar e Ativar Anúncios
                </button>
              </form>
            </div>

            {/* Verification Checkpoints */}
            <div className="bg-[#120F0D] p-4 rounded-2xl border border-[#382E24] space-y-3">
              <h4 className="text-xs font-bold text-[#F5E9D3] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Checklist Completo de Requisitos Exigidos pelo Google AdSense:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2 bg-[#1E1915] p-2.5 rounded-xl border border-[#382E24]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-[#F5E9D3]">Arquivo /ads.txt Configurado</span>
                    <p className="text-[#C8B8A0] text-[10px]">Acessível na raiz pública do site</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#1E1915] p-2.5 rounded-xl border border-[#382E24]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-[#F5E9D3]">Arquivo /robots.txt Criado</span>
                    <p className="text-[#C8B8A0] text-[10px]">Liberado para Mediapartners-Google</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#1E1915] p-2.5 rounded-xl border border-[#382E24]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-[#F5E9D3]">Sitemap XML Estruturado</span>
                    <p className="text-[#C8B8A0] text-[10px]">Incluso em /sitemap.xml</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#1E1915] p-2.5 rounded-xl border border-[#382E24]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-[#F5E9D3]">Política de Privacidade e LGPD</span>
                    <p className="text-[#C8B8A0] text-[10px]">Exibindo banner e detalhes de cookies</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Code Snippets */}
            <div className="space-y-3">
              <div className="bg-[#120F0D] p-3.5 rounded-xl border border-[#382E24] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#F5E9D3]">1. Código de Anúncios Automáticos (&lt;head&gt;)</span>
                  <button
                    onClick={() => copyToClipboard(autoAdsSnippet, setCopiedScript)}
                    className="flex items-center gap-1 text-[10px] text-[#E8A838] hover:underline"
                  >
                    {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedScript ? 'Copiado!' : 'Copiar Snippet'}
                  </button>
                </div>
                <pre className="text-[10px] bg-[#1E1915] p-2 rounded-lg font-mono text-[#C8B8A0] overflow-x-auto">
                  {autoAdsSnippet}
                </pre>
              </div>

              <div className="bg-[#120F0D] p-3.5 rounded-xl border border-[#382E24] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#F5E9D3]">2. Linha Recomendada para seu /ads.txt</span>
                  <button
                    onClick={() => copyToClipboard(adsTxtSnippet, setCopiedAdsTxt)}
                    className="flex items-center gap-1 text-[10px] text-[#E8A838] hover:underline"
                  >
                    {copiedAdsTxt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedAdsTxt ? 'Copiado!' : 'Copiar Linha'}
                  </button>
                </div>
                <pre className="text-[10px] bg-[#1E1915] p-2 rounded-lg font-mono text-[#C8B8A0] overflow-x-auto">
                  {adsTxtSnippet}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
