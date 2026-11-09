# Plataforma da empresa de agentes

Painel para acompanhar o que os agentes fazem: tarefas, conversas, aprovações, memória e gráficos.

```
agentes (Claude Code / Cowork)
      │  comandos da ponte (bridge)
      ▼
   Supabase  ◄──── painel (React, hospedado na Cloudflare)
 (banco + login + ao vivo)        ▲
                                  └── você, no navegador
```

## O que tem aqui

| Pasta | Para quê |
|---|---|
| `supabase/` | Esquema do banco (`migrations/0001_init.sql`) e os agentes iniciais (`seed.sql`) |
| `bridge/` | Comando que os agentes usam para registrar tarefas, mensagens, aprovações e memória |
| `dashboard/` | O painel: visão geral, tarefas, conversas, aprovações, agentes e cérebro |
| `docs/INSTRUCOES-AGENTES.md` | Bloco para colar nos agentes ensinando a usar a ponte |

## Passo a passo (nesta ordem)

### 1. GitHub
1. Crie um repositório **privado** (ex.: `empresa-agentes`).
2. Coloque esta pasta nele e envie. O `.gitignore` já impede subir `.env` e `node_modules`.

### 2. Supabase
1. Crie um projeto novo.
2. Abra `supabase/migrations/0001_init.sql`, troque **SEU-EMAIL@EXEMPLO.COM** (aparece duas vezes) pelo seu e-mail e rode no **SQL Editor**.
3. Rode também `supabase/seed.sql`.
4. Em **Authentication → URL Configuration**, deixe `http://localhost:5173` como Site URL por enquanto. Depois que a Cloudflare te der o endereço, adicione ele também.
5. Em **Project Settings → API**, anote: a URL do projeto, a chave **anon** e a chave **service_role**.

> A chave `service_role` é a chave-mestra: ignora todas as regras de segurança. Ela fica **só no seu computador**, nas variáveis de ambiente da ponte. Nunca no GitHub, nunca na Cloudflare, nunca no painel.

### 3. Testar o painel no seu computador
```
cd dashboard
cp .env.example .env      # preencha URL e chave anon
npm install
npm run dev
```
Abra `http://localhost:5173`, entre com o e-mail autorizado (você recebe um link) e veja o painel vazio.

### 4. Testar a ponte
```
cd bridge
npm install
export SUPABASE_URL=...  SUPABASE_SERVICE_KEY=...      # no Windows (PowerShell): $env:SUPABASE_URL="..."
node empresa.mjs task new "Teste" --agent beatriz --dept diretoria
node empresa.mjs log "Primeiro registro" --agent beatriz
```
Com o painel aberto, a tarefa e o registro aparecem sozinhos.

### 5. Cloudflare
1. No painel da Cloudflare, vá em Workers & Pages e crie um projeto conectado ao seu repositório do GitHub (a tela pode mudar de nome; o que importa são estas configurações).
2. **Pasta raiz:** `dashboard` · **Comando de build:** `npm run build` · **Saída:** `dist`.
3. Variáveis de ambiente: apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Volte ao Supabase e adicione o endereço que a Cloudflare gerou em **URL Configuration**, senão o link de login não funciona.

### 6. Antigravity (ou qualquer editor)
Abra a pasta do repositório. Funciona como editor comum. Cuidado com um ponto: **não deixe duas IAs editarem os mesmos arquivos ao mesmo tempo** (por exemplo, o Antigravity e o Claude Code). Combine: uma ferramenta por tarefa, commit antes de trocar.

### 7. Ensinar os agentes
Cole o bloco de `docs/INSTRUCOES-AGENTES.md` no `CLAUDE.md` da aba Code. A partir daí, a Helena e o time registram tudo no painel. No Cowork, depende de ele conseguir rodar comandos e acessar a internet no seu plano; se não conseguir, a próxima etapa é trocar a ponte por um conector.

## Segurança (leia uma vez)
- O painel só aceita o e-mail que você colocou nas regras do banco (RLS).
- A chave `anon` pode ficar pública porque as regras do banco protegem os dados.
- Os agentes têm acesso total ao banco via ponte. Por isso as ações de risco passam pela tabela de aprovações, e a regra está escrita nas instruções deles. Isso depende do agente seguir a instrução: confira o histórico de vez em quando.
- Dados de clientes no banco seguem a LGPD: guarde o mínimo necessário.

## O que ainda não existe (próximas etapas)
1. Criar e reatribuir tarefas pelo painel (hoje o painel só lê e decide aprovações).
2. Gráficos de métricas (a tabela `metrics` já existe, falta a tela).
3. Cérebro em grafo, com links entre memórias (a tabela `memory_links` já existe).
4. Busca por significado (embeddings) na memória.
5. Conector MCP no lugar da ponte por linha de comando.
6. Voz.
7. Rotinas agendadas ligadas ao painel.
