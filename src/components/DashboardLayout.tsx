import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  School, 
  CheckSquare, 
  CalendarRange, 
  CalendarDays, 
  Calendar, 
  Printer, 
  Database, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Wrench,
  ShieldAlert,
  UserCheck2,
  ChevronRight,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { AuthUser } from '../types';
import { api } from '../services/api';

interface DashboardLayoutProps {
  currentUser: AuthUser;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  children
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = currentUser.role === 'admin';

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok!' });
      return;
    }

    if (newPassword.length < 3) {
      setPassMessage({ type: 'error', text: 'Password minimal 3 karakter.' });
      return;
    }

    try {
      const res = await api.changePassword({
        userId: currentUser.id,
        role: currentUser.role,
        oldPassword,
        newPassword
      });

      if (res.success) {
        setPassMessage({ type: 'success', text: res.message || 'Password berhasil diperbarui!' });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPassMessage(null);
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }, 1500);
      } else {
        setPassMessage({ type: 'error', text: res.error || 'Gagal memperbarui password.' });
      }
    } catch (err) {
      setPassMessage({ type: 'error', text: 'Gagal memperbarui password.' });
    }
  };

  const menuItems = isAdmin
    ? [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'students', label: 'Data Siswa', icon: Users },
        { id: 'teachers', label: 'Data Guru', icon: GraduationCap },
        { id: 'classes', label: 'Data Kelas', icon: School },
        { id: 'attendance', label: 'Absensi Siswa', icon: CheckSquare },
        { id: 'recap-weekly', label: 'Rekap Mingguan', icon: CalendarRange },
        { id: 'recap-monthly', label: 'Rekap Bulanan', icon: CalendarDays },
        { id: 'recap-yearly', label: 'Rekap Tahunan', icon: Calendar },
        { id: 'reports', label: 'Laporan & Cetak', icon: Printer },
        { id: 'backup-restore', label: 'Backup & Restore', icon: Database },
        { id: 'settings', label: 'Pengaturan', icon: Settings },
      ]
    : [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'students', label: `Siswa ${currentUser.kelas || ''}`, icon: Users },
        { id: 'attendance', label: 'Absensi & Koreksi', icon: CheckSquare },
        { id: 'recap-weekly', label: 'Rekap Mingguan', icon: CalendarRange },
        { id: 'recap-monthly', label: 'Rekap Bulanan', icon: CalendarDays },
        { id: 'recap-yearly', label: 'Rekap Tahunan', icon: Calendar },
        { id: 'reports', label: 'Laporan & Cetak', icon: Printer },
      ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <Wrench className="w-5 h-5 text-blue-400" />
          <span className="font-extrabold text-sm text-white uppercase tracking-wider">SMK 18 SIDAREJA</span>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-5 space-y-6">
          
          {/* Logo / Badge */}
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-600/20 overflow-hidden">
              <img 
                src="https://iili.io/C69Ouou.png" 
                alt="Logo SMK 18 LPPM RI Sidareja" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">SMK 18 LPPM RI</div>
              <div className="text-xs font-black text-white uppercase tracking-tight">TEKNIK OTOMOTIF</div>
            </div>
          </div>

          {/* User Role Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                {isAdmin ? <ShieldAlert className="w-3.5 h-3.5" /> : <UserCheck2 className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isAdmin ? 'ADMINISTRATOR' : `WALI KELAS ${currentUser.kelas || ''}`}</span>
              </div>
              <button
                onClick={() => {
                  setPassMessage(null);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setShowPasswordModal(true);
                }}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 transition-colors"
                title="Ubah Password"
              >
                <KeyRound className="w-3 h-3" />
                <span>Password</span>
              </button>
            </div>
            <div>
              <div className="text-sm font-extrabold text-white truncate">{currentUser.nama}</div>
              <div className="text-[11px] text-slate-400 truncate">{currentUser.jabatan || 'Akses Sistem'}</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full py-2.5 px-3.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Aplikasi</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>

      {/* MODAL: UBAH PASSWORD */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-amber-400 font-black text-sm uppercase">
                <KeyRound className="w-5 h-5" />
                <span>UBAH PASSWORD AKUN</span>
              </div>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Mengubah password untuk akun: <strong className="text-white">{currentUser.nama}</strong> ({isAdmin ? 'Admin' : `Wali Kelas ${currentUser.kelas || ''}`}).
            </p>

            {passMessage && (
              <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                passMessage.type === 'success' 
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' 
                  : 'bg-red-950/80 border-red-800 text-red-300'
              }`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
              {!isAdmin && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">PASSWORD LAMA</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                    placeholder="Masukkan password lama..."
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-300">PASSWORD BARU</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  placeholder="Masukkan password baru..."
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">KONFIRMASI PASSWORD BARU</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  placeholder="Ketik ulang password baru..."
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20"
                >
                  SIMPAN PASSWORD
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
