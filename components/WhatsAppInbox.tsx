
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, Paperclip, Smile, CheckCheck, 
  MessageSquare, Sparkles, Bot, Loader2, 
  Smartphone, QrCode, AlertCircle, ShieldCheck, RefreshCcw,
  Terminal, CheckCircle2, Wifi, Zap, X, Copy, Cpu, SmartphoneIcon,
  CreditCard, Landmark, Building2
} from 'lucide-react';
import { Lead, Appointment, Tenant, EvolutionConfig } from '../types';

interface Message {
  id: string;
  sender: 'me' | 'lead';
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

const PAYMENT_SUGGESTIONS = [
  { id: 'pay_1', label: 'Link Mercado Pago', icon: CreditCard },
  { id: 'pay_2', label: 'Link Stripe', icon: Landmark },
  { id: 'pay_3', label: 'QR Code Pix', icon: QrCode },
];

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
  const [showPaymentShortcuts, setShowPaymentShortcuts] = useState(false);

  // LOGIC: Polling para detectar leitura do QR Code
  useEffect(() => {
    let interval: any;
    if (isInstanceCreated && connStatus !== 'CONNECTED') {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${evolutionConfig.baseUrl}/instance/connectionState/${instanceName}`, {
            headers: { 'apikey': evolutionConfig.apiKey }
          });
          const data = await res.json();
          const state = data.instance?.state || data.state;
          
          if (state === 'open' || state === 'CONNECTED') {
            clearInterval(interval);
            handleConnectionSuccess();
          }
        } catch (e) {
          console.debug("Aguardando leitura do QR...");
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isInstanceCreated, connStatus, instanceName, evolutionConfig]);

  const handleConnectionSuccess = () => {
    setConnStatus('CONNECTED');
    setShowSuccessOverlay(true);
    if (onConnectionChange) onConnectionChange(true);
    notify('WhatsApp Conectado com Sucesso!');
    setTimeout(() => setShowSuccessOverlay(false), 3000);
  };

  const addLog = (msg: string) => {
    setProvisioningLogs(prev => [...prev.slice(-10), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleStartConnection = async () => {
    setIsConnecting(true);
    setProvisioningLogs([]);
    setQrCode(null);
    setIsInstanceCreated(false);

    addLog(`INIT: Acessando Cluster api.clikai.com.br...`);
    
    try {
      // 1. Tentar criar a instância (se falhar porque já existe, prosseguimos)
      addLog(`ENGINE: Mapeando instância "${instanceName}"...`);
      const createRes = await fetch(`${evolutionConfig.baseUrl}/instance/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': evolutionConfig.apiKey },
        body: JSON.stringify({ instanceName, qrcode: true })
      });
      
      const createData = await createRes.json();
      if (!createRes.ok && !createData.message?.includes('already exists')) {
         throw new Error(createData.message || "Erro ao criar instância");
      }
      
      addLog(`SUCCESS: Instância provisionada.`);
      setIsInstanceCreated(true);
      
      // 2. Handshake para obter o QR Code
      addLog(`CRYPTO: Gerando chaves de pareamento...`);
      const connectRes = await fetch(`${evolutionConfig.baseUrl}/instance/connect/${instanceName}`, { 
        method: 'GET', 
        headers: { 'apikey': evolutionConfig.apiKey } 
      });
      
      const connectData = await connectRes.json();
      
      // Suporte para múltiplos formatos de resposta da Evolution API
      const base64 = connectData.base64 || connectData.qrcode?.base64 || (connectData.code && connectData.code.length > 100 ? connectData.code : null);
      
      if (base64) {
        const finalUrl = base64.startsWith('data:image') ? base64 : `data:image/png;base64,${base64}`;
        setQrCode(finalUrl);
        addLog(`READY: QR Code gerado. Escaneie no WhatsApp.`);
      } else if (connectData.instance?.state === 'open' || connectData.status === 'CONNECTED') {
        addLog(`INFO: Sessão já ativa no servidor.`);
        handleConnectionSuccess();
      } else {
        addLog(`WARN: Servidor processando... Aguarde 5s.`);
        setTimeout(handleStartConnection, 5000);
      }

    } catch (err: any) {
      addLog(`FATAL: Erro de Comunicação.`);
      addLog(`DETAIL: ${err.message}`);
      notify('Erro ao conectar com Evolution API.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSendMessage = (textOverride?: string) => {
    const textToSend = textOverride || messageInput;
    if (!activeChat || !textToSend.trim()) return;

    setIsSending(true);
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'me',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setChatHistories(prev => ({ ...prev, [activeChat.id]: [...(prev[activeChat.id] || []), newMessage] }));
    setMessageInput('');
    setTimeout(() => setIsSending(false), 400);
  };

  const sendPaymentLink = (label: string) => {
    handleSendMessage(`Segue o link para o pagamento via ${label}: https://clikai.com.br/pay/premium`);
    setShowPaymentShortcuts(false);
    notify('Link enviado!');
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-955 overflow-hidden relative">
      
      {/* OVERLAY DE SUCESSO */}
      {showSuccessOverlay && (
        <div className="absolute inset-0 z-[200] bg-emerald-600 flex flex-col items-center justify-center text-white animate-in fade-in duration-700">
           <div className="p-10 bg-white/20 rounded-full animate-bounce mb-8">
              <CheckCircle2 size={120} />
           </div>
           <h2 className="text-6xl font-black italic uppercase tracking-tighter">Conectado!</h2>
           <p className="text-xl font-bold uppercase tracking-[0.4em] opacity-80 mt-4">Sincronizando Mensagens Neural...</p>
        </div>
      )}

      {/* TELA DE LOGIN / CONEXÃO */}
      {connStatus !== 'CONNECTED' && (
        <div className="absolute inset-0 z-[100] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in">
           <div className="max-w-5xl w-full bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
              
              <div className="w-full md:w-5/12 p-12 bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                 <div className="space-y-8">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Cpu size={24}/></div>
                       <div>
                          <h3 className="text-xl font-black italic uppercase tracking-tight">Evolution Core</h3>
                          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">api.clikai.com.br</p>
                       </div>
                    </div>

                    <div className="bg-slate-950 rounded-[2rem] p-8 font-mono text-[10px] text-emerald-400 shadow-inner h-64 overflow-y-auto no-scrollbar border border-white/5">
                       <p className="text-emerald-500/40 mb-4 flex items-center gap-2 font-black uppercase"><Terminal size={12}/> Console Log</p>
                       {provisioningLogs.map((log, i) => (
                         <p key={i} className="mb-1 animate-in slide-in-from-left-1">{log}</p>
                       ))}
                       {isConnecting && <p className="animate-pulse text-emerald-500">_</p>}
                    </div>
                 </div>

                 <div className="flex items-center gap-4 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><SmartphoneIcon size={20}/></div>
                    <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase">Aparelho Vinculado</p>
                       <p className="text-[11px] font-black uppercase italic truncate max-w-[150px]">{tenant.name}</p>
                    </div>
                 </div>
              </div>

              <div className="flex-1 p-16 flex flex-col items-center justify-center text-center relative bg-white dark:bg-slate-900">
                 {!qrCode ? (
                    <div className="space-y-10 animate-in slide-in-from-right-4">
                       <div className="space-y-4">
                          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white leading-none">Login <br/><span className="text-indigo-600">WhatsApp</span></h2>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed italic max-w-sm mx-auto">Sua unidade precisa estar pareada para habilitar os disparos e o atendimento via IA.</p>
                       </div>

                       <button 
                         onClick={handleStartConnection}
                         disabled={isConnecting}
                         className="w-full py-10 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(79,70,229,0.5)] hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-4 group disabled:opacity-50"
                       >
                          {isConnecting ? <Loader2 className="animate-spin" size={32} /> : <Zap size={28} className="group-hover:rotate-12 transition-transform" />}
                          {isConnecting ? 'Autenticando...' : 'Gerar Novo QR Code'}
                       </button>

                       <div className="flex items-center justify-center gap-2 opacity-50">
                          <ShieldCheck size={14} className="text-emerald-500" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Conexão Criptografada SSL</span>
                       </div>
                    </div>
                 ) : (
                    <div className="space-y-10 animate-in zoom-in-95">
                       <div className="space-y-2">
                          <h3 className="text-3xl font-black italic uppercase tracking-tight text-slate-800 dark:text-white">Aguardando Scan</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Aponte a câmera do WhatsApp para o código abaixo</p>
                       </div>

                       <div className="relative group">
                          <div className="absolute -inset-6 bg-indigo-600/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="w-80 h-80 bg-white rounded-[4rem] shadow-2xl flex items-center justify-center border-[12px] border-slate-50 dark:border-slate-800 relative z-10 overflow-hidden">
                             <img src={qrCode} alt="Scan QR" className="w-64 h-64 object-contain animate-in fade-in duration-700" />
                          </div>
                       </div>

                       <div className="flex gap-4">
                          <button onClick={handleStartConnection} className="flex-1 py-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest hover:border-indigo-600 transition-all shadow-sm flex items-center justify-center gap-3">
                             <RefreshCcw size={16} /> Atualizar QR
                          </button>
                          <button onClick={() => setQrCode(null)} className="px-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest hover:text-rose-500 transition-all">Cancelar</button>
                       </div>

                       <div className="flex items-center justify-center gap-2 px-6 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full border border-emerald-100 dark:border-emerald-800 text-[8px] font-black uppercase tracking-[0.2em] animate-pulse">
                          <Wifi size={10}/> Node Status: Aguardando Pareamento...
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* INTERFACE PRINCIPAL DO CHAT */}
      <div className="flex flex-1 overflow-hidden">
        {/* LISTA DE CHATS */}
        <div className="w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
          <div className="p-10">
            <h2 className="text-2xl font-black tracking-tight italic uppercase mb-10 flex items-center gap-4">
               <MessageSquare className="text-indigo-600" /> Inbox IA
            </h2>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" placeholder="Filtrar..." className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-800 border-none rounded-[2rem] text-xs font-black uppercase tracking-widest outline-none shadow-sm focus:ring-4 ring-indigo-500/5 transition-all" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
            {activeLeads.map((chat) => (
              <div key={chat.id} onClick={() => setActiveChat(chat)} className={`px-10 py-8 flex items-center gap-6 cursor-pointer transition-all border-l-[8px] relative group ${activeChat?.id === chat.id ? 'border-indigo-600 bg-white dark:bg-slate-800 shadow-2xl z-10' : 'border-transparent hover:bg-slate-100/50'}`}>
                <div className="w-14 h-14 rounded-[1.8rem] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center font-black text-xl shadow-inner group-hover:rotate-6 transition-transform">{chat.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black truncate uppercase italic tracking-tight">{chat.name}</h4>
                  <p className="text-[9px] text-slate-400 font-bold truncate uppercase tracking-widest mt-1.5 opacity-70 italic">{chat.lastInteraction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ÁREA DE MENSAGENS */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-955 relative">
          {activeChat ? (
            <>
              <div className="h-32 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-12 z-20 shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-2xl border-4 border-white dark:border-slate-800">{activeChat.name.charAt(0)}</div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight italic uppercase">{activeChat.name}</h3>
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Atendimento Ativo
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowPaymentShortcuts(!showPaymentShortcuts)} className="flex items-center gap-2 px-8 py-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100 dark:border-emerald-800/50">
                  <CreditCard size={16} /> Link de Pagamento
                </button>
              </div>

              {showPaymentShortcuts && (
                <div className="absolute top-36 right-12 z-50 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 w-80 animate-in slide-in-from-top-4">
                   <div className="flex justify-between mb-6 px-2">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Escolher Gateway</h4>
                      <button onClick={() => setShowPaymentShortcuts(false)} className="text-slate-300 hover:text-rose-500"><X size={16}/></button>
                   </div>
                   <div className="space-y-2">
                      {PAYMENT_SUGGESTIONS.map(p => (
                        <button key={p.id} onClick={() => sendPaymentLink(p.label)} className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all group text-left border border-transparent hover:border-slate-100 dark:hover:border-slate-700 shadow-sm">
                           <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner"><p.icon size={18}/></div>
                           <span className="text-[11px] font-black uppercase italic tracking-tight">{p.label}</span>
                        </button>
                      ))}
                   </div>
                </div>
              )}

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar bg-slate-50/50 dark:bg-slate-955">
                {chatHistories[activeChat.id]?.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[75%] p-10 rounded-[3.5rem] shadow-sm border ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-700 shadow-indigo-200/20' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-none border-slate-100 dark:border-slate-800'}`}>
                      <p className="text-sm font-medium leading-relaxed italic">{msg.text}</p>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4 px-8 opacity-40 italic flex items-center gap-2">
                       {msg.time} {msg.sender === 'me' && <CheckCheck size={12} className="text-emerald-500"/>}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-12 z-10 shadow-2xl">
                <div className="max-w-6xl mx-auto flex items-center gap-8">
                  <div className="flex-1 relative group">
                    <input 
                      value={messageInput} 
                      onChange={(e) => setMessageInput(e.target.value)} 
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
                      placeholder="Responder via clikai.com.br..." 
                      className="w-full pl-12 pr-24 py-9 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border-none outline-none text-sm font-bold shadow-inner focus:ring-8 ring-indigo-500/5 transition-all italic placeholder:text-slate-300 dark:text-white" 
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                       <Paperclip size={24} className="cursor-pointer hover:scale-110 transition-transform"/>
                       <Smile size={24} className="cursor-pointer hover:scale-110 transition-transform"/>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSendMessage()} 
                    disabled={!messageInput.trim() || isSending} 
                    className="p-10 bg-indigo-600 text-white rounded-[3rem] shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSending ? <Loader2 className="animate-spin" size={32} /> : <Send size={32} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-10 opacity-30 select-none grayscale">
              <div className="p-16 rounded-full border-8 border-dashed border-slate-100 dark:border-slate-800">
                <MessageSquare size={140} className="animate-pulse" />
              </div>
              <p className="text-3xl font-black uppercase tracking-[0.6em] italic">Selecione uma Conversa</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
