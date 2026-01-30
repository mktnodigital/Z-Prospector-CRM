
import React, { useState, useMemo, useRef } from 'react';
import { 
  Package, Plus, Tag, DollarSign, 
  Sparkles, Link as LinkIcon, 
  Eye, Trash2, X, BarChart3, 
  CheckCircle2, Copy, Star, Zap, 
  Info, TrendingUp, Filter, Search,
  RefreshCcw, AlertTriangle, Camera, 
  Edit3, BarChart, PieChart, Activity,
  ArrowUpRight, Share2, Globe
} from 'lucide-react';
import { 
  BarChart as ReBarChart, Bar, XAxis, YAxis, 
  Tooltip as ReTooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area
} from 'recharts';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  conversion: string;
  views: number;
  sales: number;
  icon: any;
  color: string;
  image?: string | null;
}

const PERFORMANCE_DATA = [
  { name: 'Seg', views: 400, sales: 24 },
  { name: 'Ter', views: 300, sales: 18 },
  { name: 'Qua', views: 600, sales: 45 },
  { name: 'Qui', views: 800, sales: 52 },
  { name: 'Sex', views: 500, sales: 30 },
  { name: 'Sáb', views: 900, sales: 88 },
  { name: 'Dom', views: 700, sales: 42 },
];

const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 'prod_1', 
    name: 'Combo Premium Barbearia', 
    price: 180.00, 
    category: 'Serviço', 
    description: 'Corte master + Barba terapia com óleos essenciais e toalha quente.',
    conversion: '24%', 
    views: 1240,
    sales: 297,
    icon: Star, 
    color: 'text-indigo-500',
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800"
  },
  { 
    id: 'prod_2', 
    name: 'Mentoria Business IA', 
    price: 2500.00, 
    category: 'Consultoria', 
    description: 'Aceleração de negócios digitais utilizando workflows n8n e IA.',
    conversion: '8%', 
    views: 3500,
    sales: 280,
    icon: Zap, 
    color: 'text-orange-500',
    image: "https://images.unsplash.com/photo-1675557009875-436f595b1897?auto=format&fit=crop&q=80&w=800"
  }
];

export const ProductManager: React.FC<{ notify: (msg: string) => void }> = ({ notify }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modais
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Product>>({
    name: '', price: 0, category: 'Serviço', description: '', image: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesFilter = activeFilter === 'Todos' || p.category === activeFilter;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [products, activeFilter, searchQuery]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ name: '', price: 0, category: 'Serviço', description: '', image: null });
    setIsProductModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingId(p.id);
    setForm(p);
    setIsProductModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...form } as Product : p));
      notify('Oferta atualizada no catálogo master!');
    } else {
      const newProduct: Product = {
        ...form as Product,
        id: `prod_${Date.now()}`,
        conversion: '0%',
        views: 0,
        sales: 0,
        icon: Package,
        color: 'text-indigo-600'
      };
      setProducts([newProduct, ...products]);
      notify('Nova oferta injetada com sucesso!');
    }
    setIsProductModalOpen(false);
  };

  const handleDelete = () => {
    if (!confirmDeleteId) return;
    setProducts(prev => prev.filter(p => p.id !== confirmDeleteId));
    setConfirmDeleteId(null);
    notify('Oferta removida da rede.');
  };

  const copySmartLink = (p: Product) => {
    // Domínio atualizado para zprospector.com.br conforme DNS
    const link = `https://zprospector.com.br/pay/${p.id}?ref=master_ia`;
    navigator.clipboard.writeText(link);
    notify(`Smart Link Copiado: ${p.name}`);
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in pb-40">
      
      {/* MODAL PERFORMANCE (BI) */}
      {isPerformanceModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-955/90 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[4rem] shadow-2xl p-12 border border-white/10 relative overflow-hidden">
              <button onClick={() => setIsPerformanceModalOpen(false)} className="absolute top-10 right-10 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all z-20"><X size={24} /></button>
              
              <div className="flex items-center gap-6 mb-12">
                 <div className="p-5 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-500/20"><BarChart3 size={32} /></div>
                 <div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tight">Performance do Catálogo</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Monitoramento de ROI e Engajamento de Ofertas</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/40 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-black italic uppercase mb-10 flex items-center gap-2"><TrendingUp size={18} className="text-emerald-500"/> Volume de Acessos vs Vendas</h4>
                    <div className="h-[300px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={PERFORMANCE_DATA}>
                             <defs>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} dy={10} />
                             <ReTooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px rgba(0,0,0,0.1)'}} />
                             <Area type="monotone" dataKey="views" stroke="#4f46e5" fillOpacity={1} fill="url(#colorViews)" strokeWidth={4} />
                             <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={4} fill="none" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="space-y-6">
                    {[
                      { label: 'Conversão Média', value: '18.4%', icon: Activity, color: 'text-emerald-500' },
                      { label: 'Views Totais (Rede)', value: '14.5k', icon: Globe, color: 'text-indigo-500' },
                      { label: 'Oferta Top 1', value: 'Combo Barbearia', icon: Star, color: 'text-yellow-500' }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-500 transition-all">
                         <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 ${stat.color} group-hover:rotate-12 transition-transform`}><stat.icon size={20}/></div>
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                               <h5 className="text-xl font-black">{stat.value}</h5>
                            </div>
                         </div>
                         <ArrowUpRight size={18} className="text-slate-200 group-hover:text-indigo-600 transition-all" />
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL EDITAR/CRIAR PRODUTO */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-955/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3.5rem] shadow-2xl p-12 border border-white/10 relative">
             <button onClick={() => setIsProductModalOpen(false)} className="absolute top-10 right-10 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all z-20"><X size={24} /></button>
             
             <div className="flex items-center gap-5 mb-10">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Edit3 size={28}/></div>
                <div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tight">{editingId ? 'Editar Oferta' : 'Nova Oferta Master'}</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sincronização com IA de Atendimento</p>
                </div>
             </div>

             <form onSubmit={handleSaveProduct} className="space-y-8">
                <div className="flex gap-10">
                   <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="w-44 h-44 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all relative overflow-hidden group"
                   >
                      {form.image ? (
                        <img src={form.image} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera size={32} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          <span className="text-[9px] font-black uppercase text-slate-400 mt-2">Capa do Item</span>
                        </>
                      )}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                         <RefreshCcw size={24} className="text-white" />
                      </div>
                   </div>

                   <div className="flex-1 space-y-6">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Título do Item</label>
                        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 uppercase italic" placeholder="Ex: Combo Master" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Preço (R$)</label>
                          <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Nicho</label>
                          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10">
                             <option value="Serviço">Serviço</option>
                             <option value="Produto">Produto</option>
                             <option value="SaaS">SaaS</option>
                             <option value="Consultoria">Consultoria</option>
                          </select>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Prompt/Descrição para IA</label>
                   <textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 resize-none italic" placeholder="Descreva os benefícios para que o bot saiba vender este item..." />
                </div>

                <button type="submit" className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] uppercase text-xs tracking-widest hover:bg-indigo-700 hover:scale-[1.02] transition-all">Sincronizar com o Catálogo Master</button>
             </form>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>
      )}

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[350] flex items-center justify-center p-6 bg-slate-955/90 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] shadow-2xl p-10 text-center border border-rose-100 dark:border-rose-900/30">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40}/></div>
              <h4 className="text-2xl font-black uppercase italic tracking-tight mb-4">Destruir Oferta?</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mb-10">Esta ação é irreversível e o Smart Link deixará de responder imediatamente.</p>
              <div className="flex gap-3">
                 <button onClick={handleDelete} className="flex-1 py-5 bg-rose-500 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl">Confirmar</button>
                 <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-400 font-black rounded-2xl uppercase text-[10px] tracking-widest">Cancelar</button>
              </div>
           </div>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
           <h1 className="text-4xl font-black italic uppercase tracking-tight flex items-center gap-4">
              <Package className="text-purple-600" /> Catálogo <span className="text-indigo-600">Master</span>
           </h1>
           <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Gestão Centralizada de Ofertas e Performance</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Pesquisar catálogo..." className="pl-16 pr-8 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 transition-all shadow-sm" />
           </div>
           
           <button onClick={() => setIsPerformanceModalOpen(true)} className="flex items-center gap-3 px-10 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:border-indigo-600 transition-all shadow-sm">
              <BarChart size={18} className="text-indigo-600" /> Analisar ROI
           </button>
           
           <button onClick={handleOpenAdd} className="flex items-center gap-4 px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">
              <Plus size={20} /> Injetar Oferta
           </button>
        </div>
      </div>

      {/* GRID DE PRODUTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white dark:bg-slate-900 rounded-[3.5rem] border-2 border-slate-50 dark:border-slate-800 p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col">
             
             {/* Product Cover/Image */}
             <div className="h-56 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] mb-8 overflow-hidden relative border-4 border-white dark:border-slate-900 shadow-inner group/cover">
                {p.image ? (
                  <img src={p.image} className="w-full h-full object-cover group-hover/cover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-200"><Package size={80}/></div>
                )}
                <div className="absolute top-5 right-5 flex gap-2">
                   <button onClick={() => handleOpenEdit(p)} className="p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl text-slate-400 hover:text-indigo-600 shadow-xl transition-all"><Edit3 size={16}/></button>
                   <button onClick={() => setConfirmDeleteId(p.id)} className="p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl text-slate-400 hover:text-rose-500 shadow-xl transition-all"><Trash2 size={16}/></button>
                </div>
                <div className="absolute bottom-5 left-5 px-5 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-full shadow-lg border-2 border-white/20">Conv. {p.conversion}</div>
             </div>

             <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">{p.category}</span>
                   <div className="flex items-center gap-1.5 text-slate-300">
                      <Eye size={12}/> <span className="text-[10px] font-black">{p.views}</span>
                   </div>
                </div>
                <h4 className="text-2xl font-black italic uppercase tracking-tight">{p.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest line-clamp-2 italic">"{p.description}"</p>
             </div>

             <div className="flex items-baseline gap-2 mb-10">
                <span className="text-xs font-black text-slate-400">R$</span>
                <span className="text-5xl font-black tracking-tighter italic tabular-nums">{p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
             </div>

             <div className="mt-auto grid grid-cols-2 gap-3 pt-6 border-t border-slate-50 dark:border-slate-800">
                <button onClick={() => copySmartLink(p)} className="flex items-center justify-center gap-3 py-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                   <LinkIcon size={14} /> Link IA
                </button>
                <button className="flex items-center justify-center gap-3 py-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-100 transition-all shadow-sm">
                   <Share2 size={14} /> Compartilhar
                </button>
             </div>
          </div>
        ))}
        
        {filteredProducts.length === 0 && (
           <div className="col-span-full py-32 flex flex-col items-center text-slate-300 opacity-50 grayscale select-none">
              <Package size={100} className="mb-8 animate-pulse" />
              <p className="text-xl font-black uppercase tracking-[0.4em] italic">Zero Itens no Filtro</p>
              <button onClick={() => { setActiveFilter('Todos'); setSearchQuery(''); }} className="mt-6 text-indigo-600 underline font-black uppercase text-[10px] tracking-widest">Limpar Parâmetros</button>
           </div>
        )}
      </div>

      {/* FILTER BAR FLOAT */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-8 z-[100] animate-in slide-in-from-bottom-5">
         <div className="flex gap-2">
            {['Todos', 'Serviço', 'Produto', 'SaaS', 'Consultoria'].map(cat => (
               <button 
                 key={cat} 
                 onClick={() => setActiveFilter(cat)}
                 className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === cat ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {cat}
               </button>
            ))}
         </div>
         <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
         <div className="flex items-center gap-4 text-slate-400">
            <Package size={20} />
            <span className="text-[11px] font-black uppercase tracking-widest tabular-nums">{filteredProducts.length} Ofertas</span>
         </div>
      </div>
    </div>
  );
};
