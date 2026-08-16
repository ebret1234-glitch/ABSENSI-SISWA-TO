import React, { useState, useRef } from 'react';
import { Database, Download, Upload, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const BackupRestoreView: React.FC = () => {
  const [restoring, setRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackupDownload = () => {
    window.location.href = '/api/backup';
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('PERINGATAN: Memulihkan backup akan menggantikan seluruh data aplikasi saat ini. Lanjutkan restore?')) {
      return;
    }

    setRestoring(true);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const rawJson = evt.target?.result as string;
        const parsed = JSON.parse(rawJson);
        const result = await api.restoreBackup(parsed);

        if (result.success) {
          setStatusMessage({ type: 'success', text: 'Data aplikasi berhasil dipulihkan dari file backup!' });
        } else {
          setStatusMessage({ type: 'error', text: result.error || 'Gagal memulihkan backup.' });
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'File backup JSON tidak valid!' });
      } finally {
        setRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
          <Database className="w-6 h-6 text-amber-400" />
          <span>BACKUP & RESTORE DATABASE</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Pencadangan dan pemulihan seluruh data absensi, siswa, guru, kelas, & pengaturan sistem dalam format JSON.
        </p>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
          statusMessage.type === 'success' ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-200' : 'bg-red-950/60 border-red-800/60 text-red-200'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 2 Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* BACKUP DATA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white uppercase">1. BACKUP DATA APLIKASI</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Unduh seluruh snapshot data aplikasi saat ini sebagai file backup format JSON.
            </p>
          </div>
          <button
            onClick={handleBackupDownload}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>UNDUH BACKUP JSON</span>
          </button>
        </div>

        {/* RESTORE DATA */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white uppercase">2. RESTORE DATA APLIKASI</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Kembalikan seluruh data aplikasi dari file cadangan backup JSON sebelumnya.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRestoreFile}
            accept=".json"
            className="hidden"
          />

          <button
            disabled={restoring}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider border border-slate-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-blue-400 ${restoring ? 'animate-spin' : ''}`} />
            <span>{restoring ? 'MEMULIHKAN...' : 'UNGGAH & RESTORE JSON'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
