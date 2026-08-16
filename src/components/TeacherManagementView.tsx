import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Edit, Trash2, X, Search, Key, Eye, EyeOff, ShieldCheck, Printer, Download, UserCheck, ArrowLeft } from 'lucide-react';
import { Teacher, AuthUser } from '../types';
import { api } from '../services/api';

interface TeacherManagementViewProps {
  currentUser: AuthUser;
}

export const TeacherManagementView: React.FC<TeacherManagementViewProps> = ({ currentUser }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printLayout, setPrintLayout] = useState<'cards' | 'table'>('cards');
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [formData, setFormData] = useState<Partial<Teacher>>({
    nip: '',
    nama: '',
    mataPelajaran: '',
    jabatan: 'Wali Kelas',
    noHp: '',
    username: '',
    password: 'Terserah18*',
    kelas: '',
    status: 'Aktif',
    role: 'wali_kelas'
  });

  const loadTeachers = async () => {
    try {
      const data = await api.getTeachers();
      setTeachers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const filteredTeachers = teachers.filter((t) => {
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.nama && String(t.nama).toLowerCase().includes(q)) ||
      (t.nip && String(t.nip).toLowerCase().includes(q)) ||
      (t.username && String(t.username).toLowerCase().includes(q))
    );
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await api.updateTeacher(editingTeacher.id, formData);
      } else {
        await api.addTeacher(formData as Omit<Teacher, 'id'>);
      }
      setShowModal(false);
      setEditingTeacher(null);
      resetForm();
      loadTeachers();
    } catch (err) {
      alert('Gagal menyimpan data guru.');
    }
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData(t);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingTeacher) return;
    try {
      await api.deleteTeacher(deletingTeacher.id);
      setDeletingTeacher(null);
      loadTeachers();
    } catch (err) {
      alert('Gagal menghapus data guru.');
    }
  };

  const resetForm = () => {
    setFormData({
      nip: '',
      nama: '',
      mataPelajaran: '',
      jabatan: 'Wali Kelas',
      noHp: '',
      username: '',
      password: 'Terserah18*',
      kelas: '',
      status: 'Aktif',
      role: 'wali_kelas'
    });
  };

  const handleExportCSV = () => {
    const headers = ['NO', 'NAMA GURU', 'NIP', 'JABATAN', 'KELAS AMPU', 'USERNAME', 'PASSWORD', 'STATUS'];
    const rows = teachers.map((t, index) => [
      index + 1,
      `"${t.nama.replace(/"/g, '""')}"`,
      `"${t.nip || '-'}"`,
      `"${t.jabatan.replace(/"/g, '""')}"`,
      `"${t.kelas || '-'}"`,
      `"${t.username}"`,
      `"${t.password || '-'}"`,
      `"${t.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kredensial_Akun_Guru_WaliKelas_SMK18_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-amber-400" />
            <span>DATA GURU & WALI KELAS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pengelolaan data tenaga pendidik, wali kelas & kredensial login (Username & Password).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Export Data Akun ke File CSV Excel"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-colors"
            title="Cetak Kredensial Akun Wali Kelas & Guru"
          >
            <Printer className="w-4 h-4" />
            <span>CETAK AKUN</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setEditingTeacher(null);
              setShowModal(true);
            }}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>TAMBAH GURU</span>
          </button>
        </div>
      </div>

      {/* Info Banner for Admin */}
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-200">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-amber-300">Pengelolaan Kredensial Wali Kelas</p>
          <p className="text-slate-300">
            Username dan Password untuk login Wali Kelas dikelola secara resmi melalui tabel di bawah ini. Anda dapat menambah, melihat, atau mengubah password kapan saja.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        
        <div className="p-4 border-b border-slate-800">
          <div className="relative max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama Guru, NIP, atau Username..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 pl-9 text-xs text-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold">
                <th className="p-3.5 w-12 text-center">NO</th>
                <th className="p-3.5">NIP / NUPTK</th>
                <th className="p-3.5">NAMA GURU</th>
                <th className="p-3.5">JABATAN</th>
                <th className="p-3.5">USERNAME</th>
                <th className="p-3.5">PASSWORD</th>
                <th className="p-3.5 text-center">KELAS AMPU</th>
                <th className="p-3.5 text-center">STATUS</th>
                <th className="p-3.5 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
              {filteredTeachers.map((t, idx) => {
                const isVisible = !!showPasswords[t.id];
                return (
                  <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 text-center text-slate-500 font-bold">{idx + 1}</td>
                    <td className="p-3.5 font-mono text-slate-300">{t.nip || '-'}</td>
                    <td className="p-3.5 font-bold text-white">{t.nama}</td>
                    <td className="p-3.5 text-slate-300">{t.jabatan}</td>
                    <td className="p-3.5 font-mono text-amber-400 font-bold">{t.username}</td>
                    <td className="p-3.5 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          {isVisible ? (t.password || (t.role === 'admin' ? 'admin123' : 'Terserah18*')) : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(t.id)}
                          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                          title={isVisible ? 'Sembunyikan Password' : 'Lihat Password'}
                        >
                          {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5 text-center font-bold">
                      {t.kelas ? (
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                          {t.kelas}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 rounded bg-slate-800 text-amber-400 hover:bg-slate-700"
                          title="Edit Data Guru"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingTeacher(t)}
                          className="p-1.5 rounded bg-red-950/50 text-red-400 hover:bg-red-900/60"
                          title="Hapus Guru"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL: FORM GURU */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase">
                {editingTeacher ? 'EDIT DATA GURU' : 'TAMBAH GURU BARU'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              
              <div className="space-y-1">
                <label className="font-bold text-slate-300">NIP / NUPTK</label>
                <input
                  type="text"
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">NAMA GURU *</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">MATA PELAJARAN</label>
                <input
                  type="text"
                  value={formData.mataPelajaran}
                  onChange={(e) => setFormData({ ...formData, mataPelajaran: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">JABATAN</label>
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">KELAS DIAMPU</label>
                  <select
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                  >
                    <option value="">-- Tidak ada --</option>
                    <option value="X TO1">X TO1</option>
                    <option value="X TO2">X TO2</option>
                    <option value="XI TO1">XI TO1</option>
                    <option value="XI TO2">XI TO2</option>
                    <option value="XII TO1">XII TO1</option>
                    <option value="XII TO2">XII TO2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">USERNAME LOGIN *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">PASSWORD *</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>
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

      {/* MODAL PRINT ACCOUNT CREDENTIALS */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
            
            {/* Modal Controls Bar (Sticky Top Header) */}
            <div className="sticky top-0 z-20 bg-slate-900 border-b border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Kembali"
                >
                  <ArrowLeft className="w-4 h-4 text-amber-400" />
                  <span>KEMBALI</span>
                </button>

                <div>
                  <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Printer className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                    <span>CETAK AKUN WALI KELAS & GURU</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 hidden sm:block">
                    Pilih mode tampilan dan cetak kartu/tabel kredensial akun.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
                  <button
                    onClick={() => setPrintLayout('cards')}
                    className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                      printLayout === 'cards' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Kartu Akun
                  </button>
                  <button
                    onClick={() => setPrintLayout('table')}
                    className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                      printLayout === 'table' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tabel Rekap
                  </button>
                </div>

                <button
                  onClick={handleTriggerPrint}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>CETAK</span>
                </button>

                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 bg-red-500/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl border border-red-500/40 transition-all flex items-center justify-center ml-1"
                  title="Tutup Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Printable Document Sheet Container */}
            <div className="overflow-y-auto p-4 sm:p-6 flex-1 bg-slate-950/40 space-y-4">
              <div id="print-sheet" className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-xl space-y-6 text-xs max-w-2xl mx-auto">
              
              {/* Document Header Kop Surat */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src="https://iili.io/C69Ouou.png"
                    alt="Logo Sekolah"
                    className="w-16 h-16 object-contain"
                  />
                  <div>
                    <h2 className="text-base font-black tracking-tight text-slate-900 uppercase">
                      SMK 18 LPPM RI SIDAREJA
                    </h2>
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                      PROGRAM KEAHLIAN TEKNIK OTOMOTIF
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      Jl. Jend. Sudirman No. 52A Sidamulya, Sidareja, Cilacap, Jawa Tengah 53261
                    </p>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-600 font-mono">
                  <p>Tgl Cetak: <strong>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
                  <p>Tahun Ajaran: <strong>2026/2027</strong></p>
                </div>
              </div>

              <div className="text-center space-y-1">
                <h1 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  KREDENSIAL AKUN LOGIN WALI KELAS & GURU
                </h1>
                <p className="text-[11px] text-slate-600">
                  Rahasia & Resmi — Digunakan untuk Akses Sistem Absensi Siswa Teknik Otomotif
                </p>
              </div>

              {/* Layout Mode: CARDS */}
              {printLayout === 'cards' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {teachers.map((t) => (
                    <div key={t.id} className="border-2 border-slate-800 rounded-xl p-4 bg-slate-50 relative overflow-hidden space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-700" />
                          <span className="font-black text-slate-900 text-xs">{t.nama}</span>
                        </div>
                        {t.kelas && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded">
                            {t.kelas}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Jabatan:</span>
                          <span className="font-semibold text-slate-800">{t.jabatan || 'Guru Pengampu'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">NIP:</span>
                          <span className="font-mono text-slate-800">{t.nip || '-'}</span>
                        </div>
                      </div>

                      <div className="bg-slate-900 text-white p-2.5 rounded-lg grid grid-cols-2 gap-2 font-mono text-xs mt-2">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold">Username:</span>
                          <strong className="text-amber-400">{t.username}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold">Password:</span>
                          <strong className="text-emerald-400">{t.password}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Layout Mode: TABLE */}
              {printLayout === 'table' && (
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold uppercase border-b border-slate-300">
                        <th className="p-2 border border-slate-300 text-center w-8">NO</th>
                        <th className="p-2 border border-slate-300">NAMA GURU</th>
                        <th className="p-2 border border-slate-300">JABATAN</th>
                        <th className="p-2 border border-slate-300 text-center">KELAS</th>
                        <th className="p-2 border border-slate-300 font-mono">USERNAME</th>
                        <th className="p-2 border border-slate-300 font-mono">PASSWORD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 text-slate-800">
                      {teachers.map((t, index) => (
                        <tr key={t.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-2 border border-slate-300 text-center font-bold">{index + 1}</td>
                          <td className="p-2 border border-slate-300 font-bold">{t.nama}</td>
                          <td className="p-2 border border-slate-300">{t.jabatan}</td>
                          <td className="p-2 border border-slate-300 text-center font-bold text-amber-800">{t.kelas || '-'}</td>
                          <td className="p-2 border border-slate-300 font-mono font-bold text-slate-900">{t.username}</td>
                          <td className="p-2 border border-slate-300 font-mono font-bold text-emerald-700">{t.password}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Document Signatures Footer */}
              <div className="pt-8 flex justify-between items-end text-slate-900 text-[11px]">
                <div className="text-center space-y-12">
                  <p>Mengetahui,<br /><strong>Kepala SMK 18 LPPM RI Sidareja</strong></p>
                  <p className="font-bold underline">Normalisa Dwi A., S.H., S.Pd., M.Pd.</p>
                </div>

                <div className="text-center space-y-12">
                  <p>Sidareja, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br /><strong>Kepala Program Studi Teknik Otomotif</strong></p>
                  <p className="font-bold underline">Antri Wardoyo, S.T.</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
      )}

      {/* MODAL DELETE */}
      {deletingTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <h3 className="text-sm font-black text-white">KONFIRMASI HAPUS GURU</h3>
            <p className="text-xs text-slate-300">Yakin menghapus guru <strong>{deletingTeacher.nama}</strong>?</p>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <button onClick={() => setDeletingTeacher(null)} className="py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">BATAL</button>
              <button onClick={handleDelete} className="py-2 bg-red-600 text-white rounded-xl font-black">HAPUS</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
