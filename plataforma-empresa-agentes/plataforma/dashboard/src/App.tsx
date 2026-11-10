import React, { useState, useMemo } from 'react';
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
import { 
  MOCK_AGENTS, 
  MOCK_TASKS, 
  MOCK_APPROVALS, 
  MOCK_MEMORIES, 
  MOCK_METRICS,
  Agent,
  Task,
  Approval,
  MemoryNode
} from './data/mockData';
import { useTable, configured, supabase } from './supabase';
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
  Settings2
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('geral');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('todos');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Conexão Supabase com fallback seguro
  const liveTasks = useTable<any>('tasks', 'updated_at');
  const liveAgents = useTable<any>('agents', 'name');
  const liveApprovals = useTable<any>('approvals');

  // Estados locais
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [approvals, setApprovals] = useState<Approval[]>(MOCK_APPROVALS);
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAgent, setNewTaskAgent] = useState('camila');
  const [newTaskPriority, setNewTaskPriority] = useState<'baixa' | 'media' | 'alta' | 'urgente'>('alta');

  const displayTasks = useMemo(() => {
    if (liveTasks.rows && liveTasks.rows.length > 0) return liveTasks.rows;
    return tasks;
  }, [liveTasks.rows, tasks]);

  const displayAgents = useMemo(() => {
    if (liveAgents.rows && liveAgents.rows.length > 0) return liveAgents.rows;
    return agents;
  }, [liveAgents.rows, agents]);

  const displayApprovals = useMemo(() => {
    if (liveApprovals.rows && liveApprovals.rows.length > 0) return liveApprovals.rows;
    return approvals;
  }, [liveApprovals.rows, approvals]);

  const pendingApprovals = displayApprovals.filter((a) => a.status === 'pending');
  const activeAgentsCount = displayAgents.filter((a) => a.status === 'working').length;

  const handleDecideApproval = (id: string, decision: 'approved' | 'rejected') => {
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: decision,
              decided_at: new Date().toISOString(),
              decision_note: decision === 'approved' ? 'Aprovado via Central Executiva' : 'Rejeitado para revisão técnica'
            }
          : a
      )
    );
    if (configured) {
      supabase
        .from('approvals')
        .update({ status: decision, decided_at: new Date().toISOString() })
        .eq('id', id);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const agentObj = agents.find((a) => a.id === newTaskAgent);
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: 'Demanda despachada para a skill correspondente.',
      department: agentObj?.department || 'tecnologia',
      assigned_agent: newTaskAgent,
      created_by: 'beatriz',
      status: 'doing',
      priority: newTaskPriority,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ['Claude Skill', 'Prioritário']
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle('');
    setShowNewTaskModal(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#030206] text-zinc-100 font-sans selection:bg-purple-900 selection:text-white">
      {/* Menu Lateral Responsivo com Drawer Mobile */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingApprovalsCount={pendingApprovals.length}
        activeAgentsCount={activeAgentsCount}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Conteúdo Central */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#030206]">
        {/* Header Superior com Botão de Menu Mobile */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          pendingApprovalsCount={pendingApprovals.length}
          onOpenApprovals={() => setCurrentTab('aprovacoes')}
          onToggleMobileMenu={() => setMobileMenuOpen((o) => !o)}
        />

        {/* Sub-Header com Status de Skills */}
        <div className="px-3 sm:px-6 py-1.5 bg-[#07060c] border-b border-purple-950/40 flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 text-left gap-1 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-mono text-zinc-300 truncate">CLAUDE CODE RUNTIME</span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline">18 skills ativas via CLI</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-500 font-mono text-[9px] sm:text-[10px]">
            <span className="hidden md:inline">bridge/empresa.mjs</span>
            <span className="text-zinc-400">Supabase Sync</span>
          </div>
        </div>

        {/* Conteúdo com Scroll e Padding Adaptativo */}
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
                      PAINEL DE SKILLS CLAUDE CODE
                    </span>
                  </div>
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight">
                    Orquestração das Skills Diamond
                  </h1>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 max-w-2xl">
                    18 skills autônomas executando rotinas e registrando tarefas e métricas na central.
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

              {/* Grid 4 KPIs Responsivo (2 colunas em mobile, 4 em desktop) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-xl bg-[#080710] border border-purple-950/50 text-left">
                  <div className="flex items-center justify-between text-zinc-500 mb-1 sm:mb-2">
                    <span className="text-[11px] sm:text-xs font-medium">Skills Ativas</span>
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="flex items-baseline gap-1 sm:gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                      {activeAgentsCount}
                    </span>
                    <span className="text-[10px] sm:text-xs text-zinc-500">/ 18</span>
                  </div>
                  <div className="mt-1 text-[10px] text-zinc-400 font-mono truncate">
                    Claude Code CLI
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-[#080710] border border-purple-950/50 text-left">
                  <div className="flex items-center justify-between text-zinc-500 mb-1 sm:mb-2">
                    <span className="text-[11px] sm:text-xs font-medium">Em Execução</span>
                    <Activity className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="flex items-baseline gap-1 sm:gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                      {displayTasks.filter((t: any) => t.status === 'doing').length}
                    </span>
                    <span className="text-[10px] sm:text-xs text-zinc-500">tarefas</span>
                  </div>
                  <div className="mt-1 text-[10px] text-zinc-400 font-mono truncate">
                    +14 entregues
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
                    <span className="text-[11px] sm:text-xs font-medium">Throughput</span>
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="flex items-baseline gap-1 sm:gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                      {MOCK_METRICS.efficiency}%
                    </span>
                    <span className="text-[10px] sm:text-xs text-emerald-400 font-mono">Estável</span>
                  </div>
                  <div className="mt-1 text-[10px] text-zinc-500 font-mono truncate">
                    {MOCK_METRICS.costSavedBRL}
                  </div>
                </div>
              </div>

              {/* CÉREBRO VIRTUAL INTERATIVO */}
              <div className="space-y-2">
                <NeuralBrainCanvas />
              </div>

              {/* Gráficos Responsivos */}
              <MetricsCharts />

              {/* Feed Live Comms e Agentes Recentes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                  <LiveCommsFeed />
                </div>

                {/* Radar de Skills */}
                <div className="rounded-xl bg-[#080710] border border-purple-950/50 p-4 flex flex-col text-left">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-950/40">
                    <h3 className="text-xs font-semibold text-white tracking-wide">
                      Skills de Agentes Recentes
                    </h3>
                    <button
                      onClick={() => setCurrentTab('agentes')}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                    >
                      Ver 18
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto">
                    {agents.slice(0, 5).map((agent) => (
                      <div
                        key={agent.id}
                        className="p-2.5 rounded-lg bg-[#0c0a15] border border-purple-950/40 flex items-start gap-2.5"
                      >
                        <AgentAvatar agent={agent} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-semibold text-white truncate">
                              {agent.name}
                            </h4>
                            <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                              {agent.tasksCompleted} entregas
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {agent.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* ABA 2: QUADRO DE TAREFAS (KANBAN DESLIZÁVEL NO MOBILE)     */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentTab === 'tarefas' && (
            <div className="space-y-4 sm:space-y-5 max-w-7xl mx-auto text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Quadro Operacional de Tarefas
                  </h2>
                  <p className="text-[11px] sm:text-xs text-zinc-400">
                    Demandas das skills • Deslize horizontalmente para navegar entre as colunas
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

              {/* Colunas do Kanban: Deslize horizontal (snap) no mobile, Grid em Desktop */}
              <div className="flex overflow-x-auto snap-x space-x-3 md:space-x-0 md:grid md:grid-cols-5 md:gap-3.5 pb-3 scrollbar-thin">
                {[
                  { id: 'todo', label: 'A Fazer' },
                  { id: 'doing', label: 'Em Execução' },
                  { id: 'review', label: 'Revisão Técnica' },
                  { id: 'blocked', label: 'Bloqueadas' },
                  { id: 'done', label: 'Concluídas' }
                ].map((col) => {
                  const colTasks = displayTasks.filter((t: any) => t.status === col.id);

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
                        {colTasks.map((t: any) => {
                          const assigned = agents.find((a) => a.id === t.assigned_agent);

                          return (
                            <div
                              key={t.id}
                              className="p-3 rounded-lg bg-[#0b0914] border border-purple-950/60 hover:border-purple-800/40 transition-all space-y-2 text-left"
                            >
                              <div className="flex items-center justify-between gap-1 text-[9px] font-mono text-zinc-500">
                                <span className="uppercase text-purple-400">{t.priority}</span>
                                <span className="truncate">{t.department}</span>
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
                                    onClick={() => {
                                      setTasks((prev) =>
                                        prev.map((item) =>
                                          item.id === t.id ? { ...item, status: 'done', result: 'Finalizado com sucesso pelo painel.' } : item
                                        )
                                      );
                                    }}
                                    className="p-1 rounded bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 text-[10px] shrink-0"
                                    title="Concluir"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
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
              <LiveCommsFeed />
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* ABA 4: CENTRAL DE APROVAÇÕES                               */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentTab === 'aprovacoes' && (
            <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 text-left">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  Central de Decisões & Aprovações Human-in-the-Loop
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-400">
                  Ações de impacto sensível executadas pelas skills aguardam autorização prévia
                </p>
              </div>

              <div className="space-y-3">
                {pendingApprovals.length === 0 ? (
                  <div className="p-6 rounded-xl bg-[#080710] border border-purple-950/50 text-center text-zinc-500 text-xs">
                    Nenhuma solicitação pendente no momento. As skills estão liberadas.
                  </div>
                ) : (
                  pendingApprovals.map((appr: any) => {
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
                                {agent ? agent.name : appr.agent_id} solicitou autorização:
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
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* ABA 5: SKILLS & AGENTES DO CLAUDE                          */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentTab === 'agentes' && (
            <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    18 Skills Instaladas no Claude Code
                  </h2>
                  <p className="text-[11px] sm:text-xs text-zinc-400">
                    Módulos executáveis e especializações cognitivas registradas na ponte CLI
                  </p>
                </div>

                {/* Filtro por Departamento com rolagem horizontal em mobile */}
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

              {/* Grid 18 Agentes Responsivo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {agents
                  .filter((a) => selectedDeptFilter === 'todos' || a.department === selectedDeptFilter)
                  .map((agent) => (
                    <div
                      key={agent.id}
                      className="p-3.5 sm:p-4 rounded-xl bg-[#080710] border border-purple-950/50 hover:border-purple-900/40 transition-all flex flex-col justify-between text-left"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <AgentAvatar agent={agent} size="md" />
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#0e0c18] border border-purple-950/60 text-purple-300 capitalize">
                            {agent.department}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-white">
                          {agent.name}
                        </h3>
                        <p className="text-xs text-purple-400 mb-1.5 font-medium">
                          {agent.role}
                        </p>
                        <p className="text-[11px] text-zinc-400 leading-relaxed mb-2.5">
                          {agent.bio}
                        </p>

                        <div className="p-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-[10px] sm:text-[11px] text-zinc-300 mb-2.5">
                          <span className="text-zinc-500 block text-[9px] font-mono uppercase">Especialidade</span>
                          {agent.specialty}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-purple-950/40 flex items-center justify-between text-xs">
                        <span className="text-zinc-500 font-mono text-[10px]">
                          {agent.tasksCompleted} entregas
                        </span>
                        <button
                          onClick={() => setCurrentTab('conversas')}
                          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                        >
                          Conversar
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* ABA 6: MEMÓRIA & SINAPSES                                  */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentTab === 'cerebro' && (
            <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto text-left">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  Memória Central & Grafo de Conhecimento
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-400">
                  Base de dados semântica compartilhada entre as skills do Claude
                </p>
              </div>

              <NeuralBrainCanvas />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MOCK_MEMORIES.map((mem) => (
                  <div
                    key={mem.id}
                    className="p-3.5 rounded-xl bg-[#080710] border border-purple-950/50 space-y-2 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#0e0c18] border border-purple-950 text-purple-300">
                        {mem.category}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        Relevância: {mem.importance}%
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-white">
                      {mem.title}
                    </h4>

                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {mem.content}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {mem.tags.map((t) => (
                        <span key={t} className="text-[9px] text-purple-400 font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* ABA 7: MÉTRICAS & TELEMETRIA                               */}
          {/* ─────────────────────────────────────────────────────────── */}
          {currentTab === 'metricas' && (
            <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto text-left">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  Telemetria de Inferência e Volume
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-400">
                  Desempenho operacional e tempo de resposta das skills
                </p>
              </div>

              <MetricsCharts />
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

      {/* MODAL DE CRIAÇÃO RÁPIDA DE TAREFA */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md p-4 sm:p-5 rounded-xl bg-[#080710] border border-purple-950/80 shadow-2xl space-y-3.5 text-left">
            <div className="flex items-center justify-between border-b border-purple-950/40 pb-2.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-purple-400" />
                Despachar Demanda para Skill do Claude
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
                  Título da Demanda
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ex.: Auditoria de segurança de chaves API"
                  className="w-full px-3 py-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-xs text-white focus:outline-none focus:border-purple-600"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs text-zinc-300 font-medium block mb-1">
                    Atribuir à Skill
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
                  className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Despachar Demanda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
