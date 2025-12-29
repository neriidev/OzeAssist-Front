import React, { useMemo } from 'react';
import { InjectionRecord, HealthRecord } from '../types';
import { TrendingDown, TrendingUp, Activity, AlertTriangle, Scale, ArrowLeft } from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Cell
} from 'recharts';

interface ReportsProps {
  records: InjectionRecord[];
  healthRecords: HealthRecord[];
  onBack: () => void;
}

const Reports: React.FC<ReportsProps> = ({ records, healthRecords, onBack }) => {
  // --- Data Processing ---

  // 1. Weight Stats
  const weightRecords = useMemo(() => 
    [...healthRecords]
      .filter(r => r.weight !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
  [healthRecords]);

  const startWeight = weightRecords.length > 0 ? weightRecords[0].weight : 0;
  const currentWeight = weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : 0;
  const weightDiff = (currentWeight || 0) - (startWeight || 0);
  const isWeightLoss = weightDiff < 0;

  // 2. Timeline Data (Merge Weight & Doses)
  const chartData = useMemo(() => {
    const timeline = new Map<string, { date: string, weight?: number, dose?: number }>();

    // Add Weights
    weightRecords.forEach(r => {
      const dateStr = new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      timeline.set(dateStr, { date: dateStr, weight: r.weight });
    });

    // Add Doses (Merge if date exists)
    records.forEach(r => {
      const dateStr = new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const existing = timeline.get(dateStr) || { date: dateStr };
      timeline.set(dateStr, { ...existing, dose: r.dosage });
    });

    // Convert to array and sort
    return Array.from(timeline.values()).sort((a, b) => {
        const [dayA, monthA] = a.date.split('/');
        const [dayB, monthB] = b.date.split('/');
        return new Date(2024, parseInt(monthA)-1, parseInt(dayA)).getTime() - new Date(2024, parseInt(monthB)-1, parseInt(dayB)).getTime();
    });
  }, [weightRecords, records]);

  // 3. Side Effects Stats
  const sideEffectsStats = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalLogs = 0;
    
    healthRecords.forEach(r => {
      if (r.sideEffects.length > 0) totalLogs++;
      r.sideEffects.forEach(effect => {
        counts[effect] = (counts[effect] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  }, [healthRecords]);

  // 4. Adherence
  const totalDoses = records.length;
  
  // Render
  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Relatórios Detalhados</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Weight KPI */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className={`absolute top-0 right-0 p-2 opacity-10 ${isWeightLoss ? 'text-teal-600' : 'text-slate-400'}`}>
             {isWeightLoss ? <TrendingDown size={40} /> : <TrendingUp size={40} />}
          </div>
          <div className="flex items-center gap-2 mb-1">
             <Scale className="w-4 h-4 text-indigo-500" />
             <span className="text-xs font-bold text-slate-400 uppercase">Evolução Peso</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {Math.abs(weightDiff).toFixed(1)} <span className="text-sm font-normal text-slate-500">kg</span>
          </div>
          <p className={`text-xs font-medium ${isWeightLoss ? 'text-teal-600' : 'text-slate-500'}`}>
            {isWeightLoss ? 'Perdidos no total' : 'Diferença total'}
          </p>
        </div>

        {/* Doses KPI */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
             <Activity className="w-4 h-4 text-teal-500" />
             <span className="text-xs font-bold text-slate-400 uppercase">Aplicações</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {totalDoses}
          </div>
          <p className="text-xs text-slate-500 font-medium">Doses registradas</p>
        </div>
      </div>

      {/* Main Chart: Weight vs Dosage */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-slate-700 font-bold text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          Correlação Dose x Peso
        </h3>
        
        {chartData.length > 1 ? (
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis yAxisId="left" orientation="left" domain={['auto', 'auto']} hide />
                <YAxis yAxisId="right" orientation="right" domain={[0, 3]} hide />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  labelStyle={{color: '#64748b', marginBottom: '0.5rem'}}
                />
                <Legend />
                <Bar yAxisId="right" dataKey="dose" name="Dose (mg)" fill="#ccfbf1" barSize={20} radius={[4, 4, 0, 0]} />
                <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="#6366f1" strokeWidth={3} dot={{fill: '#6366f1', r: 4}} activeDot={{r: 6}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Dados insuficientes para gráfico.
          </div>
        )}
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          Compare se o aumento da dose (barras claras) influencia a queda de peso (linha roxa).
        </p>
      </div>

      {/* Side Effects Chart */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-slate-700 font-bold text-sm mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Efeitos Colaterais Frequentes
        </h3>

        {sideEffectsStats.length > 0 ? (
          <div className="h-48 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={sideEffectsStats} margin={{left: 10, right: 30}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fill: '#475569', fontSize: 11}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                <Bar dataKey="count" name="Ocorrências" radius={[0, 4, 4, 0]} barSize={16}>
                  {sideEffectsStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Nenhum efeito colateral registrado.
          </div>
        )}
      </div>

      {/* Summary Text */}
      <div className="bg-indigo-50 p-5 rounded-2xl text-sm text-indigo-900">
        <h4 className="font-bold mb-2">Resumo Geral</h4>
        <ul className="list-disc list-inside space-y-1 opacity-80">
          <li>Você já registrou <strong>{records.length}</strong> aplicações.</li>
          {weightRecords.length >= 2 && (
             <li>Seu peso variou <strong>{Math.abs(weightDiff).toFixed(1)}kg</strong> desde o início.</li>
          )}
          {sideEffectsStats.length > 0 && (
            <li>O sintoma mais comum é <strong>{sideEffectsStats[0].name}</strong>.</li>
          )}
        </ul>
      </div>

    </div>
  );
};

export default Reports;