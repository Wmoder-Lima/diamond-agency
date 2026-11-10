import React, { useState } from 'react';
import { 
  Radio, 
  Send, 
  ArrowRight, 
  MessageSquare
} from 'lucide-react';
import { AgentAvatar } from './AgentAvatar';
import { supabase } from '../supabase';

interface LiveCommsFeedProps {
  messages?: any[];
  agents?: any[];
  onSendMessage?: (content: string, toAgent?: string) => void;
}

export const LiveCommsFeed: React.FC<LiveCommsFeedProps> = ({
  messages = [],
  agents = [],
  onSendMessage
}) => {
  const [inputVal, setInputVal] = useState('');
  const [targetAgent, setTargetAgent] = useState<string>('todos');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const agentById = (id?: string) => {
    if (!id || id === 'humano') return { id: 'humano', name: 'Você (Admin)', role: 'Diretoria', department: 'diretoria' };
    const found = agents.find((a) => a.id === id);
    if (found) return found;
    return { id, name: id, role: 'Agente IA', department: 'tecnologia' };
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isSending) return;

    setIsSending(true);
    setSendError(null);
    const content = inputVal.trim();

    try {
      // Inserção real no banco Supabase
      const { error } = await supabase.from('messages').insert({
        from_agent: 'humano',
        to_agent: targetAgent === 'todos' ? null : targetAgent,
        content
      });

      if (error) {
        setSendError(error.message);
      } else {
        setInputVal('');
        if (onSendMessage) {
          onSendMessage(content, targetAgent);
        }
      }
    } catch (err: any) {
      setSendError(err?.message || 'Falha ao despachar mensagem');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="rounded-xl bg-[#080710] border border-purple-950/50 overflow-hidden flex flex-col h-[520px] sm:h-[580px] text-left">
      {/* Top Header */}
      <div className="p-3 sm:p-3.5 border-b border-purple-950/40 bg-[#07060d] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 sm:p-1.5 rounded-lg bg-purple-950/40 border border-purple-900/40 text-purple-300 shrink-0">
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-semibold text-white tracking-wide truncate">
                Live Comms: Mensagens em Tempo Real
              </h3>
              <span className="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 font-mono shrink-0">
                SUPABASE REALTIME
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 hidden sm:block truncate">
              {messages.length} mensagens sincronizadas ao vivo na tabela messages
            </p>
          </div>
        </div>

        <span className="text-[9px] sm:text-[10px] text-zinc-500 font-mono">
          CLI: node empresa.mjs
        </span>
      </div>

      {/* Feed de Mensagens Reais */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3.5 space-y-2 sm:space-y-2.5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#0e0c18] border border-purple-950/60 flex items-center justify-center text-purple-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-300">Nenhuma mensagem registrada ainda</h4>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-sm">
                Envie um despacho pelo campo abaixo ou execute comandos no terminal usando a ponte local dos agentes:
              </p>
              <code className="text-[10px] text-purple-300 bg-[#0e0c18] px-2 py-1 rounded mt-2 inline-block border border-purple-950 font-mono">
                node empresa.mjs log "Primeira mensagem" --agent beatriz
              </code>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const from = agentById(m.from_agent);
            const to = m.to_agent ? agentById(m.to_agent) : null;
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
                        Broadcast Geral
                      </span>
                    )}
                  </div>

                  <span className="text-[9px] text-zinc-500 font-mono ml-auto">
                    {m.created_at ? new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed pl-7 sm:pl-8">
                  {m.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      {sendError && (
        <div className="px-3 py-1 bg-rose-950/40 border-t border-rose-900/40 text-rose-300 text-[10px]">
          Erro ao enviar: {sendError}
        </div>
      )}

      {/* Input de Envio de Comando */}
      <form onSubmit={handleSend} className="p-2 sm:p-2.5 bg-[#07060d] border-t border-purple-950/40">
        <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
          <select
            value={targetAgent}
            onChange={(e) => setTargetAgent(e.target.value)}
            className="text-xs px-2 py-1.5 sm:py-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-zinc-300 focus:outline-none truncate"
          >
            <option value="todos">Transmissão Geral (Broadcast)</option>
            {agents.map((a) => (
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
              placeholder="Despacho para o banco de dados dos agentes..."
              className="flex-1 text-xs px-3 py-1.5 sm:py-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-600"
            />

            <button
              type="submit"
              disabled={isSending || !inputVal.trim()}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-3 h-3" />
              <span className="hidden sm:inline">{isSending ? 'Gravando...' : 'Enviar'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
