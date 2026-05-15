import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { db } from '@/lib/db/store';
import type { LiveLocationRequest, SafetyAlert } from '@/types';

// Simple danger zone detection based on recent reports
function checkDangerZone(
  latitude: number, 
  longitude: number
): SafetyAlert | null {
  // Get reports within 500m
  const nearbyReports = db.reports.findNearby(latitude, longitude, 0.5);
  
  // If more than 3 recent reports in the area, it's a danger zone
  const recentReports = nearbyReports.filter(report => {
    const reportDate = new Date(report.created_at);
    const daysSince = (Date.now() - reportDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 30; // Last 30 days
  });

  if (recentReports.length >= 5) {
    return {
      type: 'danger_zone',
      message: `Warning: You are entering an area with ${recentReports.length} recent safety incidents reported. Please stay alert and consider an alternative route.`,
      severity: 'high'
    };
  }

  if (recentReports.length >= 3) {
    return {
      type: 'danger_zone',
      message: `Caution: ${recentReports.length} safety incidents have been reported in this area recently. Stay aware of your surroundings.`,
      severity: 'medium'
    };
  }

  return null;
}

// Check if user is deviating from planned route (simplified)
function checkRouteDeviation(
  _latitude: number,
  _longitude: number,
  _routeData: string | null
): SafetyAlert | null {
  // In a real implementation, this would check against the planned route polyline
  // For now, this is a placeholder
  return null;
}

async function handler(req: AuthenticatedRequest) {
  try {
    const body = await req.json() as LiveLocationRequest;
    const { latitude, longitude } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // Get active trip if any
    const activeTrip = db.trips.findActiveByUserId(req.user!.id);

    // Check for danger zones
    const dangerAlert = checkDangerZone(latitude, longitude);
    
    // Check for route deviation
    const deviationAlert = activeTrip 
      ? checkRouteDeviation(latitude, longitude, activeTrip.route_data)
      : null;

    // Return the most severe alert
    const alert = dangerAlert || deviationAlert;

    return NextResponse.json({
      success: true,
      safetyAlert: alert,
      activeTrip: activeTrip ? {
        id: activeTrip.id,
        destination: activeTrip.destination,
        status: activeTrip.status
      } : null
    });

  } catch (error) {
    console.error('Live location error:', error);
    return NextResponse.json(
      { error: 'Failed to process location' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
