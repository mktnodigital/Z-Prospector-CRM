
import React, { useState, useMemo, useEffect } from 'react';
import { 
  MoreVertical, Plus, MessageCircle, Phone, Tag, 
  Calendar, Search, X, Edit2, Trash2, GripVertical, 
  Check, ChevronRight, Filter, AlertCircle 
} from 'lucide-react';
import { Lead, LeadStatus, PipelineStage, AppModule } from '../types';

interface Props {
  leads: Lead[];
  onLeadsChange: (leads: Lead[]) => void;
  notify: (msg: string) => void;
  onNavigate: (module: AppModule) => void;
}

interface Stage {
  id: string;
  label: string;
  color: string;
}

const INITIAL_STAGES: Stage[] = [
  { id: PipelineStage.NEW, label: 'Novos Leads', color: 'bg-blue-500' },
  { id: PipelineStage.CONTACTED, label: 'Em Contato', color: 'bg-indigo-500' },
  { id: PipelineStage.QUALIFIED, label: 'Qualificados', color: 'bg-emerald-500' },
  { id: PipelineStage.PROPOSAL, label: 'Proposta Enviada', color: 'bg-orange-500' },
  { id: PipelineStage.NEGOTIATION, label: 'Negociação', color: 'bg-purple-500' },
  { id: PipelineStage.CLOSED, label: 'Fechado/Ganho', color: 'bg-pink-500' },
];

export const CRMKanban: React.FC<Props> = ({ leads, onLeadsChange, notify, onNavigate }) => {
  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL');
  
  // Controle de Menus (State based para evitar problemas de hover)
  const [activeStageMenu, setActiveStageMenu] = useState<string | null>(null);
  const [activeLeadMenu, setActiveLeadMenu] = useState<string | null>(null);

  // Modais
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);

  // Form states
  const [leadForm, setLeadForm] = useState<Partial<Lead>>({ status: LeadStatus.HOT, stage: PipelineStage.NEW, value: 0 });
  const [stageForm, setStageForm] = useState<Partial<Stage>>({ label: '', color: 'bg-indigo-500' });

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveStageMenu(null);
      setActiveLeadMenu(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const name = lead.name || '';
      const phone = lead.phone || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           phone.includes(searchQuery);
      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, statusFilter]);

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.HOT: return 'text-red-600 bg-red-50 border-red-100';
      case LeadStatus.WARM: return 'text-orange-600 bg-orange-50 border-orange-100';
      case LeadStatus.COLD: return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  // Funções de Gerenciamento de Leads
  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLead) {
      const updated = leads.map(l => l.id === editingLead.id ? { ...l, ...leadForm } as Lead : l);
      onLeadsChange(updated);
      notify(`Lead ${leadForm.name} atualizado.`);
    } else {
      const newLead: Lead = {
        id: Math.random().toString(36).substr(2, 9),
        name: leadForm.name || 'Sem Nome',
        phone: leadForm.phone || '',
        email: leadForm.email || '',
        status: leadForm.status as LeadStatus,
        stage: leadForm.stage || PipelineStage.NEW,
        value: Number(leadForm.value) || 0,
        source: 'Cadastro Manual',
        lastInteraction: 'Lead criado manualmente'
      };
      onLeadsChange([newLead, ...leads]);
      notify(`Novo Lead: ${newLead.name} adicionado.`);
    }
    closeLeadModal();
  };

  const handleDeleteLead = (id: string) => {
    if (confirm('Deseja realmente excluir este lead?')) {
      onLeadsChange(leads.filter(l => l.id !== id));
      notify('Lead removido do pipeline.');
    }
  };

  const closeLeadModal = () => {
    setShowLeadModal(false);
    setEditingLead(null);
    setLeadForm({ status: LeadStatus.HOT, stage: PipelineStage.NEW, value: 0 });
  };

  const openEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setLeadForm(lead);
    setShowLeadModal(true);
    setActiveLeadMenu(null);
  };

  // Funções de Gerenciamento de Estágios
  const handleSaveStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStage) {
      setStages(stages.map(s => s.id === editingStage.id ? { ...s, ...stageForm } as Stage : s));
      notify(`Estágio ${stageForm.label} atualizado.`);
    } else {
      const newStage: Stage = {
        id: `custom_${Math.random().toString(36).substr(2, 5)}`,
        label: stageForm.label || 'Novo Estágio',
        color: stageForm.color || 'bg-slate-500'
      };
      setStages([...stages, newStage]);
      notify(`Novo estágio ${newStage.label} criado.`);
    }
    closeStageModal();
  };

  const handleDeleteStage = (id: string) => {
    const hasLeads = leads.some(l => l.stage === id);
    if (hasLeads) {
      alert('Não é possível excluir um estágio que possui leads ativos. Mova os leads primeiro.');
      return;
    }
    if (confirm('Deseja excluir este estágio?')) {
      setStages(stages.filter(s => s.id !== id));
      setActiveStageMenu(null);
      notify('Estágio removido.');
    }
  };

  const closeStageModal = () => {
    setShowStageModal(false);
    setEditingStage(null);
    setStageForm({ label: '', color: 'bg-indigo-500' });
  };

  const openEditStage = (stage: Stage) => {
    setEditingStage(stage);
    setStageForm(stage);
    setShowStageModal(true);
    setActiveStageMenu(null);
  };

  // Handlers para os botões de ação do card
  const handlePhoneClick = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    window.open(`tel:${phone.replace(/\D/g, '')}`, '_self');
    notify(`Iniciando chamada para ${phone}...`);
  };

  const handleMessageClick = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    notify(`Abrindo conversa com ${lead.name} no Inbox...`);
    onNavigate('inbox');
  };

  // Drag and Drop
  const onDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, stageId: string) => {
    const leadId = e.dataTransfer.getData('leadId');
    const updated = leads.map(l => l.id === leadId ? { ...l, stage: stageId } : l);
    onLeadsChange(updated);
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black italic uppercase tracking-tight">{editingLead ? 'Editar Lead' : 'Novo Lead'}</h3>
              <button onClick={closeLeadModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveLead} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 px-2">Nome Completo</label>
                <input required placeholder="Ex: João Silva" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-indigo-500 font-bold" value={leadForm.name || ''} onChange={e => setLeadForm({...leadForm, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 px-2">WhatsApp</label>
                <input required placeholder="DDD + Número" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-indigo-500 font-bold" value={leadForm.phone || ''} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-2">Status IA</label>
                  <select className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold" value={leadForm.status} onChange={e => setLeadForm({...leadForm, status: e.target.value as LeadStatus})}>
                    <option value={LeadStatus.HOT}>🔥 Quente</option>
                    <option value={LeadStatus.WARM}>☀️ Morno</option>
                    <option value={LeadStatus.COLD}>❄️ Frio</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-2">Valor Estimado</label>
                  <input type="number" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold" value={leadForm.value} onChange={e => setLeadForm({...leadForm, value: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-2">Mover para Estágio</label>
                  <select className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold" value={leadForm.stage} onChange={e => setLeadForm({...leadForm, stage: e.target.value})}>
                    {stages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
              </div>
              <button type="submit" className="w-full mt-6 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all uppercase text-xs tracking-widest">
                {editingLead ? 'Salvar Alterações' : 'Criar Lead no Pipeline'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stage Modal */}
      {showStageModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black italic uppercase tracking-tight">{editingStage ? 'Editar Estágio' : 'Novo Estágio'}</h3>
              <button onClick={closeStageModal} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveStage} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 px-2">Nome do Estágio</label>
                <input required placeholder="Ex: Negociação Final" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 ring-indigo-500 font-bold" value={stageForm.label || ''} onChange={e => setStageForm({...stageForm, label: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 px-2">Cor de Identificação</label>
                <div className="grid grid-cols-4 gap-3 p-2">
                  {['bg-blue-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500', 'bg-slate-500', 'bg-rose-500'].map(c => (
                    <button key={c} type="button" onClick={() => setStageForm({...stageForm, color: c})} className={`w-full aspect-square rounded-xl ${c} border-4 transition-all ${stageForm.color === c ? 'border-indigo-600 scale-110 shadow-lg' : 'border-transparent'}`}></button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full mt-6 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all uppercase text-xs tracking-widest">
                {editingStage ? 'Atualizar Estágio' : 'Adicionar ao Pipeline'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header do Kanban */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tight">Pipeline de Vendas</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold tracking-[0.1em] uppercase text-xs mt-1">Gestão de leads em tempo real e automação de funil</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:min-w-[300px]">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Buscar por nome ou celular..." 
               className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black outline-none focus:border-indigo-500 transition-all shadow-sm uppercase tracking-widest"
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
          </div>
          
          <select 
            className="px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500 transition-all shadow-sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">Todos os Status</option>
            <option value={LeadStatus.HOT}>🔥 Quentes</option>
            <option value={LeadStatus.WARM}>☀️ Mornos</option>
            <option value={LeadStatus.COLD}>❄️ Frios</option>
          </select>

          <div className="flex gap-2">
            <button 
              onClick={() => { setStageForm({ label: '', color: 'bg-indigo-500' }); setShowStageModal(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-600 transition-all shadow-sm"
            >
              <Plus size={16} className="text-indigo-600" /> Estágio
            </button>
            <button 
              onClick={() => { setLeadForm({ status: LeadStatus.HOT, stage: stages[0]?.id, value: 0 }); setShowLeadModal(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl"
            >
              <Plus size={16} /> Novo Lead
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-6 custom-scrollbar">
        <div className="flex gap-6 h-full min-w-max pr-8">
          {stages.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
            return (
              <div 
                key={stage.id} 
                className="w-80 flex flex-col bg-slate-100/40 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, stage.id)}
              >
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${stage.color} shadow-lg shadow-current/20`}></div>
                    <h3 className="font-black text-sm italic uppercase tracking-tight text-slate-700 dark:text-slate-300">{stage.label}</h3>
                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-2.5 py-1 rounded-full font-black">
                      {stageLeads.length}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveStageMenu(activeStageMenu === stage.id ? null : stage.id); }}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {activeStageMenu === stage.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-[90] animate-in zoom-in-95">
                        <button onClick={() => openEditStage(stage)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                          <Edit2 size={14} /> Editar Estágio
                        </button>
                        <button onClick={() => handleDeleteStage(stage.id)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-xs font-black uppercase tracking-widest text-rose-500">
                          <Trash2 size={14} /> Excluir Estágio
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 px-4 space-y-4 overflow-y-auto no-scrollbar pb-6">
                  {stageLeads.map(lead => (
                    <div 
                      key={lead.id} 
                      draggable
                      onDragStart={(e) => onDragStart(e, lead.id)}
                      className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-grab active:cursor-grabbing group transition-all transform hover:-translate-y-1 hover:shadow-xl relative"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl border ${getStatusColor(lead.status)} uppercase tracking-widest`}>
                          {lead.status === LeadStatus.HOT ? '🔥 Quente' : lead.status === LeadStatus.WARM ? '☀️ Morno' : '❄️ Frio'}
                        </span>
                        
                        <div className="relative">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveLeadMenu(activeLeadMenu === lead.id ? null : lead.id); }}
                            className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <MoreVertical size={14} />
                          </button>
                          
                          {activeLeadMenu === lead.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl p-1 z-[90] animate-in zoom-in-95">
                               <button onClick={() => openEditLead(lead)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                                 <Edit2 size={12} /> Editar Lead
                               </button>
                               <button onClick={() => handleDeleteLead(lead.id)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-[10px] font-black uppercase tracking-widest text-rose-500">
                                 <Trash2 size={12} /> Excluir Lead
                               </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <h4 className="font-black text-slate-900 dark:text-white mb-1 tracking-tight truncate">{lead.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mb-4 tracking-widest uppercase">{lead.phone}</p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                        <div className="text-sm font-black text-slate-900 dark:text-white tracking-tighter">
                          R$ {lead.value?.toLocaleString('pt-BR')}
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={(e) => handleMessageClick(e, lead)}
                            className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm active:scale-95"
                            title="Conversar no Inbox"
                          >
                            <MessageCircle size={14} />
                          </button>
                          <button 
                            onClick={(e) => handlePhoneClick(e, lead.phone)}
                            className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm active:scale-95"
                            title="Ligar para Lead"
                          >
                            <Phone size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={() => { setLeadForm({ status: LeadStatus.HOT, stage: stage.id, value: 0 }); setShowLeadModal(true); }}
                    className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Novo Lead aqui
                  </button>
                </div>
              </div>
            );
          })}

          <button 
            onClick={() => { setStageForm({ label: '', color: 'bg-indigo-500' }); setShowStageModal(true); }}
            className="w-80 h-32 flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-all group"
          >
             <Plus size={24} className="mb-2 group-hover:rotate-90 transition-transform" />
             <span className="text-[10px] font-black uppercase tracking-widest">Novo Estágio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
