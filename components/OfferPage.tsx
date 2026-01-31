
import React, { useState, useEffect } from 'react';
import { 
  Rocket, TrendingUp, Check, 
  Lock, X, CheckCircle2,
  Brain, Target, Calendar,
  Loader2, Mail, Menu as MenuIcon, 
  Wallet, Eye, EyeOff, PlayCircle,
  MessageSquare, Filter, Bot, RefreshCcw, History
} from 'lucide-react';
import { BrandingConfig } from '../types';

interface OfferPageProps {
  branding: BrandingConfig;
  onLogin: () => void;
  onActivationSuccess?: (email: string) => void;
}

// Logo Component - Optimized for Context (Light/Dark backgrounds)
const ZLogoHero: React.FC<{ branding: BrandingConfig, className?: string, forceTheme?: 'dark' | 'light' }> = ({ branding, className = "", forceTheme }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  
  // Se forceTheme for 'dark', usamos a logo clara (para fundo escuro). 
  // Se não, usa a lógica padrão ou branding.
  const logoSrc = forceTheme === 'dark' 
    ? (branding.fullLogoDark || branding.fullLogo) 
    : (branding.fullLogo || branding.fullLogoDark);

  return (
    <div className={`flex items-center py-2 ${className}`}>
      <img 
        src={logoSrc} 
        alt={branding.appName} 
        className={`h-8 md:h-12 w-auto object-contain force-logo-display transition-all duration-500 ${status === 'loading' ? 'opacity-0' : 'opacity-100'} drop-shadow-lg`}
        onError={() => setStatus('error')}
        onLoad={() => setStatus('success')}
      />
      {status === 'error' && (
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/50">{branding.appName.charAt(0)}</div>
          <span className={`text-xl md:text-2xl font-black italic uppercase tracking-tighter ${forceTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{branding.appName}</span>
        </div>
      )}
    </div>
  );
};

export const OfferPage: React.FC<OfferPageProps> = ({ branding, onLogin }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  
  // LOGIN MODAL STATE
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // MOBILE MENU STATE
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMobileMenuOpen]);

  const handleOpenLogin = () => {
    setIsLoginModalOpen(true);
    setIsMobileMenuOpen(false); 
    setLoginError(null);
  };

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

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
      monthlyPrice: 97, 
      annualTotal: 931, // (97 * 12) * 0.8
      features: ['CRM Kanban Ilimitado', 'Central de Conversas', 'Até 1 Usuário', 'Dashboard Básico'], 
      cta: 'COMEÇAR AGORA', 
      color: 'indigo', 
      popular: false
    },
    { 
      id: 'growth', 
      name: 'Avançado', 
      tagline: 'Para quem quer ritmo constante.', 
      monthlyPrice: 197, 
      annualTotal: 1891, // (197 * 12) * 0.8
      features: ['Automação de WhatsApp (IA)', 'Recuperação de Vendas', 'Até 5 Usuários', 'Suporte Prioritário'], 
      cta: 'ESCOLHA RECOMENDADA', 
      popular: true, 
      color: 'violet', 
    },
    { 
      id: 'scale', 
      name: 'Franquia', 
      tagline: 'Para redes e alta escala.', 
      monthlyPrice: 497, 
      annualTotal: 4771, // (497 * 12) * 0.8
      features: ['Multi-tenant (Filiais)', 'API e Webhooks (N8n)', 'Usuários Ilimitados', 'Gerente de Contas'], 
      cta: 'FALAR COM CONSULTOR', 
      color: 'slate', 
      popular: false
    }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        setIsMobileMenuOpen(false);
        // Small delay to allow menu close animation
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      
      {/* MODAL DE LOGIN */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[500] bg-slate-950/90 backdrop-blur-3xl flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_100px_rgba(99,102,241,0.3)] overflow-hidden relative animate-in zoom-in-95 border border-white/20 dark:border-slate-800 flex flex-col">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-2xl transition-all z-10"
              >
                <X size={20} />
              </button>

              <div className="p-10 md:p-12 space-y-8">
                 <div className="text-center space-y-2">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">Acesso ao Sistema</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Entre com suas credenciais de proprietário</p>
                 </div>

                 <form onSubmit={handleAccess} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-widest">E-mail</label>
                       <div className="relative group">
                          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                          <input 
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="w-full pl-16 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-widest">Senha</label>
                       <div className="relative group">
                          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                          <input 
                            required
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-16 pr-16 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                             {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                          </button>
                       </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isAuthenticating}
                      className="w-full py-6 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 hover:scale-[1.02] transition-all uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                       {isAuthenticating ? <Loader2 className="animate-spin" size={20}/> : <Rocket size={20} />}
                       {isAuthenticating ? 'Validando...' : 'Entrar na Plataforma'}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[400] bg-slate-950/98 backdrop-blur-3xl flex flex-col p-8 animate-in slide-in-from-right-10 md:hidden overflow-y-auto">
           <div className="flex justify-between items-center mb-12">
              <ZLogoHero branding={branding} forceTheme="dark" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-white/10 rounded-2xl text-white hover:bg-rose-500/20 hover:text-rose-500 transition-all">
                 <X size={24} />
              </button>
           </div>
           
           <div className="flex flex-col gap-6 text-center mt-10">
              <button onClick={() => scrollToSection('metodo')} className="text-2xl font-black uppercase italic tracking-tighter text-white hover:text-indigo-500 transition-colors py-4 border-b border-white/5">O Método</button>
              <button onClick={() => scrollToSection('solucao')} className="text-2xl font-black uppercase italic tracking-tighter text-white hover:text-indigo-500 transition-colors py-4 border-b border-white/5">Solução</button>
              <button onClick={() => scrollToSection('precos')} className="text-2xl font-black uppercase italic tracking-tighter text-white hover:text-indigo-500 transition-colors py-4 border-b border-white/5">Planos</button>
              
              <button onClick={handleOpenLogin} className="mt-8 w-full py-6 bg-indigo-600 text-white font-black rounded-3xl uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all">
                 Acessar Sistema
              </button>
           </div>
        </div>
      )}

      {/* BLOCO 1: HERO SECTION */}
      <div className="bg-slate-950 relative overflow-hidden text-white border-b border-slate-800">
        {/* Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[70%] bg-violet-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>

        {/* MAIN NAVIGATION */}
        <nav className="relative z-50 px-6 py-6 max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex-shrink-0 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
             {/* Force Dark Theme Logo on Hero Section */}
             <ZLogoHero branding={branding} forceTheme="dark" />
          </div>
          
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 bg-white/5 backdrop-blur-sm px-8 py-3 rounded-full border border-white/10">
            <button onClick={() => scrollToSection('metodo')} className="text-[11px] font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors hover:scale-105 transform">O Método</button>
            <button onClick={() => scrollToSection('solucao')} className="text-[11px] font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors hover:scale-105 transform">Solução</button>
            <button onClick={() => scrollToSection('precos')} className="text-[11px] font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors hover:scale-105 transform">Planos</button>
          </div>

          {/* Desktop CTA & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button onClick={handleOpenLogin} className="hidden md:block px-8 py-3 bg-white text-indigo-900 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-0.5">
              Login Cliente
            </button>
            
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-3 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all">
               <MenuIcon size={24} />
            </button>
          </div>
        </nav>

        <section className="pt-16 pb-24 md:pt-24 md:pb-32 px-6 max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Nova Tecnologia v3.0 Liberada</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
                Transforme conversas em <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Receita Previsível.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Pare de perder vendas por falta de follow-up. Nossa IA automatiza o atendimento, qualifica leads e agenda reuniões enquanto você dorme.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <button onClick={() => scrollToSection('precos')} className="px-10 py-6 bg-white text-indigo-900 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all hover:scale-105 flex items-center justify-center gap-4 text-xs group">
                  <Rocket size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Quero Vender Mais
                </button>
                <button onClick={() => scrollToSection('metodo')} className="px-10 py-6 bg-transparent border border-white/20 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-3 text-xs">
                  <PlayCircle size={18} />
                  Ver Demonstração
                </button>
              </div>

              <div className="pt-8 flex items-center justify-center lg:justify-start gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                 <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[8px]">U{i}</div>)}
                 </div>
                 <p>+500 Empresas Escalando</p>
              </div>
            </div>

            <div className="flex-1 w-full relative perspective-1000">
              <div className="relative transform rotate-y-6 rotate-x-3 hover:rotate-0 transition-transform duration-700 ease-out">
                 <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur-2xl opacity-40 animate-pulse"></div>
                 <img 
                   src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070" 
                   className="rounded-[2rem] shadow-2xl border-4 border-slate-800 relative z-10 w-full object-cover" 
                   alt="Platform Dashboard"
                 />
                 
                 {/* Floating Elements */}
                 <div className="absolute -bottom-8 -left-8 bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-700 z-20 flex items-center gap-4 animate-bounce-slow hidden md:flex">
                    <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><TrendingUp size={24} /></div>
                    <div>
                       <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Conversão</p>
                       <h4 className="text-2xl font-black italic text-white">+148%</h4>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* BLOCO 2: A DOR (PROBLEMA) */}
      <section className="py-24 bg-white dark:bg-slate-900 relative">
         <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
               <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-6">
                  O problema não é o Lead. <br className="hidden md:block"/>
                  <span className="text-rose-600">É a falta de Processo.</span>
               </h2>
               <p className="text-lg font-medium text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
                  90% das empresas perdem vendas no "limbo" do atendimento. Se você demora para responder ou esquece de fazer follow-up, você está deixando dinheiro na mesa.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { title: 'Leads Esquecidos', desc: 'Aquele cliente que pediu orçamento e nunca mais recebeu um "oi".', icon: History, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/10' },
                 { title: 'Agenda Instável', desc: 'Dias lotados seguidos de dias vazios. Zero previsibilidade de receita.', icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10' },
                 { title: 'Caixa Montanha-Russa', desc: 'Você nunca sabe quanto vai entrar no final do mês com precisão.', icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
               ].map((item, i) => (
                 <div key={i} className={`p-10 rounded-[2.5rem] border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl ${item.bg}`}>
                    <div className={`w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                       <item.icon size={32} className={item.color}/>
                    </div>
                    <h3 className={`text-xl font-black uppercase italic tracking-tight ${item.color} mb-3`}>{item.title}</h3>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed opacity-90">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* BLOCO 3: O MÉTODO (FASES) */}
      <section id="metodo" className="py-24 bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800 scroll-mt-24">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 px-4 py-2 rounded-full">Metodologia Exclusiva</span>
               <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mt-8 text-slate-900 dark:text-white">O Ciclo de <span className="text-indigo-600">5 Fases</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
               {[
                  { step: '01', title: 'ATRAIR', desc: 'Centralização de leads de todas as fontes.', icon: Target, color: 'from-slate-700 to-slate-900' },
                  { step: '02', title: 'CONVERSAR', desc: 'IA inicia o diálogo em < 1 minuto.', icon: MessageSquare, color: 'from-blue-500 to-blue-600' },
                  { step: '03', title: 'QUALIFICAR', desc: 'Filtro automático de quem tem potencial.', icon: Filter, color: 'from-indigo-500 to-indigo-600' },
                  { step: '04', title: 'AGENDAR', desc: 'Compromisso marcado direto na agenda.', icon: Calendar, color: 'from-violet-500 to-purple-600' },
                  { step: '05', title: 'FECHAR', desc: 'Checkout e pagamento garantido.', icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
               ].map((phase, i) => (
                  <div key={i} className="relative p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl hover:-translate-y-2 transition-all duration-300 group overflow-hidden h-full flex flex-col">
                     <div className="absolute top-0 right-0 p-4 text-6xl font-black text-slate-100 dark:text-slate-800 select-none -z-0 opacity-50">{phase.step}</div>
                     
                     <div className={`relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br ${phase.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                        <phase.icon size={24} />
                     </div>
                     
                     <h3 className="relative z-10 text-lg font-black italic uppercase tracking-tight text-slate-900 dark:text-white mb-2">{phase.title}</h3>
                     <p className="relative z-10 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-relaxed">{phase.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* BLOCO 4: A SOLUÇÃO (TECH) */}
      <section id="solucao" className="py-32 bg-slate-900 text-white relative overflow-hidden scroll-mt-24">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
         
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
               <div className="flex-1 space-y-10">
                  <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight">
                     Tecnologia que trabalha <br/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Enquanto você descansa.</span>
                  </h2>
                  <p className="text-lg text-slate-400 font-medium leading-relaxed">
                     Seu time comercial agora é uma Inteligência Artificial treinada para persuadir e converter. Ela não dorme, não tira folga e não esquece ninguém.
                  </p>
                  
                  <ul className="space-y-6">
                     <li className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400"><Brain size={24}/></div>
                        <div>
                           <h4 className="font-black uppercase text-sm">IA Generativa (Gemini 3.0)</h4>
                           <p className="text-xs text-slate-400">Entende contexto, humor e intenção de compra.</p>
                        </div>
                     </li>
                     <li className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><RefreshCcw size={24}/></div>
                        <div>
                           <h4 className="font-black uppercase text-sm">Follow-up Infinito</h4>
                           <p className="text-xs text-slate-400">A IA continua tentando contato até o cliente responder.</p>
                        </div>
                     </li>
                  </ul>
               </div>

               <div className="flex-1 w-full">
                  <div className="bg-slate-800 p-8 rounded-[3rem] border border-slate-700 shadow-2xl relative">
                     <div className="space-y-4 font-mono text-sm">
                        <div className="flex gap-4">
                           <div className="w-8 h-8 rounded-full bg-slate-600 flex-shrink-0"></div>
                           <div className="bg-slate-700 p-4 rounded-2xl rounded-tl-none text-slate-300">
                              Olá, gostaria de saber o preço do serviço.
                           </div>
                        </div>
                        <div className="flex gap-4 flex-row-reverse">
                           <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center"><Bot size={16}/></div>
                           <div className="bg-indigo-600 p-4 rounded-2xl rounded-tr-none text-white shadow-lg">
                              Olá! Claro. O nosso pacote premium está com uma condição especial hoje. Você busca resultado rápido ou longo prazo?
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <div className="w-8 h-8 rounded-full bg-slate-600 flex-shrink-0"></div>
                           <div className="bg-slate-700 p-4 rounded-2xl rounded-tl-none text-slate-300">
                              Resultado rápido, tenho urgência.
                           </div>
                        </div>
                        <div className="flex gap-4 flex-row-reverse">
                           <div className="w-8 h-8 rounded-full bg-emerald-500 flex-shrink-0 flex items-center justify-center"><Check size={16}/></div>
                           <div className="bg-emerald-600 p-4 rounded-2xl rounded-tr-none text-white shadow-lg">
                              Entendido. Tenho um horário vago amanhã às 14h. Posso reservar para você?
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* BLOCO 5: PLANOS (PRICING) */}
      <section id="precos" className="py-24 bg-slate-50 dark:bg-slate-900 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-6 text-slate-900 dark:text-white">
            Escolha seu <span className="text-indigo-600">Nível de Jogo</span>
          </h2>
          
          <div className="flex justify-center mb-12">
             <div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 inline-flex relative">
                <button 
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                   Mensal
                </button>
                <button 
                  onClick={() => setBillingCycle('annual')}
                  className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'annual' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                   Anual
                </button>
                {billingCycle === 'annual' && (
                   <div className="absolute -top-4 -right-4 bg-rose-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg animate-bounce">
                      20% OFF
                   </div>
                )}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map(plan => (
              <div key={plan.id} className={`relative p-8 rounded-[3rem] transition-all duration-300 flex flex-col ${plan.popular ? 'bg-slate-900 text-white shadow-2xl scale-105 z-10 border-4 border-indigo-500' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200'}`}>
                {plan.popular && (
                   <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                      Mais Escolhido
                   </div>
                )}
                
                <div className="mb-8">
                   <h3 className="text-2xl font-black italic uppercase tracking-tight mb-2">{plan.name}</h3>
                   <p className={`text-xs font-bold uppercase tracking-widest ${plan.popular ? 'text-slate-400' : 'text-slate-400'}`}>{plan.tagline}</p>
                </div>

                <div className="flex items-baseline justify-center gap-1 mb-8">
                  <span className="text-sm font-black opacity-50">R$</span>
                  <h4 className="text-6xl font-black tracking-tighter tabular-nums italic">
                     {billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.annualTotal / 12)}
                  </h4>
                  <span className="text-xs font-bold uppercase opacity-50">/mês</span>
                </div>

                <div className="space-y-4 mb-10 flex-1 text-left pl-4">
                   {plan.features.map((f, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <div className={`p-1 rounded-full ${plan.popular ? 'bg-indigo-500' : 'bg-indigo-100 dark:bg-indigo-900'} text-white`}>
                           <Check size={10} strokeWidth={4} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wide">{f}</span>
                     </div>
                   ))}
                </div>

                <button onClick={handleOpenLogin} className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-105 shadow-lg ${plan.popular ? 'bg-white text-indigo-900 hover:bg-indigo-50' : 'bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800'}`}>
                   {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOCO 6: CTA FINAL & RODAPÉ */}
      <footer className="bg-slate-950 text-white pt-24 pb-12 px-6 border-t border-slate-800">
         <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-8 leading-none">
               Pronto para escalar <br/>
               <span className="text-indigo-500">Sua Operação?</span>
            </h2>
            <button onClick={handleOpenLogin} className="px-12 py-6 bg-white text-indigo-900 rounded-full font-black uppercase tracking-[0.2em] text-sm hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.3)]">
               Acessar Plataforma
            </button>
         </div>

         <div className="max-w-7xl mx-auto border-t border-slate-800 pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Force dark theme logo for footer */}
            <ZLogoHero branding={branding} className="opacity-70 hover:opacity-100 transition-opacity" forceTheme="dark" />
            
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
               <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
               <a href="#" className="hover:text-white transition-colors">Privacidade</a>
               <a href="#" className="hover:text-white transition-colors">Suporte Master</a>
            </div>
            
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">© 2024 Z-Prospector SaaS.</p>
         </div>
      </footer>

    </div>
  );
};
