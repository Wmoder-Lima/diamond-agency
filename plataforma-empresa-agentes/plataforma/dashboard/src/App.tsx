import React, { useState, useEffect, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import { 
  Sidebar, 
  TabType 
} from './components/Sidebar';
import { Header } from './components/Header';
import { NeuralBrainCanvas } from './components/NeuralBrainCanvas';
import { AgentAvatar } from './components/AgentAvatar';
import { MetricsCharts } from './components/MetricsCharts';
import { LiveCommsFeed } from './components/LiveCommsFeed';
import { SettingsAdvanced } from './components/SettingsAdvanced';
import { LoginView } from './components/LoginView';
import { useTable, supabase } from './supabase';
import { 
  Plus, 
  Activity, 
  Zap, 
  ShieldAlert, 
  Bot, 
  ArrowUpRight,
  Check,
  X,
  Terminal,
  Settings2,
  Gem,
  AlertCircle,
  Database,
  Sparkles,
  Layers
} from 'lucide-react';

const SEED_AGENTS = [
  { id: 'beatriz',  name: 'Beatriz',  role: 'Diretora Geral',                department: 'diretoria',  status: 'working' },
  { id: 'helena',   name: 'Helena',   role: 'Diretora de Tecnologia',        department: 'tecnologia', status: 'working' },
  { id: 'rafael',   name: 'Rafael',   role: 'Arquiteto de Software',         department: 'tecnologia', status: 'working' },
  { id: 'camila',   name: 'Camila',   role: 'Desenvolvedora Front-end',      department: 'tecnologia', status: 'working' },
  { id: 'thiago',   name: 'Thiago',   role: 'Desenvolvedor Back-end',        department: 'tecnologia', status: 'idle' },
  { id: 'bruno',    name: 'Bruno',    role: 'Desenvolvedor Fullstack',       department: 'tecnologia', status: 'working' },
  { id: 'larissa',  name: 'Larissa',  role: 'Engenheira de QA',              department: 'tecnologia', status: 'working' },
  { id: 'diego',    name: 'Diego',    role: 'Suporte de TI',                 department: 'tecnologia', status: 'idle' },
  { id: 'marcela',  name: 'Marcela',  role: 'Diretora de Marketing',         department: 'marketing',  status: 'working' },
  { id: 'lucas',    name: 'Lucas',    role: 'Designer',                      department: 'marketing',  status: 'working' },
  { id: 'paula',    name: 'Paula',    role: 'CRM e Relacionamento',          department: 'marketing',  status: 'idle' },
  { id: 'renato',   name: 'Renato',   role: 'Inteligência de Mercado',       department: 'marketing',  status: 'working' },
  { id: 'gustavo',  name: 'Gustavo',  role: 'Tráfego Pago',                  department: 'marketing',  status: 'waiting' },
  { id: 'nina',     name: 'Nina',     role: 'Vídeo e Cortes Virais',         department: 'marketing',  status: 'working' },
  { id: 'felipe',   name: 'Felipe',   role: 'SDR e Prospecção',              department: 'comercial',  status: 'working' },
  { id: 'juliana',  name: 'Juliana',  role: 'Closer e Follow-up',            department: 'comercial',  status: 'working' },
  { id: 'marcos',   name: 'Marcos',   role: 'Sucesso do Cliente e Upsell',   department: 'comercial',  status: 'idle' },
  { id: 'isabela',  name: 'Isabela',  role: 'Apresentações',                 department: 'comercial',  status: 'working' }
];

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabType>('geral');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('todos');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Escuta autenticação do Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setReady(true);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  // ─── TABELAS REAIS DO BANCO SUPABASE (AO VIVO VIA REALTIME) ─────────────
  const tasksTable = useTable<any>('tasks', 'updated_at', 250);
  const agentsTable = useTable<any>('agents', 'name', 100);
  const approvalsTable = useTable<any>('approvals', 'created_at', 100);
  const messagesTable = useTable<any>('messages', 'created_at', 150);
  const eventsTable = useTable<any>('events', 'created_at', 50);
  const memoriesTable = useTable<any>('memories', 'created_at', 200);
  const metricsTable = useTable<any>('metrics', 'recorded_at', 100);

  const tasks = tasksTable.rows;
  const agents = agentsTable.rows;
  const approvals = approvalsTable.rows;
  const messages = messagesTable.rows;
  const events = eventsTable.rows;
  const memories = memoriesTable.rows;

  // Estados locais do modal de criação
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAgent, setNewTaskAgent] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'baixa' | 'media' | 'alta' | 'urgente'>('alta');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isSeedingAgents, setIsSeedingAgents] = useState(false);

  // Define agente padrão quando os agentes forem carregados
  useEffect(() => {
    if (agents.length > 0 && !newTaskAgent) {
      setNewTaskAgent(agents[0].id);
    }
  }, [agents, newTaskAgent]);

  const pendingApprovals = useMemo(() => {
    return approvals.filter((a) => a.status === 'pending');
  }, [approvals]);

  const activeAgentsCount = useMemo(() => {
    return agents.filter((a) => a.status === 'working').length;
  }, [agents]);

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // Semear agentes no banco caso a tabela esteja vazia
  const handleSeedAgents = async () => {
    setIsSeedingAgents(true);
    try {
      const { error } = await supabase.from('agents').upsert(SEED_AGENTS);
      if (error) {
        alert(`Erro ao semear agentes: ${error.message}`);
      }
    } catch (e: any) {
      alert(`Falha: ${e?.message}`);
    } finally {
      setIsSeedingAgents(false);
    }
  };

  // Decidir aprovação direto no Supabase
  const handleDecideApproval = async (id: string, decision: 'approved' | 'rejected') => {
    const note = decision === 'approved' 
      ? 'Aprovado via Central Executiva' 
      : (window.prompt('Motivo da recusa (opcional):') || 'Rejeitado para revisão');

    await supabase
      .from('approvals')
      .update({
        status: decision,
        decided_at: new Date().toISOString(),
        decision_note: note
      })
      .eq('id', id);
  };

  // Criar tarefa direto no Supabase
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isCreatingTask) return;

    setIsCreatingTask(true);
    const agentObj = agents.find((a) => a.id === newTaskAgent);

    try {
      const { error } = await supabase.from('tasks').insert({
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim() || null,
        department: agentObj?.department || 'tecnologia',
        assigned_agent: newTaskAgent || null,
        created_by: 'beatriz',
        priority: newTaskPriority,
        status: 'todo'
      });

      if (error) {
        alert(`Erro ao criar tarefa: ${error.message}`);
      } else {
        setNewTaskTitle('');
        setNewTaskDesc('');
        setShowNewTaskModal(false);
      }
    } catch (err: any) {
      alert(`Erro de conexão: ${err?.message}`);
    } finally {
      setIsCreatingTask(false);
    }
  };

  // Concluir ou mudar status de tarefa
  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    await supabase
      .from('tasks')
      .update({
        status: newStatus,
        result: newStatus === 'done' ? 'Finalizado com sucesso pelo painel.' : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);
  };

  // Tela de Carregando
  if (!ready) {
    return (
      <div className="min-h-screen w-screen bg-[#030206] text-zinc-100 flex flex-col items-center justify-center space-y-4 font-sans select-none">
        <div className="w-12 h-12 rounded-2xl bg-[#0f0d1a] border border-purple-900/40 flex items-center justify-center animate-pulse shadow-[0_0_25px_rgba(168,85,247,0.3)]">
          <Gem className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <span className="w-3.5 h-3.5 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
          <span>Conectando ao banco de dados Supabase...</span>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, exibe a tela de login por e-mail
  if (!session) {
    return <LoginView />;
  }

  const userEmail = session.user?.email || 'Administrador';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#030206] text-zinc-100 font-sans selection:bg-purple-900 selection:text-white">
      {/* Menu Lateral Responsivo */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingApprovalsCount={pendingApprovals.length}
        activeAgentsCount={activeAgentsCount}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      {/* Conteúdo Central */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#030206]">
        {/* Header Superior */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          pendingApprovalsCount={pendingApprovals.length}
          onOpenApprovals={() => setCurrentTab('aprovacoes')}
          onToggleMobileMenu={() => setMobileMenuOpen((o) => !o)}
        />

        {/* Sub-Header com Status do Banco Supabase */}
        <div className="px-3 sm:px-6 py-1.5 bg-[#07060c] border-b border-purple-950/40 flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 text-left gap-1 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-mono text-zinc-300 truncate">{userEmail}</span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline">Supabase Realtime Ativo</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-500 font-mono text-[9px] sm:text-[10px]">
            <span>{tasks.length} tarefas</span>
            <span>{agents.length} agentes</span>
            <span className="text-emerald-400">Banco Conectado</span>
          </div>
        </div>

        {/* Notificação se a tabela de agentes ainda estiver vazia */}
        {agents.length === 0 && !agentsTable.error && (
          <div className="px-4 py-2.5 bg-purple-950/40 border-b border-purple-800/40 text-purple-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400 shrink-0" />
              <span>A tabela <code>agents</code> ainda está vazia no Supabase. Deseja semear os 18 agentes iniciais agora?</span>
            </div>
            <button
              onClick={handleSeedAgents}
              disabled={isSeedingAgents}
              className="px-3 py-1 rounded bg-purple-700 hover:bg-purple-600 text-white font-semibold text-[11px] shrink-0 cursor-pointer"
            >
              {isSeedingAgents ? 'Semeando...' : 'Semear 18 Agentes'}
            </button>
          </div>
        )}

        {/* Erro de leitura de tabelas se houver RLS ou problema */}
        {tasksTable.error && (
          <div className="px-4 py-2 bg-rose-950/50 border-b border-rose-900/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Aviso do banco: {tasksTable.error}. Certifique-se de ter rodado a migration <code>0001_init.sql</code> com seu e-mail autorizado.</span>
          </div>
        )}

        {/* Conteúdo com Scroll */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-6 text-left">
          {/* ─────────────────────────────────────────────────────────── */}
          {/* ABA 1: VISÃO GERAL & CÉREBRO NEURAL                        */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentTab === 'geral' && (
            <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto text-left">
              {/* Banner Top */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-xl bg-[#080710] border border-purple-950/50">
                <div className="text-left">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      PAINEL OPERACIONAL SUPABASE
                    </span>
                  </div>
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight">
                    Orquestração da Diamond Agency
                  </h1>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 max-w-2xl">
                    Dados ao vivo sincronizados diretamente com o seu banco de dados PostgreSQL do Supabase.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowNewTaskModal(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nova Demanda</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('configuracoes')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0e0c18] hover:bg-[#141222] border border-purple-950/60 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-purple-400" />
                    <span className="hidden sm:inline">Configurações</span>
                  </button>
                </div>
              </div>

              {/* Grid 4 KPIs Reais */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-xl bg-[#080710] border border-purple-950/50 text-left">
                  <div className="flex items-center justify-between text-zinc-500 mb-1 sm:mb-2">
                    <span className="text-[11px] sm:text-xs font-medium">Agentes / Skills</span>
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="flex items-baseline gap-1 sm:gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                      {agents.length}
                    </span>
                    <span className="text-[10px] sm:text-xs text-zinc-500">cadastrados</span>
                  </div>
                  <div className="mt-1 text-[10px] text-zinc-400 font-mono truncate">
                    {activeAgentsCount} em operação
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-[#080710] border border-purple-950/50 text-left">
                  <div className="flex items-center justify-between text-zinc-500 mb-1 sm:mb-2">
                    <span className="text-[11px] sm:text-xs font-medium">Em Andamento</span>
                    <Activity className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="flex items-baseline gap-1 sm:gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                      {tasks.filter((t) => t.status === 'doing').length}
                    </span>
                    <span className="text-[10px] sm:text-xs text-zinc-500">de {tasks.length}</span>
                  </div>
                  <div className="mt-1 text-[10px] text-zinc-400 font-mono truncate">
                    {tasks.filter((t) => t.status === 'done').length} concluídas
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-[#080710] border border-purple-950/50 text-left">
                  <div className="flex items-center justify-between text-zinc-500 mb-1 sm:mb-2">
                    <span className="text-[11px] sm:text-xs font-medium">Aprovações</span>
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-1 sm:gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">
                      {pendingApprovals.length}
                    </span>
                    <span className="text-[10px] sm:text-xs text-zinc-500">pendentes</span>
                  </div>
                  <div className="mt-1 text-[10px] text-amber-400/80 font-mono truncate">
                    Human-in-the-loop
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-[#080710] border border-purple-950/50 text-left">
                  <div className="flex items-center justify-between text-zinc-500 mb-1 sm:mb-2">
                    <span className="text-[11px] sm:text-xs font-medium">Memórias</span>
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="flex items-baseline gap-1 sm:gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                      {memories.length}
                    </span>
                    <span className="text-[10px] sm:text-xs text-emerald-400 font-mono">no cérebro</span>
                  </div>
                  <div className="mt-1 text-[10px] text-zinc-500 font-mono truncate">
                    {events.length} eventos registrados
                  </div>
                </div>
              </div>

              {/* CÉREBRO VIRTUAL INTERATIVO INJETADO COM MEMÓRIAS E AGENTES REAIS */}
              <div className="space-y-2">
                <NeuralBrainCanvas memories={memories} agents={agents} />
              </div>

              {/* Gráficos Reais Injetados com Tarefas e Agentes */}
              <MetricsCharts tasks={tasks} agents={agents} metrics={metricsTable.rows} />

              {/* Feed Live Comms e Agentes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                  <LiveCommsFeed messages={messages} agents={agents} />
                </div>

                {/* Últimas Atividades Registradas no Banco */}
                <div className="rounded-xl bg-[#080710] border border-purple-950/50 p-4 flex flex-col text-left">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-950/40">
                    <h3 className="text-xs font-semibold text-white tracking-wide">
                      Últimos Eventos no Banco
                    </h3>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {events.length} logs
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[480px]">
                    {events.length === 0 ? (
                      <p className="text-xs text-zinc-500 text-center py-6">
                        Ainda sem atividades na tabela events. Conforme os agentes usam a ponte, os eventos aparecem aqui.
                      </p>
                    ) : (
                      events.map((e) => (
                        <div
                          key={e.id}
                          className="p-2.5 rounded-lg bg-[#0c0a15] border border-purple-950/40 text-left"
                        >
                          <div className="flex items-center justify-between gap-1 text-[9px] font-mono text-zinc-500 mb-1">
                            <span className="text-purple-400 uppercase font-semibold">{e.type || 'info'}</span>
                            <span>{e.created_at ? new Date(e.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-snug">
                            {e.summary}
                          </p>
                          {e.agent_id && (
                            <span className="text-[10px] text-zinc-500 block mt-1 font-mono">
                              Agente: {e.agent_id}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* ABA 2: QUADRO DE TAREFAS REAL DO BANCO                     */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentTab === 'tarefas' && (
            <div className="space-y-4 sm:space-y-5 max-w-7xl mx-auto text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Quadro Operacional de Tarefas (Supabase)
                  </h2>
                  <p className="text-[11px] sm:text-xs text-zinc-400">
                    {tasks.length} demandas registradas no banco • Deslize horizontalmente para navegar entre as colunas
                  </p>
                </div>
                <button
                  onClick={() => setShowNewTaskModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Tarefa</span>
                </button>
              </div>

              {/* Colunas do Kanban com Dados Reais */}
              <div className="flex overflow-x-auto snap-x space-x-3 md:space-x-0 md:grid md:grid-cols-5 md:gap-3.5 pb-3 scrollbar-thin">
                {[
                  { id: 'todo', label: 'A Fazer' },
                  { id: 'doing', label: 'Em Execução' },
                  { id: 'review', label: 'Revisão Técnica' },
                  { id: 'blocked', label: 'Bloqueadas' },
                  { id: 'done', label: 'Concluídas' }
                ].map((col) => {
                  const colTasks = tasks.filter((t) => t.status === col.id);

                  return (
                    <div
                      key={col.id}
                      className="w-[260px] sm:w-[280px] shrink-0 snap-start md:w-auto rounded-xl bg-[#07060c] border border-purple-950/50 p-3 flex flex-col h-[560px] sm:h-[640px]"
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-950/40">
                        <span className="text-xs font-semibold text-zinc-200">
                          {col.label}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0e0c18] border border-purple-950 text-zinc-400 font-mono">
                          {colTasks.length}
                        </span>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                        {colTasks.length === 0 ? (
                          <div className="text-center py-8 text-[11px] text-zinc-600">
                            Vazio
                          </div>
                        ) : (
                          colTasks.map((t) => {
                            const assigned = agents.find((a) => a.id === t.assigned_agent);

                            return (
                              <div
                                key={t.id}
                                className="p-3 rounded-lg bg-[#0b0914] border border-purple-950/60 hover:border-purple-800/40 transition-all space-y-2 text-left"
                              >
                                <div className="flex items-center justify-between gap-1 text-[9px] font-mono text-zinc-500">
                                  <span className="uppercase text-purple-400">{t.priority}</span>
                                  <span className="truncate">{t.department || 'geral'}</span>
                                </div>

                                <h4 className="text-xs font-semibold text-white leading-snug">
                                  {t.title}
                                </h4>

                                {t.description && (
                                  <p className="text-[11px] text-zinc-400 line-clamp-2">
                                    {t.description}
                                  </p>
                                )}

                                {t.result && (
                                  <div className="p-1.5 rounded bg-emerald-950/20 border border-emerald-900/30 text-[10px] text-emerald-300">
                                    ✓ {t.result}
                                  </div>
                                )}

                                <div className="pt-2 border-t border-purple-950/40 flex items-center justify-between text-xs">
                                  {assigned ? (
                                    <div className="flex items-center gap-1.5 truncate">
                                      <AgentAvatar agent={assigned} size="sm" />
                                      <span className="text-[11px] text-zinc-300 font-medium truncate">
                                        {assigned.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-zinc-600">Sem agente</span>
                                  )}

                                  {t.status !== 'done' && (
                                    <button
                                      onClick={() => handleUpdateTaskStatus(t.id, 'done')}
                                      className="p-1 rounded bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 text-[10px] shrink-0 cursor-pointer"
                                      title="Concluir tarefa"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* ABA 3: LIVE COMMS                                          */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentTab === 'conversas' && (
            <div className="max-w-6xl mx-auto space-y-4 text-left">
              <LiveCommsFeed messages={messages} agents={agents} />
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* ABA 4: CENTRAL DE APROVAÇÕES DO BANCO                     */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentTab === 'aprovacoes' && (
            <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 text-left">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  Central de Decisões & Aprovações Human-in-the-Loop
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-400">
                  Tabela approvals do Supabase • Decisões ficam salvas e liberam os agentes
                </p>
              </div>

              <div className="space-y-3">
                {pendingApprovals.length === 0 ? (
                  <div className="p-8 rounded-xl bg-[#080710] border border-purple-950/50 text-center text-zinc-500 text-xs">
                    Nenhum pedido de aprovação pendente no momento. As rotinas dos agentes estão liberadas.
                  </div>
                ) : (
                  pendingApprovals.map((appr) => {
                    const agent = agents.find((a) => a.id === appr.agent_id);

                    return (
                      <div
                        key={appr.id}
                        className="p-3.5 sm:p-4 rounded-xl bg-[#080710] border border-amber-950/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            {agent && <AgentAvatar agent={agent} size="sm" />}
                            <div>
                              <div className="text-[11px] text-zinc-400">
                                {agent ? agent.name : (appr.agent_id || 'Sistema')} solicitou:
                              </div>
                              <h4 className="text-xs font-semibold text-white">
                                {appr.action}
                              </h4>
                            </div>
                          </div>

                          {appr.details?.texto && (
                            <p className="text-[11px] text-zinc-300 pl-8">
                              {appr.details.texto}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-purple-950/40">
                          <button
                            onClick={() => handleDecideApproval(appr.id, 'approved')}
                            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-all cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Aprovar</span>
                          </button>
                          <button
                            onClick={() => handleDecideApproval(appr.id, 'rejected')}
                            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e0c18] hover:bg-rose-950/40 border border-purple-950/60 text-zinc-400 hover:text-rose-300 text-xs transition-all cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Recusar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Histórico Decididas */}
              {approvals.filter((a) => a.status !== 'pending').length > 0 && (
                <div className="pt-4 border-t border-purple-950/40 space-y-2">
                  <h4 className="text-xs font-semibold text-zinc-400">Histórico de Decisões</h4>
                  <div className="space-y-2">
                    {approvals.filter((a) => a.status !== 'pending').slice(0, 10).map((a) => (
                      <div
                        key={a.id}
                        className="p-2.5 rounded-lg bg-[#0a0814] border border-purple-950/30 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            a.status === 'approved' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950/40 text-rose-400 border border-rose-800/40'
                          }`}>
                            {a.status === 'approved' ? 'Aprovado' : 'Recusado'}
                          </span>
                          <span className="text-zinc-300 font-medium">{a.action}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {a.decided_at ? new Date(a.decided_at).toLocaleString('pt-BR') : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* ABA 5: AGENTES REAIS DO BANCO                             */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentTab === 'agentes' && (
            <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Agentes Registrados na Tabela agents ({agents.length})
                  </h2>
                  <p className="text-[11px] sm:text-xs text-zinc-400">
                    Módulos e especializações ativas no banco de dados do Supabase
                  </p>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                  {['todos', 'diretoria', 'tecnologia', 'marketing', 'comercial'].map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setSelectedDeptFilter(dept)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer shrink-0 ${
                        selectedDeptFilter === dept
                          ? 'bg-purple-700 text-white'
                          : 'bg-[#090812] text-zinc-400 hover:text-white border border-purple-950/60'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              {agents.length === 0 ? (
                <div className="p-8 rounded-xl bg-[#080710] border border-purple-950/50 text-center space-y-3">
                  <p className="text-xs text-zinc-400">Nenhum agente cadastrado no Supabase.</p>
                  <button
                    onClick={handleSeedAgents}
                    disabled={isSeedingAgents}
                    className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    {isSeedingAgents ? 'Cadastrando...' : 'Semear os 18 Agentes Iniciais'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                  {agents
                    .filter((a) => selectedDeptFilter === 'todos' || (a.department || '').toLowerCase() === selectedDeptFilter)
                    .map((agent) => {
                      const agentTasks = tasks.filter((t) => t.assigned_agent === agent.id && t.status !== 'done');

                      return (
                        <div
                          key={agent.id}
                          className="p-3.5 sm:p-4 rounded-xl bg-[#080710] border border-purple-950/50 hover:border-purple-900/40 transition-all flex flex-col justify-between text-left"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <AgentAvatar agent={agent} size="md" />
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#0e0c18] border border-purple-950/60 text-purple-300 capitalize">
                                {agent.department || 'geral'}
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-white">
                              {agent.name}
                            </h3>
                            <p className="text-xs text-purple-400 mb-1.5 font-medium">
                              {agent.role}
                            </p>

                            <div className="p-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-[10px] sm:text-[11px] text-zinc-300 mb-2.5">
                              <span className="text-zinc-500 block text-[9px] font-mono uppercase">ID na Ponte</span>
                              <code>{agent.id}</code>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-purple-950/40 flex items-center justify-between text-xs">
                            <span className="text-zinc-500 font-mono text-[10px]">
                              {agentTasks.length} abertas
                            </span>
                            <button
                              onClick={() => setCurrentTab('conversas')}
                              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                            >
                              Mensagem
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* ABA 6: MEMÓRIAS REAIS DO BANCO (TABELA MEMORIES)           */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentTab === 'cerebro' && (
            <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto text-left">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  Memória Central & Grafo de Conhecimento (Supabase)
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-400">
                  {memories.length} memórias registradas na tabela memories
                </p>
              </div>

              <NeuralBrainCanvas memories={memories} agents={agents} />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {memories.length === 0 ? (
                  <div className="col-span-full p-8 rounded-xl bg-[#080710] border border-purple-950/50 text-center space-y-2">
                    <p className="text-xs text-zinc-400">Nenhuma memória gravada ainda na tabela memories.</p>
                    <p className="text-[11px] text-zinc-600 font-mono">
                      Os agentes gravam aqui o que aprendem usando o comando <code>node empresa.mjs learn ...</code>
                    </p>
                  </div>
                ) : (
                  memories.map((mem) => (
                    <div
                      key={mem.id}
                      className="p-3.5 rounded-xl bg-[#080710] border border-purple-950/50 space-y-2 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#0e0c18] border border-purple-950 text-purple-300">
                          {mem.category || 'geral'}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-mono">
                          {mem.created_by ? `Por: ${mem.created_by}` : ''}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-white">
                        {mem.title}
                      </h4>

                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {mem.content}
                      </p>

                      {mem.tags && Array.isArray(mem.tags) && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {mem.tags.map((t: string) => (
                            <span key={t} className="text-[9px] text-purple-400 font-mono">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* ABA 7: MÉTRICAS                                            */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentTab === 'metricas' && (
            <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto text-left">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  Telemetria e Métricas do Banco
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-400">
                  Desempenho e volume extraídos das tabelas tasks e metrics
                </p>
              </div>

              <MetricsCharts tasks={tasks} agents={agents} metrics={metricsTable.rows} />
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* ABA 8: CONFIGURAÇÕES AVANÇADAS & CONECTORES                */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentTab === 'configuracoes' && (
            <SettingsAdvanced />
          )}
        </main>
      </div>

      {/* MODAL DE CRIAÇÃO RÁPIDA DE TAREFA REAL NO SUPABASE */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md p-4 sm:p-5 rounded-xl bg-[#080710] border border-purple-950/80 shadow-2xl space-y-3.5 text-left">
            <div className="flex items-center justify-between border-b border-purple-950/40 pb-2.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-purple-400" />
                Criar Nova Demanda no Supabase
              </h3>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">
                  Título da Tarefa
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ex.: Desenvolver landing page de captação"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-xs text-white focus:outline-none focus:border-purple-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">
                  Descrição detalhada
                </label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Detalhes para o agente que assumir a tarefa..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-xs text-white focus:outline-none focus:border-purple-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs text-zinc-300 font-medium block mb-1">
                    Atribuir Agente
                  </label>
                  <select
                    value={newTaskAgent}
                    onChange={(e) => setNewTaskAgent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-xs text-purple-200 focus:outline-none"
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-medium block mb-1">
                    Prioridade
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-xs text-purple-200 focus:outline-none"
                  >
                    <option value="urgente">Urgente</option>
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTask || !newTaskTitle.trim()}
                  className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                >
                  {isCreatingTask ? 'Salvando...' : 'Gravar no Supabase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
