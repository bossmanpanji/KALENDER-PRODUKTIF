import { useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { Task, TaskFormValues } from '../types/task';
import {
  formatAgendaDateParts,
  isTaskOverdue,
  shiftDateKey,
  sortTasksForAgenda,
} from '../utils/date';
import { TaskForm } from './TaskForm';

interface DailyAgendaProps {
  selectedDateKey: string;
  tasks: Task[];
  now: Date;
  onSelectDate: (dateKey: string) => void;
  onAddTask: (values: TaskFormValues) => void;
  onUpdateTask: (taskId: string, values: TaskFormValues) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function DailyAgenda({
  selectedDateKey,
  tasks,
  now,
  onSelectDate,
  onAddTask,
  onUpdateTask,
  onToggleTask,
  onDeleteTask,
}: DailyAgendaProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const dateParts = formatAgendaDateParts(selectedDateKey, now);
  const sortedTasks = sortTasksForAgenda(tasks);
  const completedCount = tasks.filter((t) => t.completed).length;
  const overdueCount = tasks.filter((t) => isTaskOverdue(t, now)).length;
  const remainingCount = tasks.length - completedCount;

  const editingTask = editingTaskId
    ? tasks.find((t) => t.id === editingTaskId) ?? null
    : null;

  const handleOpenCreate = () => {
    setEditingTaskId(null);
    setConfirmDeleteId(null);
    setIsCreating(true);
  };

  const handleOpenEdit = (task: Task) => {
    setIsCreating(false);
    setConfirmDeleteId(null);
    setEditingTaskId(task.id);
  };

  const handleCreateSubmit = (values: TaskFormValues) => {
    onAddTask(values);
    setIsCreating(false);
  };

  const handleEditSubmit = (values: TaskFormValues) => {
    if (!editingTask) return;
    onUpdateTask(editingTask.id, values);
    setEditingTaskId(null);
  };

  return (
    <section
      aria-label="Agenda Harian"
      key={selectedDateKey}
      className="animate-panel-reveal flex flex-col"
    >
      {/* Header Agenda dengan Angka Tanggal Raksasa Bertabular */}
      <div className="border-b border-[var(--color-ink)] pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <span className="font-display tabular-nums text-[var(--text-display)] font-semibold leading-none tracking-tight text-[var(--color-ink)]">
              {String(dateParts.dayNumber).padStart(2, '0')}
            </span>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h2 className="font-display text-[var(--text-heading)] font-semibold leading-tight text-[var(--color-ink)]">
                  {dateParts.dayName}
                </h2>
                {dateParts.relativeLabel && (
                  <span className="text-[var(--text-meta)] font-semibold text-[var(--color-accent)]">
                    · {dateParts.relativeLabel}
                  </span>
                )}
              </div>
              <p className="text-[var(--text-meta)] text-[var(--color-ink-muted)]">
                {dateParts.monthName} {dateParts.year}
              </p>
            </div>
          </div>

          {/* Stepper Hari Sebelumnya / Berikutnya */}
          <div className="flex items-center gap-1 pt-1">
            <button
              type="button"
              onClick={() => onSelectDate(shiftDateKey(selectedDateKey, -1))}
              aria-label="Hari sebelumnya"
              className="agenda-transition flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-base)] border border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-[var(--color-paper-alt)]"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onSelectDate(shiftDateKey(selectedDateKey, 1))}
              aria-label="Hari berikutnya"
              className="agenda-transition flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-base)] border border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-[var(--color-paper-alt)]"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Ringkasan & Tombol Tambah Tugas */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[var(--text-meta)] tabular-nums text-[var(--color-ink-muted)]">
            <span>{tasks.length} tugas</span>
            {tasks.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{completedCount} selesai</span>
                {remainingCount > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{remainingCount} tersisa</span>
                  </>
                )}
                {overdueCount > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-[var(--color-accent)]">
                      {overdueCount} terlewat
                    </span>
                  </>
                )}
              </>
            )}
          </div>

          {!isCreating && !editingTask && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="agenda-transition flex min-h-[44px] items-center gap-2 rounded-[var(--radius-base)] bg-[var(--color-accent)] px-4 py-2 text-[var(--text-meta)] font-semibold text-[var(--color-accent-contrast)] hover:opacity-90 whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              <span>Tambah tugas</span>
            </button>
          )}
        </div>
      </div>

      {/* Formulir Tambah / Ubah */}
      <div className="pt-4">
        {isCreating && (
          <TaskForm
            mode="create"
            initialValues={{
              title: '',
              date: selectedDateKey,
              time: '',
              notes: '',
            }}
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreating(false)}
          />
        )}

        {editingTask && (
          <TaskForm
            key={editingTask.id}
            mode="edit"
            initialValues={{
              title: editingTask.title,
              date: editingTask.date,
              time: editingTask.time ?? '',
              notes: editingTask.notes ?? '',
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingTaskId(null)}
          />
        )}

        {/* Daftar Tugas Bergaris Buku Agenda */}
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-start gap-4 border-b border-[var(--color-rule)] py-10">
            <BookOpen
              className="h-5 w-5 text-[var(--color-ink-muted)]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <div className="max-w-md space-y-1.5">
              <p className="font-display italic text-[var(--text-subheading)] leading-relaxed text-[var(--color-ink)]">
                Halaman hari ini masih bersih.
              </p>
              <p className="text-[var(--text-meta)] leading-relaxed text-[var(--color-ink-muted)]">
                Gunakan untuk jeda sejenak, atau catat satu pekerjaan penting yang ingin dituntaskan sebelum hari berganti.
              </p>
            </div>
            {!isCreating && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="agenda-transition min-h-[44px] rounded-[var(--radius-base)] border border-[var(--color-ink)] bg-[var(--color-paper)] px-4 py-2 text-[var(--text-meta)] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-alt)] whitespace-nowrap"
              >
                Catat tugas pertama hari ini
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-rule)] border-b border-[var(--color-rule)]">
            {sortedTasks.map((task) => {
              const overdue = isTaskOverdue(task, now);
              const isConfirmingDelete = confirmDeleteId === task.id;
              const isBeingEdited = editingTaskId === task.id;

              return (
                <li
                  key={task.id}
                  className={`agenda-transition py-3.5 ${
                    isBeingEdited ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    {/* Tombol Centang dengan Target Sentuh 44px */}
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      aria-label={
                        task.completed
                          ? `Tandai "${task.title}" belum selesai`
                          : `Tandai "${task.title}" selesai`
                      }
                      aria-pressed={task.completed}
                      className="agenda-transition -ml-2 -mt-1.5 flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[var(--radius-base)] hover:bg-[var(--color-paper-alt)]"
                    >
                      <span
                        className={`agenda-transition flex h-5 w-5 items-center justify-center rounded-[var(--radius-base)] border ${
                          task.completed
                            ? 'border-[var(--color-ink-muted)] bg-[var(--color-ink-muted)] text-[var(--color-paper)]'
                            : overdue
                              ? 'border-[var(--color-accent)] bg-[var(--color-paper)]'
                              : 'border-[var(--color-ink)] bg-[var(--color-paper)]'
                        }`}
                      >
                        {task.completed && (
                          <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                        )}
                      </span>
                    </button>

                    {/* Isi Tugas */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                        <span
                          className={`agenda-transition text-[var(--text-body)] font-medium leading-snug break-words ${
                            task.completed
                              ? 'text-[var(--color-ink-muted)] line-through decoration-[var(--color-ink-muted)] decoration-1'
                              : 'text-[var(--color-ink)]'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      {/* Metadata: Jam + Status Terlewat / Selesai (Teks polos tanpa pill) */}
                      {(task.time || overdue || task.completed) && (
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[var(--text-micro)] tabular-nums">
                          {task.time && (
                            <span
                              className={`inline-flex items-center gap-1 ${
                                overdue
                                  ? 'font-medium text-[var(--color-accent)]'
                                  : 'text-[var(--color-ink-muted)]'
                              }`}
                            >
                              <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                              <span>{task.time}</span>
                            </span>
                          )}

                          {overdue && (
                            <>
                              {task.time && (
                                <span aria-hidden="true" className="text-[var(--color-ink-muted)]">
                                  ·
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-accent)]">
                                <AlertCircle
                                  className="h-3.5 w-3.5 shrink-0"
                                  strokeWidth={2}
                                  aria-hidden="true"
                                />
                                <span>Terlewat</span>
                              </span>
                            </>
                          )}

                          {task.completed && (
                            <>
                              {task.time && (
                                <span aria-hidden="true" className="text-[var(--color-ink-muted)]">
                                  ·
                                </span>
                              )}
                              <span className="text-[var(--color-ink-muted)]">Selesai</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Catatan Opsional */}
                      {task.notes && (
                        <p
                          className={`mt-1.5 text-[var(--text-meta)] leading-relaxed break-words ${
                            task.completed
                              ? 'text-[var(--color-ink-muted)]/85'
                              : 'text-[var(--color-ink-muted)]'
                          }`}
                        >
                          {task.notes}
                        </p>
                      )}
                    </div>

                    {/* Aksi Ubah & Hapus */}
                    <div className="flex shrink-0 items-center gap-0.5 -mr-2 -mt-1.5">
                      {!isConfirmingDelete ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(task)}
                            aria-label={`Ubah tugas "${task.title}"`}
                            className="agenda-transition flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-base)] text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-alt)] hover:text-[var(--color-ink)]"
                          >
                            <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(task.id)}
                            aria-label={`Hapus tugas "${task.title}"`}
                            className="agenda-transition flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-base)] text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-alt)] hover:text-[var(--color-accent)]"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1 pl-1">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteTask(task.id);
                              setConfirmDeleteId(null);
                            }}
                            className="agenda-transition min-h-[44px] rounded-[var(--radius-base)] bg-[var(--color-accent)] px-3 py-1.5 text-[var(--text-micro)] font-semibold text-[var(--color-accent-contrast)] hover:opacity-90 whitespace-nowrap"
                          >
                            Hapus
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="agenda-transition min-h-[44px] rounded-[var(--radius-base)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-2.5 py-1.5 text-[var(--text-micro)] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-alt)] whitespace-nowrap"
                          >
                            Batal
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
