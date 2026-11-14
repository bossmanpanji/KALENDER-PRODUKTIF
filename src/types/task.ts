export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD (waktu lokal)
  time?: string; // HH:mm (opsional)
  notes?: string; // catatan opsional
  completed: boolean;
  createdAt: number;
}

export interface TaskFormValues {
  title: string;
  date: string;
  time: string;
  notes: string;
}
