
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, MessageSquare, Calendar, 
  Package, Megaphone, Settings, CreditCard, 
  Menu, Bell, Search, Zap, Moon, User,
  LogOut, X, ChevronRight, Activity, Cloud,
  Target, Rocket, Monitor, CheckCircle, Sun
} from 'lucide-react';

import { Dashboard } from './components/Dashboard';
import { CRMKanban } from './components/CRMKanban';
import { WhatsAppInbox } from './components/WhatsAppInbox';
import { CaptureManagement } from './components/CaptureManagement';
import { FollowUpAutomation } from './components/FollowUpAutomation';
import { ProductManager } from './components/ProductManager';
import { ScheduleManager } from './components/ScheduleManager';
import { BroadcastManager } from './components/BroadcastManager';
import { PaymentManager } from './components/PaymentManager';
import { N8nManager } from './components/N8nManager';
import { AdminModule } from './components/AdminModule';
import { UserProfile } from './components/UserProfile';
import { OfferPage } from './components/OfferPage';
import { AISearchModal } from './components/AISearchModal';

import { 
  Lead, Appointment, Tenant, BrandingConfig, 
  EvolutionConfig, AppNotification, AppModule, LeadStatus, PipelineStage 
} from './types';

// INITIAL DATA
const INITIAL_LEADS: Lead[] = [
  { id: 'l1', name: 'Roberto Silva', phone: '5511999998888', email: 'roberto@email.com', status: LeadStatus.HOT, stage: PipelineStage.NEGOTIATION, lastInteraction: 'Interessado no plano anual', value: 1500, source: 'Instagram' },
  { id: 'l2', name: 'Julia Martins', phone: '5511988887777', email: 'julia@email.com', status: LeadStatus.WARM, stage: PipelineStage.QUALIFIED, lastInteraction: 'Pediu apresentação', value: 800, source: 'Google Ads' },
  { id: 'l3', name: 'Empresa Tech', phone: '5511977776666', email: 'contato@tech.com', status: LeadStatus.COLD, stage: PipelineStage.CONTACTED, lastInteraction: 'Sem resposta há 2 dias', value: 5000, source: 'Linkedin' },
];

const INITIAL_TENANT: Tenant = {
  id: 't1',
  name: 'Minha Operação',
  niche: 'SaaS',
  healthScore: 98,
  revenue: 15400,
  activeLeads: 124,
  status: 'ONLINE',
  instanceStatus: 'CONNECTED'
};

const INITIAL_BRANDING: BrandingConfig = {
  fullLogo: 'https://via.placeholder.com/150x40?text=Z-Prospector',
  fullLogoDark: 'https://via.placeholder.com/150x40?text=Z-Prospector&bg=000&textColor=fff',
  iconLogo: 'https://via.placeholder.com/40?text=Z',
  iconLogoDark: 'https://via.placeholder.com/40?text=Z&bg=000&textColor=fff',
  favicon: '',
  salesPageLogo: '',
  appName: 'Z-Prospector'
};

// --- CONFIGURAÇÃO DE CORES POR FASE (MÓDULO) ---
const MODULE_THEME: Record<string, { color: string, activeClass: string, textClass: string, borderClass: string }> = {
  results: { color: 'indigo', activeClass: 'bg-indigo-600 shadow-indigo-500/30', textClass: 'text-indigo-600', borderClass: 'border-indigo-200 dark:border-indigo-800' },
  prospecting: { color: 'rose', activeClass: 'bg-rose-600 shadow-rose-500/30', textClass: 'text-rose-600', borderClass: 'border-rose-200 dark:border-rose-800' },
  inbox: { color: 'violet', activeClass: 'bg-violet-600 shadow-violet-500/30', textClass: 'text-violet-600', borderClass: 'border-violet-200 dark:border-violet-800' },
  scheduling: { color: 'pink', activeClass: 'bg-pink-600 shadow-pink-500/30', textClass: 'text-pink-600', borderClass: 'border-pink-200 dark:border-pink-800' },
  products: { color: 'orange', activeClass: 'bg-orange-600 shadow-orange-500/30', textClass: 'text-orange-600', borderClass: 'border-orange-200 dark:border-orange-800' },
  broadcast: { color: 'cyan', activeClass: 'bg-cyan-600 shadow-cyan-500/30', textClass: 'text-cyan-600', borderClass: 'border-cyan-200 dark:border-cyan-800' },
  capture: { color: 'emerald', activeClass: 'bg-emerald-600 shadow-emerald-500/30', textClass: 'text-emerald-600', borderClass: 'border-emerald-200 dark:border-emerald-800' },
  followup: { color: 'blue', activeClass: 'bg-blue-600 shadow-blue-500/30', textClass: 'text-blue-600', borderClass: 'border-blue-200 dark:border-blue-800' },
  n8n: { color: 'amber', activeClass: 'bg-amber-600 shadow-amber-500/30', textClass: 'text-amber-600', borderClass: 'border-amber-200 dark:border-amber-800' },
  payments: { color: 'teal', activeClass: 'bg-teal-600 shadow-teal-500/30', textClass: 'text-teal-600', borderClass: 'border-teal-200 dark:border-teal-800' },
  admin: { color: 'slate', activeClass: 'bg-slate-700 shadow-slate-500/30', textClass: 'text-slate-600', borderClass: 'border-slate-200 dark:border-slate-800' },
  profile: { color: 'indigo', activeClass: 'bg-indigo-600 shadow-indigo-500/30', textClass: 'text-indigo-600', borderClass: 'border-indigo-200 dark:border-indigo-800' },
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState<AppModule>('results');
  const [performanceMode, setPerformanceMode] = useState(false); // Agora atua como Dark Mode Toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [tenant, setTenant] = useState<Tenant>(INITIAL_TENANT);
  const [branding, setBranding] = useState<BrandingConfig>(INITIAL_BRANDING);
  const [evolutionConfig, setEvolutionConfig] = useState<EvolutionConfig>({ baseUrl: '', apiKey: '', enabled: false });
  const [notifications, setNotifications] = useState<AppNotification[]>([
     { id: 'n1', type: 'SYSTEM', title: 'Bem-vindo ao Z-Prospector', description: 'Sua operação foi iniciada com sucesso.', time: 'Agora', read: false },
     { id: 'n2', type: 'SALE', title: 'Venda Aprovada', description: 'Lead Roberto pagou R$ 1.500,00', time: 'Há 5 min', read: false }
  ]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const currentTheme = MODULE_THEME[activeModule] || MODULE_THEME.results;

  // Sync Dark Mode with Body Class
  useEffect(() => {
    if (performanceMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [performanceMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notify = (msg: string) => {
    const newNotif: AppNotification = {
        id: Math.random().toString(),
        type: 'SYSTEM',
        title: 'Notificação',
        description: msg,
        time: 'Agora',
        read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const menuItems = [
    { id: 'results', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'prospecting', label: 'Kanban CRM', icon: Users },
    { id: 'inbox', label: 'Inbox & IA', icon: MessageSquare },
    { id: 'scheduling', label: 'Agenda', icon: Calendar },
    { id: 'products', label: 'Catálogo', icon: Package },
    { id: 'broadcast', label: 'Disparos', icon: Megaphone },
    { id: 'capture', label: 'Captura', icon: Target },
    { id: 'followup', label: 'Automação', icon: Rocket },
    { id: 'n8n', label: 'N8n Flows', icon: Cloud },
    { id: 'payments', label: 'Financeiro', icon: CreditCard },
    { id: 'admin', label: 'Admin', icon: Settings },
  ];

  if (!isAuthenticated) {
    return (
      <OfferPage 
        branding={branding} 
        onLogin={() => setIsAuthenticated(true)} 
      />
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-500 ${performanceMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* AISearch Modal */}
      <AISearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onNavigate={(mod) => setActiveModule(mod)} 
      />

      {/* Sidebar Dinâmica */}
      <aside className={`flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} ${performanceMode ? 'bg-slate-900 border-r border-slate-800' : 'bg-white border-r border-slate-200'} flex flex-col z-20`}>
        <div className="h-20 flex items-center justify-center border-b border-transparent">
           {isSidebarOpen ? (
             <h1 className="text-xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 cursor-pointer" onClick={() => setActiveModule('results')}>
               {branding.appName}
             </h1>
           ) : (
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg cursor-pointer" onClick={() => setIsSidebarOpen(true)}>
               {branding.appName.charAt(0)}
             </div>
           )}
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 no-scrollbar">
           {menuItems.map(item => {
             const itemTheme = MODULE_THEME[item.id] || MODULE_THEME.results;
             const isActive = activeModule === item.id;
             
             return (
               <button
                 key={item.id}
                 onClick={() => setActiveModule(item.id as AppModule)}
                 className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden ${
                   isActive 
                   ? `${itemTheme.activeClass} text-white` 
                   : performanceMode 
                     ? 'text-slate-400 hover:bg-slate-800 hover:text-white' 
                     : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                 }`}
               >
                  <item.icon size={20} className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'animate-pulse' : ''}`} />
                  {isSidebarOpen && (
                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                  )}
                  {!isSidebarOpen && isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                  )}
               </button>
             );
           })}
        </nav>

        <div className="p-4 border-t border-transparent">
           <button 
             onClick={() => setActiveModule('profile')}
             className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${performanceMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}
           >
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">A</div>
              {isSidebarOpen && (
                <div className="text-left overflow-hidden">
                   <p className="text-xs font-black truncate dark:text-white">Admin Master</p>
                   <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold truncate">Online</p>
                </div>
              )}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header Dinâmico */}
        <header className={`h-20 flex items-center justify-between px-8 z-10 transition-colors ${performanceMode ? 'bg-slate-950/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md'}`}>
           <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-xl transition-all ${performanceMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-indigo-600'}`}>
                 <Menu size={20} />
              </button>
              
              {/* Barra de Busca Dinâmica */}
              <div 
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all w-64 cursor-text border ${
                  performanceMode 
                  ? `bg-slate-900 ${currentTheme.borderClass} text-slate-300` 
                  : `bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300`
                }`} 
                onClick={() => setIsSearchOpen(true)}
              >
                 <Search size={16} className={currentTheme.textClass} />
                 <span className="text-xs font-bold uppercase tracking-widest opacity-70">Buscar com IA...</span>
                 <span className="ml-auto text-[9px] font-black border border-current px-1.5 rounded opacity-50">CTRL+K</span>
              </div>
           </div>

           <div className="flex items-center gap-3 md:gap-6">
             {/* THEME TOGGLE (SIMPLIFICADO) */}
             <button 
               onClick={() => setPerformanceMode(!performanceMode)}
               className={`p-3 rounded-2xl transition-all border hover:scale-105 active:scale-95 ${
                 performanceMode 
                 ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white' 
                 : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900 shadow-sm'
               }`}
               title={performanceMode ? 'Modo Claro' : 'Modo Escuro'}
             >
                {performanceMode ? <Sun size={20} /> : <Moon size={20} />}
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
                   <div className={`absolute right-0 top-full mt-4 w-80 rounded-[2rem] shadow-2xl border p-4 z-50 animate-in slide-in-from-top-2 ${performanceMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                      <div className="flex justify-between items-center mb-4 px-2">
                         <h4 className="text-sm font-black italic uppercase text-slate-800 dark:text-white">Notificações</h4>
                         <button onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))} className="text-[9px] font-bold text-indigo-500 uppercase hover:underline">Ler todas</button>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                         {notifications.length > 0 ? notifications.map(n => (
                           <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.read ? 'opacity-50' : 'opacity-100'} ${performanceMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                              <div className="flex justify-between items-start mb-1">
                                 <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase ${n.type === 'SALE' ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white'}`}>{n.type}</span>
                                 <span className="text-[9px] text-slate-400">{n.time}</span>
                              </div>
                              <p className="text-xs font-bold mt-2 dark:text-slate-200">{n.title}</p>
                              <p className="text-[10px] text-slate-400 leading-tight mt-1">{n.description}</p>
                           </div>
                         )) : (
                            <p className="text-center text-xs text-slate-400 py-4">Sem notificações novas</p>
                         )}
                      </div>
                   </div>
                )}
             </div>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative p-4 md:p-6">
           {activeModule === 'results' && <Dashboard performanceMode={performanceMode} leads={leads} />}
           {activeModule === 'prospecting' && <CRMKanban leads={leads} onLeadsChange={setLeads} notify={notify} onNavigate={setActiveModule} />}
           {activeModule === 'inbox' && (
             <WhatsAppInbox 
               niche={tenant.niche} 
               activeLeads={leads} 
               onSchedule={() => setActiveModule('scheduling')} 
               tenant={tenant}
               evolutionConfig={evolutionConfig}
               notify={notify}
             />
           )}
           {activeModule === 'capture' && <CaptureManagement onAddLead={(l) => { setLeads([l, ...leads]); notify('Lead adicionado!'); }} notify={notify} />}
           {activeModule === 'followup' && <FollowUpAutomation niche={tenant.niche} />}
           {activeModule === 'products' && <ProductManager notify={notify} />}
           {activeModule === 'scheduling' && (
              <ScheduleManager 
                appointments={appointments} 
                onAddAppointment={(a) => { setAppointments([...appointments, a]); notify('Agendado!'); }} 
                onUpdateAppointment={(a) => { setAppointments(appointments.map(app => app.id === a.id ? a : app)); notify('Atualizado!'); }}
                onDeleteAppointment={(id) => { setAppointments(appointments.filter(a => a.id !== id)); notify('Removido!'); }}
              />
           )}
           {activeModule === 'broadcast' && <BroadcastManager leads={leads} isWhatsAppConnected={tenant.instanceStatus === 'CONNECTED'} onNavigate={setActiveModule} notify={notify} />}
           {activeModule === 'n8n' && <N8nManager notify={notify} />}
           {activeModule === 'payments' && <PaymentManager totalVolume={tenant.revenue} pipelineVolume={leads.reduce((acc, l) => acc + (l.value || 0), 0)} />}
           {activeModule === 'admin' && (
             <AdminModule 
               branding={branding} 
               onBrandingChange={setBranding} 
               onNicheChange={(n) => setTenant({...tenant, niche: n})} 
               evolutionConfig={evolutionConfig}
               onEvolutionConfigChange={setEvolutionConfig}
               notify={notify} 
             />
           )}
           {activeModule === 'profile' && (
             <UserProfile 
                user={{ name: 'Admin Master', email: 'admin@clikai.com.br', role: 'Super Admin' }} 
                onUpdate={() => notify('Perfil atualizado')} 
                onLogout={() => setIsAuthenticated(false)} 
                notify={notify}
             />
           )}
        </div>
      </main>
    </div>
  );
}
