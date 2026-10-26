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
import { UserProfile, CertcoinLote, Postagem, Match, Mensagem, Nota, Denuncia, NotificacaoPush } from './types';
import { MOCK_USERS, INITIAL_POSTS, INITIAL_LOTES, INITIAL_MATCHES, INITIAL_MESSAGES } from './lib/store';
import { mineiroNLP } from './lib/mineiroNLP';

export default function App() {
  const [usuarios, setUsuarios] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('encontro_certo_usuarios');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('encontro_certo_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [lotes, setLotes] = useState<CertcoinLote[]>(() => {
    const saved = localStorage.getItem('encontro_certo_lotes');
    return saved ? JSON.parse(saved) : INITIAL_LOTES;
  });

  const [posts, setPosts] = useState<Postagem[]>(() => {
    const saved = localStorage.getItem('encontro_certo_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('encontro_certo_matches');
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  const [mensagens, setMensagens] = useState<Mensagem[]>(() => {
    const saved = localStorage.getItem('encontro_certo_mensagens');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [notas, setNotas] = useState<Nota[]>([]);
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [readReceipts, setReadReceipts] = useState<string[]>([]);
  const [notificacoes, setNotificacoes] = useState<NotificacaoPush[]>([
    {
      id: 'notif-1',
      titulo: 'Boas-vindas!',
      mensagem: mineiroNLP.welcomeBack('Mineiro(a)'),
      lida: false,
      criado_em: new Date().toISOString(),
    },
  ]);

  const [activeTab, setActiveTab] = useState<string>('feed');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showCertcoinsModal, setShowCertcoinsModal] = useState<boolean>(false);
  const [showNotifsModal, setShowNotifsModal] = useState<boolean>(false);

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
    let adminUser = usuarios.find((u) => u.isAdmin);
    if (!adminUser) {
      adminUser = {
        id: 'user-admin-ornelas',
        nome: 'Edd Ornelas (Admin)',
        nascimento: '1995-04-10',
        idade: 31,
        cidade: 'Belo Horizonte',
        bairro: 'Savassi',
        latitude: -19.932,
        longitude: -43.938,
        raio_busca: 50,
        altura: 1.80,
        tipo_corporal: 'Normal',
        foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        descricao: 'Criador do Encontro Certo MG. Um uai bem grande pra todos! Curto um pão de queijo com café.',
        tipo_perfil: 'publico',
        exibir_na_busca: true,
        criado_em: new Date().toISOString(),
        isAdmin: true,
      };
      setUsuarios((prev) => [adminUser!, ...prev]);
    }
    setCurrentUser(adminUser);
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
          mensagem: mineiroNLP.match(outro.nome),
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
    destacada: boolean = false
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
    };
    setMensagens((prev) => [...prev, novaMsg]);
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
        mensagem: mineiroNLP.novoPresente(qtd),
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
    return <LoginScreen onLogin={handleLogin} onRegister={handleRegister} />;
  }

  const currentUserLotes = lotes.filter((l) => l.usuario_id === currentUser.id);
  const currentMatchIds = matches
    .filter((m) => m.usuario1_id === currentUser.id || m.usuario2_id === currentUser.id)
    .map((m) => (m.usuario1_id === currentUser.id ? m.usuario2_id : m.usuario1_id));

  return (
    <div className="min-h-screen bg-orange-50/30 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 font-sans pb-16 md:pb-0">
      <Navbar
        currentUser={currentUser}
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
            usuarios={usuarios}
            lotes={currentUserLotes}
            matches={currentMatchIds}
            onUpdateRaio={(novoRaio) => setCurrentUser({ ...currentUser, raio_busca: novoRaio })}
            onSendLike={handleSendLike}
          />
        )}

        {activeTab === 'matches' && (
          <MatchesView
            currentUser={currentUser}
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
          />
        )}

        {activeTab === 'games' && (
          <GamesView currentUser={currentUser} onAddCertcoins={addCertcoins} />
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
            onUpdateSettings={(updates) => setCurrentUser({ ...currentUser, ...updates })}
            onOpenProfileEdit={() => setShowAuthModal(true)}
          />
        )}

        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto py-8 px-4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-orange-100 dark:border-zinc-800 text-center space-y-4">
              <img src={currentUser.foto} alt={currentUser.nome} className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-orange-400 shadow-md" />
              <div>
                <h2 className="text-2xl font-black">{currentUser.nome}, {currentUser.idade}</h2>
                <p className="text-xs text-zinc-500">{currentUser.cidade} {currentUser.bairro ? `• ${currentUser.bairro}` : ''}</p>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-orange-50/50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                {currentUser.descricao}
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full py-3 bg-orange-500 text-white font-extrabold rounded-xl shadow text-sm"
              >
                Editar Meu Perfil 💛
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onCompleteProfile={(profileData) => {
            setCurrentUser({ ...currentUser, ...profileData });
            setUsuarios((prev) => prev.map((u) => (u.id === currentUser.id ? { ...currentUser, ...profileData } : u)));
            setShowAuthModal(false);
          }}
          initialData={currentUser}
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
