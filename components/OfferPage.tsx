
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
  Activity, Layers, Filter, History, PlayCircle
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
        src={branding.fullLogoDark || branding.fullLogo} 
        alt={branding.appName} 
        className={`h-8 md:h-14 w-auto object-contain force-logo-display transition-all duration-500 ${status === 'loading' ? 'opacity-0' : 'opacity-100'} drop-shadow-lg`}
        onError={() => setStatus('error')}
        onLoad={() => setStatus('success')}
      />
      {status === 'error' && (
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/50">{branding.appName.charAt(0)}</div>
          <span className="text-xl md:text-2xl font-black italic uppercase text-white tracking-tighter">{branding.appName}</span>
        </div>
      )}
    </div>
  );
};

export const OfferPage: React.FC<OfferPageProps> = ({ branding, onLogin }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 47, seconds: 22 });
  
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
    { 
      id: 'start', 
      name: 'Essencial', 
      tagline: 'Para quem está montando a rotina.', 
      monthlyPrice: 34, 
      annualTotal: 326, // 34 * 12 * 0.8 = ~326
      features: ['Pipeline Visual de Conversão', 'Central de Conversas Unificada', 'Até 1.000 Oportunidades/mês'], 
      cta: 'ATIVAR OPERAÇÃO', 
      color: 'indigo', 
      lightColor: 'bg-indigo-50 text-indigo-600' 
    },
    { 
      id: 'growth', 
      name: 'Avançado', 
      tagline: 'Para quem quer ritmo constante.', 
      monthlyPrice: 134, 
      annualTotal: 1286, // 134 * 12 * 0.8 = ~1286
      features: ['Cadências Automáticas de Resposta', 'Co-piloto de Vendas (IA)', 'Recuperação de Agenda'], 
      cta: 'ACELERAR RITMO', 
      popular: true, 
      color: 'violet', 
      lightColor: 'bg-violet-50 text-violet-600' 
    },
    { 
      id: 'scale', 
      name: 'Elite', 
      tagline: 'Para operações de alto volume.', 
      monthlyPrice: 297, 
      annualTotal: 2851, // 297 * 12 * 0.8 = ~2851
      features: ['Visão Multi-operação', 'Inteligência de Dados Master', 'Motor de Escala Total'], 
      cta: 'ESCALAR AGORA', 
      color: 'slate', 
      lightColor: 'bg-slate-100 text-slate-600' 
    }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* MODAL DE LOGIN MASTER (MOBILE OPTIMIZED) */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[500] bg-slate-950/90 backdrop-blur-3xl flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_0_100px_rgba(99,102,241,0.3)] overflow-hidden relative animate-in zoom-in-95 border border-white/20 flex flex-col max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute top-4 right-4 md:top-8 md:right-8 p-2 md:p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all z-10"
              >
                <X size={20} />
              </button>

              <div className="p-8 md:p-16 space-y-6 md:space-y-10">
                 <div className="text-center space-y-4">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-500/40 rotate-3 hover:rotate-0 transition-transform duration-500">
                       <Lock size={32} className="md:w-10 md:h-10" />
                    </div>
                    <div>
                       <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-slate-900">Central do Operador</h3>
                       <p className="text-[10px] md:text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 py-1 px-4 rounded-full w-fit mx-auto mt-2">Acesso Seguro SSL</p>
                    </div>
                 </div>

                 <form onSubmit={handleAccess} className="space-y-4 md:space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-widest">Identificação</label>
                       <div className="relative group">
                          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                          <input 
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Seu e-mail de acesso"
                            className="w-full pl-16 pr-8 py-4 md:py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm md:text-base"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-widest">Credencial</label>
                       <div className="relative group">
                          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                          <input 
                            required
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full pl-16 pr-16 py-4 md:py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm md:text-base"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors"
                          >
                             {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                          </button>
                       </div>
                    </div>

                    <div className="space-y-4 p-4 md:p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                       <div className="flex justify-between items-center px-2">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Token de Segurança</label>
                          <button type="button" onClick={generateSecurityCode} className="text-indigo-600 hover:text-indigo-800 transition-colors"><RefreshCcw size={14}/></button>
                       </div>
                       <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="w-full sm:flex-1 bg-slate-900 text-white font-mono text-xl md:text-2xl font-black italic tracking-[0.5em] h-14 md:h-16 rounded-2xl flex items-center justify-center shadow-inner select-none relative overflow-hidden">
                             <div className="absolute inset-0 bg-white/5 skew-x-12"></div>
                             {securityCode}
                          </div>
                          <input 
                             required
                             maxLength={5}
                             value={inputCode}
                             onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                             placeholder="CODE"
                             className="w-full sm:w-28 py-4 md:py-5 bg-white border-2 border-slate-200 rounded-2xl font-black text-center text-lg text-indigo-600 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all uppercase placeholder-slate-300"
                          />
                       </div>
                    </div>

                    {loginError && (
                       <div className="px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase border border-rose-100 animate-in slide-in-from-top-2">
                          <ShieldAlert size={16} /> {loginError}
                       </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={isAuthenticating}
                      className="w-full py-6 md:py-7 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-[2.5rem] shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-4 group disabled:opacity-70"
                    >
                       {isAuthenticating ? <Loader2 className="animate-spin" size={24}/> : <Zap size={22} className="group-hover:rotate-12 transition-transform" />}
                       {isAuthenticating ? 'Validando...' : 'Iniciar Operação'}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* 1. HERO SECTION - DARK MODE IMMERSIVE */}
      <div className="bg-slate-950 relative overflow-hidden text-white">
        {/* Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-violet-600/20 blur-[100px] rounded-full"></div>
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[30%] bg-cyan-500/10 blur-[80px] rounded-full"></div>
        
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

        <nav className="relative z-50 px-4 md:px-6 py-4 md:py-6 max-w-7xl mx-auto flex justify-between items-center">
          <ZLogoHero branding={branding} />
          <div className="flex items-center gap-4 md:gap-10">
            <button onClick={() => scrollToSection('metodo')} className="hidden md:block text-[11px] font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors">O Método</button>
            <button onClick={() => scrollToSection('precos')} className="hidden md:block text-[11px] font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors">Planos</button>
            <button onClick={handleOpenLogin} className="px-6 md:px-8 py-2 md:py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-indigo-900 transition-all shadow-lg hover:shadow-indigo-500/50">
              Acessar
            </button>
          </div>
        </nav>

        <section className="pt-10 pb-20 md:pt-16 md:pb-32 px-4 md:px-6 max-w-7xl mx-auto relative z-10 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500/20 to-rose-500/20 border border-orange-500/30 backdrop-blur-md">
                <Flame size={16} className="text-orange-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-200">Chega de Improvisação</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-[0.95] md:leading-[0.9]">
                Transforme conversas em <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">Receita Previsível.</span>
              </h1>
              
              <p className="text-base md:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Não é sobre ter mais leads. É sobre ter um <span className="text-white font-bold">processo que não falha</span>. Ative o motor que transforma agenda vazia em caixa diário usando IA e automação.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                <button onClick={() => scrollToSection('precos')} className="px-8 md:px-10 py-5 md:py-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-[0_20px_50px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_30px_60px_-10px_rgba(99,102,241,0.7)] transition-all hover:scale-105 flex items-center justify-center gap-4 text-xs md:text-sm group border border-white/10">
                  <Rocket size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Ativar Motor de Vendas
                </button>
                <button onClick={() => scrollToSection('metodo')} className="px-8 md:px-10 py-5 md:py-6 bg-white/5 text-white rounded-[2rem] font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-xs md:text-sm backdrop-blur-sm">
                  <PlayCircle size={18} />
                  Ver Como Funciona
                </button>
              </div>

              <div className="flex items-center gap-6 pt-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-500 justify-center lg:justify-start">
                 <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-black">U{i}</div>)}
                 </div>
                 <div className="text-left">
                    <div className="flex text-yellow-400"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Validado por 500+ Operações</p>
                 </div>
              </div>
            </div>

            <div className="flex-1 w-full relative perspective-1000 mt-8 lg:mt-0">
              <div className="relative transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-700 ease-out">
                 <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-[3.5rem] blur-xl opacity-30 animate-pulse"></div>
                 <img 
                   src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070" 
                   className="rounded-[2rem] md:rounded-[3rem] shadow-2xl border-4 border-slate-800/50 relative z-10 w-full object-cover aspect-[4/3]" 
                   alt="Dashboard Preview"
                 />
                 
                 {/* Floating Badges (Hidden on very small screens) */}
                 <div className="hidden sm:flex absolute -bottom-6 md:-bottom-10 -left-4 md:-left-10 bg-slate-900/90 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] shadow-2xl border border-slate-700 z-20 items-center gap-4 animate-bounce-slow">
                    <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><TrendingUp size={24} /></div>
                    <div>
                       <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Conversão</p>
                       <h4 className="text-xl md:text-2xl font-black italic text-white">+148%</h4>
                    </div>
                 </div>

                 <div className="hidden sm:flex absolute -top-4 md:-top-6 -right-4 md:-right-6 bg-slate-900/90 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] shadow-2xl border border-slate-700 z-20 items-center gap-4 animate-float">
                    <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400"><Bot size={24} /></div>
                    <div>
                       <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">IA Ativa</p>
                       <h4 className="text-base md:text-lg font-black italic text-white">Auto-Pilot</h4>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 2. PROBLEMA REAL - HIGH CONTRAST */}
      <section className="py-16 md:py-32 bg-white relative">
         <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-20 space-y-4 md:space-y-6">
               <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900">
                  O problema nunca foi o lead. <br className="hidden md:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">O problema é a falta de ritmo.</span>
               </h2>
               <p className="text-base md:text-lg font-bold text-slate-500 max-w-3xl mx-auto leading-relaxed">
                  Você perde vendas porque esquece de responder. Sua agenda oscila porque você para de prospectar quando está atendendo. O dinheiro fica na mesa por pura <span className="text-rose-500 bg-rose-50 px-2 rounded-md">falta de processo</span>.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
               {[
                 { title: 'Leads Esquecidos', desc: 'Aquele cliente que pediu preço e você nunca mais respondeu.', icon: History, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' },
                 { title: 'Agenda Instável', desc: 'Dias lotados seguidos de dias vazios. Zero previsibilidade.', icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
                 { title: 'Caixa "Montanha-Russa"', desc: 'Você nunca sabe quanto vai entrar no final do mês.', icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
               ].map((item, i) => (
                 <div key={i} className={`p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border-2 ${item.border} ${item.bg} hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl`}>
                    <div className={`w-14 h-14 md:w-16 md:h-16 ${item.bg} rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${item.border} bg-white`}>
                       <item.icon size={28} className={item.color}/>
                    </div>
                    <h3 className={`text-lg md:text-xl font-black uppercase italic tracking-tight ${item.color} mb-3`}>{item.title}</h3>
                    <p className="text-xs md:text-sm font-bold text-slate-600 leading-relaxed opacity-80">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 3. METODOLOGIA - VIBRANT */}
      <section id="metodo" className="py-16 md:py-32 px-4 md:px-6 bg-slate-50 border-y border-slate-200">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 md:mb-24">
               <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white bg-indigo-600 px-5 py-2 md:px-6 md:py-3 rounded-full shadow-lg shadow-indigo-500/30">A Nova Operação</span>
               <h2 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter mt-8 md:mt-10 text-slate-900">O Método de <span className="text-indigo-600">5 Fases</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
               {[
                  { step: '01', title: 'ATRAIR', desc: 'Centralização de oportunidades em um único lugar.', icon: Target, from: 'from-slate-700', to: 'to-slate-900', shadow: 'shadow-slate-500/20' },
                  { step: '02', title: 'CONVERSAR', desc: 'Início imediato de diálogo. Sem deixar o cliente esfriar.', icon: MessageSquare, from: 'from-blue-500', to: 'to-blue-600', shadow: 'shadow-blue-500/30' },
                  { step: '03', title: 'QUALIFICAR', desc: 'Identificar quem tem dinheiro e urgência agora.', icon: Filter, from: 'from-indigo-500', to: 'to-indigo-600', shadow: 'shadow-indigo-500/30' },
                  { step: '04', title: 'AGENDAR', desc: 'Transformar intenção em compromisso na agenda.', icon: Calendar, from: 'from-violet-500', to: 'to-purple-600', shadow: 'shadow-purple-500/30' },
                  { step: '05', title: 'FECHAR', desc: 'Garantir o pagamento e reativar para próxima venda.', icon: CheckCircle2, from: 'from-emerald-500', to: 'to-teal-600', shadow: 'shadow-emerald-500/30' },
               ].map((phase, i) => (
                  <div key={i} className={`relative p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-white border border-slate-100 shadow-xl ${phase.shadow} hover:-translate-y-2 transition-all duration-300 group overflow-hidden`}>
                     <div className={`absolute top-0 right-0 p-4 md:p-6 text-5xl md:text-6xl font-black text-slate-100 select-none group-hover:text-slate-50 transition-colors z-0`}>{phase.step}</div>
                     
                     <div className={`relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${phase.from} ${phase.to} flex items-center justify-center text-white mb-6 md:mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                        <phase.icon size={24} className="md:w-7 md:h-7" />
                     </div>
                     
                     <h3 className="relative z-10 text-lg md:text-xl font-black italic uppercase tracking-tight text-slate-900 mb-2 md:mb-3">{phase.title}</h3>
                     <p className="relative z-10 text-[10px] md:text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-wide">{phase.desc}</p>
                     
                     <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${phase.from} ${phase.to}`}></div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 4. TECH SHOWCASE - DARK MODE */}
      <section className="py-16 md:py-32 bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         
         <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
               <div className="flex-1 space-y-8 md:space-y-10">
                  <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight">
                     O ritmo não para quando <br className="hidden md:block"/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">você descansa.</span>
                  </h2>
                  <p className="text-base md:text-lg text-slate-400 font-medium leading-relaxed">
                     Enquanto você dorme, o processo continua. O sistema organiza, a inteligência alerta e a operação se mantém pronta para o dia seguinte.
                  </p>
                  
                  <div className="space-y-4 md:space-y-6">
                     <div className="flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-slate-800/50 rounded-3xl border border-slate-700/50 hover:border-indigo-500/50 transition-colors">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"><Brain size={24} className="md:w-7 md:h-7"/></div>
                        <div>
                           <h4 className="font-black uppercase tracking-widest text-xs md:text-sm text-white">IA como Co-piloto</h4>
                           <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-1">Ela analisa e diz: "Esse cliente está pronto, feche agora".</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-slate-800/50 rounded-3xl border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20"><RefreshCcw size={24} className="md:w-7 md:h-7"/></div>
                        <div>
                           <h4 className="font-black uppercase tracking-widest text-xs md:text-sm text-white">Retenção Automática</h4>
                           <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-1">Se ele não comprou hoje, o método o traz de volta amanhã.</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex-1 w-full">
                  <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-700 shadow-2xl relative">
                     <Bot className="absolute -top-12 -right-12 text-slate-800 w-48 h-48 md:w-64 md:h-64 rotate-12 opacity-50" />
                     
                     <div className="relative z-10 space-y-6 md:space-y-8">
                        <div className="bg-slate-950/80 p-6 md:p-8 rounded-3xl border border-slate-700 flex gap-4 md:gap-6 items-center shadow-lg">
                           <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                           <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-emerald-400">Análise de Conversa em Tempo Real</p>
                        </div>
                        
                        <div className="font-mono text-xs md:text-sm space-y-3 md:space-y-4">
                           <div className="p-3 md:p-4 bg-indigo-500/10 border-l-4 border-indigo-500 rounded-r-xl">
                              <span className="text-indigo-400 font-bold">&gt; Analisando intenção de compra...</span>
                           </div>
                           <div className="p-3 md:p-4 bg-rose-500/10 border-l-4 border-rose-500 rounded-r-xl">
                              <span className="text-rose-400 font-bold">&gt; Cliente demonstrou urgência.</span>
                           </div>
                           <div className="p-3 md:p-4 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-xl">
                              <span className="text-emerald-400 font-bold">&gt; Ação sugerida: OFERECER HORÁRIO DE HOJE.</span>
                           </div>
                           <div className="p-3 md:p-4 bg-slate-800 rounded-xl text-slate-400">
                              &gt; Probabilidade de fechamento: <span className="text-white font-bold">89%</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 5. PRICING - VIBRANT CARDS */}
      <section id="precos" className="py-16 md:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4 md:mb-6 text-slate-900">
            Ative sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Operação</span>
          </h2>
          <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-10 md:mb-16">Você não compra um acesso. Você ativa um motor de vendas.</p>
          
          <div className="inline-flex flex-col sm:flex-row bg-white p-2 rounded-[2rem] sm:rounded-[2.5rem] mb-12 md:mb-20 shadow-lg border border-slate-100 gap-2 sm:gap-0">
            <button onClick={() => setBillingCycle('monthly')} className={`w-full sm:w-auto px-8 md:px-12 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>Mensal</button>
            <button onClick={() => setBillingCycle('annual')} className={`w-full sm:w-auto px-8 md:px-12 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${billingCycle === 'annual' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>Anual (20% OFF)</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {plans.map(plan => (
              <div key={plan.id} className={`relative p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] transition-all duration-500 group flex flex-col ${plan.popular ? 'bg-slate-900 text-white shadow-2xl scale-100 md:scale-110 z-10 border-4 border-indigo-500' : 'bg-white text-slate-900 shadow-xl border border-slate-100 hover:border-indigo-200 hover:scale-105'}`}>
                {plan.popular && (
                   <div className="absolute -top-5 md:-top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/40 whitespace-nowrap">
                      Escolha dos Líderes
                   </div>
                )}
                
                <div className="mb-6 md:mb-8 mt-4 md:mt-0">
                   <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight mb-2">{plan.name}</h3>
                   <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${plan.popular ? 'text-slate-400' : 'text-slate-400'}`}>{plan.tagline}</p>
                </div>

                <div className="flex items-baseline justify-center gap-2 mb-8 md:mb-10">
                  <span className="text-xs md:text-sm font-black opacity-50">R$</span>
                  <h4 className="text-5xl md:text-7xl font-black tracking-tighter tabular-nums italic">{billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.annualTotal/12)}</h4>
                  <span className="text-xs md:text-sm font-bold uppercase opacity-50">/mês</span>
                </div>

                <div className="space-y-4 md:space-y-5 w-full mb-10 md:mb-12 text-left pl-2 md:pl-4 flex-1">
                   {plan.features.map((f, i) => (
                     <div key={i} className="flex items-center gap-3 md:gap-4">
                        <div className={`p-1 rounded-full ${plan.popular ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                           <Check size={10} className="md:w-3 md:h-3" strokeWidth={4} />
                        </div>
                        <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wide ${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>{f}</span>
                     </div>
                   ))}
                </div>

                <button onClick={() => { handleOpenLogin(); }} className={`w-full py-5 md:py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] shadow-lg transition-all hover:scale-105 hover:shadow-xl ${plan.popular ? 'bg-white text-indigo-900 hover:bg-indigo-50' : 'bg-slate-900 text-white hover:bg-indigo-900'}`}>
                   {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA - HIGH IMPACT */}
      <section className="py-16 md:py-32 px-4 md:px-6">
         <div className="max-w-7xl mx-auto bg-gradient-to-br from-indigo-900 to-slate-950 rounded-[3rem] md:rounded-[5rem] p-8 md:p-32 text-center text-white relative overflow-hidden shadow-2xl border-4 border-indigo-500/20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            
            {/* Animated Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-500/20 blur-[150px] rounded-full pointer-events-none"></div>
            
            <Sparkles className="absolute top-10 md:top-20 right-10 md:right-20 w-16 h-16 md:w-32 md:h-32 text-yellow-400/20 rotate-12 animate-pulse" />
            <Sparkles className="absolute bottom-10 md:bottom-20 left-10 md:left-20 w-12 h-12 md:w-24 md:h-24 text-cyan-400/20 -rotate-12 animate-pulse delay-700" />
            
            <div className="relative z-10 space-y-8 md:space-y-12">
               <h2 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
                  Assuma o controle da <br className="hidden md:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Sua Receita.</span>
               </h2>
               
               <p className="text-base md:text-2xl font-bold text-slate-300 uppercase tracking-widest italic max-w-4xl mx-auto">
                  Pare de torcer para vender. Comece a operar uma máquina de conversão previsível hoje.
               </p>
               
               <button onClick={() => scrollToSection('precos')} className="w-full md:w-auto px-10 md:px-20 py-6 md:py-8 bg-white text-indigo-900 rounded-[2rem] md:rounded-[3rem] font-black uppercase tracking-[0.3em] text-xs md:text-lg shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_rgba(255,255,255,0.5)] hover:scale-105 transition-all flex items-center justify-center gap-4 md:gap-6 mx-auto group">
                 Iniciar Minha Operação <ArrowRight className="group-hover:translate-x-2 transition-transform" />
               </button>
               
               <p className="pt-6 md:pt-10 text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Isso não é uma ferramenta. É o fim da improvisação.</p>
            </div>
         </div>
      </section>

      {/* RODAPÉ CLEAN */}
      <footer className="py-12 md:py-16 px-4 md:px-6 bg-slate-50 border-t border-slate-200">
         <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 md:gap-8">
            <ZLogoHero branding={branding} className="opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all scale-75" />
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">
               <a href="#" className="hover:text-indigo-600 transition-colors">Termos de Uso</a>
               <a href="#" className="hover:text-indigo-600 transition-colors">Privacidade</a>
               <a href="#" className="hover:text-indigo-600 transition-colors">Suporte Master</a>
            </div>
            <p className="text-[8px] md:text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] text-center">© 2024 Z-Prospector Operations Method.</p>
         </div>
      </footer>

    </div>
  );
};
