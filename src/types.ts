export type RoleType = 'student' | 'artist' | 'worker' | 'all';

export type ScheduleCategory = 
  | 'study'      // Lịch học tập
  | 'routine'    // Sinh hoạt (ăn uống, nghỉ ngơi)
  | 'group_work' // Làm bài, làm việc nhóm
  | 'health'     // Tập gym, nhảy, thể thao
  | 'artist'     // Đi diễn, rehearsal, shooting nghệ sĩ
  | 'personal';  // Cá nhân khác

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  category: ScheduleCategory;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  location?: string;
  color?: string;
  completed?: boolean;
  targetRole?: RoleType;
  groupMembers?: string[];
  reminderMinutes?: number;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'study' | 'work' | 'personal' | 'group' | 'finance';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

export type ExpenseType = 'income' | 'expense';
export type ExpenseCategory = 
  | 'food'        // Ăn uống
  | 'study'       // Học tập, sách vở
  | 'housing'     // Tiền trọ, điện nước
  | 'transport'   // Đi lại, xăng xe
  | 'shopping'    // Mua sắm
  | 'health'      // Gym, thể thao, y tế
  | 'entertainment' // Giải trí, cà phê
  | 'salary'      // Lương, thu nhập
  | 'other';

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number; // in VND
  type: ExpenseType;
  category: ExpenseCategory;
  date: string;
  note?: string;
}

export interface PlaceReview {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1 - 5
  comment: string;
  date: string;
}

export type PlaceCategory = 'homestay' | 'hotel' | 'restaurant' | 'attraction' | 'cafe';

export interface PlaceItem {
  id: string;
  provinceId: string;
  name: string;
  category: PlaceCategory;
  address: string;
  priceRange: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  description: string;
  amenities: string[];
  signatureDish?: string; // Món ăn đặc trưng nếu là nhà hàng/quán ăn
  reviews: PlaceReview[];
  phone?: string;
  openingHours?: string;
  coordinates?: { lat: number; lng: number };
}

export interface Province {
  id: string;
  name: string;
  region: 'Bắc' | 'Trung' | 'Nam' | 'Tây Nguyên' | 'Tây Nam Bộ';
  imageUrl: string;
  description: string;
  famousDishes: string[];
  bestSeasons: string;
  placesCount?: number;
  lat: number;
  lng: number;
}

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  provinceId: string;
  salary: string; // e.g. "25.000 - 35.000đ/giờ"
  salaryHourlyValue: number; // For calculations
  workType: 'part-time' | 'shift' | 'remote' | 'weekend';
  shiftTimes: { start: string; end: string; days: string[] };
  category?: string;
  shiftType?: string;
  workingHours?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  isVerified: boolean;
  contactEmail: string;
  contactPhone: string;
  scheduleMatchPercent?: number; // Calculated based on user free time
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  role: RoleType;
  loginMethod: 'google' | 'facebook' | 'phone' | 'guest';
  isLoggedIn: boolean;
}

export interface ShareConfig {
  id: string;
  title: string;
  permission: 'view' | 'edit';
  createdDate: string;
  collaborators: { name: string; email: string; avatar?: string; role: string }[];
}

export interface LifeBalanceStats {
  studyWorkHours: number;
  restSleepHours: number;
  healthSportHours: number;
  personalSocialHours: number;
  balanceScore: number; // 0 - 100
  aiAdvice: string;
}
