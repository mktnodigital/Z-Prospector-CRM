
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, Paperclip, Smile, CheckCheck, 
  MessageSquare, Sparkles, Bot, Loader2, 
  Smartphone, QrCode, AlertCircle, ShieldCheck, RefreshCcw,
  Terminal, CheckCircle2, Wifi, Zap, X, Copy, Cpu, SmartphoneIcon,
  CreditCard, Landmark, Building2, ChevronRight, Activity, Database,
  MoreVertical, User, Calendar
} from 'lucide-react';
import { Lead, Appointment, Tenant, EvolutionConfig } from '../types';

interface Message {
  id: string;
  sender: 'me' | 'lead' | 'ai';
  text: string;
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
}

export const WhatsAppInbox: React.FC<WhatsAppInboxProps> = ({ niche, activeLeads, onSchedule, tenant, evolutionConfig, notify, onConnectionChange }) => {
  const [activeChat, setActiveChat] = useState<Lead | null>(activeLeads[0] || null);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const [connStatus, setConnStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>(
    tenant.instanceStatus === 'CONNECTED' ? 'CONNECTED' : 'DISCONNECTED'
  );
  
  const [instanceName] = useState(`master_${tenant.id}`);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provisioningLogs, setProvisioningLogs] = useState<string[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isInstanceCreated, setIsInstanceCreated] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});

  // Efeito para Scroll Automático
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistories, activeChat]);

  // Populando Histórico Fake para os Leads se estiver vazio
  useEffect(() => {
    if (activeLeads.length > 0 && Object.keys(chatHistories).length === 0) {
      const initialHistory: Record<string, Message[]> = {};
      activeLeads.forEach(lead => {
        initialHistory[lead.id] = [
          { id: '1', sender: 'lead', text: `Olá, vi o anúncio da ${niche} e gostaria de saber mais.`, time: '10:00' },
          { id: '2', sender: 'ai', text: `Olá ${lead.name}! Que prazer atender você. A nossa unidade Master está com condições especiais hoje. Como posso te ajudar agora?`, time: '10:01' }
        ];
      });
      setChatHistories(initialHistory);
    }
  }, [activeLeads, niche]);

  const handleConnectionSuccess = () => {
    setConnStatus('CONNECTED');
    setShowSuccessOverlay(true);
    if (onConnectionChange) onConnectionChange(true);
    notify('WhatsApp Conectado com Sucesso!');
    setTimeout(() => setShowSuccessOverlay(false), 3000);
  };

  const addLog = (msg: string) => {
    setProvisioningLogs(prev => [...prev.slice(-12), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleStartConnection = async () => {
    setIsConnecting(true);
    setProvisioningLogs([]);
    setQrCode(null);
    setIsInstanceCreated(false);

    addLog(`INIT: Conectando ao Cluster Evolution v2...`);
    
    try {
      addLog(`CHECK: Validando instância "${instanceName}"...`);
      const fetchRes = await fetch(`${evolutionConfig.baseUrl}/instance/fetchInstances`, {
        headers: { 'apikey': evolutionConfig.apiKey }
      });
      const instances = await fetchRes.json();
      const instanceExists = Array.isArray(instances) && instances.some((i: any) => i.instanceName === instanceName);

      if (!instanceExists) {
        addLog(`NODE: Provisionando nova célula de socket...`);
        const createRes = await fetch(`${evolutionConfig.baseUrl}/instance/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': evolutionConfig.apiKey },
          body: JSON.stringify({ instanceName, qrcode: true })
        });
        if (createRes.ok) addLog(`SUCCESS: Instância criada.`);
      } else {
        addLog(`INFO: Instância já existente. Reutilizando node...`);
      }

      setIsInstanceCreated(true);
      await new Promise(r => setTimeout(r, 2000));

      addLog(`SYNC: Solicitando QR Code...`);
      const connectRes = await fetch(`${evolutionConfig.baseUrl}/instance/connect/${instanceName}`, { 
        method: 'GET', 
        headers: { 'apikey': evolutionConfig.apiKey } 
      });
      
      const connectData = await connectRes.json();
      const qrBase64 = connectData.base64 || connectData.qrcode?.base64 || (connectData.code && connectData.code.length > 100 ? connectData.code : null);

      if (qrBase64) {
        setQrCode(qrBase64.startsWith('data:image') ? qrBase64 : `data:image/png;base64,${qrBase64}`);
        addLog(`READY: QR Code gerado.`);
      } else if (connectData.instance?.state === 'open' || connectData.status === 'CONNECTED') {
        handleConnectionSuccess();
      }
    } catch (err: any) {
      addLog(`FATAL: Erro HTTP.`);
      notify('Erro ao conectar.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSendMessage = () => {
    if (!activeChat || !messageInput.trim()) return;

    setIsSending(true);
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'me',
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setChatHistories(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage]
    }));
    
    setMessageInput('');
    setTimeout(() => setIsSending(false), 400);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-955 overflow-hidden relative">
      
      {showSuccessOverlay && (
        <div className="absolute inset-0 z-[200] bg-emerald-600 flex flex-col items-center justify-center text-white animate-in fade-in duration-700">
           <div className="p-10 bg-white/20 rounded-full animate-bounce mb-8">
              <CheckCircle2 size={120} />
           </div>
           <h2 className="text-6xl font-black italic uppercase tracking-tighter">Conectado!</h2>
           <p className="text-xl font-bold uppercase tracking-[0.4em] opacity-80 mt-4">Interface de Conversas Liberada...</p>
        </div>
      )}

      {connStatus !== 'CONNECTED' && (
        <div className="absolute inset-0 z-[100] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in">
           <div className="max-w-5xl w-full bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
              
              <div className="w-full md:w-5/12 p-12 bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                 <div className="space-y-8">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Cpu size={24}/></div>
                       <div>
                          <h3 className="text-xl font-black italic uppercase tracking-tight">Core Engine</h3>
                          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">api.clikai.com.br</p>
                       </div>
                    </div>

                    <div className="bg-slate-950 rounded-[2rem] p-8 font-mono text-[10px] text-emerald-400 shadow-inner h-72 overflow-y-auto no-scrollbar border border-white/5">
                       <p className="text-emerald-500/40 mb-4 flex items-center gap-2 font-black uppercase"><Terminal size={12}/> System Terminal</p>
                       {provisioningLogs.map((log, i) => (
                         <p key={i} className="mb-1 animate-in slide-in-from-left-2">{log}</p>
                       ))}
                       {isConnecting && <p className="animate-pulse text-emerald-500">_</p>}
                    </div>
                 </div>

                 <div className="flex items-center gap-4 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><SmartphoneIcon size={20}/></div>
                    <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase">Instância Vinculada</p>
                       <p className="text-[11px] font-black uppercase italic truncate max-w-[150px]">{instanceName}</p>
                    </div>
                 </div>
              </div>

              <div className="flex-1 p-16 flex flex-col items-center justify-center text-center relative bg-white dark:bg-slate-900">
                 {!qrCode ? (
                    <div className="space-y-10 animate-in slide-in-from-right-4">
                       <div className="space-y-4">
                          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white leading-none">Vincular <br/><span className="text-indigo-600">WhatsApp</span></h2>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed italic max-w-sm mx-auto">Sua unidade master precisa de uma conexão ativa para iniciar o atendimento via IA.</p>
                       </div>

                       <button 
                         onClick={handleStartConnection}
                         disabled={isConnecting}
                         className="w-full py-10 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(79,70,229,0.5)] hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-4 group disabled:opacity-50"
                       >
                          {isConnecting ? <Loader2 className="animate-spin" size={32} /> : <Zap size={28} className="group-hover:rotate-12 transition-transform" />}
                          {isConnecting ? 'Provisionando...' : 'Gerar QR Code Master'}
                       </button>

                       <button 
                         onClick={() => setConnStatus('CONNECTED')}
                         className="text-[9px] font-black uppercase text-indigo-500 hover:underline tracking-widest"
                       >
                         Ignorar e Ver Interface (Dev Mode)
                       </button>
                    </div>
                 ) : (
                    <div className="space-y-10 animate-in zoom-in-95">
                       <div className="space-y-2">
                          <h3 className="text-3xl font-black italic uppercase tracking-tight text-slate-800 dark:text-white">Aguardando Scan</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Abra o WhatsApp > Aparelhos Conectados > Conectar</p>
                       </div>

                       <div className="relative group">
                          <div className="absolute -inset-6 bg-indigo-600/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="w-80 h-80 bg-white rounded-[4rem] shadow-2xl flex items-center justify-center border-[12px] border-slate-50 dark:border-slate-800 relative z-10 overflow-hidden">
                             <img src={qrCode} alt="Scan QR" className="w-64 h-64 object-contain animate-in fade-in duration-700" />
                          </div>
                       </div>

                       <div className="flex gap-4">
                          <button onClick={handleStartConnection} className="flex-1 py-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest hover:border-indigo-600 transition-all shadow-sm flex items-center justify-center gap-3">
                             <RefreshCcw size={16} /> Novo QR
                          </button>
                          <button onClick={() => { setIsInstanceCreated(false); setQrCode(null); }} className="px-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest hover:text-rose-500 transition-all">Sair</button>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* CHAT INTERFACE COMPLETA */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LISTA DE CONVERSAS */}
        <div className="w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
          <div className="p-8 pb-4">
            <h2 className="text-2xl font-black tracking-tight italic uppercase mb-8 flex items-center gap-4 text-slate-800 dark:text-white">
               <MessageSquare className="text-indigo-600" /> Inbox IA
            </h2>
            <div className="relative mb-6">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Filtrar conversas..." className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none shadow-sm focus:ring-4 ring-indigo-500/5 transition-all" />
            </div>
            
            <div className="flex gap-2">
               <button className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg">Todos</button>
               <button className="flex-1 py-2 bg-white dark:bg-slate-800 text-slate-400 rounded-xl text-[8px] font-black uppercase tracking-widest hover:text-indigo-600 transition-all shadow-sm">Não Lidos</button>
               <button className="flex-1 py-2 bg-white dark:bg-slate-800 text-slate-400 rounded-xl text-[8px] font-black uppercase tracking-widest hover:text-indigo-600 transition-all shadow-sm">IA Ativa</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pt-4 pb-10 space-y-1 px-4">
            {activeLeads.length > 0 ? activeLeads.map((chat) => {
              const lastMsg = chatHistories[chat.id]?.[chatHistories[chat.id].length - 1];
              return (
                <div 
                  key={chat.id} 
                  onClick={() => setActiveChat(chat)} 
                  className={`p-6 rounded-3xl flex items-center gap-4 cursor-pointer transition-all relative group ${activeChat?.id === chat.id ? 'bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700' : 'hover:bg-slate-100/50'}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner transition-transform group-hover:scale-105 ${activeChat?.id === chat.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                    {chat.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`text-sm font-black truncate uppercase tracking-tight ${activeChat?.id === chat.id ? 'text-indigo-600' : 'text-slate-800 dark:text-slate-200'}`}>{chat.name}</h4>
                      <span className="text-[8px] font-black text-slate-400 uppercase">{lastMsg?.time || 'Agora'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold truncate tracking-widest italic opacity-70">
                       {lastMsg?.sender === 'ai' && <Bot size={10} className="inline mr-1 text-indigo-500"/>}
                       {lastMsg?.text || 'Sem mensagens recentes'}
                    </p>
                  </div>
                  {activeChat?.id === chat.id && <div className="w-1.5 h-10 bg-indigo-600 rounded-full absolute left-0 shadow-lg"></div>}
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-20 grayscale scale-75">
                 <Database size={48} className="mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma Conversa</p>
              </div>
            )}
          </div>
        </div>

        {/* ÁREA DE MENSAGENS */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-955 relative">
          {activeChat ? (
            <>
              <div className="h-28 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-10 z-20 shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-xl border-2 border-white dark:border-slate-800">{activeChat.name.charAt(0)}</div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight italic uppercase text-slate-800 dark:text-white">{activeChat.name}</h3>
                    <div className="flex items-center gap-3">
                       <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Atendimento via IA
                       </p>
                       <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">• {activeChat.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"><Activity size={20}/></button>
                  <button className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-2xl transition-all shadow-sm"><MoreVertical size={20}/></button>
                  <button className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl">
                    {/* Fixed: Added missing Calendar icon to lucide-react imports */}
                    <Calendar size={16} /> Agendar
                  </button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-slate-50/50 dark:bg-slate-955 scroll-smooth">
                {chatHistories[activeChat.id]?.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : msg.sender === 'ai' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[70%] p-8 rounded-[2.5rem] shadow-sm border relative ${
                      msg.sender === 'me' 
                        ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-700 shadow-indigo-200/20' 
                        : msg.sender === 'ai'
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-tr-none border-purple-800 shadow-purple-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-none border-slate-100 dark:border-slate-800'
                    }`}>
                      {msg.sender === 'ai' && (
                        <div className="absolute -top-3 -left-3 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg border border-purple-500/30">
                           <Sparkles size={12} className="text-purple-500 animate-pulse" />
                        </div>
                      )}
                      <p className="text-sm font-medium leading-relaxed italic">{msg.text}</p>
                    </div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-3 px-6 opacity-50 italic flex items-center gap-2">
                       {msg.sender === 'ai' ? 'Auditado por IA' : msg.sender === 'me' ? 'Operador' : 'Lead'} • {msg.time} 
                       {(msg.sender === 'me' || msg.sender === 'ai') && <CheckCheck size={10} className="text-emerald-500"/>}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-8 z-10 shadow-2xl">
                <div className="max-w-6xl mx-auto flex items-center gap-6">
                  <div className="flex-1 relative group">
                    <input 
                      value={messageInput} 
                      onChange={(e) => setMessageInput(e.target.value)} 
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
                      placeholder="Responder ou usar IA (ctrl+space)..." 
                      className="w-full pl-8 pr-32 py-7 bg-slate-50 dark:bg-slate-800/50 rounded-[2.2rem] border-none outline-none text-sm font-bold shadow-inner focus:ring-8 ring-indigo-500/5 transition-all italic placeholder:text-slate-300 dark:text-white" 
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                       <Paperclip size={20} className="cursor-pointer hover:scale-110 transition-transform"/>
                       <Smile size={20} className="cursor-pointer hover:scale-110 transition-transform"/>
                    </div>
                  </div>
                  <button 
                    onClick={handleSendMessage} 
                    disabled={!messageInput.trim() || isSending} 
                    className="p-8 bg-indigo-600 text-white rounded-3xl shadow-xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-8 opacity-30 select-none grayscale">
              <div className="p-12 rounded-full border-4 border-dashed border-slate-100 dark:border-slate-800">
                <MessageSquare size={100} className="animate-pulse" />
              </div>
              <p className="text-2xl font-black uppercase tracking-[0.5em] italic">Selecione um Prospect</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
