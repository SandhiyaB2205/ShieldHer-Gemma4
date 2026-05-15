import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { db } from '@/lib/db/store';
import type { TriggerSOSRequest } from '@/types';

// Placeholder for notification services (Twilio SMS, Email)
async function sendSMSNotification(phone: string, message: string): Promise<boolean> {
  // In production, implement Twilio integration
  console.log(`[SMS] To: ${phone}, Message: ${message}`);
  return true;
}

async function sendEmailNotification(email: string, subject: string, body: string): Promise<boolean> {
  // In production, implement Nodemailer integration
  console.log(`[Email] To: ${email}, Subject: ${subject}, Body: ${body}`);
  return true;
}

async function handler(req: AuthenticatedRequest) {
  try {
    const body = await req.json() as TriggerSOSRequest;
    const { latitude, longitude, audioUrl, videoUrl } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    const user = db.users.findById(req.user!.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create SOS log
    const sosLog = db.sosLogs.create({
      user_id: req.user!.id,
      latitude,
      longitude,
      audio_url: audioUrl || null,
      video_url: videoUrl || null,
      status: 'active'
    });

    // Get emergency contacts
    const contacts = db.emergencyContacts.findByUserId(req.user!.id);

    // Google Maps link for location
    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    
    // Emergency message
    const smsMessage = `EMERGENCY ALERT from ${user.name}! They need help immediately. Location: ${mapsLink}`;
    const emailSubject = `EMERGENCY: ${user.name} needs help!`;
    const emailBody = `
      ${user.name} has triggered an emergency SOS alert.
      
      Current Location: ${mapsLink}
      Time: ${new Date().toLocaleString()}
      
      Please contact them immediately or alert local authorities.
      
      Phone: ${user.phone}
    `;

    // Send notifications to all contacts
    let notifiedCount = 0;
    for (const contact of contacts) {
      const smsResult = await sendSMSNotification(contact.phone, smsMessage);
      const emailResult = contact.email ? await sendEmailNotification(contact.email, emailSubject, emailBody) : false;
      
      if (smsResult || emailResult) {
        notifiedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      sosId: sosLog.id,
      contactsNotified: notifiedCount,
      message: notifiedCount > 0 
        ? `Emergency contacts have been notified (${notifiedCount} contacts)` 
        : 'SOS logged. Please add emergency contacts to notify them in future emergencies.'
    });

  } catch (error) {
    console.error('SOS trigger error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger SOS' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
