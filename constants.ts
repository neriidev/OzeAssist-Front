
import { InjectionSite, Achievement } from './types';

export const INJECTION_SITES = [
  { id: InjectionSite.ABDOMEN, label: 'Abdômen', color: 'bg-blue-100 border-blue-300' },
  { id: InjectionSite.THIGH_LEFT, label: 'Coxa Esquerda', color: 'bg-indigo-100 border-indigo-300' },
  { id: InjectionSite.THIGH_RIGHT, label: 'Coxa Direita', color: 'bg-indigo-100 border-indigo-300' },
  { id: InjectionSite.ARM_LEFT, label: 'Braço Esquerdo', color: 'bg-teal-100 border-teal-300' },
  { id: InjectionSite.ARM_RIGHT, label: 'Braço Direito', color: 'bg-teal-100 border-teal-300' },
];

export const DOSAGE_OPTIONS = [0.25, 0.5, 1.0, 2.0];

export const PEN_CONFIGS = {
  TITRATION: {
    id: 'TITRATION',
    label: 'Caneta 0.25 / 0.5 mg',
    color: 'Verde/Azul',
    totalMg: 2,
    availableDoses: [0.25, 0.5],
    clicks: {
      0.25: 18,
      0.50: 36
    }
  },
  MAINTENANCE: {
    id: 'MAINTENANCE',
    label: 'Caneta 1.0 mg',
    color: 'Vermelha',
    totalMg: 4,
    availableDoses: [0.25, 0.5, 1.0], // 0.25/0.5 incluídos para casos de titulação na caneta de 1mg
    clicks: {
      0.25: 18,
      0.50: 37,
      1.00: 74
    }
  }
};

export const COMMON_SIDE_EFFECTS = [
  "Náusea",
  "Vômito",
  "Diarreia",
  "Constipação",
  "Dor de cabeça",
  "Tontura",
  "Cansaço",
  "Dor abdominal",
  "Azia",
  "Sem apetite"
];

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_step',
    title: 'O Início',
    description: 'Registrou sua primeira aplicação.',
    icon: 'Flag',
    condition: (r) => r.length >= 1
  },
  {
    id: 'consistent_month',
    title: 'Mês Focado',
    description: 'Completou 4 aplicações.',
    icon: 'CalendarCheck',
    condition: (r) => r.length >= 4
  },
  {
    id: 'quarter_master',
    title: 'Trimestre de Ouro',
    description: 'Alcançou 12 aplicações registradas.',
    icon: 'Trophy',
    condition: (r) => r.length >= 12
  },
  {
    id: 'health_conscious',
    title: 'De Olho na Saúde',
    description: 'Fez 5 registros no diário de saúde.',
    icon: 'Activity',
    condition: (_, h) => h.length >= 5
  },
  {
    id: 'weight_watcher',
    title: 'Balança Amiga',
    description: 'Registrou o peso 3 vezes.',
    icon: 'Scale',
    condition: (_, h) => h.filter(x => x.weight).length >= 3
  }
];
