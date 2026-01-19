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
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const src = branding.fullLogo; // Consome o logotipo horizontal configurado

  return (
    <div className={`flex items-center py-2 ${className}`}>
      {src && status !== 'error' ? (
        <img 
          key={src} 
          src={src} 
          alt={branding.appName} 
          className={`h-8 md:h-12 w-auto object-contain force-logo-display transition-all duration-500 ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`}
          onError={() => setStatus('error')}
          onLoad={() => setStatus('success')}
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
    { id: 'start', name: 'COMEÇAR', tagline: 'Quero parar de perder lead e começar a vender.', description: 'Ideal para quem quer organizar os primeiros atendimentos e gerar vendas no WhatsApp.', monthlyPrice: 97, annualTotal: 931, features: ['CRM Kanban Visual', 'Inbox com IA Básica', 'Classificação Automática', 'Até 1.000 Leads/mês'], cta: 'QUERO COMEÇAR', color: 'from-blue-600 to-indigo-600' },
    { id: 'growth', name: 'VENDER MAIS', tagline: 'Já vendo, mas quero vender todo dia.', description: 'Automação, follow-up e IA para aumentar conversão e previsibilidade.', monthlyPrice: 197, annualTotal: 1891, features: ['Tudo do Começar', 'Follow-ups Automáticos', 'IA de Agendamento Ativa', 'Campanhas Segmentadas'], cta: 'VENDER TODO DIA', popular: true, color: 'from-indigo-600 to-purple-600' },
    { id: 'scale', name: 'ESCALAR', tagline: 'Tenho equipe. Quero controle e crescimento.', description: 'Ideal para times, múltiplas unidades e operação estruturada.', monthlyPrice: 397, annualTotal: 3811, features: ['Tudo do Vender Mais', 'Gestão Multi-unidade', 'BI de Vendas Master', 'Automações Avançadas'], cta: 'ESCALAR AGORA', color: 'from-slate-800 to-slate-950' }
  ];

  const faqs = [
    { q: 'Preciso de equipe técnica ou VPS própria?', a: 'Não. O Z-Prospector é uma plataforma SaaS Master pronta para uso. Toda a complexidade de servidores e infraestrutura fica por nossa conta.', icon: Code2 },
    { q: 'Funciona com WhatsApp oficial ou não oficial?', a: 'O sistema é versátil: você pode conectar via Cloud API (Oficial) ou Evolution VPS (Sincronização), garantindo máxima estabilidade.', icon: MessageSquare },
    { q: 'Como funciona o cancelamento?', a: 'Liberdade total. Você pode cancelar sua assinatura master a qualquer momento direto pelo painel, sem taxas escondidas ou fidelidade.', icon: Ban },
    { q: 'Meus dados estão protegidos entre as unidades?', a: 'Sim. Utilizamos arquitetura multi-tenant rigorosa. Cada empresa/unidade tem isolamento total de banco de dados e leads.', icon: ShieldCheck },
    { q: 'A IA realmente entende gírias e áudios?', a: 'Sim! Utilizamos modelos avançados do Gemini que processam linguagem natural, gírias regionais e até intenções complexas em áudio.', icon: Brain },
    { q: 'O pagamento é via Mercado Pago?', a: 'Exatamente. Utilizamos o Checkout Blindado do Mercado Pago para sua total segurança e liberação imediata do acesso.', icon: CreditCard }
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
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[150] bg-white dark:bg-slate-950 animate-in fade-in flex flex-col p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-12"><ZLogoHero branding={branding} /><button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500"><X size={24} /></button></div>
          <div className="flex flex-col gap-6 flex-1">{['Recursos', 'Preços', 'FAQ'].map(item => (<button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white text-left py-4 border-b border-slate-100 dark:border-slate-800">{item}</button>))}
            <div className="pt-8 space-y-6"><button onClick={toggleTheme} className="w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-black uppercase text-xs tracking-widest">{isDarkMode ? 'Tema Escuro Ativo' : 'Tema Claro Ativo'}{isDarkMode ? <Moon size={20} className="text-yellow-400" /> : <Sun size={20} className="text-indigo-600" />}</button><button onClick={() => { setIsMobileMenuOpen(false); if (onLogin) onLogin(); }} className="w-full py-7 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl text-xs">Acesso Master</button></div>
          </div>
          <div className="mt-auto pt-10 text-center"><p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">SaaS Authority • v3.0</p></div>
        </div>
      )}

      {isCheckoutOpen && selectedPlan && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-slate-950/95 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] shadow-2xl p-12 border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-30 text-slate-400"><X size={24} /></button>
            <div className="w-full md:w-2/5 p-8 md:p-12 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-3 mb-10"><div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><ShoppingCart size={20} /></div><h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Checkout Master</h4></div>
               <div className="space-y-6"><div><h3 className="text-2xl font-black italic uppercase tracking-tight">{selectedPlan.name}</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{billingCycle === 'annual' ? 'Acesso Anual (20% OFF)' : 'Acesso Mensal'}</p></div><div className="pt-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</p><h2 className="text-4xl font-black tracking-tighter text-indigo-600">R$ {billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.annualTotal},00</h2></div></div>
            </div>
            <div className="flex-1 p-8 md:p-12 relative overflow-y-auto max-h-[90vh]">
               {checkoutStep === 'register' && (<div className="space-y-8 animate-in slide-in-from-right-4"><div><h3 className="text-2xl font-black italic uppercase tracking-tight">Dados de Acesso</h3><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sua conta será ativada neste e-mail</p></div><form onSubmit={handleRegister} className="space-y-5"><div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">E-mail para Login</label><input required type="email" value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} placeholder="email@exemplo.com" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold shadow-sm" /></div><div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-widest">WhatsApp de Confirmação</label><input required value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} placeholder="11 99999-9999" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold shadow-sm" /></div><button type="submit" disabled={isProcessing} className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl hover:bg-indigo-700 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-3">{isProcessing ? <Loader2 className="animate-spin" /> : <ArrowRight size={18} />} Próximo Passo</button></form></div>)}
               {checkoutStep === 'payment' && (<div className="space-y-8 animate-in slide-in-from-right-4"><div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit"><button onClick={() => setPaymentMethod('pix')} className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'pix' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xl' : 'text-slate-400'}`}><QrCode size={16} /> Pix Imediato</button><button onClick={() => setPaymentMethod('card')} className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'card' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xl' : 'text-slate-400'}`}><CreditCard size={16} /> Cartão Master</button></div>{paymentMethod === 'pix' ? (<div className="flex flex-col md:flex-row items-center gap-8 bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/50"><div className="bg-white p-4 rounded-2xl shadow-inner border-4 border-white"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=mercadopago_${userData.email}`} alt="QR Pix" className="w-32 h-32" /></div><div className="space-y-4 text-left"><h5 className="text-sm font-black italic uppercase">Pague via Pix</h5><p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed tracking-widest">Liberação automática em segundos.</p></div></div>) : (<div className="space-y-5"><input placeholder="Número do Cartão" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold shadow-sm" /><div className="grid grid-cols-2 gap-4"><input placeholder="MM/AA" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold shadow-sm" /><input placeholder="CVV" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold shadow-sm" /></div></div>)}<button onClick={handlePaymentConfirm} disabled={isProcessing} className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-3">{isProcessing ? <Loader2 className="animate-spin" /> : <Lock size={18} />} Confirmar e Ativar</button></div>)}
               {checkoutStep === 'success' && (<div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in"><div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl animate-bounce"><Check size={48} strokeWidth={4} /></div><div className="space-y-4"><h3 className="text-3xl font-black italic uppercase tracking-tight">Ativação Concluída!</h3><p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Acesso liberado para Email e WhatsApp.</p></div></div>)}
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 text-center text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 z-[100] shadow-xl flex justify-center items-center gap-4"><span className="flex items-center gap-2"><Flame size={14} className="text-yellow-400 animate-pulse"/> OFERTA EXCLUSIVA:</span><span className="font-mono text-yellow-300">{timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}</span></div>

      <nav className="sticky top-12 mx-4 md:mx-10 z-[90] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg px-6 md:px-8 py-4 md:py-5 flex justify-between items-center transition-all animate-in slide-in-from-top-4">
        <ZLogoHero branding={branding} />
        <div className="hidden lg:flex items-center gap-8">{['Recursos', 'Preços', 'FAQ'].map(item => (<button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">{item}</button>))}<button onClick={toggleTheme} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 dark:text-yellow-400 transition-all hover:scale-110">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button><button onClick={onLogin} className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">Acesso Master</button></div>
        <div className="flex lg:hidden items-center gap-3"><button onClick={toggleTheme} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-yellow-400">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button><button onClick={() => setIsMobileMenuOpen(true)} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg"><MenuIcon size={22} /></button></div>
      </nav>

      <section id="hero" className="pt-16 md:pt-24 pb-20 md:pb-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 md:gap-24">
          <div className="flex-1 space-y-8 md:space-y-10 text-center lg:text-left"><div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 shadow-sm"><Zap size={14} /> WhatsApp no Piloto Automático</div><h1 className="text-3xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter leading-tight md:leading-snug">Transforme conversas no WhatsApp em <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">vendas todos os dias</span> — com IA.</h1><p className="text-base md:text-lg lg:text-xl text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-2xl italic tracking-wide">Capte leads, organize seu funil, faça follow-up automático e feche mais negócios sem depender de planilhas.</p><div className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-4 md:pt-6"><button onClick={() => scrollToSection('precos')} className="px-10 md:px-12 py-5 md:py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.8rem] md:rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-xs md:text-sm">👉 Começar agora <ArrowRight size={20} /></button></div></div>
          <div className="flex-1 relative w-full lg:w-auto animate-in slide-in-from-right-10 duration-1000 mt-12 lg:mt-0"><div className="absolute inset-0 bg-indigo-500/10 blur-[100px] md:blur-[140px] rounded-full"></div><div className="relative"><div className="bg-white dark:bg-slate-900 p-2 md:p-2.5 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] border-2 md:border-4 border-slate-100 dark:border-slate-800 overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-all duration-1000"><img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070" alt="Dashboard" className="w-full min-h-[300px] md:min-h-[450px] object-cover object-top rounded-[1.8rem] md:rounded-[2rem]" /><div className="absolute top-6 md:top-12 -left-4 md:-left-12 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-white/20 w-48 md:w-64 animate-bounce-slow"><div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4"><div className="w-7 h-7 md:w-9 md:h-9 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg"><Bot size={14} className="text-white md:size-18"/></div><span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-indigo-600">IA Qualificando...</span></div><p className="text-[9px] md:text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic uppercase">"Identifiquei interesse imediato. Deseja enviar link de checkout?"</p></div></div></div></div>
        </div>
      </section>

      {/* Footer com fix para erros de props inválidas no Lucide */}
      <footer className="py-16 md:py-24 px-8 md:px-10 bg-slate-950 text-white border-t border-white/5">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 md:gap-14 opacity-60 group hover:opacity-100 transition-opacity duration-700">
            <ZLogoHero branding={branding} /> 
            {/* Fix: Usando classes CSS para dimensionamento responsivo em vez de props inválidas */}
            <div className="flex gap-6 md:gap-10 text-white opacity-40"><ShieldCheck className="w-6 h-6 md:w-7 md:h-7" /><CreditCard className="w-6 h-6 md:w-7 md:h-7" /><QrCode className="w-6 h-6 md:w-7 md:h-7" /></div>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.25em] text-slate-500 leading-relaxed text-center md:text-right">© 2024 {branding.appName} SaaS Authority. <br className="hidden md:block"/> Checkout Blindado Master.</p>
         </div>
      </footer>
    </div>
  );
};