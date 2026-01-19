
import React, { useState, useMemo } from 'react';
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
  Type, Check, FileDown, BookCopy, Sun, Moon, Frame,
  Lock, UserPlus, Mail, Fingerprint, Network,
  // Fix: Import Edit3 which was missing but used in the component
  Edit3
} from 'lucide-react';
import { IntegrationSettings } from './IntegrationSettings';
import { Tenant, EvolutionConfig, N8nWorkflow, UserRole, BrandingConfig } from '../types';

interface Props {
  branding: BrandingConfig;
  onBrandingChange: (config: BrandingConfig) => void;
  // Fix: Add missing onNicheChange prop that is passed from App.tsx
  onNicheChange: () => void;
  evolutionConfig: EvolutionConfig;
  onEvolutionConfigChange: (config: EvolutionConfig) => void;
  notify: (msg: string) => void;
}

export const AdminModule: React.FC<Props> = ({ branding, onBrandingChange, evolutionConfig, onEvolutionConfigChange, notify }) => {
  const [activeTab, setActiveTab] = useState<'infra' | 'tenants' | 'users' | 'branding' | 'security'>('infra');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- MOCK DATA PARA GESTÃO MULTI ---
  const [tenants, setTenants] = useState<Tenant[]>([
    { id: '1', name: 'Barbearia Estilo Master', niche: 'Estética', healthScore: 98, revenue: 12500, activeLeads: 450, status: 'ONLINE' },
    { id: '2', name: 'Imobiliária Prime', niche: 'Imóveis', healthScore: 85, revenue: 45000, activeLeads: 1200, status: 'ONLINE' },
    { id: '3', name: 'Clínica Sorriso', niche: 'Saúde', healthScore: 45, revenue: 8900, activeLeads: 120, status: 'WARNING' },
  ]);

  const [users, setUsers] = useState([
    { id: 'u1', name: 'Carlos Admin', email: 'carlos@clikai.com.br', role: 'SUPER_ADMIN', tenant: 'Rede Global', status: 'ACTIVE' },
    { id: 'u2', name: 'Ana Vendas', email: 'ana@barbearia.com', role: 'MANAGER', tenant: 'Barbearia Estilo', status: 'ACTIVE' },
    { id: 'u3', name: 'Bruno SDR', email: 'bruno@imob.com', role: 'AGENT', tenant: 'Imobiliária Prime', status: 'OFFLINE' },
  ]);

  const [localBranding, setLocalBranding] = useState(branding);
  const [n8nUrl, setN8nUrl] = useState('https://n8n.clikai.com.br/hooks/master-sync');

  const handleSyncInfra = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      notify('Infraestrutura Master Sincronizada com Sucesso!');
    }, 2000);
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in pb-32">
      
      {/* HEADER MASTER ADMIN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
           <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-rose-600 text-white rounded-[2.2rem] flex items-center justify-center shadow-[0_20px_50px_-10px_rgba(249,115,22,0.4)] transform hover:rotate-6 transition-transform">
              <ShieldCheck size={40} />
           </div>
           <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter">Command <span className="text-orange-500">Center</span></h1>
                <span className="px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 text-[10px] font-black uppercase rounded-xl border border-orange-200 dark:border-orange-800">SaaS Authority</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1 italic">Orquestração Multi-tenant clikai.com.br</p>
           </div>
        </div>
        <div className="flex gap-4">
           <button onClick={handleSyncInfra} className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:border-orange-500 transition-all shadow-sm">
              {isProcessing ? <Loader2 size={16} className="animate-spin text-orange-500" /> : <RefreshCcw size={16} className="text-orange-500" />}
              Sincronizar Nodes
           </button>
           <button className="px-10 py-4 bg-orange-500 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all">
              Novo Tenant
           </button>
        </div>
      </div>

      {/* TABS COLORIDAS */}
      <div className="flex bg-slate-100 dark:bg-slate-900/50 p-2 rounded-[2.5rem] w-full overflow-x-auto no-scrollbar shadow-inner border border-slate-200 dark:border-slate-800">
        {[
          { id: 'infra', label: 'Infraestrutura', icon: Cpu, color: 'text-blue-500', bg: 'bg-blue-500' },
          { id: 'tenants', label: 'Empresas (Tenants)', icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-500' },
          { id: 'users', label: 'Usuários & Permissões', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500' },
          { id: 'branding', label: 'Personalização (White-label)', icon: Palette, color: 'text-purple-500', bg: 'bg-purple-500' },
          { id: 'security', label: 'Segurança & Logs', icon: Lock, color: 'text-rose-500', bg: 'bg-rose-500' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 ${
              activeTab === tab.id ? `${tab.bg} text-white shadow-2xl scale-[1.02]` : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10">
        
        {/* CONTEÚDO: INFRAESTRUTURA */}
        {activeTab === 'infra' && (
          <div className="animate-in slide-in-from-bottom-4 space-y-10">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Evolution API Config */}
                <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-8 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl"></div>
                   <div className="flex items-center gap-5">
                      <div className="p-5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-[1.8rem] shadow-sm group-hover:rotate-6 transition-transform">
                         <Smartphone size={32} />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black italic uppercase tracking-tight">Evolution API Master</h3>
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Global WhatsApp Controller</p>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 px-4">Instância Base URL</label>
                         <input value={evolutionConfig.baseUrl} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-blue-500/10" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 px-4">Master API Key</label>
                         <input type="password" value={evolutionConfig.apiKey} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-blue-500/10" />
                      </div>
                      <button className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase text-[10px] tracking-[0.2em]">Testar Conexão Global</button>
                   </div>
                </div>

                {/* n8n Automation Config */}
                <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-8 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl"></div>
                   <div className="flex items-center gap-5">
                      <div className="p-5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 rounded-[1.8rem] shadow-sm group-hover:-rotate-6 transition-transform">
                         <Webhook size={32} />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black italic uppercase tracking-tight">Orquestração n8n</h3>
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Processamento Neural Webhooks</p>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 px-4">Global Webhook Master</label>
                         <input value={n8nUrl} onChange={e => setN8nUrl(e.target.value)} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-orange-500/10" />
                      </div>
                      <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-3xl border border-orange-100 dark:border-orange-800 flex gap-4">
                         <Zap className="text-orange-600 shrink-0" size={20} />
                         <p className="text-[10px] text-orange-700 dark:text-orange-400 font-bold uppercase leading-relaxed tracking-widest">
                            Todos os eventos de leads qualificados por IA serão transmitidos para esta URL em tempo real para automação avançada.
                         </p>
                      </div>
                      <button className="w-full py-5 bg-orange-500 text-white font-black rounded-2xl shadow-xl hover:bg-orange-600 transition-all uppercase text-[10px] tracking-[0.2em]">Sincronizar Workflows</button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* CONTEÚDO: EMPRESAS (TENANTS) */}
        {activeTab === 'tenants' && (
          <div className="animate-in slide-in-from-bottom-4 space-y-10">
             <div className="bg-white dark:bg-slate-900 rounded-[4rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                   <h3 className="text-2xl font-black italic uppercase tracking-tight">Gestão de Unidades</h3>
                   <div className="flex gap-4">
                      <div className="relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input placeholder="Filtrar tenants..." className="pl-10 pr-6 py-3 bg-white dark:bg-slate-800 rounded-2xl border-none outline-none text-[10px] font-bold uppercase tracking-widest" />
                      </div>
                      <button className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2">
                        <Plus size={16} /> Adicionar Unidade
                      </button>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800">
                            <th className="px-10 py-6">ID / Empresa</th>
                            <th className="px-10 py-6">Nicho Alvo</th>
                            <th className="px-10 py-6">Leads Ativos</th>
                            <th className="px-10 py-6">Saúde Unidade</th>
                            <th className="px-10 py-6 text-right">Ações</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                         {tenants.map(t => (
                           <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                                       {t.name.charAt(0)}
                                    </div>
                                    <div>
                                       <p className="font-black italic uppercase text-sm">{t.name}</p>
                                       <p className="text-[9px] text-slate-400 font-bold uppercase">ID: {t.id} • Unidade SaaS</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8 font-black text-xs uppercase text-slate-500">{t.niche}</td>
                              <td className="px-10 py-8 font-black text-xs tabular-nums">{t.activeLeads}</td>
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-3">
                                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                       <div 
                                         className={`h-full rounded-full ${t.healthScore > 80 ? 'bg-emerald-500' : t.healthScore > 50 ? 'bg-orange-500' : 'bg-rose-500'}`} 
                                         style={{width: `${t.healthScore}%`}}
                                       ></div>
                                    </div>
                                    <span className="text-[10px] font-black">{t.healthScore}%</span>
                                 </div>
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <button className="p-3 text-slate-300 hover:text-indigo-600 transition-colors"><Edit3 size={16} /></button>
                                 <button className="p-3 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {/* CONTEÚDO: USUÁRIOS & PERMISSÕES */}
        {activeTab === 'users' && (
          <div className="animate-in slide-in-from-bottom-4 space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                         <div className="p-5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-3xl"><UserPlus size={32} /></div>
                         <h3 className="text-2xl font-black italic uppercase tracking-tight">Operadores Rede</h3>
                      </div>
                      <button className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform"><Plus size={20}/></button>
                   </div>
                   <div className="space-y-4">
                      {users.map(u => (
                        <div key={u.id} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 flex items-center justify-between group">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center font-black text-xs shadow-sm">{u.name.charAt(0)}</div>
                              <div>
                                 <p className="font-black italic uppercase text-xs">{u.name}</p>
                                 <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{u.role} • {u.tenant}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                              <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-indigo-600 transition-all"><Settings size={14}/></button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl space-y-8 relative overflow-hidden">
                   <ShieldCheck className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 rotate-12" />
                   <h3 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-4">
                      <Lock className="text-orange-500" /> RBAC Authority
                   </h3>
                   <p className="text-xs font-bold text-slate-400 uppercase leading-relaxed tracking-widest">
                      Defina políticas granulares de acesso. Operadores podem ser restritos a unidades específicas ou ter visão global de rede.
                   </p>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10">
                         <span className="text-[10px] font-black uppercase tracking-widest">Multi-unit Login</span>
                         <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center px-1"><div className="w-4 h-4 bg-white rounded-full ml-auto"></div></div>
                      </div>
                      <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10">
                         <span className="text-[10px] font-black uppercase tracking-widest">Force 2FA Global</span>
                         <div className="w-12 h-6 bg-slate-700 rounded-full flex items-center px-1"><div className="w-4 h-4 bg-white rounded-full"></div></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* CONTEÚDO: PERSONALIZAÇÃO (WHITE-LABEL) */}
        {activeTab === 'branding' && (
          <div className="animate-in slide-in-from-bottom-4 space-y-10">
             <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-12">
                <div className="flex items-center gap-6">
                   <div className="p-5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-3xl"><Palette size={32} /></div>
                   <div>
                      <h3 className="text-3xl font-black italic uppercase tracking-tight">White-label Experience</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Propagação de Identidade Visual para toda a rede</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-10">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-slate-400 px-4">Nome Global da App</label>
                         <input 
                           value={localBranding.appName} 
                           onChange={e => setLocalBranding({...localBranding, appName: e.target.value})} 
                           className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-black italic text-xl border-none outline-none focus:ring-4 ring-purple-500/10" 
                         />
                      </div>
                      <div className="space-y-6">
                         <label className="text-[10px] font-black uppercase text-slate-400 px-4">Cores de Autoridade</label>
                         <div className="flex flex-wrap gap-4">
                            {['bg-orange-500', 'bg-indigo-600', 'bg-emerald-600', 'bg-rose-600', 'bg-slate-900', 'bg-cyan-500'].map(c => (
                              <button key={c} className={`w-14 h-14 rounded-2xl ${c} shadow-lg hover:scale-110 transition-transform cursor-pointer border-4 border-white dark:border-slate-800`}></button>
                            ))}
                            <button className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400"><Plus size={20}/></button>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <label className="text-[10px] font-black uppercase text-slate-400 px-4">Assets de Marca (Logotipos)</label>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-4 group cursor-pointer hover:border-purple-500 transition-all">
                            <Camera size={24} className="text-slate-300 group-hover:text-purple-500" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Logo Full (Light)</span>
                         </div>
                         <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-4 group cursor-pointer hover:border-purple-500 transition-all">
                            <Camera size={24} className="text-slate-300 group-hover:text-purple-500" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Logo Full (Dark)</span>
                         </div>
                      </div>
                      <div className="p-10 bg-purple-50 dark:bg-purple-900/20 rounded-[3rem] border border-purple-100 dark:border-purple-800">
                         <div className="flex items-center gap-4 mb-4">
                            <Sparkles className="text-purple-600" size={24} />
                            <h4 className="text-sm font-black italic uppercase">Preview de Estilo</h4>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-black">{localBranding.appName.charAt(0)}</div>
                            <span className="text-xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">{localBranding.appName}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => { onBrandingChange(localBranding); notify('White-label Propagado para toda a Rede!'); }}
                  className="w-full py-8 bg-purple-600 text-white font-black rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(147,51,234,0.4)] uppercase text-xs tracking-[0.3em] hover:bg-purple-700 hover:scale-[1.02] transition-all"
                >
                   Aplicar Identidade Master
                </button>
             </div>
          </div>
        )}

        {/* CONTEÚDO: SEGURANÇA & LOGS */}
        {activeTab === 'security' && (
          <div className="animate-in slide-in-from-bottom-4 space-y-10">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-8">
                   <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center gap-4 mb-8">
                         <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-2xl"><ShieldAlert size={28} /></div>
                         <h4 className="text-lg font-black italic uppercase">API Firewall</h4>
                      </div>
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-slate-400">Rate Limiting</span>
                            <span className="text-[10px] font-black text-emerald-500">ATIVO</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-slate-400">SQL Injection Protect</span>
                            <span className="text-[10px] font-black text-emerald-500">ATIVO</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="lg:col-span-2 bg-slate-950 rounded-[4rem] p-12 border border-white/5 shadow-2xl relative overflow-hidden">
                   <Terminal className="absolute -top-10 -right-10 w-48 h-48 text-white/5 rotate-12" />
                   <div className="flex items-center justify-between mb-10 relative z-10">
                      <h3 className="text-2xl font-black italic uppercase text-white flex items-center gap-4">
                         <History className="text-rose-500" /> Audit Logs Global
                      </h3>
                      <button className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Limpar Histórico</button>
                   </div>
                   <div className="space-y-4 font-mono text-[10px] relative z-10">
                      <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 animate-in slide-in-from-right-2">
                         <span className="text-emerald-500 font-bold">[SUCCESS]</span>
                         <span className="text-slate-400">2024-03-15 14:22:01 - Tenant "Barbearia" provisionado via IP 187.12.33.1</span>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 animate-in slide-in-from-right-3">
                         <span className="text-orange-500 font-bold">[WARN]</span>
                         <span className="text-slate-400">2024-03-15 13:05:44 - Evoluton API Node #1 atingiu 85% de carga. Orquestrando spillover.</span>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 animate-in slide-in-from-right-4">
                         <span className="text-blue-500 font-bold">[INFO]</span>
                         <span className="text-slate-400">2024-03-15 12:50:11 - Master Admin Carlos alterou cores do White-label.</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
