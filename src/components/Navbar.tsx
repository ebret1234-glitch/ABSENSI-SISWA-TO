import React, { useState, useRef, useEffect } from 'react';
import { Wrench, UserCheck, ShieldAlert, UserCheck2, LogOut, Share2, MoreVertical, KeyRound, Search } from 'lucide-react';
import { AuthUser } from '../types';
import { ShareLinkModal } from './ShareLinkModal';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  currentUser,
  onLogout
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const loginMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (loginMenuRef.current && !loginMenuRef.current.contains(e.target as Node)) {
        setIsLoginMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & Header Title */}
            <div 
              onClick={() => setCurrentView('landing')}
              className="flex items-center space-x-3.5 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform overflow-hidden">
                <img 
                  src="https://iili.io/C69Ouou.png" 
                  alt="Logo SMK 18 LPPM RI Sidareja" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-blue-400 tracking-widest uppercase">
                  SMK 18 LPPM RI SIDAREJA
                </div>
                <div className="text-sm sm:text-base font-black text-white tracking-tight uppercase flex items-center gap-1.5">
                  ABSENSI SISWA TEKNIK OTOMOTIF
                </div>
              </div>
            </div>

            {/* Top Right Navigation Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all shadow-md"
                title="Salin/Bagikan Link Absensi Siswa"
              >
                <Share2 className="w-4 h-4 text-blue-400" />
                <span className="hidden md:inline">BAGIKAN </span>
                <span>LINK</span>
              </button>

              {currentUser ? (
                <div className="flex items-center space-x-3 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-white">{currentUser.nama}</div>
                    <div className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                      {currentUser.role === 'admin' ? 'Administrator' : `Wali Kelas ${currentUser.kelas || ''}`}
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-red-400 bg-red-950/40 hover:bg-red-900/60 rounded-lg border border-red-800/40 transition-colors"
                    title="Keluar"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentView('check-attendance')}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                      currentView === 'check-attendance'
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20 font-black'
                        : 'bg-slate-900 text-emerald-400 hover:bg-emerald-600/10 border border-emerald-500/30'
                    }`}
                    title="Cek Status Kehadiran Siswa"
                  >
                    <Search className="w-4 h-4" />
                    <span>CEK KEHADIRAN</span>
                  </button>

                  <button
                    onClick={() => setCurrentView('student-attendance')}
                    className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                      currentView === 'student-attendance'
                        ? 'bg-blue-600 text-white shadow-blue-500/20'
                        : 'bg-slate-900 text-blue-400 hover:bg-blue-600/10 border border-blue-500/30'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>ABSENSI SISWA</span>
                  </button>

                  {/* 3-DOTS MENU FOR CHOOING LOGIN TYPE */}
                  <div className="relative" ref={loginMenuRef}>
                    <button
                      onClick={() => setIsLoginMenuOpen(!isLoginMenuOpen)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                        isLoginMenuOpen || currentView === 'admin-login' || currentView === 'wali-login'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/20'
                          : 'bg-slate-900 text-slate-200 hover:bg-slate-800 border-slate-800'
                      }`}
                      title="Pilih Akses Login (Admin / Wali Kelas)"
                    >
                      <MoreVertical className="w-5 h-5 text-amber-400" />
                      <span className="hidden sm:inline">LOGIN</span>
                    </button>

                    {isLoginMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-3 py-2 border-b border-slate-800 mb-1">
                          <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>PILIH AKSES LOGIN</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setCurrentView('admin-login');
                            setIsLoginMenuOpen(false);
                          }}
                          className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            currentView === 'admin-login'
                              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                              : 'text-slate-200 hover:bg-slate-800 hover:text-amber-400'
                          }`}
                        >
                          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                          <div className="text-left">
                            <div className="font-extrabold uppercase">LOGIN ADMIN</div>
                            <div className="text-[10px] text-slate-400 font-normal">Administrator & Kaprodi</div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setCurrentView('wali-login');
                            setIsLoginMenuOpen(false);
                          }}
                          className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all mt-1 ${
                            currentView === 'wali-login'
                              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                              : 'text-slate-200 hover:bg-slate-800 hover:text-emerald-400'
                          }`}
                        >
                          <UserCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="text-left">
                            <div className="font-extrabold uppercase">LOGIN WALI KELAS</div>
                            <div className="text-[10px] text-slate-400 font-normal">Akses Wali Kelas</div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </header>

      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </>
  );
};
