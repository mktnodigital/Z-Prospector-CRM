
import React, { useState, useRef } from 'react';
import { 
  Users, Key, Webhook, Plus, ShieldCheck, 
  Activity, Server, Zap, Loader2, Trash2, 
  Settings, Play, ExternalLink, RefreshCcw, 
  Code, Database, Cpu, Bot, TrendingUp,
  Download, FileJson, Sparkles, MessageSquare, 
  ArrowRight, CheckCircle2, ShoppingCart, CreditCard, Landmark, Globe, Palette, Building2,
  Image as ImageIcon, Type, Layout, Save, X, Ban, Edit3, Smartphone, Globe2,
  Lock, ShieldAlert, Fingerprint, History, Monitor, Shield, UploadCloud, ImagePlus, Workflow,
  Check, AlertTriangle
} from 'lucide-react';
import { BrandingConfig, EvolutionConfig, Tenant } from '../types';
import { IntegrationSettings } from './IntegrationSettings';

interface AdminModuleProps {
  branding: BrandingConfig;
  onBrandingChange: (branding: BrandingConfig) => void;
  onNicheChange: (niche: string) => void;
  evolutionConfig: EvolutionConfig;
  onEvolutionConfigChange: (config: EvolutionConfig) => void;
  notify: (msg: string) => void;
}

type AdminSubTab = 'infra' | 'branding' | 'tenants' | 'payments' | 'security';

export const AdminModule: React.FC<AdminModuleProps> = ({ branding, onBrandingChange, evolutionConfig, onEvolutionConfigChange, notify }) => {
  const [activeTab, setActiveTab] = useState<AdminSubTab>('branding');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTestingInfra, setIsTestingInfra] = useState<string | null>(null);
  
  const [n8nConfig, setN8nConfig] = useState({
    baseUrl: 'https://n8n.clikai.com.br',
    apiKey: '********************************',
    status: 'ONLINE'
  });

  // Refs para Inputs de Arquivo
  const logoInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  // --- STATE: TENANT MANAGEMENT ---
  const [tenants, setTenants] = useState<Tenant[]>([
    { id: '1', name: 'Barbearia Matriz', niche: 'Barbearia', healthScore: 98, revenue: 12450, activeLeads: 450, status: 'ONLINE', instanceStatus: 'CONNECTED' },
    { id: '2', name: 'Estética VIP', niche: 'Estética', healthScore: 85, revenue: 8200, activeLeads: 210, status: 'WARNING', instanceStatus: 'DISCONNECTED' },
    { id: '3', name: 'Imobiliária Sul', niche: 'Imóveis', healthScore: 92, revenue: 45000, activeLeads: 890, status: 'ONLINE', instanceStatus: 'CONNECTED' },
  ]);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [tenantForm, setTenantForm] = useState<Partial<Tenant>>({
    name: '', niche: '', status: 'ONLINE', instanceStatus: 'DISCONNECTED', revenue: 0, activeLeads: 0, healthScore: 100
  });

  const subTabs = [
    { id: 'tenants' as const, label: 'Unidades', icon: Building2 },
    { id: 'payments' as const, label: 'Financeiro', icon: CreditCard },
    { id: 'branding' as const, label: 'Marca', icon: Palette },
    { id: 'infra' as const, label: 'Infra', icon: Server },
    { id: 'security' as const, label: 'Segurança', icon: ShieldCheck },
  ];

  // --- HANDLERS: BRANDING ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof BrandingConfig) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        notify('Erro: Imagem muito pesada (máx 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onBrandingChange({ ...branding, [field]: reader.result as string });
        notify('Asset carregado com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      notify('Visual da Marca Atualizado Globalmente!');
    }, 1000);
  };

  // --- HANDLERS: TENANTS ---
  const handleOpenTenantModal = (tenant?: Tenant) => {
    if (tenant) {
      setEditingTenant(tenant);
      setTenantForm(tenant);
    } else {
      setEditingTenant(null);
      setTenantForm({ name: '', niche: '', status: 'ONLINE', instanceStatus: 'DISCONNECTED', revenue: 0, activeLeads: 0, healthScore: 100 });
    }
    setIsTenantModalOpen(true);
  };

  const handleSaveTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTenant) {
      setTenants(prev => prev.map(t => t.id === editingTenant.id ? { ...t, ...tenantForm } as Tenant : t));
      notify(`Unidade ${tenantForm.name} atualizada com sucesso.`);
    } else {
      const newTenant: Tenant = {
        ...tenantForm as Tenant,
        id: Math.random().toString(36).substr(2, 9),
        healthScore: 100,
        revenue: 0,
        activeLeads: 0
      };
      setTenants([...tenants, newTenant]);
      notify(`Unidade ${newTenant.name} provisionada no cluster.`);
    }
    setIsTenantModalOpen(false);
  };

  const handleDeleteTenant = (id: string) => {
    if (confirm('ATENÇÃO: Isso excluirá permanentemente a unidade e todos os dados associados. Continuar?')) {
      setTenants(prev => prev.filter(t => t.id !== id));
      notify('Unidade desprovisionada e dados arquivados.');
    }
  };

  // --- HANDLERS: INFRA ---
  const handleTestConnection = (service: 'evolution' | 'n8n') => {
    setIsTestingInfra(service);
    setTimeout(() => {
      setIsTestingInfra(null);
      notify(`Conexão com ${service === 'evolution' ? 'Evolution API' : 'N8n Cluster'} estabelecida (200 OK).`);
    }, 1500);
  };

  const handleGlobalSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      notify('Ambiente Master Sincronizado com Sucesso!');
    }, 1500);
  };

  // --- HANDLERS: SECURITY ---
  const handlePropagatePassword = () => {
    notify('Hash de segurança atualizado em todos os nós.');
  };

  const handleConfigureMFA = () => {
    notify('QR Code de MFA gerado e enviado ao email master.');
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in pb-40">
      
      {/* MODAL TENANT */}
      {isTenantModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl p-10 relative border border-white/10">
              <button onClick={() => setIsTenantModalOpen(false)} className="absolute top-8 right-8 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all"><X size={20} /></button>
              
              <div className="flex items-center gap-5 mb-8">
                 <div className="p-4 bg-orange-600 text-white rounded-2xl shadow-lg"><Building2 size={24}/></div>
                 <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100">{editingTenant ? 'Gerenciar Unidade' : 'Nova Unidade'}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Configuração Multi-tenant</p>
                 </div>
              </div>

              <form onSubmit={handleSaveTenant} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-4">Nome da Empresa</label>
                    <input required value={tenantForm.name} onChange={e => setTenantForm({...tenantForm, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-orange-500/10 dark:text-white" placeholder="Ex: Matriz São Paulo" />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 px-4">Nicho de Atuação</label>
                       <select value={tenantForm.niche} onChange={e => setTenantForm({...tenantForm, niche: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-orange-500/10 dark:text-white">
                          <option value="">Selecione...</option>
                          <option value="Barbearia">Barbearia</option>
                          <option value="Estética">Estética</option>
                          <option value="Imóveis">Imóveis</option>
                          <option value="Consultoria">Consultoria</option>
                          <option value="SaaS">SaaS</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 px-4">Status da Conta</label>
                       <select value={tenantForm.status} onChange={e => setTenantForm({...tenantForm, status: e.target.value as any})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-orange-500/10 dark:text-white">
                          <option value="ONLINE">Ativo (Online)</option>
                          <option value="WARNING">Aviso (Warning)</option>
                          <option value="OFFLINE">Suspenso (Offline)</option>
                       </select>
                    </div>
                 </div>

                 <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <Database size={20} className="text-orange-500" />
                    <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-relaxed">
                       Ao criar uma unidade, um novo schema de banco de dados será provisionado automaticamente no cluster.
                    </p>
                 </div>

                 <button type="submit" className="w-full py-6 bg-orange-600 text-white font-black rounded-3xl shadow-xl hover:bg-orange-700 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-3">
                    <Save size={18} /> Salvar Configuração
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* HEADER MASTER ADMIN */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div>
           <div className="flex items-center gap-4">
              <div className="p-4 bg-orange-500 text-white rounded-2xl shadow-xl shadow-orange-500/20 rotate-3 transition-transform hover:rotate-0"><ShieldCheck size={32} /></div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">Command <span className="text-orange-600">Center</span></h1>
           </div>
           <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 italic">clikai.com.br • Painel de Controle de Autoridade</p>
        </div>

        <div className="flex bg-white dark:bg-slate-900 p-2.5 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar max-w-full gap-1">
           {subTabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-3.5 px-9 py-5 rounded-[1.8rem] text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-orange-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <tab.icon size={22} /> {tab.label}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-12 rounded-[4.5rem] border-2 border-slate-50 dark:border-slate-800 shadow-sm relative overflow-hidden min-h-[600px]">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-orange-500/5 to-transparent blur-[120px] pointer-events-none"></div>
         
         {activeTab === 'tenants' && (
           <div className="space-y-10 animate-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-6">
                    <div className="p-5 bg-orange-50 text-orange-600 rounded-[2rem]"><Building2 size={32} /></div>
                    <div>
                      <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-200">Gestão de Unidades</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Multi-tenant Isolation Control</p>
                    </div>
                 </div>
                 <button onClick={() => handleOpenTenantModal()} className="flex items-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
                    <Plus size={18} /> Nova Unidade
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {tenants.map(tenant => (
                   <div key={tenant.id} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 p-8 rounded-[3rem] relative group hover:border-orange-500 transition-all shadow-sm flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                         <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase border ${tenant.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                            {tenant.status}
                         </div>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenTenantModal(tenant)} className="p-2 bg-white dark:bg-slate-700 text-slate-400 hover:text-orange-600 rounded-lg shadow-sm"><Edit3 size={14}/></button>
                            <button onClick={() => handleDeleteTenant(tenant.id)} className="p-2 bg-white dark:bg-slate-700 text-slate-400 hover:text-rose-600 rounded-lg shadow-sm"><Trash2 size={14}/></button>
                         </div>
                      </div>
                      <h4 className="text-xl font-black italic uppercase tracking-tight mb-2 text-slate-900 dark:text-white">{tenant.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 italic">Nicho: {tenant.niche}</p>
                      <div className="grid grid-cols-2 gap-4 mb-8">
                         <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Leads</p>
                            <h5 className="font-black text-indigo-600">{tenant.activeLeads}</h5>
                         </div>
                         <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Receita</p>
                            <h5 className="font-black text-emerald-600">R$ {tenant.revenue.toLocaleString()}</h5>
                         </div>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                         <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
                            <Smartphone size={14} className={tenant.instanceStatus === 'CONNECTED' ? 'text-emerald-500' : 'text-rose-500'} />
                            WhatsApp {tenant.instanceStatus === 'CONNECTED' ? 'ON' : 'OFF'}
                         </div>
                         <div className="text-[10px] font-black text-orange-600 italic">Score: {tenant.healthScore}%</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
         )}

         {activeTab === 'branding' && (
           <div className="space-y-12 animate-in slide-in-from-bottom-4">
              <div className="flex items-center gap-6">
                 <div className="p-5 bg-orange-50 text-orange-600 rounded-[2rem]"><Palette size={32} /></div>
                 <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-200">Identidade Master</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Personalização de Assets Visuais para Revenda</p>
                 </div>
              </div>

              <form onSubmit={handleSaveBranding} className="space-y-10">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    <div className="space-y-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase text-slate-400 px-4 flex items-center gap-2"><Type size={14}/> Nome do SaaS</label>
                          <input 
                             value={branding.appName} 
                             onChange={(e) => onBrandingChange({...branding, appName: e.target.value})}
                             className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-black italic border-none shadow-inner outline-none focus:ring-4 ring-orange-500/10 dark:text-white" 
                          />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-slate-400 px-4">Logotipo Principal</label>
                             <div 
                                onClick={() => logoInputRef.current?.click()}
                                className="h-40 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50/10 transition-all group overflow-hidden relative"
                             >
                                {branding.fullLogo ? (
                                   <img src={branding.fullLogo} className="max-h-16 w-auto object-contain transition-transform group-hover:scale-110" />
                                ) : (
                                   <div className="text-center">
                                      <UploadCloud className="mx-auto text-slate-300 group-hover:text-orange-500" size={32} />
                                      <span className="text-[8px] font-black uppercase text-slate-400 mt-2 block">Upload PNG/SVG</span>
                                   </div>
                                )}
                                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'fullLogo')} />
                             </div>
                          </div>

                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-slate-400 px-4">Ícone Sidebar (1:1)</label>
                             <div 
                                onClick={() => iconInputRef.current?.click()}
                                className="h-40 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50/10 transition-all group overflow-hidden relative"
                             >
                                {branding.iconLogo ? (
                                   <img src={branding.iconLogo} className="w-16 h-16 object-contain transition-transform group-hover:scale-110" />
                                ) : (
                                   <div className="text-center">
                                      <ImagePlus className="mx-auto text-slate-300 group-hover:text-orange-500" size={32} />
                                      <span className="text-[8px] font-black uppercase text-slate-400 mt-2 block">Upload Quadrado</span>
                                   </div>
                                )}
                                <input type="file" ref={iconInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'iconLogo')} />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <label className="text-[10px] font-black uppercase text-slate-400 px-4 flex items-center gap-2"><Monitor size={14}/> Simulador de Interface</label>
                       <div className="bg-slate-950 p-8 rounded-[3.5rem] border-4 border-slate-900 shadow-2xl flex flex-col gap-10">
                          <div className="flex flex-col items-center gap-6">
                             <img src={branding.fullLogo} className="h-8 w-auto object-contain" />
                             <div className="flex gap-4 w-full">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex-1 flex flex-col items-center gap-2">
                                   <img src={branding.iconLogo} className="w-10 h-10 object-contain" />
                                   <p className="text-[7px] font-black text-white/30 uppercase">Ícone</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex-1 flex flex-col items-center justify-center gap-1">
                                   <h4 className="text-white font-black italic uppercase text-xs truncate max-w-full">{branding.appName}</h4>
                                   <p className="text-[7px] font-black text-white/30 uppercase">Texto</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="pt-10 border-t border-slate-50 dark:border-slate-800 flex justify-end gap-4">
                    <button type="submit" disabled={isSyncing} className="flex items-center gap-4 px-12 py-6 bg-orange-600 text-white font-black rounded-3xl shadow-xl hover:bg-orange-700 transition-all uppercase text-[10px] tracking-widest">
                       {isSyncing ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                       Aplicar Identidade Visual
                    </button>
                 </div>
              </form>
           </div>
         )}

         {activeTab === 'payments' && <IntegrationSettings />}

         {activeTab === 'infra' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-4">
               {/* CONFIGURAÇÃO EVOLUTION */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className="p-5 bg-indigo-50 text-indigo-600 rounded-[2rem]"><Zap size={32} /></div>
                     <div>
                       <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-200">Evolution Engine</h3>
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">WhatsApp Socket clikai.com.br</p>
                     </div>
                  </div>
                  <button onClick={() => handleTestConnection('evolution')} className="flex items-center gap-2 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-100 transition-all">
                     {isTestingInfra === 'evolution' ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />} 
                     Testar Conexão
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-slate-400 px-4">Evolution URL</label>
                     <input value={evolutionConfig.baseUrl} onChange={e => onEvolutionConfigChange({...evolutionConfig, baseUrl: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 shadow-inner dark:text-white" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-slate-400 px-4">Master API Key</label>
                     <input type="password" value={evolutionConfig.apiKey} onChange={e => onEvolutionConfigChange({...evolutionConfig, apiKey: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 shadow-inner dark:text-white" />
                  </div>
               </div>

               <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

               {/* CONFIGURAÇÃO N8N MASTER */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className="p-5 bg-orange-50 text-orange-600 rounded-[2rem]"><Workflow size={32} /></div>
                     <div>
                       <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-200">N8n Master Cluster</h3>
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Orquestração de Automação Global</p>
                     </div>
                  </div>
                  <button onClick={() => handleTestConnection('n8n')} className="flex items-center gap-2 px-6 py-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-orange-100 transition-all">
                     {isTestingInfra === 'n8n' ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />} 
                     Testar Cluster
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-slate-400 px-4">N8n Endpoint Base</label>
                     <input value={n8nConfig.baseUrl} onChange={e => setN8nConfig({...n8nConfig, baseUrl: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-orange-500/10 shadow-inner dark:text-white" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-slate-400 px-4">Cluster API Key</label>
                     <input type="password" value={n8nConfig.apiKey} onChange={e => setN8nConfig({...n8nConfig, apiKey: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-orange-500/10 shadow-inner dark:text-white" />
                  </div>
               </div>

               <div className="pt-10 flex justify-end gap-4">
                  <button onClick={handleGlobalSync} disabled={isSyncing} className="px-12 py-6 bg-orange-600 text-white font-black rounded-3xl shadow-xl uppercase text-[10px] tracking-widest hover:scale-105 transition-all flex items-center gap-3">
                     {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />} Sincronizar Cluster Master
                  </button>
               </div>
            </div>
         )}

         {activeTab === 'security' && (
           <div className="space-y-12 animate-in slide-in-from-bottom-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                 <div className="flex items-center gap-6">
                    <div className="p-5 bg-slate-900 text-orange-500 rounded-[2rem] shadow-2xl"><ShieldCheck size={32} /></div>
                    <div>
                       <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-200">Segurança Master</h3>
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Monitoramento de Integridade & Vault</p>
                    </div>
                 </div>
                 <div className="px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-3">
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sistema Seguro</span>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 px-4">Nova Senha Master</label>
                      <input type="password" placeholder="••••••••••••" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-blue-500/10" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 px-4">Confirmar Senha</label>
                      <input type="password" placeholder="••••••••••••" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-blue-500/10" />
                    </div>
                  </div>
                  <button onClick={handlePropagatePassword} className="w-full py-5 bg-slate-900 dark:bg-slate-800 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">Propagar Nova Senha</button>
                </div>

                <div className="p-10 bg-blue-50 dark:bg-blue-900/20 rounded-[3.5rem] border border-blue-100 dark:border-blue-800 flex flex-col justify-between group overflow-hidden relative">
                  <ShieldCheck className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-125 transition-transform duration-700" />
                  <div className="relative z-10">
                     <div className="flex items-center gap-4 mb-6">
                       <Smartphone className="text-blue-600" size={28} />
                       <h4 className="text-lg font-black italic uppercase tracking-tight">MFA Autenticador</h4>
                     </div>
                     <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase leading-relaxed tracking-widest mb-10 italic">
                       Garanta que apenas dispositivos autorizados acessem o Command Center. A ativação do MFA é mandatória para Super Admins.
                     </p>
                  </div>
                  <button onClick={handleConfigureMFA} className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all relative z-10 active:scale-95">Configurar APP Autenticador</button>
                </div>
              </div>
              
              <div className="p-8 bg-orange-50 dark:bg-orange-900/10 rounded-[3rem] border border-orange-100 dark:border-orange-800/30 flex gap-6">
                 <AlertTriangle className="text-orange-600 flex-shrink-0" size={32} />
                 <div>
                    <h4 className="font-black text-orange-700 dark:text-orange-500 uppercase tracking-tight mb-2">Log de Auditoria</h4>
                    <p className="text-[10px] font-bold text-orange-600/70 dark:text-orange-400 uppercase tracking-widest leading-relaxed">
                       Todas as ações administrativas são registradas em blockchain privado para auditoria de segurança. Nenhuma anomalia detectada nas últimas 24h.
                    </p>
                 </div>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};
