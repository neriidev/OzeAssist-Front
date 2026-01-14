import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  InjectionRecord, 
  HealthRecord, 
  User, 
  Reminder, 
  UnlockedAchievement, 
  NutritionDay 
} from '../types';
import { ACHIEVEMENTS_LIST } from '../constants';
import { apiService } from '../services/api';

export type ActiveTab = 'dashboard' | 'nutrition' | 'history' | 'assistant' | 'profile' | 'reports' | 'affiliate';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
}

interface AppContextType {
  // User/Auth State
  user: User | null;
  isCheckingAuth: boolean;
  isTrialExpired: boolean;
  
  // UI State
  activeTab: ActiveTab;
  showInjectionLogger: boolean;
  showHealthLogger: boolean;
  showCheckout: boolean;
  alert: AlertState;
  
  // Data State
  records: InjectionRecord[];
  healthRecords: HealthRecord[];
  nutritionData: NutritionDay[];
  reminders: Reminder[];
  unlockedAchievements: UnlockedAchievement[];
  
  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setShowInjectionLogger: (show: boolean) => void;
  setShowHealthLogger: (show: boolean) => void;
  setShowCheckout: (show: boolean) => void;
  setAlert: (alert: AlertState) => void;
  
  // User Actions
  authenticate: (newUser: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Data Actions
  saveInjectionRecord: (recordData: Omit<InjectionRecord, 'id'>) => Promise<void>;
  saveHealthRecord: (recordData: Omit<HealthRecord, 'id'>) => Promise<void>;
  updateNutrition: (dayData: NutritionDay) => Promise<void>;
  deleteRecord: (id: string, type: 'injection' | 'health') => Promise<void>;
  
  // Reminder Actions
  addReminder: (reminder: Reminder) => void;
  deleteReminder: (id: string) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  
  // Subscription Actions
  handleSubscriptionSuccess: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // User/Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [showInjectionLogger, setShowInjectionLogger] = useState(false);
  const [showHealthLogger, setShowHealthLogger] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });
  
  // Data State
  const [records, setRecords] = useState<InjectionRecord[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [nutritionData, setNutritionData] = useState<NutritionDay[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);

  // Subscription Logic
  const isTrialExpired = useMemo(() => {
    if (!user || user.isPremium) return false;
    const start = new Date(user.createdAt).getTime();
    const now = new Date().getTime();
    const diffDays = (now - start) / (1000 * 60 * 60 * 24);
    return diffDays >= 7;
  }, [user]);

  // Verificar autenticação ao carregar o app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('oze_token');
        
        if (!token) {
          setIsCheckingAuth(false);
          return;
        }

        try {
          const profile = await apiService.getProfile();
          
          setUser({
            name: profile.name,
            email: profile.email,
            affiliateCode: profile.affiliateCode,
            medication: profile.medication,
            currentDosage: profile.currentDosage,
            dosageFrequency: profile.dosageFrequency,
            weightGoal: profile.weightGoal,
            initialWeight: profile.initialWeight,
            createdAt: profile.createdAt,
            isPremium: profile.isPremium,
          });
        } catch (error) {
          console.log('Token inválido ou expirado, fazendo logout...');
          apiService.logout();
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        apiService.logout();
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Load data from API when user changes
  useEffect(() => {
    if (!user) {
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
        setRecords([]);
        setHealthRecords([]);
        setNutritionData([]);
        setReminders([]);
        setUnlockedAchievements([]);

        const [injections, health, nutrition, remindersData, achievements] = await Promise.all([
          apiService.getInjectionRecords().catch(() => []),
          apiService.getHealthRecords().catch(() => []),
          apiService.getNutritionDays().catch(() => []),
          apiService.getReminders().catch(() => []),
          apiService.getUnlockedAchievements().catch(() => []),
        ]);

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

        setReminders(remindersData.map((r: any) => ({
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
  }, [user?.email]);

  // Check achievements when records change
  useEffect(() => {
    if (!user) return;
    
    setUnlockedAchievements(prev => {
      const newUnlocked: UnlockedAchievement[] = [...prev];
      let changed = false;

      ACHIEVEMENTS_LIST.forEach(achievement => {
        if (newUnlocked.some(u => u.id === achievement.id)) return;
        if (achievement.condition(records, healthRecords)) {
          newUnlocked.push({ id: achievement.id, unlockedAt: Date.now() });
          changed = true;
        }
      });

      return changed ? newUnlocked : prev;
    });
  }, [records, healthRecords, user]);

  // Actions
  const authenticate = (newUser: User) => {
    setRecords([]);
    setHealthRecords([]);
    setNutritionData([]);
    setReminders([]);
    setUnlockedAchievements([]);
    setUser(newUser);
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setRecords([]);
    setHealthRecords([]);
    setNutritionData([]);
    setReminders([]);
    setUnlockedAchievements([]);
    setActiveTab('dashboard');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const saveInjectionRecord = async (recordData: Omit<InjectionRecord, 'id'>) => {
    if (isTrialExpired) {
      setShowInjectionLogger(false);
      setShowCheckout(true);
      return;
    }
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

  const saveHealthRecord = async (recordData: Omit<HealthRecord, 'id'>) => {
    if (isTrialExpired) {
      setShowHealthLogger(false);
      setShowCheckout(true);
      return;
    }
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

  const updateNutrition = async (dayData: NutritionDay) => {
    if (isTrialExpired) {
      setShowCheckout(true);
      return;
    }
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

  const deleteRecord = async (id: string, type: 'injection' | 'health') => {
    if (isTrialExpired) {
      setShowCheckout(true);
      return;
    }
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

  const addReminder = (reminder: Reminder) => {
    setReminders(prev => [...prev, reminder]);
  };

  const deleteReminder = async (id: string) => {
    if (isTrialExpired) {
      setShowCheckout(true);
      return;
    }
    try {
      await apiService.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (error: any) {
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Erro ao Excluir',
        message: error.message || 'Erro ao excluir lembrete. Tente novamente.',
      });
    }
  };

  const toggleReminder = async (id: string) => {
    if (isTrialExpired) {
      setShowCheckout(true);
      return;
    }
    try {
      const reminder = reminders.find(r => r.id === id);
      if (reminder) {
        await apiService.updateReminder(id, { enabled: !reminder.enabled });
        setReminders(prev => prev.map(r => r.id === id ? {...r, enabled: !r.enabled} : r));
      }
    } catch (error: any) {
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Erro ao Atualizar',
        message: error.message || 'Erro ao atualizar lembrete. Tente novamente.',
      });
    }
  };

  const handleSubscriptionSuccess = () => {
    if (user) {
      setUser({ ...user, isPremium: true });
      setShowCheckout(false);
      setActiveTab('dashboard');
    }
  };

  const value: AppContextType = {
    // User/Auth State
    user,
    isCheckingAuth,
    isTrialExpired,
    
    // UI State
    activeTab,
    showInjectionLogger,
    showHealthLogger,
    showCheckout,
    alert,
    
    // Data State
    records,
    healthRecords,
    nutritionData,
    reminders,
    unlockedAchievements,
    
    // Actions
    setActiveTab,
    setShowInjectionLogger,
    setShowHealthLogger,
    setShowCheckout,
    setAlert,
    
    // User Actions
    authenticate,
    logout,
    updateUser,
    
    // Data Actions
    saveInjectionRecord,
    saveHealthRecord,
    updateNutrition,
    deleteRecord,
    
    // Reminder Actions
    addReminder,
    deleteReminder,
    toggleReminder,
    
    // Subscription Actions
    handleSubscriptionSuccess,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};

