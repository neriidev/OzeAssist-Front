
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import History from './components/History';
import AiAssistant from './components/AiAssistant';
import InjectionLogger from './components/InjectionLogger';
import HealthLogger from './components/HealthLogger';
import AuthScreen from './components/AuthScreen';
import Profile from './components/Profile';
import Reports from './components/Reports';
import Nutrition from './components/Nutrition';
import AffiliatePortal from './components/AffiliatePortal';
import PremiumBarrier from './components/PremiumBarrier';
import Checkout from './components/Checkout';
import { InjectionRecord, HealthRecord, User, Reminder, UnlockedAchievement, NutritionDay } from './types';
import { ACHIEVEMENTS_LIST } from './constants';
import { apiService } from './services/api';
import { LogOut } from 'lucide-react';
import AlertDialog from './components/AlertDialog';
import PWAInstallPrompt from './components/PWAInstallPrompt';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'nutrition' | 'history' | 'assistant' | 'profile' | 'reports' | 'affiliate'>('dashboard');
  
  // Modal States
  const [showInjectionLogger, setShowInjectionLogger] = useState(false);
  const [showHealthLogger, setShowHealthLogger] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Data States
  const [records, setRecords] = useState<InjectionRecord[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [nutritionData, setNutritionData] = useState<NutritionDay[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);

  // Alert Dialog State
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  // Subscription Logic
  const isTrialExpired = React.useMemo(() => {
    if (!user || user.isPremium) return false;
    const start = new Date(user.createdAt).getTime();
    const now = new Date().getTime();
    const diffDays = (now - start) / (1000 * 60 * 60 * 24);
    return diffDays >= 7;
  }, [user]);

  // Load data from API when user changes
  useEffect(() => {
    if (!user) {
      // User is null, clear all data
      setRecords([]);
      setHealthRecords([]);
      setNutritionData([]);
      setReminders([]);
      setUnlockedAchievements([]);
      return;
    }

    const loadData = async () => {
      const token = localStorage.getItem('oze_token');
      if (!token) {
        return;
      }

      try {
        // Clear old data before loading new data (user changed)
        setRecords([]);
        setHealthRecords([]);
        setNutritionData([]);
        setReminders([]);
        setUnlockedAchievements([]);

        // Load all data for the current user
        const [injections, health, nutrition, reminders, achievements] = await Promise.all([
          apiService.getInjectionRecords().catch(() => []),
          apiService.getHealthRecords().catch(() => []),
          apiService.getNutritionDays().catch(() => []),
          apiService.getReminders().catch(() => []),
          apiService.getUnlockedAchievements().catch(() => []),
        ]);

        // Update state with new data
        setRecords(injections.map((r: any) => ({
          id: r.id,
          date: r.date,
          dosage: r.dosage,
          site: r.site,
          notes: r.notes,
        })));

        setHealthRecords(health.map((r: any) => ({
          id: r.id,
          date: r.date,
          weight: r.weight,
          sideEffects: r.sideEffects,
          notes: r.notes,
        })));

        setNutritionData(nutrition.map((n: any) => ({
          date: n.date.split('T')[0],
          waterIntake: n.waterIntake,
          meals: n.meals,
        })));

        setReminders(reminders.map((r: any) => ({
          id: r.id,
          dayOfWeek: r.dayOfWeek,
          dayOfMonth: r.dayOfMonth,
          time: r.time,
          enabled: r.enabled,
          frequency: r.frequency,
        })));

        setUnlockedAchievements(achievements.map((a: any) => ({
          id: a.achievementId,
          unlockedAt: new Date(a.unlockedAt).getTime(),
        })));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        apiService.logout();
        setUser(null);
        setRecords([]);
        setHealthRecords([]);
        setNutritionData([]);
        setReminders([]);
        setUnlockedAchievements([]);
      }
    };

    loadData();
  }, [user?.email]); // Reload when user email changes

  useEffect(() => {
    checkAchievements(records, healthRecords);
  }, [records, healthRecords]);

  const checkAchievements = (currentRecords: InjectionRecord[], currentHealth: HealthRecord[]) => {
    const newUnlocked: UnlockedAchievement[] = [...unlockedAchievements];
    let changed = false;

    ACHIEVEMENTS_LIST.forEach(achievement => {
      if (newUnlocked.some(u => u.id === achievement.id)) return;
      if (achievement.condition(currentRecords, currentHealth)) {
        newUnlocked.push({ id: achievement.id, unlockedAt: Date.now() });
        changed = true;
      }
    });

    if (changed) {
      setUnlockedAchievements(newUnlocked);
    }
  };

  const handleSaveRecord = async (recordData: Omit<InjectionRecord, 'id'>) => {
    try {
      const newRecord = await apiService.createInjectionRecord({
        date: recordData.date,
        dosage: recordData.dosage,
        site: recordData.site,
        notes: recordData.notes,
      });
      setRecords(prev => [...prev, {
        id: newRecord.id,
        date: newRecord.date,
        dosage: newRecord.dosage,
        site: newRecord.site,
        notes: newRecord.notes,
      }]);
      setShowInjectionLogger(false);
      setActiveTab('dashboard');
    } catch (error: any) {
      console.error('Erro ao salvar registro:', error);
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Erro ao Salvar',
        message: error.message || 'Erro ao salvar registro. Tente novamente.',
      });
    }
  };

  const handleSaveHealthRecord = async (recordData: Omit<HealthRecord, 'id'>) => {
    try {
      const newRecord = await apiService.createHealthRecord({
        date: recordData.date,
        weight: recordData.weight,
        sideEffects: recordData.sideEffects,
        notes: recordData.notes,
      });
      setHealthRecords(prev => [...prev, {
        id: newRecord.id,
        date: newRecord.date,
        weight: newRecord.weight,
        sideEffects: newRecord.sideEffects,
        notes: newRecord.notes,
      }]);
      setShowHealthLogger(false);
      setActiveTab('dashboard');
    } catch (error: any) {
      console.error('Erro ao salvar registro de saúde:', error);
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Erro ao Salvar',
        message: error.message || 'Erro ao salvar registro de saúde. Tente novamente.',
      });
    }
  };

  const handleUpdateNutrition = async (dayData: NutritionDay) => {
    try {
      await apiService.createOrUpdateNutritionDay({
        date: dayData.date,
        waterIntake: dayData.waterIntake,
        meals: dayData.meals,
      });
      setNutritionData(prev => {
        const exists = prev.findIndex(d => d.date === dayData.date);
        if (exists >= 0) {
          const newData = [...prev];
          newData[exists] = dayData;
          return newData;
        } else {
          return [...prev, dayData];
        }
      });
    } catch (error: any) {
      console.error('Erro ao salvar nutrição:', error);
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Erro ao Salvar',
        message: error.message || 'Erro ao salvar dados de nutrição. Tente novamente.',
      });
    }
  };

  const handleDelete = async (id: string, type: 'injection' | 'health') => {
    try {
      if (type === 'injection') {
        await apiService.deleteInjectionRecord(id);
        setRecords(prev => prev.filter(r => r.id !== id));
      } else {
        await apiService.deleteHealthRecord(id);
        setHealthRecords(prev => prev.filter(r => r.id !== id));
      }
    } catch (error: any) {
      console.error('Erro ao deletar:', error);
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Erro ao Excluir',
        message: error.message || 'Erro ao excluir registro. Tente novamente.',
      });
    }
  };

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
    // Clear all data on logout
    setRecords([]);
    setHealthRecords([]);
    setNutritionData([]);
    setReminders([]);
    setUnlockedAchievements([]);
    setActiveTab('dashboard');
  };

  const handleSubscriptionSuccess = () => {
    if (user) {
      setUser({ ...user, isPremium: true });
      setShowCheckout(false);
      setActiveTab('dashboard');
    }
  };

  // Handle user authentication - clear data when user changes
  const handleAuthenticate = (newUser: User) => {
    // Clear all data before setting new user
    setRecords([]);
    setHealthRecords([]);
    setNutritionData([]);
    setReminders([]);
    setUnlockedAchievements([]);
    setUser(newUser);
  };

  if (!user) {
    return <AuthScreen onAuthenticate={handleAuthenticate} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      <Sidebar 
        user={user} 
        activeTab={activeTab === 'affiliate' ? 'profile' : activeTab} 
        onTabChange={(tab) => setActiveTab(tab)} 
        onLogout={handleLogout} 
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Mobile Top Bar */}
        <div className="bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm md:hidden">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setActiveTab('profile')}
          >
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 leading-none">
                OzeAssist
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Olá, {user.name.split(' ')[0]}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 rounded-full transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <main className="p-6 max-w-5xl mx-auto w-full">
            {activeTab === 'dashboard' && (
              <Dashboard 
                user={user}
                records={records} 
                healthRecords={healthRecords}
                onLogClick={() => setShowInjectionLogger(true)} 
                onHealthLogClick={() => setShowHealthLogger(true)}
                onUpgradeClick={() => setShowCheckout(true)}
              />
            )}
            {activeTab === 'nutrition' && (
              <Nutrition 
                nutritionData={nutritionData}
                onUpdateNutrition={handleUpdateNutrition}
                onNavigateToAI={() => setActiveTab('assistant')}
              />
            )}
            
            {activeTab === 'reports' && (
              isTrialExpired ? (
                <PremiumBarrier 
                  title="Relatórios Bloqueados" 
                  description="Seu período de teste grátis terminou. Assine o PRO para ver suas estatísticas detalhadas." 
                  onSubscribe={() => setShowCheckout(true)}
                />
              ) : (
                <Reports 
                  records={records}
                  healthRecords={healthRecords}
                  onBack={() => setActiveTab('history')}
                />
              )
            )}
            
            {activeTab === 'history' && (
              <History 
                records={records} 
                healthRecords={healthRecords}
                onDelete={handleDelete}
                onNavigateToReports={() => setActiveTab('reports')}
              />
            )}
            
            {activeTab === 'assistant' && (
              isTrialExpired ? (
                <PremiumBarrier 
                  title="Assistente IA PRO" 
                  description="Falar com nossa IA especialista requer uma assinatura ativa. Atualize para o PRO agora!" 
                  onSubscribe={() => setShowCheckout(true)}
                />
              ) : (
                <AiAssistant onBack={() => setActiveTab('nutrition')} />
              )
            )}
            
            {activeTab === 'profile' && (
              <Profile 
                 user={user}
                 reminders={reminders}
                 unlockedAchievements={unlockedAchievements}
                 onAddReminder={(r) => setReminders([...reminders, r])}
                 onDeleteReminder={async (id) => {
                   try {
                     await apiService.deleteReminder(id);
                     setReminders(reminders.filter(r => r.id !== id));
                   } catch (error: any) {
                     setAlert({
                       isOpen: true,
                       type: 'error',
                       title: 'Erro ao Excluir',
                       message: error.message || 'Erro ao excluir lembrete. Tente novamente.',
                     });
                   }
                 }}
                 onToggleReminder={async (id) => {
                   try {
                     const reminder = reminders.find(r => r.id === id);
                     if (reminder) {
                       await apiService.updateReminder(id, { enabled: !reminder.enabled });
                       setReminders(reminders.map(r => r.id === id ? {...r, enabled: !r.enabled} : r));
                     }
                   } catch (error: any) {
                     setAlert({
                       isOpen: true,
                       type: 'error',
                       title: 'Erro ao Atualizar',
                       message: error.message || 'Erro ao atualizar lembrete. Tente novamente.',
                     });
                   }
                 }}
                 onLogout={handleLogout}
                 onNavigateToAffiliate={() => setActiveTab('affiliate')}
                 onUpgrade={() => setShowCheckout(true)}
              />
            )}
            
            {activeTab === 'affiliate' && (
              isTrialExpired ? (
                <PremiumBarrier 
                  title="Programa de Afiliados" 
                  description="Indique amigos e ganhe prêmios no plano PRO." 
                  onSubscribe={() => setShowCheckout(true)}
                />
              ) : (
                <AffiliatePortal user={user} onBack={() => setActiveTab('profile')} />
              )
            )}
          </main>
        </div>

        {showInjectionLogger && <InjectionLogger onSave={handleSaveRecord} onCancel={() => setShowInjectionLogger(false)} />}
        {showHealthLogger && <HealthLogger onSave={handleSaveHealthRecord} onCancel={() => setShowHealthLogger(false)} />}
        {showCheckout && <Checkout onSuccess={handleSubscriptionSuccess} onCancel={() => setShowCheckout(false)} />}
        <Navigation activeTab={activeTab === 'affiliate' ? 'profile' : activeTab} onTabChange={setActiveTab} />
      </div>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

export default App;
