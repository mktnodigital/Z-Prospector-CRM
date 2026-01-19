
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
  
  // Estados de Conexão e Instância
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

  // Polling de Status Robusto
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
          console.debug("Handshake em curso...");
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isInstanceCreated, connStatus, instanceName, evolutionConfig]);

  const handleConnectionSuccess = () => {
    setConnStatus('CONNECTED');
    setShowSuccessOverlay(true);
    if (onConnectionChange) onConnectionChange(true);
    notify('WhatsApp Conectado via Hub Master!');
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

    addLog(`INIT: Acessando Core api.clikai.com.br...`);
    
    try {
      // 1. Pre-Check de Sessão Ativa
      addLog(`AUDIT: Verificando sockets de "${instanceName}"...`);
      const checkState = await fetch(`${evolutionConfig.baseUrl}/instance/connectionState/${instanceName}`, {
        headers: { 'apikey': evolutionConfig.apiKey }
      });
      const stateData = await checkState.json();
      const st = stateData.instance?.state || stateData.state;

      if (st === 'open' || st === 'CONNECTED') {
        addLog(`SUCCESS: Sessão Master já sincronizada.`);
        setIsInstanceCreated(true);
        handleConnectionSuccess();
        return;
      }

      // 2. Garantir que a instância existe
      addLog(`ENGINE: Mapeando nó no cluster...`);
      const createRes = await fetch(`${evolutionConfig.baseUrl}/instance/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': evolutionConfig.apiKey },
        body: JSON.stringify({ instanceName, qrcode: true })
      });
      
      const createData = await createRes.json();
      if (!createRes.ok && createData.message?.includes('already exists')) {
        addLog(`INFO: Nó existente. Redirecionando tráfego.`);
      } else if (createRes.ok) {
        addLog(`SUCCESS: Novo nó provisionado.`);
      }

      setIsInstanceCreated(true);
      
      // 3. Handshake com tratamento de retornos variados
      addLog(`CRYPTO: Iniciando protocolo de pareamento...`);
      const connectRes = await fetch(`${evolutionConfig.baseUrl}/instance/connect/${instanceName}`, { 
        method: 'GET', 
        headers: { 'apikey': evolutionConfig.apiKey } 
      });
      
      const connectData = await connectRes.json();
      
      // Analisar retorno
      const base64 = connectData.base64 || connectData.qrcode?.base64 || (connectData.code && connectData.code.length > 50 ? connectData.code : null);
      const state = connectData.instance?.state || connectData.state || connectData.status;

      if (base64) {
        const finalUrl = base64.startsWith('data:image') ? base64 : `data:image/png;base64,${base64}`;
        setQrCode(finalUrl);
        addLog(`READY: QR Code estabilizado. Escaneie agora.`);
      } else if (state === 'open' || state === 'connecting' || state === 'CONNECTED') {
        addLog(`INFO: Protocolo em curso (${state}). Sincronizando...`);
        // Se estiver 'connecting', o polling cuidará do sucesso final
        if (state === 'open' || state === 'CONNECTED') handleConnectionSuccess();
      } else {
        const errorMsg = connectData.message || connectData.error || "Retorno desconhecido";
        addLog(`ERROR: Resposta do Hub: "${errorMsg}"`);
        notify(`Erro no Core Evolution: ${errorMsg}`);
        // Log para console para debug técnico do desenvolvedor
        console.error("DEBUG EVOLUTION:", connectData);
      }

    } catch (err: any) {
      addLog(`FATAL: Falha no Túnel SSL.`);
      addLog(`DETAIL: ${err.message}`);
      notify('O servidor Evolution não respondeu.');
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
    const link = label.includes('Pix') ? 'PIX-KEY-MASTER-0001' : 'https://clikai.com.br/checkout/premium';
    handleSendMessage(`Segue o link para o pagamento via ${label}: ${link}`);
    setShowPaymentShortcuts(false);
    notify('Link enviado!');
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-955 overflow-hidden relative">
      
      {showSuccessOverlay && (
        <div className="absolute inset-0 z-[200] bg-emerald-600 flex flex-col items-center justify-center text-white animate-in fade-in duration-700">
           <div className="p-10 bg-white/20 rounded-full animate-bounce mb-8">
              <CheckCircle2 size={120} />
           </div>
           <h2 className="text-6xl font-black italic uppercase tracking-tighter">Conectado!</h2>
           <p className="text-xl font-bold uppercase tracking-[0.4em] opacity-80 mt-4">Sincronizando Mensagens Neural...</p>
        </div>
      )}

      {connStatus !== 'CONNECTED' && (
        <div className="absolute inset-0 z-[100] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in">
           <div className="max-w-5xl w-full bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
              
              <div className="w-full md:w-5/12 p-12 bg-