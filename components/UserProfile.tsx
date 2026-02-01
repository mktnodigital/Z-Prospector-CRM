
import React, { useState, useRef } from 'react';
import { 
  User, Mail, Lock, ShieldCheck, Trash2, Camera, Bell, 
  Globe, LogOut, Save, AlertTriangle, Key, Smartphone,
  CheckCircle2, Loader2, X, CreditCard, Sparkles,
  Zap, Calendar, Crown, Plus, CheckCircle, Wallet,
  Fingerprint, Rocket, ShieldAlert, History, CreditCard as CardIcon,
  FileText, Download, QrCode, Copy, RefreshCw, ChevronRight, Power,
  Landmark, ArrowRight
} from 'lucide-react';

interface UserProfileProps {
  user: { name: string; email: string; role: string; avatar?: string | null };
  onUpdate: (data: any) => void;
  onLogout: () => void;
  notify: (msg: string) => void;
}

// Mock Data - Updated with Pending Invoice
const MOCK_INVOICES = [
  { id: 'inv_004', date: '01/11/2024', amount: 'R$ 397,00', status: 'PENDING', url: '#' },
  { id: 'inv_001', date: '01/10/2024', amount: 'R$ 397,00', status: 'PAID', url: '#' },
  { id: 'inv_002', date: '01/09/2024', amount: 'R$ 397,00', status: 'PAID', url: '#' },
];

const AVAILABLE_PLANS = [
  { id: 'starter', name: 'Starter', price: '97', features: ['1 Usuário', 'Kanban Básico'] },
  { id: 'pro', name: 'Professional', price: '197', features: ['5 Usuários', 'Automação IA', 'Disparos'] },
  { id: 'master', name: 'Master (Franquia)', price: '397', features: ['Multi-tenant', 'API Aberta', 'Gerente de Contas'] }
];

interface PaymentMethod {
  id: string;
  type: 'CARD' | 'PIX';
  brand?: string; // mastercard, visa
  last4?: string;
  exp?: string;
  holder?: string;
  pixKey?: string; // For PIX type
  isDefault: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate, onLogout, notify }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'subscription' | 'billing' | 'danger'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmationEmail, setDeleteConfirmationEmail] = useState('');
  
  // Security State
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  
  // Subscription State
  const [planStatus, setPlanStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [currentPlan, setCurrentPlan] = useState(AVAILABLE_PLANS[2]); // Default Master
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Billing & Wallet State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'CARD', brand: 'mastercard', last4: '8812', exp: '08/29', holder: user.name.toUpperCase(), isDefault: true },
    { id: '2', type: 'CARD', brand: 'visa', last4: '4242', exp: '12/26', holder: user.name.toUpperCase(), isDefault: false }
  ]);
  const [isAddMethodModalOpen, setIsAddMethodModalOpen] = useState(false);
  const [newMethodType, setNewMethodType] = useState<'CARD' | 'PIX'>('CARD');
  // New Method Form State
  const [cardForm, setCardForm] = useState({ number: '', holder: '', exp: '', cvv: '' });
  const [pixForm, setPixForm] = useState({ key: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  // --- HANDLERS ---

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB
        notify('Erro: Imagem muito grande (Max 2MB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdate({ avatar: base64String });
        notify('Foto de perfil atualizada com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onUpdate({ name, email });
      setIsLoading(false);
      notify('Perfil sincronizado com o servidor!');
    }, 1000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      notify('Erro: As senhas não conferem.');
      return;
    }
    if (passwordForm.new.length < 6) {
      notify('Erro: A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
      notify('Senha alterada com segurança!');
    }, 1500);
  };

  const handleEnableMfa = () => {
    setIsMfaModalOpen(true);
  };

  const handleConfirmMfa = () => {
    setIsMfaModalOpen(false);
    notify('MFA Ativado! Sua conta agora está blindada.');
  };

  const handlePlanChange = (plan: typeof AVAILABLE_PLANS[0]) => {
    setIsLoading(true);
    setTimeout(() => {
        setCurrentPlan(plan);
        setPlanStatus('ACTIVE'); // Reactiva se mudar de plano
        setIsLoading(false);
        setIsPlanModalOpen(false);
        notify(`Plano alterado para ${plan.name} com sucesso!`);
    }, 1200);
  };

  const handleToggleStatus = () => {
    const newStatus = planStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setPlanStatus(newStatus);
    notify(newStatus === 'ACTIVE' ? 'Assinatura Reativada!' : 'Assinatura Pausada/Inativa.');
  };

  const handleDownloadFile = (fileName: string) => {
    notify(`Gerando PDF do documento...`);
    setTimeout(() => {
        const content = "RECIBO DE PAGAMENTO\n\nEste documento comprova o pagamento do plano " + currentPlan.name + ".\n\nData: " + new Date().toLocaleDateString();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        notify('Download concluído.');
    }, 1500);
  };

  const handleRemoveMethod = (id: string) => {
    if (paymentMethods.length === 1) {
        notify('Erro: Você precisa ter pelo menos um método de pagamento ativo.');
        return;
    }
    if (confirm('Remover este método de pagamento?')) {
        setPaymentMethods(prev => prev.filter(c => c.id !== id));
        notify('Método de pagamento removido.');
    }
  };

  const handlePayInvoice = (invId: string) => {
    notify('Processando pagamento...');
    setTimeout(() => {
        notify(`Fatura ${invId} paga com sucesso!`);
        // In a real app, update state here.
    }, 1500);
  };

  const handleSavePaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      const newMethod: PaymentMethod = newMethodType === 'CARD' 
        ? {
            id: `card_${Date.now()}`,
            type: 'CARD',
            brand: 'visa', // Mock detection
            last4: cardForm.number.slice(-4),
            exp: cardForm.exp,
            holder: cardForm.holder.toUpperCase(),
            isDefault: false
          }
        : {
            id: `pix_${Date.now()}`,
            type: 'PIX',
            pixKey: pixForm.key,
            isDefault: false
          };

      setPaymentMethods([...paymentMethods, newMethod]);
      setIsLoading(false);
      setIsAddMethodModalOpen(false);
      setCardForm({ number: '', holder: '', exp: '', cvv: '' });
      setPixForm({ key: '' });
      notify(newMethodType === 'CARD' ? 'Cartão adicionado à carteira!' : 'Chave Pix vinculada com sucesso!');
    }, 1500);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmationEmail === user.email) {
        notify('Processo de encerramento iniciado. Você receberá um e-mail em breve.');
        setShowDeleteConfirm(false);
    } else {
        notify('E-mail incorreto. A ação foi bloqueada.');
    }
  };

  return (
    <div className="p-4 md:p-10 space-y-10 animate-in fade-in max-w-6xl mx-auto pb-40 relative">
      <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />

      {/* MFA MODAL */}
      {isMfaModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
              <button onClick={() => setIsMfaModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 transition-all"><X size={20}/></button>
              <div className="text-center space-y-4 mb-8">
                 <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><QrCode size={32}/></div>
                 <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white">Ativar 2FA</h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Escaneie o QR Code com o Google Authenticator</p>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border-4 border-slate-100 mx-auto w-48 h-48 mb-6 flex items-center justify-center">
                 <QrCode size={120} className="text-slate-900"/>
              </div>

              <div className="space-y-4">
                 <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
                    <code className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">XJY7-99KA-L2M1-00P2</code>
                    <button onClick={() => { navigator.clipboard.writeText('XJY7-99KA-L2M1-00P2'); notify('Código copiado!'); }} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"><Copy size={14}/></button>
                 </div>
                 <button onClick={handleConfirmMfa} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg hover:bg-blue-700 transition-all">Validar e Ativar</button>
              </div>
           </div>
        </div>
      )}

      {/* PLAN SELECTION MODAL */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden">
              <button onClick={() => setIsPlanModalOpen(false)} className="absolute top-8 right-8 p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 transition-all z-20"><X size={20}/></button>
              
              <div className="text-center mb-10 relative z-10">
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">Escolha sua Evolução</h2>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Alterar plano ou ciclo de faturamento</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                 {AVAILABLE_PLANS.map(plan => (
                   <div key={plan.id} className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer flex flex-col relative overflow-hidden group ${currentPlan.id === plan.id ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-300 bg-white dark:bg-slate-800'}`}>
                      {currentPlan.id === plan.id && (
                        <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[8px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-widest">Atual</div>
                      )}
                      <h3 className="text-xl font-black italic uppercase text-slate-800 dark:text-white mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mb-6">
                         <span className="text-sm font-bold text-slate-400">R$</span>
                         <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{plan.price}</span>
                         <span className="text-[10px] font-bold text-slate-400">/mês</span>
                      </div>
                      <div className="space-y-3 mb-8 flex-1">
                         {plan.features.map((feat, i) => (
                           <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">
                              <CheckCircle2 size={12} className="text-emerald-500" /> {feat}
                           </div>
                         ))}
                      </div>
                      <button 
                        onClick={() => handlePlanChange(plan)}
                        disabled={currentPlan.id === plan.id}
                        className={`w-full py-4 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${
                          currentPlan.id === plan.id 
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-default' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
                        }`}
                      >
                         {currentPlan.id === plan.id ? 'Plano Atual' : 'Selecionar'}
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* ADD PAYMENT METHOD MODAL */}
      {isAddMethodModalOpen && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
              <button onClick={() => setIsAddMethodModalOpen(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-rose-500 transition-all"><X size={20}/></button>
              
              <div className="mb-8">
                 <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white">Adicionar Método</h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Escolha como prefere pagar sua assinatura</p>
              </div>

              {/* TABS SELECTION */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8">
                 <button 
                   onClick={() => setNewMethodType('CARD')}
                   className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${newMethodType === 'CARD' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                 >
                    <CreditCard size={14} /> Cartão de Crédito
                 </button>
                 <button 
                   onClick={() => setNewMethodType('PIX')}
                   className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${newMethodType === 'PIX' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                 >
                    <Zap size={14} /> Pix Recorrente
                 </button>
              </div>

              <form onSubmit={handleSavePaymentMethod} className="space-y-6">
                 {newMethodType === 'CARD' ? (
                    <>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 px-3">Número do Cartão</label>
                          <input required value={cardForm.number} onChange={e => setCardForm({...cardForm, number: e.target.value})} placeholder="0000 0000 0000 0000" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-4 ring-indigo-500/10 dark:text-white" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 px-3">Nome no Cartão</label>
                          <input required value={cardForm.holder} onChange={e => setCardForm({...cardForm, holder: e.target.value})} placeholder="COMO NO CARTÃO" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-4 ring-indigo-500/10 dark:text-white uppercase" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-slate-400 px-3">Validade</label>
                             <input required value={cardForm.exp} onChange={e => setCardForm({...cardForm, exp: e.target.value})} placeholder="MM/AA" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-4 ring-indigo-500/10 dark:text-white" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-slate-400 px-3">CVV</label>
                             <input required value={cardForm.cvv} onChange={e => setCardForm({...cardForm, cvv: e.target.value})} placeholder="123" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-4 ring-indigo-500/10 dark:text-white" />
                          </div>
                       </div>
                    </>
                 ) : (
                    <div className="space-y-6">
                       <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 text-center">
                          <QrCode size={48} className="text-emerald-600 mx-auto mb-4" />
                          <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide leading-relaxed">
                             Cadastre sua chave Pix para débito automático ou gere um QR Code mensalmente.
                          </p>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 px-3">Chave Pix (CPF/CNPJ/Email)</label>
                          <input required value={pixForm.key} onChange={e => setPixForm({...pixForm, key: e.target.value})} placeholder="Sua chave aqui..." className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-4 ring-emerald-500/10 dark:text-white" />
                       </div>
                    </div>
                 )}

                 <button type="submit" disabled={isLoading} className={`w-full py-5 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg transition-all ${newMethodType === 'CARD' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                    {isLoading ? 'Processando...' : (newMethodType === 'CARD' ? 'Salvar Cartão Seguro' : 'Vincular Pix')}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* HEADER PERFIL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="flex items-center gap-8 relative z-10">
           <div className="relative group">
              <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-indigo-500/20 border-4 border-white dark:border-slate-800 overflow-hidden transform group-hover:rotate-3 transition-all">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-lg text-indigo-600 border border-slate-100 dark:border-slate-700 hover:scale-110 hover:text-purple-600 transition-all"
                title="Alterar Foto"
              >
                <Camera size={18} />
              </button>
           </div>
           <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">{user.name}</h1>
                <CheckCircle2 size={20} fill="currentColor" className="text-white bg-blue-500 rounded-full" />
              </div>
              <div className="flex items-center gap-3">
                 <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase rounded-lg border border-indigo-100 dark:border-indigo-800 tracking-wider">
                    {user.role === 'SUPER_ADMIN' ? 'Owner / Dono' : user.role}
                 </span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• ID: #88219</span>
              </div>
           </div>
        </div>

        <button onClick={onLogout} className="flex items-center gap-3 px-8 py-4 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 transition-all border border-slate-200 dark:border-slate-800 group relative z-10">
          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Sair da Conta
        </button>
      </div>

      {/* MENU DE NAVEGAÇÃO (TABS) */}
      <div className="flex flex-wrap justify-center gap-2 p-2 bg-white dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm sticky top-4 z-40 backdrop-blur-md">
        {[
          { id: 'profile', label: 'Dados Pessoais', icon: User, color: 'indigo' },
          { id: 'security', label: 'Segurança & Senha', icon: ShieldCheck, color: 'blue' },
          { id: 'subscription', label: 'Plano & Limites', icon: Crown, color: 'purple' },
          { id: 'billing', label: 'Faturas & Cartões', icon: CreditCard, color: 'emerald' },
          { id: 'danger', label: 'Zona de Perigo', icon: AlertTriangle, color: 'rose' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? `bg-${tab.color}-500 text-white shadow-lg shadow-${tab.color}-500/30 scale-105` 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden min-h-[500px] relative">
        
        {/* TAB: PERFIL */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-8 md:p-12 space-y-10 animate-in slide-in-from-bottom-4">
             <div className="flex items-center gap-5 pb-8 border-b border-slate-100 dark:border-slate-800">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl"><Fingerprint size={28}/></div>
                <div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100">Identidade de Acesso</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Informações visíveis para a equipe</p>
                </div>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-widest">Nome Completo</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold text-slate-800 dark:text-white border-none outline-none focus:ring-4 ring-indigo-500/10 shadow-inner transition-all" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-widest">E-mail Corporativo</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold text-slate-800 dark:text-white border-none outline-none focus:ring-4 ring-indigo-500/10 shadow-inner transition-all" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-widest">WhatsApp (Recuperação)</label>
                  <input placeholder="(00) 00000-0000" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold text-slate-800 dark:text-white border-none outline-none focus:ring-4 ring-indigo-500/10 shadow-inner transition-all" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-widest">Cargo / Função</label>
                  <input disabled value={user.role} className="w-full px-8 py-5 bg-slate-100 dark:bg-slate-800/50 rounded-3xl font-bold text-slate-500 border-none outline-none cursor-not-allowed opacity-70" />
               </div>
            </div>

            <div className="pt-6 flex justify-end">
               <button type="submit" disabled={isLoading} className="px-10 py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-3 uppercase text-[10px] tracking-[0.2em]">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Salvar Alterações
               </button>
            </div>
          </form>
        )}

        {/* TAB: SEGURANÇA */}
        {activeTab === 'security' && (
          <div className="p-8 md:p-12 space-y-12 animate-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Change Password */}
              <div className="space-y-8">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl"><Lock size={24}/></div>
                    <h4 className="text-xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100">Redefinir Senha</h4>
                 </div>
                 
                 <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-slate-400 px-3">Senha Atual</label>
                       <input type="password" required value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-4 ring-blue-500/10 dark:text-white" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-slate-400 px-3">Nova Senha</label>
                       <input type="password" required value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-4 ring-blue-500/10 dark:text-white" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-slate-400 px-3">Confirmar Nova Senha</label>
                       <input type="password" required value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-4 ring-blue-500/10 dark:text-white" placeholder="••••••••" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full py-5 bg-slate-900 dark:bg-slate-800 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-lg mt-4">
                       {isLoading ? 'Processando...' : 'Atualizar Credenciais'}
                    </button>
                 </form>
              </div>

              {/* MFA Status */}
              <div className="bg-blue-50 dark:bg-blue-900/10 p-10 rounded-[3rem] border border-blue-100 dark:border-blue-800/30 flex flex-col justify-between relative overflow-hidden group">
                 <ShieldCheck className="absolute -right-10 -bottom-10 w-64 h-64 text-blue-500/10 group-hover:scale-110 transition-transform duration-700 rotate-12" />
                 
                 <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                       <Smartphone className="text-blue-600" size={32} />
                       <div>
                          <h4 className="text-xl font-black italic uppercase tracking-tight text-blue-900 dark:text-blue-100">Autenticação em 2 Etapas</h4>
                          <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mt-1">Status: <span className="text-rose-500">Desativado</span></p>
                       </div>
                    </div>
                    <p className="text-xs font-bold text-blue-800/70 dark:text-blue-200 leading-relaxed mb-8">
                       Adicione uma camada extra de segurança. Exigiremos um código do seu app autenticador sempre que você fizer login.
                    </p>
                 </div>
                 
                 <button onClick={handleEnableMfa} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl hover:bg-blue-700 transition-all relative z-10 flex items-center justify-center gap-2">
                    <QrCode size={16} /> Configurar 2FA
                 </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ASSINATURA */}
        {activeTab === 'subscription' && (
          <div className="p-8 md:p-12 space-y-12 animate-in slide-in-from-bottom-4">
            <div className="relative p-12 bg-slate-900 text-white rounded-[4rem] shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-indigo-900/50"></div>
                <Rocket className="absolute -right-10 -bottom-10 w-80 h-80 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                   <div className="space-y-6">
                      <div>
                         <div className="flex items-center gap-3 mb-3">
                           <Crown className="text-yellow-400 drop-shadow-md" size={32} fill="currentColor" />
                           <h4 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Plano {currentPlan.name}</h4>
                           
                           {/* STATUS BADGE & TOGGLE */}
                           <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${planStatus === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                 {planStatus === 'ACTIVE' ? 'Assinatura Ativa' : 'Inativo'}
                              </span>
                              <button onClick={handleToggleStatus} className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-all text-slate-300" title="Alternar Status (Simulação)">
                                 <Power size={12} />
                              </button>
                           </div>
                         </div>
                         <p className="text-indigo-200 text-[11px] font-black uppercase tracking-[0.4em] bg-white/10 px-4 py-2 rounded-full inline-block backdrop-blur-md">Node de Operação Ilimitada</p>
                      </div>
                      
                      <div className="flex items-baseline gap-2">
                         <span className="text-6xl font-black italic tracking-tighter tabular-nums">R$ {currentPlan.price}</span>
                         <span className="text-sm font-bold uppercase opacity-60">/ mês</span>
                      </div>

                      <div className="flex gap-2">
                         <span className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"><CheckCircle size={10} className="text-emerald-400"/> WhatsApp API</span>
                         <span className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"><CheckCircle size={10} className="text-emerald-400"/> Gemini AI</span>
                      </div>
                   </div>

                   <div className="flex flex-col gap-4 w-full md:w-auto min-w-[250px]">
                      <button onClick={() => setIsPlanModalOpen(true)} className="px-10 py-5 bg-white text-slate-900 font-black rounded-3xl text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                         <Sparkles size={16} className="text-indigo-600" /> Fazer Upgrade
                      </button>
                      <button onClick={() => setIsPlanModalOpen(true)} className="px-10 py-5 bg-white/10 text-white font-black rounded-3xl text-[10px] uppercase tracking-[0.2em] backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                         <RefreshCw size={16} /> Alterar Plano
                      </button>
                      <button onClick={() => handleDownloadFile('Contrato_SaaS_2024.pdf')} className="px-10 py-5 bg-white/5 text-white font-black rounded-3xl text-[10px] uppercase tracking-[0.2em] backdrop-blur-md border border-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                         <Download size={16} /> Contrato PDF
                      </button>
                   </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                 { label: 'Leads no Pipeline', value: '1.240', limit: '∞', color: 'text-indigo-600' },
                 { label: 'Disparos Mensais', value: '4.5k', limit: '10k', color: 'text-emerald-600' },
                 { label: 'Usuários Ativos', value: '5', limit: '10', color: 'text-blue-600' },
                 { label: 'Armazenamento', value: '2GB', limit: '50GB', color: 'text-purple-600' },
               ].map((stat, i) => (
                 <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                    <div className="mt-2">
                       <span className={`text-2xl font-black ${stat.color} block`}>{stat.value}</span>
                       <span className="text-[8px] font-bold text-slate-400 uppercase">de {stat.limit}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* TAB: FATURAS & CARTÕES (NOVO) */}
        {activeTab === 'billing' && (
          <div className="p-8 md:p-12 space-y-12 animate-in slide-in-from-bottom-4">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* Meus Métodos de Pagamento */}
                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <h4 className="text-xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
                         <Wallet size={20} className="text-emerald-600" /> Carteira
                      </h4>
                      <button 
                        onClick={() => setIsAddMethodModalOpen(true)} 
                        className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-emerald-500 hover:text-white transition-all text-slate-400 shadow-sm"
                        title="Adicionar Cartão ou Pix"
                      >
                         <Plus size={18} />
                      </button>
                   </div>

                   <div className="space-y-4">
                      {paymentMethods.map(method => (
                        <div key={method.id} className={`relative group overflow-hidden p-6 rounded-[2rem] text-white shadow-lg border border-transparent transition-all ${method.type === 'PIX' ? 'bg-gradient-to-br from-emerald-600 to-teal-800' : 'bg-gradient-to-br from-slate-800 to-slate-950 border-slate-700'}`}>
                           <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleRemoveMethod(method.id)} className="p-2 bg-white/10 rounded-full hover:bg-rose-500/80 transition-colors"><Trash2 size={14}/></button>
                           </div>
                           <div className="flex justify-between items-start mb-8">
                              {method.type === 'PIX' ? <Zap size={32} className="text-emerald-200" /> : <CardIcon size={32} className="text-slate-400" />}
                              {method.isDefault && <span className="bg-white/20 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full backdrop-blur-sm">Principal</span>}
                           </div>
                           <div className="space-y-4">
                              <p className="font-mono text-xl tracking-widest">
                                 {method.type === 'PIX' ? (method.pixKey || 'Chave Aleatória') : `•••• •••• •••• ${method.last4}`}
                              </p>
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                 <span>{method.type === 'PIX' ? 'PIX AUTOMÁTICO' : method.holder}</span>
                                 {method.type === 'CARD' && <span>{method.exp}</span>}
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Histórico de Faturas */}
                <div className="space-y-6">
                   <h4 className="text-xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-3">
                      <FileText size={20} className="text-slate-400" /> Histórico de Faturas
                   </h4>
                   <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden">
                      <div className="overflow-x-auto">
                         <table className="w-full text-left">
                            <thead className="bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400">
                               <tr>
                                  <th className="px-8 py-4">Data</th>
                                  <th className="px-8 py-4">Valor</th>
                                  <th className="px-8 py-4">Status</th>
                                  <th className="px-8 py-4 text-right">Ação</th>
                               </tr>
                            </thead>
                            <tbody className="text-xs font-bold text-slate-600 dark:text-slate-300">
                               {MOCK_INVOICES.map((inv) => (
                                  <tr key={inv.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-100/50 dark:hover:bg-slate-700/30 transition-colors">
                                     <td className="px-8 py-5">{inv.date}</td>
                                     <td className="px-8 py-5">{inv.amount}</td>
                                     <td className="px-8 py-5">
                                        <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wide ${
                                            inv.status === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 
                                            'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                                        }`}>
                                            {inv.status === 'PAID' ? 'Pago' : 'Pendente'}
                                        </span>
                                     </td>
                                     <td className="px-8 py-5 text-right">
                                        {inv.status === 'PAID' ? (
                                            <button onClick={() => handleDownloadFile(`Fatura_${inv.id}.pdf`)} className="text-indigo-500 hover:text-indigo-700 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all" title="Baixar PDF">
                                                <Download size={16}/>
                                            </button>
                                        ) : (
                                            <button onClick={() => handlePayInvoice(inv.id)} className="flex items-center gap-1 text-[8px] font-black bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-all uppercase tracking-wide ml-auto">
                                                <CreditCard size={10} /> Pagar
                                            </button>
                                        )}
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* TAB: ZONA DE PERIGO */}
        {activeTab === 'danger' && (
          <div className="p-8 md:p-12 space-y-12 animate-in slide-in-from-bottom-4">
            <div className="max-w-3xl bg-rose-50 dark:bg-rose-900/10 p-12 rounded-[4rem] border border-rose-100 dark:border-rose-900/30 space-y-10 relative overflow-hidden group mx-auto">
               <ShieldAlert className="absolute -right-10 -bottom-10 w-48 h-48 opacity-5 -rotate-12 group-hover:scale-125 transition-transform" />
               
               <div className="flex gap-8 relative z-10">
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-sm text-rose-500 h-fit hidden md:block"><AlertTriangle size={48} /></div>
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
                   className="w-full py-8 bg-rose-600 text-white font-black rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(225,29,72,0.4)] hover:bg-rose-700 hover:scale-[1.02] transition-all uppercase text-xs tracking-[0.4em] relative z-10 flex items-center justify-center gap-3"
                 >
                   <Trash2 size={18} /> Desejo Destruir Minha Conta Master
                 </button>
               ) : (
                 <div className="space-y-8 animate-in zoom-in-95 relative z-10">
                   <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-4 border-rose-500 shadow-xl">
                     <p className="text-center font-black text-rose-600 uppercase text-xs mb-4">Para confirmar, digite seu e-mail abaixo:</p>
                     <input 
                       value={deleteConfirmationEmail}
                       onChange={(e) => setDeleteConfirmationEmail(e.target.value)}
                       placeholder={user.email} 
                       className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-black text-center text-rose-600 italic placeholder:opacity-30"
                     />
                   </div>
                   <div className="flex gap-4">
                     <button onClick={handleDeleteAccount} className="flex-1 py-6 bg-rose-600 text-white font-black rounded-[1.8rem] text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-rose-700 transition-all">Confirmar Exclusão</button>
                     <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmationEmail(''); }} className="flex-1 py-6 bg-slate-100 dark:bg-slate-800 font-black rounded-[1.8rem] text-[11px] uppercase tracking-[0.3em] transition-all hover:bg-slate-200 dark:hover:bg-slate-700">Cancelar</button>
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
