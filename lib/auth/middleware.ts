import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { db } from '@/lib/db/store';
import type { User, JWTPayload } from '@/types';

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
  payload?: JWTPayload;
}

export type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler): AuthenticatedHandler {
  return async (req: AuthenticatedRequest, context) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    const user = db.users.findById(payload.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }
    
    req.user = user;
    req.payload = payload;
    
    return handler(req, context);
  };
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check cookies for SSR scenarios
  const tokenCookie = req.cookies.get('auth-token');
  return tokenCookie?.value || null;
}
