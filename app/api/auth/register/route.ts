import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db/store';
import { signToken } from '@/lib/auth/jwt';
import type { RegisterRequest } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as RegisterRequest;
    const { name, email, password, phone } = body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = db.users.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const user = db.users.create({ name, email, password_hash, phone });

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
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
