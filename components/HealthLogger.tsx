import React, { useState, useEffect } from 'react';
import { HealthRecord } from '../types';
import { COMMON_SIDE_EFFECTS } from '../constants';
import { X, Activity } from 'lucide-react';

interface HealthLoggerProps {
  onSave: (record: Omit<HealthRecord, 'id'>) => void;
  onCancel: () => void;
}

const HealthLogger: React.FC<HealthLoggerProps> = ({ onSave, onCancel }) => {
  // Initialize with local time instead of UTC
  const [date, setDate] = useState<string>(() => {
    const now = new Date();
    // Adjust for timezone offset to get local ISO string
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  const [weight, setWeight] = useState<string>('');
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const toggleEffect = (effect: string) => {
    if (selectedEffects.includes(effect)) {
      setSelectedEffects(prev => prev.filter(e => e !== effect));
    } else {
      setSelectedEffects(prev => [...prev, effect]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      date,
      weight: weight ? parseFloat(weight) : undefined,
      sideEffects: selectedEffects,
      notes
    });
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm z-10">
        <button onClick={onCancel} className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          Diário de Saúde
        </h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
          
          {/* Weight Section */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-3">Peso Atual (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="Ex: 75.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 text-lg"
            />
          </div>

          {/* Side Effects Section */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-3">Efeitos Colaterais</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SIDE_EFFECTS.map((effect) => (
                <button
                  key={effect}
                  type="button"
                  onClick={() => toggleEffect(effect)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedEffects.includes(effect)
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {effect}
                </button>
              ))}
            </div>
            {selectedEffects.length === 0 && (
              <p className="text-xs text-slate-400 mt-3">Nenhum sintoma selecionado.</p>
            )}
          </div>

          {/* Date Section */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">Data e Hora</label>
            <input
              type="datetime-local"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800"
            />
          </div>

          {/* Notes Section */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">Relato / Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Conte como você se sentiu hoje..."
              rows={4}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all text-lg mb-8"
          >
            Salvar Diário
          </button>
          
          <div className="h-6"></div>
        </form>
      </div>
    </div>
  );
};

export default HealthLogger;