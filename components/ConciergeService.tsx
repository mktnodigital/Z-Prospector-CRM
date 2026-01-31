
import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, Clock, MessageSquare, 
  ArrowRight, Zap, PenTool, GitBranch, Bot, 
  Send, Loader2, PlayCircle, Settings, Crown, Phone
} from 'lucide-react';

interface ConciergeServiceProps {
  notify: (msg: string) => void;
}

interface ServiceRequest {
  id: string;
  type: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  date: string;
  description: string;
}

const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: 'req_1',
    type: 'AI_TUNING',
    title: 'Ajuste de Tom da IA',
    status: 'COMPLETED',
    date: 'Hoje, 10:00',
    description: 'Deixar a IA mais agressiva no fechamento.'
  },
  {
    id: 'req_2',
    type: 'NEW_FLOW',
    title: 'Automação Pós-Venda',
    status: 'IN_PROGRESS',
    date: 'Ontem, 15:30',
    description: 'Enviar mensagem 2 dias após a compra pedindo feedback.'
  }
];

// Helper icon component
const ShoppingCartIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);

const SERVICE_CATALOG = [
  { id: 'setup_ia', title: 'Treinar IA de Vendas', desc: 'Ajuste o prompt para seu nicho.', icon: Bot, color: 'indigo' },
  { id: 'new_flow', title: 'Novo Fluxo de Cadência', desc: 'Automação de mensagens sequenciais.', icon: GitBranch, color: 'rose' },
  { id: 'integrate_crm', title: 'Integração CRM Externo', desc: 'Conectar com RD Station ou Pipedrive.', icon: Zap, color: 'amber' },
  { id: 'recover_checkout', title: 'Recuperação de Carrinho', desc: 'Estratégia para vendas perdidas.', icon: ShoppingCartIcon, color: 'emerald' },
];

export const ConciergeService: React.FC<ConciergeServiceProps> = ({ notify }) => {
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [activeRequestType, setActiveRequestType] = useState<string | null>(null);
  const [requestText, setRequestText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestText.trim()) return;

    setIsSubmitting(true);
    
    // Simulação de envio para o time de suporte
    setTimeout(() => {
      const newRequest: ServiceRequest = {
        id: `req_${Date.now()}`,
        type: activeRequestType || 'CUSTOM',
        title: activeRequestType ? SERVICE_CATALOG.find(s => s.id === activeRequestType)?.title || 'Solicitação Personalizada' : 'Solicitação Personalizada',
        status: 'PENDING',
        date: 'Agora',
        description: requestText
      };
      
      setRequests([newRequest, ...requests]);
      setRequestText('');
      setActiveRequestType(null);
      setIsSubmitting(false);
      notify('Solicitação enviada para nossa equipe de especialistas!');
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest"><CheckCircle2 size={12}/> Concluído</span>;
      case 'IN_PROGRESS': return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-[9px] font-black uppercase tracking-widest"><Settings size={12} className="animate-spin"/> Executando</span>;
      default: return <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest"><Clock size={12}/> Na Fila</span>;
    }
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in pb-40">
      
      {/* HEADER CONCIERGE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-4">
              <div className="p-4 bg-amber-500 text-white rounded-2xl shadow-xl shadow-amber-500/20 rotate-3"><Sparkles size={32} /></div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">Concierge <span className="text-amber-500">Premium</span></h1>
           </div>
           <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 italic pl-2">Setup "Done For You" • Nós configuramos, você lucra.</p>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-4 rounded-2xl border border-amber-100 dark:border-amber-800/50 flex items-center gap-4">
           <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
           <p className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-widest">Equipe de Engenharia Disponível</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* FORMULÁRIO DE SOLICITAÇÃO */}
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border-2 border-slate-50 dark:border-slate-800 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               
               <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-8 relative z-10">O que você precisa hoje?</h3>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
                  {SERVICE_CATALOG.map(srv => (
                    <button 
                      key={srv.id}
                      onClick={() => setActiveRequestType(srv.id)}
                      className={`p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center text-center gap-3 group ${
                        activeRequestType === srv.id 
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-lg scale-105' 
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-amber-200'
                      }`}
                    >
                       <div className={`p-3 rounded-xl ${activeRequestType === srv.id ? 'bg-amber-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 group-hover:text-amber-500'} shadow-sm transition-colors`}>
                          <srv.icon size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-tight leading-tight mb-1 dark:text-slate-200">{srv.title}</p>
                       </div>
                    </button>
                  ))}
               </div>

               <form onSubmit={handleSubmitRequest} className="relative z-10">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-end gap-2 focus-within:ring-4 ring-amber-500/10 transition-all">
                     <textarea 
                       value={requestText}
                       onChange={e => setRequestText(e.target.value)}
                       placeholder={activeRequestType ? `Descreva detalhes para: ${SERVICE_CATALOG.find(s => s.id === activeRequestType)?.title}...` : "Descreva qualquer automação ou ajuste que você precisa..."}
                       className="w-full bg-transparent border-none outline-none p-6 text-sm font-bold text-slate-600 dark:text-slate-300 resize-none h-32 placeholder:text-slate-400 placeholder:italic placeholder:font-normal"
                     />
                     <button 
                       type="submit"
                       disabled={!requestText.trim() || isSubmitting}
                       className="mb-2 mr-2 p-4 bg-amber-500 text-white rounded-full shadow-xl hover:bg-amber-600 transition-all disabled:opacity-50 hover:scale-110 active:scale-95"
                     >
                        {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                     </button>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4 pl-4 flex items-center gap-2">
                     <Clock size={12}/> Tempo médio de implementação: 2 a 4 horas úteis.
                  </p>
               </form>
            </div>

            {/* GERENTE DE CONTA DEDICADO (NOVO) */}
            <div className="p-8 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[3rem] shadow-2xl relative overflow-hidden text-white group cursor-pointer hover:shadow-indigo-500/20 transition-all">
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-x-10 -translate-y-10 group-hover:bg-white/10 transition-colors"></div>
               
               <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="relative">
                     <div className="w-24 h-24 rounded-[2rem] bg-white p-1 shadow-lg">
                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover rounded-[1.8rem]" />
                     </div>
                     <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-2 border-slate-900">
                        <Phone size={14} className="animate-pulse" />
                     </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                     <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <Crown size={16} className="text-yellow-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-300">Acesso Exclusivo</span>
                     </div>
                     <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Falar com Gerente de Contas</h3>
                     <p className="text-[11px] font-bold text-slate-300 leading-relaxed mb-6">
                        Você possui atendimento prioritário na Fila VIP. Agende reuniões estratégicas, peça análises de funil e suporte de crise diretamente.
                     </p>
                     
                     <div className="flex gap-3 justify-center md:justify-start">
                        <button onClick={() => notify("Chamando Gerente no WhatsApp VIP...")} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg hover:scale-105">
                           Chamar no WhatsApp
                        </button>
                        <button onClick={() => notify("Agendamento prioritário solicitado.")} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                           Agendar Call
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* HISTÓRICO DE SOLICITAÇÕES */}
         <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border-2 border-slate-50 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden max-h-[800px]">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
               <h3 className="text-lg font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100">Histórico de Pedidos</h3>
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{requests.length} Solicitações Totais</p>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
               {requests.map(req => (
                 <div key={req.id} className="p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all group">
                    <div className="flex justify-between items-start mb-3">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{req.date}</span>
                       {getStatusBadge(req.status)}
                    </div>
                    <h4 className="text-sm font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-200 mb-2">{req.title}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-xl italic">"{req.description}"</p>
                    
                    {req.status === 'COMPLETED' && (
                       <button className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                          Ver Implementação <ArrowRight size={12}/>
                       </button>
                    )}
                 </div>
               ))}
            </div>
         </div>

      </div>
    </div>
  );
};
