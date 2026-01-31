
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

type AdminSubTab = 'business' | 'branding' | 'payments';

export const AdminModule: React.FC<AdminModuleProps> = ({ tenant, onTenantChange, branding, onBrandingChange, evolutionConfig, onEvolutionConfigChange, notify }) => {
  const [activeTab, setActiveTab] = useState<AdminSubTab>('business');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Refs para Inputs de Arquivo
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const subTabs = [
    { id: 'business' as const, label: 'Dados da Empresa', icon: Building2 },
    { id: 'branding' as const, label: 'Marca & Visual', icon: Palette },
    { id: 'payments' as const, label: 'Meios de Pagamento', icon: CreditCard },
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

  // HANDLER PARA TROCA DE MODO
  const handleChangeSalesMode = (mode: SalesMode) => {
    if (tenant && onTenantChange) {
      onTenantChange({ ...tenant, salesMode: mode });
      notify(`Modo de Operação alterado para: ${mode === 'DIRECT' ? 'Venda Direta' : 'Venda Assistida'}`);
    }
  };

  // HANDLER PARA DADOS EMPRESA
  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      notify('Dados da Unidade Atualizados!');
    }, 1000);
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in pb-40">
      
      {/* HEADER SETTINGS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div>
           <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-2xl shadow-sm"><Settings size={32} /></div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-slate-100">Configurações <span className="text-indigo-600">Gerais</span></h1>
           </div>
           <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 italic">Ajustes da sua Unidade</p>
        </div>

        <div className="flex bg-white dark:bg-slate-900 p-2.5 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar max-w-full gap-1">
           {subTabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-3.5 px-9 py-5 rounded-[1.8rem] text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <tab.icon size={22} /> {tab.label}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-12 rounded-[4.5rem] border-2 border-slate-50 dark:border-slate-800 shadow-sm relative overflow-hidden min-h-[600px]">
         
         {/* ABA 1: DADOS DA EMPRESA E MODO DE OPERAÇÃO */}
         {activeTab === 'business' && tenant && onTenantChange && (
            <div className="space-y-12 animate-in slide-in-from-left-4">
                
                {/* SELETOR DE MODO DE VENDA */}
                <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border border-slate-100 dark:border-slate-700">
                   <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                      <div>
                         <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
                            <Zap size={20} className="text-orange-500"/> Modo de Operação Ativo
                         </h3>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Como sua unidade vende hoje?</p>
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
                            <Handshake size={16} /> Venda Consultiva
                         </button>
                      </div>
                   </div>
                   
                   <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className={`p-6 rounded-3xl border transition-all ${tenant.salesMode === 'DIRECT' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'opacity-50 border-transparent'}`}>
                         <p className="text-[9px] font-black uppercase text-indigo-600 mb-2">Modo 1: Catálogo Digital</p>
                         <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Ideal para delivery, e-commerce e varejo. O cliente escolhe no catálogo e faz checkout (Pix/Cartão). A IA foca em tirar dúvidas sobre produtos.</p>
                      </div>
                      <div className={`p-6 rounded-3xl border transition-all ${tenant.salesMode === 'ASSISTED' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'opacity-50 border-transparent'}`}>
                         <p className="text-[9px] font-black uppercase text-indigo-600 mb-2">Modo 2: Agendamento & Serviço</p>
                         <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Ideal para clínicas, barbearias e consultorias. O foco é agendar um horário na agenda. A IA qualifica e busca disponibilidade.</p>
                      </div>
                   </div>
                </div>

                {/* FORMULÁRIO BÁSICO */}
                <form onSubmit={handleSaveBusiness} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 px-4">Nome da Empresa</label>
                         <input 
                           value={tenant.name} 
                           onChange={e => onTenantChange({...tenant, name: e.target.value})}
                           className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 shadow-inner dark:text-white" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 px-4">Segmento / Nicho</label>
                         <input 
                           value={tenant.niche} 
                           onChange={e => onTenantChange({...tenant, niche: e.target.value})}
                           className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 shadow-inner dark:text-white" 
                         />
                      </div>
                   </div>
                   
                   <div className="flex justify-end pt-4">
                      <button type="submit" disabled={isSyncing} className="px-10 py-5 bg-slate-900 dark:bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:scale-105 transition-transform flex items-center gap-3 uppercase text-[10px] tracking-widest">
                         {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                         Salvar Dados
                      </button>
                   </div>
                </form>
            </div>
         )}

         {/* ABA 2: BRANDING (MARCA) */}
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

         {/* ABA 3: PAGAMENTOS (INTEGRAÇÃO) */}
         {activeTab === 'payments' && <IntegrationSettings />}

      </div>
    </div>
  );
};
