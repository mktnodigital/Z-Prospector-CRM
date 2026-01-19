
import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Users, ChevronLeft, 
  ChevronRight, CheckCircle2, Sparkles, Brain, Bot, 
  CalendarCheck, AlertCircle, Plus, X, User, Edit3, Trash2,
  Info, List, LayoutGrid, Zap, ArrowRight, History, 
  MessageSquare, Loader2, ShoppingCart, DollarSign
} from 'lucide-react';
import { Appointment } from '../types';

interface Props {
  appointments: Appointment[];
  onAddAppointment: (appt: Appointment) => void;
  onUpdateAppointment: (appt: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
}

type ViewMode = 'month' | 'list';

// Simulação de catálogo para sincronização
const SERVICE_CATALOG = [
  { id: 'srv_1', name: 'Corte Master', price: 80.00 },
  { id: 'srv_2', name: 'Barba Terapia', price: 65.00 },
  { id: 'srv_3', name: 'Combo Premium', price: 130.00 },
  { id: 'srv_4', name: 'Mentoria Express', price: 250.00 },
];

export const ScheduleManager: React.FC<Props> = ({ appointments, onAddAppointment, onUpdateAppointment, onDeleteAppointment }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formServiceId, setFormServiceId] = useState(SERVICE_CATALOG[0].id);

  const daysInMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  }, [currentDate]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
  const year = currentDate.getFullYear();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleOpenAddModal = () => {
    setEditingAppointment(null);
    setFormName('');
    setFormTime('');
    setFormServiceId(SERVICE_CATALOG[0].id);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (appt: Appointment) => {
    setEditingAppointment(appt);
    setFormName(appt.lead);
    setFormTime(appt.time);
    setFormServiceId(appt.serviceId || SERVICE_CATALOG[0].id);
    setIsModalOpen(true);
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedService = SERVICE_CATALOG.find(s => s.id === formServiceId);
    
    if (editingAppointment) {
      onUpdateAppointment({ 
        ...editingAppointment, 
        lead: formName, 
        time: formTime, 
        service: selectedService?.name || 'Serviço',
        serviceId: formServiceId,
        value: selectedService?.price
      });
    } else {
      const newAppointment: Appointment = {
        id: Math.random().toString(36).substr(2, 9),
        lead: formName,
        time: formTime,
        date: selectedDay,
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
        service: selectedService?.name || 'Serviço',
        serviceId: formServiceId,
        value: selectedService?.price,
        status: 'CONFIRMED',
        ia: false
      };
      onAddAppointment(newAppointment);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remover agendamento do cluster de operações?')) onDeleteAppointment(id);
  };

  const dailyAppointments = useMemo(() => {
    return appointments.filter(ap => 
      ap.date === selectedDay && 
      ap.month === currentDate.getMonth() && 
      ap.year === currentDate.getFullYear()
    ).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDay, currentDate]);

  const allUpcoming = useMemo(() => {
    return [...appointments]
      .filter(ap => {
        const apDate = new Date(ap.year, ap.month, ap.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return apDate >= today;
      })
      .sort((a, b) => {
        const dateA = new Date(a.year, a.month, a.date).getTime();
        const dateB = new Date(b.year, b.month, b.date).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.time.localeCompare(b.time);
      });
  }, [appointments]);

  const iaStats = useMemo(() => {
    const total = appointments.length;
    const iaConfirmed = appointments.filter(ap => ap.ia).length;
    return { total, iaConfirmed, rate: total > 0 ? Math.round((iaConfirmed / total) * 100) : 0 };
  }, [appointments]);

  return (
    <div className="p-10 space-y-10 animate-in fade-in relative pb-40">
      
      {/* MODAL HÍBRIDO - AGORA SINCRONIZADO COM CATALOGO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] shadow-2xl p-12 relative border border-white/10 overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl"></div>
             <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all z-20"><X size={24} /></button>
             <div className="flex items-center gap-5 mb-10">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner"><CalendarIcon size={28}/></div>
                <div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tight">{editingAppointment ? 'Refinar Horário' : `Agendar: Dia ${selectedDay}`}</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sincronização de Venda Master</p>
                </div>
             </div>
             <form onSubmit={handleSaveAppointment} className="space-y-6">
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-slate-400 px-4">Identificação do Cliente</label>
                   <input required value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ex: Rodrigo Matos" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10" />
                </div>
                
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-slate-400 px-4">Selecionar Item do Catálogo</label>
                   <div className="grid grid-cols-1 gap-2">
                      {SERVICE_CATALOG.map(srv => (
                        <button 
                          key={srv.id}
                          type="button"
                          onClick={() => setFormServiceId(srv.id)}
                          className={`flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all ${formServiceId === srv.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-50 dark:border-slate-800'}`}
                        >
                           <div className="flex items-center gap-3">
                              <ShoppingCart size={14} className={formServiceId === srv.id ? 'text-indigo-600' : 'text-slate-400'} />
                              <span className="text-[11px] font-black uppercase tracking-tight">{srv.name}</span>
                           </div>
                           <span className="text-[10px] font-black italic">R$ {srv.price.toFixed(2)}</span>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-slate-400 px-4">Horário</label>
                   <input required type="time" value={formTime} onChange={e => setFormTime(e.target.value)} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold border-none outline-none focus:ring-4 ring-indigo-500/10" />
                </div>

                <button type="submit" className="w-full py-7 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-2xl hover:bg-indigo-700 transition-all uppercase text-xs tracking-widest">Sincronizar Agendamento</button>
             </form>
          </div>
        </div>
      )}

      {/* HEADER MASTER E SELECTOR DE VISUALIZAÇÃO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
        <div>
           <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-5">
              <CalendarIcon className="text-pink-500" size={40} /> Agenda <span className="text-indigo-600">Neural</span>
           </h1>
           <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg border border-emerald-100 dark:border-emerald-800">
                 <Bot size={12}/>
                 <span className="text-[8px] font-black uppercase tracking-widest">Orquestrador Ativo</span>
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] italic">clikai.com.br • Flow Sync Engine v3.0</p>
           </div>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
           <button 
             onClick={() => setViewMode('month')} 
             className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'month' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
           >
              <LayoutGrid size={16} /> Mês
           </button>
           <button 
             onClick={() => setViewMode('list')} 
             className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
           >
              <List size={16} /> Lista
           </button>
           <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 mx-2"></div>
           <div className="flex items-center gap-3">
              <button onClick={handlePrevMonth} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl hover:text-indigo-600 transition-all"><ChevronLeft size={18} /></button>
              <span className="min-w-[140px] text-center font-black italic uppercase text-xs tracking-widest text-slate-600 dark:text-slate-200">{monthName} {year}</span>
              <button onClick={handleNextMonth} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl hover:text-indigo-600 transition-all"><ChevronRight size={18} /></button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* CALENDÁRIO OU LISTA (CONTEÚDO PRINCIPAL) */}
        <div className="lg:col-span-3">
           {viewMode === 'month' ? (
             <div className="bg-white dark:bg-slate-900 p-12 rounded-[4.5rem] border-2 border-slate-50 dark:border-slate-800 shadow-sm relative animate-in zoom-in-95">
                <div className="grid grid-cols-7 gap-4">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-6">{d}</div>
                  ))}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="aspect-square opacity-0"></div>)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isSelected = selectedDay === day;
                    const dayAppts = appointments.filter(ap => ap.date === day && ap.month === currentDate.getMonth() && ap.year === currentDate.getFullYear());
                    const hasEvents = dayAppts.length > 0;
                    const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth();

                    return (
                      <div 
                        key={day} 
                        onClick={() => setSelectedDay(day)}
                        onMouseEnter={() => hasEvents && setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`aspect-square flex flex-col items-center justify-center rounded-[2.2rem] border-2 transition-all cursor-pointer relative group/cell ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl scale-110 z-20' : 
                          hasEvents ? 'bg-pink-50 dark:bg-pink-900/10 border-pink-100 dark:border-pink-800/40 hover:border-pink-400' : 
                          'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 hover:border-indigo-200'
                        }`}
                      >
                         <span className={`text-xl font-black italic tracking-tighter ${isToday && !isSelected ? 'text-indigo-600' : ''}`}>{day}</span>
                         
                         {hasEvents && !isSelected && (
                           <div className="absolute top-4 right-4 flex gap-1">
                              <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.6)] animate-pulse"></div>
                           </div>
                         )}

                         {/* HOVER TOOLTIP POPUP */}
                         {hoveredDay === day && !isSelected && (
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-72 bg-slate-950/95 backdrop-blur-2xl p-8 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] z-[100] border border-white/10 animate-in slide-in-from-bottom-2 duration-300">
                              <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-5">
                                 <Zap size={16} className="text-yellow-400" />
                                 <p className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Agenda p/ Dia {day}</p>
                              </div>
                              <div className="space-y-4 max-h-[250px] overflow-y-auto no-scrollbar">
                                 {dayAppts.map(ap => (
                                   <div key={ap.id} className="flex flex-col gap-1 group/tip">
                                      <div className="flex justify-between items-center">
                                         <span className="text-[10px] font-black text-pink-400 tabular-nums">{ap.time}</span>
                                         {ap.ia && <Brain size={12} className="text-indigo-400" />}
                                      </div>
                                      <p className="text-xs font-black text-white italic uppercase truncate tracking-tight">{ap.lead}</p>
                                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{ap.service}</p>
                                   </div>
                                 ))}
                              </div>
                              <div className="mt-5 pt-4 border-t border-white/10 flex justify-center">
                                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{dayAppts.length} horários ocupados</span>
                              </div>
                           </div>
                         )}

                         {hasEvents && !isSelected && (
                           <div className="absolute bottom-4 text-[8px] font-black uppercase text-pink-500 tracking-widest opacity-60 group-hover/cell:opacity-100 transition-opacity">
                             {dayAppts.length} Slots
                           </div>
                         )}
                      </div>
                    );
                  })}
                </div>
             </div>
           ) : (
             <div className="space-y-6 animate-in slide-in-from-right-10">
                {allUpcoming.length > 0 ? allUpcoming.map((ap, idx) => (
                  <div key={ap.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-50 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-indigo-400 transition-all transform hover:-translate-x-2">
                     <div className="flex items-center gap-8">
                        <div className="flex flex-col items-center justify-center w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                           <span className="text-[9px] font-black uppercase text-slate-400">{new Date(ap.year, ap.month, ap.date).toLocaleString('pt-BR', { month: 'short' })}</span>
                           <span className="text-3xl font-black italic text-slate-900 dark:text-white tracking-tighter">{ap.date}</span>
                        </div>
                        <div className="h-12 w-px bg-slate-100 dark:bg-slate-800"></div>
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                              <span className="text-xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white">{ap.lead}</span>
                              {ap.ia && <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Bot size={14} /></div>}
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                 <Clock size={12} className="text-indigo-500"/> {ap.time}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                 <Zap size={12} className="text-pink-500"/> {ap.service}
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all pr-4">
                        <button onClick={() => handleOpenEditModal(ap)} className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-2xl shadow-sm transition-all"><Edit3 size={20}/></button>
                        <button onClick={() => handleDelete(ap.id)} className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-2xl shadow-sm transition-all"><Trash2 size={20}/></button>
                     </div>
                  </div>
                )) : (
                  <div className="py-40 flex flex-col items-center justify-center text-slate-300 opacity-30 grayscale select-none">
                     <CalendarCheck size={120} className="animate-pulse mb-8" />
                     <p className="text-3xl font-black uppercase tracking-[0.4em] italic">Timeline Vazia</p>
                  </div>
                )}
             </div>
           )}
        </div>

        {/* SIDEBAR DE STATUS E AUTOMAÇÃO */}
        <div className="space-y-8">
           <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
              <Bot className="absolute -bottom-6 -right-6 w-36 h-36 text-white/10 group-hover:scale-125 transition-transform duration-1000" />
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl"><Sparkles size={24} className="text-yellow-400 animate-pulse"/></div>
                    <div>
                       <h4 className="font-black italic uppercase tracking-tight">AI Scheduler</h4>
                       <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest leading-none">Flow Sync v3.0</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black uppercase text-indigo-100">Eficiência de Ocupação</span>
                       <span className="text-2xl font-black italic tabular-nums">{iaStats.rate}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
                       <div className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{width: `${iaStats.rate}%`}}></div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <History size={16} className="text-indigo-300" />
                    <p className="text-[9px] font-bold text-indigo-100 uppercase tracking-tight italic">Último agendamento automático: há 14 min</p>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tight">Timeline: Dia {selectedDay}</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{dailyAppointments.length} Compromissos</p>
                 </div>
                 <button onClick={handleOpenAddModal} className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-[1.5rem] hover:text-indigo-600 hover:scale-110 transition-all shadow-sm"><Plus size={22} /></button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar max-h-[500px]">
                 {dailyAppointments.length > 0 ? dailyAppointments.map((ap) => (
                   <div key={ap.id} className="flex gap-6 group/item animate-in slide-in-from-right-5">
                      <div className="flex flex-col items-center">
                         <div className="text-[10px] font-black text-indigo-600 tracking-tighter mb-2 uppercase tabular-nums">{ap.time}</div>
                         <div className="w-px flex-1 bg-slate-100 dark:bg-slate-800 group-last:bg-transparent"></div>
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] hover:border-indigo-400 transition-all shadow-sm relative group/card overflow-hidden">
                         <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight italic uppercase truncate pr-8">{ap.lead}</p>
                            {ap.ia && <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 rounded-lg"><Brain size={12} /></div>}
                         </div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 truncate">{ap.service}</p>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[8px] font-black uppercase px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full border border-emerald-100 dark:border-emerald-800/40 shadow-sm">
                               <CheckCircle2 size={10}/> {ap.value ? `R$ ${ap.value}` : 'Confirmado'}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover/card:opacity-100 transition-all transform translate-x-4 group-hover/card:translate-x-0">
                               <button onClick={() => handleOpenEditModal(ap)} className="p-2.5 bg-white dark:bg-slate-700 text-indigo-600 rounded-xl shadow-md hover:scale-110 transition-transform"><Edit3 size={12}/></button>
                               <button onClick={() => handleDelete(ap.id)} className="p-2.5 bg-white dark:bg-slate-700 text-rose-500 rounded-xl shadow-md hover:scale-110 transition-transform"><Trash2 size={12}/></button>
                            </div>
                         </div>
                      </div>
                   </div>
                 )) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-6 opacity-30 py-10 select-none grayscale">
                      <div className="p-10 rounded-[3rem] border-4 border-dashed border-slate-200">
                         <CalendarCheck size={64} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Slots livres para hoje</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
