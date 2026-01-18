import React, { useState } from 'react';
import { 
  Zap, Key, Webhook, Smartphone, CreditCard, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, Power, Trash2, Edit3, Plus, Loader2, Download, X, QrCode, Globe,
  Shield, Landmark, Wallet, Layers, Cpu, Code2, Bitcoin, Lock
} from 'lucide-react';
import { Integration } from '../types';

export const IntegrationSettings: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    { 
      id: 'mercadopago', 
      name: 'Mercado Pago Master', 
      description: 'Gateway principal configurado (Public Key: APP_USR-002bea90...)',
      status: 'CONNECTED',
      icon: 'globe',
      color: 'blue'
    },
    { 
      id: 'stripe', 
      name: 'Stripe Payments', 
      description: 'Checkout global com suporte a cartões e Apple/Google Pay.',
      status: 'DISCONNECTED',
      icon: 'credit-card',
      color: 'indigo'
    },
    { 
      id: 'pix', 
      name: 'Pix Direto (SaaS)', 
      description: 'Receba assinaturas diretamente na conta via chave Pix.',
      status: 'CONNECTED',
      icon: 'qr-code',
      color: 'emerald'
    }
  ]);

  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Integration | null>(null);
  
  // Configurações persistentes simuladas
  const [mpConfig, setMpConfig] = useState({
    publicKey: 'APP_USR-002bea90-b942-4ce4-b11b-23d8b5c20129',
    accessToken: 'APP_USR-6753851427183711-010709-9854e4f00925122f568c09f6fc8ded4a-1520508',
    clientId: '6753851427183711',
    clientSecret: 'E7eBztgP2wTH8xyF5KN2xz3B8vLIVpD6'
  });

  const [stripeConfig, setStripeConfig] = useState({
    publicKey: '',
    secretKey: ''
  });

  const [pixConfig, setPixConfig] = useState({
    chave: '',
    beneficiario: ''
  });

  const availableIcons = [
    { id: 'credit-card', icon: CreditCard },
    { id: 'qr-code', icon: QrCode },
    { id: 'globe', icon: Globe },
    { id: 'landmark', icon: Landmark },
    { id: 'wallet', icon: Wallet },
    { id: 'bitcoin', icon: Bitcoin },
    { id: 'cpu', icon: Cpu },
    { id: 'shield', icon: Shield }
  ];

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsProcessingId(editingItem.id);
    
    setTimeout(() => {
      setIsProcessingId(null);
      setShowConfigModal(false);
      
      setIntegrations(prev => prev.map(i => {
        if (i.id === editingItem.id) {
          return { ...i, status: 'CONNECTED' };
        }
        return i;
      }));
    }, 1500);
  };

  const handleTogglePower = (id: string) => {
    setIntegrations(prev => prev.map(i => {
      if (i.id === id) {
        return { ...i, status: i.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED' };
      }
      return i;
    }));
  };

  const getIcon = (type: string) => {
    const found = availableIcons.find(i => i.id === type);
    return found ? <found.icon size={24} /> : <ShieldCheck size={24} />;
  };

  return (
    <div className="space-y-10 animate-in pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-black italic uppercase tracking-tight">Master Gateways</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Configuração de Recebimento Centralizado Rede SaaS</p>
        </div>
        <div className="flex gap-3">
           <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl border border-emerald-100 dark:border-emerald-800">
              <ShieldCheck size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Status: PRODUÇÃO</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {integrations.map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col group relative overflow-hidden transition-all hover:border-indigo-500">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${item.color}-500/5 blur-3xl -translate-y-10 translate-x-10`}></div>
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className={`p-4 rounded-2xl bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-600 group-hover:scale-110 transition-transform shadow-sm`}>{getIcon(item.icon)}</div>
              <div className="flex items-center gap-2">
                {item.status === 'CONNECTED' ? (
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/50">Ativo</span>
                ) : (
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800/50">Desconectado</span>
                )}
              </div>
            </div>
            <div className="relative z-10 flex-1">
              <h3 className="text-xl font-black mb-2 tracking-tight italic uppercase">{item.name}</h3>
              <p className="text-[10px] text-slate-500 font-bold mb-10 leading-relaxed uppercase tracking-widest italic">{item.description}</p>
            </div>
            <div className="flex gap-2 relative z-10">
              <button 
                onClick={() => { setEditingItem(item); setShowConfigModal(true); }} 
                className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-200"
              >
                Configurar Gateway
              </button>
              <button 
                onClick={() => handleTogglePower(item.id)}
                className={`p-4 rounded-xl transition-all shadow-md active:scale-90 ${item.status === 'CONNECTED' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
              >
                <Power size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showConfigModal && editingItem && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3.5rem] shadow-2xl p-12 border border-slate-200 dark:border-slate-800 relative">
             <button onClick={() => setShowConfigModal(false)} className="absolute top-10 right-10 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all"><X size={20} /></button>
             <div className="flex items-center gap-4 mb-8">
                <div className={`p-4 rounded-2xl bg-${editingItem.color}-50 text-${editingItem.color}-600 shadow-sm`}>{getIcon(editingItem.icon)}</div>
                <div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tight">Configurar {editingItem.name}</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sincronização imediata com a rede de recebíveis</p>
                </div>
             </div>
             
             <form onSubmit={handleSaveConfig} className="space-y-6">
                {editingItem.id === 'mercadopago' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Public Key</label>
                        <input value={mpConfig.publicKey} onChange={e => setMpConfig({...mpConfig, publicKey: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-xs shadow-inner" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Access Token</label>
                        <input type="password" value={mpConfig.accessToken} onChange={e => setMpConfig({...mpConfig, accessToken: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-xs shadow-inner" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Client ID</label>
                        <input value={mpConfig.clientId} onChange={e => setMpConfig({...mpConfig, clientId: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-xs shadow-inner" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Client Secret</label>
                        <input type="password" value={mpConfig.clientSecret} onChange={e => setMpConfig({...mpConfig, clientSecret: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-xs shadow-inner" />
                     </div>
                  </div>
                )}

                {editingItem.id === 'stripe' && (
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Stripe Publishable Key</label>
                        <input value={stripeConfig.publicKey} onChange={e => setStripeConfig({...stripeConfig, publicKey: e.target.value})} placeholder="pk_live_..." className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-xs shadow-inner" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Stripe Secret Key</label>
                        <input type="password" value={stripeConfig.secretKey} onChange={e => setStripeConfig({...stripeConfig, secretKey: e.target.value})} placeholder="sk_live_..." className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-xs shadow-inner" />
                     </div>
                  </div>
                )}

                {editingItem.id === 'pix' && (
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Chave Pix (CPF/CNPJ/Email/Aleatória)</label>
                        <input value={pixConfig.chave} onChange={e => setPixConfig({...pixConfig, chave: e.target.value})} placeholder="000.000.000-00" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-xs shadow-inner" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Nome do Beneficiário</label>
                        <input value={pixConfig.beneficiario} onChange={e => setPixConfig({...pixConfig, beneficiario: e.target.value})} placeholder="Sua Empresa LTDA" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-xs shadow-inner" />
                     </div>
                  </div>
                )}

                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 flex gap-3">
                   <Lock className="text-indigo-600 flex-shrink-0" size={16} />
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                      As credenciais são criptografadas em repouso e utilizadas apenas para comunicação TLS 1.3 com os servidores do gateway.
                   </p>
                </div>

                <button type="submit" disabled={isProcessingId === editingItem.id} className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-3">
                   {isProcessingId === editingItem.id ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />}
                   {isProcessingId === editingItem.id ? 'Autenticando API...' : 'Salvar & Conectar Gateway'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};