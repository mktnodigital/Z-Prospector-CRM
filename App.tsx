
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

// Ativos padrão do sistema
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
  const imgRef = useRef<HTMLImageElement>(null);
  
  const src = useMemo(() => {
    if (type === 'full') {
      return darkMode ? branding.fullLogoDark : branding.fullLogo;
    }
    return darkMode ? branding.iconLogoDark : branding.iconLogo;
  }, [branding, type, darkMode]);

  useEffect(() => {
    setStatus('loading');
    if (!src || src.includes('%20')) {
      const timer = setTimeout(() => {
        if (imgRef.current && !imgRef.current.complete) {
          setStatus('error');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [src]);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setStatus('success');
    }
  }, [src]);

  const renderFallback = () => (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg border border-indigo-500/30">
        <span className="text-white font-black text-xl italic leading-none">{branding.appName.charAt(0)}</span>
      </div>
      {type === 'full' && (
        <span className="text-xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
          {branding.appName}
        </span>
      )}
    </div>
  );

  if (status === 'error') return renderFallback();

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/10 dark:bg-slate-900/10 rounded-lg">
          <Loader2 className="animate-spin text-indigo-500/50" size={20} />
        </div>
      )}
      <img 
        ref={imgRef}
        src={src} 
        alt={branding.appName}
        style={{ display: status === 'error' ? 'none' : 'block' }}
        className={`force-logo-display ${imgClassName || (type === 'full' ? 'h-10 w-auto' : 'h-10 w-10')} ${status === 'loading' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={() => setStatus('error')}
        onLoad={() => setStatus('success')}
      />
    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); 
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); 

  // PERSISTÊNCIA DE BRANDING
  const [branding, setBranding] = useState<BrandingConfig>(() => {
    const saved = localStorage.getItem('z_prospector_branding');
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_BRANDING, ...parsed };
      }
      return DEFAULT_BRANDING;
    } catch (e) {
      return DEFAULT_BRANDING;
    }
  });

  const handleBrandingChange = (newConfig: BrandingConfig) => {
    setBranding(newConfig);
    localStorage.setItem('z_prospector_branding', JSON.stringify(newConfig));
  };

  // PERSISTÊNCIA DE USUÁRIO
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('z_prospector_user');
    try {
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { 
      name: 'Operador Master', 
      email: 'master@zprospector.com',
      role: 'SUPER_ADMIN',
      avatar: null as string | null
    };
  });

  const handleUpdateUser = (data: any) => {
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    localStorage.setItem('z_prospector_user', JSON.stringify(updated));
  };

  useEffect(() => {
    const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = branding.favicon;
    document.getElementsByTagName('head')[0].appendChild(link);
    document.title = `${branding.appName} - Sales & Automation`;
  }, [branding]);

  const [globalEvolutionConfig, setGlobalEvolutionConfig] = useState<EvolutionConfig>({
    baseUrl: 'https://api.clikai.com.br',
    apiKey: 'f292e7c587e33adf1873e0c1fc3bfcda',
    enabled: true
  });

  const [activeLicenses, setActiveLicenses] = useState<string[]>([
    'admin@zprospector.com', 
    'moisescosta.mkt@gmail.com',
    'master@zprospector.com'
  ]);
  
  const [activeModule, setActiveModule] = useState<AppModule>('results');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  };

  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentTenant] = useState<Tenant>({ 
    id: '1', 
    name: 'Unidade Matriz', 
    niche: 'Geral', 
    healthScore: 100, 
    revenue: 0, 
    activeLeads: 0, 
    status: 'ONLINE' 
  });

  const [notification, setNotification] = useState<string | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      setLeads([
        { id: '1', name: 'João Silva (Mock)', phone: '11999999999', email: 'joao@email.com', status: LeadStatus.HOT, stage: PipelineStage.QUALIFIED, lastInteraction: 'Interessado em agendamento', value: 1500, source: 'Instagram Ads' },
        { id: '2', name: 'Maria Souza (Mock)', phone: '11988888888', email: 'maria@email.com', status: LeadStatus.WARM, stage: PipelineStage.NEW, lastInteraction: 'Aguardando resposta', value: 2400, source: 'Google Maps' },
        { id: '3', name: 'Ricardo Dias', phone: '11977777777', email: 'ric@email.com', status: LeadStatus.COLD, stage: PipelineStage.NEW, lastInteraction: 'Nunca contatado', value: 0, source: 'Extração Ativa' },
      ]);
    } catch (err) {
      console.warn("API Offline - Usando modo de demonstração resiliente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchLeads();
  }, [isLoggedIn]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    setTimeout(() => {
      const userEmail = loginForm.email.toLowerCase();
      if (activeLicenses.includes(userEmail)) {
        setIsLoggingIn(false);
        setIsLoggedIn(true);
        setShowLoginModal(false);
        handleUpdateUser({ email: userEmail });
        notify(`Bem-vindo à Autoridade ${branding.appName}!`);
      } else {
        setIsLoggingIn(false);
        alert('ERRO: Licença não localizada. Por favor, confirme seu pagamento na página de vendas antes de acessar.');
      }
    }, 1500);
  };

  const handleActivationSuccess = (email: string) => {
    setActiveLicenses(prev => [...prev, email.toLowerCase()]);
    notify(`Licença Provisionada para ${email}`);
  };

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleModuleChange = (module: AppModule) => {
    setActiveModule(module);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setIsLoggedIn(false);
      setIsLoggingOut(false);
      setActiveModule('results');
    }, 2000);
  };

  const modules = [
    { id: 'admin', label: 'Master Admin', icon: ShieldCheck, color: 'text-orange-500', bg: 'hover:bg-orange-50 dark:hover:bg-orange-900/20' },
    { id: 'results', label: 'Performance', icon: LayoutDashboard, color: 'text-indigo-600', bg: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20' },
    { id: 'capture', label: 'Captação & Extração', icon: Radar, color: 'text-cyan-600', bg: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20' },
    { id: 'prospecting', label: 'Pipeline CRM', icon: Kanban, color: 'text-violet-600', bg: 'hover:bg-violet-50 dark:hover:bg-violet-900/20' },
    { id: 'inbox', label: 'Inbox IA', icon: MessageSquare, color: 'text-emerald-600', bg: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20' },
    { id: 'broadcast', label: 'Disparos IA', icon: Megaphone, color: 'text-rose-600', bg: 'hover:bg-rose-50 dark:hover:bg-rose-900/20' },
    { id: 'followup', label: 'Automação', icon: Target, color: 'text-orange-600', bg: 'hover:bg-orange-50 dark:hover:bg-orange-900/20' },
    { id: 'payments', label: 'Financeiro', icon: Wallet, color: 'text-cyan-600', bg: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20' },
    { id: 'products', label: 'Produtos', icon: Package, color: 'text-purple-600', bg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20' },
    { id: 'scheduling', label: 'Agenda', icon: Calendar, color: 'text-pink-600', bg: 'hover:bg-pink-50 dark:hover:bg-pink-900/20' },
  ];

  if (isLoggingOut) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center transition-colors duration-500 z-[200] ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
         <div className="text-center animate-in fade-in zoom-in duration-700 space-y-8 p-10">
            <div className="w-36 h-36 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl border border-slate-100 dark:border-slate-800">
               <ZLogo branding={branding} type="icon" darkMode={isDarkMode} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-tight">Sincronizando Sessão...</h1>
         </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <OfferPage branding={branding} onLogin={() => setShowLoginModal(true)} onActivationSuccess={handleActivationSuccess} />
        {showLoginModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-[30px] animate-in fade-in overflow-hidden transition-all duration-500">
             
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.1),transparent_70%)] pointer-events-none"></div>
             
             <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl w-full max-w-xl rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
                
                <button 
                  onClick={() => setShowLoginModal(false)} 
                  className="absolute top-10 right-10 p-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-rose-500 z-30 border border-slate-200 dark:border-white/5 shadow-sm"
                >
                  <X size={24} />
                </button>
                
                <div className="p-14 md:p-16 flex flex-col items-center text-center relative z-10">
                   
                   <div className="mb-14 group transform transition-all duration-1000 hover:scale-105 relative">
                      <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full scale-150 opacity-40 group-hover:opacity-100 transition-opacity"></div>
                      
                      <ZLogo 
                        branding={branding}
                        type="full" 
                        imgClassName="h-32 md:h-36 w-auto" 
                        className="drop-shadow-[0_10px_30px_rgba(79,70,229,0.2)] relative z-10" 
                        darkMode={isDarkMode}
                      />
                   </div>

                   <div className="space-y-3 mb-10">
                      <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Acesso Master</h2>
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-px w-10 bg-indigo-600/30"></div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em]">Console de Inteligência {branding.appName.charAt(0)}</p>
                        <div className="h-px w-10 bg-indigo-600/30"></div>
                      </div>
                   </div>

                   <form onSubmit={handleLoginSubmit} className="w-full space-y-6 text-left">
                      <div className="space-y-3">
                         <div className="flex justify-between items-center px-4">
                            <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em]">Master Identity</label>
                         </div>
                         <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600 text-slate-300 dark:text-slate-600">
                               <Mail size={22} />
                            </div>
                            <input 
                               type="email" 
                               required 
                               placeholder="master@zprospector.com" 
                               value={loginForm.email} 
                               onChange={e => setLoginForm({...loginForm, email: e.target.value})} 
                               className="w-full pl-16 pr-8 py-6 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-white/10 rounded-[2rem] outline-none font-bold text-sm text-slate-900 dark:text-white focus:border-indigo-600/50 focus:bg-white dark:focus:bg-slate-950/60 focus:ring-8 focus:ring-indigo-600/5 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-sm" 
                            />
                         </div>
                      </div>

                      <div className="space-y-3">
                         <div className="flex justify-between items-center px-4">
                            <label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em]">Security Passphrase</label>
                         </div>
                         <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600 text-slate-300 dark:text-slate-600">
                               <Lock size={22} />
                            </div>
                            <input 
                               type={showPassword ? "text" : "password"} 
                               required 
                               placeholder="••••••••••••" 
                               value={loginForm.password} 
                               onChange={e => setLoginForm({...loginForm, password: e.target.value})} 
                               className="w-full pl-16 pr-16 py-6 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-white/10 rounded-[2rem] outline-none font-bold text-sm text-slate-900 dark:text-white focus:border-indigo-600/50 focus:bg-white dark:focus:bg-slate-950/60 focus:ring-8 focus:ring-indigo-600/5 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-sm" 
                            />
                            <button 
                               type="button" 
                               onClick={() => setShowPassword(!showPassword)} 
                               className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 hover:text-indigo-600 transition-colors"
                            >
                               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                         </div>
                      </div>

                      <button 
                         type="submit" 
                         disabled={isLoggingIn} 
                         className="w-full py-7 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 text-white font-black rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] uppercase text-[12px] tracking-[0.4em] flex items-center justify-center gap-4 mt-6 hover:scale-[1.02] active:scale-95 transition-all border border-white/10 group overflow-hidden relative"
                      >
                         <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         {isLoggingIn ? <Loader2 className="animate-spin" size={22} /> : <Shield size={22} className="group-hover:rotate-12 transition-transform" />}
                         {isLoggingIn ? 'Sincronizando Identidade...' : 'Unlock Console'}
                      </button>
                   </form>

                   <div className="mt-14 flex flex-wrap items-center justify-center gap-10 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                      <div className="flex items-center gap-3">
                         <ShieldCheck size={16} className="text-emerald-500" />
                         <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">End-to-End Encrypted</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <Fingerprint size={16} className="text-indigo-500" />
                         <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">Biometric ID Valid</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`fixed inset-0 flex h-full w-full overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {notification && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[300] bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl animate-in slide-in-from-top-10 flex items-center gap-4">
           <Zap className="text-yellow-400 fill-current" size={16} />
           {notification}
        </div>
      )}

      {/* Sidebar: Fixed with Toggle Inside */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-24'} bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-500 flex flex-col z-50 shadow-2xl relative h-full overflow-hidden`}>
        
        {/* Toggle Button Inside Sidebar */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="absolute top-6 right-[-14px] w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-[60] border-2 border-white dark:border-slate-900"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="p-6 flex items-center justify-center min-h-[120px]">
           <ZLogo branding={branding} type={isSidebarOpen ? 'full' : 'icon'} darkMode={isDarkMode} />
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-2 overflow-hidden hover:overflow-y-auto no-scrollbar">
          {modules.map((m) => (
            <button 
              key={m.id} 
              onClick={() => handleModuleChange(m.id as AppModule)} 
              className={`w-full flex items-center ${isSidebarOpen ? 'gap-4 px-6 justify-start' : 'justify-center'} py-4 rounded-2xl transition-all group border-2 ${
                activeModule === m.id 
                  ? (m.id === 'admin' ? 'bg-orange-500 border-orange-500 shadow-orange-200/50' : 'bg-indigo-600 border-indigo-600 shadow-indigo-200/50') + ' text-white font-black shadow-xl' 
                  : `text-slate-500 dark:text-slate-400 border-transparent ${m.bg}`
              }`}
            >
              <m.icon 
                size={isSidebarOpen ? 22 : 30} 
                className={`${activeModule === m.id ? 'text-white' : m.color} transition-all duration-300`} 
              />
              {isSidebarOpen && <span className="text-[11px] font-black uppercase tracking-[0.2em] animate-in fade-in duration-500">{m.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800">
           <button onClick={handleLogout} className={`w-full flex items-center ${isSidebarOpen ? 'gap-4 px-6' : 'justify-center'} py-4 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all`}>
             <LogOut size={isSidebarOpen ? 18 : 24} /> 
             {isSidebarOpen && <span className="text-[10px] font-black uppercase">Sair</span>}
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 bg-white/60 dark:bg-slate-955/60 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-12 z-40">
          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-4 px-8 py-3 bg-emerald-600/10 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-600/20">
               <ShieldCheck size={16} className="text-yellow-500" /> Licença Ativa (SaaS Master)
            </div>
            
            <button onClick={toggleTheme} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-yellow-400 transition-all hover:scale-110">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => handleModuleChange('profile')}>
             <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-2">
                   <p className="text-xs font-black uppercase tracking-widest">{currentUser.name}</p>
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Master Authority • Online</p>
             </div>
             <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-2xl border-4 border-white dark:border-slate-800 transition-all group-hover:scale-105 active:scale-95 group-hover:border-indigo-500 relative overflow-hidden">
                {currentUser.avatar ? (
                   <img src={currentUser.avatar} className="w-full h-full object-cover" alt="User" />
                ) : (
                   <span className="text-xl font-black">{currentUser.name.charAt(0)}</span>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-955"></div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto custom-scrollbar bg-white dark:bg-slate-955">
          {activeModule === 'results' && <Dashboard stats={{ totalLeads: leads.length, hotLeads: leads.filter(l => l.status === LeadStatus.HOT).length, totalValue: leads.reduce((acc, curr) => acc + curr.value, 0), closedValue: leads.filter(l => l.stage === PipelineStage.CLOSED).reduce((acc, curr) => acc + curr.value, 0), conversionRate: '15%' }} leads={leads} />}
          {activeModule === 'capture' && <CaptureManagement onAddLead={(l) => setLeads([l, ...leads])} notify={notify} />}
          {activeModule === 'prospecting' && <CRMKanban leads={leads} onLeadsChange={setLeads} notify={notify} onNavigate={handleModuleChange} />}
          {activeModule === 'inbox' && <WhatsAppInbox niche={currentTenant.niche} activeLeads={leads} onSchedule={(a) => setAppointments([...appointments, a])} tenant={currentTenant} evolutionConfig={globalEvolutionConfig} notify={notify} />}
          {activeModule === 'broadcast' && <BroadcastManager leads={leads} notify={notify} />}
          {activeModule === 'followup' && <FollowUpAutomation niche={currentTenant.niche} />}
          {activeModule === 'products' && <ProductManager notify={notify} />}
          {activeModule === 'scheduling' && (
            <ScheduleManager 
              appointments={appointments} 
              onAddAppointment={(a) => setAppointments([...appointments, a])}
              onUpdateAppointment={(a) => setAppointments(prev => prev.map(item => item.id === a.id ? a : item))}
              onDeleteAppointment={(id) => setAppointments(prev => prev.filter(item => item.id !== id))}
            />
          )}
          {activeModule === 'admin' && <AdminModule branding={branding} onBrandingChange={handleBrandingChange} onNicheChange={(n) => notify(`Nicho alterado para ${n}`)} evolutionConfig={globalEvolutionConfig} onEvolutionConfigChange={setGlobalEvolutionConfig} notify={notify} />}
          {activeModule === 'payments' && <PaymentManager totalVolume={12000} pipelineVolume={45000} />}
          {activeModule === 'profile' && <UserProfile user={currentUser} onUpdate={handleUpdateUser} onLogout={handleLogout} notify={notify} />}
        </div>
      </main>
    </div>
  );
};

export default App;
