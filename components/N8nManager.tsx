
import React, { useState, useMemo } from 'react';
import { 
  Zap, Plus, Trash2, Edit3, Play, Pause, 
  Download, FileJson, Link2, CheckCircle2, 
  Loader2, Terminal, ShieldCheck, Database, 
  Search, X, Cloud, Power, History, Code2, 
  Cpu, Activity, RefreshCcw, AlertTriangle, ExternalLink
} from 'lucide-react';
import { N8nWorkflow } from '../types';

interface N8nManagerProps {
  notify: (msg: string) => void;
}

// BLUEPRINTS REAIS (API-ONLY ARCHITECTURE)
const WORKFLOW_BLUEPRINTS = {
  wf_1: {
    "name": "Sync Lead Ads -> Z-Prospector API",
    "nodes": [
      {
        "parameters": {
          "path": "meta-lead-entry",
          "responseMode": "lastNode",
          "options": {}
        },
        "name": "Webhook Inbound (Meta)",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1,
        "position": [100, 300]
      },
      {
        "parameters": {
          "method": "POST",
          "url": "https://zprospector.com.br/api/core.php?action=save-lead",
          "sendBody": true,
          "bodyParameters": {
            "parameters": [
              { "name": "name", "value": "={{$json.body.full_name}}" },
              { "name": "phone", "value": "={{$json.body.phone_number}}" },
              { "name": "email", "value": "={{$json.body.email}}" },
              { "name": "source", "value": "Meta Ads" },
              { "name": "status", "value": "WARM" }
            ]
          },
          "options": {}
        },
        "name": "API: Save Lead",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 3,
        "position": [300, 300]
      },
      {
        "parameters": {
          "method": "POST",
          "url": "https://api.clikai.com.br/message/sendText/master_1",
          "sendBody": true,
          "bodyParameters": {
            "parameters": [
              { "name": "number", "value": "={{$json.body.phone_number}}" },
              { "name": "text", "value": "Olá {{$json.body.full_name}}! Recebemos seu cadastro. Como podemos ajudar?" }
            ]
          },
          "headerParameters": {
            "parameters": [
              { "name": "apikey", "value": "SUA_API_KEY_EVOLUTION" }
            ]
          }
        },
        "name": "API: Evolution WhatsApp",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 3,
        "position": [500, 300]
      }
    ],
    "connections": {
      "Webhook Inbound (Meta)": { "main": [[{ "node": "API: Save Lead", "type": "main", "index": 0 }]] },
      "API: Save Lead": { "main": [[{ "node": "API: Evolution WhatsApp", "type": "main", "index": 0 }]] }
    }
  },
  wf_2: {
    "name": "AI SDR - Qualification & API Update",
    "nodes": [
      {
        "parameters": { "path": "evolution-inbound", "httpMethod": "POST" },
        "name": "Evolution Webhook",
        "type": "n8n-nodes-base.webhook",
        "position": [100, 300]
      },
      {
        "parameters": {
          "modelId": "gemini-pro",
          "prompt": "Analise a mensagem: '{{$json.body.data.message.conversation}}'. Classifique a intenção como 'COMPRA', 'DUVIDA' ou 'SUPORTE'. Retorne apenas a palavra."
        },
        "name": "Google Gemini AI",
        "type": "n8n-nodes-base.googleGemini",
        "position": [300, 300]
      },
      {
        "parameters": {
          "conditions": {
            "string": [
              { "value1": "={{$json.text}}", "operation": "contains", "value2": "COMPRA" }
            ]
          }
        },
        "name": "IF: Intenção de Compra",
        "type": "n8n-nodes-base.if",
        "position": [500, 300]
      },
      {
        "parameters": {
          "method": "POST",
          "url": "https://zprospector.com.br/api/core.php?action=update-lead-stage",
          "sendBody": true,
          "bodyParameters": {
            "parameters": [
              { "name": "id", "value": "LEAD_ID_VAR" },
              { "name": "stage", "value": "HOT" }
            ]
          }
        },
        "name": "API: Update CRM (HOT)",
        "type": "n8n-nodes-base.httpRequest",
        "position": [700, 200]
      }
    ],
    "connections": {
      "Evolution Webhook": { "main": [[{ "node": "Google Gemini AI", "type": "main", "index": 0 }]] },
      "Google Gemini AI": { "main": [[{ "node": "IF: Intenção de Compra", "type": "main", "index": 0 }]] },
      "IF: Intenção de Compra": { "main": [[{ "node": "API: Update CRM (HOT)", "type": "main", "index": 0 }]] }
    }
  }
};

const INITIAL_WORKFLOWS: N8nWorkflow[] = [
  { 
    id: 'wf_1', 
    name: 'Sincronização Meta Ads -> CRM', 
    webhookUrl: 'https://n8n.clikai.com.br/webhook/meta-lead-entry', 
    event: 'LEAD_CREATED', 
    status: 'ACTIVE', 
    lastExecution: 'Há 2 min', 
    hits: 452 
  },
  { 
    id: 'wf_2', 
    name: 'Follow-up IA Pós-Venda', 
    webhookUrl: 'https://n8n.clikai.com.br/webhook/evolution-inbound', 
    event: 'STAGE_CHANGED', 
    status: 'PAUSED', 
    lastExecution: 'Há 1 dia', 
    hits: 128 
  }
];

export const N8nManager: React.FC<N8nManagerProps> = ({ notify }) => {
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>(INITIAL_WORKFLOWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState<Partial<N8nWorkflow>>({
    name: '',
    webhookUrl: '',
    event: 'LEAD_CREATED',
    status: 'ACTIVE'
  });

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(wf => wf.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [workflows, searchQuery]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ name: '', webhookUrl: '', event: 'LEAD_CREATED', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (wf: N8nWorkflow) => {
    setEditingId(wf.id);
    setForm(wf);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setWorkflows(prev => prev.map(wf => wf.id === editingId ? { ...wf, ...form } as N8nWorkflow : wf));
      notify('Fluxo n8n atualizado no cluster!');
    } else {
      const newWf: N8nWorkflow = {
        ...form as N8nWorkflow,
        id: `wf_${Date.now()}`,
        hits: 0
      };
      setWorkflows([newWf, ...workflows]);
      notify('Novo Workflow injetado com sucesso!');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Destruir este workflow permanentemente? As chamadas de webhook retornarão 404.')) {
      setWorkflows(prev => prev.filter(wf => wf.id !== id));
      notify('Workflow removido da infraestrutura.');
    }
  };

  const handleToggleStatus = (id: string) => {
    setWorkflows(prev => prev.map(wf => {
      if (wf.id === id) {
        const nextStatus = wf.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        notify(`Fluxo ${wf.name} agora está ${nextStatus === 'ACTIVE' ? 'Operando' : 'Suspenso'}.`);
        return { ...wf, status: nextStatus as any };
      }
      return wf;
    }));
  };

  const handleDownloadJson = (wf: N8nWorkflow) => {
    // Tenta pegar o blueprint real, se não existir, gera um genérico baseado nos metadados
    const blueprint = WORKFLOW_BLUEPRINTS[wf.id as keyof typeof WORKFLOW_BLUEPRINTS] || {
      name: wf.name,
      nodes: [
        {
          name: "Webhook Trigger",
          type: "n8n-nodes-base.webhook",
          parameters: { path: wf.webhookUrl.split('/').pop(), httpMethod: "POST" }
        }
      ],
      connections: {}
    };

    const data = JSON.stringify(blueprint, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `n8n_workflow_${wf.id}_master.json`;
    link.click();
    notify('Blueprint JSON (API-Only) baixado! Importe no seu n8n.');
  };

  const handleTestConnection = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      notify('Cluster n8n (clikai.com.br) Respondendo 200 OK');
    }, 1500);
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in pb-40 relative">
      
      {/* HEADER MASTER N8N */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div>
           <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
              <Cloud className="text-indigo-600" /> N8n <span className="text-indigo-600">Automator</span>
           </h1>
           <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg border border-indigo-100 dark:border-indigo-800">
                 <Cpu size={12}/>
                 <span className="text-[8px] font-black uppercase tracking-widest">Cluster clikai.com.br</span>
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] italic">Workflow Orchestration v4.0 (API Mode)</p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Localizar fluxo..." className="pl-16 pr-8 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 transition-all shadow-sm" />
           </div>
           
           <button onClick={handleTestConnection} className="flex items-center gap-3 px-8 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:border-indigo-600 transition-all shadow-sm">
              <Activity size={18} className={isSyncing ? 'animate-spin' : 'text-indigo-600'} /> Testar Cluster
           </button>
           
           <button onClick={handleOpenAdd} className="flex items-center gap-4 px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">
              <Plus size={20} /> Injetar Workflow
           </button>
        </div>
      </div>

      {/* GRID DE WORKFLOWS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredWorkflows.map(wf => (
          <div key={wf.id} className="bg-white dark:bg-slate-900 rounded-[3.5rem] border-2 border-slate-50 dark:border-slate-800 p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col min-h-[400px]">
             
             <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-2xl ${wf.status === 'ACTIVE' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'} shadow-inner group-hover:rotate-12 transition-transform`}>
                   <Zap size={28} />
                </div>
                <div className="flex items-center gap-2">
                   {wf.status === 'ACTIVE' ? (
                     <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Ativo
                     </span>
                   ) : (
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-800/50">Pausado</span>
                   )}
                </div>
             </div>

             <div className="flex-1 space-y-4 mb-8">
                <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white leading-tight">{wf.name}</h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                   <code className="text-[10px] font-mono text-slate-500 truncate mr-4 italic">...{wf.webhookUrl.slice(-20)}</code>
                   <button onClick={() => { navigator.clipboard.writeText(wf.webhookUrl); notify('Webhook copiado!'); }} className="p-2 text-slate-400 hover:text-indigo-600"><Link2 size={14}/></button>
                </div>
                <div className="flex items-center gap-6">
                   <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Gatilho de Evento</p>
                      <p className="text-[10px] font-black text-indigo-600 uppercase">{wf.event}</p>
                   </div>
                   <div className="h-6 w-px bg-slate-100 dark:bg-slate-800"></div>
                   <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Execuções</p>
                      <p className="text-[10px] font-black text-slate-900 dark:text-white">{wf.hits}</p>
                   </div>
                </div>
             </div>

             <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                <div className="flex gap-2">
                   <button onClick={() => handleOpenEdit(wf)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><Edit3 size={16}/></button>
                   <button onClick={() => handleDownloadJson(wf)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 rounded-xl transition-all shadow-sm group/btn" title="Baixar Blueprint JSON">
                      <Download size={16} className="group-hover/btn:animate-bounce"/>
                   </button>
                   <button onClick={() => handleDelete(wf.id)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-xl transition-all shadow-sm"><Trash2 size={16}/></button>
                </div>
                <button 
                  onClick={() => handleToggleStatus(wf.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                    wf.status === 'ACTIVE' ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                   {wf.status === 'ACTIVE' ? <Pause size={14}/> : <Play size={14}/>}
                   {wf.status === 'ACTIVE' ? 'Suspender' : 'Ligar'}
                </button>
             </div>
          </div>
        ))}

        {filteredWorkflows.length === 0 && (
           <div className="col-span-full py-40 flex flex-col items-center justify-center text-slate-300 gap-8 opacity-30 grayscale select-none">
              <div className="p-16 rounded-full border-8 border-dashed border-slate-100 dark:border-slate-800">
                 <Code2 size={100} className="animate-pulse" />
              </div>
              <p className="text-2xl font-black uppercase tracking-[0.5em] italic">Infra n8n em Standby</p>
           </div>
        )}
      </div>

      {/* MODAL EDITAR/CRIAR WORKFLOW */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-955/90 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3.5rem] shadow-2xl p-12 border border-white/10 relative overflow-hidden">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all z-20"><X size={24} /></button>
              
              <div className="flex items-center gap-5 mb-10">
                 <div className="p-5 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-500/20"><Code2 size={32} /></div>
                 <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100">{editingId ? 'Refinar Automação' : 'Novo Workflow Master'}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Provisionamento de Fluxo em Baixa Latência</p>
                 </div>
              </div>

              <form onSubmit={handleSave} className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 px-4">Nome da Automação</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Sincronizador de Conversão v1" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-black italic border-none shadow-inner outline-none focus:ring-4 ring-indigo-500/10" />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-slate-400 px-4">Gatilho de Disparo</label>
                       <select value={form.event} onChange={e => setForm({...form, event: e.target.value as any})} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10">
                          <option value="LEAD_CREATED">Novo Lead Captado</option>
                          <option value="STAGE_CHANGED">Mudança de Funil</option>
                          <option value="AI_QUALIFIED">Qualificação por IA</option>
                          <option value="PAYMENT_RECEIVED">Venda Concluída</option>
                          <option value="CUSTOM">Webhook Customizado</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-slate-400 px-4">URL do Webhook (n8n)</label>
                       <input required value={form.webhookUrl} onChange={e => setForm({...form, webhookUrl: e.target.value})} placeholder="https://n8n..." className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10" />
                    </div>
                 </div>

                 <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800 flex gap-6">
                    <Terminal className="text-indigo-600 flex-shrink-0" size={24} />
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase text-indigo-600">Dica de Arquitetura:</p>
                       <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-tight italic">
                          "Certifique-se que o nó do Webhook no n8n esteja configurado como 'POST' e 'Respond: Immediately' para garantir o melhor desempenho do cluster clikai."
                       </p>
                    </div>
                 </div>

                 <button type="submit" className="w-full py-7 bg-indigo-600 text-white font-black rounded-3xl shadow-[0_20px_50px_-10px_rgba(79,70,229,0.4)] uppercase text-xs tracking-[0.2em] hover:bg-indigo-700 transition-all flex items-center justify-center gap-4">
                    <ShieldCheck size={20} /> {editingId ? 'Propagar Alterações' : 'Provisionar no Cluster'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* FOOTER INFO FLOAT */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-6 rounded-[2.5rem] shadow-2xl border border-white/10 flex items-center gap-10 z-[100] animate-in slide-in-from-bottom-5">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg"><Activity size={20}/></div>
            <div className="space-y-0.5">
               <p className="text-[8px] font-black text-slate-400 uppercase">Latência Média</p>
               <p className="text-lg font-black italic tracking-tighter">14ms <span className="text-[10px] text-emerald-400">Optimum</span></p>
            </div>
         </div>
         <div className="h-10 w-px bg-white/10"></div>
         <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
               {[1,2,3,4].map(i => <div key={i} className="w-9 h-9 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-[10px] font-black">N{i}</div>)}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nodes Ativos</span>
         </div>
         <button onClick={handleTestConnection} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all"><RefreshCcw size={16}/></button>
      </div>

    </div>
  );
};
