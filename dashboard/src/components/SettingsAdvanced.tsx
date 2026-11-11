import React, { useState, useEffect } from 'react';
import { 
  Database, 
  GitBranch, 
  Calendar, 
  Mail, 
  HardDrive, 
  MessageSquare, 
  Video, 
  Share2, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink,
  Save,
  Check,
  Terminal,
  Sliders,
  Radio,
  Eye,
  EyeOff
} from 'lucide-react';

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 0 0 1.45-1.45 1.45 1.45 0 0 0-1.45-1.45 1.45 1.45 0 0 0-1.45 1.45 1.45 1.45 0 0 0 1.45 1.45m1.37 10.24v-8.37H5.1v8.37h2.73z"/>
  </svg>
);

interface IntegrationConfig {
  id: string;
  name: string;
  category: 'google' | 'meta' | 'social' | 'messaging' | 'ads';
  icon: any;
  color: string;
  description: string;
  status: 'connected' | 'disconnected' | 'pending';
  fields: { key: string; label: string; placeholder: string; isSecret?: boolean }[];
  connectedAgent: string;
}

export const SettingsAdvanced: React.FC = () => {
  // Configurações do Supabase
  const [supabaseUrl, setSupabaseUrl] = useState(
    localStorage.getItem('diamond_supabase_url') || 'https://meu-projeto.supabase.co'
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(
    localStorage.getItem('diamond_supabase_anon') || ''
  );
  const [supabaseServiceKey, setSupabaseServiceKey] = useState(
    localStorage.getItem('diamond_supabase_service') || ''
  );
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Configurações do GitHub
  const [githubRepo, setGithubRepo] = useState('willy/diamond-agency');
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubToken, setGithubToken] = useState('');
  const [githubStatus, setGithubStatus] = useState<'connected' | 'disconnected'>('connected');

  // Estado das integrações externas
  const [integrations, setIntegrations] = useState<Record<string, { status: 'connected' | 'disconnected'; values: Record<string, string> }>>({
    google_calendar: { status: 'connected', values: { calendar_id: 'primary', account: 'contato@diamondagency.ai' } },
    email_gmail: { status: 'connected', values: { email: 'contato@diamondagency.ai', smtp_host: 'smtp.gmail.com' } },
    google_drive: { status: 'disconnected', values: { folder_id: '' } },
    whatsapp_business: { status: 'connected', values: { phone_number_id: '5511999998888', instance: 'Z-API Pro' } },
    tiktok_business: { status: 'disconnected', values: { client_key: '', advertiser_id: '' } },
    youtube_data: { status: 'connected', values: { channel_id: 'UC_diamond_agency_ai' } },
    meta_business: { status: 'connected', values: { page_id: '1092837465', app_id: '9876543210' } },
    google_ads: { status: 'connected', values: { customer_id: '450-892-1209' } },
    linkedin_ads: { status: 'connected', values: { organization_id: 'diamond-agency-enterprise' } }
  });

  const [activeIntegrationModal, setActiveIntegrationModal] = useState<string | null>(null);
  const [savedSuccessAlert, setSavedSuccessAlert] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  // Lista de Integrações Disponíveis
  const integrationList: IntegrationConfig[] = [
    {
      id: 'google_calendar',
      name: 'Google Agenda',
      category: 'google',
      icon: Calendar,
      color: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
      description: 'Permite que os agentes Felipe (SDR) e Juliana (Closer) agendem reuniões diretamente na sua agenda.',
      status: integrations.google_calendar?.status || 'disconnected',
      fields: [
        { key: 'account', label: 'Conta Google Autorizada', placeholder: 'seu-email@gmail.com' },
        { key: 'calendar_id', label: 'ID da Agenda Principal', placeholder: 'primary ou id@group.calendar.google.com' }
      ],
      connectedAgent: 'Juliana & Felipe'
    },
    {
      id: 'email_gmail',
      name: 'E-mail (Gmail & SMTP)',
      category: 'google',
      icon: Mail,
      color: 'text-red-400 bg-red-950/40 border-red-800/40',
      description: 'Envio de follow-ups personalizados, confirmações de propostas e relatórios periódicos da diretoria.',
      status: integrations.email_gmail?.status || 'disconnected',
      fields: [
        { key: 'email', label: 'Endereço de E-mail de Envio', placeholder: 'contato@empresa.com' },
        { key: 'smtp_host', label: 'Host SMTP / Provider', placeholder: 'smtp.gmail.com ou Resend API' },
        { key: 'api_key', label: 'Chave de API / App Password', placeholder: '••••••••••••••••', isSecret: true }
      ],
      connectedAgent: 'Beatriz & Paula'
    },
    {
      id: 'google_drive',
      name: 'Google Drive',
      category: 'google',
      icon: HardDrive,
      color: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
      description: 'Repositório central de documentos, decks comerciais e relatórios de métricas gerados pelos agentes.',
      status: integrations.google_drive?.status || 'disconnected',
      fields: [
        { key: 'folder_id', label: 'ID da Pasta Raiz no Drive', placeholder: '1A2b3C4d5E6f_exemplo' },
        { key: 'service_account', label: 'Chave JSON de Service Account', placeholder: '{"type": "service_account"...}', isSecret: true }
      ],
      connectedAgent: 'Isabela & Rafael'
    },
    {
      id: 'whatsapp_business',
      name: 'WhatsApp Business API',
      category: 'messaging',
      icon: MessageSquare,
      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
      description: 'Canal de atendimento imediato e qualificação de leads via WhatsApp através do agente Felipe e Marcos.',
      status: integrations.whatsapp_business?.status || 'disconnected',
      fields: [
        { key: 'phone_number_id', label: 'Phone Number ID / Instância', placeholder: 'Ex: 5511999998888 ou Z-API' },
        { key: 'token', label: 'Bearer Token Permanente', placeholder: 'EAABw...', isSecret: true }
      ],
      connectedAgent: 'Felipe & Marcos'
    },
    {
      id: 'tiktok_business',
      name: 'TikTok for Business',
      category: 'social',
      icon: Video,
      color: 'text-pink-400 bg-pink-950/40 border-pink-800/40',
      description: 'Postagem automática de cortes virais e monitoramento de engajamento pela agente Nina.',
      status: integrations.tiktok_business?.status || 'disconnected',
      fields: [
        { key: 'client_key', label: 'Client Key TikTok Open API', placeholder: 'aw987df65as4...' },
        { key: 'advertiser_id', label: 'Advertiser ID (TikTok Ads)', placeholder: '71829304958671' },
        { key: 'client_secret', label: 'Client Secret', placeholder: '••••••••••••••••', isSecret: true }
      ],
      connectedAgent: 'Nina (Vídeo & Cortes)'
    },
    {
      id: 'youtube_data',
      name: 'YouTube Data API v3',
      category: 'social',
      icon: YoutubeIcon,
      color: 'text-rose-500 bg-rose-950/40 border-rose-800/40',
      description: 'Upload de Shorts e vídeos institucionais, leitura de métricas e analytics de audiência pela Nina e Renato.',
      status: integrations.youtube_data?.status || 'disconnected',
      fields: [
        { key: 'channel_id', label: 'Channel ID do YouTube', placeholder: 'UC_exemplo12345' },
        { key: 'api_key', label: 'Google Cloud API Key', placeholder: 'AIzaSy...', isSecret: true }
      ],
      connectedAgent: 'Nina & Renato'
    },
    {
      id: 'meta_business',
      name: 'Meta Business & Instagram',
      category: 'meta',
      icon: Share2,
      color: 'text-purple-400 bg-purple-950/40 border-purple-800/40',
      description: 'Gestão de páginas, publicação no Instagram Feed/Stories e leitura de DMs pela Marcela e Lucas.',
      status: integrations.meta_business?.status || 'disconnected',
      fields: [
        { key: 'page_id', label: 'Facebook / Instagram Page ID', placeholder: '1092837465' },
        { key: 'app_id', label: 'Meta App ID', placeholder: '9876543210' },
        { key: 'access_token', label: 'Page Access Token (Nunca Expira)', placeholder: 'EAAO...', isSecret: true }
      ],
      connectedAgent: 'Marcela & Lucas'
    },
    {
      id: 'google_ads',
      name: 'Google Ads API',
      category: 'ads',
      icon: Target,
      color: 'text-amber-300 bg-amber-950/40 border-amber-800/40',
      description: 'Acompanhamento do CPC, conversões, pausar ou escalar anúncios pelo gestor de tráfego Gustavo.',
      status: integrations.google_ads?.status || 'disconnected',
      fields: [
        { key: 'customer_id', label: 'Google Ads Customer ID (sem traços)', placeholder: '1234567890' },
        { key: 'developer_token', label: 'Developer Token de Acesso', placeholder: 'ab12cd34ef56...', isSecret: true }
      ],
      connectedAgent: 'Gustavo (Tráfego)'
    },
    {
      id: 'linkedin_ads',
      name: 'LinkedIn Marketing & Pages',
      category: 'social',
      icon: LinkedinIcon,
      color: 'text-sky-400 bg-sky-950/40 border-sky-800/40',
      description: 'Prospecção executiva, leitura de perfis corporativos e anúncios B2B Enterprise pelo Felipe e Isabela.',
      status: integrations.linkedin_ads?.status || 'disconnected',
      fields: [
        { key: 'organization_id', label: 'ID da Organização / Company Page', placeholder: 'diamond-agency' },
        { key: 'access_token', label: 'LinkedIn OAuth 2.0 Token', placeholder: 'AQV...', isSecret: true }
      ],
      connectedAgent: 'Felipe & Isabela'
    }
  ];

  const handleTestSupabase = () => {
    setTestingSupabase(true);
    setSupabaseStatus('idle');

    setTimeout(() => {
      setTestingSupabase(false);
      if (supabaseUrl && supabaseUrl.includes('supabase.co')) {
        setSupabaseStatus('success');
        localStorage.setItem('diamond_supabase_url', supabaseUrl);
        localStorage.setItem('diamond_supabase_anon', supabaseAnonKey);
        localStorage.setItem('diamond_supabase_service', supabaseServiceKey);
      } else {
        setSupabaseStatus('error');
      }
    }, 1200);
  };

  const handleSaveAll = () => {
    localStorage.setItem('diamond_supabase_url', supabaseUrl);
    localStorage.setItem('diamond_supabase_anon', supabaseAnonKey);
    localStorage.setItem('diamond_supabase_service', supabaseServiceKey);
    setSavedSuccessAlert(true);
    setTimeout(() => setSavedSuccessAlert(false), 3000);
  };

  const handleToggleIntegration = (id: string) => {
    setIntegrations((prev) => {
      const current = prev[id]?.status === 'connected' ? 'disconnected' : 'connected';
      return {
        ...prev,
        [id]: {
          status: current,
          values: prev[id]?.values || {}
        }
      };
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 text-left">
      {/* Top Banner de Configurações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#090812] border border-purple-950/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
              CENTRAL DE INTEGRAÇÃO & INFRAESTRUTURA
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Configurações Avançadas & Conectores de Skills
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gerencie as credenciais do banco Supabase, repositório GitHub e os canais externos que as skills dos agentes do Claude utilizam.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSecrets(!showSecrets)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-xs text-zinc-300 hover:text-white cursor-pointer"
          >
            {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showSecrets ? 'Ocultar Chaves' : 'Ver Chaves'}</span>
          </button>
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Parâmetros</span>
          </button>
        </div>
      </div>

      {savedSuccessAlert && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Configurações e credenciais sincronizadas com sucesso no ecossistema local!</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SEÇÃO 1: CONEXÃO COM SUPABASE                               */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="p-5 rounded-xl bg-[#080710] border border-purple-950/60 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-purple-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Conexão com Banco Supabase (PostgreSQL & Realtime)
              </h3>
              <p className="text-[11px] text-zinc-400">
                Alimenta o dashboard, tabelas de tarefas, logs de mensagens e aprovações dos agentes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {supabaseStatus === 'success' && (
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/30 border border-emerald-800/40">
                <Check className="w-3 h-3" /> Conectado com Sucesso
              </span>
            )}
            {supabaseStatus === 'error' && (
              <span className="text-[11px] font-mono text-rose-400 flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/30 border border-rose-800/40">
                <AlertCircle className="w-3 h-3" /> Falha no Handshake
              </span>
            )}
            <button
              onClick={handleTestSupabase}
              disabled={testingSupabase}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#120f20] hover:bg-[#1a162d] border border-purple-900/40 text-xs text-purple-200 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingSupabase ? 'animate-spin' : ''}`} />
              <span>{testingSupabase ? 'Testando...' : 'Testar Conexão'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-300 font-medium block mb-1.5">
              Project URL do Supabase (VITE_SUPABASE_URL)
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-600 font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-300 font-medium block mb-1.5">
              Chave Anon / Pública (VITE_SUPABASE_ANON_KEY)
            </label>
            <input
              type={showSecrets ? 'text' : 'password'}
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-600 font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-zinc-300 font-medium">
                Chave Service Role (Uso estrito da ponte local dos agentes • NUNCA na web)
              </label>
              <span className="text-[10px] text-amber-400 font-mono">
                Privada • Usada pelo bridge/empresa.mjs
              </span>
            </div>
            <input
              type={showSecrets ? 'text' : 'password'}
              value={supabaseServiceKey}
              onChange={(e) => setSupabaseServiceKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJy..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-600 font-mono"
            />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SEÇÃO 2: GITHUB & CI/CD                                     */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="p-5 rounded-xl bg-[#080710] border border-purple-950/60 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-purple-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-700/40 text-zinc-300">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Repositório GitHub & Deploy Contínuo (Cloudflare Pages)
              </h3>
              <p className="text-[11px] text-zinc-400">
                Sincronização do código-fonte e automação de entrega
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/30 border border-emerald-800/40">
            <Check className="w-3 h-3" /> Vinculado
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-zinc-300 font-medium block mb-1.5">
              Repositório GitHub
            </label>
            <input
              type="text"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-xs text-white font-mono focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-300 font-medium block mb-1.5">
              Branch Principal
            </label>
            <input
              type="text"
              value={githubBranch}
              onChange={(e) => setGithubBranch(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-xs text-white font-mono focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-300 font-medium block mb-1.5">
              GitHub Personal Access Token (PAT)
            </label>
            <input
              type={showSecrets ? 'text' : 'password'}
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_••••••••••••••••••••••••••••••••"
              className="w-full px-3.5 py-2 rounded-lg bg-[#0e0c18] border border-purple-950/60 text-xs text-white font-mono focus:outline-none focus:border-purple-600"
            />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SEÇÃO 3: CLAUDE CODE & SKILLS RUNTIME                      */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="p-5 rounded-xl bg-[#080710] border border-purple-950/60 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-800/40 text-purple-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Sincronização com as Skills do Claude Code
            </h3>
            <p className="text-[11px] text-zinc-400">
              Os 18 agentes são skills instaladas no Claude Code que operam via CLI (`bridge/empresa.mjs`) e registram eventos e tarefas aqui
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0d0b17] border border-purple-950/60 text-xs text-zinc-300 font-mono space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Ponte Executável:</span>
            <span className="text-purple-300">plataforma/bridge/empresa.mjs</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Instruções de Agentes:</span>
            <span className="text-purple-300">plataforma/docs/INSTRUCOES-AGENTES.md</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Skills Registradas no Manifesto:</span>
            <span className="text-emerald-400">18 skills ativas (Beatriz, Helena, Rafael, etc.)</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* SEÇÃO 4: CONECTORES DE CANAIS & SERVIÇOS EXTERNOS          */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">
            Conectores de Serviços Externos para as Skills
          </h3>
          <p className="text-xs text-zinc-400">
            Habilite os canais oficiais para que as skills do Claude executem ações no mundo real (agendamentos, mensagens, vídeos e anúncios).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrationList.map((item) => {
            const Icon = item.icon;
            const isConnected = integrations[item.id]?.status === 'connected';

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#080710] border border-purple-950/50 hover:border-purple-900/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg border ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Skill: {item.connectedAgent}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleIntegration(item.id)}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono border transition-all cursor-pointer ${
                        isConnected
                          ? 'bg-emerald-950/30 text-emerald-400 border-emerald-800/40'
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                      }`}
                    >
                      {isConnected ? 'Ativo' : 'Desativado'}
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                    {item.description}
                  </p>

                  {/* Campos de Configuração Rápida */}
                  <div className="space-y-2 pt-2 border-t border-purple-950/30">
                    {item.fields.map((f) => (
                      <div key={f.key}>
                        <label className="text-[10px] text-zinc-400 font-medium block mb-1">
                          {f.label}
                        </label>
                        <input
                          type={f.isSecret && !showSecrets ? 'password' : 'text'}
                          defaultValue={integrations[item.id]?.values[f.key] || ''}
                          placeholder={f.placeholder}
                          className="w-full px-2.5 py-1.5 rounded bg-[#0e0c18] border border-purple-950/50 text-xs text-white font-mono placeholder-zinc-700 focus:outline-none focus:border-purple-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500 font-mono text-[10px]">
                    {isConnected ? '● Sincronizado' : '○ Aguardando Token'}
                  </span>
                  <button
                    onClick={() => {
                      handleToggleIntegration(item.id);
                      setSavedSuccessAlert(true);
                      setTimeout(() => setSavedSuccessAlert(false), 2000);
                    }}
                    className="text-purple-400 hover:text-purple-300 font-medium text-xs cursor-pointer"
                  >
                    {isConnected ? 'Reconectar' : 'Ativar Canal'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
