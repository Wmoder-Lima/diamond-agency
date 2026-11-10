import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Gem, Mail, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, Sparkles, Terminal } from 'lucide-react';

interface LoginViewProps {
  onBypassDev?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onBypassDev }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setStatus('error');
        setErrorMessage(error.message);
      } else {
        setStatus('success');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || 'Falha na conexão com o Supabase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#030206] text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Luz radial de fundo sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-950/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card de Login */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#080710]/90 border border-purple-950/60 shadow-2xl backdrop-blur-xl text-left space-y-6">
          {/* Header Brand */}
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0f0d1a] border border-purple-900/50 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <Gem className="w-6 h-6 text-purple-400" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-base tracking-wide text-white">
                  DIAMOND AGENCY
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 border border-purple-800/40 text-purple-300 font-mono">
                  SUPABASE AUTH
                </span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Acesso à Central de Agentes
              </h1>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Digite o e-mail autorizado nas regras do banco de dados (RLS). Você receberá um link mágico de acesso direto sem senha.
              </p>
            </div>
          </div>

          {/* Feedback de Sucesso */}
          {status === 'success' ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Link mágico enviado com sucesso!</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Verifique a caixa de entrada (e a pasta de spam) de <strong className="text-white">{email}</strong> e clique no link para autenticar automaticamente.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="text-[11px] text-purple-400 hover:text-purple-300 pt-1 cursor-pointer"
              >
                Enviar para outro e-mail
              </button>
            </div>
          ) : (
            /* Formulário de Envio */
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-300 font-medium block">
                  E-mail Autorizado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu-email@exemplo.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e0c18] border border-purple-950/80 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-600 transition-all font-mono"
                    autoFocus
                  />
                </div>
              </div>

              {status === 'error' && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enviando link de acesso...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Link de Acesso</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Dicas e Instruções */}
          <div className="pt-4 border-t border-purple-950/40 space-y-2 text-[11px] text-zinc-500 font-mono">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Autenticação criptografada via Supabase OTP</span>
            </div>
            <div className="text-[10px] text-zinc-600 leading-relaxed">
              * Certifique-se de ter configurado <span className="text-zinc-400">http://localhost:5173</span> em Authentication → URL Configuration no painel do Supabase.
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-zinc-600 font-mono">
            Diamond Agency Platform • Orquestrador de Agentes
          </p>
        </div>
      </div>
    </div>
  );
};
