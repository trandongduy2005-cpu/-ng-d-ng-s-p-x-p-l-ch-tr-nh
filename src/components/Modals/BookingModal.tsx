import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Utensils, Car, Calendar, CheckCircle2, User, Phone, X, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BookingModal: React.FC = () => {
  const {
    isBookingModalOpen,
    setIsBookingModalOpen,
    bookingTarget,
    user,
    language,
    addBooking,
    addEvent,
  } = useApp();

  const isVi = language === 'vi';

  const place = bookingTarget?.place;
  const bookingType = bookingTarget?.type || 'homestay';

  const [contactName, setContactName] = useState(user.isLoggedIn ? user.name : '');
  const [contactPhone, setContactPhone] = useState(user.phone || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [guestCount, setGuestCount] = useState(2);
  const [vehicleType, setVehicleType] = useState('Xe máy tay ga (AirBlade/Vision)');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isBookingModalOpen || !place) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let details = '';
    if (bookingType === 'homestay') {
      details = `Phòng tiêu chuẩn cho ${guestCount} khách. Nhận phòng ngày ${date}. Ghi chú: ${specialNotes || 'Không có'}`;
    } else if (bookingType === 'table') {
      details = `Bàn cho ${guestCount} người lúc ${time} ngày ${date}. Ghi chú: ${specialNotes || 'Bàn gần cửa sổ'}`;
    } else {
      details = `Loại xe: ${vehicleType}. Đón lúc ${time} ngày ${date}. Điểm đến: ${place.name}. Ghi chú: ${specialNotes || 'Không có'}`;
    }

    addBooking({
      type: bookingType,
      placeName: place.name,
      placeAddress: place.address,
      date: `${date} ${time}`,
      details,
      guestCount,
      contactName,
      contactPhone,
      totalPrice: place.priceRange,
    });

    // Also offer auto-add to schedule
    addEvent({
      title: `${bookingType === 'homestay' ? 'Check-in ' : bookingType === 'table' ? 'Ăn uống tại ' : 'Đi xe đến '}${place.name}`,
      description: details,
      category: bookingType === 'table' ? 'routine' : 'personal',
      date,
      startTime: time,
      endTime: bookingType === 'table' ? '15:30' : '16:00',
      location: place.address,
      targetRole: 'all',
      color: '#EC4899',
    });

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#EC4899', '#10B981'],
    });

    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setIsBookingModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 overflow-hidden">
        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-800">
              {isVi ? 'Đặt Thành Công!' : 'Booking Confirmed!'}
            </h3>

            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              {isVi
                ? `Yêu cầu đặt ${bookingType === 'homestay' ? 'phòng homestay' : bookingType === 'table' ? 'bàn ăn' : 'phương tiện di chuyển'} tại "${place.name}" đã được xác nhận. Chúng tôi đã gửi xác nhận đến SĐT ${contactPhone} và tự động thêm vào Lịch Trình SmartPlanna của bạn!`
                : `Your reservation at "${place.name}" has been confirmed and synced to your schedule.`}
            </p>

            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs shadow-md hover:opacity-95 cursor-pointer"
            >
              {isVi ? 'Đóng & Xem Lịch Trình' : 'Close & View Schedule'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  {bookingType === 'homestay' ? (
                    <Home className="w-5 h-5" />
                  ) : bookingType === 'table' ? (
                    <Utensils className="w-5 h-5" />
                  ) : (
                    <Car className="w-5 h-5" />
                  )}
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base leading-snug">
                    {bookingType === 'homestay'
                      ? isVi
                        ? 'Hỗ Trợ Đặt Phòng Homestay'
                        : 'Book Homestay'
                      : bookingType === 'table'
                      ? isVi
                        ? 'Hỗ Trợ Đặt Bàn Nhà Hàng'
                        : 'Reserve Dining Table'
                      : isVi
                      ? 'Hỗ Trợ Đặt Phương Tiện Di Chuyển'
                      : 'Book Transport'}
                  </h3>
                  <p className="text-xs text-purple-700 font-semibold truncate max-w-xs">
                    {place.name}
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

            <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Họ và tên liên hệ *' : 'Contact Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isVi ? 'VD: Nguyễn Văn A' : 'Full Name'}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Số điện thoại gọi xác nhận *' : 'Phone *'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={isVi ? 'VD: 0912 345 678' : '0912 345 678'}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Ngày đặt *' : 'Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Khung giờ *' : 'Time *'}
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30"
                  />
                </div>
              </div>

              {bookingType !== 'transport' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Số lượng khách / Người đi cùng' : 'Number of Guests'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 font-bold text-purple-800"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Loại phương tiện mong muốn' : 'Vehicle Type'}
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30 font-medium"
                  >
                    <option value="Xe máy tay ga (AirBlade/Vision)">🛵 Xe máy tay ga (120k - 150k/ngày)</option>
                    <option value="Xe số tiết kiệm xăng (Wave/Sirius)">🛵 Xe máy số (100k/ngày)</option>
                    <option value="Taxi 4 chỗ công nghệ">🚖 Taxi 4 chỗ (Đưa đón tận nơi)</option>
                    <option value="Xe du lịch 7 chỗ">🚐 Xe du lịch 7 chỗ nhóm bạn</option>
                    <option value="Xe đưa đón sân bay">✈️ Xe đưa đón sân bay 2 chiều</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isVi ? 'Yêu cầu đặc biệt (Ghi chú)' : 'Special Notes'}
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    isVi
                      ? 'VD: Phòng tầng cao ngắm cảnh, ghế trẻ em, dị ứng hải sản...'
                      : 'Special requests...'
                  }
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-purple-50/30"
                />
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 flex items-start gap-2 text-xs text-purple-900">
                <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <p>
                  {isVi
                    ? 'Không yêu cầu thanh toán trước. Thông tin đặt chỗ sẽ được chuyển thẳng đến đối tác địa phương để giữ chỗ cho bạn.'
                    : 'No pre-payment required. Your reservation request will be reserved immediately.'}
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-purple-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold shadow-md hover:opacity-95 cursor-pointer"
                >
                  {isVi ? 'Xác Nhận Đặt Trước' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
