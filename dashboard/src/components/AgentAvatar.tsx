import React from 'react';
import { 
  Bot, 
  Crown, 
  Terminal, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  Palette, 
  Megaphone,
  Briefcase,
  Target,
  Video,
  TrendingUp
} from 'lucide-react';
import { Agent } from '../data/mockData';

interface AgentAvatarProps {
  agent: Agent | { id: string; name: string; role?: string; department?: string; status?: string };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDetails?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  agent,
  size = 'md',
  showDetails = false,
  interactive = false,
  onClick
}) => {
  const getRoleIcon = (role?: string, dept?: string) => {
    const r = (role || '').toLowerCase();
    const d = (dept || '').toLowerCase();

    if (r.includes('diretora geral') || r.includes('ceo')) return Crown;
    if (r.includes('tecnologia') || r.includes('cto')) return Cpu;
    if (r.includes('arquiteto')) return Layers;
    if (r.includes('front-end') || r.includes('designer') || r.includes('brand')) return Palette;
    if (r.includes('back-end') || r.includes('fullstack')) return Terminal;
    if (r.includes('qa') || r.includes('validação')) return ShieldCheck;
    if (r.includes('marketing') || r.includes('cmo')) return Megaphone;
    if (r.includes('vídeo') || r.includes('cortes')) return Video;
    if (r.includes('tráfego')) return TrendingUp;
    if (r.includes('closer') || r.includes('sdr') || r.includes('comercial')) return Target;
    if (d === 'comercial') return Briefcase;
    return Bot;
  };

  const IconComponent = getRoleIcon(agent.role, agent.department);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const status = agent.status || 'idle';
  const statusColors: Record<string, string> = {
    working: 'bg-emerald-400',
    waiting: 'bg-amber-400',
    idle: 'bg-purple-400',
    offline: 'bg-zinc-600'
  };

  const dotColor = statusColors[status] || statusColors.idle;

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center gap-2.5 text-left ${
        interactive ? 'cursor-pointer' : ''
      }`}
    >
      <div className="relative shrink-0">
        <div
          className={`${sizeClasses[size]} rounded-lg bg-[#0e0c18] border border-purple-900/40 flex items-center justify-center transition-colors group-hover:border-purple-600`}
        >
          <IconComponent className={`${iconSizes[size]} text-purple-300`} />
        </div>

        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#06050a] ${dotColor}`}
        />
      </div>

      {showDetails && (
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-semibold text-white truncate text-left">
              {agent.name}
            </h4>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#0e0c18] border border-purple-950 text-zinc-400 font-mono">
              {agent.department || 'skill'}
            </span>
          </div>
          {agent.role && (
            <p className="text-[11px] text-zinc-500 truncate text-left">{agent.role}</p>
          )}
        </div>
      )}
    </div>
  );
};
