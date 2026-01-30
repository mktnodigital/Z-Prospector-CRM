
import React, { Component, useState, useEffect, useMemo, useRef, ErrorInfo, ReactNode } from 'react';
import { 
  MessageSquare, Calendar, Zap, Menu, Package, Target, 
  Sun, Moon, Sparkles, Wallet, Rocket,
  User, LogOut, Loader2, Heart, CheckCircle2,
  LayoutDashboard, Radar, Kanban, ShieldCheck, Globe, ChevronDown,
  Lock, Mail, ArrowRight, Eye, EyeOff, X, ShieldAlert,
  Settings, Building2, UserCog, Cpu, Shield, Fingerprint, Palette,
  ChevronLeft, ChevronRight, Megaphone, Search, CreditCard, ChevronLast, ChevronFirst,
  Bell, BellDot, ShoppingCart, TrendingUp, Workflow, Code2, Gauge, Menu as MenuIcon,
  Info, Flame, RefreshCw, AlertTriangle
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
import { LeadStatus, Lead, AppModule, Appointment, BrandingConfig, EvolutionConfig, AppNotification, Tenant } from './types';

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

const DEFAULT_EVOLUTION_CONFIG: EvolutionConfig = {
  baseUrl: 'https://api.clikai.com.br',
  apiKey: '',
  enabled: false
};

const DEFAULT_N8N_CONFIG = {
  baseUrl: 'https://n8n.clikai.com.br',
  apiKey: '',
  status: 'ONLINE'
};

// --- ERROR BOUNDARY ---
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Fixed: ErrorBoundary now correctly extends Component and removed incorrect override modifier on state.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fixed: Removed 'override' as it caused issues when extending Component in this context.
  public state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center z-[9999]">
          <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <AlertTriangle size={48} className="text-rose-500" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Sistema Interrompido</h1>
          <p className="text-slate-400 max-w-md mb-8 text-sm font-medium">Ocorreu uma falha crítica na renderização.</p>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-8 max-w-lg w-full text-left overflow-hidden">
             <p className="text-[10px] font-mono text-rose-400 break-all">{this.state.error?.message}</p>
          </div>
          <button onClick={this.handleReload} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-3">
            <RefreshCw size={18} /> Reiniciar
          </button>
        </div>
      );
    }
    // Fixed: 'this.props' is now correctly recognized as extending Component.
    return this.props.children;
  }
}

const ZLogo: React.FC<{ branding: BrandingConfig, type?: 'full' | 'icon', darkMode?: boolean }> = ({ branding, type = 'full', darkMode = false }) => {
  const [imgError, setImgError] = useState(false);
  const src = type === 'full' ? (darkMode ? branding.fullLogoDark : branding.fullLogo) : (darkMode ? branding.iconLogoDark : branding.iconLogo);
  if (imgError) {
    return (
      <div className={`flex items-center justify-center gap-2 ${type === 'full' ? 'px-4' : ''}`}>
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black">{branding.appName.charAt(0)}</div>
        {type === 'full' && <span className={`font-black italic uppercase tracking-tighter text-xl ${darkMode ? 'text-white' : 'text-slate-900'}`}>{branding.appName}</span>}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center">
      <img src={src} alt={branding.appName} onError={() => setImgError(true)} className="force-logo-display h-10 w-auto" />
    </div>
  );
};

const AppContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [evolutionConfig, setEvolutionConfig] = useState<EvolutionConfig>(DEFAULT_EVOLUTION_CONFIG);
  const [n8nConfig, setN8nConfig] = useState(DEFAULT_N8N_CONFIG);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tenant, setTenant] = useState<Tenant>({
    id: '1', name: 'Master', niche: 'SaaS', healthScore: 100, revenue: 0, activeLeads: 0, status: 'ONLINE', instanceStatus: 'DISCONNECTED'
  });
  
  const isWhatsAppConnected = tenant.instanceStatus === 'CONNECTED';
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<AppModule>('results');
  const [performanceMode, setPerformanceMode] = useState(true); 
  const [notification, setNotification] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState({ name: 'Operador Master', email: 'admin@zprospector.com.br', role: 'SUPER_ADMIN', avatar: null });

  useEffect(() => {
    const syncInitial = async () => {
      try {
        const bRes = await fetch(`${API_URL}?action=get-branding`);
        if (bRes.ok) setBranding(await bRes.json());
        
        const iRes = await fetch(`${API_URL}?action=get-integrations`);
        if (iRes.ok) {
            const integrations = await iRes.json();
            const evo = integrations.find((i: any) => i.provider === 'SYSTEM_EVOLUTION');
            if (evo) setEvolutionConfig({ baseUrl: evo.name, apiKey: evo.keys.apiKey || '', enabled: evo.status === 'CONNECTED' });
        }

        const lRes = await fetch(`${API_URL}?action=get-leads`);
        if (lRes.ok) setLeads(await lRes.json());
        
        const tRes = await fetch(`${API_URL}?action=get-current-tenant`);
        if (tRes.ok) setTenant(await tRes.json());
      } catch (e) { console.warn("Backend offline."); }
      finally { setIsLoading(false); }
    };
    syncInitial();
  }, []);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const menuCategories = [
    { label: 'Operação Central', items: [{ id: 'results', label: 'Dashboard', icon: Gauge, color: 'text-indigo-500', activeGradient: 'from-indigo-600 to-violet-600' }, { id: 'admin', label: 'Command Center', icon: ShieldCheck, color: 'text-orange-500', activeGradient: 'from-orange-500 to-red-500' }] },
    { label: 'Fase 1: ATRAIR', items: [{ id: 'capture', label: 'Captação IA', icon: Radar, color: 'text-cyan-500', activeGradient: 'from-cyan-500 to-blue-500' }, { id: 'broadcast', label: 'Disparos', icon: Megaphone, color: 'text-rose-500', activeGradient: 'from-rose-500 to-red-500' }] },
    { label: 'Fase 2: CONVERSAR', items: [{ id: 'inbox', label: 'Chat Inbox', icon: MessageSquare, color: 'text-emerald-500', activeGradient: 'from-emerald-500 to-teal-500' }] },
    { label: 'Fase 3: QUALIFICAR', items: [{ id: 'prospecting', label: 'Pipeline', icon: Kanban, color: 'text-violet-500', activeGradient: 'from-violet-600 to-fuchsia-600' }] },
    { label: 'Fase 4: AGENDAR', items: [{ id: 'scheduling', label: 'Agenda', icon: Calendar, color: 'text-pink-500', activeGradient: 'from-pink-500 to-rose-500' }] }
  ];

  if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-slate-950 text-white font-black uppercase z-[9999]">Iniciando...</div>;
  if (!isLoggedIn) return <OfferPage branding={branding} onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className={`fixed inset-0 flex h-full w-full overflow-hidden transition-all duration-700 ${performanceMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <AISearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={setActiveModule} />
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-28'} bg-slate-900/60 border-r border-slate-800/50 backdrop-blur-xl transition-all duration-300 flex flex-col h-full z-[70]`}>
        <div className="p-8 flex items-center justify-center min-h-[120px]"><ZLogo branding={branding} type={isSidebarOpen ? 'full' : 'icon'} darkMode={performanceMode} /></div>
        <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto no-scrollbar">
          {menuCategories.map((category, idx) => (
            <div key={idx} className="space-y-1">
              {isSidebarOpen && <div className="px-6 mb-2 text-[8px] font-black uppercase text-slate-500 tracking-widest">{category.label}</div>}
              {category.items.map(m => (
                <button key={m.id} onClick={() => setActiveModule(m.id as AppModule)} className={`w-full flex items-center ${isSidebarOpen ? 'gap-4 px-6' : 'justify-center'} py-3.5 rounded-2xl transition-all ${activeModule === m.id ? `bg-gradient-to-r ${m.activeGradient} text-white shadow-lg` : 'text-slate-400 hover:bg-slate-800/50'}`}>
                  <m.icon size={18} /> {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="h-20 bg-slate-900/40 border-b border-slate-800/50 backdrop-blur-xl flex items-center justify-between px-10">
           <div className="flex items-center gap-4">
              <div onClick={() => setIsSearchOpen(true)} className="flex items-center gap-4 px-6 py-3 bg-slate-800/50 border border-slate-700/50 rounded-full text-slate-400 cursor-pointer w-96">
                 <Search size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Consultar IA...</span>
              </div>
           </div>
           <div className="flex items-center gap-6">
             <button onClick={() => setPerformanceMode(!performanceMode)} className="p-3 bg-indigo-950/50 border border-indigo-500/50 text-yellow-400 rounded-full"><Zap size={20}/></button>
             <div className="flex items-center gap-4" onClick={() => setActiveModule('profile')}>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black uppercase text-white">{currentUser.name}</p>
                  <p className="text-[8px] font-black text-indigo-500 uppercase italic">{currentUser.role}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black shadow-lg overflow-hidden">
                  {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
                </div>
             </div>
           </div>
        </header>
        <div className="flex-1 overflow-auto custom-scrollbar">
          {activeModule === 'results' && <Dashboard performanceMode={performanceMode} leads={leads} />}
          {activeModule === 'admin' && <AdminModule branding={branding} onBrandingChange={setBranding} onNicheChange={() => {}} evolutionConfig={evolutionConfig} onEvolutionConfigChange={setEvolutionConfig} n8nConfig={n8nConfig} onN8nConfigChange={setN8nConfig} notify={notify} />}
          {activeModule === 'inbox' && (
            <WhatsAppInbox 
              niche="Vendas Master" 
              activeLeads={leads} 
              onSchedule={() => {}} 
              tenant={tenant}
              evolutionConfig={evolutionConfig} 
              onEvolutionConfigChange={setEvolutionConfig}
              onConnectionChange={async (status) => { 
                const newStatus = status ? 'CONNECTED' : 'DISCONNECTED';
                setTenant(prev => ({...prev, instanceStatus: newStatus})); 
                await fetch(`${API_URL}?action=update-instance-status`, { method: 'POST', body: JSON.stringify({ status: newStatus }) });
              }}
              notify={notify} 
            />
          )}
          {activeModule === 'capture' && <CaptureManagement onAddLead={(l) => setLeads([l, ...leads])} notify={notify} />}
          {activeModule === 'prospecting' && <CRMKanban leads={leads} onLeadsChange={setLeads} notify={notify} onNavigate={setActiveModule} />}
          {activeModule === 'scheduling' && <ScheduleManager appointments={appointments} onAddAppointment={(a) => setAppointments([...appointments, a])} onUpdateAppointment={(a) => setAppointments(appointments.map(i => i.id === a.id ? a : i))} onDeleteAppointment={(id) => setAppointments(appointments.filter(i => i.id !== id))} />}
          {activeModule === 'broadcast' && <BroadcastManager leads={leads} isWhatsAppConnected={isWhatsAppConnected} onNavigate={setActiveModule} notify={notify} />}
          {activeModule === 'payments' && <PaymentManager totalVolume={leads.reduce((a,b) => a + (b.value || 0), 0)} pipelineVolume={leads.length * 500} />}
          {activeModule === 'profile' && <UserProfile user={currentUser} onUpdate={setCurrentUser} onLogout={() => setIsLoggedIn(false)} notify={notify} />}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => <ErrorBoundary><AppContent /></ErrorBoundary>;
export default App;
