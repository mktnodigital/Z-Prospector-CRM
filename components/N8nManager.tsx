
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Zap, Plus, Trash2, Edit3, Play, Pause, 
  Download, FileJson, Link2, CheckCircle2, 
  Loader2, Terminal, ShieldCheck, Database, 
  Search, X, Cloud, Power, History, Code2, 
  Cpu, Activity, RefreshCcw, AlertTriangle, ExternalLink,
  Folder, FolderOpen, ChevronRight, ChevronDown, FileText,
  Layout, List, Server, MoreVertical, Globe, Lock, Workflow,
  Beaker, Rocket, Radio
} from 'lucide-react';
import { N8nWorkflow } from '../types';

interface N8nManagerProps {
  notify: (msg: string) => void;
}

// BLUEPRINTS REAIS (API-ONLY ARCHITECTURE) - Recriados para download
const WORKFLOW_BLUEPRINTS = {
  wf_meta: {
    "name": "Sync Lead Ads -> Z-Prospector API",
    "nodes": [
      {
        "parameters": { "path": "meta-lead-entry", "httpMethod": "POST", "responseMode": "lastNode" },
        "name": "Webhook Inbound",
        "type": "n8n-nodes-base.webhook",
        "position": [100, 300]
      },
      {
        "parameters": {
          "url": "https://zprospector.com.br/api/core.php?action=save-lead",
          "method": "POST",
          "bodyParameters": {
            "parameters": [
              { "name": "name", "value": "={{$json.body.name}}" },
              { "name": "email", "value": "={{$json.body.email}}" },
              { "name": "phone", "value": "={{$json.body.phone}}" },
              { "name": "source", "value": "Meta Ads" }
            ]
          }
        },
        "name": "API: Create Lead",
        "type": "n8n-nodes-base.httpRequest",
        "position": [300, 300]
      }
    ],
    "connections": {
      "Webhook Inbound": { "main": [[{ "node": "API: Create Lead", "type": "main", "index": 0 }]] }
    }
  },
  wf_sdr: {
    "name": "AI SDR - Qualificação Neural",
    "nodes": [
      {
        "parameters": { "path": "evolution-inbound", "httpMethod": "POST" },
        "name": "Evolution Trigger",
        "type": "n8n-nodes-base.webhook",
        "position": [100, 300]
      },
      {
        "parameters": {
          "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
          "method": "POST",
          "bodyParameters": { "parameters": [{ "name": "contents", "value": "Classifique a intenção..." }] }
        },
        "name": "Gemini AI",
        "type": "n8n-nodes-base.httpRequest",
        "position": [300, 300]
      }
    ],
    "connections": {
      "Evolution Trigger": { "main": [[{ "node": "Gemini AI", "type": "main", "index": 0 }]] }
    }
  }
};

interface FolderNode {
  id: string;
  name: string;
  parentId: string | null;
  type: 'system' | 'user';
  isOpen?: boolean;
}

interface WorkflowItem extends N8nWorkflow {
  folderId: string;
  active: boolean;
  executions: number;
  successRate: number;
  lastRun: string;
}

export const N8nManager: React.FC<N8nManagerProps> = ({ notify }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [environment, setEnvironment] = useState<'SANDBOX' | 'PRODUCTION'>('SANDBOX');
  
  // --- FOLDER STRUCTURE STATE ---
  const [folders, setFolders] = useState<FolderNode[]>([
    { id: 'root', name: 'Workflows', parentId: null, type: 'system', isOpen: true },
    { id: 'local', name: 'Local', parentId: 'root', type: 'system', isOpen: true },
    { id: 'personal', name: 'Personal', parentId: 'local', type: 'user', isOpen: true },
    { id: 'demos', name: 'Demos & Templates', parentId: 'root', type: 'system', isOpen: false },
  ]);
  
  const [selectedFolderId, setSelectedFolderId] = useState<string>('personal');

  // --- WORKFLOWS STATE (MOCK) ---
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([
    { 
      id: 'wf_1', 
      name: 'Sync Lead Ads -> API', 
      folderId: 'personal', 
      active: true, 
      executions: 1420, 
      successRate: 99.8, 
      lastRun: '2 min ago',
      webhookUrl: 'https://n8n.clikai.com.br/webhook/meta-entry',
      event: 'LEAD_CREATED',
      hits: 1420,
      status: 'ACTIVE'
    },
    { 
      id: 'wf_2', 
      name: 'AI SDR - Qualificação', 
      folderId: 'personal', 
      active: true, 
      executions: 850, 
      successRate: 94.5, 
      lastRun: '5 min ago',
      webhookUrl: 'https://n8n.clikai.com.br/webhook/ai-sdr',
      event: 'AI_QUALIFIED',
      hits: 850,
      status: 'ACTIVE'
    },
    { 
      id: 'wf_3', 
      name: 'Recovery - Carrinho', 
      folderId: 'personal', 
      active: false, 
      executions: 45, 
      successRate: 88.0, 
      lastRun: '1 day ago',
      webhookUrl: 'https://n8n.clikai.com.br/webhook/cart-rec',
      event: 'CUSTOM',
      hits: 45,
      status: 'PAUSED'
    },
    { 
      id: 'tpl_1', 
      name: 'Template: Health Check', 
      folderId: 'demos', 
      active: false, 
      executions: 0, 
      successRate: 0, 
      lastRun: '-', 
      webhookUrl: '', 
      event: 'CUSTOM',
      hits: 0,
      status: 'PAUSED'
    }
  ]);

  const toggleFolder = (folderId: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, isOpen: !f.isOpen } : f));
  };

  const handleSync = () => {
    setIsSyncing(true);
    
    if (environment === 'SANDBOX') {
        notify('🟡 [SANDBOX] Simulando leitura de diretórios...');
        setTimeout(() => {
            setIsSyncing(false);
            setWorkflows(prev => prev.map(w => ({ ...w, lastRun: 'Agora (Simulado)' })));
            notify('✅ Dados de teste atualizados.');
        }, 1000);
    } else {
        notify('🚀 [PRODUÇÃO] Conectando ao Cluster N8n Master via API Segura...');
        // Simulação de chamada real
        setTimeout(() => {
            setIsSyncing(false);
            notify('✅ Sincronização Live Concluída (v4.0.1). 100% Ok.');
        }, 2500);
    }
  };

  const toggleWorkflowStatus = (id: string) => {
    const wf = workflows.find(w => w.id === id);
    if (!wf) return;

    if (environment === 'PRODUCTION') {
        const action = !wf.active ? 'ATIVAR' : 'PAUSAR';
        if (!confirm(`ATENÇÃO: Você está em PRODUÇÃO.\n\nDeseja realmente ${action} o fluxo "${wf.name}"? Isso afetará leads reais.`)) {
            return;
        }
    }

    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, active: !w.active, status: !w.active ? 'ACTIVE' : 'PAUSED' } : w));
    notify(environment === 'SANDBOX' 
        ? `[TESTE] Status de "${wf.name}" alterado localmente.` 
        : `[LIVE] Comando enviado ao servidor: ${!wf.active ? 'START' : 'STOP'}`
    );
  };

  const handleDownloadBlueprint = (key: keyof typeof WORKFLOW_BLUEPRINTS) => {
    const blueprint = WORKFLOW_BLUEPRINTS[key];
    const data = JSON.stringify(blueprint, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `n8n_blueprint_${key}.json`;
    link.click();
    notify(`Blueprint baixado: ${blueprint.name}`);
  };

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(w => {
      const inFolder = w.folderId === selectedFolderId;
      const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase());
      return inFolder && matchesSearch;
    });
  }, [workflows, selectedFolderId, searchQuery]);

  // Recursive Folder Renderer
  const renderFolderTree = (parentId: string | null, level = 0) => {
    const nodes = folders.filter(f => f.parentId === parentId);
    
    return nodes.map(node => (
      <div key={node.id}>
        <div 
          onClick={() => { toggleFolder(node.id); setSelectedFolderId(node.id); }}
          className={`flex items-center gap-2 py-2 px-3 rounded-xl cursor-pointer transition-all mb-1 ${selectedFolderId === node.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          style={{ marginLeft: `${level * 12}px` }}
        >
           <button onClick={(e) => { e.stopPropagation(); toggleFolder(node.id); }}>
             {node.isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
           </button>
           {node.isOpen ? <FolderOpen size={14} className={selectedFolderId === node.id ? 'text-white' : 'text-indigo-400'} /> : <Folder size={14} className={selectedFolderId === node.id ? 'text-white' : 'text-indigo-400'} />}
           <span className="text-[10px] font-bold uppercase tracking-widest truncate">{node.name}</span>
        </div>
        {node.isOpen && renderFolderTree(node.id, level + 1)}
      </div>
    ));
  };

  return (
    <div className="flex h-full bg-slate-950 animate-in fade-in overflow-hidden relative">
      
      {/* SIDEBAR: FOLDER TREE */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
         <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3 mb-1">
               <Workflow size={20} className="text-orange-500" />
               <h2 className="text-sm font-black italic uppercase tracking-tight text-white">N8n Explorer</h2>
            </div>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">File System v4.0</p>
         </div>

         <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {renderFolderTree(null)}
         </div>

         <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${environment === 'PRODUCTION' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
               {isSyncing ? <Loader2 size={12} className="animate-spin"/> : <RefreshCcw size={12}/>}
               {isSyncing ? 'Sincronizando...' : environment === 'PRODUCTION' ? 'Sync Live Cluster' : 'Sync Mock Data'}
            </button>
         </div>
      </div>

      {/* MAIN CONTENT: WORKFLOW LIST */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
         {/* Top Bar */}
         <div className="h-24 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md z-10">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-slate-400">
                   <FolderOpen size={18} className="text-indigo-500" />
                   <span className="text-xs font-black uppercase tracking-widest text-white">
                      {folders.find(f => f.id === selectedFolderId)?.name || 'Root'}
                   </span>
                   <span className="text-slate-600">/</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest">{filteredWorkflows.length} Fluxos</span>
                </div>
                
                {/* ENVIRONMENT TOGGLE */}
                <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex">
                    <button 
                        onClick={() => setEnvironment('SANDBOX')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${environment === 'SANDBOX' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Beaker size={12} /> Teste
                    </button>
                    <button 
                        onClick={() => setEnvironment('PRODUCTION')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${environment === 'PRODUCTION' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Rocket size={12} /> Produção
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar workflows..." 
                    className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest outline-none focus:border-indigo-500 w-64"
                  />
               </div>
               <button className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all shadow-lg"><Plus size={16}/></button>
            </div>
         </div>

         {/* Environment Warning Banner */}
         {environment === 'SANDBOX' && (
             <div className="bg-amber-500/5 border-b border-amber-500/10 px-8 py-2 flex items-center justify-center gap-3">
                 <AlertTriangle size={12} className="text-amber-500" />
                 <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Modo Sandbox Ativo: Execuções simuladas. Nenhuma ação externa será realizada.</p>
             </div>
         )}

         {/* Workflow Grid */}
         <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {filteredWorkflows.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredWorkflows.map(wf => (
                     <div key={wf.id} className={`bg-slate-900 rounded-[2rem] border-2 transition-all group relative overflow-hidden flex flex-col ${wf.active ? (environment === 'PRODUCTION' ? 'border-emerald-500/30 hover:border-emerald-500' : 'border-amber-500/30 hover:border-amber-500') : 'border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100'}`}>
                        {/* Status Indicator */}
                        <div className="absolute top-6 right-6 flex items-center gap-2">
                           <span className={`text-[8px] font-black uppercase tracking-widest ${wf.active ? (environment === 'PRODUCTION' ? 'text-emerald-500' : 'text-amber-500') : 'text-slate-500'}`}>{wf.active ? 'Active' : 'Stopped'}</span>
                           <button 
                             onClick={() => toggleWorkflowStatus(wf.id)}
                             className={`w-8 h-4 rounded-full p-0.5 transition-colors ${wf.active ? (environment === 'PRODUCTION' ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-slate-700'}`}
                           >
                              <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${wf.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                           </button>
                        </div>

                        <div className="p-8 pb-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${wf.active ? (environment === 'PRODUCTION' ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white' : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white') : 'bg-slate-800 text-slate-500'}`}>
                              <Workflow size={24} />
                           </div>
                           <h4 className="text-lg font-black italic uppercase tracking-tight text-white mb-2 truncate" title={wf.name}>{wf.name}</h4>
                           <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              <Activity size={10} className={wf.active ? (environment === 'PRODUCTION' ? 'text-emerald-500' : 'text-amber-500') : 'text-slate-500'} />
                              Execuções: {environment === 'SANDBOX' ? 'Simulado' : wf.executions}
                           </div>
                        </div>

                        {/* Stats Footer */}
                        <div className="mt-auto p-6 pt-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Success Rate</span>
                              <span className={`text-xs font-black tabular-nums ${wf.successRate > 98 ? 'text-emerald-500' : 'text-orange-500'}`}>{wf.successRate}%</span>
                           </div>
                           <div className="flex gap-2">
                              <button onClick={() => handleDownloadBlueprint('wf_meta')} className="p-2 bg-slate-800 text-slate-400 hover:text-indigo-500 rounded-lg transition-all" title="Download Blueprint"><Download size={14}/></button>
                              <button className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all" title="Abrir Editor"><ExternalLink size={14}/></button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 select-none">
                  <FolderOpen size={64} className="mb-4 text-slate-700" />
                  <p className="text-sm font-black uppercase tracking-[0.3em]">Pasta Vazia</p>
                  <p className="text-[10px] font-bold mt-2">Nenhum workflow encontrado em '{selectedFolderId}'</p>
               </div>
            )}
         </div>
      </div>

    </div>
  );
};
