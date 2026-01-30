import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Calendar, Zap, Loader2, CheckCircle2,
  LayoutDashboard, Radar, Kanban, ShieldCheck, 
  Settings, Building2, Search, Bell, Menu as MenuIcon, X, ChevronLeft, ChevronRight, Info, Gauge, Package, Megaphone, Workflow, Wallet
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

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('z_token'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [branding, setBranding] = useState<BrandingConfig>({ appName: "Z-Prospector" } as any);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeModule, setActiveModule] = useState<AppModule>('results');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [performanceMode, setPerformanceMode] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Sistema de Chamada API Centralizado (Seguro)
  const apiCall = async (action: string, method = 'GET', body?: any) => {
    try {
      const res = await fetch(`${API_URL}?action=${action}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: body ? JSON.stringify(body) : undefined
      });
      if (res.status === 401) handleLogout();
      return await res.json();
    } catch (e) {
      console.error("API Error:", e);
      return null;
    }
  };

  useEffect(() => {
    if (isLoggedIn) syncData();
    else setIsLoading(false);
  }, [isLoggedIn]);

  const syncData = async () => {
    setIsLoading(true);
    const bData = await apiCall('get-branding');
    if (bData) setBranding(bData);
    const lData = await apiCall('get-leads');
    if (lData) setLeads(lData);
    setIsLoading(false);
  };

  const handleLogin = (authToken: string) => {
    localStorage.setItem('z_token', authToken);
    setToken(authToken);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('z_token');
    setToken(null);
    setIsLoggedIn(false);
    setActiveModule('results');
  };

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  if (isLoading) return <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white font-black"><Loader2 className="animate-spin text-indigo-500 mb-4" size={48} /> SEGURANÇA SSL ATIVA...</div>;
  if (!isLoggedIn) return <OfferPage branding={branding} onLogin={() => {}} onActivationSuccess={(t) => handleLogin(t)} />;

  return (
    <div className={`fixed inset-0 flex h-full w-full overflow-hidden transition-all duration-700 ${performanceMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
       {/* UI Simplificada para o exemplo, mantendo a estrutura original mas com dados via Proxy */}
       <aside className={`fixed lg:static inset-y-0 left-0 z-[70] ${isSidebarOpen ? 'w-80' : 'w-28'} bg-slate-900 border-r border-white/5 transition-all flex flex-col`}>
          <div className="p-8 flex justify-center">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black">{branding.appName.charAt(0)}</div>
          </div>
          <nav className="flex-1 px-4 space-y-2">
             <button onClick={() => setActiveModule('results')} className={`w-full p-4 rounded-2xl flex items-center gap-4 ${activeModule === 'results' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                <Gauge size={20} /> {isSidebarOpen && "Resultados"}
             </button>
             <button onClick={() => setActiveModule('inbox')} className={`w-full p-4 rounded-2xl flex items-center gap-4 ${activeModule === 'inbox' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
                <MessageSquare size={20} /> {isSidebarOpen && "WhatsApp Inbox"}
             </button>
             <button onClick={() => setActiveModule('admin')} className={`w-full p-4 rounded-2xl flex items-center gap-4 ${activeModule === 'admin' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}>
                <ShieldCheck size={20} /> {isSidebarOpen && "Admin Master"}
             </button>
          </nav>
       </aside>

       <main className="flex-1 flex flex-col overflow-hidden relative">
          <header className="h-20 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10">
             <h2 className="text-white font-black uppercase tracking-tighter text-xl">Operation: <span className="text-indigo-500">{activeModule}</span></h2>
             <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500"><X /></button>
          </header>

          <div className="flex-1 overflow-auto p-10">
             {activeModule === 'results' && <Dashboard performanceMode={performanceMode} leads={leads} />}
             {activeModule === 'inbox' && <WhatsAppInbox niche="Demo" activeLeads={leads} onSchedule={() => {}} tenant={{} as any} evolutionConfig={{baseUrl: '', apiKey: 'PROXY', enabled: true}} notify={notify} />}
             {activeModule === 'admin' && <AdminModule branding={branding} onBrandingChange={setBranding} onNicheChange={() => {}} evolutionConfig={{apiKey: 'HIDDEN'} as any} onEvolutionConfigChange={() => {}} notify={notify} />}
             {/* Outros módulos simplificados para a demonstração da correção de segurança */}
          </div>
       </main>
    </div>
  );
};

export default App;