import { useEffect, useState, type FormEvent } from 'react';
import type { Task, TaskFormValues, TaskStatus } from '../types';

interface TaskFormProps {
  initialTask?: Task | null;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const initialValues: TaskFormValues = {
  title: '',
  description: '',
  dueDate: '',
  status: 'PENDING',
};

function toDateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : '';
}

export function TaskForm({ initialTask, onSubmit, onCancel, isSubmitting }: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>(initialValues);

  useEffect(() => {
    if (!initialTask) {
      setValues(initialValues);
      return;
    }

    setValues({
      title: initialTask.title,
      description: initialTask.description ?? '',
      dueDate: toDateInputValue(initialTask.dueDate),
      status: initialTask.status,
    });
  }, [initialTask]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
          Título
        </label>
        <input
          id="title"
          type="text"
          value={values.title}
          onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          placeholder="Ej: Comprar comida"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
          Descripción
        </label>
        <textarea
          id="description"
          value={values.description}
          onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          placeholder="Detalle opcional"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="dueDate" className="mb-1 block text-sm font-medium text-slate-700">
            Fecha de vencimiento
          </label>
          <input
            id="dueDate"
            type="date"
            value={values.dueDate}
            onChange={(event) => setValues((current) => ({ ...current, dueDate: event.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
            Estado
          </label>
          <select
            id="status"
            value={values.status}
            onChange={(event) =>
              setValues((current) => ({ ...current, status: event.target.value as TaskStatus }))
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="PENDING">Pendiente</option>
            <option value="COMPLETED">Completada</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? 'Guardando...' : initialTask ? 'Actualizar tarea' : 'Crear tarea'}
        </button>
      </div>
    </form>
  );
}
