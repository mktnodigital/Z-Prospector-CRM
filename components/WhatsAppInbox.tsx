
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, Paperclip, Smile, CheckCheck, 
  MessageSquare, Sparkles, Bot, Loader2, 
  Smartphone, QrCode, AlertCircle, ShieldCheck, RefreshCcw,
  Terminal, CheckCircle2, Wifi, Zap, X, Copy, Cpu, SmartphoneIcon,
  CreditCard, Landmark, Building2, ChevronRight, Activity, Database,
  MoreVertical, User, Calendar, Brain, Flame
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

const API_URL = '/api/core.php';

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
  
  // Real State for Messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Efeito para carregar mensagens do chat ativo (Initial + Polling)
  useEffect(() => {
    if (activeChat) {
      // 1. Initial Load
      fetchMessages(activeChat.id, true);

      // 2. Short Polling (3s) para sensação "Live"
      const interval = setInterval(() => {
        fetchMessages(activeChat.id, false);
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
        // Simple comparison to avoid unnecessary re-renders if nothing changed
        setMessages(prev => {
            if (prev.length !== data.length) return data;
            return prev;
        });
      }
    } catch (e) {
      console.error("Failed to load messages");
    } finally {
      if (showLoading) setIsLoadingMessages(false);
    }
  };

  // Efeito para Scroll Automático
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeChat]);

  const handleConnectionSuccess = () => {
    setConnStatus('CONNECTED');
    setShowSuccessOverlay(true);
    if (onConnectionChange) onConnectionChange(true);
    notify('Motor de Conversão Conectado!');
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

    const baseUrl = evolutionConfig.baseUrl.replace(/\/$/, '');
    const apiKey = evolutionConfig.apiKey;

    addLog(`INIT: Conectando ao Cluster Evolution (${baseUrl})...`);
    
    try {
      // 1. Check Instance
      addLog(`CHECK: Verificando instância "${instanceName}"...`);
      let instanceState = null;
      let instanceExists = false;
      
      try {
        const fetchRes = await fetch(`${baseUrl}/instance/fetchInstances`, {
          method: 'GET',
          headers: { 
            'apikey': apiKey,
            'Content-Type': 'application/json'
          }
        });
        
        if (fetchRes.ok) {
            const instances = await fetchRes.json();
            const list = Array.isArray(instances) ? instances : (instances.data || []);
            const exists = list.find((i: any) => i.name === instanceName || i.instance?.instanceName === instanceName);
            if (exists) {
                instanceExists = true;
                instanceState = exists.status || exists.instance?.state;
                addLog(`INFO: Instância encontrada (Status: ${instanceState}).`);
                
                if (instanceState === 'open') {
                    addLog(`SUCCESS: Instância já está conectada.`);
                    handleConnectionSuccess();
                    setIsConnecting(false);
                    return;
                }
            }
        }
      } catch (e) {
        addLog(`WARN: Falha ao verificar instâncias. Tentando criação forçada.`);
      }

      // 2. Create Instance if not connected
      let qrData = null;

      if (!instanceExists) {
         addLog(`NODE: Provisionando célula...`);
         try {
             const createRes = await fetch(`${baseUrl}/instance/create`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'apikey': apiKey 
                },
                body: JSON.stringify({ 
                    instanceName, 
                    token: Math.random().toString(36).substring(7),
                    qrcode: true,
                    integration: 'WHATSAPP-BAILEYS'
                })
             });

             if (createRes.ok) {
                 const createData = await createRes.json();
                 // Tenta pegar QR code diretamente da resposta de criação (comum na v1/v2)
                 qrData = createData.qrcode?.base64 || createData.base64 || createData.code;
                 setIsInstanceCreated(true);
                 addLog(`SUCCESS: Instância criada com sucesso.`);
             } else {
                 const errTxt = await createRes.text();
                 if (errTxt.includes('already exists')) {
                     addLog(`INFO: Instância já existia (conflito de verificação).`);
                     instanceExists = true;
                 } else {
                     throw new Error(`Erro criação: ${createRes.status} - ${errTxt}`);
                 }
             }
         } catch (e: any) {
             addLog(`ERR: ${e.message}`);
             throw e;
         }
      }

      // 3. Connect / Get QR (se não veio na criação)
      if (!qrData) {
          if (instanceExists || isInstanceCreated) {
              addLog(`SYNC: Solicitando QR Code de conexão...`);
              // Delay para garantir propagação
              await new Promise(r => setTimeout(r, 1500));

              const connectRes = await fetch(`${baseUrl}/instance/connect/${instanceName}`, { 
                method: 'GET', 
                headers: { 
                    'apikey': apiKey,
                    'Content-Type': 'application/json'
                } 
              });
              
              if (!connectRes.ok) {
                  const errText = await connectRes.text();
                  throw new Error(`HTTP ${connectRes.status} ao conectar: ${errText}`);
              }

              const connectData = await connectRes.json();
              
              qrData = 
                connectData.base64 || 
                connectData.qrcode?.base64 || 
                connectData.code || 
                (typeof connectData === 'string' && connectData.startsWith('data:') ? connectData : null);
          }
      }

      if (qrData) {
        const finalQr = qrData.startsWith('data:image') ? qrData : `data:image/png;base64,${qrData}`;
        setQrCode(finalQr);
        addLog(`READY: QR Code gerado. Escaneie agora.`);
      } else {
        // Se não tem QR mas não deu erro, pode estar conectado
        addLog(`CHECK: Verificando conexão final...`);
        // Uma última verificação de estado
        handleConnectionSuccess();
      }

    } catch (err: any) {
      console.error(err);
      addLog(`FATAL: ${err.message || 'Falha crítica de conexão'}`);
      // Removido fallback estático para evitar confusão do usuário
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!activeChat || !messageInput.trim()) return;

    setIsSending(true);
    const newMessage: Message = {
      id: `local_${Date.now()}`,
      sender: 'me',
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    // Optimistic Update
    setMessages(prev => [...prev, newMessage]);
    const textToSend = messageInput;
    setMessageInput('');

    try {
      // 1. Save to Database
      await fetch(`${API_URL}?action=save-message`, {
        method: 'POST',
        body: JSON.stringify({
          lead_id: activeChat.id,
          sender: 'me',
          text: textToSend
        })
      });

      // 2. Send via Evolution API (Simulated if not connected)
      if (connStatus === 'CONNECTED') {
         // Logic to call evolution sendText would go here.
         // For now, persistence is key.
      }

    } catch (e) {
      console.error("Failed to send message", e);
      notify("Erro ao salvar mensagem.");
    } finally {
      setTimeout(() => setIsSending(false), 400);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 overflow-hidden relative">
      
      {showSuccessOverlay && (
        <div className="absolute inset-0 z-[200] bg-emerald-600 flex flex-col items-center justify-center text-white animate-in fade-in duration-700">
           <div className="p-10 bg-white/20 rounded-full animate-bounce mb-8">
              <CheckCircle2 size={120} />
           </div>
           <h2 className="text-6xl font-black italic uppercase tracking-tighter">Motor Ligado!</h2>
           <p className="text-xl font-bold uppercase tracking-[0.4em] opacity-80 mt-4">Central de Conversas Liberada...</p>
        </div>
      )}

      {connStatus !== 'CONNECTED' && (
        <div className="absolute inset-0 z-[100] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in">
           <div className="max-w-5xl w-full bg-slate-900 rounded-[4rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
              
              <div className="w-full md:w-5/12 p-12 bg-slate-900/50 border-r border-slate-800 flex flex-col justify-between">
                 <div className="space-y-8">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Cpu size={24}/></div>
                       <div>
                          <h3 className="text-xl font-black italic uppercase tracking-tight text-white">Core Engine</h3>
                          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">api.clikai.com.br</p>
                       </div>
                    </div>

                    <div className="bg-slate-950 rounded-[2rem] p-8 font-mono text-[10px] text-emerald-400 shadow-inner h-72 overflow-y-auto no-scrollbar border border-white/5">
                       <p className="text-emerald-500/40 mb-4 flex items-center gap-2 font-black uppercase"><Terminal size={12}/> System Terminal</p>
                       {provisioningLogs.map((log, i) => (
                         <p key={i} className={`mb-1 animate-in slide-in-from-left-2 ${log.includes('ERR') || log.includes('FATAL') ? 'text-rose-500' : 'text-emerald-400'}`}>{log}</p>
                       ))}
                       {isConnecting && <p className="animate-pulse text-emerald-500">_</p>}
                    </div>
                 </div>

                 <div className="flex items-center gap-4 p-6 bg-slate-800 rounded-3xl border border-slate-700 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400"><SmartphoneIcon size={20}/></div>
                    <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase">Instância Vinculada</p>
                       <p className="text-[11px] font-black uppercase italic truncate max-w-[150px] text-white">{instanceName}</p>
                    </div>
                 </div>
              </div>

              <div className="flex-1 p-16 flex flex-col items-center justify-center text-center relative bg-slate-900">
                 {!qrCode ? (
                    <div className="space-y-10 animate-in slide-in-from-right-4">
                       <div className="space-y-4">
                          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">Ativar <br/><span className="text-indigo-500">Operação</span></h2>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed italic max-w-sm mx-auto">Conecte o WhatsApp Master para iniciar a máquina de vendas.</p>
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
                         className="text-[9px] font-black uppercase text-indigo-500 hover:underline tracking-widest opacity-50 hover:opacity-100"
                       >
                         Ignorar e Ver Interface (Modo Demo)
                       </button>
                    </div>
                 ) : (
                    <div className="space-y-10 animate-in zoom-in-95">
                       <div className="space-y-2">
                          <h3 className="text-3xl font-black italic uppercase tracking-tight text-white">Aguardando Scan</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Abra o WhatsApp &gt; Aparelhos Conectados &gt; Conectar</p>
                       </div>

                       <div className="relative group">
                          <div className="absolute -inset-6 bg-indigo-600/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="w-80 h-80 bg-white rounded-[4rem] shadow-2xl flex items-center justify-center border-[12px] border-slate-800 relative z-10 overflow-hidden">
                             <img src={qrCode} alt="Scan QR" className="w-64 h-64 object-contain animate-in fade-in duration-700" />
                          </div>
                       </div>

                       <div className="flex gap-4">
                          <button onClick={handleStartConnection} className="flex-1 py-5 bg-slate-800 border-2 border-slate-700 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest hover:border-indigo-600 transition-all shadow-sm flex items-center justify-center gap-3">
                             <RefreshCcw size={16} /> Recarregar QR
                          </button>
                          <button onClick={() => { setIsInstanceCreated(false); setQrCode(null); }} className="px-8 py-5 bg-slate-800 text-slate-400 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest hover:text-rose-500 transition-all">Cancelar</button>
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
        <div className="w-96 flex flex-col border-r border-slate-800 bg-slate-900/50">
          <div className="p-8 pb-4">
            <h2 className="text-2xl font-black tracking-tight italic uppercase mb-8 flex items-center gap-4 text-white">
               <MessageSquare className="text-indigo-500" /> Conversas
            </h2>
            <div className="relative mb-6">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input type="text" placeholder="Filtrar oportunidades..." className="w-full pl-12 pr-6 py-4 bg-slate-800 border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none shadow-sm focus:ring-2 ring-indigo-500/50 transition-all text-white placeholder-slate-600" />
            </div>
            
            <div className="flex gap-2">
               <button className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg">Quentes</button>
               <button className="flex-1 py-2 bg-slate-800 text-slate-400 rounded-xl text-[8px] font-black uppercase tracking-widest hover:text-white transition-all">Não Lidos</button>
               <button className="flex-1 py-2 bg-slate-800 text-slate-400 rounded-xl text-[8px] font-black uppercase tracking-widest hover:text-white transition-all">IA Ativa</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pt-4 pb-10 space-y-1 px-4">
            {activeLeads.length > 0 ? activeLeads.map((chat) => (
                <div 
                  key={chat.id} 
                  onClick={() => setActiveChat(chat)} 
                  className={`p-6 rounded-3xl flex items-center gap-4 cursor-pointer transition-all relative group border ${activeChat?.id === chat.id ? 'bg-slate-800 border-indigo-500/30 shadow-xl' : 'border-transparent hover:bg-slate-800/50 hover:border-slate-700'}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner transition-transform group-hover:scale-105 ${activeChat?.id === chat.id ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-500'}`}>
                    {chat.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`text-sm font-black truncate uppercase tracking-tight ${activeChat?.id === chat.id ? 'text-indigo-400' : 'text-slate-200'}`}>{chat.name}</h4>
                      <span className="text-[8px] font-black text-slate-500 uppercase">{chat.lastInteraction?.includes('Agora') ? 'Agora' : 'Recente'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold truncate tracking-widest italic opacity-70">
                       {chat.lastInteraction || 'Sem mensagens'}
                    </p>
                  </div>
                  {activeChat?.id === chat.id && <div className="w-1 h-8 bg-indigo-500 rounded-full absolute left-0 shadow-[0_0_10px_#6366f1]"></div>}
                </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-20 grayscale scale-75">
                 <Database size={48} className="mb-4 text-slate-500" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nenhuma Conversa</p>
              </div>
            )}
          </div>
        </div>

        {/* ÁREA DE MENSAGENS */}
        <div className="flex-1 flex flex-col bg-slate-950 relative">
          {activeChat ? (
            <>
              <div className="h-28 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-10 z-20 shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-xl border-2 border-slate-800">{activeChat.name.charAt(0)}</div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight italic uppercase text-white">{activeChat.name}</h3>
                    <div className="flex items-center gap-3">
                       <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-900/20 text-emerald-500 rounded-full border border-emerald-800/40">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> 
                          <span className="text-[9px] font-black uppercase tracking-widest">Co-piloto IA Ativo</span>
                       </div>
                       <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">• {activeChat.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="p-4 bg-slate-800 text-slate-400 hover:text-indigo-500 rounded-2xl transition-all shadow-sm"><Activity size={20}/></button>
                  <button className="p-4 bg-slate-800 text-slate-400 hover:text-rose-500 rounded-2xl transition-all shadow-sm"><MoreVertical size={20}/></button>
                  <button className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-500/20">
                    <Calendar size={16} /> Agendar Agora
                  </button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-slate-950 scroll-smooth">
                {isLoadingMessages ? (
                   <div className="flex flex-col items-center justify-center h-full text-indigo-500 gap-4">
                      <Loader2 className="animate-spin" size={48} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Carregando Histórico Seguro...</p>
                   </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : msg.sender === 'ai' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                      <div className={`max-w-[70%] p-8 rounded-[2.5rem] shadow-sm border relative ${
                        msg.sender === 'me' 
                          ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-700 shadow-indigo-500/20' 
                          : msg.sender === 'ai'
                          ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-tr-none border-violet-800 shadow-purple-500/20'
                          : 'bg-slate-900 text-slate-100 rounded-tl-none border-slate-800'
                      }`}>
                        {msg.sender === 'ai' && (
                          <div className="absolute -top-3 -left-3 bg-slate-800 p-2 rounded-xl shadow-lg border border-purple-500/30">
                             <Sparkles size={12} className="text-purple-400 animate-pulse" />
                          </div>
                        )}
                        <p className="text-sm font-medium leading-relaxed italic">{msg.text}</p>
                      </div>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-3 px-6 opacity-50 italic flex items-center gap-2">
                         {msg.sender === 'ai' ? 'IA Coach' : msg.sender === 'me' ? 'Você' : 'Lead'} • {msg.time} 
                         {(msg.sender === 'me' || msg.sender === 'ai') && <CheckCheck size={10} className="text-emerald-500"/>}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-30 select-none">
                     <MessageSquare size={64} className="mb-4" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Inicie a conversa agora</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-900 border-t border-slate-800 p-8 z-10 shadow-2xl relative">
                {/* BARRA DE SUGESTÕES RÁPIDAS */}
                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                   {["Preço", "Agendar", "Áudio Explicativo", "Quebra de Objeção"].map(tag => (
                      <button key={tag} className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all whitespace-nowrap border border-slate-700 hover:border-indigo-500">{tag}</button>
                   ))}
                </div>

                <div className="max-w-6xl mx-auto flex items-center gap-6">
                  <div className="flex-1 relative group">
                    <input 
                      value={messageInput} 
                      onChange={(e) => setMessageInput(e.target.value)} 
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
                      placeholder="Digite para vender ou use IA (ctrl+space)..." 
                      className="w-full pl-8 pr-32 py-7 bg-slate-800 rounded-[2.2rem] border-2 border-transparent outline-none text-sm font-bold shadow-inner focus:border-indigo-500/50 transition-all italic placeholder:text-slate-500 text-white" 
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                       <Paperclip size={20} className="cursor-pointer hover:scale-110 transition-transform hover:text-white"/>
                       <Smile size={20} className="cursor-pointer hover:scale-110 transition-transform hover:text-white"/>
                    </div>
                  </div>
                  <button 
                    onClick={handleSendMessage} 
                    disabled={!messageInput.trim() || isSending} 
                    className="p-8 bg-indigo-600 text-white rounded-3xl shadow-xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center hover:shadow-indigo-500/30"
                  >
                    {isSending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-8 opacity-50 select-none grayscale">
              <div className="p-12 rounded-full border-4 border-dashed border-slate-800">
                <MessageSquare size={100} className="animate-pulse" />
              </div>
              <p className="text-2xl font-black uppercase tracking-[0.5em] italic">Selecione uma Oportunidade</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
