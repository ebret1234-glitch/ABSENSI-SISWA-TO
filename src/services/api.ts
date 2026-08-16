import { Student, Teacher, ClassItem, AttendanceRecord, SchoolSettings, AuthUser } from '../types';

export const api = {
  // 1. Settings
  async getSettings(): Promise<SchoolSettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('sisfo_settings', JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('API fetch error, trying local cache for settings', e);
    }
    const cached = localStorage.getItem('sisfo_settings');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { /* ignore */ }
    }
    return {
      namaSekolah: 'SMK 18 LPPM RI SIDAREJA',
      programKeahlian: 'TEKNIK OTOMOTIF',
      kepalaSekolah: 'Normalisa Dwi A., S.H., S.Pd., M.Pd.',
      jabatanKepalaSekolah: 'Kepala SMK 18 LPPM RI Sidareja',
      kepalaProdi: 'Antri Wardoyo, S.T.',
      jabatanKepalaProdi: 'Kepala Program Studi Teknik Otomotif',
      tahunPelajaran: '2026/2027'
    };
  },

  async updateSettings(settings: Partial<SchoolSettings>): Promise<SchoolSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    const updated = await res.json();
    localStorage.setItem('sisfo_settings', JSON.stringify(updated));
    return updated;
  },

  // 2. Students
  async getStudents(kelas?: string, query?: string): Promise<Student[]> {
    let url = '/api/students';
    const params = new URLSearchParams();
    if (kelas) params.append('kelas', kelas);
    if (query) params.append('query', query);
    if (params.toString()) url += `?${params.toString()}`;

    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (!kelas && !query && Array.isArray(data)) {
          localStorage.setItem('sisfo_students', JSON.stringify(data));
        }
        return data;
      }
    } catch (e) {
      console.warn('API fetch error, trying local cache for students', e);
    }

    const cached = localStorage.getItem('sisfo_students');
    if (cached) {
      try {
        let list: Student[] = JSON.parse(cached);
        if (kelas) {
          list = list.filter(s => s.kelas.toLowerCase() === kelas.toLowerCase());
        }
        if (query) {
          const q = query.toLowerCase();
          list = list.filter(s => 
            (s.nama && String(s.nama).toLowerCase().includes(q)) || 
            (s.nis && String(s.nis).toLowerCase().includes(q)) || 
            (s.nisn && String(s.nisn).toLowerCase().includes(q))
          );
        }
        return list;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  },

  async addStudent(student: Omit<Student, 'id'>): Promise<Student> {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    const result = await res.json();
    this.getStudents().catch(() => {});
    return result;
  },

  async updateStudent(id: string, student: Partial<Student>): Promise<Student> {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    const result = await res.json();
    this.getStudents().catch(() => {});
    return result;
  },

  async deleteStudent(id: string): Promise<boolean> {
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    if (res.ok) {
      this.getStudents().catch(() => {});
    }
    return res.ok;
  },

  async deleteAllStudents(): Promise<boolean> {
    const res = await fetch('/api/students', { method: 'DELETE' });
    if (res.ok) {
      localStorage.removeItem('sisfo_students');
    }
    return res.ok;
  },

  async importStudents(students: Partial<Student>[]): Promise<{ success: boolean; added: number; updated: number; total: number }> {
    const res = await fetch('/api/students/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(students)
    });
    const result = await res.json();
    this.getStudents().catch(() => {});
    return result;
  },

  // 3. Teachers
  async getTeachers(): Promise<Teacher[]> {
    try {
      const res = await fetch('/api/teachers');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem('sisfo_teachers', JSON.stringify(data));
        }
        return data;
      }
    } catch (e) {
      console.warn('API fetch error, trying local cache for teachers', e);
    }
    const cached = localStorage.getItem('sisfo_teachers');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { /* ignore */ }
    }
    return [];
  },

  async addTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher> {
    const res = await fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacher)
    });
    const result = await res.json();
    this.getTeachers().catch(() => {});
    return result;
  },

  async updateTeacher(id: string, teacher: Partial<Teacher>): Promise<Teacher> {
    const res = await fetch(`/api/teachers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacher)
    });
    const result = await res.json();
    this.getTeachers().catch(() => {});
    return result;
  },

  async deleteTeacher(id: string): Promise<boolean> {
    const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
    if (res.ok) {
      this.getTeachers().catch(() => {});
    }
    return res.ok;
  },

  // 4. Classes
  async getClasses(): Promise<ClassItem[]> {
    try {
      const res = await fetch('/api/classes');
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('sisfo_classes', JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('API fetch error, trying local cache for classes', e);
    }
    const cached = localStorage.getItem('sisfo_classes');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { /* ignore */ }
    }
    return [];
  },

  async updateClass(id: string, data: { waliKelasId: string; waliKelasNama: string }): Promise<ClassItem> {
    const res = await fetch(`/api/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    this.getClasses().catch(() => {});
    return result;
  },

  // 5. Attendance
  async getAttendance(filters?: { kelas?: string; tanggal?: string; studentId?: string; bulan?: number; tahun?: number; nama?: string; query?: string }): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (filters?.kelas) params.append('kelas', filters.kelas);
    if (filters?.tanggal) params.append('tanggal', filters.tanggal);
    if (filters?.studentId) params.append('studentId', filters.studentId);
    if (filters?.bulan) params.append('bulan', String(filters.bulan));
    if (filters?.tahun) params.append('tahun', String(filters.tahun));
    if (filters?.nama) params.append('nama', filters.nama);
    if (filters?.query) params.append('query', filters.query);

    const url = `/api/attendance${params.toString() ? '?' + params.toString() : ''}`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (!filters || Object.keys(filters).length === 0) {
          localStorage.setItem('sisfo_attendance', JSON.stringify(data));
        }
        return data;
      }
    } catch (e) {
      console.warn('API fetch error, trying local cache for attendance', e);
    }

    const cached = localStorage.getItem('sisfo_attendance');
    if (cached) {
      try {
        let records: AttendanceRecord[] = JSON.parse(cached);
        if (filters?.kelas) records = records.filter(r => r.kelas.toLowerCase() === filters.kelas!.toLowerCase());
        if (filters?.tanggal) records = records.filter(r => r.tanggal === filters.tanggal);
        if (filters?.studentId) records = records.filter(r => r.studentId === filters.studentId);
        if (filters?.bulan) records = records.filter(r => r.bulan === filters.bulan);
        if (filters?.tahun) records = records.filter(r => r.tahun === filters.tahun);
        if (filters?.nama) {
          const qName = filters.nama.trim().toLowerCase();
          records = records.filter(r => r.nama && r.nama.toLowerCase().includes(qName));
        }
        if (filters?.query) {
          const q = filters.query.trim().toLowerCase();
          records = records.filter(r => 
            (r.nama && r.nama.toLowerCase().includes(q)) ||
            (r.nis && r.nis.toLowerCase().includes(q)) ||
            (r.keterangan && r.keterangan.toLowerCase().includes(q))
          );
        }
        return records;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  },

  async submitAttendance(data: Partial<AttendanceRecord>): Promise<{ success: boolean; record?: AttendanceRecord; error?: string; alreadySubmitted?: boolean; data?: AttendanceRecord }> {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: result.error || 'Gagal menyimpan absensi',
        alreadySubmitted: result.alreadySubmitted,
        data: result.data
      };
    }
    this.getAttendance().catch(() => {});
    return { success: true, record: result };
  },

  async updateAttendance(id: string, data: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const res = await fetch(`/api/attendance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    this.getAttendance().catch(() => {});
    return result;
  },

  async deleteAttendance(id: string): Promise<boolean> {
    const res = await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
    if (res.ok) {
      this.getAttendance().catch(() => {});
    }
    return res.ok;
  },

  async deleteAllAttendance(): Promise<boolean> {
    const res = await fetch('/api/attendance', { method: 'DELETE' });
    if (res.ok) {
      localStorage.removeItem('sisfo_attendance');
    }
    return res.ok;
  },

  // 6. Login & Password
  async login(username: string, password: string, role: 'admin' | 'wali_kelas'): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Login gagal' };
    }
    return { success: true, user: data.user };
  },

  async changePassword(params: { userId?: string; role: 'admin' | 'wali_kelas'; oldPassword?: string; newPassword: string }): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch('/api/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, message: data.message };
  },

  // 7. Backup & Restore
  async getBackupUrl(): Promise<string> {
    return '/api/backup';
  },

  async restoreBackup(dataJson: any): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch('/api/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataJson)
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.removeItem('sisfo_students');
      localStorage.removeItem('sisfo_teachers');
      localStorage.removeItem('sisfo_attendance');
      localStorage.removeItem('sisfo_settings');
      localStorage.removeItem('sisfo_classes');
    } else {
      return { success: false, error: data.error };
    }
    return { success: true, message: data.message };
  }
};
