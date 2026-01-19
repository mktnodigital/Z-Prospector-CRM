
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
  CreditCard, ExternalLink,
  // Fix: Added missing Landmark icon import
  Landmark
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { Lead, PipelineStage, Appointment, Tenant, EvolutionConfig } from '../types';

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

type ChannelType = 'BAILEYS' | 'WHATSAPP-BUSINESS';

const PAYMENT_SUGGESTIONS = [
  { id: 'pay_1', label: 'Link Mercado Pago', icon: CreditCard },
  { id: 'pay_2', label: 'Link Stripe', icon: Landmark },
  { id: 'pay_3', label: 'QR Code Pix', icon: QrCode },
];

export const WhatsAppInbox: React.FC<WhatsAppInboxProps> = ({ niche, activeLeads, onSchedule, tenant, evolutionConfig, notify }) => {
  const [activeChat, setActiveChat] = useState<Lead | null>(activeLeads[0] || null);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [provisioningLogs, setProvisioningLogs] = useState<string[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connStatus, setConnStatus] = useState(tenant.instanceStatus || 'DISCONNECTED');
  
  const [instanceName, setInstanceName] = useState(`unidade_${tenant.name.toLowerCase().split(' ')[0]}_${tenant.id}`);
  const [channelType, setChannelType] = useState<ChannelType>('BAILEYS');
  const [autoToken, setAutoToken] = useState('');
  const [isInstanceCreated, setIsInstanceCreated] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});
  
  const [showPaymentShortcuts, setShowPaymentShortcuts] = useState(false);

  useEffect(() => {
    const randomToken = 'tk_' + Math.random().toString(36).substring(2, 12).toUpperCase();
    setAutoToken(randomToken);
  }, [tenant.id]);

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
    setIsConnecting(true);
    setErrorInfo(null);
    setProvisioningLogs([]);
    addLog(`PROVISIONING: Multi-tenant Node para "${tenant.name}"`);
    
    try {
      const response = await fetch(`${evolutionConfig.baseUrl}/instance/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': evolutionConfig.apiKey },
        body: JSON.stringify({ instanceName: instanceName, token: autoToken, qrcode: true, integration: channelType === 'BAILEYS' ? 'baileys' : 'whatsapp_business' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro na API Evolution");
      addLog(`SUCCESS: Instância "${instanceName}" criada no Cluster.`);
      setIsInstanceCreated(true);
      notify('Slot da Empresa Provisionado!');
    } catch (err: any) {
      setErrorInfo(`Erro: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGetQRCode = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(`${evolutionConfig.baseUrl}/instance/connect/${instanceName}`, { method: 'GET', headers: { 'apikey': evolutionConfig.apiKey } });
      const data = await response.json();
      if (data.base64) {
        setQrCode(data.base64);
        setShowQrModal(true);
      } else if (data.status === 'CONNECTED' || data.instance?.state === 'open') {
        setConnStatus('CONNECTED');
        notify('WhatsApp da Empresa Conectado!');
      } else throw new Error("API processando buffer.");
    } catch (err: any) { setErrorInfo(err.message); } finally { setIsConnecting(false); }
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
      
      {showQrModal && qrCode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-[500px] rounded-[3.5rem] shadow-2xl p-12 relative border border-slate-100 flex flex-col items-center">
            <button onClick={() => setShowQrModal(false)} className="absolute top-8 right-8 p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"><X size={22} /></button>
            <div className="w-full mb-10 text-center">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Conectar WhatsApp</h3>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Unidade: {tenant.name}</p>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 cursor-pointer overflow-hidden" onClick={() => { setConnStatus('CONNECTED'); setShowQrModal(false); }}>
              <img src={qrCode} alt="WhatsApp QR" className="w-[300px] h-[300px] object-contain" />
              <div className="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest text-center">Confirmar no Celular</div>
            </div>
          </div>
        </div>
      )}

      {connStatus !== 'CONNECTED' && (
        <div className="absolute inset-0 z-[100] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-6 md:p-12 animate-in fade-in">
           <div className="max-w-6xl w-full bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-5/12 p-12 space-y-10 border-r border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20">
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl"><Server size={32} /></div>
                    <div>
                       <h2 className="text-2xl font-black italic uppercase tracking-tight">Multi-tenant Hub</h2>
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Node: api.clikai.com.br</p>
                    </div>
                 </div>
                 <div className="bg-slate-950 rounded-[2.5rem] p-10 font-mono text-[10px] text-emerald-400 h-[300px] shadow-inner overflow-y-auto no-scrollbar">
                    {provisioningLogs.map((log, i) => <p key={i} className="animate-in slide-in-from-left-2 mb-1 opacity-80">{log}</p>)}
                    {isConnecting && <p className="animate-pulse">_</p>}
                 </div>
              </div>

              <div className="flex-1 p-12 bg-slate-50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center">
                 {!isInstanceCreated ? (
                   <div className="space-y-10 w-full max-w-md">
                      <h3 className="text-4xl font-black italic uppercase tracking-tighter">Ativar WhatsApp</h3>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Cada unidade de negócio tem seu próprio gateway de atendimento exclusivo.</p>
                      <button onClick={handleActivateAccount} disabled={isConnecting} className="w-full py-8 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-2xl hover:bg-indigo-700 transition-all uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-4">
                         {isConnecting ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} />}
                         Criar Instância Master
                      </button>
                   </div>
                 ) : (
                   <div className="space-y-12 w-full max-w-md flex flex-col items-center">
                      <div className="w-48 h-48 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl flex items-center justify-center border-4 border-dashed border-slate-200">
                         <QrCode size={64} className="text-indigo-600" />
                      </div>
                      <button onClick={handleGetQRCode} className="w-full py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl">Obter QR Code para Leitura</button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

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
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-2xl border-4 border-white dark:border-slate-800">{activeChat.name.charAt(0)}</div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight italic uppercase">{activeChat.name}</h3>
                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Atendimento Ativo • Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <button onClick={() => setShowPaymentShortcuts(!showPaymentShortcuts)} className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">
                      <CreditCard size={14} /> Link de Pagamento
                   </button>
                </div>
              </div>

              {/* PAYMENT SHORTCUTS OVERLAY */}
              {showPaymentShortcuts && (
                <div className="absolute top-36 right-12 z-50 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 w-72 animate-in slide-in-from-top-4">
                   <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 px-2">Escolher Gateway</h4>
                   <div className="space-y-2">
                      {PAYMENT_SUGGESTIONS.map(p => (
                        <button key={p.id} onClick={() => sendPaymentLink(p.label)} className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all group text-left">
                           <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors"><p.icon size={16}/></div>
                           <span className="text-[10px] font-black uppercase">{p.label}</span>
                        </button>
                      ))}
                   </div>
                </div>
              )}

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                {chatHistories[activeChat.id]?.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[70%] p-10 rounded-[3.5rem] shadow-sm border ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-700' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-none border-slate-100'}`}>
                      <p className="text-sm font-medium leading-relaxed italic">{msg.text}</p>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4 px-8 opacity-40 italic">{msg.time}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-12">
                <div className="max-w-6xl mx-auto flex items-center gap-8">
                  <div className="flex-1 relative">
                    <input value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Responder via clikai.com.br..." className="w-full pl-12 pr-24 py-8 bg-slate-50 dark:bg-slate-800 rounded-[3rem] border-none outline-none text-sm font-bold shadow-inner focus:ring-8 ring-indigo-500/5 transition-all italic" />
                  </div>
                  <button onClick={() => handleSendMessage()} disabled={!messageInput.trim() || isSending} className="p-9 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl hover:bg-indigo-700 transition-all hover:scale-110 active:scale-90 disabled:opacity-50">
                    {isSending ? <Loader2 className="animate-spin" size={32} /> : <Send size={32} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-10 opacity-30 select-none grayscale">
              <MessageSquare size={120} className="animate-pulse" />
              <p className="text-3xl font-black uppercase tracking-[0.6em] italic">Selecione uma Conversa</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
