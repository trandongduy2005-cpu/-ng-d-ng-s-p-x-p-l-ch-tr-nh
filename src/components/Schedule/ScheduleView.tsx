import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScheduleCategory, ScheduleEvent, RoleType } from '../../types';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Sparkles,
  BookOpen,
  Coffee,
  Dumbbell,
  Mic2,
  Smile,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export const ScheduleView: React.FC = () => {
  const {
    events,
    language,
    selectedRole,
    isReadOnlyShareMode,
    addEvent,
    deleteEvent,
    toggleCompleteEvent,
    setIsAIAssistantOpen,
  } = useApp();

  const isVi = language === 'vi';

  // Filters & State
  const [activeCategory, setActiveCategory] = useState<ScheduleCategory | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'list'>('day');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Event Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'study' as ScheduleCategory,
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '10:00',
    location: '',
    targetRole: (selectedRole === 'all' ? 'student' : selectedRole) as RoleType,
    groupMembers: '',
  });

  // Filter events based on category, date (if day mode), and role
  const filteredEvents = events.filter((ev) => {
    // Category filter
    if (activeCategory !== 'all' && ev.category !== activeCategory) return false;

    // Role filter
    if (selectedRole !== 'all') {
      if (ev.targetRole && ev.targetRole !== 'all' && ev.targetRole !== selectedRole) {
        return false;
      }
    }

    // Date filter for day view
    if (viewMode === 'day') {
      return ev.date === selectedDate;
    }

    return true;
  });

  // Sort by startTime
  const sortedEvents = [...filteredEvents].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  // Category metadata & styling
  const categoryConfig: Record<
    ScheduleCategory,
    { label: string; icon: React.ReactNode; bg: string; text: string; border: string }
  > = {
    study: {
      label: isVi ? 'Lịch học tập' : 'Study & Classes',
      icon: <BookOpen className="w-4 h-4 text-purple-600" />,
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
    },
    routine: {
      label: isVi ? 'Sinh hoạt & Nghỉ ngơi' : 'Routine & Meals',
      icon: <Coffee className="w-4 h-4 text-pink-600" />,
      bg: 'bg-pink-50',
      text: 'text-pink-700',
      border: 'border-pink-200',
    },
    group_work: {
      label: isVi ? 'Làm bài & Nhóm' : 'Group Work',
      icon: <Users className="w-4 h-4 text-fuchsia-600" />,
      bg: 'bg-fuchsia-50',
      text: 'text-fuchsia-700',
      border: 'border-fuchsia-200',
    },
    health: {
      label: isVi ? 'Tập gym & Nhảy' : 'Gym & Fitness',
      icon: <Dumbbell className="w-4 h-4 text-rose-600" />,
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
    },
    artist: {
      label: isVi ? 'Show diễn & Nghệ sĩ' : 'Artist & Show',
      icon: <Mic2 className="w-4 h-4 text-violet-600" />,
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      border: 'border-violet-200',
    },
    personal: {
      label: isVi ? 'Hoạt động cá nhân' : 'Personal Life',
      icon: <Smile className="w-4 h-4 text-indigo-600" />,
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
    },
  };

  const handleToggleEvent = (id: string, currentlyCompleted?: boolean) => {
    toggleCompleteEvent(id);
    if (!currentlyCompleted) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#8B5CF6', '#EC4899', '#F472B6', '#A855F7'],
      });
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addEvent({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location.trim() || undefined,
      targetRole: formData.targetRole as RoleType,
      groupMembers: formData.groupMembers
        ? formData.groupMembers.split(',').map((m) => m.trim())
        : undefined,
      color:
        formData.category === 'study'
          ? '#8B5CF6'
          : formData.category === 'health'
          ? '#F43F5E'
          : formData.category === 'artist'
          ? '#7C3AED'
          : '#EC4899',
    });

    setFormData({
      title: '',
      description: '',
      category: 'study',
      date: selectedDate,
      startTime: '08:00',
      endTime: '10:00',
      location: '',
      targetRole: selectedRole === 'all' ? 'student' : selectedRole,
      groupMembers: '',
    });
    setIsModalOpen(false);
  };

  // Change date helper
  const changeDateByDays = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // Get week days for week view
  const getWeekDates = () => {
    const current = new Date(selectedDate);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(current.setDate(diff));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d.toISOString().split('T')[0]);
    }
    return week;
  };

  const todayCount = events.filter((e) => e.date === selectedDate).length;
  const todayDone = events.filter((e) => e.date === selectedDate && e.completed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner with Ombre Purple-Pink Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-500 p-6 sm:p-8 text-white shadow-xl shadow-purple-500/15">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 rounded-full bg-pink-300/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-pink-100">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>
                {new Date(selectedDate).toLocaleDateString(isVi ? 'vi-VN' : 'en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isVi ? 'Quản Lý & Sắp Xếp Lịch Trình Thông Minh' : 'Smart Daily & Weekly Schedule'}
            </h1>
            <p className="text-purple-100 text-sm max-w-xl">
              {selectedRole === 'student'
                ? isVi
                  ? 'Theo dõi lịch học, lịch làm bài tập nhóm, giờ sinh hoạt ăn uống và tập luyện của bạn.'
                  : 'Track your student classes, group assignments, meal routines, and gym workouts.'
                : selectedRole === 'artist'
                ? isVi
                  ? 'Quản lý lịch diễn, rehearsal vũ đạo, chụp ảnh lookbook và các hoạt động nghệ thuật.'
                  : 'Manage your live show bookings, dance rehearsals, shooting, and personal life.'
                : isVi
                ? 'Tối ưu hóa thời gian sinh hoạt, công việc và sức khỏe hằng ngày một cách cân bằng.'
                : 'Optimize your daily routine, work schedule, and life balance efficiently.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold text-sm transition border border-white/25 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-pink-200" />
              <span>{isVi ? 'Nhờ AI sắp xếp' : 'AI Auto-Plan'}</span>
            </button>

            {!isReadOnlyShareMode && (
              <button
                onClick={() => {
                  setFormData((prev) => ({ ...prev, date: selectedDate }));
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-purple-700 hover:bg-purple-50 font-bold text-sm shadow-md transition transform hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="w-4 h-4 text-purple-600" />
                <span>{isVi ? 'Thêm lịch mới' : 'Add Event'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mini progress bar for today */}
        <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-white/90">
              {isVi ? `Tiến độ ngày: ${todayDone}/${todayCount} sự kiện hoàn tất` : `Today: ${todayDone}/${todayCount} completed`}
            </span>
            <div className="w-32 sm:w-48 bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${todayCount > 0 ? (todayDone / todayCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <span className="text-pink-100 italic">
            {todayCount === 0
              ? isVi
                ? 'Chưa có lịch trình nào. Hãy nhấn Thêm lịch mới!'
                : 'No scheduled events yet. Click Add Event!'
              : todayDone === todayCount
              ? isVi
                ? '🎉 Tuyệt vời! Bạn đã hoàn thành toàn bộ lịch hôm nay.'
                : '🎉 Awesome! All events for today are completed.'
              : isVi
              ? 'Tập trung hoàn thành từng khung giờ nhé!'
              : 'Keep up the steady momentum!'}
          </span>
        </div>
      </div>

      {/* Controls Bar: Date navigation, View mode (Day/Week/List), Category Pills */}
      <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Date Picker & Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDateByDays(-1)}
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition cursor-pointer"
              title={isVi ? 'Ngày trước' : 'Previous day'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-purple-200 text-sm font-semibold text-slate-700 bg-purple-50/50 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
            />

            <button
              onClick={() => changeDateByDays(1)}
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition cursor-pointer"
              title={isVi ? 'Ngày sau' : 'Next day'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 font-medium transition cursor-pointer"
            >
              {isVi ? 'Hôm nay' : 'Today'}
            </button>
          </div>

          {/* View Modes */}
          <div className="flex items-center p-1 bg-purple-50/80 rounded-xl border border-purple-100 text-xs font-semibold">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'day' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              {isVi ? 'Theo ngày' : 'Day View'}
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'week' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              {isVi ? 'Theo tuần' : 'Week Grid'}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              {isVi ? 'Tất cả' : 'All Events'}
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
            }`}
          >
            {isVi ? '✨ Tất cả thể loại' : '✨ All Categories'}
          </button>

          {(Object.keys(categoryConfig) as ScheduleCategory[]).map((cat) => {
            const config = categoryConfig[cat];
            const isCatActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition cursor-pointer border ${
                  isCatActive
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : `${config.bg} ${config.text} ${config.border} hover:opacity-80`
                }`}
              >
                {config.icon}
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Schedule Display depending on viewMode */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>
                {isVi ? 'Dòng thời gian ngày ' : 'Timeline for '}
                {new Date(selectedDate).toLocaleDateString(isVi ? 'vi-VN' : 'en-US', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {sortedEvents.length} {isVi ? 'hoạt động' : 'activities'}
            </span>
          </div>

          {sortedEvents.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-purple-200">
              <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                {isVi ? 'Ngày này chưa có lịch trình nào' : 'No scheduled activities for this day'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                {isVi
                  ? 'Hãy thêm lịch học, giờ ăn uống, tập gym, họp nhóm hoặc nhờ Trợ lý AI tự động gợi ý lịch trong ngày.'
                  : 'Add your classes, meals, gym workout, or let AI generate a balanced daily routine.'}
              </p>
              {!isReadOnlyShareMode && (
                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, date: selectedDate }));
                    setIsModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-sm shadow-md hover:opacity-95 transition cursor-pointer"
                >
                  {isVi ? '+ Thêm Lịch Trình Ngay' : '+ Add Schedule Event'}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedEvents.map((ev) => {
                const catInfo = categoryConfig[ev.category];
                return (
                  <div
                    key={ev.id}
                    className={`relative rounded-2xl p-5 bg-white border transition-all duration-200 hover:shadow-md ${
                      ev.completed
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-purple-100 hover:border-purple-300'
                    }`}
                  >
                    {/* Top bar: Category badge + Time badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${catInfo.bg} ${catInfo.text}`}
                      >
                        {catInfo.icon}
                        <span>{catInfo.label}</span>
                      </span>

                      <div className="flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                        <span>
                          {ev.startTime} - {ev.endTime}
                        </span>
                      </div>
                    </div>

                    {/* Title & Checkbox */}
                    <div className="flex items-start gap-3 mb-2">
                      <button
                        onClick={() => handleToggleEvent(ev.id, ev.completed)}
                        disabled={isReadOnlyShareMode}
                        className="mt-0.5 text-purple-600 hover:text-purple-800 transition cursor-pointer flex-shrink-0"
                        title={ev.completed ? (isVi ? 'Đánh dấu chưa xong' : 'Mark incomplete') : (isVi ? 'Đánh dấu đã hoàn tất' : 'Mark complete')}
                      >
                        {ev.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 hover:text-purple-500" />
                        )}
                      </button>

                      <div className="flex-1">
                        <h3
                          className={`font-bold text-slate-800 text-sm sm:text-base leading-snug ${
                            ev.completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {ev.title}
                        </h3>
                        {ev.description && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                            {ev.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Meta Info: Location & Group Members */}
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                      {ev.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      )}

                      {ev.groupMembers && ev.groupMembers.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                          <span className="truncate font-medium text-purple-700">
                            {isVi ? 'Thành viên:' : 'Members:'} {ev.groupMembers.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions (Delete) */}
                    {!isReadOnlyShareMode && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => deleteEvent(ev.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer text-xs"
                          title={isVi ? 'Xóa sự kiện' : 'Delete event'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Week Grid View */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs overflow-x-auto">
          <div className="min-w-[760px] grid grid-cols-7 gap-3">
            {getWeekDates().map((dateStr) => {
              const d = new Date(dateStr);
              const dayEvents = events.filter((e) => e.date === dateStr);
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={dateStr}
                  className={`flex flex-col rounded-2xl p-3 border ${
                    isToday ? 'border-purple-400 bg-purple-50/40' : 'border-slate-100 bg-slate-50/50'
                  }`}
                >
                  <div className="text-center pb-2 border-b border-slate-200/60 mb-2">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">
                      {d.toLocaleDateString(isVi ? 'vi-VN' : 'en-US', { weekday: 'short' })}
                    </p>
                    <p className={`text-base font-extrabold ${isToday ? 'text-purple-700' : 'text-slate-800'}`}>
                      {d.getDate()}
                    </p>
                  </div>

                  <div className="space-y-2 flex-1 min-h-[140px]">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => handleToggleEvent(ev.id, ev.completed)}
                        className={`p-2 rounded-xl text-xs cursor-pointer transition ${
                          ev.completed
                            ? 'bg-emerald-100/60 text-emerald-800 line-through opacity-75'
                            : 'bg-white text-slate-800 shadow-2xs border border-purple-100 hover:border-purple-300'
                        }`}
                      >
                        <span className="font-bold block text-[10px] text-purple-600">
                          {ev.startTime}
                        </span>
                        <span className="font-medium line-clamp-2">{ev.title}</span>
                      </div>
                    ))}
                  </div>

                  {!isReadOnlyShareMode && (
                    <button
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, date: dateStr }));
                        setIsModalOpen(true);
                      }}
                      className="mt-2 w-full py-1 text-[11px] font-semibold text-purple-600 bg-purple-100/60 hover:bg-purple-100 rounded-lg text-center transition cursor-pointer"
                    >
                      + {isVi ? 'Thêm' : 'Add'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-purple-100 text-slate-400 font-semibold text-[11px] uppercase">
                  <th className="py-2.5 px-3">{isVi ? 'Trạng thái' : 'Status'}</th>
                  <th className="py-2.5 px-3">{isVi ? 'Thời gian & Ngày' : 'Date & Time'}</th>
                  <th className="py-2.5 px-3">{isVi ? 'Tên hoạt động' : 'Activity'}</th>
                  <th className="py-2.5 px-3">{isVi ? 'Thể loại' : 'Category'}</th>
                  <th className="py-2.5 px-3">{isVi ? 'Địa điểm' : 'Location'}</th>
                  {!isReadOnlyShareMode && <th className="py-2.5 px-3 text-right">{isVi ? 'Thao tác' : 'Action'}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => {
                  const cat = categoryConfig[ev.category];
                  return (
                    <tr key={ev.id} className="hover:bg-purple-50/40 transition">
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleEvent(ev.id, ev.completed)}
                          className="cursor-pointer"
                        >
                          {ev.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 hover:text-purple-500" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3 font-semibold text-purple-800 whitespace-nowrap">
                        <div>{ev.date}</div>
                        <div className="text-xs text-slate-400 font-normal">
                          {ev.startTime} - {ev.endTime}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        <span className={ev.completed ? 'line-through text-slate-400' : ''}>
                          {ev.title}
                        </span>
                        {ev.description && (
                          <p className="text-xs text-slate-400 font-normal line-clamp-1">
                            {ev.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cat.bg} ${cat.text}`}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-xs">
                        {ev.location || '—'}
                      </td>
                      {!isReadOnlyShareMode && (
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => deleteEvent(ev.id)}
                            className="text-slate-400 hover:text-rose-600 transition cursor-pointer p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-purple-100">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-purple-600" />
                <span>{isVi ? 'Thêm Lịch Trình Mới' : 'Add New Schedule Event'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isVi ? 'Tên hoạt động / Môn học / Lịch biểu *' : 'Event / Subject Title *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    isVi
                      ? 'VD: Học Lập trình C++, Tập gym ngực, Họp nhóm làm slide, Show acoustic...'
                      : 'e.g. Physics class, Gym leg workout, Group presentation...'
                  }
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-purple-50/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Phân loại hoạt động' : 'Category'}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ScheduleCategory })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-purple-50/30 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                  >
                    <option value="study">{isVi ? '📚 Lịch học tập' : '📚 Study'}</option>
                    <option value="routine">{isVi ? '🍽️ Sinh hoạt & Ăn uống' : '🍽️ Routine & Meal'}</option>
                    <option value="group_work">{isVi ? '👥 Làm việc nhóm' : '👥 Group Work'}</option>
                    <option value="health">{isVi ? '💪 Tập gym & Nhảy' : '💪 Gym & Dance'}</option>
                    <option value="artist">{isVi ? '🎤 Show diễn nghệ sĩ' : '🎤 Artist & Show'}</option>
                    <option value="personal">{isVi ? '🌟 Cá nhân' : '🌟 Personal'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Dành cho đối tượng' : 'Target Role'}
                  </label>
                  <select
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value as RoleType })}
                    className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-purple-50/30 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                  >
                    <option value="student">{isVi ? 'Học sinh & Sinh viên' : 'Student'}</option>
                    <option value="artist">{isVi ? 'Nghệ sĩ' : 'Artist'}</option>
                    <option value="worker">{isVi ? 'Người đi làm' : 'Professional'}</option>
                    <option value="all">{isVi ? 'Tất cả' : 'All'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Ngày' : 'Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl border border-purple-200 bg-purple-50/30 font-medium text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Bắt đầu' : 'Start'}
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl border border-purple-200 bg-purple-50/30 font-medium text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Kết thúc' : 'End'}
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl border border-purple-200 bg-purple-50/30 font-medium text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isVi ? 'Địa điểm / Phòng học / Link online' : 'Location / Room / Online Link'}
                </label>
                <input
                  type="text"
                  placeholder={isVi ? 'VD: Giảng đường B204, Phòng gym FitZone, Google Meet...' : 'e.g. Room 302, Gym studio...'}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50/30"
                />
              </div>

              {formData.category === 'group_work' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Thành viên nhóm (cách nhau bởi dấu phẩy)' : 'Group Members (comma separated)'}
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Minh Anh, Khánh Toàn, Lan Phương"
                    value={formData.groupMembers}
                    onChange={(e) => setFormData({ ...formData, groupMembers: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50/30"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isVi ? 'Ghi chú thêm' : 'Notes / Description'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isVi ? 'Nội dung bài tập, chuẩn bị trang phục, đồ dùng mang theo...' : 'Extra reminders or details...'}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50/30"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  {isVi ? 'Hủy bỏ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold shadow-md hover:opacity-95 cursor-pointer"
                >
                  {isVi ? 'Lưu Lịch Trình' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
