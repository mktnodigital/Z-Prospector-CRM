
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, MessageSquare, Calendar, 
  Package, Megaphone, Settings, CreditCard, 
  Menu, Bell, Search, Zap, Moon, User as UserIcon,
  LogOut, X, CheckCircle2, Radar, Workflow, Sun, Sparkles
} from 'lucide-react';

import { Dashboard } from './components/Dashboard';
import { CRMKanban } from './components/CRMKanban';
import { WhatsAppInbox } from './components/WhatsAppInbox';
import { ProductManager } from './components/ProductManager';
import { ScheduleManager } from './components/ScheduleManager';
import { BroadcastManager } from './components/BroadcastManager';
import { PaymentManager } from './components/PaymentManager';
import { AdminModule } from './components/AdminModule';
import { UserProfile } from './components/UserProfile';
import { OfferPage } from './components/OfferPage';
import { AISearchModal } from './components/AISearchModal';
import { ConciergeService } from './components/ConciergeService';
import { CaptureManagement } from './components/CaptureManagement';
import { FollowUpAutomation } from './components/FollowUpAutomation';
import { api } from './services/api';

import { 
  Lead, Appointment, Tenant, BrandingConfig, 
  EvolutionConfig, AppNotification, AppModule, User
} from './types';

// Branding Default
const DEFAULT_BRANDING: BrandingConfig = {
  fullLogo: '', fullLogoDark: '', iconLogo: '', iconLogoDark: '',
  favicon: '', mobileIcon: '', loginBackground: '',
  appName: 'Z-Prospector',
  primaryColor: '#4f46e5', secondaryColor: '#ec4899',
  fontFamily: 'Inter', borderRadius: 'large', themeMode: 'light'
};

const DEFAULT_TENANT: Tenant = {
  id: 'temp', name: 'Carregando...', niche: 'Geral', 
  healthScore: 100, revenue: 0, activeLeads: 0, 
  status: 'ONLINE', instanceStatus: 'DISCONNECTED', salesMode: 'ASSISTED'
};

// Mapeamento de Temas (Mantido para UI)
const MODULE_THEME: Record<string, { color: string, activeClass: string, textClass: string, borderClass: string, lightBg: string }> = {
  results: { color: 'indigo', activeClass: 'bg-indigo-600 shadow-lg shadow-indigo-500/40', textClass: 'text-indigo-600', borderClass: 'border-indigo-200 dark:border-indigo-800', lightBg: 'bg-indigo-50/50' },
  prospecting: { color: 'rose', activeClass: 'bg-rose-600 shadow-lg shadow-rose-500/40', textClass: 'text-rose-600', borderClass: 'border-rose-200 dark:border-rose-800', lightBg: 'bg-rose-50/50' },
  inbox: { color: 'violet', activeClass: 'bg-violet-600 shadow-lg shadow-violet-500/40', textClass: 'text-violet-600', borderClass: 'border-violet-200 dark:border-violet-800', lightBg: 'bg-violet-50/50' },
  scheduling: { color: 'pink', activeClass: 'bg-pink-600 shadow-lg shadow-pink-500/40', textClass: 'text-pink-600', borderClass: 'border-pink-200 dark:border-pink-800', lightBg: 'bg-pink-50/50' },
  products: { color: 'orange', activeClass: 'bg-orange-600 shadow-lg shadow-orange-500/40', textClass: 'text-orange-600', borderClass: 'border-orange-200 dark:border-orange-800', lightBg: 'bg-orange-50/50' },
  broadcast: { color: 'cyan', activeClass: 'bg-cyan-600 shadow-lg shadow-cyan-500/40', textClass: 'text-cyan-600', borderClass: 'border-cyan-200 dark:border-cyan-800', lightBg: 'bg-cyan-50/50' },
  payments: { color: 'teal', activeClass: 'bg-teal-600 shadow-lg shadow-teal-500/40', textClass: 'text-teal-600', borderClass: 'border-teal-200 dark:border-teal-800', lightBg: 'bg-teal-50/50' },
  admin: { color: 'slate', activeClass: 'bg-slate-800 shadow-lg shadow-slate-500/40', textClass: 'text-slate-600', borderClass: 'border-slate-200 dark:border-slate-800', lightBg: 'bg-slate-100/50' },
  profile: { color: 'indigo', activeClass: 'bg-indigo-600 shadow-lg shadow-indigo-500/40', textClass: 'text-indigo-600', borderClass: 'border-indigo-200 dark:border-indigo-800', lightBg: 'bg-indigo-50/50' },
  concierge: { color: 'amber', activeClass: 'bg-amber-500 shadow-lg shadow-amber-500/40', textClass: 'text-amber-600', borderClass: 'border-amber-200 dark:border-amber-800', lightBg: 'bg-amber-50/50' },
  capture: { color: 'emerald', activeClass: 'bg-emerald-600 shadow-lg shadow-emerald-500/40', textClass: 'text-emerald-600', borderClass: 'border-emerald-200 dark:border-emerald-800', lightBg: 'bg-emerald-50/50' },
  automation: { color: 'cyan', activeClass: 'bg-cyan-600 shadow-lg shadow-cyan-500/40', textClass: 'text-cyan-600', borderClass: 'border-cyan-200 dark:border-cyan-800', lightBg: 'bg-cyan-50/50' },
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);
  
  const [activeModule, setActiveModule] = useState<AppModule>('results');
  const [performanceMode, setPerformanceMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Dados Reais (Inicializados Vazios)
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tenant, setTenant] = useState<Tenant>(DEFAULT_TENANT);
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  
  // Estado local para UI
  const [allTenants, setAllTenants] = useState<Tenant[]>([DEFAULT_TENANT]);
  const [evolutionConfig, setEvolutionConfig] = useState<EvolutionConfig>({ baseUrl: 'https://api.clikai.com.br/', apiKey: '', enabled: false });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const notificationRef = useRef<HTMLDivElement>(null);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const currentTheme = MODULE_THEME[activeModule] || MODULE_THEME.results;

  // 1. CHECK AUTH ON MOUNT
  useEffect(() => {
    const init = async () => {
      setIsGlobalLoading(true);
      const auth = await api.checkAuth();
      if (auth.authenticated && auth.user) {
        setCurrentUser(auth.user);
        setIsAuthenticated(true);
        await loadDashboardData();
      }
      setIsGlobalLoading(false);
    };
    init();
  }, []);

  // 2. LOAD DATA
  const loadDashboardData = async () => {
    try {
      const [leadsData, brandingData, apptsData] = await Promise.all([
        api.getLeads(),
        api.getBranding(),
        api.getAppointments()
      ]);
      
      setLeads(leadsData);
      if (brandingData) setBranding(brandingData);
      setAppointments(apptsData);
      
      // Update Tenant info based on data
      setTenant(prev => ({
        ...prev,
        name: brandingData?.appName || 'Minha Empresa',
        activeLeads: leadsData.length,
        revenue: apptsData.reduce((acc, curr) => acc + (curr.value || 0), 0)
      }));

    } catch (e) {
      console.error("Erro ao carregar dados", e);
    }
  };

  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    await loadDashboardData();
  };

  const handleLogout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLeads([]);
    setAppointments([]);
  };

  // Sync Dark Mode
  useEffect(() => {
    if (performanceMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [performanceMode]);

  // CSS Variables Branding
  useEffect(() => {
    const root = document.documentElement;
    if (branding.primaryColor) root.style.setProperty('--color-primary', branding.primaryColor);
    if (branding.secondaryColor) root.style.setProperty('--color-secondary', branding.secondaryColor);
    if (branding.fontFamily) root.style.fontFamily = branding.fontFamily + ', sans-serif';
  }, [branding]);

  const notify = (msg: string) => {
    setNotifications(prev => [{ id: Math.random().toString(), type: 'SYSTEM', title: 'Notificação', description: msg, time: 'Agora', read: false }, ...prev]);
  };

  // Menu Generator
  const menuItems = useMemo(() => {
    const baseItems = [
      { id: 'results', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'capture', label: 'Captação IA', icon: Radar },
      { id: 'prospecting', label: 'Kanban CRM', icon: Users },
      { id: 'inbox', label: 'Inbox & IA', icon: MessageSquare },
      { id: 'scheduling', label: 'Agenda', icon: Calendar },
      { id: 'automation', label: 'Fluxos & Bots', icon: Workflow },
      { id: 'broadcast', label: 'Disparos', icon: Megaphone },
      { id: 'concierge', label: 'Concierge', icon: Sparkles },
      { id: 'payments', label: 'Financeiro', icon: CreditCard },
      { id: 'admin', label: 'Configurações', icon: Settings },
    ];
    if (tenant.salesMode === 'DIRECT') {
      baseItems.splice(6, 0, { id: 'products', label: 'Catálogo', icon: Package });
    }
    return baseItems;
  }, [tenant.salesMode]);

  // GLOBAL LOADING STATE
  if (isGlobalLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-6">
         <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-600/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center font-black text-xs">ZP</div>
         </div>
         <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Carregando Sistema...</p>
      </div>
    );
  }

  // LOGIN PAGE
  if (!isAuthenticated) {
    return (
      <OfferPage 
        branding={branding} 
        onLogin={(user) => handleLoginSuccess(user)} 
      />
    );
  }

  // MAIN APP
  return (
    <div className={`flex h-screen overflow-hidden transition-all duration-500 ${performanceMode ? 'bg-slate-950 text-slate-100' : 'bg-gradient-to-br from-indigo-50/40 via-white to-cyan-50/40 text-slate-900'}`} style={{ fontFamily: branding.fontFamily }}>
      <AISearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={(mod) => setActiveModule(mod)} />

      {/* Sidebar */}
      <aside className={`flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} ${performanceMode ? 'bg-slate-900 border-r border-slate-800' : 'bg-white/80 backdrop-blur-xl border-r border-white/50'} flex flex-col z-20 shadow-xl shadow-indigo-100/20 dark:shadow-none`}>
        <div className="h-24 flex items-center justify-center border-b border-transparent">
           {isSidebarOpen ? (
             <h1 className="text-xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 cursor-pointer drop-shadow-sm truncate max-w-[200px]" onClick={() => setActiveModule('results')}>
               {tenant.name}
             </h1>
           ) : (
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-indigo-500/30 cursor-pointer" onClick={() => setIsSidebarOpen(true)}>{tenant.name.charAt(0)}</div>
           )}
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 no-scrollbar">
           {menuItems.map(item => {
             const itemTheme = MODULE_THEME[item.id] || MODULE_THEME.results;
             const isActive = activeModule === item.id;
             return (
               <button key={item.id} onClick={() => setActiveModule(item.id as AppModule)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden ${isActive ? `${itemTheme.activeClass} text-white` : performanceMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : `text-slate-500 hover:${itemTheme.lightBg} hover:${itemTheme.textClass}`}`}>
                  <item.icon size={20} className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'animate-pulse' : ''}`} />
                  {isSidebarOpen && <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>}
                  {!isSidebarOpen && isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>}
               </button>
             );
           })}
        </nav>

        <div className="p-4 border-t border-transparent">
           <button onClick={() => setActiveModule('profile')} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${performanceMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white shadow-md border border-slate-100 hover:bg-slate-50'}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-lg">{currentUser?.name.charAt(0)}</div>
              {isSidebarOpen && (
                <div className="text-left overflow-hidden">
                   <p className="text-xs font-black truncate dark:text-white text-slate-800">{currentUser?.name}</p>
                   <p className="text-[9px] text-emerald-500 uppercase font-bold truncate">{currentUser?.role}</p>
                </div>
              )}
           </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className={`h-20 flex items-center justify-between px-8 z-10 transition-colors ${performanceMode ? 'bg-slate-950/80 backdrop-blur-md' : 'bg-white/60 backdrop-blur-md'}`}>
           <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-xl transition-all ${performanceMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-indigo-600'}`}><Menu size={20} /></button>
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all w-64 cursor-text border ${performanceMode ? `bg-slate-900 ${currentTheme.borderClass} text-slate-300` : `bg-white border-slate-200 text-slate-500 hover:border-indigo-300 shadow-sm`}`} onClick={() => setIsSearchOpen(true)}>
                 <Search size={16} className={currentTheme.textClass} />
                 <span className="text-xs font-bold uppercase tracking-widest opacity-70">Buscar com IA...</span>
                 <span className="ml-auto text-[9px] font-black border border-current px-1.5 rounded opacity-50">CTRL+K</span>
              </div>
           </div>

           <div className="flex items-center gap-3 md:gap-6">
             <button onClick={() => setPerformanceMode(!performanceMode)} className={`p-3 rounded-2xl transition-all border hover:scale-105 active:scale-95 ${performanceMode ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-orange-500 shadow-sm'}`}>{performanceMode ? <Sun size={20} /> : <Moon size={20} />}</button>
             <div className="relative" ref={notificationRef}>
                <button onClick={() => setShowNotifications(!showNotifications)} className={`p-3 rounded-2xl transition-all relative group ${performanceMode ? 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-white text-slate-500 hover:text-indigo-600 shadow-sm border border-indigo-50'}`}>
                   {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-bounce shadow-lg shadow-rose-500/50"></span>}
                   <Bell size={20} />
                </button>
                {showNotifications && (
                   <div className={`absolute right-0 top-full mt-4 w-80 rounded-[2rem] shadow-2xl border p-4 z-50 animate-in slide-in-from-top-2 ${performanceMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                      <div className="flex justify-between items-center mb-4 px-2">
                         <h4 className="text-sm font-black italic uppercase text-slate-800 dark:text-white">Notificações</h4>
                         <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} className="text-[9px] font-bold text-indigo-500 uppercase hover:underline">Ler todas</button>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                         {notifications.length > 0 ? notifications.map(n => (
                           <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.read ? 'opacity-50' : 'opacity-100'} ${performanceMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                              <div className="flex justify-between items-start mb-1">
                                 <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase ${n.type === 'SALE' ? 'bg-emerald-50 text-white' : 'bg-indigo-50 text-white'}`}>{n.type}</span>
                                 <span className="text-[9px] text-slate-400">{n.time}</span>
                              </div>
                              <p className="text-xs font-bold mt-2 dark:text-slate-200">{n.title}</p>
                              <p className="text-[10px] text-slate-400 leading-tight mt-1">{n.description}</p>
                           </div>
                         )) : <p className="text-center text-xs text-slate-400 py-4">Sem notificações novas</p>}
                      </div>
                   </div>
                )}
             </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative p-4 md:p-6">
           {activeModule === 'results' && <Dashboard performanceMode={performanceMode} leads={leads} tenant={tenant} />}
           {activeModule === 'capture' && <CaptureManagement onAddLead={(l) => { setLeads([l, ...leads]); notify('Novo Lead Capturado!'); api.saveLead(l); }} notify={notify} />}
           {activeModule === 'prospecting' && <CRMKanban leads={leads} onLeadsChange={(l) => { setLeads(l); if(l[0]) api.saveLead(l[0]); }} notify={notify} onNavigate={setActiveModule} />}
           {activeModule === 'inbox' && <WhatsAppInbox niche={tenant.niche} activeLeads={leads} onSchedule={() => setActiveModule('scheduling')} tenant={tenant} evolutionConfig={evolutionConfig} notify={notify} />}
           {activeModule === 'products' && tenant.salesMode === 'DIRECT' && <ProductManager notify={notify} />}
           {activeModule === 'concierge' && <ConciergeService notify={notify} />}
           {activeModule === 'scheduling' && <ScheduleManager appointments={appointments} onAddAppointment={(a) => { setAppointments([...appointments, a]); notify('Agendado!'); api.saveAppointment(a); }} onUpdateAppointment={(a) => { setAppointments(appointments.map(app => app.id === a.id ? a : app)); notify('Atualizado!'); }} onDeleteAppointment={(id) => { setAppointments(appointments.filter(a => a.id !== id)); notify('Removido!'); }} />}
           {activeModule === 'automation' && <FollowUpAutomation niche={tenant.niche} />}
           {activeModule === 'broadcast' && <BroadcastManager leads={leads} isWhatsAppConnected={tenant.instanceStatus === 'CONNECTED'} onNavigate={setActiveModule} notify={notify} />}
           {activeModule === 'payments' && <PaymentManager totalVolume={tenant.revenue} pipelineVolume={leads.reduce((acc, l) => acc + (l.value || 0), 0)} onSimulateIncomingTransaction={() => {}} notify={notify} />}
           {activeModule === 'admin' && <AdminModule tenant={tenant} onTenantChange={(t) => setTenant(t)} allTenants={allTenants} onAddTenant={(t) => setAllTenants([...allTenants, t])} onUpdateTenant={(t) => setAllTenants(allTenants.map(tn => tn.id === t.id ? t : tn))} onDeleteTenant={(id) => setAllTenants(allTenants.filter(t => t.id !== id))} onSwitchTenant={(t) => setTenant(t)} branding={branding} onBrandingChange={(b) => { setBranding(b); api.saveBranding(b); }} onNicheChange={(n) => setTenant({...tenant, niche: n})} evolutionConfig={evolutionConfig} onEvolutionConfigChange={setEvolutionConfig} notify={notify} />}
           {activeModule === 'profile' && currentUser && <UserProfile user={currentUser} onUpdate={() => notify('Perfil atualizado')} onLogout={handleLogout} notify={notify} />}
        </div>
      </main>
    </div>
  );
}
