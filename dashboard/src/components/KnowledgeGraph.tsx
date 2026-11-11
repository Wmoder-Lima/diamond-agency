import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import ForceGraph2D, { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import { 
  Brain, 
  Zap, 
  X, 
  Sparkles, 
  Maximize2, 
  RefreshCw, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Bot
} from 'lucide-react';

interface KnowledgeGraphProps {
  memories?: any[];
  agents?: any[];
  onSelectNode?: (node: any) => void;
}

interface CustomNode {
  id: string;
  name: string;
  role?: string;
  department?: string;
  status?: string;
  category?: string;
  content?: string;
  tags?: string[];
  isCenter?: boolean;
  val: number;
  color: string;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

interface CustomLink {
  source: string | CustomNode;
  target: string | CustomNode;
  status?: string;
  speed?: number;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  memories: propMemories,
  agents: propAgents,
  onSelectNode
}) => {
  const fgRef = useRef<ForceGraphMethods<CustomNode, CustomLink> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Dados são fornecidos pelo App; não abrir canais Realtime duplicados aqui.
  const memories = propMemories ?? [];
  const agents = propAgents ?? [];

  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 440 });

  // Responsividade de dimensões do container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth || 700;
        const h = window.innerWidth < 640 ? 320 : 440;
        setDimensions({ width: w, height: h });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // ─── MONTAGEM DOS DADOS (NÓ CENTRAL FIXO + CONEXÕES RADIAIS) ─────────────
  const graphData = useMemo(() => {
    // 1. Injeta Nó Central Fixo (Claude / Sistema)
    const centerNode: CustomNode = {
      id: 'center',
      name: 'Claude Core',
      role: 'Orquestrador Central Neural',
      department: 'sistema',
      status: 'working',
      category: 'core',
      isCenter: true,
      val: 36,
      color: '#c084fc',
      fx: 0,
      fy: 0
    };

    const nodes: CustomNode[] = [centerNode];
    const links: CustomLink[] = [];

    // Paleta de tons roxo, magenta e violeta
    const nodeColors = [
      '#a855f7', // violeta vibrante
      '#c084fc', // púrpura claro
      '#d946ef', // fuchsia
      '#ec4899', // rosa magenta
      '#8b5cf6', // violeta escuro
      '#a21caf'  // magenta profundo
    ];

    // 2. Conecta Agentes diretamente ao Nó Central
    if (agents && agents.length > 0) {
      agents.forEach((ag: any, index: number) => {
        const status = ag.status || 'idle';
        const node: CustomNode = {
          id: ag.id,
          name: ag.name,
          role: ag.role,
          department: ag.department,
          status: status,
          category: 'agente',
          val: 18,
          color: nodeColors[index % nodeColors.length]
        };
        nodes.push(node);

        // Conexão radial obrigatória: do centro para o nó
        links.push({
          source: 'center',
          target: ag.id,
          status: status,
          speed: (status === 'working' || status === 'ativo' || status === 'executando') ? 0.016 : 0.003
        });
      });
    }

    // 3. Conecta Memórias diretamente ao Nó Central
    if (memories && memories.length > 0) {
      memories.forEach((mem: any, index: number) => {
        const memId = mem.id || `mem-${index}`;
        // Evita duplicar IDs
        if (!nodes.some((n) => n.id === memId)) {
          const node: CustomNode = {
            id: memId,
            name: mem.title || 'Memória',
            content: mem.content,
            category: mem.category || 'memoria',
            tags: mem.tags || [],
            status: 'idle',
            val: 14,
            color: '#9333ea'
          };
          nodes.push(node);

          links.push({
            source: 'center',
            target: memId,
            status: 'idle',
            speed: 0.005
          });
        }
      });
    }

    // Fallback inicial visual caso o banco esteja vazio
    if (nodes.length === 1) {
      const fallbackNodes = [
        { id: 'beatriz', name: 'Beatriz', role: 'Diretora Geral', department: 'diretoria', status: 'working' },
        { id: 'helena', name: 'Helena', role: 'Diretora de Tecnologia', department: 'tecnologia', status: 'working' },
        { id: 'rafael', name: 'Rafael', role: 'Arquiteto de Software', department: 'tecnologia', status: 'working' },
        { id: 'camila', name: 'Camila', role: 'Desenvolvedora Front-end', department: 'tecnologia', status: 'working' },
        { id: 'marcela', name: 'Marcela', role: 'Diretora de Marketing', department: 'marketing', status: 'idle' },
        { id: 'felipe', name: 'Felipe', role: 'SDR e Prospecção', department: 'comercial', status: 'working' }
      ];

      fallbackNodes.forEach((fb, idx) => {
        nodes.push({
          id: fb.id,
          name: fb.name,
          role: fb.role,
          department: fb.department,
          status: fb.status,
          category: 'agente',
          val: 16,
          color: nodeColors[idx % nodeColors.length]
        });

        links.push({
          source: 'center',
          target: fb.id,
          status: fb.status,
          speed: fb.status === 'working' ? 0.016 : 0.003
        });
      });
    }

    return { nodes, links };
  }, [agents, memories]);

  // ─── CONFIGURAÇÃO DA FÍSICA RADIAL D3 ─────────────────────────────────────
  useEffect(() => {
    if (fgRef.current) {
      // 1. Repulsão forte (charge negativo alto) para espalhar os nós uniformemente
      const charge = fgRef.current.d3Force('charge');
      if (charge && typeof charge.strength === 'function') {
        charge.strength(-400);
      }

      // 2. Distância fixa para os links radiais
      const linkForce = fgRef.current.d3Force('link');
      if (linkForce && typeof linkForce.distance === 'function') {
        linkForce.distance(150);
      }

      // 3. Força central
      const centerForce = fgRef.current.d3Force('center');
      if (centerForce) {
        centerForce.strength?.(0.8);
      }

      // Reaquece a simulação para aplicar os parâmetros físicos
      fgRef.current.d3ReheatSimulation();

      // Ajusta zoom inicial suave
      setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(600, 60);
        }
      }, 350);
    }
  }, [graphData]);

  // ─── INTERAÇÃO ON-NODE-CLICK COM ZOOM E CENTRALIZAÇÃO ─────────────────────
  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    if (onSelectNode) {
      onSelectNode(node);
    }

    // Transição de câmera suave (zoom e centralização) para o nó clicado
    if (fgRef.current && node.x !== undefined && node.y !== undefined) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(2.6, 1000);
    }
  }, [onSelectNode]);

  // Reset de Câmera (Centralizar Todo o Grafo)
  const handleResetCamera = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.centerAt(0, 0, 800);
      fgRef.current.zoomToFit(800, 60);
    }
  }, []);

  // ─── RENDERIZAÇÃO CUSTOMIZADA DOS NÓS VIA CANVAS ─────────────────────────
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    // A simulação pode pintar antes de atribuir coordenadas válidas ao nó.
    if (!Number.isFinite(node?.x) || !Number.isFinite(node?.y) ||
        !Number.isFinite(globalScale) || globalScale <= 0) return;

    const isCenter = node.isCenter;
    const isSelected = selectedNode && selectedNode.id === node.id;
    const radius = isCenter ? 14 : (isSelected ? 9 : 6.5);

    // 1. Glow Pulsante Externo
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius * 2.2, 0, 2 * Math.PI, false);
    const glowGrad = ctx.createRadialGradient(node.x, node.y, radius * 0.5, node.x, node.y, radius * 2.2);
    glowGrad.addColorStop(0, isCenter ? 'rgba(192, 132, 252, 0.5)' : (isSelected ? 'rgba(236, 72, 153, 0.6)' : 'rgba(168, 85, 247, 0.25)'));
    glowGrad.addColorStop(1, 'rgba(5, 4, 10, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // 2. Anel de Destaque
    if (isCenter || isSelected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI, false);
      ctx.strokeStyle = isCenter ? '#e879f9' : '#38bdf8';
      ctx.lineWidth = 1.8 / globalScale;
      ctx.setLineDash(isCenter ? [3, 3] : []);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Núcleo Sólido do Nó
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = isCenter ? '#c084fc' : (node.color || '#a855f7');
    ctx.fill();

    // 4. Dot de Status Operacional para Agentes
    if (!isCenter && node.status) {
      const isWorking = node.status === 'working' || node.status === 'ativo' || node.status === 'executando';
      const isWaiting = node.status === 'waiting' || node.status === 'aguardando';
      ctx.beginPath();
      ctx.arc(node.x + radius * 0.7, node.y - radius * 0.7, 2.5, 0, 2 * Math.PI, false);
      ctx.fillStyle = isWorking ? '#10b981' : (isWaiting ? '#f59e0b' : '#a855f7');
      ctx.fill();
    }

    // 5. Rótulo de Texto Alinhado e Legível
    const fontSize = Math.max(9 / globalScale, isCenter ? 4 : 3.2);
    ctx.font = `${isCenter ? 'bold' : 'normal'} ${fontSize}px -apple-system, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = isCenter ? '#ffffff' : (isSelected ? '#f3e8ff' : '#cbd5e1');
    ctx.fillText(node.name || node.id, node.x, node.y + radius + 3.5);

    if (isCenter) {
      ctx.font = `600 ${fontSize * 0.75}px monospace`;
      ctx.fillStyle = '#c084fc';
      ctx.fillText('NÚCLEO RADIAL', node.x, node.y + radius + 3.5 + fontSize);
    }
  }, [selectedNode]);

  return (
    <div className="relative rounded-xl bg-[#05040a] border border-purple-950/60 overflow-hidden text-left select-none">
      {/* Header de Controle do Grafo */}
      <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-purple-950/40 bg-[#07060d] gap-2 z-10 relative">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="p-1 sm:p-1.5 rounded-lg bg-purple-950/50 border border-purple-900/40 text-purple-300 shrink-0">
            <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-semibold text-white tracking-wide truncate">
                Rede Neural Radial (Grafo de Conhecimento)
              </h3>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded bg-purple-950 border border-purple-800/40 text-purple-300 font-mono shrink-0">
                RADIAL • {graphData.nodes.length - 1} NÓS
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 hidden sm:block truncate">
              Conexões sinápticas ativas centradas no Claude Core com física de repulsão e partículas em tempo real
            </p>
          </div>
        </div>

        {/* Ações da Barra Superior */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleResetCamera}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0e0c18] hover:bg-[#151224] border border-purple-950/70 text-purple-300 text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer"
            title="Recentralizar câmera e ajustar zoom"
          >
            <Maximize2 className="w-3 h-3 text-purple-400" />
            <span>Centralizar</span>
          </button>
        </div>
      </div>

      {/* Área do ForceGraph2D */}
      <div ref={containerRef} className="relative w-full h-[320px] sm:h-[440px] bg-[#05040a] cursor-grab active:cursor-grabbing">
        <ForceGraph2D
          ref={fgRef as any}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData as any}
          backgroundColor="#05040a"
          
          // Estilo dos Links e Conexões Radiais
          linkColor={() => "rgba(168, 85, 247, 0.35)"}
          linkWidth={1.4}
          
          // Partículas Sinápticas (Brancas, Correndo do Centro para os Nós)
          linkDirectionalParticles={3}
          linkDirectionalParticleWidth={2.4}
          linkDirectionalParticleColor={() => "#ffffff"}
          linkDirectionalParticleSpeed={(link: any) => {
            // Velocidade dinâmica: rápida se ativo/executando, lenta se ocioso
            const status = link.status || link.target?.status;
            if (status === 'working' || status === 'ativo' || status === 'executando') {
              return 0.016; // Sinapse rápida
            }
            return 0.0035; // Sinapse lenta / repouso
          }}

          // Renderizador Customizado dos Nós em Canvas
          nodeCanvasObject={paintNode}
          nodePointerAreaPaint={(node: any, color, ctx) => {
            if (!Number.isFinite(node?.x) || !Number.isFinite(node?.y)) return;
            const r = node.isCenter ? 16 : 10;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
            ctx.fill();
          }}

          // Clique no Nó
          onNodeClick={handleNodeClick}

          // Controle de física e amortecimento
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          warmupTicks={50}
          cooldownTicks={150}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
        />

        {/* Legenda Discreta */}
        <div className="absolute bottom-2.5 left-3 flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-lg bg-[#080710]/90 border border-purple-950/60 text-[9px] text-zinc-400 backdrop-blur-md pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
            <span className="text-zinc-200 font-medium">Núcleo Claude</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Executando (Sinapse Rápida)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span>Ocioso (Sinapse Lenta)</span>
          </div>
        </div>

        {/* Card Flutuante / Popup Lateral ao Clicar no Nó */}
        {selectedNode && (
          <div className="absolute top-2.5 right-2.5 sm:right-3 w-[calc(100%-1.25rem)] sm:w-80 max-w-sm p-4 rounded-xl bg-[#080710]/95 border border-purple-900/50 text-left backdrop-blur-xl shadow-2xl z-20 animate-in fade-in zoom-in-95 duration-200">
            {/* Header do Card */}
            <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-purple-950/40">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${selectedNode.isCenter ? 'bg-purple-950/60 border border-purple-700/50 text-purple-300' : 'bg-[#0f0d1a] border border-purple-900/40 text-purple-400'}`}>
                  {selectedNode.isCenter ? <Sparkles className="w-4 h-4 text-cyan-300" /> : <Bot className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {selectedNode.name}
                  </h4>
                  <span className="text-[10px] text-purple-400 font-mono block">
                    {selectedNode.isCenter ? 'Núcleo Central' : (selectedNode.role || 'Módulo Sináptico')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-[#120f20] transition-colors cursor-pointer"
                title="Fechar detalhes"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Corpo com Informações do Nó */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500">Status Operacional:</span>
                <span className={`px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] ${
                  (selectedNode.status === 'working' || selectedNode.status === 'ativo' || selectedNode.status === 'executando')
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                    : 'bg-purple-950/40 text-purple-300 border border-purple-800/40'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {selectedNode.status === 'working' ? 'Executando' : (selectedNode.status || 'Ocioso')}
                </span>
              </div>

              {selectedNode.department && (
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-500">Departamento / Squad:</span>
                  <span className="text-zinc-300 capitalize">{selectedNode.department}</span>
                </div>
              )}

              {selectedNode.content && (
                <div className="p-2.5 rounded-lg bg-[#0c0a15] border border-purple-950/60 mt-1">
                  <span className="text-[10px] text-zinc-500 font-mono block mb-1">CONTEÚDO DA MEMÓRIA</span>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {selectedNode.content}
                  </p>
                </div>
              )}

              {selectedNode.tags && selectedNode.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedNode.tags.map((t: string) => (
                    <span key={t} className="text-[9px] px-1.5 py-0.2 rounded bg-[#100d1c] border border-purple-950 text-purple-300 font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Botão de Ação Rápida */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleResetCamera}
                  className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Visão Global</span>
                </button>
                <span className="text-[9px] text-zinc-600 font-mono">
                  ID: {selectedNode.id}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
