import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { analyzeRouteSafety } from '@/lib/gemini/client';
import { db } from '@/lib/db/store';
import type { SafeRouteRequest } from '@/types';

async function handler(req: AuthenticatedRequest) {
  try {
    const body = await req.json() as SafeRouteRequest;
    const { origin, destination, time } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    // Get current time or use provided time
    const timeOfDay = time || new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Analyze routes using Gemini AI
    const analysis = await analyzeRouteSafety(origin, destination, timeOfDay);

    // Create a trip record
    const trip = db.trips.create({
      user_id: req.user!.id,
      origin,
      destination,
      route_data: JSON.stringify(analysis),
      started_at: new Date().toISOString(),
      ended_at: null,
      status: 'active'
    });

    return NextResponse.json({
      tripId: trip.id,
      routes: analysis.routes
    });

  } catch (error) {
    console.error('Safe route error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze route' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
