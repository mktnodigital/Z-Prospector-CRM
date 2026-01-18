
import React from 'react';
import { Lead, LeadStatus } from '../types';
import { MoreHorizontal, Mail, Phone, Download, Upload, Filter } from 'lucide-react';

interface Props {
  leads: Lead[];
}

export const LeadList: React.FC<Props> = ({ leads }) => {
  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Leads</h1>
          <p className="text-slate-500 text-sm">Visualize e gerencie toda sua base de contatos.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-700">
            <Upload size={16} /> Importar CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            Novo Lead
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-2 items-center justify-between bg-slate-50/50">
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2">
              <Filter size={14} /> Filtros Avançados
            </button>
            <div className="flex rounded-lg overflow-hidden border border-slate-200">
              <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold">Todos</button>
              <button className="px-3 py-1.5 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 border-l border-slate-200">Quentes</button>
              <button className="px-3 py-1.5 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 border-l border-slate-200">Mornos</button>
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <Download size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold border-b border-slate-100">
                <th className="px-6 py-4">Nome / Lead</th>
                <th className="px-6 py-4">Status IA</th>
                <th className="px-6 py-4">Estágio Atual</th>
                <th className="px-6 py-4">Última Interação</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        {lead.name.substring(0, 1)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{lead.name}</p>
                        <p className="text-xs text-slate-500">{lead.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      lead.status === LeadStatus.HOT ? 'bg-red-50 text-red-600 border border-red-100' :
                      lead.status === LeadStatus.WARM ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                      'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {lead.status === LeadStatus.HOT ? 'QUENTE' : lead.status === LeadStatus.WARM ? 'MORNO' : 'FRIO'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                      <span className="text-xs font-semibold text-slate-700">{lead.stage}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-500 font-medium">{lead.lastInteraction}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm">
                        <Phone size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm">
                        <Mail size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
