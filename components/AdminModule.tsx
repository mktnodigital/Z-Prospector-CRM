
import React, { useState, useMemo } from 'react';
import { 
  Users, Key, Webhook, Plus, ShieldCheck, 
  Activity, Server, Zap, Loader2, Trash2, 
  Settings, Play, ExternalLink, RefreshCcw, 
  Code, Database, Cpu, Bot, TrendingUp,
  Download, FileJson, Sparkles, MessageSquare, 
  ArrowRight, CheckCircle2, ShoppingCart, CreditCard, Landmark, Globe, Palette, Building2
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

export const AdminModule: React.FC<AdminModuleProps> = ({ branding, onBrandingChange, evolutionConfig, notify }) => {
  const [activeTab, setActiveTab] = useState<AdminSubTab>('infra');
  const [isSyncing, setIsSyncing] = useState(false);

  const subTabs = [
    { id: 'infra' as const, label: 'Infraestrutura', icon: Server },
    { id: 'tenants' as const, label: 'Unidades / Tenants', icon: Building2 },
    { id: 'payments' as const, label: 'Pagamentos / Gateways', icon: CreditCard },
    { id: 'branding' as const, label: 'Visual / Marca', icon: Palette },
    { id: 'security' as const, label: 'Segurança Master', icon: ShieldCheck },
  ];

  const handleGlobalSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      notify('Ambiente Master Sincronizado com Sucesso!');
    }, 1500);
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in pb-40">
      
      {/* HEADER MASTER ADMIN */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div>
           <div className="flex items-center gap-4">
              <div className="p-4 bg-orange-500 text-white rounded-2xl shadow-xl shadow-orange-500/20 rotate-3 transition-transform hover:rotate-0"><ShieldCheck size={32} /></div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">Command <span className="text-orange-600">Center</span></h1>
           </div>
           <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 italic">Configurações de Autoridade • clikai.com.br</p>
        </div>

        <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
           {subTabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-orange-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
             >
                <tab.icon size={16} /> {tab.label}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-12 rounded-[4.5rem] border-2 border-slate-50 dark:border-slate-800 shadow-sm relative overflow-hidden">
         {/* BACKGROUND ACCENT */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-orange-500/5 to-transparent blur-[120px] pointer-events-none"></div>
         
         {activeTab === 'payments' ? (
           <IntegrationSettings />
         ) : activeTab === 'infra' ? (
            <div className="space-y-12 animate-in slide-in-from-bottom-4">
               <div className="flex items-center gap-6">
                  <div className="p-5 bg-orange-50 text-orange-600 rounded-[2rem]"><Zap size={32} /></div>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-200">Core Engine Evolution</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sincronização via Socket HostGator / Cloud</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-slate-400 px-4">Evolution URL Base</label>
                     <input value={evolutionConfig.baseUrl} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-orange-500/10 shadow-inner" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase text-slate-400 px-4">Master API Key</label>
                     <input type="password" value={evolutionConfig.apiKey} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-orange-500/10 shadow-inner" />
                  </div>
               </div>

               <div className="pt-10 border-t border-slate-50 dark:border-slate-800 flex justify-end gap-4">
                  <button onClick={handleGlobalSync} disabled={isSyncing} className="flex items-center gap-3 px-12 py-6 bg-orange-600 text-white font-black rounded-3xl shadow-xl hover:bg-orange-700 transition-all uppercase text-[10px] tracking-widest">
                     {isSyncing ? <Loader2 className="animate-spin" /> : <RefreshCcw size={18} />}
                     Propagar Configuração Global
                  </button>
               </div>
            </div>
         ) : (
           <div className="py-40 flex flex-col items-center justify-center text-slate-300 opacity-20 grayscale select-none gap-8">
              <div className="p-16 rounded-full border-4 border-dashed border-slate-200">
                <Settings size={100} className="animate-pulse" />
              </div>
              <p className="text-3xl font-black uppercase tracking-[0.4em] italic">Módulo em Desenvolvimento</p>
           </div>
         )}
      </div>

      {/* FOOTER STATS MASTER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { label: 'Unidades Ativas', value: '42', icon: Building2, color: 'text-blue-600' },
           { label: 'Uptime Evolution', value: '99.98%', icon: Server, color: 'text-emerald-600' },
           { label: 'Carga Master IA', value: '18%', icon: Bot, color: 'text-orange-600' },
           { label: 'Versão Stable', value: 'v3.2.1', icon: Code, color: 'text-indigo-600' }
         ].map((stat, i) => (
           <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
              <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 ${stat.color}`}><stat.icon size={24} /></div>
              <div>
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                 <h4 className="text-xl font-black italic tracking-tight">{stat.value}</h4>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};
