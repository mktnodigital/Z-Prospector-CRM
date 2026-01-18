
import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Users, ChevronLeft, 
  ChevronRight, CheckCircle2, Sparkles, Brain, Bot, 
  CalendarCheck, AlertCircle, Plus, X, User, Edit3, Trash2,
  Info
} from 'lucide-react';
import { Appointment } from '../types';

interface Props {
  appointments: Appointment[];
  onAddAppointment: (appt: Appointment) => void;
  onUpdateAppointment: (appt: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
}

export const ScheduleManager: React.FC<Props> = ({ appointments, onAddAppointment, onUpdateAppointment, onDeleteAppointment }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formService, setFormService] = useState('');

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
    setFormService('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (appt: Appointment) => {
    setEditingAppointment(appt);
    setFormName(appt.lead);
    setFormTime(appt.time);
    setFormService(appt.service);
    setIsModalOpen(true);
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAppointment) {
      const updated: Appointment = {
        ...editingAppointment,
        lead: formName,
        time: formTime,
        service: formService,
      };
      onUpdateAppointment(updated);
    } else {
      const newAppointment: Appointment = {
        id: Math.random().toString(36).substr(2, 9),
        lead: formName,
        time: formTime,
        date: selectedDay,
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
        service: formService,
        status: 'CONFIRMED',
        ia: false
      };
      onAddAppointment(newAppointment);
    }
    
    setIsModalOpen(false);
    setFormName(''); setFormTime(''); setFormService('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover este agendamento?')) {
      onDeleteAppointment(id);
    }
  };

  const dailyAppointments = useMemo(() => {
    return appointments.filter(ap => 
      ap.date === selectedDay && 
      ap.month === currentDate.getMonth() && 
      ap.year === currentDate.getFullYear()
    ).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDay, currentDate]);

  const iaStats = useMemo(() => {
    const total = dailyAppointments.length;
    const iaConfirmed = dailyAppointments.filter(ap => ap.ia).length;
    const rate = total > 0 ? Math.round((iaConfirmed / total) * 100) : 0;
    return { total, iaConfirmed, rate };
  }, [dailyAppointments]);

  return (
    <div className="p-8 space-y-10 animate-in fade-in relative">
      
      {/* MODAL HÍBRIDO (ADICIONAR/EDITAR) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-12 relative">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all"><X size={24} /></button>
             <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><CalendarIcon size={24}/></div>
                <div>
                   <h3 className="text-2xl font-black italic uppercase tracking-tight">{editingAppointment ? 'Editar Horário' : `Agendar para Dia ${selectedDay}`}</h3>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sincronização manual com a unidade</p>
                </div>
             </div>
             
             <form onSubmit={handleSaveAppointment} className="space-y-6">
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Nome do Cliente</label>
                   <input required value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ex: João da Silva" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Horário</label>
                      <input required type="time" value={formTime} onChange={e => setFormTime(e.target.value)} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 px-2 tracking-widest">Serviço/Oferta</label>
                      <input required value={formService} onChange={e => setFormService(e.target.value)} placeholder="Ex: Corte Master" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold" />
                   </div>
                </div>
                <button type="submit" className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl hover:bg-indigo-700 transition-all uppercase text-xs tracking-widest">
                  {editingAppointment ? 'Sincronizar Alterações' : 'Confirmar Novo Agendamento'}
                </button>
             </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-4">
             <CalendarIcon className="text-pink-500" /> Agenda de Operações
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold tracking-tight uppercase text-xs mt-1">Sincronização em tempo real com conversas WhatsApp</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handlePrevMonth} className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-200 rounded-2xl hover:border-indigo-500 transition-all"><ChevronLeft size={20} /></button>
          <div className="min-w-[180px] text-center px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 rounded-2xl font-black tracking-tighter text-xl italic uppercase">
            {monthName} {year}
          </div>
          <button onClick={handleNextMonth} className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-200 rounded-2xl hover:border-indigo-500 transition-all"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* CALENDÁRIO COM DESTAQUE DE DIAS AGENDADOS E HOVER TOOLTIP */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative">
          <div className="grid grid-cols-7 gap-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">{d}</div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="aspect-square opacity-20"></div>)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDay === day;
              
              const dayAppts = appointments.filter(ap => 
                ap.date === day && 
                ap.month === currentDate.getMonth() && 
                ap.year === currentDate.getFullYear()
              );
              
              const hasEvents = dayAppts.length > 0;
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

              return (
                <div 
                  key={day} 
                  onClick={() => setSelectedDay(day)} 
                  className={`aspect-square flex flex-col items-center justify-center rounded-[1.8rem] border-2 transition-all cursor-pointer relative group/cell ${
                    isSelected 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl scale-105 z-10' 
                      : hasEvents 
                        ? 'bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800/50 hover:border-pink-400' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-400'
                  }`}
                >
                  <span className={`text-lg font-black ${isToday && !isSelected ? 'text-indigo-600 underline decoration-4 underline-offset-4' : ''}`}>
                    {day}
                  </span>
                  
                  {hasEvents && !isSelected && (
                    <div className="absolute top-3 right-3 flex gap-0.5">
                       <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)] animate-pulse"></div>
                    </div>
                  )}

                  {/* TOOLTIP DE HOVER PARA DIAS COM AGENDAMENTO */}
                  {hasEvents && !isSelected && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/cell:opacity-100 group-hover/cell:translate-y-0 transition-all duration-300 z-[100] border border-white/10 overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 blur-2xl rounded-full"></div>
                       <div className="relative z-10 space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b border-white/10 mb-1">
                             <CalendarIcon size={12} className="text-pink-400" />
                             <p className="text-[10px] font-black uppercase text-white tracking-widest">Compromissos</p>
                          </div>
                          <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar">
                            {dayAppts.sort((a,b) => a.time.localeCompare(b.time)).map(ap => (
                              <div key={ap.id} className="flex justify-between items-center gap-2 group/tip">
                                 <span className="text-[9px] font-black text-pink-400 tabular-nums">{ap.time}</span>
                                 <span className="text-[10px] font-bold text-slate-100 truncate flex-1 uppercase tracking-tight italic">{ap.lead}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-2 flex justify-center">
                             <div className="bg-white/5 px-3 py-1 rounded-lg">
                                <p className="text-[8px] font-black uppercase text-slate-400">{dayAppts.length} agendamentos</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {hasEvents && !isSelected && (
                    <div className="absolute bottom-3 text-[7px] font-black uppercase text-pink-500 opacity-60 group-hover/cell:opacity-100 transition-opacity">
                      {dayAppts.length} Agend.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
             <Bot className="absolute -bottom-6 -right-6 w-36 h-36 text-white/10 group-hover:scale-125 transition-transform duration-700" />
             <div className="relative z-10">
                <h4 className="font-black text-lg mb-4 italic flex items-center gap-2 uppercase tracking-tight"><Sparkles size={18} /> IA Scheduler Active</h4>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                   <span>Carga Operacional Hoje</span>
                   <span className="text-emerald-400">{iaStats.rate}%</span>
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col min-h-[400px]">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black italic tracking-tight uppercase">Dia {selectedDay}</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{dailyAppointments.length} agendamentos</p>
                </div>
                <button onClick={handleOpenAddModal} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-2xl hover:text-indigo-600 hover:bg-indigo-50 transition-all"><Plus size={20} /></button>
             </div>
             
             <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar max-h-[500px]">
                {dailyAppointments.length > 0 ? dailyAppointments.map((ap) => (
                  <div key={ap.id} className="flex gap-4 group/item cursor-pointer animate-in slide-in-from-right-5">
                    <div className="flex flex-col items-center">
                       <div className="text-[10px] font-black text-indigo-600 tracking-tighter mb-1 uppercase tabular-nums">{ap.time}</div>
                       <div className="w-px flex-1 bg-slate-100 dark:bg-slate-800 group-last:bg-transparent"></div>
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-5 rounded-[1.8rem] hover:border-indigo-400 transition-all shadow-sm relative group/card overflow-hidden">
                       <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight italic uppercase truncate pr-8">{ap.lead}</p>
                          {ap.ia && <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><Brain size={12} /></div>}
                       </div>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 truncate">{ap.service}</p>
                       <div className="flex items-center justify-between">
                          <div className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full w-fit">Confirmado</div>
                          
                          <div className="flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                             <button onClick={() => handleOpenEditModal(ap)} className="p-2 bg-white dark:bg-slate-700 text-indigo-600 rounded-lg shadow-sm hover:scale-110 transition-transform">
                                <Edit3 size={12} />
                             </button>
                             <button onClick={() => handleDelete(ap.id)} className="p-2 bg-white dark:bg-slate-700 text-rose-500 rounded-lg shadow-sm hover:scale-110 transition-transform">
                                <Trash2 size={12} />
                             </button>
                          </div>
                       </div>
                    </div>
                  </div>
                )) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-10 opacity-50 grayscale">
                    <div className="p-6 rounded-full border-2 border-dashed border-slate-200 mb-4">
                       <CalendarCheck size={40} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Nenhum evento neste dia</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
