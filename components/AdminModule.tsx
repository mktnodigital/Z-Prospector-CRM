
import React, { useState, useRef } from 'react';
import { 
  Users, Key, Webhook, Plus, ShieldCheck, 
  Activity, Server, Zap, Loader2, Trash2, 
  Settings, Play, ExternalLink, RefreshCcw, 
  Code, Database, Cpu, Bot, TrendingUp,
  Download, FileJson, Sparkles, MessageSquare, 
  ArrowRight, CheckCircle2, ShoppingCart, CreditCard, Landmark, Globe, Palette, Building2,
  Image as ImageIcon, Type, Layout, Save, X, Ban, Edit3, Smartphone, Globe2,
  Lock, ShieldAlert, Fingerprint, History, Monitor, Shield
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
  const [activeTab, setActiveTab] = useState<AdminSubTab>('tenants');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Mock de Tenants para Demonstração
  const [tenants, setTenants] = useState<Tenant[]>([
    { id: '1', name: 'Barbearia Matriz', niche: 'Barbearia', healthScore: 98, revenue: 12450, activeLeads: 450, status: 'ONLINE', instanceStatus: 'CONNECTED' },
    { id: '2', name: 'Estética VIP', niche: 'Estética', healthScore: 85, revenue: 8200, activeLeads: 210, status: 'WARNING', instanceStatus: 'DISCONNECTED' },
    { id: '3', name: 'Imobiliária Sul', niche: 'Imóveis', healthScore: 92, revenue: 45000, activeLeads: 890, status: 'ONLINE', instanceStatus: 'CONNECTED' },
  ]);

  const subTabs = [
    { id: 'tenants' as const, label: 'Unidades', icon: Building2 },
    { id: 'payments' as const, label: 'Financeiro', icon: CreditCard },
    { id: 'branding' as const, label: 'Marca', icon: Palette },
    { id: 'infra' as const, label: 'Infra', icon: Server },
    { id: 'security' as const, label: 'Segurança', icon: ShieldCheck },
  ];

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      notify('Visual da Marca Atualizado Globalmente!');
    }, 1000);
  };

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
         
         {/* ABA: UNIDADES */}
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
                 <button className="flex items-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
                    <Plus size={18} /> Nova Unidade
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {tenants.map(tenant => (
                   <div key={tenant.id} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 p-8 rounded-[3rem] relative group hover:border-orange-500 transition-all shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                         <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase border ${tenant.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                            {tenant.status}
                         </div>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-white dark:bg-slate-700 text-slate-400 hover:text-orange-600 rounded-lg shadow-sm"><Edit3 size={14}/></button>
                         </div>
                      </div>
                      <h4 className="text-xl font-black italic uppercase tracking-tight mb-2">{tenant.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 italic">Nicho: {tenant.niche}</p>
                      <div className="grid grid-cols-2 gap-4 mb-8">
                         <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Leads</p>
                            <h5 className="font-black text-indigo-600">{tenant.activeLeads}</h5>
                         </div>
                         <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Receita</p>
                            <h5 className="font-black text-emerald-600">R$ {tenant.revenue.toLocaleString()}</h5>
                         </div>
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                         <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
                            <Smartphone size={14} className={tenant.instanceStatus === 'CONNECTED' ? 'text-emerald-500' : 'text-rose-500'} />
                            WhatsApp {tenant.instanceStatus}
                         </div>
                         <div className="text-[10px] font-black text-orange-600 italic">Score: {tenant.healthScore}%</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
         )}

         {/* ABA: FINANCEIRO MASTER */}
         {activeTab === 'payments' && <IntegrationSettings />}

         {/* ABA: MARCA (WHITE-LABEL) */}
         {activeTab === 'branding' && (
           <div className="space-y-12 animate-in slide-in-from-bottom-4 max-w-4xl">
              <div className="flex items-center gap-6">
                 <div className="p-5 bg-orange-50 text-orange-600 rounded-[2rem]"><Palette size={32} /></div>
                 <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-200">White-label Engine</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Customização Total da Identidade do SaaS</p>
                 </div>
              </div>
              <form onSubmit={handleSaveBranding} className="space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 px-4">Nome da Plataforma</label>
                          <input 
                             value={branding.appName} 
                             onChange={(e) => onBrandingChange({...branding, appName: e.target.value})}
                             className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-black italic border-none shadow-inner outline-none focus:ring-4 ring-orange-500/10" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 px-4">Logo Principal (URL)</label>
                          <input 
                             value={branding.fullLogo} 
                             onChange={(e) => onBrandingChange({...branding, fullLogo: e.target.value})}
                             className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none shadow-inner outline-none" 
                          />
                       </div>
                    </div>
                    <div className="bg-slate-950 p-10 rounded-[3.5rem] border-4 border-slate-900 shadow-2xl flex flex-col items-center gap-4">
                       <img src={branding.fullLogo} alt="Preview" className="h-10 object-contain" />
                       <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em]">Visualização em Tempo Real</p>
                    </div>
                 </div>
                 <div className="pt-8 flex justify-end">
                    <button type="submit" className="px-12 py-6 bg-orange-600 text-white font-black rounded-3xl shadow-xl uppercase text-[10px] tracking-widest">Salvar Branding</button>
                 </div>
              </form>
           </div>
         )}

         {/* ABA: INFRA MASTER */}
         {activeTab === 'infra' && (
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
               <div className="pt-10 flex justify-end">
                  <button onClick={handleGlobalSync} className="px-12 py-6 bg-orange-600 text-white font-black rounded-3xl shadow-xl uppercase text-[10px] tracking-widest">Sincronizar Cluster</button>
               </div>
            </div>
         )}

         {/* ABA: SEGURANÇA MASTER (NOVA IMPLEMENTAÇÃO) */}
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
                 <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full border border-emerald-100 dark:border-emerald-800">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Rede Protegida</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { label: 'Security Score', value: '100%', icon: Shield, color: 'text-emerald-500' },
                   { label: 'Sessões Ativas', value: '01', icon: Monitor, color: 'text-blue-500' },
                   { label: 'Vault Status', value: 'Encrypted', icon: Lock, color: 'text-orange-500' }
                 ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800/40 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700">
                       <div className={`p-4 rounded-2xl bg-white dark:bg-slate-900 w-fit mb-6 ${stat.color} shadow-sm`}><stat.icon size={24}/></div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                       <h4 className="text-2xl font-black italic tracking-tighter">{stat.value}</h4>
                    </div>
                 ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="flex items-center gap-4 mb-8">
                       <Fingerprint className="text-orange-600" size={20} />
                       <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 italic">Sessões Master Ativas</h4>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center font-black">M</div>
                             <div>
                                <p className="text-xs font-black italic uppercase tracking-tight text-slate-900 dark:text-white">Este Computador</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">IP: 189.45.XXX.XX • São Paulo, BR</p>
                             </div>
                          </div>
                          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">Atual</span>
                       </div>
                    </div>
                 </div>

                 <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-4">
                          <History className="text-orange-600" size={20} />
                          <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 italic">Audit Log Master</h4>
                       </div>
                       <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Ver Todos</button>
                    </div>
                    <div className="space-y-6">
                       {[
                         { ev: 'Login Efetuado', time: 'Há 12 min', status: 'SUCCESS' },
                         { ev: 'Branding Global Alterado', time: 'Há 1 hora', status: 'INFO' },
                         { ev: 'Rota de API Master Criada', time: 'Há 3 horas', status: 'WARNING' }
                       ].map((log, i) => (
                         <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-50 dark:border-slate-800 last:border-0 last:pb-0">
                            <div className="flex items-center gap-4">
                               <div className={`w-2 h-2 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-500' : log.status === 'INFO' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                               <p className="text-[11px] font-black italic uppercase tracking-tight text-slate-700 dark:text-slate-300">{log.ev}</p>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{log.time}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-orange-50 dark:bg-orange-900/10 rounded-[4rem] border border-orange-100 dark:border-orange-900/30 flex flex-col md:flex-row items-center justify-between gap-10 group overflow-hidden relative">
                 <ShieldAlert className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-125 transition-transform duration-1000" />
                 <div className="relative z-10 flex gap-6">
                    <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl text-orange-600 shadow-sm"><Key size={28}/></div>
                    <div className="space-y-2">
                       <h4 className="text-lg font-black italic uppercase tracking-tight text-slate-900 dark:text-white">Vault Master Rotation</h4>
                       <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase leading-relaxed tracking-widest italic">Rotacione suas Master Keys a cada 90 dias para manter a conformidade PCI/SaaS.</p>
                    </div>
                 </div>
                 <button className="px-10 py-5 bg-orange-600 text-white font-black rounded-3xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-orange-700 transition-all relative z-10">Gerar Novas Chaves</button>
              </div>
           </div>
         )}
      </div>

      {/* FOOTER STATS MASTER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { label: 'Unidades Ativas', value: tenants.length.toString(), icon: Building2, color: 'text-blue-600' },
           { label: 'Faturamento Rede', value: 'R$ 65.650', icon: TrendingUp, color: 'text-emerald-600' },
           { label: 'Status dos Sockets', value: 'ONLINE', icon: Globe2, color: 'text-orange-600' },
           { label: 'Versão do Cluster', value: 'v3.5.0-gold', icon: Code, color: 'text-indigo-600' }
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
