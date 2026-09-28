import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleType } from '../../types';
import {
  User,
  Phone,
  LogOut,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Mail,
  GraduationCap,
  Music,
  Briefcase,
  Edit2,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthModalOpen,
    setIsAuthModalOpen,
    login,
    logout,
    updateUserProfile,
    selectedRole,
    setSelectedRole,
    language,
  } = useApp();

  const isVi = language === 'vi';

  // Mode: 'menu' | 'google' | 'facebook' | 'phone'
  const [authMode, setAuthMode] = useState<'menu' | 'google' | 'facebook' | 'phone'>('menu');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<RoleType>(selectedRole || 'student');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Edit mode for logged-in user
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPhone, setEditPhone] = useState(user.phone || '');

  if (!isAuthModalOpen) return null;

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setOtpCode('');
    setOtpSent(false);
    setAuthMode('menu');
  };

  const handleClose = () => {
    resetForm();
    setIsEditingProfile(false);
    setIsAuthModalOpen(false);
  };

  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setSelectedRole(role);
    login('google', {
      name: fullName.trim(),
      email: email.trim(),
      role: role,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName.trim())}&backgroundColor=8b5cf6,ec4899`,
    });

    confetti({ particleCount: 50, spread: 60 });
    handleClose();
  };

  const handleFacebookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSelectedRole(role);
    login('facebook', {
      name: fullName.trim(),
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '')}@facebook.com`,
      role: role,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName.trim())}&backgroundColor=1877f2,8b5cf6`,
    });

    confetti({ particleCount: 50, spread: 60 });
    handleClose();
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      if (!fullName.trim() || !phone.trim()) return;
      setOtpSent(true);
      setOtpCode('6868'); // Mock convenient verification code
    } else {
      setSelectedRole(role);
      login('phone', {
        name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || `${phone.trim()}@smartplanna.vn`,
        role: role,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName.trim())}&backgroundColor=ec4899,d946ef`,
      });

      confetti({ particleCount: 50, spread: 60 });
      handleClose();
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: editName.trim() || user.name,
      email: editEmail.trim() || user.email,
      phone: editPhone.trim() || user.phone,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 space-y-5 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                {user.isLoggedIn
                  ? isVi
                    ? 'Tài Khoản Cá Nhân'
                    : 'Personal Account'
                  : isVi
                  ? 'Đăng Nhập Miễn Phí'
                  : 'Free Account Sign In'}
              </h3>
              <p className="text-xs text-purple-700 font-medium">SmartPlanna Cloud</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Logged-in View */}
        {user.isLoggedIn ? (
          <div className="space-y-4">
            {!isEditingProfile ? (
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2 border-purple-300 shadow-md bg-purple-50 flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-purple-400" />
                  )}
                </div>

                <div>
                  <h4 className="text-lg font-extrabold text-slate-800">{user.name}</h4>
                  <p className="text-xs text-slate-500">{user.email || user.phone}</p>
                  <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-xs uppercase tracking-wider">
                    {user.role === 'student'
                      ? isVi
                        ? '🎓 Học sinh & Sinh viên'
                        : '🎓 Student'
                      : user.role === 'artist'
                      ? isVi
                        ? '🎨 Nghệ sĩ & Biểu diễn'
                        : '🎨 Artist'
                      : isVi
                      ? '💼 Người đi làm'
                      : '💼 Professional'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-100 text-left text-xs space-y-1">
                  <p className="font-bold text-purple-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isVi ? 'Đang đồng bộ hóa trực tuyến:' : 'Active Online Sync:'}</span>
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    {isVi
                      ? 'Lịch trình, chi tiêu và địa điểm của bạn được lưu an toàn trên thiết bị và sẵn sàng sử dụng cả online và offline.'
                      : 'Your events, tasks and expenses are synchronized and accessible offline.'}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setEditName(user.name);
                      setEditEmail(user.email);
                      setEditPhone(user.phone || '');
                      setIsEditingProfile(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isVi ? 'Sửa thông tin' : 'Edit Profile'}</span>
                  </button>

                  <button
                    onClick={logout}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isVi ? 'Đăng xuất' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Edit profile form */
              <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Họ và tên thực tế' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Email' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Số điện thoại' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer"
                  >
                    {isVi ? 'Hủy' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    {isVi ? 'Lưu thay đổi' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* 2. Login View with real information input */
          <div className="space-y-4">
            {authMode === 'menu' && (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-500 text-center leading-relaxed">
                  {isVi
                    ? 'SmartPlanna hoàn toàn MIỄN PHÍ cho mọi người. Đăng nhập bằng thông tin thực tế của bạn để bắt đầu lưu trữ và quản lý lịch trình.'
                    : 'SmartPlanna is 100% FREE for students, artists and everyone. Sign in with your real information to begin.'}
                </p>

                {/* Google Option */}
                <button
                  onClick={() => setAuthMode('google')}
                  className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition cursor-pointer shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isVi ? 'Đăng nhập với tài khoản Google' : 'Sign in with Google Account'}</span>
                </button>

                {/* Facebook Option */}
                <button
                  onClick={() => setAuthMode('facebook')}
                  className="w-full py-2.5 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition cursor-pointer shadow-2xs"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>{isVi ? 'Đăng nhập với Facebook' : 'Sign in with Facebook'}</span>
                </button>

                {/* Phone Option */}
                <button
                  onClick={() => setAuthMode('phone')}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition cursor-pointer shadow-md shadow-pink-500/20"
                >
                  <Phone className="w-4 h-4" />
                  <span>{isVi ? 'Tạo tài khoản bằng Số Điện Thoại' : 'Sign up with Phone Number'}</span>
                </button>
              </div>
            )}

            {/* Google Login Form */}
            {authMode === 'google' && (
              <form onSubmit={handleGoogleSubmit} className="space-y-3">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50 text-xs text-purple-900 font-semibold mb-2">
                  <span>🌐</span>
                  <span>{isVi ? 'Nhập thông tin Google thực tế của bạn để đồng bộ' : 'Enter your actual Google account details'}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isVi ? 'Họ và tên của bạn *' : 'Your Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isVi ? 'VD: Nguyễn Văn A' : 'John Doe'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isVi ? 'Địa chỉ Gmail *' : 'Gmail Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="emailcuaban@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isVi ? 'Vai trò chính của bạn' : 'Primary Role'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`p-2 rounded-xl border text-center text-xs font-bold cursor-pointer transition ${
                        role === 'student' ? 'border-purple-600 bg-purple-100 text-purple-800' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      🎓 {isVi ? 'Sinh viên' : 'Student'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('artist')}
                      className={`p-2 rounded-xl border text-center text-xs font-bold cursor-pointer transition ${
                        role === 'artist' ? 'border-pink-500 bg-pink-100 text-pink-800' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      🎨 {isVi ? 'Nghệ sĩ' : 'Artist'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('worker')}
                      className={`p-2 rounded-xl border text-center text-xs font-bold cursor-pointer transition ${
                        role === 'worker' ? 'border-indigo-500 bg-indigo-100 text-indigo-800' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      💼 {isVi ? 'Đi làm' : 'Work'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('menu')}
                    className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs cursor-pointer"
                  >
                    {isVi ? 'Quay lại' : 'Back'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs shadow-md hover:opacity-95 cursor-pointer"
                  >
                    {isVi ? 'Đăng Nhập Google' : 'Continue with Google'}
                  </button>
                </div>
              </form>
            )}

            {/* Facebook Login Form */}
            {authMode === 'facebook' && (
              <form onSubmit={handleFacebookSubmit} className="space-y-3">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 text-xs text-blue-900 font-semibold mb-2">
                  <span>📱</span>
                  <span>{isVi ? 'Nhập thông tin Facebook của bạn để kết nối' : 'Enter your Facebook account information'}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isVi ? 'Tên hiển thị trên Facebook *' : 'Facebook Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isVi ? 'VD: Nguyễn Văn A' : 'Your name'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isVi ? 'Email hoặc SĐT Facebook' : 'Facebook Email or Phone'}
                  </label>
                  <input
                    type="text"
                    placeholder="example@facebook.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isVi ? 'Vai trò của bạn' : 'Your Role'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`p-2 rounded-xl border text-center text-xs font-bold cursor-pointer transition ${
                        role === 'student' ? 'border-purple-600 bg-purple-100 text-purple-800' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      🎓 {isVi ? 'Sinh viên' : 'Student'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('artist')}
                      className={`p-2 rounded-xl border text-center text-xs font-bold cursor-pointer transition ${
                        role === 'artist' ? 'border-pink-500 bg-pink-100 text-pink-800' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      🎨 {isVi ? 'Nghệ sĩ' : 'Artist'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('worker')}
                      className={`p-2 rounded-xl border text-center text-xs font-bold cursor-pointer transition ${
                        role === 'worker' ? 'border-indigo-500 bg-indigo-100 text-indigo-800' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      💼 {isVi ? 'Đi làm' : 'Work'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('menu')}
                    className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs cursor-pointer"
                  >
                    {isVi ? 'Quay lại' : 'Back'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-[#1877F2] text-white font-bold text-xs shadow-md hover:bg-[#166fe5] cursor-pointer"
                  >
                    {isVi ? 'Đăng Nhập Facebook' : 'Continue with Facebook'}
                  </button>
                </div>
              </form>
            )}

            {/* Phone Login Form */}
            {authMode === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isVi ? 'Họ và tên của bạn *' : 'Your Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isVi ? 'VD: Nguyễn Văn A' : 'Full Name'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isVi ? 'Số điện thoại thực tế (+84) *' : 'Phone Number (+84) *'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 text-xs font-bold text-purple-900"
                  />
                </div>

                {otpSent && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isVi ? 'Mã OTP xác thực (Mã mẫu: 6868)' : 'Verification Code'}
                    </label>
                    <input
                      type="text"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-purple-300 bg-purple-50/50 text-center font-extrabold tracking-widest text-purple-900 text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isVi ? 'Vai trò của bạn' : 'Your Role'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`p-2 rounded-xl border text-center text-xs font-bold cursor-pointer transition ${
                        role === 'student' ? 'border-purple-600 bg-purple-100 text-purple-800' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      🎓 {isVi ? 'Sinh viên' : 'Student'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('artist')}
                      className={`p-2 rounded-xl border text-center text-xs font-bold cursor-pointer transition ${
                        role === 'artist' ? 'border-pink-500 bg-pink-100 text-pink-800' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      🎨 {isVi ? 'Nghệ sĩ' : 'Artist'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('worker')}
                      className={`p-2 rounded-xl border text-center text-xs font-bold cursor-pointer transition ${
                        role === 'worker' ? 'border-indigo-500 bg-indigo-100 text-indigo-800' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      💼 {isVi ? 'Đi làm' : 'Work'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('menu');
                      setOtpSent(false);
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 font-semibold text-xs cursor-pointer"
                  >
                    {isVi ? 'Quay lại' : 'Back'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    {otpSent
                      ? isVi
                        ? 'Xác Nhận & Đăng Nhập'
                        : 'Verify & Finish'
                      : isVi
                      ? 'Gửi Mã OTP'
                      : 'Send OTP'}
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {isVi
                  ? 'Miễn phí cho mọi người. Dữ liệu lưu an toàn trên máy của bạn.'
                  : 'Free for everyone. Data is securely saved locally.'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
