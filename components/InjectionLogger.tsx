
import React, { useState, useEffect } from 'react';
import { InjectionRecord, InjectionSite } from '../types';
import { INJECTION_SITES, PEN_CONFIGS } from '../constants';
import { 
  Check, X, Info, Droplets, 
  Clock, ShieldCheck, Beaker, MousePointer2, AlertTriangle, 
  HandMetal, ArrowRight, ShieldAlert, Zap
} from 'lucide-react';

interface InjectionLoggerProps {
  onSave: (record: Omit<InjectionRecord, 'id'>) => void;
  onCancel: () => void;
}

type LoggerStep = 'setup' | 'preparation' | 'flow' | 'application' | 'timer' | 'notes';

const InjectionLogger: React.FC<InjectionLoggerProps> = ({ onSave, onCancel }) => {
  const [step, setStep] = useState<LoggerStep>('setup');
  const [dosage, setDosage] = useState<number>(0.25);
  const [penType, setPenType] = useState<'TITRATION' | 'MAINTENANCE'>('TITRATION');
  const [site, setSite] = useState<InjectionSite>(InjectionSite.ABDOMEN);
  const [isFirstUse, setIsFirstUse] = useState(false);
  const [timerCount, setTimerCount] = useState(6);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [date, setDate] = useState<string>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  useEffect(() => {
    let interval: any;
    if (isTimerActive && timerCount > 0) {
      interval = setInterval(() => {
        setTimerCount((prev) => prev - 1);
      }, 1000);
    } else if (timerCount === 0) {
      setIsTimerActive(false);
      setTimeout(() => setStep('notes'), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerCount]);

  const startTimer = () => {
    setTimerCount(6);
    setIsTimerActive(true);
  };

  const currentPenConfig = PEN_CONFIGS[penType];
  const clicksForDose = (currentPenConfig.clicks as any)[dosage] || '--';

  const handleFinalSave = () => {
    onSave({ date, dosage, site, notes });
  };

  // SVG Timer setup - ViewBox fixed to avoid clipping
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * (6 - timerCount) / 6);

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col font-sans">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm shrink-0">
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guia de Aplicação Oficial</h2>
          <div className="flex gap-1 justify-center mt-1">
            {['setup', 'preparation', 'flow', 'application', 'timer', 'notes'].map((s, idx) => (
              <div key={s} className={`h-1 w-3 rounded-full transition-all duration-300 ${idx <= ['setup', 'preparation', 'flow', 'application', 'timer', 'notes'].indexOf(step) ? 'bg-teal-500 w-6' : 'bg-slate-100'}`} />
            ))}
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        <div className="max-w-md mx-auto h-full">
          
          {/* STEP 1: SETUP */}
          {step === 'setup' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-3xl flex items-center justify-center text-teal-600 mx-auto mb-4 shadow-sm">
                  <Beaker className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Prepare sua Caneta</h3>
                <p className="text-sm text-slate-500">Configure a dose conforme sua prescrição.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-4 block tracking-widest">Selecione o Modelo</label>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => {setPenType('TITRATION'); setDosage(0.25);}}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex justify-between items-center ${penType === 'TITRATION' ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                    >
                      <div>
                        <p className="font-bold text-sm">Caneta 0.25 / 0.5 mg</p>
                        <p className="text-[10px] opacity-70">Rótulo Verde / Azul</p>
                      </div>
                      {penType === 'TITRATION' && <Check className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => {setPenType('MAINTENANCE'); setDosage(1.0);}}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex justify-between items-center ${penType === 'MAINTENANCE' ? 'border-red-500 bg-red-50 text-red-700 shadow-sm' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                    >
                      <div>
                        <p className="font-bold text-sm">Caneta 1.0 mg</p>
                        <p className="text-[10px] opacity-70">Rótulo Vermelho</p>
                      </div>
                      {penType === 'MAINTENANCE' && <Check className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-4 block tracking-widest">Dose a Aplicar</label>
                  <div className="grid grid-cols-3 gap-2">
                    {currentPenConfig.availableDoses.map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setDosage(opt)}
                        className={`py-4 rounded-2xl text-sm font-black border-2 transition-all ${dosage === opt ? 'bg-slate-800 border-slate-800 text-white' : 'bg-slate-50 border-slate-50 text-slate-400'}`}
                      >
                        {opt} mg
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white rounded-3xl border border-slate-100">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isFirstUse ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700">Esta caneta é nova?</p>
                    <p className="text-[10px] text-slate-400">Requer teste de fluxo inicial.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={isFirstUse} 
                    onChange={e => setIsFirstUse(e.target.checked)}
                    className="w-6 h-6 accent-teal-600 rounded-lg"
                  />
                </div>
              </div>

              <button onClick={() => setStep('preparation')} className="w-full py-5 bg-teal-600 text-white font-black rounded-3xl shadow-xl shadow-teal-100 flex justify-center items-center gap-2 active:scale-95 transition-all">
                Iniciar Aplicação <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 2: PREPARATION */}
          {step === 'preparation' && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <div className="text-center">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">1. Preparação</h3>
                <p className="text-sm text-slate-500">Siga cada passo com atenção.</p>
              </div>

              <div className="space-y-3">
                {[
                  { icon: <HandMetal />, text: "Lave as mãos.", detail: "Higiene é fundamental para evitar infecções." },
                  { icon: <Droplets />, text: "Verifique o líquido.", detail: "O líquido deve estar límpido e incolor." },
                  { icon: <ShieldCheck />, text: "Conecte a agulha.", detail: "Rosqueie firmemente e retire as duas tampas." },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-teal-600 shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{item.text}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('setup')} className="flex-1 py-5 bg-slate-200 text-slate-600 font-black rounded-3xl">Voltar</button>
                <button onClick={() => setStep(isFirstUse ? 'flow' : 'application')} className="flex-[2] py-5 bg-teal-600 text-white font-black rounded-3xl shadow-xl">Confirmado</button>
              </div>
            </div>
          )}

          {/* STEP 3: FLOW TEST */}
          {step === 'flow' && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <div className="text-center">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">2. Teste de Fluxo</h3>
                <p className="text-sm text-slate-500">Removendo o ar da caneta.</p>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-3xl text-amber-700">
                  <Droplets className="w-8 h-8 shrink-0" />
                  <p className="text-xs font-black leading-tight">Gire o seletor até o símbolo de teste (gota).</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <p className="text-sm text-slate-600 leading-relaxed font-medium text-center">
                    Com a agulha para cima, aperte o botão até o <strong>"0"</strong>.
                  </p>
                  <p className="text-[10px] text-teal-600 font-bold text-center uppercase tracking-widest animate-pulse">Uma gota deve surgir na agulha</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl text-[10px] text-blue-700 text-center font-bold">
                  *Pode repetir até 6 vezes. Se persistir, troque a agulha.
                </div>
              </div>

              <button onClick={() => setStep('application')} className="w-full py-5 bg-teal-600 text-white font-black rounded-3xl shadow-xl">Gota visível, pronto!</button>
            </div>
          )}

          {/* STEP 4: APPLICATION WITH CLICK COUNTER */}
          {step === 'application' && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <div className="text-center">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">3. Seleção da Dose</h3>
                <p className="text-sm text-slate-500">Gire o seletor da sua caneta física.</p>
              </div>

              <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl space-y-6 relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg">Contador de Cliques</h4>
                      <p className="text-[10px] opacity-60 uppercase font-bold tracking-widest">Gire lentamente</p>
                    </div>
                  </div>
                  <div className="bg-teal-500 px-4 py-2 rounded-2xl font-black text-2xl shadow-lg shadow-teal-500/20">
                    {clicksForDose}
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Dose Alvo</p>
                    <p className="text-2xl font-black text-teal-400">{dosage} mg</p>
                  </div>
                  <div className="h-10 w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Visor</p>
                    <p className="text-2xl font-black text-white">{dosage}</p>
                  </div>
                </div>
                
                <div className="space-y-3 pt-2 relative z-10">
                  <div className="flex items-start gap-3 text-xs font-bold leading-relaxed opacity-80">
                    <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                    <p>Aplique em 90° (ângulo reto) na gordura.</p>
                  </div>
                  <div className="flex items-start gap-3 text-xs font-bold leading-relaxed opacity-80">
                    <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                    <p>Pressione e segure até o visor voltar ao <strong>"0"</strong>.</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-3xl -mr-16 -mt-16"></div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Onde está aplicando?</label>
                <select 
                  value={site} 
                  onChange={e => setSite(e.target.value as InjectionSite)}
                  className="w-full p-5 bg-white border border-slate-100 rounded-3xl text-sm font-black text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {INJECTION_SITES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>

              <button onClick={() => setStep('timer')} className="w-full py-5 bg-teal-600 text-white font-black rounded-3xl shadow-xl flex items-center justify-center gap-3">
                Botão Pressionado! <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 5: TIMER (FIXED UI - NO CLIPPING) */}
          {step === 'timer' && (
            <div className="h-full flex flex-col items-center justify-center space-y-12 animate-in zoom-in-95 duration-700">
              <div className="text-center space-y-3">
                <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Regra dos 6 Segundos</h3>
                <p className="text-sm font-medium text-slate-500 px-8">O visor marcou <strong>"0"</strong>? Mantenha pressionado e conte até seis.</p>
              </div>

              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl" viewBox="0 0 100 100">
                  {/* Outer track */}
                  <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  {/* Progress circle */}
                  <circle 
                    cx="50" cy="50" r={radius} 
                    fill="none" 
                    stroke="url(#timerGradient)" 
                    strokeWidth="8" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                  <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2dd4bf" />
                      <stop offset="100%" stopColor="#0d9488" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-8xl font-black text-slate-800 transition-all duration-300 ${isTimerActive ? 'scale-110' : 'scale-100'}`}>
                    {timerCount}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">segundos</span>
                </div>
              </div>

              {!isTimerActive && timerCount === 6 && (
                <button 
                  onClick={startTimer} 
                  className="w-56 py-5 bg-slate-900 text-white font-black rounded-3xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Clock className="w-5 h-5" /> Iniciar Contagem
                </button>
              )}

              {timerCount === 0 && (
                <div className="text-teal-600 flex flex-col items-center gap-3 font-black animate-in fade-in zoom-in duration-500">
                  <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8" />
                  </div>
                  <p className="text-lg tracking-tight">Pode retirar a agulha.</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: NOTES */}
          {step === 'notes' && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-4 shadow-sm">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Sucesso!</h3>
                <p className="text-sm text-slate-500">Dose {dosage}mg devidamente aplicada.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Horário</label>
                    <input 
                      type="datetime-local" 
                      value={date} 
                      onChange={e => setDate(e.target.value)}
                      className="w-full p-4 bg-slate-50 rounded-2xl text-sm border-none outline-none font-black text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Observações</label>
                    <textarea 
                      value={notes} 
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Ex: Aplicação indolor no abdômen."
                      className="w-full p-4 bg-slate-50 rounded-2xl text-sm border-none outline-none min-h-[120px] text-slate-700 font-medium"
                    />
                  </div>
                </div>

                <div className="bg-red-50 p-5 rounded-3xl flex items-start gap-4 border border-red-100">
                  <div className="p-2 bg-red-500 text-white rounded-xl">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-red-800 font-black leading-tight">Descarte Seguro</p>
                    <p className="text-[10px] text-red-600 mt-0.5">Recoloque a tampa externa da agulha e descarte em um coletor de materiais perfurocortantes.</p>
                  </div>
                </div>
              </div>

              <button onClick={handleFinalSave} className="w-full py-5 bg-teal-600 text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all">Concluir Registro</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default InjectionLogger;
