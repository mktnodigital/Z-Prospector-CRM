import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, Brain, Loader2, DollarSign, MessageSquare, Target, Zap } from 'lucide-react';
import { Lead, LeadStatus, PipelineStage } from '../types';

export const Dashboard: React.FC<{ performanceMode: boolean; leads: Lead[] }> = ({ performanceMode, leads }) => {
  const [aiCoachMessage, setAiCoachMessage] = useState<string>('Analizando dados...');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const stats = useMemo(() => ({
    active: leads.filter(l => l.status === LeadStatus.HOT).length,
    revenue: leads.filter(l => l.stage === PipelineStage.CLOSED).reduce((a, b) => a + (b.value || 0), 0)
  }), [leads]);

  useEffect(() => {
    const getInsight = async () => {
      setIsAiThinking(true);
      try {
        const res = await fetch('/api/core.php?action=proxy-ai', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('z_token')}`
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Analise: ${stats.active} leads ativos e R$${stats.revenue} em vendas. Gere uma dica curta de fechamento.` }] }]
          })
        });
        const data = await res.json();
        setAiCoachMessage(data.candidates?.[0]?.content?.parts?.[0]?.text || "Mantenha o ritmo!");
      } catch {
        setAiCoachMessage("Foque nos leads quentes agora!");
      } finally {
        setIsAiThinking(false);
      }
    };
    getInsight();
  }, [stats]);

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl">
         <div className="flex items-center gap-6">
            <div className="p-4 bg-white/20 rounded-2xl">
               {isAiThinking ? <Loader2 className="animate-spin" /> : <Brain />}
            </div>
            <div>
               <p className="text-[10px] font-black uppercase opacity-60">Insight Neural</p>
               <h3 className="text-xl font-bold italic">"{aiCoachMessage}"</h3>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-white/5">
            <MessageSquare className="text-indigo-500 mb-4" />
            <h4 className="text-3xl font-black text-white">{stats.active}</h4>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Leads Quentes</p>
         </div>
         <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-white/5">
            <DollarSign className="text-emerald-500 mb-4" />
            <h4 className="text-3xl font-black text-white">R$ {stats.revenue.toLocaleString()}</h4>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Receita Fechada</p>
         </div>
         <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-white/5">
            <Zap className="text-amber-500 mb-4" />
            <h4 className="text-3xl font-black text-white">94%</h4>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Saúde da Operação</p>
         </div>
      </div>
    </div>
  );
};