import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ScheduleEvent,
  TaskItem,
  ExpenseItem,
  UserProfile,
  RoleType,
  ShareConfig,
  PlaceItem,
  LifeBalanceStats,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_EVENTS,
  INITIAL_TASKS,
  INITIAL_EXPENSES,
} from '../data/initialData';

export interface BookingRecord {
  id: string;
  type: 'homestay' | 'table' | 'transport';
  placeName: string;
  placeAddress: string;
  date: string;
  details: string;
  guestCount: number;
  contactName: string;
  contactPhone: string;
  status: 'confirmed' | 'pending';
  totalPrice?: string;
  createdAt: string;
}

interface AppContextType {
  // State
  user: UserProfile;
  language: 'vi' | 'en';
  isOnline: boolean;
  currentLocation: string;
  selectedRole: RoleType;
  events: ScheduleEvent[];
  tasks: TaskItem[];
  expenses: ExpenseItem[];
  monthlyBudget: number;
  savedPlaces: string[];
  appliedJobs: string[];
  bookings: BookingRecord[];
  activeTab: 'schedule' | 'tasks_expenses' | 'travel' | 'jobs';
  shareConfig: ShareConfig;
  isReadOnlyShareMode: boolean;

  // Modals
  isAuthModalOpen: boolean;
  isShareModalOpen: boolean;
  isAIAssistantOpen: boolean;
  isBookingModalOpen: boolean;
  bookingTarget: { place?: PlaceItem; type: 'homestay' | 'table' | 'transport' } | null;

  // Setters & Actions
  setLanguage: (lang: 'vi' | 'en') => void;
  setIsOnline: (online: boolean) => void;
  setCurrentLocation: (loc: string) => void;
  setSelectedRole: (role: RoleType) => void;
  setActiveTab: (tab: 'schedule' | 'tasks_expenses' | 'travel' | 'jobs') => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsShareModalOpen: (open: boolean) => void;
  setIsAIAssistantOpen: (open: boolean) => void;
  setIsBookingModalOpen: (open: boolean) => void;
  openBookingModal: (place: PlaceItem, type: 'homestay' | 'table' | 'transport') => void;

  // Business logic
  login: (method: 'google' | 'facebook' | 'phone', userData?: Partial<UserProfile>) => void;
  logout: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  addEvent: (event: Omit<ScheduleEvent, 'id'>) => void;
  updateEvent: (id: string, event: Partial<ScheduleEvent>) => void;
  deleteEvent: (id: string) => void;
  toggleCompleteEvent: (id: string) => void;

  addTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  deleteExpense: (id: string) => void;
  setMonthlyBudget: (budget: number) => void;

  toggleSavePlace: (placeId: string) => void;
  applyJob: (jobId: string) => void;
  addBooking: (booking: Omit<BookingRecord, 'id' | 'createdAt' | 'status'>) => void;

  updateShareConfig: (permission: 'view' | 'edit') => string;
  detectUserLocation: () => Promise<void>;
  calculateLifeBalance: () => LifeBalanceStats;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'smartplanna_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language & Online status
  const [language, setLanguageState] = useState<'vi' | 'en'>(() => {
    return (localStorage.getItem(`${LOCAL_STORAGE_PREFIX}lang`) as 'vi' | 'en') || 'vi';
  });

  const [isOnline, setIsOnlineState] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [currentLocation, setCurrentLocation] = useState<string>(() => {
    return localStorage.getItem(`${LOCAL_STORAGE_PREFIX}location`) || 'TP. Hồ Chí Minh, Việt Nam';
  });

  // 2. User & Roles
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}user`);
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [selectedRole, setSelectedRole] = useState<RoleType>(() => {
    return (localStorage.getItem(`${LOCAL_STORAGE_PREFIX}role`) as RoleType) || 'student';
  });

  // 3. Navigation
  const [activeTab, setActiveTab] = useState<'schedule' | 'tasks_expenses' | 'travel' | 'jobs'>('schedule');

  // 4. Data lists
  const [events, setEvents] = useState<ScheduleEvent[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}events`);
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}tasks`);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}expenses`);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}budget`);
    return saved ? Number(saved) : 6000000; // 6 triệu VND default
  });

  const [savedPlaces, setSavedPlaces] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}savedPlaces`);
    return saved ? JSON.parse(saved) : ['place-ld-1', 'place-dn-2'];
  });

  const [appliedJobs, setAppliedJobs] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}appliedJobs`);
    return saved ? JSON.parse(saved) : ['job-1'];
  });

  const [bookings, setBookings] = useState<BookingRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}bookings`);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'book-1',
            type: 'homestay',
            placeName: 'Mây Lang Thang Homestay & Cafe',
            placeAddress: 'Hẻm 7B Hoàng Hoa Thám, Phường 10, TP. Đà Lạt',
            date: '2026-10-15',
            details: 'Phòng Deluxe Thung Lũng Săn Mây, 2 đêm',
            guestCount: 2,
            contactName: 'Đông Duy Trần',
            contactPhone: '0987654321',
            status: 'confirmed',
            totalPrice: '1.300.000đ',
            createdAt: '2026-09-18T10:00:00.000Z',
          },
        ];
  });

  // 5. Sharing & Permissions
  const [shareConfig, setShareConfig] = useState<ShareConfig>(() => {
    return {
      id: 'planna-team-share-2026',
      title: 'Lịch Học Tập & Làm Việc Nhóm SmartPlanna',
      permission: 'edit',
      createdDate: new Date().toISOString(),
      collaborators: [
        { name: 'Đông Duy Trần (Trưởng nhóm)', email: 'trandongduy2005@gmail.com', role: 'Owner' },
        { name: 'Minh Anh (Sinh viên)', email: 'minhanh.cs@gmail.com', role: 'Editor' },
        { name: 'Khánh Toàn (Nghệ sĩ / Guitarist)', email: 'toan.acoustic@gmail.com', role: 'Editor' },
      ],
    };
  });

  const [isReadOnlyShareMode, setIsReadOnlyShareMode] = useState<boolean>(false);

  // Check URL params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const shareMode = urlParams.get('mode');
      if (shareMode === 'view') {
        setIsReadOnlyShareMode(true);
      }
    }
  }, []);

  // 6. Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingTarget, setBookingTarget] = useState<{
    place?: PlaceItem;
    type: 'homestay' | 'table' | 'transport';
  } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}lang`, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}location`, currentLocation);
  }, [currentLocation]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}user`, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}role`, selectedRole);
  }, [selectedRole]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}events`, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}budget`, monthlyBudget.toString());
  }, [monthlyBudget]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}savedPlaces`, JSON.stringify(savedPlaces));
  }, [savedPlaces]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}appliedJobs`, JSON.stringify(appliedJobs));
  }, [appliedJobs]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}bookings`, JSON.stringify(bookings));
  }, [bookings]);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOnlineState(true);
    const handleOffline = () => setIsOnlineState(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setLanguage = (lang: 'vi' | 'en') => {
    setLanguageState(lang);
  };

  const setIsOnline = (online: boolean) => {
    setIsOnlineState(online);
  };

  const setMonthlyBudget = (budget: number) => {
    setMonthlyBudgetState(budget);
  };

  // Auth methods
  const login = (method: 'google' | 'facebook' | 'phone', userData?: Partial<UserProfile>) => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: userData?.name || (method === 'google' ? 'Đông Duy Trần (Google)' : method === 'facebook' ? 'Đông Duy (Facebook)' : 'Người Dùng SmartPlanna'),
      email: userData?.email || (method === 'phone' ? '0987654321@smartplanna.vn' : 'trandongduy2005@gmail.com'),
      phone: userData?.phone || '0987654321',
      avatar:
        userData?.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      role: selectedRole,
      loginMethod: method,
      isLoggedIn: true,
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser({
      id: 'guest',
      name: 'Khách',
      email: 'guest@smartplanna.vn',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: 'all',
      loginMethod: 'guest',
      isLoggedIn: false,
    });
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...profile }));
  };

  // Schedule Event methods
  const addEvent = (eventData: Omit<ScheduleEvent, 'id'>) => {
    if (isReadOnlyShareMode) {
      alert('Bạn đang ở chế độ xem link (Chỉ xem). Không thể thêm sự kiện!');
      return;
    }
    const newEvent: ScheduleEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  const updateEvent = (id: string, updated: Partial<ScheduleEvent>) => {
    if (isReadOnlyShareMode) return;
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
  };

  const deleteEvent = (id: string) => {
    if (isReadOnlyShareMode) return;
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleCompleteEvent = (id: string) => {
    if (isReadOnlyShareMode) return;
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
  };

  // Task methods
  const addTask = (taskData: Omit<TaskItem, 'id' | 'createdAt'>) => {
    if (isReadOnlyShareMode) return;
    const newTask: TaskItem = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updated: Partial<TaskItem>) => {
    if (isReadOnlyShareMode) return;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTask = (id: string) => {
    if (isReadOnlyShareMode) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTask = (id: string) => {
    if (isReadOnlyShareMode) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Expense methods
  const addExpense = (expenseData: Omit<ExpenseItem, 'id'>) => {
    if (isReadOnlyShareMode) return;
    const newExpense: ExpenseItem = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    if (isReadOnlyShareMode) return;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleSavePlace = (placeId: string) => {
    setSavedPlaces((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    );
  };

  const applyJob = (jobId: string) => {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs((prev) => [...prev, jobId]);
    }
  };

  const addBooking = (bookingData: Omit<BookingRecord, 'id' | 'createdAt' | 'status'>) => {
    const newBooking: BookingRecord = {
      ...bookingData,
      id: `book-${Date.now()}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [newBooking, ...prev]);
  };

  const openBookingModal = (
    place: PlaceItem,
    type: 'homestay' | 'table' | 'transport'
  ) => {
    setBookingTarget({ place, type });
    setIsBookingModalOpen(true);
  };

  const updateShareConfig = (permission: 'view' | 'edit'): string => {
    setShareConfig((prev) => ({ ...prev, permission }));
    const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
    const shareUrl = `${baseUrl}?share_id=${shareConfig.id}&mode=${permission}`;
    return shareUrl;
  };

  const detectUserLocation = async () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          // Approximate Vietnamese cities based on latitude
          let detected = 'TP. Hồ Chí Minh, Việt Nam';
          if (lat > 20.0) {
            detected = 'Hà Nội, Việt Nam';
          } else if (lat > 15.5 && lat <= 20.0) {
            detected = 'Đà Nẵng, Việt Nam';
          } else if (lat > 11.5 && lat <= 12.5 && lng < 108.8) {
            detected = 'Đà Lạt (Lâm Đồng), Việt Nam';
          } else if (lat > 9.5 && lat <= 10.5 && lng < 104.5) {
            detected = 'Phú Quốc (Kiên Giang), Việt Nam';
          }
          setCurrentLocation(detected);
        },
        (error) => {
          console.warn('Geolocation access denied or unavailable:', error.message);
        },
        { timeout: 8000 }
      );
    }
  };

  // Calculate life balance score based on schedule distribution
  const calculateLifeBalance = (): LifeBalanceStats => {
    let studyWorkMinutes = 0;
    let routineMinutes = 0;
    let healthMinutes = 0;
    let personalMinutes = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayEvents = events.filter((e) => e.date === todayStr);

    todayEvents.forEach((ev) => {
      const [startH, startM] = ev.startTime.split(':').map(Number);
      const [endH, endM] = ev.endTime.split(':').map(Number);
      const duration = Math.max(30, (endH * 60 + endM) - (startH * 60 + startM));

      if (ev.category === 'study' || ev.category === 'group_work' || ev.category === 'artist') {
        studyWorkMinutes += duration;
      } else if (ev.category === 'routine') {
        routineMinutes += duration;
      } else if (ev.category === 'health') {
        healthMinutes += duration;
      } else {
        personalMinutes += duration;
      }
    });

    const studyWorkHours = Number((studyWorkMinutes / 60).toFixed(1));
    const restSleepHours = Number((routineMinutes / 60 + 7).toFixed(1)); // Baseline sleep added
    const healthSportHours = Number((healthMinutes / 60).toFixed(1));
    const personalSocialHours = Number((personalMinutes / 60 + 2).toFixed(1));

    // Ideal: Study/Work ~ 6-8h, Sleep/Rest ~ 7-8h, Sport ~ 1-1.5h, Personal ~ 2-3h
    let score = 85;
    if (healthSportHours < 0.5) score -= 15;
    if (studyWorkHours > 10) score -= 20; // Burnout warning
    if (restSleepHours < 6) score -= 15;

    let aiAdvice = 'Lịch trình hôm nay của bạn rất cân bằng! Hãy giữ vững năng lượng này.';
    if (healthSportHours === 0) {
      aiAdvice = 'Gợi ý AI: Bạn chưa có hoạt động vận động hôm nay. Hãy thêm 30 phút tập gym, chạy bộ hoặc nhảy để giải phóng endorphin!';
    } else if (studyWorkHours > 8) {
      aiAdvice = 'Cảnh báo AI: Giờ học tập và làm việc khá cao. Hãy nhớ áp dụng kỹ thuật Pomodoro (nghỉ 5 phút sau mỗi 25 phút) để tránh kiệt sức.';
    }

    return {
      studyWorkHours,
      restSleepHours,
      healthSportHours,
      personalSocialHours,
      balanceScore: Math.min(100, Math.max(40, score)),
      aiAdvice,
    };
  };

  return (
    <AppContext.Provider
      value={{
        user,
        language,
        isOnline,
        currentLocation,
        selectedRole,
        events,
        tasks,
        expenses,
        monthlyBudget,
        savedPlaces,
        appliedJobs,
        bookings,
        activeTab,
        shareConfig,
        isReadOnlyShareMode,

        isAuthModalOpen,
        isShareModalOpen,
        isAIAssistantOpen,
        isBookingModalOpen,
        bookingTarget,

        setLanguage,
        setIsOnline,
        setCurrentLocation,
        setSelectedRole,
        setActiveTab,
        setIsAuthModalOpen,
        setIsShareModalOpen,
        setIsAIAssistantOpen,
        setIsBookingModalOpen,
        openBookingModal,

        login,
        logout,
        updateUserProfile,

        addEvent,
        updateEvent,
        deleteEvent,
        toggleCompleteEvent,

        addTask,
        updateTask,
        deleteTask,
        toggleTask,

        addExpense,
        deleteExpense,
        setMonthlyBudget,

        toggleSavePlace,
        applyJob,
        addBooking,

        updateShareConfig,
        detectUserLocation,
        calculateLifeBalance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
