import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_ATTENDANCE,
  INITIAL_SCHOOL_SETTINGS
} from './src/data/initialData.ts';
import { Student, Teacher, ClassItem, AttendanceRecord, SchoolSettings } from './src/types.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Database storage file path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const DB_BAK_FILE = path.join(DATA_DIR, 'db.json.bak');

// Memory Data State
let dbData = {
  students: [...INITIAL_STUDENTS] as Student[],
  teachers: [...INITIAL_TEACHERS] as Teacher[],
  classes: [...INITIAL_CLASSES] as ClassItem[],
  attendance: [...INITIAL_ATTENDANCE] as AttendanceRecord[],
  settings: { ...INITIAL_SCHOOL_SETTINGS } as SchoolSettings
};

// Initialize or Load DB File
function loadDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let raw = '';
    if (fs.existsSync(DB_FILE)) {
      try {
        raw = fs.readFileSync(DB_FILE, 'utf-8');
      } catch (err) {
        console.warn('Failed to read primary DB_FILE, attempting backup:', err);
      }
    }

    // Try backup if primary file was missing or empty
    if ((!raw || !raw.trim()) && fs.existsSync(DB_BAK_FILE)) {
      try {
        raw = fs.readFileSync(DB_BAK_FILE, 'utf-8');
        console.log('Successfully recovered data from backup DB file.');
      } catch (err) {
        console.warn('Failed to read backup DB file:', err);
      }
    }

    if (raw && raw.trim()) {
      const parsed = JSON.parse(raw);
      dbData = {
        students: Array.isArray(parsed.students) ? parsed.students : [...INITIAL_STUDENTS],
        teachers: Array.isArray(parsed.teachers) && parsed.teachers.length > 0 ? parsed.teachers : [...INITIAL_TEACHERS],
        classes: Array.isArray(parsed.classes) && parsed.classes.length > 0 ? parsed.classes : [...INITIAL_CLASSES],
        attendance: Array.isArray(parsed.attendance) ? parsed.attendance : [...INITIAL_ATTENDANCE],
        settings: parsed.settings || { ...INITIAL_SCHOOL_SETTINGS }
      };

      // Ensure default teachers exist if missing, and migrate old default passwords
      INITIAL_TEACHERS.forEach(initT => {
        const existing = dbData.teachers.find(t => t.id === initT.id || t.username === initT.username);
        if (!existing) {
          dbData.teachers.push(initT);
        }
      });

      // Migration for default passwords:
      // All wali_kelas default passwords -> Terserah18*
      // Admin password -> admin123
      const oldDefaults = ['haryani#xto1', 'fia#xto2', 'elvi#xito1', 'ining#xito2', 'slamet#xiito1', 'password123', 'admin', ''];
      dbData.teachers.forEach(t => {
        if (t.role === 'admin' || t.username === 'admin') {
          if (!t.password || t.password === 'password123') {
            t.password = 'admin123';
          }
        } else if (t.role === 'wali_kelas' || t.id.startsWith('t')) {
          if (!t.password || oldDefaults.includes(t.password)) {
            t.password = 'Terserah18*';
          }
        }
      });

      if (!dbData.settings.adminPassword) {
        dbData.settings.adminPassword = 'admin123';
      }

      INITIAL_CLASSES.forEach(initC => {
        const existingC = dbData.classes.find(c => c.id === initC.id);
        if (!existingC) {
          dbData.classes.push(initC);
        }
      });

      if (!dbData.settings.alamatSekolah || dbData.settings.alamatSekolah.includes('Jl. Kunci')) {
        dbData.settings.alamatSekolah = 'Jl.Jend.Sudirman No.52A Sidamulya,Sidareja, Cilacap, Jawa Tengah 53261';
      }
      if (!dbData.settings.logoSekolah) {
        dbData.settings.logoSekolah = 'https://iili.io/C69Ouou.png';
      }

      saveDB();
    } else {
      saveDB();
    }
  } catch (err) {
    console.error('Failed to parse db file, attempting backup recovery:', err);
    if (fs.existsSync(DB_BAK_FILE)) {
      try {
        const rawBak = fs.readFileSync(DB_BAK_FILE, 'utf-8');
        const parsedBak = JSON.parse(rawBak);
        if (Array.isArray(parsedBak.students)) dbData.students = parsedBak.students;
        if (Array.isArray(parsedBak.teachers)) dbData.teachers = parsedBak.teachers;
        if (Array.isArray(parsedBak.attendance)) dbData.attendance = parsedBak.attendance;
        if (parsedBak.settings) dbData.settings = parsedBak.settings;
        saveDB();
      } catch (bakErr) {
        console.error('Backup recovery also failed:', bakErr);
      }
    }
  }
}

function saveDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const jsonContent = JSON.stringify(dbData, null, 2);
    const tempFile = path.join(DATA_DIR, 'db.json.tmp');
    
    // Write to temp file then rename atomically
    fs.writeFileSync(tempFile, jsonContent, 'utf-8');
    fs.renameSync(tempFile, DB_FILE);

    // Keep a secondary copy in db.json.bak
    fs.writeFileSync(DB_BAK_FILE, jsonContent, 'utf-8');
  } catch (err) {
    console.error('Failed to save db file:', err);
  }
}

loadDB();

// API Endpoints

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. Settings
app.get('/api/settings', (req, res) => {
  res.json(dbData.settings);
});

app.put('/api/settings', (req, res) => {
  dbData.settings = { ...dbData.settings, ...req.body };
  saveDB();
  res.json(dbData.settings);
});

// 3. Students
app.get('/api/students', (req, res) => {
  const { kelas, query } = req.query;
  let list = dbData.students || [];
  if (kelas && String(kelas) !== 'SEMUA') {
    list = list.filter(s => s.kelas && String(s.kelas).toLowerCase() === String(kelas).toLowerCase());
  }
  if (query) {
    const q = String(query).toLowerCase();
    list = list.filter(s => 
      (s.nama && String(s.nama).toLowerCase().includes(q)) || 
      (s.nis && String(s.nis).toLowerCase().includes(q)) || 
      (s.nisn && String(s.nisn).toLowerCase().includes(q))
    );
  }
  res.json(list);
});

app.post('/api/students', (req, res) => {
  const newStudent: Student = {
    id: 's-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    ...req.body
  };
  dbData.students.push(newStudent);
  saveDB();
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const index = dbData.students.findIndex(s => s.id === id);
  if (index !== -1) {
    dbData.students[index] = { ...dbData.students[index], ...req.body };
    saveDB();
    return res.json(dbData.students[index]);
  }
  res.status(404).json({ error: 'Siswa tidak ditemukan' });
});

app.delete('/api/students', (req, res) => {
  dbData.students = [];
  saveDB();
  res.json({ success: true, message: 'Seluruh data siswa berhasil dikosongkan' });
});

app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  dbData.students = dbData.students.filter(s => s.id !== id);
  saveDB();
  res.json({ success: true, id });
});

app.post('/api/students/import', (req, res) => {
  const studentsToImport: Student[] = req.body;
  if (!Array.isArray(studentsToImport)) {
    return res.status(400).json({ error: 'Format data tidak valid' });
  }

  let added = 0;
  let updated = 0;

  const isValidIdentifier = (val?: string): boolean => {
    if (!val) return false;
    const clean = val.trim().toLowerCase();
    return (
      clean !== '' &&
      clean !== '-' &&
      clean !== '--' &&
      clean !== '0' &&
      clean !== '0000' &&
      clean !== '00000' &&
      clean !== 'null' &&
      clean !== 'undefined' &&
      clean !== 'nipd' &&
      clean !== 'nis' &&
      clean !== 'nisn'
    );
  };

  studentsToImport.forEach((s, idx) => {
    const sNis = (s.nis || '').trim();
    const sNisn = (s.nisn || '').trim();
    const sId = (s.id || '').trim();

    const validSnis = isValidIdentifier(sNis);
    const validSnisn = isValidIdentifier(sNisn);
    const validSid = isValidIdentifier(sId);

    const validNama = (s.nama && s.nama.trim() !== '' && s.nama !== 'Siswa Tanpa Nama')
      ? s.nama.trim()
      : '';

    // Only match existing student if valid unique identifier exists OR exact Name + Class matches
    const existingIndex = dbData.students.findIndex(st => {
      if (validSid && st.id === sId) return true;
      if (validSnis && isValidIdentifier(st.nis) && st.nis.trim() === sNis) return true;
      if (validSnisn && isValidIdentifier(st.nisn) && st.nisn.trim() === sNisn) return true;

      // If no valid NIS/NISN, match by exact Name and Class
      if (!validSnis && !validSnisn && validNama !== '') {
        const sameNama = st.nama.trim().toLowerCase() === validNama.toLowerCase();
        const sameKelas = !s.kelas || !st.kelas || st.kelas.trim().toLowerCase() === s.kelas.trim().toLowerCase();
        if (sameNama && sameKelas) return true;
      }

      return false;
    });

    if (existingIndex !== -1) {
      const existing = dbData.students[existingIndex];
      const finalNama = validNama || (existing.nama !== 'Siswa Tanpa Nama' ? existing.nama : '') || 'Siswa Tanpa Nama';

      dbData.students[existingIndex] = {
        ...existing,
        ...s,
        id: existing.id,
        nis: validSnis ? sNis : (isValidIdentifier(existing.nis) ? existing.nis : '-'),
        nisn: validSnisn ? sNisn : (isValidIdentifier(existing.nisn) ? existing.nisn : '-'),
        nama: finalNama
      };
      updated++;
    } else {
      const uniqueSalt = Math.random().toString(36).substring(2, 7) + idx + Math.floor(Math.random() * 1000);
      dbData.students.push({
        id: 's-' + Date.now() + '-' + uniqueSalt,
        nis: validSnis ? sNis : '-',
        nisn: validSnisn ? sNisn : '-',
        nama: validNama || 'Siswa Tanpa Nama',
        jenisKelamin: s.jenisKelamin === 'P' ? 'P' : 'L',
        programKeahlian: 'Teknik Otomotif',
        kelas: s.kelas || 'X TO1',
        tempatLahir: s.tempatLahir || '',
        tanggalLahir: s.tanggalLahir || '',
        noHp: s.noHp || '',
        alamat: s.alamat || '',
        dusun: s.dusun || '',
        desa: s.desa || '',
        rt: s.rt || '',
        rw: s.rw || '',
        kecamatan: s.kecamatan || '',
        kabupaten: s.kabupaten || '',
        provinsi: s.provinsi || '',
        kodePos: s.kodePos || '',
        namaOrtu: s.namaOrtu || '',
        namaAyah: s.namaAyah || '',
        namaIbu: s.namaIbu || '',
        noHpOrtu: s.noHpOrtu || '',
        pekerjaanOrtu: s.pekerjaanOrtu || '',
        pekerjaanAyah: s.pekerjaanAyah || '',
        pekerjaanIbu: s.pekerjaanIbu || '',
        status: 'Aktif'
      });
      added++;
    }
  });

  saveDB();
  res.json({ success: true, added, updated, total: dbData.students.length });
});

// 4. Teachers & Wali Kelas
app.get('/api/teachers', (req, res) => {
  res.json(dbData.teachers);
});

app.post('/api/teachers', (req, res) => {
  const newTeacher: Teacher = {
    id: 't-' + Date.now(),
    ...req.body
  };
  dbData.teachers.push(newTeacher);

  // If teacher is assigned a class, update class list as well
  if (newTeacher.kelas) {
    const cls = dbData.classes.find(c => c.namaKelas === newTeacher.kelas);
    if (cls) {
      cls.waliKelasId = newTeacher.id;
      cls.waliKelasNama = newTeacher.nama;
    }
  }

  saveDB();
  res.status(201).json(newTeacher);
});

app.put('/api/teachers/:id', (req, res) => {
  const { id } = req.params;
  const index = dbData.teachers.findIndex(t => t.id === id);
  if (index !== -1) {
    const oldTeacher = dbData.teachers[index];
    const updatedTeacher = { ...oldTeacher, ...req.body };
    dbData.teachers[index] = updatedTeacher;

    // Update class assignments if changed
    if (updatedTeacher.kelas) {
      const cls = dbData.classes.find(c => c.namaKelas === updatedTeacher.kelas);
      if (cls) {
        cls.waliKelasId = updatedTeacher.id;
        cls.waliKelasNama = updatedTeacher.nama;
      }
    }

    saveDB();
    return res.json(updatedTeacher);
  }
  res.status(404).json({ error: 'Guru tidak ditemukan' });
});

app.delete('/api/teachers/:id', (req, res) => {
  const { id } = req.params;
  dbData.teachers = dbData.teachers.filter(t => t.id !== id);
  // Clear from classes
  dbData.classes.forEach(c => {
    if (c.waliKelasId === id) {
      c.waliKelasId = '';
      c.waliKelasNama = 'Belum ditentukan';
    }
  });
  saveDB();
  res.json({ success: true, id });
});

// 5. Classes
app.get('/api/classes', (req, res) => {
  // Update student counts dynamically
  const classesWithCounts = dbData.classes.map(c => {
    const count = dbData.students.filter(s => s.kelas === c.namaKelas).length;
    return { ...c, jumlahSiswa: count };
  });
  res.json(classesWithCounts);
});

app.put('/api/classes/:id', (req, res) => {
  const { id } = req.params;
  const { waliKelasId, waliKelasNama } = req.body;
  const clsIndex = dbData.classes.findIndex(c => c.id === id);
  if (clsIndex !== -1) {
    const cls = dbData.classes[clsIndex];
    cls.waliKelasId = waliKelasId;
    cls.waliKelasNama = waliKelasNama;

    // Update corresponding teacher if any
    if (waliKelasId) {
      dbData.teachers.forEach(t => {
        if (t.id === waliKelasId) {
          t.kelas = cls.namaKelas;
        } else if (t.kelas === cls.namaKelas) {
          t.kelas = '';
        }
      });
    }

    saveDB();
    return res.json(cls);
  }
  res.status(404).json({ error: 'Kelas tidak ditemukan' });
});

// 6. Attendance API
app.get('/api/attendance', (req, res) => {
  const { kelas, tanggal, studentId, bulan, tahun, nama, query } = req.query;
  let records = dbData.attendance;

  if (kelas) {
    records = records.filter(r => r.kelas.toLowerCase() === String(kelas).toLowerCase());
  }
  if (tanggal) {
    records = records.filter(r => r.tanggal === String(tanggal));
  }
  if (studentId) {
    records = records.filter(r => r.studentId === String(studentId));
  }
  if (nama) {
    const qName = String(nama).trim().toLowerCase();
    records = records.filter(r => r.nama && r.nama.toLowerCase().includes(qName));
  }
  if (query) {
    const q = String(query).trim().toLowerCase();
    records = records.filter(r => 
      (r.nama && r.nama.toLowerCase().includes(q)) ||
      (r.nis && r.nis.toLowerCase().includes(q)) ||
      (r.keterangan && r.keterangan.toLowerCase().includes(q))
    );
  }
  if (bulan) {
    records = records.filter(r => r.bulan === Number(bulan));
  }
  if (tahun) {
    records = records.filter(r => r.tahun === Number(tahun));
  }

  res.json(records);
});

// Submit Attendance (Student Check-in or Manual Entry)
app.post('/api/attendance', (req, res) => {
  const { studentId, nis, nisn, nama, programKeahlian, kelas, tanggal, hari, waktu, status, keterangan } = req.body;

  const studentName = (nama || '').trim();
  const studentClass = (kelas || '').trim();

  if (!tanggal || (!studentId && !studentName)) {
    return res.status(400).json({ error: 'Nama/Siswa dan tanggal wajib diisi' });
  }

  // Check duplicate attendance for the same student on the same day
  const existing = dbData.attendance.find(r => {
    if (studentId && r.studentId === studentId && r.tanggal === tanggal) return true;
    if (studentName && r.nama && r.nama.trim().toLowerCase() === studentName.toLowerCase() &&
        studentClass && r.kelas && r.kelas.trim().toLowerCase() === studentClass.toLowerCase() &&
        r.tanggal === tanggal) {
      return true;
    }
    return false;
  });

  if (existing) {
    return res.status(409).json({
      error: 'ANDA SUDAH MELAKUKAN ABSENSI HARI INI',
      alreadySubmitted: true,
      data: existing
    });
  }

  // Ensure student exists in students master list or register them
  let resolvedStudentId = studentId;
  if (studentName) {
    const existingStudent = dbData.students.find(s => 
      s.nama.trim().toLowerCase() === studentName.toLowerCase() &&
      (!studentClass || !s.kelas || s.kelas.trim().toLowerCase() === studentClass.toLowerCase())
    );

    if (existingStudent) {
      resolvedStudentId = existingStudent.id;
    } else {
      resolvedStudentId = 's-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
      dbData.students.push({
        id: resolvedStudentId,
        nis: nis || '-',
        nisn: nisn || '-',
        nama: studentName,
        jenisKelamin: 'L',
        programKeahlian: programKeahlian || 'Teknik Otomotif',
        kelas: studentClass || 'X TO1',
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
        namaOrtu: '',
        namaAyah: '',
        namaIbu: '',
        noHpOrtu: '',
        pekerjaanOrtu: '',
        pekerjaanAyah: '',
        pekerjaanIbu: '',
        status: 'Aktif'
      });
    }
  }

  // Calculate week, month, year
  const dateObj = new Date(tanggal);
  const dayNum = dateObj.getDate();
  const weekNum = Math.ceil(dayNum / 7);
  const monthNum = dateObj.getMonth() + 1;
  const yearNum = dateObj.getFullYear();

  const newRecord: AttendanceRecord = {
    id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    studentId: resolvedStudentId || 'std-' + Date.now(),
    nis: nis || '-',
    nisn: nisn || '-',
    nama: studentName || 'Siswa',
    programKeahlian: programKeahlian || 'Teknik Otomotif',
    kelas: studentClass || 'X TO1',
    tanggal: tanggal,
    hari: hari || 'Senin',
    waktu: waktu || new Date().toLocaleTimeString('id-ID') + ' WIB',
    timestamp: Date.now(),
    status: status || 'H',
    keterangan: keterangan || (status === 'H' ? 'Hadir Mandiri' : status === 'S' ? 'Sakit' : status === 'I' ? 'Izin' : 'Alpa'),
    minggu: weekNum,
    bulan: monthNum,
    tahun: yearNum,
    tahunPelajaran: dbData.settings.tahunPelajaran || '2026/2027'
  };

  dbData.attendance.unshift(newRecord);
  saveDB();
  res.status(201).json(newRecord);
});

// Attendance Correction
app.put('/api/attendance/:id', (req, res) => {
  const { id } = req.params;
  const index = dbData.attendance.findIndex(r => r.id === id);
  if (index !== -1) {
    dbData.attendance[index] = { ...dbData.attendance[index], ...req.body };
    saveDB();
    return res.json(dbData.attendance[index]);
  }
  res.status(404).json({ error: 'Data absensi tidak ditemukan' });
});

app.delete('/api/attendance', (req, res) => {
  dbData.attendance = [];
  saveDB();
  res.json({ success: true, message: 'Seluruh riwayat absensi berhasil dikosongkan' });
});

app.delete('/api/attendance/:id', (req, res) => {
  const { id } = req.params;
  dbData.attendance = dbData.attendance.filter(r => r.id !== id);
  saveDB();
  res.json({ success: true, id });
});

// 7. Login API (Admin & Wali Kelas)
app.post('/api/login', (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan Password wajib diisi' });
  }

  // Active custom admin password or default
  const activeAdminPassword = dbData.settings.adminPassword || 'admin123';

  // Admin login check
  if (role === 'admin') {
    const adminTeacher = dbData.teachers.find(
      t => (t.username.toLowerCase() === username.toLowerCase() || username.toLowerCase() === 'admin') &&
           (t.password === password || password === activeAdminPassword || password === 'admin123' || password === 'admin') &&
           t.role === 'admin'
    );

    const isMatch = adminTeacher || 
      (username.toLowerCase() === 'admin' && (password === activeAdminPassword || password === 'admin123' || password === 'admin'));

    if (isMatch) {
      return res.json({
        success: true,
        user: {
          id: adminTeacher ? adminTeacher.id : 'admin-default',
          username: 'admin',
          nama: adminTeacher ? adminTeacher.nama : 'Antri Wardoyo, S.T.',
          role: 'admin',
          jabatan: adminTeacher ? adminTeacher.jabatan : 'Kepala Program Studi Teknik Otomotif'
        }
      });
    }
  }

  // Wali Kelas login check
  if (role === 'wali_kelas') {
    const teacher = dbData.teachers.find(
      t => (t.username.toLowerCase() === username.toLowerCase() || t.nip === username) &&
           t.password === password
    );

    if (teacher) {
      return res.json({
        success: true,
        user: {
          id: teacher.id,
          username: teacher.username,
          nama: teacher.nama,
          role: 'wali_kelas',
          jabatan: teacher.jabatan,
          kelas: teacher.kelas
        }
      });
    }
  }

  res.status(401).json({ error: 'Username atau Password salah!' });
});

// Change Password Endpoint (Admin / Wali Kelas)
app.post('/api/change-password', (req, res) => {
  const { userId, role, oldPassword, newPassword } = req.body;

  if (!newPassword || newPassword.trim().length < 3) {
    return res.status(400).json({ error: 'Password baru minimal 3 karakter.' });
  }

  if (role === 'admin') {
    const currentAdminPass = dbData.settings.adminPassword || 'admin123';
    if (oldPassword && oldPassword !== currentAdminPass && oldPassword !== 'admin123' && oldPassword !== 'admin') {
      return res.status(400).json({ error: 'Password lama Admin tidak sesuai!' });
    }
    dbData.settings.adminPassword = newPassword;
    // Also update admin teacher record if found
    dbData.teachers.forEach(t => {
      if (t.role === 'admin') t.password = newPassword;
    });
    saveDB();
    return res.json({ success: true, message: 'Password Admin berhasil diperbarui.' });
  }

  if (role === 'wali_kelas') {
    const teacher = dbData.teachers.find(t => t.id === userId || t.username === userId);
    if (!teacher) {
      return res.status(404).json({ error: 'Data Wali Kelas tidak ditemukan.' });
    }
    if (oldPassword && teacher.password !== oldPassword) {
      return res.status(400).json({ error: 'Password lama Wali Kelas tidak sesuai!' });
    }
    teacher.password = newPassword;
    saveDB();
    return res.json({ success: true, message: 'Password Wali Kelas berhasil diperbarui.' });
  }

  res.status(400).json({ error: 'Role tidak valid.' });
});

// 8. Backup & Restore
app.get('/api/backup', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=backup-absensi-smk18-${new Date().toISOString().slice(0, 10)}.json`);
  res.send(JSON.stringify(dbData, null, 2));
});

app.post('/api/restore', (req, res) => {
  const restoredData = req.body;
  if (!restoredData || !restoredData.students || !restoredData.attendance) {
    return res.status(400).json({ error: 'Format file backup tidak valid' });
  }

  dbData = {
    students: restoredData.students || INITIAL_STUDENTS,
    teachers: restoredData.teachers || INITIAL_TEACHERS,
    classes: restoredData.classes || INITIAL_CLASSES,
    attendance: restoredData.attendance || INITIAL_ATTENDANCE,
    settings: restoredData.settings || INITIAL_SCHOOL_SETTINGS
  };

  saveDB();
  res.json({ success: true, message: 'Data berhasil dipulihkan' });
});

// Vite Middleware for Development / Static serving for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
