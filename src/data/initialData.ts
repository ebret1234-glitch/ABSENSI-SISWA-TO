import { Student, Teacher, ClassItem, AttendanceRecord, SchoolSettings } from '../types';

export const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  namaSekolah: 'SMK 18 LPPM RI SIDAREJA',
  programKeahlian: 'TEKNIK OTOMOTIF',
  kepalaSekolah: 'Normalisa Dwi A., S.H., S.Pd., M.Pd.',
  jabatanKepalaSekolah: 'Kepala SMK 18 LPPM RI Sidareja',
  kepalaProdi: 'Antri Wardoyo, S.T.',
  jabatanKepalaProdi: 'Kepala Program Studi Teknik Otomotif',
  tahunPelajaran: '2026/2027',
  alamatSekolah: 'Jl.Jend.Sudirman No.52A Sidamulya,Sidareja, Cilacap, Jawa Tengah 53261',
  logoSekolah: 'https://iili.io/C69Ouou.png'
};

export const INITIAL_CLASSES: ClassItem[] = [
  { id: 'c1', namaKelas: 'X TO1', programKeahlian: 'TEKNIK OTOMOTIF', waliKelasId: 't1', waliKelasNama: 'Haryani, S.Pd.' },
  { id: 'c2', namaKelas: 'X TO2', programKeahlian: 'TEKNIK OTOMOTIF', waliKelasId: 't4', waliKelasNama: 'Fia Primastiani, S.Pd.' },
  { id: 'c3', namaKelas: 'XI TO1', programKeahlian: 'TEKNIK OTOMOTIF', waliKelasId: 't2', waliKelasNama: 'Elvi Sukaesih, S.H.' },
  { id: 'c4', namaKelas: 'XI TO2', programKeahlian: 'TEKNIK OTOMOTIF', waliKelasId: 't3', waliKelasNama: 'In In Goniyah, S.Pd.' },
  { id: 'c5', namaKelas: 'XII TO1', programKeahlian: 'TEKNIK OTOMOTIF', waliKelasId: 't5', waliKelasNama: 'Slamet Maryanto, S.Pd.' },
  { id: 'c6', namaKelas: 'XII TO2', programKeahlian: 'TEKNIK OTOMOTIF', waliKelasId: '', waliKelasNama: 'Belum ditentukan' }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'admin1',
    nip: '19780512 200501 1 003',
    nama: 'Antri Wardoyo, S.T.',
    mataPelajaran: 'Teknik Kendaraan Ringan',
    jabatan: 'Kepala Program Studi Teknik Otomotif',
    noHp: '081234567890',
    username: 'admin',
    password: 'admin123',
    kelas: '',
    status: 'Aktif',
    role: 'admin'
  },
  {
    id: 't1',
    nip: '19820315 200802 2 004',
    nama: 'Haryani, S.Pd.',
    mataPelajaran: 'Bahasa Indonesia',
    jabatan: 'Wali Kelas X TO1',
    noHp: '081298765432',
    username: 'haryani',
    password: 'Terserah18*',
    kelas: 'X TO1',
    status: 'Aktif',
    role: 'wali_kelas'
  },
  {
    id: 't4',
    nip: '19900218 201502 2 007',
    nama: 'Fia Primastiani, S.Pd.',
    mataPelajaran: 'Teknik Sepeda Motor',
    jabatan: 'Wali Kelas X TO2',
    noHp: '081399001122',
    username: 'fiaprimastiani',
    password: 'Terserah18*',
    kelas: 'X TO2',
    status: 'Aktif',
    role: 'wali_kelas'
  },
  {
    id: 't2',
    nip: '19850720 201003 2 005',
    nama: 'Elvi Sukaesih, S.H.',
    mataPelajaran: 'Pendidikan Pancasila',
    jabatan: 'Wali Kelas XI TO1',
    noHp: '081311223344',
    username: 'elvi',
    password: 'Terserah18*',
    kelas: 'XI TO1',
    status: 'Aktif',
    role: 'wali_kelas'
  },
  {
    id: 't3',
    nip: '19871104 201201 2 006',
    nama: 'In In Goniyah, S.Pd.',
    mataPelajaran: 'Matematika',
    jabatan: 'Wali Kelas XI TO2',
    noHp: '081355667788',
    username: 'iningoniyah',
    password: 'Terserah18*',
    kelas: 'XI TO2',
    status: 'Aktif',
    role: 'wali_kelas'
  },
  {
    id: 't5',
    nip: '19810910 200604 1 008',
    nama: 'Slamet Maryanto, S.Pd.',
    mataPelajaran: 'Pemeliharaan Mesin Otomotif',
    jabatan: 'Wali Kelas XII TO1',
    noHp: '081244332211',
    username: 'slametmaryanto',
    password: 'Terserah18*',
    kelas: 'XII TO1',
    status: 'Aktif',
    role: 'wali_kelas'
  }
];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
