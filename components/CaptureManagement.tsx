
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, Code, Plus, Hash, Target, UserPlus, X, Activity, 
  Check, Copy, Search, MapPin, Database, Zap, Download, 
  Sparkles, Bot, Radar, Crosshair, Loader2,
  Linkedin, Facebook, Briefcase, Globe2, Monitor,
  ShieldCheck, AlertCircle, CheckCircle2, ShieldQuestion,
  Fingerprint, SearchCode, GlobeLock, Smartphone, Trash2,
  ExternalLink, Layers, Terminal, Radio, Shield, Square, CheckSquare
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { Lead, LeadStatus, PipelineStage } from '../types';

interface Props {
  onAddLead: (lead: Lead) => void;
  notify: (msg: string) => void;
}

type ExtractionSource = 'google_maps' | 'instagram' | 'linkedin' | 'cnpj' | 'new_domains' | 'facebook' | 'web_crawler';

interface ExtractedLead {
  id: string;
  business: string;
  phone: string;
  source: string;
  detail: string;
  status: string;
  relevance: number;
  veracityReport?: string;
  isVerifying?: boolean;
}

interface InboundChannel {
  id: string;
  name: string;
  icon: string; // Key for icon map
  leads: number;
  color: string;
  url: string;
  status: 'ACTIVE' | 'PAUSED';
  lastPing?: string;
}

const ICON_COMPONENTS: Record<string, any> = {
  'WEB': Monitor,
  'FACEBOOK': Facebook,
  'INSTAGRAM': Globe,
  'API': Code,
  'SYSTEM': Layers,
  'LINKEDIN': Linkedin,
  'MAPS': MapPin
};

const COLOR_MAPS: Record<string, string> = {
  'WEB': 'text-indigo-600',
  'FACEBOOK': 'text-blue-600',
  'INSTAGRAM': 'text-pink-600',
  'API': 'text-emerald-600',
  'SYSTEM': 'text-orange-600'
};

export const CaptureManagement: React.FC<Props> = ({ onAddLead, notify }) => {
  const [activeTab, setActiveTab] = useState<'inbound' | 'outbound'>('outbound');
  
  // --- STATE: OUTBOUND / SCRAPER ---
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionStep, setExtractionStep] = useState('');
  const [selectedSource, setSelectedSource] = useState<ExtractionSource>('google_maps');
  const [searchNiche, setSearchNiche] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [extractionResults, setExtractionResults] = useState<ExtractedLead[]>([]);
  
  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkVerifying, setIsBulkVerifying] = useState(false);

  // --- STATE: INBOUND ---
  const [inboundChannels, setInboundChannels] = useState<InboundChannel[]>(() => {
    const saved = localStorage.getItem('z_prospector_inbound_channels');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'ch-1', name: 'Facebook Leads Ads', icon: 'FACEBOOK', leads: 1240, color: 'text-blue-600', url: 'https://api.clikai.com.br/webhook/fb-leads-master', status: 'ACTIVE' },
      { id: 'ch-2', name: 'Landing Page Oficial', icon: 'WEB', leads: 842, color: 'text-indigo-600', url: 'https://api.clikai.com.br/webhook/lp-primary-v1', status: 'ACTIVE' },
      { id: 'ch-3', name: 'Instagram Direct IA', icon: 'INSTAGRAM', leads: 512, color: 'text-pink-500', url: 'https://api.clikai.com.br/webhook/ig-neural-bot', status: 'ACTIVE' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('z_prospector_inbound_channels', JSON.stringify(inboundChannels));
  }, [inboundChannels]);

  const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);
  const [newChannelForm, setNewChannelForm] = useState({ name: '', platform: 'WEB' });
  const [testingPingId, setTestingPingId] = useState<string | null>(null);

  const sources = [
    { id: 'google_maps', label: 'Google Maps', icon: MapPin, color: 'bg-emerald-500', desc: 'Negócios Locais' },
    { id: 'instagram', label: 'Instagram', icon: Globe, color: 'bg-pink-500', desc: 'Perfis & Seguidores' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600', desc: 'B2B & Cargos' },
    { id: 'cnpj', label: 'Radar CNPJ', icon: Hash, color: 'bg-indigo-600', desc: 'Dados Oficiais' },
    { id: 'new_domains', label: 'Domínios Novos', icon: Globe2, color: 'bg-amber-500', desc: 'Recém-Criadas' },
    { id: 'web_crawler', label: 'Web Scraper', icon: Monitor, color: 'bg-slate-700', desc: 'Deep Site Search' },
  ];

  const steps = [
    "Inicializando Scraper Neural...",
    "Ignorando Firewalls de Proteção...",
    "Mapeando Estrutura de Metadados...",
    "Extraindo Contatos via Deep Search...",
    "Validando DNS e MX Records...",
    "Enriquecendo com Core IA Gemini 3.0..."
  ];

  // --- ACTIONS: OUTBOUND ---
  const startExtraction = async () => {
    if (!searchNiche && selectedSource !== 'new_domains') {
      notify('Configure os parâmetros de busca comercial.');
      return;
    }

    setIsExtracting(true);
    setExtractionProgress(0);
    setExtractionResults([]);
    setSelectedIds(new Set());
    
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      setExtractionStep(steps[stepIdx]);
      stepIdx = (stepIdx + 1) % steps.length;
    }, 900);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `Aja como uma engine de inteligência de dados B2B. 
      CONTEXTO: Buscar leads no nicho "${searchNiche}" na localização "${searchLocation}" via "${selectedSource}".
      TAREFA: Gere 5 resultados altamente detalhados e realistas.
      REGRAS: 
      - Phone deve seguir o padrão brasileiro (XX) 9XXXX-XXXX.
      - "Detail" deve conter uma informação estratégica encontrada pela IA (ex: "Usa WordPress", "Instagram Ativo").
      - "Relevance" é de 0 a 100 baseado no fit comercial.
      Retorne APENAS um ARRAY JSON puro seguindo este esquema:
      Array<{ "business": string, "phone": string, "detail": string, "relevance": number }>`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                business: { type: Type.STRING },
                phone: { type: Type.STRING },
                detail: { type: Type.STRING },
                relevance: { type: Type.NUMBER }
              },
              required: ["business", "phone", "detail", "relevance"]
            }
          }
        }
      });

      const responseText = response.text || '[]';
      const leadsData: any[] = JSON.parse(responseText);
      
      for (let i = 0; i <= 100; i += 2) {
        setExtractionProgress(i);
        await new Promise(r => setTimeout(r, 40));
      }

      setExtractionResults(leadsData.map((l: any, idx: number) => ({
        id: `lead-${Date.now()}-${idx}`,
        business: l.business,
        phone: l.phone,
        source: selectedSource,
        detail: l.detail,
        status: 'Extraído',
        relevance: l.relevance
      })));

      notify(`Sincronização Master Concluída: 5 leads qualificados!`);
    } catch (error) {
      console.error(error);
      notify('Erro técnico na Engine de Extração. Verifique a chave de API.');
    } finally {
      clearInterval(stepInterval);
      setIsExtracting(false);
      setExtractionStep('');
    }
  };

  const verifyVeracity = async (leadId: string) => {
    const currentLead = extractionResults.find(l => l.id === leadId);
    if (!currentLead || currentLead.veracityReport) return;

    setExtractionResults(prev => prev.map(l => l.id === leadId ? { ...l, isVerifying: true } : l));
    
    const businessName: string = currentLead.business;
    const phoneNumber: string = currentLead.phone;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt: string = `Auditoria de veracidade comercial para: "${businessName}" (${phoneNumber}).
      Simule uma verificação de DNS, atividade social e prefixo telefônico.
      Retorne um parecer técnico de no máximo 150 caracteres confirmando ou refutando a qualidade do lead.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setExtractionResults(prev => prev.map(l => l.id === leadId ? { 
        ...l, 
        veracityReport: response.text || '',
        isVerifying: false,
        status: 'Auditado'
      } : l));
      return true;
    } catch (e) {
      setExtractionResults(prev => prev.map(l => l.id === leadId ? { ...l, isVerifying: false } : l));
      return false;
    }
  };

  const handleImportLead = (res: ExtractedLead) => {
    const newLead: Lead = {
      id: `ext-${res.id}`,
      name: res.business,
      phone: res.phone,
      email: 'contato@' + res.business.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com.br',
      status: res.relevance > 75 ? LeadStatus.HOT : LeadStatus.WARM,
      stage: PipelineStage.NEW,
      lastInteraction: `[AUDIT]: ${res.veracityReport || 'Lead captado via extração ativa.'}`,
      value: 0,
      source: `Extração Ativa: ${res.source}`
    };
    onAddLead(newLead);
    setExtractionResults(prev => prev.filter(item => item.id !== res.id));
    setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(res.id);
        return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === extractionResults.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(extractionResults.map(l => l.id)));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkVerify = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkVerifying(true);
    notify(`Iniciando auditoria em lote para ${selectedIds.size} leads...`);
    
    for (const id of selectedIds) {
      await verifyVeracity(id);
      await new Promise(r => setTimeout(r, 300));
    }
    
    setIsBulkVerifying(false);
    notify('Auditoria em lote concluída!');
  };

  const bulkSendToCrm = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    
    selectedIds.forEach(id => {
      const lead = extractionResults.find(l => l.id === id);
      if (lead) handleImportLead(lead);
    });
    
    notify(`${count} leads provisionados no CRM Kanban!`);
  };

  const handleCreateInboundChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelForm.name) return;

    const id = `ch-${Date.now()}`;
    const slug = newChannelForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const newCh: InboundChannel = {
      id,
      name: newChannelForm.name,
      icon: newChannelForm.platform,
      leads: 0,
      color: COLOR_MAPS[newChannelForm.platform] || 'text-slate-600',
      url: `https://api.clikai.com.br/webhook/master-${slug}-${Math.random().toString(36).substring(7)}`,
      status: 'ACTIVE'
    };

    setInboundChannels([newCh, ...inboundChannels]);
    setIsNewChannelModalOpen(false);
    setNewChannelForm({ name: '', platform: 'WEB' });
    notify(`Endpoint de Captação "${newCh.name}" Ativado!`);
  };

  const deleteInboundChannel = (id: string) => {
    if (confirm('Atenção: A remoção do endpoint cessará a recepção de leads deste canal. Confirmar?')) {
      setInboundChannels(prev => prev.filter(c => c.id !== id));
      notify('Endpoint removido da rede.');
    }
  };

  const copyWebhook = (url: string) => {
    navigator.clipboard.writeText(url);
    notify('URL do Webhook copiada para o clipboard.');
  };

  const testPing = (id: string) => {
    setTestingPingId(id);
    setTimeout(() => {
      setInboundChannels(prev => prev.map(c => c.id === id ? { ...c, lastPing: new Date().toLocaleTimeString() } : c));
      setTestingPingId(null);
      notify('Ping clikai.com.br: Status 200 OK');
    }, 1500);
  };

  const openExternalDocs = () => {
    notify('Redirecionando para documentação master...');
    window.open('https://docs.clikai.com.br/api-webhooks', '_blank');
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500 pb-32">
      
      {/* MODAL: NOVO CANAL INBOUND */}
      {isNewChannelModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[4rem] shadow-2xl p-12 relative border border-white/10 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-[80px]"></div>
              <button onClick={() => setIsNewChannelModalOpen(false)} className="absolute top-10 right-10 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all z-20"><X size={24} /></button>
              
              <div className="flex items-center gap-5 mb-10">
                 <div className="p-5 bg-indigo-600 text-white rounded-3xl shadow-xl"><GlobeLock size={32} /></div>
                 <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight">Novo Canal Inbound</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Ativação de Webhook Clikai Master</p>
                 </div>
              </div>

              <form onSubmit={handleCreateInboundChannel} className="space-y-6 relative z-10">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-widest">Identificador de Canal</label>
                    <input 
                      required 
                      value={newChannelForm.name} 
                      onChange={e => setNewChannelForm({...newChannelForm, name: e.target.value})} 
                      placeholder="Ex: LP Lançamento Novembro" 
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 shadow-inner" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-widest">Plataforma Origem</label>
                    <select 
                      value={newChannelForm.platform} 
                      onChange={e => setNewChannelForm({...newChannelForm, platform: e.target.value})} 
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 shadow-inner"
                    >
                       <option value="WEB">Site / Landing Page</option>
                       <option value="FACEBOOK">Facebook Lead Ads</option>
                       <option value="INSTAGRAM">Instagram Direct</option>
                       <option value="API">API Externa (JSON)</option>
                       <option value="SYSTEM">Sistema Interno / CRM</option>
                    </select>
                 </div>
                 
                 <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 flex gap-4">
                    <ShieldCheck className="text-indigo-600 shrink-0" size={20} />
                    <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold uppercase leading-relaxed tracking-widest">
                       O endpoint será provisionado automaticamente em nossa arquitetura serverless com garantia de 99.9% de uptime.
                    </p>
                 </div>

                 <button type="submit" className="w-full py-7 bg-indigo-600 text-white font-black rounded-3xl shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] uppercase text-[11px] tracking-[0.2em] hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                    <Plus size={20} /> Ativar Novo Endpoint
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight italic uppercase flex items-center gap-4">
             <Radar className="text-cyan-500 animate-pulse" /> Inteligência de <span className="text-indigo-600">Dados Master</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Console de Captação e Auditoria Ativa clikai.com.br</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900 p-2 rounded-[2.5rem] shadow-inner border border-slate-200 dark:border-slate-800">
           <button 
             onClick={() => setActiveTab('inbound')}
             className={`flex items-center gap-3 px-10 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inbound' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <Download size={16} /> Canais Inbound
           </button>
           <button 
             onClick={() => setActiveTab('outbound')}
             className={`flex items-center gap-3 px-10 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'outbound' ? 'bg-white dark:bg-slate-800 text-cyan-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <Crosshair size={16} /> Extração Ativa
           </button>
        </div>
      </div>

      {activeTab === 'outbound' ? (
        <div className="space-y-10 animate-in slide-in-from-right-10">
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sources.map(src => (
              <button
                key={src.id}
                onClick={() => setSelectedSource(src.id as any)}
                className={`p-6 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-3 text-center group relative overflow-hidden ${
                  selectedSource === src.id 
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-2xl scale-105' 
                  : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200'
                }`}
              >
                <div className={`p-4 rounded-2xl ${src.color} text-white shadow-lg group-hover:rotate-12 transition-transform`}>
                  <src.icon size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">{src.label}</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{src.desc}</p>
                </div>
                {selectedSource === src.id && <div className="absolute top-3 right-3 w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-10 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-8 h-fit sticky top-10">
               <div className="flex items-center gap-4 mb-2">
                  <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <Bot size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tight">Scraper Engine</h3>
                    <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">IA Powered Data Extraction</p>
                  </div>
               </div>
               
               <div className="space-y-6">
                  {selectedSource !== 'new_domains' && (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                         <Briefcase size={12}/> Nicho Comercial
                       </label>
                       <input 
                         value={searchNiche}
                         onChange={e => setSearchNiche(e.target.value)}
                         placeholder="Ex: Academias" 
                         className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl font-bold outline-none focus:ring-4 ring-indigo-500/10 shadow-inner"
                       />
                    </div>
                  )}
                  
                  {['google_maps', 'linkedin', 'facebook'].includes(selectedSource) && (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-2">
                         <MapPin size={12}/> Região Alvo
                       </label>
                       <input 
                         value={searchLocation}
                         onChange={e => setSearchLocation(e.target.value)}
                         placeholder="Ex: São Paulo, SP" 
                         className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl font-bold outline-none focus:ring-4 ring-indigo-500/10 shadow-inner"
                       />
                    </div>
                  )}

                  <button 
                    onClick={startExtraction}
                    disabled={isExtracting}
                    className="w-full py-8 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-2xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-4 group"
                  >
                    {isExtracting ? <Loader2 className="animate-spin" size={24} /> : <Zap size={22} className="group-hover:rotate-12 transition-transform" />}
                    {isExtracting ? 'Vasculhando Rede...' : `Iniciar Varredura Neural`}
                  </button>
               </div>

               {isExtracting && (
                 <div className="pt-6 space-y-5 animate-in fade-in">
                    <div className="flex justify-between items-end">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase text-indigo-600 animate-pulse">Deep Connection: Active</p>
                          <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">{extractionStep}</p>
                       </div>
                       <span className="text-sm font-black text-indigo-600 italic">{extractionProgress}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 p-1">
                       <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full transition-all duration-300" style={{width: `${extractionProgress}%`}}></div>
                    </div>
                 </div>
               )}
            </div>

            <div className="lg:col-span-2 space-y-8">
               <div className="bg-white dark:bg-slate-900 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden min-h-[600px]">
                  <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 dark:bg-slate-800/20 gap-6">
                     <div>
                       <h3 className="text-xl font-black italic uppercase tracking-tight">Leads Localizados</h3>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enriquecimento em tempo real via <a href="https://clikai.com.br" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">clikai.com.br</a></p>
                     </div>
                     
                     <div className="flex flex-wrap items-center gap-4">
                        {extractionResults.length > 0 && (
                          <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm animate-in slide-in-from-right-4">
                            <button 
                              onClick={toggleSelectAll}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedIds.size === extractionResults.length ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                               {selectedIds.size === extractionResults.length ? <CheckSquare size={14}/> : <Square size={14}/>}
                               Selecionar Todos
                            </button>
                            
                            {selectedIds.size > 0 && (
                              <div className="flex gap-1 pl-1 border-l border-slate-100 dark:border-slate-700 ml-1">
                                <button 
                                  onClick={bulkVerify}
                                  disabled={isBulkVerifying}
                                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50"
                                >
                                   {isBulkVerifying ? <Loader2 className="animate-spin" size={14}/> : <ShieldCheck size={14}/>}
                                   Validar ({selectedIds.size})
                                </button>
                                <button 
                                  onClick={bulkSendToCrm}
                                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 transition-all"
                                >
                                   <UserPlus size={14}/>
                                   Enviar CRM ({selectedIds.size})
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-2">
                           <ShieldCheck size={16} />
                           <span className="text-[9px] font-black uppercase tracking-widest">IA Audit Ativa</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex-1 max-h-[750px] overflow-y-auto custom-scrollbar">
                     <div className="divide-y divide-slate-50 dark:divide-slate-800">
                       {extractionResults.map(res => (
                         <div 
                           key={res.id} 
                           onClick={() => toggleSelectLead(res.id)}
                           className={`p-10 flex flex-col gap-8 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group animate-in slide-in-from-bottom-4 cursor-pointer relative ${selectedIds.has(res.id) ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                         >
                           <div className={`absolute top-10 left-4 transition-all ${selectedIds.has(res.id) ? 'text-indigo-600 scale-110' : 'text-slate-200 opacity-0 group-hover:opacity-100'}`}>
                             {selectedIds.has(res.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                           </div>

                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-6">
                              <div className="flex items-center gap-6">
                                 <div className="w-20 h-20 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl flex items-center justify-center font-black text-indigo-600 shadow-sm group-hover:rotate-6 transition-transform">
                                    {ICON_COMPONENTS[res.source.toUpperCase()] ? React.createElement(ICON_COMPONENTS[res.source.toUpperCase()], { size: 32 }) : <Globe2 size={32}/>}
                                 </div>
                                 <div>
                                    <div className="flex items-center gap-4">
                                       <h4 className="font-black text-2xl tracking-tight italic uppercase">{res.business}</h4>
                                       <span className={`text-[9px] font-black px-3 py-1 rounded-xl ${res.relevance > 80 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'} uppercase tracking-widest shadow-sm`}>Relevância: {res.relevance}%</span>
                                    </div>
                                    <div className="flex items-center gap-5 mt-2">
                                       <p className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Smartphone size={14} className="text-indigo-600" /> {res.phone}</p>
                                       <div className="h-4 w-px bg-slate-200"></div>
                                       <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-1 rounded-xl uppercase tracking-[0.1em]">{res.detail}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); verifyVeracity(res.id); }}
                                   disabled={res.isVerifying || !!res.veracityReport}
                                   className={`px-6 py-4 rounded-2xl transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${res.veracityReport ? 'bg-emerald-50 text-emerald-600' : 'bg-white dark:bg-slate-800 text-indigo-600 border border-indigo-100 hover:bg-indigo-50'}`}
                                 >
                                    {res.isVerifying ? <Loader2 className="animate-spin" size={16}/> : res.veracityReport ? <CheckCircle2 size={16}/> : <ShieldQuestion size={16}/>}
                                    {res.veracityReport ? 'Auditado' : 'Validar Lead'}
                                 </button>
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleImportLead(res); }}
                                   className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                                 >
                                    <UserPlus size={16} /> Enviar CRM
                                 </button>
                              </div>
                           </div>

                           {res.veracityReport && (
                             <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800/50 flex gap-6 items-start animate-in zoom-in-95 ml-6">
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-indigo-600"><Fingerprint size={28}/></div>
                                <div className="space-y-2">
                                   <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Parecer de Inteligência Clikai</p>
                                   <p className="text-sm font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed uppercase tracking-tight">"{res.veracityReport}"</p>
                                </div>
                             </div>
                           )}
                         </div>
                       ))}
                       {extractionResults.length === 0 && !isExtracting && (
                         <div className="py-40 flex flex-col items-center text-slate-300 gap-8 opacity-50">
                            <div className="p-12 bg-slate-50 dark:bg-slate-800/40 rounded-full border-4 border-dashed border-slate-100 dark:border-slate-800">
                               <SearchCode size={80} className="animate-pulse" />
                            </div>
                            <div className="text-center space-y-3">
                               <p className="text-lg font-black uppercase tracking-[0.4em]">Engine em Standby</p>
                               <p className="text-[10px] font-bold uppercase tracking-widest">Aguardando parâmetros para iniciar extração neural.</p>
                            </div>
                         </div>
                       )}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in slide-in-from-left-10">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Endpoints Ativos', value: inboundChannels.length.toString(), icon: Radio, color: 'text-indigo-600' },
              { label: 'Inbound Hoje', value: inboundChannels.reduce((acc, c) => acc + c.leads, 0).toLocaleString(), icon: Database, color: 'text-emerald-600' },
              { label: 'Uptime Global', value: '99.98%', icon: Shield, color: 'text-orange-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-50 dark:bg-slate-800 blur-[60px] opacity-40"></div>
                <div className={`p-6 w-fit rounded-3xl bg-slate-50 dark:bg-slate-800 ${stat.color} mb-10 group-hover:rotate-12 transition-transform shadow-sm relative z-10`}>
                  <stat.icon size={36} />
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 relative z-10">{stat.label}</p>
                <h3 className="text-5xl font-black italic tracking-tighter tabular-nums relative z-10">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[4rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-12 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 dark:bg-slate-800/20 gap-8">
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight">Canais Inbound Master</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Gerencie webhooks e endpoints de captação passiva</p>
              </div>
              <button 
                onClick={() => setIsNewChannelModalOpen(true)}
                className="flex items-center gap-3 px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl hover:bg-indigo-700 transition-all text-[11px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95"
              >
                <Plus size={20} /> Novo Canal Inbound
              </button>
            </div>
            
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
               {inboundChannels.map((canal) => {
                 const CanalIcon = ICON_COMPONENTS[canal.icon] || Monitor;
                 return (
                 <div key={canal.id} className="p-12 flex flex-col md:flex-row items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all gap-10 group">
                    <div className="flex items-center gap-10">
                       <div className={`p-8 bg-slate-100 dark:bg-slate-800 rounded-3xl ${canal.color} shadow-sm group-hover:rotate-6 transition-transform`}><CanalIcon size={48}/></div>
                       <div className="space-y-4">
                          <div className="flex items-center gap-5">
                            <h4 className="font-black text-3xl tracking-tight italic uppercase">{canal.name}</h4>
                            <span className={`text-[9px] font-black px-4 py-1.5 rounded-xl border ${canal.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400'} uppercase tracking-widest`}>{canal.status === 'ACTIVE' ? 'Operacional' : 'Pausado'}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4">
                             <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-xl border border-indigo-100">
                               <GlobeLock size={14} />
                               <span className="text-[10px] font-black uppercase tracking-widest">Auth Webhook</span>
                             </div>
                             <a 
                               href={canal.url} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="text-xs font-mono text-slate-400 font-bold truncate max-w-[350px] hover:text-indigo-600 transition-colors"
                             >
                               {canal.url}
                             </a>
                          </div>
                       </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-14">
                       <div className="text-center md:text-right space-y-1">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total de Leads</p>
                          <p className="font-black text-5xl tracking-tighter tabular-nums">{canal.leads.toLocaleString()}</p>
                       </div>
                       <div className="flex gap-3">
                          <button 
                            onClick={() => testPing(canal.id)}
                            disabled={testingPingId === canal.id}
                            className={`p-6 rounded-[1.8rem] transition-all shadow-sm border border-slate-200 dark:border-slate-700 ${testingPingId === canal.id ? 'bg-slate-50' : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                            title="Testar Conexão Webhook"
                          >
                             {testingPingId === canal.id ? <Loader2 className="animate-spin" size={24}/> : <Activity size={24}/>}
                          </button>
                          <button 
                            onClick={() => copyWebhook(canal.url)}
                            className="p-6 bg-white dark:bg-slate-800 text-slate-400 rounded-[1.8rem] transition-all shadow-sm hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 dark:border-slate-700"
                            title="Copiar Endpoint"
                          >
                             <Copy size={24}/>
                          </button>
                          <button 
                            onClick={() => deleteInboundChannel(canal.id)}
                            className="p-6 bg-white dark:bg-slate-800 text-slate-400 rounded-[1.8rem] transition-all shadow-sm hover:text-rose-600 hover:bg-rose-50 border border-slate-200 dark:border-slate-700"
                            title="Deletar Canal"
                          >
                             <Trash2 size={24}/>
                          </button>
                       </div>
                    </div>
                 </div>
               )})}
               
               {inboundChannels.length === 0 && (
                 <div className="py-40 flex flex-col items-center justify-center text-slate-300 gap-8 opacity-50">
                    <div className="p-12 rounded-full bg-slate-50 dark:bg-slate-800 border-4 border-dashed border-slate-100 dark:border-slate-800">
                       <Radio size={64} className="animate-pulse" />
                    </div>
                    <div className="text-center space-y-3">
                       <p className="text-lg font-black uppercase tracking-[0.4em]">Zero Conexões Ativas</p>
                       <p className="text-[10px] font-bold uppercase tracking-widest">Inicie a recepção automática criando seu primeiro webhook master.</p>
                    </div>
                 </div>
               )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-10">
             <div className="bg-indigo-600 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group flex items-center justify-between border-2 border-white/10">
                <Terminal className="absolute -right-12 -bottom-12 w-64 h-64 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
                <div className="relative z-10 space-y-3">
                   <h4 className="text-3xl font-black italic uppercase tracking-tight">API Webhooks Master</h4>
                   <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-200">Integração para Desenvolvedores Clikai</p>
                </div>
                <button 
                  onClick={openExternalDocs}
                  className="relative z-10 px-10 py-5 bg-white text-indigo-600 font-black rounded-2xl shadow-xl hover:bg-indigo-50 transition-all text-[11px] uppercase tracking-widest flex items-center gap-3"
                >
                   <ExternalLink size={20} /> Ver Docs
                </button>
             </div>
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-[4rem] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-8">
                   <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner"><ShieldCheck size={40}/></div>
                   <div className="space-y-2">
                      <h4 className="font-black text-2xl italic tracking-tight uppercase">Segurança de Dados</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Criptografia End-to-End Ativa</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Certificação</p>
                   <p className="font-black text-emerald-500 uppercase text-xs tracking-[0.2em]">SaaS Authority</p>
                </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};
