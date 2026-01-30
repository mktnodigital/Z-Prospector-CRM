import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Loader2, Smartphone, CheckCheck } from 'lucide-react';
import { Lead, Tenant, EvolutionConfig } from '../types';

const API_URL = '/api/core.php';

export interface WhatsAppInboxProps {
  niche: string;
  activeLeads: Lead[];
  onSchedule: () => void;
  tenant: Tenant;
  evolutionConfig: EvolutionConfig;
  notify: (msg: string) => void;
  onConnectionChange: (status: string) => Promise<void>;
}

export const WhatsAppInbox: React.FC<WhatsAppInboxProps> = ({ activeLeads, tenant, evolutionConfig, notify }) => {
  const [activeChat, setActiveChat] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const instanceName = `master_${tenant.id}`;

  const handleSendMessage = async () => {
    if (!activeChat || !messageInput.trim()) return;
    setIsSending(true);

    const tempMsg = { id: Date.now(), sender: 'me', text: messageInput, time: 'Agora', status: 'sent' };
    setMessages(prev => [...prev, tempMsg]);
    const textToSend = messageInput;
    setMessageInput('');

    try {
       // 1. Persistir no DB
       await fetch(`${API_URL}?action=save-message`, {
           method: 'POST',
           headers: { 
               'Authorization': `Bearer ${localStorage.getItem('z_session_token')}`,
               'X-Tenant-ID': tenant.id 
           },
           body: JSON.stringify({ lead_id: activeChat.id, sender: 'me', text: textToSend, type: 'text' })
       });

       // 2. Enviar via Proxy (Seguro)
       if (tenant.instanceStatus === 'CONNECTED') {
           const cleanPhone = activeChat.phone.replace(/\D/g, '');
           const jid = cleanPhone.includes('@') ? cleanPhone : `${cleanPhone}@s.whatsapp.net`;
           
           await fetch(`${API_URL}?action=proxy-evolution`, {
               method: 'POST',
               headers: { 'Authorization': `Bearer ${localStorage.getItem('z_session_token')}` },
               body: JSON.stringify({
                   endpoint: `/message/sendText/${instanceName}`,
                   payload: { number: jid, text: textToSend, delay: 1200 }
               })
           });
       }
    } catch (e) {
       notify('Erro no envio.');
    } finally {
       setIsSending(false);
    }
  };

  // ... (Restante da UI mantida) ...
  return (
    <div className="h-full flex bg-slate-900 text-white">
        {/* Sidebar Simplificada */}
        <div className="w-80 border-r border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-800 font-bold uppercase tracking-widest text-xs text-slate-400">Conversas</div>
            <div className="flex-1 overflow-y-auto">
                {activeLeads.map(lead => (
                    <div key={lead.id} onClick={() => setActiveChat(lead)} className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800 ${activeChat?.id === lead.id ? 'bg-slate-800' : ''}`}>
                        <div className="font-bold text-sm">{lead.name}</div>
                        <div className="text-xs text-slate-500 truncate">{lead.lastInteraction || 'Sem mensagens'}</div>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
            {activeChat ? (
                <>
                    <div className="h-16 border-b border-slate-800 flex items-center px-6 font-bold">{activeChat.name}</div>
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.sender === 'me' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-slate-800 bg-slate-900 flex gap-4">
                        <input 
                            className="flex-1 bg-slate-800 rounded-xl px-4 outline-none text-sm" 
                            value={messageInput} 
                            onChange={e => setMessageInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Digite sua mensagem..."
                        />
                        <button onClick={handleSendMessage} disabled={isSending} className="p-3 bg-indigo-600 rounded-xl hover:bg-indigo-700">
                            {isSending ? <Loader2 className="animate-spin" size={20}/> : <Send size={20}/>}
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-600 flex-col gap-4">
                    <Smartphone size={48} />
                    <p>Selecione um chat</p>
                </div>
            )}
        </div>
    </div>
  );
};