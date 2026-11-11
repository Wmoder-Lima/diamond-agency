type BrainNodeKind = 'agent' | 'memory' | 'task' | 'approval' | 'service' | 'message' | 'structure' | 'cluster';

export interface BrainNode {
  id: string;
  entityId?: string;
  kind: BrainNodeKind;
  name: string;
  label?: string;
  x: number;
  y: number;
  z: number;
  fx: number;
  fy: number;
  fz: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  phase: number;
  color: string;
  size: number;
  [key: string]: any;
}

export interface BrainLink {
  source: string;
  target: string;
  structural: boolean;
  relation?: 'sector' | 'task' | 'approval' | 'service' | 'memory' | 'message';
  label?: string;
  active?: boolean;
}

const REGIONS = [
  { id: 'agents', name: 'AGENTES', x: 0, y: 22, z: 0 },
  { id: 'operation', name: 'OPERAÇÃO', x: -62, y: -8, z: 0 },
  { id: 'approvals', name: 'PENDÊNCIAS', x: 0, y: -40, z: 0 },
  { id: 'service', name: 'CLIENTES AO VIVO', x: 62, y: -8, z: 0 },
  { id: 'memory', name: 'MEMÓRIA', x: 0, y: 0, z: 0 },
] as const;

function hash(value: string): number {
  let result = 2166136261;
  for (let i = 0; i < value.length; i++) result = Math.imul(result ^ value.charCodeAt(i), 16777619);
  return result >>> 0;
}
function unit(seed: string): number { return hash(seed) / 4294967296; }
function compareText(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
function finite(value: any, fallback = 0): number { return Number.isFinite(value) ? value : fallback; }
function records(input: any, cap = 1000): any[] {
  if (!Array.isArray(input)) return [];
  const found = new Map<string, any>();
  for (const record of input) {
    if (!record || (typeof record.id !== 'string' && typeof record.id !== 'number')) continue;
    const id = String(record.id);
    if (id && !found.has(id)) found.set(id, record);
  }
  return [...found.entries()].sort(([a], [b]) => compareText(a, b)).slice(0, cap).map(([, r]) => r);
}
function pointFor(id: string, regionId: string) {
  const region = REGIONS.find(item => item.id === regionId) || REGIONS[0];
  // Gaussian-like cloud around each operational region; fixed hash preserves layout.
  const angle = unit(`${id}:angle`) * Math.PI * 2;
  const radius = Math.sqrt(unit(`${id}:radius`));
  const x = region.x + Math.cos(angle) * radius * 30;
  const y = region.y + Math.sin(angle) * radius * 29;
  const z = (unit(`${id}:depth`) - 0.5) * 24;
  return { x: finite(x), y: finite(y), z: finite(z) };
}
function anchored(id: string, kind: BrainNodeKind, name: string, position: { x: number; y: number; z: number }, data: any = {}): BrainNode {
  const color: Record<BrainNodeKind, string> = {
    agent: '#c1b6ff', memory: '#8ec9a7', task: '#70d5ee', approval: '#ffc779',
    service: '#ff9fca', message: '#fff2c5', structure: '#99959f', cluster: '#e7e3f0',
  };
  const size: Record<BrainNodeKind, number> = {
    agent: 13, memory: 3.2, task: 8, approval: 9, service: 10, message: 5, structure: 0.32, cluster: 0.1,
  };
  const p = { x: finite(position.x), y: finite(position.y), z: finite(position.z) };
  return { ...data, id, kind, name, ...p, fx: p.x, fy: p.y, fz: p.z,
    baseX: p.x, baseY: p.y, baseZ: p.z, phase: unit(`${id}:phase`) * Math.PI * 2,
    color: color[kind], size: size[kind] };
}


function timestamp(record: any): number {
  for (const value of [record?.updated_at, record?.created_at]) {
    if (value == null || value === '') continue;
    const parsed = typeof value === 'number' ? value : Date.parse(String(value));
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}
function newest(input: any[]): any[] {
  return records(input).sort((a, b) => timestamp(b) - timestamp(a) || compareText(String(a?.id ?? ''), String(b?.id ?? '')));
}
export function getAgentActivity(agentId: string, tasks: any[], events: any[], messages: any[], approvals: any[]): {
  currentTask: any | null; tasks: any[]; latestEvent: any | null; recentMessages: any[]; pendingApprovals: any[]; summary: string;
} {
  const matches = (value: any) => value != null && String(value) === agentId;
  const agentTasks = newest((tasks ?? []).filter(task => task && matches(task.assigned_agent)));
  const priority: Record<string, number> = { doing: 0, blocked: 1, review: 2, todo: 3 };
  const activeTasks = agentTasks.filter(task => Object.prototype.hasOwnProperty.call(priority, task.status));
  activeTasks.sort((a, b) => priority[a.status] - priority[b.status] || timestamp(b) - timestamp(a) || compareText(String(a.id ?? ''), String(b.id ?? '')));
  const currentTask = activeTasks[0] ?? null;
  const latestEvent = newest((events ?? []).filter(event => event && matches(event.agent_id)))[0] ?? null;
  const recentMessages = newest((messages ?? []).filter(message => message && (matches(message.from_agent) || matches(message.to_agent)))).slice(0, 10);
  const pendingApprovals = newest((approvals ?? []).filter(approval => approval && matches(approval.agent_id) && approval.status === 'pending'));
  const labels: Record<string, string> = { doing: 'Em andamento', blocked: 'Bloqueada', review: 'Em revisão', todo: 'A fazer' };
  const summaryParts = [currentTask ? `${labels[currentTask.status]}: ${String(currentTask.title || currentTask.name || 'Tarefa sem título')}.` : 'Nenhuma tarefa ativa nos registros carregados.'];
  if (pendingApprovals.length) summaryParts.push(`${pendingApprovals.length} aprovação(ões) pendente(s).`);
  if (latestEvent) summaryParts.push('Há evento registrado.');
  if (recentMessages.length) summaryParts.push(`${recentMessages.length} mensagem(ns) recente(s).`);
  return { currentTask, tasks: agentTasks, latestEvent, recentMessages, pendingApprovals, summary: summaryParts.join(' ') };
}

export function createDemoData(step: number): {
  agents: any[]; tasks: any[]; events: any[]; messages: any[]; approvals: any[]; memories: any[]; services: any[];
} {
  const n = Number.isFinite(step) ? Math.max(0, Math.floor(step)) : 0;
  const agents = [
    ['ana', 'Ana Martins', 'Diretora de Operações', 'operations'], ['bruno', 'Bruno Costa', 'Engenheiro de Software', 'technology'],
    ['camila', 'Camila Rocha', 'Estrategista de Marketing', 'marketing'], ['diego', 'Diego Lima', 'Analista Financeiro', 'finance'],
    ['elisa', 'Elisa Nunes', 'Executiva Comercial', 'sales'], ['felipe', 'Felipe Alves', 'Especialista de CRM', 'marketing'],
    ['giovana', 'Giovana Souza', 'Designer de Marca', 'creative'], ['henrique', 'Henrique Melo', 'Sucesso do Cliente', 'customer-success'],
  ].map(([slug, name, role, department], index) => ({ id: `demo-agent-${slug}`, name, role, department, status: index === n % 8 ? 'working' : 'idle' }));
  const taskTitles = [
    'Revisar briefing de campanha', 'Preparar análise de concorrentes', 'Ajustar fluxo de onboarding', 'Conferir projeção mensal',
    'Validar landing page', 'Organizar calendário editorial', 'Revisar proposta comercial', 'Atualizar identidade visual',
    'Analisar métricas de aquisição', 'Preparar pauta de reunião', 'Documentar processo de atendimento', 'Revisar automação de CRM',
    'Consolidar feedback de clientes', 'Planejar conteúdo da semana', 'Validar integração de dados', 'Montar relatório de desempenho',
    'Acompanhar renovação de contrato', 'Refinar segmentação de leads', 'Conferir entregáveis do projeto', 'Preparar plano de próximos passos',
  ];
  const tasks = taskTitles.map((title, i) => {
    const status = i === n % taskTitles.length ? 'doing' : i % 7 === 0 ? 'review' : i % 5 === 0 ? 'blocked' : i % 4 === 0 ? 'done' : 'todo';
    return { id: `demo-task-${String(i + 1).padStart(2, '0')}`, title, assigned_agent: agents[i % agents.length].id,
      status, updated_at: new Date(Date.UTC(2025, 0, 1 + i + n)).toISOString() };
  });
  const approvals = [
    ['campaign', 'Aprovar verba de campanha', 2], ['proposal', 'Validar proposta de parceria', 4],
    ['design', 'Aprovar conceito visual', 6], ['budget', 'Revisar orçamento do projeto', 3], ['renewal', 'Confirmar condição de renovação', 7],
  ].map(([key, action, agent]) => ({ id: `demo-approval-${key}`, action, agent_id: agents[Number(agent)].id, status: 'pending' }));
  const services = [
    ['aurora', 'Plano de lançamento', 'Aurora Café', 2, 'Alinhamento do lançamento e canais prioritários.'],
    ['norte', 'Revisão de marca', 'Norte Studio', 6, 'Coleta de referências e revisão da identidade.'],
    ['flora', 'Onboarding CRM', 'Flora Viva', 5, 'Configuração inicial da jornada de relacionamento.'],
    ['atlas', 'Acompanhamento mensal', 'Atlas Educação', 7, 'Revisão de resultados e próximos objetivos.'],
  ].map(([id, title, client, agent, summary]) => ({ id: `demo-service-${id}`, title, client, agent_id: agents[Number(agent)].id, status: 'active', summary }));
  const memories = [
    ['tone', 'Tom de voz acolhedor e direto para comunicação com clientes.', 5],
    ['campaign', 'Priorizar clareza da oferta e uma chamada para ação por peça.', 2],
    ['onboarding', 'Na primeira semana, combinar objetivos e responsáveis com o cliente.', 7],
    ['reporting', 'Apresentar métricas junto com contexto e recomendação prática.', 3],
    ['design', 'Manter contraste alto e hierarquia visual simples nos materiais.', 6],
    ['sales', 'Registrar objeções e acordos logo após cada conversa comercial.', 4],
  ].map(([id, content, agent]) => ({ id: `demo-memory-${id}`, title: String(id), content, created_by: agents[Number(agent)].id }));
  const activityTask = tasks[n % tasks.length];
  const events = [{ id: `demo-event-step-${n}`, agent_id: activityTask.assigned_agent, summary: `Atualizou “${activityTask.title}” para ${activityTask.status}.`, created_at: new Date(Date.UTC(2025, 0, 1 + n)).toISOString() }];
  const messages = [{ id: `demo-message-step-${n}`, from_agent: activityTask.assigned_agent,
    to_agent: agents[(n + 1) % agents.length].id, content: `Atualização: “${activityTask.title}” está ${activityTask.status}.`,
    created_at: new Date(Date.UTC(2025, 0, 1 + n)).toISOString() }];
  return { agents, tasks, events, messages, approvals, memories, services };
}

export function buildBrainGraph(
  agentsInput: any[], memoriesInput: any[], tasksInput: any[] = [], approvalsInput: any[] = [],
  messagesInput: any[] = [], servicesInput: any[] = [],
): { nodes: BrainNode[]; links: BrainLink[] } {
  const nodes: BrainNode[] = [];
  const links: BrainLink[] = [];
  const agentRecords = records(agentsInput, 100);
  const memoryRecords = records(memoriesInput, 100);
  const taskRecords = records(tasksInput, 250);
  const approvalRecords = records(approvalsInput, 100);
  const messageRecords = records(messagesInput, 40);
  const serviceRecords = records(servicesInput, 100);
  const departments = [...new Set(agentRecords.map(agent => String(agent.department || 'geral'))) ];
  const labels: Record<string, string> = {
    operations: 'Operações', technology: 'Tecnologia', marketing: 'Marketing', finance: 'Financeiro',
    sales: 'Comercial', creative: 'Criação', 'customer-success': 'Sucesso do cliente',
    diretoria: 'Diretoria', tecnologia: 'Tecnologia', comercial: 'Comercial', geral: 'Geral',
  };
  const positions = new Map<string, { x: number; y: number; z: number }>();
  departments.forEach((department, index) => {
    const angle = Math.PI * 0.12 + (index / Math.max(1, departments.length)) * Math.PI * 2;
    const center = { x: Math.cos(angle) * 86, y: Math.sin(angle) * 61, z: -8 };
    nodes.push(anchored(`cluster:sector:${department}`, 'cluster', labels[department] || department,
      { ...center, y: center.y + 24 }, { label: labels[department] || department }));
    const members = agentRecords.filter(agent => String(agent.department || 'geral') === department);
    members.forEach((agent, memberIndex) => {
      const ring = (memberIndex / Math.max(1, members.length)) * Math.PI * 2;
      const position = { x: center.x + Math.cos(ring) * 17, y: center.y + Math.sin(ring) * 14, z: 10 };
      positions.set(String(agent.id), position);
      nodes.push(anchored(`agent:${agent.id}`, 'agent', String(agent.name || 'Agente'), position, { ...agent, entityId: String(agent.id) }));
      links.push({ source: `agent:${agent.id}`, target: `cluster:sector:${department}`, structural: true, relation: 'sector', label: labels[department] || department });
    });
  });
  const add = (record: any, kind: 'task' | 'approval' | 'service' | 'memory', owner: unknown, index: number) => {
    const base = positions.get(String(owner));
    const fallback = pointFor(`${kind}:${record.id}`, kind === 'service' ? 'service' : kind === 'approval' ? 'approvals' : kind === 'memory' ? 'memory' : 'operation');
    const angle = unit(`${kind}:${record.id}`) * Math.PI * 2 + index * 2.4;
    const distance = kind === 'service' ? 47 : kind === 'approval' ? 38 : kind === 'memory' ? 30 : 24 + (index % 4) * 9;
    const position = base ? { x: base.x + Math.cos(angle) * distance, y: base.y + Math.sin(angle) * distance, z: (kind === 'service' ? 22 : kind === 'task' ? 5 : -5) + (index % 3) * 7 } : fallback;
    const name = String(record.title || record.action || 'Registro');
    nodes.push(anchored(`${kind}:${record.id}`, kind, name, position, { ...record, entityId: String(record.id) }));
    if (base) links.push({ source: `agent:${owner}`, target: `${kind}:${record.id}`, structural: false, relation: kind, active: kind === 'task' ? record.status === 'doing' : kind === 'service' });
  };
  taskRecords.forEach((record, index) => add(record, 'task', record.assigned_agent, index));
  approvalRecords.forEach((record, index) => add(record, 'approval', record.agent_id, index));
  serviceRecords.forEach((record, index) => add(record, 'service', record.agent_id, index));
  memoryRecords.forEach((record, index) => add(record, 'memory', record.created_by, index));
  messageRecords.forEach((message, index) => {
    const from = positions.get(String(message.from_agent));
    const to = positions.get(String(message.to_agent));
    if (!from && !to) return;
    const anchor = from || to!;
    const position = to && from
      ? { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 + 12 + (index % 3) * 7, z: 24 + (index % 4) * 5 }
      : { x: anchor.x + 24, y: anchor.y + 22, z: 24 };
    const content = String(message.content || 'Conversa');
    nodes.push(anchored(`message:${message.id}`, 'message', content.slice(0, 36), position, { ...message, entityId: String(message.id) }));
    if (from) links.push({ source: `agent:${message.from_agent}`, target: `message:${message.id}`, structural: false, relation: 'message', active: true, label: 'mensagem enviada' });
    if (to) links.push({ source: `message:${message.id}`, target: `agent:${message.to_agent}`, structural: false, relation: 'message', active: true, label: 'mensagem recebida' });
    if (from && to && String(message.from_agent) !== String(message.to_agent)) links.push({ source: `agent:${message.from_agent}`, target: `agent:${message.to_agent}`, structural: false, relation: 'message', active: true, label: 'conversa registrada' });
  });
  for (let i = 0; i < 240; i++) {
    const theta = i * 2.399963;
    const radius = 122 + unit(String(i)) * 22;
    const point = { x: Math.cos(theta) * radius, y: Math.sin(theta) * radius * 0.76, z: -35 + unit(`z:${i}`) * 36 };
    nodes.push(anchored(`structure:${i}`, 'structure', 'Ambientação', point, { size: 0.045 }));
  }
  const ids = new Set(nodes.map(node => node.id));
  return { nodes, links: links.filter(link => ids.has(link.source) && ids.has(link.target)) };
}
