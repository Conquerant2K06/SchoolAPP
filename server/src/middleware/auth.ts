import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Role } from '../config.js';
import type { UserRow } from '../db/store.js';
import { HttpError } from '../lib/errors.js';
import { extractBearerToken, verifyToken } from '../lib/token.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserRow;
    }
  }
}

export interface AuthDeps {
  jwtSecret: string;
  findUserById(id: number): Promise<UserRow | null>;
}

/**
 * Middleware d'authentification : vérifie le JWT Bearer, la signature,
 * l'expiration et que le compte existe et est actif.
 */
export function requireAuth(deps: AuthDeps): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    void (async () => {
      try {
        const token = extractBearerToken(req.headers.authorization);
        if (!token) {
          throw HttpError.unauthorized();
        }
        let payload;
        try {
          payload = verifyToken(token, deps.jwtSecret);
        } catch {
          throw HttpError.unauthorized('Session expirée ou invalide');
        }
        const user = await deps.findUserById(payload.sub);
        if (!user || !user.active) {
          throw HttpError.unauthorized('Compte désactivé ou introuvable');
        }
        req.user = user;
        next();
      } catch (error) {
        next(error);
      }
    })();
  };
}

/** Middleware de contrôle de rôle : doit être chaîné après requireAuth. */
export function requireRole(...roles: Role[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(HttpError.unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(HttpError.forbidden());
      return;
    }
    next();
  };
}
