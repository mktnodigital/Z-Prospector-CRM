
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    localStorage.removeItem('z_session_token'); // Clear session to force re-login if state is corrupted
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white p-8 text-center">
          <div className="p-6 bg-rose-500/20 rounded-full mb-6">
             <AlertTriangle size={64} className="text-rose-500" />
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Algo deu errado</h1>
          <p className="text-slate-400 font-bold max-w-md mb-8 leading-relaxed">
            O sistema encontrou uma falha crítica na renderização. Detalhes técnicos foram registrados.
          </p>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-8 max-w-lg w-full overflow-auto text-left">
             <code className="text-rose-400 text-xs font-mono">{this.state.error?.message}</code>
          </div>
          <button 
            onClick={this.handleReload}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-lg"
          >
            <RefreshCcw size={18} /> Reiniciar Sistema (Reset)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
