
import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, Calendar, Zap, Menu, Package, Target, 
  Sun, Moon, Sparkles, Wallet, Rocket,
  User, LogOut, Loader2, Heart, CheckCircle2,
  LayoutDashboard, Radar, Kanban, ShieldCheck, Globe, ChevronDown,
  Lock, Mail, ArrowRight, Eye, EyeOff, X, ShieldAlert,
  Settings, Building2, UserCog, Cpu, Shield, Fingerprint, Palette,
  ChevronLeft, ChevronRight, Megaphone, Search, CreditCard, ChevronLast, ChevronFirst
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { CRMKanban } from './components/CRMKanban';
import { WhatsAppInbox } from './components/WhatsAppInbox';
import { AdminModule } from './components/AdminModule';
import { ProductManager } from './components/ProductManager';
import { ScheduleManager } from './components/ScheduleManager';
import { CaptureManagement } from './components/CaptureManagement';
import { BroadcastManager } from './components/BroadcastManager';
import { OfferPage } from './components/OfferPage';
import { PaymentManager } from './components/PaymentManager';
import { UserProfile } from './components/UserProfile';
import { AISearchModal } from './components/AISearchModal';
import { LeadStatus, Lead, AppModule, Appointment, BrandingConfig } from './types';

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

const ZLogo: React.FC<{ branding: BrandingConfig, type?: 'full' | 'icon', darkMode?: boolean }> = ({ branding, type = 'full', darkMode = false }) => {
  const src = type === 'full' ? (darkMode ? branding.fullLogoDark : branding.fullLogo) : (darkMode ? branding.iconLogoDark : branding.iconLogo);
  return (
    <div className="flex items-center justify-center transition-all duration-500">
      <img src={src} alt={branding.appName} className={`force-logo-display ${type === 'full' ? 'h-10 w-auto' : 'h-12 w-12 object-contain scale-125'}`} />
    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<AppModule>('results');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState({ 
    name: 'Operador Master', 
    email: 'master@zprospector.com', 
    role: 'SUPER_ADMIN', 
    avatar: null 
  });

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const syncInitial = async () => {
      try {
        const bRes = await fetch(`${API_URL}?action=get-branding`);
        if (bRes.ok) setBranding(await bRes.json());
        const lRes = await fetch(`${API_URL}?action=get-leads`);
        if (lRes.ok) setLeads(await lRes.json());
      } catch (e) {} finally { setIsLoading(false); }
    };
    syncInitial();
  }, []);

  const menuItems = [
    { id: 'admin', label: 'Master Admin', icon: ShieldCheck, color: 'text-orange-500', special: true },
    { id: 'results', label: 'Performance', icon: LayoutDashboard, color: 'text-indigo-600' },
    { id: 'capture', label: 'Captação', icon: Radar, color: 'text-cyan-600' },
    { id: 'prospecting', label: 'Pipeline CRM', icon: Kanban, color: 'text-violet-600' },
    { id: 'inbox', label: 'Inbox IA', icon: MessageSquare, color: 'text-emerald-600' },
    { id: 'scheduling', label: 'Agenda', icon: Calendar, color: 'text-pink-600' },
    { id: 'broadcast', label: 'Disparos', icon: Megaphone, color: 'text-rose-600' },
    { id: 'products', label: 'Catálogo', icon: Package, color: 'text-amber-600' },
    { id: 'payments', label: 'Financeiro', icon: CreditCard, color: 'text-emerald-600' },
  ];

  if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-slate-950 text-white font-black uppercase tracking-widest"><Loader2 className="animate-spin text-indigo-500 mr-4" /> Sincronizando Rede...</div>;
  if (!isLoggedIn) return <OfferPage branding={branding} onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className={`fixed inset-0 flex h-full w-full overflow-hidden ${isDarkMode ? 'dark bg-slate-955 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <AISearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={setActiveModule} />
      
      {/* SIDEBAR MASTER */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-24'} bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-500 flex flex-col z-50 shadow-2xl relative h-full group`}>
        <div className="p-8 flex items-center justify-center min-h-[140px]">
           <ZLogo branding={branding} type={isSidebarOpen ? 'full' : 'icon'} darkMode={isDarkMode} />
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="absolute -right-4 top-16 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-[60]"
           >
             {isSidebarOpen ? <ChevronLeft size={16}/> : <ChevronRight size={16}/>}
           </button>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((m) => (
            <button 
              key={m.id} 
              onClick={() => setActiveModule(m.id as AppModule)} 
              className={`w-full flex items-center ${isSidebarOpen ? 'gap-4 px-6' : 'justify-center'} py-5 rounded-[2rem] transition-all relative ${
                activeModule === m.id 
                  ? (m.special ? 'bg-orange-50 dark:bg-orange-900/20 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 shadow-sm') 
                  : 'text-slate-400 hover:bg-slate-50/50'
              }`}
            >
              {activeModule === m.id && <div className={`absolute left-0 w-2 h-10 ${m.special ? 'bg-orange-500' : 'bg-indigo-600'} rounded-r-full`}></div>}
              <m.icon size={isSidebarOpen ? 22 : 32} className={`${activeModule === m.id ? m.color : 'text-slate-300'} transition-all`} /> 
              {isSidebarOpen && <span className={`text-[11px] font-black uppercase tracking-widest ${activeModule === m.id ? (m.special ? 'text-orange-600' : 'text-slate-900 dark:text-white') : ''}`}>{m.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50 dark:border-slate-800 space-y-2">
          <button onClick={() => setActiveModule('profile')} className={`w-full flex items-center ${isSidebarOpen ? 'gap-4 px-6' : 'justify-center'} py-5 rounded-2xl transition-all ${activeModule === 'profile' ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400'}`}>
             <UserCog size={isSidebarOpen ? 20 : 32} />
             {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Meu Perfil</span>}
          </button>
          <button onClick={() => setIsLoggedIn(false)} className={`w-full flex items-center ${isSidebarOpen ? 'gap-4 px-6' : 'justify-center'} py-5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all`}>
            <LogOut size={isSidebarOpen ? 18 : 32} /> 
            {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Sair</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* HEADER AUTHORITY */}
        <header className="h-28 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-12 z-40">
           <div className="flex items-center gap-10">
              <div 
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-4 px-8 py-4 bg-slate-100 dark:bg-slate-800 rounded-[2rem] cursor-pointer text-slate-400 hover:text-indigo-600 hover:ring-8 ring-indigo-500/5 transition-all w-96 shadow-inner group"
              >
                 <Search size={20} className="group-hover:scale-110 transition-transform" />
                 <span className="text-[11px] font-black uppercase tracking-widest">Pesquisa Neural (CMD + K)</span>
              </div>
           </div>

           <div className="flex items-center gap-8">
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all">
                {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
             </button>
             <div className="flex items-center gap-6 cursor-pointer group" onClick={() => setActiveModule('profile')}>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black uppercase tracking-widest group-hover:text-indigo-600 transition-colors">{currentUser.name}</p>
                  <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic">{currentUser.role}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black shadow-2xl border-4 border-white dark:border-slate-800 transform hover:rotate-3 transition-all overflow-hidden">
                  {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : 'M'}
                </div>
             </div>
           </div>
        </header>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {activeModule === 'results' && <Dashboard stats={{ totalLeads: leads.length, hotLeads: leads.filter(l => l.status === LeadStatus.HOT).length, totalValue: 0, closedValue: 0, conversionRate: '0%' }} leads={leads} />}
          {activeModule === 'admin' && <AdminModule branding={branding} onBrandingChange={setBranding} onNicheChange={() => {}} evolutionConfig={{baseUrl: '', apiKey: '', enabled: true}} onEvolutionConfigChange={() => {}} notify={notify} />}
          {activeModule === 'capture' && <CaptureManagement onAddLead={(l) => setLeads([l, ...leads])} notify={notify} />}
          {activeModule === 'prospecting' && <CRMKanban leads={leads} onLeadsChange={setLeads} notify={notify} onNavigate={setActiveModule} />}
          {activeModule === 'inbox' && <WhatsAppInbox niche="Vendas Master" activeLeads={leads} onSchedule={() => {}} tenant={{id: '1', name: 'Master', niche: 'SaaS', healthScore: 100, revenue: 0, activeLeads: leads.length, status: 'ONLINE'}} evolutionConfig={{baseUrl: '', apiKey: '', enabled: true}} notify={notify} />}
          {activeModule === 'products' && <ProductManager notify={notify} />}
          {activeModule === 'scheduling' && <ScheduleManager appointments={appointments} onAddAppointment={(a) => setAppointments([...appointments, a])} onUpdateAppointment={(a) => setAppointments(appointments.map(i => i.id === a.id ? a : i))} onDeleteAppointment={(id) => setAppointments(appointments.filter(i => i.id !== id))} />}
          {activeModule === 'broadcast' && <BroadcastManager leads={leads} notify={notify} />}
          {activeModule === 'payments' && <PaymentManager totalVolume={leads.reduce((a,b) => a + (b.value || 0), 0)} pipelineVolume={leads.length * 500} />}
          {activeModule === 'profile' && <UserProfile user={currentUser} onUpdate={(d) => setCurrentUser({...currentUser, ...d})} onLogout={() => setIsLoggedIn(false)} notify={notify} />}
        </div>
      </main>
    </div>
  );
};

export default App;
