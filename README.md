# Espaço Ela — Sistema de Aluguel de Cadeiras

Plataforma web para aluguel de cadeiras em salão de beleza por hora, dia, semana ou mês. Desenvolvida com Next.js 16, Supabase e Tailwind CSS.

## Funcionalidades

- **Landing page** com preços, comodidades e depoimentos
- **Autenticação** com Supabase Auth (login, cadastro, recuperação de senha)
- **Dashboard da profissional** com próximas reservas, histórico e gastos do mês
- **Fluxo de reserva** em 4 etapas com verificação de disponibilidade em tempo real
- **Painel admin** com gestão de reservas, bloqueios de agenda, tabela de preços e profissionais cadastradas

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16 (App Router) |
| Banco de dados | Supabase (PostgreSQL + RLS) |
| Autenticação | Supabase Auth |
| Estilo | Tailwind CSS v4 |
| UI | Radix UI + Lucide React |
| Deploy | Vercel (região `gru1` — São Paulo) |

## Setup local

### 1. Clone e instale as dependências

```bash
git clone https://github.com/seu-usuario/salao-de-beleza.git
cd salao-de-beleza
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com os valores do seu projeto no [Supabase Dashboard](https://supabase.com/dashboard).

### 3. Configure o banco de dados

No SQL Editor do Supabase, execute em ordem:

```
supabase/migrations/001_initial_schema.sql
supabase/seed.sql
```

Depois crie o usuário admin pelo dashboard do Supabase Auth (`admin@espacoela.com.br`) e execute:

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'admin@espacoela.com.br');
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Deploy na Vercel

1. Importe o repositório na [Vercel](https://vercel.com/new)
2. Adicione as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
3. Deploy — a região `gru1` (São Paulo) já está configurada em `vercel.json`

## Estrutura do projeto

```
app/
  page.tsx              # Landing page
  auth/
    login/              # Login
    register/           # Cadastro
    forgot-password/    # Recuperação de senha
  dashboard/            # Painel da profissional
  reservar/             # Fluxo de reserva
  admin/                # Painel administrativo
components/
  navbar.tsx
  footer.tsx
  booking/              # Componentes do fluxo de reserva
  admin/                # Componentes do painel admin
  ui/                   # Componentes base (button, card, input, badge)
lib/
  supabase/             # Clientes Supabase (server e client)
  utils.ts              # Utilitários (formatCurrency, formatDate…)
types/
  index.ts              # Tipos TypeScript do domínio
supabase/
  migrations/           # Schema SQL
  seed.sql              # Dados iniciais (cadeiras e preços)
```

## Licença

MIT
