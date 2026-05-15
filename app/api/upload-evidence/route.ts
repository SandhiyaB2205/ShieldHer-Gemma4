import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import type { MediaType } from '@/types';

// In-memory evidence storage for prototype
const evidenceStore = new Map<number, { id: number; sos_id: number; type: MediaType; url: string; uploaded_at: string }>();
let evidenceCounter = 0;

async function handler(req: AuthenticatedRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const sosId = formData.get('sosId') as string | null;
    const type = formData.get('type') as MediaType | null;

    if (!file || !sosId || !type) {
      return NextResponse.json(
        { error: 'File, sosId, and type are required' },
        { status: 400 }
      );
    }

    // For prototype, we'll store file info but not actually save the file
    // In production, this would upload to a cloud storage service
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || (type === 'audio' ? 'webm' : type === 'video' ? 'webm' : 'jpg');
    const filename = `${sosId}_${timestamp}.${extension}`;
    const url = `/uploads/evidence/${filename}`;

    // Create evidence record
    const evidence = {
      id: ++evidenceCounter,
      sos_id: parseInt(sosId),
      type,
      url,
      uploaded_at: new Date().toISOString()
    };
    evidenceStore.set(evidence.id, evidence);

    return NextResponse.json({ 
      url: evidence.url,
      id: evidence.id 
    });

  } catch (error) {
    console.error('Upload evidence error:', error);
    return NextResponse.json(
      { error: 'Failed to upload evidence' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
