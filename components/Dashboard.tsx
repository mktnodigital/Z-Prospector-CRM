
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
      const interval = setInterval(generateCoachInsight, 60000); 
      return () => clearInterval(interval);
    }
  }, [performanceMode, liveStats]);

  const phases: { id: SalesPhase, label: string, progress: number, color: string }[] = [
    { id: 'ATRAIR', label: '1. Atração', progress: 100, color: 'bg-cyan-500 shadow-cyan-500/50' },
    { id: 'CONVERSAR', label: '2. Conversa', progress: 85, color: 'bg-blue-500 shadow-blue-500/50' },
    { id: 'QUALIFICAR', label: '3. Qualificação', progress: 60, color: 'bg-indigo-500 shadow-indigo-500/50' },
    { id: 'AGENDAR', label: '4. Agenda', progress: 40, color: 'bg-violet-500 shadow-violet-500/50' },
    { id: 'FECHAR', label: '5. Fechamento', progress: 25, color: 'bg-emerald-500 shadow-emerald-500/50' },
  ];

  return (
    <div className={`p-8 space-y-8 animate-in fade-in pb-32`}>
      
      {/* HEADER DO PLACAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-slate-900 dark:text-white">
             <Trophy className={performanceMode ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-indigo-600'} size={36} /> 
             Painel de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Resultado</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2 text-slate-500 dark:text-slate-400">
            Monitoramento em Tempo Real da Operação
          </p>
        </div>
        
        {/* WIDGET DO COACH IA */}
        <div className={`flex-1 max-w-2xl p-6 rounded-[2rem] border relative overflow-hidden flex items-center gap-5 shadow-xl ${performanceMode ? 'bg-slate-900/60 border-indigo-500/30 backdrop-blur-md' : 'bg-white/80 border-slate-200'}`}>
           <div className={`absolute inset-0 opacity-10 bg-gradient-to-r ${performanceMode ? 'from-indigo-600 to-purple-600' : 'from-indigo-200 to-purple-200'}`}></div>
           <div className={`p-4 rounded-2xl ${performanceMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'} shrink-0 shadow-lg`}>
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
           { label: 'Conversas Ativas', value: liveStats.activeConversations, sub: 'Leads engajados agora', icon: MessageSquare, gradient: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/20' },
           { label: 'Receita em Jogo', value: `R$ ${liveStats.potentialRevenue.toLocaleString()}`, sub: 'Potencial no Pipeline', icon: Target, gradient: 'from-yellow-400 to-orange-500', shadow: 'shadow-orange-500/20' },
           { label: 'Vendas Hoje', value: `R$ ${liveStats.todayRevenue.toLocaleString()}`, sub: 'Caixa Confirmado', icon: DollarSign, gradient: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-500/20' },
           { label: 'Atribuição IA', value: `R$ ${liveStats.aiSales.toLocaleString()}`, sub: 'Gerado automaticamente', icon: Zap, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-purple-500/20' },
         ].map((kpi, i) => (
           <div key={i} className={`p-8 rounded-[2.5rem] flex flex-col justify-between h-48 relative group overflow-hidden transition-all hover:scale-[1.02] bg-gradient-to-br ${kpi.gradient} text-white shadow-xl ${kpi.shadow}`}>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 blur-3xl rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="flex justify-between items-start relative z-10">
                 <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20">
                    <kpi.icon size={24} className="text-white drop-shadow-md" />
                 </div>
                 {performanceMode && <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>}
              </div>
              
              <div className="relative z-10">
                 <h3 className="text-3xl font-black italic tracking-tighter tabular-nums drop-shadow-sm">{kpi.value}</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-90">{kpi.label}</p>
                 <p className="text-[9px] mt-2 opacity-70 font-medium">{kpi.sub}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* GRÁFICO DE VELOCIDADE DE VENDAS */}
         <div className={`lg:col-span-2 p-8 rounded-[3rem] border shadow-lg relative overflow-hidden ${performanceMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className={`text-xl font-black italic uppercase tracking-tight ${performanceMode ? 'text-white' : 'text-slate-900'}`}>Velocidade de Vendas</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-slate-500 dark:text-slate-400">Performance horária da operação</p>
               </div>
               <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${performanceMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                  <Activity size={14} className="animate-pulse"/>
                  <span className="text-[9px] font-black uppercase tracking-widest">Ao Vivo</span>
               </div>
            </div>
            
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={DATA_PERFORMANCE}>
                     <defs>
                        <linearGradient id="colorSalesPerf" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                           <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
                        stroke="#8b5cf6" 
                        strokeWidth={4} 
                        fill="url(#colorSalesPerf)" 
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* FASES DA METODOLOGIA */}
         <div className={`p-8 rounded-[3rem] border flex flex-col justify-between relative overflow-hidden shadow-lg ${performanceMode ? 'bg-slate-900 border-indigo-500/20' : 'bg-white border-indigo-50'}`}>
            <div className="mb-6 relative z-10">
               <h3 className={`text-xl font-black italic uppercase tracking-tight flex items-center gap-3 ${performanceMode ? 'text-white' : 'text-slate-900'}`}>
                  <Flame size={20} className="text-orange-500" /> 5 Fases do Sucesso
               </h3>
               <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-1 text-slate-500 dark:text-slate-400">Onde estão seus leads agora?</p>
            </div>

            <div className="space-y-5 relative z-10">
               {phases.map((phase, i) => (
                  <div key={i} className="space-y-1.5">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className={performanceMode ? 'text-slate-300' : 'text-slate-600'}>{phase.label}</span>
                        <span className={performanceMode ? 'text-white' : 'text-indigo-600'}>{phase.progress}%</span>
                     </div>
                     <div className={`w-full h-2.5 rounded-full overflow-hidden ${performanceMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <div className={`h-full rounded-full transition-all duration-1000 ${phase.color}`} style={{width: `${phase.progress}%`}}></div>
                     </div>
                  </div>
               ))}
            </div>

            {/* CTA FASE */}
            <div className={`mt-8 p-4 rounded-2xl border flex items-center gap-3 relative z-10 ${performanceMode ? 'bg-rose-900/20 border-rose-500/30' : 'bg-rose-50 border-rose-100'}`}>
               <AlertCircle size={18} className="text-rose-500 shrink-0" />
               <p className={`text-[9px] font-bold leading-tight uppercase tracking-wide opacity-80 ${performanceMode ? 'text-rose-200' : 'text-rose-700'}`}>
                  Gargalo detectado na fase <span className="font-black underline">FECHAMENTO</span>. Ative o script de urgência.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};
