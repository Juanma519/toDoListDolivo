import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { getApiErrorMessage } from '../api/errors';
import { useAuth } from '../context/AuthContext';
import type { AuthResponse } from '../types';

const REDIRECT_DELAY_MS = 2500;

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => navigate('/tasks'), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [success, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/auth/register', { email, password });

      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      login(data);
      setSuccess(true);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, 'No se pudo crear la cuenta'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Crear cuenta</h1>
          <p className="mt-2 text-sm text-slate-500">Registrate para gestionar tus tareas.</p>
        </div>

        {success && (
          <div className="mb-6 flex flex-col items-center gap-2 rounded-xl bg-emerald-50 px-4 py-4 text-center text-sm text-emerald-700">
            <span className="text-2xl">✓</span>
            <p className="font-semibold">¡Cuenta creada exitosamente!</p>
            <p className="text-emerald-600">Iniciando sesión automáticamente...</p>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-emerald-200">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ animation: `grow ${REDIRECT_DELAY_MS}ms linear forwards` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={success}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50 disabled:text-slate-400"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
              disabled={success}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50 disabled:text-slate-400"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
              required
              disabled={success}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50 disabled:text-slate-400"
              placeholder="Repetí tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full rounded-lg bg-sky-600 px-4 py-2 font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-sky-600 hover:text-sky-700">
            Iniciá sesión
          </Link>
        </p>
      </section>
    </main>
  );
}
