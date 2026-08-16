import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Search, Calendar, Edit, Trash2, X, Filter } from 'lucide-react';
import { AttendanceRecord, Student, AttendanceStatus, AuthUser } from '../types';
import { api } from '../services/api';
import { getTanggalFormatted, getHariIndo, getWaktuWib } from '../utils/date';

interface AttendanceCorrectionViewProps {
  currentUser: AuthUser;
}

export const AttendanceCorrectionView: React.FC<AttendanceCorrectionViewProps> = ({ currentUser }) => {
  const isAdmin = currentUser.role === 'admin';
  const assignedClass = currentUser.kelas || '';

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(isAdmin ? 'SEMUA' : assignedClass);
  const [selectedDate, setSelectedDate] = useState<string>(getTanggalFormatted());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Manual Entry / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  // Manual Form State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [status, setStatus] = useState<AttendanceStatus>('H');
  const [keterangan, setKeterangan] = useState<string>('');

  const loadData = async () => {
    try {
      const [attData, stData] = await Promise.all([
        api.getAttendance(),
        api.getStudents()
      ]);
      setRecords(attData);
      setStudents(stData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Students for Manual Selection Modal
  const availableStudentsForModal = students.filter(s => {
    if (!isAdmin) return s.kelas === assignedClass;
    if (selectedClass !== 'SEMUA') return s.kelas === selectedClass;
    return true;
  });

  // Filtered Records
  const filteredRecords = records.filter(r => {
    if (!isAdmin && r.kelas !== assignedClass) return false;
    if (isAdmin && selectedClass !== 'SEMUA' && r.kelas !== selectedClass) return false;
    if (selectedDate && r.tanggal !== selectedDate) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (r.nama && String(r.nama).toLowerCase().includes(q)) || (r.nis && String(r.nis).toLowerCase().includes(q));
    }
    return true;
  });

  const handleOpenAddManual = () => {
    setEditingRecord(null);
    setSelectedStudentId('');
    setStatus('H');
    setKeterangan('Input Manual Wali/Admin');
    setShowModal(true);
  };

  const handleOpenEdit = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setSelectedStudentId(rec.studentId);
    setStatus(rec.status);
    setKeterangan(rec.keterangan || '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRecord) {
      await api.updateAttendance(editingRecord.id, {
        status,
        keterangan
      });
    } else {
      const st = students.find(s => s.id === selectedStudentId);
      if (!st) {
        alert('Pilih siswa terlebih dahulu!');
        return;
      }
      const result = await api.submitAttendance({
        studentId: st.id,
        nis: st.nis,
        nisn: st.nisn,
        nama: st.nama,
        programKeahlian: 'Teknik Otomotif',
        kelas: st.kelas,
        tanggal: selectedDate,
        hari: getHariIndo(new Date(selectedDate)),
        waktu: getWaktuWib(),
        status,
        keterangan
      });

      if (!result.success) {
        alert(result.error || 'Gagal menyimpan absensi.');
        return;
      }
    }

    setShowModal(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus record absensi ini?')) {
      await api.deleteAttendance(id);
      loadData();
    }
  };

  const handleClearAllAttendance = async () => {
    if (confirm('Yakin ingin MENGOSONGKAN SELURUH RIWAYAT ABSENSI? Data yang dihapus tidak dapat dikembalikan.')) {
      await api.deleteAllAttendance();
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-amber-400" />
            <span>KOREKSI & ABSENSI MANUAL</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Input absensi manual atau koreksi status kehadiran (H/A/I/S) siswa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && records.length > 0 && (
            <button
              onClick={handleClearAllAttendance}
              className="px-3.5 py-2.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 font-bold text-xs rounded-xl border border-red-800/60 flex items-center gap-1.5 transition-colors"
              title="Kosongkan seluruh riwayat absensi"
            >
              <Trash2 className="w-4 h-4" />
              <span>KOSONGKAN ABSENSI</span>
            </button>
          )}

          <button
            onClick={handleOpenAddManual}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>INPUT ABSENSI MANUAL</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        
        {/* Date Selector */}
        <div className="space-y-1">
          <label className="font-bold text-slate-400 uppercase tracking-wider block">TANGGAL:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
          />
        </div>

        {/* Class Filter */}
        {isAdmin ? (
          <div className="space-y-1">
            <label className="font-bold text-slate-400 uppercase tracking-wider block">KELAS:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
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
        ) : (
          <div className="space-y-1">
            <label className="font-bold text-slate-400 uppercase tracking-wider block">KELAS:</label>
            <input
              type="text"
              readOnly
              value={assignedClass}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-bold"
            />
          </div>
        )}

        {/* Search */}
        <div className="space-y-1">
          <label className="font-bold text-slate-400 uppercase tracking-wider block">CARI SISWA:</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama atau NIPD..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 pl-8 text-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold">
                <th className="p-3.5 w-12 text-center">NO</th>
                <th className="p-3.5">NIPD</th>
                <th className="p-3.5">NAMA LENGKAP</th>
                <th className="p-3.5">KELAS</th>
                <th className="p-3.5">HARI, TANGGAL</th>
                <th className="p-3.5">WAKTU</th>
                <th className="p-3.5 text-center">STATUS</th>
                <th className="p-3.5">KETERANGAN</th>
                <th className="p-3.5 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    Tidak ada data absensi untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, idx) => (
                  <tr key={rec.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-3.5 font-mono text-slate-300">{rec.nis}</td>
                    <td className="p-3.5 font-bold text-white">{rec.nama}</td>
                    <td className="p-3.5 font-bold text-amber-400">{rec.kelas}</td>
                    <td className="p-3.5 text-slate-300">{rec.hari}, {rec.tanggal}</td>
                    <td className="p-3.5 font-mono text-slate-300">{rec.waktu}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                        rec.status === 'H' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        rec.status === 'I' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        rec.status === 'S' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                        'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}>
                        {rec.status === 'H' ? 'H — HADIR' : rec.status === 'I' ? 'I — IZIN' : rec.status === 'S' ? 'S — SAKIT' : 'A — ALPA'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 italic max-w-xs truncate">{rec.keterangan || '-'}</td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:bg-slate-700"
                          title="Edit Status"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="p-1.5 rounded-lg bg-red-950/50 text-red-400 hover:bg-red-900/60"
                          title="Hapus Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM KOREKSI / MANUAL ENTRY */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase">
                {editingRecord ? 'KOREKSI STATUS ABSENSI' : 'INPUT ABSENSI MANUAL'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              
              {!editingRecord ? (
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">PILIH SISWA *</label>
                  <select
                    required
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {availableStudentsForModal.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama} — {s.kelas} (NIS: {s.nis})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-white text-sm">{editingRecord.nama}</div>
                  <div className="text-[11px] text-amber-400 font-bold">{editingRecord.kelas} — NIS: {editingRecord.nis}</div>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-300">STATUS KEHADIRAN *</label>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  
                  <button
                    type="button"
                    onClick={() => setStatus('H')}
                    className={`p-2.5 rounded-xl font-bold text-xs border transition-all ${
                      status === 'H' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    H — HADIR
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('I')}
                    className={`p-2.5 rounded-xl font-bold text-xs border transition-all ${
                      status === 'I' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    I — IZIN
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('S')}
                    className={`p-2.5 rounded-xl font-bold text-xs border transition-all ${
                      status === 'S' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    S — SAKIT
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('A')}
                    className={`p-2.5 rounded-xl font-bold text-xs border transition-all ${
                      status === 'A' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    A — ALPA
                  </button>

                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">KETERANGAN / CATATAN</label>
                <textarea
                  rows={2}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: Izin Lomba, Surat Dokter, Koreksi dari Wali Kelas..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-slate-950 rounded-xl font-black"
                >
                  SIMPAN
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
