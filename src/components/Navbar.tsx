import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  CheckSquare,
  Compass,
  Briefcase,
  Sparkles,
  Share2,
  MapPin,
  Wifi,
  WifiOff,
  User,
  Globe,
  Plus,
  ShieldCheck,
  Eye,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    language,
    isOnline,
    currentLocation,
    selectedRole,
    activeTab,
    isReadOnlyShareMode,
    setLanguage,
    setIsOnline,
    setSelectedRole,
    setActiveTab,
    setIsAuthModalOpen,
    setIsShareModalOpen,
    setIsAIAssistantOpen,
    detectUserLocation,
  } = useApp();

  const isVi = language === 'vi';

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 border-b border-purple-100 shadow-xs">
      {/* Read-only banner if shared in view mode */}
      {isReadOnlyShareMode && (
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-inner">
          <Eye className="w-3.5 h-3.5" />
          <span>
            {isVi
              ? 'Bạn đang xem bảng kế hoạch được chia sẻ ở chế độ "Chỉ Xem". Dữ liệu không bị thay đổi.'
              : 'You are viewing a shared plan in "View Only" mode. Changes will not be saved.'}
          </span>
        </div>
      )}

      {/* Top micro bar: Quick Stats, GPS Location, Online Switcher */}
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-500 border-b border-purple-50/80 gap-2">
        {/* Location & GPS */}
        <div className="flex items-center gap-2">
          <button
            onClick={detectUserLocation}
            title={isVi ? 'Nhấp để tự động cập nhật vị trí qua GPS' : 'Click to detect location via GPS'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100/80 text-purple-700 transition cursor-pointer font-medium"
          >
            <MapPin className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
            <span>{currentLocation}</span>
          </button>

          <span className="hidden sm:inline text-slate-300">•</span>

          {/* Role Filter indicator */}
          <div className="hidden md:flex items-center gap-1">
            <span className="text-slate-400">{isVi ? 'Giao diện cho:' : 'Role:'}</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="bg-transparent font-semibold text-purple-800 border-none outline-none cursor-pointer hover:text-purple-950"
            >
              <option value="student">{isVi ? '🎓 Học sinh & Sinh viên' : '🎓 Student'}</option>
              <option value="artist">{isVi ? '🎨 Nghệ sĩ & Biểu diễn' : '🎨 Artist & Performer'}</option>
              <option value="worker">{isVi ? '💼 Người đi làm' : '💼 Professional'}</option>
              <option value="all">{isVi ? '🌟 Toàn bộ lịch trình' : '🌟 All Roles'}</option>
            </select>
          </div>
        </div>

        {/* Online / Offline status & Language */}
        <div className="flex items-center gap-2">
          {/* Online Toggle */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            title={
              isVi
                ? `Nhấp để thử nghiệm chế độ ${isOnline ? 'Ngoại tuyến' : 'Trực tuyến'}`
                : `Toggle ${isOnline ? 'Offline' : 'Online'} mode`
            }
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium transition cursor-pointer ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                : 'bg-amber-50 text-amber-700 border border-amber-200/70'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-500" />
                <span>{isVi ? 'Trực tuyến (Đồng bộ)' : 'Online (Synced)'}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-500" />
                <span>{isVi ? 'Ngoại tuyến (Lưu bộ nhớ)' : 'Offline (Local)'}</span>
              </>
            )}
          </button>

          {/* Language switcher */}
          <button
            onClick={() => setLanguage(isVi ? 'en' : 'vi')}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-100 text-slate-600 transition cursor-pointer font-medium"
          >
            <Globe className="w-3 h-3 text-purple-600" />
            <span>{isVi ? '🇻🇳 VI' : '🇬🇧 EN'}</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo with Purple to Pastel Pink Ombre */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('schedule')}
            className="cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-pink-400 flex items-center justify-center text-white shadow-md shadow-purple-300/40 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-500 bg-clip-text text-transparent">
                  SmartPlanna
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-purple-100 text-purple-700">
                  {isVi ? 'Miễn phí' : 'Free'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal hidden sm:block">
                {isVi
                  ? 'Quản lý lịch trình, chi tiêu & du lịch với AI'
                  : 'Smart schedule, finance & travel with AI'}
              </p>
            </div>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <nav className="hidden lg:flex items-center p-1 bg-purple-50/70 rounded-2xl border border-purple-100">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm shadow-purple-200'
                : 'text-slate-600 hover:text-purple-700 hover:bg-white/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{isVi ? 'Lịch Trình' : 'Schedule'}</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks_expenses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'tasks_expenses'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm shadow-purple-200'
                : 'text-slate-600 hover:text-purple-700 hover:bg-white/60'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>{isVi ? 'Công Việc & Chi Tiêu' : 'Tasks & Budget'}</span>
          </button>

          <button
            onClick={() => setActiveTab('travel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'travel'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm shadow-purple-200'
                : 'text-slate-600 hover:text-purple-700 hover:bg-white/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{isVi ? 'Du Lịch Việt Nam' : 'Travel Guide'}</span>
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'jobs'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm shadow-purple-200'
                : 'text-slate-600 hover:text-purple-700 hover:bg-white/60'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>{isVi ? 'Việc Làm Sinh Viên' : 'Student Jobs'}</span>
          </button>
        </nav>

        {/* Right CTA Actions: Share Link, AI Assistant, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Share Team Link */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            title={isVi ? 'Chia sẻ liên kết làm việc nhóm' : 'Share collaboration link'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs sm:text-sm transition cursor-pointer border border-purple-200/60"
          >
            <Share2 className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">{isVi ? 'Chia sẻ link' : 'Share'}</span>
          </button>

          {/* AI Smart Assistant Trigger */}
          <button
            onClick={() => setIsAIAssistantOpen(true)}
            className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-pink-300/40 hover:opacity-95 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 animate-spin text-pink-200" style={{ animationDuration: '6s' }} />
            <span>{isVi ? 'Trợ lý AI' : 'AI Assistant'}</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-300 ring-2 ring-white animate-ping"></span>
          </button>

          {/* User Profile / Login */}
          <div
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 transition cursor-pointer"
            title={isVi ? 'Tài khoản cá nhân' : 'Account profile'}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-300 bg-purple-100 flex items-center justify-center">
              {user.isLoggedIn ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-purple-600" />
              )}
            </div>
            <div className="hidden xl:block text-left pr-1.5">
              <p className="text-xs font-bold text-slate-800 line-clamp-1 leading-tight">
                {user.isLoggedIn ? user.name : isVi ? 'Đăng nhập' : 'Sign in'}
              </p>
              <p className="text-[10px] text-purple-600 font-medium">
                {user.isLoggedIn
                  ? selectedRole === 'student'
                    ? 'Sinh viên'
                    : selectedRole === 'artist'
                    ? 'Nghệ sĩ'
                    : 'Thành viên'
                  : isVi
                  ? 'Google / SĐT'
                  : 'Account'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav Tabs */}
      <div className="lg:hidden flex items-center justify-around px-2 py-2 border-t border-purple-100 bg-purple-50/40 text-xs">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg font-semibold ${
            activeTab === 'schedule' ? 'text-purple-700 bg-white shadow-xs' : 'text-slate-500'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{isVi ? 'Lịch trình' : 'Schedule'}</span>
        </button>
        <button
          onClick={() => setActiveTab('tasks_expenses')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg font-semibold ${
            activeTab === 'tasks_expenses' ? 'text-purple-700 bg-white shadow-xs' : 'text-slate-500'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>{isVi ? 'Nhiệm vụ & Chi' : 'Tasks'}</span>
        </button>
        <button
          onClick={() => setActiveTab('travel')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg font-semibold ${
            activeTab === 'travel' ? 'text-purple-700 bg-white shadow-xs' : 'text-slate-500'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{isVi ? 'Du lịch' : 'Travel'}</span>
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg font-semibold ${
            activeTab === 'jobs' ? 'text-purple-700 bg-white shadow-xs' : 'text-slate-500'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{isVi ? 'Việc làm' : 'Jobs'}</span>
        </button>
      </div>
    </header>
  );
};
