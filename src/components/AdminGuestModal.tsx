import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Users,
  UserCheck,
  UserX,
  Search,
  Download,
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
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#8B1E22]">
                Sổ Quản Lý Khách Mời Cưới
              </h3>
              <p className="text-xs text-stone-600 font-display">
                Huỳnh Lê Ngọc Phú & Huỳnh Thị Thu Thi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-500 hover:bg-[#FAF0DC] hover:text-[#8B1E22] transition-colors cursor-pointer"
            title="Đóng sổ quản lý"
            aria-label="Đóng sổ quản lý"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body: Direct RSVP & Excel export, no tabs */}
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
                <UserCheck className="h-4 w-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-bold font-display text-emerald-900">{attendingCount}</div>
              <p className="text-[10px] text-emerald-700 mt-0.5">Số lượt khách đồng ý</p>
            </div>

            <div className="rounded-xl border border-[#C5A059]/40 bg-[#FAF4E6]/50 p-3 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between text-[#8B1E22] mb-1">
                <span className="text-[11px] font-caps uppercase tracking-wider font-semibold">Tổng Số Khách</span>
                <Database className="h-4 w-4 text-[#C5A059]" />
              </div>
              <div className="text-2xl font-bold font-display text-[#8B1E22]">{totalGuests}</div>
              <p className="text-[10px] text-stone-600 mt-0.5">Số suất tiệc dự kiến</p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 mb-1">
                <span className="text-[11px] font-caps uppercase tracking-wider font-semibold">Vắng Mặt</span>
                <UserX className="h-4 w-4 text-stone-400" />
              </div>
              <div className="text-2xl font-bold font-display text-stone-600">{declinedCount}</div>
              <p className="text-[10px] text-stone-500 mt-0.5">Khách gửi lời chúc từ xa</p>
            </div>
          </div>

          {/* Action Bar: Search, Filter, Export Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm tên khách, mối quan hệ, lời chúc..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-[#8B1E22] focus:ring-1 focus:ring-[#8B1E22]"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'yes' | 'no')}
                className="py-2 px-3 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:border-[#8B1E22] bg-white cursor-pointer"
              >
                <option value="all">Tất cả ({totalResponses})</option>
                <option value="yes">Sẽ tham dự ({attendingCount})</option>
                <option value="no">Vắng mặt ({declinedCount})</option>
              </select>
            </div>
          </div>

          {/* Table of Guests */}
          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#FAF6EE] text-[#8B1E22] font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Khách Mời</th>
                    <th className="py-3 px-4">Mối Quan Hệ</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-center">Số Người</th>
                    <th className="py-3 px-4">Thời Gian</th>
                    <th className="py-3 px-4">Lời Chúc Mừng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredRsvps.length > 0 ? (
                    filteredRsvps.map((item, index) => (
                      <tr key={index} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-stone-900">{item.name}</td>
                        <td className="py-3 px-4 text-stone-600">{item.relationship || '—'}</td>
                        <td className="py-3 px-4">
                          {item.attending === 'yes' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                              <CheckCircle2 className="h-3 w-3" />
                              Tham dự
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-600">
                              Vắng mặt
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold font-mono">
                          {item.attending === 'yes' ? item.guestCount : 0}
                        </td>
                        <td className="py-3 px-4 text-stone-400 text-xs font-mono">{item.submittedAt}</td>
                        <td className="py-3 px-4 text-stone-600 max-w-xs truncate italic">
                          {item.wishes ? `"${item.wishes}"` : '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-500">
                        Không tìm thấy phản hồi nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-stone-100">
              {filteredRsvps.length > 0 ? (
                filteredRsvps.map((item, index) => (
                  <div key={index} className="p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-stone-900">{item.name}</div>
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
        </div>
      </div>
    </div>
  );
};
