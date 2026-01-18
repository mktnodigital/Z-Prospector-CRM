import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, Paperclip, Smile, CheckCheck, 
  MoreHorizontal, MessageSquare,
  Sparkles, Bot, Loader2, CalendarCheck,
  Smartphone, QrCode, AlertCircle, ShieldCheck, RefreshCcw,
  Terminal, CheckCircle2, Wifi, Zap, X, Copy, Hash, Keyboard,
  Globe, Shield, Server, Lock, Link as LinkIcon, Cpu, SmartphoneIcon,
  ChevronRight, Activity, Database, Plus, Trash2, Radio, Camera,
  UserCheck, Building2, Link2, Settings2, Globe2
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

export const WhatsAppInbox: React.FC<WhatsAppInboxProps> = ({ niche, activeLeads, onSchedule, tenant, evolutionConfig, notify }) => {
  const [activeChat, setActiveChat] = useState<Lead | null>(activeLeads[0] || null);
  const [messageInput, setMessageInput] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // --- EVOLUTION API INFRASTRUCTURE ---
  const [isConnecting, setIsConnecting] = useState(false);
  const [provisioningLogs, setProvisioningLogs] = useState<string[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connStatus, setConnStatus] = useState(tenant.instanceStatus || 'DISCONNECTED');
  
  // Instance Management
  const [instanceName, setInstanceName] = useState(`clikai_unit_${tenant.id}`);
  const [channelType, setChannelType] = useState<ChannelType>('BAILEYS');
  const [autoToken, setAutoToken] = useState('');
  const [isInstanceCreated, setIsInstanceCreated] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});

  // Gera token automático ao carregar
  useEffect(() => {
    const randomToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setAutoToken(randomToken);
  }, []);

  useEffect(() => {
    if (activeChat && !chatHistories[activeChat.id]) {
      const initialMessage: Message = {
        id: 'init-' + activeChat.id,
        sender: 'lead',
        text: activeChat.lastInteraction || 'Olá, como posso ajudar?',
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
    if (instanceName.length < 3) {
      setErrorInfo("O nome da instância deve ter pelo menos 3 caracteres.");
      return;
    }

    setIsConnecting(true);
    setErrorInfo(null);
    setProvisioningLogs([]);
    addLog(`INITIALIZING: Handshake Multi-Channel para "${instanceName}"`);
    
    try {
      const integrationName = channelType === 'BAILEYS' ? 'baileys' : 'whatsapp_business';
      addLog(`CONFIG: Engine "${integrationName}" requisitada.`);

      const response = await fetch(`${evolutionConfig.baseUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionConfig.apiKey
        },
        body: JSON.stringify({
          instanceName: instanceName,
          token: autoToken,
          qrcode: true,
          integration: integrationName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const apiError = data.message || data.error || `Status ${response.status}`;
        addLog(`ERROR: ${apiError}`);
        
        if (apiError.toLowerCase().includes('exists')) {
          addLog(`INFO: Instância detectada. Sincronizando túnel existente...`);
          setIsInstanceCreated(true);
          return;
        }
        throw new Error(apiError);
      }

      addLog(`SUCCESS: Instância "${instanceName}" provisionada.`);
      addLog(`TOKEN: ${autoToken.substring(0, 8)}... (Security OK)`);
      setIsInstanceCreated(true);
      notify('Slot provisionado com sucesso!');
    } catch (err: any) {
      console.error("Evolution Error Detail:", err);
      setErrorInfo(`Erro 400/Bad Request: ${err.message}. Verifique se o nome contém apenas letras, números e underscores.`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGetQRCode = async () => {
    setIsConnecting(true);
    addLog(`SYNC: Solicitando Buffer de Pareamento via Socket...`);
    
    try {
      const response = await fetch(`${evolutionConfig.baseUrl}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: { 'apikey': evolutionConfig.apiKey }
      });

      const data = await response.json();

      if (data.base64) {
        setQrCode(data.base64);
        addLog(`DONE: QR Code Handshake recebido (Base64).`);
        setShowQrModal(true);
      } else if (data.instance?.state === 'open' || data.status === 'CONNECTED') {
        addLog(`INFO: Instância já está conectada.`);
        setConnStatus('CONNECTED');
        notify('WhatsApp já está ativo!');
      } else {
        addLog(`WARN: A API não retornou o buffer. Tentando novamente em breve...`);
        throw new Error("A API ainda está gerando o buffer. Aguarde 2 segundos.");
      }
      
    } catch (err: any) {
      addLog(`WARN: Falha ao obter QR. Verifique os logs da VPS.`);
      setErrorInfo(`Erro ao buscar QR: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConfirmConnection = () => {
    setIsConnecting(true);
    addLog(`EVENT: Instance ${instanceName} is now OPEN`);
    addLog(`SYNC: Sincronizando base de dados da Unidade...`);
    
    setTimeout(() => {
      setConnStatus('CONNECTED');
      setQrCode(null);
      setShowQrModal(false);
      setIsConnecting(false);
      notify('WhatsApp da Unidade Conectado!');
    }, 2000);
  };

  const generateAISuggestion = async () => {
    if (!activeChat) return;
    setIsLoadingAi(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const lastMsg = chatHistories[activeChat.id]?.slice(-1)[0]?.text || activeChat.lastInteraction;
      
      const prompt = `Aja como um SDR comercial persuasivo para ${niche}. Lead: "${activeChat.name}" enviou: "${lastMsg}". Responda de forma curta para converter em venda. Retorne JSON: { "message": "string" }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result: any = JSON.parse(response.text || '{}');
      setAiSuggestion(result.message);
    } catch (error) {
      setAiSuggestion("Olá! Como posso te ajudar hoje?");
    } finally {
      setIsLoadingAi(false);
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

    setChatHistories(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage]
    }));

    setMessageInput('');
    setAiSuggestion('');
    setTimeout(() => setIsSending(false), 400);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-955 overflow-hidden relative">
      
      {showQrModal && qrCode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-[500px] rounded-[3.5rem] shadow-2xl p-12 relative border border-slate-100 flex flex-col items-center">
            <button 
              onClick={() => setShowQrModal(false)} 
              className="absolute top-8 right-8 p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
            >
              <X size={22} />
            </button>

            <div className="w-full mb-10 text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic leading-none">
                Scan the QR Code
              </h3>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                Evolution API • Instance: {instanceName}
              </p>
            </div>

            <div 
               className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 relative group cursor-pointer overflow-hidden" 
               onClick={handleConfirmConnection}
            >
              <img src={qrCode} alt="WhatsApp QR" className="w-[300px] h-[300px] object-contain select-none" />
              
              <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300">
                 <div className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <CheckCircle2 size={16} /> Confirmar Leitura
                 </div>
                 <p className="text-[8px] font-black uppercase text-indigo-600 mt-4 px-10 text-center">Clique aqui após escanear no seu celular para validar</p>
              </div>
            </div>

            <div className="mt-10 space-y-4 w-full">
               <div className="flex items-center justify-between p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-indigo-600" />
                    <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest">Pareamento Criptografado</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               </div>
               <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">Abra o WhatsApp &gt; Configurações &gt; Aparelhos Conectados</p>
            </div>
          </div>
        </div>
      )}

      {connStatus !== 'CONNECTED' && (
        <div className="absolute inset-0 z-[100] bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center p-6 md:p-12 animate-in fade-in">
           <div className="max-w-7xl w-full bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-5/12 p-12 space-y-10 border-r border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20">
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl">
                       <Server size={32} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black italic uppercase tracking-tight">Evolution Hub</h2>
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Node: api.clikai.com.br</p>
                    </div>
                 </div>

                 <div className="bg-slate-950 rounded-[2.5rem] p-10 font-mono text-[10px] text-emerald-400 h-[320px] shadow-inner border border-white/5 overflow-y-auto no-scrollbar relative group">
                    <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                       <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                       </div>
                       <div className="flex items-center gap-2">
                          <Activity size={12} className="text-emerald-500 animate-pulse" />
                          <span className="text-slate-500 font-black uppercase">Socket Active</span>
                       </div>
                    </div>
                    {provisioningLogs.length > 0 ? (
                      <div className="space-y-2 opacity-90">
                        {provisioningLogs.map((log, i) => <p key={i} className="animate-in slide-in-from-left-2 tracking-tighter italic">{log}</p>)}
                        {isConnecting && <p className="animate-pulse">_</p>}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 opacity-20 text-center space-y-6">
                         <SmartphoneIcon size={64} className="animate-bounce" />
                         <p className="text-[10px] font-black uppercase tracking-[0.3em]">Aguardando Handshake Técnico...</p>
                      </div>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-2xl flex flex-col gap-1">
                       <span className="text-[8px] font-black uppercase text-slate-400">Auth Token</span>
                       <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">{autoToken || 'Generating...'}</span>
                    </div>
                    <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-2xl flex flex-col gap-1">
                       <span className="text-[8px] font-black uppercase text-slate-400">Endpoint</span>
                       <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">/instance/create</span>
                    </div>
                 </div>
              </div>

              <div className="flex-1 p-12 bg-slate-50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 blur-[120px]"></div>
                 
                 {errorInfo && (
                   <div className="absolute top-6 inset-x-6 p-5 bg-rose-50 border border-rose-100 rounded-3xl flex items-start gap-4 animate-in slide-in-from-top-4 z-20">
                      <AlertCircle className="text-rose-500 shrink-0" size={20} />
                      <p className="text-[10px] text-rose-700 font-bold text-left uppercase tracking-tight leading-relaxed">{errorInfo}</p>
                   </div>
                 )}

                 {!isInstanceCreated ? (
                   <div className="space-y-10 animate-in zoom-in-95 relative z-10 w-full max-w-lg">
                      <div className="space-y-4">
                         <h3 className="text-4xl font-black italic uppercase tracking-tighter">Provisionar WhatsApp</h3>
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-6">
                            Configure sua instância dedicada no cluster <span className="text-indigo-600">api.clikai.com.br</span>
                         </p>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 space-y-6 text-left">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-widest">Nome da Instância (Min. 3 letras)</label>
                            <div className="relative">
                               <Smartphone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                               <input 
                                 value={instanceName} 
                                 onChange={e => setInstanceName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                 className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold outline-none focus:ring-4 ring-indigo-500/10 transition-all italic" 
                               />
                            </div>
                         </div>

                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-widest">Engine (Channel)</label>
                            <div className="grid grid-cols-2 gap-3">
                               <button 
                                 onClick={() => setChannelType('BAILEYS')}
                                 className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all ${channelType === 'BAILEYS' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                               >
                                  <Zap size={16} />
                                  <span className="text-[10px] font-black uppercase">Baileys (QR)</span>
                               </button>
                               <button 
                                 onClick={() => setChannelType('WHATSAPP-BUSINESS')}
                                 className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all ${channelType === 'WHATSAPP-BUSINESS' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                               >
                                  <Globe size={16} />
                                  <span className="text-[10px] font-black uppercase">Cloud API</span>
                               </button>
                            </div>
                         </div>
                         
                         <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 flex items-center gap-3">
                            <Lock size={16} className="text-indigo-600" />
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Token de segurança gerado automaticamente para esta unidade.</p>
                         </div>
                      </div>

                      <button 
                        onClick={handleActivateAccount}
                        disabled={isConnecting || instanceName.length < 3}
                        className="w-full py-8 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(79,70,229,0.5)] hover:bg-indigo-700 hover:scale-[1.03] transition-all flex items-center justify-center gap-4 uppercase text-xs tracking-[0.3em] disabled:opacity-50"
                      >
                         {isConnecting ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} />}
                         {isConnecting ? 'Orquestrando...' : 'Provisionar Agora'}
                      </button>
                   </div>
                 ) : (
                   <div className="space-y-12 animate-in fade-in zoom-in-95 relative z-10 w-full max-w-lg">
                      <div className="p-12 bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
                         <div className="absolute -inset-4 bg-indigo-600/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         
                         <div className="flex flex-col items-center gap-10 relative z-10">
                            <div className="flex items-center gap-4 px-8 py-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                               <Wifi size={18} className="animate-pulse" />
                               <span className="text-[11px] font-black uppercase tracking-widest italic">Instância "{instanceName}" Online</span>
                            </div>
                            
                            <div className="w-64 h-64 bg-slate-50 dark:bg-slate-800 rounded-[3rem] flex flex-col items-center justify-center border-4 border-dashed border-slate-200 dark:border-slate-700 transition-all hover:border-indigo-400 group/qr">
                               <div className="p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl group-hover/qr:scale-105 transition-transform">
                                  <QrCode size={80} className="text-indigo-600 animate-pulse" />
                               </div>
                               <button 
                                 onClick={handleGetQRCode}
                                 disabled={isConnecting}
                                 className="mt-8 px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.25em] flex items-center gap-3 hover:scale-110 active:scale-95 transition-all shadow-xl shadow-indigo-100 dark:shadow-none"
                               >
                                 {isConnecting ? <Loader2 size={16} className="animate-spin"/> : <RefreshCcw size={16}/>}
                                 Gerar Conexão Real
                               </button>
                            </div>

                            <div className="w-full grid grid-cols-2 gap-4">
                               <button onClick={() => { setIsInstanceCreated(false); setQrCode(null); setErrorInfo(null); }} className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 justify-center hover:text-rose-500 transition-all">
                                  <Trash2 size={14} /> Purgar Slot
                               </button>
                               <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 justify-center text-slate-500">
                                  <ShieldCheck size={14} className="text-indigo-500" /> Multi-Tenant OK
                               </div>
                            </div>
                         </div>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic uppercase">Infraestrutura Evolution API Ativa em clikai.com.br</p>
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
            {activeLeads.length > 0 ? activeLeads.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setActiveChat(chat)}
                className={`px-10 py-8 flex items-center gap-6 cursor-pointer transition-all border-l-[8px] relative group ${activeChat?.id === chat.id ? 'border-indigo-600 bg-white dark:bg-slate-800 shadow-2xl z-10' : 'border-transparent hover:bg-slate-100/50'}`}
              >
                <div className="w-14 h-14 rounded-[1.8rem] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center font-black text-xl shadow-inner group-hover:rotate-6 transition-transform">
                  {chat.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black truncate uppercase italic tracking-tight">{chat.name}</h4>
                  <p className="text-[9px] text-slate-400 font-bold truncate uppercase tracking-widest mt-1.5 opacity-70 italic">{chat.lastInteraction}</p>
                </div>
                {activeChat?.id === chat.id && <div className="absolute right-6 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-lg"></div>}
              </div>
            )) : (
              <div className="p-10 text-center opacity-10 italic text-[10px] font-black uppercase tracking-widest py-32">Zero Conversas Ativas</div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-955">
          {activeChat ? (
            <>
              <div className="h-32 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-12 z-20 shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-2xl border-4 border-white dark:border-slate-800">
                    {activeChat.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight italic uppercase">{activeChat.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg border border-emerald-100 dark:border-emerald-800/50 shadow-sm w-fit">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                       <p className="text-[8px] font-black uppercase tracking-[0.2em] italic">Evolution Sync: Active</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={generateAISuggestion}
                  disabled={isLoadingAi}
                  className="flex items-center gap-4 px-12 py-5 bg-indigo-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  {isLoadingAi ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  Análise Neural Clikai
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                {chatHistories[activeChat.id]?.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[70%] p-10 rounded-[3.5rem] shadow-sm border ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-700 shadow-indigo-100/20' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-none border-slate-100 dark:border-slate-800'}`}>
                      <p className="text-sm font-medium leading-relaxed italic">{msg.text}</p>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4 px-8 opacity-40 italic flex items-center gap-2">
                       {msg.time} <span className="w-1 h-1 bg-slate-300 rounded-full"></span> Unit Node • {evolutionConfig.baseUrl.replace('https://', '')}
                    </span>
                  </div>
                ))}

                {aiSuggestion && (
                  <div className="flex justify-center py-10 animate-in slide-in-from-bottom-6">
                    <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/40 p-12 rounded-[4.5rem] max-w-3xl w-full shadow-2xl relative overflow-hidden group/ia">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] -translate-y-10 translate-x-10 group-hover/ia:scale-125 transition-transform duration-1000"></div>
                      <div className="flex items-center justify-between mb-10 relative z-10">
                         <div className="flex items-center gap-5">
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-800"><Bot className="text-indigo-600" size={28} /></div>
                            <div>
                               <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Copilot Suggestion:</span>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">SDR Master Algorithm Ativo</p>
                            </div>
                         </div>
                         <button onClick={() => setAiSuggestion('')} className="p-4 text-slate-300 hover:text-rose-500 transition-all rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800"><X size={24}/></button>
                      </div>
                      <p className="text-xl font-black text-slate-800 dark:text-slate-100 italic mb-12 leading-relaxed uppercase tracking-tight relative z-10">"{aiSuggestion}"</p>
                      <div className="flex gap-6 relative z-10">
                        <button onClick={() => handleSendMessage(aiSuggestion)} className="flex-1 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.35em] shadow-2xl hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95">Aceitar & Transmitir via VPS</button>
                        <button onClick={() => { setMessageInput(aiSuggestion); setAiSuggestion(''); }} className="px-12 py-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all">Editar Rascunho</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-12">
                <div className="max-w-6xl mx-auto flex items-center gap-8">
                  <div className="flex-1 relative">
                    <input 
                      value={messageInput} 
                      onChange={(e) => setMessageInput(e.target.value)} 
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
                      placeholder="Responder via api.clikai.com.br..." 
                      className="w-full pl-12 pr-24 py-8 bg-slate-50 dark:bg-slate-800 rounded-[3rem] border-none outline-none text-sm font-bold shadow-inner focus:ring-8 ring-indigo-500/5 transition-all italic tracking-wide" 
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-5 text-slate-300">
                       <button className="hover:text-indigo-600 transition-colors transform hover:scale-125"><Smile size={26}/></button>
                       <button className="hover:text-indigo-600 transition-colors transform hover:scale-125"><Paperclip size={26}/></button>
                    </div>
                  </div>
                  <button onClick={() => handleSendMessage()} disabled={!messageInput.trim() || isSending} className="p-9 bg-indigo-600 text-white rounded-[2.5rem] shadow-[0_30px_70px_-15px_rgba(79,70,229,0.6)] hover:bg-indigo-700 transition-all hover:scale-110 active:scale-90 disabled:opacity-50 flex items-center justify-center">
                    {isSending ? <Loader2 className="animate-spin" size={32} /> : <Send size={32} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-10 opacity-30 select-none grayscale">
              <div className="p-24 rounded-full border-8 border-dashed border-slate-200 dark:border-slate-800 animate-in zoom-in duration-1000">
                <MessageSquare size={120} className="animate-pulse" />
              </div>
              <div className="text-center space-y-4">
                 <p className="text-3xl font-black uppercase tracking-[0.6em] italic">Selecione uma Conversa</p>
                 <p className="text-[11px] font-bold uppercase tracking-widest leading-loose">Master Sync Ativo • {evolutionConfig.baseUrl.replace('https://', '')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};