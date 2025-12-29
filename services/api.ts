// Em produção no Railway, usar /api (proxy nginx)
// Em desenvolvimento, usar VITE_API_URL ou localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

console.log('API_BASE_URL configured as:', API_BASE_URL);
console.log('Environment:', {
  PROD: import.meta.env.PROD,
  VITE_API_URL: import.meta.env.VITE_API_URL
});

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('oze_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log('API Request:', { method: options.method || 'GET', url, endpoint });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('API Response:', { status: response.status, statusText: response.statusText, url });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error('API Error:', error);
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  // Auth
  async register(data: {
    name: string;
    email: string;
    password: string;
    medication?: string;
    currentDosage?: number;
    dosageFrequency?: 'daily' | 'weekly' | 'monthly';
    weightGoal?: number;
    initialWeight?: number;
  }) {
    const result = await this.request<{ id: string; name: string; email: string; [key: string]: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  }

  async login(email: string, password: string) {
    const result = await this.request<{
      user: {
        id: string;
        name: string;
        email: string;
        affiliateCode?: string;
        medication?: string;
        currentDosage?: number;
        dosageFrequency?: 'daily' | 'weekly' | 'monthly';
        weightGoal?: number;
        initialWeight?: number;
        isPremium: boolean;
        createdAt: string;
      };
      token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (result.token) {
      localStorage.setItem('oze_token', result.token);
    }
    
    return result;
  }

  logout() {
    localStorage.removeItem('oze_token');
  }

  // User
  async getProfile() {
    return this.request('/user/profile');
  }

  async updateProfile(data: {
    name?: string;
    medication?: string;
    currentDosage?: number;
    dosageFrequency?: 'daily' | 'weekly' | 'monthly';
    weightGoal?: number;
    initialWeight?: number;
  }) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Injections
  async getInjectionRecords() {
    return this.request('/injections');
  }

  async createInjectionRecord(data: {
    date: string;
    dosage: number;
    site: string;
    notes?: string;
  }) {
    return this.request('/injections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInjectionRecord(id: string, data: {
    date?: string;
    dosage?: number;
    site?: string;
    notes?: string;
  }) {
    return this.request(`/injections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInjectionRecord(id: string) {
    return this.request(`/injections/${id}`, {
      method: 'DELETE',
    });
  }

  // Health Records
  async getHealthRecords() {
    return this.request('/health-records');
  }

  async createHealthRecord(data: {
    date: string;
    weight?: number;
    sideEffects: string[];
    notes?: string;
  }) {
    return this.request('/health-records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHealthRecord(id: string, data: {
    date?: string;
    weight?: number;
    sideEffects?: string[];
    notes?: string;
  }) {
    return this.request(`/health-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHealthRecord(id: string) {
    return this.request(`/health-records/${id}`, {
      method: 'DELETE',
    });
  }

  // Nutrition
  async getNutritionDays() {
    return this.request('/nutrition');
  }

  async createOrUpdateNutritionDay(data: {
    date: string;
    waterIntake: number;
    meals: {
      breakfast: Array<{ id: string; name: string; calories?: number }>;
      lunch: Array<{ id: string; name: string; calories?: number }>;
      dinner: Array<{ id: string; name: string; calories?: number }>;
      snack: Array<{ id: string; name: string; calories?: number }>;
    };
  }) {
    return this.request('/nutrition', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reminders
  async getReminders() {
    return this.request('/reminders');
  }

  async createReminder(data: {
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
  }) {
    return this.request('/reminders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReminder(id: string, data: {
    dayOfWeek?: number;
    dayOfMonth?: number;
    time?: string;
    enabled?: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
  }) {
    return this.request(`/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReminder(id: string) {
    return this.request(`/reminders/${id}`, {
      method: 'DELETE',
    });
  }

  // Achievements
  async getAchievements() {
    return this.request('/achievements');
  }

  async getUnlockedAchievements() {
    return this.request('/achievements/unlocked');
  }
}

export const apiService = new ApiService();

