
import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, Bot, ArrowRight } from 'lucide-react';

interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: any) => void;
}

const API_URL = '/api/core.php';

export const AISearchModal: React.FC<AISearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const prompt = `Usuário perguntou: "${searchQuery}". Sugira um módulo do sistema (admin, results, prospecting) e dê uma resposta curta. Retorne JSON: {"targetModule": "string", "insight": "string"}`;
      
      const response = await fetch(`${API_URL}?action=ai-completion`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('z_session_token')}` },
          body: JSON.stringify({ prompt, config: { responseMimeType: 'application/json' } })
      });

      const data = await response.json();
      let jsonStr = data.text.replace(/```json|```/g, '').trim();
      setResult(JSON.parse(jsonStr));
    } catch (error) {
      setResult({ insight: "Erro ao processar.", targetModule: null });
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-start justify-center pt-32 px-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="flex items-center p-6 border-b border-slate-100">
           <Search className="text-slate-400 mr-4" />
           <input autoFocus value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && runSearch(query)} placeholder="Pergunte à IA..." className="flex-1 text-xl font-bold outline-none" />
           <button onClick={onClose}><X /></button>
        </div>
        <div className="p-8 min-h-[200px] flex flex-col justify-center items-center">
           {isSearching ? <Loader2 className="animate-spin text-indigo-600" size={40} /> : result ? (
               <div className="text-center space-y-4">
                   <p className="text-lg font-medium text-slate-600">"{result.insight}"</p>
                   {result.targetModule && <button onClick={() => { onNavigate(result.targetModule); onClose(); }} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase text-xs">Ir para Módulo</button>}
               </div>
           ) : <div className="text-slate-400 font-bold uppercase text-xs">Digite para buscar inteligência...</div>}
        </div>
      </div>
    </div>
  );
};
