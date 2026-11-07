import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { AuthModal } from './components/AuthModal';
import { CertcoinsModal } from './components/CertcoinsModal';
import { NotificationsModal } from './components/NotificationsModal';
import { FeedView } from './components/FeedView';
import { DiscoverView } from './components/DiscoverView';
import { MatchesView } from './components/MatchesView';
import { GamesView } from './components/GamesView';
import { AdminView } from './components/AdminView';
import { SettingsView } from './components/SettingsView';
import { MineiridadeCard } from './components/MineiridadeCard';
import { LeaderboardView } from './components/LeaderboardView';
import { AdSenseCompliance } from './components/AdSenseCompliance';
import { CookieBanner } from './components/CookieBanner';
import { Footer } from './components/Footer';
import { UserProfile, CertcoinLote, Postagem, Match, Mensagem, Nota, Denuncia, NotificacaoPush } from './types';
import { MOCK_USERS, INITIAL_POSTS, INITIAL_LOTES, INITIAL_MATCHES, INITIAL_MESSAGES } from './lib/store';
import { getEstadoConfig } from './lib/estados';
import { detectUserLocation, ESTADOS_COORDENADAS } from './lib/geolocation';

function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return fallback;
    const parsed = JSON.parse(item);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`Erro ao carregar ${key} do localStorage:`, err);
    return fallback;
  }
}

export default function App() {
  const [currentEstadoSigla, setCurrentEstadoSigla] = useState<string>(() =>
    safeGetJSON('encontro_certo_estado', 'MG')
  );

  const [usuarios, setUsuarios] = useState<UserProfile[]>(() =>
    safeGetJSON('encontro_certo_usuarios', MOCK_USERS)
  );

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    safeGetJSON('encontro_certo_current_user', null)
  );

  const [lotes, setLotes] = useState<CertcoinLote[]>(() =>
    safeGetJSON('encontro_certo_lotes', INITIAL_LOTES)
  );

  const [posts, setPosts] = useState<Postagem[]>(() =>
    safeGetJSON('encontro_certo_posts', INITIAL_POSTS)
  );

  const [matches, setMatches] = useState<Match[]>(() => {
    const list = safeGetJSON<Match[]>('encontro_certo_matches', INITIAL_MATCHES);
    return Array.isArray(list) && list.length >= 2 ? list : INITIAL_MATCHES;
  });

  const [mensagens, setMensagens] = useState<Mensagem[]>(() => {
    const list = safeGetJSON<Mensagem[]>('encontro_certo_mensagens', INITIAL_MESSAGES);
    return Array.isArray(list) && list.length >= 5 ? list : INITIAL_MESSAGES;
  });

  const [notas, setNotas] = useState<Nota[]>([]);
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [readReceipts, setReadReceipts] = useState<string[]>([]);

  const estadoConfig = getEstadoConfig(currentEstadoSigla);

  const [notificacoes, setNotificacoes] = useState<NotificacaoPush[]>([
    {
      id: 'notif-1',
      titulo: 'Boas-vindas!',
      mensagem: estadoConfig.aoEntrar,
      lida: false,
      criado_em: new Date().toISOString(),
    },
  ]);

  const [activeTab, setActiveTab] = useState<string>('feed');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showCertcoinsModal, setShowCertcoinsModal] = useState<boolean>(false);
  const [showNotifsModal, setShowNotifsModal] = useState<boolean>(false);
  const [complianceTab, setComplianceTab] = useState<'privacy' | 'terms' | 'about' | 'contact' | 'adsense' | null>(null);

  const [geoNotice, setGeoNotice] = useState<{
    show: boolean;
    nome: string;
    sigla: string;
    emblem: string;
    cidade?: string;
    metodo: string;
  } | null>(null);

  // Detecção Automática de Localização no Carregamento do Site
  useEffect(() => {
    let active = true;

    detectUserLocation((detected) => {
      if (!active) return;
      setCurrentEstadoSigla(detected.sigla);
      const cfg = getEstadoConfig(detected.sigla);

      setGeoNotice({
        show: true,
        nome: detected.nome,
        sigla: detected.sigla,
        emblem: cfg.emblem,
        cidade: detected.cidade,
        metodo: detected.metodo === 'gps' ? 'GPS do Dispositivo' : 'Conexão de Rede',
      });

      // Esconde aviso sutil após 6 segundos
      setTimeout(() => {
        if (active) {
          setGeoNotice((prev) => (prev ? { ...prev, show: false } : null));
        }
      }, 6000);

      // Sincroniza usuário logado com a localização detectada
      setCurrentUser((prevUser) => {
        if (!prevUser) return null;
        if (prevUser.estado_sigla === detected.sigla) return prevUser;
        const coords = ESTADOS_COORDENADAS[detected.sigla];
        return {
          ...prevUser,
          estado_sigla: detected.sigla,
          cidade: detected.cidade || prevUser.cidade,
          latitude: coords ? coords.lat : prevUser.latitude,
          longitude: coords ? coords.lng : prevUser.longitude,
        };
      });
    });

    return () => {
      active = false;
    };
  }, []);

  const handleSelectEstado = (sigla: string) => {
    setCurrentEstadoSigla(sigla);
    localStorage.setItem('encontro_certo_estado', JSON.stringify(sigla));
    if (currentUser) {
      const coords = ESTADOS_COORDENADAS[sigla];
      const updated = {
        ...currentUser,
        estado_sigla: sigla,
        latitude: coords ? coords.lat : currentUser.latitude,
        longitude: coords ? coords.lng : currentUser.longitude,
      };
      setCurrentUser(updated);
      setUsuarios((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    }
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('encontro_certo_usuarios', JSON.stringify(usuarios));
    localStorage.setItem('encontro_certo_lotes', JSON.stringify(lotes));
    localStorage.setItem('encontro_certo_posts', JSON.stringify(posts));
    localStorage.setItem('encontro_certo_matches', JSON.stringify(matches));
    localStorage.setItem('encontro_certo_mensagens', JSON.stringify(mensagens));
    if (currentUser) {
      localStorage.setItem('encontro_certo_current_user', JSON.stringify(currentUser));
    }
  }, [usuarios, lotes, posts, matches, mensagens, currentUser]);

  // Handle Login with eddornelas02@gmail.com / Edinho55@
  const handleLogin = (email: string) => {
    // Procura usuário admin ou cria um associado
    const existingAdmin = usuarios.find((u) => u.isAdmin);
    if (existingAdmin) {
      setCurrentUser(existingAdmin);
      return;
    }

    const newAdmin: UserProfile = {
      id: 'user-admin-ornelas',
      nome: 'Edd Ornelas (Admin)',
      nascimento: '1995-04-10',
      idade: 31,
      cidade: 'Belo Horizonte',
      bairro: 'Savassi',
      estado_sigla: currentEstadoSigla || 'MG',
      latitude: -19.932,
      longitude: -43.938,
      raio_busca: 50,
      altura: 1.80,
      tipo_corporal: 'Normal',
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      descricao: 'Criador do Encontro Certo Brasil. Um abraço especial pra todos!',
      tipo_perfil: 'publico',
      exibir_na_busca: true,
      criado_em: new Date().toISOString(),
      isAdmin: true,
    };
    setUsuarios((prev) => [newAdmin, ...prev]);
    setCurrentUser(newAdmin);
  };

  const handleRegister = (profileData: Omit<UserProfile, 'id' | 'idade' | 'criado_em'>) => {
    const newUser: UserProfile = {
      ...profileData,
      id: 'user-' + Date.now(),
      idade: 25,
      criado_em: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    setUsuarios((prev) => [newUser, ...prev]);
    setLotes((prev) => [
      {
        id: 'lote-' + Date.now(),
        usuario_id: newUser.id,
        quantidade: 50,
        tipo: 'temp',
        expira_em: new Date(Date.now() + 86400000 * 30).toISOString(),
        criado_em: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // Helper: Deduct Certcoins with FIFO
  const deductCertcoins = (amount: number): boolean => {
    if (!currentUser) return false;
    const userLotes = lotes.filter((l) => l.usuario_id === currentUser.id);
    const total = userLotes.reduce((acc, l) => acc + l.quantidade, 0);
    if (total < amount) return false;

    let remaining = amount;
    const updatedLotes = [...lotes];
    const sortedUserLotes = userLotes.sort((a, b) => {
      if (a.tipo === 'temp' && b.tipo === 'vitalicio') return -1;
      if (a.tipo === 'vitalicio' && b.tipo === 'temp') return 1;
      return new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime();
    });

    for (const lote of sortedUserLotes) {
      if (remaining <= 0) break;
      const idx = updatedLotes.findIndex((l) => l.id === lote.id);
      if (idx !== -1) {
        if (updatedLotes[idx].quantidade >= remaining) {
          updatedLotes[idx] = {
            ...updatedLotes[idx],
            quantidade: updatedLotes[idx].quantidade - remaining,
          };
          remaining = 0;
        } else {
          remaining -= updatedLotes[idx].quantidade;
          updatedLotes[idx] = { ...updatedLotes[idx], quantidade: 0 };
        }
      }
    }

    setLotes(updatedLotes.filter((l) => l.quantidade > 0));
    return true;
  };

  const addCertcoins = (quantidade: number) => {
    if (!currentUser) return;
    const novoLote: CertcoinLote = {
      id: 'lote-' + Date.now(),
      usuario_id: currentUser.id,
      quantidade,
      tipo: 'temp',
      expira_em: new Date(Date.now() + 86400000 * 30).toISOString(),
      criado_em: new Date().toISOString(),
    };
    setLotes((prev) => [novoLote, ...prev]);
  };

  const handleCreatePost = (conteudo: string) => {
    if (!deductCertcoins(1)) return;
    const newPost: Postagem = {
      id: 'post-' + Date.now(),
      autor_id: currentUser!.id,
      conteudo,
      criado_em: new Date().toISOString(),
      autor: currentUser!,
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleEditPost = (postId: string, novoConteudo: string) => {
    if (!deductCertcoins(1)) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const historicoItem = { conteudo_antigo: p.conteudo, alterado_em: new Date().toISOString() };
          return {
            ...p,
            conteudo: novoConteudo,
            editado_em: new Date().toISOString(),
            historico: [...(p.historico || []), historicoItem],
          };
        }
        return p;
      })
    );
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleSendNote = (paraUserId: string, valor: number) => {
    const newNota: Nota = {
      id: 'nota-' + Date.now(),
      de_usuario_id: currentUser!.id,
      para_usuario_id: paraUserId,
      valor,
      criado_em: new Date().toISOString(),
    };
    setNotas((prev) => [...prev, newNota]);
    addCertcoins(valor);
  };

  const handleSendLike = (alvoId: string, superCerto: boolean) => {
    const cost = superCerto ? 3 : 0;
    if (cost > 0 && !deductCertcoins(cost)) return;

    const outro = usuarios.find((u) => u.id === alvoId);
    if (!outro) return;

    const jaMatch = matches.some(
      (m) =>
        (m.usuario1_id === currentUser!.id && m.usuario2_id === alvoId) ||
        (m.usuario1_id === alvoId && m.usuario2_id === currentUser!.id)
    );

    if (!jaMatch) {
      const novoMatch: Match = {
        id: 'match-' + Date.now(),
        usuario1_id: currentUser!.id,
        usuario2_id: alvoId,
        criado_em: new Date().toISOString(),
        outro_usuario: outro,
      };
      setMatches((prev) => [novoMatch, ...prev]);

      setNotificacoes((prev) => [
        {
          id: 'notif-' + Date.now(),
          titulo: 'Novo Match! 💛',
          mensagem: `Deu Match com ${outro.nome}! ${estadoConfig.match}`,
          lida: false,
          criado_em: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  };

  const handleSendMessage = (
    destinatarioId: string,
    conteudo: string,
    tipo: 'texto' | 'foto' | 'audio' | 'presente' = 'texto',
    destacada: boolean = false,
    extraData?: { imagem_url?: string; audio_duracao?: number; qtd_presente?: number }
  ) => {
    if (destacada && !deductCertcoins(4)) return;

    const novaMsg: Mensagem = {
      id: 'msg-' + Date.now(),
      remetente_id: currentUser!.id,
      destinatario_id: destinatarioId,
      conteudo,
      tipo,
      destacada,
      criado_em: new Date().toISOString(),
      ...extraData,
    };
    setMensagens((prev) => [...prev, novaMsg]);

    // Resposta automática acolhedora de Minas Gerais após 1.5s para enriquecer o histórico da conversa
    const outro = usuarios.find((u) => u.id === destinatarioId);
    if (outro) {
      const mineiroReplies: Record<string, string[]> = {
        'user-1': [
          'Trem bão demais sô! Adorei bater esse papo contigo 💛',
          'Pois é! Nada como um café mineiro pra alegrar a tarde.',
          'Uai, concordo plenamente com você! Quando cê vier a Ouro Preto me avisa!',
          'Que coisa boa! Vamos marcar aquele pão de queijo na praça sim!',
          'Hahaha bom demais da conta! Você é muito simpático(a).'
        ],
        'user-2': [
          'É isso aí meu parceiro! Aqui em Contagem o carteado e a viola comem solto!',
          'Opa, falou e disse! Trem bão demais!',
          'Com certeza sô! Tamo junto nessa prosa boa.',
          'Bora sim! Vou afinar a viola pro fim de semana.'
        ],
        'user-3': [
          'Que gracinha! Adorei sua mensagem 💛',
          'Uberlândia tá de portas abertas quando você vier!',
          'Nossa, concordo 100%! Conversar com gente de Minas é outro nível.'
        ]
      };

      const replies = mineiroReplies[destinatarioId] || [
        'Uai, bom demais prosear com você!',
        'Trem bão! Um abraço bem apertado de Minas pra você 💛',
        'Com certeza! Essa prosa tá boa demais da conta.'
      ];

      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      setTimeout(() => {
        const respostaMsg: Mensagem = {
          id: 'msg-reply-' + Date.now(),
          remetente_id: destinatarioId,
          destinatario_id: currentUser!.id,
          conteudo: randomReply,
          tipo: 'texto',
          criado_em: new Date().toISOString(),
        };
        setMensagens((prev) => [...prev, respostaMsg]);

        setNotificacoes((prev) => [
          {
            id: 'notif-' + Date.now(),
            titulo: `${outro.nome} mandou prosa! 💌`,
            mensagem: randomReply,
            lida: false,
            criado_em: new Date().toISOString(),
          },
          ...prev,
        ]);
      }, 1600);
    }
  };

  const handleResetDemoHistory = () => {
    setMensagens(INITIAL_MESSAGES);
    setMatches(INITIAL_MATCHES);
    localStorage.setItem('encontro_certo_mensagens', JSON.stringify(INITIAL_MESSAGES));
    localStorage.setItem('encontro_certo_matches', JSON.stringify(INITIAL_MATCHES));
    alert('Histórico de conversas dos últimos 3 dias restaurado com sucesso! 💛');
  };

  const handleClearChatHistory = (alvoId: string) => {
    if (!currentUser) return;
    if (confirm('Tem certeza que deseja limpar todo o histórico desta conversa?')) {
      setMensagens((prev) =>
        prev.filter(
          (m) =>
            !(
              (m.remetente_id === currentUser.id && m.destinatario_id === alvoId) ||
              (m.remetente_id === alvoId && m.destinatario_id === currentUser.id)
            )
        )
      );
    }
  };

  const handleUnlockReadReceipt = (alvoId: string) => {
    if (!deductCertcoins(5)) return;
    setReadReceipts((prev) => [...prev, alvoId]);
  };

  const handleSendGift = (alvoId: string, qtd: number) => {
    if (!deductCertcoins(qtd)) return;
    const novoLote: CertcoinLote = {
      id: 'lote-' + Date.now(),
      usuario_id: alvoId,
      quantidade: qtd,
      tipo: 'temp',
      expira_em: new Date(Date.now() + 86400000 * 30).toISOString(),
      criado_em: new Date().toISOString(),
    };
    setLotes((prev) => [novoLote, ...prev]);

    setNotificacoes((prev) => [
      {
        id: 'notif-' + Date.now(),
        titulo: 'Carinho recebido! 💛',
        mensagem: `Olha só! Você recebeu um carinho de ${qtd} Certcoins ${estadoConfig.emblem}`,
        lida: false,
        criado_em: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleTransferCertcoins = (destinatarioId: string, quantidade: number) => {
    if (!deductCertcoins(quantidade)) return;
    const novoLote: CertcoinLote = {
      id: 'lote-' + Date.now(),
      usuario_id: destinatarioId,
      quantidade,
      tipo: 'temp',
      expira_em: new Date(Date.now() + 86400000 * 30).toISOString(),
      criado_em: new Date().toISOString(),
    };
    setLotes((prev) => [novoLote, ...prev]);
  };

  // Se não estiver logado, mostra a tela de Login / Cadastro
  if (!currentUser) {
    return (
      <>
        {geoNotice?.show && (
          <div className="fixed top-4 right-4 z-50 max-w-sm bg-[#1E1915] border border-[#E8A838]/50 shadow-2xl rounded-2xl p-3.5 text-[#F5E9D3] backdrop-blur-md animate-fadeIn">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{geoNotice.emblem}</span>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5 text-xs font-black">
                  <span className="text-[#E8A838]">📍 Localização:</span>
                  <span>{geoNotice.nome} ({geoNotice.sigla})</span>
                </div>
                <p className="text-[11px] text-[#C8B8A0]">
                  {geoNotice.cidade ? `Detectado em ${geoNotice.cidade}. ` : ''}
                  Identificado por {geoNotice.metodo}.
                </p>
              </div>
            </div>
          </div>
        )}
        <LoginScreen
          estadoConfig={estadoConfig}
          onSelectEstado={handleSelectEstado}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </>
    );
  }

  const currentUserLotes = lotes.filter((l) => l.usuario_id === currentUser.id);
  const currentMatchIds = matches
    .filter((m) => m.usuario1_id === currentUser.id || m.usuario2_id === currentUser.id)
    .map((m) => (m.usuario1_id === currentUser.id ? m.usuario2_id : m.usuario1_id));

  return (
    <div className="min-h-screen bg-[#120F0D] text-[#F5E9D3] font-sans pb-20 md:pb-0">
      {/* Floating Geolocation Detection Toast */}
      {geoNotice?.show && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-[#1E1915] border border-[#E8A838]/50 shadow-2xl rounded-2xl p-3.5 text-[#F5E9D3] backdrop-blur-md animate-fadeIn">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{geoNotice.emblem}</span>
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5 text-xs font-black">
                <span className="text-[#E8A838]">📍 Localização:</span>
                <span>{geoNotice.nome} ({geoNotice.sigla})</span>
              </div>
              <p className="text-[11px] text-[#C8B8A0]">
                {geoNotice.cidade ? `Detectado em ${geoNotice.cidade}. ` : ''}
                Identificado por {geoNotice.metodo}.
              </p>
            </div>
          </div>
        </div>
      )}

      <Navbar
        currentUser={currentUser}
        estadoConfig={estadoConfig}
        onSelectEstado={handleSelectEstado}
        lotes={currentUserLotes}
        notificacoes={notificacoes}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCertcoins={() => setShowCertcoinsModal(true)}
        onOpenNotifications={() => setShowNotifsModal(true)}
        onlineCount={12}
      />

      <main>
        {activeTab === 'feed' && (
          <FeedView
            currentUser={currentUser}
            estadoConfig={estadoConfig}
            onSelectEstado={handleSelectEstado}
            posts={posts}
            usuarios={usuarios}
            lotes={currentUserLotes}
            notas={notas}
            matches={currentMatchIds}
            onCreatePost={handleCreatePost}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onSendNote={handleSendNote}
          />
        )}

        {activeTab === 'discover' && (
          <DiscoverView
            currentUser={currentUser}
            estadoConfig={estadoConfig}
            onSelectEstado={handleSelectEstado}
            usuarios={usuarios}
            lotes={currentUserLotes}
            matches={currentMatchIds}
            allPosts={posts}
            allMatches={matches}
            onUpdateRaio={(novoRaio) => setCurrentUser({ ...currentUser, raio_busca: novoRaio })}
            onSendLike={handleSendLike}
          />
        )}

        {activeTab === 'matches' && (
          <MatchesView
            currentUser={currentUser}
            estadoConfig={estadoConfig}
            matches={matches.filter(
              (m) => m.usuario1_id === currentUser.id || m.usuario2_id === currentUser.id
            ).map((m) => ({
              ...m,
              outro_usuario: usuarios.find((u) => u.id === (m.usuario1_id === currentUser.id ? m.usuario2_id : m.usuario1_id)),
            }))}
            mensagens={mensagens}
            lotes={currentUserLotes}
            readReceipts={readReceipts}
            onSendMessage={handleSendMessage}
            onUnlockReadReceipt={handleUnlockReadReceipt}
            onSendGift={handleSendGift}
            onClearChatHistory={handleClearChatHistory}
            onResetDemoHistory={handleResetDemoHistory}
          />
        )}

        {activeTab === 'games' && (
          <GamesView
            currentUser={currentUser}
            estadoConfig={estadoConfig}
            usuarios={usuarios}
            onAddCertcoins={addCertcoins}
            activeTab={activeTab}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            usuarios={usuarios}
            posts={posts}
            matches={matches}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'admin' && currentUser?.isAdmin && (
          <AdminView
            usuarios={usuarios}
            denuncias={denuncias}
            lotes={lotes}
            onArchiveReport={(id) => setDenuncias((prev) => prev.filter((d) => d.id !== id))}
            onBanUser={(userId, motivo) => {
              setUsuarios((prev) => prev.filter((u) => u.id !== userId));
              alert(`Conta encerrada. Motivo: ${motivo}`);
            }}
            onSendAdminCertcoins={handleTransferCertcoins}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            currentUser={currentUser}
            estadoConfig={estadoConfig}
            onSelectEstado={handleSelectEstado}
            onUpdateSettings={(updates) => setCurrentUser({ ...currentUser, ...updates })}
            onOpenProfileEdit={() => setShowAuthModal(true)}
            onOpenCompliance={(tab) => setComplianceTab(tab)}
          />
        )}

        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
            <div className="bg-[#1E1915] rounded-3xl p-6 shadow-lg border border-[#382E24] text-center space-y-4">
              <img src={currentUser.foto} alt={currentUser.nome} className="w-28 h-28 rounded-full object-cover mx-auto border-4 shadow-md" style={{ borderColor: estadoConfig.cor }} />
              <div>
                <h2 className="text-2xl font-black text-[#F5E9D3]">{currentUser.nome}, {currentUser.idade}</h2>
                <p className="text-xs text-[#C8B8A0]">{currentUser.cidade} ({estadoConfig.sigla}) {currentUser.bairro ? `• ${currentUser.bairro}` : ''}</p>
              </div>
              <p className="text-sm text-[#F5E9D3] bg-[#2A231D] p-4 rounded-2xl border border-[#382E24]">
                {currentUser.descricao}
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full py-3 golden-button rounded-xl text-sm"
              >
                Editar Meu Perfil {estadoConfig.emblem}
              </button>
            </div>
            <MineiridadeCard
              postsCount={posts.filter((p) => p.autor_id === currentUser.id).length}
              matchesCount={matches.filter((m) => m.usuario1_id === currentUser.id || m.usuario2_id === currentUser.id).length}
            />
          </div>
        )}
      </main>

      {/* Footer & Cookie Consent */}
      <Footer
        estadoConfig={estadoConfig}
        onOpenCompliance={(tab) => setComplianceTab(tab)}
      />

      <CookieBanner
        estadoConfig={estadoConfig}
        onOpenPrivacy={() => setComplianceTab('privacy')}
      />

      {/* Modals */}
      {complianceTab && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto p-4 flex items-center justify-center">
          <div className="w-full max-w-4xl my-8">
            <AdSenseCompliance
              estadoConfig={estadoConfig}
              initialTab={complianceTab}
              onClose={() => setComplianceTab(null)}
            />
          </div>
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          estadoConfig={estadoConfig}
          onSelectEstado={handleSelectEstado}
          onCompleteProfile={(profileData) => {
            setCurrentUser({ ...currentUser, ...profileData });
            setUsuarios((prev) => prev.map((u) => (u.id === currentUser.id ? { ...currentUser, ...profileData } : u)));
            setShowAuthModal(false);
          }}
          initialData={currentUser}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showCertcoinsModal && (
        <CertcoinsModal
          lotes={currentUserLotes}
          usuarios={usuarios}
          currentUserId={currentUser.id}
          onClose={() => setShowCertcoinsModal(false)}
          onTransfer={handleTransferCertcoins}
        />
      )}

      {showNotifsModal && (
        <NotificationsModal
          notificacoes={notificacoes}
          onClose={() => setShowNotifsModal(false)}
          onMarkAllAsRead={() =>
            setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })))
          }
        />
      )}
    </div>
  );
}
