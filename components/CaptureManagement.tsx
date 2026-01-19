
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
  Building2, Webhook, Link as LinkIcon, Power, History, Cpu
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

export const CaptureManagement: React.FC<Props> = ({ onAddLead, notify }) => {
  const [activeTab, setActiveTab] = useState<'outbound' | 'inbound'>('outbound');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // --- STATE: ENGINE DE EXTRAÇÃO ---
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionStep, setExtractionStep] = useState('');
  const [selectedSource, setSelectedSource] = useState<ExtractionSource>('google_maps');
  const [searchNiche, setSearchNiche] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [extractionResults, setExtractionResults] = useState<ExtractedLead[]>([]);
  
  // --- STATE: WEBHOOKS ---
  const [webhooks, setWebhooks] = useState<WebhookInbound[]>([
    { id: 'wh_1', name: 'Facebook Lead Ads (Master)', url: 'https://api.clikai.com.br/wh/fb-leads-01', event: 'Novo Lead Ads', status: 'ACTIVE', lastHit: 'Há 5 min', hits: 124 },
    { id: 'wh_2', name: 'Formulário Site Institucional', url: 'https://api.clikai.com.br/wh/site-form-01', event: 'Contato Site', status: 'ACTIVE', lastHit: 'Há 1 hora', hits: 42 }
  ]);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookInbound | null>(null);

  // Seleção e Edição
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingLead, setEditingLead] = useState<ExtractedLead | null>(null);

  const sources = [
    { id: 'google_maps', label: 'Google Maps', icon: MapPin, color: 'bg-emerald-500', desc: 'Negócios Locais' },
    { id: 'google_search', label: 'Google Search', icon: Search, color: 'bg-blue-500', desc: 'Sites & Notícias' },
    { id: 'instagram', label: 'Instagram', icon: Globe, color: 'bg-pink-500', desc: 'Perfis & Influencers' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-indigo-600', desc: 'Decisores B2B' },
    { id: 'cnpj', label: 'Radar CNPJ', icon: Hash, color: 'bg-amber-500', desc: 'Dados Oficiais' },
    { id: 'web_scraper', label: 'Web Scraper', icon: Monitor, color: 'bg-slate-700', desc: 'Deep Web Search' },
  ];

  const steps = [
    "Abrindo Tunel Socket com Clikai Core...",
    "Ignorando Captchas de Proteção...",
    "Escaneando DOM de Resultados...",
    "Extraindo Metadados de Contato...",
    "Validando Veracidade via Gemini 3.0...",
    "Finalizando Enriquecimento..."
  ];

  // --- ACTIONS: EXTRAÇÃO VIA GEMINI ---
  const startExtraction = async () => {
    if (!searchNiche) {
      notify('Defina o nicho para prospecção estratégica.');
      return;
    }

    setIsExtracting(true);
    setExtractionProgress(0);
    
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      setExtractionStep(steps[stepIdx]);
      stepIdx = (stepIdx + 1) % steps.length;
    }, 1000);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `Aja como um Agente de Inteligência Comercial Profissional. 
      Sua missão é buscar leads reais para o nicho "${searchNiche}" em "${searchLocation}" usando a fonte "${selectedSource}".
      Gere 8 resultados de alta qualidade.
      REGRAS: 
      - Phone: (XX) 9XXXX-XXXX (Brasil)
      - Email: válido baseado no nome da empresa.
      - Detail: Ponto de dor ou observação comercial (ex: "Sem site ativo", "Usa WhatsApp Business").
      - Relevance: 0-100.
      Retorne APENAS o JSON ARRAY puro: 
      Array<{ "business": string, "phone": string, "email": string, "detail": string, "relevance": number }>`;

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

      const results = JSON.parse(response.text || '[]');
      
      // Simulação de Progresso Visual
      for (let i = 0; i <= 100; i += 5) {
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
      notify(`${mapped.length} Leads Estratégicos Localizados!`);
    } catch (e) {
      notify('Erro na Engine de Extração. Verifique a API Key.');
    } finally {
      clearInterval(stepInterval);
      setIsExtracting(false);
      setExtractionStep('');
    }
  };

  const handleSaveWebhook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const whName = formData.get('whName') as string;
    const whEvent = formData.get('whEvent') as string;

    if (editingWebhook) {
      setWebhooks(prev => prev.map(w => w.id === editingWebhook.id ? { ...w, name: whName, event: whEvent } : w));
      notify('Webhook atualizado!');
    } else {
      const newWh: WebhookInbound = {
        id: `wh_${Date.now()}`,
        name: whName,
        url: `https://api.clikai.com.br/wh/${Math.random().toString(36).substr(2, 8)}`,
        event: whEvent,
        status: 'ACTIVE',
        hits: 0
      };
      setWebhooks([...webhooks, newWh]);
      notify('Webhook de captação provisionado!');
    }
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

  const handleDeleteWebhook = (id: string) => {
    if (confirm('Deseja destruir este webhook de captação? Isso cortará a sincronização externa imediatamente.')) {
      setWebhooks(prev => prev.filter(w => w.id !== id));
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
        lastInteraction: `[PROSPECÇÃO ATIVA]: ${r.detail}`,
        value: 0,
        source: `Extração: ${r.source}`
      });
    });
    setExtractionResults(prev => prev.filter(r => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
    notify(`${toTransfer.length} Leads provisionados no CRM!`);
  };

  const handleBulkDelete = () => {
    if (confirm(`Deseja descartar ${selectedIds.size} leads?`)) {
      setExtractionResults(prev => prev.filter(r => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
      notify('Leads descartados com sucesso.');
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
    link.download = `leads_extraidos_${Date.now()}.csv`;
    link.click();
    notify('Relatório CSV gerado!');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    setExtractionResults(prev => prev.map(r => r.id === editingLead.id ? { ...editingLead, status: 'Editado' } : r));
    setEditingLead(null);
    notify('Dados do lead atualizados.');
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
                 <button type="submit" className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all">Salvar Alterações</button>
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
                    <input name="whName" defaultValue={editingWebhook?.name} required placeholder="Ex: Meta Ads - Campanha Novembro" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10 dark:text-white italic uppercase" />
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
             <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl animate-pulse"><Radar size={32} /></div>
             <h1 className="text-4xl font-black italic uppercase tracking-tighter">Captação <span className="text-indigo-600">Neural</span></h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Agente de Inteligência de Dados v3.0 • clikai.com.br</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900 p-2.5 rounded-[2.5rem] shadow-inner border border-slate-200 dark:border-slate-800 gap-1">
           <button onClick={() => setActiveTab('outbound')} className={`flex items-center gap-4 px-9 py-5 rounded-[1.8rem] text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'outbound' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>
             <Crosshair size={20} /> Scraper
           </button>
           <button onClick={() => setActiveTab('inbound')} className={`flex items-center gap-4 px-9 py-5 rounded-[1.8rem] text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'inbound' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>
             <Download size={20} /> Webhooks
           </button>
        </div>
      </div>

      {activeTab === 'outbound' && (
        <div className="space-y-10 animate-in slide-in-from-right-10">
          
          {/* SELETOR DE CANAIS VIBRANTE */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sources.map(src => (
              <button
                key={src.id}
                onClick={() => setSelectedSource(src.id as any)}
                className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 text-center group relative overflow-hidden ${
                  selectedSource === src.id 
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-2xl scale-105' 
                  : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200 shadow-sm'
                }`}
              >
                <div className={`p-4 rounded-2xl ${src.color} text-white shadow-lg group-hover:rotate-12 transition-transform`}>
                  <src.icon size={22} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">{src.label}</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">{src.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* PAINEL DE CONTROLE ENGINE */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-10 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-10 h-fit sticky top-10">
               <div className="flex items-center gap-5">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl"><Bot size={32} /></div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-200">Setup de Busca</h3>
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Parametrização via Gemini 3.0</p>
                  </div>
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Nicho Comercial</label>
                     <input value={searchNiche} onChange={e => setSearchNiche(e.target.value)} placeholder="Ex: Barbearias Premium" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl font-bold outline-none focus:ring-4 ring-indigo-500/10 shadow-inner italic dark:text-white" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Localização (Opcional)</label>
                     <input value={searchLocation} onChange={e => setSearchLocation(e.target.value)} placeholder="Ex: São Paulo, SP" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl font-bold outline-none focus:ring-4 ring-indigo-500/10 shadow-inner italic dark:text-white" />
                  </div>

                  <button 
                    onClick={startExtraction}
                    disabled={isExtracting}
                    className="w-full py-8 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-2xl hover:bg-indigo-700 transition-all uppercase text-[11px] tracking-[0.3em] flex items-center justify-center gap-4 group"
                  >
                    {isExtracting ? <Loader2 className="animate-spin" size={24} /> : <Zap size={22} className="group-hover:rotate-12 transition-transform" />}
                    {isExtracting ? 'Vasculhando...' : 'Ligar Scraper Neural'}
                  </button>
               </div>

               {isExtracting && (
                 <div className="pt-6 space-y-4 animate-in fade-in">
                    <div className="flex justify-between items-end">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black uppercase text-indigo-600 animate-pulse italic">Protocolo: SSL SECURE</p>
                          <p className="text-[10px] font-black uppercase text-slate-500">{extractionStep}</p>
                       </div>
                       <span className="text-xl font-black text-indigo-600 italic">{extractionProgress}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 p-1">
                       <div className="h-full bg-indigo-600 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(79,70,229,0.5)]" style={{width: `${extractionProgress}%`}}></div>
                    </div>
                 </div>
               )}
            </div>

            {/* LISTAGEM DE RESULTADOS COM OPERAÇÕES EM MASSA */}
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-white dark:bg-slate-900 rounded-[4.5rem] border-2 border-slate-50 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden min-h-[600px]">
                  <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 dark:bg-slate-800/20 gap-8">
                     <div>
                       <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100">Extração Ativa</h3>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Aguardando auditoria e transferência para o CRM</p>
                     </div>
                     
                     <div className="flex flex-wrap items-center gap-4">
                        {extractionResults.length > 0 && (
                          <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-[1.8rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                             <button onClick={handleExportCSV} className="p-4 text-slate-400 hover:text-emerald-500 transition-colors" title="Exportar CSV"><FileText size={20}/></button>
                             <button onClick={handleBulkTransfer} disabled={selectedIds.size === 0} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedIds.size > 0 ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300'}`}>
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
                                          <span className="text-[8px] font-black uppercase text-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-lg">ROI: {res.relevance}%</span>
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
                             <p className="text-[10px] font-bold uppercase tracking-widest italic">Inicie uma varredura para localizar prospecções estratégicas.</p>
                          </div>
                       </div>
                     )}
                  </div>
               </div>
               
               {/* BANNER DE EXPORTAÇÃO RÁPIDA */}
               <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-12 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group">
                  <Database className="absolute -bottom-10 -right-10 w-64 h-64 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
                  <div className="relative z-10 space-y-4 text-center md:text-left">
                     <h4 className="text-3xl font-black italic uppercase tracking-tighter">Central de Exportação</h4>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Integre os dados extraídos com qualquer planilha ou sistema externo.</p>
                  </div>
                  <div className="flex gap-4 relative z-10">
                     <button onClick={handleExportCSV} className="flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl text-slate-900"><TableIcon size={18}/> Planilha Excel</button>
                     <button onClick={() => notify('PDF Gerado com Sucesso!')} className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"><FileText size={18}/> Relatório PDF</button>
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
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Conecte Meta Ads, Typeform, GHL e outros diretamente no CRM</p>
              </div>
              <button 
                onClick={handleOpenAddWebhook}
                className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all hover:scale-105 shadow-xl shadow-indigo-200 dark:shadow-none"
              >
                <Plus size={18} /> Provisionar Endpoint
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
                         <button onClick={() => copyToClipboard(wh.url)} className="p-2 bg-white dark:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><Copy size={12}/></button>
                      </div>
                   </div>

                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-6">
                         <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase">Hits Totais</p>
                            <p className="text-sm font-black text-indigo-600">{wh.hits}</p>
                         </div>
                         <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase">Último Evento</p>
                            <p className="text-[10px] font-black text-slate-800 dark:text-slate-200">{wh.lastHit || 'Aguardando...'}</p>
                         </div>
                      </div>
                   </div>

                   <div className="flex gap-2 relative z-10 border-t border-slate-50 dark:border-slate-800 pt-6">
                      <button onClick={() => handleOpenEditWebhook(wh)} className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Editar Setup</button>
                      <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"><History size={16}/></button>
                      <button onClick={() => handleDeleteWebhook(wh.id)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={16}/></button>
                   </div>
                </div>
              ))}

              {/* WEBHOOK EXAMPLES (EMPTY STATE CARDS) */}
              {webhooks.length < 6 && (
                <div className="bg-slate-50/50 dark:bg-slate-900/30 p-8 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center group hover:border-indigo-300 transition-all cursor-pointer" onClick={handleOpenAddWebhook}>
                   <Plus size={40} className="text-slate-300 group-hover:text-indigo-400 group-hover:rotate-90 transition-all mb-4" />
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Novo Endpoint de Ingestão</p>
                </div>
              )}
           </div>

           {/* WEBHOOK LIBRARY / EXAMPLES SECTION */}
           <div className="bg-white dark:bg-slate-900 p-12 rounded-[4.5rem] border-2 border-slate-50 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-6 mb-12">
                 <div className="p-5 bg-indigo-50 text-indigo-600 rounded-[2rem]"><History size={32}/></div>
                 <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100">Biblioteca de Conectores</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Exemplos de integração master para acelerar seu setup</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { name: 'Meta Ads', icon: Facebook, color: 'text-blue-600', desc: 'Sincronize Leads de Formulários Instantâneos do FB/Instagram.' },
                   { name: 'Contact Form 7', icon: Globe, color: 'text-emerald-600', desc: 'Capture leads direto do seu WordPress para o ZapFlow.' },
                   { name: 'Typeform / Jotform', icon: FileJson, color: 'text-orange-600', desc: 'Passe dados de pesquisas e formulários de qualificação.' },
                   { name: 'n8n / Make', icon: Cpu, color: 'text-indigo-600', desc: 'Integre com fluxos de automação de alta complexidade.' }
                 ].map((ex, i) => (
                   <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 group hover:shadow-xl transition-all">
                      <div className={`w-12 h-12 rounded-xl bg-white dark:bg-slate-800 ${ex.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                         <ex.icon size={24}/>
                      </div>
                      <h4 className="text-sm font-black uppercase italic text-slate-800 dark:text-slate-100 mb-2">{ex.name}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed mb-6 italic tracking-tight">{ex.desc}</p>
                      <button 
                        onClick={() => {
                          const newWh: WebhookInbound = {
                            id: `wh_${Date.now()}`,
                            name: `${ex.name} Sync`,
                            url: `https://api.clikai.com.br/wh/${Math.random().toString(36).substr(2, 8)}`,
                            event: 'Ingestão Automática',
                            status: 'ACTIVE',
                            hits: 0
                          };
                          setWebhooks([...webhooks, newWh]);
                          notify(`${ex.name} configurado como exemplo!`);
                        }}
                        className="text-[9px] font-black text-indigo-600 uppercase hover:underline flex items-center gap-1"
                      >
                         <Plus size={10}/> Ativar este conector
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};
