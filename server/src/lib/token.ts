import jwt from 'jsonwebtoken';
import type { Role } from '../config.js';

export interface TokenPayload {
  sub: number;
  email: string;
  role: Role;
}

/**
 * Signe un JWT contenant l'identité et le rôle de l'utilisateur.
 */
export function signToken(payload: TokenPayload, secret: string, expiresIn: string | number): string {
  return jwt.sign({ sub: payload.sub, email: payload.email, role: payload.role }, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Vérifie un JWT (signature + expiration). Lève une erreur si le jeton est invalide ou expiré.
 */
export function verifyToken(token: string, secret: string): TokenPayload {
  const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
  const role = decoded['role'] as Role | undefined;
  if (!decoded.sub || !role) {
    throw new Error('Jeton invalide');
  }
  return {
    sub: Number(decoded.sub),
    email: String(decoded['email'] ?? ''),
    role,
  };
}

/** Extrait le jeton d'un en-tête Authorization: Bearer <jwt>. */
export function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}
