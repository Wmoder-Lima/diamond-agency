import React from 'react';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  MessagesSquare, 
  CheckSquare, 
  Users, 
  Brain, 
  BarChart3, 
  Settings2,
  Gem, 
  Terminal,
  LogOut,
  X
} from 'lucide-react';

export type TabType = 
  | 'geral' 
  | 'tarefas' 
  | 'conversas' 
  | 'aprovacoes' 
  | 'agentes' 
  | 'cerebro' 
  | 'metricas'
  | 'configuracoes';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingApprovalsCount: number;
  activeAgentsCount: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingApprovalsCount,
  activeAgentsCount,
  mobileOpen = false,
  onCloseMobile,
  onLogout
}) => {
  const navItems = [
    {
      id: 'geral' as TabType,
      label: 'Visão Geral & Cérebro',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'tarefas' as TabType,
      label: 'Quadro de Tarefas',
      icon: KanbanSquare,
      badge: null
    },
    {
      id: 'conversas' as TabType,
      label: 'Live Comms',
      icon: MessagesSquare,
      badge: null
    },
    {
      id: 'aprovacoes' as TabType,
      label: 'Decisões & Aprovações',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : null,
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    },
    {
      id: 'agentes' as TabType,
      label: 'Skills & Agentes Claude',
      icon: Users,
      badge: `${activeAgentsCount} ativas`
    },
    {
      id: 'cerebro' as TabType,
      label: 'Memória & Sinapses',
      icon: Brain,
      badge: null
    },
    {
      id: 'metricas' as TabType,
      label: 'Métricas & Throughput',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'configuracoes' as TabType,
      label: 'Configurações Avançadas',
      icon: Settings2,
      badge: 'Hub'
    }
  ];

  const handleItemClick = (id: TabType) => {
    onSelectTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Backdrop Overlay no Mobile */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 w-64 shrink-0 bg-[#06050a] border-r border-purple-950/40 flex flex-col justify-between select-none transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-3.5 sm:p-4 border-b border-purple-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0f0d1a] border border-purple-900/40 flex items-center justify-center shrink-0">
                <Gem className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm tracking-wide text-white">
                    DIAMOND
                  </span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-purple-950 border border-purple-800/40 text-purple-300 font-mono">
                    AGENCY
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono text-left">
                  Claude Skills Runtime
                </p>
              </div>
            </div>

            {/* Botão de Fechar no Mobile */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#0e0c18] cursor-pointer"
              aria-label="Fechar menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-2 sm:p-2.5 space-y-1 mt-1 overflow-y-auto max-h-[calc(100vh-190px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#151224] text-white border border-purple-700/40 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#0c0a14] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 text-left">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-purple-400' : 'text-zinc-500'
                      }`}
                    />
                    <span className="truncate text-left">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded border shrink-0 ${
                        item.badgeColor ||
                        'bg-[#100d1d] text-purple-300 border-purple-900/40'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer com Status do Claude Code */}
        <div className="p-3 border-t border-purple-950/40 bg-[#040307] space-y-2">
          <div className="p-2 rounded-lg bg-[#0a0812] border border-purple-950/60 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-zinc-300 font-medium flex items-center gap-1.5 text-left">
                <Terminal className="w-3 h-3 text-purple-400" />
                Claude Code CLI
              </span>
              <span className="text-[8px] font-mono text-emerald-400">Ativo</span>
            </div>
            <div className="text-[9px] text-zinc-500 font-mono text-left truncate">
              bridge/empresa.mjs
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-start gap-2 px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-[#0c0a14] transition-all cursor-pointer text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Desconectar</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
