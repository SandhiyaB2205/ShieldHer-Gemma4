import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db/store';
import { signToken } from '@/lib/auth/jwt';
import type { LoginRequest } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as LoginRequest;
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = db.users.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = signToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
