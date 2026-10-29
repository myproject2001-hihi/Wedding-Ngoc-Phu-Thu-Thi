// Cấu hình nguồn nhạc và hình ảnh (Hỗ trợ GitHub CDN từ repo myproject2001-hihi/Wedding-Ngoc-Phu-Thu-Thi, raw link hoặc file cục bộ)

export interface GalleryPhoto {
  id: string;
  filename: string;
  src: string;
  candidateUrls?: string[];
  title?: string;
  caption?: string;
}

export interface MediaConfig {
  trackTitle: string;
  trackSubtitle: string;
  audioUrl: string;
  fallbackAudioUrls: string[];
  images: {
    coverImage: string;
    receptionImage: string;
    ringsImage: string;
    outdoorImage: string;
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

export function getCandidateUrlsForFile(filename: string): string[] {
  const baseName = filename.replace(/\.[^/.]+$/, '');
  const repoOwner = 'myproject2001-hihi';
  const repoName = 'Wedding-Ngoc-Phu-Thu-Thi';
  const branch = 'main';

  return [
    `/assets/${baseName}.jpg`,
    `/assets/${baseName}.png`,
    `/assets/${baseName}.jpeg`,
    `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/public/assets/${baseName}.jpg`,
    `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/public/assets/${baseName}.png`,
    `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/public/assets/${baseName}.jpeg`,
    `https://cdn.jsdelivr.net/gh/${repoOwner}/${repoName}@${branch}/public/assets/${baseName}.jpg`,
    `https://cdn.jsdelivr.net/gh/${repoOwner}/${repoName}@${branch}/public/assets/${baseName}.png`,
  ];
}

// 21 khung ảnh cưới sẵn sàng: Hình bìa (anhbia.jpg) lớn ở trên cùng + 20 ảnh chi tiết (anh1 -> anh20)
// Khi có ảnh trên GitHub hoặc assets sẽ tự động hiện khung, khung nào chưa có ảnh thì ẩn đi
export const initialGalleryPhotos: GalleryPhoto[] = [
  {
    id: 'cover',
    filename: 'anhbia.jpg',
    src: '/assets/anhbia.jpg',
    candidateUrls: getCandidateUrlsForFile('anhbia.jpg'),
    title: '',
    caption: '',
  },
  ...Array.from({ length: 20 }, (_, idx) => {
    const num = idx + 1;
    const filename = `anh${num}.jpg`;
    return {
      id: `photo-${num}`,
      filename,
      src: `/assets/${filename}`,
      candidateUrls: getCandidateUrlsForFile(filename),
      title: '',
      caption: '',
    };
  }),
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
    '/audio/wedding_music.mp3',
    'https://raw.githubusercontent.com/myproject2001-hihi/Wedding-Ngoc-Phu-Thu-Thi/9ec957449973dd053a917d55d4dd32747be304da/public/audio/wedding_music.mp3',
    'https://raw.githubusercontent.com/myproject2001-hihi/Wedding-Ngoc-Phu-Thu-Thi/main/public/audio/wedding_music.mp3',
    'https://cdn.jsdelivr.net/gh/myproject2001-hihi/Wedding-Ngoc-Phu-Thu-Thi@main/public/audio/wedding_music.mp3',
    'https://raw.githubusercontent.com/myproject2001-hihi/Wedding-Ngoc-Phu-Thu-Thi/main/audio/wedding_music.mp3',
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
          // If stored items have old deleted placeholders or do not have anhbia as the first slot, clear and return default
          const isUpdatedFormat = parsed[0]?.filename === 'anhbia.jpg';
          const hasOldSample = parsed.some(
            (p: { src?: string }) =>
              p.src && (p.src.includes('wedding_couple_portrait') || p.src.includes('wedding_reception'))
          );
          if (isUpdatedFormat && !hasOldSample) {
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
