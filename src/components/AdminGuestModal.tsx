import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Users,
  UserCheck,
  UserX,
  Search,
  Download,
  Heart,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { RsvpData } from '../types';
import { exportRsvpsToExcelCsv } from '../utils/excelExport';
import { loadAllGuestRsvps, getInitialGuestRsvps } from '../utils/guestStorage';

interface AdminGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminGuestModal: React.FC<AdminGuestModalProps> = ({ isOpen, onClose }) => {
  const [rsvps, setRsvps] = useState<RsvpData[]>(() => getInitialGuestRsvps());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'yes' | 'no'>('all');

  // Load RSVPs from high-capacity storage (IndexedDB + localStorage backup)
  const refreshRsvps = async () => {
    try {
      const data = await loadAllGuestRsvps();
      setRsvps(data);
    } catch {
      setRsvps(getInitialGuestRsvps());
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshRsvps();
    }
  }, [isOpen]);

  // Listen for real-time updates when a guest confirms in RsvpModal
  useEffect(() => {
    const handleUpdate = () => {
      refreshRsvps();
    };

    window.addEventListener('wedding_rsvp_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('wedding_rsvp_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (!isOpen) return null;

  // Filtered list based on search and attending status
  const filteredRsvps = rsvps.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.relationship && item.relationship.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.wishes && item.wishes.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatus === 'all') return true;
    return item.attending === filterStatus;
  });

  // Calculate statistics
  const totalResponses = rsvps.length;
  const attendingCount = rsvps.filter((r) => r.attending === 'yes').length;
  const totalGuests = rsvps
    .filter((r) => r.attending === 'yes')
    .reduce((sum, r) => sum + (Number(r.guestCount) || 1), 0);
  const declinedCount = rsvps.filter((r) => r.attending === 'no').length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-2xl sm:rounded-3xl bg-[#FFFDF9] border border-[#C5A059] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#FAF4E6] border-b border-[#C5A059]/40 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-[#8B1E22] text-[#FAF4E6] shadow-xs shrink-0">
              <FileSpreadsheet className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#8B1E22]">
                  Sổ Quản Lý Khách Mời Cưới
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] font-semibold text-amber-900 border border-amber-300">
                  <Database className="h-3 w-3" />
                  Sức chứa 1.000+ khách
                </span>
              </div>
              <p className="text-xs font-display text-stone-600">
                Tự động lưu từ biểu mẫu xác nhận & xuất file Excel phục vụ đặt tiệc nhà hàng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-500 hover:bg-[#FAF0DC] hover:text-[#8B1E22] transition-colors"
            title="Đóng sổ quản lý"
            aria-label="Đóng sổ quản lý"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body: Directly accessible without passcode */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Quick Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="rounded-xl border border-stone-200 bg-white p-3 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-[11px] font-caps uppercase tracking-wider font-semibold">Tổng Phản Hồi</span>
                <Users className="h-4 w-4 text-[#8B1E22]" />
              </div>
              <div className="text-2xl font-bold font-display text-stone-900">{totalResponses}</div>
              <p className="text-[10px] text-stone-500 mt-0.5">Lượt khách đã phản hồi</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-caps uppercase tracking-wider font-semibold">Sẽ Tham Dự</span>
                <UserCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-display text-emerald-900">{attendingCount}</div>
              <p className="text-[10px] text-emerald-700 mt-0.5">Gia đình / Người thân</p>
            </div>

            <div className="rounded-xl border border-[#C5A059]/40 bg-[#FAF4E6]/60 p-3 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between text-[#8B1E22] mb-1">
                <span className="text-[11px] font-caps uppercase tracking-wider font-bold">Tổng Khách Có Mặt</span>
                <Heart className="h-4 w-4 text-[#8B1E22] fill-[#8B1E22]" />
              </div>
              <div className="text-2xl font-bold font-display text-[#8B1E22]">{totalGuests}</div>
              <p className="text-[10px] text-stone-600 mt-0.5 font-medium">Số suất tiệc thực tế cần đặt</p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-[11px] font-caps uppercase tracking-wider font-semibold">Báo Vắng Mặt</span>
                <UserX className="h-4 w-4 text-stone-400" />
              </div>
              <div className="text-2xl font-bold font-display text-stone-700">{declinedCount}</div>
              <p className="text-[10px] text-stone-500 mt-0.5">Gửi lời chúc từ xa</p>
            </div>
          </div>

          {/* Action Bar: Search, Filters & ONLY 1 Button to download Excel */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm nhanh theo tên khách, mối quan hệ, lời chúc..."
                className="w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3.5 py-2 text-xs sm:text-sm font-display text-stone-900 focus:border-[#8B1E22] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5">
              {/* Status Filter Buttons */}
              <div className="inline-flex items-center gap-1 border border-stone-200 rounded-lg p-1 bg-stone-50 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 rounded-md font-caps uppercase font-semibold transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-white text-[#8B1E22] shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Tất Cả ({rsvps.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('yes')}
                  className={`px-2.5 py-1 rounded-md font-caps uppercase font-semibold transition-colors ${
                    filterStatus === 'yes'
                      ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Tham Dự ({attendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('no')}
                  className={`px-2.5 py-1 rounded-md font-caps uppercase font-semibold transition-colors ${
                    filterStatus === 'no'
                      ? 'bg-white text-rose-700 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Vắng Mặt ({declinedCount})
                </button>
              </div>

              {/* ONLY ONE ACTION BUTTON: Download Excel */}
              <button
                type="button"
                onClick={() => exportRsvpsToExcelCsv(rsvps)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:scale-98 px-4 py-2 text-xs sm:text-sm font-caps font-bold uppercase tracking-wider text-white shadow-md transition-all cursor-pointer"
                title="Tải toàn bộ danh sách khách về máy tính hoặc điện thoại dạng file Excel (.csv)"
              >
                <Download className="h-4 w-4 shrink-0" />
                <span>Tải File Excel</span>
              </button>
            </div>
          </div>

          {/* Guest List Table (Purely displays data from RSVP confirmations) */}
          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm font-display">
                <thead className="bg-[#FAF5E8] border-b border-stone-200 text-stone-700 font-caps uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3 w-12 text-center">STT</th>
                    <th className="py-3 px-3">Họ Và Tên</th>
                    <th className="py-3 px-3">Mối Quan Hệ</th>
                    <th className="py-3 px-3 text-center">Trạng Thái</th>
                    <th className="py-3 px-3 text-center">Số Khách</th>
                    <th className="py-3 px-3">Lời Nhắn / Chúc Phúc</th>
                    <th className="py-3 px-3 text-right">Thời Gian Xác Nhận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredRsvps.length > 0 ? (
                    filteredRsvps.map((item, index) => (
                      <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-stone-400">{index + 1}</td>
                        <td className="py-3 px-3 font-semibold text-stone-900">{item.name}</td>
                        <td className="py-3 px-3 text-stone-600">
                          <span className="inline-block px-2 py-0.5 rounded bg-stone-100 text-[11px]">
                            {item.relationship || 'Người thân'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {item.attending === 'yes' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-caps font-bold text-emerald-800">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Tham dự</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-caps font-semibold text-stone-600">
                              <span>Vắng mặt</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-stone-800 font-mono">
                          {item.attending === 'yes' ? item.guestCount : '-'}
                        </td>
                        <td className="py-3 px-3 text-stone-600 max-w-xs italic text-xs">
                          {item.wishes ? `"${item.wishes}"` : <span className="text-stone-300">-</span>}
                        </td>
                        <td className="py-3 px-3 text-right text-stone-400 text-xs font-mono">{item.submittedAt}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-500 font-display">
                        <p className="text-sm font-semibold text-stone-700">Chưa có phản hồi nào trong hệ thống.</p>
                        <p className="text-xs text-stone-400 mt-1">
                          Khi khách điền "Xác nhận tham dự", thông tin sẽ tự động xuất hiện tại đây.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards */}
            <div className="sm:hidden divide-y divide-stone-100">
              {filteredRsvps.length > 0 ? (
                filteredRsvps.map((item, index) => (
                  <div key={item.id} className="p-3.5 space-y-1.5">
                    <div className="flex justify-between items-center gap-2">
                      <div className="font-bold text-stone-900 text-sm">
                        {index + 1}. {item.name}
                      </div>
                      {item.attending === 'yes' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Tham dự ({item.guestCount})
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600">
                          Vắng mặt
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-600 flex items-center justify-between">
                      <span>{item.relationship || 'Người thân'}</span>
                      <span className="text-[10px] text-stone-400 font-mono">{item.submittedAt}</span>
                    </div>
                    {item.wishes && (
                      <div className="text-xs italic text-stone-600 bg-stone-50 p-2 rounded-md border border-stone-100">
                        "{item.wishes}"
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-stone-500 text-sm">
                  Chưa có phản hồi nào trong hệ thống.
                </div>
              )}
            </div>
          </div>

          {/* Bottom section cleanly removed */}
        </div>
      </div>
    </div>
  );
};
