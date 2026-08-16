import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Copy, Check, MessageSquare, X, ExternalLink, QrCode, Sparkles } from 'lucide-react';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ isOpen, onClose }) => {
  const [selectedLinkType, setSelectedLinkType] = useState<'attendance' | 'check'>('attendance');
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  // Construct full URLs
  const baseUrl = window.location.origin + window.location.pathname;
  const attendanceUrl = `${baseUrl}?view=student-attendance`;
  const checkUrl = `${baseUrl}?view=check-attendance`;

  const currentUrl = selectedLinkType === 'attendance' ? attendanceUrl : checkUrl;
  const currentTitle = selectedLinkType === 'attendance' ? 'LINK ABSENSI SISWA' : 'LINK CEK KEHADIRAN SISWA';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const attendanceShareText = `*ABSENSI SISWA TEKNIK OTOMOTIF*\n*SMK 18 LPPM RI SIDAREJA*\n\nHalo siswa-siswi Teknik Otomotif, silakan lakukan absensi harian melalui link resmi berikut:\n${attendanceUrl}\n\n*Catatan:* Pastikan nama & kelas sesuai. Absensi hanya dapat dilakukan 1 kali per hari.`;

  const checkShareText = `*CEK KEHADIRAN SISWA TEKNIK OTOMOTIF*\n*SMK 18 LPPM RI SIDAREJA*\n\nIngin memeriksa apakah data absensi siswa sudah tercatat? Silakan cek langsung melalui link berikut:\n${checkUrl}\n\n*Catatan:* Ketik nama lengkap siswa dan pilih tanggal untuk melihat status absensi.`;

  const shareText = selectedLinkType === 'attendance' ? attendanceShareText : checkShareText;

  const handleShareWhatsApp = () => {
    const encodedText = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                BAGIKAN LINK RESMI
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                SMK 18 LPPM RI Sidareja — Teknik Otomotif
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Link Type Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setSelectedLinkType('attendance');
              setCopied(false);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              selectedLinkType === 'attendance'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Link Absensi Siswa
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedLinkType('check');
              setCopied(false);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              selectedLinkType === 'check'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Link Cek Kehadiran
          </button>
        </div>

        {/* Link Box & Copy */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
            {currentTitle}
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-blue-400 font-bold select-all focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>
          </div>
          {copied && (
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 animate-pulse pt-1">
              <Check className="w-3.5 h-3.5" /> Link berhasil disalin ke clipboard! Siap dibagikan.
            </p>
          )}
        </div>

        {/* Quick Action Share Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleShareWhatsApp}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Kirim via WhatsApp</span>
          </button>

          <button
            onClick={() => setShowQr(!showQr)}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700 flex items-center justify-center space-x-2 transition-all"
          >
            <QrCode className="w-4 h-4 text-blue-400" />
            <span>{showQr ? 'Sembunyikan QR' : 'Tampilkan QR Code'}</span>
          </button>
        </div>

        {/* QR Code Expandable Area */}
        {showQr && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center space-y-4 animate-fadeIn">
            <div className="inline-block p-4 bg-white rounded-2xl shadow-xl">
              <QRCodeSVG
                value={currentUrl}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Pindai QR Code
              </p>
              <p className="text-[11px] text-slate-400">
                Arahkan kamera HP ke QR Code untuk langsung membuka {selectedLinkType === 'attendance' ? 'Formulir Absensi Siswa' : 'Halaman Cek Kehadiran Siswa'}.
              </p>
            </div>
          </div>
        )}

        {/* Direct Open Button */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Link selalu online & aktif.
          </span>
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
          >
            <span>Uji Coba Buka Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
};
