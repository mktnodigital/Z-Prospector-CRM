
import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, Calendar, Zap, Menu, Package, Target, 
  Sun, Moon, Sparkles, Wallet, Rocket,
  User, LogOut, Loader2, Heart, CheckCircle2,
  LayoutDashboard, Radar, Kanban, ShieldCheck, Globe, ChevronDown,
  Lock, Mail, ArrowRight, Eye, EyeOff, X, ShieldAlert,
  Settings, Building2, UserCog, Cpu, Shield, Fingerprint, Palette,
  ChevronLeft, ChevronRight, Megaphone, Search, CreditCard, ChevronLast, ChevronFirst,
  Bell, BellDot, ShoppingCart, TrendingUp, Workflow, Code2, Gauge
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
import { N8nManager } from './components/N8nManager';
import { FollowUpAutomation } from './components/FollowUpAutomation';
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
    { id: '1', type: 'SYSTEM', title: 'Operação Iniciada', description: 'O Motor de Vendas está pronto para escalar.', time: 'Agora', read: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<AppModule>('results');
  
  // CONCEITO: PERFORMANCE MODE
  // true = Cores vivas, Dark Mode Profundo, Foco em Ação
  // false = Modo Planejamento (Light/Padrão)
  const [performanceMode, setPerformanceMode] = useState(true); 
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
    notify('Sessão encerrada. A operação continua rodando em background.');
    setTimeout(() => {
      setIsLoggedIn(false);
      setActiveModule('results');
    }, 1500);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // RENOMEAÇÃO ESTRATÉGICA PARA ALTA PERFORMANCE
  const menuItems = [
    { id: 'admin', label: 'Central do Operador', icon: ShieldCheck, color: 'text-orange-500', special: true },
    { id: 'results', label: 'Painel de Resultado', icon: Gauge, color: 'text-indigo-500' },
    { id: 'capture', label: 'Fonte de Oportunidades', icon: Radar, color: 'text-cyan-500' },
    { id: 'prospecting', label: 'Pipeline de Conversão', icon: Kanban, color: 'text-violet-500' },
    { id: 'inbox', label: 'Central de Conversas', icon: MessageSquare, color: 'text-emerald-500' },
    { id: 'followup', label: 'Cadências que Vendem', icon: Zap, color: 'text-yellow-500' },
    { id: 'n8n', label: 'Fluxos de Receita (n8n)', icon: Workflow, color: 'text-blue-500' },
    { id: 'scheduling', label: 'Agenda Cheia', icon: Calendar, color: 'text-pink-500' },
    { id: 'broadcast', label: 'Reativação de Base', icon: Megaphone, color: 'text-rose-500' },
    { id: 'products', label: 'Oferta Irresistível', icon: Package, color: 'text-amber-500' },
    { id: 'payments', label: 'Caixa & Recebimentos', icon: Wallet, color: 'text-emerald-400' },
  ];

  if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-slate-950 text-white font-black uppercase tracking-widest"><Loader2 className="animate-spin text-indigo-500 mr-4" /> Iniciando Motor de Vendas...</div>;
  if (!isLoggedIn) return <OfferPage branding={branding} onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className={`fixed inset-0 flex h-full w-full overflow-hidden transition-colors duration-500 ${performanceMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <AISearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={setActiveModule} />
      
      {/* SIDEBAR DE ALTA PERFORMANCE */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-24'} ${performanceMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-r transition-all duration-300 flex flex-col z-50 shadow-2xl relative h-full group`}>
        <div className="p-8 flex items-center justify-center min-h-[140px]">
           <ZLogo branding={branding} type={isSidebarOpen ? 'full' : 'icon'} darkMode={performanceMode} />
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className={`absolute -right-4 top-16 w-8 h-8 ${performanceMode ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'} rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-[60]`}
           >
             {isSidebarOpen ? <ChevronLeft size={16}/> : <ChevronRight size={16}/>}
           </button>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((m) => (
            <button 
              key={m.id} 
              onClick={() => setActiveModule(m.id as AppModule)} 
              className={`w-full flex items-center ${isSidebarOpen ? 'gap-5 px-6' : 'justify-center'} py-4 rounded-2xl transition-all relative group/item overflow-hidden ${
                activeModule === m.id 
                  ? (performanceMode 
                      ? (m.special ? 'bg-orange-500/10 text-orange-500' : 'bg-indigo-600/20 text-indigo-400') 
                      : (m.special ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-900'))
                  : 'text-slate-500 hover:bg-slate-100/10'
              }`}
            >
              {/* Active Indicator Strip */}
              {activeModule === m.id && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 ${m.special ? 'bg-orange-500' : (performanceMode ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-900')} rounded-r-full`}></div>
              )}
              
              <m.icon size={isSidebarOpen ? 20 : 24} className={`${activeModule === m.id ? 'opacity-100' : 'opacity-60 group-hover/item:opacity-100'} transition-all`} /> 
              
              {isSidebarOpen && (
                <span className={`text-[10px] font-black uppercase tracking-widest ${activeModule === m.id ? 'opacity-100' : 'opacity-70 group-hover/item:opacity-100'}`}>
                  {m.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className={`p-6 border-t ${performanceMode ? 'border-slate-800' : 'border-slate-100'} space-y-2`}>
          <div className={`flex items-center gap-3 p-4 rounded-2xl ${performanceMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
             <div className={`w-2 h-2 rounded-full ${isWhatsAppConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
             {isSidebarOpen && (
               <div>
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Status do Motor</p>
                 <p className={`text-[10px] font-black uppercase ${isWhatsAppConnected ? 'text-emerald-500' : 'text-rose-500'}`}>
                   {isWhatsAppConnected ? 'Operando' : 'Parado'}
                 </p>
               </div>
             )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* TOAST NOTIFICATION */}
        {notification && (
           <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] px-8 py-4 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(79,70,229,0.5)] animate-in slide-in-from-top-10 flex items-center gap-4 border border-white/20 backdrop-blur-md">
              <CheckCircle2 size={18} /> {notification}
           </div>
        )}

        {/* HEADER DE COMANDO */}
        <header className={`h-24 ${performanceMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'} backdrop-blur-md border-b flex items-center justify-between px-10 z-40 relative transition-colors duration-500`}>
           <div className="flex items-center gap-10">
              <div 
                onClick={() => setIsSearchOpen(true)}
                className={`flex items-center gap-4 px-6 py-3.5 rounded-[2rem] cursor-pointer group transition-all w-80 shadow-inner border ${performanceMode ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400' : 'bg-slate-100 border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                 <Search size={18} className="group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Consultar Inteligência</span>
              </div>
           </div>

           <div className="flex items-center gap-6">
             {/* PERFORMANCE TOGGLE */}
             <div 
               onClick={() => setPerformanceMode(!performanceMode)}
               className={`cursor-pointer flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all ${
                 performanceMode 
                 ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                 : 'bg-slate-100 border-slate-200 text-slate-400'
               }`}
             >
                <div className={`w-2 h-2 rounded-full ${performanceMode ? 'bg-indigo-500 animate-pulse' : 'bg-slate-400'}`}></div>
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {performanceMode ? 'Modo Performance' : 'Modo Planejamento'}
                </span>
                {performanceMode ? <Zap size={14}/> : <Moon size={14}/>}
             </div>

             <div className="relative">
                <button 
                  onClick={() => { setShowNotifications(!showNotifications); setNotifications(notifications.map(n => ({...n, read: true}))); }}
                  className={`p-3.5 rounded-2xl transition-all relative group ${performanceMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                >
                   {unreadCount > 0 ? <BellDot className="text-rose-500 animate-bounce" size={20} /> : <Bell size={20} />}
                </button>
             </div>

             <div className="flex items-center gap-4 cursor-pointer group pl-6 border-l border-slate-800/10" onClick={() => setActiveModule('profile')}>
                <div className="text-right hidden sm:block">
                  <p className={`text-xs font-black uppercase tracking-widest transition-colors ${performanceMode ? 'text-white' : 'text-slate-900'}`}>{currentUser.name}</p>
                  <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest italic">{currentUser.role}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black shadow-lg transform group-hover:rotate-3 transition-all overflow-hidden border-2 border-white/10">
                  {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : 'OP'}
                </div>
             </div>
           </div>
        </header>

        {/* WORKSPACE DINÂMICO */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          {/* Background Ambient Light para Modo Performance */}
          {performanceMode && (
            <div className="absolute inset-0 pointer-events-none z-0">
               <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 blur-[120px] rounded-full"></div>
               <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-900/10 blur-[120px] rounded-full"></div>
            </div>
          )}

          <div className="relative z-10 h-full">
            {activeModule === 'results' && <Dashboard performanceMode={performanceMode} leads={leads} />}
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
            {activeModule === 'followup' && <FollowUpAutomation />}
            {activeModule === 'n8n' && <N8nManager notify={(msg) => { notify(msg); addNotification({ type: 'N8N', title: 'Infra n8n Alerta', description: msg }); }} />}
            {activeModule === 'products' && <ProductManager notify={notify} />}
            {activeModule === 'scheduling' && <ScheduleManager appointments={appointments} onAddAppointment={(a) => { setAppointments([...appointments, a]); addNotification({ type: 'APPOINTMENT', title: 'Novo Agendamento', description: `${a.lead} agendou ${a.service}` }); }} onUpdateAppointment={(a) => setAppointments(appointments.map(i => i.id === a.id ? a : i))} onDeleteAppointment={(id) => setAppointments(appointments.filter(i => i.id !== id))} />}
            {activeModule === 'broadcast' && <BroadcastManager leads={leads} isWhatsAppConnected={isWhatsAppConnected} onNavigate={setActiveModule} notify={(msg) => { notify(msg); addNotification({ type: 'BROADCAST', title: 'Status de Envio', description: msg }); }} />}
            {activeModule === 'payments' && <PaymentManager totalVolume={leads.reduce((a,b) => a + (b.value || 0), 0)} pipelineVolume={leads.length * 500} />}
            {activeModule === 'profile' && <UserProfile user={currentUser} onUpdate={(d) => setCurrentUser({...currentUser, ...d})} onLogout={handleLogout} notify={notify} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
