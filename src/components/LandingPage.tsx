import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCheck, 
  ShieldAlert, 
  UserCheck2, 
  Clock, 
  Calendar, 
  Wrench, 
  Settings, 
  CheckCircle2, 
  ArrowRight,
  Gauge,
  Sparkles,
  Share2,
  MoreVertical,
  KeyRound,
  Search
} from 'lucide-react';
import { getWibDate, getHariIndo, getTanggalIndo, getWaktuWib } from '../utils/date';
import { ShareLinkModal } from './ShareLinkModal';

interface LandingPageProps {
  onSelectAccess: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectAccess }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const loginMenuRef = useRef<HTMLDivElement>(null);

  const [timeInfo, setTimeInfo] = useState({
    hari: getHariIndo(),
    tanggal: getTanggalIndo(),
    waktu: getWaktuWib()
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (loginMenuRef.current && !loginMenuRef.current.contains(e.target as Node)) {
        setIsLoginMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = getWibDate();
      setTimeInfo({
        hari: getHariIndo(now),
        tanggal: getTanggalIndo(now),
        waktu: getWaktuWib(now)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans"
      style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(30, 41, 59, 0.5), transparent), radial-gradient(circle at bottom left, rgba(15, 23, 42, 0.8), transparent)' }}
    >
      {/* Blue Ambient Blur Accent */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex flex-col justify-center relative z-10">
        
        {/* Real-time Clock Banner */}
        <div className="mb-8 sm:mb-12 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-blue-400 tracking-widest uppercase block">SYSTEM REAL-TIME WAKTU (WIB)</span>
                <span className="text-xs font-medium text-slate-400">Asia/Jakarta — SMK 18 LPPM RI Sidareja</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-6 text-center w-full md:w-auto">
              <div className="bg-slate-950/80 px-4 sm:px-6 py-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">HARI</div>
                <div className="text-xs sm:text-base font-bold text-blue-400 uppercase tracking-wider">{timeInfo.hari}</div>
              </div>

              <div className="bg-slate-950/80 px-4 sm:px-6 py-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">TANGGAL</div>
                <div className="text-xs sm:text-base font-bold text-slate-100 font-mono">{timeInfo.tanggal}</div>
              </div>

              <div className="bg-slate-950/80 px-4 sm:px-6 py-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">WAKTU</div>
                <div className="text-xs sm:text-base font-mono font-bold text-emerald-400">{timeInfo.waktu}</div>
              </div>
            </div>

          </div>
        </div>

        {/* Hero Section with Bold Typography */}
        <div className="text-center max-w-5xl mx-auto space-y-6">
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-900/90 border border-slate-700/80 p-2 shadow-2xl shadow-blue-500/20 backdrop-blur-md">
              <img 
                src="https://iili.io/C69Ouou.png" 
                alt="Logo SMK 18 LPPM RI Sidareja" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold tracking-[0.2em] uppercase">
            <Sparkles className="w-4 h-4" />
            <span>SMK 18 LPPM RI SIDAREJA</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400 tracking-tighter leading-none uppercase">
            ABSENSI SISWA <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-300">
              TEKNIK OTOMOTIF
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            Sistem Absensi Digital Terintegrasi Real-Time Program Keahlian Teknik Otomotif. 
            Akurat, Otomatisasi Kelas, Mencegah Absensi Ganda, dan Siap Cetak Laporan.
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
            
            <div className="group relative cursor-pointer w-full sm:w-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-80 transition duration-500" />
              <button
                onClick={() => onSelectAccess('student-attendance')}
                className="relative w-full sm:w-auto px-7 py-4 bg-slate-900 ring-1 ring-slate-800 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-800/90 transition-all"
              >
                <UserCheck className="w-5 h-5 text-blue-400" />
                <span className="text-white font-extrabold text-base tracking-wider uppercase">ABSENSI SISWA</span>
                <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <button
              onClick={() => onSelectAccess('check-attendance')}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 font-extrabold text-xs sm:text-sm uppercase tracking-wider border border-emerald-500/40 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>CEK KEHADIRAN SISWA</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="w-full sm:w-auto px-5 py-4 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold text-xs sm:text-sm uppercase tracking-wider border border-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>BAGIKAN LINK</span>
            </button>

            {/* 3-DOTS MENU FOR LOGIN SELECTION */}
            <div className="relative w-full sm:w-auto" ref={loginMenuRef}>
              <button
                onClick={() => setIsLoginMenuOpen(!isLoginMenuOpen)}
                className={`w-full sm:w-auto px-5 py-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
                  isLoginMenuOpen
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-800'
                }`}
                title="Pilih Akses Login"
              >
                <MoreVertical className="w-5 h-5 text-amber-400" />
                <span>PILIH LOGIN</span>
              </button>

              {isLoginMenuOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-full sm:w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1.5">
                    <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>MENU LOGIN SISFO</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectAccess('admin-login');
                      setIsLoginMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-amber-400 transition-all"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="text-left">
                      <div className="font-extrabold uppercase">LOGIN ADMIN</div>
                      <div className="text-[10px] text-slate-400 font-normal">Administrator & Kaprodi</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectAccess('wali-login');
                      setIsLoginMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition-all mt-1"
                  >
                    <UserCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="text-left">
                      <div className="font-extrabold uppercase">LOGIN WALI KELAS</div>
                      <div className="text-[10px] text-slate-400 font-normal">Akses Khusus Wali Kelas</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Metric / Access Info Cards */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div 
            onClick={() => onSelectAccess('student-attendance')}
            className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 transition-all cursor-pointer hover:-translate-y-1 group backdrop-blur-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white mb-1.5 group-hover:text-blue-400 transition-colors uppercase tracking-wider">1. ABSENSI SISWA</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Formulir absensi mandiri siswa Teknik Otomotif harian dengan pencegahan absensi ganda per tanggal.
            </p>
          </div>

          <div 
            onClick={() => onSelectAccess('check-attendance')}
            className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all cursor-pointer hover:-translate-y-1 group backdrop-blur-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white mb-1.5 group-hover:text-emerald-400 transition-colors uppercase tracking-wider">2. CEK KEHADIRAN</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Pencarian status absensi siswa dengan notifikasi otomatis <strong>DATA DITEMUKAN</strong> atau <strong>DATA TIDAK DITEMUKAN</strong>.
            </p>
          </div>

          <div 
            onClick={() => onSelectAccess('admin-login')}
            className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 transition-all cursor-pointer hover:-translate-y-1 group backdrop-blur-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white mb-1.5 group-hover:text-blue-400 transition-colors uppercase tracking-wider">3. LOGIN ADMIN</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Pengelolaan master data siswa, guru, rekapitulasi, cetak laporan, & pengaturan sistem.
            </p>
          </div>

          <div 
            onClick={() => onSelectAccess('wali-login')}
            className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all cursor-pointer hover:-translate-y-1 group backdrop-blur-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <UserCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white mb-1.5 group-hover:text-emerald-400 transition-colors uppercase tracking-wider">4. LOGIN WALI KELAS</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Pemantauan kehadiran kelas binaan, input/koreksi absensi, dan unduh rekap bulanan.
            </p>
          </div>

        </div>

      </main>

      {/* Footer matching design spec */}
      <footer className="h-20 sm:h-24 bg-slate-900/80 border-t border-slate-800 flex items-center px-6 sm:px-10 justify-between backdrop-blur-md text-xs">
        <div>
          <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono">STATUS SISTEM</span>
          <span className="font-bold text-emerald-400 font-mono tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            ONLINE — TERHUBUNG
          </span>
        </div>
        <div className="hidden sm:block text-center">
          <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono">INSTANSI</span>
          <span className="font-bold text-white tracking-wider">SMK 18 LPPM RI SIDAREJA</span>
        </div>
        <div className="text-right">
          <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono">PROGRAM KEAHLIAN</span>
          <span className="font-bold text-blue-400 font-mono tracking-wider">TEKNIK OTOMOTIF</span>
        </div>
      </footer>

      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

    </div>
  );
};
