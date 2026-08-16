import React, { useState } from 'react';
import { UserCheck2, User, Lock, AlertCircle, ArrowLeft, GraduationCap } from 'lucide-react';
import { api } from '../services/api';
import { AuthUser } from '../types';

interface WaliKelasLoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
  onBackToHome: () => void;
}

export const WaliKelasLoginView: React.FC<WaliKelasLoginViewProps> = ({
  onLoginSuccess,
  onBackToHome
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Force clear form fields on mount to prevent browser autofill
  React.useEffect(() => {
    setUsername('');
    setPassword('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login(username, password, 'wali_kelas');
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'Login wali kelas gagal. Periksa Username/NIP dan Password.');
      }
    } catch (err) {
      setError('Gagal menghubungkan ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      
      <div className="max-w-md w-full space-y-6">
        
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Utama</span>
        </button>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <UserCheck2 className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              LOGIN WALI KELAS
            </h1>
            <p className="text-xs text-slate-400">
              SMK 18 LPPM RI SIDAREJA — TEKNIK OTOMOTIF
            </p>
          </div>

          {error && (
            <div className="bg-red-950/60 border border-red-800/60 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* Hidden dummy inputs to trick browser autofill engines */}
            <input type="text" name="fake_username_wali" className="hidden" tabIndex={-1} autoComplete="off" />
            <input type="password" name="fake_password_wali" className="hidden" tabIndex={-1} autoComplete="off" />
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                USERNAME / NIP
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="wali_login_username_custom"
                  required
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan Username atau NIP..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-sm font-medium text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="wali_login_password_custom"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan Password..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-sm font-medium text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all"
            >
              {loading ? 'MEMPROSES...' : 'LOGIN WALI KELAS'}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
};
