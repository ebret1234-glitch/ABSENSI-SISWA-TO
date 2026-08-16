import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Home, 
  School, 
  Share2, 
  User, 
  RefreshCw,
  FileText
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { api } from '../services/api';
import { getWibDate, getHariIndo, getTanggalIndo, getTanggalFormatted, getWaktuWib } from '../utils/date';
import { ShareLinkModal } from './ShareLinkModal';

interface CheckAttendanceViewProps {
  onBackToHome: () => void;
  onGoToAttendance?: () => void;
}

export const CheckAttendanceView: React.FC<CheckAttendanceViewProps> = ({ 
  onBackToHome
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Real-time Clock State
  const [timeInfo, setTimeInfo] = useState({
    hari: getHariIndo(),
    tanggal: getTanggalIndo(),
    waktu: getWaktuWib(),
    tanggalIso: getTanggalFormatted()
  });

  // Search Filter State - Only Nama Lengkap
  const [namaInput, setNamaInput] = useState<string>('');

  // Search Query Execution State
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    records: AttendanceRecord[];
    searchedName: string;
  } | null>(null);

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const now = getWibDate();
      setTimeInfo({
        hari: getHariIndo(now),
        tanggal: getTanggalIndo(now),
        waktu: getWaktuWib(now),
        tanggalIso: getTanggalFormatted(now)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle Search Form Submit
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedName = namaInput.trim();
    if (!trimmedName) {
      alert('Silakan ketik Nama Lengkap Siswa yang ingin dicek!');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Query attendance records by name
      const allRecords = await api.getAttendance();

      // Match student by name (case-insensitive substring or exact match)
      const q = trimmedName.toLowerCase();
      const matched = allRecords.filter(r => {
        const studentName = (r.nama || '').trim().toLowerCase();
        return studentName.includes(q) || q.includes(studentName);
      });

      // Sort by newest first (id or tanggal)
      matched.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || '') || b.id.localeCompare(a.id));

      setSearchResult({
        found: matched.length > 0,
        records: matched,
        searchedName: trimmedName
      });
    } catch (err) {
      console.error(err);
      setSearchResult({
        found: false,
        records: [],
        searchedName: trimmedName
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusBadge = (st: AttendanceStatus) => {
    switch (st) {
      case 'H':
        return (
          <span className="font-black text-xs sm:text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1.5 inline-flex">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>H — HADIR</span>
          </span>
        );
      case 'I':
        return (
          <span className="font-black text-xs sm:text-sm text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/30 flex items-center gap-1.5 inline-flex">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>I — IZIN</span>
          </span>
        );
      case 'S':
        return (
          <span className="font-black text-xs sm:text-sm text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1.5 inline-flex">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>S — SAKIT</span>
          </span>
        );
      case 'A':
        return (
          <span className="font-black text-xs sm:text-sm text-red-400 bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/30 flex items-center gap-1.5 inline-flex">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span>A — ALPA</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 relative font-sans">
      
      {/* Background Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10">
              <img 
                src="https://iili.io/C69Ouou.png" 
                alt="Logo SMK 18 LPPM RI Sidareja" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold uppercase tracking-widest">
                <School className="w-3.5 h-3.5" />
                <span>SMK 18 LPPM RI SIDAREJA</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tight uppercase">
                CEK KEHADIRAN SISWA
              </h1>
              <p className="text-xs font-extrabold text-blue-400 tracking-wider uppercase">
                PROGRAM KEAHLIAN TEKNIK OTOMOTIF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700 shadow-lg flex items-center gap-2 transition-all shrink-0"
              title="Bagikan Link Halaman"
            >
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>Bagikan Link</span>
            </button>
          </div>
        </div>

        {/* Real-time Time Widget */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
              <Clock className="w-4 h-4" />
              <span>WAKTU REAL-TIME (WIB)</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded font-mono border border-slate-800">Asia/Jakarta</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-0.5">HARI</span>
              <span className="text-xs sm:text-base font-bold text-blue-400 uppercase tracking-wider">{timeInfo.hari}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-0.5">TANGGAL</span>
              <span className="text-xs sm:text-base font-bold text-white font-mono">{timeInfo.tanggal}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-0.5">WAKTU</span>
              <span className="text-xs sm:text-base font-mono font-bold text-emerald-400">{timeInfo.waktu}</span>
            </div>
          </div>
        </div>

        {/* Search Box / Filter Form - ONLY NAMA LENGKAP */}
        <form 
          onSubmit={handleSearch}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5"
        >
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
              <Search className="w-5 h-5 text-blue-400" />
              <span>PENCARIAN & PENGECEKAN STATUS ABSENSI</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Live Query
            </span>
          </div>

          {/* NAMA LENGKAP SISWA INPUT ONLY */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              NAMA LENGKAP SISWA <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={namaInput}
                onChange={(e) => setNamaInput(e.target.value)}
                placeholder="Ketik Nama Lengkap Siswa yang ingin dicek..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 pl-12 text-sm sm:text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                autoFocus
              />
              <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Masukkan nama lengkap atau bagian dari nama siswa untuk memeriksa catatan absensi.
            </p>
          </div>

          {/* Submit Search Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-black text-base sm:text-lg uppercase tracking-wider shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>MEMERIKSA DATA KEHADIRAN...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>CEK STATUS KEHADIRAN SISWA</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* RESULTS SECTION */}
        {hasSearched && searchResult && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            {/* CONDITION 1: DATA DITEMUKAN */}
            {searchResult.found ? (
              <div className="space-y-4">
                
                {/* Large Green Notification Banner */}
                <div className="bg-emerald-950/70 border-2 border-emerald-500 rounded-2xl p-5 sm:p-6 shadow-2xl flex items-center gap-4 text-left">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-widest mb-1">
                      HASIL PENGECEKAN SISTEM
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-emerald-300 uppercase tracking-tight">
                      ✓ DATA DITEMUKAN
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-100/80 mt-0.5">
                      Ditemukan <strong className="text-white font-bold">{searchResult.records.length} riwayat absensi</strong> untuk nama &quot;<strong className="text-white font-bold">{searchResult.searchedName}</strong>&quot;.
                    </p>
                  </div>
                </div>

                {/* Record Details Cards */}
                {searchResult.records.map((rec) => (
                  <div 
                    key={rec.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                          NAMA LENGKAP SISWA
                        </span>
                        <h4 className="text-xl font-black text-white uppercase tracking-tight">
                          {rec.nama}
                        </h4>
                      </div>

                      <div>{getStatusBadge(rec.status)}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                        <span className="text-slate-500 font-mono text-[10px] uppercase tracking-wider block">
                          PROGRAM KEAHLIAN
                        </span>
                        <span className="font-bold text-amber-400">
                          {rec.programKeahlian || 'Teknik Otomotif'}
                        </span>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                        <span className="text-slate-500 font-mono text-[10px] uppercase tracking-wider block">
                          KELAS
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          {rec.kelas}
                        </span>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                        <span className="text-slate-500 font-mono text-[10px] uppercase tracking-wider block">
                          HARI & TANGGAL ABSENSI
                        </span>
                        <span className="font-bold text-white">
                          {rec.hari}, {rec.tanggal}
                        </span>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                        <span className="text-slate-500 font-mono text-[10px] uppercase tracking-wider block">
                          WAKTU ABSEN (WIB)
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          {rec.waktu}
                        </span>
                      </div>
                    </div>

                    {/* Keterangan / Catatan */}
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5 text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-wider block">
                          Catatan / Keterangan:
                        </span>
                        <p className="text-slate-200 font-medium">
                          {rec.keterangan || (rec.status === 'H' ? 'Hadir Mandiri' : '-')}
                        </p>
                      </div>
                    </div>

                  </div>
                ))}

              </div>
            ) : (
              /* CONDITION 2: DATA TIDAK DITEMUKAN / NAMA SALAH */
              <div className="space-y-4">
                
                {/* Large Red Notification Banner */}
                <div className="bg-red-950/60 border-2 border-red-500/80 rounded-2xl p-5 sm:p-6 shadow-2xl flex items-center gap-4 text-left">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow-lg shadow-red-500/20">
                    <XCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-mono font-bold uppercase tracking-widest mb-1">
                      HASIL PENGECEKAN SISTEM
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-red-400 uppercase tracking-tight">
                      ✕ DATA TIDAK DITEMUKAN / NAMA SALAH
                    </h3>
                    <p className="text-xs sm:text-sm text-red-200 mt-1 leading-relaxed">
                      Data absensi untuk nama &quot;<strong className="text-white font-bold">{searchResult.searchedName}</strong>&quot; tidak ditemukan. Pastikan penulisan nama lengkap sudah benar sesuai data atau siswa belum melakukan absensi.
                    </p>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* Footer Navigation Back Button */}
        <div className="text-center pt-4">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors py-2 px-4 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Halaman Utama</span>
          </button>
        </div>

      </div>

      {/* Share Modal */}
      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

    </div>
  );
};
