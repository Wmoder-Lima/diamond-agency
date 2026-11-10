export interface Agent {
  id: string;
  name: string;
  role: string;
  department: 'diretoria' | 'tecnologia' | 'marketing' | 'comercial';
  status: 'working' | 'idle' | 'waiting' | 'offline';
  specialty: string;
  avatarColor: string;
  tasksCompleted: number;
  currentTask?: string;
  bio: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  department: string;
  assigned_agent: string;
  created_by: string;
  status: 'todo' | 'doing' | 'review' | 'blocked' | 'done';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  result?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface Message {
  id: string;
  from_agent: string;
  to_agent: string;
  content: string;
  created_at: string;
  category?: 'code' | 'strategy' | 'handoff' | 'alert';
}

export interface Approval {
  id: string;
  agent_id: string;
  action: string;
  details: {
    texto?: string;
    impact?: 'baixo' | 'medio' | 'alto' | 'critico';
    budget?: string;
    channel?: string;
    code_diff?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  decided_at?: string;
  decision_note?: string;
}

export interface MemoryNode {
  id: string;
  title: string;
  content: string;
  category: 'marca' | 'tecnologia' | 'estrategia' | 'processo' | 'cliente' | 'aprendizado';
  tags: string[];
  created_by: string;
  created_at: string;
  connections: string[];
  importance: number;
}

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'beatriz',
    name: 'Beatriz',
    role: 'Diretora Geral (CEO)',
    department: 'diretoria',
    status: 'working',
    specialty: 'Orquestração e Tomada de Decisão',
    avatarColor: 'from-amber-400 to-purple-600',
    tasksCompleted: 142,
    currentTask: 'Alinhamento estratégico Q4 e orquestração de squads',
    bio: 'Supervisiona a execução das metas globais da agência, prioriza demandas críticas e autoriza alocações.'
  },
  {
    id: 'helena',
    name: 'Helena',
    role: 'Diretora de Tecnologia (CTO)',
    department: 'tecnologia',
    status: 'working',
    specialty: 'Arquitetura e IA Multiagente',
    avatarColor: 'from-purple-500 to-indigo-600',
    tasksCompleted: 189,
    currentTask: 'Supervisão do cluster de modelos e pipelines de inferência',
    bio: 'Guia a esteira de desenvolvimento, garante uptime e otimização dos modelos locais e cloud.'
  },
  {
    id: 'rafael',
    name: 'Rafael',
    role: 'Arquiteto de Software',
    department: 'tecnologia',
    status: 'working',
    specialty: 'Sistemas Distribuídos & Event-Driven',
    avatarColor: 'from-cyan-400 to-blue-600',
    tasksCompleted: 114,
    currentTask: 'Refatoração da camada de mensageria assíncrona',
    bio: 'Especialista em microsserviços, latência ultrabaixa e segurança de dados.'
  },
  {
    id: 'camila',
    name: 'Camila',
    role: 'Engenheira Front-end & UI',
    department: 'tecnologia',
    status: 'working',
    specialty: 'React, Design Systems & Canvas 3D',
    avatarColor: 'from-pink-500 to-rose-600',
    tasksCompleted: 98,
    currentTask: 'Renderização do cérebro neural em canvas e microinterações',
    bio: 'Cria interfaces fluidas, acessíveis e com visual dark futurista de altíssimo impacto.'
  },
  {
    id: 'thiago',
    name: 'Thiago',
    role: 'Engenheiro Back-end',
    department: 'tecnologia',
    status: 'idle',
    specialty: 'Node.js, PostgreSQL e Segurança',
    avatarColor: 'from-violet-500 to-purple-700',
    tasksCompleted: 132,
    currentTask: 'Aguardando pull request de schema do Supabase',
    bio: 'Constrói APIs resilientes, gerenciamento de transações e conectores de dados.'
  },
  {
    id: 'bruno',
    name: 'Bruno',
    role: 'Engenheiro Fullstack',
    department: 'tecnologia',
    status: 'working',
    specialty: 'Integrações de API & Webhooks',
    avatarColor: 'from-teal-400 to-emerald-600',
    tasksCompleted: 87,
    currentTask: 'Webhook de ingestão de leads e disparos de automação',
    bio: 'Conecta serviços terceiros, pipelines e automações em ponta a ponta.'
  },
  {
    id: 'larissa',
    name: 'Larissa',
    role: 'Engenheira de QA e Validação',
    department: 'tecnologia',
    status: 'working',
    specialty: 'Testes de Regressão & Cobertura',
    avatarColor: 'from-emerald-400 to-cyan-500',
    tasksCompleted: 156,
    currentTask: 'Validação sintática e integridade do banco de dados',
    bio: 'Testes automatizados contínuos garantindo taxa de falha menor que 0.01%.'
  },
  {
    id: 'diego',
    name: 'Diego',
    role: 'Infraestrutura & Suporte Cloud',
    department: 'tecnologia',
    status: 'idle',
    specialty: 'Edge Workers, CDN & Observabilidade',
    avatarColor: 'from-blue-500 to-indigo-700',
    tasksCompleted: 64,
    currentTask: 'Monitoramento de latência Cloudflare Pages',
    bio: 'Mantém deploys ágeis, proteção DDoS e alta disponibilidade do ecossistema.'
  },
  {
    id: 'marcela',
    name: 'Marcela',
    role: 'Diretora de Marketing (CMO)',
    department: 'marketing',
    status: 'working',
    specialty: 'Growth Hacking & Branding Estratégico',
    avatarColor: 'from-fuchsia-500 to-purple-600',
    tasksCompleted: 125,
    currentTask: 'Campanha de expansão enterprise Q4',
    bio: 'Lidera estratégias de posicionamento de marca, funis de atração e aquisição de clientes.'
  },
  {
    id: 'lucas',
    name: 'Lucas',
    role: 'Brand & Creative Designer',
    department: 'marketing',
    status: 'working',
    specialty: 'Identidade Visual Cyberpunk & 3D Assets',
    avatarColor: 'from-purple-400 to-pink-600',
    tasksCompleted: 110,
    currentTask: 'Assets holográficos e animações de partículas',
    bio: 'Concepção de arte visual futurista e identidades visuais de luxo para a agência.'
  },
  {
    id: 'paula',
    name: 'Paula',
    role: 'Especialista em CRM & LTV',
    department: 'marketing',
    status: 'idle',
    specialty: 'Retenção, Nutrição & Jornada do Cliente',
    avatarColor: 'from-violet-400 to-purple-500',
    tasksCompleted: 78,
    currentTask: 'Segmentação de base ativa por score de engajamento',
    bio: 'Automatiza fluxos relacionais para elevar o valor de vida útil dos clientes.'
  },
  {
    id: 'renato',
    name: 'Renato',
    role: 'Inteligência de Mercado',
    department: 'marketing',
    status: 'working',
    specialty: 'Benchmarking & Tendências de IA',
    avatarColor: 'from-indigo-400 to-purple-800',
    tasksCompleted: 92,
    currentTask: 'Varredura de competidores e precificação de serviços',
    bio: 'Scraping de mercado e análise preditiva de movimentos de concorrentes globais.'
  },
  {
    id: 'gustavo',
    name: 'Gustavo',
    role: 'Gestor de Tráfego & Mídia Paga',
    department: 'marketing',
    status: 'waiting',
    specialty: 'Meta Ads, Google Ads & Programática',
    avatarColor: 'from-orange-400 to-red-500',
    tasksCompleted: 145,
    currentTask: 'Aguardando aprovação de verba de R$ 15.000 para Ads',
    bio: 'Otimização algorítmica de ROAS em campanhas de alta escala.'
  },
  {
    id: 'nina',
    name: 'Nina',
    role: 'Criadora de Conteúdo & Viral',
    department: 'marketing',
    status: 'working',
    specialty: 'Roteiros de Alta Retenção & Reels/Shorts',
    avatarColor: 'from-yellow-400 to-pink-500',
    tasksCompleted: 88,
    currentTask: 'Batch de 10 roteiros de impacto para TikTok e LinkedIn',
    bio: 'Criação de narrativas envolventes e ganchos de alta taxa de conversão.'
  },
  {
    id: 'felipe',
    name: 'Felipe',
    role: 'SDR & Prospecção Ativa',
    department: 'comercial',
    status: 'working',
    specialty: 'Outbound Inteligente & Qualificação ICP',
    avatarColor: 'from-emerald-400 to-teal-600',
    tasksCompleted: 210,
    currentTask: 'Abordagem de 45 contas enterprise no setor financeiro',
    bio: 'Prospecção fria personalizada com IA e agendamento de reuniões qualificadas.'
  },
  {
    id: 'juliana',
    name: 'Juliana',
    role: 'Closer Executiva',
    department: 'comercial',
    status: 'working',
    specialty: 'Negociação de Alto Ticket & Propostas',
    avatarColor: 'from-teal-500 to-cyan-600',
    tasksCompleted: 167,
    currentTask: 'Negociação final do contrato Diamond Enterprise',
    bio: 'Fechamento de contratos estratégicos e resolução de objeções comerciais.'
  },
  {
    id: 'marcos',
    name: 'Marcos',
    role: 'Sucesso do Cliente & Upsell',
    department: 'comercial',
    status: 'idle',
    specialty: 'NPS, Onboarding & Expansão de Contratos',
    avatarColor: 'from-cyan-500 to-blue-700',
    tasksCompleted: 95,
    currentTask: 'Check-in de 30 dias com clientes chave',
    bio: 'Garante a entrega de valor contínua e identifica oportunidades de novos produtos.'
  },
  {
    id: 'isabela',
    name: 'Isabela',
    role: 'Apresentações & Pitch Decks',
    department: 'comercial',
    status: 'working',
    specialty: 'Storytelling Comercial & Decks de Venda',
    avatarColor: 'from-indigo-500 to-purple-600',
    tasksCompleted: 73,
    currentTask: 'Finalização do Pitch Deck para investidores Série A',
    bio: 'Desenvolve propostas comerciais visuais que convertem prospects em parceiros.'
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Renderizar o cérebro neural com sinapses em Canvas 3D',
    description: 'Criar visualização interativa de neurônios com conexões pulsantes no dashboard.',
    department: 'tecnologia',
    assigned_agent: 'camila',
    created_by: 'helena',
    status: 'doing',
    priority: 'urgente',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['UI', 'Canvas', 'Dark']
  },
  {
    id: 'task-2',
    title: 'Aprovação de orçamento para expansão de tráfego pago',
    description: 'Campanha de aquisição B2B no Google e Meta com foco em diretores de inovação.',
    department: 'marketing',
    assigned_agent: 'gustavo',
    created_by: 'marcela',
    status: 'blocked',
    priority: 'alta',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    tags: ['Ads', 'Orçamento', 'Aprovação']
  },
  {
    id: 'task-3',
    title: 'Proposta comercial Diamond Enterprise para Fintech Alpha',
    description: 'Elaboração de escopo técnico e comercial para automação de 120 processos com agentes.',
    department: 'comercial',
    assigned_agent: 'juliana',
    created_by: 'beatriz',
    status: 'doing',
    priority: 'alta',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['Vendas', 'Enterprise', 'R$ 280k']
  },
  {
    id: 'task-4',
    title: 'Pipeline de inferência paralela com fallback de latência',
    description: 'Implementar circuit breaker e redundância entre múltiplos nós de modelos.',
    department: 'tecnologia',
    assigned_agent: 'rafael',
    created_by: 'helena',
    status: 'review',
    priority: 'alta',
    result: 'Circuit breaker ativo com fallback automático em 42ms.',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    tags: ['Arquitetura', 'High Availability']
  },
  {
    id: 'task-5',
    title: 'Sequência de 10 cortes virais e scripts de alta conversão',
    description: 'Geração de roteiros de reels sobre o futuro do trabalho com multiagentes de IA.',
    department: 'marketing',
    assigned_agent: 'nina',
    created_by: 'marcela',
    status: 'done',
    priority: 'media',
    result: '10 roteiros validados e prontos para captação com índice de retenção projetado > 68%.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    tags: ['Conteúdo', 'Viral']
  },
  {
    id: 'task-6',
    title: 'Qualificação de 45 leads inbound e agendamento de demos',
    description: 'Disparar mensagens de prospecção hiper-personalizadas com inteligência de dados.',
    department: 'comercial',
    assigned_agent: 'felipe',
    created_by: 'beatriz',
    status: 'doing',
    priority: 'media',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['SDR', 'Outbound']
  },
  {
    id: 'task-7',
    title: 'Auditoria de segurança e isolamento de chaves secretas',
    description: 'Garantir que chaves service_role permaneçam estritamente no runtime local da bridge.',
    department: 'tecnologia',
    assigned_agent: 'thiago',
    created_by: 'helena',
    status: 'done',
    priority: 'urgente',
    result: '100% das chaves auditadas e isoladas com zero vazamentos em repositórios.',
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    tags: ['Segurança', 'Audit']
  },
  {
    id: 'task-8',
    title: 'Design dos selos holográficos para os agentes de elite',
    description: 'Criação da iconografia vetorial e efeitos de neon para cada departamento.',
    department: 'marketing',
    assigned_agent: 'lucas',
    created_by: 'camila',
    status: 'done',
    priority: 'baixa',
    result: 'Paleta roxo/neon estabelecida e aplicada com sucesso.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    tags: ['Design', 'Assets']
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    from_agent: 'beatriz',
    to_agent: 'helena',
    content: 'Helena, priorize a visualização do cérebro neural no dashboard. O Willy precisa de um centro de comando futurista com feedback em tempo real.',
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    category: 'strategy'
  },
  {
    id: 'msg-2',
    from_agent: 'helena',
    to_agent: 'camila',
    content: 'Camila, assuma a renderização do cérebro com Canvas e partículas interativas. Rafael já desenhou a estrutura de dados das sinapses.',
    created_at: new Date(Date.now() - 3600000 * 1.3).toISOString(),
    category: 'handoff'
  },
  {
    id: 'msg-3',
    from_agent: 'camila',
    to_agent: 'helena',
    content: 'Perfeito! Estou subindo o módulo com 60 neurônios sinápticos pulsando em roxo e ciano, com conexões dinâmicas que reagem ao mouse e cliques.',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    category: 'code'
  },
  {
    id: 'msg-4',
    from_agent: 'gustavo',
    to_agent: 'beatriz',
    content: 'Beatriz, deixei a aprovação de R$ 15k para campanhas no painel. O CAC projetado caiu 34% nos testes preliminares.',
    created_at: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    category: 'alert'
  },
  {
    id: 'msg-5',
    from_agent: 'felipe',
    to_agent: 'juliana',
    content: 'Juliana, 3 diretores de inovação aceitaram demo para quinta-feira. Já preparei os dossiês de cada empresa na memória central.',
    created_at: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    category: 'handoff'
  },
  {
    id: 'msg-6',
    from_agent: 'juliana',
    to_agent: 'isabela',
    content: 'Excelente Felipe! Isabela, por favor adapte o deck da agência com foco no ROI de automação com agentes para a reunião de quinta.',
    created_at: new Date(Date.now() - 3600000 * 0.2).toISOString(),
    category: 'strategy'
  }
];

export const MOCK_APPROVALS: Approval[] = [
  {
    id: 'appr-1',
    agent_id: 'gustavo',
    action: 'Disparo de verba em tráfego pago (R$ 15.000,00)',
    details: {
      texto: 'Campanha de atração com foco no pacote Diamond Enterprise. Retorno estimado: R$ 85.000 em pipeline.',
      impact: 'alto',
      budget: 'R$ 15.000,00',
      channel: 'Google Search + Meta Ads'
    },
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'appr-2',
    agent_id: 'rafael',
    action: 'Deploy do Cluster Multiagente em Região Frankfurt (Baixa Latência)',
    details: {
      texto: 'Migração de nós para garantir menos de 30ms de ping nas conexões de streaming de agentes.',
      impact: 'medio',
      budget: '$45/mês'
    },
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'appr-3',
    agent_id: 'juliana',
    action: 'Desconto de 12% no contrato anual da Alpha Fintech',
    details: {
      texto: 'Contrato de R$ 240.000 com fidelidade de 18 meses antecipada.',
      impact: 'alto'
    },
    status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    decided_at: new Date(Date.now() - 3600000 * 16).toISOString()
  }
];

export const MOCK_MEMORIES: MemoryNode[] = [
  {
    id: 'mem-1',
    title: 'DNA & Identidade Diamond Agency',
    content: 'Somos uma agência de elite alimentada por esquadrões de agentes autônomos que operam 24/7 com precisão cirúrgica.',
    category: 'marca',
    tags: ['cultura', 'elite', 'posicionamento'],
    created_by: 'beatriz',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    connections: ['mem-2', 'mem-3', 'mem-5'],
    importance: 98
  },
  {
    id: 'mem-2',
    title: 'Arquitetura do Cérebro Neural e Conectores',
    content: 'O sistema utiliza uma ponte RPC/Event-Driven com o banco Supabase, operando de forma assíncrona com fallback em cache local.',
    category: 'tecnologia',
    tags: ['arquitetura', 'ia', 'supabase', 'bridge'],
    created_by: 'helena',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    connections: ['mem-1', 'mem-4'],
    importance: 95
  },
  {
    id: 'mem-3',
    title: 'Playbook de Vendas: Diamond Enterprise',
    content: 'Foco exclusivo em empresas de faturamento superior a R$ 10M/ano que necessitam de escala de automação com multiagentes.',
    category: 'estrategia',
    tags: ['vendas', 'b2b', 'enterprise', 'icp'],
    created_by: 'juliana',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    connections: ['mem-1', 'mem-6'],
    importance: 89
  },
  {
    id: 'mem-4',
    title: 'Políticas de Risco e Aprovações Human-in-the-loop',
    content: 'Qualquer transação financeira acima de R$ 500 ou modificação de infraestrutura crítica deve obrigatoriamente passar por aprovação humana no dashboard.',
    category: 'processo',
    tags: ['governanca', 'seguranca', 'humano'],
    created_by: 'beatriz',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    connections: ['mem-2'],
    importance: 92
  },
  {
    id: 'mem-5',
    title: 'Estilo Visual Dark Futurista & Paleta Neon Violeta',
    content: 'A interface deve transmitir autoridade cibernética: fundos escuros profundos, reflexos violetas, gradientes ciano/roxo e animações de alta performance.',
    category: 'marca',
    tags: ['design', 'ui', 'futurista', 'dark'],
    created_by: 'camila',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    connections: ['mem-1'],
    importance: 85
  },
  {
    id: 'mem-6',
    title: 'Matriz de Handoff entre Agentes',
    content: 'Prospecção (Felipe) → Qualificação (Juliana) → Apresentação (Isabela) → Onboarding (Marcos) com dados compartilhados instantaneamente.',
    category: 'processo',
    tags: ['squad', 'fluxo', 'automacao'],
    created_by: 'beatriz',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    connections: ['mem-3'],
    importance: 88
  }
];

export const MOCK_METRICS = {
  efficiency: 94.6,
  throughputPerHour: 342,
  tokensProcessed: '14.8M',
  costSavedBRL: 'R$ 48.750',
  activeSynapses: 1248,
  averageResponseTimeMs: 140,
  dailyThroughput: [
    { hour: '00h', tasks: 12, tokens: 420 },
    { hour: '03h', tasks: 18, tokens: 680 },
    { hour: '06h', tasks: 35, tokens: 1200 },
    { hour: '09h', tasks: 84, tokens: 2850 },
    { hour: '12h', tasks: 96, tokens: 3400 },
    { hour: '15h', tasks: 112, tokens: 4100 },
    { hour: '18h', tasks: 89, tokens: 3100 },
    { hour: '21h', tasks: 64, tokens: 2200 }
  ],
  departmentLoads: [
    { dept: 'Tecnologia', load: 78, agents: 6, color: '#a855f7' },
    { dept: 'Comercial', load: 64, agents: 4, color: '#06b6d4' },
    { dept: 'Marketing', load: 82, agents: 6, color: '#ec4899' },
    { dept: 'Diretoria', load: 45, agents: 1, color: '#eab308' }
  ]
};
