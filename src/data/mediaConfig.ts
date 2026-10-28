// Cấu hình nguồn nhạc và hình ảnh (Hỗ trợ GitHub CDN từ repo myproject2001-hihi/Wedding-Ngoc-Phu-Thu-Thi, raw link hoặc file cục bộ)

export interface GalleryPhoto {
  id: string;
  filename: string;
  src: string;
  title: string;
  caption: string;
}

export interface MediaConfig {
  trackTitle: string;
  trackSubtitle: string;
  audioUrl: string;
  fallbackAudioUrls: string[];
  images: {
    coverImage: string;       // Ảnh bìa chân dung cô dâu chú rể: anhbia.jpg
    receptionImage: string;   // Ảnh album 1: anh1.jpg (sảnh tiệc / không gian cưới)
    ringsImage: string;       // Ảnh album 2: anh2.jpg (nhẫn cưới đính ước)
    outdoorImage: string;     // Ảnh album 3: anh3.jpg (ngoại cảnh hạnh phúc)
  };
  galleryList: GalleryPhoto[];
  githubRepo: {
    owner: string;
    repo: string;
    branch: string;
    audioPath: string;
    assetsPath: string;
  };
}

// 10 ảnh hiện tại bạn đã chọn: 1 ảnh bìa + 9 ảnh phụ (hỗ trợ sẵn sàng mở rộng đến 20 ảnh)
export const initialGalleryPhotos: GalleryPhoto[] = [
  {
    id: 'cover',
    filename: 'anhbia.jpg',
    src: '/assets/anhbia.jpg',
    title: 'Tình Yêu Viên Mãn',
    caption: 'Khoảnh khắc thiêng liêng khi hai trái tim hòa cùng một nhịp đập',
  },
  {
    id: 'photo-1',
    filename: 'anh1.jpg',
    src: '/assets/anh1.jpg',
    title: 'Sảnh Tiệc Hoàng Gia',
    caption: 'Không gian lộng lẫy ngập tràn ánh nến và hoa tươi đón chào quý quan khách',
  },
  {
    id: 'photo-2',
    filename: 'anh2.jpg',
    src: '/assets/anh2.jpg',
    title: 'Nhẫn Cưới Đính Ước',
    caption: 'Kỷ vật thiêng liêng khắc ghi lời hẹn thề trọn đời son sắt',
  },
  {
    id: 'photo-3',
    filename: 'anh3.jpg',
    src: '/assets/anh3.jpg',
    title: 'Hạnh Phúc Bình Yên',
    caption: 'Nắm tay nhau đi qua bốn mùa mưa nắng, trọn vẹn yêu thương',
  },
  {
    id: 'photo-4',
    filename: 'anh4.jpg',
    src: '/assets/anh4.jpg',
    title: 'Đang Cập Nhật',
    caption: 'Hình ảnh đang được chuẩn bị...',
  },
  {
    id: 'photo-5',
    filename: 'anh5.jpg',
    src: '/assets/anh5.jpg',
    title: 'Nụ Cười Rạng Rỡ',
    caption: 'Những giây phút thăng hoa bên người thương của cuộc đời',
  },
  {
    id: 'photo-6',
    filename: 'anh6.jpg',
    src: '/assets/anh6.jpg',
    title: 'Đang Cập Nhật',
    caption: 'Hình ảnh đang được chuẩn bị...',
  },
  {
    id: 'photo-7',
    filename: 'anh7.jpg',
    src: '/assets/anh7.jpg',
    title: 'Hẹn Ước Trọn Đời',
    caption: 'Lời thề nguyền son sắt dưới sự chứng kiến của hai họ và bạn bè',
  },
  {
    id: 'photo-8',
    filename: 'anh8.jpg',
    src: '/assets/anh8.jpg',
    title: 'Sánh Bước Chung Đôi',
    caption: 'Cùng nhau bước đi trên con đường hạnh phúc ngập tràn hoa',
  },
  {
    id: 'photo-9',
    filename: 'anh9.jpg',
    src: '/assets/anh9.jpg',
    title: 'Khoảnh Khắc Vô Giá',
    caption: 'Kỷ niệm ngọt ngào nhất trong ngày trọng đại của Phú & Thi',
  },
];

export const defaultMediaConfig: MediaConfig = {
  trackTitle: 'Nhạc Đám Cưới Việt Nam',
  trackSubtitle: 'Xứng đôi cưới thôi • Ta là của nhau • Giao Hưởng Tân Thời',
  
  audioUrl: '/audio/wedding_music.mp3',
  
  images: {
    coverImage: '/assets/anhbia.jpg',
    receptionImage: '/assets/anh1.jpg',
    ringsImage: '/assets/anh2.jpg',
    outdoorImage: '/assets/anh3.jpg',
  },

  galleryList: initialGalleryPhotos,

  githubRepo: {
    owner: 'myproject2001-hihi',
    repo: 'Wedding-Ngoc-Phu-Thu-Thi',
    branch: 'main',
    audioPath: 'public/audio/wedding_music.mp3',
    assetsPath: 'public/assets/',
  },

  fallbackAudioUrls: [
    'https://cdn.jsdelivr.net/gh/myproject2001-hihi/Wedding-Ngoc-Phu-Thu-Thi@main/public/audio/wedding_music.mp3',
    'https://raw.githubusercontent.com/myproject2001-hihi/Wedding-Ngoc-Phu-Thu-Thi/main/public/audio/wedding_music.mp3',
    'https://cdn.jsdelivr.net/gh/myproject2001-hihi/Wedding-Ngoc-Phu-Thu-Thi@main/audio/wedding_music.mp3',
    'https://raw.githubusercontent.com/myproject2001-hihi/Wedding-Ngoc-Phu-Thu-Thi/main/audio/wedding_music.mp3',
    '/audio/wedding_music.mp3',
    '/assets/aistudio/Nh_c___m_C__i_Vi_t_Nam_-_X_ng___i_c__i_th_i__Ta_l__c_a_nhau_._Giao_H__ng_T_n_Th_i_256kbps_7aabcd04.mp3',
  ],
};

/**
 * Lấy link nhạc đang được áp dụng
 */
export function getActiveAudioUrl(): string {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const urlAudioParam = urlParams.get('audio') || urlParams.get('music');
    if (urlAudioParam) {
      return urlAudioParam;
    }

    const savedCustomUrl = localStorage.getItem('wedding_custom_audio_url');
    if (savedCustomUrl && savedCustomUrl.trim() !== '') {
      return savedCustomUrl.trim();
    }
  }

  return defaultMediaConfig.audioUrl;
}

/**
 * Lấy danh sách link 4 ảnh cưới cơ bản
 */
export function getActiveImages() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('wedding_custom_images');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If saved paths contain outdated deleted mock images, discard
        if (
          parsed.coverImage &&
          !parsed.coverImage.includes('wedding_couple_portrait') &&
          !parsed.coverImage.includes('wedding_reception_hall')
        ) {
          return {
            coverImage: parsed.coverImage || defaultMediaConfig.images.coverImage,
            receptionImage: parsed.receptionImage || defaultMediaConfig.images.receptionImage,
            ringsImage: parsed.ringsImage || defaultMediaConfig.images.ringsImage,
            outdoorImage: parsed.outdoorImage || defaultMediaConfig.images.outdoorImage,
          };
        } else {
          localStorage.removeItem('wedding_custom_images');
        }
      } catch {}
    }
  }

  return defaultMediaConfig.images;
}

/**
 * Lấy toàn bộ danh sách ảnh trong Album (mặc định 10 ảnh: anhbia + anh1 -> anh9, hỗ trợ đến 20 ảnh)
 */
export function getActiveGalleryPhotos(): GalleryPhoto[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('wedding_custom_gallery');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If stored items have old deleted placeholders, clear and return default
          const hasOldSample = parsed.some(
            (p: { src?: string }) =>
              p.src && (p.src.includes('wedding_couple_portrait') || p.src.includes('wedding_reception'))
          );
          if (!hasOldSample) {
            return parsed;
          }
          localStorage.removeItem('wedding_custom_gallery');
        }
      } catch {}
    }
  }

  return initialGalleryPhotos;
}

/**
 * Lưu toàn bộ danh sách ảnh Album vào localStorage
 */
export function saveCustomGallery(photos: GalleryPhoto[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('wedding_custom_gallery', JSON.stringify(photos));
    window.dispatchEvent(new Event('wedding_media_updated'));
  }
}

/**
 * Lưu link ảnh tùy chỉnh cơ bản
 */
export function saveCustomImages(images: {
  coverImage?: string;
  receptionImage?: string;
  ringsImage?: string;
  outdoorImage?: string;
}) {
  if (typeof window !== 'undefined') {
    const current = getActiveImages();
    const updated = {
      ...current,
      ...images,
    };
    localStorage.setItem('wedding_custom_images', JSON.stringify(updated));
    window.dispatchEvent(new Event('wedding_media_updated'));
  }
}
