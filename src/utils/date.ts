import { Task } from '../types/task';

export const HARI_SINGKAT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'] as const;

export const HARI_LENGKAP = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

export const BULAN_LENGKAP = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

export const BULAN_SINGKAT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
] as const;

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function shiftDateKey(dateKey: string, deltaDays: number): string {
  const d = parseDateKey(dateKey);
  d.setDate(d.getDate() + deltaDays);
  return toDateKey(d);
}

export function getTodayKey(now: Date = new Date()): string {
  return toDateKey(now);
}

export function getCurrentTimeHHMM(now: Date = new Date()): string {
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function isTaskOverdue(task: Task, now: Date = new Date()): boolean {
  if (task.completed) return false;
  const todayKey = getTodayKey(now);
  if (task.date < todayKey) return true;
  if (task.date === todayKey && task.time && task.time.trim() !== '') {
    const currentHHMM = getCurrentTimeHHMM(now);
    return task.time < currentHHMM;
  }
  return false;
}

export function getMonthGridDays(year: number, monthIndex: number): Date[] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Senin = 0
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const totalCells = startOffset + daysInMonth > 35 ? 42 : 35;

  const startDate = new Date(year, monthIndex, 1 - startOffset);
  const cells: Date[] = [];

  for (let i = 0; i < totalCells; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    cells.push(d);
  }

  return cells;
}

export function formatHeaderToday(now: Date = new Date()): string {
  const dayName = HARI_LENGKAP[now.getDay()];
  const dayNum = now.getDate();
  const monthShort = BULAN_SINGKAT[now.getMonth()];
  const year = now.getFullYear();
  return `${dayName}, ${dayNum} ${monthShort} ${year}`;
}

export function formatAgendaDateParts(dateKey: string, now: Date = new Date()) {
  const date = parseDateKey(dateKey);
  const todayKey = getTodayKey(now);
  const yesterdayKey = shiftDateKey(todayKey, -1);
  const tomorrowKey = shiftDateKey(todayKey, 1);

  let relativeLabel: string | null = null;
  if (dateKey === todayKey) {
    relativeLabel = 'Hari ini';
  } else if (dateKey === yesterdayKey) {
    relativeLabel = 'Kemarin';
  } else if (dateKey === tomorrowKey) {
    relativeLabel = 'Besok';
  }

  return {
    dayNumber: date.getDate(),
    dayName: HARI_LENGKAP[date.getDay()],
    monthName: BULAN_LENGKAP[date.getMonth()],
    monthShort: BULAN_SINGKAT[date.getMonth()],
    year: date.getFullYear(),
    relativeLabel,
  };
}

export function sortTasksForAgenda(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const aHasTime = Boolean(a.time && a.time.trim() !== '');
    const bHasTime = Boolean(b.time && b.time.trim() !== '');
    if (aHasTime && bHasTime) {
      if (a.time! !== b.time!) return a.time!.localeCompare(b.time!);
    } else if (aHasTime !== bHasTime) {
      return aHasTime ? -1 : 1;
    }
    return a.createdAt - b.createdAt;
  });
}
