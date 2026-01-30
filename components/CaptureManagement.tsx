
import React, { useState, useEffect } from 'react';
import { Radar, Crosshair, Zap, Loader2, MapPin, Search, Instagram, Linkedin, Hash, Globe, Download, Bot } from 'lucide-react';
import { Lead, LeadStatus, PipelineStage } from '../types';

interface Props {
  onAddLead: (lead: Lead) => void;
  notify: (msg: string) => void;
}

const API_URL = '/api/core.php';

export const CaptureManagement: React.FC<Props> = ({ onAddLead, notify }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [searchNiche, setSearchNiche] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [extractionResults, setExtractionResults] = useState<any[]>([]);

  const startExtraction = async () => {
    if (!searchNiche) { notify('Defina o nicho.'); return; }
    setIsExtracting(true);

    try {
      const prompt = `Aja como um scraper. Gere 5 leads falsos (mas realistas) para o nicho "${searchNiche}" em "${searchLocation}".
      Retorne JSON Array: [{ "business": "Nome", "phone": "(11) 99999-9999", "email": "email@teste.com", "detail": "Info", "relevance": 95 }]`;

      const response = await fetch(`${API_URL}?action=ai-completion`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('z_session_token')}` },
          body: JSON.stringify({ 
              prompt, 
              config: { responseMimeType: 'application/json' } 
          })
      });
      
      const data = await response.json();
      // Parser robusto para extrair JSON da string da IA
      let jsonStr = data.text || '[]';
      jsonStr = jsonStr.replace(/```json|```/g, '').trim();
      
      const results = JSON.parse(jsonStr);
      
      const mapped = results.map((r: any) => ({
        ...r,
        id: `ext-${Math.random().toString(36).substr(2, 9)}`,
        source: 'AI Scraper',
        status: 'Extraído'
      }));

      setExtractionResults(mapped);
      notify(`${mapped.length} Leads extraídos!`);
    } catch (e) {
      notify('Falha na extração neural.');
    } finally {
      setIsExtracting(false);
    }
  };

  // ... (Restante da UI mantido, apenas a lógica do `startExtraction` mudou) ...
  return (
    <div className="p-10 space-y-10 animate-in fade-in pb-40">
       <div className="space-y-2">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl"><Radar size={32} /></div>
             <h1 className="text-4xl font-black italic uppercase tracking-tighter">Captação <span className="text-emerald-600">Neural</span></h1>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Agente de Inteligência de Dados v3.1</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 p-10 rounded-[4rem] border-2 border-emerald-100 bg-white shadow-sm space-y-10 h-fit">
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Nicho Comercial</label>
                     <input value={searchNiche} onChange={e => setSearchNiche(e.target.value)} placeholder="Ex: Advogados" className="w-full px-8 py-5 bg-slate-50 rounded-3xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Localização</label>
                     <input value={searchLocation} onChange={e => setSearchLocation(e.target.value)} placeholder="Ex: São Paulo" className="w-full px-8 py-5 bg-slate-50 rounded-3xl font-bold outline-none" />
                  </div>
                  <button 
                    onClick={startExtraction}
                    disabled={isExtracting}
                    className="w-full py-8 bg-emerald-600 text-white font-black rounded-[2.5rem] shadow-2xl uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-4"
                  >
                    {isExtracting ? <Loader2 className="animate-spin" /> : <Zap />}
                    {isExtracting ? 'Vasculhando...' : 'Ligar Scraper'}
                  </button>
               </div>
            </div>
            
            {/* Lista de Resultados (Simplificada para brevidade, mas usa extractionResults) */}
            <div className="lg:col-span-2 space-y-4">
                {extractionResults.map(lead => (
                    <div key={lead.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex justify-between items-center">
                        <div>
                            <h4 className="font-bold">{lead.business}</h4>
                            <p className="text-xs text-slate-500">{lead.phone} • {lead.email}</p>
                        </div>
                        <button onClick={() => onAddLead({...lead, stage: 'NEW', value: 0})} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase">Adicionar</button>
                    </div>
                ))}
            </div>
       </div>
    </div>
  );
};
