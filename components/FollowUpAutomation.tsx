
import React, { useState, useRef, useMemo } from 'react';
import { 
  Zap, MessageSquare, Play, Plus, Split, Bot, 
  X, Trash2, Loader2, Sparkles, Brain, Layers, 
  Rocket, CheckCircle2, Settings, ZoomIn, ZoomOut, Maximize,
  CloudLightning, MousePointer2, Link2
} from 'lucide-react';

// --- TYPES ---
type HandleType = 'top' | 'right' | 'bottom' | 'left';

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

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: HandleType;
  targetHandle: HandleType;
}

interface FlowBlueprint {
  id: string;
  name: string;
  tagline: string;
  category: 'Vendas' | 'Atendimento' | 'Engenharia';
  nodes: Omit<FlowNode, 'x' | 'y'>[];
  edges?: Omit<FlowEdge, 'id'>[]; // Optional predefined edges
}

const NODE_TYPES = [
  { type: 'ai' as const, label: 'Inteligência IA', desc: 'Processamento Gemini 3.0', icon: Brain },
  { type: 'action' as const, label: 'Ação WhatsApp', desc: 'Envio de Mensagem/Arquivo', icon: MessageSquare },
  { type: 'condition' as const, label: 'Filtro Condicional', desc: 'Lógica IF/ELSE', icon: Split },
  { type: 'n8n' as const, label: 'Integração n8n', desc: 'Webhook Externo', icon: Code },
];

// Helper icon for Node Types definition above
function Code(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>; }

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
    ],
    edges: [
      { source: '1', target: '2', sourceHandle: 'bottom', targetHandle: 'top' },
      { source: '2', target: '3', sourceHandle: 'bottom', targetHandle: 'top' },
      { source: '3', target: '4', sourceHandle: 'right', targetHandle: 'left' }
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
    ],
    edges: [
      { source: '1', target: '2', sourceHandle: 'right', targetHandle: 'left' },
      { source: '2', target: '3', sourceHandle: 'right', targetHandle: 'left' }
    ]
  }
];

// Helper icon needed inside component
function Smartphone(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>; }

const NODE_STYLE_MAP = {
  trigger: { bg: 'bg-indigo-50 dark:bg-indigo-900/40', text: 'text-indigo-600', border: 'border-indigo-200 dark:border-indigo-800' },
  ai: { bg: 'bg-purple-50 dark:bg-purple-900/40', text: 'text-purple-600', border: 'border-purple-200 dark:border-purple-800' },
  condition: { bg: 'bg-orange-50 dark:bg-orange-900/40', text: 'text-orange-600', border: 'border-orange-200 dark:border-orange-800' },
  action: { bg: 'bg-emerald-50 dark:bg-emerald-900/40', text: 'text-emerald-600', border: 'border-emerald-200 dark:border-emerald-800' },
  n8n: { bg: 'bg-amber-50 dark:bg-amber-900/40', text: 'text-amber-600', border: 'border-amber-200 dark:border-amber-800' }
};

export const FollowUpAutomation: React.FC<{ niche?: string }> = ({ niche = 'Geral' }) => {
  // Nodes State
  const [nodes, setNodes] = useState<FlowNode[]>(() => {
    // Initial Blueprint Load logic
    const bp = MASTER_BLUEPRINTS[0];
    return bp.nodes.map((n, i) => ({
      ...n,
      x: 100 + (i % 2 === 0 ? 0 : 350), // Zig-zag positions for demo
      y: 100 + (Math.floor(i / 2) * 200)
    }));
  });

  // Edges State
  const [edges, setEdges] = useState<FlowEdge[]>(() => {
    const bp = MASTER_BLUEPRINTS[0];
    return (bp.edges || []).map((e, i) => ({ ...e, id: `edge_${i}` }));
  });

  const [activeBlueprintId, setActiveBlueprintId] = useState(MASTER_BLUEPRINTS[0].id);
  const [isTesting, setIsTesting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  const [showInjectMenu, setShowInjectMenu] = useState(false);

  // --- CANVAS STATE ---
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  
  // Dragging Nodes
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialElementPos, setInitialElementPos] = useState({ x: 0, y: 0 });
  
  // Connecting Nodes
  const [connectingSource, setConnectingSource] = useState<{ nodeId: string, handle: HandleType } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // Mouse pos in canvas coords

  const canvasRef = useRef<HTMLDivElement>(null);

  // --- HANDLERS ---

  const handleLoadTemplate = (bp: FlowBlueprint) => {
    setActiveBlueprintId(bp.id);
    setNodes(bp.nodes.map((n, i) => ({ 
      ...n, 
      status: 'idle',
      x: 150 + (i % 2 === 0 ? 0 : 400), 
      y: 150 + (Math.floor(i / 2) * 200)
    })));
    setEdges((bp.edges || []).map((e, i) => ({ ...e, id: `edge_${Date.now()}_${i}` })));
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleNewFlow = () => {
    if (confirm('Deseja limpar o canvas para criar um novo fluxo master?')) {
      setNodes([{ 
        id: `node_${Date.now()}`, 
        type: 'trigger', 
        label: 'Gatilho Inicial', 
        description: 'Ponto de entrada', 
        icon: Zap,
        x: 100,
        y: 200
      }]);
      setEdges([]);
      setActiveBlueprintId('custom');
      setPan({ x: 0, y: 0 });
    }
  };

  // ZOOM & PAN
  const handleZoom = (delta: number) => setZoom(prev => Math.min(Math.max(prev + delta, 0.4), 2));
  const resetViewport = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom
    };
  };

  // MOUSE EVENTS
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking strictly on background (not node, not handle)
    const target = e.target as HTMLElement;
    if (target.closest('.node-element') || target.closest('.node-handle')) return;

    setIsPanning(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialElementPos({ x: pan.x, y: pan.y });
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setIsDraggingNode(nodeId);
    setDragStart({ x: e.clientX, y: e.clientY });
    const node = nodes.find(n => n.id === nodeId);
    if (node) setInitialElementPos({ x: node.x, y: node.y });
  };

  const handleHandleMouseDown = (e: React.MouseEvent, nodeId: string, handle: HandleType) => {
    e.stopPropagation();
    setConnectingSource({ nodeId, handle });
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    setMousePos(coords);
  };

  const handleHandleMouseUp = (e: React.MouseEvent, targetNodeId: string, targetHandle: HandleType) => {
    e.stopPropagation();
    if (connectingSource) {
      if (connectingSource.nodeId === targetNodeId) {
        setConnectingSource(null);
        return;
      }
      
      const newEdge: FlowEdge = {
        id: `edge_${Date.now()}`,
        source: connectingSource.nodeId,
        target: targetNodeId,
        sourceHandle: connectingSource.handle,
        targetHandle: targetHandle
      };
      
      // Avoid duplicate edges
      const exists = edges.find(ed => 
        ed.source === newEdge.source && ed.target === newEdge.target && 
        ed.sourceHandle === newEdge.sourceHandle && ed.targetHandle === newEdge.targetHandle
      );

      if (!exists) {
        setEdges(prev => [...prev, newEdge]);
      }
      
      setConnectingSource(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingNode) {
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;
      
      setNodes(prev => prev.map(n => 
        n.id === isDraggingNode 
          ? { ...n, x: initialElementPos.x + dx, y: initialElementPos.y + dy } 
          : n
      ));
    } else if (isPanning) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPan({ x: initialElementPos.x + dx, y: initialElementPos.y + dy });
    } else if (connectingSource) {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      setMousePos(coords);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingNode(null);
    setIsPanning(false);
    setConnectingSource(null); // Cancel connection if dropped on canvas
  };

  const handleDeleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
  };

  const handleInjectStep = (typeInfo: typeof NODE_TYPES[0]) => {
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
    setNodes(prev => [...prev, newNode]);
    setShowInjectMenu(false);
  };

  const handleSaveNodeConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode) return;
    setNodes(prev => prev.map(n => n.id === editingNode.id ? { ...n, ...editingNode } : n));
    setEditingNode(null);
  };

  const runFlowTest = async () => {
    setIsTesting(true);
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
    
    // Simulate flow traversal (simplificado para demo visual)
    for (const node of nodes) {
      setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'processing' } : n));
      await new Promise(r => setTimeout(r, 600));
      setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'success' } : n));
    }
    setIsTesting(false);
  };

  // --- RENDERING HELPERS ---

  const getNodeDimensions = () => ({ width: 280, height: 140 });

  const getHandlePosition = (nodeX: number, nodeY: number, handle: HandleType) => {
    const { width, height } = getNodeDimensions();
    switch (handle) {
      case 'top': return { x: nodeX + width / 2, y: nodeY };
      case 'right': return { x: nodeX + width, y: nodeY + height / 2 };
      case 'bottom': return { x: nodeX + width / 2, y: nodeY + height };
      case 'left': return { x: nodeX, y: nodeY + height / 2 };
    }
  };

  const calculatePath = (x1: number, y1: number, x2: number, y2: number, h1: HandleType, h2: HandleType) => {
    // Control point offset
    const dist = Math.abs(x1 - x2) + Math.abs(y1 - y2);
    const offset = Math.min(dist * 0.5, 100);

    let cp1 = { x: x1, y: y1 };
    let cp2 = { x: x2, y: y2 };

    if (h1 === 'right') cp1.x += offset;
    else if (h1 === 'left') cp1.x -= offset;
    else if (h1 === 'top') cp1.y -= offset;
    else if (h1 === 'bottom') cp1.y += offset;

    if (h2 === 'right') cp2.x += offset;
    else if (h2 === 'left') cp2.x -= offset;
    else if (h2 === 'top') cp2.y -= offset;
    else if (h2 === 'bottom') cp2.y += offset;

    return `M ${x1} ${y1} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${x2} ${y2}`;
  };

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
              <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                  </marker>
                </defs>
                {edges.map((edge) => {
                  const sourceNode = nodes.find(n => n.id === edge.source);
                  const targetNode = nodes.find(n => n.id === edge.target);
                  
                  if (!sourceNode || !targetNode) return null;

                  const start = getHandlePosition(sourceNode.x, sourceNode.y, edge.sourceHandle);
                  const end = getHandlePosition(targetNode.x, targetNode.y, edge.targetHandle);
                  
                  const path = calculatePath(start.x, start.y, end.x, end.y, edge.sourceHandle, edge.targetHandle);

                  return (
                    <path 
                      key={edge.id}
                      d={path} 
                      fill="none" 
                      stroke="#6366f1" 
                      strokeWidth="3"
                      markerEnd="url(#arrowhead)"
                      className="transition-colors duration-500"
                    />
                  );
                })}
                {/* Temporary Connection Line */}
                {connectingSource && (
                  <path 
                    d={`M ${getHandlePosition(
                      nodes.find(n => n.id === connectingSource.nodeId)!.x, 
                      nodes.find(n => n.id === connectingSource.nodeId)!.y, 
                      connectingSource.handle
                    ).x} ${getHandlePosition(
                      nodes.find(n => n.id === connectingSource.nodeId)!.x, 
                      nodes.find(n => n.id === connectingSource.nodeId)!.y, 
                      connectingSource.handle
                    ).y} L ${mousePos.x} ${mousePos.y}`} 
                    fill="none" 
                    stroke="#cbd5e1" 
                    strokeWidth="3" 
                    strokeDasharray="5,5"
                  />
                )}
              </svg>

              {/* NODES (LAYER 1) */}
              {nodes.map((node) => {
                const styles = NODE_STYLE_MAP[node.type as keyof typeof NODE_STYLE_MAP] || NODE_STYLE_MAP.trigger;
                return (
                  <div
                    key={node.id}
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    className={`node-element absolute w-[280px] bg-white dark:bg-slate-900 border-2 rounded-md p-0 shadow-lg cursor-grab active:cursor-grabbing group/node transition-shadow select-none ${node.status === 'processing' ? 'ring-4 ring-indigo-500/30 border-indigo-600 z-30' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 z-10'}`}
                    style={{
                      transform: `translate(${node.x}px, ${node.y}px)`,
                    }}
                  >
                     {/* HANDLES (4 SIDES) */}
                     {/* TOP */}
                     <div 
                       onMouseDown={(e) => handleHandleMouseDown(e, node.id, 'top')} 
                       onMouseUp={(e) => handleHandleMouseUp(e, node.id, 'top')}
                       className="node-handle absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full hover:bg-indigo-500 hover:scale-125 transition-all cursor-crosshair z-50"
                     ></div>
                     {/* RIGHT */}
                     <div 
                       onMouseDown={(e) => handleHandleMouseDown(e, node.id, 'right')} 
                       onMouseUp={(e) => handleHandleMouseUp(e, node.id, 'right')}
                       className="node-handle absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full hover:bg-indigo-500 hover:scale-125 transition-all cursor-crosshair z-50"
                     ></div>
                     {/* BOTTOM */}
                     <div 
                       onMouseDown={(e) => handleHandleMouseDown(e, node.id, 'bottom')} 
                       onMouseUp={(e) => handleHandleMouseUp(e, node.id, 'bottom')}
                       className="node-handle absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full hover:bg-indigo-500 hover:scale-125 transition-all cursor-crosshair z-50"
                     ></div>
                     {/* LEFT */}
                     <div 
                       onMouseDown={(e) => handleHandleMouseDown(e, node.id, 'left')} 
                       onMouseUp={(e) => handleHandleMouseUp(e, node.id, 'left')}
                       className="node-handle absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full hover:bg-indigo-500 hover:scale-125 transition-all cursor-crosshair z-50"
                     ></div>

                     {/* Node Header */}
                     <div className={`h-1.5 w-full rounded-t-sm ${styles.bg.split(' ')[0].replace('/40', '')} bg-opacity-100`}></div>
                     
                     <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                           <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${styles.bg} ${styles.text} border ${styles.border}`}>
                                 <node.icon size={20} />
                              </div>
                              <div>
                                 <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-sm border ${styles.bg} ${styles.text} ${styles.border}`}>{node.type}</span>
                                 </div>
                                 <h4 className="text-sm font-black italic uppercase tracking-tight text-slate-800 dark:text-slate-100">{node.label}</h4>
                              </div>
                           </div>
                           <button 
                              onMouseDown={(e) => e.stopPropagation()}
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
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => handleDeleteNode(node.id)}
                        className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 text-slate-300 hover:text-rose-500 rounded-full shadow-md border border-slate-100 dark:border-slate-700 opacity-0 group-hover/node:opacity-100 transition-all scale-75 hover:scale-100 z-40"
                     >
                        <Trash2 size={14}/>
                     </button>

                     {/* Status Indicators */}
                     {node.status === 'processing' && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 rounded-md flex items-center justify-center backdrop-blur-[1px]">
                           <Loader2 className="animate-spin text-indigo-600" size={32} />
                        </div>
                     )}
                     {node.status === 'success' && (
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg border-2 border-white dark:border-slate-900 animate-in zoom-in z-40">
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
