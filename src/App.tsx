import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Calendar, ListTodo, LogOut } from 'lucide-react';
import { AuthGate } from './components/AuthGate';
import { DailyAgenda } from './components/DailyAgenda';
import { MonthCalendar } from './components/MonthCalendar';
import {
  createTask,
  deleteTask,
  fetchTasks,
  toggleTaskCompleted,
  updateTask,
} from './services/tasksService';
import { supabase } from './supabaseClient';
import { MobileTab, Task, TaskFormValues } from './types/task';
import { formatHeaderToday, getTodayKey, parseDateKey } from './utils/date';

export default function App() {
  const [now, setNow] = useState<Date>(() => new Date());
  const todayKey = useMemo(() => getTodayKey(now), [now]);

  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

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

  // Pantau status autentikasi Supabase
  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
      if (!nextSession) {
        setTasks([]);
        setDbError(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Muat tugas milik pengguna aktif dari Supabase
  const loadUserTasks = useCallback(async () => {
    if (!session?.user) return;
    setTasksLoading(true);
    setDbError(null);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setDbError(err instanceof Error ? err.message : 'Gagal memuat tugas dari Supabase.');
    } finally {
      setTasksLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      loadUserTasks();
    }
  }, [session?.user, loadUserTasks]);

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

  const handleAddTask = async (values: TaskFormValues) => {
    if (!session?.user) return;
    setDbError(null);
    try {
      const created = await createTask(values, session.user.id);
      setTasks((prev) => [...prev, created]);
      handleSelectDate(values.date);
    } catch (err) {
      setDbError(err instanceof Error ? err.message : 'Gagal menyimpan tugas baru.');
    }
  };

  const handleUpdateTask = async (taskId: string, values: TaskFormValues) => {
    setDbError(null);
    try {
      const updated = await updateTask(taskId, values);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updated : task)));
      handleSelectDate(values.date);
    } catch (err) {
      setDbError(err instanceof Error ? err.message : 'Gagal memperbarui tugas.');
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const nextCompleted = !target.completed;

    setDbError(null);
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, completed: nextCompleted } : task))
    );

    try {
      const updated = await toggleTaskCompleted(taskId, nextCompleted);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updated : task)));
    } catch (err) {
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, completed: target.completed } : task))
      );
      setDbError(err instanceof Error ? err.message : 'Gagal mengubah status tugas.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const previousTasks = tasks;
    setDbError(null);
    setTasks((prev) => prev.filter((task) => task.id !== taskId));

    try {
      await deleteTask(taskId);
    } catch (err) {
      setTasks(previousTasks);
      setDbError(err instanceof Error ? err.message : 'Gagal menghapus tugas.');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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

          {session ? (
            <div className="flex items-center gap-2 shrink-0">
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
              <button
                type="button"
                onClick={handleSignOut}
                aria-label="Keluar dari akun"
                className="agenda-transition flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-[var(--radius-base)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-2 text-[var(--text-meta)] font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-alt)] hover:text-[var(--color-ink)] whitespace-nowrap shrink-0"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <span className="text-[var(--text-meta)] text-[var(--color-ink-muted)] whitespace-nowrap shrink-0">
              {formatHeaderToday(now)}
            </span>
          )}
        </div>
      </header>

      {/* Konten Utama */}
      <main className="mx-auto max-w-[1280px] px-4 pt-5 pb-24 sm:px-6 sm:pt-7 lg:px-10 lg:pt-10 lg:pb-12">
        {authLoading ? (
          <div className="py-12 text-center text-[var(--text-meta)] text-[var(--color-ink-muted)]">
            Memeriksa sesi akun...
          </div>
        ) : !session ? (
          <div className="py-6 sm:py-10">
            <AuthGate />
          </div>
        ) : (
          <>
            {dbError && (
              <div
                role="alert"
                className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-base)] border border-[var(--color-accent)] bg-[var(--color-paper-alt)] px-4 py-3 text-[var(--text-meta)] text-[var(--color-accent)]"
              >
                <span>{dbError}</span>
                <button
                  type="button"
                  onClick={loadUserTasks}
                  className="min-h-[44px] rounded-[var(--radius-base)] border border-[var(--color-accent)] px-3 py-1.5 font-medium hover:bg-[var(--color-paper)] whitespace-nowrap"
                >
                  Muat ulang
                </button>
              </div>
            )}

            {tasksLoading && tasks.length === 0 ? (
              <div className="py-12 text-center text-[var(--text-meta)] text-[var(--color-ink-muted)]">
                Memuat daftar tugas...
              </div>
            ) : (
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
            )}
          </>
        )}
      </main>

      {/* Navigasi Bawah Khusus Mobile */}
      {session && (
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
      )}
    </div>
  );
}
