import React, { Component, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ForceGraphMethods } from 'react-force-graph-3d';
import { Activity, AlertCircle, Bot, BriefcaseBusiness, Check, Clock3, Maximize2, Pause, Play, Radio, Sparkles, X } from 'lucide-react';
import { buildBrainGraph, createDemoData, getAgentActivity, type BrainNode } from './brainModel';

const ForceGraph3D = lazy(() => import('react-force-graph-3d'));
const EMPTY: any[] = [];
const STATUS: Record<string, string> = {
  working: 'Em atividade', idle: 'Disponível', waiting: 'Aguardando', offline: 'Offline',
  todo: 'A fazer', doing: 'Em execução', blocked: 'Bloqueada', review: 'Em revisão',
  done: 'Concluída', cancelled: 'Cancelada', pending: 'Aguardando decisão', active: 'Em atendimento',
};
const KIND: Record<string, string> = {
  agent: 'Agente', task: 'Tarefa', approval: 'Pendência', service: 'Atendimento', memory: 'Memória', message: 'Conversa', cluster: 'Setor',
};

interface KnowledgeGraphProps {
  memories?: any[]; agents?: any[]; tasks?: any[]; events?: any[]; messages?: any[]; approvals?: any[];
  services?: any[]; dataWarning?: string | null; demo?: boolean; onDemoChange?: (value: boolean) => void;
  onSelectNode?: (node: any) => void;
}
class GraphBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed
      ? <div role="status" className="h-full flex items-center justify-center p-8 text-center text-sm text-zinc-300">A visualização 3D não está disponível neste navegador. Use a lista operacional abaixo.</div>
      : this.props.children;
  }
}
function dateLabel(value: unknown) {
  if (typeof value !== 'string') return 'Horário não informado';
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString('pt-BR') : 'Horário não informado';
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  memories = EMPTY, agents = EMPTY, tasks = EMPTY, events = EMPTY, messages = EMPTY,
  approvals = EMPTY, services = EMPTY, dataWarning, demo = false, onDemoChange, onSelectNode,
}) => {
  const [demoStep, setDemoStep] = useState(0);
  const demoData = useMemo(() => demo ? createDemoData(demoStep) : null, [demo, demoStep]);
  const live = demoData || { agents, memories, tasks, events, messages, approvals, services };
  const graph = useMemo(() => buildBrainGraph(
    live.agents, live.memories, live.tasks, live.approvals, live.messages, live.services,
  ), [live.agents, live.memories, live.tasks, live.approvals, live.messages, live.services]);

  const fgRef = useRef<ForceGraphMethods<any> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const labelElements = useRef(new Map<string, HTMLSpanElement>());
  const selectionTrigger = useRef<HTMLElement | null>(null);
  const initialized = useRef(false);
  const motionRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controlsRef = useRef<any>(null);
  const controlsHandlers = useRef<{ start: () => void; end: () => void } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 560 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [motion, setMotion] = useState(true);

  const selected = graph.nodes.find(n => n.id === selectedId);
  const hovered = graph.nodes.find(n => n.id === hoveredId);
  const selectedAgent = selected?.kind === 'agent'
    ? live.agents.find((a: any) => String(a.id) === selected.entityId) : null;
  const selectedMemory = selected?.kind === 'memory'
    ? live.memories.find((m: any) => String(m.id) === selected.entityId) : null;
  const activity = useMemo(() => selectedAgent
    ? getAgentActivity(String(selectedAgent.id), live.tasks, live.events, live.messages, live.approvals)
    : null, [selectedAgent, live.tasks, live.events, live.messages, live.approvals]);
  const assignedAgent = (id: unknown) => live.agents.find((a: any) => String(a.id) === String(id));
  const relatedServices = selectedAgent
    ? live.services.filter((service: any) => String(service.agent_id) === String(selectedAgent.id)) : [];

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const width = element.clientWidth;
      if (Number.isFinite(width) && width > 0) setDimensions({ width, height: width < 640 ? 500 : 650 });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMotion(!preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => { motionRef.current = motion; if (controlsRef.current) controlsRef.current.autoRotate = motion; }, [motion]);

  useEffect(() => {
    if (!demo || document.hidden || !motion) return;
    const id = window.setInterval(() => setDemoStep(step => step + 1), 9000);
    return () => window.clearInterval(id);
  }, [demo, motion]);

  const detachControls = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const controls = controlsRef.current;
    const handlers = controlsHandlers.current;
    if (controls && handlers) {
      controls.removeEventListener('start', handlers.start);
      controls.removeEventListener('end', handlers.end);
    }
    controlsHandlers.current = null;
    controlsRef.current = null;
  }, []);
  const pauseForExplore = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (controlsRef.current) controlsRef.current.autoRotate = false;
  }, []);
  const resetCamera = useCallback(() => {
    pauseForExplore();
    fgRef.current?.cameraPosition({ x: 0, y: 15, z: 355 }, { x: 0, y: 0, z: 0 }, 700);
    timeoutRef.current = setTimeout(() => {
      if (motionRef.current && controlsRef.current && !document.hidden) controlsRef.current.autoRotate = true;
    }, 4500);
  }, [pauseForExplore]);
  const initializeGraph = useCallback(() => {
    if (initialized.current || !fgRef.current) return;
    initialized.current = true;
    fgRef.current.cameraPosition({ x: 0, y: 15, z: 355 }, { x: 0, y: 0, z: 0 }, 0);
    const controls: any = fgRef.current.controls();
    controlsRef.current = controls;
    const start = () => pauseForExplore();
    const end = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (motionRef.current && controlsRef.current === controls && !document.hidden) controls.autoRotate = true;
      }, 4500);
    };
    controlsHandlers.current = { start, end };
    controls.addEventListener('start', start);
    controls.addEventListener('end', end);
    controls.autoRotate = motionRef.current && !document.hidden;
    controls.autoRotateSpeed = 0.18;
  }, [pauseForExplore]);
  useEffect(() => () => detachControls(), [detachControls]);
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        pauseForExplore();
        fgRef.current?.pauseAnimation();
      } else {
        fgRef.current?.resumeAnimation();
        if (motionRef.current && controlsRef.current) controlsRef.current.autoRotate = true;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [pauseForExplore]);

  const close = useCallback(() => {
    setSelectedId(null);
    selectionTrigger.current?.focus();
  }, []);
  useEffect(() => {
    if (!selectedId) return;
    pauseForExplore();
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, close, pauseForExplore]);
  const select = useCallback((node: BrainNode) => {
    if (node.kind === 'structure' || node.kind === 'cluster') return;
    selectionTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelectedId(node.id);
    onSelectNode?.(node);
  }, [onSelectNode]);

  // Project persistent HTML labels without rebuilding React state every frame.
  useEffect(() => {
    let frame = 0;
    let last = 0;
    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      if (document.hidden || now - last < 70 || !fgRef.current) return;
      last = now;
      graph.nodes.forEach(node => {
        const label = labelElements.current.get(node.id);
        if (!label || ![node.x, node.y, node.z].every(Number.isFinite)) return;
        const point = fgRef.current!.graph2ScreenCoords(node.x, node.y, node.z);
        const visible = Number.isFinite(point.x) && Number.isFinite(point.y)
          && point.x > 10 && point.x < dimensions.width - 10 && point.y > 25 && point.y < dimensions.height - 20;
        label.style.display = visible ? 'block' : 'none';
        label.style.transform = `translate(${point.x}px, ${point.y + (node.kind === 'cluster' ? -10 : 12)}px) translateX(-50%)`;
      });
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [graph, dimensions]);

  const tickScene = useCallback(() => {
    initializeGraph();
    const t = performance.now() / 1000;
    for (const node of graph.nodes) {
      if (![node.baseX, node.baseY, node.baseZ, node.phase].every(Number.isFinite)) continue;
      const amp = motionRef.current ? (node.kind === 'structure' || node.kind === 'cluster' ? 0.3 : 2) : 0;
      node.fx = node.baseX + Math.sin(t * 0.5 + node.phase) * amp;
      node.fy = node.baseY + Math.cos(t * 0.6 + node.phase) * amp;
      node.fz = node.baseZ + Math.sin(t * 0.4 + node.phase) * amp;
    }
  }, [graph, initializeGraph]);

  const renderableCount = graph.nodes.filter(n => n.kind !== 'structure' && n.kind !== 'cluster').length;
  const dataMode = demo ? 'Demonstração · dados simulados' : 'Dados reais · Supabase';

  return (
    <section aria-label="Constelação operacional de agentes" className="relative rounded-xl border border-[#32323a] overflow-hidden bg-[#15161a] text-left">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[#33343b] bg-[#191a1f]">
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full ${demo ? 'bg-amber-300 animate-pulse' : 'bg-emerald-400'}`} aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-[#e7e5eb]">Constelação operacional</h3>
            <p className={`text-[11px] ${demo ? 'text-amber-200' : 'text-zinc-400'}`} aria-live="polite">{dataMode} · {renderableCount} registros na rede</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div aria-label="Fonte dos dados" className="flex rounded-lg border border-[#414149] p-0.5 bg-[#131418]">
            <button type="button" aria-pressed={!demo} onClick={() => onDemoChange?.(false)} className={`px-2 py-1 rounded-md text-[11px] ${!demo ? 'bg-[#30313a] text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>Reais</button>
            <button type="button" aria-pressed={demo} onClick={() => onDemoChange?.(true)} className={`px-2 py-1 rounded-md text-[11px] ${demo ? 'bg-amber-950/70 text-amber-100' : 'text-zinc-400 hover:text-zinc-200'}`}>Demonstração</button>
          </div>
          <button type="button" onClick={() => setMotion(value => !value)} aria-pressed={motion}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#414149] text-xs text-zinc-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300">
            {motion ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}{motion ? 'Pausar movimento' : 'Retomar movimento'}
          </button>
          <button type="button" onClick={resetCamera} aria-label="Restaurar visão da constelação" className="p-2 rounded-lg border border-[#414149] text-zinc-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"><Maximize2 className="w-4 h-4" /></button>
        </div>
      </header>

      <div ref={containerRef} className="relative bg-[#15161a]" style={{ height: dimensions.height }}>
        <GraphBoundary>
          <Suspense fallback={<div role="status" className="h-full flex items-center justify-center text-sm text-zinc-400">Carregando atlas neural 3D…</div>}>
            <ForceGraph3D
              ref={fgRef} width={dimensions.width} height={dimensions.height} graphData={graph}
              backgroundColor="#15161a" controlType="orbit" showNavInfo={false}
              nodeLabel={node => node.kind === 'cluster' ? node.name : ''}
              nodeColor={node => node.id === selectedId ? '#ffffff' : node.color}
              nodeVal={node => node.size} nodeRelSize={1.6} nodeOpacity={0.93} nodeResolution={6}
              nodeVisibility={node => [node.x, node.y, node.z, node.baseX, node.baseY, node.baseZ].every(Number.isFinite)}
              
              linkColor={link => link.structural ? '#797185' : link.relation === 'message' ? '#fff2c5' : link.relation === 'task' ? '#70d5ee' : link.relation === 'service' ? '#ff9fca' : '#cab7ec'}
              linkOpacity={0.65} linkWidth={link => link.structural ? 0.25 : link.relation === 'message' ? 0.65 : 0.4}
              linkDirectionalParticles={link => motion && !link.structural ? 2 : 0}
              linkDirectionalParticleWidth={1.4} linkDirectionalParticleColor={() => '#f4f0ff'} linkDirectionalParticleSpeed={0.0018}
              enableNodeDrag={false} onNodeHover={node => setHoveredId(node && !['structure', 'cluster'].includes(node.kind) && typeof node.id === 'string' ? node.id : null)}
              onNodeClick={node => { const entity = graph.nodes.find(item => item.id === node.id); if (entity) select(entity); }}
              onEngineTick={tickScene} cooldownTicks={Infinity} cooldownTime={Infinity} d3AlphaMin={0}
              d3VelocityDecay={0.4} d3AlphaDecay={0}
            />

          </Suspense>
        </GraphBoundary>
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {graph.nodes.filter(n => n.kind === 'cluster' || n.kind === 'agent' || n.kind === 'service' || n.id === selectedId || n.id === hoveredId).map(node => (
            <span key={node.id} ref={element => { if (element) labelElements.current.set(node.id, element); else labelElements.current.delete(node.id); }}
              className={`absolute top-0 left-0 max-w-[170px] truncate px-1.5 py-0.5 rounded ${node.kind === 'cluster' ? 'text-[11px] font-semibold tracking-wide text-zinc-200 bg-[#16151d]/90 border border-[#565260]' : 'text-[11px] text-zinc-100 bg-[#15131a]/75'}`}>
              {node.kind === 'cluster' ? node.name : node.kind === 'service' ? node.client || node.name : node.name}
            </span>
          ))}
        </div>
        <div className="absolute top-3 left-4 right-4 flex justify-between gap-3 pointer-events-none text-[10px] text-zinc-400 font-mono">
          <span>{demo ? `SIMULAÇÃO LOCAL · ciclo ${demoStep + 1}` : 'ATLAS OPERACIONAL'}</span>
          <span>{motion ? 'ÓRBITA SUAVE · clique ou arraste para explorar' : 'MOVIMENTO PAUSADO'}</span>
        </div>
        {hovered && <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-[#1c1d22]/90 border border-[#55545c] text-xs text-zinc-100 pointer-events-none">{KIND[hovered.kind] || 'Registro'} · {hovered.name}</div>}
      </div>

      <footer className="border-t border-[#33343b] px-4 py-3 bg-[#191a1f]">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-3 gap-y-2 text-[11px] text-zinc-300">
          <span><i className="inline-block w-2 h-2 rounded-full bg-[#aaa0ff] mr-1.5" />Agentes</span>
          <span><i className="inline-block w-2 h-2 rounded-full bg-[#64c6df] mr-1.5" />Tarefas</span>
          <span><i className="inline-block w-2 h-2 rounded-full bg-[#f1b765] mr-1.5" />Pendências</span>
          <span><i className="inline-block w-2 h-2 rounded-full bg-[#ed91bd] mr-1.5" />Atendimento</span>
          <span><i className="inline-block w-2 h-2 rounded-full bg-[#83d1a9] mr-1.5" />Memórias</span>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">Linhas claras representam responsáveis ou registros relacionados. Pontos pequenos ao fundo são ambientação visual, não entidades. {demo ? 'Todos os dados e atualizações desta visualização são fictícios.' : 'O painel reflete somente os registros carregados; não representa uma conexão direta ao processo dos agentes.'}</p>
        {!demo && dataWarning && <p role="status" className="mt-2 text-xs text-amber-200 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />Algumas fontes não carregaram: {dataWarning}</p>}
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Selecionar agente">
          {live.agents.map((item: any) => <button key={item.id} type="button" onClick={() => {
            const node = graph.nodes.find(candidate => candidate.kind === 'agent' && candidate.entityId === String(item.id));
            if (node) select(node);
          }} aria-pressed={selectedAgent?.id === item.id} className={`px-2 py-1 rounded-md border text-[11px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 ${selectedAgent?.id === item.id ? 'border-violet-300 bg-violet-950/50 text-white' : 'border-[#383940] text-zinc-300 hover:border-[#777580]'}`}>{item.name}</button>)}
        </div>
      </footer>

      {selected && !['structure', 'cluster'].includes(selected.kind) && (
        <aside role="dialog" aria-modal="false" aria-label={`Detalhes de ${selected.name}`} className="absolute z-20 top-16 right-2 left-2 sm:left-auto sm:right-3 sm:w-[370px] max-h-[calc(100%-5rem)] overflow-y-auto p-4 rounded-xl bg-[#191a20]/95 border border-[#5b5864] backdrop-blur-xl shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-[#393940] pb-3 mb-3">
            <div className="flex items-start gap-2"><Sparkles className="w-5 h-5 text-violet-300 mt-0.5 shrink-0" /><div><h4 className="text-sm font-semibold text-white">{selected.name}</h4><p className="text-[11px] text-zinc-400">{KIND[selected.kind] || 'Registro'}{demo ? ' · SIMULAÇÃO' : ''}</p></div></div>
            <button ref={closeRef} type="button" onClick={close} aria-label="Fechar detalhes" className="p-1 text-zinc-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"><X className="w-4 h-4" /></button>
          </div>
          {selectedAgent && activity ? <div className="space-y-3 text-xs text-zinc-300">
            <div className="flex justify-between gap-3"><span className="text-zinc-500">Função</span><span>{selectedAgent.role || 'Não informada'}</span></div>
            <div className="flex justify-between gap-3"><span className="text-zinc-500">Status registrado</span><span>{STATUS[selectedAgent.status] || selectedAgent.status || 'Não informado'}</span></div>
            <div className="border-l-2 border-violet-300 pl-3 py-1"><p className="text-[10px] text-zinc-500 mb-1">Atividade {demo ? 'simulada' : 'registrada'}</p><p aria-live="polite" className="leading-relaxed">{activity.summary}</p></div>
            {activity.currentTask && <div><h5 className="font-medium text-white mb-1">Tarefa atual</h5><p>{activity.currentTask.title}</p><p className="text-[10px] text-zinc-500 mt-1">{STATUS[activity.currentTask.status] || activity.currentTask.status} · {dateLabel(activity.currentTask.updated_at)}</p></div>}
            {activity.latestEvent && <div><h5 className="font-medium text-white mb-1">Atividade recente</h5><p>{activity.latestEvent.summary}</p></div>}
            {relatedServices.length > 0 && <div className="rounded-lg border border-[#49434c] bg-[#202027] p-3"><h5 className="font-medium text-white flex items-center gap-1.5 mb-1"><BriefcaseBusiness className="w-3.5 h-3.5 text-pink-200" />Atendimento</h5>{relatedServices.slice(0, 2).map((service: any) => <div key={service.id} className="mt-2"><p className="text-zinc-100">{service.client} · {service.title}</p><p className="text-zinc-400 mt-0.5">{service.summary}</p></div>)}</div>}
            {activity.recentMessages.length > 0 && <div><h5 className="font-medium text-white mb-1">Mensagens recentes</h5>{activity.recentMessages.slice(0, 3).map((message: any) => <p key={message.id} className="border-t border-[#383940] py-1.5 break-words">{message.content}</p>)}</div>}
            {activity.pendingApprovals.length > 0 && <div><h5 className="font-medium text-white mb-1">Pendências ({activity.pendingApprovals.length})</h5>{activity.pendingApprovals.slice(0, 3).map((approval: any) => <p key={approval.id} className="flex gap-1.5 py-1"><Clock3 className="w-3 h-3 mt-0.5 text-amber-200" />{approval.action}</p>)}</div>}
            {demo && <p className="rounded-md bg-amber-950/35 border border-amber-700/40 p-2 text-amber-100 flex gap-1.5"><Radio className="w-3 h-3 mt-0.5" />Exemplo fictício; nenhuma atividade está sendo enviada ao Supabase.</p>}
            {!demo && dataWarning && <p role="status" className="text-amber-200">Alguns dados podem estar indisponíveis: {dataWarning}</p>}
            {!demo && <p className="text-[10px] text-zinc-500 border-t border-[#393940] pt-2">Resumo dos registros carregados, não monitoramento direto do processo.</p>}
          </div> : selected.kind === 'task' ? <div className="space-y-2 text-xs text-zinc-300"><p>Status · {STATUS[selected.status] || selected.status}</p><p>Responsável · {assignedAgent(selected.assigned_agent)?.name || 'Não atribuída'}</p></div>
            : selected.kind === 'approval' ? <div className="space-y-2 text-xs text-zinc-300"><p>{selected.action}</p><p>Status · {STATUS[selected.status] || selected.status}</p><p>Solicitante · {assignedAgent(selected.agent_id)?.name || 'Não informado'}</p></div>
            : selected.kind === 'service' ? <div className="space-y-2 text-xs text-zinc-300"><p className="font-medium text-white">{selected.client}</p><p>{selected.summary}</p><p>Responsável · {assignedAgent(selected.agent_id)?.name || 'Não informado'}</p><p>Status · {STATUS[selected.status] || selected.status}</p>{demo && <p className="text-amber-200">Atendimento fictício para demonstração.</p>}</div>
            : selectedMemory ? <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">{selectedMemory.content || 'Memória sem conteúdo disponível.'}</p>
            : <p className="text-xs text-zinc-400">Registro não disponível.</p>}
        </aside>
      )}
    </section>
  );
};
