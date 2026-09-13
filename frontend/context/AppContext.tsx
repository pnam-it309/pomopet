'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  api,
  User,
  Pet,
  PomodoroSettings,
  PomodoroSession,
  TaskItem,
  ShopItem,
  UserProfile,
} from '@/lib/api';
import { sound } from '@/lib/sound';
import confetti from 'canvas-confetti';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pet: Pet | null;
  timerSettings: PomodoroSettings;
  tasks: TaskItem[];
  profile: UserProfile | null;
  history: PomodoroSession[];
  shopCatalog: ShopItem[];
  activeTask: TaskItem | null;
  setActiveTask: (task: TaskItem | null) => void;
  mobileInfo: { local_ip: string; port: number; mobile_url: string } | null;
  ambientPlaying: boolean;
  soundEnabled: boolean;
  notification: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName: string, species?: string) => Promise<void>;
  logout: () => void;
  syncAll: () => Promise<void>;
  feedPet: (itemId?: string) => Promise<void>;
  patPet: () => Promise<void>;
  adoptPet: (species: string, name?: string) => Promise<void>;
  equipHat: (hatId: string) => Promise<void>;
  setTheme: (themeId: string) => Promise<void>;
  addTask: (title: string, priority?: 'low' | 'medium' | 'high', estimated?: number) => Promise<void>;
  toggleTask: (task: TaskItem) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  buyItem: (itemId: string) => Promise<void>;
  claimQuest: (questId: string) => Promise<void>;
  completePomodoro: (actualMinutes: number, coins: number, exp: number) => Promise<void>;
  toggleAmbient: () => void;
  toggleSound: () => void;
  showNotification: (msg: string) => void;
}

const defaultTimerSettings: PomodoroSettings = {
  work_duration: 25,
  short_break: 5,
  long_break: 15,
  long_break_interval: 4,
  auto_start_breaks: false,
  auto_start_pomodoros: false,
  sound_theme: 'bell',
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pet, setPet] = useState<Pet | null>(null);
  const [timerSettings, setTimerSettings] = useState<PomodoroSettings>(defaultTimerSettings);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<PomodoroSession[]>([]);
  const [shopCatalog, setShopCatalog] = useState<ShopItem[]>([]);
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [mobileInfo, setMobileInfo] = useState<{ local_ip: string; port: number; mobile_url: string } | null>(null);
  const [ambientPlaying, setAmbientPlaying] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4000);
  }, []);

  const syncAll = useCallback(async () => {
    try {
      if (!api.isAuthenticated()) {
        // Fetch mobile info and shop catalog anonymously
        try {
          const [cat, mob] = await Promise.all([
            api.getShopCatalog(),
            api.getMobileInfo(),
          ]);
          setShopCatalog(cat);
          setMobileInfo(mob);
        } catch {}
        setIsLoading(false);
        return;
      }

      const state = await api.getFullState();
      setUser(state.user);
      setPet(state.pet);
      if (state.timer) setTimerSettings(state.timer);
      setTasks(state.tasks || []);
      setProfile(state.profile);
      setHistory(state.history || []);
      setShopCatalog(state.shop_catalog || []);
      setIsAuthenticated(true);

      try {
        const mob = await api.getMobileInfo();
        setMobileInfo(mob);
      } catch {}
    } catch (e: any) {
      if (e.message?.includes('hết hạn')) {
        api.logout();
        setIsAuthenticated(false);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedUser = api.getUser();
    if (savedUser && api.isAuthenticated()) {
      setUser(savedUser);
      setIsAuthenticated(true);
    }
    syncAll();
  }, [syncAll]);

  const login = async (username: string, password: string) => {
    const res = await api.login({ username, password });
    api.setAuth(res.user, res.token);
    setUser(res.user);
    setIsAuthenticated(true);
    sound.playSuccess();
    showNotification(`Chào mừng ${res.user.display_name || res.user.username}!`);
    await syncAll();
  };

  const register = async (username: string, password: string, displayName: string, species?: string) => {
    const res = await api.register({
      username,
      password,
      display_name: displayName,
      initial_species: species || 'cat',
    });
    api.setAuth(res.user, res.token);
    setUser(res.user);
    setIsAuthenticated(true);
    sound.playSuccess();
    showNotification(`Đăng ký thành công! Bạn đã nhận một bé ${species || 'cat'} đáng yêu!`);
    await syncAll();
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setIsAuthenticated(false);
    setPet(null);
    setTasks([]);
    setProfile(null);
    showNotification('Đã đăng xuất tài khoản.');
  };

  const feedPet = async (itemId?: string) => {
    try {
      sound.triggerHaptic();
      sound.playClick();
      const res = await api.feedPet(itemId);
      setPet(res.pet);
      showNotification(res.message || 'Bé cưng đã no nê và vui vẻ hơn! 🍎');
      await syncAll();
    } catch (err: any) {
      showNotification(err.message);
    }
  };

  const patPet = async () => {
    try {
      sound.triggerHaptic();
      sound.playBeep(659.25, 0.12, 'sine');
      const res = await api.patPet();
      setPet(res.pet);
      showNotification(res.message || 'Bé cưng cảm thấy được yêu thương! ❤️');
      await syncAll();
    } catch (err: any) {
      showNotification(err.message);
    }
  };

  const adoptPet = async (species: string, name?: string) => {
    try {
      sound.triggerHaptic();
      sound.playSuccess();
      const res = await api.adoptPet(species, name);
      setPet(res.pet);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      showNotification(res.message || `Đã nhận nuôi thú cưng mới: ${species}!`);
      await syncAll();
    } catch (err: any) {
      showNotification(err.message);
    }
  };

  const equipHat = async (hatId: string) => {
    try {
      sound.playClick();
      const res = await api.equipHat(hatId);
      setPet(res.pet);
      showNotification(res.message || 'Đã thay đổi mũ cho thú cưng!');
      await syncAll();
    } catch (err: any) {
      showNotification(err.message);
    }
  };

  const setTheme = async (themeId: string) => {
    try {
      sound.playClick();
      const res = await api.setTheme(themeId);
      setPet(res.pet);
      showNotification(res.message || 'Đã đổi chủ đề phòng học!');
      await syncAll();
    } catch (err: any) {
      showNotification(err.message);
    }
  };

  const addTask = async (title: string, priority: 'low' | 'medium' | 'high' = 'medium', estimated = 1) => {
    try {
      sound.playClick();
      await api.createTask({ title, priority, estimated_pomodoros: estimated });
      showNotification('Đã thêm nhiệm vụ mới!');
      await syncAll();
    } catch (err: any) {
      showNotification(err.message);
    }
  };

  const toggleTask = async (task: TaskItem) => {
    try {
      sound.triggerHaptic();
      sound.playClick();
      const updated = await api.updateTask(task.id, {
        is_completed: !task.is_completed,
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      if (!task.is_completed) {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        showNotification(`Hoàn thành: "${task.title}"! 🎉`);
      }
      await syncAll();
    } catch (err: any) {
      showNotification(err.message);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      sound.playClick();
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (activeTask?.id === id) setActiveTask(null);
      showNotification('Đã xóa nhiệm vụ.');
      await syncAll();
    } catch (err: any) {
      showNotification(err.message);
    }
  };

  const buyItem = async (itemId: string) => {
    try {
      sound.playClick();
      const res = await api.buyItem(itemId);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      showNotification(res.message || 'Mua sắm thành công!');
      await syncAll();
    } catch (err: any) {
      showNotification(err.message);
    }
  };

  const claimQuest = async (questId: string) => {
    try {
      sound.playSuccess();
      const res = await api.claimQuest(questId);
      confetti({ particleCount: 90, spread: 90, origin: { y: 0.5 } });
      showNotification(`Nhận thưởng: +${res.coins_awarded} Xu, +${res.exp_awarded} EXP!`);
      await syncAll();
    } catch (err: any) {
      showNotification(err.message);
    }
  };

  const completePomodoro = async (actualMinutes: number, coins: number, exp: number) => {
    try {
      sound.playTimerAlarm();
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
      const res = await api.completePomodoro({
        task_id: activeTask?.id,
        actual_minutes: actualMinutes,
        coins_earned: coins,
        exp_earned: exp,
      });
      if (res.pet_level_up) {
        setTimeout(() => {
          sound.playSuccess();
          confetti({ particleCount: 150, spread: 120 });
        }, 1000);
      }
      showNotification(`Tuyệt vời! Bạn nhận được +${coins} Xu & +${exp} EXP! 🍅`);
      await syncAll();
    } catch (err: any) {
      showNotification(err.message);
    }
  };

  const toggleAmbient = () => {
    const isPlaying = sound.toggleAmbient();
    setAmbientPlaying(isPlaying);
    showNotification(isPlaying ? 'Đã bật tiếng mưa êm dịu 🌧️' : 'Đã tắt âm thanh nền 🔇');
  };

  const toggleSound = () => {
    sound.soundEnabled = !sound.soundEnabled;
    setSoundEnabled(sound.soundEnabled);
    showNotification(sound.soundEnabled ? 'Đã bật âm thanh hiệu ứng 🔊' : 'Đã tắt âm thanh hiệu ứng 🔇');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        pet,
        timerSettings,
        tasks,
        profile,
        history,
        shopCatalog,
        activeTask,
        setActiveTask,
        mobileInfo,
        ambientPlaying,
        soundEnabled,
        notification,
        login,
        register,
        logout,
        syncAll,
        feedPet,
        patPet,
        adoptPet,
        equipHat,
        setTheme,
        addTask,
        toggleTask,
        deleteTask,
        buyItem,
        claimQuest,
        completePomodoro,
        toggleAmbient,
        toggleSound,
        showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
