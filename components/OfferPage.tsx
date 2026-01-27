
import React, { useState, useEffect } from 'react';
import { 
  Zap, Rocket, TrendingUp, ShieldCheck, Check, 
  Flame, CreditCard, QrCode, Lock, 
  X, ChevronDown, CheckCircle2,
  Brain, Target, Calendar,
  Loader2, Star, BarChart3, 
  ArrowRight, ShieldAlert, ShoppingCart,
  Search, Bot, LayoutDashboard, MessageSquare,
  Mail, Smartphone, BellRing, Ban, CheckCircle,
  BarChart, Users, Laptop, Briefcase, Globe2, Monitor,
  Sun, Moon, HelpCircle, Code2, Headphones, ShieldQuestion,
  Menu as MenuIcon, MousePointer2, Sparkles, Trophy,
  RefreshCcw, Building2, Wallet, Eye, EyeOff, Shield,
  Activity, Layers, Filter, History
} from 'lucide-react';
import { BrandingConfig } from '../types';

interface OfferPageProps {
  branding: BrandingConfig;
  onLogin: () => void;
  onActivationSuccess?: (email: string) => void;
}

const ZLogoHero: React.FC<{ branding: BrandingConfig, className?: string }> = ({ branding, className = "" }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  return (
    <div className={`flex items-center py-2 ${className}`}>
      <img 
        src={branding.fullLogo} 
        alt={branding.appName} 
        className={`h-8 md:h-12 w-auto object-contain force-logo-display transition-all duration-500 ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`}
        onError={() => setStatus('error')}
        onLoad={() => setStatus('success')}
      />
      {status === 'error' && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">{branding.appName.charAt(0)}</div>
          <span className="text-xl font-black italic uppercase text-slate-900 dark:text-white">{branding.appName}</span>
        </div>
      )}
    </div>
  );
};

export const OfferPage: React.FC<OfferPageProps> = ({ branding, onLogin }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 47, seconds: 22 });
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // LOGIN MODAL STATE
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const generateSecurityCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSecurityCode(code);
  };

  const handleOpenLogin = () => {
    generateSecurityCode();
    setIsLoginModalOpen(true);
    setLoginError(null);
    setInputCode('');
  };

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (inputCode.toUpperCase() !== securityCode) {
      setLoginError('Código de segurança inválido. Tente novamente.');
      generateSecurityCode();
      setInputCode('');
      return;
    }

    setIsAuthenticating(true);
    // Simulação de autenticação Master
    setTimeout(() => {
      setIsAuthenticating(false);
      onLogin();
    }, 1500);
  };

  const plans = [
    { id: 'start', name: 'INICIAÇÃO', tagline: 'Para quem está montando a rotina.', monthlyPrice: 97, annualTotal: 931, features: ['Pipeline Visual de Conversão', 'Central de Conversas Unificada', 'Até 1.000 Oportunidades/mês'], cta: 'ATIVAR OPERAÇÃO', color: 'indigo' },
    { id: 'growth', name: 'TRAÇÃO', tagline: 'Para quem quer ritmo constante.', monthlyPrice: 197, annualTotal: 1891, features: ['Cadências Automáticas de Resposta', 'Co-piloto de Vendas (IA)', 'Recuperação de Agenda'], cta: 'ACELERAR RITMO', popular: true, color: 'violet' },
    { id: 'scale', name: 'DOMÍNIO', tagline: 'Para operações de alto volume.', monthlyPrice: 397, annualTotal: 3811, features: ['Visão Multi-operação', 'Inteligência de Dados Master', 'Motor de Escala Total'], cta: 'ESCALAR AGORA', color: 'slate' }
  ];

  const faqs = [
    { q: 'Preciso de conhecimento técnico?', a: 'Não. O Z-Prospector é um método pronto. Você não "programa", você apenas opera e vende.', icon: Zap },
    { q: 'Isso substitui minha equipe?', a: 'Não, ele potencializa. Sua equipe para de perder tempo com tarefas manuais e foca apenas em fechar negócio.', icon: Users },
    { q: 'Serve para o meu nicho?', a: 'Se você vende conversando (WhatsApp, Reunião, Direct), o método funciona. Não importa o produto, importa o processo.', icon: Target },
    { q: 'E se eu parar de usar?', a: 'Você tem liberdade total. O cancelamento da operação é feito em um clique, sem contratos de fidelidade abusivos.', icon: ShieldCheck }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      
      {/* MODAL DE LOGIN MASTER */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[500] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative animate-in zoom-in-95">
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute top-10 right-10 p-3 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
              >
                <X size={24} />
              </button>

              <div className="p-16 space-y-10">
                 <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-500/30">
                       <Lock size={36} />
                    </div>
                    <div>
                       <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Central do Operador</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acesso à Operação</p>
                    </div>
                 </div>

                 <form onSubmit={handleAccess} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 px-4">Identificação</label>
                       <div className="relative">
                          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                          <input 
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Seu e-mail de acesso"
                            className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] font-bold text-slate-800 outline-none focus:ring-4 ring-indigo-500/10 transition-all"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 px-4">Credencial</label>
                       <div className="relative">
                          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                          <input 
                            required
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-16 pr-16 py-5 bg-slate-50 border-none rounded-[2rem] font-bold text-slate-800 outline-none focus:ring-4 ring-indigo-500/10 transition-all"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600"
                          >
                             {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                          </button>
                       </div>
                    </div>

                    <div className="space-y-4 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                       <div className="flex justify-between items-center px-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Validação de Segurança</label>
                          <button type="button" onClick={generateSecurityCode} className="text-indigo-600 hover:underline"><RefreshCcw size={12}/></button>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="flex-1 bg-indigo-600 text-white font-mono text-2xl font-black italic tracking-[0.5em] h-16 rounded-2xl flex items-center justify-center shadow-inner select-none px-4">
                             {securityCode}
                          </div>
                          <input 
                             required
                             maxLength={5}
                             value={inputCode}
                             onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                             placeholder="DIGITE"
                             className="w-32 py-5 bg-white border-2 border-slate-100 rounded-2xl font-black text-center text-xl text-indigo-600 outline-none focus:border-indigo-600 transition-all uppercase"
                          />
                       </div>
                    </div>

                    {loginError && (
                       <div className="px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase border border-rose-100">
                          <ShieldAlert size={16} /> {loginError}
                       </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={isAuthenticating}
                      className="w-full py-7 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-[1.02] transition-all uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-4 group"
                    >
                       {isAuthenticating ? <Loader2 className="animate-spin" size={24}/> : <Zap size={22} className="group-hover:rotate-12 transition-transform" />}
                       {isAuthenticating ? 'Validando...' : 'Iniciar Operação'}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <nav className="sticky top-6 mx-4 md:mx-10 z-[90] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg px-8 py-5 flex justify-between items-center transition-all">
        <ZLogoHero branding={branding} />
        <div className="hidden lg:flex items-center gap-8">
          <button onClick={() => scrollToSection('metodo')} className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">O Método</button>
          <button onClick={() => scrollToSection('precos')} className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">Ativação</button>
          <button onClick={handleOpenLogin} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">Acessar Operação</button>
        </div>
      </nav>

      <section className="pt-20 pb-32 px-6 max-w-7xl mx-auto text-center lg:text-left">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-100 dark:border-orange-800"><Flame size={14} /> Fim da Improvisação</div>
            <h1 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none text-slate-900 dark:text-white">
              Transforme conversas em <span className="text-indigo-600">Receita Previsível.</span>
            </h1>
            <p className="text-xl text-slate-500 font-bold leading-relaxed max-w-2xl italic uppercase tracking-wide">
              Não é sobre ter mais leads. É sobre ter um processo que não falha. Ative o motor que transforma agenda vazia em caixa diário.
            </p>
            <button onClick={() => scrollToSection('precos')} className="px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all hover:scale-105 flex items-center justify-center gap-3 text-sm group">
              Ativar Motor de Vendas <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-indigo-600 blur-[100px] opacity-20 rounded-full"></div>
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070" className="rounded-[3rem] shadow-2xl border-4 border-slate-100 dark:border-slate-800 rotate-2 relative z-10" alt="Processo de Vendas"/>
            <div className="absolute -bottom-10 -left-10 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-bounce z-20">
               <Activity className="text-emerald-500 mb-2" size={32} />
               <p className="text-[10px] font-black uppercase text-slate-400">Ritmo de Vendas</p>
               <h4 className="text-2xl font-black italic text-indigo-600">Constante</h4>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEMA REAL */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
         <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <h2 className="text-3xl font-black italic uppercase tracking-tight">O problema nunca foi o lead. <br/><span className="text-rose-500">O problema é a falta de ritmo.</span></h2>
            <p className="text-lg font-bold text-slate-500 leading-relaxed max-w-2xl mx-auto uppercase tracking-wide">
               Você perde vendas porque esquece de responder. Sua agenda oscila porque você para de prospectar quando está atendendo. O dinheiro fica na mesa por pura falta de processo.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
               <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4"><History size={24}/></div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Leads Esquecidos</p>
               </div>
               <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4"><Calendar size={24}/></div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Agenda Instável</p>
               </div>
               <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4"><Wallet size={24}/></div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Caixa Imprevisível</p>
               </div>
            </div>
         </div>
      </section>

      {/* 3. A VIRADA DE CHAVE & 4. METODOLOGIA */}
      <section id="metodo" className="py-32 px-6 max-w-7xl mx-auto">
         <div className="text-center mb-20">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">A Nova Operação</span>
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mt-6">O Método de 5 Fases</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-4">Uma rotina clara para conduzir o cliente do "Oi" ao "Pix".</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
               { step: '01', title: 'ATRAIR', desc: 'Centralização de oportunidades em um único lugar.', icon: Target, color: 'bg-slate-100 text-slate-600' },
               { step: '02', title: 'CONVERSAR', desc: 'Início imediato de diálogo. Sem deixar o cliente esfriar.', icon: MessageSquare, color: 'bg-blue-50 text-blue-600' },
               { step: '03', title: 'QUALIFICAR', desc: 'Identificar quem tem dinheiro e urgência agora.', icon: Filter, color: 'bg-indigo-50 text-indigo-600' },
               { step: '04', title: 'AGENDAR', desc: 'Transformar intenção em compromisso na agenda.', icon: Calendar, color: 'bg-violet-50 text-violet-600' },
               { step: '05', title: 'FECHAR', desc: 'Garantir o pagamento e reativar para próxima venda.', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
            ].map((phase, i) => (
               <div key={i} className="p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 hover:shadow-xl transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 p-4 text-[40px] font-black text-slate-100 dark:text-slate-800 leading-none select-none group-hover:text-indigo-50/50 transition-colors`}>{phase.step}</div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${phase.color} relative z-10`}>
                     <phase.icon size={24} />
                  </div>
                  <h3 className="text-lg font-black italic uppercase tracking-tight mb-2 relative z-10">{phase.title}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed tracking-widest relative z-10">{phase.desc}</p>
               </div>
            ))}
         </div>
      </section>

      {/* 5. DIFERENCIAL & 6. INTELIGÊNCIA */}
      <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-20">
               <div className="flex-1 space-y-8">
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter">O ritmo não para quando <br/><span className="text-indigo-500">você descansa.</span></h2>
                  <p className="text-lg font-bold text-slate-400 uppercase tracking-widest leading-loose">
                     Enquanto você dorme, o processo continua. O sistema organiza, a inteligência alerta e a operação se mantém pronta para o dia seguinte.
                  </p>
                  <div className="space-y-6">
                     <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-600 rounded-xl"><Brain size={20}/></div>
                        <div>
                           <h4 className="font-black uppercase tracking-widest text-sm">IA como Co-piloto</h4>
                           <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Ela analisa as conversas e te diz: "Esse cliente está pronto, feche agora".</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-600 rounded-xl"><RefreshCcw size={20}/></div>
                        <div>
                           <h4 className="font-black uppercase tracking-widest text-sm">Retenção de Oportunidade</h4>
                           <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Nenhum lead fica para trás. Se ele não comprou hoje, o método o traz de volta amanhã.</p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="flex-1">
                  <div className="bg-slate-800 p-10 rounded-[3rem] border border-slate-700 shadow-2xl relative">
                     <Bot className="absolute -top-10 -right-10 text-slate-700 w-48 h-48 rotate-12 opacity-50" />
                     <div className="relative z-10 space-y-6">
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 flex gap-4 items-center">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Análise de Conversa em Tempo Real</p>
                        </div>
                        <p className="font-mono text-xs text-indigo-300">
                           &gt; Analisando intenção de compra...<br/>
                           &gt; Cliente demonstrou urgência.<br/>
                           &gt; Ação sugerida: OFERECER HORÁRIO DE HOJE.<br/>
                           &gt; Probabilidade de fechamento: 89%.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 7. TRANSFORMAÇÃO & 8. PARA QUEM É */}
      <section className="py-32 px-6 max-w-5xl mx-auto">
         <div className="bg-slate-50 dark:bg-slate-800 rounded-[4rem] p-12 md:p-20 text-center space-y-10 border border-slate-100 dark:border-slate-700">
            <h2 className="text-3xl font-black italic uppercase tracking-tight">Do Caos à <span className="text-indigo-600">Previsibilidade</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
               <div className="space-y-4">
                  <h4 className="font-black uppercase tracking-widest text-rose-500 flex items-center gap-2"><X size={16}/> Como é hoje:</h4>
                  <ul className="space-y-3">
                     {['Acorda sem saber se vai vender', 'Esquece de responder clientes no WhatsApp', 'Perde tempo com curiosos', 'Sente ansiedade no fim do mês'].map((item, i) => (
                        <li key={i} className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-start gap-2">
                           <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-1.5 shrink-0"></span> {item}
                        </li>
                     ))}
                  </ul>
               </div>
               <div className="space-y-4">
                  <h4 className="font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2"><Check size={16}/> Com a Operação Ativa:</h4>
                  <ul className="space-y-3">
                     {['Rotina clara do que fazer ao acordar', 'Processo conduz o cliente ao fechamento', 'IA filtra quem realmente compra', 'Previsibilidade de caixa e agenda'].map((item, i) => (
                        <li key={i} className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-start gap-2">
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></span> {item}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
            <div className="pt-10 border-t border-slate-200 dark:border-slate-700">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Para quem vive de fechar negócios via conversa.</p>
            </div>
         </div>
      </section>

      {/* 9. O QUE O USUÁRIO ATIVA (Preços) */}
      <section id="precos" className="py-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Ative sua <span className="text-indigo-600">Operação</span></h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-16">Você não compra um acesso. Você ativa um motor de vendas.</p>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-2 rounded-[2rem] w-fit mx-auto mb-20">
            <button onClick={() => setBillingCycle('monthly')} className={`px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xl' : 'text-slate-400'}`}>Mensal</button>
            <button onClick={() => setBillingCycle('annual')} className={`px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === 'annual' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xl' : 'text-slate-400'}`}>Anual (20% OFF)</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {plans.map(plan => (
              <div key={plan.id} className={`relative p-12 rounded-[4rem] border-2 transition-all flex flex-col items-center group hover:border-indigo-500 ${plan.popular ? 'border-indigo-600 bg-indigo-50/10 shadow-2xl scale-105 z-10' : 'border-slate-100 dark:border-slate-800'}`}>
                {plan.popular && <span className="absolute -top-5 bg-indigo-600 text-white px-8 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">Mais Escolhido</span>}
                <h3 className="text-2xl font-black italic uppercase tracking-tight mb-2">{plan.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 italic">{plan.tagline}</p>
                <div className="flex items-baseline gap-2 mb-10">
                  <span className="text-xs font-black text-slate-400">R$</span>
                  <h4 className="text-6xl font-black tracking-tighter tabular-nums italic">{billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.annualTotal/12)}</h4>
                  <span className="text-xs font-bold text-slate-400 uppercase">/mês</span>
                </div>
                <div className="space-y-4 w-full mb-12 text-left pl-4">
                   {plan.features.map((f, i) => <div key={i} className="flex items-center gap-3 text-xs font-black uppercase text-slate-500 tracking-tight"><CheckCircle2 size={16} className="text-indigo-600 shrink-0" /> {f}</div>)}
                </div>
                <button onClick={() => { handleOpenLogin(); }} className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-105 ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>{plan.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section id="faq" className="py-32 bg-slate-50 dark:bg-slate-900/50">
         <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl font-black italic uppercase tracking-tight text-center mb-20">Perguntas <span className="text-indigo-600">Comuns</span></h2>
            <div className="space-y-6">
               {faqs.map((faq, i) => (
                 <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all">
                    <button onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)} className="w-full p-8 flex items-center justify-between text-left group">
                       <div className="flex items-center gap-6">
                          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><faq.icon size={20}/></div>
                          <span className="font-black italic uppercase text-sm tracking-tight pr-4">{faq.q}</span>
                       </div>
                       <ChevronDown className={`transition-transform duration-300 ${openFaqIndex === i ? 'rotate-180 text-indigo-600' : 'text-slate-300'}`} />
                    </button>
                    {openFaqIndex === i && <div className="px-24 pb-10 animate-in slide-in-from-top-4"><p className="text-xs font-bold text-slate-500 uppercase leading-loose italic tracking-widest">{faq.a}</p></div>}
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 11. CHAMADA FINAL & POSICIONAMENTO */}
      <section className="py-32 px-6">
         <div className="max-w-7xl mx-auto bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[5rem] p-12 md:p-32 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <Sparkles className="absolute -top-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
            
            <div className="relative z-10 space-y-10">
               <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-tight">Assuma o controle da <br/><span className="text-indigo-400">Sua Receita.</span></h2>
               <p className="text-lg md:text-xl font-bold opacity-70 uppercase tracking-widest italic max-w-4xl mx-auto">
                  Pare de torcer para vender. Comece a operar uma máquina de conversão previsível.
               </p>
               <button onClick={() => scrollToSection('precos')} className="px-16 py-8 bg-white text-slate-900 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm md:text-lg shadow-2xl hover:bg-indigo-50 hover:scale-110 transition-all flex items-center justify-center gap-4 mx-auto group">
                 Iniciar Minha Operação <ArrowRight className="group-hover:translate-x-3 transition-transform" />
               </button>
               
               <p className="pt-20 text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Isso não é uma ferramenta. É o fim da improvisação.</p>
            </div>
         </div>
      </section>

      {/* RODAPÉ */}
      <footer className="pt-20 pb-10 px-6 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800">
         <div className="max-w-7xl mx-auto text-center space-y-8">
            <ZLogoHero branding={branding} className="justify-center grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all" />
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">© 2024 Z-Prospector Operations Method.</p>
         </div>
      </footer>

    </div>
  );
};
