import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MessageSquare, Calendar, Zap, Menu, Package, Target, 
  Sun, Moon, Sparkles, Wallet, Rocket,
  User, LogOut, Loader2, Heart, CheckCircle2,
  LayoutDashboard, Radar, Kanban, ShieldCheck, Globe, ChevronDown,
  Lock, Mail, ArrowRight, Eye, EyeOff, X, ShieldAlert,
  Settings, Building2, UserCog, Cpu, Shield, Fingerprint, Palette,
  ChevronLeft, ChevronRight, Megaphone
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { CRMKanban } from './components/CRMKanban';
import { WhatsAppInbox } from './components/WhatsAppInbox';
import { AdminModule } from './components/AdminModule';
import { ProductManager } from './components/ProductManager';
import { ScheduleManager } from './components/ScheduleManager';
import { CaptureManagement } from './components/CaptureManagement';
import { FollowUpAutomation } from './components/FollowUpAutomation';
import { BroadcastManager } from './components/BroadcastManager';
import { OfferPage } from './components/OfferPage';
import { PaymentManager } from './components/PaymentManager';
import { UserProfile } from './components/UserProfile';
import { LeadStatus, Lead, PipelineStage, AppModule, Tenant, Appointment, EvolutionConfig, BrandingConfig } from './types';

const API_URL = '/api/core.php';

const DEFAULT_BRANDING: BrandingConfig = {
  fullLogo: "Logotipo%20Z_Prospector.png",
  fullLogoDark: "Logotipo%20Z_Prospector.png",
  iconLogo: "Logotipo%20Z_Prospector_Icon.png",
  iconLogoDark: "Logotipo%20Z_Prospector_Icon.png",
  favicon: "Logotipo%20Z_Prospector_Icon.png",
  salesPageLogo: "Logotipo%20Z_Prospector.png",
  appName: "Z-Prospector"
};

const ZLogo: React.FC<{ 
  branding: BrandingConfig, 
  type?: 'full' | 'icon', 
  className?: string, 
  imgClassName?: string,
  darkMode?: boolean
}> = ({ branding, type = 'full', className = "", imgClassName = "", darkMode = false }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const src = useMemo(() => {
    if (type === 'full') return darkMode ? branding.fullLogoDark : branding.fullLogo;
    return darkMode ? branding.iconLogoDark : branding.iconLogo;
  }, [branding, type, darkMode]);

  if (!src || status === 'error') return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><span className="text-white font-black text-xl italic">{branding.appName.charAt(0)}</span></div>
      {type === 'full' && <span className="text-xl font-black italic uppercase text-slate-900 dark:text-white">{branding.appName}</span>}
    </div>
  );

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {status === 'loading' && <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-500/5 rounded-lg"><Loader2 className="animate-spin text-indigo-500/30" size={20} /></div>}
      <img src={src} alt={branding.appName} className={`force-logo-display ${imgClassName || (type === 'full' ? 'h-10 w-auto' : 'h-10 w-10')} ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`} onError={() => setStatus('error')} onLoad={() => setStatus('success')} />
    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_URL}?action=get-leads`);
      if (res.ok) setLeads(await res.json());
    } catch (e) { notify('Erro ao carregar leads do banco HostGator'); }
  };

  useEffect(() => {
    const syncInitial = async () => {
      try {
        const bRes = await fetch(`${API_URL}?action=get-branding`);
        if (bRes.ok) {
          const bData = await bRes.json();
          setBranding(prev => ({ ...prev, ...bData }));
        }
      } catch (e) {} finally { setIsLoading(false); }
    };
    syncInitial();
  }, []);

  useEffect(() => { if (isLoggedIn) fetchLeads(); }, [isLoggedIn]);

  const handleBrandingChange = async (newConfig: BrandingConfig) => {
    setBranding(newConfig);
    try {
      await fetch(`${API_URL}?action=save-branding`, { method: 'POST', body: JSON.stringify(newConfig) });
      notify('Marca Master Sincronizada com o Banco!');
    } catch (e) { notify('Erro ao salvar no servidor'); }
  };

  const handleAddLead = async (leadData: Partial<Lead>) => {
    try {
      const res = await fetch(`${API_URL}?action=save-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      if (res.ok) {
        fetchLeads();
        notify(`Lead ${leadData.name} salvo permanentemente!`);
      }
    } catch (e) { notify('Erro ao persistir lead'); }
  };

  const handleUpdateLeads = async (updatedLeads: Lead[]) => {
    setLeads(updatedLeads);
    // Em um sistema real aqui iteraríamos apenas o lead alterado.
    // Para o Kanban, vamos assumir que o CRMKanban chama handleAddLead ou uma nova rota de Update.
  };

  const [currentUser] = useState({ name: 'Operador Master', email: 'master@zprospector.com', role: 'SUPER_ADMIN', avatar: null });
  const [activeModule, setActiveModule] = useState<AppModule>('results');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-slate-950 text-white font-black uppercase tracking-widest"><Loader2 className="animate-spin text-indigo-500 mr-4" /> Sincronizando HostGator...</div>;
  if (!isLoggedIn) return <OfferPage branding={branding} onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className={`fixed inset-0 flex h-full w-full overflow-hidden ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {notification && (<div className="fixed top-10 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-4"><Zap className="text-yellow-400 fill-current" size={16} />{notification}</div>)}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-24'} bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-500 flex flex-col z-50 shadow-2xl relative h-full`}>
        <div className="p-6 flex items-center justify-center min-h-[120px]"><ZLogo branding={branding} type={isSidebarOpen ? 'full' : 'icon'} darkMode={isDarkMode} /></div>
        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto no-scrollbar">
          {[
            { id: 'admin', label: 'Master Admin', icon: ShieldCheck, color: 'text-orange-500' },
            { id: 'results', label: 'Performance', icon: LayoutDashboard, color: 'text-indigo-600' },
            { id: 'capture', label: 'Captação', icon: Radar, color: 'text-cyan-600' },
            { id: 'prospecting', label: 'Pipeline CRM', icon: Kanban, color: 'text-violet-600' },
            { id: 'inbox', label: 'Inbox IA', icon: MessageSquare, color: 'text-emerald-600' },
          ].map((m) => (
            <button key={m.id} onClick={() => setActiveModule(m.id as AppModule)} className={`w-full flex items-center ${isSidebarOpen ? 'gap-4 px-6' : 'justify-center'} py-4 rounded-2xl transition-all ${activeModule === m.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}>
              <m.icon size={22} /> {isSidebarOpen && <span className="text-[11px] font-black uppercase tracking-widest">{m.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-100"><button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-4 px-6 py-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"><LogOut size={18} /> {isSidebarOpen && <span className="text-[10px] font-black uppercase">Sair</span>}</button></div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-b border-slate-100 flex items-center justify-between px-12 z-40">
           <div className="flex items-center gap-4 px-6 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest"><ShieldCheck size={14}/> Licença HostGator DB Ativa</div>
           <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveModule('profile')}>
             <div className="text-right hidden sm:block"><p className="text-xs font-black uppercase tracking-widest">{currentUser.name}</p><p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">SaaS Authority</p></div>
             <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg">M</div>
           </div>
        </header>
        <div className="flex-1 overflow-auto custom-scrollbar">
          {activeModule === 'results' && <Dashboard stats={{ totalLeads: leads.length, hotLeads: leads.filter(l => l.status === LeadStatus.HOT).length, totalValue: 0, closedValue: 0, conversionRate: '0%' }} leads={leads} />}
          {activeModule === 'admin' && <AdminModule branding={branding} onBrandingChange={handleBrandingChange} onNicheChange={() => {}} evolutionConfig={{baseUrl: '', apiKey: '', enabled: true}} onEvolutionConfigChange={() => {}} notify={notify} />}
          {activeModule === 'capture' && <CaptureManagement onAddLead={handleAddLead} notify={notify} />}
          {activeModule === 'prospecting' && <CRMKanban leads={leads} onLeadsChange={handleUpdateLeads} notify={notify} onNavigate={setActiveModule} />}
        </div>
      </main>
    </div>
  );
};

export default App;