/**
 * POMOPET API Client - Real backend integration (Golang REST API)
 * Automatically handles JWT Bearer tokens and dynamic origin switching.
 */

export interface User {
  id: number;
  username: string;
  display_name: string;
  avatar: string;
  streak: number;
  last_active_at: string;
  created_at: string;
}

export interface Pet {
  id: number;
  user_id: number;
  species: 'cat' | 'dragon' | 'sprout' | 'penguin' | string;
  name: string;
  stage: 'baby' | 'teen' | 'adult';
  level: number;
  exp: number;
  max_exp: number;
  hunger: number;
  energy: number;
  mood: 'happy' | 'sleepy' | 'hungry' | 'focused' | 'proud' | string;
  equipped_hat: string;
  theme: string;
  pose: string;
  streak_days: number;
  updated_at: string;
}

export interface PomodoroSettings {
  work_duration: number; // in minutes
  short_break: number;
  long_break: number;
  long_break_interval: number;
  auto_start_breaks: boolean;
  auto_start_pomodoros: boolean;
  sound_theme: string;
}

export interface PomodoroSession {
  id: number;
  user_id: number;
  task_id?: number;
  mode: 'work' | 'short_break' | 'long_break';
  duration_minutes: number;
  actual_minutes: number;
  status: 'completed' | 'paused' | 'aborted';
  coins_earned: number;
  exp_earned: number;
  started_at: string;
  completed_at?: string;
}

export interface TaskItem {
  id: number;
  user_id: number;
  title: string;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high';
  estimated_pomodoros: number;
  completed_pomodoros: number;
  created_at: string;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'food' | 'hat' | 'theme';
  price: number;
  icon: string;
  description: string;
  buff_hunger?: number;
  buff_energy?: number;
  buff_mood?: number;
}

export interface UserInventoryItem {
  item_id: string;
  quantity: number;
  item?: ShopItem;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  target_count: number;
  current_count: number;
  reward_coins: number;
  reward_exp: number;
  is_completed: boolean;
  is_claimed: boolean;
}

export interface UserProfile {
  user_id: number;
  coins: number;
  gems: number;
  total_focus_minutes: number;
  completed_pomodoros: number;
  streak: number;
  inventory: UserInventoryItem[];
  unlocked_items: string[];
  daily_quests: DailyQuest[];
}

export interface FullState {
  user: User;
  pet: Pet;
  timer: PomodoroSettings;
  tasks: TaskItem[];
  profile: UserProfile;
  history: PomodoroSession[];
  shop_catalog: ShopItem[];
}

class ApiClient {
  private tokenKey = 'pomopet_auth_token';
  private userKey = 'pomopet_auth_user';

  private getBaseUrl(): string {
    if (typeof window === 'undefined') return 'http://localhost:8080';
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    // If running on next dev port 3000, talk to Go server at 8080
    if (window.location.port === '3000') {
      return 'http://localhost:8080';
    }
    return '';
  }

  getToken(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(this.tokenKey) || '';
  }

  setAuth(user: User, token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(this.userKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.logout();
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    const contentType = response.headers.get('content-type') || '';
    let data: any;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = data && data.error ? data.error : `Lỗi HTTP ${response.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  }

  // --- Auth ---
  login(body: { username: string; password: string }) {
    return this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  register(body: { username: string; password: string; display_name: string; initial_species?: string }) {
    return this.request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  getMe() {
    return this.request<User>('/api/auth/me');
  }

  // --- Mobile Wi-Fi Info ---
  getMobileInfo() {
    return this.request<{ local_ip: string; port: number; mobile_url: string }>('/api/mobile-info');
  }

  // --- Unified State Sync ---
  getFullState() {
    return this.request<FullState>('/api/state');
  }

  // --- Pet Endpoints ---
  getPet() {
    return this.request<Pet>('/api/pet');
  }

  feedPet(foodItemId?: string) {
    return this.request<{ pet: Pet; message: string }>('/api/pet/feed', {
      method: 'POST',
      body: JSON.stringify({ item_id: foodItemId || 'apple' }),
    });
  }

  patPet() {
    return this.request<{ pet: Pet; message: string }>('/api/pet/pat', {
      method: 'POST',
    });
  }

  adoptPet(species: string, name?: string) {
    return this.request<{ pet: Pet; message: string }>('/api/pet/adopt', {
      method: 'POST',
      body: JSON.stringify({ species, name }),
    });
  }

  equipHat(hatId: string) {
    return this.request<{ pet: Pet; message: string }>('/api/pet/hat', {
      method: 'POST',
      body: JSON.stringify({ hat_id: hatId }),
    });
  }

  setTheme(themeId: string) {
    return this.request<{ pet: Pet; message: string }>('/api/pet/theme', {
      method: 'POST',
      body: JSON.stringify({ theme_id: themeId }),
    });
  }

  // --- Pomodoro Endpoints ---
  getPomodoroSettings() {
    return this.request<PomodoroSettings>('/api/pomodoro/settings');
  }

  updatePomodoroSettings(settings: Partial<PomodoroSettings>) {
    return this.request<PomodoroSettings>('/api/pomodoro/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  startPomodoro(taskId?: number, mode: 'work' | 'short_break' | 'long_break' = 'work') {
    return this.request<{ session_id: number; started_at: string }>('/api/pomodoro/start', {
      method: 'POST',
      body: JSON.stringify({ task_id: taskId, mode }),
    });
  }

  pausePomodoro(sessionId: number) {
    return this.request<{ message: string }>('/api/pomodoro/pause', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  }

  completePomodoro(data: { session_id?: number; task_id?: number; actual_minutes: number; coins_earned: number; exp_earned: number }) {
    return this.request<{ message: string; coins_earned: number; exp_earned: number; pet_level_up?: boolean }>('/api/pomodoro/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  abortPomodoro(sessionId: number) {
    return this.request<{ message: string }>('/api/pomodoro/abort', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  }

  getPomodoroHistory(limit = 15) {
    return this.request<PomodoroSession[]>(`/api/pomodoro/history?limit=${limit}`);
  }

  // --- Task Endpoints ---
  getTasks() {
    return this.request<TaskItem[]>('/api/tasks');
  }

  createTask(data: { title: string; priority?: 'low' | 'medium' | 'high'; estimated_pomodoros?: number }) {
    return this.request<TaskItem>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateTask(id: number, data: Partial<TaskItem>) {
    return this.request<TaskItem>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteTask(id: number) {
    return this.request<{ message: string }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Shop & Inventory ---
  getShopCatalog() {
    return this.request<ShopItem[]>('/api/shop/catalog');
  }

  getShopProfile() {
    return this.request<UserProfile>('/api/shop/profile');
  }

  buyItem(itemId: string) {
    return this.request<{ message: string; coins: number; profile: UserProfile }>('/api/shop/buy', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId }),
    });
  }

  claimQuest(questId: string) {
    return this.request<{ message: string; coins_awarded: number; exp_awarded: number; quest: DailyQuest }>('/api/quests/claim', {
      method: 'POST',
      body: JSON.stringify({ quest_id: questId }),
    });
  }
}

export const api = new ApiClient();
