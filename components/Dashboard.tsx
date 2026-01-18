
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Users, MessageSquare, DollarSign, 
  ArrowUpRight, ArrowDownRight, Clock,
  Brain, Zap, Trophy, Target, X, Activity, BarChart3, PieChart as PieChartIcon,
  ChevronRight, ArrowRight, ShieldCheck, Loader2, Sparkles, Filter,
  Calendar, CheckCircle2, AlertCircle, RefreshCcw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Lead, PipelineStage, LeadStatus } from '../types';

interface DashboardProps {
  stats: {
    totalLeads: number;
    hotLeads: number;
    totalValue: number;
    closedValue: number;
    conversionRate: string;
  };
  leads: Lead[];
}

// Mock de variação por período
const DATA_MONTH = [
  { name: 'Seg', leads: 40, sales: 12 },
  { name: 'Ter', leads: 65, sales: 25 },
  { name: 'Qua', leads: 45, sales: 18 },
  { name: 'Qui', leads: 90, sales: 42 },
  { name: 'Sex', leads: 70, sales: 30 },
  { name: 'Sáb', leads: 110, sales: 55 },
  { name: 'Dom', leads: 85, sales: 40 },
];

const DATA_30_DAYS = [
  { name: 'Sem 1', leads: 400, sales: 120 },
  { name: 'Sem 2', leads: 600, sales: 250 },
  { name: 'Sem 3', leads: 450, sales: 180 },
  { name: 'Sem 4', leads: 900, sales: 420 },
];

const AI_EFFICIENCY_DATA = [
  { name: 'IA Agendado', value: 75 },
  { name: 'Manual', value: 25 },
];

export const Dashboard: React.FC<DashboardProps> = ({ stats, leads }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | '30days'>('month');
  const [showAiReport, setShowAiReport] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cálculos Derivados do Estado Real de Leads
  const dynamicStats = useMemo(() => {
    const closedLeads = leads.filter(l => l.stage === PipelineStage.CLOSED);
    const totalClosedValue = closedLeads.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const conversionRate = leads.length > 0 ? ((closedLeads.length / leads.length) * 100).toFixed(1) : '0';
    const cpa = closedLeads.length > 0 ? (2500 / closedLeads.length).toFixed(2) : '0'; // Simulando 2.5k de spend

    return {
      totalLeads: leads.length,
      closedSales: closedLeads.length,
      totalRevenue: totalClosedValue,
      conversion: conversionRate,
      cpa: cpa
    };
  }, [leads]);

  const chartData = selectedPeriod === 'month' ? DATA_MONTH : DATA_30_DAYS;

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500 pb-32">
      
      {/* MODAL RELATÓRIO IA MASTER */}
      {showAiReport && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3.5rem] shadow-2xl p-12 relative border border-slate-200 dark:border-slate-800">
              <button onClick={() => setShowAiReport(false)} className="absolute top-10 right-10 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all"><X size={24} /></button>
              
              <div className="flex items-center gap-5 mb-10">
                 <div className="p-5 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-200 dark:shadow-none"><Brain size={32} /></div>
                 <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight">Audit IA v3.0</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Análise de Eficiência Cognitiva da Unidade</p>
                 </div>
              </div>

              <div className="space-y-6 mb-10">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                       <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Precisão de Qualificação</p>
                       <h4 className="text-2xl font-black text-emerald-500">98.4%</h4>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                       <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Horas Salvas / Mês</p>
                       <h4 className="text-2xl font-black text-indigo-600">342h</h4>
                    </div>
                 </div>
                 <div className="p-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                    <h5 className="text-[10px] font-black uppercase mb-3 flex items-center gap-2 text-indigo-600"><Sparkles size={14}/> Sugestão do Core IA:</h5>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-widest italic">
                      "Detectamos um gargalo na etapa de NEGOCIAÇÃO. Recomendamos ativar o workflow de 'Proposta Escrita por IA' para reduzir o tempo de fechamento em 14%."
                    </p>
                 </div>
              </div>

              <button onClick={() => setShowAiReport(false)} className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl uppercase text-xs tracking-widest hover:scale-[1.02] transition-all">Sincronizar Melhorias</button>
           </div>
        </div>
      )}

      {/* Header com Contexto Master */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-4">
             <h1 className="text-4xl font-black italic uppercase tracking-tight">Performance <span className="text-indigo-600">& ROI</span></h1>
             {isRefreshing && <Loader2 className="animate-spin text-indigo-500" size={24} />}
          </div>
          <div className="flex items-center gap-2 mt-2">
             <Activity size={14} className="text-emerald-500" />
             <p className="text-slate-500 dark:text-slate-400 font-bold tracking-[0.1em] uppercase text-[10px]">Visão Estratégica: <span className="text-indigo-600">Unidade Matriz (Tenant 01)</span></p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={handleRefreshData} className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
              {/* Fix: Added missing RefreshCcw icon from lucide-react */}
              <RefreshCcw size={20} className={isRefreshing ? 'animate-spin' : ''} />
           </button>
           <div className="flex gap-2 bg-white dark:bg-slate-900 p-2 rounded-[1.8rem] shadow-sm border border-slate-100 dark:border-slate-800">
              <button onClick={() => setSelectedPeriod('month')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all tracking-widest ${selectedPeriod === 'month' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Este Mês</button>
              <button onClick={() => setSelectedPeriod('30days')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all tracking-widest ${selectedPeriod === '30days' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>30 Dias</button>
           </div>
        </div>
      </div>

      {/* KPIs Dinâmicos Baseados no Estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Leads Captados', value: dynamicStats.totalLeads, trend: '+12%', color: 'indigo', icon: Users, gradient: 'from-indigo-500/10 to-transparent' },
          { label: 'Conversão ROI', value: `${dynamicStats.conversion}%`, trend: '+4.2%', color: 'emerald', icon: Trophy, gradient: 'from-emerald-500/10 to-transparent' },
          { label: 'CPA Master', value: `R$ ${dynamicStats.cpa}`, trend: '-15%', color: 'rose', icon: Target, gradient: 'from-rose-500/10 to-transparent' },
          { label: 'MRR Acumulado', value: `R$ ${dynamicStats.totalRevenue.toLocaleString('pt-BR')}`, trend: '+22%', color: 'blue', icon: DollarSign, gradient: 'from-blue-500/10 to-transparent' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-50 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-indigo-500/20 transition-all group relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className={`p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 ${kpi.color === 'indigo' ? 'text-indigo-600' : kpi.color === 'emerald' ? 'text-emerald-600' : kpi.color === 'rose' ? 'text-rose-600' : 'text-blue-600'} group-hover:rotate-12 transition-transform shadow-sm`}>
                <kpi.icon size={28} />
              </div>
              <div className={`text-[10px] font-black px-4 py-2 rounded-xl ${kpi.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} border border-current/10 flex items-center gap-1`}>
                {kpi.trend.startsWith('+') ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} {kpi.trend}
              </div>
            </div>
            <div className="relative z-10">
               <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{kpi.label}</p>
               <h3 className="text-3xl font-black italic tracking-tighter dark:text-white tabular-nums">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-12">
            <div>
               <h3 className="text-xl font-black italic uppercase tracking-tight">Crescimento da Operação</h3>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Leads vs Vendas Fechadas</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-600 rounded-full"></div><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Leads</span></div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vendas</span></div>
            </div>
          </div>
          <div className="h-[400px] w-full min-w-0 relative mt-auto">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)', padding: '20px'}}
                  itemStyle={{fontSize: '10px', fontWeight: 900, textTransform: 'uppercase'}}
                />
                <Area type="monotone" dataKey="leads" stroke="#4f46e5" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={4} />
                <Area type="monotone" dataKey="sales" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Score Interativo */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white group flex flex-col justify-between">
           <Zap className="absolute -top-10 -right-10 w-48 h-48 text-white/10 group-hover:rotate-12 group-hover:scale-125 transition-transform duration-1000" />
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-5 mb-10">
                 <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                    <Brain size={32} className="text-yellow-400 animate-pulse" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight">AI Audit</h3>
                    <p className="text-indigo-200 text-[9px] font-black uppercase tracking-[0.2em]">ZapFlow Intelligence</p>
                 </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center py-6">
                 <div className="relative w-56 h-56 min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                       <PieChart>
                          <Pie 
                            data={AI_EFFICIENCY_DATA} 
                            innerRadius={70} 
                            outerRadius={95} 
                            dataKey="value" 
                            stroke="none"
                            paddingAngle={5}
                            isAnimationActive={true}
                          >
                             <Cell fill="#fff" />
                             <Cell fill="rgba(255,255,255,0.1)" />
                          </Pie>
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-5xl font-black italic tracking-tighter">75%</span>
                       <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-200 mt-1">Autônomo</span>
                    </div>
                 </div>
              </div>

              <div className="mt-10 space-y-4">
                 <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-4">
                    <ShieldCheck className="text-emerald-400" size={20} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Carga Neural Otimizada</p>
                 </div>
                 <button 
                  onClick={() => setShowAiReport(true)}
                  className="w-full py-6 bg-white text-indigo-900 font-black rounded-3xl text-[11px] uppercase tracking-widest shadow-2xl hover:bg-yellow-400 hover:text-indigo-900 transition-all flex items-center justify-center gap-3 group"
                 >
                    Relatório IA <ArrowRight className="group-hover:translate-x-2 transition-transform" size={18} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
