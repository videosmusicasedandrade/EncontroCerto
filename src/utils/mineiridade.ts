export interface MineiridadeInfo {
  pontos: number;
  nivel: number;
  titulo: string;
  emoji: string;
  corSelo: string;
  bgGradient: string;
  proximoNivelPontos: number;
  pontosNoNivelAtual: number;
  pontosParaProximoNivel: number;
  progressoPorcentagem: number;
  postsCount: number;
  matchesCount: number;
  descricao: string;
}

export const NIVEIS_MINEIRIDADE = [
  {
    nivel: 1,
    minPontos: 0,
    maxPontos: 30,
    titulo: 'Turista do Pão de Queijo',
    emoji: '🧳',
    corSelo: 'from-amber-700 via-amber-800 to-amber-900',
    bgGradient: 'from-amber-500/10 via-amber-500/5 to-amber-600/10',
    descricao: 'Tô chegando agora uai! Procurando um cafezinho coado e gente boa pra prosear.',
  },
  {
    nivel: 2,
    minPontos: 30,
    maxPontos: 70,
    titulo: 'Proseador da Praça',
    emoji: '☕',
    corSelo: 'from-slate-400 via-zinc-500 to-slate-700',
    bgGradient: 'from-zinc-500/10 via-slate-500/5 to-zinc-600/10',
    descricao: 'Já não troca Minas por nada e sabe que "trem" serve pra qualquer coisa!',
  },
  {
    nivel: 3,
    minPontos: 70,
    maxPontos: 130,
    titulo: 'Mestre do Queijo Canastra',
    emoji: '🧀',
    corSelo: 'from-amber-400 via-yellow-500 to-amber-600',
    bgGradient: 'from-amber-500/20 via-yellow-500/10 to-amber-600/15',
    descricao: 'Especialista em boa conversa, café fresquinho e receita de vó!',
  },
  {
    nivel: 4,
    minPontos: 130,
    maxPontos: 220,
    titulo: 'Embaixador de Minas',
    emoji: '👑',
    corSelo: 'from-emerald-400 via-teal-500 to-emerald-700',
    bgGradient: 'from-emerald-500/20 via-teal-500/10 to-emerald-600/15',
    descricao: 'Sabe todos os atalhos das estradas reais e distribui carinho em Certcoins!',
  },
  {
    nivel: 5,
    minPontos: 220,
    maxPontos: Infinity,
    titulo: 'Patrimônio Histórico de Minas',
    emoji: '🏆',
    corSelo: 'from-purple-500 via-pink-500 to-amber-500',
    bgGradient: 'from-purple-500/20 via-pink-500/15 to-amber-500/15',
    descricao: 'Mineiro de Raiz Purinho! Patrimônio vivo do Encontro Certo MG. Uai do céu!',
  },
];

export function calcularMineiridade(postsCount: number, matchesCount: number): MineiridadeInfo {
  // Cada post criado = 10 pontos de mineiridade
  // Cada match realizado = 20 pontos de mineiridade
  const pontos = postsCount * 10 + matchesCount * 20;

  let infoAtual = NIVEIS_MINEIRIDADE[0];
  for (let i = NIVEIS_MINEIRIDADE.length - 1; i >= 0; i--) {
    if (pontos >= NIVEIS_MINEIRIDADE[i].minPontos) {
      infoAtual = NIVEIS_MINEIRIDADE[i];
      break;
    }
  }

  const proximoNivelPontos = infoAtual.maxPontos === Infinity ? pontos : infoAtual.maxPontos;
  const pontosNoNivelAtual = pontos - infoAtual.minPontos;
  const pontosNecessariosNoNivel = infoAtual.maxPontos === Infinity ? 100 : infoAtual.maxPontos - infoAtual.minPontos;
  const pontosParaProximoNivel = Math.max(0, proximoNivelPontos - pontos);

  const progressoPorcentagem =
    infoAtual.maxPontos === Infinity
      ? 100
      : Math.min(100, Math.round((pontosNoNivelAtual / pontosNecessariosNoNivel) * 100));

  return {
    pontos,
    nivel: infoAtual.nivel,
    titulo: infoAtual.titulo,
    emoji: infoAtual.emoji,
    corSelo: infoAtual.corSelo,
    bgGradient: infoAtual.bgGradient,
    proximoNivelPontos,
    pontosNoNivelAtual,
    pontosParaProximoNivel,
    progressoPorcentagem,
    postsCount,
    matchesCount,
    descricao: infoAtual.descricao,
  };
}
