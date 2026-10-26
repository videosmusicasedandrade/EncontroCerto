export interface UserProfile {
  id: string;
  nome: string;
  nascimento: string;
  idade: number;
  cidade: string;
  bairro?: string;
  latitude: number;
  longitude: number;
  raio_busca: number; // 5, 10, 25, 50, 100
  altura?: number;
  tipo_corporal: 'Atlético' | 'Normal' | 'Um pouquinho a mais' | 'Gordinho(a)' | 'Prefiro não informar';
  foto: string;
  descricao?: string;
  tipo_perfil: 'publico' | 'privado';
  exibir_na_busca: boolean;
  criado_em: string;
  isAdmin?: boolean;
}

export interface CertcoinLote {
  id: string;
  usuario_id: string;
  quantidade: number;
  tipo: 'temp' | 'vitalicio';
  expira_em?: string;
  criado_em: string;
}

export interface Postagem {
  id: string;
  autor_id: string;
  conteudo: string;
  editado_em?: string;
  criado_em: string;
  autor?: UserProfile;
  historico?: { conteudo_antigo: string; alterado_em: string }[];
}

export interface Nota {
  id: string;
  de_usuario_id: string;
  para_usuario_id: string;
  valor: number; // 0.50 (curtir) ou 0.11 (não curtir / neutro)
  criado_em: string;
}

export interface Match {
  id: string;
  usuario1_id: string;
  usuario2_id: string;
  criado_em: string;
  outro_usuario?: UserProfile;
}

export interface Mensagem {
  id: string;
  remetente_id: string;
  destinatario_id: string;
  conteudo: string;
  tipo: 'texto' | 'foto' | 'audio' | 'presente';
  lido_em?: string;
  destacada?: boolean;
  criado_em: string;
}

export interface SolicitacaoSeguir {
  id: string;
  de_id: string;
  para_id: string;
  status: 'pendente' | 'aceito' | 'recusado';
  criado_em: string;
  de_usuario?: UserProfile;
}

export interface Denuncia {
  id: string;
  denunciante_id: string;
  alvo_id: string;
  tipo: string;
  motivo: string;
  status: 'pendente' | 'arquivado' | 'aviso' | 'banido';
  criado_em: string;
  denunciante?: UserProfile;
  alvo?: UserProfile;
}

export interface NotificacaoPush {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criado_em: string;
}
