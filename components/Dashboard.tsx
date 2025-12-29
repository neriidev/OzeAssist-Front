
import React from 'react';
import { InjectionRecord, HealthRecord, User } from '../types';
import { Calendar, Clock, AlertCircle, Activity, Plus, Crown, Clock3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';

interface DashboardProps {
  user: User;
  records: InjectionRecord[];
  healthRecords: HealthRecord[];
  onLogClick: () => void;
  onHealthLogClick: () => void;
  onUpgradeClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, records, healthRecords, onLogClick, onHealthLogClick, onUpgradeClick }) => {
  // Sort records by date descending
  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastRecord = sortedRecords.length > 0 ? sortedRecords[0] : null;

  // Trial Logic
  const trialDaysLeft = React.useMemo(() => {
    if (user.isPremium) return null;
    const start = new Date(user.createdAt).getTime();
    const now = new Date().getTime();
    const diff = 7 - Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [user]);

  // Weight Data for Chart
  const weightData = [...healthRecords]
    .filter(r => r.weight !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10) 
    .map(r => ({
      date: new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      weight: r.weight
    }));

  let nextDoseDate: Date | null = null;
  let daysUntil = 0;

  if (lastRecord) {
    const lastDate = new Date(lastRecord.date);
    nextDoseDate = new Date(lastDate);
    nextDoseDate.setDate(lastDate.getDate() + 7); 

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(nextDoseDate);
    checkDate.setHours(0, 0, 0, 0);

    const diffTime = checkDate.getTime() - today.getTime();
    daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Trial Banner */}
      {!user.isPremium && trialDaysLeft !== null && (
        <div 
          onClick={onUpgradeClick}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-4 rounded-2xl flex items-center justify-between cursor-pointer group hover:bg-amber-100/50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <Clock3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-800 uppercase tracking-tight">Período de Teste</p>
              <p className="text-[10px] text-amber-600 font-bold">
                {trialDaysLeft > 0 
                  ? `Seu acesso grátis expira em ${trialDaysLeft} dias.` 
                  : "Seu teste expirou. Atualize para o PRO para continuar usando."}
              </p>
            </div>
          </div>
          <button className="bg-amber-600 text-white text-[10px] font-black px-3 py-2 rounded-lg group-hover:scale-105 transition-transform uppercase tracking-wider">
            Upgrade
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Header Card */}
        <div className="bg-teal-600 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-full">
          <div className="relative z-10">
            <h2 className="text-xl font-medium opacity-90">Próxima Aplicação</h2>
            {lastRecord ? (
              <div className="mt-4">
                <div className="text-4xl font-bold">
                  {daysUntil === 0 
                    ? "Hoje!" 
                    : daysUntil < 0 
                      ? `${Math.abs(daysUntil)} dias atrasado` 
                      : `Em ${daysUntil} dias`}
                </div>
                <div className="flex items-center mt-2 opacity-80 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {nextDoseDate?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <div className="text-2xl font-bold">Nenhuma dose registrada</div>
                <p className="opacity-80 mt-1">Registre sua primeira aplicação para começar.</p>
              </div>
            )}
          </div>
          <div className="absolute -right-4 -bottom-8 opacity-20 text-teal-900">
             <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
        </div>

        {/* Action Buttons & Last Dose */}
        <div className="flex flex-col gap-3 h-full">
           <div className="grid grid-cols-2 gap-3 flex-1">
            <button 
              onClick={onLogClick}
              className="py-4 bg-white border-2 border-teal-600 text-teal-700 font-bold rounded-2xl shadow-sm active:scale-95 transition-transform flex flex-col items-center justify-center gap-1 hover:bg-teal-50"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm">Registrar Dose</span>
            </button>
            <button 
              onClick={onHealthLogClick}
              className="py-4 bg-white border-2 border-indigo-500 text-indigo-600 font-bold rounded-2xl shadow-sm active:scale-95 transition-transform flex flex-col items-center justify-center gap-1 hover:bg-indigo-50"
            >
              <Activity className="w-6 h-6" />
              <span className="text-sm">Diário de Saúde</span>
            </button>
          </div>
          
          {lastRecord && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col justify-center">
              <h3 className="text-slate-500 text-sm uppercase tracking-wider font-semibold mb-3">Última Aplicação</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{lastRecord.dosage} mg</p>
                  <p className="text-slate-500 text-sm">{lastRecord.site}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-800 font-medium">{new Date(lastRecord.date).toLocaleDateString('pt-BR')}</p>
                  <p className="text-slate-400 text-xs flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(lastRecord.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weight Chart */}
        {weightData.length > 1 && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-slate-500 text-sm uppercase tracking-wider font-semibold">Evolução de Peso</h3>
               <span className="text-indigo-600 font-bold text-sm bg-indigo-50 px-2 py-1 rounded-md">
                  {weightData[weightData.length - 1].weight} kg
               </span>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value) => [`${value} kg`, 'Peso']}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-800 text-xs leading-relaxed">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p>
          Este aplicativo serve apenas para registro pessoal. Não substitui o aconselhamento médico profissional. 
          Siga sempre as instruções do seu médico.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
