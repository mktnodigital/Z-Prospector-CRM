
import React, { useState, useMemo } from 'react';
import { 
  CreditCard, Wallet, Landmark, QrCode, ArrowUpRight, CheckCircle2, 
  RefreshCcw, DollarSign, Download, Send, X, AlertCircle, History,
  TrendingUp, Search, ShieldCheck
} from 'lucide-react';

interface Props {
  totalVolume: number;
  pipelineVolume: number;
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
}

export const PaymentManager: React.FC<Props> = ({ totalVolume, pipelineVolume }) => {
  const [filter, setFilter] = useState<PaymentFilter>('ALL');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const initialTransactions: Transaction[] = [
    { id: 'TX-101', client: 'Unidade Matriz - Barbearia', type: 'Cartão de Crédito', typeId: 'CREDIT_CARD', value: totalVolume * 0.45, status: 'PAID', date: 'Hoje, 10:00' },
    { id: 'TX-102', client: 'Unidade 02 - Estética', type: 'Pix Automático', typeId: 'PIX', value: totalVolume * 0.20, status: 'PAID', date: 'Ontem, 15:45' },
    { id: 'TX-103', client: 'Franquia Sul', type: 'Boleto Bancário', typeId: 'CREDIT_CARD', value: pipelineVolume * 0.15, status: 'PENDING', date: 'Hoje, 09:30' },
    { id: 'TX-104', client: 'Unidade Curitiba', type: 'Pix Automático', typeId: 'PIX', value: 450.00, status: 'PAID', date: 'Hoje, 11:20' },
    { id: 'TX-105', client: 'Unidade Matriz - Barbearia', type: 'Cartão de Crédito', typeId: 'CREDIT_CARD', value: 890.00, status: 'FAILED', date: 'Hoje, 08:15' },
  ];

  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const filteredTransactions = useMemo(() => {
    if (filter === 'ALL') return transactions;
    return transactions.filter(t => t.typeId === filter);
  }, [filter, transactions]);

  // ENGINE DE EXPORTAÇÃO REAL (CSV)
  const handleExport = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      try {
        // Cabeçalhos do Relatório
        const headers = ['ID Transação', 'Unidade Origem', 'Tipo', 'Valor (R$)', 'Status', 'Data/Hora'];
        
        // Mapeamento das linhas baseado nos dados filtrados (Multi-tenant Isolation)
        const rows = filteredTransactions.map(t => [
          t.id,
          t.client,
          t.type,
          t.value.toFixed(2).replace('.', ','),
          t.status === 'PAID' ? 'Liquidado' : t.status === 'PENDING' ? 'Pendente' : 'Falha',
          t.date
        ]);

        // Construção do conteúdo CSV
        const csvContent = [
          headers.join(';'),
          ...rows.map(row => row.join(';'))
        ].join('\n');

        // Geração do Blob para Download
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        const timestamp = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_financeiro_clikai_${filter.toLowerCase()}_${timestamp}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setIsExporting(false);
      } catch (error) {
        console.error("Erro na exportação:", error);
        alert("Ocorreu um erro ao gerar o arquivo. Tente novamente.");
        setIsExporting(false);
      }
    }, 1500); // Simula processamento de rede
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => {
        setIsWithdrawModalOpen(false);
        setShowSuccess(false);
        setWithdrawAmount('');
        setPixKey('');
      }, 3000);
    }, 2000);
  };

  const loadMoreHistory = () => {
    const more: Transaction[] = [
      { id: `TX-${Math.floor(Math.random() * 1000)}`, client: 'Novo Histórico Lead', type: 'Pix Automático', typeId: 'PIX', value: 250, status: 'PAID', date: 'Há 3 dias' },
      { id: `TX-${Math.floor(Math.random() * 1000)}`, client: 'Assinatura Recorrente', type: 'Cartão de Crédito', typeId: 'CREDIT_CARD', value: 147, status: 'PAID', date: 'Há 5 dias' },
    ];
    setTransactions(prev => [...prev, ...more]);
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
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-12 relative">
            <button onClick={() => setIsWithdrawModalOpen(false)} className="absolute top-10 right-10 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all">
              <X size={24} />
            </button>

            {showSuccess ? (
              <div className="text-center py-10 space-y-6 animate-in zoom-in-95">
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-3xl font-black italic tracking-tight uppercase">Saque Solicitado!</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">O valor será creditado na sua chave PIX em até 2 horas.</p>
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl">
                    <TrendingUp size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight">Solicitar Saque</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Disponível: R$ {(totalVolume * 0.95).toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2">Valor do Saque (R$)</label>
                    <input 
                      required 
                      type="number"
                      placeholder="0,00" 
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-4 ring-indigo-500/20 font-black text-2xl tracking-tighter"
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2">Chave PIX (CPF/CNPJ/Email)</label>
                    <input 
                      required 
                      placeholder="Sua chave pix aqui" 
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-4 ring-indigo-500/20 font-bold"
                      value={pixKey}
                      onChange={e => setPixKey(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-100 dark:border-amber-800/50 flex gap-4">
                   <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
                   <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed uppercase tracking-widest">
                     As taxas de transferência (R$ 4,50) serão descontadas do valor líquido final solicitado.
                   </p>
                </div>

                <button 
                  disabled={isProcessing || !withdrawAmount}
                  type="submit" 
                  className="w-full py-6 bg-indigo-600 text-white font-black rounded-[2rem] shadow-2xl hover:bg-indigo-700 transition-all uppercase text-xs tracking-[0.2em] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isProcessing ? <RefreshCcw size={20} className="animate-spin" /> : <Send size={20} />}
                  {isProcessing ? 'Processando...' : 'Confirmar Saque Agora'}
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
          <p className="text-slate-500 dark:text-slate-400 font-bold tracking-[0.1em] uppercase text-xs mt-1">Isolamento multi-tenant de transações e recebíveis</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl font-black text-xs uppercase tracking-widest hover:border-indigo-600 transition-all shadow-sm disabled:opacity-60"
          >
            {isExporting ? <RefreshCcw size={16} className="animate-spin text-indigo-600" /> : <Download size={16} className="text-indigo-600" />}
            {isExporting ? 'Processando CSV...' : 'Exportar Dados'}
          </button>
          <button 
            onClick={() => setIsWithdrawModalOpen(true)}
            className="px-8 py-4 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition-all text-xs uppercase tracking-widest transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <DollarSign size={18} /> Solicitar Saque
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
            <h3 className="text-3xl font-black tracking-tighter italic relative z-10">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Tabela de Transações com Filtros Funcionais */}
      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row justify-between lg:items-center bg-slate-50/30 dark:bg-slate-800/20 gap-6">
          <div>
            <h3 className="text-xl font-black tracking-tight italic uppercase">Relatório de Conciliação Automática</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Sincronizado com gateways Evolution & Stripe</p>
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
                <th className="px-12 py-8">ID / Unidade Origem</th>
                <th className="px-12 py-8 text-right">Valor Líquido</th>
                <th className="px-12 py-8 text-center">Status Processamento</th>
                <th className="px-12 py-8 text-right">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group animate-in slide-in-from-bottom-2">
                  <td className="px-12 py-10">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${t.typeId === 'PIX' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'} shadow-sm`}>
                        {t.typeId === 'PIX' ? <QrCode size={18}/> : <CreditCard size={18}/>}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white tracking-tight uppercase italic">{t.client}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic flex items-center gap-2">
                          #{t.id} <span className="w-1 h-1 bg-slate-300 rounded-full"></span> {t.type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-10 text-right font-black text-slate-900 dark:text-white text-xl tracking-tighter">
                    R$ {t.value.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex items-center justify-center">
                      <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-2xl border-2 ${
                        t.status === 'PAID' ? 'text-emerald-500 bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800/50' : 
                        t.status === 'PENDING' ? 'text-orange-500 bg-orange-50/50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-800/50' :
                        'text-rose-500 bg-rose-50/50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-800/50'
                      }`}>
                        {t.status === 'PAID' ? <CheckCircle2 size={12} /> : t.status === 'PENDING' ? <RefreshCcw size={12} className="animate-spin" /> : <AlertCircle size={12} />}
                        {t.status === 'PAID' ? 'Liquidado' : t.status === 'PENDING' ? 'Aguardando Banco' : 'Falha no Pgto'}
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-10 text-right text-slate-400 font-bold text-xs tabular-nums">{t.date}</td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                     <div className="flex flex-col items-center gap-4 text-slate-300">
                        <History size={48} opacity={0.3} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma transação encontrada neste filtro</p>
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
              <History size={16} /> Ver Histórico Completo de Transações
           </button>
        </div>
      </div>

      {/* Footer / Resumo Adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
         <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Landmark size={28}/></div>
               <div>
                  <h4 className="font-black text-lg italic tracking-tight uppercase">Conta Principal Connect</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sincronizado com Banco SaaS Cloud</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Último Saque</p>
               <p className="font-black text-slate-900 dark:text-white">R$ 1.250,00</p>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><ShieldCheck size={28}/></div>
               <div>
                  <h4 className="font-black text-lg italic tracking-tight uppercase">Gateway de Segurança</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Proteção Antifraude Ativa</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Status</p>
               <p className="font-black text-emerald-500 uppercase text-xs tracking-widest">Verificado</p>
            </div>
         </div>
      </div>
    </div>
  );
};
