import jwt from 'jsonwebtoken';
import type { JWTPayload } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'shieldher-development-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}
