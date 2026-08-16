import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  Filter,
  FileText,
  Eye,
  Printer,
  UserCheck,
  Phone,
  MapPin,
  Calendar,
  Contact2,
  HeartPulse,
  User,
  ArrowLeft,
  Save
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, AuthUser } from '../types';
import { api } from '../services/api';
import { exportToExcel, exportToCSV } from '../utils/export';

export function formatFullAddress(st: Partial<Student>): string {
  const parts: string[] = [];
  if (st.dusun) parts.push(st.dusun);
  if (st.rt || st.rw) {
    const rtStr = st.rt ? `RT ${st.rt}` : '';
    const rwStr = st.rw ? `RW ${st.rw}` : '';
    parts.push([rtStr, rwStr].filter(Boolean).join(' / '));
  }
  if (st.desa) parts.push(`Desa/Kel. ${st.desa}`);
  if (st.kecamatan) parts.push(`Kec. ${st.kecamatan}`);
  if (st.kabupaten) parts.push(`Kab/Kota ${st.kabupaten}`);
  if (st.provinsi) parts.push(`Prov. ${st.provinsi}`);
  if (st.kodePos) parts.push(`Kode Pos ${st.kodePos}`);

  if (parts.length > 0) {
    return parts.join(', ');
  }
  return st.alamat || '-';
}

interface StudentManagementViewProps {
  currentUser: AuthUser;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({ currentUser }) => {
  const isAdmin = currentUser.role === 'admin';
  const assignedClass = currentUser.kelas || '';

  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>(
    isAdmin ? 'SEMUA' : assignedClass
  );

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [viewingBiodataStudent, setViewingBiodataStudent] = useState<Student | null>(null);

  // Import Preview Modal States
  const [importPreviewStudents, setImportPreviewStudents] = useState<any[] | null>(null);
  const [importFileName, setImportFileName] = useState<string>('');
  const [isSavingImport, setIsSavingImport] = useState<boolean>(false);

  const handleConfirmSaveImport = async () => {
    if (!importPreviewStudents || importPreviewStudents.length === 0) return;

    setIsSavingImport(true);
    try {
      const result = await api.importStudents(importPreviewStudents);

      if (isAdmin) {
        const firstImportedClass = importPreviewStudents[0]?.kelas;
        if (firstImportedClass && selectedClass !== 'SEMUA' && selectedClass !== firstImportedClass) {
          setSelectedClass('SEMUA');
        }
      }

      alert(`✅ BERHASIL DISIMPAN KE DATABASE!\n\n• Total Data: ${importPreviewStudents.length} siswa\n• Ditambahkan: ${result.added} siswa baru\n• Diperbarui: ${result.updated} siswa`);
      
      setImportPreviewStudents(null);
      setImportFileName('');
      loadStudents();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data import ke database.');
    } finally {
      setIsSavingImport(false);
    }
  };

  const handleClearAllStudents = async () => {
    try {
      await api.deleteAllStudents();
      setShowClearAllModal(false);
      loadStudents();
    } catch (err) {
      alert('Gagal mengosongkan data siswa.');
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    nis: '',
    nisn: '',
    nama: '',
    jenisKelamin: 'L',
    programKeahlian: 'Teknik Otomotif',
    kelas: isAdmin ? 'X TO1' : assignedClass,
    tempatLahir: '',
    tanggalLahir: '',
    noHp: '',
    alamat: '',
    dusun: '',
    desa: '',
    rt: '',
    rw: '',
    kecamatan: '',
    kabupaten: '',
    provinsi: '',
    kodePos: '',
    namaAyah: '',
    namaIbu: '',
    pekerjaanAyah: '',
    pekerjaanIbu: '',
    namaOrtu: '',
    noHpOrtu: '',
    pekerjaanOrtu: '',
    agama: 'Islam',
    golonganDarah: '-',
    status: 'Aktif'
  });

  const handleAddressFieldChange = (field: keyof Student, val: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: val };
      const autoAddress = formatFullAddress(updated);
      return {
        ...updated,
        alamat: autoAddress !== '-' ? autoAddress : (updated.alamat || '')
      };
    });
  };

  const loadStudents = async () => {
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Filtered Students List
  const filteredStudents = students.filter((st) => {
    if (!isAdmin && st.kelas !== assignedClass) return false;
    if (isAdmin && selectedClass !== 'SEMUA' && st.kelas !== selectedClass) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        (st.nama && String(st.nama).toLowerCase().includes(q)) ||
        (st.nis && String(st.nis).toLowerCase().includes(q)) ||
        (st.nisn && String(st.nisn).toLowerCase().includes(q)) ||
        (st.namaAyah && String(st.namaAyah).toLowerCase().includes(q)) ||
        (st.namaIbu && String(st.namaIbu).toLowerCase().includes(q)) ||
        (st.namaOrtu && String(st.namaOrtu).toLowerCase().includes(q)) ||
        (st.alamat && String(st.alamat).toLowerCase().includes(q)) ||
        (st.dusun && String(st.dusun).toLowerCase().includes(q)) ||
        (st.desa && String(st.desa).toLowerCase().includes(q)) ||
        (st.kecamatan && String(st.kecamatan).toLowerCase().includes(q)) ||
        (st.kabupaten && String(st.kabupaten).toLowerCase().includes(q)) ||
        (st.provinsi && String(st.provinsi).toLowerCase().includes(q)) ||
        (st.kodePos && String(st.kodePos).toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Handle Create/Update Form Submit
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.updateStudent(editingStudent.id, formData);
      } else {
        await api.addStudent(formData as Omit<Student, 'id'>);
      }
      setShowAddModal(false);
      setEditingStudent(null);
      resetForm();
      loadStudents();
    } catch (err) {
      alert('Gagal menyimpan data siswa.');
    }
  };

  const handleOpenEdit = (st: Student) => {
    setEditingStudent(st);
    setFormData(st);
    setShowAddModal(true);
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    try {
      await api.deleteStudent(deletingStudent.id);
      setDeletingStudent(null);
      loadStudents();
    } catch (err) {
      alert('Gagal menghapus siswa.');
    }
  };

  const resetForm = () => {
    setFormData({
      nis: '',
      nisn: '',
      nama: '',
      jenisKelamin: 'L',
      programKeahlian: 'Teknik Otomotif',
      kelas: isAdmin ? 'X TO1' : assignedClass,
      tempatLahir: '',
      tanggalLahir: '',
      noHp: '',
      alamat: '',
      dusun: '',
      desa: '',
      rt: '',
      rw: '',
      kecamatan: '',
      kabupaten: '',
      provinsi: '',
      kodePos: '',
      namaAyah: '',
      namaIbu: '',
      pekerjaanAyah: '',
      pekerjaanIbu: '',
      namaOrtu: '',
      noHpOrtu: '',
      pekerjaanOrtu: '',
      agama: 'Islam',
      golonganDarah: '-',
      status: 'Aktif'
    });
  };

  // Print Biodata Card
  const handlePrintBiodata = (s: Student) => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>BIODATA SISWA - ${s.nama}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; }
          .header { text-align: center; border-bottom: 3px double #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 18px; font-weight: bold; }
          .subtitle { font-size: 13px; color: #475569; }
          .biodata-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin-top: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          td { padding: 8px 10px; vertical-align: top; }
          td.label { width: 35%; font-weight: bold; color: #334155; background: #f8fafc; }
          .footer { margin-top: 40px; text-align: right; font-size: 13px; }
          .signature-space { height: 60px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header" style="display: flex; align-items: center; justify-content: center; gap: 20px;">
          <img src="https://iili.io/C69Ouou.png" alt="Logo Sekolah" style="width: 70px; height: 70px; object-fit: contain;" />
          <div>
            <div class="title">SMK 18 LPPM RI SIDAREJA</div>
            <div class="subtitle">PROGRAM KEAHLIAN: TEKNIK OTOMOTIF</div>
            <div style="font-size: 11px; color: #475569; font-style: italic; margin-top: 2px;">Jl.Jend.Sudirman No.52A Sidamulya,Sidareja, Cilacap, Jawa Tengah 53261</div>
            <div style="font-size: 15px; font-weight: bold; margin-top: 6px; text-decoration: underline;">
              LEMBAR BIODATA SISWA
            </div>
          </div>
        </div>

        <div class="biodata-box">
          <table border="1" borderColor="#e2e8f0">
            <tr>
              <td class="label">Nama Lengkap</td>
              <td><strong>${s.nama}</strong></td>
            </tr>
            <tr>
              <td class="label">NIPD / NISN</td>
              <td>${s.nis} / ${s.nisn}</td>
            </tr>
            <tr>
              <td class="label">Kelas & Program</td>
              <td>${s.kelas} (${s.programKeahlian})</td>
            </tr>
            <tr>
              <td class="label">Jenis Kelamin</td>
              <td>${s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
            </tr>
            <tr>
              <td class="label">Tempat, Tanggal Lahir</td>
              <td>${s.tempatLahir || '-'}, ${s.tanggalLahir || '-'}</td>
            </tr>
            <tr>
              <td class="label">Agama</td>
              <td>${s.agama || 'Islam'}</td>
            </tr>
            <tr>
              <td class="label">Golongan Darah</td>
              <td>${s.golonganDarah || '-'}</td>
            </tr>
            <tr>
              <td class="label">Nomor HP Siswa</td>
              <td>${s.noHp || '-'}</td>
            </tr>
            <tr>
              <td class="label">Alamat Rumah</td>
              <td>${formatFullAddress(s)}</td>
            </tr>
            <tr>
              <td class="label">Rincian Alamat</td>
              <td>
                Dusun: ${s.dusun || '-'}<br/>
                RT / RW: RT ${s.rt || '-'}/RW ${s.rw || '-'}<br/>
                Desa/Kel: ${s.desa || '-'}, Kec: ${s.kecamatan || '-'}<br/>
                Kab/Kota: ${s.kabupaten || '-'}, Prov: ${s.provinsi || '-'} (${s.kodePos || '-'})
              </td>
            </tr>
            <tr>
              <td class="label">Nama Ayah</td>
              <td>${s.namaAyah || s.namaOrtu || '-'}</td>
            </tr>
            <tr>
              <td class="label">Pekerjaan Ayah</td>
              <td>${s.pekerjaanAyah || s.pekerjaanOrtu || '-'}</td>
            </tr>
            <tr>
              <td class="label">Nama Ibu</td>
              <td>${s.namaIbu || '-'}</td>
            </tr>
            <tr>
              <td class="label">Pekerjaan Ibu</td>
              <td>${s.pekerjaanIbu || '-'}</td>
            </tr>
            <tr>
              <td class="label">No. HP Orang Tua / Wali</td>
              <td>${s.noHpOrtu || '-'}</td>
            </tr>
            <tr>
              <td class="label">Status Keaktifan</td>
              <td>${s.status}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Sidareja, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p>Wali Kelas ${s.kelas},</p>
          <div class="signature-space"></div>
          <p>___________________________</p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  // Import Excel / CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const arrayBuffer = evt.target?.result;
        if (!arrayBuffer) return;

        // Read Excel / CSV as array buffer
        const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 1. Convert sheet to 2D matrix of strings (header: 1)
        const rawMatrix: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' });

        if (!rawMatrix || rawMatrix.length === 0) {
          alert('File Excel/CSV kosong.');
          return;
        }

        // 2. Detect the actual Header Row index (supports files with titles/metadata at the top)
        let headerRowIdx = -1;
        let maxHeaderScore = 0;

        for (let r = 0; r < Math.min(25, rawMatrix.length); r++) {
          const rowStr = (rawMatrix[r] || [])
            .map((c: any) => String(c || '').toLowerCase().trim())
            .join(' ');

          let score = 0;
          if (rowStr.includes('nama')) score += 3;
          if (rowStr.includes('peserta didik') || rowStr.includes('siswa')) score += 2;
          if (rowStr.includes('nipd') || rowStr.includes('nis')) score += 2;
          if (rowStr.includes('nisn')) score += 2;
          if (rowStr.includes('jk') || rowStr.includes('kelamin')) score += 2;
          if (rowStr.includes('kelas') || rowStr.includes('rombel')) score += 2;
          if (rowStr.includes('alamat')) score += 1;

          if (score > maxHeaderScore) {
            maxHeaderScore = score;
            headerRowIdx = r;
          }
        }

        if (headerRowIdx === -1 || maxHeaderScore < 2) {
          headerRowIdx = 0;
        }

        const rawHeaders: string[] = (rawMatrix[headerRowIdx] || []).map((h: any) => String(h || '').trim());
        const dataRows = rawMatrix.slice(headerRowIdx + 1);

        // Helper to match column index by candidates & excludes
        const findColIdx = (candidates: string[], excludes: string[] = []): number => {
          // Pass 1: Exact match
          for (let i = 0; i < rawHeaders.length; i++) {
            const h = rawHeaders[i].toLowerCase().trim();
            if (excludes.some(ex => h.includes(ex.toLowerCase()))) continue;
            if (candidates.some(cand => h === cand.toLowerCase().trim())) {
              return i;
            }
          }
          // Pass 2: Contains match
          for (let i = 0; i < rawHeaders.length; i++) {
            const h = rawHeaders[i].toLowerCase().trim();
            if (excludes.some(ex => h.includes(ex.toLowerCase()))) continue;
            if (candidates.some(cand => h.includes(cand.toLowerCase().trim()))) {
              return i;
            }
          }
          return -1;
        };

        const namaIdx = findColIdx(
          ['nama lengkap', 'nama peserta didik', 'nama siswa', 'nama_lengkap', 'nama', 'full name', 'peserta didik', 'siswa'],
          ['ayah', 'ibu', 'ortu', 'wali', 'sekolah', 'guru']
        );
        const nisIdx = findColIdx(
          ['nipd', 'nis', 'no induk', 'nomor induk', 'nipd/nis', 'nipd / nisn', 'no. induk', 'nis/nipd'],
          ['nisn']
        );
        const nisnIdx = findColIdx(['nisn', 'no nisn', 'no. nisn', 'nomor nisn']);
        const jkIdx = findColIdx(['jk', 'l/p', 'jenis kelamin', 'gender', 'sex']);
        const kelasIdx = findColIdx(['kelas', 'rombel', 'rombongan belajar', 'class', 'tingkat/kelas']);
        const tempatLahirIdx = findColIdx(['tempat lahir', 'tempat lahir siswa', 'tempat_lahir', 'tempat']);
        const tglLahirIdx = findColIdx(['tanggal lahir', 'tgl lahir', 'tgl. lahir', 'tanggal_lahir', 'tgl_lahir'], ['tempat']);
        const noHpIdx = findColIdx(['no hp', 'no. hp', 'no telp', 'no. telp', 'no telepon', 'hp', 'telepon', 'handphone'], ['ortu', 'ayah', 'ibu', 'wali']);

        const dusunIdx = findColIdx(['dusun', 'kampung', 'jalan']);
        const desaIdx = findColIdx(['desa', 'kelurahan', 'desa/kelurahan', 'desa / kelurahan']);
        const rtIdx = findColIdx(['rt', 'no rt']);
        const rwIdx = findColIdx(['rw', 'no rw']);
        const kecamatanIdx = findColIdx(['kecamatan', 'kec']);
        const kabupatenIdx = findColIdx(['kabupaten', 'kota', 'kab']);
        const provinsiIdx = findColIdx(['provinsi', 'prov']);
        const kodePosIdx = findColIdx(['kode pos', 'kodepos', 'pos']);
        const rawAlamatIdx = findColIdx(['alamat', 'alamat lengkap', 'alamat jalan']);

        const namaAyahIdx = findColIdx(['nama ayah', 'ayah kandung', 'nama_ayah', 'ayah']);
        const namaIbuIdx = findColIdx(['nama ibu', 'ibu kandung', 'nama_ibu', 'ibu']);
        const pekerjaanAyahIdx = findColIdx(['pekerjaan ayah']);
        const pekerjaanIbuIdx = findColIdx(['pekerjaan ibu']);
        const namaOrtuIdx = findColIdx(['nama ortu', 'nama orang tua', 'nama wali']);
        const pekerjaanOrtuIdx = findColIdx(['pekerjaan ortu', 'pekerjaan orang tua', 'pekerjaan wali']);
        const noHpOrtuIdx = findColIdx(['no hp ortu', 'no hp wali', 'no telp ortu']);

        const valAt = (row: any[], idx: number): string => {
          if (idx < 0 || idx >= row.length || row[idx] === undefined || row[idx] === null) return '';
          return String(row[idx]).trim();
        };

        const normalizeKelas = (rawK: string): string => {
          if (!rawK) return '';
          const upper = rawK.toUpperCase().replace(/\s+/g, ' ').trim();
          if (upper.includes('X') && upper.includes('1') && !upper.includes('XI')) return 'X TO1';
          if (upper.includes('X') && upper.includes('2') && !upper.includes('XI')) return 'X TO2';
          if (upper.includes('XI') && upper.includes('1') && !upper.includes('XII')) return 'XI TO1';
          if (upper.includes('XI') && upper.includes('2') && !upper.includes('XII')) return 'XI TO2';
          if (upper.includes('XII') && upper.includes('1')) return 'XII TO1';
          if (upper.includes('XII') && upper.includes('2')) return 'XII TO2';
          return rawK;
        };

        const defaultClass = assignedClass || (selectedClass !== 'SEMUA' ? selectedClass : 'X TO1');

        const mappedStudents: any[] = [];

        dataRows.forEach((row: any[]) => {
          if (!row || !Array.isArray(row) || row.length === 0) return;

          const namaVal = valAt(row, namaIdx);

          // Skip empty or header/footer rows
          if (!namaVal || namaVal === '' || namaVal === '-') return;
          const lowerNama = namaVal.toLowerCase();
          if (
            lowerNama === 'nama' ||
            lowerNama === 'nama lengkap' ||
            lowerNama === 'nama siswa' ||
            lowerNama.includes('jumlah') ||
            lowerNama.includes('total') ||
            lowerNama.includes('mengetahui') ||
            lowerNama.includes('kepala sekolah') ||
            lowerNama.includes('nip.')
          ) {
            return;
          }

          const rawNis = valAt(row, nisIdx);
          const rawNisn = valAt(row, nisnIdx);
          const jkRaw = valAt(row, jkIdx).toUpperCase();
          const jenisKelamin: 'L' | 'P' = (jkRaw.includes('P') || jkRaw.includes('PEREMPUAN') || jkRaw.includes('FEMALE')) ? 'P' : 'L';

          const rawClass = valAt(row, kelasIdx);
          const kelas = normalizeKelas(rawClass) || defaultClass;

          const tempatLahir = valAt(row, tempatLahirIdx);
          const tanggalLahir = valAt(row, tglLahirIdx);
          const noHp = valAt(row, noHpIdx);

          const dusun = valAt(row, dusunIdx);
          const desa = valAt(row, desaIdx);
          const rt = valAt(row, rtIdx);
          const rw = valAt(row, rwIdx);
          const kecamatan = valAt(row, kecamatanIdx);
          const kabupaten = valAt(row, kabupatenIdx);
          const provinsi = valAt(row, provinsiIdx);
          const kodePos = valAt(row, kodePosIdx);

          const rawAlamat = valAt(row, rawAlamatIdx);
          const formattedAddress = formatFullAddress({ dusun, desa, rt, rw, kecamatan, kabupaten, provinsi, kodePos, alamat: rawAlamat });

          const namaAyah = valAt(row, namaAyahIdx);
          const namaIbu = valAt(row, namaIbuIdx);
          const pekerjaanAyah = valAt(row, pekerjaanAyahIdx);
          const pekerjaanIbu = valAt(row, pekerjaanIbuIdx);
          const namaOrtu = valAt(row, namaOrtuIdx) || namaAyah;
          const pekerjaanOrtu = valAt(row, pekerjaanOrtuIdx) || pekerjaanAyah;
          const noHpOrtu = valAt(row, noHpOrtuIdx);

          mappedStudents.push({
            nis: rawNis || '-',
            nisn: rawNisn || '-',
            nama: namaVal,
            jenisKelamin,
            programKeahlian: 'Teknik Otomotif',
            kelas,
            tempatLahir,
            tanggalLahir,
            noHp,
            dusun,
            desa,
            rt,
            rw,
            kecamatan,
            kabupaten,
            provinsi,
            kodePos,
            alamat: rawAlamat || formattedAddress,
            namaAyah,
            namaIbu,
            pekerjaanAyah,
            pekerjaanIbu,
            namaOrtu,
            pekerjaanOrtu,
            noHpOrtu,
            status: 'Aktif'
          });
        });

        if (mappedStudents.length === 0) {
          alert('Tidak ada data siswa yang valid ditemukan di dalam file Excel/CSV.');
          return;
        }

        setImportFileName(file.name);
        setImportPreviewStudents(mappedStudents);
      } catch (err) {
        console.error(err);
        alert('Gagal membaca file Excel/CSV. Pastikan file valid.');
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Export
  const handleExportExcel = () => {
    const exportData = filteredStudents.map((s, idx) => ({
      No: idx + 1,
      NIPD: s.nis,
      NISN: s.nisn,
      'Nama Lengkap': s.nama,
      JK: s.jenisKelamin,
      'Program Keahlian': s.programKeahlian,
      Kelas: s.kelas,
      'Tempat Lahir': s.tempatLahir || '-',
      'Tanggal Lahir': s.tanggalLahir || '-',
      'No HP': s.noHp || '-',
      Dusun: s.dusun || '-',
      'Desa/Kelurahan': s.desa || '-',
      RT: s.rt || '-',
      RW: s.rw || '-',
      Kecamatan: s.kecamatan || '-',
      'Kabupaten/Kota': s.kabupaten || '-',
      Provinsi: s.provinsi || '-',
      'Kode Pos': s.kodePos || '-',
      'Alamat Lengkap': formatFullAddress(s),
      'Nama Ayah': s.namaAyah || s.namaOrtu || '-',
      'Pekerjaan Ayah': s.pekerjaanAyah || s.pekerjaanOrtu || '-',
      'Nama Ibu': s.namaIbu || '-',
      'Pekerjaan Ibu': s.pekerjaanIbu || '-',
      'No HP Ortu': s.noHpOrtu || '-',
      Status: s.status
    }));
    exportToExcel(exportData, `Data-Siswa-TO-${selectedClass}`);
  };

  const handleExportCSV = () => {
    const exportData = filteredStudents.map((s, idx) => ({
      No: idx + 1,
      NIPD: s.nis,
      NISN: s.nisn,
      'Nama Lengkap': s.nama,
      JK: s.jenisKelamin,
      'Program Keahlian': s.programKeahlian,
      Kelas: s.kelas,
      'Tempat Lahir': s.tempatLahir || '-',
      'Tanggal Lahir': s.tanggalLahir || '-',
      'No HP': s.noHp || '-',
      Dusun: s.dusun || '-',
      'Desa/Kelurahan': s.desa || '-',
      RT: s.rt || '-',
      RW: s.rw || '-',
      Kecamatan: s.kecamatan || '-',
      'Kabupaten/Kota': s.kabupaten || '-',
      Provinsi: s.provinsi || '-',
      'Kode Pos': s.kodePos || '-',
      'Alamat Lengkap': formatFullAddress(s),
      'Nama Ayah': s.namaAyah || s.namaOrtu || '-',
      'Pekerjaan Ayah': s.pekerjaanAyah || s.pekerjaanOrtu || '-',
      'Nama Ibu': s.namaIbu || '-',
      'Pekerjaan Ibu': s.pekerjaanIbu || '-',
      'No HP Ortu': s.noHpOrtu || '-',
      Status: s.status
    }));
    exportToCSV(exportData, `Data-Siswa-TO-${selectedClass}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-400" />
              <span>DATA SISWA TEKNIK OTOMOTIF</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manajemen master data siswa SMK 18 LPPM RI Sidareja.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Import Excel/CSV</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3 py-2 bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>

            {isAdmin && students.length > 0 && (
              <button
                onClick={() => setShowClearAllModal(true)}
                className="px-3 py-2 bg-red-950/60 hover:bg-red-900/60 text-red-300 text-xs font-bold rounded-xl border border-red-800/60 flex items-center gap-1.5 transition-colors"
                title="Kosongkan seluruh data siswa"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Data</span>
              </button>
            )}

            <button
              onClick={() => {
                resetForm();
                setEditingStudent(null);
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>TAMBAH SISWA</span>
            </button>
          </div>
        </div>

        {/* Search & Class Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama Siswa, NIS, atau NISN..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 pl-10 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {isAdmin && (
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              <Filter className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-400">KELAS:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none w-full"
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

          <div className="flex items-center justify-end text-xs text-slate-400 font-bold px-2">
            Total Tampil: {filteredStudents.length} Siswa
          </div>

        </div>

      </div>

      {/* Table Data Siswa */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-bold">
                <th className="p-3.5 w-12 text-center">NO</th>
                <th className="p-3.5">NIPD / NISN</th>
                <th className="p-3.5">NAMA LENGKAP</th>
                <th className="p-3.5 text-center">JK</th>
                <th className="p-3.5">PROGRAM KEAHLIAN</th>
                <th className="p-3.5">KELAS</th>
                <th className="p-3.5">NO HP</th>
                <th className="p-3.5">ALAMAT</th>
                <th className="p-3.5 text-center">STATUS</th>
                <th className="p-3.5 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-amber-400">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-200 text-sm">
                        Data Siswa Kosong
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Data siswa telah dikosongkan untuk pengisian manual. Silakan klik tombol <strong className="text-amber-400">+ TAMBAH SISWA BARU</strong> di bawah ini atau gunakan fitur Import Excel/CSV.
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            resetForm();
                            setEditingStudent(null);
                            setShowAddModal(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>TAMBAH SISWA BARU</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-3.5 font-mono">
                      <div className="font-bold text-white">{st.nis}</div>
                      <div className="text-[10px] text-slate-400">{st.nisn}</div>
                    </td>
                    <td className="p-3.5 font-bold text-white">{st.nama}</td>
                    <td className="p-3.5 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${st.jenisKelamin === 'L' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'}`}>
                        {st.jenisKelamin}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{st.programKeahlian}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        {st.kelas}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{st.noHp || '-'}</td>
                    <td className="p-3.5 text-slate-300 max-w-xs truncate" title={formatFullAddress(st)}>{formatFullAddress(st)}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {st.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => setViewingBiodataStudent(st)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
                          title="Lihat Biodata Siswa"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingStudent(st)}
                          className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-400 transition-colors"
                          title="Hapus"
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

      {/* MODAL: TAMBAH / EDIT SISWA */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                {editingStudent ? 'EDIT DATA SISWA' : 'TAMBAH SISWA BARU'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">NIPD *</label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                    placeholder="Nomor Induk Peserta Didik"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">NISN *</label>
                  <input
                    type="text"
                    required
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                    placeholder="Nomor Induk Siswa Nasional"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">NAMA LENGKAP *</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">JENIS KELAMIN *</label>
                  <select
                    value={formData.jenisKelamin}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">KELAS *</label>
                  <select
                    value={formData.kelas}
                    disabled={!isAdmin}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white disabled:opacity-70"
                  >
                    <option value="X TO1">X TO1</option>
                    <option value="X TO2">X TO2</option>
                    <option value="XI TO1">XI TO1</option>
                    <option value="XI TO2">XI TO2</option>
                    <option value="XII TO1">XII TO1</option>
                    <option value="XII TO2">XII TO2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">AGAMA</label>
                  <select
                    value={formData.agama || 'Islam'}
                    onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Khonghucu">Khonghucu</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">GOLONGAN DARAH</label>
                  <select
                    value={formData.golonganDarah || '-'}
                    onChange={(e) => setFormData({ ...formData, golonganDarah: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="-">-</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">TEMPAT LAHIR</label>
                  <input
                    type="text"
                    value={formData.tempatLahir}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">TANGGAL LAHIR</label>
                  <input
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">NOMOR HP SISWA</label>
                <input
                  type="text"
                  value={formData.noHp}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  placeholder="08..."
                />
              </div>

              {/* SECTION ALAMAT RUMAH */}
              <div className="border-t border-slate-800 pt-3 space-y-3">
                <div className="text-xs font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>Rincian Alamat Rumah Siswa</span>
                </div>

                {/* Dusun & Desa */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 text-xs">DUSUN / KAMPUNG / JALAN</label>
                    <input
                      type="text"
                      value={formData.dusun || ''}
                      onChange={(e) => handleAddressFieldChange('dusun', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                      placeholder="contoh: Dusun Sidamulya / Jl. Merdeka"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 text-xs">DESA / KELURAHAN</label>
                    <input
                      type="text"
                      value={formData.desa || ''}
                      onChange={(e) => handleAddressFieldChange('desa', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                      placeholder="contoh: Sidareja"
                    />
                  </div>
                </div>

                {/* RT, RW, KECAMATAN, KODE POS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 text-xs">RT</label>
                    <input
                      type="text"
                      value={formData.rt || ''}
                      onChange={(e) => handleAddressFieldChange('rt', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono"
                      placeholder="001"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 text-xs">RW</label>
                    <input
                      type="text"
                      value={formData.rw || ''}
                      onChange={(e) => handleAddressFieldChange('rw', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono"
                      placeholder="005"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 text-xs">KECAMATAN</label>
                    <input
                      type="text"
                      value={formData.kecamatan || ''}
                      onChange={(e) => handleAddressFieldChange('kecamatan', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                      placeholder="contoh: Sidareja"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 text-xs">KODE POS</label>
                    <input
                      type="text"
                      value={formData.kodePos || ''}
                      onChange={(e) => handleAddressFieldChange('kodePos', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono"
                      placeholder="53261"
                    />
                  </div>
                </div>

                {/* KABUPATEN / KOTA & PROVINSI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 text-xs">KABUPATEN / KOTA</label>
                    <input
                      type="text"
                      value={formData.kabupaten || ''}
                      onChange={(e) => handleAddressFieldChange('kabupaten', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                      placeholder="contoh: Cilacap"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 text-xs">PROVINSI</label>
                    <input
                      type="text"
                      value={formData.provinsi || ''}
                      onChange={(e) => handleAddressFieldChange('provinsi', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                      placeholder="contoh: Jawa Tengah"
                    />
                  </div>
                </div>

                {/* ALAMAT LENGKAP TEXTAREA */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 text-xs">ALAMAT LENGKAP (GABUNGAN / MANUAL)</label>
                  <textarea
                    rows={2}
                    value={formData.alamat || ''}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                    placeholder="Otomatis terisi dari data di atas, atau dapat disesuaikan..."
                  />
                </div>
              </div>

              {/* SECTION DATA ORANG TUA / WALI */}
              <div className="border-t border-slate-800 pt-3 space-y-3">
                <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Contact2 className="w-4 h-4" />
                  <span>DATA ORANG TUA / WALI</span>
                </div>

                {/* NAMA AYAH & PEKERJAAN AYAH */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">NAMA AYAH</label>
                    <input
                      type="text"
                      value={formData.namaAyah || formData.namaOrtu || ''}
                      onChange={(e) => setFormData({ ...formData, namaAyah: e.target.value, namaOrtu: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                      placeholder="Nama Ayah Kandung/Wali"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">PEKERJAAN AYAH</label>
                    <input
                      type="text"
                      value={formData.pekerjaanAyah || formData.pekerjaanOrtu || ''}
                      onChange={(e) => setFormData({ ...formData, pekerjaanAyah: e.target.value, pekerjaanOrtu: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                      placeholder="Pekerjaan Ayah"
                    />
                  </div>
                </div>

                {/* NAMA IBU & PEKERJAAN IBU */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">NAMA IBU</label>
                    <input
                      type="text"
                      value={formData.namaIbu || ''}
                      onChange={(e) => setFormData({ ...formData, namaIbu: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                      placeholder="Nama Ibu Kandung"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">PEKERJAAN IBU</label>
                    <input
                      type="text"
                      value={formData.pekerjaanIbu || ''}
                      onChange={(e) => setFormData({ ...formData, pekerjaanIbu: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                      placeholder="Pekerjaan Ibu"
                    />
                  </div>
                </div>

                {/* NO HP ORTU */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">NO. HP ORANG TUA / WALI</label>
                  <input
                    type="text"
                    value={formData.noHpOrtu || ''}
                    onChange={(e) => setFormData({ ...formData, noHpOrtu: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                    placeholder="08..."
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 text-slate-950 rounded-xl font-black shadow-lg shadow-amber-500/20"
                >
                  SIMPAN
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">KONFIRMASI HAPUS</h3>
            <p className="text-xs text-slate-300">
              Apakah Anda yakin ingin menghapus siswa <strong className="text-white">{deletingStudent.nama}</strong> ({deletingStudent.kelas})?
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeletingStudent(null)}
                className="py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs"
              >
                BATAL
              </button>
              <button
                onClick={handleDelete}
                className="py-2.5 bg-red-600 text-white rounded-xl font-black text-xs shadow-lg shadow-red-600/30"
              >
                HAPUS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LIHAT BIODATA SISWA LENGKAP */}
      {viewingBiodataStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setViewingBiodataStudent(null)} 
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Kembali"
                >
                  <ArrowLeft className="w-4 h-4 text-amber-400" />
                  <span>KEMBALI</span>
                </button>
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-black text-base">
                  {viewingBiodataStudent.nama.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">KARTU BIODATA SISWA</div>
                  <h2 className="text-base sm:text-lg font-black text-white">{viewingBiodataStudent.nama}</h2>
                </div>
              </div>
              <button 
                onClick={() => setViewingBiodataStudent(null)} 
                className="p-2 bg-red-500/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl border border-red-500/40 transition-all flex items-center justify-center"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Biodata Cards Grid */}
            <div className="space-y-4 text-xs">
              
              {/* Badge Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">NIPD / NISN</span>
                  <div className="font-mono font-bold text-amber-400">{viewingBiodataStudent.nis}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{viewingBiodataStudent.nisn}</div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">KELAS</span>
                  <div className="font-black text-emerald-400">{viewingBiodataStudent.kelas}</div>
                  <div className="text-[10px] text-slate-400">{viewingBiodataStudent.programKeahlian}</div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">JENIS KELAMIN</span>
                  <div className="font-bold text-slate-200">
                    {viewingBiodataStudent.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">STATUS</span>
                  <div className="font-black text-emerald-400">{viewingBiodataStudent.status}</div>
                </div>
              </div>

              {/* Data Pribadi */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="font-black text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>INFORMASI PRIBADI</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px]">TEMPAT, TANGGAL LAHIR</span>
                    <span className="font-semibold text-white">
                      {viewingBiodataStudent.tempatLahir || '-'}, {viewingBiodataStudent.tanggalLahir || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px]">AGAMA</span>
                    <span className="font-semibold text-white">{viewingBiodataStudent.agama || 'Islam'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px]">GOLONGAN DARAH</span>
                    <span className="font-semibold text-white">{viewingBiodataStudent.golonganDarah || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px]">NO. HP SISWA</span>
                    <span className="font-mono text-emerald-400 font-bold">{viewingBiodataStudent.noHp || '-'}</span>
                  </div>
                </div>
                <div className="border-t border-slate-800/80 pt-3 space-y-2">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">DETAIL ALAMAT RUMAH SISWA</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block font-bold">Dusun / Jalan</span>
                      <span className="font-semibold text-white">{viewingBiodataStudent.dusun || '-'}</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block font-bold">RT / RW</span>
                      <span className="font-semibold text-white">RT {viewingBiodataStudent.rt || '-'}/RW {viewingBiodataStudent.rw || '-'}</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block font-bold">Desa / Kelurahan</span>
                      <span className="font-semibold text-white">{viewingBiodataStudent.desa || '-'}</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block font-bold">Kecamatan</span>
                      <span className="font-semibold text-white">{viewingBiodataStudent.kecamatan || '-'}</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block font-bold">Kabupaten / Kota</span>
                      <span className="font-semibold text-white">{viewingBiodataStudent.kabupaten || '-'}</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-500 text-[10px] block font-bold">Provinsi</span>
                      <span className="font-semibold text-white">{viewingBiodataStudent.provinsi || '-'}</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 sm:col-span-2">
                      <span className="text-slate-500 text-[10px] block font-bold">Kode Pos</span>
                      <span className="font-mono text-amber-400 font-bold">{viewingBiodataStudent.kodePos || '-'}</span>
                    </div>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-500 font-bold block text-[10px]">ALAMAT LENGKAP</span>
                    <span className="font-medium text-slate-200">{formatFullAddress(viewingBiodataStudent)}</span>
                  </div>
                </div>
              </div>

              {/* Data Orang Tua / Wali */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="font-black text-blue-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
                  <Contact2 className="w-4 h-4 text-blue-400" />
                  <span>INFORMASI ORANG TUA / WALI</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px]">NAMA AYAH</span>
                    <span className="font-bold text-white">{viewingBiodataStudent.namaAyah || viewingBiodataStudent.namaOrtu || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px]">PEKERJAAN AYAH</span>
                    <span className="font-medium text-slate-200">{viewingBiodataStudent.pekerjaanAyah || viewingBiodataStudent.pekerjaanOrtu || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px]">NAMA IBU</span>
                    <span className="font-bold text-white">{viewingBiodataStudent.namaIbu || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px]">PEKERJAAN IBU</span>
                    <span className="font-medium text-slate-200">{viewingBiodataStudent.pekerjaanIbu || '-'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 font-bold block text-[10px]">NO. HP ORANG TUA / WALI</span>
                    <span className="font-mono text-amber-400 font-bold">{viewingBiodataStudent.noHpOrtu || '-'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => handlePrintBiodata(viewingBiodataStudent)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4 text-blue-400" />
                <span>CETAK BIODATA</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const st = viewingBiodataStudent;
                    setViewingBiodataStudent(null);
                    handleOpenEdit(st);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>EDIT BIODATA</span>
                </button>
                <button
                  onClick={() => setViewingBiodataStudent(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl"
                >
                  TUTUP
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal Confirm Clear All Students */}
      {showClearAllModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-white">KOSONGKAN SELURUH DATA SISWA?</h2>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin <strong className="text-red-400">menghapus SELURUH data siswa ({students.length} siswa)</strong>? Tindakan ini akan mengosongkan seluruh data siswa sehingga Anda dapat memasukkan data secara manual.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl"
              >
                BATAL
              </button>
              <button
                type="button"
                onClick={handleClearAllStudents}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30"
              >
                YA, KOSONGKAN SEKARANG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pratinjau & Konfirmasi Simpan Import */}
      {importPreviewStudents && importPreviewStudents.length > 0 && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>PRATINJAU HASIL IMPORT</span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {importPreviewStudents.length} Siswa Ditemukan
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    File: <strong className="text-slate-200">{importFileName}</strong> — Silakan periksa data sebelum disimpan ke database.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setImportPreviewStudents(null);
                  setImportFileName('');
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Preview Table */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-start gap-3 text-emerald-300 text-xs shadow-inner">
                <Save className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-white block font-bold text-xs uppercase tracking-wide">Langkah Konfirmasi Penyimpanan:</strong>
                  <span>
                    Data dari file telah dibaca dan siap dimasukkan. Klik tombol <strong className="text-emerald-400 underline decoration-emerald-400 underline-offset-2 font-bold">SIMPAN DATA IMPORT KE DATABASE</strong> di bawah ini agar data tersimpan secara permanen dan tidak hilang saat aplikasi ditutup/direfresh.
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[48vh]">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold sticky top-0 z-10 border-b border-slate-800">
                    <tr>
                      <th className="p-3 text-center w-12">NO</th>
                      <th className="p-3">NIPD / NIS</th>
                      <th className="p-3">NISN</th>
                      <th className="p-3">NAMA LENGKAP SISWA</th>
                      <th className="p-3 text-center">JK</th>
                      <th className="p-3">KELAS</th>
                      <th className="p-3">NO. HP</th>
                      <th className="p-3">ALAMAT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-mono">
                    {importPreviewStudents.map((st, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 text-center text-slate-500 font-bold">{idx + 1}</td>
                        <td className="p-3 text-emerald-400 font-bold">{st.nis || '-'}</td>
                        <td className="p-3 text-slate-300">{st.nisn || '-'}</td>
                        <td className="p-3 font-bold text-white font-sans">{st.nama}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            st.jenisKelamin === 'L' 
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                              : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                          }`}>
                            {st.jenisKelamin}
                          </span>
                        </td>
                        <td className="p-3 text-amber-300 font-bold">{st.kelas}</td>
                        <td className="p-3 text-slate-400">{st.noHp || '-'}</td>
                        <td className="p-3 text-slate-400 max-w-xs truncate font-sans">{st.alamat || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer with SIMPAN BUTTON */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setImportPreviewStudents(null);
                  setImportFileName('');
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-colors"
              >
                BATAL IMPORT
              </button>

              <button
                type="button"
                disabled={isSavingImport}
                onClick={handleConfirmSaveImport}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSavingImport ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>MENYIMPAN KE DATABASE...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>💾 SIMPAN {importPreviewStudents.length} DATA IMPORT KE DATABASE</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
