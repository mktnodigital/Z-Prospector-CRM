
import React, { useState, useEffect, useMemo, useRef, ErrorInfo, ReactNode } from 'react';
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

// Configuração padrão como fallback, será sobrescrita pelo DB
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

// --- ERROR BOUNDARY (PRODUCTION SAFETY) ---
interface ErrorBoundaryProps {
  // Fix: children must be optional to avoid instantiation type errors in some TS environments
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Explicitly define state property to resolve "Property 'state' does not exist on type 'ErrorBoundary'" errors
  public override state: ErrorBoundaryState = { hasError: false, error: null };

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
          <p className="text-slate-400 max-w-md mb-8 text-sm font-medium">
            Ocorreu uma falha crítica no módulo de renderização. O sistema de proteção blindou os dados.
          </p>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-8 max-w-lg w-full text-left overflow-hidden">
             <p className="text-[10px] font-mono text-rose-400 break-all">{this.state.error?.message}</p>
          </div>
          <button 
            onClick={this.handleReload}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center gap-3"
          >
            <RefreshCw size={18} /> Reiniciar Operação
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Componente de Logo com Fallback Inteligente
const ZLogo: React.FC<{ branding: BrandingConfig, type?: 'full' | 'icon', darkMode?: boolean }> = ({ branding, type = 'full', darkMode = false }) => {
  const [imgError, setImgError] = useState(false);
  const src = type === 'full' ? (darkMode ? branding.fullLogoDark : branding.fullLogo) : (darkMode ? branding.iconLogoDark : branding.iconLogo);

  if (imgError) {
    return (
      <div className={`flex items-center justify-center gap-2 ${type === 'full' ? 'px-4' : ''}`}>
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/30">
          {branding.appName.charAt(0)}
        </div>
        {type === 'full' && (
          <span className={`font-black italic uppercase tracking-tighter text-xl ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {branding.appName}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center transition-all duration-500">
      <img 
        src={src} 
        alt={branding.appName} 
        onError={() => setImgError(true)}
        className={`force-logo-display ${type === 'full' ? 'h-10 w-auto' : 'h-12 w-12 object-contain scale-125'}`} 
      />
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
  
  // Derivado do estado do Tenant para compatibilidade
  const isWhatsAppConnected = tenant.instanceStatus === 'CONNECTED';
  
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: '1', type: 'SYSTEM', title: 'Operação Iniciada', description: 'O Motor de Vendas está pronto para escalar.', time: 'Agora', read: false },
    { id: '2', type: 'INBOX', title: 'Lead Quente', description: 'Novo contato detectado com alta intenção de compra.', time: 'Há 5 min', read: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  
  // Responsive Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<AppModule>('results');
  
  // CONCEITO: PERFORMANCE MODE (Controla Tema Escuro/Claro + Vibrancy)
  const [performanceMode, setPerformanceMode] = useState(true); 
  const [notification, setNotification] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState({ 
    name: 'Operador Master', 
    email: 'admin@zprospector.com', 
    role: 'SUPER_ADMIN', 
    avatar: null 
  });

  // Dynamic Favicon Update
  useEffect(() => {
    if (branding.favicon) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = branding.favicon;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = branding.favicon;
        document.head.appendChild(newLink);
      }
      
      // Also update apple-touch-icon if exists
      const appleLink = document.querySelector("link[rel~='apple-touch-icon']") as HTMLLinkElement;
      if (appleLink) appleLink.href = branding.favicon;
    }
    document.title = `${branding.appName} - Operação`;
  }, [branding]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fechar notificações ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

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

  // FETCH CORE DATA (Sync Function)
  const syncCoreData = async () => {
    try {
      // 1. Leads
      const lRes = await fetch(`${API_URL}?action=get-leads`);
      if (lRes.ok) {
        const newLeads = await lRes.json();
        if (newLeads.length > leads.length && leads.length > 0) {
           addNotification({ type: 'INBOX', title: 'Novo Lead', description: 'Um novo cliente entrou no pipeline.' });
        }
        setLeads(newLeads);
      }
      
      // 2. Tenant Status
      const tRes = await fetch(`${API_URL}?action=get-current-tenant`);
      if (tRes.ok) {
         const tData = await tRes.json();
         setTenant(tData);
      }
      
      // 3. Appointments
      const aRes = await fetch(`${API_URL}?action=get-appointments`);
      if (aRes.ok) setAppointments(await aRes.json());

    } catch (e) {
      // Silent fail on polling
    }
  };

  // Inicialização Robusta
  useEffect(() => {
    const syncInitial = async () => {
      try {
        // Branding
        const bRes = await fetch(`${API_URL}?action=get-branding`);
        if (bRes.ok) setBranding(await bRes.json());
        
        // Load System Configs (Evolution / N8N) from Integrations
        const iRes = await fetch(`${API_URL}?action=get-integrations`);
        if (iRes.ok) {
            const integrations = await iRes.json();
            if (Array.isArray(integrations)) {
                // Parse Evolution Config
                const evo = integrations.find((i: any) => i.provider === 'SYSTEM_EVOLUTION');
                if (evo && evo.keys) {
                    setEvolutionConfig({
                        baseUrl: evo.name, // Storing URL in name for convenience or keys.url
                        apiKey: evo.keys.apiKey || '',
                        enabled: evo.status === 'CONNECTED'
                    });
                }
                
                // Parse N8N Config
                const n8n = integrations.find((i: any) => i.provider === 'SYSTEM_N8N');
                if (n8n && n8n.keys) {
                    setN8nConfig({
                        baseUrl: n8n.name,
                        apiKey: n8n.keys.apiKey || '',
                        status: n8n.status === 'CONNECTED' ? 'ONLINE' : 'OFFLINE'
                    });
                }
            }
        }

        await syncCoreData(); // Initial Data Load
        
        const uRes = await fetch(`${API_URL}?action=get-user`);
        if (uRes.ok) {
            const userData = await uRes.json();
            setCurrentUser(userData);
        }
      } catch (e) {
        console.warn("Backend offline. Iniciando modo Demonstração.");
        setLeads([
          { id: '1', name: 'Roberto Justus', phone: '11999999999', email: 'roberto@tv.com', status: LeadStatus.HOT, stage: 'NEGOTIATION', lastInteraction: 'Interesse alto', value: 5000, source: 'Instagram' },
          { id: '2', name: 'Ana Maria', phone: '11988888888', email: 'ana@tv.com', status: LeadStatus.WARM, stage: 'CONTACTED', lastInteraction: 'Pediu preço', value: 1500, source: 'Google' }
        ]);
      } finally { setIsLoading(false); }
    };
    syncInitial();
  }, []);

  // Heartbeat System (Real-time Polling every 15s) - OPTIMIZED
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(() => {
        // Only poll if tab is visible to save resources
        if (document.visibilityState === 'visible') {
            syncCoreData();
        }
      }, 15000); 
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, leads.length]); 

  const handleLogout = () => {
    notify('Sessão encerrada. A operação continua rodando em background.');
    setTimeout(() => {
      setIsLoggedIn(false);
      setActiveModule('results');
    }, 1500);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const menuCategories = [
    {
      label: 'Operação Central',
      items: [
        { id: 'results', label: 'Painel de Resultado', icon: Gauge, color: 'text-indigo-500', activeGradient: 'from-indigo-600 to-violet-600' },
        { id: 'admin', label: 'Command Center', icon: ShieldCheck, color: 'text-orange-500', activeGradient: 'from-orange-500 to-red-500' },
      ]
    },
    {
      label: 'Fase 1: ATRAIR',
      items: [
        { id: 'capture', label: 'Fontes de Captação', icon: Radar, color: 'text-cyan-500', activeGradient: 'from-cyan-500 to-blue-500' },
        { id: 'broadcast', label: 'Reativação de Base', icon: Megaphone, color: 'text-rose-500', activeGradient: 'from-rose-500 to-red-500' },
      ]
    },
    {
      label: 'Fase 2: CONVERSAR',
      items: [
        { id: 'inbox', label: 'Central de Conversas', icon: MessageSquare, color: 'text-emerald-500', activeGradient: 'from-emerald-500 to-teal-500' },
        { id: 'followup', label: 'Cadências de Resposta', icon: Zap, color: 'text-yellow-500', activeGradient: 'from-yellow-500 to-amber-500' },
      ]
    },
    {
      label: 'Fase 3: QUALIFICAR',
      items: [
        { id: 'prospecting', label: 'Pipeline / Kanban', icon: Kanban, color: 'text-violet-500', activeGradient: 'from-violet-600 to-fuchsia-600' },
        { id: 'n8n', label: 'Inteligência Neural', icon: Workflow, color: 'text-blue-500', activeGradient: 'from-blue-600 to-indigo-600' },
      ]
    },
    {
      label: 'Fase 4: AGENDAR',
      items: [
        { id: 'scheduling', label: 'Agenda Cheia', icon: Calendar, color: 'text-pink-500', activeGradient: 'from-pink-500 to-rose-500' },
      ]
    },
    {
      label: 'Fase 5: FECHAR',
      items: [
        { id: 'products', label: 'Catálogo de Ofertas', icon: Package, color: 'text-amber-500', activeGradient: 'from-amber-500 to-orange-500' },
        { id: 'payments', label: 'Caixa & Recebíveis', icon: Wallet, color: 'text-emerald-400', activeGradient: 'from-emerald-400 to-green-500' },
      ]
    }
  ];

  if (isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-slate-950 text-white font-black uppercase tracking-widest z-[9999]"><Loader2 className="animate-spin text-indigo-500 mr-4" /> Iniciando Motor de Vendas...</div>;
  if (!isLoggedIn) return <OfferPage branding={branding} onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className={`fixed inset-0 flex h-full w-full overflow-hidden transition-all duration-700 ${performanceMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* VIBRANT BACKGROUND MESH */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
         {performanceMode ? (
            <>
               <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/20 blur-[150px] rounded-full mix-blend-screen animate-pulse"></div>
               <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-900/20 blur-[150px] rounded-full mix-blend-screen animate-pulse delay-700"></div>
               <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-cyan-900/10 blur-[100px] rounded-full mix-blend-screen"></div>
            </>
         ) : (
            <>
               <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/40 blur-[120px] rounded-full mix-blend-multiply"></div>
               <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-200/40 blur-[120px] rounded-full mix-blend-multiply"></div>
            </>
         )}
      </div>

      <AISearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={setActiveModule} />
      
      {/* MOBILE OVERLAY */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60]"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR VIBRANTE */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-[70] 
          ${isSidebarOpen ? 'w-80 translate-x-0' : (isMobile ? '-translate-x-full' : 'w-28 translate-x-0')} 
          ${performanceMode ? 'bg-slate-900/60 border-slate-800/50' : 'bg-white/60 border-indigo-50'} 
          backdrop-blur-xl border-r transition-all duration-300 flex flex-col shadow-[10px_0_40px_-10px_rgba(0,0,0,0.1)] h-full group
        `}
      >
        <div className="p-8 flex items-center justify-center min-h-[140px] relative">
           <ZLogo branding={branding} type={isSidebarOpen ? 'full' : 'icon'} darkMode={performanceMode} />
           
           {!isMobile && (
             <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className={`absolute -right-4 top-16 w-8 h-8 ${performanceMode ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50'} rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-[80]`}
             >
               {isSidebarOpen ? <ChevronLeft size={16}/> : <ChevronRight size={16}/>}
             </button>
           )}

           {isMobile && (
             <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white">
               <X size={20} />
             </button>
           )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto no-scrollbar pb-20">
          {menuCategories.map((category, catIdx) => (
            <div key={catIdx} className="space-y-2">
              {isSidebarOpen && (
                <div className="px-6 mb-2 flex items-center gap-2 opacity-40">
                  <span className={`text-[8px] font-black uppercase tracking-[0.3em] whitespace-nowrap ${performanceMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {category.label}
                  </span>
                  <div className={`h-px flex-1 ${performanceMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                </div>
              )}
              <div className="space-y-1">
                {category.items.map((m) => (
                  <button 
                    key={m.id} 
                    onClick={() => { setActiveModule(m.id as AppModule); if(isMobile) setIsSidebarOpen(false); }} 
                    className={`w-full flex items-center ${isSidebarOpen ? 'gap-4 px-6' : 'justify-center'} py-3.5 rounded-[1.2rem] transition-all relative group/item overflow-hidden ${
                      activeModule === m.id 
                        ? `bg-gradient-to-r ${m.activeGradient} text-white shadow-lg shadow-${m.color.split('-')[1]}-500/30 scale-[1.02]`
                        : performanceMode 
                          ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' 
                          : 'text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-md'
                    }`}
                  >
                    <m.icon size={isSidebarOpen ? 18 : 22} className={`${activeModule === m.id ? 'text-white' : m.color} transition-colors`} /> 
                    
                    {isSidebarOpen && (
                      <span className="text-[10px] font-black uppercase tracking-widest truncate">
                        {m.label}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className={`p-6 border-t ${performanceMode ? 'border-slate-800/50' : 'border-indigo-50'} space-y-2`}>
          <div className={`flex items-center gap-3 p-4 rounded-2xl ${performanceMode ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-indigo-50 shadow-sm'}`}>
             <div className={`w-2.5 h-2.5 rounded-full ${isWhatsAppConnected ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-rose-500'}`}></div>
             {isSidebarOpen && (
               <div>
                 <p className={`text-[9px] font-black uppercase tracking-widest opacity-60 ${performanceMode ? 'text-slate-400' : 'text-slate-500'}`}>Status do Motor</p>
                 <p className={`text-[10px] font-black uppercase ${isWhatsAppConnected ? 'text-emerald-500' : 'text-rose-500'}`}>
                   {isWhatsAppConnected ? 'Operando' : 'Parado'}
                 </p>
               </div>
             )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* TOAST NOTIFICATION */}
        {notification && (
           <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-[0_0_40px_rgba(79,70,229,0.6)] animate-in slide-in-from-top-10 flex items-center gap-4">
              <div className="bg-emerald-500 rounded-full p-1"><CheckCircle2 size={14} className="text-white"/></div>
              {notification}
           </div>
        )}

        {/* HEADER */}
        <header className={`h-20 md:h-24 ${performanceMode ? 'bg-slate-900/40 border-slate-800/50' : 'bg-white/60 border-indigo-50'} backdrop-blur-xl border-b flex items-center justify-between px-6 md:px-10 z-40 transition-colors duration-500`}>
           <div className="flex items-center gap-4 md:gap-8">
              {isMobile && (
                <button onClick={() => setIsSidebarOpen(true)} className={`p-2 ${performanceMode ? 'text-slate-400 hover:text-indigo-500' : 'text-slate-600 hover:text-indigo-600'}`}>
                  <MenuIcon size={24} />
                </button>
              )}
              
              <div 
                onClick={() => setIsSearchOpen(true)}
                className={`flex items-center gap-4 px-6 py-3 rounded-[2rem] cursor-pointer group transition-all w-12 md:w-96 shadow-inner border ${performanceMode ? 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-slate-800' : 'bg-white border-indigo-100 text-slate-500 hover:border-indigo-300 hover:shadow-md'}`}
              >
                 <Search size={18} className="group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline opacity-70 group-hover:opacity-100">Consultar Inteligência</span>
              </div>
           </div>

           <div className="flex items-center gap-3 md:gap-6">
             {/* PERFORMANCE TOGGLE (ICONE APENAS) */}
             <button 
               onClick={() => setPerformanceMode(!performanceMode)}
               title={performanceMode ? 'Modo Planejamento (Dark)' : 'Modo Dia (Light)'}
               className={`p-3 rounded-full border transition-all hover:scale-105 active:scale-95 shadow-sm ${
                 performanceMode 
                 ? 'bg-indigo-950/50 border-indigo-500/50 text-yellow-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                 : 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300'
               }`}
             >
                {performanceMode ? <Zap size={20} className="fill-yellow-400"/> : <Moon size={20}/>}
             </button>

             <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-3 rounded-2xl transition-all relative group ${performanceMode ? 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700' : 'bg-white text-slate-500 hover:text-indigo-600 shadow-sm border border-indigo-50'}`}
                >
                   {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-bounce"></span>}
                   <Bell size={20} />
                </button>

                {showNotifications && (
                  <div className={`absolute top-full right-0 mt-4 w-80 md:w-96 rounded-[2rem] shadow-2xl border p-4 z-[100] animate-in zoom-in-95 ${performanceMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                     <div className={`flex justify-between items-center px-4 py-2 border-b mb-2 ${performanceMode ? 'border-slate-800' : 'border-slate-100'}`}>
                        <span className={`text-xs font-black uppercase tracking-widest ${performanceMode ? 'text-white' : 'text-slate-800'}`}>Notificações</span>
                        <button onClick={() => setNotifications([])} className="text-[9px] font-bold text-indigo-500 hover:underline">Limpar</button>
                     </div>
                     <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2">
                        {notifications.length > 0 ? notifications.map(notif => (
                           <div key={notif.id} className={`p-4 rounded-2xl transition-colors flex gap-3 border ${performanceMode ? 'hover:bg-slate-800 border-transparent hover:border-slate-700' : 'hover:bg-slate-50 border-transparent hover:border-slate-100'}`}>
                              <div className={`p-2 rounded-lg h-fit ${notif.type === 'SYSTEM' ? 'bg-indigo-100 text-indigo-600' : notif.type === 'INBOX' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                 <Info size={16} />
                              </div>
                              <div>
                                 <h4 className={`text-xs font-black uppercase tracking-tight ${performanceMode ? 'text-slate-200' : 'text-slate-800'}`}>{notif.title}</h4>
                                 <p className={`text-[10px] font-medium leading-tight mt-1 ${performanceMode ? 'text-slate-300' : 'text-slate-500'}`}>{notif.description}</p>
                                 <span className={`text-[9px] font-bold mt-2 block ${performanceMode ? 'text-slate-500' : 'text-slate-400'}`}>{notif.time}</span>
                              </div>
                           </div>
                        )) : (
                           <div className="py-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                              Nenhuma novidade
                           </div>
                        )}
                     </div>
                  </div>
                )}
             </div>

             <div className={`flex items-center gap-4 cursor-pointer group pl-6 border-l ${performanceMode ? 'border-slate-700/50' : 'border-slate-200/50'}`} onClick={() => setActiveModule('profile')}>
                <div className="text-right hidden sm:block">
                  <p className={`text-xs font-black uppercase tracking-widest transition-colors ${performanceMode ? 'text-white' : 'text-slate-800'}`}>{currentUser.name}</p>
                  <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest italic">{currentUser.role}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black shadow-lg transform group-hover:rotate-6 transition-all overflow-hidden border-2 border-white/20">
                  {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
                </div>
             </div>
           </div>
        </header>

        {/* WORKSPACE */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          <div className="relative z-10 h-full">
            {activeModule === 'results' && <Dashboard performanceMode={performanceMode} leads={leads} />}
            {activeModule === 'admin' && (
              <AdminModule 
                branding={branding} 
                onBrandingChange={setBranding} 
                onNicheChange={() => {}} 
                evolutionConfig={evolutionConfig} 
                onEvolutionConfigChange={setEvolutionConfig} 
                n8nConfig={n8nConfig}
                onN8nConfigChange={setN8nConfig}
                notify={notify} 
              />
            )}
            {activeModule === 'capture' && <CaptureManagement onAddLead={(l) => setLeads([l, ...leads])} notify={notify} />}
            {activeModule === 'prospecting' && <CRMKanban leads={leads} onLeadsChange={setLeads} notify={notify} onNavigate={setActiveModule} />}
            {activeModule === 'inbox' && (
              <WhatsAppInbox 
                niche="Vendas Master" 
                activeLeads={leads} 
                onSchedule={() => {}} 
                tenant={tenant}
                evolutionConfig={evolutionConfig} 
                onConnectionChange={async (status) => { 
                  const newStatus = status ? 'CONNECTED' : 'DISCONNECTED';
                  setTenant(prev => ({...prev, instanceStatus: newStatus})); 
                  try {
                    await fetch(`${API_URL}?action=update-instance-status`, {
                       method: 'POST',
                       body: JSON.stringify({ status: newStatus })
                    });
                  } catch (e) {
                    console.error("Falha ao persistir status", e);
                  }
                }}
                notify={(msg) => { notify(msg); addNotification({ type: 'INBOX', title: 'Mensagem Recebida', description: msg }); }} 
                onEvolutionConfigChange={setEvolutionConfig}
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

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;
