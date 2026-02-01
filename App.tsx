
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, MessageSquare, Calendar, 
  Package, Megaphone, Settings, CreditCard, 
  Menu, Bell, Search, Zap, Moon, User,
  LogOut, X, ChevronRight, Activity,
  Target, Rocket, Monitor, CheckCircle, Sun, Sparkles,
  Radar, Workflow
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
  EvolutionConfig, AppNotification, AppModule, LeadStatus, PipelineStage 
} from './types';

// --- DATA MOCKING: LEADS ---
const INITIAL_LEADS: Lead[] = [
  { id: 'l1', name: 'Roberto Silva', phone: '5511999998888', email: 'roberto@gmail.com', status: LeadStatus.HOT, stage: PipelineStage.NEGOTIATION, lastInteraction: 'Interessado no plano anual, pediu desconto à vista.', value: 1500, source: 'Instagram' },
  { id: 'l2', name: 'Julia Martins', phone: '5511988887777', email: 'julia.m@outlook.com', status: LeadStatus.WARM, stage: PipelineStage.QUALIFIED, lastInteraction: 'Pediu apresentação em PDF.', value: 800, source: 'Google Ads' },
  { id: 'l3', name: 'Tech Solutions Ltda', phone: '5511977776666', email: 'contato@techsol.com', status: LeadStatus.COLD, stage: PipelineStage.CONTACTED, lastInteraction: 'Visualizou a proposta, sem resposta há 2 dias.', value: 5000, source: 'Linkedin' },
  { id: 'l4', name: 'Amanda Costa', phone: '5541999887766', email: 'amanda.c@yahoo.com', status: LeadStatus.HOT, stage: PipelineStage.NEW, lastInteraction: 'Entrou via formulário do site agora.', value: 0, source: 'Site Institucional' },
  { id: 'l5', name: 'Dr. Fernando M.', phone: '5521988776655', email: 'fernando@medico.com', status: LeadStatus.WARM, stage: PipelineStage.PROPOSAL, lastInteraction: 'Agendou reunião para discutir escopo.', value: 12000, source: 'Indicação' },
  { id: 'l6', name: 'Cafeteria Central', phone: '5511966554433', email: 'cafe@central.com', status: LeadStatus.COLD, stage: PipelineStage.NEW, lastInteraction: 'Lead frio importado de lista.', value: 0, source: 'Outbound' },
  { id: 'l7', name: 'Pedro Henrique', phone: '5531955443322', email: 'pedro.h@uol.com.br', status: LeadStatus.HOT, stage: PipelineStage.CLOSED, lastInteraction: 'Pagamento confirmado. Onboarding iniciado.', value: 2500, source: 'Facebook Ads' },
  { id: 'l8', name: 'Mariana Luz', phone: '5548944332211', email: 'mari.luz@design.com', status: LeadStatus.WARM, stage: PipelineStage.QUALIFIED, lastInteraction: 'Dúvida sobre integração com N8n.', value: 450, source: 'Instagram' },
  { id: 'l9', name: 'Construtora Alpha', phone: '5511933221100', email: 'comercial@alpha.com', status: LeadStatus.WARM, stage: PipelineStage.NEGOTIATION, lastInteraction: 'Aguardando aprovação da diretoria.', value: 25000, source: 'Google Maps' },
  { id: 'l10', name: 'Lucas Gamer', phone: '5511922110099', email: 'lucas@game.com', status: LeadStatus.COLD, stage: PipelineStage.CONTACTED, lastInteraction: 'Respondeu "não tenho interesse agora".', value: 0, source: 'TikTok' },
  { id: 'l11', name: 'Salão Beleza Pura', phone: '5511911009988', email: 'contato@belezapura.com', status: LeadStatus.HOT, stage: PipelineStage.PROPOSAL, lastInteraction: 'Quer fechar pacote para 5 funcionários.', value: 3000, source: 'WhatsApp' },
  { id: 'l12', name: 'Rafaela Fitness', phone: '5521999887711', email: 'rafa@fit.com', status: LeadStatus.WARM, stage: PipelineStage.QUALIFIED, lastInteraction: 'Perguntou sobre fidelidade.', value: 150, source: 'Instagram' },
];

// --- DATA MOCKING: TENANTS ---
const INITIAL_TENANT_LIST: Tenant[] = [
  {
    id: 'master_01',
    name: 'Z-Prospector HQ (Master)',
    niche: 'SaaS & High Ticket',
    healthScore: 100,
    revenue: 154000,
    activeLeads: 1240,
    status: 'ONLINE',
    instanceStatus: 'CONNECTED',
    salesMode: 'DIRECT'
  },
  {
    id: 'unit_02',
    name: 'Barbearia Viking',
    niche: 'Estética & Beleza',
    healthScore: 92,
    revenue: 45000,
    activeLeads: 320,
    status: 'ONLINE',
    instanceStatus: 'CONNECTED',
    salesMode: 'ASSISTED'
  },
  {
    id: 'unit_03',
    name: 'Solar Energy SP',
    niche: 'Energia Solar',
    healthScore: 85,
    revenue: 320000,
    activeLeads: 58,
    status: 'WARNING',
    instanceStatus: 'DISCONNECTED',
    salesMode: 'ASSISTED'
  },
  {
    id: 'unit_04',
    name: 'Dr. Saúde Clínica',
    niche: 'Saúde & Clínicas',
    healthScore: 98,
    revenue: 89000,
    activeLeads: 450,
    status: 'ONLINE',
    instanceStatus: 'CONNECTED',
    salesMode: 'ASSISTED'
  }
];

// --- DATA MOCKING: APPOINTMENTS ---
const generateAppointments = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  return [
    { id: 'apt_1', lead: 'Roberto Silva', time: '09:00', date: day, month, year, service: 'Reunião de Fechamento', status: 'CONFIRMED', ia: true, value: 0 } as Appointment,
    { id: 'apt_2', lead: 'Julia Martins', time: '14:30', date: day, month, year, service: 'Apresentação Produto', status: 'CONFIRMED', ia: false, value: 0 } as Appointment,
    { id: 'apt_3', lead: 'Amanda Costa', time: '16:00', date: day, month, year, service: 'Onboarding', status: 'PENDING', ia: true, value: 0 } as Appointment,
    { id: 'apt_4', lead: 'Construtora Alpha', time: '10:00', date: day + 1, month, year, service: 'Visita Técnica', status: 'CONFIRMED', ia: false, value: 0 } as Appointment,
    { id: 'apt_5', lead: 'Mariana Luz', time: '11:00', date: day + 1, month, year, service: 'Suporte Técnico', status: 'CONFIRMED', ia: true, value: 0 } as Appointment,
    { id: 'apt_6', lead: 'Dr. Fernando', time: '15:00', date: day + 2, month, year, service: 'Consultoria Premium', status: 'PENDING', ia: false, value: 500 } as Appointment,
  ];
};

const INITIAL_BRANDING: BrandingConfig = {
  fullLogo: 'https://via.placeholder.com/150x40?text=Z-Prospector+Master',
  fullLogoDark: 'https://via.placeholder.com/150x40?text=Z-Prospector+Master&bg=000&textColor=fff',
  iconLogo: 'https://via.placeholder.com/40?text=Z',
  iconLogoDark: 'https://via.placeholder.com/40?text=Z&bg=000&textColor=fff',
  favicon: '',
  salesPageLogo: '',
  appName: 'Z-Prospector'
};

// --- CONFIGURAÇÃO DE CORES POR FASE (MÓDULO) - VIBRANTE ---
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
  const [activeModule, setActiveModule] = useState<AppModule>('results');
  const [performanceMode, setPerformanceMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [allTenants, setAllTenants] = useState<Tenant[]>(INITIAL_TENANT_LIST);
  const [tenant, setTenant] = useState<Tenant>(INITIAL_TENANT_LIST[0]); // Active Tenant
  
  const [branding, setBranding] = useState<BrandingConfig>(INITIAL_BRANDING);
  const [evolutionConfig, setEvolutionConfig] = useState<EvolutionConfig>({ baseUrl: 'https://api.clikai.com.br/', apiKey: '', enabled: false });
  const [notifications, setNotifications] = useState<AppNotification[]>([
     { id: 'n1', type: 'SYSTEM', title: 'Acesso Owner Liberado', description: 'Todos os módulos ativados para moisescosta.mkt@gmail.com', time: 'Agora', read: false },
     { id: 'n2', type: 'SALE', title: 'Venda Aprovada', description: 'Lead Roberto pagou R$ 1.500,00', time: 'Há 5 min', read: false },
     { id: 'n3', type: 'APPOINTMENT', title: 'Novo Agendamento', description: 'Julia Martins confirmou para amanhã.', time: 'Há 30 min', read: false }
  ]);
  
  // Inicializa com dados gerados dinamicamente para o mês atual
  const [appointments, setAppointments] = useState<Appointment[]>(generateAppointments());

  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const currentTheme = MODULE_THEME[activeModule] || MODULE_THEME.results;

  // Carregar dados reais da API ao iniciar
  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        const loadedLeads = await api.getLeads();
        if (loadedLeads.length > 0) setLeads(loadedLeads);
        
        const loadedBranding = await api.getBranding();
        if (loadedBranding) setBranding(loadedBranding);

        const loadedAppts = await api.getAppointments();
        if (loadedAppts.length > 0) setAppointments(loadedAppts);
      };
      loadData();
    }
  }, [isAuthenticated]);

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

  // --- MULTI-TENANT MANAGEMENT FUNCTIONS ---
  const handleAddTenant = (newTenant: Tenant) => {
    setAllTenants([...allTenants, newTenant]);
  };

  const handleUpdateTenant = (updatedTenant: Tenant) => {
    setAllTenants(prev => prev.map(t => t.id === updatedTenant.id ? updatedTenant : t));
    // If updating the currently active tenant, update it immediately
    if (tenant.id === updatedTenant.id) {
      setTenant(updatedTenant);
    }
  };

  const handleDeleteTenant = (id: string) => {
    setAllTenants(prev => prev.filter(t => t.id !== id));
  };

  const handleSwitchTenant = (targetTenant: Tenant) => {
    setTenant(targetTenant);
    notify(`Painel alternado para: ${targetTenant.name}`);
    setActiveModule('results'); // Reset to Dashboard on switch
  };

  // --- ORQUESTRAÇÃO GLOBAL DE AUTOMATIZAÇÃO ---
  // Função que conecta Venda (Payment) -> Agenda (Schedule) -> Notificação (Whatsapp)
  const handleAutomatedSale = (amount: number, method: 'PIX' | 'CREDIT_CARD') => {
    // 1. Atualizar Receita
    const newRevenue = tenant.revenue + amount;
    const updatedTenant = { ...tenant, revenue: newRevenue };
    setTenant(updatedTenant);
    handleUpdateTenant(updatedTenant); // Update in list

    // 2. Criar Agendamento Automático (Simulação)
    const newAppt: Appointment = {
      id: `auto_${Date.now()}`,
      lead: 'Cliente Webhook (Auto)',
      time: '14:00', // Mock: Next available slot
      date: new Date().getDate(),
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      service: tenant.salesMode === 'ASSISTED' ? 'Consultoria Premium' : 'Entrega Produto',
      serviceId: 'auto',
      status: 'CONFIRMED',
      ia: true, // Marcado como IA/Automático
      value: amount,
      paymentMethod: method
    };
    setAppointments(prev => [...prev, newAppt]);
    
    // Persistir via API
    api.saveAppointment(newAppt);

    // 3. Notificar Sistema e "Enviar WhatsApp"
    const notifTitle = tenant.salesMode === 'ASSISTED' ? 'Agenda Bloqueada (Pago)' : 'Venda Realizada';
    
    // Simula envio de WhatsApp
    setTimeout(() => {
        notify(`WhatsApp de confirmação enviado para o cliente (${method})`);
    }, 1000);

    const newNotif: AppNotification = {
      id: Math.random().toString(),
      type: 'SALE',
      title: notifTitle,
      description: `Recebido R$ ${amount} via ${method}. Auto-agendado.`,
      time: 'Agora',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Menu Items Dinâmicos baseados no Modo de Venda
  const menuItems = useMemo(() => {
    const baseItems = [
      { id: 'results', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'capture', label: 'Captação IA', icon: Radar }, // ATIVADO: Scraper
      { id: 'prospecting', label: 'Kanban CRM', icon: Users }, // ATIVADO: Separação Térmica
      { id: 'inbox', label: 'Inbox & IA', icon: MessageSquare }, // ATIVADO: WhatsApp
      { id: 'scheduling', label: 'Agenda', icon: Calendar }, // ATIVADO: Agendamento
      { id: 'automation', label: 'Fluxos & Bots', icon: Workflow }, // ATIVADO: Follow-up Automático
      { id: 'broadcast', label: 'Disparos', icon: Megaphone }, // ATIVADO: Notificações em Massa
      { id: 'concierge', label: 'Concierge', icon: Sparkles },
      { id: 'payments', label: 'Financeiro', icon: CreditCard },
      { id: 'admin', label: 'Configurações', icon: Settings },
    ];

    if (tenant.salesMode === 'DIRECT') {
      // Modo 1: Venda Direta -> Inserir Catálogo antes de Disparos
      baseItems.splice(6, 0, { id: 'products', label: 'Catálogo', icon: Package });
    }
    // Modo 2: Venda Assistida -> Sem produto (remove catálogo, mantém o resto)

    return baseItems;
  }, [tenant.salesMode]);

  if (!isAuthenticated) {
    return (
      <OfferPage 
        branding={branding} 
        onLogin={() => setIsAuthenticated(true)} 
      />
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden transition-all duration-500 ${performanceMode ? 'bg-slate-950 text-slate-100' : 'bg-gradient-to-br from-indigo-50/40 via-white to-cyan-50/40 text-slate-900'}`}>
      
      {/* AISearch Modal */}
      <AISearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onNavigate={(mod) => setActiveModule(mod)} 
      />

      {/* Sidebar Dinâmica */}
      <aside className={`flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} ${performanceMode ? 'bg-slate-900 border-r border-slate-800' : 'bg-white/80 backdrop-blur-xl border-r border-white/50'} flex flex-col z-20 shadow-xl shadow-indigo-100/20 dark:shadow-none`}>
        <div className="h-24 flex items-center justify-center border-b border-transparent">
           {isSidebarOpen ? (
             <h1 className="text-xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 cursor-pointer drop-shadow-sm truncate max-w-[200px]" onClick={() => setActiveModule('results')}>
               {tenant.name}
             </h1>
           ) : (
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-indigo-500/30 cursor-pointer" onClick={() => setIsSidebarOpen(true)}>
               {tenant.name.charAt(0)}
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
                     : `text-slate-500 hover:${itemTheme.lightBg} hover:${itemTheme.textClass}`
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
             className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${performanceMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white shadow-md border border-slate-100 hover:bg-slate-50'}`}
           >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-lg">MC</div>
              {isSidebarOpen && (
                <div className="text-left overflow-hidden">
                   <p className="text-xs font-black truncate dark:text-white text-slate-800">Moisés Costa</p>
                   <p className="text-[9px] text-emerald-500 uppercase font-bold truncate">
                     CEO & Founder
                   </p>
                </div>
              )}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header Dinâmico */}
        <header className={`h-20 flex items-center justify-between px-8 z-10 transition-colors ${performanceMode ? 'bg-slate-950/80 backdrop-blur-md' : 'bg-white/60 backdrop-blur-md'}`}>
           <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-xl transition-all ${performanceMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-indigo-600'}`}>
                 <Menu size={20} />
              </button>
              
              {/* Barra de Busca Dinâmica */}
              <div 
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all w-64 cursor-text border ${
                  performanceMode 
                  ? `bg-slate-900 ${currentTheme.borderClass} text-slate-300` 
                  : `bg-white border-slate-200 text-slate-500 hover:border-indigo-300 shadow-sm`
                }`} 
                onClick={() => setIsSearchOpen(true)}
              >
                 <Search size={16} className={currentTheme.textClass} />
                 <span className="text-xs font-bold uppercase tracking-widest opacity-70">Buscar com IA...</span>
                 <span className="ml-auto text-[9px] font-black border border-current px-1.5 rounded opacity-50">CTRL+K</span>
              </div>
           </div>

           <div className="flex items-center gap-3 md:gap-6">
             {/* THEME TOGGLE */}
             <button 
               onClick={() => setPerformanceMode(!performanceMode)}
               className={`p-3 rounded-2xl transition-all border hover:scale-105 active:scale-95 ${
                 performanceMode 
                 ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white' 
                 : 'bg-white border-slate-200 text-slate-400 hover:text-orange-500 shadow-sm'
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
           {activeModule === 'results' && <Dashboard performanceMode={performanceMode} leads={leads} tenant={tenant} />}
           {activeModule === 'capture' && <CaptureManagement onAddLead={(l) => { setLeads([l, ...leads]); notify('Novo Lead Capturado!'); api.saveLead(l); }} notify={notify} />}
           {activeModule === 'prospecting' && <CRMKanban leads={leads} onLeadsChange={(l) => { setLeads(l); api.saveLead(l[0]); }} notify={notify} onNavigate={setActiveModule} />}
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
           {activeModule === 'products' && tenant.salesMode === 'DIRECT' && <ProductManager notify={notify} />}
           {activeModule === 'concierge' && <ConciergeService notify={notify} />}
           {activeModule === 'scheduling' && (
              <ScheduleManager 
                appointments={appointments} 
                onAddAppointment={(a) => { setAppointments([...appointments, a]); notify('Agendado!'); api.saveAppointment(a); }} 
                onUpdateAppointment={(a) => { setAppointments(appointments.map(app => app.id === a.id ? a : app)); notify('Atualizado!'); }}
                onDeleteAppointment={(id) => { setAppointments(appointments.filter(a => a.id !== id)); notify('Removido!'); }}
              />
           )}
           {activeModule === 'automation' && <FollowUpAutomation niche={tenant.niche} />}
           {activeModule === 'broadcast' && <BroadcastManager leads={leads} isWhatsAppConnected={tenant.instanceStatus === 'CONNECTED'} onNavigate={setActiveModule} notify={notify} />}
           {activeModule === 'payments' && (
             <PaymentManager 
               totalVolume={tenant.revenue} 
               pipelineVolume={leads.reduce((acc, l) => acc + (l.value || 0), 0)}
               onSimulateIncomingTransaction={handleAutomatedSale}
             />
           )}
           {activeModule === 'admin' && (
             <AdminModule 
               tenant={tenant}
               onTenantChange={(t) => { setTenant(t); handleUpdateTenant(t); }}
               // Passando props de Multi-Empresa
               allTenants={allTenants}
               onAddTenant={handleAddTenant}
               onUpdateTenant={handleUpdateTenant}
               onDeleteTenant={handleDeleteTenant}
               onSwitchTenant={handleSwitchTenant}
               // ---
               branding={branding} 
               onBrandingChange={(b) => { setBranding(b); api.saveBranding(b); }}
               onNicheChange={(n) => { const updated = {...tenant, niche: n}; setTenant(updated); handleUpdateTenant(updated); }} 
               evolutionConfig={evolutionConfig}
               onEvolutionConfigChange={setEvolutionConfig}
               notify={notify} 
             />
           )}
           {activeModule === 'profile' && (
             <UserProfile 
                user={{ 
                  name: 'Moisés Costa', 
                  email: 'moisescosta.mkt@gmail.com', 
                  role: 'CEO & Founder (Global Admin)' 
                }} 
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
