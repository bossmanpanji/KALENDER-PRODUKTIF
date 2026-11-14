import { useEffect, useMemo, useState } from 'react';
import { Calendar, ListTodo } from 'lucide-react';
import { DailyAgenda } from './components/DailyAgenda';
import { MonthCalendar } from './components/MonthCalendar';
import { MobileTab, Task, TaskFormValues } from './types/task';
import { formatHeaderToday, getTodayKey, parseDateKey } from './utils/date';
import { loadTasksFromStorage, saveTasksToStorage } from './utils/storage';

export default function App() {
  const [now, setNow] = useState<Date>(() => new Date());
  const todayKey = useMemo(() => getTodayKey(now), [now]);

  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => getTodayKey());
  const [viewYear, setViewYear] = useState<number>(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => new Date().getMonth());
  const [mobileTab, setMobileTab] = useState<MobileTab>('calendar');

  // Perbarui jam lokal tiap 30 detik agar status tenggat tetap akurat
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  // Simpan otomatis ke localStorage setiap kali daftar tugas berubah
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const task of tasks) {
      if (!map[task.date]) {
        map[task.date] = [];
      }
      map[task.date].push(task);
    }
    return map;
  }, [tasks]);

  const selectedDayTasks = tasksByDate[selectedDateKey] ?? [];

  const handleSelectDate = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    const parsed = parseDateKey(dateKey);
    setViewYear(parsed.getFullYear());
    setViewMonth(parsed.getMonth());
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const current = new Date();
    setNow(current);
    const key = getTodayKey(current);
    setSelectedDateKey(key);
    setViewYear(current.getFullYear());
    setViewMonth(current.getMonth());
  };

  const handleAddTask = (values: TaskFormValues) => {
    const newTask: Task = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: values.title,
      date: values.date,
      time: values.time || undefined,
      notes: values.notes || undefined,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [...prev, newTask]);
    handleSelectDate(values.date);
  };

  const handleUpdateTask = (taskId: string, values: TaskFormValues) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              title: values.title,
              date: values.date,
              time: values.time || undefined,
              notes: values.notes || undefined,
            }
          : task
      )
    );
    handleSelectDate(values.date);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const isViewingToday =
    selectedDateKey === todayKey &&
    viewYear === now.getFullYear() &&
    viewMonth === now.getMonth();

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      {/* Header Editorial */}
      <header className="border-b border-[var(--color-ink)] bg-[var(--color-paper)]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-10">
          <h1 className="font-display text-base font-bold tracking-tight text-[var(--color-ink)] sm:text-xl whitespace-nowrap shrink-0">
            KALENDER DISIPLIN
          </h1>

          <p className="hidden text-[var(--text-meta)] text-[var(--color-ink-muted)] md:block whitespace-nowrap">
            {formatHeaderToday(now)}
          </p>

          <button
            type="button"
            onClick={handleGoToday}
            aria-current={isViewingToday ? 'date' : undefined}
            className={`agenda-transition min-h-[44px] rounded-[var(--radius-base)] border px-4 py-2 text-[var(--text-meta)] font-medium whitespace-nowrap shrink-0 ${
              isViewingToday
                ? 'border-[var(--color-rule)] bg-[var(--color-paper-alt)] text-[var(--color-ink)]'
                : 'border-[var(--color-ink)] bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-[var(--color-paper-alt)]'
            }`}
          >
            Hari ini
          </button>
        </div>
      </header>

      {/* Konten Utama: Navigasi Tab di Mobile, Berdampingan di Desktop */}
      <main className="mx-auto max-w-[1280px] px-4 pt-5 pb-24 sm:px-6 sm:pt-7 lg:px-10 lg:pt-10 lg:pb-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          {/* Kolom Kiri: Tampilan Bulan */}
          <div
            className={`${
              mobileTab === 'calendar' ? 'block' : 'hidden'
            } lg:col-span-7 lg:block`}
          >
            <MonthCalendar
              viewYear={viewYear}
              viewMonth={viewMonth}
              selectedDateKey={selectedDateKey}
              todayKey={todayKey}
              now={now}
              tasksByDate={tasksByDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onSelectDate={handleSelectDate}
              onOpenMobileAgenda={() => setMobileTab('agenda')}
            />
          </div>

          {/* Kolom Kanan: Agenda Harian */}
          <div
            className={`${
              mobileTab === 'agenda' ? 'block' : 'hidden'
            } lg:col-span-5 lg:block lg:border-l lg:border-[var(--color-rule)] lg:pl-10`}
          >
            <DailyAgenda
              selectedDateKey={selectedDateKey}
              tasks={selectedDayTasks}
              now={now}
              onSelectDate={handleSelectDate}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        </div>
      </main>

      {/* Navigasi Bawah Khusus Mobile */}
      <nav
        aria-label="Navigasi tampilan utama"
        className="fixed right-0 bottom-0 left-0 z-30 border-t border-[var(--color-rule)] bg-[var(--color-paper)] lg:hidden"
      >
        <div className="grid grid-cols-2">
          <button
            type="button"
            onClick={() => setMobileTab('calendar')}
            aria-current={mobileTab === 'calendar' ? 'page' : undefined}
            className={`agenda-transition relative flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 text-[var(--text-micro)] whitespace-nowrap ${
              mobileTab === 'calendar'
                ? 'font-semibold text-[var(--color-accent)]'
                : 'font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            {mobileTab === 'calendar' && (
              <span
                aria-hidden="true"
                className="absolute top-0 right-6 left-6 h-[2px] bg-[var(--color-accent)]"
              />
            )}
            <Calendar className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
            <span>Kalender</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('agenda')}
            aria-current={mobileTab === 'agenda' ? 'page' : undefined}
            className={`agenda-transition relative flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 text-[var(--text-micro)] whitespace-nowrap ${
              mobileTab === 'agenda'
                ? 'font-semibold text-[var(--color-accent)]'
                : 'font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            {mobileTab === 'agenda' && (
              <span
                aria-hidden="true"
                className="absolute top-0 right-6 left-6 h-[2px] bg-[var(--color-accent)]"
              />
            )}
            <ListTodo className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
            <span>Agenda</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
