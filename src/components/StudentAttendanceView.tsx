import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Home, 
  School,
  Share2,
  X,
  User,
  FileText,
  Search
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { api } from '../services/api';
import { getWibDate, getHariIndo, getTanggalIndo, getTanggalFormatted, getWaktuWib } from '../utils/date';
import { ShareLinkModal } from './ShareLinkModal';

interface StudentAttendanceViewProps {
  onBackToHome: () => void;
  onGoToCheckAttendance?: () => void;
}

export const StudentAttendanceView: React.FC<StudentAttendanceViewProps> = ({ 
  onBackToHome, 
  onGoToCheckAttendance 
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Real-time Clock State
  const [timeInfo, setTimeInfo] = useState({
    hari: getHariIndo(),
    tanggal: getTanggalIndo(),
    waktu: getWaktuWib(),
    tanggalIso: getTanggalFormatted()
  });

  // Direct Student Attendance Form Input
  const [nama, setNama] = useState<string>('');
  const [kelas, setKelas] = useState<string>('X TO1');
  const [status, setStatus] = useState<AttendanceStatus>('H');
  const [keterangan, setKeterangan] = useState<string>('');

  // Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successRecord, setSuccessRecord] = useState<AttendanceRecord | null>(null);
  const [alreadyRecord, setAlreadyRecord] = useState<AttendanceRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  // Trigger Absen Button Handler
  const handleTriggerAbsen = () => {
    if (!nama.trim()) {
      setErrorMessage('Silakan ketik Nama Lengkap Anda terlebih dahulu!');
      return;
    }
    if (!kelas) {
      setErrorMessage('Silakan pilih Kelas Anda!');
      return;
    }
    if ((status === 'S' || status === 'I') && !keterangan.trim()) {
      setErrorMessage(`Silakan isi Catatan / Keterangan alasan ${status === 'S' ? 'Sakit' : 'Izin'}!`);
      return;
    }
    setErrorMessage('');
    setShowConfirmModal(true);
  };

  // Submit Attendance Confirmation
  const handleConfirmAbsen = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const defaultKet = status === 'H' ? 'Hadir Mandiri' : status === 'S' ? 'Sakit' : status === 'I' ? 'Izin' : 'Alpa';
      const payload: Partial<AttendanceRecord> = {
        studentId: 'std-' + Date.now(),
        nis: '-',
        nisn: '-',
        nama: nama.trim(),
        programKeahlian: 'Teknik Otomotif',
        kelas: kelas,
        tanggal: timeInfo.tanggalIso,
        hari: timeInfo.hari,
        waktu: timeInfo.waktu,
        status: status,
        keterangan: keterangan.trim() || defaultKet
      };

      const result = await api.submitAttendance(payload);

      if (result.success && result.record) {
        setSuccessRecord(result.record);
        setAlreadyRecord(null);
      } else if (result.alreadySubmitted && result.data) {
        setAlreadyRecord(result.data);
      } else {
        setErrorMessage(result.error || 'Terjadi kesalahan saat menyimpan absensi.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Gagal menghubungi server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (st: AttendanceStatus) => {
    switch (st) {
      case 'H':
        return <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">H — HADIR</span>;
      case 'I':
        return <span className="font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/30">I — IZIN</span>;
      case 'S':
        return <span className="font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">S — SAKIT</span>;
      case 'A':
        return <span className="font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/30">A — ALPA</span>;
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 relative">
      
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Title */}
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
                ABSENSI SISWA
              </h1>
              <p className="text-xs font-extrabold text-blue-400 tracking-wider uppercase">
                PROGRAM KEAHLIAN TEKNIK OTOMOTIF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onGoToCheckAttendance && (
              <button
                onClick={onGoToCheckAttendance}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700 shadow-lg flex items-center gap-2 transition-all shrink-0"
                title="Cek Status Kehadiran Siswa"
              >
                <Search className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Cek Kehadiran</span>
              </button>
            )}

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all shrink-0"
            >
              <Share2 className="w-4 h-4" />
              <span>Bagikan Link WA / QR</span>
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

        {/* Form Absensi Siswa */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-extrabold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
              <UserCheck className="w-5 h-5 text-blue-400" />
              <span>FORMULIR ABSENSI MANDIRI SISWA</span>
            </h2>
          </div>

          {errorMessage && (
            <div className="bg-red-950/60 border border-red-800/60 rounded-xl p-4 flex items-center gap-3 text-red-200 text-sm">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Direct Input: NAMA LENGKAP SISWA */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              1. NAMA LENGKAP SISWA <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Ketik Nama Lengkap Anda Sesuai Absen..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 pl-11 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Direct Select: KELAS */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              2. KELAS <span className="text-red-400">*</span>
            </label>
            <select
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-emerald-400 focus:outline-none focus:border-blue-500 transition-all font-mono"
            >
              <option value="X TO1">X TO1</option>
              <option value="X TO2">X TO2</option>
              <option value="XI TO1">XI TO1</option>
              <option value="XI TO2">XI TO2</option>
              <option value="XII TO1">XII TO1</option>
              <option value="XII TO2">XII TO2</option>
            </select>
          </div>

          {/* STATUS KEHADIRAN (H, I, S, A) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              3. STATUS KEHADIRAN <span className="text-red-400">*</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus('H')}
                className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                  status === 'H'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${status === 'H' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                <span>H — HADIR</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('I')}
                className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                  status === 'I'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${status === 'I' ? 'bg-blue-400' : 'bg-slate-600'}`} />
                <span>I — IZIN</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('S')}
                className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                  status === 'S'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${status === 'S' ? 'bg-amber-400' : 'bg-slate-600'}`} />
                <span>S — SAKIT</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('A')}
                className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                  status === 'A'
                    ? 'bg-red-500/20 border-red-500 text-red-300 ring-2 ring-red-500/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${status === 'A' ? 'bg-red-400' : 'bg-slate-600'}`} />
                <span>A — ALPA</span>
              </button>
            </div>
          </div>

          {/* CATATAN / KETERANGAN */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>4. CATATAN / KETERANGAN {(status === 'S' || status === 'I') && <span className="text-amber-400 font-bold">* (Wajib)</span>}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={keterangan}
                onChange={(e) => {
                  setKeterangan(e.target.value);
                  setErrorMessage('');
                }}
                placeholder={
                  status === 'S' 
                    ? 'Tuliskan alasan sakit (contoh: Demam/Flu/Surat Dokter)...' 
                    : status === 'I' 
                    ? 'Tuliskan alasan izin (contoh: Keperluan Keluarga)...' 
                    : 'Catatan tambahan (opsional)...'
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pl-11 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
              />
              <FileText className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Program Keahlian (Disabled Auto Field) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              PROGRAM KEAHLIAN
            </label>
            <input
              type="text"
              readOnly
              value="TEKNIK OTOMOTIF"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-blue-400 cursor-not-allowed select-none font-mono"
            />
          </div>

          {/* Main Action Button */}
          <div className="pt-2">
            <button
              onClick={handleTriggerAbsen}
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-black text-lg uppercase tracking-wider shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserCheck className="w-6 h-6" />
              <span>KIRIM ABSENSI SEKARANG</span>
            </button>
          </div>

        </div>

        {/* Back to Home Button */}
        <div className="text-center">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Halaman Utama</span>
          </button>
        </div>

      </div>

      {/* MODAL 1: KONFIRMASI ABSENSI */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <span>KONFIRMASI ABSENSI</span>
              </h3>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 space-y-3 text-sm border border-slate-800">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Nama:</span>
                <span className="font-bold text-white">{nama}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Program Keahlian:</span>
                <span className="font-bold text-amber-400">Teknik Otomotif</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Kelas:</span>
                <span className="font-bold text-emerald-400">{kelas}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Hari:</span>
                <span className="font-bold text-white">{timeInfo.hari}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Tanggal:</span>
                <span className="font-bold text-white">{timeInfo.tanggal}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Waktu:</span>
                <span className="font-mono font-bold text-emerald-400">{timeInfo.waktu}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2 items-center">
                <span className="text-slate-400">Status Kehadiran:</span>
                {getStatusBadge(status)}
              </div>
              {keterangan && (
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Catatan/Keterangan:</span>
                  <span className="font-medium text-slate-200 text-right max-w-[200px] truncate">{keterangan}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase"
              >
                BATAL
              </button>
              <button
                onClick={handleConfirmAbsen}
                className="py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase shadow-lg shadow-amber-500/20"
              >
                KONFIRMASI ABSEN
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: ABSENSI BERHASIL */}
      {successRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl animate-in zoom-in duration-200">
            
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                ✓ ABSENSI BERHASIL
              </h2>
              <p className="text-xs text-slate-400 mt-1">Data absensi Anda telah tercatat dengan aman.</p>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 text-left space-y-2.5 border border-slate-800 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Nama Lengkap:</span>
                <span className="font-bold text-white">{successRecord.nama}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Program Keahlian:</span>
                <span className="font-bold text-amber-400">{successRecord.programKeahlian}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Kelas:</span>
                <span className="font-bold text-emerald-400">{successRecord.kelas}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Hari, Tanggal:</span>
                <span className="font-bold text-white">{successRecord.hari}, {successRecord.tanggal}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Waktu:</span>
                <span className="font-mono font-bold text-emerald-400">{successRecord.waktu}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5 items-center">
                <span className="text-slate-400">Status Kehadiran:</span>
                {getStatusBadge(successRecord.status)}
              </div>
              {successRecord.keterangan && (
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Keterangan:</span>
                  <span className="font-medium text-slate-200 text-right max-w-[200px] truncate">{successRecord.keterangan}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setSuccessRecord(null);
                setNama('');
                setKeterangan('');
                setStatus('H');
                onBackToHome();
              }}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20"
            >
              KEMBALI KE HALAMAN UTAMA
            </button>

          </div>
        </div>
      )}

      {/* MODAL 3: WARNING ABSENSI GANDA */}
      {alreadyRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl animate-in zoom-in duration-200">
            
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400 mx-auto">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-black text-amber-400 uppercase tracking-tight">
                ANDA SUDAH MELAKUKAN ABSENSI HARI INI
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Satu siswa hanya dapat melakukan absensi 1 kali per hari.
              </p>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 text-left space-y-2 border border-slate-800 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Nama:</span>
                <span className="font-bold text-white">{alreadyRecord.nama}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Kelas:</span>
                <span className="font-bold text-emerald-400">{alreadyRecord.kelas}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Tanggal:</span>
                <span className="font-bold text-white">{alreadyRecord.tanggal}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Waktu Absen:</span>
                <span className="font-mono font-bold text-amber-400">{alreadyRecord.waktu}</span>
              </div>
              <div className="flex justify-between pt-1 items-center">
                <span className="text-slate-400">Status Terdaftar:</span>
                {getStatusBadge(alreadyRecord.status)}
              </div>
            </div>

            <button
              onClick={() => {
                setAlreadyRecord(null);
              }}
              className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase"
            >
              MENGERTI & KEMBALI
            </button>

          </div>
        </div>
      )}

      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

    </div>
  );
};
