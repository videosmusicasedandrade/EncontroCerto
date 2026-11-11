import { UserProfile, CertcoinLote, Postagem, Match, Mensagem, Nota, SolicitacaoSeguir, Denuncia, NotificacaoPush } from '../types';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-admin',
    nome: 'Belo Horizonte Oficial (Admin)',
    nascimento: '1995-05-12',
    idade: 31,
    cidade: 'Belo Horizonte',
    bairro: 'Savassi',
    estado_sigla: 'MG',
    latitude: -19.932,
    longitude: -43.938,
    raio_busca: 50,
    altura: 1.78,
    tipo_corporal: 'Normal',
    foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    descricao: 'Criador do Encontro Certo MG. Um uai bem grande pra todos! Curto um pão de queijo com café e boa conversa.',
    email: 'eddornelas02@gmail.com',
    senha: 'demo123456',
    tipo_perfil: 'publico',
    exibir_na_busca: true,
    criado_em: new Date().toISOString(),
    isAdmin: true,
    is_online: true,
  },
  {
    id: 'user-1',
    nome: 'Mariana Silva',
    nascimento: '1998-08-20',
    idade: 27,
    cidade: 'Ouro Preto',
    bairro: 'Centro Histórico',
    estado_sigla: 'MG',
    latitude: -20.3855,
    longitude: -43.5035,
    raio_busca: 50,
    altura: 1.65,
    tipo_corporal: 'Atlético',
    foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    descricao: 'Apaixonada por igrejas barrocas, poesias de Carlos Drummond e um bom cafezinho coado na hora. Trem bão demais!',
    email: 'mariana@exemplo.com',
    senha: 'senha123',
    tipo_perfil: 'publico',
    exibir_na_busca: true,
    criado_em: new Date().toISOString(),
    is_online: false,
  },
  {
    id: 'user-2',
    nome: 'João Pedro Faria',
    nascimento: '1994-03-15',
    idade: 32,
    cidade: 'Contagem',
    bairro: 'Eldorado',
    estado_sigla: 'MG',
    latitude: -19.939,
    longitude: -44.053,
    raio_busca: 30,
    altura: 1.82,
    tipo_corporal: 'Normal',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    descricao: 'Mineiro de raiz, músico de fim de semana e fã de carteado na praça. Bora prosear?',
    email: 'joao@exemplo.com',
    senha: 'senha123',
    tipo_perfil: 'publico',
    exibir_na_busca: true,
    criado_em: new Date().toISOString(),
    is_online: true,
  },
  {
    id: 'user-3',
    nome: 'Camila Mendonça',
    nascimento: '2000-11-05',
    idade: 25,
    cidade: 'Uberlândia',
    bairro: 'Tibery',
    estado_sigla: 'MG',
    latitude: -18.9186,
    longitude: -48.2772,
    raio_busca: 100,
    altura: 1.70,
    tipo_corporal: 'Um pouquinho a mais',
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    descricao: 'Trabalho com design e adoro viajar por Minas. Procuo amizades sinceras e quem sabe um amor proseador.',
    email: 'camila@exemplo.com',
    senha: 'senha123',
    tipo_perfil: 'privado',
    exibir_na_busca: true,
    criado_em: new Date().toISOString(),
    is_online: false,
  }
];

export const INITIAL_POSTS: Postagem[] = [
  {
    id: 'post-1',
    autor_id: 'user-1',
    conteudo: 'Bom dia sô! Um café quentinho e um pão de queijo fresquinha combinam com qualquer manhã em Ouro Preto ☕🧀',
    criado_em: new Date(Date.now() - 3600000 * 3).toISOString(),
    autor: MOCK_USERS[1]
  },
  {
    id: 'post-2',
    autor_id: 'user-2',
    conteudo: 'Quem vai pra festa de peão em Barretos esse ano? Trem bão demais da conta!',
    criado_em: new Date(Date.now() - 3600000 * 12).toISOString(),
    autor: MOCK_USERS[2]
  }
];

export const INITIAL_LOTES: CertcoinLote[] = [
  {
    id: 'lote-1',
    usuario_id: 'user-admin',
    quantidade: 50,
    tipo: 'temp',
    expira_em: new Date(Date.now() + 86400000 * 25).toISOString(),
    criado_em: new Date().toISOString()
  },
  {
    id: 'lote-2',
    usuario_id: 'user-admin',
    quantidade: 100,
    tipo: 'vitalicio',
    criado_em: new Date().toISOString()
  }
];

export const INITIAL_MATCHES: Match[] = [
  {
    id: 'match-1',
    usuario1_id: 'user-admin',
    usuario2_id: 'user-1',
    criado_em: new Date(Date.now() - 86400000 * 3).toISOString(),
    outro_usuario: MOCK_USERS[1]
  },
  {
    id: 'match-2',
    usuario1_id: 'user-admin',
    usuario2_id: 'user-2',
    criado_em: new Date(Date.now() - 86400000 * 2).toISOString(),
    outro_usuario: MOCK_USERS[2]
  },
  {
    id: 'match-3',
    usuario1_id: 'user-admin',
    usuario2_id: 'user-3',
    criado_em: new Date(Date.now() - 86400000 * 1).toISOString(),
    outro_usuario: MOCK_USERS[3]
  }
];

// Rich message history with chronological timestamps (3 days ago, 2 days ago, yesterday, today)
const now = Date.now();
const h = 3600000;
const d = 86400000;

export const INITIAL_MESSAGES: Mensagem[] = [
  // Conversa com Mariana Silva (user-1) - Histórico rico de 3 dias
  {
    id: 'msg-m-1',
    remetente_id: 'user-1',
    destinatario_id: 'user-admin',
    conteudo: 'Oii! Vi que você também é daqui de Minas. Tudo joia por aí?',
    tipo: 'texto',
    lido_em: new Date(now - 3 * d + 1 * h).toISOString(),
    criado_em: new Date(now - 3 * d).toISOString()
  },
  {
    id: 'msg-m-2',
    remetente_id: 'user-admin',
    destinatario_id: 'user-1',
    conteudo: 'Oi Mariana! Tudo ótimo por aqui na Savassi, e contigo aí em Ouro Preto?',
    tipo: 'texto',
    lido_em: new Date(now - 3 * d + 2 * h).toISOString(),
    criado_em: new Date(now - 3 * d + 1 * h).toISOString()
  },
  {
    id: 'msg-m-3',
    remetente_id: 'user-1',
    destinatario_id: 'user-admin',
    conteudo: 'Que bom sô! Aqui tá um friozinho gostoso hoje. Olha só o café coado e o pão de queijo quentinho saindo do forno agora 🧀☕',
    tipo: 'texto',
    lido_em: new Date(now - 3 * d + 3 * h).toISOString(),
    criado_em: new Date(now - 3 * d + 2 * h).toISOString()
  },
  {
    id: 'msg-m-4',
    remetente_id: 'user-1',
    destinatario_id: 'user-admin',
    conteudo: 'Vista da manhã aqui em Ouro Preto!',
    tipo: 'foto',
    imagem_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    lido_em: new Date(now - 2 * d).toISOString(),
    criado_em: new Date(now - 2 * d - 4 * h).toISOString()
  },
  {
    id: 'msg-m-5',
    remetente_id: 'user-admin',
    destinatario_id: 'user-1',
    conteudo: 'Uai, essa foto ficou linda demais da conta! Deu até vontade de pegar a estrada pra visitar a praça Tiradentes.',
    tipo: 'texto',
    destacada: true,
    lido_em: new Date(now - 2 * d - 2 * h).toISOString(),
    criado_em: new Date(now - 2 * d - 3 * h).toISOString()
  },
  {
    id: 'msg-m-6',
    remetente_id: 'user-1',
    destinatario_id: 'user-admin',
    conteudo: 'Áudio de voz (0:14)',
    tipo: 'audio',
    audio_duracao: 14,
    lido_em: new Date(now - 2 * d).toISOString(),
    criado_em: new Date(now - 2 * d - 2 * h).toISOString()
  },
  {
    id: 'msg-m-7',
    remetente_id: 'user-admin',
    destinatario_id: 'user-1',
    conteudo: 'Um carinho em Certcoins pra garantir o cafezinho da tarde 💛',
    tipo: 'presente',
    qtd_presente: 5,
    lido_em: new Date(now - 1 * d).toISOString(),
    criado_em: new Date(now - 1 * d - 5 * h).toISOString()
  },
  {
    id: 'msg-m-8',
    remetente_id: 'user-1',
    destinatario_id: 'user-admin',
    conteudo: 'Nossa, que lindeza! Muito obrigada pelo carinho dos Certcoins, você é um doce! 💛',
    tipo: 'texto',
    lido_em: new Date(now - 1 * d).toISOString(),
    criado_em: new Date(now - 1 * d - 4 * h).toISOString()
  },
  {
    id: 'msg-m-9',
    remetente_id: 'user-admin',
    destinatario_id: 'user-1',
    conteudo: 'Como tão as coisas por aí hoje? Firme e forte?',
    tipo: 'texto',
    lido_em: new Date(now - 3 * h).toISOString(),
    criado_em: new Date(now - 4 * h).toISOString()
  },
  {
    id: 'msg-m-10',
    remetente_id: 'user-1',
    destinatario_id: 'user-admin',
    conteudo: 'Tudo bão por aqui! Tava terminando de ler uns poemas do Drummond agora à tarde. E o seu dia, como tá sendo?',
    tipo: 'texto',
    criado_em: new Date(now - 30 * 60000).toISOString()
  },

  // Conversa com João Pedro Faria (user-2)
  {
    id: 'msg-j-1',
    remetente_id: 'user-2',
    destinatario_id: 'user-admin',
    conteudo: 'Fala meu patrão! Tudo na paz? Vi que cê curte uma moda de viola também!',
    tipo: 'texto',
    lido_em: new Date(now - 2 * d).toISOString(),
    criado_em: new Date(now - 2 * d).toISOString()
  },
  {
    id: 'msg-j-2',
    remetente_id: 'user-admin',
    destinatario_id: 'user-2',
    conteudo: 'E aí João! Bom demais da conta! Viola caipira no fim de tarde é bom demais sô.',
    tipo: 'texto',
    lido_em: new Date(now - 1 * d).toISOString(),
    criado_em: new Date(now - 1 * d - 10 * h).toISOString()
  },
  {
    id: 'msg-j-3',
    remetente_id: 'user-2',
    destinatario_id: 'user-admin',
    conteudo: 'Bora combinar um queijo com goiabada e uma cantoria qualquer hora dessas em Contagem!',
    tipo: 'texto',
    criado_em: new Date(now - 5 * h).toISOString()
  },

  // Conversa com Camila Mendonça (user-3)
  {
    id: 'msg-c-1',
    remetente_id: 'user-3',
    destinatario_id: 'user-admin',
    conteudo: 'Olá! Que alegria encontrar mais gente legal de Minas por aqui 💛 Você vem muito pra Uberlândia?',
    tipo: 'texto',
    lido_em: new Date(now - 1 * d).toISOString(),
    criado_em: new Date(now - 1 * d).toISOString()
  },
  {
    id: 'msg-c-2',
    remetente_id: 'user-admin',
    destinatario_id: 'user-3',
    conteudo: 'Oi Camila! Uberlândia é show de bola, já passei por aí várias vezes! Adorei seu perfil.',
    tipo: 'texto',
    criado_em: new Date(now - 2 * h).toISOString()
  }
];
