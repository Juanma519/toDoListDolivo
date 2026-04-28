import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onToggleStatus: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete, onToggleStatus }: TaskCardProps) {
  const formattedDueDate = task.dueDate
    ? new Intl.DateTimeFormat('es-AR', {
        dateStyle: 'medium',
      }).format(new Date(task.dueDate))
    : 'Sin fecha';

  const isCompleted = task.status === 'COMPLETED';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`text-lg font-semibold ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
              {task.title}
            </h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isCompleted ? 'Completada' : 'Pendiente'}
            </span>
          </div>

          {task.description ? (
            <p className="text-sm leading-6 text-slate-600">{task.description}</p>
          ) : (
            <p className="text-sm italic text-slate-400">Sin descripción</p>
          )}

          <p className="text-sm text-slate-500">
            Vencimiento: <span className="font-medium text-slate-700">{formattedDueDate}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          <button
            type="button"
            onClick={() => onToggleStatus(task)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Marcar {isCompleted ? 'pendiente' : 'completada'}
          </button>
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}
