#!/usr/bin/env node
// Ponte dos agentes com o painel. Todo comando imprime JSON na saída.
// Uso: node empresa.mjs <comando> [argumentos] [--opcao valor]
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Faltam SUPABASE_URL e SUPABASE_SERVICE_KEY nas variáveis de ambiente.');
  process.exit(1);
}
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

// Separa argumentos soltos de opções (--nome valor)
const [cmd, sub, ...rest] = process.argv.slice(2);
const args = [];
const opt = {};
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith('--')) { opt[rest[i].slice(2)] = rest[i + 1]; i++; }
  else args.push(rest[i]);
}

const out = (data) => console.log(JSON.stringify(data, null, 2));
const fail = (msg) => { console.error(msg); process.exit(1); };
const ok = ({ data, error }) => { if (error) fail(error.message); return data; };

async function touch(agent, status = 'working') {
  if (!agent) return;
  await db.from('agents').update({ status, last_seen_at: new Date().toISOString() }).eq('id', agent);
}

const commands = {
  // task new "Título" --agent marcela --dept marketing --priority alta --by beatriz --desc "..." --parent <id> --due 2026-12-01
  async 'task new'() {
    if (!args[0]) fail('Informe o título da tarefa.');
    const row = ok(await db.from('tasks').insert({
      title: args[0], description: opt.desc, department: opt.dept,
      assigned_agent: opt.agent, created_by: opt.by, parent_task_id: opt.parent,
      priority: opt.priority || 'media', due_at: opt.due,
    }).select().single());
    await db.from('events').insert({ agent_id: opt.by || opt.agent, task_id: row.id, type: 'inicio', summary: `Nova tarefa: ${row.title}` });
    out(row);
  },
  // task set <id> <status> --result "..." --agent marcela
  async 'task set'() {
    const [id, status] = args;
    if (!id || !status) fail('Uso: task set <id> <status> [--result "..."]');
    const patch = { status };
    if (opt.result) patch.result = opt.result;
    const row = ok(await db.from('tasks').update(patch).eq('id', id).select().single());
    await db.from('events').insert({
      agent_id: opt.agent || row.assigned_agent, task_id: id,
      type: status === 'done' ? 'entrega' : 'info', summary: `Tarefa "${row.title}" → ${status}`,
    });
    await touch(opt.agent || row.assigned_agent, status === 'done' ? 'idle' : 'working');
    out(row);
  },
  async 'task list'() {
    let q = db.from('tasks').select('id,title,status,priority,assigned_agent,department,due_at').order('created_at', { ascending: false }).limit(50);
    if (opt.status) q = q.eq('status', opt.status);
    if (opt.agent) q = q.eq('assigned_agent', opt.agent);
    out(ok(await q));
  },
  // log "texto" --agent paula --type info --task <id>
  async 'log'() {
    const text = sub;
    if (!text) fail('Uso: log "texto" --agent <id>');
    out(ok(await db.from('events').insert({ agent_id: opt.agent, task_id: opt.task, type: opt.type || 'info', summary: text }).select().single()));
    await touch(opt.agent);
  },
  // say "mensagem" --from marcela --to lucas --task <id>
  async 'say'() {
    const text = sub;
    if (!text) fail('Uso: say "mensagem" --from <id> --to <id> [--task <id>]');
    out(ok(await db.from('messages').insert({ from_agent: opt.from, to_agent: opt.to, task_id: opt.task, content: text }).select().single()));
    await touch(opt.from);
  },
  async 'inbox'() { // mensagens para um agente: inbox <id>
    if (!sub) fail('Uso: inbox <id-do-agente>');
    out(ok(await db.from('messages').select('*').or(`to_agent.eq.${sub},to_agent.is.null`).order('created_at', { ascending: false }).limit(30)));
  },
  // approve request "Ação" --agent gustavo --task <id> --details "texto"
  async 'approve request'() {
    if (!args[0]) fail('Descreva a ação que precisa de aprovação.');
    const row = ok(await db.from('approvals').insert({
      action: args[0], agent_id: opt.agent, task_id: opt.task, details: opt.details ? { texto: opt.details } : {},
    }).select().single());
    await db.from('events').insert({ agent_id: opt.agent, task_id: opt.task, type: 'decisao', summary: `Pediu aprovação: ${args[0]}` });
    await touch(opt.agent, 'waiting');
    out(row);
  },
  async 'approve status'() {
    if (!args[0]) fail('Uso: approve status <id>');
    out(ok(await db.from('approvals').select('id,status,decision_note,decided_at').eq('id', args[0]).single()));
  },
  // memory add "Título" "Conteúdo" --cat marca --tags a,b --agent marcela
  async 'memory add'() {
    if (!args[0] || !args[1]) fail('Uso: memory add "Título" "Conteúdo" [--cat x --tags a,b]');
    out(ok(await db.from('memories').insert({
      title: args[0], content: args[1], category: opt.cat || 'geral',
      tags: opt.tags ? opt.tags.split(',').map((s) => s.trim()) : [], created_by: opt.agent,
    }).select().single()));
  },
  async 'memory search'() {
    if (!args[0]) fail('Uso: memory search "termo"');
    out(ok(await db.from('memories').select('id,title,content,category,tags').textSearch('fts', args[0], { config: 'portuguese', type: 'websearch' }).limit(10)));
  },
  // metric add leads 42 --dept marketing --unit un
  async 'metric add'() {
    const [name, value] = args;
    if (!name || value === undefined) fail('Uso: metric add <nome> <valor> --dept <setor> [--unit un]');
    out(ok(await db.from('metrics').insert({ name, value: Number(value), department: opt.dept || 'geral', unit: opt.unit }).select().single()));
  },
};

// Junta comando e subcomando quando existir ("task new"); senão usa só o comando ("log", "say", "inbox")
const key = commands[`${cmd} ${sub}`] ? `${cmd} ${sub}` : cmd;
if (!commands[key]) {
  fail(`Comando desconhecido. Disponíveis: ${Object.keys(commands).join(', ')}`);
}
await commands[key]();
