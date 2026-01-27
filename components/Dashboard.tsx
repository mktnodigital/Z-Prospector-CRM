
import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, Users, MessageSquare, DollarSign, 
  ArrowUpRight, ArrowDownRight, Clock,
  Brain, Zap, Trophy, Target, X, Activity, BarChart3, PieChart as PieChartIcon,
  ChevronRight, ArrowRight, ShieldCheck, Loader2, Sparkles, Filter,
  Calendar, CheckCircle2, AlertCircle, RefreshCcw, Flame
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { Lead, PipelineStage, LeadStatus, SalesPhase } from '../types';

interface DashboardProps {
  performanceMode: boolean;
  leads: Lead[];
}

const DATA_PERFORMANCE = [
  { name: '08h', sales: 1200 },
  { name: '10h', sales: 3500 },
  { name: '12h', sales: 2800 },
  { name: '14h', sales: 5200 },
  { name: '16h', sales: 4100 },
  { name: '18h', sales: 6800 },
];

export const Dashboard: React.FC<DashboardProps> = ({ performanceMode, leads }) => {
  const [aiCoachMessage, setAiCoachMessage] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Cálculos em Tempo Real para o PLACAR
  const liveStats = useMemo(() => {
    const activeConversations = leads.filter(l => l.status === LeadStatus.HOT || l.stage === PipelineStage.NEGOTIATION).length;
    const todayRevenue = leads.filter(l => l.stage === PipelineStage.CLOSED).reduce((acc, curr) => acc + (curr.value || 0), 0);
    const potentialRevenue = leads.filter(l => l.stage !== PipelineStage.CLOSED && l.stage !== PipelineStage.NEW).reduce((acc, curr) => acc + (curr.value || 0), 0);
    const aiSales = Math.round(todayRevenue * 0.65); // Simulação de atribuição

    return { activeConversations, todayRevenue, potentialRevenue, aiSales };
  }, [leads]);

  // Coach de Receita IA
  useEffect(() => {
    const generateCoachInsight = async () => {
      setIsAiThinking(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
          Aja como um Coach de Vendas de Elite e Agressivo (Lobo de Wall Street vibes, mas profissional).
          Analise estes dados:
          - Conversas Ativas Agora: ${liveStats.activeConversations}
          - Receita Já Fechada Hoje: R$ ${liveStats.todayRevenue}
          - Dinheiro na Mesa (Potencial): R$ ${liveStats.potentialRevenue}
          
          Gere uma frase CURTA, IMPACTANTE e PROVOCATIVA para o operador agir AGORA.
          Exemplos: "Tem R$ 50k parados no funil. Vai deixar esfriar?", "Ritmo excelente, mas dá pra dobrar a meta até às 18h."
          Não use saudações. Vá direto ao ponto.
        `;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt
        });
        setAiCoachMessage(response.text || "Foque nas negociações quentes. O dinheiro não espera.");
      } catch (e) {
        setAiCoachMessage("Concentre-se nos leads com etiqueta 'HOT'. Eles estão prontos para comprar.");
      } finally {
        setIsAiThinking(false);
      }
    };

    if (performanceMode) {
      generateCoachInsight();
      const interval = setInterval(generateCoachInsight, 60000); // Atualiza a cada minuto no modo performance
      return () => clearInterval(interval);
    }
  }, [performanceMode, liveStats]);

  const phases: { id: SalesPhase, label: string, progress: number, color: string }[] = [
    { id: 'ATRAIR', label: '1. Atração', progress: 100, color: 'bg-cyan-500' },
    { id: 'CONVERSAR', label: '2. Conversa', progress: 85, color: 'bg-blue-500' },
    { id: 'QUALIFICAR', label: '3. Qualificação', progress: 60, color: 'bg-indigo-500' },
    { id: 'AGENDAR', label: '4. Agenda', progress: 40, color: 'bg-violet-500' },
    { id: 'FECHAR', label: '5. Fechamento', progress: 25, color: 'bg-emerald-500' },
  ];

  return (
    <div className={`p-8 space-y-8 animate-in fade-in pb-32 ${performanceMode ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* HEADER DO PLACAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
             <Trophy className={performanceMode ? 'text-yellow-400' : 'text-indigo-600'} size={36} /> 
             Painel de <span className={performanceMode ? 'text-indigo-400' : 'text-indigo-600'}>Resultado</span>
          </h1>
          <p className={`text-[10px] font-black uppercase tracking-[0.3em] mt-2 ${performanceMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Monitoramento em Tempo Real da Operação
          </p>
        </div>
        
        {/* WIDGET DO COACH IA */}
        <div className={`flex-1 max-w-2xl p-6 rounded-[2rem] border relative overflow-hidden flex items-center gap-5 shadow-xl ${performanceMode ? 'bg-slate-900/80 border-indigo-500/30' : 'bg-white border-slate-200'}`}>
           <div className={`absolute inset-0 opacity-10 bg-gradient-to-r ${performanceMode ? 'from-indigo-600 to-purple-600' : 'from-slate-200 to-transparent'}`}></div>
           <div className={`p-4 rounded-2xl ${performanceMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'} shrink-0`}>
              {isAiThinking ? <Loader2 className="animate-spin" size={24} /> : <Brain size={24} />}
           </div>
           <div className="relative z-10">
              <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${performanceMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Coach de Receita (IA)</p>
              <p className={`text-sm md:text-lg font-bold italic leading-tight ${performanceMode ? 'text-white' : 'text-slate-800'}`}>
                 "{aiCoachMessage}"
              </p>
           </div>
        </div>
      </div>

      {/* PLACAR DE MÉTRICAS VIVAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Conversas Ativas', value: liveStats.activeConversations, sub: 'Leads engajados agora', icon: MessageSquare, color: 'text-cyan-400', border: 'border-cyan-500/20' },
           { label: 'Receita em Jogo', value: `R$ ${liveStats.potentialRevenue.toLocaleString()}`, sub: 'Potencial no Pipeline', icon: Target, color: 'text-yellow-400', border: 'border-yellow-500/20' },
           { label: 'Vendas Hoje', value: `R$ ${liveStats.todayRevenue.toLocaleString()}`, sub: 'Caixa Confirmado', icon: DollarSign, color: 'text-emerald-400', border: 'border-emerald-500/20' },
           { label: 'Atribuição IA', value: `R$ ${liveStats.aiSales.toLocaleString()}`, sub: 'Gerado automaticamente', icon: Zap, color: 'text-purple-400', border: 'border-purple-500/20' },
         ].map((kpi, i) => (
           <div key={i} className={`p-8 rounded-[2.5rem] border-2 flex flex-col justify-between h-48 relative group overflow-hidden transition-all hover:scale-[1.02] ${performanceMode ? `bg-slate-900/50 ${kpi.border}` : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-xl ${performanceMode ? 'bg-white' : 'bg-indigo-600'}`}></div>
              <div className="flex justify-between items-start">
                 <div className={`p-3 rounded-xl ${performanceMode ? 'bg-slate-800' : 'bg-slate-50'} ${kpi.color}`}>
                    <kpi.icon size={24} />
                 </div>
                 {performanceMode && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>}
              </div>
              <div>
                 <h3 className={`text-3xl font-black italic tracking-tighter tabular-nums ${performanceMode ? 'text-white' : 'text-slate-900'}`}>{kpi.value}</h3>
                 <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${performanceMode ? 'text-slate-400' : 'text-slate-500'}`}>{kpi.label}</p>
                 <p className={`text-[9px] mt-2 opacity-60 font-medium ${performanceMode ? 'text-slate-500' : 'text-slate-400'}`}>{kpi.sub}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* GRÁFICO DE VELOCIDADE DE VENDAS */}
         <div className={`lg:col-span-2 p-8 rounded-[3rem] border-2 shadow-sm relative overflow-hidden ${performanceMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tight">Velocidade de Vendas</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Performance horária da operação</p>
               </div>
               <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${performanceMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-600'}`}>
                  <Activity size={14} className="animate-pulse"/>
                  <span className="text-[9px] font-black uppercase tracking-widest">Ao Vivo</span>
               </div>
            </div>
            
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={DATA_PERFORMANCE}>
                     <defs>
                        <linearGradient id="colorSalesPerf" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor={performanceMode ? '#818cf8' : '#4f46e5'} stopOpacity={0.3}/>
                           <stop offset="95%" stopColor={performanceMode ? '#818cf8' : '#4f46e5'} stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={performanceMode ? '#334155' : '#e2e8f0'} opacity={0.3} />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: performanceMode ? '#94a3b8' : '#64748b'}} dy={10} />
                     <Tooltip 
                        contentStyle={{
                           borderRadius: '16px', 
                           border: 'none', 
                           backgroundColor: performanceMode ? '#1e293b' : '#fff',
                           boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                           color: performanceMode ? '#fff' : '#0f172a'
                        }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke={performanceMode ? '#818cf8' : '#4f46e5'} 
                        strokeWidth={4} 
                        fill="url(#colorSalesPerf)" 
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* FASES DA METODOLOGIA */}
         <div className={`p-8 rounded-[3rem] border-2 flex flex-col justify-between relative overflow-hidden ${performanceMode ? 'bg-indigo-950/20 border-indigo-900/50' : 'bg-slate-50 border-slate-100'}`}>
            <div className="mb-6 relative z-10">
               <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3">
                  <Flame size={20} className={performanceMode ? 'text-orange-500' : 'text-orange-600'} /> 5 Fases do Sucesso
               </h3>
               <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-1">Onde estão seus leads agora?</p>
            </div>

            <div className="space-y-5 relative z-10">
               {phases.map((phase, i) => (
                  <div key={i} className="space-y-1.5">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className={performanceMode ? 'text-slate-300' : 'text-slate-600'}>{phase.label}</span>
                        <span className={performanceMode ? 'text-white' : 'text-indigo-600'}>{phase.progress}%</span>
                     </div>
                     <div className={`w-full h-2 rounded-full overflow-hidden ${performanceMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        <div className={`h-full rounded-full transition-all duration-1000 ${phase.color}`} style={{width: `${phase.progress}%`}}></div>
                     </div>
                  </div>
               ))}
            </div>

            {/* CTA FASE */}
            <div className={`mt-8 p-4 rounded-2xl border flex items-center gap-3 relative z-10 ${performanceMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
               <AlertCircle size={18} className="text-rose-500 shrink-0" />
               <p className="text-[9px] font-bold leading-tight uppercase tracking-wide opacity-80">
                  Gargalo detectado na fase <span className="text-rose-500 font-black underline">FECHAMENTO</span>. Ative o script de urgência.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};
