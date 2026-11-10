import React, { useRef, useEffect, useState } from 'react';
import { Brain, Zap, X } from 'lucide-react';
import { MOCK_MEMORIES, MemoryNode } from '../data/mockData';

interface Neuron {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  pulsePhase: number;
  energy: number;
  nodeData?: MemoryNode;
  label: string;
  depth: number;
}

interface Pulse {
  sourceIndex: number;
  targetIndex: number;
  progress: number;
  speed: number;
  color: string;
}

interface NeuralBrainCanvasProps {
  onSelectNode?: (node: MemoryNode) => void;
}

export const NeuralBrainCanvas: React.FC<NeuralBrainCanvasProps> = ({ onSelectNode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(MOCK_MEMORIES[0]);
  const [networkPulse, setNetworkPulse] = useState(1);
  const [showNodeDetail, setShowNodeDetail] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const isMobile = window.innerWidth < 640;
    let width = (canvas.width = canvas.parentElement?.clientWidth || (isMobile ? 320 : 700));
    let height = (canvas.height = isMobile ? 300 : 380);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const mobile = window.innerWidth < 640;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = mobile ? 300 : 380;
    };
    window.addEventListener('resize', handleResize);

    const colorPalette = [
      { color: '#9333ea', glow: 'rgba(147, 51, 234, 0.4)' },
      { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
      { color: '#7c3aed', glow: 'rgba(124, 58, 237, 0.35)' },
      { color: '#c084fc', glow: 'rgba(192, 132, 252, 0.35)' },
      { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.35)' }
    ];

    const neurons: Neuron[] = [];
    const totalNeurons = isMobile ? 32 : 48;

    for (let i = 0; i < totalNeurons; i++) {
      const isLeftHemisphere = i % 2 === 0;
      const angle = (Math.PI * 2 * i) / totalNeurons;
      const rX = (width * 0.3) * (0.45 + Math.random() * 0.55);
      const rY = (height * 0.32) * (0.45 + Math.random() * 0.55);

      const hemisphereOffset = isLeftHemisphere ? -width * 0.11 : width * 0.11;
      const centerX = width / 2 + hemisphereOffset;
      const centerY = height / 2;

      const x = centerX + Math.cos(angle) * rX;
      const y = centerY + Math.sin(angle) * rY;

      const palette = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      const memoryMatch = MOCK_MEMORIES[i % MOCK_MEMORIES.length];

      neurons.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: (isMobile ? 2.2 : 2.8) + Math.random() * 2,
        baseRadius: (isMobile ? 2.2 : 2.8) + Math.random() * 2,
        color: palette.color,
        glowColor: palette.glow,
        pulsePhase: Math.random() * Math.PI * 2,
        energy: Math.random(),
        nodeData: i < MOCK_MEMORIES.length ? memoryMatch : undefined,
        label: i < MOCK_MEMORIES.length ? memoryMatch.title : `Sinapse #${i + 1}`,
        depth: 0.5 + Math.random() * 0.5
      });
    }

    const pulses: Pulse[] = [];
    const maxPulses = isMobile ? 8 : 12;

    for (let p = 0; p < maxPulses; p++) {
      pulses.push({
        sourceIndex: Math.floor(Math.random() * totalNeurons),
        targetIndex: Math.floor(Math.random() * totalNeurons),
        progress: Math.random(),
        speed: 0.007 + Math.random() * 0.012,
        color: Math.random() > 0.4 ? '#a855f7' : '#38bdf8'
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;
    let hoveredNeuron: Neuron | null = null;

    const onPointerMove = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = clientX - rect.left;
      mouseY = clientY - rect.top;

      let found: Neuron | null = null;
      for (const n of neurons) {
        const dx = n.x - mouseX;
        const dy = n.y - mouseY;
        if (Math.sqrt(dx * dx + dy * dy) < n.radius + 12) {
          found = n;
          break;
        }
      }
      hoveredNeuron = found;
    };

    const handleMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const triggerSelect = () => {
      if (hoveredNeuron) {
        hoveredNeuron.energy = 2.0;
        hoveredNeuron.radius = hoveredNeuron.baseRadius * 1.8;
        setShowNodeDetail(true);
        if (hoveredNeuron.nodeData) {
          setSelectedNode(hoveredNeuron.nodeData);
          if (onSelectNode) onSelectNode(hoveredNeuron.nodeData);
        } else {
          const tempMem: MemoryNode = {
            id: `temp-${Date.now()}`,
            title: hoveredNeuron.label,
            content: `Sinapse ativa das skills Claude. Conexão neural em ${Math.round(hoveredNeuron.energy * 100)}%.`,
            category: 'tecnologia',
            tags: ['skill', 'claude-code'],
            created_by: 'helena',
            created_at: new Date().toISOString(),
            connections: [],
            importance: 85
          };
          setSelectedNode(tempMem);
          if (onSelectNode) onSelectNode(tempMem);
        }

        neurons.forEach((other) => {
          const dist = Math.hypot(other.x - hoveredNeuron!.x, other.y - hoveredNeuron!.y);
          if (dist < 100) {
            other.energy = Math.min(1.8, other.energy + 0.8);
          }
        });
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('click', triggerSelect);

    let step = 0;
    const render = () => {
      step += 0.015;
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = '#05040a';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < neurons.length; i++) {
        const n = neurons[i];
        n.pulsePhase += 0.025;
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 15 || n.x > width - 15) n.vx *= -1;
        if (n.y < 15 || n.y > height - 15) n.vy *= -1;

        if (n.energy > 1) n.energy *= 0.97;

        const dmx = mouseX - n.x;
        const dmy = mouseY - n.y;
        const distMouse = Math.sqrt(dmx * dmx + dmy * dmy);
        if (distMouse < 80 && distMouse > 1) {
          n.x += (dmx / distMouse) * 0.2;
          n.y += (dmy / distMouse) * 0.2;
        }
      }

      const maxConnectDist = isMobile ? 85 : 110;
      for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
          const n1 = neurons[i];
          const n2 = neurons[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const alpha = (1 - dist / maxConnectDist) * 0.25 * Math.min(n1.energy, n2.energy);
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      for (const pulse of pulses) {
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) {
          pulse.progress = 0;
          pulse.sourceIndex = Math.floor(Math.random() * neurons.length);
          pulse.targetIndex = Math.floor(Math.random() * neurons.length);
        }

        const src = neurons[pulse.sourceIndex];
        const tgt = neurons[pulse.targetIndex];
        const dist = Math.hypot(tgt.x - src.x, tgt.y - src.y);

        if (dist < maxConnectDist * 1.1) {
          const px = src.x + (tgt.x - src.x) * pulse.progress;
          const py = src.y + (tgt.y - src.y) * pulse.progress;

          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = pulse.color;
          ctx.fill();
        }
      }

      for (const n of neurons) {
        const isHoveredNode = n === hoveredNeuron;
        const currentRadius = (isHoveredNode ? n.baseRadius * 1.5 : n.baseRadius) * Math.min(n.energy, 1.5);

        ctx.beginPath();
        ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = isHoveredNode ? '#ffffff' : n.color;
        ctx.fill();

        if (n.nodeData && n.nodeData.id === selectedNode?.id) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, currentRadius + 3.5, 0, Math.PI * 2);
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('click', triggerSelect);
      cancelAnimationFrame(animationFrameId);
    };
  }, [networkPulse, selectedNode]);

  return (
    <div className="relative rounded-xl bg-[#06050a] border border-purple-950/60 overflow-hidden text-left">
      {/* Top Header Responsivo */}
      <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-purple-950/40 bg-[#07060d] gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="p-1 sm:p-1.5 rounded-lg bg-purple-950/50 border border-purple-900/40 text-purple-300 shrink-0">
            <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-semibold text-white tracking-wide truncate">
                Cérebro Neural de Skills
              </h3>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded bg-purple-950 border border-purple-800/40 text-purple-300 font-mono shrink-0">
                18 SKILLS
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 hidden sm:block truncate">
              Rede sináptica conectando as rotinas e memórias do Claude
            </p>
          </div>
        </div>

        <button
          onClick={() => setNetworkPulse((p) => p + 1)}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[#100d1c] hover:bg-[#181329] border border-purple-900/40 text-purple-300 text-[10px] sm:text-[11px] font-medium transition-all cursor-pointer shrink-0"
        >
          <Zap className="w-3 h-3 text-purple-400" />
          <span>Pulso</span>
        </button>
      </div>

      {/* Canvas com Altura Adaptativa */}
      <div ref={containerRef} className="relative w-full h-[280px] sm:h-[360px] bg-[#05040a] cursor-crosshair">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Legenda Discreta */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-2.5 px-2.5 py-1 rounded bg-[#080710]/90 border border-purple-950/60 text-[9px] text-zinc-400">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>Memória</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>Handoff</span>
          </div>
        </div>

        {/* Card Flutuante de Memória no Mobile e Desktop */}
        {selectedNode && showNodeDetail && (
          <div className="absolute top-2 right-2 sm:right-3 w-[calc(100%-1rem)] sm:w-72 max-w-sm p-3 rounded-lg bg-[#080710]/95 border border-purple-900/40 text-left backdrop-blur-md shadow-xl z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] sm:text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-purple-950 border border-purple-800/40 text-purple-300">
                {selectedNode.category}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[8px] sm:text-[9px] text-zinc-500 font-mono">
                  Skill: {selectedNode.created_by}
                </span>
                <button
                  onClick={() => setShowNodeDetail(false)}
                  className="text-zinc-500 hover:text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
            <h4 className="text-xs font-semibold text-white mb-1 truncate">
              {selectedNode.title}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-zinc-300 leading-relaxed mb-1.5 line-clamp-2 sm:line-clamp-3">
              {selectedNode.content}
            </p>
            <div className="flex flex-wrap gap-1">
              {selectedNode.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded bg-[#100d1c] text-purple-300 font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
