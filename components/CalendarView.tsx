import React from 'react';
import { InjectionRecord, HealthRecord } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  records: InjectionRecord[];
  healthRecords: HealthRecord[];
  currentDate: Date;
  onMonthChange: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ records, healthRecords, currentDate, onMonthChange }) => {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    onMonthChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

  // Helper to check for records safely ignoring timezone shifts
  const checkDate = (dateString: string, targetDay: number) => {
      if (!dateString) return false;
      
      // We parse the string manually (YYYY-MM-DD...) to avoid timezone conversions
      const [datePart] = dateString.split('T');
      const [yearStr, monthStr, dayStr] = datePart.split('-');
      
      const rDay = parseInt(dayStr);
      const rMonth = parseInt(monthStr) - 1; // Months are 0-indexed in JS comparisons
      const rYear = parseInt(yearStr);

      return rDay === targetDay &&
             rMonth === currentDate.getMonth() &&
             rYear === currentDate.getFullYear();
  };

  const renderDays = () => {
    const days = [];
    
    // Empty slots for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const hasInjection = records.some(r => checkDate(r.date, i));
      const hasHealthLog = healthRecords.some(r => checkDate(r.date, i));
      
      const isToday = 
        i === new Date().getDate() && 
        currentDate.getMonth() === new Date().getMonth() && 
        currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div key={i} className="h-10 flex flex-col items-center justify-center relative">
          <div 
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium relative transition-all
              ${isToday ? 'bg-slate-200 text-slate-800' : 'text-slate-600'}
              ${hasInjection ? 'bg-teal-600 text-white font-bold shadow-md' : ''}
            `}
          >
            {i}
            {/* Small dot for health log if injection also exists */}
            {hasInjection && hasHealthLog && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-500 border border-white rounded-full"></div>
            )}
          </div>
          
          {/* Dot for health log only */}
          {!hasInjection && hasHealthLog && (
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-0.5"></div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-slate-800 font-semibold capitalize">
          {monthNames[currentDate.getMonth()]} <span className="text-slate-400 font-normal">{currentDate.getFullYear()}</span>
        </h3>
        <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center text-xs text-slate-400 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {renderDays()}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-teal-600"></div>
          <span>Aplicação</span>
        </div>
        <div className="flex items-center gap-1">
           <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
           <span>Sintomas/Peso</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;