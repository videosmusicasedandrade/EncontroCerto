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
import { CertcoinSpendModal } from './components/CertcoinSpendModal';
import { LocationBanner } from './components/LocationBanner';
import { EncontroView } from './components/EncontroView';
import { UserProfile, CertcoinLote, Postagem, Match, Mensagem, Nota, Denuncia, NotificacaoPush } from './types';
import { MOCK_USERS, INITIAL_POSTS, INITIAL_LOTES, INITIAL_MATCHES, INITIAL_MESSAGES } from './lib/store';
import { getEstadoConfig } from './lib/estados';
import { detectUserLocation, LocationDetectionResult, ESTADOS_COORDENADAS } from './lib/geolocation';
import { checkRedirectResult } from './lib/firebase';

function calculateAge(nascimento: string): number {
  const birthDate = new Date(nascimento);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

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

  const [usuarios, setUsuarios] = useState<UserProfile[]>(() => {
    const list = safeGetJSON<UserProfile[]>('encontro_certo_usuarios', MOCK_USERS);
    if (!Array.isArray(list) || list.length === 0) return MOCK_USERS;

    // Garante que contas de teste e administradores tenham e-mail e senha mesmo se carregadas de versões antigas do localStorage
    return list.map((u) => {
      const mockMatch = MOCK_USERS.find((m) => m.id === u.id);
      if (mockMatch) {
        return {
          ...mockMatch,
          ...u,
          email: u.email || mockMatch.email,
          senha: u.senha || mockMatch.senha,
          isAdmin: u.isAdmin ?? mockMatch.isAdmin,
        };
      }
      return u;
    });
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const user = safeGetJSON<UserProfile | null>('encontro_certo_current_user', null);
    if (user) return { ...user, is_online: true };
    return null;
  });

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
  const [routeProtectionMsg, setRouteProtectionMsg] = useState<string | undefined>(undefined);

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
  const [initialActiveMatchId, setInitialActiveMatchId] = useState<string | null>(null);

  // Sempre que mudar de aba ou abrir uma página nova, sobe a tela para o topo
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  // Checa se o usuário retornou de um redirecionamento do Google
  useEffect(() => {
    checkRedirectResult().then((result) => {
      if (result && result.user) {
        handleGoogleLogin({
          name: result.user.displayName || 'Mineiro(a)',
          email: result.user.email || '',
          picture: result.user.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        });
      }
    });
  }, []);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showCertcoinsModal, setShowCertcoinsModal] = useState<boolean>(false);
  const [showNotifsModal, setShowNotifsModal] = useState<boolean>(false);
  const [showGlobalStateModal, setShowGlobalStateModal] = useState<boolean>(false);
  const [complianceTab, setComplianceTab] = useState<'privacy' | 'terms' | 'about' | 'contact' | 'adsense' | null>(null);

  // Spend Modal & Toast Notification State (Prompt 1.4)
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [spendModalConfig, setSpendModalConfig] = useState<{
    isOpen: boolean;
    costAmount: number;
    actionTitle: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    costAmount: 3,
    actionTitle: '',
    onConfirm: () => {},
  });

  const showSpendToast = (msg = 'Feito! 💛') => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const [locationResult, setLocationResult] = useState<LocationDetectionResult | null>(null);

  // Detecção de Localização: Pede GPS na primeira vez e atualiza a cada 30 minutos automaticamente
  useEffect(() => {
    let active = true;

    const runLocationDetection = () => {
      detectUserLocation((detected) => {
        if (!active) return;
        setLocationResult(detected);

        let activeSigla = detected.sigla || 'MG';
        if (detected.metodo === 'gps') {
          activeSigla = detected.sigla;
          localStorage.setItem('encontro_certo_estado', JSON.stringify(activeSigla));
          localStorage.setItem('encontro_certo_gps_asked', 'true');
        }

        setCurrentEstadoSigla(activeSigla);

        if (currentUser) {
          const coords = ESTADOS_COORDENADAS[activeSigla];
          const updated = {
            ...currentUser,
            estado_sigla: activeSigla,
            cidade: detected.cidade || currentUser.cidade,
            latitude: detected.latitude ?? coords?.lat ?? currentUser.latitude,
            longitude: detected.longitude ?? coords?.lng ?? currentUser.longitude,
          };
          setCurrentUser(updated);
          setUsuarios((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
        }
      });
    };

    runLocationDetection();

    // Atualiza automaticamente a cada 30 minutos em segundo plano
    const intervalId = setInterval(() => {
      runLocationDetection();
    }, 30 * 60 * 1000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [currentUser?.id]);



  const handleSelectEstado = (sigla: string) => {
    setCurrentEstadoSigla(sigla);
    localStorage.setItem('encontro_certo_estado', JSON.stringify(sigla));
    localStorage.setItem('encontro_certo_manual_estado', 'true');
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
    showSpendToast(`Estado alterado para ${sigla}! 💛`);
  };

  // Notificação Automática do Desafio Diário (12:20 e 20:20)
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      if ((hours === 12 && minutes === 20) || (hours === 20 && minutes === 20)) {
        setNotificacoes((prev) => {
          const alreadyNotified = prev.some(
            (n) => n.titulo.includes('Desafio 12:20') && 
            new Date(n.criado_em).toDateString() === now.toDateString() &&
            new Date(n.criado_em).getHours() === hours
          );
          if (alreadyNotified) return prev;
          return [
            {
              id: 'notif-desafio-' + Date.now(),
              titulo: '📸 Desafio 12:20 / 20:20 no Ar! (+3 🪙)',
              mensagem: 'Hora de postar no Feed! Tire/envie uma foto e escreva o que você está fazendo agora para ganhar 3 Certcoins!',
              lida: false,
              criado_em: new Date().toISOString(),
            },
            ...prev,
          ];
        });
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sync state to localStorage
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

  // Login handler
  const handleLogin = (email: string, pass: string) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    // 1. Procura por correspondência direta de e-mail e senha
    let user = usuarios.find((u) => {
      const userEmail = (u.email || '').trim().toLowerCase();
      return userEmail === cleanEmail && (u.senha || '') === cleanPass;
    });

    // 2. Se for a conta de teste oficial (eddornelas02@gmail.com) ou solicitação de admin/demo,
    // garante o login imediato com a conta de teste oficial mesmo se o localStorage tiver sido corrompido
    if (!user && (cleanEmail === 'eddornelas02@gmail.com' || cleanEmail === 'demo123456' || cleanEmail.includes('admin') || cleanEmail === 'eddornelas04@gmail.com')) {
      const adminMock = MOCK_USERS.find((u) => u.id === 'user-admin') || MOCK_USERS[0];
      const existingUser = usuarios.find((u) => u.id === adminMock.id || u.isAdmin);
      
      user = existingUser ? {
        ...existingUser,
        email: 'eddornelas02@gmail.com',
        senha: 'demo123456',
        isAdmin: true,
        is_online: true,
      } : {
        ...adminMock,
        email: 'eddornelas02@gmail.com',
        senha: 'demo123456',
        isAdmin: true,
        is_online: true,
      };

      setUsuarios((prev) => {
        const withoutOld = prev.filter((u) => u.id !== user!.id);
        return [user!, ...withoutOld];
      });
    }

    if (user) {
      const updated = { ...user, is_online: true };
      setCurrentUser(updated);
      setUsuarios((prev) => prev.map((u) => (u.id === user!.id ? updated : u)));
      setRouteProtectionMsg(undefined);
      showSpendToast(`Bem-vindo de volta, ${user.nome}! 💛`);
    } else {
      alert('Eita sô! E-mail ou senha não conferem. Tenta de novo! ☕\n\nDica: você pode clicar no botão "Entrar com Conta de Teste ☕" para testar agora mesmo!');
    }
  };

  const handleRegister = (profileData: Omit<UserProfile, 'id' | 'idade' | 'criado_em'>) => {
    // Check if email already exists (for traditional registration)
    if (profileData.email && usuarios.some(u => u.email === profileData.email)) {
      alert('Esse e-mail já tá cadastrado por aqui, sô! Tenta entrar ou usa outro. 💛');
      return;
    }

    const newUser: UserProfile = {
      ...profileData,
      id: 'user-' + Date.now(),
      idade: calculateAge(profileData.nascimento),
      criado_em: new Date().toISOString(),
      is_online: true,
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
    setRouteProtectionMsg(undefined);
    showSpendToast(`Bem-vindo, ${newUser.nome}! 🚀`);
  };

  const handleGoogleLogin = (userInfo: { name: string; email: string; picture: string }) => {
    const cleanEmail = (userInfo.email || '').trim().toLowerCase();
    const existingUser = usuarios.find((u) => (u.email || '').trim().toLowerCase() === cleanEmail);
    const isOwnerAdmin = cleanEmail === 'eddornelas04@gmail.com' || cleanEmail === 'eddornelas02@gmail.com';

    if (existingUser) {
      const updated: UserProfile = { 
        ...existingUser, 
        is_online: true,
        isAdmin: isOwnerAdmin ? true : existingUser.isAdmin 
      };
      setCurrentUser(updated);
      setUsuarios((prev) => prev.map((u) => (u.id === existingUser.id ? updated : u)));
      localStorage.setItem('encontro_certo_current_user', JSON.stringify(updated));
      setRouteProtectionMsg(undefined);
      showSpendToast(`Bem-vindo de volta, ${existingUser.nome}! 💛`);
    } else {
      const newUser: UserProfile = {
        id: 'google-' + (cleanEmail ? cleanEmail.replace(/[^a-z0-9]/g, '-') : Date.now()),
        email: cleanEmail,
        nome: (userInfo.name || '').trim() || (cleanEmail ? cleanEmail.split('@')[0] : 'Mineiro(a)'),
        nascimento: '1998-05-20',
        idade: calculateAge('1998-05-20'),
        cidade: locationResult?.cidade || (currentEstadoSigla === 'MG' ? 'Belo Horizonte' : 'Capital'),
        bairro: 'Centro',
        estado_sigla: currentEstadoSigla,
        latitude: locationResult?.latitude || -19.9167,
        longitude: locationResult?.longitude || -43.9345,
        raio_busca: 50,
        altura: 1.75,
        tipo_corporal: 'Normal',
        foto: userInfo.picture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        descricao: `Novo mineiro chegando pelo Google! 💛`,
        tipo_perfil: 'publico',
        exibir_na_busca: true,
        isAdmin: isOwnerAdmin,
        criado_em: new Date().toISOString(),
        is_online: true,
      };

      setUsuarios((prev) => [newUser, ...prev]);
      setCurrentUser(newUser);
      localStorage.setItem('encontro_certo_current_user', JSON.stringify(newUser));
      setRouteProtectionMsg(undefined);

      setLotes((prev) => [
        {
          id: 'lote-google-' + Date.now(),
          usuario_id: newUser.id,
          quantidade: 50,
          tipo: 'temp',
          expira_em: new Date(Date.now() + 86400000 * 30).toISOString(),
          criado_em: new Date().toISOString(),
        },
        ...prev,
      ]);

      showSpendToast(`Conta Google criada com sucesso! Ganhou 50 Certcoins! 🚀💛`);
      setShowAuthModal(true); // Open edit modal to finish profile
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      const updated = { ...currentUser, is_online: false };
      setUsuarios((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    }
    setCurrentUser(null);
    localStorage.removeItem('encontro_certo_current_user');
    setActiveTab('feed');
    showSpendToast('Até logo, sô! Volta logo! ☕💛');
  };

  // Helper: Deduct Certcoins with FIFO (Lote temporário mais antigo primeiro)
  const deductCertcoins = (amount: number): boolean => {
    if (!currentUser) return false;
    if (currentUser.isAdmin) return true; // Admin tem acesso ilimitado a todas as ações
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

  const handleCreatePost = (conteudo: string, imagem_url?: string, isDesafioDiario?: boolean) => {
    if (!currentUser) return;

    if (isDesafioDiario) {
      addCertcoins(3);
      const newPost: Postagem = {
        id: 'post-desafio-' + Date.now(),
        autor_id: currentUser.id,
        conteudo,
        imagem_url,
        isDesafioDiario: true,
        criado_em: new Date().toISOString(),
        autor: currentUser,
      };
      setPosts((prev) => [newPost, ...prev]);
      setNotificacoes((prev) => [
        {
          id: 'notif-' + Date.now(),
          titulo: 'Premiação de +3.00 Certcoins! 🏆',
          mensagem: 'Parabéns! Você publicou a foto do momento no Desafio Diário (12:20 / 20:20) e garantiu sua recompensa de +3 Certcoins!',
          lida: false,
          criado_em: new Date().toISOString(),
        },
        ...prev,
      ]);
      return;
    }

    if (!deductCertcoins(1)) {
      alert('Eita sô! Cê precisa de pelo menos 1 Certcoin pra postar tua prosa no feed! 💛');
      return;
    }
    const newPost: Postagem = {
      id: 'post-' + Date.now(),
      autor_id: currentUser.id,
      conteudo,
      imagem_url,
      criado_em: new Date().toISOString(),
      autor: currentUser,
    };
    setPosts((prev) => [newPost, ...prev]);
    showSpendToast('Feito! 💛');
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
    showSpendToast('Feito! 💛');
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

  // Execute Like / Super Certo logic
  const executeLike = (alvoId: string, superCerto: boolean) => {
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

  // Send Like com confirmação para gastos >= 3 Certcoins (Prompt 1.4)
  const handleSendLike = (alvoId: string, superCerto: boolean) => {
    const cost = superCerto ? 3 : 0;

    if (cost >= 3) {
      setSpendModalConfig({
        isOpen: true,
        costAmount: cost,
        actionTitle: 'enviar um Super Certo (Match Garantido)',
        onConfirm: () => {
          if (!deductCertcoins(cost)) {
            alert('Você não tem Certcoins suficientes para esta ação!');
            setSpendModalConfig((prev) => ({ ...prev, isOpen: false }));
            return;
          }
          executeLike(alvoId, superCerto);
          setSpendModalConfig((prev) => ({ ...prev, isOpen: false }));
          showSpendToast('Feito! 💛');
        },
      });
      return;
    }

    executeLike(alvoId, superCerto);
  };

  const handleSendMessage = (destinatarioId: string, conteudo: string, tipo: Mensagem['tipo'] = 'texto') => {
    const novaMensagem: Mensagem = {
      id: 'msg-' + Date.now(),
      remetente_id: currentUser!.id,
      destinatario_id: destinatarioId,
      conteudo,
      tipo,
      criado_em: new Date().toISOString(),
    };
    setMensagens((prev) => [...prev, novaMensagem]);
  };

  const handleResetDemoHistory = () => {
    setMensagens(INITIAL_MESSAGES);
    setMatches(INITIAL_MATCHES);
    localStorage.setItem('encontro_certo_mensagens', JSON.stringify(INITIAL_MESSAGES));
    localStorage.setItem('encontro_certo_matches', JSON.stringify(INITIAL_MATCHES));
    alert('Histórico de conversas restaurado com sucesso! 💛');
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
    const cost = 5;
    setSpendModalConfig({
      isOpen: true,
      costAmount: cost,
      actionTitle: 'desbloquear a confirmação de leitura PARA SEMPRE nesta conversa',
      onConfirm: () => {
        if (!deductCertcoins(cost)) {
          alert('Você não tem Certcoins suficientes!');
          setSpendModalConfig((prev) => ({ ...prev, isOpen: false }));
          return;
        }
        setReadReceipts((prev) => [...prev, alvoId]);
        setSpendModalConfig((prev) => ({ ...prev, isOpen: false }));
        showSpendToast('Feito! 💛');
      },
    });
  };

  const handleSendGift = (alvoId: string, qtd: number) => {
    if (qtd >= 3) {
      setSpendModalConfig({
        isOpen: true,
        costAmount: qtd,
        actionTitle: `enviar um presente de ${qtd} Certcoins`,
        onConfirm: () => {
          if (!deductCertcoins(qtd)) {
            alert('Você não possui Certcoins suficientes!');
            setSpendModalConfig((prev) => ({ ...prev, isOpen: false }));
            return;
          }
          const novoLote: CertcoinLote = {
            id: 'lote-' + Date.now(),
            usuario_id: alvoId,
            quantidade: qtd,
            tipo: 'temp',
            expira_em: new Date(Date.now() + 86400000 * 30).toISOString(),
            criado_em: new Date().toISOString(),
          };
          setLotes((prev) => [novoLote, ...prev]);
          setSpendModalConfig((prev) => ({ ...prev, isOpen: false }));
          showSpendToast('Feito! 💛');
        },
      });
      return;
    }

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
    showSpendToast('Feito! 💛');
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

  const handleStartBlindChat = (botUser: UserProfile) => {
    if (!currentUser) return;

    const matchId = `match-blind-${botUser.id}`;

    setUsuarios((prev) => {
      if (prev.some((u) => u.id === botUser.id)) return prev;
      return [...prev, botUser];
    });

    setMatches((prev) => {
      const existing = prev.find((m) => m.id === matchId || (m.usuario1_id === currentUser.id && m.usuario2_id === botUser.id));
      if (existing) return prev;

      const newMatch: Match = {
        id: matchId,
        usuario1_id: currentUser.id,
        usuario2_id: botUser.id,
        criado_em: new Date().toISOString(),
        outro_usuario: botUser,
        isEncontroACegas: true,
        isRevelado: false,
      };
      return [newMatch, ...prev];
    });

    const msgId = `msg-blind-init-${botUser.id}`;
    setMensagens((prev) => {
      if (prev.some((m) => m.id === msgId)) return prev;
      const newMsg: Mensagem = {
        id: msgId,
        remetente_id: botUser.id,
        destinatario_id: currentUser.id,
        conteudo: `Eita! Que bom te encontrar nesse Encontro a Cegas! Amei a nossa energia! Como tá sendo teu dia? ☕💛`,
        tipo: 'texto',
        criado_em: new Date().toISOString(),
      };
      return [...prev, newMsg];
    });

    setInitialActiveMatchId(matchId);
    setActiveTab('matches');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRevealBlindMatch = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, isRevelado: true } : m))
    );

    const match = matches.find((m) => m.id === matchId);
    if (match && match.outro_usuario) {
      const newMsg: Mensagem = {
        id: `msg-reveal-${Date.now()}`,
        remetente_id: match.outro_usuario.id,
        destinatario_id: currentUser?.id || '',
        conteudo: `🎉 DEU MATCH DE VERDADE! Revelamos nosso perfil e agora a prosa é pra valer! 💛`,
        tipo: 'texto',
        criado_em: new Date().toISOString(),
      };
      setMensagens((prev) => [...prev, newMsg]);
    }

    showSpendToast('Pretendente Revelado! Deu Match de Verdade 💛🎉');
  };

  const handlePassBlindMatch = (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    showSpendToast('Pretendente passado com carinho 💛');
  };

  if (!currentUser) {
    return (
      <>
        <LocationBanner
          currentEstadoSigla={currentEstadoSigla}
          locationResult={locationResult}
        />
        <LoginScreen
          estadoConfig={estadoConfig}
          onSelectEstado={handleSelectEstado}
          onLogin={handleLogin}
          onGoogleLogin={handleGoogleLogin}
          onRegister={handleRegister}
          protectionMsg={routeProtectionMsg || 'Precisa entrar primeiro pra ver teu espaço 💛'}
        />
      </>
    );
  }

  const currentUserLotes = lotes.filter((l) => l.usuario_id === currentUser.id);
  const currentMatchIds = matches
    .filter((m) => m.usuario1_id === currentUser.id || m.usuario2_id === currentUser.id)
    .map((m) => (m.usuario1_id === currentUser.id ? m.usuario2_id : m.usuario1_id));

  return (
    <div className="min-h-screen bg-[#120F0D] text-[#F5E9D3] font-sans pb-20 md:pb-0 transition-all duration-300">
      
      {/* Toast Notification para Gastos (Prompt 1.4: "Feito! 💛") */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#E8A838] text-[#120F0D] font-black text-xs px-5 py-2.5 rounded-full shadow-2xl animate-bounce flex items-center space-x-2">
          <span>✨</span>
          <span>{toastMsg}</span>
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
        onlineCount={usuarios.filter((u) => u.is_online).length}
        onLogout={handleLogout}
      />

      {/* Banner de Autorização e Detecção Precisa de GPS */}
      <LocationBanner
        currentEstadoSigla={currentEstadoSigla}
        locationResult={locationResult}
      />

      <main className="transition-all duration-300">
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
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onStartBlindChat={handleStartBlindChat}
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
            initialActiveMatchId={initialActiveMatchId}
            onSendMessage={handleSendMessage}
            onUnlockReadReceipt={handleUnlockReadReceipt}
            onSendGift={handleSendGift}
            onClearChatHistory={handleClearChatHistory}
            onResetDemoHistory={handleResetDemoHistory}
            onRevealBlindMatch={handleRevealBlindMatch}
            onPassBlindMatch={handlePassBlindMatch}
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

        {activeTab === 'encontro' && (
          <EncontroView
            currentUser={currentUser}
            estadoConfig={estadoConfig}
            usuarios={usuarios}
            matches={currentMatchIds}
            onSendLike={handleSendLike}
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

        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto py-8 px-4 space-y-6 text-[#F5E9D3]">
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
                className="w-full py-3 golden-button rounded-xl text-sm font-black cursor-pointer"
              >
                Editar Meu Perfil {estadoConfig.emblem}
              </button>
            </div>
            <MineiridadeCard
              postsCount={posts.filter((p) => p.autor_id === currentUser.id).length}
              matchesCount={matches.filter((m) => m.usuario1_id === currentUser.id || m.usuario2_id === currentUser.id).length}
              estadoConfig={estadoConfig}
            />

            <SettingsView
              currentUser={currentUser}
              estadoConfig={estadoConfig}
              onSelectEstado={handleSelectEstado}
              onUpdateSettings={(updates) => setCurrentUser({ ...currentUser, ...updates })}
              onOpenProfileEdit={() => setShowAuthModal(true)}
              onOpenCompliance={(tab) => setComplianceTab(tab)}
              onLogout={handleLogout}
            />
          </div>
        )}
      </main>

      <Footer estadoConfig={estadoConfig} onOpenCompliance={(tab) => setComplianceTab(tab)} />

      {/* MODALS */}
      {showAuthModal && currentUser && (
        <AuthModal
          initialData={currentUser}
          estadoConfig={estadoConfig}
          onClose={() => setShowAuthModal(false)}
          onCompleteProfile={(updates) => {
            const updated = { 
              ...currentUser, 
              ...updates,
              idade: updates.nascimento ? calculateAge(updates.nascimento) : currentUser.idade
            };
            setCurrentUser(updated);
            setUsuarios((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
            setShowAuthModal(false);
          }}
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

      {/* Spending Confirmation Modal (Prompt 1.4) */}
      <CertcoinSpendModal
        isOpen={spendModalConfig.isOpen}
        costAmount={spendModalConfig.costAmount}
        actionTitle={spendModalConfig.actionTitle}
        lotes={currentUserLotes}
        onConfirm={spendModalConfig.onConfirm}
        onCancel={() => setSpendModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {complianceTab && (
        <AdSenseCompliance
          estadoConfig={estadoConfig}
          initialTab={complianceTab}
          onClose={() => setComplianceTab(null)}
        />
      )}

      <CookieBanner
        estadoConfig={estadoConfig}
        onOpenPrivacy={() => setComplianceTab('privacy')}
      />
    </div>
  );
}
