-- Plataforma da empresa de agentes: esquema inicial
-- Antes de rodar, troque SEU-EMAIL@EXEMPLO.COM pelo e-mail que vai usar para entrar no painel.

create extension if not exists pgcrypto;

-- Quem está trabalhando
create table if not exists agents (
  id text primary key,                -- ex.: 'marcela'
  name text not null,
  role text not null,
  department text not null,
  status text not null default 'idle' check (status in ('idle','working','waiting','offline')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

-- Tarefas
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  department text,
  assigned_agent text references agents(id),
  created_by text references agents(id),
  parent_task_id uuid references tasks(id) on delete set null,
  status text not null default 'todo' check (status in ('todo','doing','blocked','review','done','cancelled')),
  priority text not null default 'media' check (priority in ('baixa','media','alta','urgente')),
  due_at timestamptz,
  result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_status_idx on tasks(status);
create index if not exists tasks_agent_idx on tasks(assigned_agent);

-- Conversa entre agentes (e com você)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  from_agent text,                    -- id do agente ou 'humano'
  to_agent text,                      -- id do agente, 'humano' ou null (todos)
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_task_idx on messages(task_id, created_at);

-- Registro de atividade (linha do tempo)
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id),
  task_id uuid references tasks(id) on delete set null,
  type text not null default 'info',  -- info, inicio, entrega, erro, decisao
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists events_created_idx on events(created_at desc);

-- Pedidos de aprovação humana
create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete set null,
  agent_id text references agents(id),
  action text not null,               -- o que o agente quer fazer
  details jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  decision_note text,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create index if not exists approvals_status_idx on approvals(status);

-- Cérebro: memória da empresa
create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null default 'geral', -- marca, cliente, processo, decisao, aprendizado
  tags text[] not null default '{}',
  created_by text references agents(id),
  created_at timestamptz not null default now(),
  fts tsvector generated always as (
    to_tsvector('portuguese', coalesce(title,'') || ' ' || coalesce(content,''))
  ) stored
);
create index if not exists memories_fts_idx on memories using gin(fts);

create table if not exists memory_links (
  from_id uuid references memories(id) on delete cascade,
  to_id uuid references memories(id) on delete cascade,
  relation text not null default 'relacionado',
  primary key (from_id, to_id)
);

-- Números para os gráficos
create table if not exists metrics (
  id uuid primary key default gen_random_uuid(),
  department text not null,
  name text not null,                 -- ex.: 'leads', 'custo_por_lead'
  value numeric not null,
  unit text,
  recorded_at timestamptz not null default now()
);
create index if not exists metrics_idx on metrics(department, name, recorded_at desc);

-- Atualiza updated_at nas tarefas
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists tasks_updated on tasks;
create trigger tasks_updated before update on tasks
  for each row execute function set_updated_at();

-- Segurança: só o dono entra pelo painel.
-- A ponte dos agentes usa a chave de serviço, que ignora estas regras e fica só no seu computador.
alter table agents       enable row level security;
alter table tasks        enable row level security;
alter table messages     enable row level security;
alter table events       enable row level security;
alter table approvals    enable row level security;
alter table memories     enable row level security;
alter table memory_links enable row level security;
alter table metrics      enable row level security;

do $$
declare t text;
begin
  foreach t in array array['agents','tasks','messages','events','approvals','memories','memory_links','metrics']
  loop
    execute format('drop policy if exists owner_all on %I', t);
    execute format(
      'create policy owner_all on %I for all to authenticated
         using ((auth.jwt() ->> ''email'') = ''SEU-EMAIL@EXEMPLO.COM'')
         with check ((auth.jwt() ->> ''email'') = ''SEU-EMAIL@EXEMPLO.COM'')', t);
  end loop;
end $$;

-- Atualização ao vivo no painel
alter publication supabase_realtime add table tasks, messages, events, approvals, agents;
