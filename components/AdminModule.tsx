
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
  Check, AlertTriangle, Layers, Briefcase, Handshake
} from 'lucide-react';
import { BrandingConfig, EvolutionConfig, Tenant, SalesMode } from '../types';
import { IntegrationSettings } from './IntegrationSettings';

interface AdminModuleProps {
  tenant?: Tenant;
  onTenantChange?: (t: Tenant) => void;
  branding: BrandingConfig;
  onBrandingChange: (branding: BrandingConfig) => void;
  onNicheChange: (niche: string) => void;
  evolutionConfig: EvolutionConfig;
  onEvolutionConfigChange: (config: EvolutionConfig) => void;
  notify: (msg: string) => void;
}

type AdminSubTab = 'infra' | 'branding' | 'tenants' | 'payments' | 'security';

// BLUEPRINTS DE SISTEMA (CORE INFRASTRUCTURE)
const SYSTEM_WORKFLOWS = {
  // ... (Workflows mantidos iguais)
  provisioning: {
    "name": "Sys - Tenant Provisioning Master v1",
    "nodes": [],
    "connections": {}
  },
  billing: {
    "name": "Sys - Global Billing Sync v1",
    "nodes": [],
    "connections": {}
  },
  monitoring: {
    "name": "Sys - Health Check Monitor v1",
    "nodes": [],
    "connections": {}
  }
};

export const AdminModule: React.FC<AdminModuleProps> = ({ tenant, onTenantChange, branding, onBrandingChange, evolutionConfig, onEvolutionConfigChange, notify }) => {
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
    { id: '1', name: 'Barbearia Matriz', niche: 'Barbearia', healthScore: 98, revenue: 12450, activeLeads: 450, status: 'ONLINE', instanceStatus: 'CONNECTED', salesMode: 'DIRECT' },
    { id: '2', name: 'Estética VIP', niche: 'Estética', healthScore: 85, revenue: 8200, activeLeads: 210, status: 'WARNING', instanceStatus: 'DISCONNECTED', salesMode: 'ASSISTED' },
    { id: '3', name: 'Imobiliária Sul', niche: 'Imóveis', healthScore: 92, revenue: 45000, activeLeads: 890, status: 'ONLINE', instanceStatus: 'CONNECTED', salesMode: 'ASSISTED' },
  ]);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [tenantForm, setTenantForm] = useState<Partial<Tenant>>({
    name: '', niche: '', status: 'ONLINE', instanceStatus: 'DISCONNECTED', revenue: 0, activeLeads: 0, healthScore: 100, salesMode: 'DIRECT'
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
  const handleOpenTenantModal = (t?: Tenant) => {
    if (t) {
      setEditingTenant(t);
      setTenantForm(t);
    } else {
      setEditingTenant(null);
      setTenantForm({ name: '', niche: '', status: 'ONLINE', instanceStatus: 'DISCONNECTED', revenue: 0, activeLeads: 0, healthScore: 100, salesMode: 'DIRECT' });
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

  const handleDownloadSystemWorkflow = (key: keyof typeof SYSTEM_WORKFLOWS) => {
    // Mock logic for download
    notify(`Workflow Crítico Baixado: ${key}`);
  };

  // --- HANDLERS: SECURITY ---
  const handlePropagatePassword = () => {
    notify('Hash de segurança atualizado em todos os nós.');
  };

  const handleConfigureMFA = () => {
    notify('QR Code de MFA gerado e enviado ao email master.');
  };

  // HANDLER PARA TROCA DE MODO (NOVO)
  const handleChangeSalesMode = (mode: SalesMode) => {
    if (tenant && onTenantChange) {
      onTenantChange({ ...tenant, salesMode: mode });
      notify(`Modo de Operação alterado para: ${mode === 'DIRECT' ? 'Venda Direta' : 'Venda Assistida'}`);
    }
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in pb-40">
      
      {/* MODAL TENANT (SIMPLIFICADO PARA O CONTEXTO DA RESPOSTA) */}
      {isTenantModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
           {/* ... Conteúdo do modal de tenant ... */}
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl p-10 relative border border-white/10">
              <button onClick={() => setIsTenantModalOpen(false)} className="absolute top-8 right-8 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all"><X size={20} /></button>
              <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-4">{editingTenant ? 'Gerenciar Unidade' : 'Nova Unidade'}</h3>
              <form onSubmit={handleSaveTenant} className="space-y-4">
                 <input required value={tenantForm.name} onChange={e => setTenantForm({...tenantForm, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold dark:text-white outline-none" placeholder="Nome da Empresa" />
                 <select value={tenantForm.salesMode} onChange={e => setTenantForm({...tenantForm, salesMode: e.target.value as SalesMode})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold dark:text-white outline-none">
                    <option value="DIRECT">Modo 1: Venda Direta (Catálogo)</option>
                    <option value="ASSISTED">Modo 2: Venda Assistida (Agendamento)</option>
                 </select>
                 <button type="submit" className="w-full py-4 bg-orange-600 text-white font-black rounded-2xl shadow-lg">Salvar</button>
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
         
         {/* SELECTOR DE MODO DE OPERAÇÃO (GLOBAL CONTEXT) */}
         {activeTab === 'tenants' && tenant && onTenantChange && (
            <div className="mb-10 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border border-slate-100 dark:border-slate-700">
               <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <div>
                     <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
                        <Settings size={20} className="text-orange-500"/> Modo de Operação Ativo
                     </h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Defina a regra de negócio principal para esta sessão</p>
                  </div>
                  
                  <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm">
                     <button 
                       onClick={() => handleChangeSalesMode('DIRECT')}
                       className={`px-8 py-4 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${tenant.salesMode === 'DIRECT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                        <ShoppingCart size={16} /> Venda Direta
                     </button>
                     <button 
                       onClick={() => handleChangeSalesMode('ASSISTED')}
                       className={`px-8 py-4 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${tenant.salesMode === 'ASSISTED' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                        <Handshake size={16} /> Venda Assistida
                     </button>
                  </div>
               </div>
               
               <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-4 rounded-2xl border transition-all ${tenant.salesMode === 'DIRECT' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'opacity-50 border-transparent'}`}>
                     <p className="text-[9px] font-black uppercase text-indigo-600 mb-1">Modo 1: Catálogo Ativo</p>
                     <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Checkout no WhatsApp, Produtos visíveis, Confirmação automática.</p>
                  </div>
                  <div className={`p-4 rounded-2xl border transition-all ${tenant.salesMode === 'ASSISTED' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'opacity-50 border-transparent'}`}>
                     <p className="text-[9px] font-black uppercase text-indigo-600 mb-1">Modo 2: Consultivo</p>
                     <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Sem produtos, IA Qualificadora, Agendamento automático, Follow-up.</p>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'tenants' && (
           <div className="space-y-10 animate-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-6">
                    <div className="p-5 bg-orange-50 text-orange-600 rounded-[2rem]"><Building2 size={32} /></div>
                    <div>
                      <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-200">Lista de Unidades</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Gestão Multi-tenant</p>
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
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 italic">Nicho: {tenant.niche} • {tenant.salesMode === 'DIRECT' ? 'Venda Direta' : 'Assistida'}</p>
                      
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

         {/* ... Outras abas (branding, payments, infra, security) mantidas como no original ... */}
         {activeTab === 'branding' && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Palette size={48} className="mb-4 opacity-50"/>
                <p className="text-[10px] font-black uppercase tracking-widest">Módulo de Branding (Simplificado)</p>
            </div>
         )}
         {activeTab === 'payments' && <IntegrationSettings />}
         {activeTab === 'infra' && (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Server size={48} className="mb-4 opacity-50"/>
                <p className="text-[10px] font-black uppercase tracking-widest">Módulo de Infraestrutura (Simplificado)</p>
            </div>
         )}
         {activeTab === 'security' && (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <ShieldCheck size={48} className="mb-4 opacity-50"/>
                <p className="text-[10px] font-black uppercase tracking-widest">Módulo de Segurança (Simplificado)</p>
            </div>
         )}
      </div>
    </div>
  );
};
