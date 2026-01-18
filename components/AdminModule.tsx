
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, Key, Webhook, Plus, ShieldCheck, 
  Activity, Server, Zap, Loader2, Trash2, 
  Settings, Play, ExternalLink, RefreshCcw, 
  Code, Database, Cpu, Bot, TrendingUp,
  Download, FileJson, Sparkles, MessageSquare, 
  ArrowRight, CheckCircle2, ShoppingCart, 
  Building2, UserCog, CreditCard, Ban, 
  Unlock, Search, Filter, MoreVertical,
  BarChart3, Globe, ShieldAlert, Power, X,
  Layers, Terminal, Radio, HardDrive,
  ChevronRight, Command, FileCode, Box, Table,
  Palette, Camera, Smartphone, Globe2, Eye, History, ShieldQuestion,
  Type, Check, FileDown, BookCopy, Sun, Moon, Frame
} from 'lucide-react';
import { IntegrationSettings } from './IntegrationSettings';
import { Tenant, EvolutionConfig, N8nWorkflow, UserRole, BrandingConfig } from '../types';

interface Props {
  branding: BrandingConfig;
  onBrandingChange: (config: BrandingConfig) => void;
  onNicheChange: (niche: string) => void;
  evolutionConfig: EvolutionConfig;
  onEvolutionConfigChange: (config: EvolutionConfig) => void;
  notify: (msg: string) => void;
}

const INITIAL_TENANTS: Tenant[] = [
  { id: '1', name: 'Barbearia VIP Matriz', niche: 'Barbearia', healthScore: 98, revenue: 4500, activeLeads: 1240, status: 'ONLINE' },
  { id: '2', name: 'Clínica Odonto Prime', niche: 'Saúde', healthScore: 85, revenue: 12000, activeLeads: 3500, status: 'ONLINE' },
  { id: '3', name: 'Imobiliária Horizonte', niche: 'Imóveis', healthScore: 45, revenue: 0, activeLeads: 150, status: 'WARNING' },
  { id: '4', name: 'Academia Force One', niche: 'Fitness', healthScore: 0, revenue: 0, activeLeads: 0, status: 'OFFLINE' },
];

const WORKFLOW_BLUEPRINTS = [
  { id: 'bp1', name: 'Onboarding WhatsApp IA', description: 'Recepção e Qualificação via Gemini 3.0', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'bp2', name: 'Notificador Vendas Master', description: 'Webhooks de Checkout para Slack/Whats', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'bp3', name: 'Sync Google Sheets B2B', description: 'Exportação massiva de leads qualificados', color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'bp4', name: 'Recuperação de Carrinho', description: 'Régua de 72h para leads parados', color: 'text-rose-600', bg: 'bg-rose-50' }
];

const DEFAULT_WORKFLOWS: N8nWorkflow[] = [
  { id: 'wf_core_01', name: 'Gateway: Captação Multi-Canal', webhookUrl: 'https://n8n.clikai.com.br/webhook/v1/inbound-master', event: 'LEAD_CREATED', status: 'ACTIVE' },
  { id: 'wf_core_02', name: 'Neural Qualify: Core Intelligence', webhookUrl: 'https://n8n.clikai.com.br/webhook/v1/ai-qualification', event: 'AI_QUALIFIED', status: 'ACTIVE' },
  { id: 'wf_core_03', name: 'Smart Scheduler: Sync Operacional', webhookUrl: 'https://n8n.clikai.com.br/webhook/v1/auto-booking', event: 'STAGE_CHANGED', status: 'ACTIVE' },
  { id: 'wf_core_04', name: 'Billing Hook: Sync Financeiro', webhookUrl: 'https://n8n.clikai.com.br/webhook/v1/payment-confirm', event: 'PAYMENT_RECEIVED', status: 'ACTIVE' },
];

export const AdminModule: React.FC<Props> = ({ branding, onBrandingChange, evolutionConfig, onEvolutionConfigChange, notify }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'infra' | 'n8n' | 'integrations' | 'branding'>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Lógica de Persistência com Migração de Domínio Automática
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>(() => {
    const saved = localStorage.getItem('z_prospector_workflows');
    if (saved) {
      try { 
        let parsed = JSON.parse(saved);
        // Garante que o domínio seja clikai.com.br mesmo se houver dados antigos
        const migrated = parsed.map((wf: N8nWorkflow) => ({
          ...wf,
          webhookUrl: wf.webhookUrl.replace('n8n.zprospector.com', 'n8n.clikai.com.br')
        }));
        return migrated;
      } catch(e) { return DEFAULT_WORKFLOWS; }
    }
    return DEFAULT_WORKFLOWS;
  });

  useEffect(() => {
    localStorage.setItem('z_prospector_workflows', JSON.stringify(workflows));
  }, [workflows]);

  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [newWf, setNewWf] = useState({ name: '', url: '', event: 'LEAD_CREATED' });

  const [showNewTenantModal, setShowNewTenantModal] = useState(false);
  const [newTenantForm, setNewTenantForm] = useState({ name: '', niche: 'Barbearia' });

  const [showCli, setShowCli] = useState(false);
  const [cliInput, setCliInput] = useState('');
  const [cliLogs, setCliLogs] = useState<string[]>(['Master Command CLI v3.0.0', 'Authority Authenticated.', 'Type "help" for instructions.']);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [aiLoad, setAiLoad] = useState(64);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [localBranding, setLocalBranding] = useState<BrandingConfig>(branding);
  useEffect(() => { setLocalBranding(branding); }, [branding]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadType, setCurrentUploadType] = useState<keyof BrandingConfig | null>(null);
  const [evoUrl, setEvoUrl] = useState(evolutionConfig.baseUrl);
  const [evoKey, setEvoKey] = useState(evolutionConfig.apiKey);

  /**
   * GERA UM JSON VÁLIDO PARA O n8n (Versão 2.0+)
   * Branding Z-Prospector, Infra Clikai
   */
  const handleDownloadWorkflowJSON = (wf: any) => {
    const workflowData = {
      meta: {
        instanceId: "zprospector-master-auth-" + Math.random().toString(36).substring(7)
      },
      nodes: [
        {
          parameters: {
            path: wf.id || "webhook-inbound",
            options: {}
          },
          id: "3d5a4f6d-3e6c-4b6a-9f5e-1a2b3c4d5e6f",
          name: "Webhook Master Inbound",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [250, 300],
          webhookId: wf.id || "webhook-inbound"
        },
        {
          parameters: {
            values: {
              string: [
                {
                  name: "tenant_id",
                  value: "={{ $json.body.tenant_id || 'master' }}"
                },
                {
                  name: "source",
                  value: "ZPROSPECTOR-ORCHESTRATOR"
                }
              ]
            },
            options: {}
          },
          id: "4e6b5g7h-4f7d-5c7b-0g6f-2b3c4d5e6f7g",
          name: "Set Master Context",
          type: "n8n-nodes-base.set",
          typeVersion: 1,
          position: [500, 300]
        },
        {
          parameters: {
            content: "## " + wf.name + "\nBlueprint gerado automaticamente pelo console Master do Z-Prospector. Este workflow está pronto para importação via https://n8n.clikai.com.br"
          },
          id: "5f7c6h8i-5g8e-6d8c-1h7g-3c4d5e6f7g8h",
          name: "Blueprint Info",
          type: "n8n-nodes-base.stickyNote",
          typeVersion: 1,
          position: [200, 100]
        }
      ],
      connections: {
        "Webhook Master Inbound": {
          main: [
            [
              {
                node: "Set Master Context",
                type: "main",
                index: 0
              }
            ]
          ]
        }
      },
      settings: {
        executionOrder: "v1"
      },
      staticData: null,
      pinData: {},
      versionId: "1e2f3g4h-5i6j-7k8l-9m0n-o1p2q3r4s5t6"
    };
    
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `n8n_zprospector_${wf.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify(`Blueprint "${wf.name}" exportado via n8n.clikai.com.br!`);
  };

  const handleToggleWf = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, status: w.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : w));
    const wf = workflows.find(w => w.id === id);
    notify(`Workflow ${wf?.name} ${wf?.status === 'ACTIVE' ? 'PAUSADO' : 'ATIVADO'} na rede.`);
  };

  const handleAddWf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWf.name || !newWf.url) return;
    
    // Forçar domínio clikai na criação se o usuário tentar outro
    const sanitizedUrl = newWf.url.replace('n8n.zprospector.com', 'n8n.clikai.com.br');
    
    const workflow: N8nWorkflow = { 
      id: `wf_${Date.now()}`, 
      name: newWf.name, 
      webhookUrl: sanitizedUrl, 
      event: newWf.event as any, 
      status: 'ACTIVE' 
    };
    setWorkflows([workflow, ...workflows]);
    setShowWorkflowModal(false);
    setNewWf({ name: '', url: '', event: 'LEAD_CREATED' });
    notify('Novo Workflow Provisionado em clikai.com.br!');
  };

  const handleDeleteWf = (id: string) => {
    if (confirm('Deseja destruir permanentemente esta automação?')) {
      setWorkflows(prev => prev.filter(w => w.id !== id));
      notify('Workflow removido da infraestrutura.');
    }
  };

  const handleTestWf = (wf: N8nWorkflow) => {
    notify(`Ping clikai.com.br: ${wf.name}...`);
    setTimeout(() => notify('Status: 200 OK (Ativo)'), 1000);
  };

  const filteredTenants = useMemo(() => {
    return tenants.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.niche.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tenants, searchQuery]);

  const handleToggleTenantStatus = (id: string) => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'OFFLINE' ? 'ONLINE' : 'OFFLINE' as any } : t));
    notify('Status da Unidade atualizado.');
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const newT: Tenant = { id: Date.now().toString(), name: newTenantForm.name, niche: newTenantForm.niche, healthScore: 100, revenue: 0, activeLeads: 0, status: 'ONLINE' };
    setTenants([newT, ...tenants]);
    setShowNewTenantModal(false);
    setNewTenantForm({ name: '', niche: 'Barbearia' });
    notify(`Unidade ${newT.name} provisionada!`);
  };

  const triggerUpload = (type: keyof BrandingConfig) => {
    setCurrentUploadType(type);
    fileInputRef.current?.click();
  };

  const handleBrandingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const type = currentUploadType;
    if (file && type) {
      setIsUploading(type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalBranding(prev => ({ ...prev, [type]: reader.result as string }));
        setIsUploading(null);
        notify(`Ativo ${type} carregado!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSaveBranding = () => {
    setIsSaving(true);
    setTimeout(() => {
      onBrandingChange(localBranding);
      setIsSaving(false);
      notify('Identidade Master propagada!');
    }, 1500);
  };

  const handleSaveInfra = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onEvolutionConfigChange({ baseUrl: evoUrl, apiKey: evoKey, enabled: true });
      setIsSaving(false);
      notify('Infraestrutura sincronizada!');
    }, 1200);
  };

  const handleCliCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = cliInput.toLowerCase().trim();
    let res = `> ${cliInput}`;
    if (cmd === 'help') res = 'Commands: status, health, clear, reboot, instances';
    if (cmd === 'status') res = 'All instances ONLINE. Latency: 14ms.';
    if (cmd === 'instances') res = `Active Tenants: ${tenants.length} | Load: 12%`;
    if (cmd === 'clear') { setCliLogs([]); setCliInput(''); return; }
    setCliLogs([...cliLogs, res]);
    setCliInput('');
  };

  const securityIncidents = [
    { id: 1, title: 'Brute Force Bloqueado (Rio)', time: 'Há 2 min', severity: 'HIGH', detail: 'IP 182.x.x bloqueado após 10 tentativas.' },
    { id: 2, title: 'VPS Evolution Offline (Curitiba)', time: 'Há 1h', severity: 'MEDIUM', detail: 'A instância da unidade parou de responder.' },
  ];

  return (
    <div className="p-10 space-y-10 animate-in fade-in pb-32">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.svg" onChange={handleBrandingUpload} />

      {/* MODAL AUDITORIA (REDE) */}
      {selectedIncident && (
        <div className="fixed inset-0 z-[320] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3.5rem] shadow-2xl p-12 relative border border-slate-200 dark:border-slate-800">
              <button onClick={() => setSelectedIncident(null)} className="absolute top-10 right-10 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400"><X size={24} /></button>
              <h3 className="text-2xl font-black italic uppercase tracking-tight mb-4">Relatório de Auditoria</h3>
              <div className={`p-6 rounded-3xl mb-8 ${selectedIncident.severity === 'HIGH' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                 <p className="font-black uppercase text-xs mb-2">Detalhes Técnicos:</p>
                 <p className="text-sm font-bold">{selectedIncident.detail}</p>
              </div>
              <button onClick={() => setSelectedIncident(null)} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase text-xs">Fechar Auditoria</button>
           </div>
        </div>
      )}

      {/* MODAL NOVA UNIDADE */}
      {showNewTenantModal && (
        <div className="fixed inset-0 z-[320] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3.5rem] shadow-2xl p-12 relative">
             <button onClick={() => setShowNewTenantModal(false)} className="absolute top-10 right-10 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400"><X size={24} /></button>
             <h3 className="text-2xl font-black italic uppercase tracking-tight mb-8">Provisionar Unidade</h3>
             <form onSubmit={handleCreateTenant} className="space-y-6">
                <input required value={newTenantForm.name} onChange={e => setNewTenantForm({...newTenantForm, name: e.target.value})} placeholder="Nome Comercial" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold" />
                <select value={newTenantForm.niche} onChange={e => setNewTenantForm({...newTenantForm, niche: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold">
                   <option value="Barbearia">Barbearia</option>
                   <option value="Saúde">Saúde</option>
                   <option value="Imóveis">Imobiliária</option>
                </select>
                <button type="submit" className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl uppercase text-xs">Ativar Unidade</button>
             </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO WORKFLOW (N8N) */}
      {showWorkflowModal && (
        <div className="fixed inset-0 z-[320] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3.5rem] shadow-2xl p-12 relative border border-white/10 overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl"></div>
             <button onClick={() => setShowWorkflowModal(false)} className="absolute top-10 right-10 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-orange-500 transition-all z-20"><X size={24} /></button>
             <div className="flex items-center gap-4 mb-10">
                <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl shadow-sm"><Cpu size={32} /></div>
                <div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tight">Novo Pipeline de Rede</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Injeção de lógica global via n8n Master</p>
                </div>
             </div>
             <form onSubmit={handleAddWf} className="space-y-6 relative z-10">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Identificador da Automação</label>
                   <input required value={newWf.name} onChange={e => setNewWf({...newWf, name: e.target.value})} placeholder="Ex: Master Recovery Workflow" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-orange-500/10" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">URL do Webhook n8n Master</label>
                   <input required value={newWf.url} onChange={e => setNewWf({...newWf, url: e.target.value})} placeholder="https://n8n.clikai.com.br/..." className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-orange-500/10" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Evento de Gatilho</label>
                   <select value={newWf.event} onChange={e => setNewWf({...newWf, event: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-orange-500/10">
                      <option value="LEAD_CREATED">Novo Lead (Inbound)</option>
                      <option value="AI_QUALIFIED">Qualificação IA Concluída</option>
                      <option value="STAGE_CHANGED">Mudança de Estágio CRM</option>
                      <option value="PAYMENT_RECEIVED">Venda Liquidada</option>
                   </select>
                </div>
                <button type="submit" className="w-full py-6 bg-orange-600 text-white font-black rounded-3xl shadow-xl uppercase text-xs tracking-widest hover:bg-orange-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                   <Plus size={20} /> Ativar Automação na Rede
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Header Master Authority */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl transform -rotate-6 overflow-hidden">
              <img src={localBranding.iconLogo} className="w-10 h-10 object-contain" />
           </div>
           <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-4xl font-black italic uppercase tracking-tight">Master Admin</h1>
                 <span className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg shadow-lg">Authority Active</span>
              </div>
              <p className="text-slate-500 font-bold uppercase text-[10px] mt-1">Controle de Infraestrutura, Branding e Redes</p>
           </div>
        </div>
        <div className="flex gap-3">
           <button onClick={() => setShowCli(!showCli)} className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase hover:border-indigo-600 transition-all">
              <Terminal size={18} className="text-emerald-500" /> Terminal CLI
           </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-hidden gap-2 md:gap-4 no-scrollbar">
        {[
          { id: 'overview', label: 'Rede', icon: Globe },
          { id: 'tenants', label: 'Unidades', icon: Building2 },
          { id: 'branding', label: 'Marca', icon: Palette },
          { id: 'infra', label: 'Infra', icon: Server },
          { id: 'n8n', label: 'n8n', icon: Cpu },
          { id: 'integrations', label: 'Conta', icon: CreditCard },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-5 px-3 border-b-4 font-black text-[10px] md:text-[11px] transition-all whitespace-nowrap tracking-widest uppercase flex-1 justify-center ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10' 
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CLI AREA */}
      {showCli && (
        <div className="bg-slate-900 rounded-3xl p-6 font-mono text-xs text-emerald-400 shadow-2xl animate-in slide-in-from-top-4">
           <div className="h-40 overflow-y-auto mb-4 custom-scrollbar">
              {cliLogs.map((log, i) => <p key={i} className="mb-1">{log}</p>)}
           </div>
           <form onSubmit={handleCliCommand} className="flex gap-3">
              <span className="text-emerald-600 font-bold">$</span>
              <input value={cliInput} onChange={e => setCliInput(e.target.value)} className="bg-transparent border-none outline-none flex-1 text-white" placeholder="command..." autoFocus />
           </form>
        </div>
      )}

      <div className="mt-8">
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-5">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { label: 'MRR Acumulado', value: 'R$ 48.900', icon: TrendingUp, color: 'text-emerald-500' },
                  { label: 'Unidades Ativas', value: tenants.length.toString(), icon: Building2, color: 'text-indigo-500' },
                  { label: 'Uptime Global', value: '99.98%', icon: Activity, color: 'text-cyan-500' },
                  { label: 'IA Load', value: `${aiLoad}%`, icon: Bot, color: 'text-yellow-500' },
                ].map((kpi, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{kpi.label}</p>
                     <h3 className={`text-2xl font-black italic tracking-tighter ${kpi.color}`}>{kpi.value}</h3>
                  </div>
                ))}
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                   <h3 className="text-xl font-black italic uppercase mb-8">Segurança da Rede</h3>
                   <div className="space-y-4">
                      {securityIncidents.map((incident, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                           <div className="flex items-center gap-4">
                              <ShieldAlert className={incident.severity === 'HIGH' ? 'text-rose-500' : 'text-amber-500'} size={20} />
                              <div>
                                 <p className="text-xs font-black uppercase tracking-tight">{incident.title}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase">{incident.time}</p>
                              </div>
                           </div>
                           <button onClick={() => setSelectedIncident(incident)} className="text-[10px] font-black text-indigo-600 uppercase">Auditar</button>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl flex flex-col justify-between">
                   <h3 className="text-xl font-black italic uppercase mb-8">AI Master Sync</h3>
                   <button onClick={() => { setIsClearingCache(true); setTimeout(() => { setIsClearingCache(false); notify('Cache Purgado.'); }, 1500); }} disabled={isClearingCache} className="w-full py-5 bg-white text-slate-900 font-black rounded-3xl text-[10px] uppercase shadow-xl flex items-center justify-center gap-3">
                     {isClearingCache ? <Loader2 className="animate-spin" /> : <RefreshCcw size={18} />} Limpar Cache Global
                   </button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'tenants' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-5">
             <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="relative flex-1 max-w-lg">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                   <input placeholder="Buscar empresa..." className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl font-bold" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <button onClick={() => setShowNewTenantModal(true)} className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl text-xs uppercase"><Plus size={20} /> Nova Unidade</button>
             </div>
             <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                         <th className="px-10 py-8">Unidade</th>
                         <th className="px-10 py-8">Status</th>
                         <th className="px-10 py-8 text-right">Faturamento</th>
                         <th className="px-10 py-8 text-center">Ações</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredTenants.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                           <td className="px-10 py-8 flex items-center gap-4">
                              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center font-black text-indigo-600">{t.name.charAt(0)}</div>
                              <div><p className="font-black italic uppercase text-sm">{t.name}</p><p className="text-[9px] text-slate-400 font-bold uppercase">{t.niche}</p></div>
                           </td>
                           <td className="px-10 py-8">
                              <span className={`text-[8px] font-black px-3 py-1.5 rounded-lg border ${t.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>{t.status}</span>
                           </td>
                           <td className="px-10 py-8 text-right font-black text-lg tabular-nums">R$ {t.revenue.toLocaleString()}</td>
                           <td className="px-10 py-8">
                              <div className="flex items-center justify-center gap-2">
                                 <button onClick={() => notify('Impersonating...')} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl"><Unlock size={16} /></button>
                                 <button onClick={() => handleToggleTenantStatus(t.id)} className={`p-3 rounded-xl ${t.status === 'OFFLINE' ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500'}`}>{t.status === 'OFFLINE' ? <CheckCircle2 size={16} /> : <Ban size={16} />}</button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* MARCA */}
        {activeTab === 'branding' && (
          <div className="space-y-12 animate-in slide-in-from-bottom-5">
             <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="text-xl font-black italic uppercase mb-6">Nome da Plataforma</h4>
                <input value={localBranding.appName} onChange={e => setLocalBranding({...localBranding, appName: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black text-lg outline-none focus:ring-4 ring-indigo-500/10 uppercase italic" />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-8">
                   <div className="flex items-center gap-3"><Palette className="text-indigo-600" /> <h4 className="text-xl font-black italic uppercase">Logotipo Horizontal</h4></div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                         <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><Sun size={12}/> Tema Claro</p>
                         <div onClick={() => triggerUpload('fullLogo')} className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-all relative overflow-hidden group">
                            {isUploading === 'fullLogo' ? <Loader2 className="animate-spin text-indigo-600" /> : <img src={localBranding.fullLogo} className="max-h-12 object-contain" />}
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Camera className="text-white" /></div>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><Moon size={12}/> Tema Escuro</p>
                         <div onClick={() => triggerUpload('fullLogoDark')} className="aspect-video bg-slate-950 border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-all relative overflow-hidden group">
                            {isUploading === 'fullLogoDark' ? <Loader2 className="animate-spin text-indigo-600" /> : <img src={localBranding.fullLogoDark} className="max-h-12 object-contain" />}
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Camera className="text-white" /></div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-8">
                   <div className="flex items-center gap-3"><Frame className="text-orange-600" /> <h4 className="text-xl font-black italic uppercase">Ícone do App</h4></div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                         <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><Sun size={12}/> Tema Claro</p>
                         <div onClick={() => triggerUpload('iconLogo')} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-all relative overflow-hidden group">
                            {isUploading === 'iconLogo' ? <Loader2 className="animate-spin text-indigo-600" /> : <img src={localBranding.iconLogo} className="w-16 h-16 object-contain" />}
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Camera className="text-white" /></div>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><Moon size={12}/> Tema Escuro</p>
                         <div onClick={() => triggerUpload('iconLogoDark')} className="aspect-square bg-slate-950 border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-all relative overflow-hidden group">
                            {isUploading === 'iconLogoDark' ? <Loader2 className="animate-spin text-indigo-600" /> : <img src={localBranding.iconLogoDark} className="w-16 h-16 object-contain" />}
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Camera className="text-white" /></div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm group col-span-full">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3"><Globe2 className="text-cyan-600" /> <h4 className="text-xl font-black italic uppercase">Favicon do Navegador</h4></div>
                      <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-2">
                        <img src={localBranding.favicon} className="w-5 h-5 object-contain" />
                        <span className="text-[9px] font-black uppercase text-slate-400">Preview Aba</span>
                      </div>
                   </div>
                   <div onClick={() => triggerUpload('favicon')} className="w-full h-32 bg-slate-50 dark:bg-slate-955 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center cursor-pointer hover:border-cyan-500 transition-all relative overflow-hidden group">
                      {isUploading === 'favicon' ? <Loader2 className="animate-spin text-cyan-600" /> : <img src={localBranding.favicon} className="w-12 h-12 object-contain" />}
                      <div className="absolute inset-0 bg-cyan-955/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Camera className="text-white" /></div>
                   </div>
                </div>
             </div>

             <button onClick={handleFinalSaveBranding} disabled={isSaving} className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl flex items-center justify-center gap-3 uppercase text-xs">
                {isSaving ? <Loader2 className="animate-spin" /> : <RefreshCcw size={18} />} Propagar Alterações Master
             </button>
          </div>
        )}

        {/* INFRA */}
        {activeTab === 'infra' && (
          <div className="max-w-4xl space-y-10 animate-in slide-in-from-bottom-5">
             <div className="p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl border-b-8 border-indigo-600">
                <form onSubmit={handleSaveInfra} className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-indigo-300">VPS URL Base</label>
                      <input value={evoUrl} onChange={e => setEvoUrl(e.target.value)} placeholder="https://api.clikai.com.br" className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-indigo-300">Master API Key</label>
                      <input type="password" value={evoKey} onChange={e => setEvoKey(e.target.value)} placeholder="••••••••••••••••" className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold" />
                   </div>
                   <button type="submit" disabled={isSaving} className="md:col-span-2 w-full py-6 bg-white text-indigo-950 font-black rounded-3xl shadow-xl flex items-center justify-center gap-3 uppercase text-xs">
                      {isSaving ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />} Salvar Infraestrutura
                   </button>
                </form>
             </div>
          </div>
        )}

        {/* N8N (WORKFLOWS MASTER ACTIVE) */}
        {activeTab === 'n8n' && (
          <div className="space-y-16 animate-in slide-in-from-bottom-5 pb-20">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tight">Orquestrador n8n Master</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">Pipelines de Dados Ativos para {tenants.length} Unidades</p>
                </div>
                <button onClick={() => setShowWorkflowModal(true)} className="px-10 py-5 bg-orange-600 text-white rounded-[2rem] font-black text-xs uppercase flex items-center gap-3 shadow-[0_15px_30px_-10px_rgba(234,88,12,0.4)] hover:bg-orange-700 hover:scale-105 transition-all">
                  <Plus size={20} /> Novo Workflow
                </button>
             </div>
             
             {/* Biblioteca de Blueprints */}
             <div className="space-y-8">
                <div className="flex items-center gap-4 text-indigo-600 border-l-4 border-indigo-600 pl-4 py-1">
                   <BookCopy size={24} />
                   <h4 className="text-lg font-black uppercase tracking-widest italic">Biblioteca de Blueprints Master (Prontos para Importar)</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {WORKFLOW_BLUEPRINTS.map(bp => (
                     <div key={bp.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-500 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl"></div>
                        <div className="space-y-4 relative z-10">
                           <div className={`p-4 rounded-2xl w-fit ${bp.bg} ${bp.color} shadow-sm group-hover:rotate-12 transition-transform`}>
                              <FileCode size={24} />
                           </div>
                           <h5 className="font-black italic uppercase text-sm tracking-tight">{bp.name}</h5>
                           <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">{bp.description}</p>
                        </div>
                        <button 
                          onClick={() => handleDownloadWorkflowJSON(bp)}
                          className="mt-8 flex items-center justify-center gap-3 py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-indigo-100 transition-all"
                        >
                           <FileDown size={16} /> Baixar JSON
                        </button>
                     </div>
                   ))}
                </div>
             </div>

             <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

             {/* Workflows Ativos na Rede */}
             <div className="space-y-8">
                <div className="flex items-center gap-4 text-orange-600 border-l-4 border-orange-600 pl-4 py-1">
                   <Zap size={24} className="animate-pulse" />
                   <h4 className="text-lg font-black uppercase tracking-widest italic">Workflows Ativos na Rede Master</h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {workflows.map(wf => (
                      <div key={wf.id} className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm group hover:border-orange-500/30 transition-all relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-2 h-full ${wf.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-5">
                               <div className={`p-5 rounded-3xl shadow-sm ${wf.status === 'ACTIVE' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                                  <Code size={28} />
                               </div>
                               <div>
                                  <h4 className="text-xl font-black uppercase italic tracking-tight mb-1">{wf.name}</h4>
                                  <div className="flex items-center gap-3">
                                     <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${wf.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                                        {wf.status === 'ACTIVE' ? 'Operacional' : 'Pausado'}
                                     </span>
                                     <span className="text-[9px] font-black uppercase text-slate-400">Trigger: {wf.event}</span>
                                  </div>
                               </div>
                            </div>
                            <button 
                              onClick={() => handleToggleWf(wf.id)}
                              className={`p-4 rounded-2xl transition-all shadow-md active:scale-95 ${wf.status === 'ACTIVE' ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-100 text-slate-400'}`}
                            >
                              {wf.status === 'ACTIVE' ? <Check size={20} /> : <Power size={20} />}
                            </button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800">
                           <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Endpoint Webhook</p>
                           <p className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate">{wf.webhookUrl}</p>
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Latência: 12ms</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleTestWf(wf)}
                                className="p-3.5 text-orange-600 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                                title="Executar Teste Master"
                              >
                                 <Play size={16} />
                              </button>
                              <button 
                                onClick={() => handleDownloadWorkflowJSON(wf)}
                                className="p-3.5 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                title="Exportar Blueprints"
                              >
                                 <Download size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteWf(wf.id)}
                                className="p-3.5 text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                title="Destruir Workflow"
                              >
                                 <Trash2 size={16} />
                              </button>
                            </div>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => setShowWorkflowModal(true)}
                      className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3.5rem] flex flex-col items-center justify-center gap-4 text-slate-300 hover:text-orange-500 hover:border-orange-500/30 hover:bg-orange-50/10 transition-all p-10 group"
                    >
                       <div className="p-6 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-orange-100 group-hover:text-orange-600 transition-all">
                          <Plus size={40} />
                       </div>
                       <span className="text-xs font-black uppercase tracking-[0.2em]">Adicionar Automação de Rede</span>
                    </button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-5">
             <div className="p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-sm flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-inner"><CreditCard size={32}/></div>
                   <div>
                      <h4 className="text-2xl font-black italic uppercase tracking-tight">Faturamento Centralizado</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Credenciais Master para Recebimento de Assinaturas</p>
                   </div>
                </div>
             </div>
             <IntegrationSettings />
          </div>
        )}
      </div>
    </div>
  );
};
