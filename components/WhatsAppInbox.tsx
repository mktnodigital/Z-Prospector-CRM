
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, Paperclip, Smile, CheckCheck, 
  MessageSquare, Sparkles, Bot, Loader2, 
  Smartphone, QrCode, AlertCircle, ShieldCheck, RefreshCcw,
  Terminal, CheckCircle2, Wifi, Zap, X, Copy, Cpu, SmartphoneIcon,
  CreditCard, Landmark, Building2, ChevronRight, Activity, Database,
  MoreVertical, User, Calendar, Brain, Flame, Lock, Mic, Image as ImageIcon, Play, Settings
} from 'lucide-react';
import { Lead, Appointment, Tenant, EvolutionConfig } from '../types';

interface Message {
  id: string;
  sender: 'me' | 'lead' | 'ai';
  text: string;
  type?: 'text' | 'image' | 'audio';
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface WhatsAppInboxProps {
  niche: string;
  activeLeads: Lead[];
  onSchedule: (appt: Appointment) => void;
  tenant: Tenant;
  evolutionConfig: EvolutionConfig;
  notify: (msg: string) => void;
  onConnectionChange?: (status: boolean) => void;
  onEvolutionConfigChange?: (config: EvolutionConfig) => void;
}

const API_URL = '/api/core.php';

export const WhatsAppInbox: React.FC<WhatsAppInboxProps> = ({ niche, activeLeads, onSchedule, tenant, evolutionConfig, notify, onConnectionChange, onEvolutionConfigChange }) => {
  const [activeChat, setActiveChat] = useState<Lead | null>(activeLeads[0] || null);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [connStatus, setConnStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>(tenant.instanceStatus === 'CONNECTED' ? 'CONNECTED' : 'DISCONNECTED');
  const [instanceName] = useState(`master_${tenant.id}`);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provisioningLogs, setProvisioningLogs] = useState<string[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  
  // State para configuração rápida de API Key
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id, true);
      const interval = setInterval(() => {
        if (document.visibilityState === 'visible') fetchMessages(activeChat.id, false);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  const fetchMessages = async (leadId: string, showLoading = false) => {
    if (showLoading) setIsLoadingMessages(true);
    try {
      const res = await fetch(`${API_URL}?action=get-messages&lead_id=${leadId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.length !== data.length ? data : prev);
      }
    } catch (e) { console.error("Polling skipped"); }
    finally { if (showLoading) setIsLoadingMessages(false); }
  };

  const addLog = (msg: string) => setProvisioningLogs(prev => [...prev.slice(-10), `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleStartConnection = async () => {
    if (!evolutionConfig.apiKey) {
        addLog("ERR: API Key não encontrada no cluster.");
        setShowApiSetup(true);
        return;
    }

    setIsConnecting(true);
    setProvisioningLogs([]);
    setQrCode(null);
    const baseUrl = evolutionConfig.baseUrl.replace(/\/$/, '');
    const apiKey = evolutionConfig.apiKey;

    addLog(`INIT: Conectando a api.clikai.com.br...`);
    
    try {
      addLog(`CHECK: Buscando instância "${instanceName}"...`);
      const fetchRes = await fetch(`${baseUrl}/instance/fetchInstances`, { headers: { 'apikey': apiKey } });
      
      if (fetchRes.ok) {
          const instances = await fetchRes.json();
          const list = Array.isArray(instances) ? instances : (instances.data || []);
          const exists = list.find((i: any) => i.name === instanceName || i.instance?.instanceName === instanceName);
          if (exists && (exists.status === 'open' || exists.instance?.state === 'open')) {
              addLog(`SUCCESS: Já conectada.`);
              setConnStatus('CONNECTED');
              if (onConnectionChange) onConnectionChange(true);
              return;
          }
      }

      addLog(`NODE: Gerando célula de pareamento...`);
      const createRes = await fetch(`${baseUrl}/instance/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
          body: JSON.stringify({ instanceName, qrcode: true, integration: 'WHATSAPP-BAILEYS' })
      });

      const createData = await createRes.json();
      let qrData = createData.qrcode?.base64 || createData.base64 || createData.code;

      if (!qrData) {
          const connectRes = await fetch(`${baseUrl}/instance/connect/${instanceName}`, { headers: { 'apikey': apiKey } });
          const connectData = await connectRes.json();
          qrData = connectData.base64 || connectData.qrcode?.base64;
      }

      if (qrData) {
        setQrCode(qrData.startsWith('data:image') ? qrData : `data:image/png;base64,${qrData}`);
        addLog(`READY: Escaneie o QR Code para ativar.`);
      } else {
        addLog(`SUCCESS: Conectado automaticamente.`);
        setConnStatus('CONNECTED');
        if (onConnectionChange) onConnectionChange(true);
      }
    } catch (err: any) {
      addLog(`FATAL: ${err.message}`);
    } finally { setIsConnecting(false); }
  };

  const handleSaveQuickApi = async () => {
      if (!tempApiKey.trim()) return;
      const newConfig = { ...evolutionConfig, apiKey: tempApiKey.trim() };
      if (onEvolutionConfigChange) onEvolutionConfigChange(newConfig);
      
      try {
          await fetch(`${API_URL}?action=save-integration`, {
              method: 'POST',
              body: JSON.stringify({ id: 'sys_evolution', provider: 'SYSTEM_EVOLUTION', name: newConfig.baseUrl, keys: { apiKey: newConfig.apiKey }, status: 'CONNECTED' })
          });
          notify("API Key salva! Tentando conexão...");
          setShowApiSetup(false);
          // Auto-retry connection after a brief delay for state sync
          setTimeout(() => handleStartConnection(), 500);
      } catch (e) { notify("Erro ao salvar chave."); }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 overflow-hidden relative">
      {/* MODAL SETUP RÁPIDO API */}
      {showApiSetup && (
        <div className="absolute inset-0 z-[250] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] max-w-md w-full shadow-2xl relative">
              <button onClick={() => setShowApiSetup(false)} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white"><X size={20}/></button>
              <div className="text-center mb-8">
                 <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg"><Settings size={32}/></div>
                 <h3 className="text-xl font-black text-white uppercase italic">Setup de Gateway</h3>
                 <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Insira sua Master API Key do Clikai</p>
              </div>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest px-2">Global API Key</label>
                    <input 
                       type="password"
                       value={tempApiKey} 
                       onChange={e => setTempApiKey(e.target.value)} 
                       placeholder="Cole sua chave aqui..." 
                       className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-mono text-xs focus:ring-2 ring-indigo-500 outline-none"
                    />
                 </div>
                 <button onClick={handleSaveQuickApi} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs rounded-2xl transition-all shadow-xl">
                    Salvar e Conectar
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* TELA DE CONEXÃO (QR CODE) */}
      {connStatus !== 'CONNECTED' && (
        <div className="absolute inset-0 z-[100] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-8">
           <div className="max-w-5xl w-full bg-slate-900 rounded-[4rem] border border-white/10 overflow-hidden flex flex-col md:flex-row min-h-[600px] shadow-2xl">
              <div className="w-full md:w-5/12 p-12 bg-slate-900/50 border-r border-slate-800 flex flex-col justify-between">
                 <div className="space-y-8">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-indigo-600 rounded-xl text-white"><Cpu size={24}/></div>
                       <div><h3 className="text-xl font-black italic uppercase text-white">Core Engine</h3><p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">clikai.com.br</p></div>
                    </div>
                    <div className="bg-slate-950 rounded-[2rem] p-8 font-mono text-[10px] text-emerald-400 h-72 overflow-y-auto no-scrollbar border border-white/5">
                       <p className="text-emerald-500/40 mb-4 uppercase"><Terminal size={12} className="inline mr-2"/> Logs do Sistema</p>
                       {provisioningLogs.map((log, i) => <p key={i} className="mb-1">{log}</p>)}
                    </div>
                 </div>
                 <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700"><p className="text-[8px] font-black text-slate-400 uppercase">Instância</p><p className="text-[11px] font-black uppercase italic text-white">{instanceName}</p></div>
              </div>
              <div className="flex-1 p-16 flex flex-col items-center justify-center text-center bg-slate-900">
                 {!qrCode ? (
                    <div className="space-y-10 animate-in slide-in-from-right-4">
                       <div><h2 className="text-5xl font-black italic uppercase text-white leading-none">Ativar <span className="text-indigo-500">WhatsApp</span></h2><p className="text-sm font-bold text-slate-400 uppercase mt-4">Conecte sua conta para iniciar o motor de vendas.</p></div>
                       <div className="flex flex-col gap-4">
                          <button onClick={handleStartConnection} disabled={isConnecting} className="w-full py-10 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-2xl hover:bg-indigo-700 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-4 disabled:opacity-50">
                             {isConnecting ? <Loader2 className="animate-spin" size={32} /> : <Zap size={28} />} {isConnecting ? 'Aguardando...' : 'Gerar QR Code Master'}
                          </button>
                          <button onClick={() => setShowApiSetup(true)} className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest underline flex items-center justify-center gap-2"><Settings size={12}/> Configurar API Key</button>
                       </div>
                    </div>
                 ) : (
                    <div className="space-y-10 animate-in zoom-in-95">
                       <div><h3 className="text-3xl font-black italic text-white uppercase">Aguardando Scan</h3><p className="text-[10px] font-black text-slate-400 uppercase mt-2">WhatsApp > Aparelhos Conectados > Conectar</p></div>
                       <div className="w-80 h-80 bg-white rounded-[4rem] shadow-2xl flex items-center justify-center border-[12px] border-slate-800 relative z-10 overflow-hidden">
                          <img src={qrCode} alt="Scan QR" className="w-64 h-64 object-contain animate-in fade-in" />
                       </div>
                       <button onClick={handleStartConnection} className="py-5 px-10 bg-slate-800 border-2 border-slate-700 text-white rounded-[1.8rem] font-black uppercase text-[10px] hover:border-indigo-600 transition-all flex items-center gap-3"><RefreshCcw size={16}/> Recarregar QR</button>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* CHAT INTERFACE (Simplificada para foco no fix) */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-96 flex flex-col border-r border-slate-800 bg-slate-900/50">
          <div className="p-8"><h2 className="text-2xl font-black italic uppercase text-white flex items-center gap-4"><MessageSquare className="text-indigo-500" /> Conversas</h2></div>
          <div className="flex-1 overflow-y-auto px-4 space-y-1">
            {activeLeads.map(chat => (
              <div key={chat.id} onClick={() => setActiveChat(chat)} className={`p-6 rounded-3xl flex items-center gap-4 cursor-pointer border ${activeChat?.id === chat.id ? 'bg-slate-800 border-indigo-500/30 shadow-xl' : 'border-transparent hover:bg-slate-800/50'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${activeChat?.id === chat.id ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-500'}`}>{chat.name.charAt(0)}</div>
                <div className="flex-1 min-w-0"><h4 className={`text-sm font-black truncate uppercase ${activeChat?.id === chat.id ? 'text-indigo-400' : 'text-slate-200'}`}>{chat.name}</h4><p className="text-[10px] text-slate-500 truncate">{chat.lastInteraction}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-slate-950">
          {activeChat ? (
            <div className="flex-1 flex flex-col">
              <div className="h-24 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-10"><h3 className="text-xl font-black italic uppercase text-white">{activeChat.name}</h3><button className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase">Agendar</button></div>
              <div className="flex-1 overflow-y-auto p-10 space-y-4 custom-scrollbar">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'lead' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl ${msg.sender === 'lead' ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'}`}><p className="text-sm">{msg.text}</p></div>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-slate-900 border-t border-slate-800 flex gap-4">
                <input value={messageInput} onChange={e => setMessageInput(e.target.value)} placeholder="Digite aqui..." className="flex-1 bg-slate-800 border-none rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 ring-indigo-500/50" />
                <button onClick={() => setMessageInput('')} className="p-4 bg-indigo-600 text-white rounded-2xl"><Send size={20}/></button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-600 uppercase font-black italic opacity-20">Selecione uma Oportunidade</div>
          )}
        </div>
      </div>
    </div>
  );
};
