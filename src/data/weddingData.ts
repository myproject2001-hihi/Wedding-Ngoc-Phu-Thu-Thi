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
  weddingTime: '17:30',
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
    time: 'Đón Khách: 17H30 · Khai Tiệc: 19H00',
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
    year: '2020',
    title: 'Lần Đầu Gặp Gỡ',
    date: '23 Tháng 03, 2020',
    description: 'Một ngày tháng Ba trong trẻo, ánh mắt vô tình chạm nhau bắt đầu cho câu chuyện tình yêu ngọt ngào của Phú và Thi.',
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
  'Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long! Chúc cho tình yêu của Phú và Thi mãi bền chặt, cùng nhau sẻ chia mọi khoảnh khắc ngọt ngào của cuộc sống.',
  'Chúc tổ ấm nhỏ luôn ngập tràn tiếng cười, bình an và ấm áp. Mong hai bạn luôn là điểm tựa bình yên nhất của nhau sau những bộn bề cuộc sống.',
  'Mừng ngày hai bạn chính thức về chung một nhà! Chúc chặng đường mới luôn rực rỡ niềm vui, vạn sự cát tường và cùng nhau chạm tới mọi ước mơ.',
  'Chúc tân lang tân nương mãi mãi một lòng son sắt, luôn thấu hiểu, bao dung và nắm chặt tay nhau vượt qua mọi thử thách trên đường đời.',
  'Hôn nhân hạnh phúc viên mãn, công danh sự nghiệp thăng hoa, gia đạo an khang thịnh vượng và cuộc sống luôn sung túc, trọn vẹn đủ đầy.',
  'Gặp gỡ là duyên, nên vợ nên chồng là phúc trăm năm. Chúc hai bạn bách niên giai lão, dù năm tháng đổi thay vẫn vẹn nguyên nghĩa tình thủy chung.',
  'Chúc cho mỗi sớm mai thức dậy hai bạn đều thấy nụ cười của nhau, cùng nấu những bữa cơm ấm áp và cùng già đi trong sự dịu dàng, êm đềm.',
  'Chúc Phú và Thi luôn là hậu phương vững chắc và là người bạn đồng hành tuyệt vời nhất của nhau, đồng tâm hiệp lực xây đắp mái ấm vững bền.',
  'Chúc hai bạn sớm đón những thiên thần nhỏ kháu khỉnh, tiếng cười trẻ thơ rộn vang để niềm hạnh phúc gia đình thêm trọn vẹn và viên mãn.',
  'Chúc tình yêu của hai bạn luôn tươi mới và nồng nàn như ngày đầu tiên gặp gỡ, mỗi ngày bên nhau đều là một ngày ngập tràn điều kỳ diệu và lãng mạn.',
];
