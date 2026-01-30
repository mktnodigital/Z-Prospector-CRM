
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Megaphone, Plus, Trash2, Edit3, Send, Play, 
  Pause, CheckCircle2, Loader2, Sparkles, Filter, 
  Target, MessageSquare, Package, Zap, X, Share2, 
  ArrowRight, Users, Clock, Flame, Info, Search,
  Calendar, Check, AlertCircle, Bot, ShieldAlert,
  Link2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Lead, LeadStatus, Campaign, AppModule } from '../types';

interface BroadcastManagerProps {
  leads: Lead[];
  isWhatsAppConnected: boolean;
  onNavigate: (module: AppModule) => void;
  notify: (msg: string) => void;
}

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_1',
    name: 'Lançamento Verão - Quentes',
    targetStatus: LeadStatus.HOT,
    productId: 'prod_1',
    productName: 'Combo Premium Barbearia',
    template: 'Olá {nome}, identificamos que você tem interesse no nosso Combo Premium. Temos uma oferta especial hoje!',
    scheduledAt: 'Hoje, 14:00',
    status: 'COMPLETED',
    totalLeads: 45,
    sentLeads: 45,
    conversions: 12
  },
  {
    id: 'camp_2',
    name: 'Reaquecimento Base Fria',
    targetStatus: LeadStatus.COLD,
    productId: 'prod_2',
    productName: 'Mentoria Business IA',
    template: 'Oi {nome}, faz tempo que não nos falamos. Sabia que a IA pode mudar seu negócio?',
    scheduledAt: 'Amanhã, 09:00',
    status: 'IDLE',
    totalLeads: 120,
    sentLeads: 0,
    conversions: 0
  }
];

export const BroadcastManager: React.FC<BroadcastManagerProps> = ({ leads, isWhatsAppConnected, onNavigate, notify }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Campaign>>({
    name: '',
    targetStatus: LeadStatus.HOT,
    productId: 'prod_1',
    productName: 'Combo Premium Barbearia',
    template: '',
    scheduledAt: 'Imediato',
    status: 'IDLE',
    totalLeads: 0,
    sentLeads: 0,
    conversions: 0
  });

  // Cálculo de audiência em tempo real
  const audienceCount = useMemo(() => {
    if (form.targetStatus === 'ALL') return leads.length;
    return leads.filter(l => l.status === form.targetStatus).length;
  }, [leads, form.targetStatus]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [campaigns, searchQuery]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      name: '',
      targetStatus: LeadStatus.HOT,
      productId: 'prod_1',
      productName: 'Combo Premium Barbearia',
      template: 'Olá {nome}, tenho algo especial para você...',
      scheduledAt: 'Imediato',
      status: 'IDLE',
      totalLeads: leads.filter(l => l.status === LeadStatus.HOT).length,
      sentLeads: 0,
      conversions: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Campaign) => {
    setEditingId(c.id);
    setForm(c);
    setIsModalOpen(true);
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const finalForm = { ...form, totalLeads: audienceCount } as Campaign;

    if (editingId) {
      setCampaigns(prev => prev.map(c => c.id === editingId ? finalForm : c));
      notify('Estratégia de disparo atualizada!');
    } else {
      const newCampaign = { ...finalForm, id: `camp_${Date.now()}` };
      setCampaigns([newCampaign, ...campaigns]);
      notify('Campanha injetada na rede de disparos!');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja destruir esta campanha? Todos os logs de entrega serão perdidos.')) {
      setCampaigns(prev => prev.filter(c => c.id !== id));
      notify('Campanha removida da infraestrutura.');
    }
  };

  const handleStartCampaign = (id: string) => {
    if (!isWhatsAppConnected) {
      notify('ERRO: WhatsApp desconectado. Pareie no Inbox antes de disparar.');
      return;
    }
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: 'SENDING' } : c));
    notify('Disparos Master iniciados via Evolution Socket!');
    
    // Simulação de progresso
    let progress = 0;
    const interval = setInterval(() => {
      setCampaigns(prev => prev.map(c => {
        if (c.id === id) {
          const nextSent = Math.min(c.sentLeads + Math.floor(Math.random() * 5), c.totalLeads);
          if (nextSent >= c.totalLeads) {
            clearInterval(interval);
            return { ...c, sentLeads: c.totalLeads, status: 'COMPLETED' as any };
          }
          return { ...c, sentLeads: nextSent };
        }
        return c;
      }));
    }, 1500);
  };

  const generateIAContent = async () => {
    setIsGeneratingIA(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Aja como um Copywriter Master. Escreva uma mensagem curta de WhatsApp para vender o produto "${form.productName}" para um público do tipo "${form.targetStatus}". Use um tom altamente persuasivo e inclua a variável {nome}. Retorne apenas a mensagem.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      setForm(prev => ({ ...prev, template: response.text || '' }));
      notify('Copy IA gerada com sucesso!');
    } catch (err) {
      notify('Erro na IA. Usando template padrão.');
    } finally {
      setIsGeneratingIA(false);
    }
  };

  const shareCampaignReport = (c: Campaign) => {
    const report = `Relatório Campanha: ${c.name}\nAlcance: ${c.sentLeads}/${c.totalLeads}\nConversões: ${c.conversions}\nStatus: ${c.status}`;
    navigator.clipboard.writeText(report);
    notify('Relatório copiado para o clipboard!');
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in pb-40 relative">
      
      {/* BANNER DE AVISO CONEXÃO */}
      {!isWhatsAppConnected && (
        <div className="bg-rose-500 text-white p-6 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-10 border-4 border-rose-600/30">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                 <ShieldAlert size={32} className="animate-pulse" />
              </div>
              <div>
                 <h4 className="text-xl font-black italic uppercase tracking-tight">Protocolo de Segurança Ativo</h4>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-80 italic">O motor de disparos está bloqueado: WhatsApp Offline no Inbox.</p>
              </div>
           </div>
           <button 
             onClick={() => onNavigate('inbox')}
             className="px-8 py-4 bg-white text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-3"
           >
              <Link2 size={16} /> Ir para Chat Inbox & Conectar
           </button>
        </div>
      )}

      {/* MODAL CRIAR/EDITAR CAMPANHA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-955/80 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[3.5rem] shadow-2xl p-12 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl"></div>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all z-20"><X size={24} /></button>
              
              <div className="flex items-center gap-5 mb-10 relative z-10">
                 <div className="p-5 bg-rose-600 text-white rounded-3xl shadow-xl shadow-rose-500/20"><Megaphone size={32} /></div>
                 <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight">{editingId ? 'Refinar Disparo' : 'Nova Campanha Master'}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Orquestração em massa via Clikai Engine</p>
                 </div>
              </div>

              <form onSubmit={handleSaveCampaign} className="space-y-8 relative z-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Identificador da Campanha</label>
                          <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-rose-500/10" placeholder="Ex: Promoção VIP Nov/24" />
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Segmentação de Público</label>
                          <div className="grid grid-cols-3 gap-2">
                             {[
                               { id: LeadStatus.COLD, label: 'Frio', color: 'text-blue-500', bg: 'bg-blue-50' },
                               { id: LeadStatus.WARM, label: 'Morno', color: 'text-orange-500', bg: 'bg-orange-50' },
                               { id: LeadStatus.HOT, label: 'Quente', color: 'text-rose-500', bg: 'bg-rose-50' },
                             ].map(status => (
                               <button 
                                 key={status.id}
                                 type="button"
                                 onClick={() => setForm({...form, targetStatus: status.id})}
                                 className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${form.targetStatus === status.id ? 'border-rose-600 bg-rose-50/50' : 'border-slate-100 dark:border-slate-800'}`}
                               >
                                  <span className={`text-[10px] font-black uppercase ${status.color}`}>{status.label}</span>
                               </button>
                             ))}
                          </div>
                       </div>

                       <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-[9px] font-black uppercase text-slate-400">Alcance Estimado</span>
                             <Users size={14} className="text-slate-400" />
                          </div>
                          <div className="flex items-baseline gap-2">
                             <h4 className="text-4xl font-black italic tracking-tighter text-indigo-600 tabular-nums">{audienceCount}</h4>
                             <span className="text-[10px] font-bold text-slate-400 uppercase">Leads na Base</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-2">
                          <div className="flex justify-between items-center px-2">
                             <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Script da Mensagem</label>
                             <button type="button" onClick={generateIAContent} disabled={isGeneratingIA} className="flex items-center gap-2 text-[9px] font-black text-rose-600 uppercase hover:underline">
                                {isGeneratingIA ? <Loader2 size={12} className="animate-spin"/> : <Bot size={12}/>}
                                Sugestão IA
                             </button>
                          </div>
                          <textarea 
                            required
                            rows={8}
                            value={form.template}
                            onChange={e => setForm({...form, template: e.target.value})}
                            className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-rose-500/10 resize-none italic"
                            placeholder="Use {nome} para personalizar o envio..."
                          />
                       </div>
                       
                       <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                          <Sparkles size={16} />
                          <p className="text-[8px] font-black uppercase tracking-widest">Variáveis de catálogo injetadas via Gemini 3.0</p>
                       </div>
                    </div>
                 </div>

                 <button type="submit" className="w-full py-7 bg-rose-600 text-white font-black rounded-[2rem] shadow-2xl hover:bg-rose-700 hover:scale-[1.02] transition-all uppercase text-xs tracking-[0.3em]">
                    Provisionar Disparo Agora
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <h1 className="text-4xl font-black italic uppercase tracking-tight flex items-center gap-4">
              <Megaphone className="text-rose-600 animate-pulse" /> Disparos <span className="text-rose-600">Master IA</span>
           </h1>
           <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Orquestração em Massa de Ofertas do Catálogo</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors" size={20} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Localizar campanha..." className="pl-16 pr-8 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] text-xs font-black uppercase tracking-widest outline-none focus:border-rose-600 transition-all shadow-sm" />
           </div>
           
           <button onClick={handleOpenAdd} className="flex items-center gap-4 px-10 py-5 bg-rose-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-rose-700 transition-all hover:scale-105 active:scale-95">
              <Plus size={20} /> Criar Campanha
           </button>
        </div>
      </div>

      {/* GRID DE CAMPANHAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {filteredCampaigns.map(c => (
          <div key={c.id} className="bg-white dark:bg-slate-900 rounded-[4rem] border-2 border-slate-50 dark:border-slate-800 p-10 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col">
             
             {/* Status Badge */}
             <div className="absolute top-10 right-10 flex gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm border ${
                  c.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  c.status === 'SENDING' ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' :
                  'bg-slate-50 text-slate-400 border-slate-100'
                }`}>
                   {c.status === 'COMPLETED' ? 'Finalizada' : c.status === 'SENDING' ? 'Em Disparo' : 'Aguardando'}
                </span>
             </div>

             <div className="flex items-center gap-6 mb-10">
                <div className={`p-6 rounded-3xl ${
                  c.targetStatus === LeadStatus.HOT ? 'bg-rose-50 text-rose-600' :
                  c.targetStatus === LeadStatus.WARM ? 'bg-orange-50 text-orange-600' :
                  'bg-blue-50 text-blue-600'
                } shadow-inner group-hover:rotate-6 transition-transform`}>
                   <Target size={32} />
                </div>
                <div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tight">{c.name}</h3>
                   <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.productName}</p>
                      <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{c.scheduledAt}</p>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                   <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Alcance</p>
                   <h5 className="text-xl font-black tabular-nums">{c.sentLeads}/{c.totalLeads}</h5>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                   <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Taxa Entrega</p>
                   <h5 className="text-xl font-black tabular-nums text-emerald-500">{c.totalLeads > 0 ? Math.round((c.sentLeads / c.totalLeads) * 100) : 0}%</h5>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                   <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Vendas ROI</p>
                   <h5 className="text-xl font-black tabular-nums text-rose-500">{c.conversions}</h5>
                </div>
             </div>

             <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-700 mb-10 flex-1">
                <div className="flex items-center gap-2 mb-3">
                   <MessageSquare size={14} className="text-slate-400" />
                   <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Preview da Copy IA</span>
                </div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-300 italic line-clamp-3 leading-relaxed uppercase tracking-tight">"{c.template}"</p>
             </div>

             <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800">
                <div className="flex gap-2">
                   <button onClick={() => handleOpenEdit(c)} className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-2xl transition-all shadow-sm"><Edit3 size={18}/></button>
                   <button onClick={() => shareCampaignReport(c)} className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"><Share2 size={18}/></button>
                   <button onClick={() => handleDelete(c.id)} className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-2xl transition-all shadow-sm"><Trash2 size={18}/></button>
                </div>
                {c.status !== 'COMPLETED' && (
                  <button 
                    onClick={() => handleStartCampaign(c.id)}
                    disabled={c.status === 'SENDING' || !isWhatsAppConnected}
                    className={`flex items-center gap-3 px-8 py-4 ${
                      c.status === 'SENDING' ? 'bg-slate-100 text-slate-400' : 
                      !isWhatsAppConnected ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50' : 
                      'bg-rose-600 text-white shadow-xl hover:bg-rose-700'
                    } rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all transform ${!isWhatsAppConnected ? '' : 'hover:scale-105 active:scale-95'}`}
                  >
                    {c.status === 'SENDING' ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                    {c.status === 'SENDING' ? 'Disparando...' : !isWhatsAppConnected ? 'Bloqueado (Offline)' : 'Iniciar Fluxo'}
                  </button>
                )}
                {c.status === 'COMPLETED' && (
                  <div className="flex items-center gap-2 text-emerald-500">
                     <CheckCircle2 size={20} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Relatório Pronto</span>
                  </div>
                )}
             </div>
          </div>
        ))}

        {/* EMPTY STATE */}
        {filteredCampaigns.length === 0 && (
           <div className="col-span-full py-40 flex flex-col items-center justify-center text-slate-300 gap-8 opacity-50 grayscale select-none">
              <div className="p-16 rounded-full border-4 border-dashed border-slate-200">
                 <Megaphone size={100} className="animate-pulse" />
              </div>
              <div className="text-center space-y-3">
                 <p className="text-2xl font-black uppercase tracking-[0.4em]">Zero Disparos Agendados</p>
                 <p className="text-[11px] font-bold uppercase tracking-widest">Crie sua primeira campanha para reaquecer sua base com IA.</p>
              </div>
           </div>
        )}
      </div>

      {/* AI ANALYTICS FLOAT */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-6 rounded-[3rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] border border-white/10 flex items-center gap-10 z-[100] animate-in slide-in-from-bottom-5 group overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-rose-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
         <div className="flex items-center gap-5 relative z-10">
            <div className="p-3 bg-rose-600 rounded-2xl"><Flame size={20} /></div>
            <div className="space-y-0.5">
               <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Conversão Média Rede</p>
               <p className="text-xl font-black italic tracking-tighter">24.8% <span className="text-[10px] text-emerald-400 ml-1">+4.2%</span></p>
            </div>
         </div>
         <div className="h-10 w-px bg-white/10 relative z-10"></div>
         <div className="flex items-center gap-4 relative z-10">
            <div className="flex -space-x-3">
               {[1,2,3].map(i => <div key={i} className="w-9 h-9 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-black">U{i}</div>)}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unidades em Disparo</span>
         </div>
      </div>

    </div>
  );
};
