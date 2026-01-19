
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

export const AdminModule: React.FC<Props> = ({ branding, onBrandingChange, evolutionConfig, onEvolutionConfigChange, notify }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'infra' | 'branding'>('overview');
  const [localBranding, setLocalBranding] = useState(branding);

  return (
    <div className="p-10 space-y-10 animate-in fade-in pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-orange-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl transform -rotate-6">
              <ShieldCheck size={32} />
           </div>
           <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black italic uppercase tracking-tight">Master <span className="text-orange-500">Admin</span></h1>
                <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[9px] font-black uppercase rounded-lg">Authority Node</span>
              </div>
              <p className="text-slate-500 font-bold uppercase text-[10px] mt-1">Configurações de Infraestrutura clikai.com.br</p>
           </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        {[ { id: 'overview', label: 'Rede' }, { id: 'tenants', label: 'Unidades' }, { id: 'branding', label: 'Personalização' }, { id: 'infra', label: 'Cloud VPS' } ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`py-6 px-4 border-b-4 font-black text-[11px] tracking-widest uppercase transition-all ${activeTab === tab.id ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-3xl"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">MRR Global</p>
                <h3 className="text-4xl font-black italic tracking-tighter text-orange-500">R$ 142.500</h3>
                <div className="mt-6 flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase">
                   <TrendingUp size={14}/> +14.2% este mês
                </div>
             </div>
             <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Infra Uptime</p>
                <h3 className="text-4xl font-black italic tracking-tighter">99.98%</h3>
                <div className="mt-6 flex items-center gap-2 text-indigo-500 text-[10px] font-black uppercase">
                   <Server size={14}/> 4 Clusters Ativos
                </div>
             </div>
             <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <Zap className="absolute -bottom-6 -right-6 w-32 h-32 text-orange-500/10 group-hover:scale-125 transition-transform duration-1000" />
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">IA Engine Status</p>
                <h3 className="text-4xl font-black italic tracking-tighter">ESTÁVEL</h3>
                <button className="mt-6 w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-orange-600 transition-all">Sincronizar Nodes</button>
             </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
             <div className="flex items-center gap-4 mb-10">
                <Palette className="text-orange-500" size={32} />
                <h3 className="text-2xl font-black italic uppercase tracking-tight">Identidade Visual SaaS</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase text-slate-400 px-4">Nome da Plataforma</label>
                   <input value={localBranding.appName} onChange={e => setLocalBranding({...localBranding, appName: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-black italic border-none outline-none focus:ring-4 ring-orange-500/10" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase text-slate-400 px-4">Tema de Autoridade</label>
                   <div className="flex gap-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-2xl shadow-xl ring-4 ring-orange-500/20"></div>
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl opacity-40 grayscale"></div>
                      <div className="w-12 h-12 bg-emerald-600 rounded-2xl opacity-40 grayscale"></div>
                   </div>
                </div>
             </div>
             <button onClick={() => { onBrandingChange(localBranding); notify('Identidade Master Propagada!'); }} className="w-full py-6 bg-orange-500 text-white font-black rounded-[2.5rem] shadow-2xl uppercase text-xs tracking-widest hover:bg-orange-600 transition-all">Atualizar Identidade de Rede</button>
          </div>
        )}
      </div>
    </div>
  );
};
