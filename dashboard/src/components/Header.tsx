import React, { useState } from 'react';
import { Search, Bell, Shield, Menu, X } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  pendingApprovalsCount: number;
  onOpenApprovals: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  pendingApprovalsCount,
  onOpenApprovals,
  onToggleMobileMenu
}) => {
  const [showSearchMobile, setShowSearchMobile] = useState(false);

  return (
    <header className="h-14 sm:h-16 px-3 sm:px-6 bg-[#06050a]/90 border-b border-purple-950/40 flex items-center justify-between backdrop-blur-xl z-20 shrink-0 select-none">
      {/* Botão Menu Hambúrguer para Mobile + Busca */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-zinc-300 hover:text-white cursor-pointer shrink-0"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Busca Universal */}
        <div className="relative w-full max-w-[200px] sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-600 transition-all font-mono"
          />
        </div>
      </div>

      {/* Ações da Direita */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
        {/* Notificações de Aprovação */}
        <button
          onClick={onOpenApprovals}
          className="relative p-2 rounded-lg bg-[#0e0c18] hover:bg-[#141222] border border-purple-950/60 text-zinc-300 hover:text-white transition-all cursor-pointer"
          title={`${pendingApprovalsCount} aprovações pendentes`}
        >
          <Bell className="w-4 h-4" />
          {pendingApprovalsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-black text-[9px] font-bold flex items-center justify-center animate-pulse">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        {/* Perfil Admin */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-purple-950/40">
          <div className="relative shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0e0c18] border border-purple-900/40 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#06050a]" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-white leading-tight">Willy</div>
            <div className="text-[10px] text-zinc-500 font-mono">Diretoria</div>
          </div>
        </div>
      </div>
    </header>
  );
};
