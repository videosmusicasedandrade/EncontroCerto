-- =========================================================================
-- ENCONTRO CERTO MG - SUPABASE SCHEMA & MIGRATIONS
-- =========================================================================

-- Enable PostGIS if needed, or use Haversine formula for distance calculation
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nome text not null,
  nascimento date not null,
  idade int generated always as (date_part('year', age(nascimento))) stored,
  cidade text not null,
  bairro text,
  latitude double precision not null default -19.9167,
  longitude double precision not null default -43.9345,
  raio_busca int not null default 50, -- em km
  altura numeric(3,2),
  tipo_corporal text not null check (tipo_corporal in ('Atlético', 'Normal', 'Um pouquinho a mais', 'Gordinho(a)', 'Prefiro não informar')),
  foto text not null,
  descricao text,
  tipo_perfil text not null default 'publico' check (tipo_perfil in ('publico', 'privado')),
  exibir_na_busca boolean not null default true,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CERTCOINS LOTES TABLE
create table if not exists public.certcoins_lotes (
  id uuid default uuid_generate_v4() primary key,
  usuario_id uuid references public.profiles(id) on delete cascade not null,
  quantidade numeric(10,2) not null,
  tipo text not null check (tipo in ('temp', 'vitalicio')),
  expira_em timestamp with time zone,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. POSTAGENS TABLE
create table if not exists public.postagens (
  id uuid default uuid_generate_v4() primary key,
  autor_id uuid references public.profiles(id) on delete cascade not null,
  conteudo text not null,
  editado_em timestamp with time zone,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. HISTORICO EDICAO TABLE
create table if not exists public.historico_edicao (
  id uuid default uuid_generate_v4() primary key,
  postagem_id uuid references public.postagens(id) on delete cascade not null,
  conteudo_antigo text not null,
  alterado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. NOTAS TABLE (Curtir = +0.50, Não curtir = +0.11)
create table if not exists public.notas (
  id uuid default uuid_generate_v4() primary key,
  de_usuario_id uuid references public.profiles(id) on delete cascade not null,
  para_usuario_id uuid references public.profiles(id) on delete cascade not null,
  valor numeric(3,2) not null check (valor in (0.50, 0.11)),
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(de_usuario_id, para_usuario_id)
);

-- 6. MATCHES TABLE
create table if not exists public.matches (
  id uuid default uuid_generate_v4() primary key,
  usuario1_id uuid references public.profiles(id) on delete cascade not null,
  usuario2_id uuid references public.profiles(id) on delete cascade not null,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(usuario1_id, usuario2_id)
);

-- 7. MENSAGENS TABLE
create table if not exists public.mensagens (
  id uuid default uuid_generate_v4() primary key,
  remetente_id uuid references public.profiles(id) on delete cascade not null,
  destinatario_id uuid references public.profiles(id) on delete cascade not null,
  conteudo text not null,
  tipo text not null default 'texto' check (tipo in ('texto', 'foto', 'audio', 'presente')),
  lido_em timestamp with time zone,
  destacada boolean default false,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. LEITURA DESBLOQUEIO TABLE (Read receipts per conversation - 5 coins)
create table if not exists public.leitura_desbloqueio (
  id uuid default uuid_generate_v4() primary key,
  usuario_id uuid references public.profiles(id) on delete cascade not null,
  alvo_id uuid references public.profiles(id) on delete cascade not null,
  pago_em timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(usuario_id, alvo_id)
);

-- 9. SOLICITACOES SEGUIR TABLE (for private profiles)
create table if not exists public.solicitacoes_seguir (
  id uuid default uuid_generate_v4() primary key,
  de_id uuid references public.profiles(id) on delete cascade not null,
  para_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pendente' check (status in ('pendente', 'aceito', 'recusado')),
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(de_id, para_id)
);

-- 10. DENUNCIAS TABLE (Admin moderation)
create table if not exists public.denuncias (
  id uuid default uuid_generate_v4() primary key,
  denunciante_id uuid references public.profiles(id) on delete cascade not null,
  alvo_id uuid references public.profiles(id) on delete cascade not null,
  tipo text not null,
  motivo text not null,
  status text not null default 'pendente' check (status in ('pendente', 'arquivado', 'aviso', 'banido')),
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- FUNÇÃO DE CÁLCULO DE DISTÂNCIA (Haversine em km)
-- =========================================================================
create or replace function public.calcular_distancia(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
)
returns double precision
language plpgsql
immutable
as $$
declare
  earth_radius constant double precision := 6371.0; -- raio da terra em km
  dlat double precision;
  dlon double precision;
  a double precision;
  c double precision;
begin
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  return earth_radius * c;
end;
$$;

-- =========================================================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- =========================================================================
alter table public.profiles enable row level security;
alter table public.certcoins_lotes enable row level security;
alter table public.postagens enable row level security;
alter table public.historico_edicao enable row level security;
alter table public.notas enable row level security;
alter table public.matches enable row level security;
alter table public.mensagens enable row level security;
alter table public.leitura_desbloqueio enable row level security;
alter table public.solicitacoes_seguir enable row level security;
alter table public.denuncias enable row level security;

-- Exemplo de políticas básicas
create policy "Perfis visíveis na busca" on public.profiles for select using (exibir_na_busca = true);
create policy "Usuário edita próprio perfil" on public.profiles for update using (auth.uid() = id);
create policy "Usuário cria próprio perfil" on public.profiles for insert with check (auth.uid() = id);
