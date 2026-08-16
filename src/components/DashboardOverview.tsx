import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Calendar,
  Filter,
  Check,
  Share2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { AuthUser, Student, AttendanceRecord, ClassItem } from '../types';
import { api } from '../services/api';
import { ShareLinkModal } from './ShareLinkModal';

interface DashboardOverviewProps {
  currentUser: AuthUser;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ currentUser }) => {
  const isAdmin = currentUser.role === 'admin';
  const assignedClass = currentUser.kelas || '';

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(
    isAdmin ? 'SEMUA' : assignedClass
  );

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedQuick, setCopiedQuick] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [classesList, setClassesList] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [stRes, attRes, clRes] = await Promise.all([
          api.getStudents(),
          api.getAttendance(),
          api.getClasses()
        ]);
        setStudents(stRes);
        setRecords(attRes);
        setClassesList(clRes);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter students based on role or selection
  const filteredStudents = students.filter(s => {
    if (!isAdmin) return s.kelas === assignedClass;
    if (selectedClassFilter === 'SEMUA') return true;
    return s.kelas === selectedClassFilter;
  });

  // Filter records based on role or selection
  const filteredRecords = records.filter(r => {
    if (!isAdmin) return r.kelas === assignedClass;
    if (selectedClassFilter === 'SEMUA') return true;
    return r.kelas === selectedClassFilter;
  });

  // Calculate Statistics
  const totalSiswa = filteredStudents.length;
  const hadirCount = filteredRecords.filter(r => r.status === 'H').length;
  const alpaCount = filteredRecords.filter(r => r.status === 'A').length;
  const izinCount = filteredRecords.filter(r => r.status === 'I').length;
  const sakitCount = filteredRecords.filter(r => r.status === 'S').length;
  const totalAbsensi = hadirCount + alpaCount + izinCount + sakitCount;

  const persentaseHadir = totalAbsensi > 0
    ? ((hadirCount / totalAbsensi) * 100).toFixed(1)
    : '0.0';

  // Calculate breakdown per class for Admin chart
  const classBreakdown = classesList.map(c => {
    const classSts = students.filter(s => s.kelas === c.namaKelas).length;
    const classAtt = records.filter(r => r.kelas === c.namaKelas);
    const classHadir = classAtt.filter(r => r.status === 'H').length;
    const classTotal = classAtt.length;
    const pct = classTotal > 0 ? ((classHadir / classTotal) * 100).toFixed(0) : '0';
    return {
      namaKelas: c.namaKelas,
      waliKelas: c.waliKelasNama,
      totalSiswa: classSts,
      hadir: classHadir,
      persentase: Number(pct)
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest mb-1">
            {isAdmin ? 'ADMINISTRATOR SYSTEM' : 'PANEL WALI KELAS'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            {isAdmin ? (
              'DASHBOARD UTAMA'
            ) : (
              <>
                SELAMAT DATANG <span className="text-blue-400">{currentUser.nama}</span>
              </>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isAdmin 
              ? 'Ringkasan data kehadiran siswa Teknik Otomotif SMK 18 LPPM RI Sidareja.'
              : `WALI KELAS ${assignedClass} — Program Keahlian Teknik Otomotif.`
            }
          </p>
        </div>

        {/* Filter per kelas for Admin */}
        {isAdmin && (
          <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <Filter className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">KELAS:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-slate-900 text-white text-xs font-mono font-bold rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="SEMUA">SEMUA KELAS (X-XII)</option>
              <option value="X TO1">X TO1</option>
              <option value="X TO2">X TO2</option>
              <option value="XI TO1">XI TO1</option>
              <option value="XI TO2">XI TO2</option>
              <option value="XII TO1">XII TO1</option>
              <option value="XII TO2">XII TO2</option>
            </select>
          </div>
        )}
      </div>

      {/* Quick Share Link Banner */}
      <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">
              LINK RESMI ABSENSI SISWA
            </div>
            <div className="text-sm font-bold text-white">
              {window.location.origin + window.location.pathname}?view=student-attendance
            </div>
            <p className="text-[11px] text-slate-400">
              Bagikan link ini ke grup WhatsApp siswa agar mereka bisa absen mandiri dari HP.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => {
              const link = `${window.location.origin}${window.location.pathname}?view=student-attendance`;
              navigator.clipboard.writeText(link);
              setCopiedQuick(true);
              setTimeout(() => setCopiedQuick(false), 2500);
            }}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 flex items-center justify-center space-x-2 transition-all"
          >
            {copiedQuick ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
            <span>{copiedQuick ? 'Tersalin!' : 'Salin Link'}</span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Bagikan WA & QR</span>
          </button>
        </div>
      </div>

      {/* 6 Core Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* TOTAL SISWA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest">TOTAL SISWA</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">{totalSiswa}</div>
          <p className="text-[10px] text-slate-500">Siswa Terdaftar</p>
        </div>

        {/* HADIR */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest">HADIR (H)</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">{hadirCount}</div>
          <p className="text-[10px] text-slate-500">Total Absen Hadir</p>
        </div>

        {/* ALPA */}
        <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest">ALPA (A)</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-red-400">{alpaCount}</div>
          <p className="text-[10px] text-slate-500">Tanpa Keterangan</p>
        </div>

        {/* IZIN */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest">IZIN (I)</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">{izinCount}</div>
          <p className="text-[10px] text-slate-500">Dengan Surat Izin</p>
        </div>

        {/* SAKIT */}
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest">SAKIT (S)</span>
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-400">{sakitCount}</div>
          <p className="text-[10px] text-slate-500">Keterangan Sakit</p>
        </div>

        {/* PERSENTASE KEHADIRAN */}
        <div className="bg-slate-900 border border-blue-500/50 rounded-2xl p-4 space-y-2 shadow-lg bg-gradient-to-b from-blue-600/10 to-transparent">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest">KEHADIRAN</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-blue-300">{persentaseHadir}%</div>
          <p className="text-[10px] text-blue-400/80 font-bold">Rata-rata Tingkat Hadir</p>
        </div>

      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Kehadiran Per Kelas */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>PERSENTASE KEHADIRAN PER KELAS</span>
            </h3>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">6 KELAS TO</span>
          </div>

          <div className="space-y-3 pt-2">
            {classBreakdown.map((item) => (
              <div key={item.namaKelas} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-200">{item.namaKelas} <span className="text-slate-500 font-normal">({item.waliKelas})</span></span>
                  <span className="text-blue-400 font-mono">{item.persentase}% ({item.hadir} Hadir)</span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, item.persentase))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Proporsi Status H/A/I/S */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>DISTRIBUSI STATUS ABSENSI</span>
            </h3>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
              TOTAL: {totalAbsensi} RECORD
            </span>
          </div>

          {/* Visual Distribution Bars */}
          <div className="space-y-4 pt-2">
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400">HADIR (H)</span>
                <span className="text-slate-300 font-mono">{hadirCount} Siswa ({totalAbsensi > 0 ? Math.round((hadirCount/totalAbsensi)*100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${totalAbsensi > 0 ? (hadirCount/totalAbsensi)*100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-400">IZIN (I)</span>
                <span className="text-slate-300 font-mono">{izinCount} Siswa ({totalAbsensi > 0 ? Math.round((izinCount/totalAbsensi)*100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${totalAbsensi > 0 ? (izinCount/totalAbsensi)*100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-indigo-400">SAKIT (S)</span>
                <span className="text-slate-300 font-mono">{sakitCount} Siswa ({totalAbsensi > 0 ? Math.round((sakitCount/totalAbsensi)*100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all"
                  style={{ width: `${totalAbsensi > 0 ? (sakitCount/totalAbsensi)*100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-red-400">ALPA (A)</span>
                <span className="text-slate-300 font-mono">{alpaCount} Siswa ({totalAbsensi > 0 ? Math.round((alpaCount/totalAbsensi)*100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-red-500 h-full rounded-full transition-all"
                  style={{ width: `${totalAbsensi > 0 ? (alpaCount/totalAbsensi)*100 : 0}%` }}
                />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Recent Activity Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>AKTIVITAS ABSENSI TERAKHIR</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Asia/Jakarta (WIB)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold">
                <th className="p-3">WAKTU</th>
                <th className="p-3">NIPD</th>
                <th className="p-3">NAMA SISWA</th>
                <th className="p-3">KELAS</th>
                <th className="p-3 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">
                    Belum ada data absensi tercatat.
                  </td>
                </tr>
              ) : (
                filteredRecords.slice(0, 5).map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono text-slate-300">{rec.waktu}</td>
                    <td className="p-3 font-mono text-slate-400">{rec.nis}</td>
                    <td className="p-3 font-bold text-white">{rec.nama}</td>
                    <td className="p-3 font-bold text-amber-400">{rec.kelas}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                        rec.status === 'H' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        rec.status === 'I' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        rec.status === 'S' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                        'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}>
                        {rec.status === 'H' ? 'HADIR (H)' : rec.status === 'I' ? 'IZIN (I)' : rec.status === 'S' ? 'SAKIT (S)' : 'ALPA (A)'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

    </div>
  );
};
