import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';

async function handler(req: AuthenticatedRequest) {
  return NextResponse.json({ user: req.user });
}

export const GET = withAuth(handler);
