import React, { useState, useEffect } from 'react';
import { CalendarRange, Filter, FileSpreadsheet, Download } from 'lucide-react';
import { AttendanceRecord, Student, AuthUser } from '../types';
import { api } from '../services/api';
import { exportToExcel } from '../utils/export';

interface RecapWeeklyViewProps {
  currentUser: AuthUser;
}

export const RecapWeeklyView: React.FC<RecapWeeklyViewProps> = ({ currentUser }) => {
  const isAdmin = currentUser.role === 'admin';
  const assignedClass = currentUser.kelas || '';

  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(isAdmin ? 'X TO1' : assignedClass);

  useEffect(() => {
    async function loadData() {
      try {
        const [stData, attData] = await Promise.all([
          api.getStudents(),
          api.getAttendance()
        ]);
        setStudents(stData);
        setRecords(attData);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const classStudents = students.filter(s => s.kelas === selectedClass);

  // Group attendance by student
  const weeklyMatrix = classStudents.map((student, idx) => {
    const studentRecords = records.filter(r => r.studentId === student.id);

    const getStatusForDay = (dayName: string) => {
      const rec = studentRecords.find(r => r.hari.toLowerCase() === dayName.toLowerCase());
      return rec ? rec.status : '-';
    };

    const senin = getStatusForDay('Senin');
    const selasa = getStatusForDay('Selasa');
    const rabu = getStatusForDay('Rabu');
    const kamis = getStatusForDay('Kamis');
    const jumat = getStatusForDay('Jumat');
    const sabtu = getStatusForDay('Sabtu');

    const totalH = studentRecords.filter(r => r.status === 'H').length;
    const totalA = studentRecords.filter(r => r.status === 'A').length;
    const totalI = studentRecords.filter(r => r.status === 'I').length;
    const totalS = studentRecords.filter(r => r.status === 'S').length;

    return {
      no: idx + 1,
      nis: student.nis,
      nama: student.nama,
      kelas: student.kelas,
      senin,
      selasa,
      rabu,
      kamis,
      jumat,
      sabtu,
      totalH,
      totalA,
      totalI,
      totalS
    };
  });

  const handleExport = () => {
    const exportData = weeklyMatrix.map(row => ({
      No: row.no,
      NIPD: row.nis,
      'Nama Lengkap': row.nama,
      Kelas: row.kelas,
      Senin: row.senin,
      Selasa: row.selasa,
      Rabu: row.rabu,
      Kamis: row.kamis,
      Jumat: row.jumat,
      Sabtu: row.sabtu,
      H: row.totalH,
      A: row.totalA,
      I: row.totalI,
      S: row.totalS
    }));
    exportToExcel(exportData, `Rekap-Mingguan-${selectedClass}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <CalendarRange className="w-6 h-6 text-amber-400" />
            <span>REKAP KEHADIRAN MINGGUAN</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Matriks rekapitulasi absensi mingguan (Senin - Sabtu) kode H / A / I / S.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {isAdmin ? (
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
              <Filter className="w-4 h-4 text-amber-400" />
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
          ) : (
            <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-amber-500/30 text-amber-400 font-bold text-xs">
              KELAS: {selectedClass}
            </div>
          )}

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/60 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Table Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold text-center">
                <th className="p-3 w-10">NO</th>
                <th className="p-3 text-left">NIPD</th>
                <th className="p-3 text-left">NAMA LENGKAP</th>
                <th className="p-3">KELAS</th>
                <th className="p-3 bg-slate-900/60">SENIN</th>
                <th className="p-3 bg-slate-900/60">SELASA</th>
                <th className="p-3 bg-slate-900/60">RABU</th>
                <th className="p-3 bg-slate-900/60">KAMIS</th>
                <th className="p-3 bg-slate-900/60">JUMAT</th>
                <th className="p-3 bg-slate-900/60">SABTU</th>
                <th className="p-3 text-emerald-400 bg-emerald-950/40">H</th>
                <th className="p-3 text-red-400 bg-red-950/40">A</th>
                <th className="p-3 text-amber-400 bg-amber-950/40">I</th>
                <th className="p-3 text-indigo-400 bg-indigo-950/40">S</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
              {weeklyMatrix.length === 0 ? (
                <tr>
                  <td colSpan={14} className="p-8 text-center text-slate-500">
                    Tidak ada siswa terdaftar pada kelas ini.
                  </td>
                </tr>
              ) : (
                weeklyMatrix.map((row) => (
                  <tr key={row.nis} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 text-center text-slate-500 font-bold">{row.no}</td>
                    <td className="p-3 font-mono text-slate-400">{row.nis}</td>
                    <td className="p-3 font-bold text-white">{row.nama}</td>
                    <td className="p-3 text-center font-bold text-amber-400">{row.kelas}</td>
                    
                    <td className="p-3 text-center font-bold">{row.senin}</td>
                    <td className="p-3 text-center font-bold">{row.selasa}</td>
                    <td className="p-3 text-center font-bold">{row.rabu}</td>
                    <td className="p-3 text-center font-bold">{row.kamis}</td>
                    <td className="p-3 text-center font-bold">{row.jumat}</td>
                    <td className="p-3 text-center font-bold">{row.sabtu}</td>

                    <td className="p-3 text-center font-extrabold text-emerald-400 bg-emerald-950/20">{row.totalH}</td>
                    <td className="p-3 text-center font-extrabold text-red-400 bg-red-950/20">{row.totalA}</td>
                    <td className="p-3 text-center font-extrabold text-amber-400 bg-amber-950/20">{row.totalI}</td>
                    <td className="p-3 text-center font-extrabold text-indigo-400 bg-indigo-950/20">{row.totalS}</td>
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
