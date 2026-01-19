
import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, Calendar, Zap, Menu, Package, Target, 
  Sun, Moon, Sparkles, Wallet, Rocket,
  User, LogOut, Loader2, Heart, CheckCircle2,
  LayoutDashboard, Radar, Kanban, ShieldCheck, Globe, ChevronDown,
  Lock, Mail, ArrowRight, Eye, EyeOff, X, ShieldAlert,
  Settings, Building2, UserCog, Cpu, Shield, Fingerprint, Palette,
  ChevronLeft, ChevronRight, Megaphone, Search, CreditCard, ChevronLast, ChevronFirst,
  Bell, BellDot, ShoppingCart, TrendingUp
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
import { LeadStatus, Lead, AppModule, Appointment, BrandingConfig, EvolutionConfig, AppNotification } from './types';

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

const MASTER_EVOLUTION_CONFIG: EvolutionConfig = {
  baseUrl: 'https://api.clikai.com.br',
  apiKey: 'f292e7c587e33adf1873e0c1fc3bfcda',
  enabled: true
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
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: '1', type: 'SYSTEM', title: 'Boas-vindas Master', description: 'O Core Engine v3.0 está pronto para operar.', time: 'Agora', read: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
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
    setTimeout(() => setNotification(null), 4000);
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'time' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      time: 'Agora',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
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

  const handleLogout = () => {
    notify('Obrigado por utilizar o Z-Prospector. Até breve!');
    setTimeout(() => {
      setIsLoggedIn(false);
      setActiveModule('results');
    }, 1500);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const menuItems = [
    { id: 'admin', label: 'Master', icon: ShieldCheck, color: 'text-orange-600', special: true },
    { id: 'results', label: 'Dashboard', icon: LayoutDashboard, color: 'text-indigo-600' },
    { id: 'capture', label: 'Captação', icon: Radar, color: 'text-cyan-600' },
    { id: 'prospecting', label: 'Funil CRM', icon: Kanban, color: 'text-violet-600' },
    { id: 'inbox', label: 'Chat Inbox', icon: MessageSquare, color: 'text-emerald-600' },
    { id: 'scheduling', label: 'Agenda IA', icon: Calendar, color: 'text-pink-600' },
    { id: 'broadcast', label: 'Disparos', icon: Megaphone, color: 'text-rose-600' },
    { id: 'products', label: 'Ofertas', icon: Package, color: 'text-amber-600' },
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
              className={`w-full flex items-center ${isSidebarOpen ? 'gap-5 px-6' : 'justify-center'} py-5 rounded-[2rem] transition-all relative ${
                activeModule === m.id 
                  ? (m.special ? 'bg-orange-50 dark:bg-orange-900/20 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 shadow-sm') 
                  : 'text-slate-500 hover:bg-slate-50/50'
              }`}
            >
              {activeModule === m.id && <div className={`absolute left-0 w-2 h-10 ${m.special ? 'bg-orange-500' : 'bg-indigo-600'} rounded-r-full`}></div>}
              <m.icon size={isSidebarOpen ? 24 : 34} className={`${activeModule === m.id ? m.color : 'text-slate-400'} transition-all`} /> 
              {isSidebarOpen && <span className={`text-sm font-black uppercase tracking-wider ${activeModule === m.id ? (m.special ? 'text-orange-700' : 'text-slate-900 dark:text-white') : 'text-slate-500 opacity-80'}`}>{m.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50 dark:border-slate-800 space-y-2">
          <button onClick={() => setActiveModule('profile')} className={`w-full flex items-center ${isSidebarOpen ? 'gap-5 px-6' : 'justify-center'} py-5 rounded-2xl transition-all ${activeModule === 'profile' ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-500'}`}>
             <UserCog size={isSidebarOpen ? 24 : 34} />
             {isSidebarOpen && <span className="text-sm font-black uppercase tracking-wider">Meu Perfil</span>}
          </button>
          <button onClick={handleLogout} className={`w-full flex items-center ${isSidebarOpen ? 'gap-5 px-6' : 'justify-center'} py-5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all`}>
            <LogOut size={24} /> 
            {isSidebarOpen && <span className="text-sm font-black uppercase tracking-wider">Deslogar</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* TOAST NOTIFICATION */}
        {notification && (
           <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] px-8 py-4 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl animate-in slide-in-from-top-10 flex items-center gap-4 border-2 border-white/20">
              <CheckCircle2 size={18} /> {notification}
           </div>
        )}

        {/* HEADER AUTHORITY */}
        <header className="h-28 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-12 z-40 relative">
           <div className="flex items-center gap-10">
              <div 
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-4 px-8 py-4 bg-slate-100 dark:bg-slate-800 rounded-[2rem] cursor-pointer text-slate-400 hover:text-indigo-600 hover:ring-8 ring-indigo-500/5 transition-all w-96 shadow-inner group"
              >
                 <Search size={20} className="group-hover:scale-110 transition-transform" />
                 <span className="text-[11px] font-black uppercase tracking-widest">Busca Neural</span>
              </div>
           </div>

           <div className="flex items-center gap-8">
             <div className="relative">
                <button 
                  onClick={() => { setShowNotifications(!showNotifications); setNotifications(notifications.map(n => ({...n, read: true}))); }}
                  className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all relative group"
                >
                   {unreadCount > 0 ? <BellDot className="text-rose-500 animate-bounce" size={20} /> : <Bell size={20} />}
                   {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800">{unreadCount}</span>}
                </button>
                
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-4 w-96 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 z-[100] animate-in slide-in-from-top-4 overflow-hidden">
                     <div className="flex items-center justify-between mb-8 border-b border-slate-50 dark:border-slate-800 pb-4">
                        <h3 className="text-sm font-black italic uppercase tracking-widest">Rede de Eventos</h3>
                        <button onClick={() => setShowNotifications(false)} className="text-slate-300 hover:text-rose-500"><X size={18} /></button>
                     </div>
                     <div className="space-y-6 max-h-[400px] overflow-y-auto no-scrollbar">
                        {notifications.length > 0 ? notifications.map(n => (
                          <div key={n.id} className="flex gap-4 group cursor-default">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                               n.type === 'SALE' ? 'bg-emerald-50 text-emerald-600' :
                               n.type === 'APPOINTMENT' ? 'bg-pink-50 text-pink-600' :
                               n.type === 'INBOX' ? 'bg-indigo-50 text-indigo-600' :
                               'bg-slate-50 text-slate-400'
                             }`}>
                                {n.type === 'SALE' ? <CreditCard size={18}/> : 
                                 n.type === 'APPOINTMENT' ? <Calendar size={18}/> : 
                                 n.type === 'INBOX' ? <MessageSquare size={18}/> : <Zap size={18}/>}
                             </div>
                             <div>
                                <h4 className="text-[11px] font-black uppercase text-slate-900 dark:text-white leading-tight">{n.title}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 leading-relaxed">{n.description}</p>
                                <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-2 block">{n.time}</span>
                             </div>
                          </div>
                        )) : (
                          <div className="py-20 flex flex-col items-center justify-center opacity-20 grayscale scale-75">
                             <Bell size={48} />
                             <p className="text-[10px] font-black uppercase tracking-widest mt-4">Nenhum evento recente</p>
                          </div>
                        )}
                     </div>
                  </div>
                )}
             </div>

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
          {activeModule === 'admin' && <AdminModule branding={branding} onBrandingChange={setBranding} onNicheChange={() => {}} evolutionConfig={MASTER_EVOLUTION_CONFIG} onEvolutionConfigChange={() => {}} notify={notify} />}
          {activeModule === 'capture' && <CaptureManagement onAddLead={(l) => setLeads([l, ...leads])} notify={notify} />}
          {activeModule === 'prospecting' && <CRMKanban leads={leads} onLeadsChange={setLeads} notify={notify} onNavigate={setActiveModule} />}
          {activeModule === 'inbox' && (
            <WhatsAppInbox 
              niche="Vendas Master" 
              activeLeads={leads} 
              onSchedule={() => {}} 
              tenant={{id: '1', name: 'Master', niche: 'SaaS', healthScore: 100, revenue: 0, activeLeads: leads.length, status: 'ONLINE', instanceStatus: isWhatsAppConnected ? 'CONNECTED' : 'DISCONNECTED'}} 
              evolutionConfig={MASTER_EVOLUTION_CONFIG} 
              onConnectionChange={setIsWhatsAppConnected}
              notify={(msg) => { notify(msg); addNotification({ type: 'INBOX', title: 'Mensagem Recebida', description: msg }); }} 
            />
          )}
          {activeModule === 'products' && <ProductManager notify={notify} />}
          {activeModule === 'scheduling' && <ScheduleManager appointments={appointments} onAddAppointment={(a) => { setAppointments([...appointments, a]); addNotification({ type: 'APPOINTMENT', title: 'Novo Agendamento', description: `${a.lead} agendou ${a.service}` }); }} onUpdateAppointment={(a) => setAppointments(appointments.map(i => i.id === a.id ? a : i))} onDeleteAppointment={(id) => setAppointments(appointments.filter(i => i.id !== id))} />}
          {activeModule === 'broadcast' && <BroadcastManager leads={leads} isWhatsAppConnected={isWhatsAppConnected} onNavigate={setActiveModule} notify={(msg) => { notify(msg); addNotification({ type: 'BROADCAST', title: 'Status de Envio', description: msg }); }} />}
          {activeModule === 'payments' && <PaymentManager totalVolume={leads.reduce((a,b) => a + (b.value || 0), 0)} pipelineVolume={leads.length * 500} />}
          {activeModule === 'profile' && <UserProfile user={currentUser} onUpdate={(d) => setCurrentUser({...currentUser, ...d})} onLogout={handleLogout} notify={notify} />}
        </div>
      </main>
    </div>
  );
};

export default App;
