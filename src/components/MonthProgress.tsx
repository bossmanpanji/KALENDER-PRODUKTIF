interface MonthProgressProps {
  monthName: string;
  completedCount: number;
  totalCount: number;
}

export function MonthProgress({
  monthName,
  completedCount,
  totalCount,
}: MonthProgressProps) {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const ratio = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <div className="mt-3 flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-[var(--text-micro)] tabular-nums">
        <div className="flex flex-wrap items-baseline gap-x-2 text-[var(--color-ink-muted)]">
          <span className="font-medium text-[var(--color-ink)]">
            Capaian {monthName}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {totalCount === 0
              ? 'Belum ada tugas tercatat'
              : `${completedCount} dari ${totalCount} tugas selesai`}
          </span>
        </div>

        <span
          className={`font-semibold shrink-0 ${
            totalCount > 0 && percentage === 100
              ? 'text-[var(--color-accent)]'
              : 'text-[var(--color-ink)]'
          }`}
        >
          {percentage}%
        </span>
      </div>

      {/* Bilah progres CSS berbasis token dengan transisi scaleX ramah GPU */}
      <div
        role="progressbar"
        aria-label={`Persentase tugas selesai bulan ${monthName}`}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 w-full overflow-hidden rounded-[var(--radius-base)] border border-[var(--color-rule)] bg-[var(--color-paper-alt)]"
      >
        <div
          className="agenda-transition h-full w-full origin-left bg-[var(--color-accent)]"
          style={{ transform: `scaleX(${ratio})` }}
        />
      </div>
    </div>
  );
}
