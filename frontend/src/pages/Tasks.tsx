import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/api';
import { getApiErrorMessage } from '../api/errors';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import { useAuth } from '../context/AuthContext';
import type { Task, TaskFormValues, TaskStatus } from '../types';

type FilterValue = 'ALL' | TaskStatus;

function toApiPayload(values: TaskFormValues) {
  return {
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    dueDate: values.dueDate ? new Date(`${values.dueDate}T00:00:00`).toISOString() : undefined,
    status: values.status,
  };
}

export function Tasks() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterValue>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const filteredTasks = useMemo(() => {
    if (filter === 'ALL') {
      return tasks;
    }

    return tasks.filter((task) => task.status === filter);
  }, [tasks, filter]);

  async function fetchTasks() {
    setIsLoading(true);
    setError('');

    try {
      const { data } = await api.get<Task[]>('/tasks');
      setTasks(data);
    } catch {
      setError('No se pudieron cargar las tareas');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchTasks();
  }, []);

  function handleNewTask() {
    setEditingTask(null);
    setIsFormOpen(true);
  }

  function handleEditTask(task: Task) {
    setEditingTask(task);
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingTask(null);
    setIsFormOpen(false);
  }

  async function handleSubmit(values: TaskFormValues) {
    setError('');
    setIsSubmitting(true);

    try {
      const payload = toApiPayload(values);

      if (editingTask) {
        const { data } = await api.patch<Task>(`/tasks/${editingTask.id}`, payload);
        setTasks((current) => current.map((task) => (task.id === data.id ? data : task)));
      } else {
        const { data } = await api.post<Task>('/tasks', payload);
        setTasks((current) => [data, ...current]);
      }

      closeForm();
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, 'No se pudo guardar la tarea'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(taskId: number) {
    const shouldDelete = window.confirm('¿Querés eliminar esta tarea?');

    if (!shouldDelete) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch {
      setError('No se pudo eliminar la tarea');
    }
  }

  async function handleToggleStatus(task: Task) {
    const nextStatus: TaskStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    try {
      const { data } = await api.patch<Task>(`/tasks/${task.id}`, { status: nextStatus });
      setTasks((current) => current.map((item) => (item.id === data.id ? data : item)));
    } catch {
      setError('No se pudo actualizar el estado de la tarea');
    }
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Sesión activa: {user?.email}</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">Mis tareas</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleNewTask}
              className="rounded-lg bg-sky-600 px-4 py-2 font-medium text-white transition hover:bg-sky-700"
            >
              Nueva tarea
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <section className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            {tasks.length} tarea{tasks.length === 1 ? '' : 's'} en total
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              ['ALL', 'Todas'],
              ['PENDING', 'Pendientes'],
              ['COMPLETED', 'Completadas'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value as FilterValue)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === value
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {isFormOpen && (
          <div className="mb-6">
            <TaskForm
              initialTask={editingTask}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Cargando tareas...
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
            No hay tareas para mostrar.
          </div>
        )}
      </div>
    </main>
  );
}
