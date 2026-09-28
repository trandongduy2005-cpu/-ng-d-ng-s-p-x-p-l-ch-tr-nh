import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, RoleType } from '../../types';
import {
  User,
  Phone,
  LogOut,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthModalOpen,
    setIsAuthModalOpen,
    login,
    logout,
    selectedRole,
    setSelectedRole,
    language,
  } = useApp();

  const isVi = language === 'vi';

  // Tabs: 'select' | 'phone_otp'
  const [authView, setAuthView] = useState<'select' | 'phone'>('select');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [fullName, setFullName] = useState('Đông Duy');

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = () => {
    login('google', {
      name: 'Đông Duy Trần (Google)',
      email: 'trandongduy2005@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    });
    confetti({ particleCount: 40, spread: 60 });
  };

  const handleFacebookLogin = () => {
    login('facebook', {
      name: 'Đông Duy (Facebook)',
      email: 'dongduy.fb@smartplanna.vn',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    });
    confetti({ particleCount: 40, spread: 60 });
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      if (!phoneNumber.trim()) return;
      setOtpSent(true);
      setOtpCode('6868'); // Mock auto-filled OTP for convenience
    } else {
      login('phone', {
        name: fullName.trim() || 'Người Dùng SmartPlanna',
        phone: phoneNumber.trim(),
        email: `${phoneNumber.trim()}@smartplanna.vn`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      });
      confetti({ particleCount: 40, spread: 60 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 space-y-5">
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
                    : 'User Profile'
                  : isVi
                  ? 'Đăng Nhập Miễn Phí'
                  : 'Free Sign In'}
              </h3>
              <p className="text-xs text-purple-700 font-medium">SmartPlanna Cloud</p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {user.isLoggedIn ? (
          /* Profile & Logout View */
          <div className="space-y-4 text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2 border-purple-300 shadow-md">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>

            <div>
              <h4 className="text-lg font-extrabold text-slate-800">{user.name}</h4>
              <p className="text-xs text-slate-500">{user.email || user.phone}</p>
              <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-xs uppercase tracking-wider">
                {selectedRole === 'student'
                  ? isVi
                    ? 'Sinh Viên'
                    : 'Student'
                  : selectedRole === 'artist'
                  ? isVi
                    ? 'Nghệ Sĩ'
                    : 'Artist'
                  : isVi
                  ? 'Người Đi Làm'
                  : 'Professional'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-100 text-left text-xs space-y-1">
              <p className="font-bold text-purple-900">
                {isVi ? 'Đồng bộ hóa dữ liệu:' : 'Sync status:'}
              </p>
              <p className="text-slate-600">
                {isVi
                  ? 'Toàn bộ lịch học, chi tiêu và địa điểm của bạn đã được đồng bộ an toàn và lưu trữ ngoại tuyến.'
                  : 'Your schedules, tasks and expenses are securely saved and synced.'}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs transition cursor-pointer"
              >
                {isVi ? 'Tiếp tục sử dụng' : 'Continue'}
              </button>
              <button
                onClick={logout}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{isVi ? 'Đăng xuất' : 'Logout'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login View */
          <div className="space-y-4">
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              {isVi
                ? 'SmartPlanna hoàn toàn miễn phí cho tất cả mọi người (Học sinh, sinh viên, nghệ sĩ, người đi làm). Đăng nhập để lưu trữ lịch trình và chia sẻ làm việc nhóm.'
                : 'SmartPlanna is 100% free for students, artists and everyone. Sign in to sync your data across devices.'}
            </p>

            {authView === 'select' ? (
              <div className="space-y-3">
                {/* Google Login Button */}
                <button
                  onClick={handleGoogleLogin}
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
                  <span>{isVi ? 'Đăng nhập với Google' : 'Continue with Google'}</span>
                </button>

                {/* Facebook Login Button */}
                <button
                  onClick={handleFacebookLogin}
                  className="w-full py-2.5 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition cursor-pointer shadow-2xs"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>{isVi ? 'Đăng nhập với Facebook' : 'Continue with Facebook'}</span>
                </button>

                {/* Phone Login Button */}
                <button
                  onClick={() => setAuthView('phone')}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition cursor-pointer shadow-md shadow-pink-500/20"
                >
                  <Phone className="w-4 h-4" />
                  <span>{isVi ? 'Đăng nhập bằng Số Điện Thoại' : 'Sign in with Phone Number'}</span>
                </button>
              </div>
            ) : (
              /* Phone Input Form */
              <form onSubmit={handlePhoneSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isVi ? 'Họ và tên của bạn' : 'Your Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isVi ? 'Số điện thoại Việt Nam (+84)' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0987654321"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 text-xs font-bold"
                  />
                </div>

                {otpSent && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isVi ? 'Mã xác nhận OTP (Đã tự điền 6868)' : 'OTP Code'}
                    </label>
                    <input
                      type="text"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-purple-300 bg-purple-50/50 text-center font-extrabold tracking-widest text-purple-900"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthView('select');
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
                        ? 'Xác Nhận Đăng Nhập'
                        : 'Verify & Login'
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
                  ? 'Bảo mật chuẩn mã hóa SSL. Miễn phí trọn đời.'
                  : 'Encrypted & 100% Free Lifetime.'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
