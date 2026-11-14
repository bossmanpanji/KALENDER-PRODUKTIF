import { supabase } from '../supabaseClient';
import { Task, TaskFormValues } from '../types/task';

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  date: string;
  time: string | null;
  notes: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

function mapRowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time ?? undefined,
    notes: row.notes ?? undefined,
    completed: row.completed,
    createdAt: new Date(row.created_at).getTime(),
  };
}

// 1. Memuat semua tugas milik pengguna yang sedang masuk (RLS memfilter otomatis via auth.uid())
export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, user_id, title, date, time, notes, completed, created_at, updated_at')
    .order('date', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as TaskRow[]).map(mapRowToTask);
}

// 2. Membuat tugas baru milik pengguna aktif
export async function createTask(values: TaskFormValues, userId: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: values.title.trim(),
      date: values.date,
      time: values.time.trim() || null,
      notes: values.notes.trim() || null,
      completed: false,
    })
    .select('id, user_id, title, date, time, notes, completed, created_at, updated_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToTask(data as TaskRow);
}

// 3. Memperbarui detail tugas (judul, tanggal, jam, catatan)
export async function updateTask(taskId: string, values: TaskFormValues): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      title: values.title.trim(),
      date: values.date,
      time: values.time.trim() || null,
      notes: values.notes.trim() || null,
    })
    .eq('id', taskId)
    .select('id, user_id, title, date, time, notes, completed, created_at, updated_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToTask(data as TaskRow);
}

// 4. Mengubah status selesai / belum selesai pada tugas
export async function toggleTaskCompleted(taskId: string, completed: boolean): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ completed })
    .eq('id', taskId)
    .select('id, user_id, title, date, time, notes, completed, created_at, updated_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToTask(data as TaskRow);
}

// 5. Menghapus tugas berdasarkan id
export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);

  if (error) {
    throw new Error(error.message);
  }
}
