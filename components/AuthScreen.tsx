
import React, { useState } from 'react';
import { User, AffiliateData, DosageFrequency, Reminder } from '../types';
import { apiService } from '../services/api';
import { 
  Eye, EyeOff, LogIn, UserPlus, AlertCircle, 
  ChevronRight, ArrowLeft, Pill, Target, Activity, Check, Calendar, Clock
} from 'lucide-react';

interface AuthScreenProps {
  onAuthenticate: (user: User) => void;
}

type OnboardingStep = 'auth' | 'medication' | 'dosage' | 'frequency' | 'goal' | 'success';

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticate }) => {
  // Auth States
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Onboarding States
  const [step, setStep] = useState<OnboardingStep>('auth');
  const [medication, setMedication] = useState('Ozempic');
  const [dosage, setDosage] = useState(0.25);
  const [frequency, setFrequency] = useState<DosageFrequency>('weekly');
  const [weightGoal, setWeightGoal] = useState('');
  const [initialWeight, setInitialWeight] = useState('');

  const medicationOptions = ['Ozempic', 'Wegovy', 'Mounjaro', 'Saxenda', 'Outro'];
  const dosageOptions = [0.25, 0.50, 1.0, 2.0];
  const frequencyOptions: { value: DosageFrequency, label: string, desc: string }[] = [
    { value: 'daily', label: 'Diário', desc: 'Todo dia no mesmo horário' },
    { value: 'weekly', label: 'Semanal', desc: 'Uma vez por semana' },
    { value: 'monthly', label: 'Mensal', desc: 'Uma vez por mês' }
  ];

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      try {
        const result = await apiService.login(email, password);
        onAuthenticate({
          name: result.user.name,
          email: result.user.email,
          affiliateCode: result.user.affiliateCode,
          medication: result.user.medication,
          currentDosage: result.user.currentDosage,
          dosageFrequency: result.user.dosageFrequency,
          weightGoal: result.user.weightGoal,
          initialWeight: result.user.initialWeight,
          createdAt: result.user.createdAt,
          isPremium: result.user.isPremium,
        });
      } catch (err: any) {
        setError(err.message || 'E-mail ou senha incorretos.');
      }
    } else {
      if (!email || !password || !name) {
        setError('Preencha todos os campos.');
        return;
      }
      if (password.length < 4) {
        setError('A senha deve ter pelo menos 4 caracteres.');
        return;
      }
      setStep('medication');
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      setError('');
      const newUser = await apiService.register({
        name,
        email,
        password,
        medication,
        currentDosage: dosage,
        dosageFrequency: frequency,
        weightGoal: weightGoal ? parseFloat(weightGoal) : undefined,
        initialWeight: initialWeight ? parseFloat(initialWeight) : undefined,
      });

      // Login after registration
      const loginResult = await apiService.login(email, password);

      // Auto-setup Reminder
      await apiService.createReminder({
        time: "08:00",
        enabled: true,
        frequency: frequency,
        dayOfWeek: frequency === 'weekly' ? new Date().getDay() : undefined,
        dayOfMonth: frequency === 'monthly' ? new Date().getDate() : undefined,
      });

      onAuthenticate({
        name: loginResult.user.name,
        email: loginResult.user.email,
        affiliateCode: loginResult.user.affiliateCode,
        medication: loginResult.user.medication,
        currentDosage: loginResult.user.currentDosage,
        dosageFrequency: loginResult.user.dosageFrequency,
        weightGoal: loginResult.user.weightGoal,
        initialWeight: loginResult.user.initialWeight,
        createdAt: loginResult.user.createdAt,
        isPremium: loginResult.user.isPremium,
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    }
  };

  const renderProgressBar = () => {
    const steps: OnboardingStep[] = ['medication', 'dosage', 'frequency', 'goal', 'success'];
    const currentIdx = steps.indexOf(step);
    if (currentIdx === -1) return null;

    return (
      <div className="flex gap-1 mb-8">
        {steps.map((s, idx) => (
          <div 
            key={s} 
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${idx <= currentIdx ? 'bg-teal-600' : 'bg-slate-200'}`}
          ></div>
        ))}
      </div>
    );
  };

  if (step !== 'auth') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-6 py-12">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          {renderProgressBar()}
          
          {step === 'medication' && (
            <div className="space-y-6 animate-in slide-in-from-right-10 duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mx-auto mb-4">
                  <Pill className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Qual medicamento você usa?</h2>
                <p className="text-sm text-slate-500 mt-2">Isso nos ajuda a personalizar seu acompanhamento.</p>
              </div>
              <div className="space-y-3">
                {medicationOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setMedication(opt)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex justify-between items-center ${
                      medication === opt ? 'border-teal-600 bg-teal-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <span className={`font-bold ${medication === opt ? 'text-teal-700' : 'text-slate-600'}`}>{opt}</span>
                    {medication === opt && <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setStep('dosage')}
                className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-lg flex justify-center items-center gap-2 hover:bg-teal-700 transition-all"
              >
                Próximo <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 'dosage' && (
            <div className="space-y-6 animate-in slide-in-from-right-10 duration-300">
              <div className="text-center">
                <button onClick={() => setStep('medication')} className="text-slate-400 hover:text-slate-600 mb-4 inline-flex items-center gap-1 text-sm">
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
                  <Activity className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Qual sua dose atual?</h2>
                <p className="text-sm text-slate-500 mt-2">Qual a miligramagem da sua última aplicação?</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {dosageOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setDosage(opt)}
                    className={`p-6 rounded-3xl border-2 text-center transition-all ${
                      dosage === opt ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <span className={`text-xl font-black ${dosage === opt ? 'text-indigo-700' : 'text-slate-400'}`}>{opt}</span>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">mg</span>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setStep('frequency')}
                className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-lg flex justify-center items-center gap-2 hover:bg-teal-700 transition-all"
              >
                Continuar <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 'frequency' && (
            <div className="space-y-6 animate-in slide-in-from-right-10 duration-300">
              <div className="text-center">
                <button onClick={() => setStep('dosage')} className="text-slate-400 hover:text-slate-600 mb-4 inline-flex items-center gap-1 text-sm">
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                  <Calendar className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Com que frequência?</h2>
                <p className="text-sm text-slate-500 mt-2">Vamos configurar seus lembretes automáticos.</p>
              </div>
              <div className="space-y-3">
                {frequencyOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFrequency(opt.value)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex justify-between items-center ${
                      frequency === opt.value ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div>
                      <span className={`block font-bold ${frequency === opt.value ? 'text-blue-700' : 'text-slate-600'}`}>{opt.label}</span>
                      <span className="text-[10px] text-slate-400">{opt.desc}</span>
                    </div>
                    {frequency === opt.value && <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setStep('goal')}
                className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-lg flex justify-center items-center gap-2 hover:bg-teal-700 transition-all"
              >
                Configurar Meta <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 'goal' && (
            <div className="space-y-6 animate-in slide-in-from-right-10 duration-300">
              <div className="text-center">
                <button onClick={() => setStep('frequency')} className="text-slate-400 hover:text-slate-600 mb-4 inline-flex items-center gap-1 text-sm">
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-4">
                  <Target className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Qual sua meta?</h2>
                <p className="text-sm text-slate-500 mt-2">Vamos acompanhar seu progresso de peso.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Peso Atual (Opcional)</label>
                  <div className="relative mt-1">
                    <input 
                      type="number" 
                      placeholder="Ex: 85.0"
                      value={initialWeight}
                      onChange={(e) => setInitialWeight(e.target.value)}
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none text-lg font-bold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">kg</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Meta de Peso</label>
                  <div className="relative mt-1">
                    <input 
                      type="number" 
                      placeholder="Ex: 75.0"
                      value={weightGoal}
                      onChange={(e) => setWeightGoal(e.target.value)}
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none text-lg font-bold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">kg</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setStep('success')}
                className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-lg flex justify-center items-center gap-2 hover:bg-teal-700 transition-all"
              >
                Próximo <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-teal-600 rounded-full flex items-center justify-center text-white mx-auto shadow-xl shadow-teal-200">
                <Check className="w-12 h-12 stroke-[3]" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900">Tudo Pronto!</h2>
                <p className="text-slate-500 mt-2">Sua jornada personalizada no OzeAssist começa agora.</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 text-teal-600 flex items-center gap-2">
                   <Target className="w-3 h-3" /> Teste Grátis Ativado
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Expira em:</span> <span className="font-bold text-slate-800">7 dias</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Dose Base:</span> <span className="font-bold text-slate-800">{dosage} mg</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Frequência:</span> <span className="font-bold text-slate-800 capitalize">{frequency === 'weekly' ? 'Semanal' : 'Diário'}</span></div>
                </div>
              </div>
              <button 
                onClick={handleOnboardingComplete}
                className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-lg hover:bg-teal-700 transition-all"
              >
                Começar agora
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xl shadow-sm mb-4">
          OA
        </div>
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-slate-900">
          {isLogin ? 'Entrar no OzeAssist' : 'Criar sua conta'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          {isLogin ? 'Bem-vindo de volta!' : 'Ganhe 7 dias de acesso Premium grátis'}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleAuthSubmit}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900">Nome</label>
              <div className="mt-2">
                <input
                  type="text"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 outline-none"
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900">E-mail</label>
            <div className="mt-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border-0 py-3 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 outline-none"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium leading-6 text-slate-900">Senha</label>
            </div>
            <div className="mt-2 relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border-0 py-3 pl-3 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-xl bg-teal-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-teal-500 transition-colors gap-2 items-center"
            >
              {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {isLogin ? 'Entrar' : 'Cadastrar e Iniciar Teste'}
            </button>
          </div>
        </form>
        <p className="mt-10 text-center text-sm text-slate-500">
          {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          {' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setEmail('');
              setPassword('');
              setName('');
            }}
            className="font-semibold leading-6 text-teal-600 hover:text-teal-500"
          >
            {isLogin ? 'Cadastre-se agora' : 'Faça login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
