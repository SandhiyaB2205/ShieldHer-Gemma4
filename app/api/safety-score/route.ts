import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { db } from '@/lib/db/store';
import { analyzeSafetyScore } from '@/lib/gemini/client';

async function handler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Check for cached score
    const cachedScore = db.safetyScores.findByLocation(latitude, longitude);
    
    if (cachedScore) {
      const updatedAt = new Date(cachedScore.updated_at);
      const hoursSince = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSince < 1) {
        return NextResponse.json({
          risk_score: cachedScore.risk_score,
          confidence: cachedScore.confidence,
          ai_reasoning: cachedScore.ai_reasoning,
          cached: true
        });
      }
    }

    // Get nearby reports for analysis
    const nearbyReports = db.reports.findNearby(latitude, longitude, 2);
    const recentReports = nearbyReports.filter(report => {
      const reportDate = new Date(report.created_at);
      const daysSince = (Date.now() - reportDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    });

    // Get current time for analysis
    const timeOfDay = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Analyze with AI
    const analysis = await analyzeSafetyScore(
      latitude,
      longitude,
      recentReports.length,
      timeOfDay
    );

    // Cache the result
    db.safetyScores.upsert({
      latitude,
      longitude,
      risk_score: analysis.risk_score,
      confidence: analysis.confidence,
      ai_reasoning: analysis.ai_reasoning
    });

    return NextResponse.json({
      risk_score: analysis.risk_score,
      confidence: analysis.confidence,
      ai_reasoning: analysis.ai_reasoning,
      nearby_incidents: recentReports.length,
      cached: false
    });

  } catch (error) {
    console.error('Safety score error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate safety score' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
