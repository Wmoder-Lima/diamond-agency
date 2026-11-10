import React, { useState } from 'react';
import { TrendingUp, Cpu, Sparkles } from 'lucide-react';
import { MOCK_METRICS } from '../data/mockData';

export const MetricsCharts: React.FC = () => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const data = MOCK_METRICS.dailyThroughput;

  const width = 640;
  const height = 180;
  const padding = 25;

  const maxTasks = Math.max(...data.map((d) => d.tasks)) * 1.15;
  const minTasks = 0;

  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.tasks - minTasks) / (maxTasks - minTasks)) * (height - padding * 2);
    return { x, y, ...d };
  });

  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-left">
      {/* Gráfico Principal */}
      <div className="lg:col-span-2 rounded-xl bg-[#080710] border border-purple-950/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-950/40 border border-purple-900/40 text-purple-300">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white tracking-wide">
                Throughput das Skills Claude (24h)
              </h3>
              <p className="text-[11px] text-zinc-500">
                Execuções e chamadas registradas pela ponte CLI
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/30 border border-emerald-800/40 text-emerald-400">
            +28.4% vs ontem
          </span>
        </div>

        <div className="relative w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 overflow-visible">
            <defs>
              <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9333ea" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#05040a" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Linhas de grade suaves */}
            {[0.2, 0.5, 0.8].map((ratio) => {
              const y = padding + ratio * (height - padding * 2);
              return (
                <line
                  key={ratio}
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="rgba(168, 85, 247, 0.08)"
                />
              );
            })}

            <path d={areaPath} fill="url(#purpleArea)" />
            <path
              d={linePath}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
            />

            {points.map((p, idx) => (
              <g
                key={p.hour}
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint === idx ? 5 : 3.5}
                  fill="#ffffff"
                  stroke="#9333ea"
                  strokeWidth="2"
                />
                <text
                  x={p.x}
                  y={height - 6}
                  textAnchor="middle"
                  fill="#71717a"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {p.hour}
                </text>
              </g>
            ))}
          </svg>

          {hoveredPoint !== null && (
            <div
              className="absolute pointer-events-none px-2.5 py-1 rounded bg-[#0f0d1b] border border-purple-900/60 text-xs text-white transform -translate-x-1/2 -translate-y-full"
              style={{
                left: `${(points[hoveredPoint].x / width) * 100}%`,
                top: `${(points[hoveredPoint].y / height) * 100 - 8}%`
              }}
            >
              <div className="font-semibold text-purple-300 text-[11px]">
                {points[hoveredPoint].tasks} rotinas / h
              </div>
              <div className="text-[9px] text-zinc-500 font-mono">
                {points[hoveredPoint].tokens}k tokens
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Carga por Squad */}
      <div className="rounded-xl bg-[#080710] border border-purple-950/50 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-1.5 rounded-lg bg-purple-950/40 border border-purple-900/40 text-purple-300">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white tracking-wide">
                Carga Operacional por Squad
              </h3>
              <p className="text-[11px] text-zinc-500">
                Alocação de inferência das skills
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {MOCK_METRICS.departmentLoads.map((item) => (
              <div key={item.dept} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 text-[11px]">
                    {item.dept}
                  </span>
                  <span className="text-zinc-500 font-mono text-[10px]">
                    {item.load}% ({item.agents} skills)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#0d0b17] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-600 transition-all duration-300"
                    style={{ width: `${item.load}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-2.5 rounded-lg bg-[#0c0a16] border border-purple-950/40 flex items-center justify-between text-xs">
          <div className="text-zinc-400 text-[11px]">Latência média</div>
          <div className="font-mono text-zinc-200 text-xs">{MOCK_METRICS.averageResponseTimeMs}ms</div>
        </div>
      </div>
    </div>
  );
};
