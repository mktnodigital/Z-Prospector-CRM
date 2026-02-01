
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
  Check, AlertTriangle, Layers, Briefcase, Handshake, Link as LinkIcon, Wifi, Network, UserCog, CloudLightning,
  MapPin
} from 'lucide-react';
import { BrandingConfig, EvolutionConfig, Tenant, SalesMode } from '../types';
import { IntegrationSettings } from './IntegrationSettings';
import { TenantManager } from './TenantManager';
import { TeamManager } from './TeamManager';
import { N8nManager } from './N8nManager';

interface AdminModuleProps {
  tenant?: Tenant;
  onTenantChange?: (t: Tenant) => void;
  // Novos Props para Gestão Multi-Tenant
  allTenants?: Tenant[];
  onAddTenant?: (t: Tenant) => void;
  onUpdateTenant?: (t: Tenant) => void;
  onDeleteTenant?: (id: string) => void;
  onSwitchTenant?: (t: Tenant) => void;
  // ---
  branding: BrandingConfig;
  onBrandingChange: (branding: BrandingConfig) => void;
  onNicheChange: (niche: string) => void;
  evolutionConfig: EvolutionConfig;
  onEvolutionConfigChange: (config: EvolutionConfig) => void;
  notify: (msg: string) => void;
}

type AdminSubTab = 'tenants' | 'team' | 'n8n' | 'business' | 'branding' | 'integrations' | 'payments';

export const AdminModule: React.FC<AdminModuleProps> = ({ 
  tenant, onTenantChange, 
  allTenants, onAddTenant, onUpdateTenant, onDeleteTenant, onSwitchTenant,
  branding, onBrandingChange, evolutionConfig, onEvolutionConfigChange, notify 
}) => {
  const [activeTab, setActiveTab] = useState<AdminSubTab>('tenants');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Refs para Inputs de Arquivo
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const subTabs = [
    { id: 'tenants' as const, label: 'Filiais', icon: Network }, // Multi-Tenant
    { id: 'team' as const, label: 'Equipe', icon: UserCog }, // User Management
    { id: 'n8n' as const, label: 'N8n API', icon: CloudLightning }, // Webhooks Avançados
    { id: 'business' as const, label: 'Dados da Unidade', icon: Building2 },
    { id: 'branding' as const, label: 'Visual', icon: Palette },
    { id: 'integrations' as const, label: 'Conexões', icon: Wifi },
    { id: 'payments' as const, label: 'Financeiro', icon: CreditCard },
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
      notify('Visual da Marca Atualizado na sua Aplicação!');
    }, 1000);
  };

  // HANDLER PARA TROCA DE MODO POR TENANT ESPECÍFICO
  const handleTenantModeChange = (targetTenant: Tenant, mode: SalesMode) => {
    const updatedTenant = { ...targetTenant, salesMode: mode };
    
    // Atualiza na lista global
    if (onUpdateTenant) {
      onUpdateTenant(updatedTenant);
    }

    // Se for o tenant que está ativo na sessão, atualiza o contexto atual também
    if (tenant && tenant.id === targetTenant.id && onTenantChange) {
      onTenantChange(updatedTenant);
    }

    notify(`Filial ${targetTenant.name}: Alterado para ${mode === 'DIRECT' ? 'Venda Direta' : 'Venda Consultiva'}`);
  };

  // HANDLER PARA DADOS EMPRESA (ACTIVE TENANT)
  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      notify('Dados da Unidade Atualizados!');
    }, 1000);
  };

  // HANDLER PARA INTEGRAÇÕES
  const handleSaveIntegrations = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    // Aqui chamaria a API real para salvar
    setTimeout(() => {
      setIsSyncing(false);
      notify('Conexões com Evolution e N8n Atualizadas!');
    }, 1200);
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in pb-40">
      
      {/* HEADER SETTINGS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div>
           <div className="flex items-center gap-4">
              <div className="p-4 bg-white/50 dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-2xl shadow-sm border border-white dark:border-slate-700 backdrop-blur-sm"><Settings size={32} /></div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-slate-100">Controle <span className="text-indigo-600">Total</span></h1>
           </div>
           <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 italic">Painel de Gestão da Franquia</p>
        </div>

        <div className="flex bg-white/60 dark:bg-slate-900 p-2.5 rounded-[2.5rem] shadow-sm border border-white dark:border-slate-800 overflow-x-auto no-scrollbar max-w-full gap-1 backdrop-blur-md">
           {subTabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-3.5 px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <tab.icon size={18} /> {tab.label}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-900 p-12 rounded-[4.5rem] border-2 border-white dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden min-h-[600px] backdrop-blur-sm">
         
         {/* ABA 0: GESTÃO MULTI-TENANT */}
         {activeTab === 'tenants' && allTenants && tenant && (
            <TenantManager 
              tenants={allTenants} 
              currentTenantId={tenant.id}
              onAdd={onAddTenant!} 
              onUpdate={onUpdateTenant!} 
              onDelete={onDeleteTenant!} 
              onSwitch={onSwitchTenant!} 
              notify={notify}
            />
         )}

         {/* ABA 1: EQUIPE (NOVO) */}
         {activeTab === 'team' && <TeamManager notify={notify} />}

         {/* ABA 2: N8N AVANÇADO (NOVO) */}
         {activeTab === 'n8n' && <N8nManager notify={notify} />}

         {/* ABA 3: DADOS DA EMPRESA E MODO DE OPERAÇÃO */}
         {activeTab === 'business' && allTenants && (
            <div className="space-y-12 animate-in slide-in-from-left-4">
                
                <div className="p-8 bg-indigo-50/50 dark:bg-slate-800/50 rounded-[3rem] border border-indigo-100 dark:border-slate-700">
                   <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
                      <div>
                         <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
                            <Zap size={20} className="text-orange-500"/> Modos de Operação por Unidade
                         </h3>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Defina a estratégia de venda para cada filial individualmente.</p>
                      </div>
                   </div>

                   {/* LISTA DE TENANTS PARA SELEÇÃO DE MODO */}
                   <div className="space-y-6">
                      {allTenants.map((t) => (
                        <div key={t.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-6 transition-all hover:border-indigo-300">
                           
                           {/* Info da Empresa */}
                           <div className="flex items-center gap-6 w-full xl:w-1/3">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ${t.id === tenant?.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                 {t.name.charAt(0)}
                              </div>
                              <div>
                                 <h4 className="font-black text-lg italic uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                    {t.name}
                                    {t.id === tenant?.id && <span className="text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded-md uppercase tracking-widest">Atual</span>}
                                 </h4>
                                 <div className="flex items-center gap-2 mt-1">
                                    <MapPin size={12} className="text-slate-400"/>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.niche}</p>
                                 </div>
                              </div>
                           </div>

                           {/* Seletor de Modo */}
                           <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                              
                              {/* OPÇÃO 1: VENDA DIRETA */}
                              <button 
                                onClick={() => handleTenantModeChange(t, 'DIRECT')}
                                className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all group ${
                                  t.salesMode === 'DIRECT' 
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md ring-2 ring-indigo-500/20' 
                                  : 'border-slate-100 dark:border-slate-800 opacity-60 hover:opacity-100 hover:border-indigo-200'
                                }`}
                              >
                                 <div className={`p-3 rounded-xl ${t.salesMode === 'DIRECT' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                    <ShoppingCart size={18} />
                                 </div>
                                 <div className="text-left">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${t.salesMode === 'DIRECT' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-500'}`}>Modo 1: Venda Direta</p>
                                    <p className="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">Catálogo, Carrinho e Checkout (Pix/Cartão).</p>
                                 </div>
                                 {t.salesMode === 'DIRECT' && <div className="ml-auto w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>}
                              </button>

                              {/* OPÇÃO 2: VENDA CONSULTIVA */}
                              <button 
                                onClick={() => handleTenantModeChange(t, 'ASSISTED')}
                                className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all group ${
                                  t.salesMode === 'ASSISTED' 
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md ring-2 ring-indigo-500/20' 
                                  : 'border-slate-100 dark:border-slate-800 opacity-60 hover:opacity-100 hover:border-indigo-200'
                                }`}
                              >
                                 <div className={`p-3 rounded-xl ${t.salesMode === 'ASSISTED' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                    <Handshake size={18} />
                                 </div>
                                 <div className="text-left">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${t.salesMode === 'ASSISTED' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-500'}`}>Modo 2: Consultiva</p>
                                    <p className="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">Agendamento, SDR IA e Qualificação.</p>
                                 </div>
                                 {t.salesMode === 'ASSISTED' && <div className="ml-auto w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>}
                              </button>

                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* FORMULÁRIO DE EDIÇÃO RÁPIDA (APENAS PARA O TENANT ATIVO) */}
                {tenant && (
                  <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                     <h3 className="text-sm font-black uppercase text-slate-400 mb-6 tracking-widest">Editar Detalhes da Unidade Atual ({tenant.name})</h3>
                     <form onSubmit={handleSaveBusiness} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 px-4">Nome da Empresa</label>
                              <input 
                                value={tenant.name} 
                                onChange={e => onTenantChange && onTenantChange({...tenant, name: e.target.value})}
                                className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 shadow-inner dark:text-white" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 px-4">Segmento / Nicho</label>
                              <input 
                                value={tenant.niche} 
                                onChange={e => onTenantChange && onTenantChange({...tenant, niche: e.target.value})}
                                className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 shadow-inner dark:text-white" 
                              />
                           </div>
                        </div>
                        
                        <div className="flex justify-end pt-4">
                           <button type="submit" disabled={isSyncing} className="px-10 py-5 bg-slate-900 dark:bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:scale-105 transition-transform flex items-center gap-3 uppercase text-[10px] tracking-widest">
                              {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                              Salvar Dados da Unidade
                           </button>
                        </div>
                     </form>
                  </div>
                )}
            </div>
         )}

         {/* ABA 4: BRANDING (MARCA) */}
         {activeTab === 'branding' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-right-4">
                <div className="space-y-8">
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700">
                      <h4 className="text-sm font-black uppercase text-slate-600 dark:text-slate-300 mb-6 flex items-center gap-3"><ImagePlus size={18} /> Logo Principal</h4>
                      <div className="flex items-center gap-6">
                         <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-3xl shadow-sm flex items-center justify-center p-4 border border-slate-100 dark:border-slate-800">
                            {branding.fullLogo ? <img src={branding.fullLogo} className="w-full h-full object-contain" /> : <span className="text-[9px] font-bold text-slate-300">Sem Logo</span>}
                         </div>
                         <div className="flex-1 space-y-3">
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Recomendado: PNG Transparente, 200x80px.</p>
                            <input 
                              type="file" 
                              ref={logoInputRef}
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'fullLogo')}
                            />
                            <button 
                              onClick={() => logoInputRef.current?.click()}
                              className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors"
                            >
                               Upload Imagem
                            </button>
                         </div>
                      </div>
                   </div>

                   <form onSubmit={handleSaveBranding} className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 px-4">Nome do Aplicativo (Título)</label>
                         <input 
                           value={branding.appName} 
                           onChange={e => onBrandingChange({...branding, appName: e.target.value})}
                           className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 dark:text-white" 
                         />
                      </div>
                      <button type="submit" disabled={isSyncing} className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-widest">
                         {isSyncing ? 'Aplicando...' : 'Salvar Identidade Visual'}
                      </button>
                   </form>
                </div>

                {/* PREVIEW */}
                <div className="bg-slate-100 dark:bg-slate-950 rounded-[3rem] p-8 border-4 border-slate-200 dark:border-slate-800 shadow-inner flex flex-col justify-center items-center opacity-80 select-none pointer-events-none">
                   <p className="text-[10px] font-black uppercase text-slate-400 mb-8 tracking-widest">Preview da Área de Login</p>
                   <div className="bg-white dark:bg-slate-900 w-64 rounded-3xl shadow-2xl p-6 space-y-4">
                      <div className="h-8 bg-slate-50 dark:bg-slate-800 rounded-lg w-full flex items-center justify-center overflow-hidden">
                         {branding.fullLogo && <img src={branding.fullLogo} className="h-6 w-auto object-contain" />}
                      </div>
                      <div className="h-2 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto"></div>
                      <div className="space-y-2">
                         <div className="h-8 w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700"></div>
                         <div className="h-8 w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700"></div>
                      </div>
                      <div className="h-8 w-full bg-indigo-600 rounded-xl"></div>
                   </div>
                </div>
            </div>
         )}

         {/* ABA 5: INTEGRAÇÕES (Evolution API & N8n Core) */}
         {activeTab === 'integrations' && (
            <div className="animate-in slide-in-from-right-4 space-y-8">
               <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[3rem] border border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-center gap-4 mb-4 text-blue-600 dark:text-blue-400">
                     <Wifi size={24} />
                     <h3 className="text-xl font-black italic uppercase tracking-tight">Core Connections</h3>
                  </div>
                  <p className="text-[11px] font-bold text-blue-800/70 dark:text-blue-200 leading-relaxed max-w-2xl">
                     Configuração crítica da infraestrutura. Aponte para seus clusters privados para garantir que o Dashboard receba eventos em tempo real.
                  </p>
               </div>

               <form onSubmit={handleSaveIntegrations} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <div className="flex items-center gap-3 mb-2">
                        <Smartphone size={18} className="text-emerald-500" />
                        <h4 className="text-sm font-black uppercase text-slate-700 dark:text-slate-200">Evolution API (WhatsApp)</h4>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-4">Base URL</label>
                        <input 
                           value={evolutionConfig.baseUrl} 
                           onChange={e => onEvolutionConfigChange({...evolutionConfig, baseUrl: e.target.value})}
                           placeholder="https://api.clikai.com.br" 
                           className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-emerald-500/10 shadow-inner" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-4">Global API Key</label>
                        <input 
                           type="password"
                           value={evolutionConfig.apiKey} 
                           onChange={e => onEvolutionConfigChange({...evolutionConfig, apiKey: e.target.value})}
                           className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-emerald-500/10 shadow-inner" 
                        />
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex items-center gap-3 mb-2">
                        <Workflow size={18} className="text-rose-500" />
                        <h4 className="text-sm font-black uppercase text-slate-700 dark:text-slate-200">N8n Orchestrator</h4>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-4">Base URL / Webhook Principal</label>
                        <input 
                           placeholder="https://n8n.clikai.com.br/webhook/..." 
                           defaultValue="https://n8n.clikai.com.br/"
                           className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-rose-500/10 shadow-inner" 
                        />
                     </div>
                     <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-500">Status Cluster</span>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase border border-emerald-500/20">Online</span>
                     </div>
                  </div>

                  <div className="md:col-span-2 pt-6 flex justify-end">
                     <button type="submit" disabled={isSyncing} className="px-12 py-6 bg-slate-900 dark:bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:scale-[1.02] transition-transform uppercase text-[10px] tracking-widest flex items-center gap-3">
                        {isSyncing ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        Salvar Conexões
                     </button>
                  </div>
               </form>
            </div>
         )}

         {/* ABA 6: PAGAMENTOS (INTEGRAÇÃO) */}
         {activeTab === 'payments' && <IntegrationSettings />}

      </div>
    </div>
  );
};
