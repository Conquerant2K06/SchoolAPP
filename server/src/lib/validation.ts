import { HttpError } from './errors.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function requireString(value: unknown, field: string, { min = 1, max = 500 } = {}): string {
  if (typeof value !== 'string') {
    throw HttpError.badRequest(`Le champ « ${field} » est requis`);
  }
  const trimmed = value.trim();
  if (trimmed.length < min) {
    throw HttpError.badRequest(`Le champ « ${field} » doit contenir au moins ${min} caractère(s)`);
  }
  if (trimmed.length > max) {
    throw HttpError.badRequest(`Le champ « ${field} » dépasse la longueur maximale (${max})`);
  }
  return trimmed;
}

export function requireEmail(value: unknown): string {
  const email = requireString(value, 'email', { max: 320 }).toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    throw HttpError.badRequest('Adresse e-mail invalide');
  }
  return email;
}

export const PASSWORD_MIN_LENGTH = 8;

export function requirePassword(value: unknown): string {
  const password = requireString(value, 'mot de passe', { min: PASSWORD_MIN_LENGTH, max: 128 });
  return password;
}

export function requirePositiveInt(value: unknown, field: string): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw HttpError.badRequest(`Le champ « ${field} » doit être un entier strictement positif`);
  }
  return parsed;
}

export function requireId(value: unknown, field = 'id'): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw HttpError.badRequest(`Identifiant « ${field} » invalide`);
  }
  return parsed;
}

export function requireTrimester(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 3) {
    throw HttpError.badRequest('Le trimestre doit être compris entre 1 et 3');
  }
  return parsed;
}

export function requireGradeValue(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 20) {
    throw HttpError.badRequest('La note doit être comprise entre 0 et 20');
  }
  return Math.round(parsed * 100) / 100;
}
