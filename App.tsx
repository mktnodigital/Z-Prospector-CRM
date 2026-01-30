import React, { useState, useEffect } from 'react';
import { OfferPage } from './components/OfferPage';
import { Dashboard } from './components/Dashboard';
import { CaptureManagement } from './components/CaptureManagement';
import { CRMKanban } from './components/CRMKanban';
import { WhatsAppInbox } from './components/WhatsAppInbox';
import { BroadcastManager } from './components/BroadcastManager';
import { AdminModule } from './components/AdminModule';
import { Lead, Tenant, Appointment, EvolutionConfig, BrandingConfig, AppModule } from './types';

const API_URL = '/api/core.php';

const App: React.FC = () => {
  // Real Token Check
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem('z_session_token');
    return !!token && token !== 'active';
  });

  const [activeModule, setActiveModule] = useState<AppModule>('results');
  const [performanceMode, setPerformanceMode] = useState(false);
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const [tenant, setTenant] = useState<Tenant>({
    id: 'demo',
    name: 'Demo Unit',
    niche: 'Geral',
    healthScore: 100,
    revenue: 0,
    activeLeads: 0,
    status: 'ONLINE',
    instanceStatus: 'DISCONNECTED'
  });

  const [branding, setBranding] = useState<BrandingConfig>({
    fullLogo: '',
    fullLogoDark: '',
    iconLogo: '',
    iconLogoDark: '',
    favicon: '',
    salesPageLogo: '',
    appName: 'Z-Prospector'
  });

  const [evolutionConfig, setEvolutionConfig] = useState<EvolutionConfig>({
    baseUrl: '',
    apiKey: '',
    enabled: false
  });

  const [n8nConfig, setN8nConfig] = useState({
    baseUrl: '',
    apiKey: '',
    status: 'DISCONNECTED'
  });

  const notify = (msg: string) => {
    console.log('Notification:', msg);
    // Implementation of toast or notification logic would go here
  };

  // FETCH CORE DATA (Sync Function Secure)
  const syncCoreData = async () => {
    const token = localStorage.getItem('z_session_token');
    if (!token) return;

    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const lRes = await fetch(`${API_URL}?action=get-leads`, { headers });
      if (lRes.ok) {
        const newLeads = await lRes.json();
        if (Array.isArray(newLeads)) setLeads(newLeads);
      }
      
      const tRes = await fetch(`${API_URL}?action=get-current-tenant`, { headers });
      if (tRes.ok) setTenant(await tRes.json());
      
      const aRes = await fetch(`${API_URL}?action=get-appointments`, { headers });
      if (aRes.ok) setAppointments(await aRes.json());

    } catch (e) {
      // Silent fail
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      syncCoreData();
    }
  }, [isLoggedIn]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) return <OfferPage branding={branding} onLogin={handleLoginSuccess} />;

  return (
    <div className={`fixed inset-0 flex h-full w-full overflow-hidden transition-all duration-700 ${performanceMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        {/* ... Sidebar & Main Content ... */}
        <main className="flex-1 flex flex-col overflow-hidden relative z-10">
            {/* ... */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
              <div className="relative z-10 h-full">
                {activeModule === 'results' && <Dashboard performanceMode={performanceMode} leads={leads} />}
                
                {activeModule === 'capture' && <CaptureManagement onAddLead={(l) => setLeads([l, ...leads])} notify={notify} />}
                
                {activeModule === 'prospecting' && (
                    <CRMKanban 
                        leads={leads} 
                        onLeadsChange={setLeads}
                        notify={notify} 
                        onNavigate={setActiveModule} 
                    />
                )}
                
                {activeModule === 'inbox' && (
                    <WhatsAppInbox 
                        niche={tenant.niche}
                        activeLeads={leads}
                        onSchedule={() => setActiveModule('scheduling')}
                        tenant={tenant}
                        evolutionConfig={evolutionConfig}
                        notify={notify}
                        onConnectionChange={async (status) => { 
                           console.log('Connection status:', status);
                        }}
                    />
                )}
                {/* ... Outros módulos ... */}
                {activeModule === 'broadcast' && <BroadcastManager leads={leads} isWhatsAppConnected={tenant.instanceStatus === 'CONNECTED'} onNavigate={setActiveModule} notify={notify} />}
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
              </div>
            </div>
        </main>
    </div>
  );
};

export default App;