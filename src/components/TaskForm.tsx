import { FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { TaskFormValues } from '../types/task';

interface TaskFormProps {
  mode: 'create' | 'edit';
  initialValues: TaskFormValues;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
}

export function TaskForm({ mode, initialValues, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [date, setDate] = useState(initialValues.date);
  const [time, setTime] = useState(initialValues.time);
  const [notes, setNotes] = useState(initialValues.notes);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Judul tugas tidak boleh kosong.');
      return;
    }
    if (!date) {
      setError('Pilih tanggal pelaksanaan tugas.');
      return;
    }
    setError(null);
    onSubmit({
      title: trimmedTitle,
      date,
      time: time.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="animate-panel-reveal mb-6 rounded-[var(--radius-base)] border border-[var(--color-ink)] bg-[var(--color-paper-alt)] p-4 sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between border-b border-[var(--color-rule)] pb-3">
        <h3 className="font-display text-[var(--text-subheading)] font-semibold text-[var(--color-ink)]">
          {mode === 'create' ? 'Catat tugas baru' : 'Ubah rincian tugas'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Tutup formulir tugas"
          className="agenda-transition flex min-h-[44px] min-w-[44px] -mr-2 items-center justify-center rounded-[var(--radius-base)] text-[var(--color-ink-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]"
        >
          <X className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Judul */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="task-title"
            className="text-[var(--text-meta)] font-medium text-[var(--color-ink)]"
          >
            Judul tugas
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Misal: Kirim revisi bab 3 ke Bu Ratna"
            autoFocus
            className="min-h-[44px] w-full rounded-[var(--radius-base)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-2 text-[var(--text-body)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/70 focus:border-[var(--color-ink)] focus:outline-none"
          />
        </div>

        {/* Tanggal & Jam (Opsional) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="task-date"
              className="text-[var(--text-meta)] font-medium text-[var(--color-ink)]"
            >
              Tanggal
            </label>
            <input
              id="task-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="min-h-[44px] w-full rounded-[var(--radius-base)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-2 text-[var(--text-body)] tabular-nums text-[var(--color-ink)] focus:border-[var(--color-ink)] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="task-time"
              className="text-[var(--text-meta)] font-medium text-[var(--color-ink)]"
            >
              Jam <span className="font-normal text-[var(--color-ink-muted)]">(opsional)</span>
            </label>
            <input
              id="task-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="min-h-[44px] w-full rounded-[var(--radius-base)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-2 text-[var(--text-body)] tabular-nums text-[var(--color-ink)] focus:border-[var(--color-ink)] focus:outline-none"
            />
          </div>
        </div>

        {/* Catatan (Opsional) */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="task-notes"
            className="text-[var(--text-meta)] font-medium text-[var(--color-ink)]"
          >
            Catatan <span className="font-normal text-[var(--color-ink-muted)]">(opsional)</span>
          </label>
          <textarea
            id="task-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Rincian singkat, alamat, atau pengingat tambahan"
            className="min-h-[72px] w-full resize-y rounded-[var(--radius-base)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-2 text-[var(--text-body)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/70 focus:border-[var(--color-ink)] focus:outline-none"
          />
        </div>

        {error && (
          <p role="alert" className="text-[var(--text-meta)] font-medium text-[var(--color-accent)]">
            {error}
          </p>
        )}

        {/* Aksi Formulir */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="agenda-transition min-h-[44px] rounded-[var(--radius-base)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-4 py-2 text-[var(--text-meta)] font-medium text-[var(--color-ink)] hover:bg-[var(--color-paper-alt)] whitespace-nowrap"
          >
            Batal
          </button>
          <button
            type="submit"
            className="agenda-transition min-h-[44px] rounded-[var(--radius-base)] bg-[var(--color-accent)] px-5 py-2 text-[var(--text-meta)] font-semibold text-[var(--color-accent-contrast)] hover:opacity-90 whitespace-nowrap"
          >
            {mode === 'create' ? 'Simpan tugas' : 'Simpan perubahan'}
          </button>
        </div>
      </div>
    </form>
  );
}
