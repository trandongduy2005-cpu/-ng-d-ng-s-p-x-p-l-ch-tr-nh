import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { STUDENT_JOBS } from '../../data/jobOpportunities';
import { JobOpportunity } from '../../types';
import {
  Briefcase,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  Building,
  GraduationCap,
  Sparkles,
  Calendar,
  Send,
  Filter,
  Check,
  Search,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const JobsView: React.FC = () => {
  const {
    language,
    user,
    appliedJobs,
    applyJob,
    addEvent,
    setIsAIAssistantOpen,
    events,
  } = useApp();

  const isVi = language === 'vi';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobOpportunity | null>(null);

  // Application Form
  const [applyForm, setApplyForm] = useState({
    fullName: user.isLoggedIn ? user.name : '',
    phone: user.phone || '',
    email: user.email || '',
    university: '',
    major: '',
    availableDays: '',
    intro: '',
  });

  const [applySuccessToast, setApplySuccessToast] = useState<string | null>(null);

  // Filter jobs
  const filteredJobs = STUDENT_JOBS.filter((job: JobOpportunity) => {
    if (selectedCategory !== 'all' && job.category && job.category !== selectedCategory) return false;
    if (selectedShift !== 'all' && job.shiftType && job.shiftType !== selectedShift) return false;
    if (
      searchQuery &&
      !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !job.company.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !job.location.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobForModal) return;

    applyJob(selectedJobForModal.id);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#8B5CF6', '#EC4899', '#10B981'],
    });

    setApplySuccessToast(
      isVi
        ? `Ứng tuyển thành công vị trí "${selectedJobForModal.title}"! Nhà tuyển dụng sẽ liên hệ qua số điện thoại của bạn.`
        : `Successfully applied for "${selectedJobForModal.title}"! Employer will contact you shortly.`
    );
    setTimeout(() => setApplySuccessToast(null), 5000);

    setSelectedJobForModal(null);
  };

  // Add work schedule to SmartPlanner
  const handleAddWorkShiftToSchedule = (job: JobOpportunity) => {
    const today = new Date().toISOString().split('T')[0];
    const workingHoursText = job.workingHours || `${job.shiftTimes.start} - ${job.shiftTimes.end}`;
    addEvent({
      title: `Ca làm thêm: ${job.title} (${job.company})`,
      description: `Địa chỉ: ${job.location}. Mức lương: ${job.salary}. Ca làm: ${workingHoursText}`,
      category: 'routine',
      date: today,
      startTime: job.shiftTimes.start || '18:00',
      endTime: job.shiftTimes.end || '22:30',
      location: job.location,
      targetRole: 'student',
      color: '#8B5CF6',
    });

    setApplySuccessToast(
      isVi
        ? `Đã thêm ca làm việc "${job.title}" vào lịch trình hôm nay!`
        : `Added work shift "${job.title}" to your schedule!`
    );
    setTimeout(() => setApplySuccessToast(null), 4000);
  };

  const shiftLabels: Record<string, string> = {
    flexible: isVi ? 'Linh hoạt tự xếp ca' : 'Flexible Shifts',
    evening: isVi ? 'Buổi tối (18h - 22h)' : 'Evening Shifts',
    weekend: isVi ? 'Cuối tuần (T7, CN)' : 'Weekend Shifts',
    morning: isVi ? 'Buổi sáng' : 'Morning Shifts',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {applySuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{applySuccessToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-500 p-6 sm:p-8 text-white shadow-xl shadow-purple-500/15">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-pink-100">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{isVi ? 'Việc Làm Thêm Sinh Viên & Bán Thời Gian' : 'Student Part-time Opportunities'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isVi ? 'Gợi Ý Việc Làm Phù Hợp Lịch Học & Thời Gian Rảnh' : 'Curated Jobs Compatible With Your Class Schedule'}
            </h1>
            <p className="text-purple-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {isVi
                ? 'Tìm việc làm thêm uy tín (Barista, gia sư, trợ lý, content, bán hàng) không lo trùng lịch học. Hỗ trợ nộp hồ sơ nhanh trực tiếp và đồng bộ ca làm vào lịch trình SmartPlanner.'
                : 'Find verified part-time student jobs with flexible scheduling that fits around your classes. Apply directly and sync your work shifts to your calendar.'}
            </p>
          </div>

          <button
            onClick={() => setIsAIAssistantOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs sm:text-sm transition cursor-pointer border border-white/30"
          >
            <Sparkles className="w-4 h-4 text-pink-200" />
            <span>{isVi ? 'Hỏi AI việc làm phù hợp' : 'AI Job Matching'}</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isVi ? 'Tìm việc, tên công ty, quán cafe, địa điểm...' : 'Search role, cafe, location...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-purple-200 text-xs bg-purple-50/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Shift Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              {isVi ? 'Khung giờ:' : 'Shift:'}
            </span>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="px-3 py-2 rounded-xl border border-purple-200 text-xs font-semibold text-purple-800 bg-purple-50/50 cursor-pointer"
            >
              <option value="all">{isVi ? 'Tất cả ca làm' : 'All Shifts'}</option>
              <option value="flexible">{isVi ? 'Linh hoạt tự chọn ca' : 'Flexible Shifts'}</option>
              <option value="evening">{isVi ? 'Buổi tối (18h - 22h)' : 'Evening Shifts'}</option>
              <option value="weekend">{isVi ? 'Cuối tuần (T7, CN)' : 'Weekend Shifts'}</option>
              <option value="morning">{isVi ? 'Buổi sáng' : 'Morning Shifts'}</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
            }`}
          >
            {isVi ? '✨ Tất cả ngành nghề' : '✨ All Fields'}
          </button>

          {[
            { id: 'fnb', label: isVi ? '☕ Pha Chế & Phục Vụ' : 'F&B & Barista' },
            { id: 'tutoring', label: isVi ? '📚 Gia Sư & Giảng Dạy' : 'Tutoring' },
            { id: 'marketing', label: isVi ? '🎨 Content & Thiết Kế' : 'Content & Media' },
            { id: 'retail', label: isVi ? '🛍️ Bán Hàng & Lễ Tân' : 'Retail & Cashier' },
            { id: 'artist_support', label: isVi ? '🎤 Trợ Lý Nghệ Sĩ / Sự Kiện' : 'Artist Support' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-dashed border-purple-200">
            <Briefcase className="w-10 h-10 text-purple-400 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">
              {isVi ? 'Không tìm thấy việc làm phù hợp với bộ lọc hiện tại.' : 'No jobs matching your filter.'}
            </p>
          </div>
        ) : (
          filteredJobs.map((job: JobOpportunity) => {
            const hasApplied = appliedJobs.includes(job.id);
            const displayHours = job.workingHours || `${job.shiftTimes.start} - ${job.shiftTimes.end}`;

            return (
              <div
                key={job.id}
                className="rounded-3xl bg-white border border-purple-100 p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Company, Logo/Icon, Compatibility Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-100 to-pink-100 border border-purple-200 flex items-center justify-center text-purple-700 font-extrabold text-sm shadow-xs">
                        {job.company.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-base leading-snug">
                          {job.title}
                        </h3>
                        <p className="text-xs text-purple-700 font-semibold flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-purple-500" />
                          <span>{job.company}</span>
                        </p>
                      </div>
                    </div>

                    {/* Compatibility Badge (Auto checks no schedule conflicts) */}
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold whitespace-nowrap shadow-2xs">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span>{isVi ? 'Không trùng lịch học' : 'No Schedule Conflict'}</span>
                    </span>
                  </div>

                  {/* Highlights Bar: Salary, Shift, Location */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-pink-50/70 border border-pink-100 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-pink-600 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-pink-600 font-bold block">{isVi ? 'Mức lương:' : 'Salary:'}</span>
                        <span className="font-extrabold text-pink-900">{job.salary}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-purple-600 font-bold block">{isVi ? 'Thời gian:' : 'Hours:'}</span>
                        <span className="font-bold text-purple-900 truncate block">{displayHours}</span>
                      </div>
                    </div>
                  </div>

                  <p className="flex items-start gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-pink-500 flex-shrink-0 mt-0.5" />
                    <span>{job.location}</span>
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Requirements & Benefits summary */}
                  <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
                    <div>
                      <span className="font-bold text-slate-700 text-[11px] mr-1">
                        {isVi ? 'Yêu cầu:' : 'Requirements:'}
                      </span>
                      <span className="text-slate-500 text-[11px]">{job.requirements.slice(0, 2).join(' • ')}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {job.benefits.slice(0, 3).map((benefit: string, i: number) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700"
                        >
                          🎁 {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-purple-50 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleAddWorkShiftToSchedule(job)}
                    className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1.5 transition cursor-pointer"
                    title={isVi ? 'Đồng bộ ca làm này vào lịch trình cá nhân' : 'Sync to personal schedule'}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{isVi ? 'Thêm ca vào Lịch' : 'Add to Schedule'}</span>
                  </button>

                  {hasApplied ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 cursor-not-allowed"
                    >
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{isVi ? 'Đã Ứng Tuyển' : 'Applied'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedJobForModal(job)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs shadow-md hover:opacity-95 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isVi ? 'Ứng Tuyển Nhanh' : 'Apply Now'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QUICK APPLY MODAL */}
      {selectedJobForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
                  {isVi ? 'Ứng Tuyển Việc Làm Sinh Viên' : 'Apply for Student Job'}
                </h3>
                <p className="text-xs text-purple-700 font-semibold">
                  {selectedJobForModal.title} — {selectedJobForModal.company}
                </p>
              </div>
              <button
                onClick={() => setSelectedJobForModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isVi ? 'Họ và tên *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isVi ? 'VD: Nguyễn Văn A' : 'Full Name'}
                  value={applyForm.fullName}
                  onChange={(e) => setApplyForm({ ...applyForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Số điện thoại Zalo / Gọi *' : 'Phone *'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0912 345 678"
                    value={applyForm.phone}
                    onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Email *' : 'Email *'}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="emailcuaban@gmail.com"
                    value={applyForm.email}
                    onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Trường đại học / Cao đẳng' : 'University'}
                  </label>
                  <input
                    type="text"
                    placeholder={isVi ? 'VD: ĐH Quốc Gia, ĐH Bách Khoa...' : 'University name'}
                    value={applyForm.university}
                    onChange={(e) => setApplyForm({ ...applyForm, university: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Thời gian rảnh có thể làm' : 'Available Hours'}
                  </label>
                  <input
                    type="text"
                    placeholder={isVi ? 'VD: Tối T2, T4, T6 hoặc cuối tuần' : 'e.g. Mon, Wed evenings'}
                    value={applyForm.availableDays}
                    onChange={(e) => setApplyForm({ ...applyForm, availableDays: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isVi ? 'Giới thiệu ngắn & Kỹ năng phù hợp' : 'Short Introduction'}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    isVi
                      ? 'VD: Em là sinh viên chăm chỉ, nhanh nhẹn, mong muốn tìm việc làm thêm để rèn luyện kỹ năng...'
                      : 'Brief introduction about your schedule and experience...'
                  }
                  value={applyForm.intro}
                  onChange={(e) => setApplyForm({ ...applyForm, intro: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30"
                />
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 flex items-start gap-2 text-xs text-purple-800">
                <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <p>
                  {isVi
                    ? 'Thông tin ứng tuyển của bạn được bảo mật tuyệt đối và gửi trực tiếp tới quản lý tuyển dụng của doanh nghiệp.'
                    : 'Your student application is securely sent directly to the hiring manager.'}
                </p>
              </div>

              <div className="pt-3 border-t border-purple-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedJobForModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold shadow-md hover:opacity-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Gửi Hồ Sơ Ngay' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
