import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, KeyRound, ShieldAlert } from 'lucide-react';
import { SchoolSettings } from '../types';
import { api } from '../services/api';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SchoolSettings>({
    namaSekolah: 'SMK 18 LPPM RI SIDAREJA',
    programKeahlian: 'TEKNIK OTOMOTIF',
    kepalaSekolah: 'Normalisa Dwi A., S.H., S.Pd., M.Pd.',
    jabatanKepalaSekolah: 'Kepala SMK 18 LPPM RI Sidareja',
    kepalaProdi: 'Antri Wardoyo, S.T.',
    jabatanKepalaProdi: 'Kepala Program Studi Teknik Otomotif',
    tahunPelajaran: '2026/2027',
    alamatSekolah: 'Jl.Jend.Sudirman No.52A Sidamulya,Sidareja, Cilacap, Jawa Tengah 53261',
    logoSekolah: 'https://iili.io/C69Ouou.png',
    adminPassword: ''
  });

  const [adminPassInput, setAdminPassInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [passSavedMessage, setPassSavedMessage] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.getSettings();
        setSettings(res);
        if (res.adminPassword) {
          setAdminPassInput(res.adminPassword);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Gagal menyimpan pengaturan.');
    }
  };

  const handleUpdateAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassInput || adminPassInput.trim().length < 3) {
      alert('Password minimal 3 karakter.');
      return;
    }

    try {
      const res = await api.changePassword({
        role: 'admin',
        newPassword: adminPassInput.trim()
      });

      if (res.success) {
        setPassSavedMessage(res.message || 'Password Admin berhasil diperbarui!');
        setTimeout(() => setPassSavedMessage(''), 3000);
      } else {
        alert(res.error || 'Gagal mengubah password admin');
      }
    } catch (err) {
      alert('Gagal mengubah password admin.');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-400" />
          <span>PENGATURAN APLIKASI & KOP LAPORAN</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Pengaturan identitas sekolah, pejabat penandatangan laporan, tahun pelajaran aktif, & password admin.
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-xl p-4 flex items-center gap-2 text-xs font-bold text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Pengaturan aplikasi berhasil disimpan!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            
            <div className="space-y-1">
              <label className="font-bold text-slate-300">NAMA SEKOLAH *</label>
              <input
                type="text"
                required
                value={settings.namaSekolah}
                onChange={(e) => setSettings({ ...settings, namaSekolah: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-bold text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">PROGRAM KEAHLIAN *</label>
              <input
                type="text"
                required
                value={settings.programKeahlian}
                onChange={(e) => setSettings({ ...settings, programKeahlian: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-bold text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">TAHUN PELAJARAN AKTIF *</label>
              <input
                type="text"
                required
                value={settings.tahunPelajaran}
                onChange={(e) => setSettings({ ...settings, tahunPelajaran: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-bold text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">NAMA KEPALA SEKOLAH *</label>
              <input
                type="text"
                required
                value={settings.kepalaSekolah}
                onChange={(e) => setSettings({ ...settings, kepalaSekolah: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-bold text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">NAMA KEPALA PROGRAM STUDI *</label>
              <input
                type="text"
                required
                value={settings.kepalaProdi}
                onChange={(e) => setSettings({ ...settings, kepalaProdi: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-bold text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">ALAMAT SEKOLAH</label>
              <input
                type="text"
                value={settings.alamatSekolah || ''}
                onChange={(e) => setSettings({ ...settings, alamatSekolah: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-bold text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">URL LOGO SEKOLAH</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={settings.logoSekolah || 'https://iili.io/C69Ouou.png'}
                  onChange={(e) => setSettings({ ...settings, logoSekolah: e.target.value })}
                  placeholder="https://iili.io/C69Ouou.png"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-white"
                />
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center shrink-0">
                  <img 
                    src={settings.logoSekolah || 'https://iili.io/C69Ouou.png'} 
                    alt="Logo Sekolah" 
                    className="max-h-full max-w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>SIMPAN PENGATURAN</span>
              </button>
            </div>

          </form>
        </div>

        {/* Custom Admin Password Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 h-fit">
          <div className="flex items-center space-x-2 text-amber-400 font-black text-sm uppercase">
            <ShieldAlert className="w-5 h-5" />
            <span>CUSTOM PASSWORD ADMIN</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Atur password khusus untuk akses login Administrator.
          </p>

          {passSavedMessage && (
            <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-xl p-3 text-xs font-bold text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{passSavedMessage}</span>
            </div>
          )}

          <form onSubmit={handleUpdateAdminPassword} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">PASSWORD ADMIN BARU</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={adminPassInput}
                  onChange={(e) => setAdminPassInput(e.target.value)}
                  placeholder="Masukkan password admin baru..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 pl-9 font-mono text-white text-xs"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>SIMPAN PASSWORD ADMIN</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

