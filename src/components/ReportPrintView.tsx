import React, { useState, useEffect } from 'react';
import { Printer, Download, Eye, FileSpreadsheet, FileText, Filter } from 'lucide-react';
import { Student, AttendanceRecord, ClassItem, SchoolSettings, AuthUser } from '../types';
import { api } from '../services/api';
import { triggerPrint, exportToExcel, exportToCSV } from '../utils/export';

interface ReportPrintViewProps {
  currentUser: AuthUser;
}

export const ReportPrintView: React.FC<ReportPrintViewProps> = ({ currentUser }) => {
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

  const monthlyRecords = records.filter(
    r => r.kelas === selectedClass && r.bulan === Number(selectedMonth) && r.tahun === Number(selectedYear)
  );

  const reportData = classStudents.map((st, idx) => {
    const stRecs = monthlyRecords.filter(r => r.studentId === st.id);
    const h = stRecs.filter(r => r.status === 'H').length;
    const a = stRecs.filter(r => r.status === 'A').length;
    const i = stRecs.filter(r => r.status === 'I').length;
    const s = stRecs.filter(r => r.status === 'S').length;
    const total = h + a + i + s;
    const pct = total > 0 ? ((h / total) * 100).toFixed(1) : '0.0';

    return {
      no: idx + 1,
      nis: st.nis,
      nisn: st.nisn,
      nama: st.nama,
      h,
      a,
      i,
      s,
      total,
      persentase: `${pct}%`
    };
  });

  const handleExcel = () => {
    const data = reportData.map(r => ({
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
    exportToExcel(data, `Laporan-Absensi-${selectedClass}-${monthNames[selectedMonth - 1]}-${selectedYear}`);
  };

  const handleCSV = () => {
    const data = reportData.map(r => ({
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
    exportToCSV(data, `Laporan-Absensi-${selectedClass}-${monthNames[selectedMonth - 1]}-${selectedYear}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Printer className="w-6 h-6 text-amber-400" />
            <span>LAPORAN ABSENSI & CETAK</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cetak rekapitulasi absensi siswa A4 Landscape dengan Kop Resmi dan Tanda Tangan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {isAdmin && (
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-950 text-white font-bold rounded-xl px-3 py-2 border border-slate-700"
            >
              <option value="X TO1">X TO1</option>
              <option value="X TO2">X TO2</option>
              <option value="XI TO1">XI TO1</option>
              <option value="XI TO2">XI TO2</option>
              <option value="XII TO1">XII TO1</option>
              <option value="XII TO2">XII TO2</option>
            </select>
          )}

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-slate-950 text-white font-bold rounded-xl px-3 py-2 border border-slate-700"
          >
            {monthNames.map((m, idx) => (
              <option key={m} value={idx + 1}>{m}</option>
            ))}
          </select>

          <button
            onClick={triggerPrint}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>CETAK / PDF</span>
          </button>

          <button
            onClick={handleExcel}
            className="px-3.5 py-2 bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/60 text-emerald-300 font-bold rounded-xl flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>EXCEL</span>
          </button>

          <button
            onClick={handleCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas (A4 Landscape Styling) */}
      <div className="bg-white text-slate-900 rounded-2xl p-8 shadow-2xl space-y-6 max-w-5xl mx-auto print:p-0 print:shadow-none print:max-w-none">
        
        {/* Kop Laporan Header */}
        <div className="border-b-4 border-double border-slate-900 pb-4">
          <div className="flex items-center justify-center gap-6 mb-2">
            <img 
              src={settings?.logoSekolah || 'https://iili.io/C69Ouou.png'} 
              alt="Logo Sekolah" 
              className="w-20 h-20 object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900">
                {settings?.namaSekolah || 'SMK 18 LPPM RI SIDAREJA'}
              </h2>
              <h3 className="text-base font-extrabold uppercase text-slate-800">
                REKAP KEHADIRAN SISWA
              </h3>
              <p className="text-sm font-bold uppercase text-slate-700">
                PROGRAM KEAHLIAN TEKNIK OTOMOTIF
              </p>
              <p className="text-xs text-slate-600 italic">
                {settings?.alamatSekolah || 'Jl.Jend.Sudirman No.52A Sidamulya,Sidareja, Cilacap, Jawa Tengah 53261'}
              </p>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap justify-between text-xs font-bold text-slate-800 max-w-2xl mx-auto border-t border-slate-300">
            <div>Kelas : <span className="font-extrabold">{selectedClass}</span></div>
            <div>Periode : <span className="font-extrabold">{monthNames[selectedMonth - 1]} {selectedYear}</span></div>
            <div>Wali Kelas : <span className="font-extrabold">{waliKelasNama}</span></div>
          </div>
        </div>

        {/* Table Data Laporan */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-slate-900">
            <thead>
              <tr className="bg-slate-100 text-slate-900 uppercase font-black text-center border-b border-slate-900">
                <th className="p-2 border border-slate-900 w-10">NO</th>
                <th className="p-2 border border-slate-900 text-left">NIPD</th>
                <th className="p-2 border border-slate-900 text-left">NAMA LENGKAP SISWA</th>
                <th className="p-2 border border-slate-900 w-12">H</th>
                <th className="p-2 border border-slate-900 w-12">A</th>
                <th className="p-2 border border-slate-900 w-12">I</th>
                <th className="p-2 border border-slate-900 w-12">S</th>
                <th className="p-2 border border-slate-900 w-16">TOTAL</th>
                <th className="p-2 border border-slate-900 w-24">% KEHADIRAN</th>
              </tr>
            </thead>
            <tbody className="font-medium">
              {reportData.map((row) => (
                <tr key={row.nis} className="border-b border-slate-300">
                  <td className="p-2 text-center font-bold border border-slate-900">{row.no}</td>
                  <td className="p-2 font-mono border border-slate-900">{row.nis}</td>
                  <td className="p-2 font-bold border border-slate-900">{row.nama}</td>
                  <td className="p-2 text-center font-bold border border-slate-900 text-emerald-700">{row.h}</td>
                  <td className="p-2 text-center font-bold border border-slate-900 text-red-700">{row.a}</td>
                  <td className="p-2 text-center font-bold border border-slate-900 text-amber-700">{row.i}</td>
                  <td className="p-2 text-center font-bold border border-slate-900 text-indigo-700">{row.s}</td>
                  <td className="p-2 text-center font-extrabold border border-slate-900">{row.total}</td>
                  <td className="p-2 text-center font-black border border-slate-900">{row.persentase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures Block (Tanda Tangan 3 Pihak) */}
        <div className="pt-8 text-xs font-bold text-slate-900">
          <div className="text-right pb-4">
            Sidareja, 31 {monthNames[selectedMonth - 1]} {selectedYear}
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            
            {/* 1. Kepala Sekolah */}
            <div className="space-y-16">
              <div>
                <p>Mengetahui,</p>
                <p className="font-black">Kepala SMK 18 LPPM RI Sidareja</p>
              </div>
              <div>
                <p className="font-black underline uppercase">{settings?.kepalaSekolah || 'Normalisa Dwi A., S.H., S.Pd., M.Pd.'}</p>
                <p className="text-[10px] text-slate-600 font-normal">NIP. -</p>
              </div>
            </div>

            {/* 2. Kepala Prodi */}
            <div className="space-y-16">
              <div>
                <p>Menyetujui,</p>
                <p className="font-black">Kepala Program Studi Teknik Otomotif</p>
              </div>
              <div>
                <p className="font-black underline uppercase">{settings?.kepalaProdi || 'Antri Wardoyo, S.T.'}</p>
                <p className="text-[10px] text-slate-600 font-normal">Kaprodi Teknik Otomotif</p>
              </div>
            </div>

            {/* 3. Wali Kelas */}
            <div className="space-y-16">
              <div>
                <p>Wali Kelas,</p>
                <p className="font-black">Wali Kelas {selectedClass}</p>
              </div>
              <div>
                <p className="font-black underline uppercase">{waliKelasNama}</p>
                <p className="text-[10px] text-slate-600 font-normal">NIP. -</p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
