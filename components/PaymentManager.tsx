
import React, { useState, useMemo } from 'react';
import { 
  CreditCard, Wallet, Landmark, QrCode, ArrowUpRight, CheckCircle2, 
  RefreshCcw, DollarSign, Download, Send, X, AlertCircle, History,
  TrendingUp, Search, ShieldCheck, Banknote, ArrowDownCircle, Check,
  Zap, ShoppingCart, Globe, Flame, Infinity, Fingerprint
} from 'lucide-react';

interface Props {
  totalVolume: number;
  pipelineVolume: number;
  onSimulateIncomingTransaction?: (amount: number, method: 'PIX' | 'CREDIT_CARD') => void;
  notify?: (msg: string) => void;
}

type PaymentFilter = 'ALL' | 'PIX' | 'CREDIT_CARD';
type TransactionStatus = 'PAID' | 'PENDING' | 'FAILED';

interface Transaction {
  id: string;
  client: string;
  type: string;
  typeId: PaymentFilter;
  value: number;
  status: TransactionStatus;
  date: string;
  isWithdraw?: boolean;
  platformIcon?: any;
}

export const PaymentManager: React.FC<Props> = ({ totalVolume, pipelineVolume, onSimulateIncomingTransaction, notify }) => {
  const [filter, setFilter] = useState<PaymentFilter>('ALL');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSimulatingSale, setIsSimulatingSale] = useState(false);
  const [currentProtocol, setCurrentProtocol] = useState('');

  const initialTransactions: Transaction[] = [
    { id: 'TX-101', client: 'Roberto Silva (Checkout Kiwify)', type: 'Kiwify - PIX', typeId: 'PIX', value: 180.00, status: 'PAID', date: 'Hoje, 10:00', platformIcon: ShoppingCart },
    { id: 'TX-102', client: 'Julia Martins (Eduzz)', type: 'Eduzz - Cartão', typeId: 'CREDIT_CARD', value: 350.00, status: 'PAID', date: 'Ontem, 15:45', platformIcon: Zap },
    { id: 'TX-103', client: 'Tech Solutions (Stripe)', type: 'Stripe - Assinatura', typeId: 'CREDIT_CARD', value: 1200.00, status: 'PENDING', date: 'Hoje, 09:30', platformIcon: CreditCard },
    { id: 'TX-104', client: 'Lançamento Meteórico (Hotmart)', type: 'Hotmart - PIX', typeId: 'PIX', value: 450.00, status: 'PAID', date: 'Hoje, 11:20', platformIcon: Flame },
    { id: 'TX-105', client: 'Unidade Matriz (Pagar.me)', type: 'Pagar.me - Recorrência', typeId: 'CREDIT_CARD', value: 890.00, status: 'FAILED', date: 'Hoje, 08:15', platformIcon: Fingerprint },
    { id: 'TX-106', client: 'Solicitação de Saque', type: 'Transferência PIX', typeId: 'PIX', value: 5000.00, status: 'PAID', date: 'Há 2 dias', isWithdraw: true, platformIcon: ArrowDownCircle },
    { id: 'TX-107', client: 'Dr. Fernando (InfinitePay)', type: 'InfinitePay - Link', typeId: 'PIX', value: 2500.00, status: 'PAID', date: 'Há 3 dias', platformIcon: Infinity },
    { id: 'TX-108', client: 'Construtora Alpha (Stripe)', type: 'Stripe - Boleto', typeId: 'CREDIT_CARD', value: 15000.00, status: 'PAID', date: 'Há 4 dias', platformIcon: Globe },
    { id: 'TX-109', client: 'Venda Balcão (Pagar.me)', type: 'Pagar.me - Débito', typeId: 'PIX', value: 80.00, status: 'PAID', date: 'Há 5 dias', platformIcon: Fingerprint },
  ];

  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const filteredTransactions = useMemo(() => {
    if (filter === 'ALL') return transactions;
    return transactions.filter(t => t.typeId === filter);
  }, [filter, transactions]);

  // SIMULAÇÃO DE VENDA AUTOMÁTICA (WEBHOOK)
  const handleSimulateSale = () => {
    setIsSimulatingSale(true);
    setTimeout(() => {
      const amount = Math.floor(Math.random() * 500) + 50;
      const providers = [
          { name: 'Kiwify', icon: ShoppingCart },
          { name: 'Eduzz', icon: Zap },
          { name: 'Hotmart', icon: Flame },
          { name: 'InfinitePay', icon: Infinity }
      ];
      const randomProvider = providers[Math.floor(Math.random() * providers.length)];

      const newTx: Transaction = {
        id: `TX-AUTO-${Date.now().toString().substr(-4)}`,
        client: 'Cliente Webhook (Auto)',
        type: `${randomProvider.name} - Automático`,
        typeId: 'PIX',
        value: amount,
        status: 'PAID',
        date: 'Agora (Ao Vivo)',
        platformIcon: randomProvider.icon
      };
      setTransactions([newTx, ...transactions]);
      
      // Aciona o callback global para atualizar Dashboard e Agenda
      if (onSimulateIncomingTransaction) {
        onSimulateIncomingTransaction(amount, 'PIX');
      }
      if (notify) notify(`Venda simulada recebida via ${randomProvider.name}!`);
      
      setIsSimulatingSale(false);
    }, 1200);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      // Geração real do CSV
      const headers = "ID;Cliente;Tipo;Valor;Status;Data\n";
      const rows = transactions.map(t => 
        `${t.id};${t.client};${t.type};${t.value.toFixed(2)};${t.status};${t.date}`
      ).join("\n");

      const blob = new Blob(["\uFEFF" + headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_financeiro_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      if (notify) notify('Relatório CSV exportado com sucesso.');
    }, 1500);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || !pixKey) return;

    setIsProcessing(true);
    setTimeout(() => {
      const generatedProtocol = Math.random().toString(36).substr(2, 9).toUpperCase();
      setCurrentProtocol(generatedProtocol);
      
      const newWithdrawal: Transaction = {
        id: `WD-${Math.floor(Math.random() * 9000) + 1000}`,
        client: 'Solicitação de Saque',
        type: 'Transferência PIX',
        typeId: 'PIX',
        value: parseFloat(withdrawAmount),
        status: 'PENDING',
        date: 'Agora',
        isWithdraw: true,
        platformIcon: ArrowDownCircle
      };
      
      setTransactions(prev => [newWithdrawal, ...prev]);
      setIsProcessing(false);
      setShowSuccess(true);
      if (notify) notify('Solicitação enviada para o administrador master.');
      
      setTimeout(() => {
        setIsWithdrawModalOpen(false);
        setShowSuccess(false);
        setWithdrawAmount('');
        setPixKey('');
      }, 4000);
    }, 2000);
  };

  const handleReleasePayment = (id: string) => {
    if (!confirm('Deseja autorizar a liberação deste pagamento agora?')) return;
    
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, status: 'PAID', date: 'Liberado Agora' } : t
    ));
    if (notify) notify('Pagamento liberado e conciliado no sistema!');
  };

  const loadMoreHistory = () => {
    const more: Transaction[] = [
      { id: `TX-${Math.floor(Math.random() * 1000)}`, client: 'Lead Antigo (Eduzz)', type: 'Eduzz - PIX', typeId: 'PIX', value: 250, status: 'PAID', date: 'Há 3 dias', platformIcon: Zap },
      { id: `TX-${Math.floor(Math.random() * 1000)}`, client: 'Assinatura Recorrente (Stripe)', type: 'Stripe - CC', typeId: 'CREDIT_CARD', value: 147, status: 'PAID', date: 'Há 5 dias', platformIcon: CreditCard },
    ];
    setTransactions(prev => [...prev, ...more]);
    if (notify) notify('Histórico antigo carregado.');
  };

  const stats = [
    { label: 'Volume Ganhos (Fechado)', value: `R$ ${totalVolume.toLocaleString('pt-BR')}`, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Projeção de Pipeline', value: `R$ ${pipelineVolume.toLocaleString('pt-BR')}`, icon: ArrowUpRight, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Taxas Gateway (SaaS)', value: `R$ ${(totalVolume * 0.045).toLocaleString('pt-BR')}`, icon: DollarSign, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ];

  return (
    <div className="p-8 space-y-10 animate-in fade-in relative">
      
      {/* Modal de Saque */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-955/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-12 relative">
            <button onClick={() => setIsWithdrawModalOpen(false)} className="absolute top-10 right-10 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all">
              <X size={24} />
            </button>

            {showSuccess ? (
              <div className="text-center py-10 space-y-6 animate-in zoom-in-95">
                <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <ShieldCheck size={48} />
                </div>
                <h3 className="text-3xl font-black italic tracking-tight uppercase">Saque Pendente!</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed">Sua solicitação foi enviada para a fila de <br/> <span className="text-indigo-600 font-black">Auditoria do Administrador Master</span>.</p>
                <div className="pt-4">
                   <span className="text-[9px] font-black uppercase text-slate-300 bg-slate-100 dark:bg-slate-800 px-6 py-2 rounded-full">Protocolo: {currentProtocol}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl">
                    <TrendingUp size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100">Solicitar Saque</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Disponível: R$ {(totalVolume * 0.95).toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Valor do Saque (R$)</label>
                    <input 
                      required 
                      type="number"
                      placeholder="0,00" 
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-4 ring-indigo-500/20 font-black text-2xl tracking-tighter dark:text-white"
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">Chave PIX (CPF/CNPJ/Email)</label>
                    <input 
                      required 
                      placeholder="Sua chave pix aqui" 
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-4 ring-indigo-500/20 font-bold dark:text-white"
                      value={pixKey}
                      onChange={e => setPixKey(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-100 dark:border-amber-800/50 flex gap-4">
                   <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
                   <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed uppercase tracking-widest">
                     O saque será liberado após conferência manual do Administrador Master para garantir a segurança da operação.
                   </p>
                </div>

                <button 
                  disabled={isProcessing || !withdrawAmount}
                  type="submit" 
                  className="w-full py-6 bg-indigo-600 text-white font-black rounded-[2rem] shadow-2xl hover:bg-indigo-700 transition-all uppercase text-xs tracking-[0.2em] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isProcessing ? <RefreshCcw size={20} className="animate-spin" /> : <Banknote size={20} />}
                  {isProcessing ? 'Enviando Protocolo...' : 'Solicitar Aprovação Master'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Header Financeiro */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-4">
            <Landmark className="text-indigo-600" /> Fluxo Financeiro SaaS
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold tracking-[0.1em] uppercase text-xs mt-1">Gestão de Auditoria Master & Conciliação</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSimulateSale}
            disabled={isSimulatingSale}
            className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl disabled:opacity-70 animate-pulse"
          >
             <Zap size={16} /> {isSimulatingSale ? 'Processando Webhook...' : 'Simular Venda Automática'}
          </button>
          
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl font-black text-xs uppercase tracking-widest hover:border-indigo-600 transition-all shadow-sm disabled:opacity-60"
          >
            {isExporting ? <RefreshCcw size={16} className="animate-spin text-indigo-600" /> : <Download size={16} className="text-indigo-600" />}
            {isExporting ? 'Gerando CSV...' : 'Exportar CSV'}
          </button>
          <button 
            onClick={() => setIsWithdrawModalOpen(true)}
            className="px-8 py-4 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all text-xs uppercase tracking-widest transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <Banknote size={18} /> Solicitar Saque
          </button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
            <div className={`absolute -top-10 -right-10 w-32 h-32 ${stat.bg} blur-3xl opacity-50`}></div>
            <div className={`p-5 rounded-2xl w-fit mb-8 ${stat.bg} ${stat.color} group-hover:rotate-12 transition-transform shadow-sm relative z-10`}>
              <stat.icon size={28} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 relative z-10">{stat.label}</p>
            <h3 className="text-3xl font-black tracking-tighter italic relative z-10 dark:text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Tabela de Transações com Auditoria Master */}
      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row justify-between lg:items-center bg-slate-50/30 dark:bg-slate-800/20 gap-6">
          <div>
            <h3 className="text-xl font-black tracking-tight italic uppercase text-slate-800 dark:text-slate-100">Auditoria Financeira Master</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Conferência de saques e liquidação manual de transações</p>
          </div>
          <div className="flex gap-3">
             <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner">
                <button 
                  onClick={() => setFilter('ALL')}
                  className={`px-6 py-2.5 text-[10px] font-black rounded-xl transition-all tracking-widest ${filter === 'ALL' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  TODOS
                </button>
                <button 
                  onClick={() => setFilter('PIX')}
                  className={`px-6 py-2.5 text-[10px] font-black rounded-xl transition-all tracking-widest flex items-center gap-2 ${filter === 'PIX' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <QrCode size={12} /> PIX
                </button>
                <button 
                  onClick={() => setFilter('CREDIT_CARD')}
                  className={`px-6 py-2.5 text-[10px] font-black rounded-xl transition-all tracking-widest flex items-center gap-2 ${filter === 'CREDIT_CARD' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <CreditCard size={12} /> CARTÃO
                </button>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-slate-100 dark:border-slate-800">
                <th className="px-12 py-8">ID / Fluxo de Caixa</th>
                <th className="px-12 py-8 text-right">Valor Operação</th>
                <th className="px-12 py-8 text-center">Status de Auditoria</th>
                <th className="px-12 py-8 text-right">Ações Master</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map(t => (
                <tr key={t.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group animate-in slide-in-from-bottom-2 ${t.isWithdraw ? 'bg-indigo-50/20 dark:bg-indigo-900/5' : ''}`}>
                  <td className="px-12 py-10">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${t.isWithdraw ? 'bg-rose-50 text-rose-600' : t.typeId === 'PIX' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'} shadow-sm`}>
                        {t.isWithdraw ? <ArrowDownCircle size={18}/> : t.platformIcon ? React.createElement(t.platformIcon, { size: 18 }) : t.typeId === 'PIX' ? <QrCode size={18}/> : <CreditCard size={18}/>}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white tracking-tight uppercase italic">{t.client}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic flex items-center gap-2">
                          #{t.id} <span className="w-1 h-1 bg-slate-300 rounded-full"></span> {t.type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-12 py-10 text-right font-black text-xl tracking-tighter ${t.isWithdraw ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                    {t.isWithdraw ? '-' : '+'} R$ {t.value.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex items-center justify-center">
                      <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-2xl border-2 ${
                        t.status === 'PAID' ? 'text-emerald-500 bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800/50' : 
                        t.status === 'PENDING' ? 'text-orange-500 bg-orange-50/50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-800/50' :
                        'text-rose-500 bg-rose-50/50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-800/50'
                      }`}>
                        {t.status === 'PAID' ? <CheckCircle2 size={12} /> : t.status === 'PENDING' ? <RefreshCcw size={12} className="animate-spin" /> : <AlertCircle size={12} />}
                        {t.status === 'PAID' ? 'Liquidado' : t.status === 'PENDING' ? 'Aguardando Master' : 'Falha no Pgto'}
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-10 text-right">
                    {t.status === 'PENDING' ? (
                       <button 
                         onClick={() => handleReleasePayment(t.id)}
                         className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2 ml-auto"
                       >
                         <Check size={14} /> Liberar Pagamento
                       </button>
                    ) : (
                       <span className="text-slate-400 font-bold text-xs tabular-nums italic">{t.date}</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                     <div className="flex flex-col items-center gap-4 text-slate-300">
                        <History size={48} opacity={0.3} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma transação financeira detectada</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-10 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-center">
           <button 
             onClick={loadMoreHistory}
             className="flex items-center gap-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-8 py-4 rounded-2xl transition-all border border-transparent hover:border-indigo-100"
           >
              <History size={16} /> Ver Histórico Completo da Operação
           </button>
        </div>
      </div>

      {/* Resumo Rodapé */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
         <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Landmark size={28}/></div>
               <div>
                  <h4 className="font-black text-lg italic tracking-tight uppercase dark:text-white">Custódia do Cluster</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Monitoramento HostGator Finance</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Última Auditoria</p>
               <p className="font-black text-emerald-500 uppercase text-[10px]">Realizada Hoje</p>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center"><ShieldCheck size={28}/></div>
               <div>
                  <h4 className="font-black text-lg italic tracking-tight uppercase dark:text-white">Antifraude Ativo</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Protocolo TLS 1.3 Seguro</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Score Segurança</p>
               <p className="font-black text-indigo-600 uppercase text-xs">A+ Excelência</p>
            </div>
         </div>
      </div>
    </div>
  );
};
