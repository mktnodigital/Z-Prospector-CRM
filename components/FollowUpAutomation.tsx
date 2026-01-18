
import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, MessageSquare, Play, Plus, Split, Bot, 
  X, Trash2, Loader2, Sparkles, Brain, Layers, 
  Send, Code, Rocket, CheckCircle2, History,
  ArrowRight, MousePointer2, Settings, Monitor,
  Smartphone, Database, Globe, Filter, AlertCircle,
  CloudLightning, RefreshCcw, Save, ZoomIn, ZoomOut, Maximize, Move,
  ChevronRight, Box, Type
} from 'lucide-react';

interface FlowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'ai' | 'n8n';
  label: string;
  description: string;
  icon: any;
  status?: 'idle' | 'processing' | 'success';
}

interface FlowBlueprint {
  id: string;
  name: string;
  tagline: string;
  category: 'Vendas' | 'Atendimento' | 'Engenharia';
  nodes: FlowNode[];
}

const NODE_TYPES = [
  { type: 'ai' as const, label: 'Inteligência IA', desc: 'Processamento Gemini 3.0', icon: Brain },
  { type: 'action' as const, label: 'Ação WhatsApp', desc: 'Envio de Mensagem/Arquivo', icon: MessageSquare },
  { type: 'condition' as const, label: 'Filtro Condicional', desc: 'Lógica IF/ELSE', icon: Split },
  { type: 'n8n' as const, label: 'Integração n8n', desc: 'Webhook Externo', icon: Code },
];

const MASTER_BLUEPRINTS: FlowBlueprint[] = [
  {
    id: 'bp_sdr',
    name: 'SDR Neural v2.4',
    tagline: 'Qualificação e Distribuição Autônomo',
    category: 'Vendas',
    nodes: [
      { id: '1', type: 'trigger', label: 'Nova Conversa Evolution', description: 'Gatilho via socket clikai.com.br', icon: Zap },
      { id: '2', type: 'ai', label: 'Análise de Sentimento Gemini', description: 'Identifica urgência e perfil', icon: Brain },
      { id: '3', type: 'condition', label: 'Score > 80?', description: 'Filtro de leads quentes', icon: Split },
      { id: '4', type: 'action', label: 'Notificar Unidade', description: 'Alerta push para o vendedor', icon: Smartphone }
    ]
  },
  {
    id: 'bp_recovery',
    name: 'Master Recovery',
    tagline: 'Recuperação de Carrinho Abandonado',
    category: 'Vendas',
    nodes: [
      { id: '1', type: 'trigger', label: 'Carrinho Abandonado', description: 'Webhook do Checkout Master', icon: CloudLightning },
      { id: '2', type: 'ai', label: 'Persuasão Neural', description: 'Gera oferta personalizada', icon: Sparkles },
      { id: '3', type: 'action', label: 'Enviar WhatsApp Oficial', description: 'Template de alta conversão', icon: MessageSquare }
    ]
  }
];

const NODE_STYLE_MAP = {
  trigger: { bg: 'bg-indigo-50 dark:bg-indigo-900/40', text: 'text-indigo-600', border: 'border-indigo-100 dark:border-indigo-800' },
  ai: { bg: 'bg-purple-50 dark:bg-purple-900/40', text: 'text-purple-600', border: 'border-purple-100 dark:border-purple-800' },
  condition: { bg: 'bg-orange-50 dark:bg-orange-900/40', text: 'text-orange-600', border: 'border-orange-100 dark:border-orange-800' },
  action: { bg: 'bg-emerald-50 dark:bg-emerald-900/40', text: 'text-emerald-600', border: 'border-emerald-100 dark:border-emerald-800' },
  n8n: { bg: 'bg-amber-50 dark:bg-amber-900/40', text: 'text-amber-600', border: 'border-amber-100 dark:border-amber-800' }
};

export const FollowUpAutomation: React.FC<{ niche?: string }> = ({ niche = 'Geral' }) => {
  const [activeFlow, setActiveFlow] = useState<FlowNode[]>(MASTER_BLUEPRINTS[0].nodes);
  const [activeBlueprintId, setActiveBlueprintId] = useState(MASTER_BLUEPRINTS[0].id);
  const [isTesting, setIsTesting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [testNodeId, setTestNodeId] = useState<string | null>(null);
  
  // Modais de Edição e Injeção
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  const [showInjectMenu, setShowInjectMenu] = useState(false);

  // --- SPATIAL STATE (ZOOM & PAN) ---
  const [zoom, setZoom] = useState(0.9);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleZoom = (delta: number) => setZoom(prev => Math.min(Math.max(prev + delta, 0.4), 1.5));
  const resetViewport = () => { setZoom(0.9); setPosition({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.node-element') || (e.target as HTMLElement).closest('.action-btn')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // --- LOGICA DE MANIPULAÇÃO DE NÓS ---
  const handleLoadTemplate = (bp: FlowBlueprint) => {
    setTestNodeId(null);
    setActiveBlueprintId(bp.id);
    setActiveFlow(bp.nodes.map(n => ({ ...n, status: 'idle' })));
    resetViewport();
  };

  const handleNewFlow = () => {
    if (confirm('Deseja limpar o canvas para criar um novo fluxo master?')) {
      setActiveFlow([{ id: `node_${Date.now()}`, type: 'trigger', label: 'Nova Conversa', description: 'Gatilho de entrada', icon: Zap }]);
      setActiveBlueprintId('custom');
      resetViewport();
    }
  };

  const handleDeleteNode = (id: string) => {
    if (activeFlow.length <= 1) return;
    setActiveFlow(prev => prev.filter(n => n.id !== id));
  };

  const handleInjectStep = (typeInfo: typeof NODE_TYPES[0]) => {
    const newNode: FlowNode = {
      id: `node_${Date.now()}`,
      type: typeInfo.type,
      label: typeInfo.label,
      description: typeInfo.desc,
      icon: typeInfo.icon,
      status: 'idle'
    };
    setActiveFlow(prev => [...prev, newNode]);
    setShowInjectMenu(false);
  };

  const handleSaveNodeConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode) return;
    setActiveFlow(prev => prev.map(n => n.id === editingNode.id ? editingNode : n));
    setEditingNode(null);
  };

  const runFlowTest = async () => {
    setIsTesting(true);
    setActiveFlow(prev => prev.map(n => ({ ...n, status: 'idle' })));
    for (const node of activeFlow) {
      setTestNodeId(node.id);
      setActiveFlow(prev => prev.map(n => n.id === node.id ? { ...n, status: 'processing' } : n));
      await new Promise(r => setTimeout(r, 800));
      setActiveFlow(prev => prev.map(n => n.id === node.id ? { ...n, status: 'success' } : n));
    }
    setTestNodeId(null);
    setIsTesting(false);
  };

  const handlePublish = () => {
    if (activeFlow.length < 2) {
      alert('⚠️ Erro de Arquitetura: O fluxo deve conter pelo menos 1 Gatilho e 1 Ação.');
      return;
    }
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      alert('🚀 Automação Master propagada com sucesso para clikai.com.br! Engine v2.4 sincronizada.');
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-955 overflow-hidden select-none">
      
      {/* MODAL CONFIGURAÇÃO DE NÓ */}
      {editingNode && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl p-12 relative border border-white/10">
              <button onClick={() => setEditingNode(null)} className="absolute top-10 right-10 p-2 text-slate-400 hover:text-rose-500 transition-all"><X size={24} /></button>
              <div className="flex items-center gap-4 mb-10">
                 <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Settings size={28}/></div>
                 <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight">Configurar Nó</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Ajuste técnico do passo da automação</p>
                 </div>
              </div>
              <form onSubmit={handleSaveNodeConfig} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-4">Rótulo Visual</label>
                    <input value={editingNode.label} onChange={e => setEditingNode({...editingNode, label: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-4">Descrição de Fluxo</label>
                    <input value={editingNode.description} onChange={e => setEditingNode({...editingNode, description: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10" />
                 </div>
                 <button type="submit" className="w-full py-6 bg-indigo-600 text-white font-black rounded-[2rem] shadow-xl uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all">Sincronizar Arquitetura</button>
              </form>
           </div>
        </div>
      )}

      {/* HEADER INTEGRADO */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-6 z-20 shadow-sm">
         <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl rotate-3">
               <Layers size={24} />
            </div>
            <div>
               <h1 className="text-xl font-black italic uppercase tracking-tight">Flow Builder <span className="text-indigo-600">Master</span></h1>
               <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Engine v2.4 • Dynamic Orchestration</p>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <button 
              onClick={runFlowTest}
              disabled={isTesting}
              className="action-btn flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-50 transition-all"
            >
               {isTesting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} className="text-indigo-600" />}
               Simular
            </button>
            <button 
              onClick={handlePublish}
              disabled={isPublishing || isTesting}
              className="action-btn flex items-center gap-3 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
               {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
               Publicar
            </button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR DE BLUEPRINTS */}
        <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 overflow-y-auto no-scrollbar">
           <div className="flex items-center gap-3 mb-8">
              <Sparkles className="text-indigo-600" size={18} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Templates Master</h3>
           </div>

           <div className="space-y-4">
              {MASTER_BLUEPRINTS.map(bp => (
                <div 
                  key={bp.id} 
                  onClick={() => handleLoadTemplate(bp)}
                  className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all group relative overflow-hidden ${activeBlueprintId === bp.id ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/20 shadow-md' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200'}`}
                >
                   <div className="flex justify-between items-start mb-4">
                      <span className={`text-[7px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${bp.category === 'Vendas' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>{bp.category}</span>
                   </div>
                   <h4 className="text-sm font-black italic uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{bp.name}</h4>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 leading-relaxed italic">{bp.tagline}</p>
                </div>
              ))}

              <button 
                onClick={handleNewFlow}
                className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-indigo-600 hover:border-indigo-300 transition-all group"
              >
                 <Plus size={20} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Novo Fluxo Master</span>
              </button>
           </div>
        </div>

        {/* CANVAS DE EDIÇÃO / FLOW VISUAL */}
        <div 
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex-1 bg-slate-50 dark:bg-slate-955 relative overflow-hidden flex items-center justify-center cursor-move ${isDragging ? 'cursor-grabbing' : ''}`}
        >
           
           {/* Grid de fundo Dinâmico */}
           <div 
             className="absolute inset-0 opacity-[0.05] pointer-events-none transition-transform duration-0" 
             style={{ 
               backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', 
               backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
               transform: `translate(${position.x}px, ${position.y}px)`
             }}
           ></div>

           {/* ZOOM CONTROLS */}
           <div className="absolute bottom-8 left-8 flex flex-col gap-2 z-50">
              <button onClick={() => handleZoom(0.1)} className="action-btn p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600 transition-all hover:scale-110"><ZoomIn size={20}/></button>
              <button onClick={() => handleZoom(-0.1)} className="action-btn p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600 transition-all hover:scale-110"><ZoomOut size={20}/></button>
              <button onClick={resetViewport} className="action-btn p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600 transition-all hover:scale-110"><Maximize size={20}/></button>
           </div>

           {/* FLOW NODES CONTAINER (TRANSFORMÁVEL) */}
           <div 
             className="relative z-10 flex flex-col items-center gap-10 transition-transform duration-0 origin-center"
             style={{ 
               transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`
             }}
           >
              {activeFlow.map((node, i) => {
                const styles = NODE_STYLE_MAP[node.type as keyof typeof NODE_STYLE_MAP] || NODE_STYLE_MAP.trigger;
                return (
                  <React.Fragment key={node.id}>
                    {i > 0 && (
                      <div className="h-10 w-0.5 bg-slate-200 dark:bg-slate-800 relative">
                         <div className={`absolute inset-0 bg-indigo-500 transition-all duration-500 ${node.status === 'success' || node.status === 'processing' ? 'h-full opacity-100' : 'h-0 opacity-0'}`}></div>
                         <ArrowRight className="absolute -bottom-3 -left-2 text-slate-300 rotate-90" size={16} />
                      </div>
                    )}
                    
                    <div className={`node-element w-[380px] bg-white dark:bg-slate-900 border-2 rounded-[2rem] p-6 shadow-md transition-all duration-300 relative group/node ${testNodeId === node.id ? 'border-indigo-600 scale-105 shadow-2xl z-20' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-400'}`}>
                       
                       <div className={`absolute -top-3 left-8 px-3 py-1 rounded-lg border-2 ${styles.bg} ${styles.text} ${styles.border} text-[7px] font-black uppercase tracking-[0.2em] shadow-sm`}>
                          {node.type}
                       </div>

                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-5">
                             <div className={`p-4 rounded-2xl ${styles.bg} ${styles.text} shadow-inner group-hover/node:rotate-6 transition-transform`}>
                                <node.icon size={22} />
                             </div>
                             <div className="space-y-0.5">
                                <h4 className="text-sm font-black italic uppercase tracking-tight">{node.label}</h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic leading-none">{node.description}</p>
                             </div>
                          </div>

                          <div className="flex items-center gap-2">
                             {node.status === 'processing' && <Loader2 size={14} className="animate-spin text-indigo-500" />}
                             {node.status === 'success' && <CheckCircle2 size={18} className="text-emerald-500 animate-in zoom-in" />}
                             <button 
                                onClick={() => setEditingNode(node)}
                                className="action-btn p-2 text-slate-300 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                             >
                                <Settings size={16}/>
                             </button>
                          </div>
                       </div>

                       <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover/node:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDeleteNode(node.id)}
                            className="action-btn p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 text-rose-500 hover:scale-110 transition-transform"
                          >
                            <Trash2 size={12}/>
                          </button>
                       </div>
                    </div>
                  </React.Fragment>
                );
              })}

              <div className="relative">
                <button 
                  onClick={() => setShowInjectMenu(!showInjectMenu)}
                  className="action-btn group mt-6 flex items-center gap-3 px-8 py-3 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-full text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-all shadow-sm"
                >
                   <Plus size={16} className={showInjectMenu ? 'rotate-45' : 'group-hover:rotate-90 transition-transform'} />
                   <span className="text-[9px] font-black uppercase tracking-widest">Injetar Novo Passo</span>
                </button>

                {showInjectMenu && (
                  <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-64 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-4 z-[60] animate-in zoom-in-95">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-4 mb-3">Selecione o Tipo de Nó</p>
                     <div className="grid grid-cols-1 gap-2">
                        {NODE_TYPES.map(nt => (
                          <button 
                            key={nt.type}
                            onClick={() => handleInjectStep(nt)}
                            className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group/item text-left"
                          >
                             <div className={`p-2 rounded-lg ${NODE_STYLE_MAP[nt.type].bg} ${NODE_STYLE_MAP[nt.type].text}`}><nt.icon size={16}/></div>
                             <div>
                                <p className="text-[10px] font-black uppercase italic leading-none">{nt.label}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{nt.desc}</p>
                             </div>
                             <ChevronRight size={14} className="ml-auto text-slate-200 group-hover/item:translate-x-1 transition-transform" />
                          </button>
                        ))}
                     </div>
                  </div>
                )}
              </div>
           </div>

           {/* Floating Info */}
           <div className="absolute bottom-8 right-8 flex gap-4">
              <div className="px-5 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl flex items-center gap-3">
                 <div className="p-1.5 bg-indigo-600 text-white rounded-md"><Move size={12}/></div>
                 <div className="space-y-0.5">
                    <p className="text-[7px] font-black uppercase text-slate-400">Visual</p>
                    <p className="text-[9px] font-black uppercase text-indigo-600">Zoom: {Math.round(zoom * 100)}%</p>
                 </div>
              </div>
              <div className="px-5 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl flex items-center gap-3">
                 <div className="p-1.5 bg-orange-600 text-white rounded-md"><Code size={12}/></div>
                 <div className="space-y-0.5">
                    <p className="text-[7px] font-black uppercase text-slate-400">Endpoint</p>
                    <p className="text-[9px] font-black uppercase text-orange-600">clikai.com.br/wf-01</p>
                 </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};
