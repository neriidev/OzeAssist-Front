import React, { useState } from 'react';
import { InjectionRecord, HealthRecord } from '../types';
import { Trash2, Calendar, MapPin, Weight, BarChart2, ChevronRight } from 'lucide-react';
import CalendarView from './CalendarView';
import ConfirmDialog from './ConfirmDialog';

interface HistoryProps {
  records: InjectionRecord[];
  healthRecords: HealthRecord[];
  onDelete: (id: string, type: 'injection' | 'health') => void;
  onNavigateToReports: () => void;
}

type TimelineItem = 
  | (InjectionRecord & { type: 'injection' })
  | (HealthRecord & { type: 'health' });

const History: React.FC<HistoryProps> = ({ records, healthRecords, onDelete, onNavigateToReports }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; type: 'injection' | 'health' }>({
    isOpen: false,
    id: '',
    type: 'injection',
  });

  // Filter records based on selected month/year in calendar
  const filteredRecords: TimelineItem[] = [
    ...records.map(r => ({ ...r, type: 'injection' as const })),
    ...healthRecords.map(r => ({ ...r, type: 'health' as const }))
  ].filter(item => {
    // Parse date manually to match CalendarView logic and avoid timezone shifts
    const [datePart] = item.date.split('T');
    const [yearStr, monthStr] = datePart.split('-');
    const itemYear = parseInt(yearStr);
    const itemMonth = parseInt(monthStr) - 1;

    return itemYear === currentDate.getFullYear() && 
           itemMonth === currentDate.getMonth();
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="pb-24 space-y-4">
      <div className="flex items-center justify-between px-2">
         <h2 className="text-2xl font-bold text-slate-800">Histórico</h2>
         <button 
           onClick={onNavigateToReports}
           className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors"
         >
           <BarChart2 className="w-4 h-4" />
           Ver Relatórios
           <ChevronRight className="w-4 h-4" />
         </button>
      </div>
      
      {/* Calendar View controlled by History state */}
      <CalendarView 
        records={records} 
        healthRecords={healthRecords} 
        currentDate={currentDate}
        onMonthChange={setCurrentDate}
      />

      {/* List View Header */}
      <div className="flex items-center justify-between px-2 mt-6 mb-3">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Registros de {monthNames[currentDate.getMonth()]}
        </h3>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
          {filteredRecords.length} item(s)
        </span>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-slate-400 bg-white rounded-2xl border border-slate-100 border-dashed">
          <Calendar className="w-8 h-8 mb-2 opacity-20" />
          <p className="text-sm">Nenhum registro neste mês.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((item) => {
            const isInjection = item.type === 'injection';
            
            return (
              <div key={item.id} className={`p-5 rounded-2xl shadow-sm border flex justify-between group transition-all hover:shadow-md relative overflow-hidden ${
                isInjection ? 'bg-white border-slate-100' : 'bg-indigo-50/50 border-indigo-100'
              }`}>
                {/* Decorative bar on left */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isInjection ? 'bg-teal-500' : 'bg-indigo-500'}`}></div>

                <div className="space-y-1 pl-2">
                  {/* Header Line */}
                  <div className="flex items-center gap-2 mb-2">
                     {isInjection ? (
                       <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md text-sm font-bold">{item.dosage} mg</span>
                     ) : (
                       <div className="flex gap-2">
                         {item.weight && (
                           <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md text-sm font-bold flex items-center gap-1">
                             <Weight className="w-3 h-3" /> {item.weight} kg
                           </span>
                         )}
                         {(!item.weight && item.sideEffects.length === 0) && (
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md text-sm font-bold flex items-center gap-1">
                               Diário
                            </span>
                         )}
                       </div>
                     )}
                     <span className="text-xs text-slate-400">
                        {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                     </span>
                  </div>

                  {/* Content */}
                  {isInjection ? (
                    <div className="flex items-center text-slate-600 text-sm gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.site}
                    </div>
                  ) : (
                    <div className="space-y-1">
                       {item.sideEffects.length > 0 && (
                         <div className="flex flex-wrap gap-1">
                           {item.sideEffects.map(ef => (
                             <span key={ef} className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded">
                               {ef}
                             </span>
                           ))}
                         </div>
                       )}
                    </div>
                  )}
                  
                  {item.notes && (
                    <p className={`text-xs italic mt-2 border-l-2 pl-2 ${isInjection ? 'text-slate-400 border-slate-200' : 'text-indigo-400 border-indigo-200'}`}>
                      "{item.notes}"
                    </p>
                  )}
                </div>

                <div className="flex flex-col justify-center">
                  <button 
                      onClick={() => {
                        setDeleteConfirm({
                          isOpen: true,
                          id: item.id,
                          type: item.type,
                        });
                      }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Excluir Registro"
        message={`Tem certeza que deseja excluir este ${deleteConfirm.type === 'injection' ? 'registro de aplicação' : 'registro de saúde'}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          onDelete(deleteConfirm.id, deleteConfirm.type);
          setDeleteConfirm({ isOpen: false, id: '', type: 'injection' });
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: '', type: 'injection' })}
      />
    </div>
  );
};

export default History;