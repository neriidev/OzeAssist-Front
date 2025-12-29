import React, { useState } from 'react';
import { NutritionDay, MealType, MealItem } from '../types';
import { getNutritionTips } from '../services/geminiService';
import { 
  Plus, Minus, Droplets, Coffee, Sun, Moon, 
  ChevronLeft, ChevronRight, Sparkles, Trash2, Apple, MessageSquareText 
} from 'lucide-react';

interface NutritionProps {
  nutritionData: NutritionDay[];
  onUpdateNutrition: (data: NutritionDay) => void;
  onNavigateToAI: () => void;
}

const Nutrition: React.FC<NutritionProps> = ({ nutritionData, onUpdateNutrition, onNavigateToAI }) => {
  // Date State
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateStr = currentDate.toISOString().split('T')[0];

  // Meal Input State
  const [isAddingMeal, setIsAddingMeal] = useState<MealType | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCals, setNewItemCals] = useState('');

  // AI Tips State
  const [tips, setTips] = useState<string>('');
  const [loadingTips, setLoadingTips] = useState(false);

  // Get current day data or initialize empty
  const currentDayData = nutritionData.find(d => d.date === dateStr) || {
    date: dateStr,
    waterIntake: 0,
    meals: { breakfast: [], lunch: [], dinner: [], snack: [] }
  };

  // --- Handlers ---

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const updateWater = (delta: number) => {
    const newData = { ...currentDayData };
    newData.waterIntake = Math.max(0, newData.waterIntake + delta);
    onUpdateNutrition(newData);
  };

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddingMeal || !newItemName.trim()) return;

    const newData = { ...currentDayData };
    const newItem: MealItem = {
      id: Date.now().toString(),
      name: newItemName,
      calories: newItemCals ? parseInt(newItemCals) : undefined
    };

    newData.meals[isAddingMeal] = [...newData.meals[isAddingMeal], newItem];
    onUpdateNutrition(newData);
    
    // Reset form
    setNewItemName('');
    setNewItemCals('');
    setIsAddingMeal(null);
  };

  const deleteMealItem = (type: MealType, id: string) => {
    const newData = { ...currentDayData };
    newData.meals[type] = newData.meals[type].filter(item => item.id !== id);
    onUpdateNutrition(newData);
  };

  const fetchTips = async () => {
    setLoadingTips(true);
    const result = await getNutritionTips();
    setTips(result);
    setLoadingTips(false);
  };

  // --- Renders ---

  const renderMealSection = (type: MealType, title: string, icon: React.ReactNode, colorClass: string) => {
    const items = currentDayData.meals[type];
    const totalCals = items.reduce((acc, curr) => acc + (curr.calories || 0), 0);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className={`px-4 py-3 flex justify-between items-center ${colorClass} bg-opacity-10 border-b border-slate-100`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${colorClass} text-white`}>
              {icon}
            </div>
            <h3 className="font-semibold text-slate-800">{title}</h3>
          </div>
          <button 
            onClick={() => setIsAddingMeal(type)}
            className="p-1 hover:bg-white rounded-full transition-colors text-slate-500"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 min-h-[60px]">
          {items.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Nenhum registro.</p>
          ) : (
            <ul className="space-y-2">
              {items.map(item => (
                <li key={item.id} className="flex justify-between items-start text-sm group">
                  <div>
                    <span className="text-slate-700 font-medium">{item.name}</span>
                    {item.calories && (
                      <span className="text-xs text-slate-400 ml-2">{item.calories} kcal</span>
                    )}
                  </div>
                  <button 
                    onClick={() => deleteMealItem(type, item.id)}
                    className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {items.length > 0 && totalCals > 0 && (
             <div className="mt-3 pt-2 border-t border-slate-50 text-right text-xs font-bold text-slate-500">
                Total: {totalCals} kcal
             </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-24 space-y-6 relative">
      {/* AI Assistant Floating Button */}
      <button 
        onClick={onNavigateToAI}
        className="fixed bottom-20 right-4 z-30 bg-teal-600 text-white p-4 rounded-full shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-all active:scale-95 flex items-center justify-center"
        title="Falar com Assistente IA"
      >
         <MessageSquareText className="w-6 h-6" />
      </button>

      {/* Date Header */}
      <div className="flex items-center justify-between px-2">
        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white rounded-full text-slate-500">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-800">
            {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Diário Nutricional</p>
        </div>
        <button onClick={() => changeDate(1)} className="p-2 hover:bg-white rounded-full text-slate-500">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* AI Shortcut Box (Alternative to FAB) */}
      <div 
        onClick={onNavigateToAI}
        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Dúvidas sobre alimentos?</h3>
            <p className="text-xs text-slate-500">Pergunte à IA do Ozenpic</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300" />
      </div>

      {/* Water Tracker */}
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-cyan-100" />
              <h3 className="font-bold opacity-90">Hidratação</h3>
            </div>
            <div className="text-4xl font-bold mb-1">{currentDayData.waterIntake} <span className="text-lg font-normal opacity-80">copos</span></div>
            <p className="text-xs opacity-70">Meta diária: 8-10 copos (250ml)</p>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => updateWater(1)}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm transition-all active:scale-95"
            >
              <Plus className="w-6 h-6" />
            </button>
            <button 
              onClick={() => updateWater(-1)}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-all active:scale-95"
            >
              <Minus className="w-6 h-6" />
            </button>
          </div>
        </div>
        {/* Visual Progress */}
        <div className="mt-6 flex gap-1 h-2">
           {[...Array(10)].map((_, i) => (
             <div 
               key={i} 
               className={`flex-1 rounded-full ${i < currentDayData.waterIntake ? 'bg-white' : 'bg-black/20'}`}
             ></div>
           ))}
        </div>
      </div>

      {/* AI Tips Button */}
      {!tips && (
        <button 
          onClick={fetchTips}
          disabled={loadingTips}
          className="w-full py-3 bg-purple-50 text-purple-700 rounded-xl border border-purple-100 font-medium text-sm flex items-center justify-center gap-2 hover:bg-purple-100 transition-colors"
        >
          {loadingTips ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loadingTips ? 'Gerando dicas...' : 'Pedir dicas de nutrição para hoje'}
        </button>
      )}

      {tips && (
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-sm text-purple-800 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Dicas da IA
            </h4>
            <button onClick={() => setTips('')} className="text-purple-400 hover:text-purple-600"><Trash2 className="w-4 h-4" /></button>
          </div>
          <div className="whitespace-pre-line leading-relaxed text-xs">
            {tips}
          </div>
        </div>
      )}

      {/* Meal Sections */}
      <div className="space-y-4">
        {renderMealSection('breakfast', 'Café da Manhã', <Coffee className="w-4 h-4" />, 'bg-amber-500')}
        {renderMealSection('lunch', 'Almoço', <Sun className="w-4 h-4" />, 'bg-orange-500')}
        {renderMealSection('dinner', 'Jantar', <Moon className="w-4 h-4" />, 'bg-indigo-500')}
        {renderMealSection('snack', 'Lanches', <Apple className="w-4 h-4" />, 'bg-emerald-500')}
      </div>

      {/* Add Meal Modal (Simplified Inline for this example) */}
      {isAddingMeal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-in slide-in-from-bottom-10">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Adicionar Alimento</h3>
            <form onSubmit={handleAddMeal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">O que você comeu?</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  placeholder="Ex: 2 Ovos mexidos"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Calorias (opcional)</label>
                <input 
                  type="number" 
                  value={newItemCals}
                  onChange={e => setNewItemCals(e.target.value)}
                  placeholder="Ex: 180"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddingMeal(null)}
                  className="flex-1 py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={!newItemName.trim()}
                  className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:opacity-50"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nutrition;