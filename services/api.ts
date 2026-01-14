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

      console.log('API Response:', { status: response.status, statusText: response.statusText, url, method: options.method });

      // Se for 204 No Content, retornar objeto vazio imediatamente (sem ler o body)
      if (response.status === 204) {
        return {} as T;
      }

      // Ler o texto da resposta uma única vez
      let responseText = '';
      try {
        responseText = await response.text();
      } catch (textError) {
        // Se não conseguir ler o texto
        console.warn('Could not read response text:', textError);
        // Para DELETE com status de sucesso, considerar sucesso mesmo sem ler
        if (options.method === 'DELETE' && response.ok) {
          console.log('DELETE successful (could not read response)');
          return {} as T;
        }
        if (response.ok) {
          // Se for sucesso mas não conseguiu ler, retornar objeto vazio
          return {} as T;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Para DELETE, qualquer status de sucesso (200, 204) com resposta vazia é considerado sucesso
      if (options.method === 'DELETE' && response.ok && (!responseText || responseText.trim() === '')) {
        console.log('DELETE successful with empty response');
        return {} as T;
      }

      // Se a resposta estiver vazia e for sucesso, retornar objeto vazio
      if (!responseText || responseText.trim() === '') {
        if (response.ok) {
          console.log('Empty response body for successful request, returning empty object');
          return {} as T;
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      if (!response.ok) {
        // Tentar parse do erro como JSON, mas não falhar se não for JSON
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const error = JSON.parse(responseText);
          errorMessage = error.error || error.message || errorMessage;
        } catch {
          // Se não for JSON, usar o texto como mensagem de erro
          errorMessage = responseText.length > 100 ? responseText.substring(0, 100) + '...' : responseText;
        }
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
      }

      // Verificar content-type antes de fazer parse JSON
      const contentType = response.headers.get('content-type') || '';
      
      // Se não for JSON, retornar o texto
      if (!contentType.includes('application/json')) {
        console.log('Non-JSON response, returning text');
        return responseText as unknown as T;
      }
      
      // Tentar fazer parse do JSON
      try {
        const data = JSON.parse(responseText);
        return data;
      } catch (parseError) {
        // Se falhar o parse, retornar objeto vazio (não lançar erro)
        console.warn('Failed to parse JSON response, returning empty object. Content-Type:', contentType, 'Text length:', responseText.length);
        return {} as T;
      }
    } catch (error: any) {
      // Se o erro já for uma instância de Error, apenas relançar
      if (error instanceof Error) {
        console.error('Fetch error:', error.message);
        throw error;
      }
      // Caso contrário, criar um novo Error
      console.error('Fetch error:', error);
      throw new Error(error?.message || 'Erro desconhecido na requisição');
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

