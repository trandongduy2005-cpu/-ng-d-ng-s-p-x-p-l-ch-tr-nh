import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleType } from '../../types';
import {
  auth,
  db,
  googleProvider,
  facebookProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from '../../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
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
  AlertCircle,
  Loader2,
  RefreshCw,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthModalOpen,
    setIsAuthModalOpen,
    logout,
    updateUserProfile,
    selectedRole,
    setSelectedRole,
    language,
  } = useApp();

  const isVi = language === 'vi';

  // Mode: 'menu' | 'phone_request' | 'phone_verify'
  const [authMode, setAuthMode] = useState<'menu' | 'phone_request' | 'phone_verify'>('menu');
  const [role, setRole] = useState<RoleType>(selectedRole || 'student');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [formattedPhoneDisplay, setFormattedPhoneDisplay] = useState('');
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown]);

  // Clean reCAPTCHA on unmount or mode reset
  const cleanupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn('Recaptcha clear note:', e);
      }
      window.recaptchaVerifier = undefined;
    }
  };

  const resetState = () => {
    cleanupRecaptcha();
    setAuthMode('menu');
    setPhoneNumber('');
    setOtpCode('');
    setIsLoading(false);
    setLoadingText('');
    setErrorMessage(null);
    setSuccessMessage(null);
    setCountdown(0);
    setIsEditingProfile(false);
  };

  const handleClose = () => {
    resetState();
    setIsAuthModalOpen(false);
  };

  // Convert Vietnamese phone input to E.164 (+84...)
  const formatE164Phone = (raw: string): string => {
    let clean = raw.trim().replace(/[\s\-\.\(\)]/g, '');
    if (clean.startsWith('0')) {
      clean = '+84' + clean.slice(1);
    } else if (!clean.startsWith('+')) {
      clean = '+84' + clean;
    }
    return clean;
  };

  // 1. REAL GOOGLE SIGN-IN VIA OFFICIAL GOOGLE OAUTH POPUP
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setLoadingText(isVi ? 'Đang mở cửa sổ đăng nhập Google...' : 'Connecting to Google...');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      // Update role in Firestore profile
      try {
        await setDoc(
          doc(db, 'users', fbUser.uid),
          {
            id: fbUser.uid,
            name: fbUser.displayName || 'Người dùng Google',
            email: fbUser.email || '',
            avatar: fbUser.photoURL || '',
            role: role,
            loginMethod: 'google',
            lastLoginAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn('Firestore user update note:', e);
      }

      setSelectedRole(role);
      confetti({ particleCount: 50, spread: 70 });
      setSuccessMessage(
        isVi
          ? `Đăng nhập Google thành công! Xin chào ${fbUser.displayName || fbUser.email}`
          : `Signed in successfully as ${fbUser.displayName || fbUser.email}`
      );

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage(
          isVi
            ? 'Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất xác thực.'
            : 'Sign-in window closed before completion.'
        );
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMessage(
          isVi
            ? 'Yêu cầu đăng nhập bị hủy do có cửa sổ đăng nhập khác đang mở.'
            : 'Login cancelled due to overlapping requests.'
        );
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage(
          isVi
            ? 'Trình duyệt đã chặn cửa sổ đăng nhập Google. Vui lòng cho phép popup để tiếp tục.'
            : 'Popup blocked by browser. Please enable popups.'
        );
      } else {
        setErrorMessage(
          err.message ||
            (isVi
              ? 'Đăng nhập Google thất bại. Vui lòng thử lại.'
              : 'Google sign-in failed. Please retry.')
        );
      }
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  // 2. REAL FACEBOOK LOGIN VIA OFFICIAL FACEBOOK OAUTH POPUP
  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    setLoadingText(isVi ? 'Đang mở cửa sổ đăng nhập Facebook...' : 'Connecting to Facebook...');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const fbUser = result.user;

      try {
        await setDoc(
          doc(db, 'users', fbUser.uid),
          {
            id: fbUser.uid,
            name: fbUser.displayName || 'Người dùng Facebook',
            email: fbUser.email || '',
            avatar: fbUser.photoURL || '',
            role: role,
            loginMethod: 'facebook',
            lastLoginAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn('Firestore user update note:', e);
      }

      setSelectedRole(role);
      confetti({ particleCount: 50, spread: 70 });
      setSuccessMessage(
        isVi
          ? `Đăng nhập Facebook thành công! Xin chào ${fbUser.displayName}`
          : `Signed in successfully as ${fbUser.displayName}`
      );

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err: any) {
      console.error('Facebook Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage(
          isVi
            ? 'Bạn đã đóng cửa sổ đăng nhập Facebook trước khi hoàn tất xác thực.'
            : 'Facebook sign-in window closed before completion.'
        );
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setErrorMessage(
          isVi
            ? 'Email liên kết với tài khoản Facebook này đã được đăng ký bằng phương thức khác (như Google).'
            : 'Account exists with a different credential.'
        );
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMessage(
          isVi
            ? 'Đăng nhập Facebook yêu cầu cấu hình Meta App ID trong Firebase Console. Vui lòng sử dụng Google hoặc Số điện thoại.'
            : 'Facebook provider needs Meta App credentials in Firebase Console.'
        );
      } else {
        setErrorMessage(
          err.message ||
            (isVi
              ? 'Đăng nhập Facebook thất bại. Vui lòng thử lại.'
              : 'Facebook sign-in failed. Please retry.')
        );
      }
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  // 3. REAL PHONE AUTHENTICATION VIA FIREBASE RECAPTCHA & REAL SMS OTP
  const setupRecaptchaVerifier = () => {
    cleanupRecaptcha();
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        setErrorMessage(
          isVi
            ? 'Mã xác thực bảo mật reCAPTCHA đã hết hạn, vui lòng gửi lại mã OTP.'
            : 'reCAPTCHA expired, please resend OTP.'
        );
      },
    });
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setErrorMessage(isVi ? 'Vui lòng nhập số điện thoại.' : 'Please enter your phone number.');
      return;
    }

    const formatted = formatE164Phone(phoneNumber);
    if (formatted.length < 10) {
      setErrorMessage(
        isVi
          ? 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam 10 chữ số (VD: 0987654321).'
          : 'Invalid phone number format.'
      );
      return;
    }

    setIsLoading(true);
    setLoadingText(isVi ? 'Đang gửi mã OTP xác thực qua tin nhắn SMS...' : 'Sending SMS OTP code...');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      setupRecaptchaVerifier();
      const appVerifier = window.recaptchaVerifier!;
      const confirmationResult = await signInWithPhoneNumber(auth, formatted, appVerifier);
      window.confirmationResult = confirmationResult;

      setFormattedPhoneDisplay(formatted);
      setAuthMode('phone_verify');
      setCountdown(60);
      setSuccessMessage(
        isVi
          ? `Mã xác thực OTP đã được gửi đến số điện thoại ${formatted}. Vui lòng kiểm tra tin nhắn SMS!`
          : `SMS verification code sent to ${formatted}. Please check your phone!`
      );
    } catch (err: any) {
      console.error('Send OTP Error:', err);
      cleanupRecaptcha();
      if (err.code === 'auth/invalid-phone-number') {
        setErrorMessage(
          isVi
            ? 'Số điện thoại không đúng định dạng. Vui lòng nhập số điện thoại thật của bạn.'
            : 'Invalid phone number format.'
        );
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage(
          isVi
            ? 'Đã có quá nhiều yêu cầu gửi SMS từ thiết bị này. Vui lòng chờ vài phút rồi thử lại.'
            : 'Too many requests. Please wait a few minutes.'
        );
      } else if (err.code === 'auth/quota-exceeded') {
        setErrorMessage(
          isVi
            ? 'Hạn mức SMS trong ngày của dịch vụ đã chạm giới hạn.'
            : 'SMS quota exceeded.'
        );
      } else {
        setErrorMessage(
          err.message ||
            (isVi
              ? 'Không thể gửi tin nhắn SMS OTP. Vui lòng kiểm tra lại số điện thoại.'
              : 'Failed to send SMS OTP.')
        );
      }
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpCode.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMessage(
        isVi
          ? 'Vui lòng nhập đầy đủ mã OTP 6 chữ số được gửi qua SMS.'
          : 'Please enter the full 6-digit OTP code.'
      );
      return;
    }

    if (!window.confirmationResult) {
      setErrorMessage(
        isVi
          ? 'Phiên xác thực đã hết hạn. Vui lòng quay lại và bấm gửi lại mã OTP.'
          : 'Verification session expired. Please request a new code.'
      );
      return;
    }

    setIsLoading(true);
    setLoadingText(isVi ? 'Đang kiểm tra và xác thực mã OTP...' : 'Verifying SMS OTP code...');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const userCredential = await window.confirmationResult.confirm(cleanOtp);
      const fbUser = userCredential.user;

      const displayName = fullName.trim() || `Thành Viên ${formattedPhoneDisplay.slice(-4)}`;
      try {
        await updateProfile(fbUser, { displayName });
        await setDoc(
          doc(db, 'users', fbUser.uid),
          {
            id: fbUser.uid,
            name: displayName,
            phone: formattedPhoneDisplay,
            role: role,
            loginMethod: 'phone',
            lastLoginAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn('Update user profile note:', e);
      }

      setSelectedRole(role);
      confetti({ particleCount: 50, spread: 70 });
      setSuccessMessage(
        isVi
          ? `Xác thực số điện thoại thành công! Xin chào ${displayName}`
          : `Phone verified successfully! Welcome ${displayName}`
      );

      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err: any) {
      console.error('Verify OTP Error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setErrorMessage(
          isVi
            ? 'Mã OTP không chính xác. Vui lòng kiểm tra lại tin nhắn SMS trên điện thoại của bạn.'
            : 'Invalid verification code. Please check your SMS and retry.'
        );
      } else if (err.code === 'auth/code-expired') {
        setErrorMessage(
          isVi
            ? 'Mã OTP này đã hết hạn. Vui lòng bấm gửi lại mã OTP mới.'
            : 'SMS code has expired. Please request a new one.'
        );
      } else {
        setErrorMessage(
          err.message ||
            (isVi
              ? 'Xác thực OTP không thành công. Vui lòng thử lại.'
              : 'Verification failed. Please retry.')
        );
      }
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    await updateUserProfile({
      name: editName.trim(),
    });
    setIsEditingProfile(false);
    setSuccessMessage(isVi ? 'Đã cập nhật thông tin thành công!' : 'Profile updated!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 space-y-5 animate-scale-up relative">
        {/* Invisible reCAPTCHA container for Phone Auth */}
        <div id="recaptcha-container"></div>

        {/* Modal Header */}
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
                  ? 'Đăng Nhập / Đăng Ký Thật'
                  : 'Production Authentication'}
              </h3>
              <p className="text-xs text-purple-700 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Firebase Production Security</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast / Alert Notifications */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{successMessage}</p>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
            <span className="font-bold">{loadingText}</span>
          </div>
        )}

        {/* VIEW 1: USER IS ALREADY LOGGED IN */}
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
                  <p className="text-xs text-slate-500 font-medium">
                    {user.email || user.phone}
                  </p>

                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-xs uppercase tracking-wider">
                      {user.role === 'student'
                        ? isVi
                          ? '🎓 Sinh viên'
                          : '🎓 Student'
                        : user.role === 'artist'
                        ? isVi
                          ? '🎨 Nghệ sĩ'
                          : '🎨 Artist'
                        : isVi
                        ? '💼 Người đi làm'
                        : '💼 Professional'}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                      ✓ {user.loginMethod.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-100 text-left text-xs space-y-1">
                  <p className="font-bold text-purple-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isVi ? 'Đã xác thực thật qua Firebase:' : 'Verified Account:'}</span>
                  </p>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {isVi
                      ? 'Tài khoản của bạn đã được xác thực chính thức. Lịch trình, chi tiêu và địa điểm được đồng bộ an toàn vào tài khoản cá nhân của bạn.'
                      : 'Authenticated via official security provider. Your data is safely synced to your account.'}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setEditName(user.name);
                      setIsEditingProfile(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isVi ? 'Đổi tên hiển thị' : 'Edit Name'}</span>
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
              <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Họ và tên hiển thị' : 'Display Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
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
                    {isVi ? 'Lưu' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* VIEW 2: AUTHENTICATION FLOW */
          <div className="space-y-4">
            {/* Primary Role Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {isVi ? 'Chọn vai trò chính của bạn:' : 'Choose your primary role:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-2 rounded-xl border text-center text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1 ${
                    role === 'student'
                      ? 'border-purple-600 bg-purple-100 text-purple-800 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Sinh viên' : 'Student'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('artist')}
                  className={`p-2 rounded-xl border text-center text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1 ${
                    role === 'artist'
                      ? 'border-pink-500 bg-pink-100 text-pink-800 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Nghệ sĩ' : 'Artist'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  className={`p-2 rounded-xl border text-center text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1 ${
                    role === 'worker'
                      ? 'border-fuchsia-600 bg-fuchsia-100 text-fuchsia-800 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Đi làm' : 'Work'}</span>
                </button>
              </div>
            </div>

            {authMode === 'menu' && (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-slate-500 text-center leading-relaxed">
                  {isVi
                    ? 'Đăng nhập bảo mật qua cổng xác thực chính thức để lưu lịch trình và đồng bộ dữ liệu của bạn.'
                    : 'Sign in via official authentication providers to securely synchronize your schedule.'}
                </p>

                {/* Method 1: Real Google OAuth */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition cursor-pointer shadow-2xs disabled:opacity-60"
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
                  <span>{isVi ? 'Đăng nhập với Google (OAuth thật)' : 'Sign in with Google (Real OAuth)'}</span>
                </button>

                {/* Method 2: Real Facebook Login */}
                <button
                  type="button"
                  onClick={handleFacebookSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition cursor-pointer shadow-2xs disabled:opacity-60"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>{isVi ? 'Đăng nhập với Facebook (OAuth thật)' : 'Sign in with Facebook (Real OAuth)'}</span>
                </button>

                {/* Method 3: Real Phone SMS OTP */}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setAuthMode('phone_request');
                  }}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition cursor-pointer shadow-md shadow-pink-500/20 disabled:opacity-60"
                >
                  <Phone className="w-4 h-4" />
                  <span>{isVi ? 'Xác thực Số Điện Thoại (Mã OTP qua SMS)' : 'Phone SMS OTP Verification'}</span>
                </button>
              </div>
            )}

            {/* FLOW: ENTER PHONE NUMBER */}
            {authMode === 'phone_request' && (
              <form onSubmit={handleSendPhoneOtp} className="space-y-3.5">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50 text-xs text-purple-900 font-semibold">
                  <Phone className="w-4 h-4 text-purple-600" />
                  <span>{isVi ? 'Nhập số điện thoại thật để nhận mã OTP qua SMS' : 'Enter real phone number to receive SMS OTP'}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isVi ? 'Họ và tên của bạn' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={isVi ? 'VD: Nguyễn Văn A' : 'John Doe'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isVi ? 'Số điện thoại di động Việt Nam (+84) *' : 'Phone Number (+84) *'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0987654321 hoặc +84987654321"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 text-xs font-bold text-slate-800 tracking-wider focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isVi
                      ? 'Hệ thống Firebase sẽ gửi tin nhắn SMS chứa mã OTP 6 chữ số đến số máy này.'
                      : 'Firebase will send a 6-digit verification code via SMS.'}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setAuthMode('menu');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{isVi ? 'Quay lại' : 'Back'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs shadow-md hover:opacity-95 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                    <span>{isVi ? 'Gửi Mã OTP SMS' : 'Send SMS OTP'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* FLOW: ENTER 6-DIGIT OTP CODE */}
            {authMode === 'phone_verify' && (
              <form onSubmit={handleVerifyPhoneOtp} className="space-y-3.5">
                <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs space-y-1">
                  <p className="font-extrabold text-purple-900 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-purple-600" />
                    <span>{isVi ? 'Nhập mã xác thực SMS OTP' : 'Enter SMS OTP Code'}</span>
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    {isVi
                      ? `Mã gồm 6 chữ số đã được gửi tới số ${formattedPhoneDisplay}.`
                      : `A 6-digit code has been sent to ${formattedPhoneDisplay}.`}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isVi ? 'Mã OTP (6 chữ số) *' : 'OTP Code (6 digits) *'}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="• • • • • •"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-xl border border-purple-300 bg-purple-50/40 text-center font-extrabold text-lg tracking-[0.5em] text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    disabled={countdown > 0 || isLoading}
                    className="text-purple-600 hover:text-purple-800 font-bold disabled:text-slate-400 cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>
                      {countdown > 0
                        ? isVi
                          ? `Gửi lại sau (${countdown}s)`
                          : `Resend in (${countdown}s)`
                        : isVi
                        ? 'Gửi lại mã OTP'
                        : 'Resend OTP'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode('');
                      setErrorMessage(null);
                      setAuthMode('phone_request');
                    }}
                    className="text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
                  >
                    {isVi ? 'Đổi số điện thoại' : 'Change phone number'}
                  </button>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setAuthMode('menu');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    {isVi ? 'Hủy' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length < 6}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs shadow-md hover:opacity-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{isVi ? 'Xác Nhận & Đăng Nhập' : 'Verify & Sign In'}</span>
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {isVi
                  ? 'Bảo mật tiêu chuẩn quốc tế Google Cloud & Firebase SSL.'
                  : 'Enterprise security powered by Google Cloud & Firebase.'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
