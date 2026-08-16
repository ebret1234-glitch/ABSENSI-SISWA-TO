import React, { useState, useEffect } from 'react';
import { Calendar, Filter, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { AttendanceRecord, AuthUser } from '../types';
import { api } from '../services/api';
import { exportToExcel } from '../utils/export';

interface RecapYearlyViewProps {
  currentUser: AuthUser;
}

export const RecapYearlyView: React.FC<RecapYearlyViewProps> = ({ currentUser }) => {
  const isAdmin = currentUser.role === 'admin';
  const assignedClass = currentUser.kelas || '';

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(isAdmin ? 'SEMUA' : assignedClass);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  useEffect(() => {
    async function loadData() {
      try {
        const attData = await api.getAttendance();
        setRecords(attData);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const academicMonths = [
    { num: 7, name: 'Juli' },
    { num: 8, name: 'Agustus' },
    { num: 9, name: 'September' },
    { num: 10, name: 'Oktober' },
    { num: 11, name: 'November' },
    { num: 12, name: 'Desember' },
    { num: 1, name: 'Januari' },
    { num: 2, name: 'Februari' },
    { num: 3, name: 'Maret' },
    { num: 4, name: 'April' },
    { num: 5, name: 'Mei' },
    { num: 6, name: 'Juni' }
  ];

  const yearlyData = academicMonths.map((m, idx) => {
    const monthRecs = records.filter(r => {
      if (selectedClass !== 'SEMUA' && r.kelas !== selectedClass) return false;
      return r.bulan === m.num;
    });

    const h = monthRecs.filter(r => r.status === 'H').length;
    const a = monthRecs.filter(r => r.status === 'A').length;
    const i = monthRecs.filter(r => r.status === 'I').length;
    const s = monthRecs.filter(r => r.status === 'S').length;
    const total = h + a + i + s;

    return {
      no: idx + 1,
      bulan: m.name,
      h,
      a,
      i,
      s,
      total
    };
  });

  const grandTotalH = yearlyData.reduce((acc, row) => acc + row.h, 0);
  const grandTotalA = yearlyData.reduce((acc, row) => acc + row.a, 0);
  const grandTotalI = yearlyData.reduce((acc, row) => acc + row.i, 0);
  const grandTotalS = yearlyData.reduce((acc, row) => acc + row.s, 0);
  const grandTotal = grandTotalH + grandTotalA + grandTotalI + grandTotalS;

  const handleExport = () => {
    const exportData = yearlyData.map(r => ({
      No: r.no,
      Bulan: r.bulan,
      Hadir: r.h,
      Alpa: r.a,
      Izin: r.i,
      Sakit: r.s,
      Total: r.total
    }));
    exportToExcel(exportData, `Rekap-Tahunan-${selectedClass}-${selectedYear}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            <span>REKAP KEHADIRAN TAHUNAN</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rekapitulasi total absensi 12 bulan (Tahun Pelajaran 2026/2027).
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
                <option value="SEMUA" className="bg-slate-900">SEMUA KELAS (X-XII)</option>
                <option value="X TO1" className="bg-slate-900">X TO1</option>
                <option value="X TO2" className="bg-slate-900">X TO2</option>
                <option value="XI TO1" className="bg-slate-900">XI TO1</option>
                <option value="XI TO2" className="bg-slate-900">XI TO2</option>
                <option value="XII TO1" className="bg-slate-900">XII TO1</option>
                <option value="XII TO2" className="bg-slate-900">XII TO2</option>
              </select>
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

      {/* Yearly Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-6">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold">
                <th className="p-3.5 w-12 text-center">NO</th>
                <th className="p-3.5">BULAN</th>
                <th className="p-3.5 text-center text-emerald-400 bg-emerald-950/30">H</th>
                <th className="p-3.5 text-center text-red-400 bg-red-950/30">A</th>
                <th className="p-3.5 text-center text-amber-400 bg-amber-950/30">I</th>
                <th className="p-3.5 text-center text-indigo-400 bg-indigo-950/30">S</th>
                <th className="p-3.5 text-center bg-slate-950">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
              {yearlyData.map((row) => (
                <tr key={row.bulan} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5 text-center text-slate-500 font-bold">{row.no}</td>
                  <td className="p-3.5 font-bold text-white">{row.bulan}</td>
                  <td className="p-3.5 text-center font-bold text-emerald-400 bg-emerald-950/10">{row.h}</td>
                  <td className="p-3.5 text-center font-bold text-red-400 bg-red-950/10">{row.a}</td>
                  <td className="p-3.5 text-center font-bold text-amber-400 bg-amber-950/10">{row.i}</td>
                  <td className="p-3.5 text-center font-bold text-indigo-400 bg-indigo-950/10">{row.s}</td>
                  <td className="p-3.5 text-center font-bold text-white bg-slate-950">{row.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-950 text-amber-400 font-black uppercase border-t-2 border-slate-700">
                <td colSpan={2} className="p-3.5 text-right">TOTAL KESELURUHAN:</td>
                <td className="p-3.5 text-center text-emerald-400">{grandTotalH}</td>
                <td className="p-3.5 text-center text-red-400">{grandTotalA}</td>
                <td className="p-3.5 text-center text-amber-400">{grandTotalI}</td>
                <td className="p-3.5 text-center text-indigo-400">{grandTotalS}</td>
                <td className="p-3.5 text-center text-white">{grandTotal}</td>
              </tr>
            </tfoot>
          </table>
        </div>

      </div>

    </div>
  );
};
