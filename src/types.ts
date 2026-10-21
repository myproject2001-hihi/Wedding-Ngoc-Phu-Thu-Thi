export interface WeddingInfo {
  groomName: string;
  groomTitle: string; // e.g. "Trưởng Nam"
  groomFather: string;
  groomMother: string;
  groomHometown?: string; // "TP.HCM"
  groomPhone: string;
  groomBank: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    qrImage?: string;
  };
  brideName: string;
  brideTitle: string; // e.g. "Thứ Nữ"
  brideFather: string;
  brideMother: string;
  brideHometown?: string; // "Tỉnh Đắk Lắk"
  bridePhone: string;
  brideBank: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    qrImage?: string;
  };
  weddingDate: string; // "2026-12-19"
  weddingTime: string; // "17:30"
  weddingDayOfWeek: string; // "Thứ Bảy"
  lunarDate: string; // "Nhằm ngày 11 tháng 11 năm Bính Ngọ"
  ceremonyVenue: {
    title: string;
    name: string;
    address: string;
    time: string;
    date: string;
    mapUrl: string;
  };
  receptionVenue: {
    title: string;
    name: string;
    address: string;
    time: string;
    date: string;
    hall: string;
    mapUrl: string;
  };
  invitationMessage: string;
  coverImage: string;
  receptionImage: string;
  ringsImage: string;
  outdoorImage: string;
}

export interface GuestWish {
  id: string;
  name: string;
  relation: string;
  message: string;
  createdAt: string;
  likes: number;
}

export interface RsvpData {
  id: string;
  name: string;
  relationship?: string;
  phone?: string;
  attending: 'yes' | 'no';
  guestCount: number;
  dietary?: string;
  wishes?: string;
  submittedAt: string;
}
