import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/errors.js';

/** Handler 404 pour les routes non trouvées. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Route introuvable', code: 'NOT_FOUND' });
}

/** Middleware d'erreurs centralisé : traduit HttpError et erreurs PostgreSQL en réponse JSON. */
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message, code: error.code, details: error.details });
    return;
  }

  // Erreurs PostgreSQL fréquentes mappées vers des statuts HTTP.
  const pgError = error as { code?: string };
  switch (pgError?.code) {
    case '23505': // unique_violation
      res.status(409).json({ error: 'Conflit : ressource déjà existante', code: 'CONFLICT' });
      return;
    case '23514': // check_violation
    case '23502': // not_null_violation
      res.status(400).json({ error: 'Contrainte de validation violée', code: 'BAD_REQUEST' });
      return;
    case '23503': // foreign_key_violation
      res.status(400).json({ error: 'Référence invalide', code: 'BAD_REQUEST' });
      return;
    default:
      break;
  }

  // eslint-disable-next-line no-console
  console.error('Erreur non gérée:', error);
  res.status(500).json({ error: 'Erreur interne du serveur', code: 'INTERNAL_ERROR' });
}
