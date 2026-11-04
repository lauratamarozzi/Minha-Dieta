-- ============================================================================
-- Schema do app de Dieta & Rotina
-- Execute este arquivo inteiro no SQL Editor do Supabase (projeto novo, free tier)
-- ============================================================================

-- Extensão para gerar UUIDs
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1) DIETA: refeições por dia da semana
-- ----------------------------------------------------------------------------
-- weekday: 0 = domingo, 1 = segunda, ..., 6 = sábado (padrão JS Date.getDay())
create table if not exists meals (
  id          uuid primary key default gen_random_uuid(),
  weekday     smallint not null check (weekday between 0 and 6),
  name        text not null,              -- ex: "Café da manhã", "Almoço"
  time        text,                        -- ex: "07:30" (texto simples, livre)
  order_index integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists meals_weekday_idx on meals (weekday, order_index);

-- Itens/alimentos dentro de cada refeição
create table if not exists meal_items (
  id          uuid primary key default gen_random_uuid(),
  meal_id     uuid not null references meals(id) on delete cascade,
  description text not null,               -- ex: "Peito de frango grelhado"
  quantity    text,                         -- ex: "150g", "2 unidades" (texto livre)
  notes       text,                         -- observações opcionais
  order_index integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists meal_items_meal_idx on meal_items (meal_id, order_index);

-- ----------------------------------------------------------------------------
-- 2) ROTINA: atividades do dia (diárias ou por dia da semana específico)
-- ----------------------------------------------------------------------------
create table if not exists routine_items (
  id          uuid primary key default gen_random_uuid(),
  is_daily    boolean not null default true,  -- true = todo santo dia
  weekday     smallint check (weekday between 0 and 6), -- usado só se is_daily = false
  time        text,                             -- ex: "06:30"
  title       text not null,                    -- ex: "Treino"
  description text,
  order_index integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists routine_items_weekday_idx on routine_items (weekday, order_index);

-- Marcação diária de "feito" para cada item de rotina (histórico por data)
create table if not exists routine_completions (
  id               uuid primary key default gen_random_uuid(),
  routine_item_id  uuid not null references routine_items(id) on delete cascade,
  date             date not null,             -- dia local (YYYY-MM-DD) em que foi concluído
  completed        boolean not null default true,
  created_at       timestamptz not null default now(),
  unique (routine_item_id, date)
);

-- ----------------------------------------------------------------------------
-- 3) LISTA DE COMPRAS
-- ----------------------------------------------------------------------------
create table if not exists shopping_items (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  quantity         text,                       -- ex: "1kg", "2 unidades"
  category         text not null default 'Outros', -- ex: "Hortifruti", "Proteínas", "Laticínios"
  checked          boolean not null default false,
  is_auto_generated boolean not null default false, -- true = veio da geração automática pela dieta
  order_index      integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists shopping_items_category_idx on shopping_items (category, order_index);

-- ----------------------------------------------------------------------------
-- 4) Trigger genérico para manter updated_at em dia
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_meals_updated_at on meals;
create trigger trg_meals_updated_at before update on meals
  for each row execute function set_updated_at();

drop trigger if exists trg_meal_items_updated_at on meal_items;
create trigger trg_meal_items_updated_at before update on meal_items
  for each row execute function set_updated_at();

drop trigger if exists trg_routine_items_updated_at on routine_items;
create trigger trg_routine_items_updated_at before update on routine_items
  for each row execute function set_updated_at();

drop trigger if exists trg_shopping_items_updated_at on shopping_items;
create trigger trg_shopping_items_updated_at before update on shopping_items
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- 5) Segurança: Row Level Security
-- ----------------------------------------------------------------------------
-- Este é um app de uso pessoal (uso único). O acesso é feito EXCLUSIVAMENTE
-- pelo backend Next.js usando a service_role key (nunca exposta ao navegador).
-- Por isso, deixamos RLS ativado mas SEM policies para "anon"/"authenticated":
-- isso bloqueia qualquer tentativa de acesso direto via chave pública (anon key),
-- e só a service_role (que ignora RLS por padrão no Supabase) consegue ler/escrever.
alter table meals enable row level security;
alter table meal_items enable row level security;
alter table routine_items enable row level security;
alter table routine_completions enable row level security;
alter table shopping_items enable row level security;

-- (Nenhuma policy criada de propósito — ver comentário acima.)

-- ----------------------------------------------------------------------------
-- 6) Seed opcional: estrutura vazia dos 7 dias (sem refeições ainda)
-- ----------------------------------------------------------------------------
-- Nada a inserir aqui — você vai popular pela interface do app ou pedindo
-- para a IA (Claude/Nini) montar sua dieta da semana.
