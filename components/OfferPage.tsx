import React, { useState } from 'react';
import { 
  Zap, CheckCircle2, Lock, X, Mail, Eye, EyeOff, Loader2, 
  ShieldAlert, PlayCircle, BarChart3, MessageSquare, 
  Calendar, Check, ArrowRight, Brain, Clock, AlertTriangle,
  TrendingUp, MousePointer2, Smartphone, History as HistoryIcon, RefreshCcw
} from 'lucide-react';
import { BrandingConfig } from '../types';

interface OfferPageProps {
  branding: BrandingConfig;
  onLogin: () => void;
}

const API_URL = '/api/core.php';

const ZLogoHero: React.FC<{ branding: BrandingConfig, className?: string }> = ({ branding, className = "" }) => {
  return (
    <div className={`flex items-center gap-2 py-2 ${className}`}>
      {branding.fullLogo ? (
         <img src={branding.fullLogoDark || branding.fullLogo} alt={branding.appName} className="h-8 md:h-10 w-auto object-contain" />
      ) : (
         <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xl">Z</div>
            <span className="text-xl font-black italic uppercase text-white tracking-tighter">Z-Prospector</span>
         </div>
      )}
    </div>
  );
};

export const OfferPage: React.FC<OfferPageProps> = ({ branding, onLogin }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  
  // LOGIN STATE
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsAuthenticating(true);
    
    try {
        const response = await fetch(`${API_URL}?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        
        if (data.success && data.token) {
            localStorage.setItem('z_session_token', data.token); 
            localStorage.setItem('z_user_data', JSON.stringify(data.user));
            onLogin();
        } else {
            setLoginError(data.error || 'Credenciais inválidas.');
        }
    } catch (e) {
        setLoginError('Erro de conexão. Tente novamente.');
    } finally {
        setIsAuthenticating(false);
    }
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* --- LOGIN MODAL --- */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 relative border border-slate-100 animate-in zoom-in-95">
              <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
              <div className="text-center mb-8">
                 <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-500/30"><Lock size={24}/></div>
                 <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Acesso Operador</h3>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Faça login para continuar</p>
              </div>
              <form onSubmit={handleAccess} className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 pl-2">E-mail</label>
                    <div className="relative">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
                       <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 transition-all" placeholder="seu@email.com" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 pl-2">Senha</label>
                    <div className="relative">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
                       <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 transition-all" placeholder="••••••" />
                       <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600"><Eye size={16}/></button>
                    </div>
                 </div>
                 {loginError && <div className="text-[10px] font-bold text-rose-500 bg-rose-50 p-3 rounded-lg flex items-center gap-2"><ShieldAlert size={12}/> {loginError}</div>}
                 <button disabled={isAuthenticating} className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl uppercase text-xs tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                    {isAuthenticating ? <Loader2 className="animate-spin" size={16}/> : 'Entrar na Plataforma'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* --- HERO SECTION (Dark Blue Gradient) --- */}
      <div className="bg-[#0B0F19] relative overflow-hidden text-white pt-6 pb-32">
         {/* Background Elements */}
         <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-br from-indigo-900/20 via-[#0B0F19] to-[#0B0F19] pointer-events-none"></div>
         <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>

         <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Header */}
            <nav className="flex justify-between items-center mb-20">
               <ZLogoHero branding={branding} />
               <div className="flex items-center gap-8">
                  <button onClick={() => scrollTo('metodo')} className="hidden md:block text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">O Método</button>
                  <button onClick={() => scrollTo('precos')} className="hidden md:block text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Planos</button>
                  <button onClick={() => setIsLoginModalOpen(true)} className="px-8 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all">Acessar</button>
               </div>
            </nav>

            {/* Hero Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest">
                     <Zap size={12} /> Chega de Improvisação
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9]">
                     TRANSFORME <br/> CONVERSAS EM <br/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">RECEITA PREVISÍVEL.</span>
                  </h1>
                  <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-lg">
                     Não é sobre ter mais leads. É sobre ter um <strong>processo que não falha</strong>. Ative o motor que transforma agenda vazia em caixa diário usando IA e automação.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                     <button onClick={() => scrollTo('precos')} className="px-10 py-5 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)] transition-all transform hover:scale-105">
                        Ativar Motor de Vendas
                     </button>
                     <button className="px-10 py-5 bg-transparent border border-white/20 hover:border-white/40 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                        <PlayCircle size={18} /> Ver como Funciona
                     </button>
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                     <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#0B0F19]"></div>)}
                     </div>
                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        ⭐⭐⭐⭐⭐ Validado por 500+ Operações
                     </div>
                  </div>
               </div>

               {/* Dashboard Mockup */}
               <div className="relative">
                  <div className="relative z-10 bg-[#111827] rounded-[2rem] border border-white/10 shadow-2xl p-2 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                     <div className="absolute top-4 right-4 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">IA Ativa • Auto-Pilot</span>
                     </div>
                     <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop" className="w-full rounded-[1.5rem] opacity-80" alt="Dashboard" />
                     {/* Floating Cards Mockup */}
                     <div className="absolute bottom-10 left-10 p-4 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-1000">
                        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white"><TrendingUp size={20}/></div>
                        <div>
                           <p className="text-[9px] text-slate-400 uppercase font-black">Conversão</p>
                           <p className="text-xl font-black text-white italic">+148%</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* --- PROBLEM SECTION --- */}
      <div className="py-32 bg-white relative">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-4 text-slate-900 leading-tight">
               O PROBLEMA NUNCA FOI O LEAD. <br/>
               <span className="text-orange-600">O PROBLEMA É A FALTA DE RITMO.</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium mb-16">
               Você perde vendas porque esquece de responder. Sua agenda oscila porque você para de prospectar quando está atendendo. O dinheiro fica na mesa por pura <span className="text-rose-500 font-bold">falta de processo</span>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="p-10 bg-rose-50 rounded-[2.5rem] border border-rose-100 text-left hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-rose-500 mb-6 shadow-sm"><HistoryIcon size={28}/></div>
                  <h3 className="text-xl font-black italic uppercase text-rose-600 mb-2">Leads Esquecidos</h3>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">Aquele cliente que pediu preço e você nunca mais respondeu porque o WhatsApp lotou.</p>
               </div>
               <div className="p-10 bg-orange-50 rounded-[2.5rem] border border-orange-100 text-left hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-orange-500 mb-6 shadow-sm"><AlertTriangle size={28}/></div>
                  <h3 className="text-xl font-black italic uppercase text-orange-600 mb-2">Agenda Instável</h3>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">Dias lotados seguidos de dias vazios. Zero previsibilidade de faturamento.</p>
               </div>
               <div className="p-10 bg-amber-50 rounded-[2.5rem] border border-amber-100 text-left hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 mb-6 shadow-sm"><TrendingUp size={28}/></div>
                  <h3 className="text-xl font-black italic uppercase text-amber-600 mb-2">Caixa "Montanha-Russa"</h3>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">Você nunca sabe quanto vai entrar no final do mês. Vive matando um leão por dia.</p>
               </div>
            </div>
         </div>
      </div>

      {/* --- METHOD SECTION --- */}
      <div id="metodo" className="py-32 bg-slate-50 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
               <div className="inline-block px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-6">A Nova Operação</div>
               <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-slate-900">
                  O MÉTODO DE <span className="text-[#6366f1]">5 FASES</span>
               </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
               {[
                  { n: '01', title: 'Atrair', desc: 'Centralização de oportunidades em um único lugar.', icon: MousePointer2 },
                  { n: '02', title: 'Conversar', desc: 'Início imediato de diálogo. Sem deixar o cliente esfriar.', icon: MessageSquare },
                  { n: '03', title: 'Qualificar', desc: 'Identificar quem tem dinheiro e urgência agora.', icon: Brain },
                  { n: '04', title: 'Agendar', desc: 'Transformar intenção em compromisso na agenda.', icon: Calendar },
                  { n: '05', title: 'Fechar', desc: 'Garantir o pagamento e reativar para próxima venda.', icon: CheckCircle2 },
               ].map((step, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-105 transition-all relative overflow-hidden group">
                     <div className="absolute top-0 right-0 text-[80px] font-black text-slate-50 leading-none -mr-4 -mt-4 select-none group-hover:text-indigo-50 transition-colors">{step.n}</div>
                     <div className="relative z-10">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200"><step.icon size={20}/></div>
                        <h4 className="text-lg font-black italic uppercase text-slate-900 mb-2">{step.title}</h4>
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wide">{step.desc}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* --- AI SECTION (DARK) --- */}
      <div className="py-32 bg-[#0F172A] text-white relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
               <h2 className="text-4xl font-black italic tracking-tighter mb-6 leading-tight">
                  O RITMO NÃO PARA <br/> QUANDO <span className="text-sky-400">VOCÊ DESCANSA.</span>
               </h2>
               <p className="text-slate-400 text-lg mb-10 font-medium">
                  Enquanto você dorme, o processo continua. O sistema organiza, a inteligência alerta e a operação se mantém pronta para o dia seguinte.
               </p>
               <div className="space-y-6">
                  <div className="flex gap-4 p-6 bg-slate-800/50 rounded-3xl border border-slate-700">
                     <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0"><Brain size={24}/></div>
                     <div>
                        <h4 className="font-black italic uppercase">IA Como Co-Piloto</h4>
                        <p className="text-xs text-slate-400 mt-1">Ela analisa e diz: "Esse cliente está pronto, feche agora".</p>
                     </div>
                  </div>
                  <div className="flex gap-4 p-6 bg-slate-800/50 rounded-3xl border border-slate-700">
                     <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0"><RefreshCcw size={24}/></div>
                     <div>
                        <h4 className="font-black italic uppercase">Retenção Automática</h4>
                        <p className="text-xs text-slate-400 mt-1">Se ele não comprou hoje, o método o traz de volta amanhã.</p>
                     </div>
                  </div>
               </div>
            </div>
            {/* Simulation Interface */}
            <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] p-8 shadow-2xl relative">
               <div className="absolute top-4 right-4 flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
               </div>
               <div className="space-y-4 mt-6 font-mono text-xs">
                  <div className="flex items-center gap-2 text-emerald-400">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                     ANÁLISE DE CONVERSA EM TEMPO REAL
                  </div>
                  <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-indigo-500">
                     <span className="text-indigo-400 block mb-1">> Analisando intenção de compra...</span>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-rose-500">
                     <span className="text-rose-400 block mb-1">> Cliente demonstrou urgência.</span>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-emerald-500">
                     <span className="text-emerald-400 block mb-1">> Ação sugerida: OFERECER HORÁRIO DE HOJE.</span>
                  </div>
                  <div className="text-slate-500 pt-2">> Probabilidade de fechamento: <span className="text-white font-bold">89%</span></div>
               </div>
            </div>
         </div>
      </div>

      {/* --- PRICING SECTION --- */}
      <div id="precos" className="py-32 bg-slate-50">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">
                  ATIVE SUA <span className="text-[#6366f1]">OPERAÇÃO</span>
               </h2>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Você não compra um acesso. Você ativa um motor de vendas.</p>
               
               <div className="flex justify-center mt-8">
                  <div className="bg-white p-1 rounded-full border border-slate-200 shadow-sm flex">
                     <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Mensal</button>
                     <button onClick={() => setBillingCycle('annual')} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === 'annual' ? 'bg-[#6366f1] text-white' : 'text-slate-400'}`}>Anual (20% OFF)</button>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
               
               {/* PLAN 1 */}
               <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:border-slate-200 transition-all">
                  <h3 className="text-xl font-black italic uppercase text-slate-900">Essencial</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-8">Para quem está montando a rotina.</p>
                  <div className="flex items-baseline gap-1 mb-8">
                     <span className="text-xs font-bold text-slate-400">R$</span>
                     <span className="text-6xl font-black text-slate-900 italic tracking-tighter">27</span>
                     <span className="text-xs font-bold text-slate-400">/MÊS</span>
                  </div>
                  <ul className="space-y-4 mb-10">
                     <li className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase"><Check size={14} className="text-indigo-500"/> Pipeline Visual de Conversão</li>
                     <li className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase"><Check size={14} className="text-indigo-500"/> Central de Conversas Unificada</li>
                     <li className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase"><Check size={14} className="text-indigo-500"/> Até 1.000 Oportunidades/Mês</li>
                  </ul>
                  <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-transform">Ativar Operação</button>
               </div>

               {/* PLAN 2 (HIGHLIGHT) */}
               <div className="bg-[#0F172A] p-10 rounded-[3rem] shadow-2xl shadow-indigo-900/30 border border-slate-700 relative z-10 scale-105">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 bg-[#6366f1] text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Escolha dos Líderes</div>
                  <h3 className="text-2xl font-black italic uppercase text-white">Avançado</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-8">Para quem quer ritmo constante.</p>
                  <div className="flex items-baseline gap-1 mb-8">
                     <span className="text-xs font-bold text-slate-500">R$</span>
                     <span className="text-7xl font-black text-white italic tracking-tighter">107</span>
                     <span className="text-xs font-bold text-slate-500">/MÊS</span>
                  </div>
                  <ul className="space-y-4 mb-10">
                     <li className="flex items-center gap-3 text-[10px] font-bold text-white uppercase"><div className="w-4 h-4 bg-[#6366f1] rounded-full flex items-center justify-center"><Check size={10} className="text-white"/></div> Cadências Automáticas de Resposta</li>
                     <li className="flex items-center gap-3 text-[10px] font-bold text-white uppercase"><div className="w-4 h-4 bg-[#6366f1] rounded-full flex items-center justify-center"><Check size={10} className="text-white"/></div> Co-Piloto de Vendas (IA)</li>
                     <li className="flex items-center gap-3 text-[10px] font-bold text-white uppercase"><div className="w-4 h-4 bg-[#6366f1] rounded-full flex items-center justify-center"><Check size={10} className="text-white"/></div> Recuperação de Agenda</li>
                  </ul>
                  <button className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 transition-colors shadow-lg">Acelerar Ritmo</button>
               </div>

               {/* PLAN 3 */}
               <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:border-slate-200 transition-all">
                  <h3 className="text-xl font-black italic uppercase text-slate-900">Elite</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-8">Para operações de alto volume.</p>
                  <div className="flex items-baseline gap-1 mb-8">
                     <span className="text-xs font-bold text-slate-400">R$</span>
                     <span className="text-6xl font-black text-slate-900 italic tracking-tighter">238</span>
                     <span className="text-xs font-bold text-slate-400">/MÊS</span>
                  </div>
                  <ul className="space-y-4 mb-10">
                     <li className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase"><Check size={14} className="text-sky-500"/> Visão Multi-Operação</li>
                     <li className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase"><Check size={14} className="text-sky-500"/> Inteligência de Dados Master</li>
                     <li className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase"><Check size={14} className="text-sky-500"/> Motor de Escala Total</li>
                  </ul>
                  <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-transform">Escalar Agora</button>
               </div>

            </div>
         </div>
      </div>

      {/* --- FOOTER CTA --- */}
      <div className="py-20 px-6 max-w-5xl mx-auto">
         <div className="bg-[#1e1b4b] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-[#1e1b4b]"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full"></div>
            
            <div className="relative z-10">
               <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">
                  ASSUMA O CONTROLE DA <br/> <span className="text-sky-400">SUA RECEITA.</span>
               </h2>
               <p className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-10">
                  Pare de torcer para vender. Comece a operar uma máquina de conversão previsível hoje.
               </p>
               <button onClick={() => scrollTo('precos')} className="px-12 py-6 bg-white text-indigo-900 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-2xl flex items-center gap-3 mx-auto">
                  Iniciar Minha Operação <ArrowRight size={16}/>
               </button>
               
               <p className="text-[9px] text-indigo-400/50 uppercase tracking-[0.3em] mt-12 font-bold">
                  Isso não é uma ferramenta. É o fim da improvisação.
               </p>
            </div>
         </div>
      </div>

      <footer className="bg-slate-50 border-t border-slate-200 py-10 text-center">
         <div className="flex justify-center items-center gap-2 mb-4 opacity-50">
            <div className="w-6 h-6 bg-slate-400 rounded flex items-center justify-center text-white font-black text-xs">Z</div>
            <span className="font-black uppercase text-slate-400 text-xs">Z-Prospector</span>
         </div>
         <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest space-x-6">
            <a href="#" className="hover:text-slate-600">Termos de Uso</a>
            <a href="#" className="hover:text-slate-600">Privacidade</a>
            <a href="#" className="hover:text-slate-600">Suporte Master</a>
         </div>
         <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-4">© 2024 Z-Prospector Operations Method.</p>
      </footer>

    </div>
  );
};