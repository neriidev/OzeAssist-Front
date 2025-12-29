
export enum DosageAmount {
  DOSE_0_25 = 0.25,
  DOSE_0_50 = 0.50,
  DOSE_1_00 = 1.00,
  DOSE_2_00 = 2.00,
}

export enum InjectionSite {
  ABDOMEN = 'Abdômen',
  THIGH_LEFT = 'Coxa Esquerda',
  THIGH_RIGHT = 'Coxa Direita',
  ARM_LEFT = 'Braço Esquerdo',
  ARM_RIGHT = 'Braço Direito',
}

export interface InjectionRecord {
  id: string;
  date: string; // ISO string
  dosage: number;
  site: InjectionSite;
  notes?: string;
}

export interface HealthRecord {
  id: string;
  date: string; // ISO string
  weight?: number; // kg
  sideEffects: string[];
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type DosageFrequency = 'daily' | 'weekly' | 'monthly';

export interface User {
  name: string;
  email: string;
  affiliateCode?: string;
  medication?: string;
  currentDosage?: number;
  dosageFrequency?: DosageFrequency;
  weightGoal?: number;
  initialWeight?: number;
  createdAt: string; // ISO string para controle do Trial
  isPremium: boolean; // Status de assinatura
}

export interface Reminder {
  id: string;
  dayOfWeek?: number; // 0 = Domingo, 1 = Segunda... (Opcional se for diário)
  dayOfMonth?: number; // 1-31 (Opcional se for mensal)
  time: string; // "08:00"
  enabled: boolean;
  frequency: DosageFrequency;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name placeholder
  condition: (records: InjectionRecord[], healthRecords: HealthRecord[]) => boolean;
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealItem {
  id: string;
  name: string;
  calories?: number;
}

export interface NutritionDay {
  date: string; // YYYY-MM-DD
  waterIntake: number; // quantidade de copos (250ml)
  meals: {
    breakfast: MealItem[];
    lunch: MealItem[];
    dinner: MealItem[];
    snack: MealItem[];
  };
}

// --- Sistema de Afiliados ---
export interface AffiliateLead {
  id: string;
  referredEmail: string;
  date: string;
  status: 'active' | 'pending';
}

export interface AffiliateData {
  ownerEmail: string;
  code: string;
  points: number;
  clicks: number;
  leads: AffiliateLead[];
}
