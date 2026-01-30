
import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit3, Trash2, Loader2, Bot, Target } from 'lucide-react';
import { Lead, Campaign, LeadStatus, AppModule } from '../types';

interface BroadcastManagerProps {
  leads: Lead[];
  isWhatsAppConnected: boolean;
  onNavigate: (module: AppModule) => void;
  notify: (msg: string) => void;
}

const API_URL = '/api/core.php';

export const BroadcastManager: React.FC<BroadcastManagerProps> = ({ leads, isWhatsAppConnected, notify }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [form, setForm] = useState<Partial<Campaign>>({ name: '', template: '' });

  // ... (Lógica de CRUD de campanhas mantida igual, focando na IA) ...

  const generateIAContent = async () => {
    setIsGeneratingIA(true);
    try {
      const prompt = `Escreva uma mensagem curta de WhatsApp para vender "${form.productName || 'meu produto'}" para leads frios. Use tom persuasivo e placeholder {nome}.`;
      
      const response = await fetch(`${API_URL}?action=ai-completion`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('z_session_token')}` },
          body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      setForm(prev => ({ ...prev, template: data.text || '' }));
      notify('Copy IA gerada!');
    } catch (err) {
      notify('Erro na IA.');
    } finally {
      setIsGeneratingIA(false);
    }
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in pb-40">
        <div className="flex justify-between items-center">
           <h1 className="text-3xl font-black italic uppercase">Disparos</h1>
           <button className="bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold uppercase text-xs">Nova Campanha</button>
        </div>
        
        {/* Exemplo de uso da IA no formulário (simplificado) */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200">
            <h3 className="font-bold mb-4">Gerador de Copy</h3>
            <div className="flex gap-4">
                <textarea 
                    value={form.template} 
                    onChange={e => setForm({...form, template: e.target.value})}
                    className="flex-1 p-4 bg-slate-50 rounded-2xl border-none outline-none"
                    placeholder="Digite sua mensagem ou use a IA..."
                />
                <button onClick={generateIAContent} disabled={isGeneratingIA} className="px-6 bg-indigo-50 text-indigo-600 rounded-2xl font-bold uppercase text-xs flex flex-col items-center justify-center gap-2">
                    {isGeneratingIA ? <Loader2 className="animate-spin"/> : <Bot />}
                    Gerar com IA
                </button>
            </div>
        </div>
    </div>
  );
};
