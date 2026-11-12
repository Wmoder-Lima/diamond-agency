-- Biblioteca de skills dos agentes
-- Antes de rodar, troque SEU-EMAIL@EXEMPLO.COM pelo mesmo e-mail usado no 0001_init.sql.
-- Esta tabela guarda o TEXTO das skills para o painel mostrar, editar e versionar.
-- Ela NÃO instala nada no Claude: as skills continuam sendo instaladas em Personalizar (Chat/Cowork)
-- ou na pasta .claude/agents (aba Code).

create table if not exists skills (
  slug        text primary key,                 -- ex.: 'marketing-crm'
  name        text not null,                    -- ex.: 'Paula'
  department  text not null,
  description text not null,                    -- quando usar (o que o Claude lê para decidir)
  content     text not null,                    -- SKILL.md completo
  version     int  not null default 1,
  enabled     boolean not null default true,
  updated_at  timestamptz not null default now()
);

-- Sobe a versão e a data sempre que o conteúdo mudar
create or replace function bump_skill_version() returns trigger as $$
begin
  if new.content is distinct from old.content or new.description is distinct from old.description then
    new.version = old.version + 1;
  end if;
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists skills_bump on skills;
create trigger skills_bump before update on skills
  for each row execute function bump_skill_version();

-- Segurança: só o dono lê e altera pelo painel
alter table skills enable row level security;
drop policy if exists owner_all on skills;
create policy owner_all on skills for all to authenticated
  using ((auth.jwt() ->> 'email') = 'willyanv91@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'willyanv91@gmail.com');

-- Atualização ao vivo no painel
alter publication supabase_realtime add table skills;

-- Agentes novos que aparecem nas skills (só se a tabela agents já existir)
do $$
begin
  if to_regclass('public.agents') is not null then
    insert into agents (id, name, role, department) values
      ('rafael-fin', 'Rafael (Financeiro)', 'Analista Financeiro',          'financeiro'),
      ('andre',      'André',               'Apoio Jurídico',               'juridico'),
      ('samuel',     'Samuel',              'Operações e Produção',         'operacoes'),
      ('clara',      'Clara',               'Parceira de RH',               'rh')
    on conflict (id) do nothing;
  end if;
end $$;
