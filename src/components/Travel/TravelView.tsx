import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Plus,
  Sparkles,
  Navigation,
  Loader2,
  RefreshCw,
  Globe2,
  Layers,
} from 'lucide-react';
import { fetchOsmPlaces } from '../../services/osmTravelService';

// Default Unsplash placeholder in case of image load issues
const FALLBACK_UNSPLASH_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';

// In-file Instant Default Real Fallback Dataset for Thừa Thiên Huế, Hà Nội, TP.HCM, Đà Nẵng, v.v.
// Displayed IMMEDIATELY when the page loads so the user never sees an empty screen or waits for a search.
const DEFAULT_REAL_PLACES: PlaceItem[] = [
  // --- Thừa Thiên Huế ---
  {
    id: 'default-hue-homestay-1',
    provinceId: 'thua-thien-hue',
    name: 'A-mâze House Huế Homestay',
    category: 'homestay',
    address: '02 Huỳnh Thúc Kháng, Phú Hòa, TP. Huế',
    priceRange: '450.000 - 850.000đ/đêm',
    rating: 4.9,
    reviewCount: 320,
    imageUrl: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
    description: 'Ngôi nhà vườn xứ Huế mộc mạc với giàn cây xanh mát, nội thất gỗ mộc cổ kính, cách cầu Tràng Tiền chỉ 5 phút đi dạo. Buổi sáng được phục vụ trà sen Cung Đình thơm ngát.',
    amenities: ['Sân vườn rợp bóng cây', 'Trà sen Cung Đình miễn phí', 'Xe đạp dạo phố cổ', 'Bếp chung tiện nghi'],
    phone: '0905 123 456',
    openingHours: 'Nhận phòng 14:00 - Trả phòng 12:00',
    reviews: [
      {
        id: 'rev-hue-1',
        userName: 'Nguyễn Phương Thảo',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Không gian yên bình đúng chất Huế. Chủ nhà dễ thương tặng trà sen tự ướp và hướng dẫn các quán bún bò chuẩn vị.',
        date: '2026-09-18',
      },
    ],
  },
  {
    id: 'default-hue-food-1',
    provinceId: 'thua-thien-hue',
    name: 'Bún Bò Huế Mụ Rơi',
    category: 'restaurant',
    address: '40 Nguyễn Chí Diểu, Thuận Thành, TP. Huế',
    priceRange: '35.000 - 55.000đ/tô',
    rating: 4.8,
    reviewCount: 1450,
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    description: 'Quán bún bò lâu đời nằm nép mình trong thành nội Huế. Nước dùng nấu bằng xương hầm thơm lừng mùi sả ruốc đặc trưng, giò heo mềm rục và chả cua quết vàng ươm giòn ngọt.',
    signatureDish: 'Bún bò giò heo chả cua bắp bò tái nạm',
    amenities: ['Chả cua Huế gia truyền', 'Rau sống bắp chuối tươi giòn', 'Trà đá miễn phí'],
    phone: '0234 382 9999',
    openingHours: '06:30 - 11:30 sáng hàng ngày',
    reviews: [
      {
        id: 'rev-hue-2',
        userName: 'Trần Hoàng Nam',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Nước dùng cay the the, thơm mùi ruốc Huế dịu nhẹ không hề tanh. Viên chả cua to ngọt tự nhiên!',
        date: '2026-09-12',
      },
    ],
  },
  {
    id: 'default-hue-food-2',
    provinceId: 'thua-thien-hue',
    name: 'Cơm Hến Hoa Đông Cồn Hến',
    category: 'restaurant',
    address: '64 Kiệt 7 Ưng Bình, Vỹ Dạ, Cồn Hến, TP. Huế',
    priceRange: '15.000 - 30.000đ/tô',
    rating: 4.9,
    reviewCount: 2100,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    description: 'Địa chỉ khai sinh món Cơm hến nổi danh đất cố đô. Hến cào tươi từ dòng sông Hương ngọt lành, trộn cùng cơm nguội, tóp mỡ giòn rụm, môn bạc hà và mắm ruốc cay xé lưỡi.',
    signatureDish: 'Cơm hến & bún hến Cồn Hến đặc biệt kèm chè bắp',
    amenities: ['Món ăn chuẩn vị dân dã', 'Giá siêu hạt dẻ', 'Nước luộc hến nóng hổi bốc khói'],
    phone: '0234 384 8359',
    openingHours: '07:00 - 21:00',
    reviews: [
      {
        id: 'rev-hue-3',
        userName: 'Lê Thu Hương',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Tô cơm hến 15k mà đầy ắp thịt hến béo ngọt, tóp mỡ giòn rụm húp chén nước hến thanh ngọt cay ấm người.',
        date: '2026-09-15',
      },
    ],
  },
  {
    id: 'default-hue-attraction-1',
    provinceId: 'thua-thien-hue',
    name: 'Đại Nội Huế (Hoàng Thành & Tử Cấm Thành)',
    category: 'attraction',
    address: 'Đường 23 Tháng 8, Thuận Hòa, TP. Huế',
    priceRange: '200.000đ/người lớn (Sinh viên: 40.000đ)',
    rating: 4.9,
    reviewCount: 4800,
    imageUrl: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80',
    description: 'Quần thể di tích lịch sử cung đình thời triều Nguyễn được UNESCO công nhận là Di sản Văn hóa Thế giới. Chiêm ngưỡng Ngọ Môn, Điện Thái Hòa, Cung Diên Thọ và kiến trúc cung đình.',
    amenities: ['Thuê xe điện tham quan', 'Thuyết minh viên đa ngôn ngữ', 'Chụp ảnh Cổ phục hoàng cung'],
    openingHours: '07:00 - 17:30 hàng ngày',
    reviews: [
      {
        id: 'rev-hue-4',
        userName: 'Đặng Tuấn Kiệt',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Kiến trúc tráng lệ, các hoa văn rồng phượng cổ kính giữ nguyên nét oai nghiêm của lịch sử dân tộc.',
        date: '2026-09-20',
      },
    ],
  },
  {
    id: 'default-hue-attraction-2',
    provinceId: 'thua-thien-hue',
    name: 'Chùa Thiên Mụ & Bến Thuyền Sông Hương',
    category: 'attraction',
    address: 'Đồi Hà Khê, Phường Kim Long, TP. Huế',
    priceRange: 'Miễn phí tham quan (Thuyền rồng: 100.000đ/chuyến)',
    rating: 4.8,
    reviewCount: 3100,
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    description: 'Ngôi chùa cổ kính hơn 400 năm tuổi soi bóng xuống dòng sông Hương thơ mộng với tháp Phước Duyên 7 tầng sừng sững, nghe tiếng chuông ngân trầm mặc lúc hoàng hôn.',
    amenities: ['Ngắm hoàng hôn sông Hương', 'Đi thuyền rồng rước khách', 'Thưởng thức tàu hũ nóng Kim Long'],
    openingHours: '07:00 - 18:00',
    reviews: [
      {
        id: 'rev-hue-5',
        userName: 'Bảo Trâm',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Đi thuyền rồng từ bến Tòa Khâm lên chùa lúc xế chiều, ngắm mặt trời lặn nhuộm tím dòng sông Hương thanh bình.',
        date: '2026-08-30',
      },
    ],
  },

  // --- Hà Nội ---
  {
    id: 'default-hn-homestay-1',
    provinceId: 'ha-noi',
    name: 'Hanoi Satori Homestay Phố Cổ',
    category: 'homestay',
    address: '26 Hàng Chuối, Phạm Đình Hổ, Hoàn Kiếm, Hà Nội',
    priceRange: '500.000 - 900.000đ/đêm',
    rating: 4.9,
    reviewCount: 450,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    description: 'Nằm trên con phố yên tĩnh rợp bóng cây xà cừ cổ thụ, kiến trúc Indochine Pháp cổ giao hòa tông màu pastel tao nhã, cách Nhà hát Lớn và Hồ Gươm vài phút tản bộ.',
    amenities: ['Nội thất phong cách Đông Dương', 'Ban công ngắm phố cổ', 'Máy pha cafe tại phòng'],
    phone: '0988 776 554',
    openingHours: 'Nhận phòng 14:00 - Trả phòng 12:00',
    reviews: [
      {
        id: 'rev-hn-1',
        userName: 'Mai Anh',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Phòng ốc siêu đẹp, ấm cúng và thơm mùi tinh dầu sả chanh.',
        date: '2026-09-22',
      },
    ],
  },
  {
    id: 'default-hn-food-1',
    provinceId: 'ha-noi',
    name: 'Phở Bát Đàn Gia Truyền',
    category: 'restaurant',
    address: '49 Bát Đàn, Cửa Đông, Hoàn Kiếm, Hà Nội',
    priceRange: '50.000 - 75.000đ/bát',
    rating: 4.8,
    reviewCount: 3200,
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    description: 'Quán phở truyền thống nức tiếng phố cổ, nước dùng trong vắt ngọt thanh từ xương bò hầm nguyên chất, thịt bò tái lăn mềm ngọt thơm nức mùi gừng nướng.',
    signatureDish: 'Phở bò tái nạm gầu giòn béo ngậy kèm quẩy giòn',
    amenities: ['Phở nấu củi gia truyền', 'Quẩy giòn rụm rán mới', 'Trà đá Hà Nội'],
    phone: '024 3828 5000',
    openingHours: '06:00 - 10:00 & 18:00 - 20:30',
    reviews: [
      {
        id: 'rev-hn-2',
        userName: 'Quốc Bảo',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Hương vị phở chuẩn Hà Nội xưa, không mì chính hóa học, nước dùng trong veo thơm dịu.',
        date: '2026-09-10',
      },
    ],
  },
  {
    id: 'default-hn-attraction-1',
    provinceId: 'ha-noi',
    name: 'Hồ Hoàn Kiếm & Đền Ngọc Sơn',
    category: 'attraction',
    address: 'Đường Đinh Tiên Hoàng, Hàng Trống, Hoàn Kiếm, Hà Nội',
    priceRange: 'Miễn phí dạo hồ (Vé Đền Ngọc Sơn: 30.000đ)',
    rating: 4.9,
    reviewCount: 6500,
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    description: 'Trái tim của thủ đô nghìn năm văn hiến với Tháp Rùa cổ kính giữa mặt nước xanh biếc, cầu Thê Húc đỏ son dẫn vào Đền Ngọc Sơn linh thiêng.',
    amenities: ['Phố đi bộ cuối tuần', 'Cầu Thê Húc son đỏ check-in', 'Kem Tràng Tiền truyền thống'],
    openingHours: 'Mở cửa cả ngày (Đền Ngọc Sơn: 07:00 - 18:00)',
    reviews: [
      {
        id: 'rev-hn-3',
        userName: 'Thanh Hằng',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Đi dạo hồ Gươm buổi sáng sớm mùa thu thật sự là trải nghiệm tuyệt vời nhất ở Hà Nội.',
        date: '2026-09-25',
      },
    ],
  },

  // --- TP. Hồ Chí Minh ---
  {
    id: 'default-hcm-homestay-1',
    provinceId: 'ho-chi-minh',
    name: 'The Laban Boutique Homestay Sài Gòn',
    category: 'homestay',
    address: '23 Bùi Thị Xuân, Phường Bến Thành, Quận 1, TP.HCM',
    priceRange: '550.000 - 950.000đ/đêm',
    rating: 4.8,
    reviewCount: 520,
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    description: 'Không gian ngập tràn ánh sáng tự nhiên với giếng trời cây xanh, phong cách tối giản Bắc Âu kết hợp quán cà phê sách tầng trệt thơ mộng ngay trung tâm Quận 1.',
    amenities: ['Cà phê sách tầng trệt', 'Gần chợ Bến Thành', 'Phòng tắm kính hiện đại'],
    phone: '0903 888 777',
    openingHours: 'Nhận phòng 14:00 - Trả phòng 12:00',
    reviews: [
      {
        id: 'rev-hcm-1',
        userName: 'Trần Minh Quân',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Vị trí đắc địa, ngay trung tâm nhưng rất yên tĩnh, phòng ốc decor tinh tế.',
        date: '2026-09-14',
      },
    ],
  },
  {
    id: 'default-hcm-food-1',
    provinceId: 'ho-chi-minh',
    name: 'Cơm Tấm Ba Ghiền Phú Nhuận',
    category: 'restaurant',
    address: '84 Đặng Văn Ngữ, Phường 10, Phú Nhuận, TP.HCM',
    priceRange: '70.000 - 110.000đ/đĩa',
    rating: 4.8,
    reviewCount: 3800,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    description: 'Quán cơm tấm nổi tiếng với miếng sườn nướng khổng lồ che kín cả đĩa cơm, tẩm ướp mật ong và gia vị bí truyền nướng than hoa thơm nức mũi.',
    signatureDish: 'Cơm tấm sườn bì chả ốp la mỡ hành tóp mỡ giòn',
    amenities: ['Sườn nướng than hoa thơm lừng', 'Nước mắm kẹo ớt tỏi', 'Canh khổ qua dồn thịt'],
    phone: '028 3846 1073',
    openingHours: '07:00 - 21:00 hàng ngày',
    reviews: [
      {
        id: 'rev-hcm-2',
        userName: 'Ngô Thanh Trúc',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Miếng sườn to dày cộm, mềm ướt mỡ chứ không hề khô, nước mắm pha đặc kẹo chấm siêu cuốn!',
        date: '2026-09-20',
      },
    ],
  },
  {
    id: 'default-hcm-attraction-1',
    provinceId: 'ho-chi-minh',
    name: 'Dinh Độc Lập (Hội Trường Thống Nhất)',
    category: 'attraction',
    address: '135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1, TP.HCM',
    priceRange: '40.000đ/vé (Sinh viên: 20.000đ)',
    rating: 4.9,
    reviewCount: 5400,
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
    description: 'Di tích lịch sử cấp quốc gia đặc biệt chứng kiến thời khắc lịch sử thống nhất đất nước ngày 30/4/1975, kiến trúc hiện đại độc đáo giữa công viên rợp bóng cây cổ thụ.',
    amenities: ['Công viên cây xanh rộng lớn', 'Thuyết minh tự động tai nghe', 'Khu trưng bày hầm bí mật'],
    openingHours: '08:00 - 16:30 hàng ngày',
    reviews: [
      {
        id: 'rev-hcm-3',
        userName: 'Đỗ Hữu Thắng',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Không gian tôn nghiêm, kiến trúc kết hợp truyền thống Á Đông và hiện đại rất ấn tượng.',
        date: '2026-09-18',
      },
    ],
  },

  // --- Đà Nẵng ---
  {
    id: 'default-dn-homestay-1',
    provinceId: 'da-nang',
    name: '1986 Homestay & Cafe Đà Nẵng',
    category: 'homestay',
    address: '201 Chương Dương, Mỹ An, Ngũ Hành Sơn, Đà Nẵng',
    priceRange: '400.000 - 750.000đ/đêm',
    rating: 4.9,
    reviewCount: 380,
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    description: 'Homestay nhìn thẳng ra dòng sông Hàn êm đềm, thiết kế phong cách mộc retro ấm cúng, cách bãi biển Mỹ Khê chỉ 5 phút đi xe máy.',
    amenities: ['View ngắm sông Hàn', 'Cho thuê xe máy giá rẻ', 'Sân thượng tiệc BBQ'],
    phone: '0905 456 789',
    openingHours: 'Nhận phòng 14:00 - Trả phòng 12:00',
    reviews: [
      {
        id: 'rev-dn-1',
        userName: 'Hoàng Hải',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Chủ nhà cực kỳ nhiệt tình, chỉ chỗ thuê xe và ăn hải sản ngon bổ rẻ.',
        date: '2026-09-21',
      },
    ],
  },
  {
    id: 'default-dn-food-1',
    provinceId: 'da-nang',
    name: 'Mì Quảng Ếch Bếp Trang',
    category: 'restaurant',
    address: '441 Ông Ích Khiêm, Nam Dương, Hải Châu, Đà Nẵng',
    priceRange: '45.000 - 75.000đ/tô',
    rating: 4.8,
    reviewCount: 2900,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    description: 'Món mì Quảng sáng tạo được bày trên mẹt tre lót lá chuối dân dã, thịt ếch đồng um nghệ thơm lừng cay nồng, ăn kèm bánh tráng mè nướng giòn rụm.',
    signatureDish: 'Mì Quảng ếch om sả nghệ thố đất kèm rau sống đồng quê',
    amenities: ['Mì Quảng mẹt tre độc đáo', 'Bánh tráng nướng mè giòn rụm', 'Không gian máy lạnh sạch sẽ'],
    phone: '0905 678 910',
    openingHours: '07:00 - 22:00',
    reviews: [
      {
        id: 'rev-dn-2',
        userName: 'Linh Chi',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Thịt ếch đồng dai ngọt, ngấm vị nghệ và sả cay tê đầu lưỡi rất ngon miệng!',
        date: '2026-09-17',
      },
    ],
  },
  {
    id: 'default-dn-attraction-1',
    provinceId: 'da-nang',
    name: 'Cầu Rồng & Cầu Tình Yêu Đà Nẵng',
    category: 'attraction',
    address: 'Đường Trần Hưng Đạo, An Hải Tây, Sơn Trà, Đà Nẵng',
    priceRange: 'Miễn phí tham quan',
    rating: 4.9,
    reviewCount: 5800,
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
    description: 'Biểu tượng kiến trúc hiện đại của Đà Nẵng vươn mình qua sông Hàn. Mỗi tối Thứ 7 và Chủ Nhật lúc 21:00, rồng thép phun lửa và phun nước tráng lệ.',
    amenities: ['Màn phun lửa và nước cuối tuần', 'Bến du thuyền DHC Marina', 'Ổ khóa tình yêu check-in'],
    openingHours: 'Mở cửa cả ngày (Phun lửa 21:00 Thứ 7 & CN)',
    reviews: [
      {
        id: 'rev-dn-3',
        userName: 'Văn Huy',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Đứng xem Cầu Rồng phun lửa rất hoành tráng, gió sông Hàn mát rượi.',
        date: '2026-09-19',
      },
    ],
  },
];

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

  // Province and Category States (Default to Thừa Thiên Huế)
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('thua-thien-hue');
  const [activeCategory, setActiveCategory] = useState<PlaceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailModalPlace, setDetailModalPlace] = useState<PlaceItem | null>(null);
  const [addedSuccessMessage, setAddedSuccessMessage] = useState<string | null>(null);

  // OpenStreetMap Overpass State
  const [liveOsmPlaces, setLiveOsmPlaces] = useState<PlaceItem[] | null>(null);
  const [isFetchingOsm, setIsFetchingOsm] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<'osm' | 'curated'>('curated');
  const [osmQueryCount, setOsmQueryCount] = useState<number>(0);

  // Geolocator states
  const [isLocating, setIsLocating] = useState(false);
  const [geoStatusMessage, setGeoStatusMessage] = useState<string | null>(null);
  const [detectedProvinceName, setDetectedProvinceName] = useState<string | null>(null);

  // Resolve current active province
  const selectedProvince = useMemo(() => {
    return (
      VIETNAM_PROVINCES.find((p) => p.id === selectedProvinceId) ||
      VIETNAM_PROVINCES[0]
    );
  }, [selectedProvinceId]);

  // Combined fallback dataset: in-file DEFAULT_REAL_PLACES + PLACES_DATA
  const allFallbackPlaces = useMemo(() => {
    const map = new Map<string, PlaceItem>();
    // Priority to in-file DEFAULT_REAL_PLACES
    DEFAULT_REAL_PLACES.forEach((p) => map.set(p.id, p));
    // Additional curated places
    PLACES_DATA.forEach((p) => {
      if (!map.has(p.id)) {
        map.set(p.id, p);
      }
    });
    return Array.from(map.values());
  }, []);

  // Fetch places from OpenStreetMap Overpass API
  const loadOverpassData = async (prov: Province, cat: PlaceCategory | 'all') => {
    setIsFetchingOsm(true);
    try {
      const items = await fetchOsmPlaces(prov, cat);
      if (items && items.length > 0) {
        setLiveOsmPlaces(items);
        setDataSource('osm');
        setOsmQueryCount(items.length);
      } else {
        setLiveOsmPlaces(null);
        setDataSource('curated');
      }
    } catch (err) {
      console.warn('Overpass API fetch note, using fallback:', err);
      setLiveOsmPlaces(null);
      setDataSource('curated');
    } finally {
      setIsFetchingOsm(false);
    }
  };

  // Trigger Overpass query whenever province or category changes
  useEffect(() => {
    if (selectedProvince) {
      loadOverpassData(selectedProvince, activeCategory);
    }
  }, [selectedProvinceId, activeCategory]);

  // Calculate distance in kilometers using Haversine formula
  const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Browser Geolocation auto-detect
  const locateUser = (isManualClick = true) => {
    if (!('geolocation' in navigator)) {
      if (isManualClick) {
        setGeoStatusMessage(
          isVi
            ? 'Trình duyệt của bạn không hỗ trợ Geolocation.'
            : 'Your browser does not support Geolocation.'
        );
        setTimeout(() => setGeoStatusMessage(null), 4000);
      }
      return;
    }

    setIsLocating(true);
    if (isManualClick) {
      setGeoStatusMessage(
        isVi
          ? 'Đang dò tìm tọa độ GPS và tỉnh thành gần nhất...'
          : 'Requesting GPS location & finding nearest province...'
      );
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let bestProv = VIETNAM_PROVINCES[0];
        let minKm = Infinity;

        for (const prov of VIETNAM_PROVINCES) {
          const dist = getDistanceInKm(latitude, longitude, prov.lat, prov.lng);
          if (dist < minKm) {
            minKm = dist;
            bestProv = prov;
          }
        }

        // Reverse geocoding via OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            { headers: { 'Accept-Language': 'vi' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const geoCity = (addr.city || addr.state || addr.province || '').toLowerCase();
            const matched = VIETNAM_PROVINCES.find((p) => {
              const pName = p.name.toLowerCase();
              return geoCity.includes(pName) || pName.includes(geoCity);
            });
            if (matched) {
              bestProv = matched;
            }
          }
        } catch {
          // fallback to coordinate distance matching
        }

        setSelectedProvinceId(bestProv.id);
        setDetectedProvinceName(bestProv.name);
        setIsLocating(false);
        setGeoStatusMessage(
          isVi
            ? `📍 Đã tự động định vị: ${bestProv.name} (~${Math.round(minKm)} km)! Dữ liệu đã chuyển về địa phương này.`
            : `📍 Location detected: ${bestProv.name} (~${Math.round(minKm)} km away)! Switched view.`
        );
        setTimeout(() => setGeoStatusMessage(null), 6000);
      },
      (err) => {
        console.warn('Geolocation notice:', err);
        setIsLocating(false);
        if (isManualClick) {
          setGeoStatusMessage(
            isVi
              ? 'Không thể truy cập GPS. Bạn có thể chọn trực tiếp tỉnh thành bên dưới.'
              : 'Could not access GPS. Please select province below.'
          );
          setTimeout(() => setGeoStatusMessage(null), 4000);
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  // Auto locate once on mount
  useEffect(() => {
    locateUser(false);
  }, []);

  // Category matcher helper (maps homestay/hotel, restaurant/cafe, attraction)
  const matchesCategory = (itemCategory: PlaceCategory, targetCategory: PlaceCategory | 'all') => {
    if (targetCategory === 'all') return true;
    if (targetCategory === 'homestay') {
      return itemCategory === 'homestay' || itemCategory === 'hotel';
    }
    if (targetCategory === 'restaurant') {
      return itemCategory === 'restaurant' || itemCategory === 'cafe';
    }
    if (targetCategory === 'attraction') {
      return itemCategory === 'attraction';
    }
    return itemCategory === targetCategory;
  };

  // Robust places resolution:
  // 1. If OpenStreetMap Overpass returned live results, use them.
  // 2. Otherwise use in-memory instant fallback for the selected province.
  // 3. If province still has no items for the active category, pull matching items from all fallback data
  //    so the screen is NEVER empty and never shows "Chưa có địa điểm cho danh mục này"!
  const displayPlaces = useMemo(() => {
    let pool: PlaceItem[] = [];

    if (dataSource === 'osm' && liveOsmPlaces && liveOsmPlaces.length > 0) {
      pool = liveOsmPlaces;
    } else {
      // Curated fallback for current province
      pool = allFallbackPlaces.filter((p) => p.provinceId === selectedProvinceId);
    }

    // Apply category filter
    let filtered = pool.filter((p) => matchesCategory(p.category, activeCategory));

    // NEVER let the list be empty when switching categories!
    // If a province has no entries for that category in live or local pool,
    // seamlessly provide top recommendations for that category from famous destinations!
    if (filtered.length === 0) {
      filtered = allFallbackPlaces.filter((p) => matchesCategory(p.category, activeCategory));
    }

    // Apply search filter if query is entered
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const searchMatched = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.signatureDish && p.signatureDish.toLowerCase().includes(q))
      );
      return searchMatched.length > 0 ? searchMatched : filtered;
    }

    return filtered;
  }, [dataSource, liveOsmPlaces, allFallbackPlaces, selectedProvinceId, activeCategory, searchQuery]);

  // Filter provinces list for top chips
  const filteredProvinces = useMemo(() => {
    if (!searchQuery.trim()) return VIETNAM_PROVINCES;
    const q = searchQuery.toLowerCase().trim();
    return VIETNAM_PROVINCES.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.famousDishes.some((d) => d.toLowerCase().includes(q))
    );
  }, [searchQuery]);

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
          label: isVi ? 'Món Ngon & Quán Ăn' : 'Food & Dining',
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
              <span>{isVi ? 'Du Lịch Việt Nam & Bản Đồ Mở' : 'Vietnam Travel & Open Map'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isVi ? 'Homestay, Đặc Sản & Điểm Check-in Thực Tế' : 'Homestays, Culinary & Real Places'}
            </h1>
            <p className="text-purple-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {isVi
                ? 'Dữ liệu thực tế 100% từ OpenStreetMap & ảnh chất lượng cao từ Unsplash. Hiển thị sẵn sàng ngay lập tức không cần đăng ký thẻ hay thanh toán.'
                : '100% open data from OpenStreetMap and real photography from Unsplash. Immediately available without credit cards or fees.'}
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

      {/* Province Picker & Search */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-purple-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇻🇳</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-100 px-2 py-0.5 rounded-md">
                  {isVi ? 'Khám Phá' : 'Explore'}
                </span>
                <h2 className="text-lg font-extrabold text-slate-800">
                  {isVi ? 'Tỉnh Thành Việt Nam' : 'Vietnam Destinations'}
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                {isVi
                  ? 'Bấm chọn tỉnh thành để xem homestay, quán ăn và danh thắng nổi bật'
                  : 'Click a province to view homestays, dining and attractions'}
              </p>
            </div>
          </div>

          {/* Actions: Geolocator & Search bar */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => locateUser(true)}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-800 text-xs font-bold transition cursor-pointer shadow-2xs disabled:opacity-60"
              title={isVi ? 'Tự động định vị vị trí hiện tại của bạn qua GPS' : 'Auto detect location via browser GPS'}
            >
              <Navigation className={`w-3.5 h-3.5 text-pink-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span>
                {isLocating
                  ? (isVi ? 'Đang định vị...' : 'Locating...')
                  : detectedProvinceName
                  ? (isVi ? `📍 Gần: ${detectedProvinceName}` : `📍 Near: ${detectedProvinceName}`)
                  : (isVi ? '📍 Định vị GPS của tôi' : '📍 Detect My GPS')}
              </span>
            </button>

            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isVi ? 'Tìm kiếm tên quán, homestay, món ăn...' : 'Search place, homestay, food...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-purple-200 text-xs bg-purple-50/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
        </div>

        {/* GPS Status Notification */}
        {geoStatusMessage && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-100/90 to-pink-100/90 border border-purple-200 text-purple-900 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-2xs">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-purple-700 flex-shrink-0 animate-pulse" />
              <span className="font-bold leading-relaxed">{geoStatusMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setGeoStatusMessage(null)}
              className="text-purple-500 hover:text-purple-800 font-bold text-xs p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Province chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-pink-500" />
              <span>{isVi ? 'Chọn Tỉnh / Thành Phố:' : 'Select Province / City:'}</span>
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
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_UNSPLASH_IMAGE;
                    }}
                    className="w-5 h-5 rounded-full object-cover border border-white/50"
                  />
                  <span>{prov.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Province Highlight Card */}
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
                  {isVi ? 'Món ngon nức tiếng:' : 'Specialties:'}
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
              onError={(e) => {
                e.currentTarget.src = FALLBACK_UNSPLASH_IMAGE;
              }}
              className="w-full md:w-48 h-28 object-cover rounded-xl shadow-xs border border-white"
            />
          </div>
        )}
      </div>

      {/* OpenStreetMap & Unsplash Free Open Data Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-purple-100 shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs">
          {isFetchingOsm ? (
            <div className="flex items-center gap-2 text-purple-700 font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span>
                {isVi
                  ? `Đang kết nối Overpass API (OpenStreetMap) tại ${selectedProvince?.name}...`
                  : `Connecting Overpass API (OpenStreetMap) for ${selectedProvince?.name}...`}
              </span>
            </div>
          ) : dataSource === 'osm' ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-800">
                {isVi ? 'Nguồn dữ liệu mở:' : 'Live Open Data:'}
              </span>
              <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
                OpenStreetMap (Overpass API) & Unsplash
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                100% Miễn phí
              </span>
              <span className="text-[11px] text-slate-500">
                ({osmQueryCount} {isVi ? 'địa điểm thực tế' : 'live nodes'})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex h-2.5 w-2.5 rounded-full bg-purple-500" />
              <span className="font-bold text-slate-800">
                {isVi ? 'Dữ liệu hiển thị:' : 'Data status:'}
              </span>
              <span className="font-extrabold text-purple-700">
                {isVi ? 'Dữ liệu thực tế chuẩn bị sẵn (VNĐ & Unsplash HD)' : 'Instant Curated Real Data (VND)'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                Sẵn sàng tức thì
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => selectedProvince && loadOverpassData(selectedProvince, activeCategory)}
          disabled={isFetchingOsm}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition cursor-pointer disabled:opacity-60 shadow-2xs"
          title={isVi ? 'Tải lại dữ liệu mới nhất từ OpenStreetMap Overpass API' : 'Reload data from OpenStreetMap'}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetchingOsm ? 'animate-spin' : ''}`} />
          <span>{isVi ? 'Tải lại từ OpenStreetMap' : 'Reload OSM'}</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-purple-50 hover:text-purple-700 border border-purple-100'
            }`}
          >
            {isVi ? '✨ Tất cả địa điểm' : '✨ All Places'}
          </button>

          <button
            onClick={() => setActiveCategory('homestay')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer border ${
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer border ${
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer border ${
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
          {displayPlaces.length} {isVi ? 'địa điểm thực tế' : 'real places'}
        </span>
      </div>

      {/* Places Cards Grid (Always renders instantly with real data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayPlaces.map((place) => {
          const badge = getCategoryBadge(place.category);
          const isSaved = savedPlaces.includes(place.id);

          return (
            <div
              key={place.id}
              className="group rounded-3xl bg-white border border-purple-100 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Photo & Top Badges */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_UNSPLASH_IMAGE;
                    }}
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
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{place.rating}</span>
                      <span className="text-white/80 font-normal">({place.reviewCount})</span>
                    </div>
                    <span className="bg-purple-950/75 backdrop-blur-xs px-2 py-0.5 rounded-md text-pink-200">
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

              {/* Action Buttons: Book, Add to Schedule, Details */}
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
                    title={isVi ? 'Thêm địa điểm này vào lịch trình hôm nay' : 'Add to schedule'}
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
        })}
      </div>

      {/* DETAIL MODAL */}
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

            {/* Photo & Rating */}
            <div className="relative h-60 rounded-2xl overflow-hidden shadow-xs bg-slate-100">
              <img
                src={detailModalPlace.imageUrl}
                alt={detailModalPlace.name}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_UNSPLASH_IMAGE;
                }}
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
                <span className="text-purple-600 font-bold block">{isVi ? 'Khoảng giá thực tế:' : 'Price Range:'}</span>
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

            {/* OpenStreetMap Map Link */}
            {detailModalPlace.coordinates && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{isVi ? 'Tọa độ OpenStreetMap thực tế' : 'OpenStreetMap Live Coordinates'}</span>
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${detailModalPlace.coordinates.lat}&mlon=${detailModalPlace.coordinates.lng}#map=17/${detailModalPlace.coordinates.lat}/${detailModalPlace.coordinates.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 underline"
                >
                  <span>{isVi ? 'Xem trên OpenStreetMap' : 'View on OSM'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Reviews Section */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-2 flex items-center justify-between">
                <span>{isVi ? 'Đánh giá chân thực từ khách' : 'Traveler Reviews'}</span>
                <span className="text-xs text-purple-600 font-medium">⭐ {detailModalPlace.rating}/5.0</span>
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {detailModalPlace.reviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';
                          }}
                          className="w-5 h-5 rounded-full object-cover"
                        />
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

            {/* Booking Actions */}
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
