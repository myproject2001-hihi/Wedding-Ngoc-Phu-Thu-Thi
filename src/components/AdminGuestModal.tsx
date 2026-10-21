import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Users,
  UserCheck,
  UserX,
  Search,
  Trash2,
  Lock,
  Download,
  Plus,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import { RsvpData } from '../types';
import { exportRsvpsToExcelCsv } from '../utils/excelExport';

interface AdminGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_SAMPLE_RSVPS: RsvpData[] = [
  {
    id: 'sample-1',
    name: 'Bác Hai & Bác Gái',
    relationship: 'Người thân của nhà chú rể cô dâu',
    attending: 'yes',
    guestCount: 2,
    wishes: 'Chúc hai cháu trăm năm hạnh phúc, răng long đầu bạc!',
    submittedAt: '21/10/2026, 09:30:15',
  },
  {
    id: 'sample-2',
    name: 'Cô Út & Chú Út',
    relationship: 'Người thân của nhà chú rể cô dâu',
    attending: 'yes',
    guestCount: 3,
    wishes: 'Cả gia đình cô chú chắc chắn sẽ đến sớm chung vui!',
    submittedAt: '21/10/2026, 10:15:40',
  },
  {
    id: 'sample-3',
    name: 'Anh Tuấn & Chị Mai',
    relationship: 'Bạn của chú rể',
    attending: 'yes',
    guestCount: 2,
    wishes: 'Chúc mừng người anh em đã tìm được một nửa hoàn hảo.',
    submittedAt: '21/10/2026, 11:05:22',
  },
  {
    id: 'sample-4',
    name: 'Bạn Hoàng Yến',
    relationship: 'Bạn của cô dâu',
    attending: 'no',
    guestCount: 0,
    wishes: 'Mình bận chuyến công tác nước ngoài tiếc quá, chúc bạn mình làm cô dâu rạng rỡ nhất!',
    submittedAt: '21/10/2026, 11:42:00',
  },
];

export const AdminGuestModal: React.FC<AdminGuestModalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const [rsvps, setRsvps] = useState<RsvpData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'yes' | 'no'>('all');

  // Manual Add Guest Modal State
  const [showAddForm, setShowAddForm] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualRelation, setManualRelation] = useState('Người thân của nhà chú rể cô dâu');
  const [manualAttending, setManualAttending] = useState<'yes' | 'no'>('yes');
  const [manualCount, setManualCount] = useState(1);
  const [manualWishes, setManualWishes] = useState('');

  // Load RSVPs from localStorage
  const loadRsvps = () => {
    try {
      const stored = localStorage.getItem('wedding_rsvps');
      if (stored) {
        setRsvps(JSON.parse(stored));
      } else {
        // If empty, preload sample guests for immediate preview
        localStorage.setItem('wedding_rsvps', JSON.stringify(DEFAULT_SAMPLE_RSVPS));
        setRsvps(DEFAULT_SAMPLE_RSVPS);
      }
    } catch {
      setRsvps(DEFAULT_SAMPLE_RSVPS);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRsvps();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Simple passkey verification (default: 2026 or empty)
  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === '2026' || passcode.trim() === '' || passcode.trim() === 'admin') {
      setIsAuthenticated(true);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  // Add manual guest
  const handleAddManualGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const newItem: RsvpData = {
      id: String(Date.now()),
      name: manualName.trim(),
      relationship: manualRelation,
      attending: manualAttending,
      guestCount: manualAttending === 'yes' ? manualCount : 0,
      wishes: manualWishes.trim() || 'Thêm trực tiếp qua sổ quản lý',
      submittedAt: new Date().toLocaleString('vi-VN'),
    };

    const updated = [newItem, ...rsvps];
    setRsvps(updated);
    localStorage.setItem('wedding_rsvps', JSON.stringify(updated));

    // Reset form
    setManualName('');
    setManualWishes('');
    setManualCount(1);
    setShowAddForm(false);
  };

  // Delete an RSVP
  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa phản hồi này khỏi danh sách?')) {
      const updated = rsvps.filter((item) => item.id !== id);
      setRsvps(updated);
      localStorage.setItem('wedding_rsvps', JSON.stringify(updated));
    }
  };

  // Clear all RSVPs
  const handleClearAll = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách khách mời? Thao tác này không thể hoàn tác.')) {
      setRsvps([]);
      localStorage.removeItem('wedding_rsvps');
    }
  };

  // Reset to default sample
  const handleLoadSamples = () => {
    localStorage.setItem('wedding_rsvps', JSON.stringify(DEFAULT_SAMPLE_RSVPS));
    setRsvps(DEFAULT_SAMPLE_RSVPS);
  };

  // Filtered list
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-[#FFFDF9] border border-[#C5A059] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#FAF4E6] border-b border-[#C5A059]/40 px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B1E22] text-[#FAF4E6] shadow-xs">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#8B1E22]">
                Sổ Quản Lý Khách Mời Cưới
              </h3>
              <p className="text-xs font-display text-stone-600">
                Theo dõi người thân xác nhận tham dự & xuất file Excel (.csv) cho nhà hàng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-500 hover:bg-[#FAF0DC] hover:text-[#8B1E22] transition-colors"
            title="Đóng bảng quản trị"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* PASSCODE SCREEN */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FAF0DC] border border-[#C5A059] text-[#8B1E22] mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <h4 className="font-serif text-xl font-bold text-stone-900 mb-1">
              Bảo Mật Dành Cho Cô Dâu & Chú Rể
            </h4>
            <p className="text-xs font-display text-stone-600 mb-6 leading-relaxed">
              Nhập mã số bảo mật để truy cập danh sách xác nhận và xuất file Excel.
              <br />
              <span className="text-stone-400 italic">(Mã mặc định: <strong>2026</strong> hoặc để trống rồi bấm Mở Khóa)</span>
            </p>

            <form onSubmit={handleVerifyPasscode} className="w-full space-y-3">
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setPasscodeError(false);
                }}
                placeholder="Nhập mã bảo mật (2026)..."
                className="w-full text-center rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-mono tracking-widest text-stone-900 focus:border-[#8B1E22] focus:outline-none focus:ring-1 focus:ring-[#8B1E22]"
                autoFocus
              />
              {passcodeError && (
                <p className="text-xs text-rose-600 font-display">Mã bảo mật không chính xác. Hãy nhập 2026.</p>
              )}
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#8B1E22] py-2.5 px-4 text-xs font-caps font-semibold uppercase tracking-wider text-[#FAF4E6] hover:bg-[#6E1418] transition-colors"
              >
                <span>Mở Khóa Quản Trị</span>
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED DASHBOARD */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-xl border border-stone-200 bg-white p-3.5 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between text-stone-500 mb-1">
                  <span className="text-[11px] font-caps uppercase tracking-wider font-semibold">Tổng Phản Hồi</span>
                  <Users className="h-4 w-4 text-[#8B1E22]" />
                </div>
                <div className="text-2xl font-bold font-display text-stone-900">{totalResponses}</div>
                <p className="text-[10px] text-stone-500 mt-0.5">Số phiếu đã nhận</p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between text-emerald-800 mb-1">
                  <span className="text-[11px] font-caps uppercase tracking-wider font-semibold">Sẽ Tham Dự</span>
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold font-display text-emerald-900">{attendingCount}</div>
                <p className="text-[10px] text-emerald-700 mt-0.5">Gia đình / Người thân</p>
              </div>

              <div className="rounded-xl border border-[#C5A059]/40 bg-[#FAF4E6]/60 p-3.5 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between text-[#8B1E22] mb-1">
                  <span className="text-[11px] font-caps uppercase tracking-wider font-bold">Tổng Khách Có Mặt</span>
                  <Heart className="h-4 w-4 text-[#8B1E22] fill-[#8B1E22]" />
                </div>
                <div className="text-2xl font-bold font-display text-[#8B1E22]">{totalGuests}</div>
                <p className="text-[10px] text-stone-600 mt-0.5 font-medium">Người đi cùng thực tế để đặt tiệc</p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 sm:p-4 shadow-2xs">
                <div className="flex items-center justify-between text-stone-500 mb-1">
                  <span className="text-[11px] font-caps uppercase tracking-wider font-semibold">Báo Vắng Mặt</span>
                  <UserX className="h-4 w-4 text-stone-400" />
                </div>
                <div className="text-2xl font-bold font-display text-stone-700">{declinedCount}</div>
                <p className="text-[10px] text-stone-500 mt-0.5">Gửi lời chúc mừng từ xa</p>
              </div>
            </div>

            {/* Action Bar: Search, Filters, Add Guest & Export Excel */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
              {/* Search Box */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tên khách, mối quan hệ, lời chúc..."
                  className="w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3.5 py-1.5 text-xs sm:text-sm font-display text-stone-900 focus:border-[#8B1E22] focus:outline-none"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 border border-stone-200 rounded-lg p-1 bg-stone-50 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 rounded-md font-caps uppercase font-semibold transition-colors ${
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
                  className={`px-3 py-1 rounded-md font-caps uppercase font-semibold transition-colors ${
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
                  className={`px-3 py-1 rounded-md font-caps uppercase font-semibold transition-colors ${
                    filterStatus === 'no'
                      ? 'bg-white text-rose-700 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Vắng Mặt ({declinedCount})
                </button>
              </div>

              {/* Action Buttons: Add Manual + Export Excel */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-caps font-semibold uppercase tracking-wider text-stone-700 hover:border-[#8B1E22] hover:text-[#8B1E22] transition-colors"
                  title="Thêm người thân gọi điện báo trực tiếp"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Thêm Khách</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportRsvpsToExcelCsv(rsvps)}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-caps font-bold uppercase tracking-wider text-white shadow-xs hover:bg-emerald-800 transition-colors"
                  title="Tải toàn bộ danh sách khách về máy tính / điện thoại dạng file Excel (.csv chuẩn UTF-8)"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Xuất File Excel (.CSV)</span>
                </button>
              </div>
            </div>

            {/* Manual Add Form (Dropdown Overlay) */}
            {showAddForm && (
              <form
                onSubmit={handleAddManualGuest}
                className="rounded-xl border border-[#C5A059] bg-[#FAF5E8] p-4 space-y-3 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between border-b border-[#C5A059]/30 pb-2">
                  <h5 className="font-serif font-bold text-sm text-[#8B1E22] flex items-center gap-1.5">
                    <Plus className="h-4 w-4" />
                    <span>Ghi Nhận Thêm Khách Mới (Ví Dụ Người Thân Gọi Báo Riêng)</span>
                  </h5>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-caps uppercase tracking-wider text-stone-600 mb-1 font-semibold">
                      Tên khách mời *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="Họ và tên..."
                      className="w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-display"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-caps uppercase tracking-wider text-stone-600 mb-1 font-semibold">
                      Mối quan hệ
                    </label>
                    <select
                      value={manualRelation}
                      onChange={(e) => setManualRelation(e.target.value)}
                      className="w-full rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-display"
                    >
                      <option value="Người thân của nhà chú rể cô dâu">Người thân của nhà chú rể cô dâu</option>
                      <option value="Bạn của chú rể">Bạn của chú rể</option>
                      <option value="Bạn của cô dâu">Bạn của cô dâu</option>
                      <option value="Bạn chung hai bên">Bạn chung hai bên</option>
                      <option value="Đồng nghiệp & đối tác">Đồng nghiệp & đối tác</option>
                      <option value="Khách quý của gia đình">Khách quý của gia đình</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <select
                      value={manualAttending}
                      onChange={(e) => setManualAttending(e.target.value as 'yes' | 'no')}
                      className="rounded-md border border-stone-300 bg-white px-2 py-1.5 text-xs font-display"
                    >
                      <option value="yes">Sẽ tham dự</option>
                      <option value="no">Vắng mặt</option>
                    </select>

                    {manualAttending === 'yes' && (
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={manualCount}
                        onChange={(e) => setManualCount(Number(e.target.value) || 1)}
                        className="w-20 rounded-md border border-stone-300 bg-white px-2 py-1.5 text-xs text-center font-display"
                        title="Số lượng người đi cùng"
                      />
                    )}

                    <button
                      type="submit"
                      className="flex-1 rounded-md bg-[#8B1E22] py-1.5 px-3 text-xs font-caps font-bold uppercase text-white hover:bg-[#6E1418]"
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Guest List Table */}
            <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm font-display">
                  <thead className="bg-[#FAF5E8] border-b border-stone-200 text-stone-700 font-caps uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-3 w-12 text-center">STT</th>
                      <th className="py-3 px-3">Họ Và Tên</th>
                      <th className="py-3 px-3">Mối Quan Hệ</th>
                      <th className="py-3 px-3 text-center">Trạng Thái</th>
                      <th className="py-3 px-3 text-center">Số Khách</th>
                      <th className="py-3 px-3">Lời Nhắn / Chúc Phúc</th>
                      <th className="py-3 px-3 text-right">Thời Gian</th>
                      <th className="py-3 px-3 text-center w-12">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredRsvps.length > 0 ? (
                      filteredRsvps.map((item, index) => (
                        <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="py-3 px-3 text-center font-mono text-stone-400">
                            {index + 1}
                          </td>
                          <td className="py-3 px-3 font-semibold text-stone-900">
                            {item.name}
                          </td>
                          <td className="py-3 px-3 text-stone-600">
                            <span className="inline-block px-2 py-0.5 rounded bg-stone-100 text-[11px] font-sans">
                              {item.relationship || 'Người thân của nhà chú rể cô dâu'}
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
                          <td className="py-3 px-3 text-right text-stone-400 text-xs font-mono">
                            {item.submittedAt}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Xóa phản hồi này"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-stone-500 font-display">
                          <p className="text-sm font-semibold text-stone-700">Chưa có phản hồi nào phù hợp.</p>
                          <p className="text-xs text-stone-400 mt-1">
                            Khi người thân bấm xác nhận trên thiệp, thông tin sẽ hiển thị tự động tại đây.
                          </p>
                          <button
                            type="button"
                            onClick={handleLoadSamples}
                            className="mt-3 inline-flex items-center gap-1 text-xs text-[#8B1E22] underline font-bold hover:text-[#6E1418]"
                          >
                            Tải lại dữ liệu mẫu xem thử
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Utilities */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 pt-2 border-t border-stone-200">
              <div className="flex items-center gap-2">
                <span>Dữ liệu lưu trữ an toàn & tức thì trên trình duyệt của bạn.</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleLoadSamples}
                  className="text-stone-600 hover:text-[#8B1E22] underline"
                >
                  Nạp dữ liệu mẫu
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-rose-600 hover:text-rose-800 underline"
                >
                  Xóa toàn bộ dữ liệu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
