import { AlertCircle, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '../types/task';
import {
  BULAN_LENGKAP,
  getMonthGridDays,
  isTaskOverdue,
  toDateKey,
} from '../utils/date';
import { HARI_SINGKAT } from '../utils/date';
import { MonthProgress } from './MonthProgress';

interface MonthCalendarProps {
  viewYear: number;
  viewMonth: number;
  selectedDateKey: string;
  todayKey: string;
  now: Date;
  tasksByDate: Record<string, Task[]>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateKey: string) => void;
}

export function MonthCalendar({
  viewYear,
  viewMonth,
  selectedDateKey,
  todayKey,
  now,
  tasksByDate,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: MonthCalendarProps) {
  const gridDays = getMonthGridDays(viewYear, viewMonth);

  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-`;
  let monthTotalTasks = 0;
  let monthCompletedTasks = 0;
  for (const [dateKey, dayTasks] of Object.entries(tasksByDate)) {
    if (dateKey.startsWith(monthPrefix)) {
      monthTotalTasks += dayTasks.length;
      for (const t of dayTasks) {
        if (t.completed) monthCompletedTasks += 1;
      }
    }
  }

  return (
    <section aria-label="Kalender Bulanan" className="flex flex-col">
      {/* Header Navigasi Bulan & Indikator Persentase Capaian */}
      <div className="border-b border-[var(--color-rule)] pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-[var(--text-heading)] font-semibold tracking-tight text-[var(--color-ink)]">
              {BULAN_LENGKAP[viewMonth]}
            </h2>
            <span className="font-display text-[var(--text-subheading)] tabular-nums text-[var(--color-ink-muted)]">
              {viewYear}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPrevMonth}
              aria-label="Bulan sebelumnya"
              className="agenda-transition flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-base)] border border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-[var(--color-paper-alt)]"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onNextMonth}
              aria-label="Bulan berikutnya"
              className="agenda-transition flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-base)] border border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-[var(--color-paper-alt)]"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>

        <MonthProgress
          monthName={BULAN_LENGKAP[viewMonth]}
          completedCount={monthCompletedTasks}
          totalCount={monthTotalTasks}
        />
      </div>

      {/* Header Hari (Sen - Min) */}
      <div
        className="grid grid-cols-7 border-b border-[var(--color-rule)]"
        role="row"
      >
        {HARI_SINGKAT.map((dayLabel, idx) => (
          <div
            key={dayLabel}
            className={`py-2.5 text-center text-[var(--text-micro)] font-medium tracking-wide ${
              idx === 6 ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-muted)]'
            }`}
          >
            {dayLabel}
          </div>
        ))}
      </div>

      {/* Grid Tanggal */}
      <div
        className="grid grid-cols-7 border-l border-[var(--color-rule)]"
        role="grid"
        aria-label={`${BULAN_LENGKAP[viewMonth]} ${viewYear}`}
      >
        {gridDays.map((dayDate) => {
          const dateKey = toDateKey(dayDate);
          const isCurrentMonth =
            dayDate.getMonth() === viewMonth && dayDate.getFullYear() === viewYear;
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDateKey;
          const isSunday = dayDate.getDay() === 0;

          const dayTasks = tasksByDate[dateKey] ?? [];
          const totalCount = dayTasks.length;
          const completedCount = dayTasks.filter((t) => t.completed).length;
          const overdueCount = dayTasks.filter((t) => isTaskOverdue(t, now)).length;
          const allDone = totalCount > 0 && completedCount === totalCount;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              aria-label={`${dayDate.getDate()} ${BULAN_LENGKAP[dayDate.getMonth()]} ${dayDate.getFullYear()}${
                totalCount > 0 ? `, ${totalCount} tugas` : ''
              }${overdueCount > 0 ? `, ${overdueCount} terlewat` : ''}`}
              aria-pressed={isSelected}
              className={`agenda-transition relative flex min-h-[50px] flex-col justify-between border-r border-b border-[var(--color-rule)] p-1.5 text-left sm:min-h-[80px] sm:p-2 lg:min-h-[92px] lg:p-2.5 ${
                isSelected
                  ? 'bg-[var(--color-paper-alt)] ring-1 ring-inset ring-[var(--color-ink)]'
                  : 'bg-[var(--color-paper)] hover:bg-[var(--color-paper-alt)]/60'
              } ${!isCurrentMonth ? 'opacity-45' : ''}`}
            >
              {/* Baris Atas Sel: Angka Tanggal + Penanda Hari Ini */}
              <div className="flex w-full items-start justify-between gap-1">
                <span
                  className={`font-display tabular-nums leading-none text-base sm:text-lg ${
                    isToday
                      ? 'font-bold text-[var(--color-accent)] underline decoration-2 underline-offset-4'
                      : isSelected
                        ? 'font-semibold text-[var(--color-ink)]'
                        : isSunday && isCurrentMonth
                          ? 'font-medium text-[var(--color-accent)]'
                          : 'font-medium text-[var(--color-ink)]'
                  }`}
                >
                  {dayDate.getDate()}
                </span>

                {isToday && (
                  <span className="hidden text-[11px] font-medium text-[var(--color-accent)] sm:inline whitespace-nowrap">
                    Hari ini
                  </span>
                )}
              </div>

              {/* Baris Bawah Sel: Penanda Jumlah Tugas (Tanpa Pill) */}
              <div className="mt-2 flex w-full items-end justify-between">
                {totalCount > 0 ? (
                  <div className="flex w-full flex-col gap-0.5">
                    {/* Mobile compact marker */}
                    <div className="flex items-center gap-1 sm:hidden">
                      {overdueCount > 0 ? (
                        <AlertCircle
                          className="h-3 w-3 shrink-0 text-[var(--color-accent)]"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      ) : allDone ? (
                        <Check
                          className="h-3 w-3 shrink-0 text-[var(--color-ink-muted)]"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      ) : null}
                      <span
                        className={`tabular-nums text-[11px] font-semibold leading-none ${
                          overdueCount > 0
                            ? 'text-[var(--color-accent)]'
                            : allDone
                              ? 'text-[var(--color-ink-muted)] line-through'
                              : 'text-[var(--color-ink)]'
                        }`}
                      >
                        {totalCount}
                      </span>
                    </div>

                    {/* Desktop / Tablet editorial count marker */}
                    <div className="hidden sm:flex sm:flex-col sm:gap-0.5">
                      <span
                        className={`tabular-nums text-[12px] leading-tight whitespace-nowrap ${
                          allDone
                            ? 'text-[var(--color-ink-muted)] line-through'
                            : 'font-medium text-[var(--color-ink)]'
                        }`}
                      >
                        {totalCount} tugas
                      </span>
                      {overdueCount > 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-medium leading-tight text-[var(--color-accent)] whitespace-nowrap">
                          <AlertCircle className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden="true" />
                          <span className="tabular-nums">{overdueCount} terlewat</span>
                        </span>
                      )}
                    </div>

                    {/* Garis penanda tipis bergaya agenda di bagian bawah sel */}
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 block h-[2px] w-full ${
                        overdueCount > 0
                          ? 'bg-[var(--color-accent)]'
                          : allDone
                            ? 'bg-[var(--color-rule)]'
                            : 'bg-[var(--color-ink)]'
                      }`}
                    />
                  </div>
                ) : (
                  <span className="h-[2px] w-full" aria-hidden="true" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
