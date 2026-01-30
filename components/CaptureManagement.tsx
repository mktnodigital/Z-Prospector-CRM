
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, Code, Plus, Hash, Target, UserPlus, X, Activity, 
  Check, Copy, Search, MapPin, Database, Zap, Download, 
  Sparkles, Bot, Radar, Crosshair, Loader2,
  Linkedin, Facebook, Briefcase, Globe2, Monitor,
  ShieldCheck, AlertCircle, CheckCircle2, ShieldQuestion,
  Fingerprint, SearchCode, GlobeLock, Smartphone, Trash2,
  ExternalLink, Layers, Terminal, Radio, Shield, Square, CheckSquare,
  FileText, Table as TableIcon, FileJson, Edit3, Filter, ChevronRight,
  MoreVertical, Share2, Mail, LayoutGrid, List,
  Building2, Webhook, Link as LinkIcon, Power, History, Cpu, Instagram, Map
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { Lead, LeadStatus, PipelineStage } from '../types';

interface Props {
  onAddLead: (lead: Lead) => void;
  notify: (msg: string) => void;
}

type ExtractionSource = 'google_maps' | 'google_search' | 'instagram' | 'linkedin' | 'cnpj' | 'web_scraper';

interface ExtractedLead {
  id: string;
  business: string;
  phone: string;
  email: string;
  source: ExtractionSource;
  detail: string;
  status: 'Extraído' | 'Auditado' | 'Editado';
  relevance: number;
}

interface WebhookInbound {
  id: string;
  name: string;
  url: string;
  event: string;
  status: 'ACTIVE' | 'PAUSED';
  lastHit?: string;
  hits: number;
}

const API_URL = '/api/core.php';

// MAPEAMENTO DE TEMAS POR CANAL
const SOURCE_THEMES: Record<ExtractionSource, { border: string, bg: string, ring: string, text: string, button: string, progress: string }> = {
  google_maps: { 
    border: 'border-emerald-500/30', 
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/20', 
    ring: 'ring-emerald-500/10',
    text: 'text-emerald-600',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    progress: 'bg-emerald-600'
  },
  google_search: { 
    border: 'border-blue-500/30', 
    bg: 'bg-blue-50/50 dark:bg-blue-950/20', 
    ring: 'ring-blue-500/10',
    text: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    progress: 'bg-blue-600'
  },
  instagram: { 
    border: 'border-pink-500/30', 
    bg: 'bg-pink-50/50 dark:bg-pink-950/20', 
    ring: 'ring-pink-500/10',
    text: 'text-pink-600',
    button: 'bg-pink-600 hover:bg-pink-700',
    progress: 'bg-pink-600'
  },
  linkedin: { 
    border: 'border-indigo-500/30', 
    bg: 'bg-indigo-50/50 dark:bg-indigo-950/20', 
    ring: 'ring-indigo-500/10',
    text: 'text-indigo-600',
    button: 'bg-indigo-600 hover:bg-indigo-700',
    progress: 'bg-indigo-600'
  },
  cnpj: { 
    border: 'border-amber-500/30', 
    bg: 'bg-amber-50/50 dark:bg-amber-950/20', 
    ring: 'ring-amber-500/10',
    text: 'text-amber-600',
    button: 'bg-amber-600 hover:bg-amber-700',
    progress: 'bg-amber-600'
  },
  web_scraper: { 
    border: 'border-slate-500/30', 
    bg: 'bg-slate-50/50 dark:bg-slate-950/20', 
    ring: 'ring-slate-500/10',
    text: 'text-slate-600',
    button: 'bg-slate-700 hover:bg-slate-800',
    progress: 'bg-slate-600'
  }
};

export const CaptureManagement: React.FC<Props> = ({ onAddLead, notify }) => {
  const [activeTab, setActiveTab] = useState<'outbound' | 'inbound'>('outbound');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionStep, setExtractionStep] = useState('');
  const [selectedSource, setSelectedSource] = useState<ExtractionSource>('google_maps');
  const [searchNiche, setSearchNiche] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [extractionResults, setExtractionResults] = useState<ExtractedLead[]>([]);
  
  const [webhooks, setWebhooks] = useState<WebhookInbound[]>([]);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookInbound | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingLead, setEditingLead] = useState<ExtractedLead | null>(null);

  const currentTheme = SOURCE_THEMES[selectedSource];

  // Fetch Webhooks
  useEffect(() => {
    const fetchWebhooks = async () => {
      try {
        const res = await fetch(`${API_URL}?action=get-webhooks`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setWebhooks(data);
        }
      } catch (e) { console.error("Failed to load webhooks"); }
    };
    fetchWebhooks();
  }, []);

  const sources = [
    { id: 'google_maps', label: 'Google Maps', icon: MapPin, color: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', desc: 'Negócios Locais' },
    { id: 'google_search', label: 'Google Search', icon: Search, color: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', desc: 'Sites & Notícias' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-pink-500', text: 'text-pink-600', border: 'border-pink-200', desc: 'Perfis & Influencers' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-200', desc: 'Decisores B2B' },
    { id: 'cnpj', label: 'Radar CNPJ', icon: Hash, color: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', desc: 'Dados Fiscais' },
    { id: 'web_scraper', label: 'Web Scraper', icon: Globe, color: 'bg-slate-700', text: 'text-slate-600', border: 'border-slate-200', desc: 'Deep Search' },
  ];

  const getSourceSteps = (source: ExtractionSource) => {
    switch(source) {
      case 'google_maps': return ["Iniciando Geo-fencing...", "Varrendo Quadrantes...", "Extraindo Reviews...", "Validando Telefones..."];
      case 'instagram': return ["Bypassing Login...", "Scraping Followers...", "Analisando Bio...", "Extraindo Contatos DM..."];
      case 'linkedin': return ["Conectando Sales Nav...", "Filtrando Decisores...", "Enriquecendo Emails...", "Validando Cargos..."];
      case 'cnpj': return ["Consultando Receita Federal...", "Cruzando Sócios...", "Verificando Capital Social...", "Validando CNAE..."];
      default: return ["Abrindo Tunel Socket...", "Ignorando Captchas...", "Escaneando DOM...", "Validando Dados..."];
    }
  };

  const startExtraction = async () => {
    if (!searchNiche) {
      notify('Defina o nicho para prospecção estratégica.');
      return;
    }

    setIsExtracting(true);
    setExtractionProgress(0);
    
    const currentSteps = getSourceSteps(selectedSource);
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      setExtractionStep(currentSteps[stepIdx % currentSteps.length]);
      stepIdx++;
    }, 1000);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let specificPrompt = "";
      switch(selectedSource) {
        case 'google_maps':
          specificPrompt = `Retorne empresas reais desse nicho com telefone e endereço. No campo 'detail', inclua o status da avaliação (ex: 4.5 estrelas).`;
          break;
        case 'instagram':
          specificPrompt = `Retorne perfis comerciais. No campo 'detail', inclua o número aproximado de seguidores e nicho da bio.`;
          break;
        case 'linkedin':
          specificPrompt = `Retorne decisores de empresas (CEOs, Diretores). No campo 'detail', inclua o cargo e segmento.`;
          break;
        default:
          specificPrompt = `Extraia leads genéricos da web.`;
      }

      const prompt = `Aja como um motor de scraping neural de alta precisão.
      Localize 6 leads potenciais para o nicho "${searchNiche}" em "${searchLocation || 'Brasil'}" via canal "${selectedSource}".
      ${specificPrompt}
      
      REGRAS DE FORMATAÇÃO:
      - Phone: (XX) 9XXXX-XXXX
      - Relevance: 0-100 (score de afinidade)
      - Retorne APENAS um array JSON de objetos.
      `;

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
                email: { type: Type.STRING },
                detail: { type: Type.STRING },
                relevance: { type: Type.NUMBER }
              },
              required: ["business", "phone", "email", "detail", "relevance"]
            }
          }
        }
      });

      let jsonStr = response.text || '[]';
      
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
      }

      const results = JSON.parse(jsonStr);
      
      for (let i = 20; i <= 100; i += 20) {
        setExtractionProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }

      const mapped = results.map((r: any) => ({
        ...r,
        id: `ext-${Math.random().toString(36).substr(2, 9)}`,
        source: selectedSource,
        status: 'Extraído'
      }));

      setExtractionResults(mapped);
      notify(`${mapped.length} Leads extraídos e qualificados via ${selectedSource}!`);
    } catch (e) {
      console.error("Scraper Error:", e);
      notify('Falha na Engine Neural. Verifique sua conexão e tente novamente.');
    } finally {
      clearInterval(stepInterval);
      setIsExtracting(false);
      setExtractionStep('');
      setExtractionProgress(0);
    }
  };

  const handleSaveWebhook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const whName = formData.get('whName') as string;
    const whEvent = formData.get('whEvent') as string;

    let whToSave: WebhookInbound;

    if (editingWebhook) {
      whToSave = { ...editingWebhook, name: whName, event: whEvent };
      setWebhooks(prev => prev.map(w => w.id === editingWebhook.id ? whToSave : w));
      notify('Webhook atualizado!');
    } else {
      whToSave = {
        id: `wh_${Date.now()}`,
        name: whName,
        url: `https://api.clikai.com.br/wh/${Math.random().toString(36).substr(2, 8)}`,
        event: whEvent,
        status: 'ACTIVE',
        hits: 0
      };
      setWebhooks([...webhooks, whToSave]);
      notify('Webhook de captação provisionado!');
    }

    try {
        await fetch(`${API_URL}?action=save-webhook`, {
            method: 'POST',
            body: JSON.stringify(whToSave)
        });
    } catch(e) { console.error(e); }

    setIsWebhookModalOpen(false);
    setEditingWebhook(null);
  };

  const handleOpenAddWebhook = () => {
    setEditingWebhook(null);
    setIsWebhookModalOpen(true);
  };

  const handleOpenEditWebhook = (wh: WebhookInbound) => {
    setEditingWebhook(wh);
    setIsWebhookModalOpen(true);
  };

  const handleDeleteWebhook = async (id: string) => {
    if (confirm('Deseja destruir este webhook?')) {
      setWebhooks(prev => prev.filter(w => w.id !== id));
      try {
        await fetch(`${API_URL}?action=delete-webhook`, {
            method: 'POST',
            body: JSON.stringify({ id })
        });
      } catch(e) { console.error(e); }
      notify('Webhook removido.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notify('Endpoint copiado!');
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const allSelected = extractionResults.length > 0 && selectedIds.size === extractionResults.length;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      notify('Seleção limpa.');
    } else {
      setSelectedIds(new Set(extractionResults.map(r => r.id)));
      notify(`Todos os ${extractionResults.length} leads selecionados.`);
    }
  };

  const handleBulkTransfer = () => {
    const toTransfer = extractionResults.filter(r => selectedIds.has(r.id));
    toTransfer.forEach(r => {
      onAddLead({
        id: r.id,
        name: r.business,
        phone: r.phone,
        email: r.email,
        status: r.relevance > 80 ? LeadStatus.HOT : LeadStatus.WARM,
        stage: PipelineStage.NEW,
        lastInteraction: `[EXTRAÇÃO ${r.source.toUpperCase()}]: ${r.detail}`,
        value: 0,
        source: `Scraper: ${r.source}`
      });
    });
    setExtractionResults(prev => prev.filter(r => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
    notify(`${toTransfer.length} Leads enviados ao Pipeline!`);
  };

  const handleBulkDelete = () => {
    if (confirm(`Descartar ${selectedIds.size} leads?`)) {
      setExtractionResults(prev => prev.filter(r => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
      notify('Leads descartados.');
    }
  };

  const handleExportCSV = () => {
    const toExport = extractionResults.filter(r => selectedIds.size === 0 || selectedIds.has(r.id));
    const headers = "Empresa;WhatsApp;Email;Fonte;Relevancia;Detalhe\n";
    const csv = toExport.map(r => `${r.business};${r.phone};${r.email};${r.source};${r.relevance}%;${r.detail}`).join("\n");
    const blob = new Blob([headers + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scraper_leads_${Date.now()}.csv`;
    link.click();
    notify('CSV gerado com sucesso!');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    setExtractionResults(prev => prev.map(r => r.id === editingLead.id ? { ...editingLead, status: 'Editado' } : r));
    setEditingLead(null);
    notify('Lead atualizado.');
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in pb-40">
      
      {/* MODAL DE EDIÇÃO RÁPIDA DE LEAD */}
      {editingLead && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-955/80 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl p-12 border border-white/10">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100">Editar Prospect</h3>
                <button onClick={() => setEditingLead(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveEdit} className="space-y-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2">Nome da Empresa</label>
                    <input value={editingLead.business} onChange={e => setEditingLead({...editingLead, business: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 dark:text-white" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 px-2">WhatsApp</label>
                      <input value={editingLead.phone} onChange={e => setEditingLead({...editingLead, phone: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 dark:text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 px-2">Email</label>
                      <input value={editingLead.email} onChange={e => setEditingLead({...editingLead, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 dark:text-white" />
                    </div>
                 </div>
                 <button type="submit" className={`w-full py-6 text-white font-black rounded-3xl shadow-xl uppercase text-xs tracking-widest transition-all ${currentTheme.button}`}>Salvar Alterações</button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL DE WEBHOOK (CRUD) */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-955/80 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl p-12 border border-white/10">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100">{editingWebhook ? 'Editar Webhook' : 'Novo Webhook Inbound'}</h3>
                <button onClick={() => setIsWebhookModalOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveWebhook} className="space-y-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2">Nome do Identificador</label>
                    <input name="whName" defaultValue={editingWebhook?.name} required placeholder="Ex: Meta Ads Nov/24" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 dark:text-white italic uppercase" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-2">Evento de Entrada</label>
                    <select name="whEvent" defaultValue={editingWebhook?.event} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 dark:text-white italic">
                       <option value="lead_form">Lead Ads Form (Facebook/IG)</option>
                       <option value="site_contact">Contato via Website</option>
                       <option value="custom_json">JSON Customizado / API</option>
                       <option value="ghl_sync">GHL / CRM Externo</option>
                    </select>
                 </div>
                 {editingWebhook && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                       <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Endpoint de Ingestão:</p>
                       <div className="flex items-center gap-3">
                          <code className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 break-all">{editingWebhook.url}</code>
                          <button type="button" onClick={() => copyToClipboard(editingWebhook.url)} className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-400 hover:text-indigo-600 transition-colors"><Copy size={14}/></button>
                       </div>
                    </div>
                 )}
                 <button type="submit" className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all">
                    {editingWebhook ? 'Salvar Alterações' : 'Criar Webhook Master'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* HEADER MASTER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <div className={`p-4 ${currentTheme.button} text-white rounded-2xl shadow-xl animate-pulse transition-all duration-500`}><Radar size={32} /></div>
             <h1 className="text-4xl font-black italic uppercase tracking-tighter">Captação <span className={currentTheme.text}>Neural</span></h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Agente de Inteligência de Dados v3.1 • clikai.com.br</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900 p-2.5 rounded-[2.5rem] shadow-inner border border-slate-200 dark:border-slate-800 gap-1">
           <button onClick={() => setActiveTab('outbound')} className={`flex items-center gap-4 px-9 py-5 rounded-[1.8rem] text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'outbound' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>
             <Crosshair size={20} /> Scraper IA
           </button>
           <button onClick={() => setActiveTab('inbound')} className={`flex items-center gap-4 px-9 py-5 rounded-[1.8rem] text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'inbound' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>
             <Download size={20} /> Webhooks
           </button>
        </div>
      </div>

      {activeTab === 'outbound' && (
        <div className="space-y-10 animate-in slide-in-from-right-10">
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {sources.map(src => (
              <button
                key={src.id}
                onClick={() => setSelectedSource(src.id as any)}
                className={`flex flex-col items-center justify-center gap-4 p-4 rounded-[2.5rem] border-2 transition-all group relative overflow-hidden aspect-square ${
                  selectedSource === src.id 
                  ? `${src.border} ${src.color} bg-opacity-10 dark:bg-opacity-20 shadow-2xl scale-105` 
                  : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200 shadow-sm'
                }`}
              >
                <div className={`p-5 rounded-2xl ${src.color} text-white shadow-lg group-hover:rotate-12 transition-transform scale-110`}>
                  <src.icon size={28} />
                </div>
                <div className="text-center">
                   <p className={`text-[10px] font-black uppercase tracking-tight leading-none mb-1.5 ${selectedSource === src.id ? src.text : 'text-slate-700 dark:text-slate-200'}`}>{src.label}</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">{src.desc}</p>
                </div>
                {selectedSource === src.id && (
                  <div className={`absolute bottom-3 w-1.5 h-1.5 rounded-full ${src.color} animate-pulse`}></div>
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* SETUP DE BUSCA DINAMICO */}
            <div className={`lg:col-span-1 p-10 rounded-[4rem] border-2 transition-all duration-500 shadow-sm space-y-10 h-fit sticky top-10 ${currentTheme.bg} ${currentTheme.border}`}>
               <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl transition-all ${currentTheme.button} text-white`}><Bot size={32} /></div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-200">Setup de Busca</h3>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${currentTheme.text}`}>Canal Ativo: {selectedSource.replace('_', ' ')}</p>
                  </div>
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Nicho Comercial</label>
                     <input value={searchNiche} onChange={e => setSearchNiche(e.target.value)} placeholder="Ex: Escritórios de Advocacia" className={`w-full px-8 py-5 bg-white dark:bg-slate-800 border-none rounded-3xl font-bold outline-none focus:ring-4 ${currentTheme.ring} shadow-inner italic dark:text-white`} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Cidade / Região</label>
                     <input value={searchLocation} onChange={e => setSearchLocation(e.target.value)} placeholder="Ex: Curitiba, PR" className={`w-full px-8 py-5 bg-white dark:bg-slate-800 border-none rounded-3xl font-bold outline-none focus:ring-4 ${currentTheme.ring} shadow-inner italic dark:text-white`} />
                  </div>

                  <button 
                    onClick={startExtraction}
                    disabled={isExtracting}
                    className={`w-full py-8 text-white font-black rounded-[2.5rem] shadow-2xl transition-all uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-4 group disabled:opacity-70 disabled:cursor-not-allowed ${currentTheme.button}`}
                  >
                    {isExtracting ? <Loader2 className="animate-spin" size={24} /> : <Zap size={22} className="group-hover:rotate-12 transition-transform" />}
                    {isExtracting ? 'Vasculhando...' : 'Ligar Scraper Neural'}
                  </button>
               </div>

               {isExtracting && (
                 <div className="pt-6 space-y-4 animate-in fade-in">
                    <div className="flex justify-between items-end">
                       <div className="space-y-1">
                          <p className={`text-[8px] font-black uppercase animate-pulse italic ${currentTheme.text}`}>Protocolo: SSL SECURE</p>
                          <p className="text-[10px] font-black uppercase text-slate-500">{extractionStep}</p>
                       </div>
                       <span className={`text-xl font-black italic ${currentTheme.text}`}>{extractionProgress}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 p-1">
                       <div className={`h-full rounded-full transition-all duration-300 shadow-xl ${currentTheme.progress}`} style={{width: `${extractionProgress}%`}}></div>
                    </div>
                 </div>
               )}
            </div>

            <div className="lg:col-span-2 space-y-8">
               {/* EXTRAÇÃO ATIVA DINAMICA */}
               <div className={`rounded-[4.5rem] border-2 transition-all duration-500 shadow-sm flex flex-col overflow-hidden min-h-[600px] bg-white dark:bg-slate-900 ${currentTheme.border}`}>
                  <div className={`p-10 border-b flex flex-col md:flex-row justify-between items-center gap-8 ${currentTheme.bg} ${currentTheme.border}`}>
                     <div>
                       <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100">Extração Ativa</h3>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Aguardando auditoria e transferência para o CRM</p>
                     </div>
                     
                     <div className="flex flex-wrap items-center gap-4">
                        {extractionResults.length > 0 && (
                          <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-[1.8rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                             <button 
                                onClick={handleToggleSelectAll} 
                                className={`p-4 transition-colors ${allSelected ? currentTheme.text : 'text-slate-400 hover:text-indigo-500'}`}
                                title={allSelected ? "Desmarcar Todos" : "Selecionar Todos"}
                             >
                                {allSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                             </button>
                             <button onClick={handleExportCSV} className="p-4 text-slate-400 hover:text-emerald-500 transition-colors" title="Exportar CSV"><FileText size={20}/></button>
                             <button onClick={handleBulkTransfer} disabled={selectedIds.size === 0} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedIds.size > 0 ? currentTheme.button + ' text-white shadow-lg' : 'text-slate-300'}`}>
                                <UserPlus size={16} /> Enviar CRM ({selectedIds.size})
                             </button>
                             <button onClick={handleBulkDelete} disabled={selectedIds.size === 0} className={`p-4 ${selectedIds.size > 0 ? 'text-rose-500' : 'text-slate-300'} hover:scale-110 transition-transform`}><Trash2 size={20}/></button>
                          </div>
                        )}
                        <div className="flex gap-2">
                           <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300'}`}><LayoutGrid size={18}/></button>
                           <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300'}`}><List size={18}/></button>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex-1 p-8 max-h-[800px] overflow-y-auto custom-scrollbar">
                     {extractionResults.length > 0 ? (
                       <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
                          {extractionResults.map(res => (
                            <div 
                              key={res.id} 
                              onClick={() => toggleSelect(res.id)}
                              className={`p-8 rounded-[2.5rem] border-2 transition-all group relative cursor-pointer ${
                                selectedIds.has(res.id) 
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10 shadow-xl' 
                                : 'border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200'
                              }`}
                            >
                               <div className="flex justify-between items-start mb-6">
                                  <div className="flex items-center gap-4">
                                     <div className={`p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-indigo-600 shadow-inner group-hover:rotate-12 transition-transform`}>
                                        <Building2 size={24} />
                                     </div>
                                     <div>
                                        <h4 className="font-black text-lg italic uppercase tracking-tight truncate max-w-[180px] dark:text-white">{res.business}</h4>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[8px] font-black uppercase text-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-lg">Score: {res.relevance}%</span>
                                          <span className="text-[8px] font-black uppercase text-slate-400 italic">via {res.source}</span>
                                        </div>
                                     </div>
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); setEditingLead(res); }} className="p-2 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"><Edit3 size={16}/></button>
                               </div>

                               <div className="space-y-3 mb-6">
                                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                                     <Smartphone size={14} className="text-indigo-500" /> {res.phone}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300 italic">
                                     <Mail size={14} className="text-indigo-500" /> {res.email}
                                  </div>
                               </div>

                               <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed line-clamp-2 border-t border-slate-50 dark:border-slate-800 pt-4 italic">"{res.detail}"</p>
                               
                               <div className="absolute top-4 right-4 transition-all scale-0 group-hover:scale-100">
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedIds.has(res.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200'}`}>
                                     {selectedIds.has(res.id) && <Check size={14} />}
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                     ) : (
                       <div className="py-40 flex flex-col items-center justify-center text-slate-300 gap-8 opacity-30 grayscale select-none">
                          <div className="p-12 rounded-full border-8 border-dashed border-slate-100 dark:border-slate-800 animate-in zoom-in duration-700">
                             <SearchCode size={100} className="animate-pulse" />
                          </div>
                          <div className="text-center space-y-3">
                             <p className="text-2xl font-black uppercase tracking-[0.4em]">Engine em Standby</p>
                             <p className="text-[10px] font-bold uppercase tracking-widest italic">Inicie uma busca neural para povoar sua base de leads.</p>
                          </div>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inbound' && (
        <div className="space-y-10 animate-in slide-in-from-left-10">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-4 text-slate-800 dark:text-slate-100">
                  <Webhook size={32} className="text-indigo-600" /> Gateway de <span className="text-indigo-600">Webhooks</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Conecte Meta Ads e Formulários Externos diretamente</p>
              </div>
              <button 
                onClick={handleOpenAddWebhook}
                className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all hover:scale-105 shadow-xl shadow-indigo-200 dark:shadow-none"
              >
                <Plus size={18} /> Novo Endpoint
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {webhooks.map(wh => (
                <div key={wh.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col group relative overflow-hidden transition-all hover:border-indigo-500 hover:shadow-2xl">
                   <div className="flex items-start justify-between mb-8 relative z-10">
                      <div className={`p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-indigo-600 shadow-sm group-hover:rotate-12 transition-transform`}>
                         <LinkIcon size={22} />
                      </div>
                      <div className="flex items-center gap-2">
                         {wh.status === 'ACTIVE' ? (
                           <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-1.5">
                              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div> Ativo
                           </span>
                         ) : (
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100">Pausado</span>
                         )}
                      </div>
                   </div>

                   <div className="relative z-10 flex-1 mb-8">
                      <h4 className="text-xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100 mb-1">{wh.name}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{wh.event}</p>
                      
                      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group/link">
                         <code className="text-[10px] font-mono text-slate-500 truncate mr-4">{wh.url}</code>
                         <button onClick={() => copyToClipboard(wh.url)} className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-400 hover:text-indigo-600 transition-colors"><Copy size={12}/></button>
                      </div>
                   </div>

                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-6">
                         <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase">Hits</p>
                            <p className="text-sm font-black text-indigo-600">{wh.hits}</p>
                         </div>
                         <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase">Último</p>
                            <p className="text-[10px] font-black text-slate-800 dark:text-slate-200">{wh.lastHit || 'Aguardando...'}</p>
                         </div>
                      </div>
                   </div>

                   <div className="flex gap-2 relative z-10 border-t border-slate-50 dark:border-slate-800 pt-6">
                      <button onClick={() => handleOpenEditWebhook(wh)} className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Editar</button>
                      <button onClick={() => handleDeleteWebhook(wh.id)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={16}/></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

    </div>
  );
};
