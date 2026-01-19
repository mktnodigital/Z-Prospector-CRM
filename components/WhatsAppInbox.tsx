
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, Paperclip, Smile, CheckCheck, 
  MoreHorizontal, MessageSquare,
  Sparkles, Bot, Loader2, CalendarCheck,
  Smartphone, QrCode, AlertCircle, ShieldCheck, RefreshCcw,
  Terminal, CheckCircle2, Wifi, Zap, X, Copy, Hash, Keyboard,
  Globe, Shield, Server, Lock, Link as LinkIcon, Cpu, SmartphoneIcon,
  ChevronRight, Activity, Database, Plus, Trash2, Radio, Camera,
  UserCheck, Building2, Link2, Settings2, Globe2, Fingerprint, 
  CreditCard, ExternalLink, Landmark
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
}

const PAYMENT_SUGGESTIONS = [
  { id: 'pay_1', label: 'Link Mercado Pago', icon: CreditCard },
  { id: 'pay_2', label: 'Link Stripe', icon: Landmark },
  { id: 'pay_3', label: 'QR Code Pix', icon: QrCode },
];

export const WhatsAppInbox: React.FC<WhatsAppInboxProps> = ({ niche, activeLeads, onSchedule, tenant, evolutionConfig, notify }) => {
  const [activeChat, setActiveChat] = useState<Lead | null>(activeLeads[0] || null);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Estados de Conexão e Instância
  const [connStatus, setConnStatus] = useState(tenant.instanceStatus || 'DISCONNECTED');
  const [instanceName, setInstanceName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [provisioningLogs, setProvisioningLogs] = useState<string[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isInstanceCreated, setIsInstanceCreated] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});
  const [showPaymentShortcuts, setShowPaymentShortcuts] = useState(false);

  // Inicializa o nome da instância sugerido se estiver vazio
  useEffect(() => {
    if (!instanceName) {
      setInstanceName(`${tenant.name.toLowerCase().replace(/\s+/g, '_')}_${tenant.id}`);
    }
  }, [tenant]);

  useEffect(() => {
    if (activeChat && !chatHistories[activeChat.id]) {
      const initialMessage: Message = {
        id: 'init-' + activeChat.id,
        sender: 'lead',
        text: activeChat.lastInteraction || 'Olá!',
        time: 'Agora'
      };
      setChatHistories(prev => ({ ...prev, [activeChat.id]: [initialMessage] }));
    }
  }, [activeChat]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistories, activeChat]);

  const addLog = (msg: string) => {
    setProvisioningLogs(prev => [...prev.slice(-12), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleActivateAccount = async () => {
    if (!instanceName.trim()) {
      notify('Digite um nome para a instância.');
      return;
    }

    setIsConnecting(true);
    setErrorInfo(null);
    setProvisioningLogs([]);
    addLog(`START: Provisionando nó para "${instanceName}"...`);
    
    try {
      // 1. Criar a instância
      const createRes = await fetch(`${evolutionConfig.baseUrl}/instance/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': evolutionConfig.apiKey },
        body: JSON.stringify({ 
          instanceName: instanceName, 
          token: 'tk_' + Math.random().toString(36).substring(2, 10), 
          qrcode: true 
        })
      });
      const createData = await createRes.json();
      
      if (!createRes.ok) throw new Error(createData.message || "Erro ao criar instância.");
      
      addLog(`SUCCESS: Instância "${instanceName}" injetada no cluster.`);
      setIsInstanceCreated(true);
      
      // 2. Aguardar brevemente o nó estabilizar e buscar o QR Code
      addLog(`FETCH: Solicitando par de chaves de pareamento (QR)...`);
      await new Promise(r => setTimeout(r, 1500));
      
      const connectRes = await fetch(`${evolutionConfig.baseUrl}/instance/connect/${instanceName}`, { 
        method: 'GET', 
        headers: { 'apikey': evolutionConfig.apiKey } 
      });
      const connectData = await connectRes.json();
      
      if (connectData.base64) {
        setQrCode(connectData.base64);
        addLog(`READY: QR Code gerado. Aguardando leitura...`);
      } else if (connectData.instance?.state === 'open') {
        setConnStatus('CONNECTED');
        notify('WhatsApp já estava conectado!');
      } else {
        addLog(`RETRY: API ocupada, tente gerar QR novamente.`);
      }

    } catch (err: any) {
      setErrorInfo(`Erro: ${err.message}`);
      addLog(`ERROR: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleManualGetQR = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(`${evolutionConfig.baseUrl}/instance/connect/${instanceName}`, { 
        method: 'GET', 
        headers: { 'apikey': evolutionConfig.apiKey } 
      });
      const data = await response.json();
      if (data.base64) {
        setQrCode(data.base64);
        notify('QR Code Atualizado!');
      } else if (data.instance?.state === 'open' || data.status === 'CONNECTED') {
        setConnStatus('CONNECTED');
        notify('WhatsApp Conectado com Sucesso!');
      }
    } catch (err: any) {
      notify('Erro ao buscar QR. Tente novamente.');
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
    const link = label.includes('Pix') ? 'PIX-00020126330014BR.GOV.BCB.PIX011152912423000...' : 'https://zprospector.com.br/pay/checkout-master';
    handleSendMessage(`Segue o link para o pagamento via ${label}: ${link}`);
    setShowPaymentShortcuts(false);
    notify('Link de Pagamento enviado!');
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-955 overflow-hidden relative">
      
      {/* OVERLAY DE CONEXÃO MULTI-TENANT */}
      {connStatus !== 'CONNECTED' && (
        <div className="absolute inset-0 z-[100] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-6 md:p-12 animate-in fade-in">
           <div className="max-w-6xl w-full bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row">
              
              {/* Painel Esquerdo: Logs e Status do Node */}
              <div className="w-full md:w-5/12 p-12 space-y-10 border-r border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20 flex flex-col">
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20"><Server size={32} /></div>
                    <div>
                       <h2 className="text-2xl font-black italic uppercase tracking-tight">Provisioning Hub</h2>
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Gateway Evolution API v2.0</p>
                    </div>
                 </div>

                 <div className="flex-1 bg-slate-950 rounded-[2.5rem] p-10 font-mono text-[10px] text-emerald-400 shadow-inner overflow-y-auto no-scrollbar min-h-[300px]">
                    <div className="flex items-center gap-2 mb-4 text-emerald-500/50">
                       <Terminal size={14}/>
                       <span className="uppercase tracking-widest font-black">System Output</span>
                    </div>
                    {provisioningLogs.length === 0 && <p className="opacity-40 italic">Aguardando definição da instância...</p>}
                    {provisioningLogs.map((log, i) => <p key={i} className="animate-in slide-in-from-left-2 mb-1 opacity-80">{log}</p>)}
                    {isConnecting && <p className="animate-pulse">_</p>}
                 </div>

                 <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 text-slate-400">
                       <Fingerprint size={20} />
                       <div className="space-y-0.5">
                          <p className="text-[8px] font-black uppercase tracking-widest">Empresa Ativa</p>
                          <p className="text-[11px] font-black uppercase italic text-slate-800 dark:text-white">{tenant.name}</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Painel Direito: Ações e QR Code */}
              <div className="flex-1 p-12 bg-slate-50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center relative">
                 <button onClick={() => setConnStatus('CONNECTED')} className="absolute top-8 right-8 p-3 text-slate-300 hover:text-indigo-600 transition-all" title="Bypass para demo">
                    <CheckCircle2 size={24} />
                 </button>

                 {!isInstanceCreated ? (
                   <div className="space-y-10 w-full max-w-md animate-in slide-in-from-right-4">
                      <div className="space-y-4">
                        <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white">Conectar <br/><span className="text-indigo-600">WhatsApp</span></h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed italic">Cada unidade de negócio precisa de uma instância exclusiva para atendimento neural.</p>
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black uppercase text-slate-400 px-6">Nome da Instância (Identificador)</label>
                        <input 
                          value={instanceName} 
                          onChange={(e) => setInstanceName(e.target.value)}
                          placeholder="Ex: barbearia_matriz_01"
                          className="w-full px-10 py-6 bg-white dark:bg-slate-900 border-none rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl outline-none focus:ring-4 ring-indigo-500/10 transition-all"
                        />
                      </div>

                      <button 
                        onClick={handleActivateAccount} 
                        disabled={isConnecting || !instanceName} 
                        className="w-full py-8 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-2xl hover:bg-indigo-700 transition-all uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-4 group"
                      >
                         {isConnecting ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} className="group-hover:rotate-12 transition-transform" />}
                         {isConnecting ? 'Provisionando...' : 'Criar Instância Master'}
                      </button>
                   </div>
                 ) : (
                   <div className="space-y-10 w-full max-w-md flex flex-col items-center animate-in zoom-in-95">
                      <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-white">Escaneie o QR Code</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Abra o WhatsApp no celular > Aparelhos Conectados</p>
                      </div>

                      <div className="relative group">
                         <div className="absolute -inset-4 bg-indigo-600/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         <div className="w-64 h-64 bg-white rounded-[3.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex items-center justify-center border-8 border-slate-50 relative z-10 overflow-hidden">
                            {qrCode ? (
                              <img src={qrCode} alt="WhatsApp QR" className="w-52 h-52 object-contain" />
                            ) : (
                              <div className="flex flex-col items-center gap-4 text-slate-300">
                                 <Loader2 className="animate-spin" size={40} />
                                 <span className="text-[8px] font-black uppercase">Gerando Par de Chaves...</span>
                              </div>
                            )}
                         </div>
                      </div>

                      <div className="flex gap-3 w-full">
                         <button onClick={handleManualGetQR} className="flex-1 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-[1.8rem] font-black uppercase text-[9px] tracking-widest hover:border-indigo-600 transition-all flex items-center justify-center gap-2">
                            <RefreshCcw size={14}/> Atualizar QR
                         </button>
                         <button onClick={() => { setIsInstanceCreated(false); setQrCode(null); }} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-[1.8rem] font-black uppercase text-[9px] tracking-widest hover:text-rose-500 transition-all">
                            Trocar Instância
                         </button>
                      </div>

                      <div className="flex items-center gap-2 px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[8px] font-black uppercase tracking-widest animate-pulse">
                         <Wifi size={10}/> Node ativo: api.clikai.com.br
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* INTERFACE PRINCIPAL DO INBOX (SOMENTE SE CONECTADO) */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
          <div className="p-10">
            <h2 className="text-2xl font-black tracking-tight italic uppercase mb-10 flex items-center gap-4 leading-none">
               <MessageSquare className="text-indigo-600" /> Inbox IA
            </h2>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" placeholder="Filtrar conversas..." className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-800 border-none rounded-[2rem] text-xs font-black uppercase tracking-widest outline-none shadow-sm focus:ring-4 ring-indigo-500/5 transition-all" />
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

        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-955 relative">
          {activeChat ? (
            <>
              <div className="h-32 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-12 z-20 shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-2xl border-4 border-white dark:border-slate-800 group-hover:rotate-3 transition-transform">{activeChat.name.charAt(0)}</div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight italic uppercase">{activeChat.name}</h3>
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Atendimento Ativo • Online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <button onClick={() => setShowPaymentShortcuts(!showPaymentShortcuts)} className="flex items-center gap-2 px-8 py-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100 dark:border-emerald-800/50">
                      <CreditCard size={16} /> Link de Pagamento
                   </button>
                </div>
              </div>

              {/* PAYMENT SHORTCUTS OVERLAY */}
              {showPaymentShortcuts && (
                <div className="absolute top-36 right-12 z-50 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 w-80 animate-in slide-in-from-top-4">
                   <div className="flex items-center justify-between mb-6 px-2">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Escolher Gateway</h4>
                      <button onClick={() => setShowPaymentShortcuts(false)} className="text-slate-300 hover:text-rose-500"><X size={16}/></button>
                   </div>
                   <div className="space-y-2">
                      {PAYMENT_SUGGESTIONS.map(p => (
                        <button key={p.id} onClick={() => sendPaymentLink(p.label)} className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all group text-left border border-transparent hover:border-slate-100 dark:hover:border-slate-700 shadow-sm hover:shadow-md">
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
