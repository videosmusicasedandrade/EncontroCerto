# Encontro Certo MG 💛

Aplicativo de relacionamento e amizade focado em Minas Gerais, com sistema de moeda gamificado (Certcoins), jogos interativos (Agar.io mineiro e Jogo da Memória), notificações com PNL acolhedora e painel administrativo completo.

## 🚀 Como Executar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   Copie `.env.example` para `.env` e preencha com suas credenciais do Supabase:
   ```bash
   cp .env.example .env
   ```
   *(Nota: Se preferir testar imediatamente sem configurar o Supabase, o aplicativo possui um modo de demonstração local automático com dados simulados realistas).*

3. **Executar migrações do Supabase**:
   Execute o script SQL localizado em `supabase/migrations/001_initial_schema.sql` no painel SQL do seu projeto Supabase.

4. **Iniciar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   Ou clique duas vezes em `INICIAR.bat` (no Windows).

## 🗂️ Estrutura do Projeto
- `src/components/`: Componentes moduais (Feed, Chat, Perfis, Jogos, Admin, Modal de Certcoins, Notificações)
- `src/lib/`: Configuração do Supabase e lógica de Certcoins / Distância
- `supabase/migrations/`: Esquema completo do banco de dados (tabelas, RLS e funções de distância)
