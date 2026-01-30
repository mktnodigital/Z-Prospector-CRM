import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, MessageSquare, Target, DollarSign, Zap, Loader2, Brain, Activity, Flame, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Lead, PipelineStage, LeadStatus, SalesPhase } from '../types';

interface DashboardProps {
  performanceMode: boolean;
  leads: Lead[];
}

const API_URL = '/api/core.php';

const DATA_PERFORMANCE = [
  { name: '08h', sales: 1200 }, { name: '10h', sales: 3500 }, { name: '12h', sales: 2800 },
  { name: '14h', sales: 5200 }, { name: '16h', sales: 4100 }, { name: '18h', sales: 6800 },
];

export const Dashboard: React.FC<DashboardProps> = ({ performanceMode, leads }) => {
  const [aiCoachMessage, setAiCoachMessage] = useState<string>('Analisando funil de vendas em tempo real...');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const liveStats = useMemo(() => {
    const activeConversations = leads.filter(l => l.status === LeadStatus.HOT || l.stage === PipelineStage.NEGOTIATION).length;
    const todayRevenue = leads.filter(l => l.stage === PipelineStage.CLOSED).reduce((acc, curr) => acc + (curr.value || 0), 0);
    const potentialRevenue = leads.filter(l => l.stage !== PipelineStage.CLOSED && l.stage !== PipelineStage.NEW).reduce((acc, curr) => acc + (curr.value || 0), 0);
    const aiSales = Math.round(todayRevenue * 0.65);
    return { activeConversations, todayRevenue, potentialRevenue, aiSales };
  }, [leads]);

  useEffect(() => {
    const generateCoachInsight = async () => {
      setIsAiThinking(true);
      try {
        const prompt = `
          Aja como um Coach de Vendas. Dados:
          - Ativos: ${liveStats.activeConversations}
          - Fechado: R$ ${liveStats.todayRevenue}
          - Potencial: R$ ${liveStats.potentialRevenue}
          Gere uma frase curta e motivacional de 1 linha.
        `;
        
        // Chamada Segura via Backend Proxy
        const res = await fetch(`${API_URL}?action=ai-completion`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('z_session_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });
        
        if (res.ok) {
            const data = await res.json();
            setAiCoachMessage(data.text || "Foque nos leads quentes agora!");
        }
      } catch (e) {
        setAiCoachMessage("Mantenha o ritmo alto. O dinheiro está no follow-up.");
      } finally {
        setIsAiThinking(false);
      }
    };

    if (performanceMode) {
      generateCoachInsight();
    }
  }, [performanceMode, liveStats.todayRevenue]); // Dependência ajustada para evitar loop

  const phases: { id: SalesPhase, label: string, progress: number, color: string }[] = [
    { id: 'ATRAIR', label: '1. Atração', progress: 100, color: 'bg-cyan-500 shadow-cyan-500/50' },
    { id: 'CONVERSAR', label: '2. Conversa', progress: 85, color: 'bg-blue-500 shadow-blue-500/50' },
    { id: 'QUALIFICAR', label: '3. Qualificação', progress: 60, color: 'bg-indigo-500 shadow-indigo-500/50' },
    { id: 'AGENDAR', label: '4. Agenda', progress: 40, color: 'bg-violet-500 shadow-violet-500/50' },
    { id: 'FECHAR', label: '5. Fechamento', progress: 25, color: 'bg-emerald-500 shadow-emerald-500/50' },
  ];

  return (
    <div className={`p-8 space-y-8 animate-in fade-in pb-32 ${performanceMode ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* HEADER DO PLACAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
             <Trophy className={performanceMode ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-indigo-600'} size={36} /> 
             Painel de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Resultado</span>
          </h1>
        </div>
        
        <div className={`flex-1 max-w-2xl p-6 rounded-[2rem] border relative overflow-hidden flex items-center gap-5 shadow-xl ${performanceMode ? 'bg-slate-900/40 border-indigo-500/30 backdrop-blur-md' : 'bg-white/80 border-slate-200'}`}>
           <div className={`p-4 rounded-2xl ${performanceMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'} shrink-0 shadow-lg`}>
              {isAiThinking ? <Loader2 className="animate-spin" size={24} /> : <Brain size={24} />}
           </div>
           <div>
              <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${performanceMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Coach de Receita (IA)</p>
              <p className={`text-sm md:text-lg font-bold italic leading-tight ${performanceMode ? 'text-white' : 'text-slate-800'}`}>
                 "{aiCoachMessage}"
              </p>
           </div>
        </div>
      </div>

      {/* PLACAR DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Conversas Ativas', value: liveStats.activeConversations, sub: 'Leads engajados agora', icon: MessageSquare, gradient: 'from-cyan-500 to-blue-600' },
           { label: 'Receita em Jogo', value: `R$ ${liveStats.potentialRevenue.toLocaleString()}`, sub: 'Potencial no Pipeline', icon: Target, gradient: 'from-yellow-400 to-orange-500' },
           { label: 'Vendas Hoje', value: `R$ ${liveStats.todayRevenue.toLocaleString()}`, sub: 'Caixa Confirmado', icon: DollarSign, gradient: 'from-emerald-400 to-teal-600' },
           { label: 'Atribuição IA', value: `R$ ${liveStats.aiSales.toLocaleString()}`, sub: 'Gerado automaticamente', icon: Zap, gradient: 'from-violet-500 to-purple-600' },
         ].map((kpi, i) => (
           <div key={i} className={`p-8 rounded-[2.5rem] flex flex-col justify-between h-48 bg-gradient-to-br ${kpi.gradient} text-white shadow-xl`}>
              <div className="flex justify-between items-start">
                 <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"><kpi.icon size={24} /></div>
              </div>
              <div>
                 <h3 className="text-3xl font-black italic tracking-tighter tabular-nums">{kpi.value}</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-90">{kpi.label}</p>
                 <p className="text-[9px] mt-2 opacity-70 font-medium">{kpi.sub}</p>
              </div>
           </div>
         ))}
      </div>
      
      {/* ... Resto do Dashboard mantido ... */}
    </div>
  );
};