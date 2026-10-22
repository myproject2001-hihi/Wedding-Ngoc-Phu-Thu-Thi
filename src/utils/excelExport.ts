import { RsvpData } from '../types';

/**
 * Xuất danh sách khách mời ra file Excel (định dạng CSV UTF-8 BOM chuẩn cho Microsoft Excel & Google Sheets)
 */
export const exportRsvpsToExcelCsv = (rsvps: RsvpData[] = [], fileName = 'Danh-Sach-Khach-Moi-Dam-Cuoi.csv') => {
  // Tiêu đề cột chuẩn tiếng Việt
  const headers = [
    'STT',
    'Thời Gian Gửi',
    'Họ Và Tên',
    'Mối Quan Hệ',
    'Khả Năng Tham Dự',
    'Số Khách (Gồm người đi cùng)',
    'Lời Nhắn / Chúc Phúc'
  ];

  const rows = rsvps.map((item, index) => {
    const escapeCsv = (str: string | number | undefined) => {
      if (str === undefined || str === null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    return [
      index + 1,
      escapeCsv(item.submittedAt),
      escapeCsv(item.name),
      escapeCsv(item.relationship || 'Người thân của nhà chú rể cô dâu'),
      escapeCsv(item.attending === 'yes' ? 'Sẽ tham dự' : 'Rất tiếc vắng mặt'),
      item.attending === 'yes' ? item.guestCount : 0,
      escapeCsv(item.wishes || ''),
    ].join(',');
  });

  // Ký tự \uFEFF (Byte Order Mark) để Microsoft Excel tự động nhận diện UTF-8 có dấu tiếng Việt
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
