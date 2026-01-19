
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
  // Fix: Added missing icons
  RefreshCcw, Building2
} from 'lucide-react';
import { BrandingConfig } from '../types';

interface OfferPageProps {
  branding: BrandingConfig;
  onLogin?: () => void;
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

  const plans = [
    { id: 'start', name: 'COMEÇAR', tagline: 'Ideal para iniciantes.', monthlyPrice: 97, annualTotal: 931, features: ['CRM Kanban Visual', 'Inbox com IA Básica', 'Até 1.000 Leads/mês'], cta: 'QUERO COMEÇAR', color: 'indigo' },
    { id: 'growth', name: 'VENDER MAIS', tagline: 'O mais vendido.', monthlyPrice: 197, annualTotal: 1891, features: ['Tudo do Começar', 'Follow-ups Automáticos', 'IA de Agendamento Ativa'], cta: 'VENDER TODO DIA', popular: true, color: 'violet' },
    { id: 'scale', name: 'ESCALAR', tagline: 'Poder total.', monthlyPrice: 397, annualTotal: 3811, features: ['Tudo do Vender Mais', 'Gestão Multi-unidade', 'BI de Vendas Master'], cta: 'ESCALAR AGORA', color: 'slate' }
  ];

  const faqs = [
    { q: 'Preciso de equipe técnica?', a: 'Não. O Z-Prospector é 100% pronto para uso.', icon: Code2 },
    { q: 'Funciona com WhatsApp oficial?', a: 'Sim, suportamos Cloud API e conexões VPS.', icon: MessageSquare },
    { q: 'Como funciona o cancelamento?', a: 'Livre. Cancele quando quiser pelo painel.', icon: Ban },
    { q: 'Meus dados estão seguros?', a: 'Sim, isolamento total por unidade (Multi-tenant).', icon: ShieldCheck }
  ];

  const handleOpenCheckout = (plan: any) => {
    setSelectedPlan(plan);
    setCheckoutStep('register');
    setIsCheckoutOpen(true);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      
      {/* Barra de Urgência */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 text-center text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 z-[100] shadow-xl flex justify-center items-center gap-4">
        <span className="flex items-center gap-2"><Flame size={14} className="text-yellow-400 animate-pulse"/> OFERTA EXCLUSIVA:</span>
        <span className="font-mono text-yellow-300">{timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}</span>
      </div>

      {/* Navegação */}
      <nav className="sticky top-12 mx-4 md:mx-10 z-[90] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg px-8 py-5 flex justify-between items-center">
        <ZLogoHero branding={branding} />
        <div className="hidden lg:flex items-center gap-8">
          {['recursos', 'precos', 'faq'].map(item => (
            <button key={item} onClick={() => scrollToSection(item)} className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">
              {item === 'precos' ? 'Preços' : item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
          <button onClick={onLogin} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">Entrar</button>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-xl"><MenuIcon size={24}/></button>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-24">
          <div className="flex-1 space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800"><Zap size={14} /> WhatsApp no Piloto Automático</div>
            <h1 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-tight">Venda todo dia no <br/><span className="text-indigo-600">WhatsApp com IA</span></h1>
            <p className="text-xl text-slate-500 font-bold leading-relaxed max-w-2xl italic uppercase tracking-wide">A primeira plataforma SaaS Master que qualifica leads e agenda vendas enquanto você dorme.</p>
            <button onClick={() => scrollToSection('precos')} className="px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all hover:scale-105 flex items-center justify-center gap-3 text-sm">Quero Escalar Agora <ArrowRight size={20} /></button>
          </div>
          <div className="flex-1 relative"><img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070" className="rounded-[3rem] shadow-2xl border-4 border-slate-100 dark:border-slate-800 rotate-2" alt="Dashboard"/></div>
        </div>
      </section>

      {/* Seção de Recursos */}
      <section id="recursos" className="py-32 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
             <h2 className="text-4xl font-black italic uppercase tracking-tight mb-4">Poder de <span className="text-indigo-600">Autoridade Master</span></h2>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Tudo o que você precisa para dominar o mercado</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { title: 'Qualificação Neural', desc: 'IA que separa curiosos de compradores reais em segundos.', icon: Brain, color: 'indigo' },
              { title: 'CRM Kanban Master', desc: 'Arraste e solte leads no seu funil de vendas visual.', icon: LayoutDashboard, color: 'violet' },
              { title: 'Follow-up Eterno', desc: 'A IA persegue o lead até ele responder ou comprar.', icon: RefreshCcw, color: 'emerald' },
              { title: 'Agendamento IA', desc: 'Extração automática de horários direto da conversa.', icon: Calendar, color: 'pink' },
              { title: 'Multi-unidade', desc: 'Gerencie infinitas filiais ou franquias num só lugar.', icon: Building2, color: 'blue' },
              { title: 'Relatórios ROI', desc: 'BI completo para saber exatamente de onde vem o lucro.', icon: BarChart, color: 'orange' }
            ].map((res, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-2xl transition-all group">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-${res.color}-50 text-${res.color}-600 group-hover:rotate-12 transition-transform shadow-sm`}>
                  <res.icon size={32} />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tight mb-4">{res.title}</h3>
                <p className="text-sm font-bold text-slate-500 uppercase leading-relaxed tracking-widest italic">{res.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Preços */}
      <section id="precos" className="py-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-10">Escolha sua <span className="text-indigo-600">Velocidade</span></h2>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-2 rounded-[2rem] w-fit mx-auto mb-20">
            <button onClick={() => setBillingCycle('monthly')} className={`px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xl' : 'text-slate-400'}`}>Mensal</button>
            <button onClick={() => setBillingCycle('annual')} className={`px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === 'annual' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xl' : 'text-slate-400'}`}>Anual (20% OFF)</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {plans.map(plan => (
              <div key={plan.id} className={`relative p-12 rounded-[4rem] border-2 transition-all flex flex-col items-center ${plan.popular ? 'border-indigo-600 bg-indigo-50/20 shadow-2xl scale-105 z-10' : 'border-slate-100 dark:border-slate-800'}`}>
                {plan.popular && <span className="absolute -top-5 bg-indigo-600 text-white px-8 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">Mais Vendido</span>}
                <h3 className="text-3xl font-black italic uppercase tracking-tight mb-2">{plan.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 italic">{plan.tagline}</p>
                <div className="flex items-baseline gap-2 mb-10">
                  <span className="text-xs font-black text-slate-400">R$</span>
                  <h4 className="text-6xl font-black tracking-tighter tabular-nums italic">{billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.annualTotal/12)}</h4>
                  <span className="text-xs font-bold text-slate-400 uppercase">/mês</span>
                </div>
                <div className="space-y-4 w-full mb-12">
                   {plan.features.map((f, i) => <div key={i} className="flex items-center gap-3 text-xs font-black uppercase text-slate-500 tracking-tight"><CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> {f}</div>)}
                </div>
                <button onClick={() => handleOpenCheckout(plan)} className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-105 ${plan.popular ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}>{plan.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção de FAQ */}
      <section id="faq" className="py-32 bg-slate-50 dark:bg-slate-900/50">
         <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl font-black italic uppercase tracking-tight text-center mb-20">Dúvidas <span className="text-indigo-600">Frequentes</span></h2>
            <div className="space-y-6">
               {faqs.map((faq, i) => (
                 <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <button onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)} className="w-full p-8 flex items-center justify-between text-left group">
                       <div className="flex items-center gap-6">
                          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><faq.icon size={20}/></div>
                          <span className="font-black italic uppercase text-sm tracking-tight">{faq.q}</span>
                       </div>
                       <ChevronDown className={`transition-transform duration-300 ${openFaqIndex === i ? 'rotate-180 text-indigo-600' : 'text-slate-300'}`} />
                    </button>
                    {openFaqIndex === i && <div className="px-24 pb-10 animate-in slide-in-from-top-4"><p className="text-sm font-bold text-slate-500 uppercase leading-relaxed italic tracking-widest">{faq.a}</p></div>}
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Novo CTA Master Final */}
      <section className="py-32 px-6">
         <div className="max-w-7xl mx-auto bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[5rem] p-12 md:p-32 text-center text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(79,70,229,0.5)]">
            <Sparkles className="absolute -top-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
            <Trophy className="absolute -bottom-10 -left-10 w-48 h-48 text-white/5 -rotate-12" />
            <div className="relative z-10 space-y-10">
               <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-tight">Pronto para assumir a <br/><span className="text-yellow-400">Autoridade do Mercado?</span></h2>
               <p className="text-lg md:text-2xl font-bold opacity-80 uppercase tracking-widest italic max-w-4xl mx-auto">Sua unidade master está a um clique de distância da automação total.</p>
               <button onClick={() => scrollToSection('precos')} className="px-16 py-8 bg-white text-indigo-900 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm md:text-lg shadow-2xl hover:bg-yellow-400 hover:scale-110 transition-all flex items-center justify-center gap-4 mx-auto group">
                 Ativar Minha Licença Master <ArrowRight className="group-hover:translate-x-3 transition-transform" />
               </button>
               <div className="flex flex-wrap justify-center gap-10 pt-10 opacity-60">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><ShieldCheck size={20}/> Checkout Blindado</div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><CreditCard size={20}/> Liberação Imediata</div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Bot size={20}/> Setup IA Incluso</div>
               </div>
            </div>
         </div>
      </section>

      {/* Rodapé Master Colorido */}
      <footer className="pt-32 pb-16 px-6 bg-slate-950 text-white relative overflow-hidden border-t border-white/5">
         <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-gradient-to-t from-indigo-600/20 via-purple-600/10 to-transparent blur-[120px] pointer-events-none"></div>
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-32">
               <div className="space-y-8">
                  <ZLogoHero branding={branding} />
                  <p className="text-xs font-bold text-slate-500 uppercase leading-relaxed tracking-widest italic">{branding.appName} is the world-leading SDR automation platform. Driven by neural algorithms at clikai.com.br.</p>
                  <div className="flex gap-4">
                     {['facebook', 'instagram', 'linkedin'].map(social => <div key={social} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 hover:border-indigo-500 transition-all cursor-pointer"><Globe2 size={20} className="text-slate-400" /></div>)}
                  </div>
               </div>
               <div className="space-y-8">
                  <h4 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-500">Links Master</h4>
                  <ul className="space-y-4">
                     {['Recursos', 'Preços', 'FAQ', 'API Docs'].map(l => <li key={l} className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors cursor-pointer">{l}</li>)}
                  </ul>
               </div>
               <div className="space-y-8">
                  <h4 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-500">Legal Core</h4>
                  <ul className="space-y-4">
                     {['Termos de Uso', 'Privacidade', 'Cookies', 'Compliance'].map(l => <li key={l} className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors cursor-pointer">{l}</li>)}
                  </ul>
               </div>
               <div className="space-y-8">
                  <h4 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-500">Status da Rede</h4>
                  <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Todos Sistemas Online</span>
                     </div>
                     <p className="text-[9px] font-bold text-slate-500 uppercase italic">Uptime Global: 99.98% • clikai.com.br</p>
                  </div>
               </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-10 pt-16 border-t border-white/10 opacity-40">
               <p className="text-[10px] font-black uppercase tracking-[0.3em]">© 2024 {branding.appName} SaaS Authority • All Rights Reserved.</p>
               <div className="flex gap-10">
                  <ShieldCheck size={28} />
                  <CreditCard size={28} />
                  <QrCode size={28} />
               </div>
            </div>
         </div>
      </footer>

      {/* Modal de Checkout (Mantido para integridade) */}
      {isCheckoutOpen && selectedPlan && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-slate-950/95 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] shadow-2xl p-12 border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-30 text-slate-400"><X size={24} /></button>
            <div className="w-full md:w-2/5 p-12 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-center">
               <h3 className="text-3xl font-black italic uppercase tracking-tight">{selectedPlan.name}</h3>
               <p className="text-4xl font-black tracking-tighter text-indigo-600 mt-6 italic">R$ {billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.annualTotal},00</p>
            </div>
            <div className="flex-1 p-12 overflow-y-auto">
               <h3 className="text-2xl font-black italic uppercase tracking-tight mb-8">Dados de Acesso Master</h3>
               <input placeholder="E-mail de Login" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold mb-6" />
               <input placeholder="WhatsApp de Confirmação" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold mb-10" />
               <button onClick={() => setCheckoutStep('success')} className="w-full py-7 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-2xl uppercase text-xs tracking-widest">Finalizar Ativação</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
