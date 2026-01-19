
import React, { useState, useEffect } from 'react';
import { Search, X, Sparkles, Loader2, ArrowRight, Bot, Target, User, MessageSquare } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: any) => void;
}

export const AISearchModal: React.FC<AISearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Aja como o assistente central do CRM Z-Prospector. O usuário perguntou: "${query}". 
      Com base na pergunta, sugira qual módulo do sistema ele deve acessar e forneça um insight curto.
      Módulos disponíveis: admin, results, capture, prospecting, inbox, broadcast, scheduling, products, payments.
      Retorne JSON: { "targetModule": "string", "insight": "string", "actionLabel": "string" }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      setResult(JSON.parse(response.text || '{}'));
    } catch (error) {
      setResult({ insight: "Não consegui processar a busca agora. Tente navegar manualmente.", targetModule: null });
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-start justify-center pt-32 px-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
        <form onSubmit={handleSearch} className="relative flex items-center p-8 border-b border-slate-100 dark:border-slate-800">
          <Search className="text-slate-400 mr-4" size={24} />
          <input 
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pergunte à IA: 'Como estão minhas vendas?' ou 'Quero prospectar'..."
            className="flex-1 bg-transparent border-none outline-none font-bold text-xl dark:text-white placeholder:text-slate-300"
          />
          <button type="button" onClick={onClose} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
            <X size={24} />
          </button>
        </form>

        <div className="p-8 min-h-[200px] flex flex-col justify-center">
          {isSearching ? (
            <div className="flex flex-col items-center gap-4 text-indigo-600">
               <Loader2 className="animate-spin" size={40} />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Consultando Core Neural Clikai...</p>
            </div>
          ) : result ? (
            <div className="animate-in slide-in-from-bottom-4">
               <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-xl">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h4 className="font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-200">Recomendação IA</h4>
                  </div>
               </div>
               <p className="text-lg font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic mb-8">"{result.insight}"</p>
               
               {result.targetModule && (
                 <button 
                   onClick={() => { onNavigate(result.targetModule); onClose(); }}
                   className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all group"
                 >
                   {result.actionLabel || 'Acessar Módulo'} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                 </button>
               )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-transparent hover:border-indigo-500/20 cursor-pointer transition-all">
                  Sugestão: "Qual o ROI de hoje?"
               </div>
               <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-transparent hover:border-indigo-500/20 cursor-pointer transition-all">
                  Sugestão: "Provisionar WhatsApp"
               </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Sparkles size={14} className="text-indigo-500" />
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Powered by Gemini 3.0 clikai.com.br</span>
           </div>
           <span className="text-[9px] font-bold text-slate-300 uppercase">ESC para fechar</span>
        </div>
      </div>
    </div>
  );
};
