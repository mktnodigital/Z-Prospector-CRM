
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
  MapPin, Eye, Paintbrush, BoxSelect, Square, Circle
} from 'lucide-react';
import { BrandingConfig, EvolutionConfig, Tenant, SalesMode } from '../types';
import { IntegrationSettings } from './IntegrationSettings';
import { TenantManager } from './TenantManager';
import { TeamManager } from './TeamManager';
import { N8nManager } from './N8nManager';

interface AdminModuleProps {
  tenant?: Tenant;
  onTenantChange?: (t: Tenant) => void;
  allTenants?: Tenant[];
  onAddTenant?: (t: Tenant) => void;
  onUpdateTenant?: (t: Tenant) => void;
  onDeleteTenant?: (id: string) => void;
  onSwitchTenant?: (t: Tenant) => void;
  branding: BrandingConfig;
  onBrandingChange: (branding: BrandingConfig) => void;
  onNicheChange: (niche: string) => void;
  evolutionConfig: EvolutionConfig;
  onEvolutionConfigChange: (config: EvolutionConfig) => void;
  notify: (msg: string) => void;
}

type AdminSubTab = 'tenants' | 'team' | 'n8n' | 'business' | 'branding' | 'integrations' | 'payments';
type BrandingSection = 'identity' | 'colors' | 'ui';

export const AdminModule: React.FC<AdminModuleProps> = ({ 
  tenant, onTenantChange, 
  allTenants, onAddTenant, onUpdateTenant, onDeleteTenant, onSwitchTenant,
  branding, onBrandingChange, evolutionConfig, onEvolutionConfigChange, notify 
}) => {
  const [activeTab, setActiveTab] = useState<AdminSubTab>('tenants');
  const [brandingSection, setBrandingSection] = useState<BrandingSection>('identity');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Refs para Inputs de Arquivo
  const logoInputRef = useRef<HTMLInputElement>(null);
  const mobileIconInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  
  const subTabs = [
    { id: 'tenants' as const, label: 'Filiais', icon: Network }, 
    { id: 'team' as const, label: 'Equipe', icon: UserCog },
    { id: 'n8n' as const, label: 'N8n API', icon: CloudLightning },
    { id: 'business' as const, label: 'Dados da Unidade', icon: Building2 },
    { id: 'branding' as const, label: 'Visual', icon: Palette },
    { id: 'integrations' as const, label: 'Conexões', icon: Wifi },
    { id: 'payments' as const, label: 'Financeiro', icon: CreditCard },
  ];

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
      notify('Design System Atualizado Globalmente!');
    }, 1200);
  };

  const handleTenantModeChange = (targetTenant: Tenant, mode: SalesMode) => {
    const updatedTenant = { ...targetTenant, salesMode: mode };
    if (onUpdateTenant) onUpdateTenant(updatedTenant);
    if (tenant && tenant.id === targetTenant.id && onTenantChange) onTenantChange(updatedTenant);
    notify(`Filial ${targetTenant.name}: Alterado para ${mode === 'DIRECT' ? 'Venda Direta' : 'Venda Consultiva'}`);
  };

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      notify('Dados da Unidade Atualizados!');
    }, 1000);
  };

  const handleSaveIntegrations = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      notify('Conexões com Evolution e N8n Atualizadas!');
    }, 1200);
  };

  // Preview Component
  const LivePreview = () => (
    <div className="bg-slate-100 dark:bg-slate-950 rounded-[3rem] p-8 border-4 border-slate-200 dark:border-slate-800 shadow-inner flex flex-col justify-center items-center h-full relative overflow-hidden group">
       <div className="absolute top-4 right-6 text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
          <Eye size={14} /> Live Preview
       </div>
       
       {/* Fake Phone UI */}
       <div className="bg-white dark:bg-slate-900 w-72 h-[500px] rounded-[2.5rem] shadow-2xl p-6 relative border-[8px] border-slate-800 dark:border-slate-700 overflow-hidden transform transition-all group-hover:scale-105">
          {/* Dynamic Styles based on Branding Config */}
          <style>{`
            .preview-primary { background-color: ${branding.primaryColor || '#4f46e5'}; }
            .preview-text-primary { color: ${branding.primaryColor || '#4f46e5'}; }
            .preview-radius { border-radius: ${branding.borderRadius === 'full' ? '999px' : branding.borderRadius === 'large' ? '1.5rem' : branding.borderRadius === 'medium' ? '1rem' : '0.5rem'}; }
            .preview-font { font-family: '${branding.fontFamily || 'Inter'}', sans-serif; }
          `}</style>

          <div className="preview-font h-full flex flex-col">
             {/* Header */}
             <div className="flex justify-between items-center mb-6">
                <div className="h-8 flex items-center">
                   {branding.iconLogo ? (
                     <img src={branding.iconLogo} className="h-6 w-6 object-contain" />
                   ) : (
                     <div className="w-8 h-8 preview-primary rounded-lg"></div>
                   )}
                </div>
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
             </div>

             {/* Content Mockup */}
             <div className="space-y-4 flex-1">
                <div className="h-24 preview-primary preview-radius opacity-10 flex items-center justify-center border-2 border-dashed border-current preview-text-primary">
                   <p className="text-[10px] font-black uppercase">Área de Destaque</p>
                </div>
                <div className="space-y-2">
                   <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                   <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                   <div className="h-20 bg-slate-50 dark:bg-slate-800 preview-radius border border-slate-100 dark:border-slate-700"></div>
                   <div className="h-20 bg-slate-50 dark:bg-slate-800 preview-radius border border-slate-100 dark:border-slate-700"></div>
                </div>
             </div>

             {/* Bottom Nav / CTA */}
             <div className="mt-auto pt-4">
                <button className="w-full h-12 preview-primary preview-radius text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                   Ação Principal
                </button>
             </div>
          </div>
       </div>
    </div>
  );

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

         {activeTab === 'team' && <TeamManager notify={notify} />}

         {activeTab === 'n8n' && <N8nManager notify={notify} />}

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
                   <div className="space-y-6">
                      {allTenants.map((t) => (
                        <div key={t.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-6 transition-all hover:border-indigo-300">
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
                           <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                              <button onClick={() => handleTenantModeChange(t, 'DIRECT')} className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all group ${t.salesMode === 'DIRECT' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md ring-2 ring-indigo-500/20' : 'border-slate-100 dark:border-slate-800 opacity-60 hover:opacity-100 hover:border-indigo-200'}`}>
                                 <div className={`p-3 rounded-xl ${t.salesMode === 'DIRECT' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}><ShoppingCart size={18} /></div>
                                 <div className="text-left">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${t.salesMode === 'DIRECT' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-500'}`}>Modo 1: Venda Direta</p>
                                    <p className="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">Catálogo, Carrinho e Checkout (Pix/Cartão).</p>
                                 </div>
                                 {t.salesMode === 'DIRECT' && <div className="ml-auto w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>}
                              </button>
                              <button onClick={() => handleTenantModeChange(t, 'ASSISTED')} className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all group ${t.salesMode === 'ASSISTED' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md ring-2 ring-indigo-500/20' : 'border-slate-100 dark:border-slate-800 opacity-60 hover:opacity-100 hover:border-indigo-200'}`}>
                                 <div className={`p-3 rounded-xl ${t.salesMode === 'ASSISTED' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}><Handshake size={18} /></div>
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
                {tenant && (
                  <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                     <h3 className="text-sm font-black uppercase text-slate-400 mb-6 tracking-widest">Editar Detalhes da Unidade Atual ({tenant.name})</h3>
                     <form onSubmit={handleSaveBusiness} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 px-4">Nome da Empresa</label>
                              <input value={tenant.name} onChange={e => onTenantChange && onTenantChange({...tenant, name: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 shadow-inner dark:text-white" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 px-4">Segmento / Nicho</label>
                              <input value={tenant.niche} onChange={e => onTenantChange && onTenantChange({...tenant, niche: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 shadow-inner dark:text-white" />
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

         {/* ABA 4: VISUAL / BRANDING STUDIO */}
         {activeTab === 'branding' && (
            <div className="flex flex-col lg:flex-row gap-12 h-full">
               
               {/* Left Controls */}
               <div className="flex-1 space-y-8 animate-in slide-in-from-left-4">
                  
                  {/* Branding Sub-Tabs */}
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[2rem] border border-slate-200 dark:border-slate-700">
                     {[
                       { id: 'identity', label: 'Identidade & Assets', icon: ImagePlus },
                       { id: 'colors', label: 'Cores & Tema', icon: Paintbrush },
                       { id: 'ui', label: 'Layout & Tipografia', icon: Layout }
                     ].map(b => (
                       <button
                         key={b.id}
                         onClick={() => setBrandingSection(b.id as any)}
                         className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.6rem] text-[9px] font-black uppercase tracking-widest transition-all ${brandingSection === b.id ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                       >
                          <b.icon size={14} /> {b.label}
                       </button>
                     ))}
                  </div>

                  <form onSubmit={handleSaveBranding} className="space-y-8">
                     
                     {/* SECÇÃO 1: ASSETS */}
                     {brandingSection === 'identity' && (
                        <div className="space-y-8 animate-in fade-in">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase text-slate-400 px-4">Logotipo Principal</label>
                              <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700">
                                 <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center p-2 border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    {branding.fullLogo ? <img src={branding.fullLogo} className="w-full h-full object-contain" /> : <ImageIcon className="text-slate-300" />}
                                 </div>
                                 <div className="flex-1">
                                    <button type="button" onClick={() => logoInputRef.current?.click()} className="px-6 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Alterar Logo</button>
                                    <p className="text-[9px] text-slate-400 mt-2 ml-1">PNG Transparente (200x80px)</p>
                                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'fullLogo')} />
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-4">
                                 <label className="text-[10px] font-black uppercase text-slate-400 px-4">Favicon (Nav)</label>
                                 <div 
                                   onClick={() => logoInputRef.current?.click()} // Reusing logic for brevity, ideally specific ref
                                   className="h-32 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-all"
                                 >
                                    {branding.favicon ? <img src={branding.favicon} className="w-8 h-8" /> : <Globe size={24} className="text-slate-300" />}
                                    <span className="text-[8px] font-black text-slate-400 uppercase mt-2">Upload ICO</span>
                                 </div>
                              </div>
                              <div className="space-y-4">
                                 <label className="text-[10px] font-black uppercase text-slate-400 px-4">Ícone App (PWA)</label>
                                 <div 
                                   onClick={() => mobileIconInputRef.current?.click()}
                                   className="h-32 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-all"
                                 >
                                    {branding.mobileIcon ? <img src={branding.mobileIcon} className="w-10 h-10 rounded-lg" /> : <Smartphone size={24} className="text-slate-300" />}
                                    <span className="text-[8px] font-black text-slate-400 uppercase mt-2">Upload PNG</span>
                                    <input type="file" ref={mobileIconInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'mobileIcon')} />
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 px-4">Nome da Aplicação</label>
                              <input value={branding.appName} onChange={e => onBrandingChange({...branding, appName: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 dark:text-white" />
                           </div>
                        </div>
                     )}

                     {/* SECÇÃO 2: CORES */}
                     {brandingSection === 'colors' && (
                        <div className="space-y-8 animate-in fade-in">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 px-4">Cor Primária (Destaque)</label>
                              <div className="flex items-center gap-4 p-2 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                                 <input type="color" value={branding.primaryColor || '#4f46e5'} onChange={e => onBrandingChange({...branding, primaryColor: e.target.value})} className="w-16 h-16 rounded-[1.5rem] border-none cursor-pointer bg-transparent" />
                                 <input type="text" value={branding.primaryColor || '#4f46e5'} onChange={e => onBrandingChange({...branding, primaryColor: e.target.value})} className="flex-1 bg-transparent border-none font-mono font-bold text-slate-600 dark:text-slate-300 outline-none uppercase" />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 px-4">Cor Secundária (Detalhes)</label>
                              <div className="flex items-center gap-4 p-2 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                                 <input type="color" value={branding.secondaryColor || '#ec4899'} onChange={e => onBrandingChange({...branding, secondaryColor: e.target.value})} className="w-16 h-16 rounded-[1.5rem] border-none cursor-pointer bg-transparent" />
                                 <input type="text" value={branding.secondaryColor || '#ec4899'} onChange={e => onBrandingChange({...branding, secondaryColor: e.target.value})} className="flex-1 bg-transparent border-none font-mono font-bold text-slate-600 dark:text-slate-300 outline-none uppercase" />
                              </div>
                           </div>
                           
                           <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                              <label className="text-[10px] font-black uppercase text-slate-400 px-4 mb-4 block">Modo Padrão</label>
                              <div className="flex gap-4">
                                 {['light', 'dark', 'system'].map(mode => (
                                    <button
                                      key={mode}
                                      type="button"
                                      onClick={() => onBrandingChange({...branding, themeMode: mode as any})}
                                      className={`flex-1 py-4 rounded-2xl border-2 capitalize font-bold text-xs transition-all ${branding.themeMode === mode ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                                    >
                                       {mode}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </div>
                     )}

                     {/* SECÇÃO 3: UI / LAYOUT */}
                     {brandingSection === 'ui' && (
                        <div className="space-y-8 animate-in fade-in">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase text-slate-400 px-4">Estilo da Fonte</label>
                              <div className="grid grid-cols-2 gap-4">
                                 {['Inter', 'Roboto', 'Poppins', 'Lato'].map(font => (
                                    <button
                                      key={font}
                                      type="button"
                                      onClick={() => onBrandingChange({...branding, fontFamily: font as any})}
                                      className={`p-4 rounded-2xl border-2 transition-all ${branding.fontFamily === font ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}
                                      style={{ fontFamily: font }}
                                    >
                                       <span className="text-lg font-bold">Aa</span>
                                       <p className="text-[9px] uppercase mt-1">{font}</p>
                                    </button>
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase text-slate-400 px-4">Bordas & Formas</label>
                              <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-[1.5rem] border border-slate-100 dark:border-slate-700">
                                 {[
                                   { id: 'small', icon: Square, label: 'Sharp' },
                                   { id: 'medium', icon: BoxSelect, label: 'Soft' },
                                   { id: 'large', icon: Layout, label: 'Round' },
                                   { id: 'full', icon: Circle, label: 'Full' }
                                 ].map(r => (
                                    <button
                                      key={r.id}
                                      type="button"
                                      onClick={() => onBrandingChange({...branding, borderRadius: r.id as any})}
                                      className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all ${branding.borderRadius === r.id ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                       <r.icon size={16} />
                                       <span className="text-[8px] font-black uppercase mt-1">{r.label}</span>
                                    </button>
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase text-slate-400 px-4">Login Background</label>
                              <div 
                                onClick={() => bgInputRef.current?.click()}
                                className="h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center gap-4 cursor-pointer hover:border-indigo-400 transition-all overflow-hidden relative"
                              >
                                 {branding.loginBackground ? (
                                    <>
                                       <img src={branding.loginBackground} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                       <span className="relative z-10 text-[9px] font-black uppercase bg-white/80 px-3 py-1 rounded-lg">Alterar Imagem</span>
                                    </>
                                 ) : (
                                    <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-2"><ImagePlus size={14}/> Carregar Wallpaper HD</span>
                                 )}
                                 <input type="file" ref={bgInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'loginBackground')} />
                              </div>
                           </div>
                        </div>
                     )}

                     <button type="submit" disabled={isSyncing} className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 hover:scale-[1.02] transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-3">
                        {isSyncing ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        {isSyncing ? 'Aplicando Design System...' : 'Salvar Identidade Visual'}
                     </button>
                  </form>
               </div>

               {/* Right Live Preview */}
               <div className="hidden lg:block w-96">
                  <LivePreview />
               </div>
            </div>
         )}

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

         {activeTab === 'payments' && <IntegrationSettings />}

      </div>
    </div>
  );
};
