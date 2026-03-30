import { HttpErrorResponse } from '@angular/common/http';

export function toDateInputValue(value?: string | null): string {
  if (!value) {
    return '';
  }

  const normalized = value.trim();

  if (normalized.length >= 10 && normalized[4] === '-' && normalized[7] === '-') {
    return normalized.slice(0, 10);
  }

  const parsedDate = new Date(normalized);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toISOString().slice(0, 10);
}

export function formatDateOnly(value?: string | null): string {
  if (!value) {
    return '-';
  }

  const normalized = value.trim();

  if (normalized.length >= 10 && normalized[4] === '-' && normalized[7] === '-') {
    return normalized.slice(0, 10);
  }

  const parsedDate = new Date(normalized);

  if (Number.isNaN(parsedDate.getTime())) {
    return normalized;
  }

  return parsedDate.toISOString().slice(0, 10);
}

export function formatDateTime(value?: string | null): string {
  if (!value) {
    return '-';
  }

  const normalized = value.trim();

  if (normalized.includes('T')) {
    return normalized.replace('T', ' ').replace('Z', '').split('.')[0];
  }

  return normalized;
}

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    if (typeof error.error?.message === 'string' && error.error.message.trim().length > 0) {
      return error.error.message;
    }

    if (typeof error.message === 'string' && error.message.trim().length > 0) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}
