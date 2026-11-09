import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, configured, useTable } from './supabase';

type Tab = 'geral' | 'tarefas' | 'conversas' | 'aprovacoes' | 'agentes' | 'cerebro';

const TABS: { id: Tab; label: string }[] = [
  { id: 'geral', label: 'Visão geral' },
  { id: 'tarefas', label: 'Tarefas' },
  { id: 'conversas', label: 'Conversas' },
  { id: 'aprovacoes', label: 'Aprovações' },
  { id: 'agentes', label: 'Agentes' },
  { id: 'cerebro', label: 'Cérebro' },
];

const COLUNAS: { id: string; label: string }[] = [
  { id: 'todo', label: 'A fazer' },
  { id: 'doing', label: 'Em andamento' },
  { id: 'blocked', label: 'Bloqueadas' },
  { id: 'review', label: 'Em revisão' },
  { id: 'done', label: 'Concluídas' },
];

const quando = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('geral');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!configured) {
    return (
      <div className="center card">
        <h1>Falta configurar</h1>
        <p>Crie o arquivo <code>dashboard/.env</code> com <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> (veja o <code>.env.example</code>).</p>
      </div>
    );
  }
  if (!ready) return <div className="center">Carregando…</div>;
  if (!session) return <Login />;

  return (
    <div className="app">
      <header>
        <strong>Empresa de Agentes</strong>
        <nav>
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </nav>
        <button className="ghost" onClick={() => supabase.auth.signOut()}>Sair</button>
      </header>
      <main>
        {tab === 'geral' && <Geral />}
        {tab === 'tarefas' && <Tarefas />}
        {tab === 'conversas' && <Conversas />}
        {tab === 'aprovacoes' && <Aprovacoes />}
        {tab === 'agentes' && <Agentes />}
        {tab === 'cerebro' && <Cerebro />}
      </main>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const enviar = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setMsg(error ? `Erro: ${error.message}` : 'Pronto. Abra o link que enviamos para o seu e-mail.');
  };
  return (
    <div className="center card">
      <h1>Entrar</h1>
      <p>Digite o e-mail autorizado. Você recebe um link de acesso, sem senha.</p>
      <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={enviar} disabled={!email}>Enviar link</button>
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}

function Geral() {
  const tasks = useTable<any>('tasks', 'updated_at');
  const agents = useTable<any>('agents', 'name');
  const approvals = useTable<any>('approvals');
  const events = useTable<any>('events', 'created_at', 30);

  const porStatus = (s: string) => tasks.rows.filter((t) => t.status === s).length;
  const porSetor = useMemo(() => {
    const m: Record<string, number> = {};
    tasks.rows.filter((t) => t.status !== 'done' && t.status !== 'cancelled').forEach((t) => {
      const k = t.department || 'sem setor';
      m[k] = (m[k] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [tasks.rows]);
  const max = Math.max(1, ...porSetor.map(([, n]) => n));
  const nomes: Record<string, string> = Object.fromEntries(agents.rows.map((a) => [a.id, a.name]));

  return (
    <>
      {(tasks.error || agents.error) && <p className="erro">Erro ao ler dados: {tasks.error || agents.error}</p>}
      <div className="grid4">
        <Stat n={porStatus('doing')} label="Em andamento" />
        <Stat n={porStatus('todo')} label="A fazer" />
        <Stat n={approvals.rows.filter((a) => a.status === 'pending').length} label="Aguardando você" destaque />
        <Stat n={agents.rows.filter((a) => a.status === 'working').length} label="Agentes trabalhando" />
      </div>
      <div className="duas">
        <section className="card">
          <h2>Tarefas abertas por setor</h2>
          {porSetor.length === 0 && <p className="muted">Nada aberto no momento.</p>}
          {porSetor.map(([setor, n]) => (
            <div key={setor} className="barra">
              <span>{setor}</span>
              <div><i style={{ width: `${(n / max) * 100}%` }} /></div>
              <b>{n}</b>
            </div>
          ))}
        </section>
        <section className="card">
          <h2>Últimas atividades</h2>
          {events.rows.length === 0 && <p className="muted">Ainda sem atividade registrada.</p>}
          <ul className="linha">
            {events.rows.map((e) => (
              <li key={e.id}>
                <span className="muted">{quando(e.created_at)}</span>{' '}
                <b>{nomes[e.agent_id] || e.agent_id || 'Sistema'}</b>: {e.summary}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

const Stat = ({ n, label, destaque }: { n: number; label: string; destaque?: boolean }) => (
  <div className={`card stat ${destaque && n > 0 ? 'alerta' : ''}`}><b>{n}</b><span>{label}</span></div>
);

function Tarefas() {
  const tasks = useTable<any>('tasks', 'updated_at');
  const agents = useTable<any>('agents', 'name');
  const nomes: Record<string, string> = Object.fromEntries(agents.rows.map((a) => [a.id, a.name]));
  return (
    <div className="kanban">
      {COLUNAS.map((c) => {
        const itens = tasks.rows.filter((t) => t.status === c.id);
        return (
          <div key={c.id} className="coluna">
            <h3>{c.label} <span className="muted">{itens.length}</span></h3>
            {itens.map((t) => (
              <div key={t.id} className={`card tarefa p-${t.priority}`}>
                <b>{t.title}</b>
                <small>{nomes[t.assigned_agent] || 'Sem responsável'} · {t.department || 'geral'}</small>
                {t.result && <p className="muted">{t.result}</p>}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Conversas() {
  const msgs = useTable<any>('messages', 'created_at', 100);
  const agents = useTable<any>('agents', 'name');
  const nomes: Record<string, string> = Object.fromEntries(agents.rows.map((a) => [a.id, a.name]));
  const nome = (id?: string) => (id ? nomes[id] || id : 'todos');
  return (
    <section className="card">
      <h2>Conversa entre os agentes</h2>
      {msgs.rows.length === 0 && <p className="muted">Nenhuma mensagem ainda.</p>}
      {msgs.rows.map((m) => (
        <div key={m.id} className="msg">
          <small className="muted">{quando(m.created_at)} · {nome(m.from_agent)} → {nome(m.to_agent)}</small>
          <p>{m.content}</p>
        </div>
      ))}
    </section>
  );
}

function Aprovacoes() {
  const ap = useTable<any>('approvals');
  const agents = useTable<any>('agents', 'name');
  const nomes: Record<string, string> = Object.fromEntries(agents.rows.map((a) => [a.id, a.name]));
  const decidir = async (id: string, status: 'approved' | 'rejected') => {
    const nota = status === 'rejected' ? window.prompt('Quer deixar um recado para o agente? (opcional)') || null : null;
    await supabase.from('approvals').update({ status, decision_note: nota, decided_at: new Date().toISOString() }).eq('id', id);
  };
  const pendentes = ap.rows.filter((a) => a.status === 'pending');
  const decididas = ap.rows.filter((a) => a.status !== 'pending').slice(0, 20);
  return (
    <>
      <section className="card">
        <h2>Esperando a sua decisão</h2>
        {pendentes.length === 0 && <p className="muted">Nada pendente. Os agentes estão liberados.</p>}
        {pendentes.map((a) => (
          <div key={a.id} className="aprov">
            <div>
              <b>{a.action}</b>
              <small className="muted"> pedido por {nomes[a.agent_id] || a.agent_id} em {quando(a.created_at)}</small>
              {a.details?.texto && <p>{a.details.texto}</p>}
            </div>
            <div className="acoes">
              <button onClick={() => decidir(a.id, 'approved')}>Aprovar</button>
              <button className="ghost" onClick={() => decidir(a.id, 'rejected')}>Recusar</button>
            </div>
          </div>
        ))}
      </section>
      <section className="card">
        <h2>Histórico</h2>
        {decididas.map((a) => (
          <p key={a.id}>
            <span className={`tag ${a.status}`}>{a.status === 'approved' ? 'Aprovado' : 'Recusado'}</span> {a.action}{' '}
            <small className="muted">({nomes[a.agent_id] || a.agent_id}, {quando(a.decided_at)})</small>
          </p>
        ))}
      </section>
    </>
  );
}

function Agentes() {
  const agents = useTable<any>('agents', 'name');
  const tasks = useTable<any>('tasks', 'updated_at');
  const rotulo: Record<string, string> = { idle: 'Livre', working: 'Trabalhando', waiting: 'Aguardando você', offline: 'Offline' };
  const setores = Array.from(new Set(agents.rows.map((a) => a.department)));
  return (
    <>
      {setores.map((s) => (
        <section key={s} className="card">
          <h2>{s}</h2>
          <div className="grid3">
            {agents.rows.filter((a) => a.department === s).map((a) => {
              const abertas = tasks.rows.filter((t) => t.assigned_agent === a.id && !['done', 'cancelled'].includes(t.status)).length;
              return (
                <div key={a.id} className="agente">
                  <span className={`dot ${a.status}`} />
                  <div>
                    <b>{a.name}</b>
                    <small>{a.role}</small>
                    <small className="muted">{rotulo[a.status]} · {abertas} tarefa(s) aberta(s)</small>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

function Cerebro() {
  const mem = useTable<any>('memories', 'created_at', 300);
  const [q, setQ] = useState('');
  const lista = mem.rows.filter((m) =>
    `${m.title} ${m.content} ${(m.tags || []).join(' ')}`.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <section className="card">
      <h2>Cérebro da empresa</h2>
      <input placeholder="Buscar na memória…" value={q} onChange={(e) => setQ(e.target.value)} />
      {lista.length === 0 && <p className="muted">Nada encontrado. Os agentes gravam aqui o que aprendem.</p>}
      {lista.map((m) => (
        <article key={m.id} className="mem">
          <b>{m.title}</b> <span className="tag">{m.category}</span>
          <p>{m.content}</p>
          <small className="muted">{(m.tags || []).map((t: string) => `#${t}`).join(' ')} · {quando(m.created_at)}</small>
        </article>
      ))}
    </section>
  );
}
