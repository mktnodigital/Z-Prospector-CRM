
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
  Menu as MenuIcon
} from 'lucide-react';
import { BrandingConfig } from '../types';

interface OfferPageProps {
  branding: BrandingConfig;
  onLogin?: () => void;
  onActivationSuccess?: (email: string) => void;
}

const ZLogoHero: React.FC<{ branding: BrandingConfig, className?: string }> = ({ branding, className = "" }) => {
  const [hasError, setHasError] = useState(false);
  const src = branding.salesPageLogo;

  return (
    <div className={`flex items-center py-2 ${className}`}>
      {!hasError ? (
        <img 
          key={src} 
          src={src} 
          alt={branding.appName} 
          className="h-8 md:h-12 w-auto object-contain force-logo-display transition-all duration-500"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center text-white font-black shadow-lg">
             {branding.appName.charAt(0)}
          </div>
          <span className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
             {branding.appName}
          </span>
        </div>
      )}
    </div>
  );
};

export const OfferPage: React.FC<OfferPageProps> = ({ branding, onLogin, onActivationSuccess }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 39, seconds: 54 });
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'register' | 'payment' | 'success'>('register');
  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const plans = [
    {
      id: 'start',
      name: 'COMEÇAR',
      tagline: 'Quero parar de perder lead e começar a vender.',
      description: 'Ideal para quem quer organizar os primeiros atendimentos e gerar vendas no WhatsApp.',
      monthlyPrice: 97,
      annualTotal: 931, 
      features: ['CRM Kanban Visual', 'Inbox com IA Básica', 'Classificação Automática', 'Até 1.000 Leads/mês'],
      cta: 'QUERO COMEÇAR',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'growth',
      name: 'VENDER MAIS',
      tagline: 'Já vendo, mas quero vender todo dia.',
      description: 'Automação, follow-up e IA para aumentar conversão e previsibilidade.',
      monthlyPrice: 197,
      annualTotal: 1891,
      features: ['Tudo do Começar', 'Follow-ups Automáticos', 'IA de Agendamento Ativa', 'Campanhas Segmentadas'],
      cta: 'VENDER TODO DIA',
      popular: true,
      color: 'from-indigo-600 to-purple-600'
    },
    {
      id: 'scale',
      name: 'ESCALAR',
      tagline: 'Tenho equipe. Quero controle e crescimento.',
      description: 'Ideal para times, múltiplas unidades e operação estruturada.',
      monthlyPrice: 397,
      annualTotal: 3811,
      features: ['Tudo do Vender Mais', 'Gestão Multi-unidade', 'BI de Vendas Master', 'Automações Avançadas'],
      cta: 'ESCALAR AGORA',
      color: 'from-slate-800 to-slate-950'
    }
  ];

  const faqs = [
    { 
      q: 'Preciso de equipe técnica ou VPS própria?', 
      a: 'Não. O Z-Prospector é uma plataforma SaaS Master pronta para uso. Toda a complexidade de servidores e infraestrutura fica por nossa conta.', 
      icon: Code2 
    },
    { 
      q: 'Funciona com WhatsApp oficial ou não oficial?', 
      a: 'O sistema é versátil: você pode conectar via Cloud API (Oficial) ou Evolution VPS (Sincronização), garantindo máxima estabilidade.', 
      icon: MessageSquare 
    },
    { 
      q: 'Como funciona o cancelamento?', 
      a: 'Liberdade total. Você pode cancelar sua assinatura master a qualquer momento direto pelo painel, sem taxas escondidas ou fidelidade.', 
      icon: Ban 
    },
    { 
      q: 'Meus dados estão protegidos entre as unidades?', 
      a: 'Sim. Utilizamos arquitetura multi-tenant rigorosa. Cada empresa/unidade tem isolamento total de banco de dados e leads.', 
      icon: ShieldCheck 
    },
    { 
      q: 'A IA realmente entende gírias e áudios?', 
      a: 'Sim! Utilizamos modelos avançados do Gemini que processam linguagem natural, gírias regionais e até intenções complexas em áudio.', 
      icon: Brain 
    },
    { 
      q: 'O pagamento é via Mercado Pago?', 
      a: 'Exatamente. Utilizamos o Checkout Blindado do Mercado Pago para sua total segurança e liberação imediata do acesso.', 
      icon: CreditCard 
    }
  ];

  const handleOpenCheckout = (plan: any) => {
    setSelectedPlan(plan);
    setCheckoutStep('register');
    setIsCheckoutOpen(true);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutStep('payment');
    }, 1200);
  };

  const handlePaymentConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutStep('success');
      if (onActivationSuccess) onActivationSuccess(userData.email);
      setTimeout(() => {
        setIsCheckoutOpen(false);
        if (onLogin) onLogin();
      }, 5000);
    }, 2500);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 selection:bg-indigo-500 selection:text-white overflow-x-hidden ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      
      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[150] bg-white dark:bg-slate-950 animate-in fade-in flex flex-col p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-12">
            <ZLogoHero branding={branding} />
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500"><X size={24} /></button>
          </div>
          
          <div className="flex flex-col gap-6 flex-1">
            {['Recursos', 'Preços', 'FAQ'].map(item => (
              <button 
                key={item} 
                onClick={() => scrollToSection(item.toLowerCase())} 
                className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white text-left py-4 border-b border-slate-100 dark:border-slate-800"
              >
                {item}
              </button>
            ))}
            
            <div className="pt-8 space-y-6">
              <button onClick={toggleTheme} className="w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-black uppercase text-xs tracking-widest">
                {isDarkMode ? 'Tema Escuro Ativo' : 'Tema Claro Ativo'}
                {isDarkMode ? <Moon size={20} className="text-yellow-400" /> : <Sun size={20} className="text-indigo-600" />}
              </button>
              
              <button 
                onClick={() => { setIsMobileMenuOpen(false); if (onLogin) onLogin(); }} 
                className="w-full py-7 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl text-xs"
              >
                Acesso Master
              </button>
            </div>
          </div>

          <div className="mt-auto pt-10 text-center">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">SaaS Authority • v3.0</p>
          </div>
        </div>
      )}

      {isCheckoutOpen && selectedPlan && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-slate-950/95 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-30 text-slate-400"><X size={24} /></button>
            <div className="w-full md:w-2/5 p-8 md:p-12 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-3 mb-10"><div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><ShoppingCart size={20} /></div><h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Checkout Master</h4></div>
               <div className="space-y-6">
                  <div><h3 className="text-2xl font-black italic uppercase tracking-tight">{selectedPlan.name}</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{billingCycle === 'annual' ? 'Acesso Anual (20% OFF)' : 'Acesso Mensal'}</p></div>
                  <div className="pt-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</p><h2 className="text-4xl font-black tracking-tighter text-indigo-600">R$ {billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.annualTotal},00</h2></div>
               </div>
            </div>
            <div className="flex-1 p-8 md:p-12 relative overflow-y-auto max-h-[90vh]">
               {checkoutStep === 'register' && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div><h3 className="text-2xl font-black italic uppercase tracking-tight">Dados de Acesso</h3><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sua conta será ativada neste e-mail</p></div>
                    <form onSubmit={handleRegister} className="space-y-5">
                       <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">E-mail para Login</label><input required type="email" value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} placeholder="email@exemplo.com" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold shadow-sm" /></div>
                       <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">WhatsApp de Confirmação</label><input required value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} placeholder="11 99999-9999" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold shadow-sm" /></div>
                       <button type="submit" disabled={isProcessing} className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl hover:bg-indigo-700 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-3">{isProcessing ? <Loader2 className="animate-spin" /> : <ArrowRight size={18} />} Próximo Passo</button>
                    </form>
                 </div>
               )}
               {checkoutStep === 'payment' && (
                 <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit"><button onClick={() => setPaymentMethod('pix')} className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'pix' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xl' : 'text-slate-400'}`}><QrCode size={16} /> Pix Imediato</button><button onClick={() => setPaymentMethod('card')} className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'card' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xl' : 'text-slate-400'}`}><CreditCard size={16} /> Cartão Master</button></div>
                    {paymentMethod === 'pix' ? (
                      <div className="flex flex-col md:flex-row items-center gap-8 bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/50">
                        <div className="bg-white p-4 rounded-2xl shadow-inner border-4 border-white"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=mercadopago_${userData.email}`} alt="QR Pix" className="w-32 h-32" /></div>
                        <div className="space-y-4 text-left"><h5 className="text-sm font-black italic uppercase">Pague via Pix</h5><p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed tracking-widest">Liberação automática em segundos pela chave Master.</p></div>
                      </div>
                    ) : (
                      <div className="space-y-5"><input placeholder="Número do Cartão" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold shadow-sm" /><div className="grid grid-cols-2 gap-4"><input placeholder="MM/AA" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold shadow-sm" /><input placeholder="CVV" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold shadow-sm" /></div></div>
                    )}
                    <button onClick={handlePaymentConfirm} disabled={isProcessing} className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-3">{isProcessing ? <Loader2 className="animate-spin" /> : <Lock size={18} />} Confirmar e Ativar</button>
                 </div>
               )}
               {checkoutStep === 'success' && (
                 <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in">
                    <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl animate-bounce"><Check size={48} strokeWidth={4} /></div>
                    <div className="space-y-4"><h3 className="text-3xl font-black italic uppercase tracking-tight">Ativação Concluída!</h3><p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Verificamos seu pagamento. <br/>Acesso liberado para Email e WhatsApp.</p></div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 text-center text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 z-[100] shadow-xl flex justify-center items-center gap-4">
        <span className="flex items-center gap-2"><Flame size={14} className="text-yellow-400 animate-pulse"/> <span className="hidden sm:inline">OFERTA EXCLUSIVA DE LANÇAMENTO:</span> <span className="sm:hidden">LANÇAMENTO:</span></span>
        <span className="font-mono text-yellow-300">{timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}</span>
      </div>

      <nav className="sticky top-12 mx-4 md:mx-10 z-[90] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg px-6 md:px-8 py-4 md:py-5 flex justify-between items-center transition-all animate-in slide-in-from-top-4">
        <ZLogoHero branding={branding} />
        
        {/* DESKTOP MENU */}
        <div className="hidden lg:flex items-center gap-8">
          {['Recursos', 'Preços', 'FAQ'].map(item => (<button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">{item}</button>))}
          
          <button onClick={toggleTheme} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 dark:text-yellow-400 transition-all hover:scale-110">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button onClick={onLogin} className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">Acesso Master</button>
        </div>

        {/* MOBILE MENU TRIGGER */}
        <div className="flex lg:hidden items-center gap-3">
          <button onClick={toggleTheme} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-yellow-400">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg">
            <MenuIcon size={22} />
          </button>
        </div>
      </nav>

      <section id="hero" className="pt-16 md:pt-24 pb-20 md:pb-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 md:gap-24">
          <div className="flex-1 space-y-8 md:space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm">
               <Zap size={14} /> WhatsApp no Piloto Automático
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter leading-tight md:leading-snug">
              Transforme conversas no WhatsApp em <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">vendas todos os dias</span> — com IA.
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-2xl italic tracking-wide">
              Capte leads, organize seu funil, faça follow-up automático e feche mais negócios sem depender de planilhas ou atendentes perdidos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-4 md:pt-6">
               <button onClick={() => scrollToSection('precos')} className="px-10 md:px-12 py-5 md:py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.8rem] md:rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-xs md:text-sm">
                  👉 Começar agora <ArrowRight size={20} />
               </button>
               <div className="flex flex-row sm:flex-col justify-center gap-4 sm:gap-0 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 leading-relaxed text-center sm:text-left">
                  <span>• Teste sem burocracia</span>
                  <span className="hidden sm:inline">• Cancelamento instantâneo</span>
                  <span className="sm:hidden">• Cancelar instantâneo</span>
               </div>
            </div>
          </div>

          <div className="flex-1 relative w-full lg:w-auto animate-in slide-in-from-right-10 duration-1000 mt-12 lg:mt-0">
             <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] md:blur-[140px] rounded-full"></div>
             <div className="relative">
                <div className="bg-white dark:bg-slate-900 p-2 md:p-2.5 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] border-2 md:border-4 border-slate-100 dark:border-slate-800 overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-all duration-1000">
                   <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070" alt="Z-Prospector Dashboard" className="w-full min-h-[300px] md:min-h-[450px] object-cover object-top rounded-[1.8rem] md:rounded-[2rem] shadow-inner opacity-100 block" />
                   
                   <div className="absolute top-6 md:top-12 -left-4 md:-left-12 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-white/20 w-48 md:w-64 animate-bounce-slow">
                      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4"><div className="w-7 h-7 md:w-9 md:h-9 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg"><Bot size={14} className="text-white md:size-18"/></div><span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-indigo-600">IA Qualificando...</span></div>
                      <p className="text-[9px] md:text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic uppercase">"Identifiquei interesse imediato. Deseja enviar link de checkout?"</p>
                      <div className="flex gap-2 mt-4 md:mt-5"><div className="flex-1 h-6 md:h-7 bg-indigo-600 rounded-xl"></div><div className="flex-1 h-6 md:h-7 bg-slate-100 dark:bg-slate-700 rounded-xl"></div></div>
                   </div>

                   <div className="absolute bottom-6 md:bottom-12 -right-4 md:-right-6 bg-emerald-500 text-white p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border-2 md:border-4 border-white dark:border-slate-900 transform -rotate-3">
                      <div className="flex items-center gap-1 md:gap-2"><TrendingUp size={20}/><span className="text-xl md:text-2xl font-black italic tracking-tighter">+245% ROI</span></div>
                      <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest mt-1 opacity-80">Conversão Ativa</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-slate-900 text-white overflow-hidden relative border-y border-white/5">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/5 blur-[200px]"></div>
         <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center">
            <div className="space-y-8 md:space-y-10 relative z-10">
               <h2 className="text-2xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight md:leading-snug">
                  O problema não é falta de lead. <br/>
                  <span className="text-rose-500">É falta de processo comercial.</span>
               </h2>
               <div className="space-y-5 md:space-y-6">
                  {[
                    'Leads entram, mas ninguém responde na hora certa',
                    'Conversas se perdem na bagunça do WhatsApp',
                    'Follow-up é sistematicamente esquecido',
                    'Agenda fica vazia mesmo com tráfego pago'
                  ].map((bullet, i) => (
                    <div key={i} className="flex items-center gap-4 md:gap-5 group">
                       <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-inner border border-rose-500/20 shrink-0"><X size={16} /></div>
                       <p className="text-base md:text-lg font-bold text-slate-300 italic tracking-wide">{bullet}</p>
                    </div>
                  ))}
               </div>
               <div className="p-5 md:p-6 bg-rose-500/5 border-l-4 border-rose-500 rounded-r-xl md:rounded-r-2xl"><p className="text-lg md:text-xl font-black italic uppercase text-rose-500 tracking-tight">👉 Resultado: dinheiro saindo pelo ralo.</p></div>
            </div>
            <div className="relative">
               <div className="bg-white/5 p-3 md:p-4 rounded-[3rem] md:rounded-[4rem] backdrop-blur-sm shadow-inner border border-white/10 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80" alt="Negócios" className="rounded-[2.8rem] md:rounded-[3.2rem] shadow-2xl grayscale opacity-30" />
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                     <div className="bg-rose-600/90 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl text-center rotate-3 border-2 border-white/20 animate-pulse">
                        <ShieldAlert size={40} className="mx-auto mb-4 md:mb-6 text-white md:size-48" />
                        <h4 className="font-black italic uppercase text-base md:text-lg leading-tight">O CUSTO DA LENTIDÃO <br/> MATA SEU NEGÓCIO</h4>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <section id="recursos" className="py-20 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
         <div className="text-center mb-16 md:mb-28 space-y-6 md:space-y-8">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter leading-tight md:leading-snug">O Z-Prospector organiza e <br className="hidden md:block"/> <span className="text-indigo-600">acelera suas vendas Master.</span></h2>
            <p className="text-lg md:text-xl text-slate-500 font-bold max-w-3xl mx-auto italic leading-relaxed">SaaS feito para empresas que precisam de previsibilidade, usando WhatsApp e IA — sem complicação técnica.</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {[
              { t: 'Captação ativa de leads', i: Search, img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80' },
              { t: 'CRM visual em tempo real', i: LayoutDashboard, img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80' },
              { t: 'IA que qualifica leads', i: Brain, img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80' },
              { t: 'Follow-up automático', i: Target, img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80' },
              { t: 'Agendamentos via Chat', i: Calendar, img: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80' },
              { t: 'Controle de Equipes', i: Users, img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80' },
            ].map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                 <div className="h-48 md:h-56 overflow-hidden relative">
                    <img src={f.img} alt={f.t} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                 </div>
                 <div className="p-8 md:p-10">
                    <div className="p-4 md:p-5 rounded-xl md:rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 w-fit mb-6 md:mb-8 shadow-sm"><f.i size={24} className="md:size-28" /></div>
                    <h4 className="text-lg md:text-xl font-black italic uppercase tracking-tight leading-snug">{f.t}</h4>
                 </div>
              </div>
            ))}
         </div>
      </section>

      <section className="py-20 md:py-32 px-4 md:px-6">
         <div className="max-w-6xl mx-auto p-8 md:p-24 rounded-[3rem] md:rounded-[5rem] bg-indigo-600 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-12 md:gap-16 shadow-[0_40px_100px_-20px_rgba(79,70,229,0.4)]">
            <div className="absolute top-0 right-0 w-full h-full"><img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover opacity-15 mix-blend-overlay" /></div>
            <div className="flex-1 relative z-10 space-y-8 md:space-y-10 text-center md:text-left">
               <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight md:leading-snug">
                  "Se o {branding.appName} gerar uma única venda, <span className="text-yellow-400">ele já se paga com sobra.</span>"
               </h2>
               <p className="text-lg md:text-xl font-bold text-indigo-100 uppercase tracking-[0.2em] italic leading-relaxed">O resto é lucro líquido, escala e controle total.</p>
            </div>
            <div className="w-64 h-64 md:w-80 md:h-80 bg-white/15 rounded-[3rem] md:rounded-[4rem] backdrop-blur-xl border-2 md:border-4 border-white/30 flex flex-col items-center justify-center p-6 md:p-10 text-center relative z-10 shrink-0">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-400 rounded-full flex items-center justify-center text-indigo-900 shadow-2xl mb-6 md:mb-8 animate-pulse"><Star size={32} className="md:size-40" fill="currentColor"/></div>
               <p className="font-black italic uppercase text-lg md:text-xl tracking-tight leading-none">ROI MASTER</p>
               <p className="text-[8px] md:text-[10px] font-black uppercase opacity-70 mt-2 md:mt-3 tracking-widest">Tecnologia Validada</p>
            </div>
         </div>
      </section>

      <section id="precos" className="py-20 md:py-32 px-6 bg-slate-50/20 dark:bg-slate-900/10">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center mb-16 md:mb-24 text-center">
               <h2 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter mb-8 md:mb-12 leading-tight md:leading-snug text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Planos que crescem com <br className="hidden md:block"/> seu negócio Master</h2>
               <div className="bg-white dark:bg-slate-900 p-2 md:p-2.5 rounded-full flex relative border-2 border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-sm sm:w-auto">
                  <button onClick={() => setBillingCycle('monthly')} className={`relative z-10 px-6 sm:px-12 py-3 sm:py-4 rounded-full text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all flex-1 sm:flex-none ${billingCycle === 'monthly' ? 'text-indigo-600' : 'text-slate-500'}`}>Mensal</button>
                  <button onClick={() => setBillingCycle('annual')} className={`relative z-10 px-6 sm:px-12 py-3 sm:py-4 rounded-full text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all flex-1 sm:flex-none ${billingCycle === 'annual' ? 'text-indigo-600' : 'text-slate-500'}`}>Anual <span className="text-emerald-500 sm:inline hidden">(20% OFF)</span><span className="text-emerald-500 sm:hidden">(-20%)</span></button>
                  <div className={`absolute top-2 bottom-2 md:top-2.5 md:bottom-2.5 bg-slate-100 dark:bg-slate-800 rounded-full shadow-lg transition-all duration-500 w-[calc(50%-8px)] md:w-[calc(50%-10px)] ${billingCycle === 'monthly' ? 'left-2 md:left-2.5' : 'left-[calc(50%+6px)] md:left-[calc(50%+5px)]'}`}></div>
               </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 items-stretch">
               {plans.map((plan, i) => {
                  const displayMonthly = billingCycle === 'annual' ? Math.floor(plan.annualTotal / 12) : plan.monthlyPrice;
                  return (
                    <div key={i} className={`flex flex-col p-10 md:p-14 rounded-[3rem] md:rounded-[4rem] border-2 transition-all relative ${plan.popular ? 'bg-slate-900 text-white border-slate-900 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] lg:scale-105 z-10' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-indigo-400 shadow-xl'}`}>
                       {plan.popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-8 md:px-10 py-2.5 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] shadow-2xl border-4 border-slate-900">⭐ MAIS VENDIDO</div>}
                       {billingCycle === 'annual' && <div className="absolute top-8 right-8 md:top-10 md:right-10 bg-emerald-500/20 text-emerald-500 px-3 md:px-4 py-1.5 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-emerald-500/30">Economize 20%</div>}
                       
                       <div className="mb-10 md:mb-12 pt-4 lg:pt-0"><h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight mb-2 md:mb-3 leading-none">{plan.name}</h3><p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-tight ${plan.popular ? 'text-indigo-400' : 'text-indigo-600'}`}>{plan.tagline}</p></div>
                       
                       <div className="mb-6 md:mb-8">
                          <div className="flex items-baseline gap-1.5">
                             <span className="text-4xl md:text-5xl font-black tracking-tighter italic leading-none">R$ {displayMonthly}</span>
                             <span className="text-[9px] md:text-[10px] font-bold uppercase opacity-60 tracking-widest">/mês*</span>
                          </div>
                          {billingCycle === 'annual' && (
                             <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Equivalente a R$ {plan.annualTotal} anual</p>
                          )}
                       </div>

                       <div className="mb-10 md:mb-12 p-4 md:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[1.8rem] md:rounded-3xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase leading-relaxed tracking-wider italic">👉 {plan.description}</p>
                       </div>

                       <div className="space-y-5 md:space-y-6 mb-12 md:mb-16 flex-1">
                          {plan.features.map(f => (<div key={f} className="flex items-center gap-3 md:gap-4"><CheckCircle size={18} className={`md:size-20 shrink-0 ${plan.popular ? 'text-emerald-400' : 'text-indigo-600'}`} /><span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-90">{f}</span></div>))}
                       </div>
                       <button onClick={() => handleOpenCheckout(plan)} className={`w-full py-6 md:py-7 rounded-[1.8rem] md:rounded-[2rem] font-black uppercase text-[10px] md:text-xs tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-2xl ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white'}`}>
                          {plan.cta}
                       </button>
                    </div>
                  );
               })}
            </div>
         </div>
      </section>

      <section id="faq" className="py-20 md:py-32 px-6 bg-slate-100/80 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
         <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center mb-16 md:mb-24 space-y-4">
              <div className="px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                Central de Dúvidas
              </div>
              <h2 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter leading-tight md:leading-snug">
                FAQ e Objeções <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Master Authority</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">Tudo o que você precisa saber antes de escalar sua operação</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
               {faqs.map((f, i) => (
               <div key={i} className={`group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white dark:border-slate-800 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_40px_100px_-20px_rgba(79,70,229,0.15)] hover:-translate-y-1`}>
                  <button onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)} className="w-full px-6 md:px-10 py-8 md:py-10 flex items-center justify-between text-left group">
                     <div className="flex items-center gap-4 md:gap-5">
                        <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all shrink-0 ${openFaqIndex === i ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-indigo-600'}`}>
                           {React.createElement(f.icon, { size: 20 })}
                        </div>
                        <span className="font-black uppercase tracking-tight text-xs md:text-sm italic group-hover:text-indigo-600 transition-colors leading-snug max-w-[200px] sm:max-w-xs">{f.q}</span>
                     </div>
                     <div className={`p-1.5 md:p-2 rounded-full transition-all shrink-0 ${openFaqIndex === i ? 'rotate-180 bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                           <ChevronDown size={16} md:size={18} />
                     </div>
                  </button>
                  {openFaqIndex === i && (
                     <div className="px-6 md:px-10 pb-8 md:pb-10 animate-in slide-in-from-top-4">
                           <div className="h-px bg-indigo-100 dark:bg-slate-800 mb-6 md:mb-8"></div>
                           <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-widest italic">{f.a}</p>
                     </div>
                  )}
               </div>
               ))}
            </div>

            <div className="mt-16 md:mt-20 p-8 md:p-10 bg-indigo-600 rounded-[2.5rem] md:rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
               <ShieldQuestion size={180} className="absolute -right-10 -bottom-10 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
               <div className="relative z-10 text-center md:text-left">
                  <h4 className="text-xl md:text-2xl font-black italic uppercase tracking-tight">Ainda tem dúvidas Master?</h4>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mt-1">Nossos consultores estão prontos para analisar sua operação.</p>
               </div>
               <button className="relative z-10 px-8 md:px-10 py-4 md:py-5 bg-white text-indigo-600 font-black rounded-2xl shadow-xl hover:bg-indigo-50 transition-all text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-3">
                  <Headphones size={18} /> Falar com Especialista
               </button>
            </div>
         </div>
      </section>

      <section className="py-24 md:py-44 px-6 bg-slate-950 text-white text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-indigo-600/10 blur-[200px] md:blur-[250px] rounded-full"></div>
         <div className="max-w-4xl mx-auto relative z-10 space-y-10 md:space-y-14">
            <h2 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter leading-tight md:leading-snug">Comece a vender melhor pelo <br className="hidden md:block"/> WhatsApp <span className="text-indigo-500">agora mesmo.</span></h2>
            <div className="space-y-8 md:space-y-10">
               <button onClick={() => scrollToSection('precos')} className="px-10 md:px-16 py-6 md:py-8 bg-indigo-600 text-white rounded-[2.2rem] md:rounded-[2.8rem] font-black uppercase tracking-[0.25em] md:tracking-[0.35em] text-xs md:text-sm shadow-[0_20px_80px_-15px_rgba(79,70,229,0.5)] hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 border-2 border-white/10">👉 Ativar minha conta Master</button>
               <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] opacity-80 leading-relaxed">Sincronização imediata. Leva menos de 5 minutos.</p>
            </div>
         </div>
      </section>

      <footer className="py-16 md:py-24 px-8 md:px-10 bg-slate-950 text-white border-t border-white/5">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 md:gap-14 opacity-60 group hover:opacity-100 transition-opacity duration-700">
            <ZLogoHero branding={branding} /> 
            <div className="flex gap-6 md:gap-10 text-white opacity-40"><ShieldCheck size={24} md:size={28} /><CreditCard size={24} md:size={28} /><QrCode size={24} md:size={28} /></div>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.25em] text-slate-500 leading-relaxed text-center md:text-right">© 2024 {branding.appName} SaaS Authority. <br className="hidden md:block"/> Checkout Blindado Mercado Pago Master.</p>
         </div>
      </footer>
    </div>
  );
};
