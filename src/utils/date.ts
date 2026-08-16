export function getWibDate(): Date {
  const now = new Date();
  // Format to Asia/Jakarta timezone
  const jakartaStr = now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
  return new Date(jakartaStr);
}

export const DAYS_INDO = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const MONTHS_INDO = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function getHariIndo(dateObj: Date = getWibDate()): string {
  return DAYS_INDO[dateObj.getDay()];
}

export function getTanggalIndo(dateObj: Date = getWibDate()): string {
  const day = dateObj.getDate();
  const month = MONTHS_INDO[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${day} ${month.toUpperCase()} ${year}`;
}

export function getTanggalFormatted(dateObj: Date = getWibDate()): string {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getWaktuWib(dateObj: Date = getWibDate()): string {
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const mm = String(dateObj.getMinutes()).padStart(2, '0');
  const ss = String(dateObj.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss} WIB`;
}

export function parseDateString(dateStr: string): Date {
  return new Date(dateStr);
}
