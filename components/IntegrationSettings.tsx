
import React, { useState } from 'react';
import { 
  Zap, Key, Webhook, Smartphone, CreditCard, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, Power, Trash2, Edit3, Plus, Loader2, Download, X, QrCode, Globe,
  Shield, Landmark, Wallet, Layers, Cpu, Code2, Bitcoin, Lock, ShoppingCart, DollarSign, RefreshCcw, Flame, Infinity, Fingerprint
} from 'lucide-react';
import { Integration } from '../types';

interface GatewayConfig {
  id: string;
  provider: 'mercadopago' | 'stripe' | 'pix' | 'kiwify' | 'eduzz' | 'hotmart' | 'pagarme' | 'infinitepay';
  name: string;
  status: 'CONNECTED' | 'DISCONNECTED';
  keys: Record<string, string>;
  lastSync?: string;
}

const PROVIDER_METADATA = {
  mercadopago: { label: 'Mercado Pago', icon: Globe, color: 'blue', keys: ['Public Key', 'Access Token'] },
  stripe: { label: 'Stripe', icon: CreditCard, color: 'indigo', keys: ['Publishable Key', 'Secret Key'] },
  pix: { label: 'Pix Direto', icon: QrCode, color: 'emerald', keys: ['Chave Pix', 'Beneficiário'] },
  kiwify: { label: 'Kiwify', icon: ShoppingCart, color: 'emerald', keys: ['API Key', 'Webhook Secret'] },
  eduzz: { label: 'Eduzz', icon: Zap, color: 'orange', keys: ['API Key', 'Public Key'] },
  hotmart: { label: 'Hotmart', icon: Flame, color: 'rose', keys: ['Client ID', 'Client Secret', 'Basic Token'] },
  pagarme: { label: 'Pagar.me', icon: Fingerprint, color: 'stone', keys: ['API Key', 'Encryption Key'] },
  infinitepay: { label: 'InfinitePay', icon: Infinity, color: 'cyan', keys: ['Client ID', 'Client Secret', 'Wallet ID'] },
};

export const IntegrationSettings: React.FC = () => {
  const [gateways, setGateways] = useState<GatewayConfig[]>([
    { 
      id: 'gw_1', 
      provider: 'stripe', 
      name: 'Stripe Global', 
      status: 'CONNECTED', 
      keys: { 'Publishable Key': 'pk_live_...', 'Secret Key': 'sk_live_...' },
      lastSync: 'Há 2 min'
    },
    { 
      id: 'gw_2', 
      provider: 'kiwify', 
      name: 'Kiwify Lançamentos', 
      status: 'CONNECTED', 
      keys: { 'API Key': '****************', 'Webhook Secret': 'whsec_...' },
      lastSync: 'Há 30 seg'
    },
    { 
      id: 'gw_3', 
      provider: 'eduzz', 
      name: 'Eduzz Nutror', 
      status: 'CONNECTED', 
      keys: { 'API Key': '****************', 'Public Key': 'PUB-...' },
      lastSync: 'Há 15 min'
    },
    { 
      id: 'gw_4', 
      provider: 'hotmart', 
      name: 'Hotmart Fire', 
      status: 'CONNECTED', 
      keys: { 'Client ID': '********', 'Client Secret': '********', 'Basic Token': '******' },
      lastSync: 'Há 1 hora'
    },
    { 
      id: 'gw_5', 
      provider: 'pagarme', 
      name: 'Pagar.me Gateway', 
      status: 'CONNECTED', 
      keys: { 'API Key': 'ak_live_...', 'Encryption Key': 'ek_live_...' },
      lastSync: 'Há 45 min'
    },
    { 
      id: 'gw_6', 
      provider: 'infinitepay', 
      name: 'InfinitePay Maquininha', 
      status: 'CONNECTED', 
      keys: { 'Client ID': 'client_...', 'Client Secret': 'secret_...', 'Wallet ID': 'wid_...' },
      lastSync: 'Agora'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<GatewayConfig | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<GatewayConfig['provider']>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formKeys, setFormKeys] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setEditingGateway(null);
    setSelectedProvider('stripe');
    setFormName('');
    setFormKeys({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (gw: GatewayConfig) => {
    setEditingGateway(gw);
    setSelectedProvider(gw.provider);
    setFormName(gw.name);
    setFormKeys(gw.keys);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    setTimeout(() => {
      if (editingGateway) {
        setGateways(prev => prev.map(g => g.id === editingGateway.id ? { ...g, name: formName, keys: formKeys, provider: selectedProvider } : g));
      } else {
        const newGw: GatewayConfig = {
          id: `gw_${Date.now()}`,
          provider: selectedProvider,
          name: formName || PROVIDER_METADATA[selectedProvider].label,
          status: 'CONNECTED',
          keys: formKeys,
          lastSync: 'Agora'
        };
        setGateways([...gateways, newGw]);
      }
      setIsProcessing(false);
      setIsModalOpen(false);
    }, 1000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remover este gateway da infraestrutura de pagamentos?')) {
      setGateways(prev => prev.filter(g => g.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setGateways(prev => prev.map(g => g.id === id ? { ...g, status: g.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED' } : g));
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 border-blue-100 dark:border-blue-800';
      case 'indigo': return 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 border-indigo-100 dark:border-indigo-800';
      case 'emerald': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border-emerald-100 dark:border-emerald-800';
      case 'orange': return 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 border-orange-100 dark:border-orange-800';
      case 'rose': return 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 border-rose-100 dark:border-rose-800';
      case 'stone': return 'bg-stone-50 dark:bg-stone-900/30 text-stone-600 border-stone-100 dark:border-stone-800';
      case 'cyan': return 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 border-cyan-100 dark:border-cyan-800';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-100 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in pb-32">
      
      {/* HEADER GESTÃO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
             <Landmark className="text-indigo-600" /> Gateways de <span className="text-indigo-600">Pagamento</span>
          </h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Configuração individual por Unidade / Empresa</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={18} /> Adicionar Gateway
        </button>
      </div>

      {/* GRID DE GATEWAYS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {gateways.map((gw) => {
          const meta = PROVIDER_METADATA[gw.provider];
          const ProviderIcon = meta.icon;
          return (
            <div key={gw.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col group relative overflow-hidden transition-all hover:border-indigo-500 hover:shadow-2xl">
              <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl -translate-y-10 translate-x-10 ${meta.color === 'blue' ? 'bg-blue-500' : meta.color === 'indigo' ? 'bg-indigo-500' : meta.color === 'rose' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
              
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className={`p-5 rounded-2xl shadow-sm group-hover:rotate-12 transition-transform ${getColorClass(meta.color)}`}>
                  <ProviderIcon size={24} />
                </div>
                <div className="flex items-center gap-2">
                  {gw.status === 'CONNECTED' ? (
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-1.5">
                       <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div> Ativo
                    </span>
                  ) : (
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-800/50">Desconectado</span>
                  )}
                </div>
              </div>

              <div className="relative z-10 flex-1">
                <h3 className="text-xl font-black mb-2 tracking-tight italic uppercase">{gw.name}</h3>
                <div className="flex items-center gap-2 mb-10">
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{meta.label}</p>
                   <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">{gw.lastSync}</p>
                </div>
              </div>

              <div className="flex gap-2 relative z-10">
                <button 
                  onClick={() => handleOpenEdit(gw)} 
                  className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-200"
                >
                  Configurar API
                </button>
                <button 
                  onClick={() => handleToggleStatus(gw.id)}
                  className={`p-4 rounded-xl transition-all shadow-md active:scale-90 ${gw.status === 'CONNECTED' ? 'bg-indigo-600 text-white shadow-indigo-100/50' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
                >
                  <Power size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(gw.id)}
                  className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}

        {gateways.length === 0 && (
          <div className="col-span-full py-40 flex flex-col items-center justify-center text-slate-300 opacity-30 grayscale select-none">
             <div className="p-12 rounded-full border-4 border-dashed border-slate-100 dark:border-slate-800 mb-8">
                <DollarSign size={80} className="animate-pulse" />
             </div>
             <p className="text-xl font-black uppercase tracking-[0.4em] italic">Zero Gateways Ativos</p>
             <button onClick={handleOpenAdd} className="mt-6 text-indigo-600 font-black uppercase text-[10px] tracking-widest underline">Configurar Primeiro Meio de Pagamento</button>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIGURAÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[310] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3.5rem] shadow-2xl p-12 border border-slate-200 dark:border-slate-800 relative">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all"><X size={24} /></button>
             
             <div className="flex items-center gap-5 mb-10">
                <div className={`p-5 rounded-2xl shadow-sm ${getColorClass(PROVIDER_METADATA[selectedProvider].color)}`}>
                   {React.createElement(PROVIDER_METADATA[selectedProvider].icon, { size: 28 })}
                </div>
                <div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tight">Setup: {editingGateway ? 'Editar Gateway' : 'Novo Gateway'}</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Credenciais seguras via Vault Multi-tenant</p>
                </div>
             </div>

             <form onSubmit={handleSave} className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase text-slate-400 px-4 tracking-widest">Plataforma / Provedor</label>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(Object.keys(PROVIDER_METADATA) as Array<keyof typeof PROVIDER_METADATA>).map(key => (
                        <button 
                          key={key} 
                          type="button" 
                          onClick={() => { setSelectedProvider(key); setFormKeys({}); }}
                          className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedProvider === key ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 shadow-sm' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                        >
                           {React.createElement(PROVIDER_METADATA[key].icon, { size: 20 })}
                           <span className="text-[8px] font-black uppercase tracking-tight truncate w-full text-center">{PROVIDER_METADATA[key].label}</span>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase text-slate-400 px-4 tracking-widest">Nome da Instância</label>
                   <input 
                     required
                     value={formName} 
                     onChange={e => setFormName(e.target.value)} 
                     placeholder={`Ex: Minha Conta ${PROVIDER_METADATA[selectedProvider].label}`}
                     className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-xs shadow-inner italic uppercase" 
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {PROVIDER_METADATA[selectedProvider].keys.map(keyName => (
                     <div key={keyName} className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-4 tracking-widest">{keyName}</label>
                        <input 
                          required
                          type={keyName.toLowerCase().includes('secret') || keyName.toLowerCase().includes('token') ? 'password' : 'text'}
                          value={formKeys[keyName] || ''} 
                          onChange={e => setFormKeys({...formKeys, [keyName]: e.target.value})} 
                          className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-xs shadow-inner" 
                        />
                     </div>
                   ))}
                </div>

                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 flex gap-4">
                   <Lock className="text-indigo-600 flex-shrink-0" size={20} />
                   <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                      Sua conta "{formName || 'Gateway'}" terá suas chaves criptografadas em nível de aplicação. Somente transações autorizadas poderão consumir estas APIs.
                   </p>
                </div>

                <button type="submit" disabled={isProcessing} className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3">
                   {isProcessing ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />}
                   {isProcessing ? 'Autenticando API...' : editingGateway ? 'Atualizar Gateway Master' : 'Salvar & Ativar Meio de Pgto'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
