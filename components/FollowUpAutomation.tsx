
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Zap, MessageSquare, Play, Plus, Split, Bot, 
  X, Trash2, Loader2, Sparkles, Brain, Layers, 
  Send, Code, Rocket, CheckCircle2, History,
  ArrowRight, MousePointer2, Settings, Monitor,
  Smartphone, Database, Globe, Filter, AlertCircle,
  CloudLightning, RefreshCcw, Save, ZoomIn, ZoomOut, Maximize, Move,
  ChevronRight, Box, Type, Grid
} from 'lucide-react';

interface FlowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'ai' | 'n8n';
  label: string;
  description: string;
  icon: any;
  status?: 'idle' | 'processing' | 'success';
  x: number;
  y: number;
}

interface FlowBlueprint {
  id: string;
  name: string;
  tagline: string;
  category: 'Vendas' | 'Atendimento' | 'Engenharia';
  nodes: Omit<FlowNode, 'x' | 'y'>[]; // Blueprints don't store positions initially
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
  trigger: { bg: 'bg-indigo-50 dark:bg-indigo-900/40', text: 'text-indigo-600', border: 'border-indigo-200 dark:border-indigo-800' },
  ai: { bg: 'bg-purple-50 dark:bg-purple-900/40', text: 'text-purple-600', border: 'border-purple-200 dark:border-purple-800' },
  condition: { bg: 'bg-orange-50 dark:bg-orange-900/40', text: 'text-orange-600', border: 'border-orange-200 dark:border-orange-800' },
  action: { bg: 'bg-emerald-50 dark:bg-emerald-900/40', text: 'text-emerald-600', border: 'border-emerald-200 dark:border-emerald-800' },
  n8n: { bg: 'bg-amber-50 dark:bg-amber-900/40', text: 'text-amber-600', border: 'border-amber-200 dark:border-amber-800' }
};

export const FollowUpAutomation: React.FC<{ niche?: string }> = ({ niche = 'Geral' }) => {
  // Inicializa o fluxo com posições
  const [activeFlow, setActiveFlow] = useState<FlowNode[]>(() => {
    return MASTER_BLUEPRINTS[0].nodes.map((n, i) => ({
      ...n,
      x: 100 + (i * 350),
      y: 300
    }));
  });

  const [activeBlueprintId, setActiveBlueprintId] = useState(MASTER_BLUEPRINTS[0].id);
  const [isTesting, setIsTesting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [testNodeId, setTestNodeId] = useState<string | null>(null);
  
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  const [showInjectMenu, setShowInjectMenu] = useState(false);

  // --- CANVAS STATE ---
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Mouse start position
  const [initialElementPos, setInitialElementPos] = useState({ x: 0, y: 0 }); // Element start position
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // --- HANDLERS ---

  const handleLoadTemplate = (bp: FlowBlueprint) => {
    setTestNodeId(null);
    setActiveBlueprintId(bp.id);
    // Auto-layout horizontal na carga
    setActiveFlow(bp.nodes.map((n, i) => ({ 
      ...n, 
      status: 'idle',
      x: 100 + (i * 350), 
      y: 300 
    })));
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleNewFlow = () => {
    if (confirm('Deseja limpar o canvas para criar um novo fluxo master?')) {
      setActiveFlow([{ 
        id: `node_${Date.now()}`, 
        type: 'trigger', 
        label: 'Nova Conversa', 
        description: 'Gatilho de entrada', 
        icon: Zap,
        x: 100,
        y: 300
      }]);
      setActiveBlueprintId('custom');
      setPan({ x: 0, y: 0 });
    }
  };

  // ZOOM
  const handleZoom = (delta: number) => setZoom(prev => Math.min(Math.max(prev + delta, 0.4), 2));
  const resetViewport = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // MOUSE EVENTS
  const handleMouseDown = (e: React.MouseEvent) => {
    // Check if clicking on a node or the canvas
    const nodeElement = (e.target as HTMLElement).closest('.node-element');
    
    if (nodeElement) {
      const nodeId = nodeElement.getAttribute('data-node-id');
      if (nodeId) {
        setIsDraggingNode(nodeId);
        setDragStart({ x: e.clientX, y: e.clientY });
        const node = activeFlow.find(n => n.id === nodeId);
        if (node) setInitialElementPos({ x: node.x, y: node.y });
      }
    } else {
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialElementPos({ x: pan.x, y: pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingNode) {
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;
      
      setActiveFlow(prev => prev.map(n => 
        n.id === isDraggingNode 
          ? { ...n, x: initialElementPos.x + dx, y: initialElementPos.y + dy } 
          : n
      ));
    } else if (isPanning) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPan({ x: initialElementPos.x + dx, y: initialElementPos.y + dy });
    }
  };

  const handleMouseUp = () => {
    setIsDraggingNode(null);
    setIsPanning(false);
  };

  const handleDeleteNode = (id: string) => {
    if (activeFlow.length <= 1) return;
    setActiveFlow(prev => prev.filter(n => n.id !== id));
  };

  const handleInjectStep = (typeInfo: typeof NODE_TYPES[0]) => {
    // Injeta no meio da tela (baseado no pan)
    const centerX = (-pan.x + (canvasRef.current?.clientWidth || 800) / 2) / zoom;
    const centerY = (-pan.y + (canvasRef.current?.clientHeight || 600) / 2) / zoom;

    const newNode: FlowNode = {
      id: `node_${Date.now()}`,
      type: typeInfo.type,
      label: typeInfo.label,
      description: typeInfo.desc,
      icon: typeInfo.icon,
      status: 'idle',
      x: centerX,
      y: centerY
    };
    setActiveFlow(prev => [...prev, newNode]);
    setShowInjectMenu(false);
  };

  const handleSaveNodeConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode) return;
    setActiveFlow(prev => prev.map(n => n.id === editingNode.id ? { ...n, ...editingNode } : n));
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

  // Renderiza as linhas de conexão (Bézier Curves)
  const renderConnections = useMemo(() => {
    return (
      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
          </marker>
        </defs>
        {activeFlow.map((node, i) => {
          if (i === activeFlow.length - 1) return null;
          const nextNode = activeFlow[i+1];
          
          // Pontos de ancoragem (Centro)
          const startX = node.x + 300; // Largura do nó é aprox 300
          const startY = node.y + 50;  // Altura aprox 100 / 2
          const endX = nextNode.x;
          const endY = nextNode.y + 50;

          // Curva Bézier
          const cp1x = startX + (endX - startX) / 2;
          const cp1y = startY;
          const cp2x = startX + (endX - startX) / 2;
          const cp2y = endY;

          const path = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

          return (
            <g key={`conn-${node.id}-${nextNode.id}`}>
              <path 
                d={path} 
                fill="none" 
                stroke={node.status === 'success' ? '#10b981' : '#cbd5e1'} 
                strokeWidth="3" 
                className="transition-colors duration-500"
              />
              <path 
                d={path} 
                fill="none" 
                stroke={node.status === 'success' || node.status === 'processing' ? '#6366f1' : 'transparent'} 
                strokeWidth="3"
                markerEnd="url(#arrowhead)"
                strokeDasharray="10,10"
                className="animate-flow-dash"
              />
            </g>
          );
        })}
      </svg>
    );
  }, [activeFlow]);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-955 overflow-hidden select-none">
      
      {/* MODAL CONFIGURAÇÃO DE NÓ */}
      {editingNode && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2rem] shadow-2xl p-10 relative border border-white/10">
              <button onClick={() => setEditingNode(null)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-rose-500 transition-all"><X size={24} /></button>
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl"><Settings size={28}/></div>
                 <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tight">Configurar Nó</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Ajuste técnico do passo da automação</p>
                 </div>
              </div>
              <form onSubmit={handleSaveNodeConfig} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-4">Rótulo Visual</label>
                    <input value={editingNode.label} onChange={e => setEditingNode({...editingNode, label: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-4">Descrição de Fluxo</label>
                    <input value={editingNode.description} onChange={e => setEditingNode({...editingNode, description: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10" />
                 </div>
                 <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-xl shadow-xl uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all">Sincronizar Arquitetura</button>
              </form>
           </div>
        </div>
      )}

      {/* HEADER INTEGRADO */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 z-20 shadow-sm relative">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
               <Layers size={20} />
            </div>
            <div>
               <h1 className="text-lg font-black italic uppercase tracking-tight">Flow Builder <span className="text-indigo-600">Master</span></h1>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Engine v2.4 • Dynamic Graph</p>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-3">
            <button 
              onClick={runFlowTest}
              disabled={isTesting}
              className="action-btn flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-indigo-50 transition-all border border-slate-200 dark:border-slate-700"
            >
               {isTesting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} className="text-indigo-600" />}
               Simular
            </button>
            <button 
              disabled={isPublishing || isTesting}
              onClick={() => { setIsPublishing(true); setTimeout(() => setIsPublishing(false), 2000); }}
              className="action-btn flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-black text-[9px] uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
               {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
               Publicar
            </button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR DE BLUEPRINTS */}
        <div className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 overflow-y-auto no-scrollbar z-10 shadow-lg">
           <div className="flex items-center gap-2 mb-6 px-2">
              <Sparkles className="text-indigo-600" size={16} />
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Templates Master</h3>
           </div>

           <div className="space-y-3">
              {MASTER_BLUEPRINTS.map(bp => (
                <div 
                  key={bp.id} 
                  onClick={() => handleLoadTemplate(bp)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all group relative overflow-hidden ${activeBlueprintId === bp.id ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-300'}`}
                >
                   <div className="flex justify-between items-start mb-2">
                      <span className={`text-[7px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${bp.category === 'Vendas' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>{bp.category}</span>
                   </div>
                   <h4 className="text-xs font-black italic uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{bp.name}</h4>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 leading-tight">{bp.tagline}</p>
                </div>
              ))}

              <button 
                onClick={handleNewFlow}
                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-indigo-600 hover:border-indigo-300 transition-all group mt-4"
              >
                 <Plus size={18} />
                 <span className="text-[8px] font-black uppercase tracking-widest">Novo Fluxo Vazio</span>
              </button>
           </div>
        </div>

        {/* CANVAS DE EDIÇÃO */}
        <div 
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex-1 bg-slate-50 dark:bg-slate-950 relative overflow-hidden cursor-move ${isPanning ? 'cursor-grabbing' : ''}`}
        >
           
           {/* Grid Infinito */}
           <div 
             className="absolute inset-0 opacity-[0.08] pointer-events-none transition-transform duration-0" 
             style={{ 
               backgroundImage: 'linear-gradient(to right, #4f46e5 1px, transparent 1px), linear-gradient(to bottom, #4f46e5 1px, transparent 1px)', 
               backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
               transform: `translate(${pan.x}px, ${pan.y}px)`
             }}
           ></div>

           {/* CONTROLS */}
           <div className="absolute top-6 left-6 flex flex-col gap-2 z-50">
              <div className="flex bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                 <button onClick={() => handleZoom(0.1)} className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600"><ZoomIn size={18}/></button>
                 <div className="w-px bg-slate-200 dark:bg-slate-800"></div>
                 <button onClick={() => handleZoom(-0.1)} className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600"><ZoomOut size={18}/></button>
                 <div className="w-px bg-slate-200 dark:bg-slate-800"></div>
                 <button onClick={resetViewport} className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600"><Maximize size={18}/></button>
              </div>
              <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
                 <p className="text-[8px] font-black uppercase text-indigo-600">Zoom: {Math.round(zoom * 100)}%</p>
              </div>
           </div>

           {/* MENU INJECT */}
           <div className="absolute top-6 right-6 z-50">
              <button 
                onClick={() => setShowInjectMenu(!showInjectMenu)}
                className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-xl hover:bg-indigo-700 transition-all group"
              >
                 <Plus size={18} className={showInjectMenu ? 'rotate-45' : ''} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Adicionar Nó</span>
              </button>

              {showInjectMenu && (
                <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 animate-in slide-in-from-top-2">
                   <div className="grid grid-cols-1 gap-1">
                      {NODE_TYPES.map(nt => (
                        <button 
                          key={nt.type}
                          onClick={() => handleInjectStep(nt)}
                          className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all group/item text-left"
                        >
                           <div className={`p-2 rounded-lg ${NODE_STYLE_MAP[nt.type].bg} ${NODE_STYLE_MAP[nt.type].text}`}><nt.icon size={16}/></div>
                           <div>
                              <p className="text-[10px] font-black uppercase italic leading-none">{nt.label}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{nt.desc}</p>
                           </div>
                        </button>
                      ))}
                   </div>
                </div>
              )}
           </div>

           {/* CANVAS CONTENT LAYER */}
           <div 
             className="absolute top-0 left-0 w-full h-full origin-top-left transition-transform duration-0 ease-linear"
             style={{ 
               transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
             }}
           >
              {/* SVG CONNECTIONS (LAYER 0) */}
              {renderConnections}

              {/* NODES (LAYER 1) */}
              {activeFlow.map((node) => {
                const styles = NODE_STYLE_MAP[node.type as keyof typeof NODE_STYLE_MAP] || NODE_STYLE_MAP.trigger;
                return (
                  <div
                    key={node.id}
                    data-node-id={node.id}
                    className={`node-element absolute w-[300px] bg-white dark:bg-slate-900 border-2 rounded-xl p-0 shadow-lg cursor-grab active:cursor-grabbing group/node transition-shadow ${testNodeId === node.id ? 'ring-4 ring-indigo-500/30 border-indigo-600 z-30' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 z-10'}`}
                    style={{
                      transform: `translate(${node.x}px, ${node.y}px)`,
                    }}
                  >
                     {/* Node Header */}
                     <div className={`h-1.5 w-full rounded-t-lg ${styles.bg.split(' ')[0].replace('/40', '')} bg-opacity-100`}></div>
                     
                     <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                           <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${styles.bg} ${styles.text} border ${styles.border}`}>
                                 <node.icon size={20} />
                              </div>
                              <div>
                                 <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${styles.bg} ${styles.text} ${styles.border}`}>{node.type}</span>
                                 </div>
                                 <h4 className="text-sm font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100">{node.label}</h4>
                              </div>
                           </div>
                           <button 
                              onClick={() => setEditingNode(node)}
                              className="text-slate-300 hover:text-indigo-600 transition-colors"
                           >
                              <Settings size={16}/>
                           </button>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-2">
                              {node.description}
                           </p>
                        </div>
                     </div>

                     {/* Delete Handle */}
                     <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}
                        className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 text-slate-300 hover:text-rose-500 rounded-full shadow-md border border-slate-100 dark:border-slate-700 opacity-0 group-hover/node:opacity-100 transition-all scale-75 hover:scale-100"
                     >
                        <Trash2 size={14}/>
                     </button>

                     {/* Status Indicators */}
                     {node.status === 'processing' && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                           <Loader2 className="animate-spin text-indigo-600" size={32} />
                        </div>
                     )}
                     {node.status === 'success' && (
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg border-2 border-white dark:border-slate-900 animate-in zoom-in">
                           <CheckCircle2 size={16} />
                        </div>
                     )}
                  </div>
                );
              })}
           </div>

        </div>

      </div>
    </div>
  );
};
