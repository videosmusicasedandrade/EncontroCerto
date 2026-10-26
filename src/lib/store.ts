import { UserProfile, CertcoinLote, Postagem, Match, Mensagem, Nota, SolicitacaoSeguir, Denuncia, NotificacaoPush } from '../types';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-admin',
    nome: 'Belo Horizonte Oficial (Admin)',
    nascimento: '1995-05-12',
    idade: 31,
    cidade: 'Belo Horizonte',
    bairro: 'Savassi',
    latitude: -19.932,
    longitude: -43.938,
    raio_busca: 50,
    altura: 1.78,
    tipo_corporal: 'Normal',
    foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    descricao: 'Criador do Encontro Certo MG. Um uai bem grande pra todos! Curto um pão de queijo com café e boa conversa.',
    tipo_perfil: 'publico',
    exibir_na_busca: true,
    criado_em: new Date().toISOString(),
    isAdmin: true,
  },
  {
    id: 'user-1',
    nome: 'Mariana Silva',
    nascimento: '1998-08-20',
    idade: 27,
    cidade: 'Ouro Preto',
    bairro: 'Centro Histórico',
    latitude: -20.3855,
    longitude: -43.5035,
    raio_busca: 50,
    altura: 1.65,
    tipo_corporal: 'Atlético',
    foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    descricao: 'Apaixonada por igrejas barrocas, poesias de Carlos Drummond e um bom cafezinho coado na hora. Trem bão demais!',
    tipo_perfil: 'publico',
    exibir_na_busca: true,
    criado_em: new Date().toISOString(),
  },
  {
    id: 'user-2',
    nome: 'João Pedro Faria',
    nascimento: '1994-03-15',
    idade: 32,
    cidade: 'Contagem',
    bairro: 'Eldorado',
    latitude: -19.939,
    longitude: -44.053,
    raio_busca: 30,
    altura: 1.82,
    tipo_corporal: 'Normal',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    descricao: 'Mineiro de raiz, músico de fim de semana e fã de carteado na praça. Bora prosear?',
    tipo_perfil: 'publico',
    exibir_na_busca: true,
    criado_em: new Date().toISOString(),
  },
  {
    id: 'user-3',
    nome: 'Camila Mendonça',
    nascimento: '2000-11-05',
    idade: 25,
    cidade: 'Uberlândia',
    bairro: 'Tibery',
    latitude: -18.9186,
    longitude: -48.2772,
    raio_busca: 100,
    altura: 1.70,
    tipo_corporal: 'Um pouquinho a mais',
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    descricao: 'Trabalho com design e adoro viajar por Minas. Procuo amizades sinceras e quem sabe um amor proseador.',
    tipo_perfil: 'privado',
    exibir_na_busca: true,
    criado_em: new Date().toISOString(),
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
    criado_em: new Date().toISOString(),
    outro_usuario: MOCK_USERS[1]
  }
];

export const INITIAL_MESSAGES: Mensagem[] = [
  {
    id: 'msg-1',
    remetente_id: 'user-1',
    destinatario_id: 'user-admin',
    conteudo: 'Oii! Vi que você também é de Minas. Tudo joia?',
    tipo: 'texto',
    criado_em: new Date(Date.now() - 3600000).toISOString()
  }
];
