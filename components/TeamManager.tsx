
import React, { useState } from 'react';
import { 
  Users, UserPlus, Shield, Mail, Key, 
  Trash2, Edit3, CheckCircle2, X, Search,
  BadgeCheck, UserCog
} from 'lucide-react';
import { User, UserRole } from '../types';

interface TeamManagerProps {
  notify: (msg: string) => void;
}

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Moisés Costa', email: 'moisescosta.mkt@gmail.com', role: 'SUPER_ADMIN', status: 'ACTIVE', lastLogin: 'Agora' },
  { id: 'u2', name: 'Roberto Almeida', email: 'gerente.roberto@zprospector.com', role: 'MANAGER', status: 'ACTIVE', lastLogin: 'Há 2h' },
  { id: 'u3', name: 'Ana Souza', email: 'atendimento.ana@zprospector.com', role: 'AGENT', status: 'ACTIVE', lastLogin: 'Há 5min' },
  { id: 'u4', name: 'Carlos Tech', email: 'dev@zprospector.com', role: 'TENANT_ADMIN', status: 'ACTIVE', lastLogin: 'Ontem' },
  { id: 'u5', name: 'Fernanda Vendas', email: 'fernanda@zprospector.com', role: 'AGENT', status: 'INACTIVE', lastLogin: 'Há 3 dias' },
];

export const TeamManager: React.FC<TeamManagerProps> = ({ notify }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', role: 'AGENT' as UserRole, password: '' });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'AGENT', password: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData, role: formData.role } : u));
      notify(`Usuário ${formData.name} atualizado.`);
    } else {
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: 'ACTIVE',
        lastLogin: 'Nunca'
      };
      setUsers([...users, newUser]);
      notify(`Usuário ${formData.name} convidado com sucesso.`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remover este usuário da organização?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
      notify('Usuário removido.');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch(role) {
      case 'SUPER_ADMIN': return <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-purple-200 dark:border-purple-800">Dono</span>;
      case 'TENANT_ADMIN': return <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-800">Admin</span>;
      case 'MANAGER': return <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-800">Gerente</span>;
      default: return <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">Agente</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
             <UserCog className="text-indigo-600" /> Gestão de Time
          </h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
            Controle de Acesso e Permissões Ilimitadas
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar membro..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500 transition-all"
              />
           </div>
           <button 
             onClick={handleOpenAdd}
             className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg hover:scale-105"
           >
             <UserPlus size={16} /> Convidar
           </button>
        </div>
      </div>

      {/* LISTA DE USUÁRIOS */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50 dark:bg-slate-800/50 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                     <th className="px-10 py-6">Membro</th>
                     <th className="px-10 py-6">Função</th>
                     <th className="px-10 py-6">Status</th>
                     <th className="px-10 py-6">Último Acesso</th>
                     <th className="px-10 py-6 text-right">Ações</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300">
                  {filteredUsers.map(user => (
                     <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                                 {user.name.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-black text-slate-900 dark:text-white">{user.name}</p>
                                 <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-6">{getRoleBadge(user.role)}</td>
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'} animate-pulse`}></div>
                              <span className="text-[10px] font-black uppercase tracking-widest">{user.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}</span>
                           </div>
                        </td>
                        <td className="px-10 py-6 text-[11px] text-slate-500">{user.lastLogin}</td>
                        <td className="px-10 py-6 text-right">
                           <div className="flex justify-end gap-2">
                              <button onClick={() => handleOpenEdit(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"><Edit3 size={16}/></button>
                              <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"><Trash2 size={16}/></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl p-10 border border-white/10 relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-rose-500 transition-all"><X size={20}/></button>
              
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg"><Users size={24}/></div>
                 <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100">{editingUser ? 'Editar Acesso' : 'Novo Membro'}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Configuração de Permissões</p>
                 </div>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-4">Nome Completo</label>
                    <input 
                      required 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      placeholder="Ex: João Silva" 
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 dark:text-white" 
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-4">E-mail Corporativo</label>
                    <div className="relative">
                       <input 
                         type="email"
                         required 
                         value={formData.email} 
                         onChange={e => setFormData({...formData, email: e.target.value})} 
                         placeholder="email@empresa.com" 
                         className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 dark:text-white" 
                       />
                       <Mail size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 px-4">Nível de Acesso</label>
                       <div className="relative">
                          <select 
                            value={formData.role} 
                            onChange={e => setFormData({...formData, role: e.target.value as UserRole})} 
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 appearance-none dark:text-white"
                          >
                             <option value="AGENT">Agente (Atendimento)</option>
                             <option value="MANAGER">Gerente (Relatórios)</option>
                             <option value="TENANT_ADMIN">Admin da Unidade</option>
                             <option value="SUPER_ADMIN">Dono (Acesso Total)</option>
                          </select>
                          <Shield size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 px-4">Senha Provisória</label>
                       <div className="relative">
                          <input 
                            type="password"
                            placeholder="******" 
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 dark:text-white" 
                          />
                          <Key size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                       </div>
                    </div>
                 </div>

                 <button type="submit" className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2">
                    <BadgeCheck size={18}/>
                    {editingUser ? 'Salvar Acesso' : 'Enviar Convite'}
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};
