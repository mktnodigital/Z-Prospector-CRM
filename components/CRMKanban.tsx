
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
  bgLight: string;
  bgDark: string;
  borderColor: string;
}

const INITIAL_STAGES: Stage[] = [
  { id: PipelineStage.NEW, label: 'Novos Leads', color: 'text-blue-600', bgLight: 'bg-blue-50', bgDark: 'bg-blue-900/20', borderColor: 'border-blue-200' },
  { id: PipelineStage.CONTACTED, label: 'Em Contato', color: 'text-indigo-600', bgLight: 'bg-indigo-50', bgDark: 'bg-indigo-900/20', borderColor: 'border-indigo-200' },
  { id: PipelineStage.QUALIFIED, label: 'Qualificados', color: 'text-emerald-600', bgLight: 'bg-emerald-50', bgDark: 'bg-emerald-900/20', borderColor: 'border-emerald-200' },
  { id: PipelineStage.PROPOSAL, label: 'Proposta Enviada', color: 'text-orange-600', bgLight: 'bg-orange-50', bgDark: 'bg-orange-900/20', borderColor: 'border-orange-200' },
  { id: PipelineStage.NEGOTIATION, label: 'Negociação', color: 'text-purple-600', bgLight: 'bg-purple-50', bgDark: 'bg-purple-900/20', borderColor: 'border-purple-200' },
  { id: PipelineStage.CLOSED, label: 'Fechado/Ganho', color: 'text-pink-600', bgLight: 'bg-pink-50', bgDark: 'bg-pink-900/20', borderColor: 'border-pink-200' },
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
  const [stageForm, setStageForm] = useState<Partial<Stage>>({ label: '' });

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
      case LeadStatus.HOT: return 'text-white bg-rose-500 shadow-rose-500/40 shadow-md';
      case LeadStatus.WARM: return 'text-white bg-orange-500 shadow-orange-500/40 shadow-md';
      case LeadStatus.COLD: return 'text-white bg-blue-500 shadow-blue-500/40 shadow-md';
      default: return 'text-slate-600 bg-slate-200';
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
    // Simplified logic for brevity in this update
    notify('Funcionalidade de edição de estágios (Simulação)');
    closeStageModal();
  };

  const handleDeleteStage = (id: string) => {
    notify('Funcionalidade de exclusão de estágios (Simulação)');
  };

  const closeStageModal = () => {
    setShowStageModal(false);
    setEditingStage(null);
  };

  const openEditStage = (stage: Stage) => {
    setEditingStage(stage);
    setStageForm(stage);
    setShowStageModal(true);
    setActiveStageMenu(null);
  };

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
    <div className="h-full flex flex-col p-8 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
      
      {/* Lead Modal - Mantido simples para foco no visual */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-10 animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black italic uppercase tracking-tight dark:text-white">{editingLead ? 'Editar Lead' : 'Novo Lead'}</h3>
              <button onClick={closeLeadModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveLead} className="space-y-4">
               {/* Form fields simplified for visual update context */}
               <input required placeholder="Nome Completo" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold dark:text-white" value={leadForm.name || ''} onChange={e => setLeadForm({...leadForm, name: e.target.value})} />
               <input required placeholder="WhatsApp" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold dark:text-white" value={leadForm.phone || ''} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} />
               
               <div className="grid grid-cols-2 gap-4">
                  <select className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold dark:text-white" value={leadForm.status} onChange={e => setLeadForm({...leadForm, status: e.target.value as LeadStatus})}>
                    <option value={LeadStatus.HOT}>🔥 Quente</option>
                    <option value={LeadStatus.WARM}>☀️ Morno</option>
                    <option value={LeadStatus.COLD}>❄️ Frio</option>
                  </select>
                  <input type="number" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold dark:text-white" value={leadForm.value} onChange={e => setLeadForm({...leadForm, value: parseFloat(e.target.value)})} placeholder="Valor" />
               </div>

               <button type="submit" className="w-full mt-6 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all uppercase text-xs tracking-widest">
                {editingLead ? 'Salvar Alterações' : 'Criar Lead no Pipeline'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header do Kanban */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tight dark:text-white">Pipeline de Vendas</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold tracking-[0.1em] uppercase text-xs mt-1">Gestão de leads em tempo real e automação de funil</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:min-w-[300px]">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Buscar por nome ou celular..." 
               className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black outline-none focus:border-indigo-500 transition-all shadow-sm uppercase tracking-widest dark:text-white"
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
          </div>
          
          <select 
            className="px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500 transition-all shadow-sm dark:text-white"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">Todos os Status</option>
            <option value={LeadStatus.HOT}>🔥 Quentes</option>
            <option value={LeadStatus.WARM}>☀️ Mornos</option>
            <option value={LeadStatus.COLD}>❄️ Frios</option>
          </select>

          <button 
            onClick={() => { setLeadForm({ status: LeadStatus.HOT, stage: stages[0]?.id, value: 0 }); setShowLeadModal(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-500/30"
          >
            <Plus size={16} /> Novo Lead
          </button>
        </div>
      </div>

      {/* Kanban Board Vibrante */}
      <div className="flex-1 overflow-x-auto pb-6 custom-scrollbar">
        <div className="flex gap-6 h-full min-w-max pr-8">
          {stages.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
            return (
              <div 
                key={stage.id} 
                className={`w-80 flex flex-col rounded-[2.5rem] border-2 transition-colors ${stage.bgLight} dark:${stage.bgDark} ${stage.borderColor} dark:border-opacity-30`}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, stage.id)}
              >
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className={`font-black text-sm italic uppercase tracking-tight ${stage.color}`}>{stage.label}</h3>
                    <span className="bg-white/50 dark:bg-black/20 text-slate-600 dark:text-slate-300 text-[10px] px-2.5 py-1 rounded-full font-black shadow-sm">
                      {stageLeads.length}
                    </span>
                  </div>
                  
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="flex-1 px-4 space-y-4 overflow-y-auto no-scrollbar pb-6">
                  {stageLeads.map(lead => (
                    <div 
                      key={lead.id} 
                      draggable
                      onDragStart={(e) => onDragStart(e, lead.id)}
                      className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm hover:shadow-xl border border-transparent hover:border-indigo-500 cursor-grab active:cursor-grabbing group transition-all transform hover:-translate-y-1 relative"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${getStatusColor(lead.status)}`}>
                          {lead.status === LeadStatus.HOT ? '🔥 Quente' : lead.status === LeadStatus.WARM ? '☀️ Morno' : '❄️ Frio'}
                        </span>
                        <div className="relative">
                           <button onClick={(e) => { e.stopPropagation(); openEditLead(lead); }} className="text-slate-300 hover:text-indigo-500"><Edit2 size={12}/></button>
                        </div>
                      </div>

                      <h4 className="font-black text-slate-900 dark:text-white mb-1 tracking-tight truncate text-lg">{lead.name}</h4>
                      
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                        <div className="text-sm font-black text-slate-900 dark:text-white tracking-tighter">
                          R$ {lead.value?.toLocaleString('pt-BR')}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => handleMessageClick(e, lead)}
                            className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl transition-all shadow-sm hover:bg-indigo-600 hover:text-white"
                          >
                            <MessageCircle size={14} />
                          </button>
                          <button 
                            onClick={(e) => handlePhoneClick(e, lead.phone)}
                            className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
                          >
                            <Phone size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Botão de Adição Rápida na Coluna */}
                  <button 
                    onClick={() => { setLeadForm({ status: LeadStatus.HOT, stage: stage.id, value: 0 }); setShowLeadModal(true); }}
                    className="w-full py-4 border-2 border-dashed border-slate-300/50 dark:border-slate-700 rounded-[2rem] text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 hover:bg-white/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
                  >
                    <Plus size={14} /> Adicionar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
