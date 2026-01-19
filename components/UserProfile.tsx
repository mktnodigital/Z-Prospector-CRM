
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
        <div className="flex items-center gap-6">
           <div className="relative group">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] border-4 border-white dark:border-slate-800 overflow-hidden">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 p-2 bg-white dark:bg-slate-700 rounded-xl shadow-xl text-indigo-600 border border-slate-100 dark:border-slate-600 hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
           </div>
           <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter">{user.name}</h1>
                <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-xl border border-emerald-500/20">Autoridade Master</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1 italic">{user.role} • clikai.com.br</p>
           </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-3 px-8 py-4 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-100 dark:border-rose-800 shadow-sm">
          <LogOut size={18} /> Encerrar Sessão
        </button>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-900/50 p-2 rounded-[2.5rem] w-full overflow-x-auto no-scrollbar shadow-inner border border-slate-200 dark:border-slate-800">
        {[
          { id: 'profile', label: 'Dados de Acesso', icon: User, color: 'text-indigo-500', bg: 'bg-indigo-500' },
          { id: 'security', label: 'Segurança Global', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500' },
          { id: 'subscription', label: 'Minha Assinatura', icon: Crown, color: 'text-purple-500', bg: 'bg-purple-500' },
          { id: 'billing', label: 'Cartões & Faturas', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500' },
          { id: 'danger', label: 'Config. Críticas', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 ${
              activeTab === tab.id ? `${tab.bg} text-white shadow-2xl scale-[1.02]` : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[4rem] shadow-sm overflow-hidden min-h-[500px]">
        
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-12 space-y-12 animate-in slide-in-from-bottom-5">
             <div className="flex items-center gap-6">
                <div className="p-5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-[1.8rem]"><Fingerprint size={32}/></div>
                <div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tight">Identidade de Acesso</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Seus dados básicos na rede clikai</p>
                </div>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-4">Nome Completo</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-black italic border-none outline-none focus:ring-4 ring-indigo-500/10 shadow-inner" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-4">E-mail Master</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-black italic border-none outline-none focus:ring-4 ring-indigo-500/10 shadow-inner" />
               </div>
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
               <button type="submit" disabled={isLoading} className="px-12 py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-4 uppercase text-[10px] tracking-[0.2em]">
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                  {isLoading ? 'Sincronizando...' : 'Atualizar Perfil Master'}
               </button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="p-12 space-y-12 animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-[1.8rem]"><Lock size={32} /></div>
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight">Security Vault</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Proteção de Identidade e Acesso em Dois Fatores</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-4">Nova Senha Master</label>
                    <input type="password" placeholder="••••••••••••" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-blue-500/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-4">Confirmar Senha</label>
                    <input type="password" placeholder="••••••••••••" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-blue-500/10" />
                  </div>
                </div>
                <button className="w-full py-5 bg-slate-900 dark:bg-slate-800 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">Propagar Nova Senha</button>
              </div>

              <div className="p-10 bg-blue-50 dark:bg-blue-900/20 rounded-[3.5rem] border border-blue-100 dark:border-blue-800 flex flex-col justify-between group overflow-hidden relative">
                <ShieldCheck className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-125 transition-transform duration-700" />
                <div className="relative z-10">
                   <div className="flex items-center gap-4 mb-6">
                     <Smartphone className="text-blue-600" size={28} />
                     <h4 className="text-lg font-black italic uppercase tracking-tight">MFA Autenticador</h4>
                   </div>
                   <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase leading-relaxed tracking-widest mb-10 italic">
                     Garanta que apenas dispositivos autorizados acessem o Command Center. A ativação do MFA é mandatória para Super Admins.
                   </p>
                </div>
                <button className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all relative z-10">Configurar APP Autenticador</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="p-12 space-y-12 animate-in slide-in-from-bottom-5">
            <div className="p-12 bg-slate-900 text-white rounded-[4rem] shadow-2xl relative overflow-hidden group">
                <Rocket className="absolute -right-16 -bottom-16 w-64 h-64 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                   <div className="space-y-8">
                      <div>
                         <div className="flex items-center gap-3 mb-2">
                           <Crown className="text-yellow-400" size={24} />
                           <h4 className="text-4xl font-black italic uppercase tracking-tighter">PLANO ESCALAR</h4>
                         </div>
                         <p className="text-indigo-300 text-[11px] font-black uppercase tracking-[0.4em]">Node de Operação Ilimitada</p>
                      </div>
                      <div className="flex items-baseline gap-3">
                         <span className="text-6xl font-black italic tracking-tighter tabular-nums">R$ 397</span>
                         <span className="text-sm font-bold uppercase opacity-40">/ Mensal</span>
                      </div>
                   </div>
                   <div className="flex flex-col gap-4 w-full md:w-auto">
                      <button className="px-12 py-6 bg-white text-slate-900 font-black rounded-3xl text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-yellow-400 transition-all hover:scale-105 active:scale-95">Upgrade para Franquia</button>
                      <button className="px-12 py-6 bg-white/10 text-white font-black rounded-3xl text-[11px] uppercase tracking-[0.2em] backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all">Download Contrato SaaS</button>
                   </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="p-12 space-y-12 animate-in slide-in-from-bottom-5">
            <div className="max-w-3xl bg-rose-50 dark:bg-rose-900/10 p-12 rounded-[4rem] border border-rose-100 dark:border-rose-900/30 space-y-10 relative overflow-hidden group">
               <ShieldAlert className="absolute -right-10 -bottom-10 w-48 h-48 opacity-5 -rotate-12 group-hover:scale-125 transition-transform" />
               <div className="flex gap-8 relative z-10">
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-sm text-rose-500 h-fit"><AlertTriangle size={48} /></div>
                  <div className="space-y-6">
                     <div>
                        <h4 className="text-3xl font-black italic uppercase tracking-tight text-rose-600">Encerrar Autoridade</h4>
                        <p className="text-[10px] text-rose-700/60 dark:text-rose-400 font-bold uppercase leading-relaxed tracking-widest mt-1">ESTA AÇÃO É IRREVERSÍVEL</p>
                     </div>
                     <p className="text-sm font-bold text-slate-600 dark:text-slate-300 italic leading-loose uppercase tracking-tight">
                        Ao encerrar sua conta master, todos os sub-tenants vinculados, campanhas de disparos, audiências de IA e o banco de dados do pipeline serão deletados permanentemente de nossos clusters.
                     </p>
                  </div>
               </div>
               
               {!showDeleteConfirm ? (
                 <button 
                   onClick={() => setShowDeleteConfirm(true)}
                   className="w-full py-8 bg-rose-600 text-white font-black rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(225,29,72,0.4)] hover:bg-rose-700 hover:scale-[1.02] transition-all uppercase text-xs tracking-[0.4em] relative z-10"
                 >
                   Desejo Destruir Minha Conta Master
                 </button>
               ) : (
                 <div className="space-y-8 animate-in zoom-in-95 relative z-10">
                   <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-4 border-rose-500 shadow-xl">
                     <p className="text-center font-black text-rose-600 uppercase text-sm mb-4">Confirme digitando o e-mail {user.email}:</p>
                     <input 
                       placeholder="E-mail de confirmação" 
                       className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-black text-center text-rose-600 italic"
                     />
                   </div>
                   <div className="flex gap-4">
                     <button onClick={() => notify('Processo de encerramento iniciado...')} className="flex-1 py-6 bg-rose-600 text-white font-black rounded-[1.8rem] text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-rose-700 transition-all">Confirmar Exclusão</button>
                     <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-6 bg-slate-100 dark:bg-slate-800 font-black rounded-[1.8rem] text-[11px] uppercase tracking-[0.3em] transition-all">Cancelar Ação</button>
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
