import React, { useState, useRef } from 'react';
import { 
  User, Mail, Lock, ShieldCheck, Trash2, Camera, Bell, 
  Globe, LogOut, Save, AlertTriangle, Key, Smartphone,
  CheckCircle2, Loader2, X, CreditCard, Sparkles,
  Zap, Calendar, Crown, Plus, CheckCircle, Wallet,
  Fingerprint, Rocket, ShieldAlert, History, CreditCard as CardIcon
} from 'lucide-react';

interface UserProfileProps {
  user: { name: string; email: string; role: string; avatar?: string | null };
  onUpdate: (data: any) => void;
  onLogout: () => void;
  notify: (msg: string) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate, onLogout, notify }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'subscription' | 'billing' | 'danger'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        notify('Erro: Imagem muito grande. Use uma foto de até 1MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdate({ avatar: base64String });
        notify('Avatar Master atualizado!');
      };
      reader.onerror = () => notify('Erro ao ler o arquivo.');
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onUpdate({ name, email });
      setIsLoading(false);
      notify('Perfil Master sincronizado!');
    }, 1200);
  };

  const activeCards = [
    { id: '1', brand: 'Visa', last4: '4242', exp: '12/26', status: 'Principal' },
    { id: '2', brand: 'Mastercard', last4: '8812', exp: '08/25', status: 'Reserva' }
  ];

  return (
    <div className="p-10 space-y-10 animate-in fade-in max-w-5xl mx-auto pb-40">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleAvatarChange} 
        accept="image/*" 
        className="hidden" 
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
           <div className="relative">
              <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-2xl border-4 border-white dark:border-slate-800 overflow-hidden">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-950 animate-pulse"></div>
           </div>
           <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black italic uppercase tracking-tight">Master Console</h1>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase rounded-lg border border-emerald-500/20">Online</span>
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Status: Conexão Criptografada Ativa</p>
           </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 px-6 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-100 dark:border-800">
          <LogOut size={16} /> Encerrar Sessão
        </button>
      </div>

      <div className="flex bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-2 rounded-[2.5rem] w-full overflow-x-auto no-scrollbar shadow-sm">
        {[
          { id: 'profile', label: 'Dados', icon: User },
          { id: 'security', label: 'Segurança', icon: Lock },
          { id: 'subscription', label: 'Assinatura', icon: Crown },
          { id: 'billing', label: 'Pagamentos', icon: CreditCard },
          { id: 'danger', label: 'Crítico', icon: AlertTriangle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3.5rem] shadow-sm overflow-hidden min-h-[500px]">
        
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-12 space-y-10 animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-10">
               <div className="relative group">
                  <div className="w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl transition-transform group-hover:scale-105 overflow-hidden border-4 border-white dark:border-slate-800">
                     {user.avatar ? (
                        <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
                     ) : (
                        user.name.charAt(0)
                     )}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl text-indigo-600 border border-slate-100 dark:border-slate-700 hover:scale-110 transition-all z-10"
                  >
                     <Camera size={20} />
                  </button>
               </div>
               <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tight">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Fingerprint size={14} className="text-indigo-600" />
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{user.role}</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-2">Nome de Exibição</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold focus:ring-4 ring-indigo-500/10" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-2">E-mail Master</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold focus:ring-4 ring-indigo-500/10" />
               </div>
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
               <button type="submit" disabled={isLoading} className="px-12 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-3 uppercase text-[10px] tracking-widest">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isLoading ? 'Salvando...' : 'Sincronizar Dados'}
               </button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="p-12 space-y-12 animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-blue-50 text-blue-600 rounded-3xl"><Key size={32} /></div>
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight">Segurança de Acesso</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Proteção de Identidade Master</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-2">Nova Senha Master</label>
                  <input type="password" placeholder="••••••••••••" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold focus:ring-4 ring-indigo-500/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-2">Confirmar Senha</label>
                  <input type="password" placeholder="••••••••••••" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold focus:ring-4 ring-indigo-500/10" />
                </div>
                <button className="px-10 py-5 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">Atualizar Security Passphrase</button>
              </div>

              <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800 flex flex-col justify-between">
                <div className="flex items-center gap-4 mb-6">
                  <Smartphone className="text-indigo-600" size={24} />
                  <h4 className="text-lg font-black italic uppercase tracking-tight">Autenticação 2FA</h4>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed tracking-widest mb-8">Exigir código via app ou SMS para cada novo login em dispositivos desconhecidos.</p>
                <button className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all">Configurar Autenticador</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="p-12 space-y-12 animate-in slide-in-from-bottom-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="flex items-center gap-6">
                <div className="p-5 bg-purple-50 text-purple-600 rounded-3xl"><Crown size={32} /></div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tight">Assinatura Master</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Plano Ativo e Ciclo de Faturamento</p>
                </div>
              </div>
              <span className="px-6 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border-4 border-white dark:border-slate-800">Assinatura Ativa</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-10 bg-slate-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group col-span-1 md:col-span-2">
                <Rocket className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10 space-y-8">
                  <div>
                    <h4 className="text-3xl font-black italic uppercase tracking-tighter">PLANO ESCALAR</h4>
                    <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Capacidade Ilimitada Master</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black italic tracking-tighter tabular-nums">R$ 397</span>
                    <span className="text-xs font-bold uppercase opacity-50">/mês</span>
                  </div>
                  <div className="pt-6 flex gap-3">
                    <button className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-50 transition-all">Alterar Plano</button>
                    <button className="px-8 py-4 bg-white/10 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all">Cancelar Ciclo</button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Próxima Renovação</p>
                  <h5 className="text-2xl font-black italic uppercase tracking-tight">15 Out, 2024</h5>
                </div>
                <div className="pt-8 space-y-4">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <span>Leads Utilizados</span>
                    <span>8.5k / 10k</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 w-[85%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="p-12 space-y-12 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="p-5 bg-emerald-50 text-emerald-600 rounded-3xl"><Wallet size={32} /></div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tight">Métodos & Faturas</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Gestão de Cobrança e Histórico</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl">
                <Plus size={16} /> Novo Cartão Master
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 px-2">Cartões Cadastrados</h4>
                {activeCards.map(card => (
                  <div key={card.id} className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-indigo-400 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm"><CardIcon size={24} className="text-slate-400" /></div>
                      <div>
                        <p className="font-black italic uppercase tracking-tight text-lg">{card.brand} •••• {card.last4}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Expira em {card.exp} • <span className="text-emerald-500">{card.status}</span></p>
                      </div>
                    </div>
                    <button className="p-3 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 px-2">Histórico de Faturas</h4>
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                   {[
                     { date: '15 Set, 2024', val: 'R$ 397,00', status: 'PAID' },
                     { date: '15 Ago, 2024', val: 'R$ 397,00', status: 'PAID' },
                     { date: '15 Jul, 2024', val: 'R$ 397,00', status: 'PAID' },
                   ].map((inv, i) => (
                     <div key={i} className="px-8 py-6 flex items-center justify-between border-b border-slate-50 last:border-none hover:bg-slate-50 transition-all">
                        <div className="flex items-center gap-4">
                           <History size={16} className="text-slate-300" />
                           <span className="font-bold text-sm">{inv.date}</span>
                        </div>
                        <div className="flex items-center gap-6">
                           <span className="font-black italic text-sm">{inv.val}</span>
                           <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={14} /></span>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="p-12 space-y-12 animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-rose-50 text-rose-600 rounded-3xl"><ShieldAlert size={32} /></div>
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-rose-600">Área Crítica</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Ações Irreversíveis de Conta Master</p>
              </div>
            </div>

            <div className="max-w-2xl bg-rose-50 dark:bg-rose-900/10 p-10 rounded-[3.5rem] border border-rose-100 dark:border-rose-900/30 space-y-8">
              <div className="flex gap-6">
                 <AlertTriangle size={32} className="text-rose-500 shrink-0" />
                 <div className="space-y-4">
                    <h4 className="text-xl font-black italic uppercase tracking-tight">Exclusão Permanente de Conta</h4>
                    <p className="text-[10px] text-rose-700/70 dark:text-rose-400 font-bold uppercase leading-relaxed tracking-widest italic">
                      Ao encerrar sua conta master, todas as suas unidades, leads, integrações e históricos de conversas da VPS Evolution serão destruídos permanentemente após 30 dias.
                    </p>
                 </div>
              </div>
              
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-6 bg-rose-600 text-white font-black rounded-3xl shadow-xl hover:bg-rose-700 transition-all uppercase text-[10px] tracking-widest"
                >
                  Desejo encerrar minha Autoridade Master
                </button>
              ) : (
                <div className="space-y-6 animate-in zoom-in-95">
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-rose-500">
                    <p className="text-center font-black text-rose-600 uppercase text-xs">Confirme digitando SEU E-MAIL abaixo:</p>
                    <input 
                      placeholder={user.email} 
                      className="w-full mt-4 px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none font-bold text-center"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => notify('Processo de encerramento iniciado...')} className="flex-1 py-5 bg-rose-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl">Confirmar Destruição</button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 font-black rounded-2xl text-[10px] uppercase tracking-widest">Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};