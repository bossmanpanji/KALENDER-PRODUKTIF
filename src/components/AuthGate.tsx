import { FormEvent, useState } from 'react';
import { supabase } from '../supabaseClient';

export function AuthGate() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Masukkan surel dan kata sandi terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (signInError) {
          setError(signInError.message);
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });
        if (signUpError) {
          setError(signUpError.message);
        } else if (!data.session) {
          setInfo('Pendaftaran berhasil. Periksa surel Anda untuk tautan konfirmasi sebelum masuk.');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md border border-[var(--color-rule)] bg-[var(--color-paper-alt)] p-6 rounded-[var(--radius-base)]">
      <div className="border-b border-[var(--color-rule)] pb-4">
        <h2 className="font-display text-[var(--text-heading)] font-semibold text-[var(--color-ink)]">
          {mode === 'login' ? 'Masuk ke agenda Anda' : 'Buat akun agenda'}
        </h2>
        <p className="mt-1 text-[var(--text-meta)] text-[var(--color-ink-muted)]">
          Daftar tugas tersimpan aman per akun di Supabase.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="auth-email"
            className="text-[var(--text-meta)] font-medium text-[var(--color-ink)]"
          >
            Surel
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@contoh.com"
            className="min-h-[44px] w-full rounded-[var(--radius-base)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-2 text-[var(--text-body)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/70 focus:border-[var(--color-ink)] focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="auth-password"
            className="text-[var(--text-meta)] font-medium text-[var(--color-ink)]"
          >
            Kata sandi
          </label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            className="min-h-[44px] w-full rounded-[var(--radius-base)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-2 text-[var(--text-body)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/70 focus:border-[var(--color-ink)] focus:outline-none"
          />
        </div>

        {error && (
          <p role="alert" className="text-[var(--text-meta)] font-medium text-[var(--color-accent)]">
            {error}
          </p>
        )}

        {info && (
          <p role="status" className="text-[var(--text-meta)] font-medium text-[var(--color-ink)]">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="agenda-transition min-h-[44px] w-full rounded-[var(--radius-base)] bg-[var(--color-accent)] px-4 py-2 text-[var(--text-meta)] font-semibold text-[var(--color-accent-contrast)] hover:opacity-90 disabled:opacity-60"
        >
          {submitting
            ? 'Memproses...'
            : mode === 'login'
              ? 'Masuk'
              : 'Daftar akun'}
        </button>
      </form>

      <div className="mt-4 border-t border-[var(--color-rule)] pt-4 text-[var(--text-meta)] text-[var(--color-ink-muted)]">
        {mode === 'login' ? (
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setInfo(null);
            }}
            className="min-h-[44px] font-medium text-[var(--color-ink)] underline underline-offset-4 hover:text-[var(--color-accent)]"
          >
            Belum punya akun? Daftar di sini
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setInfo(null);
            }}
            className="min-h-[44px] font-medium text-[var(--color-ink)] underline underline-offset-4 hover:text-[var(--color-accent)]"
          >
            Sudah punya akun? Masuk di sini
          </button>
        )}
      </div>
    </div>
  );
}
