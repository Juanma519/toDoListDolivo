import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string | string[];
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    const message = data?.message ?? fallback;
    return Array.isArray(message) ? message.join(', ') : message;
  }

  return fallback;
}
