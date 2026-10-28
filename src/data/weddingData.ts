import { WeddingInfo, GuestWish } from '../types';
import { getActiveImages } from './mediaConfig';

export const initialWeddingInfo: WeddingInfo = {
  groomName: 'Huỳnh Lê Ngọc Phú',
  groomTitle: 'Trưởng Nam',
  groomFather: 'Huỳnh Thanh Toàn',
  groomMother: 'Lê Thị Như Hà',
  groomHometown: 'TP.HCM',
  groomPhone: '0903 123 456',
  groomBank: {
    bankName: 'Vietcombank',
    accountNumber: '1023456789',
    accountHolder: 'HUYNH LE NGOC PHU',
  },

  brideName: 'Huỳnh Thị Thu Thi',
  brideTitle: 'Thứ Nữ',
  brideFather: 'Huỳnh Lượm',
  brideMother: 'Lê Thị Liếu',
  brideHometown: 'Tỉnh Đắk Lắk',
  bridePhone: '0908 987 654',
  brideBank: {
    bankName: 'MB Bank',
    accountNumber: '8888999966',
    accountHolder: 'HUYNH THI THU THI',
  },

  weddingDate: '2026-12-19',
  weddingTime: '18:00',
  weddingDayOfWeek: 'Thứ Bảy',
  lunarDate: 'Nhằm ngày 11 tháng 11 năm Bính Ngọ',

  ceremonyVenue: {
    title: 'HÔN LỄ CỬ HÀNH TẠI TƯ GIA',
    name: 'Lễ Thành Hôn Tại Tư Gia',
    address: 'Cử hành nghi lễ gia tiên tại tư gia - TP. Hồ Chí Minh',
    time: '10H00 – Thứ Bảy',
    date: '19 | 12 | 2026 (Nhằm ngày 11 tháng 11 năm Bính Ngọ)',
    mapUrl: 'https://maps.google.com/?q=TP+Ho+Chi+Minh',
  },

  receptionVenue: {
    title: 'TIỆC CƯỚI CHÍNH',
    name: 'Trung Tâm Hội Nghị Tiệc Cưới Asiana Plaza Tân Phú',
    address: '284-286 Vườn Lài, Phường Phú Thọ Hòa, TP. Hồ Chí Minh',
    time: 'Đón Khách: 18H00 · Khai Tiệc: 19H00',
    date: 'Thứ Bảy, ngày 19 tháng 12 năm 2026',
    hall: 'Sảnh Akina (Tầng 8)',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Asiana+Plaza+Tan+Phu+284+Vuon+Lai+Phu+Tho+Hoa+Tan+Phu',
  },

  invitationMessage:
    'Sự hiện diện của Quý khách là niềm vinh hạnh cho gia đình chúng tôi.',
  get coverImage() {
    return getActiveImages().coverImage;
  },
  get receptionImage() {
    return getActiveImages().receptionImage;
  },
  get ringsImage() {
    return getActiveImages().ringsImage;
  },
  get outdoorImage() {
    return getActiveImages().outdoorImage;
  },
};

export const initialWishes: GuestWish[] = [];


export const loveStoryMilestones = [
  {
    year: '2021',
    title: 'Gặp Nhau Mùa Thu',
    date: '15 Tháng 10, 2021',
    description: 'Một buổi chiều mùa thu dịu mát, ánh mắt vô tình chạm nhau bắt đầu cho một câu chuyện tình yêu ngọt ngào của Phú và Thi.',
  },
  {
    year: '2023',
    title: 'Lời Tỏ Tình Dưới Hoàng Hôn',
    date: '14 Tháng 02, 2023',
    description: 'Bên bờ biển lộng gió, anh trao em bó hoa cùng lời hẹn ước chân thành đồng hành trên mọi chặng đường tương lai.',
  },
  {
    year: '2025',
    title: 'Khoảnh Khắc "Em Đồng Ý"',
    date: '24 Tháng 12, 2025',
    description: 'Dưới ánh đèn lung linh của đêm Giáng sinh, anh quỳ gối trao chiếc nhẫn ước hẹn và nhận lại nụ cười rạng rỡ cùng cái gật đầu của em.',
  },
  {
    year: '2026',
    title: 'Về Chung Một Nhà',
    date: '19 Tháng 12, 2026',
    description: 'Khép lại những năm tháng hẹn hò ngọt ngào để cùng nắm tay bước vào lễ đường tại Asiana Plaza, mở ra chương mới ngập tràn hạnh phúc.',
  },
];

export const quickWishesPresets = [
  'Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long!',
  'Chúc tổ ấm nhỏ luôn ngập tràn tiếng cười và yêu thương ngọt ngào!',
  'Mừng ngày chung đôi! Chúc Phú & Thi vạn sự như ý, sớm đón quý tử công chúa!',
  'Chúc tân lang tân nương mãi mãi son sắt, cùng nhau vượt qua mọi thử thách!',
  'Hôn nhân hạnh phúc viên mãn, tài lộc dồi dào, gia đạo an khang!',
];
