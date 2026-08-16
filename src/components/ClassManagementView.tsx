import React, { useState, useEffect } from 'react';
import { School, UserCheck, Edit2, Check, X } from 'lucide-react';
import { ClassItem, Teacher, AuthUser } from '../types';
import { api } from '../services/api';

interface ClassManagementViewProps {
  currentUser: AuthUser;
}

export const ClassManagementView: React.FC<ClassManagementViewProps> = ({ currentUser }) => {
  const isAdmin = currentUser.role === 'admin';

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

  const loadData = async () => {
    try {
      const [clsData, tData] = await Promise.all([
        api.getClasses(),
        api.getTeachers()
      ]);
      setClasses(clsData);
      setTeachers(tData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAssign = (cls: ClassItem) => {
    setEditingClass(cls);
    setSelectedTeacherId(cls.waliKelasId || '');
  };

  const handleSaveAssign = async () => {
    if (!editingClass) return;

    let waliNama = 'Belum ditentukan';
    if (selectedTeacherId) {
      const found = teachers.find(t => t.id === selectedTeacherId);
      if (found) waliNama = found.nama;
    }

    try {
      await api.updateClass(editingClass.id, {
        waliKelasId: selectedTeacherId,
        waliKelasNama: waliNama
      });
      setEditingClass(null);
      loadData();
    } catch (err) {
      alert('Gagal menetapkan wali kelas.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
          <School className="w-6 h-6 text-amber-400" />
          <span>DATA KELAS & WALI KELAS</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Daftar Rombongan Belajar Teknik Otomotif dan Penetapan Wali Kelas SMK 18 LPPM RI Sidareja.
        </p>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold">
                <th className="p-4 w-12 text-center">NO</th>
                <th className="p-4">KELAS</th>
                <th className="p-4">PROGRAM KEAHLIAN</th>
                <th className="p-4">WALI KELAS</th>
                <th className="p-4 text-center">JUMLAH SISWA</th>
                {isAdmin && <th className="p-4 text-center">AKSI</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
              {classes.map((c, idx) => (
                <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-center text-slate-500 font-bold">{idx + 1}</td>
                  <td className="p-4">
                    <span className="font-extrabold text-amber-400 text-sm bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
                      {c.namaKelas}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-white">{c.programKeahlian}</td>
                  <td className="p-4 font-bold">
                    {c.waliKelasNama === 'Belum ditentukan' ? (
                      <span className="text-slate-500 italic">Belum ditentukan</span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4" />
                        <span>{c.waliKelasNama}</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center font-bold text-white text-sm">
                    {c.jumlahSiswa || 0} Siswa
                  </td>
                  {isAdmin && (
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleOpenAssign(c)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg font-bold border border-slate-700 flex items-center justify-center gap-1 mx-auto transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Ubah Wali Kelas</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PENETAPAN WALI KELAS */}
      {editingClass && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase">
                PENETAPAN WALI KELAS: {editingClass.namaKelas}
              </h3>
              <button onClick={() => setEditingClass(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-300">PILIH WALI KELAS *</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm font-bold text-white"
              >
                <option value="">-- Belum Ditentukan --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama} ({t.nip || 'Guru'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setEditingClass(null)}
                className="py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
              >
                BATAL
              </button>
              <button
                onClick={handleSaveAssign}
                className="py-2.5 bg-amber-500 text-slate-950 rounded-xl font-black text-xs shadow-lg shadow-amber-500/20"
              >
                SIMPAN PENETAPAN
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
