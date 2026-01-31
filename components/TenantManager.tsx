
import React, { useState } from 'react';
import { 
  Building2, Plus, Edit3, Trash2, CheckCircle2, 
  X, Search, LogIn, TrendingUp, Users, Wallet,
  Briefcase, ShoppingCart, Handshake, Power
} from 'lucide-react';
import { Tenant, SalesMode } from '../types';

interface TenantManagerProps {
  tenants: Tenant[];
  currentTenantId: string;
  onAdd: (t: Tenant) => void;
  onUpdate: (t: Tenant) => void;
  onDelete: (id: string) => void;
  onSwitch: (t: Tenant) => void;
  notify: (msg: string) => void;
}

const NICHES = [
  'SaaS & High Ticket',
  'Estética & Beleza',
  'Saúde & Clínicas',
  'Imobiliária',
  'Energia Solar',
  'Infoprodutos',
  'Varejo & Delivery',
  'Automotivo'
];

export const TenantManager: React.FC<TenantManagerProps> = ({ 
  tenants, currentTenantId, onAdd, onUpdate, onDelete, onSwitch, notify 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formNiche, setFormNiche] = useState(NICHES[0]);
  const [formMode, setFormMode] = useState<SalesMode>('ASSISTED');

  const handleOpenAdd = () => {
    setEditingTenant(null);
    setFormName('');
    setFormNiche(NICHES[0]);
    setFormMode('ASSISTED');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Tenant) => {
    setEditingTenant(t);
    setFormName(t.name);
    setFormNiche(t.niche);
    setFormMode(t.salesMode);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tenantData: Tenant = {
      id: editingTenant ? editingTenant.id : `tenant_${Date.now()}`,
      name: formName,
      niche: formNiche,
      salesMode: formMode,
      // Default / Mock Data for new tenants
      healthScore: editingTenant ? editingTenant.healthScore : 100,
      revenue: editingTenant ? editingTenant.revenue : 0,
      activeLeads: editingTenant ? editingTenant.activeLeads : 0,
      status: 'ONLINE',
      instanceStatus: 'DISCONNECTED'
    };

    if (editingTenant) {
      onUpdate(tenantData);
      notify(`Empresa "${formName}" atualizada com sucesso.`);
    } else {
      onAdd(tenantData);
      notify(`Nova unidade "${formName}" provisionada.`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (id === currentTenantId) {
      notify("Erro: Você não pode excluir a empresa que está operando no momento.");
      return;
    }
    if (confirm('ATENÇÃO: Isso excluirá todos os dados, leads e configurações desta unidade. Continuar?')) {
      onDelete(id);
      notify("Unidade removida do cluster.");
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.niche.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* HEADER MANAGER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
             <Building2 className="text-indigo-600" /> Gestão Multi-Empresa
          </h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
            Controle Central de Unidades e Franquias
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar empresa..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500 transition-all"
              />
           </div>
           <button 
             onClick={handleOpenAdd}
             className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg hover:scale-105"
           >
             <Plus size={16} /> Nova Unidade
           </button>
        </div>
      </div>

      {/* GRID DE EMPRESAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTenants.map(t => (
          <div 
            key={t.id} 
            className={`p-6 rounded-[2.5rem] border-2 transition-all relative group overflow-hidden ${
              t.id === currentTenantId 
              ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-500 shadow-xl' 
              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-300 shadow-sm'
            }`}
          >
             {t.id === currentTenantId && (
               <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1.5 rounded-bl-2xl text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Power size={10} className="animate-pulse" /> Ativo
               </div>
             )}

             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ${t.id === currentTenantId ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      {t.name.charAt(0)}
                   </div>
                   <div>
                      <h4 className="font-black text-lg italic uppercase tracking-tight text-slate-900 dark:text-white truncate max-w-[150px]">{t.name}</h4>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[8px] font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                         <Briefcase size={8} /> {t.niche}
                      </span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                   <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Receita</p>
                   <div className="flex items-center gap-1.5 text-emerald-600">
                      <Wallet size={12} />
                      <span className="text-xs font-black">R$ {t.revenue.toLocaleString()}</span>
                   </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                   <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Leads</p>
                   <div className="flex items-center gap-1.5 text-indigo-600">
                      <Users size={12} />
                      <span className="text-xs font-black">{t.activeLeads}</span>
                   </div>
                </div>
             </div>

             <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex gap-2">
                   <button onClick={() => handleOpenEdit(t)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"><Edit3 size={16}/></button>
                   {t.id !== currentTenantId && (
                     <button onClick={() => handleDelete(t.id)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"><Trash2 size={16}/></button>
                   )}
                </div>
                
                {t.id !== currentTenantId ? (
                  <button 
                    onClick={() => onSwitch(t)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
                  >
                     <LogIn size={12} /> Acessar Painel
                  </button>
                ) : (
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-4">Operando Agora</span>
                )}
             </div>
          </div>
        ))}
      </div>

      {/* MODAL CRIAR/EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl p-10 border border-white/10 relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-rose-500 transition-all"><X size={20}/></button>
              
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg"><Building2 size={24}/></div>
                 <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100">{editingTenant ? 'Editar Empresa' : 'Nova Unidade'}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Configuração de Tenant e Nicho</p>
                 </div>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-4">Nome da Empresa</label>
                    <input 
                      required 
                      value={formName} 
                      onChange={e => setFormName(e.target.value)} 
                      placeholder="Ex: Barbearia Viking" 
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 dark:text-white" 
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-4">Nicho de Mercado</label>
                    <div className="relative">
                       <select 
                         value={formNiche} 
                         onChange={e => setFormNiche(e.target.value)} 
                         className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 appearance-none dark:text-white"
                       >
                          {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                       </select>
                       <Briefcase size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-4">Modo de Operação</label>
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         type="button"
                         onClick={() => setFormMode('DIRECT')}
                         className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formMode === 'DIRECT' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                       >
                          <ShoppingCart size={20} />
                          <span className="text-[9px] font-black uppercase">Venda Direta</span>
                       </button>
                       <button 
                         type="button"
                         onClick={() => setFormMode('ASSISTED')}
                         className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formMode === 'ASSISTED' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                       >
                          <Handshake size={20} />
                          <span className="text-[9px] font-black uppercase">Venda Consultiva</span>
                       </button>
                    </div>
                 </div>

                 <button type="submit" className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-[0.2em]">
                    {editingTenant ? 'Salvar Alterações' : 'Criar Unidade'}
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};
