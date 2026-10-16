import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Enveloppe un handler async pour propager les erreurs au middleware d'erreurs. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
