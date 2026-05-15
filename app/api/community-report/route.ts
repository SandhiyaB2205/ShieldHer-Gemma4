import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { db } from '@/lib/db/store';
import { validateReport } from '@/lib/gemini/client';
import type { CommunityReportRequest, IncidentType } from '@/types';

const VALID_INCIDENT_TYPES: IncidentType[] = [
  'harassment',
  'theft',
  'assault',
  'stalking',
  'unsafe_area',
  'poor_lighting',
  'other'
];

async function getHandler() {
  try {
    const reports = db.reports.findAll(50);
    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

async function postHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json() as CommunityReportRequest;
    const { latitude, longitude, incident_type, description, photo } = body;

    // Validate required fields
    if (latitude === undefined || longitude === undefined || !incident_type || !description) {
      return NextResponse.json(
        { error: 'Location, incident type, and description are required' },
        { status: 400 }
      );
    }

    // Validate incident type
    if (!VALID_INCIDENT_TYPES.includes(incident_type)) {
      return NextResponse.json(
        { error: 'Invalid incident type' },
        { status: 400 }
      );
    }

    // Validate description length
    if (description.length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters' },
        { status: 400 }
      );
    }

    // AI validation of the report
    const validation = await validateReport(incident_type, description);

    // Create the report
    const report = db.reports.create({
      user_id: req.user!.id,
      latitude,
      longitude,
      incident_type,
      description,
      photo_url: photo || null,
      ai_validated: validation.isValid && validation.confidence > 0.6
    });

    return NextResponse.json({
      report,
      ai_validated: report.ai_validated,
      validation_confidence: validation.confidence,
      validation_reasoning: validation.reasoning
    }, { status: 201 });

  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
