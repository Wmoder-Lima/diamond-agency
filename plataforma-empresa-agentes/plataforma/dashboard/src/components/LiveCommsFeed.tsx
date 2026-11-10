import React, { useState } from 'react';
import { 
  Radio, 
  Send, 
  ArrowRight, 
  Bot
} from 'lucide-react';
import { AgentAvatar } from './AgentAvatar';
import { Message, MOCK_AGENTS, MOCK_MESSAGES } from '../data/mockData';

interface LiveCommsFeedProps {
  realMessages?: any[];
  agentsMap?: Record<string, any>;
  onSendMessage?: (content: string, toAgent?: string) => void;
}

export const LiveCommsFeed: React.FC<LiveCommsFeedProps> = ({
  realMessages,
  agentsMap = {},
  onSendMessage
}) => {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputVal, setInputVal] = useState('');
  const [targetAgent, setTargetAgent] = useState<string>('todos');
  const [isSimulatingTyping, setIsSimulatingTyping] = useState(false);

  const allAgents = MOCK_AGENTS;
  const agentById = (id?: string) => {
    if (!id || id === 'humano') return { id: 'humano', name: 'Willy (Admin)', role: 'Comandante Geral', department: 'diretoria' };
    return allAgents.find((a) => a.id === id) || { id, name: id, role: 'Skill Claude', department: 'tecnologia' };
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      from_agent: 'humano',
      to_agent: targetAgent === 'todos' ? '' : targetAgent,
      content: inputVal,
      created_at: new Date().toISOString(),
      category: 'strategy'
    };

    setMessages((prev) => [newMsg, ...prev]);
    const sentText = inputVal;
    setInputVal('');

    if (onSendMessage) {
      onSendMessage(sentText, targetAgent);
    }

    setIsSimulatingTyping(true);
    setTimeout(() => {
      setIsSimulatingTyping(false);
      const responder = targetAgent !== 'todos' ? agentById(targetAgent) : allAgents[0];
      const responses = [
        `Comando registrado no runtime da skill. Executando ação via ponte local.`,
        `Entendido, Willy! Atualizando a rotina da skill e disparando handoff com a equipe.`,
        `Processado com sucesso pela skill do Claude. Parâmetros sincronizados.`,
        `Demanda incorporada à esteira de entrega da squad.`
      ];
      const autoReply: Message = {
        id: `msg-${Date.now() + 1}`,
        from_agent: responder.id,
        to_agent: 'humano',
        content: responses[Math.floor(Math.random() * responses.length)],
        created_at: new Date().toISOString(),
        category: 'strategy'
      };
      setMessages((prev) => [autoReply, ...prev]);
    }, 1500);
  };

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'code':
        return { label: 'Código', color: 'text-sky-400 bg-sky-950/40 border-sky-900/40' };
      case 'strategy':
        return { label: 'Estratégia', color: 'text-amber-400 bg-amber-950/40 border-amber-900/40' };
      case 'handoff':
        return { label: 'Handoff', color: 'text-purple-400 bg-purple-950/40 border-purple-900/40' };
      case 'alert':
        return { label: 'Alerta', color: 'text-rose-400 bg-rose-950/40 border-rose-900/40' };
      default:
        return { label: 'Sync', color: 'text-zinc-400 bg-zinc-900 border-zinc-800' };
    }
  };

  return (
    <div className="rounded-xl bg-[#080710] border border-purple-950/50 overflow-hidden flex flex-col h-[520px] sm:h-[580px] text-left">
      {/* Top Header Responsivo */}
      <div className="p-3 sm:p-3.5 border-b border-purple-950/40 bg-[#07060d] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 sm:p-1.5 rounded-lg bg-purple-950/40 border border-purple-900/40 text-purple-300 shrink-0">
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-semibold text-white tracking-wide truncate">
                Live Comms: Skills Claude
              </h3>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 font-mono shrink-0">
                AO VIVO
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 hidden sm:block truncate">
              Troca autônoma de mensagens entre as 18 skills do Claude
            </p>
          </div>
        </div>

        <span className="text-[9px] sm:text-[10px] text-zinc-500 font-mono">
          CLI: bridge/empresa.mjs
        </span>
      </div>

      {/* Feed com padding adaptativo */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3.5 space-y-2 sm:space-y-2.5">
        {messages.map((m) => {
          const from = agentById(m.from_agent);
          const to = m.to_agent ? agentById(m.to_agent) : null;
          const badge = getCategoryBadge(m.category);
          const isHuman = m.from_agent === 'humano';

          return (
            <div
              key={m.id}
              className={`p-2.5 sm:p-3 rounded-lg border text-left transition-all ${
                isHuman
                  ? 'bg-[#120f22] border-purple-800/40 ml-2 sm:ml-6'
                  : 'bg-[#0a0914] border-purple-950/50'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                <div className="flex items-center gap-1.5 sm:gap-2 truncate max-w-full">
                  <AgentAvatar agent={from} size="sm" />
                  <span className="text-xs font-semibold text-white truncate">
                    {from.name}
                  </span>

                  <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-600 shrink-0" />

                  {to ? (
                    <div className="flex items-center gap-1 truncate">
                      <AgentAvatar agent={to} size="sm" />
                      <span className="text-xs text-zinc-300 font-medium truncate">
                        {to.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#0e0c18] border border-purple-950 text-zinc-400 font-mono truncate">
                      Broadcast
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  <span
                    className={`text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded border font-mono ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono">
                    {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed pl-7 sm:pl-8">
                {m.content}
              </p>
            </div>
          );
        })}

        {isSimulatingTyping && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-[11px] text-zinc-400">
            <Bot className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span>Skill processando instrução...</span>
          </div>
        )}
      </div>

      {/* Input adaptativo para teclado mobile */}
      <form onSubmit={handleSend} className="p-2 sm:p-2.5 bg-[#07060d] border-t border-purple-950/40">
        <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
          <select
            value={targetAgent}
            onChange={(e) => setTargetAgent(e.target.value)}
            className="text-xs px-2 py-1.5 sm:py-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-zinc-300 focus:outline-none truncate"
          >
            <option value="todos">Transmissão Geral (Broadcast)</option>
            {allAgents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.department})
              </option>
            ))}
          </select>

          <div className="flex gap-1.5 flex-1">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Despacho para skills..."
              className="flex-1 text-xs px-3 py-1.5 sm:py-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-600"
            />

            <button
              type="submit"
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-3 h-3" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
