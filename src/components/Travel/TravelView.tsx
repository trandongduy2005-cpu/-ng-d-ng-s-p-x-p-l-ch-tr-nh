import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VIETNAM_PROVINCES, PLACES_DATA } from '../../data/vietnamProvinces';
import { Province, PlaceItem, PlaceCategory } from '../../types';
import {
  MapPin,
  Compass,
  Star,
  Home,
  Utensils,
  Car,
  Calendar,
  Search,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  ExternalLink,
  Plus,
  Phone,
  Clock,
  Sparkles,
  Award,
  ArrowLeft,
} from 'lucide-react';

export const TravelView: React.FC = () => {
  const {
    language,
    savedPlaces,
    toggleSavePlace,
    openBookingModal,
    addEvent,
    setIsAIAssistantOpen,
  } = useApp();

  const isVi = language === 'vi';

  // State: Level navigation
  // 'country' -> 'provinces_list' -> 'province_detail'
  const [selectedCountry, setSelectedCountry] = useState<string>('vietnam');
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>('lam-dong');
  const [activeCategory, setActiveCategory] = useState<PlaceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailModalPlace, setDetailModalPlace] = useState<PlaceItem | null>(null);
  const [addedSuccessMessage, setAddedSuccessMessage] = useState<string | null>(null);

  const selectedProvince = VIETNAM_PROVINCES.find((p) => p.id === selectedProvinceId);

  // Filter provinces by search
  const filteredProvinces = VIETNAM_PROVINCES.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.famousDishes.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter places for selected province
  const placesForProvince = PLACES_DATA.filter((place) => {
    if (selectedProvinceId && place.provinceId !== selectedProvinceId) return false;
    if (activeCategory !== 'all' && place.category !== activeCategory) return false;
    return true;
  });

  // Add place to schedule
  const handleAddToSchedule = (place: PlaceItem) => {
    const today = new Date().toISOString().split('T')[0];
    addEvent({
      title: `${place.category === 'homestay' ? 'Check-in ' : place.category === 'restaurant' ? 'Thưởng thức ẩm thực tại ' : 'Tham quan '}${place.name}`,
      description: `Địa chỉ: ${place.address}. Khoảng giá: ${place.priceRange}. ${place.description}`,
      category: place.category === 'restaurant' ? 'routine' : 'personal',
      date: today,
      startTime: place.category === 'restaurant' ? '12:00' : '14:30',
      endTime: place.category === 'restaurant' ? '13:30' : '16:30',
      location: place.address,
      targetRole: 'all',
      color: '#EC4899',
    });

    setAddedSuccessMessage(
      isVi
        ? `Đã thêm "${place.name}" vào lịch trình hôm nay!`
        : `Added "${place.name}" to today's schedule!`
    );
    setTimeout(() => setAddedSuccessMessage(null), 4000);
  };

  const getCategoryBadge = (cat: PlaceCategory) => {
    switch (cat) {
      case 'homestay':
      case 'hotel':
        return {
          icon: <Home className="w-3.5 h-3.5 text-purple-600" />,
          label: isVi ? 'Homestay & Lưu Trú' : 'Homestay & Stay',
          bg: 'bg-purple-100 text-purple-700',
        };
      case 'restaurant':
      case 'cafe':
        return {
          icon: <Utensils className="w-3.5 h-3.5 text-pink-600" />,
          label: isVi ? 'Món Ngon & Quán Ăn' : 'Dining & Food',
          bg: 'bg-pink-100 text-pink-700',
        };
      case 'attraction':
      default:
        return {
          icon: <Compass className="w-3.5 h-3.5 text-emerald-600" />,
          label: isVi ? 'Điểm Tham Quan & Check-in' : 'Attraction',
          bg: 'bg-emerald-100 text-emerald-700',
        };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {addedSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{addedSuccessMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-500 p-6 sm:p-8 text-white shadow-xl shadow-purple-500/15">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-pink-100">
              <Compass className="w-3.5 h-3.5" />
              <span>{isVi ? 'Hỗ Trợ Du Lịch & Khám Phá' : 'Travel & Local Exploration'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isVi ? 'Gợi Ý Homestay, Ẩm Thực & Đặt Trước Địa Điểm' : 'Homestays, Culinary & Place Bookings'}
            </h1>
            <p className="text-purple-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {isVi
                ? 'Tìm kiếm homestay xinh đẹp, thưởng thức đặc sản trứ danh, lên lịch trình tham quan và hỗ trợ đặt phòng, đặt bàn, đặt phương tiện di chuyển nhanh chóng.'
                : 'Explore cozy homestays, famous regional dishes, check-in spots, and easily book stays, dining tables, and transport.'}
            </p>
          </div>

          <button
            onClick={() => setIsAIAssistantOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs sm:text-sm transition cursor-pointer border border-white/30"
          >
            <Sparkles className="w-4 h-4 text-pink-200" />
            <span>{isVi ? 'Gợi ý lịch trình với AI' : 'AI Itinerary Guide'}</span>
          </button>
        </div>
      </div>

      {/* 2-Level Hierarchical Navigation (MỤC LỚN & MỤC NHỎ) */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs space-y-4">
        {/* MỤC LỚN: QUỐC GIA VIỆT NAM */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-purple-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇻🇳</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-100 px-2 py-0.5 rounded-md">
                  {isVi ? 'Mục Lớn: Quốc Gia' : 'Country'}
                </span>
                <h2 className="text-lg font-extrabold text-slate-800">
                  Việt Nam
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                {isVi
                  ? 'Chọn tỉnh thành bên dưới để khám phá homestay, nhà hàng & địa điểm phù hợp lịch trình'
                  : 'Select a province below to explore homestays, cuisine & itinerary recommendations'}
              </p>
            </div>
          </div>

          {/* Search bar for provinces */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isVi ? 'Tìm tỉnh thành, món ngon...' : 'Search province or dish...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-purple-200 text-xs bg-purple-50/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>

        {/* MỤC NHỎ: DANH SÁCH TẤT CẢ CÁC TỈNH THÀNH (HORIZONTAL SCROLL OR CHIPS) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-pink-500" />
              <span>{isVi ? 'Mục Nhỏ: Tỉnh Thành Việt Nam' : 'Provinces & Cities'}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {filteredProvinces.length} {isVi ? 'tỉnh thành' : 'provinces'}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {filteredProvinces.map((prov) => {
              const isSelected = selectedProvinceId === prov.id;
              return (
                <button
                  key={prov.id}
                  onClick={() => setSelectedProvinceId(prov.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl whitespace-nowrap text-xs font-bold transition cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-transparent shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-purple-50 hover:text-purple-700 border-purple-100'
                  }`}
                >
                  <img
                    src={prov.imageUrl}
                    alt={prov.name}
                    className="w-5 h-5 rounded-full object-cover border border-white/50"
                  />
                  <span>{prov.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Highlight Banner of the Selected Province */}
        {selectedProvince && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border border-purple-200/80 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-700 px-2 py-0.5 rounded-full bg-white border border-purple-200">
                  {isVi ? 'Miền ' : 'Region: '}
                  {selectedProvince.region}
                </span>
                <span className="text-xs text-slate-500">
                  {isVi ? 'Thời điểm lý tưởng: ' : 'Best season: '}
                  <strong className="text-slate-700">{selectedProvince.bestSeasons}</strong>
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-800">
                {selectedProvince.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedProvince.description}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-purple-900">
                  {isVi ? 'Đặc sản nức tiếng:' : 'Famous dishes:'}
                </span>
                {selectedProvince.famousDishes.map((dish, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-purple-100"
                  >
                    🍴 {dish}
                  </span>
                ))}
              </div>
            </div>

            <img
              src={selectedProvince.imageUrl}
              alt={selectedProvince.name}
              className="w-full md:w-48 h-28 object-cover rounded-xl shadow-xs border border-white"
            />
          </div>
        )}
      </div>

      {/* Category Filter Tabs for Places */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-full font-bold transition cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-purple-50 hover:text-purple-700 border border-purple-100'
            }`}
          >
            {isVi ? '✨ Tất cả địa điểm' : '✨ All Places'}
          </button>

          <button
            onClick={() => setActiveCategory('homestay')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition cursor-pointer border ${
              activeCategory === 'homestay'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{isVi ? 'Homestay & Nơi lưu trú' : 'Homestays & Stays'}</span>
          </button>

          <button
            onClick={() => setActiveCategory('restaurant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition cursor-pointer border ${
              activeCategory === 'restaurant'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-white text-pink-700 border-pink-200 hover:bg-pink-50'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>{isVi ? 'Món ăn & Nhà hàng' : 'Food & Restaurants'}</span>
          </button>

          <button
            onClick={() => setActiveCategory('attraction')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition cursor-pointer border ${
              activeCategory === 'attraction'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isVi ? 'Địa điểm tham quan & Check-in' : 'Attractions & Check-in'}</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          {placesForProvince.length} {isVi ? 'gợi ý hấp dẫn' : 'recommendations'}
        </span>
      </div>

      {/* Places Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {placesForProvince.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-10 text-center border border-dashed border-purple-200">
            <Compass className="w-10 h-10 text-purple-400 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">
              {isVi
                ? 'Chưa có địa điểm cho danh mục này tại tỉnh thành đã chọn.'
                : 'No places found in this category for the selected province.'}
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-3 px-4 py-1.5 rounded-xl bg-purple-100 text-purple-700 text-xs font-bold hover:bg-purple-200 cursor-pointer"
            >
              {isVi ? 'Xem tất cả địa điểm' : 'View All Places'}
            </button>
          </div>
        ) : (
          placesForProvince.map((place) => {
            const badge = getCategoryBadge(place.category);
            const isSaved = savedPlaces.includes(place.id);

            return (
              <div
                key={place.id}
                className="group rounded-3xl bg-white border border-purple-100 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo & Top Badges */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={place.imageUrl}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${badge.bg}`}
                      >
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    {/* Bookmark Wishlist button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSavePlace(place.id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/85 hover:bg-white text-slate-700 shadow-sm transition cursor-pointer"
                      title={isSaved ? (isVi ? 'Đã lưu' : 'Saved') : (isVi ? 'Lưu địa điểm' : 'Save place')}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-pink-600 fill-pink-100" />
                      ) : (
                        <Bookmark className="w-4 h-4 text-slate-500" />
                      )}
                    </button>

                    {/* Rating & Price bar */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{place.rating}</span>
                        <span className="text-white/80 font-normal">({place.reviewCount})</span>
                      </div>
                      <span className="bg-purple-950/70 backdrop-blur-xs px-2 py-0.5 rounded-md text-pink-200">
                        {place.priceRange}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h3
                      onClick={() => setDetailModalPlace(place)}
                      className="font-extrabold text-slate-800 text-base leading-snug hover:text-purple-600 transition cursor-pointer line-clamp-1"
                    >
                      {place.name}
                    </h3>

                    <p className="flex items-start gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-pink-500 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{place.address}</span>
                    </p>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {place.description}
                    </p>

                    {place.signatureDish && (
                      <div className="p-2 rounded-xl bg-pink-50/80 border border-pink-100 text-xs">
                        <span className="font-bold text-pink-800">
                          {isVi ? 'Món đặc trưng: ' : 'Specialty: '}
                        </span>
                        <span className="text-pink-700 font-medium">{place.signatureDish}</span>
                      </div>
                    )}

                    {/* Amenities tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {place.amenities.slice(0, 3).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700"
                        >
                          ✓ {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons (Book & View details) */}
                <div className="p-4 pt-2 border-t border-purple-50 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {place.category === 'homestay' || place.category === 'hotel' ? (
                      <button
                        onClick={() => openBookingModal(place, 'homestay')}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs shadow-xs hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Home className="w-3.5 h-3.5" />
                        <span>{isVi ? 'Đặt Phòng' : 'Book Stay'}</span>
                      </button>
                    ) : place.category === 'restaurant' ? (
                      <button
                        onClick={() => openBookingModal(place, 'table')}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs shadow-xs hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Utensils className="w-3.5 h-3.5" />
                        <span>{isVi ? 'Đặt Bàn' : 'Reserve Table'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => openBookingModal(place, 'transport')}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs shadow-xs hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>{isVi ? 'Đặt Xe Đến Đây' : 'Book Ride'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleAddToSchedule(place)}
                      title={isVi ? 'Thêm vào lịch trình hôm nay' : 'Add to schedule'}
                      className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDetailModalPlace(place)}
                      className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      {isVi ? 'Chi tiết' : 'Details'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAILED MODAL FOR PLACE */}
      {detailModalPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-purple-100 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  {detailModalPlace.category === 'homestay' ? (
                    <Home className="w-5 h-5" />
                  ) : detailModalPlace.category === 'restaurant' ? (
                    <Utensils className="w-5 h-5" />
                  ) : (
                    <Compass className="w-5 h-5" />
                  )}
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-800">
                    {detailModalPlace.name}
                  </h2>
                  <p className="text-xs text-slate-500">{detailModalPlace.address}</p>
                </div>
              </div>

              <button
                onClick={() => setDetailModalPlace(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Photo & Quick Info */}
            <div className="relative h-60 rounded-2xl overflow-hidden shadow-xs">
              <img
                src={detailModalPlace.imageUrl}
                alt={detailModalPlace.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs flex items-center gap-2 font-bold">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{detailModalPlace.rating}</span>
                <span className="font-normal text-white/80">({detailModalPlace.reviewCount} đánh giá từ du khách)</span>
              </div>
            </div>

            {/* Pricing & Hours */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                <span className="text-purple-600 font-bold block">{isVi ? 'Khoảng giá tham khảo:' : 'Price Range:'}</span>
                <span className="text-sm font-extrabold text-purple-900">{detailModalPlace.priceRange}</span>
              </div>
              <div className="p-3 rounded-xl bg-pink-50 border border-pink-100">
                <span className="text-pink-600 font-bold block">{isVi ? 'Giờ mở cửa / Nhận phòng:' : 'Operating hours:'}</span>
                <span className="text-sm font-bold text-pink-900">{detailModalPlace.openingHours || '08:00 - 22:00'}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-1">
                {isVi ? 'Giới thiệu chi tiết' : 'Overview & Features'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {detailModalPlace.description}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs mb-2">
                {isVi ? 'Tiện nghi & Dịch vụ nổi bật' : 'Amenities & Services'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {detailModalPlace.amenities.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-100"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-2 flex items-center justify-between">
                <span>{isVi ? 'Đánh giá chân thực từ du khách' : 'Traveler Reviews'}</span>
                <span className="text-xs text-purple-600 font-medium">⭐ {detailModalPlace.rating}/5.0</span>
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {detailModalPlace.reviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={rev.userAvatar} alt={rev.userName} className="w-5 h-5 rounded-full object-cover" />
                        <span className="font-bold text-slate-800">{rev.userName}</span>
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block">{rev.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3 Booking Actions */}
            <div className="pt-3 border-t border-purple-100 flex flex-wrap items-center justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  handleAddToSchedule(detailModalPlace);
                  setDetailModalPlace(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-purple-100 text-purple-800 font-bold hover:bg-purple-200 cursor-pointer"
              >
                + {isVi ? 'Thêm vào Lịch Trình' : 'Add to Schedule'}
              </button>

              <button
                onClick={() => {
                  openBookingModal(detailModalPlace, 'transport');
                  setDetailModalPlace(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-pink-100 text-pink-800 font-bold hover:bg-pink-200 cursor-pointer flex items-center gap-1.5"
              >
                <Car className="w-3.5 h-3.5" />
                <span>{isVi ? 'Đặt xe di chuyển' : 'Book Transport'}</span>
              </button>

              {detailModalPlace.category === 'restaurant' ? (
                <button
                  onClick={() => {
                    openBookingModal(detailModalPlace, 'table');
                    setDetailModalPlace(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold shadow-md hover:opacity-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Đặt Bàn Ngay' : 'Reserve Table'}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    openBookingModal(detailModalPlace, 'homestay');
                    setDetailModalPlace(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold shadow-md hover:opacity-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Đặt Phòng / Homestay' : 'Book Stay'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
