import { Task } from '../types/task';
import { getTodayKey, shiftDateKey } from './date';

const STORAGE_KEY = 'kalender_disiplin_tasks_v1';

export function createInitialTasks(now: Date = new Date()): Task[] {
  const today = getTodayKey(now);
  const yesterday = shiftDateKey(today, -1);
  const tomorrow = shiftDateKey(today, 1);
  const inThreeDays = shiftDateKey(today, 3);
  const baseTime = now.getTime();

  return [
    {
      id: 'seed-1',
      title: 'Kirim revisi bab 3 ke Bu Ratna',
      date: yesterday,
      time: '16:00',
      notes: 'Lampirkan daftar pustaka terbaru dan grafik lampiran B.',
      completed: false,
      createdAt: baseTime - 4000,
    },
    {
      id: 'seed-2',
      title: 'Bayar listrik sebelum tanggal 20',
      date: today,
      time: '09:30',
      notes: 'Cek angka meteran lalu simpan bukti transfer PLN.',
      completed: false,
      createdAt: baseTime - 3000,
    },
    {
      id: 'seed-3',
      title: 'Rangkum catatan rapat mingguan klien',
      date: today,
      time: '14:00',
      notes: 'Bagikan tiga poin tindak lanjut ke tim desain.',
      completed: false,
      createdAt: baseTime - 2000,
    },
    {
      id: 'seed-4',
      title: 'Beli kopi bubuk dan filter',
      date: today,
      time: '',
      notes: 'Arabika Gayo giling sedang dan kertas saring V60 ukuran 02.',
      completed: true,
      createdAt: baseTime - 1000,
    },
    {
      id: 'seed-5',
      title: 'Perpanjang buku perpustakaan kampus',
      date: tomorrow,
      time: '11:00',
      notes: 'Bawa kartu anggota sebelum jam istirahat siang.',
      completed: false,
      createdAt: baseTime,
    },
    {
      id: 'seed-6',
      title: 'Siapkan berkas tagihan proyek bulanan',
      date: inThreeDays,
      time: '15:30',
      notes: 'Rekap jam kerja dan kirim faktur PDF via surel.',
      completed: false,
      createdAt: baseTime + 1000,
    },
  ];
}

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      const seeded = createInitialTasks();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item): item is Task =>
        Boolean(item) &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.date === 'string' &&
        typeof item.completed === 'boolean'
    );
  } catch {
    return createInitialTasks();
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Abaikan kegagalan penulisan kuota penyimpanan lokal
  }
}
