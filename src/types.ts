export type AttendanceStatus = 'H' | 'A' | 'I' | 'S';

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  programKeahlian: string; // TEKNIK OTOMOTIF
  kelas: string; // X TO1, X TO2, XI TO1, XI TO2, XII TO1, XII TO2
  tempatLahir?: string;
  tanggalLahir?: string;
  noHp?: string;
  alamat?: string;
  dusun?: string;
  desa?: string;
  rt?: string;
  rw?: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  kodePos?: string;
  namaOrtu?: string;
  namaAyah?: string;
  namaIbu?: string;
  noHpOrtu?: string;
  pekerjaanOrtu?: string;
  pekerjaanAyah?: string;
  pekerjaanIbu?: string;
  agama?: string;
  golonganDarah?: string;
  status: 'Aktif' | 'Non-Aktif';
}

export interface Teacher {
  id: string;
  nip: string;
  nama: string;
  mataPelajaran: string;
  jabatan: string;
  noHp: string;
  username: string;
  password: string;
  kelas: string; // Kelas yang diampu, e.g., 'X TO1' or ''
  status: 'Aktif' | 'Non-Aktif';
  role: 'admin' | 'wali_kelas';
}

export interface ClassItem {
  id: string;
  namaKelas: string;
  programKeahlian: string;
  waliKelasId: string;
  waliKelasNama: string;
  jumlahSiswa?: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  nis: string;
  nisn: string;
  nama: string;
  programKeahlian: string;
  kelas: string;
  tanggal: string; // YYYY-MM-DD
  hari: string; // Senin, Selasa, etc.
  waktu: string; // HH:mm:ss WIB
  timestamp: number;
  status: AttendanceStatus;
  keterangan: string;
  minggu: number; // 1-5
  bulan: number; // 1-12
  tahun: number; // e.g., 2026
  tahunPelajaran: string; // e.g., 2026/2027
}

export interface AuthUser {
  id: string;
  username: string;
  nama: string;
  role: 'admin' | 'wali_kelas';
  jabatan?: string;
  kelas?: string; // For Wali Kelas
}

export interface SchoolSettings {
  namaSekolah: string;
  programKeahlian: string;
  kepalaSekolah: string;
  jabatanKepalaSekolah: string;
  kepalaProdi: string;
  jabatanKepalaProdi: string;
  tahunPelajaran: string;
  alamatSekolah?: string;
  logoSekolah?: string;
  adminPassword?: string;
}

export interface AttendanceSummaryStats {
  totalSiswa: number;
  hadir: number;
  alpa: number;
  izin: number;
  sakit: number;
  persentaseHadir: number;
}
