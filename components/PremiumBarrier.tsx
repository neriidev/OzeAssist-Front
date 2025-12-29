
import React from 'react';
import { Crown, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface PremiumBarrierProps {
  onSubscribe: () => void;
  title: string;
  description: string;
}

const PremiumBarrier: React.FC<PremiumBarrierProps> = ({ onSubscribe, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/40 backdrop-blur-md border border-white/60 rounded-[2.5rem] text-center space-y-6 shadow-xl animate-in fade-in zoom-in-95 duration-500 min-h-[400px]">
      <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center text-white shadow-lg rotate-3">
        <Crown className="w-10 h-10" />
      </div>
      
      <div className="space-y-2 max-w-xs">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>

      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 w-full space-y-3">
        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
          <ShieldCheck className="w-4 h-4 text-teal-500" />
          IA Ilimitada e personalizada
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
          <Sparkles className="w-4 h-4 text-teal-500" />
          Relatórios de evolução PRO
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
          <Lock className="w-4 h-4 text-teal-500" />
          Acesso vitalício ao histórico
        </div>
      </div>

      <button 
        onClick={onSubscribe}
        className="w-full py-5 bg-teal-600 text-white font-black rounded-3xl shadow-xl shadow-teal-100 flex items-center justify-center gap-2 hover:bg-teal-700 transition-all active:scale-95"
      >
        Seja Premium Agora <ArrowRight className="w-5 h-5" />
      </button>
      
      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Apenas R$ 19,90/mês</p>
    </div>
  );
};

export default PremiumBarrier;
