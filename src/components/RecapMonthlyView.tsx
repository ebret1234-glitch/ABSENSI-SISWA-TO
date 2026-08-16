import React, { useState, useEffect } from 'react';
import { CalendarDays, Filter, FileSpreadsheet, Printer } from 'lucide-react';
import { AttendanceRecord, Student, ClassItem, SchoolSettings, AuthUser } from '../types';
import { api } from '../services/api';
import { exportToExcel } from '../utils/export';

interface RecapMonthlyViewProps {
  currentUser: AuthUser;
}

export const RecapMonthlyView: React.FC<RecapMonthlyViewProps> = ({ currentUser }) => {
  const isAdmin = currentUser.role === 'admin';
  const assignedClass = currentUser.kelas || '';

  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);

  const [selectedClass, setSelectedClass] = useState<string>(isAdmin ? 'X TO1' : assignedClass);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // Agustus
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  useEffect(() => {
    async function loadData() {
      try {
        const [stData, attData, clsData, setRes] = await Promise.all([
          api.getStudents(),
          api.getAttendance(),
          api.getClasses(),
          api.getSettings()
        ]);
        setStudents(stData);
        setRecords(attData);
        setClasses(clsData);
        setSettings(setRes);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const currentClassObj = classes.find(c => c.namaKelas === selectedClass);
  const waliKelasNama = currentClassObj ? currentClassObj.waliKelasNama : 'Belum ditentukan';

  const classStudents = students.filter(s => s.kelas === selectedClass);

  // Filter records for selected month & year
  const monthlyRecords = records.filter(
    r => r.kelas === selectedClass && r.bulan === Number(selectedMonth) && r.tahun === Number(selectedYear)
  );

  const monthlySummary = classStudents.map((st, idx) => {
    const stRecs = monthlyRecords.filter(r => r.studentId === st.id);
    const h = stRecs.filter(r => r.status === 'H').length;
    const a = stRecs.filter(r => r.status === 'A').length;
    const i = stRecs.filter(r => r.status === 'I').length;
    const s = stRecs.filter(r => r.status === 'S').length;
    const total = h + a + i + s;
    const persentase = total > 0 ? ((h / total) * 100).toFixed(1) : '0.0';

    return {
      no: idx + 1,
      nis: st.nis,
      nama: st.nama,
      h,
      a,
      i,
      s,
      total,
      persentase: `${persentase}%`
    };
  });

  const handleExport = () => {
    const exportData = monthlySummary.map(r => ({
      No: r.no,
      NIPD: r.nis,
      'Nama Lengkap': r.nama,
      Hadir: r.h,
      Alpa: r.a,
      Izin: r.i,
      Sakit: r.s,
      Total: r.total,
      'Persentase Kehadiran': r.persentase
    }));
    exportToExcel(exportData, `Rekap-Bulanan-${selectedClass}-${monthNames[selectedMonth - 1]}-${selectedYear}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-amber-400" />
            <span>REKAP KEHADIRAN BULANAN</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rekapitulasi absensi bulanan siswa dengan persentase kehadiran otomatis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {isAdmin && (
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-400">KELAS:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none"
              >
                <option value="X TO1" className="bg-slate-900">X TO1</option>
                <option value="X TO2" className="bg-slate-900">X TO2</option>
                <option value="XI TO1" className="bg-slate-900">XI TO1</option>
                <option value="XI TO2" className="bg-slate-900">XI TO2</option>
                <option value="XII TO1" className="bg-slate-900">XII TO1</option>
                <option value="XII TO2" className="bg-slate-900">XII TO2</option>
              </select>
            </div>
          )}

          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <span className="font-bold text-slate-400">BULAN:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-white font-bold focus:outline-none"
            >
              {monthNames.map((m, idx) => (
                <option key={m} value={idx + 1} className="bg-slate-900">{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <span className="font-bold text-slate-400">TAHUN:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-white font-bold focus:outline-none"
            >
              <option value={2026} className="bg-slate-900">2026</option>
              <option value={2027} className="bg-slate-900">2027</option>
            </select>
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/60 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Kop & Preview Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Kop Header Display */}
        <div className="text-center border-b-2 border-slate-700 pb-4 space-y-1">
          <h2 className="text-lg sm:text-xl font-black text-amber-400 tracking-wider uppercase">
            {settings?.namaSekolah || 'SMK 18 LPPM RI SIDAREJA'}
          </h2>
          <h3 className="text-sm font-bold text-white uppercase tracking-tight">
            REKAP KEHADIRAN SISWA BULANAN
          </h3>
          <p className="text-xs font-bold text-emerald-400 uppercase">
            PROGRAM KEAHLIAN TEKNIK OTOMOTIF
          </p>
          
          <div className="pt-3 grid grid-cols-3 gap-2 max-w-xl mx-auto text-xs font-semibold text-slate-300">
            <div>Kelas: <span className="text-amber-400 font-bold">{selectedClass}</span></div>
            <div>Periode: <span className="text-white font-bold">{monthNames[selectedMonth - 1]} {selectedYear}</span></div>
            <div>Wali Kelas: <span className="text-emerald-400 font-bold">{waliKelasNama}</span></div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold">
                <th className="p-3 w-12 text-center">NO</th>
                <th className="p-3">NIPD</th>
                <th className="p-3">NAMA LENGKAP SISWA</th>
                <th className="p-3 text-center text-emerald-400 bg-emerald-950/40">H</th>
                <th className="p-3 text-center text-red-400 bg-red-950/40">A</th>
                <th className="p-3 text-center text-amber-400 bg-amber-950/40">I</th>
                <th className="p-3 text-center text-indigo-400 bg-indigo-950/40">S</th>
                <th className="p-3 text-center bg-slate-950">TOTAL</th>
                <th className="p-3 text-center text-amber-300 bg-amber-950/30">% KEHADIRAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
              {monthlySummary.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    Tidak ada siswa pada kelas ini.
                  </td>
                </tr>
              ) : (
                monthlySummary.map((r) => (
                  <tr key={r.nis} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 text-center text-slate-500 font-bold">{r.no}</td>
                    <td className="p-3 font-mono text-slate-300">{r.nis}</td>
                    <td className="p-3 font-bold text-white">{r.nama}</td>
                    <td className="p-3 text-center font-bold text-emerald-400 bg-emerald-950/10">{r.h}</td>
                    <td className="p-3 text-center font-bold text-red-400 bg-red-950/10">{r.a}</td>
                    <td className="p-3 text-center font-bold text-amber-400 bg-amber-950/10">{r.i}</td>
                    <td className="p-3 text-center font-bold text-indigo-400 bg-indigo-950/10">{r.s}</td>
                    <td className="p-3 text-center font-bold text-white bg-slate-950">{r.total}</td>
                    <td className="p-3 text-center font-extrabold text-amber-300 bg-amber-950/20">{r.persentase}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
