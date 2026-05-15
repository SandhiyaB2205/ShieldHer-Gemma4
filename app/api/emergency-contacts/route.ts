import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { db } from '@/lib/db/store';

async function getHandler(req: AuthenticatedRequest) {
  const contacts = db.emergencyContacts.findByUserId(req.user!.id);
  return NextResponse.json({ contacts });
}

async function postHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, relation } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    const contact = db.emergencyContacts.create({
      user_id: req.user!.id,
      name,
      phone,
      email: email || '',
      relation: relation || 'Other'
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error('Create contact error:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}

async function deleteHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    const deleted = db.emergencyContacts.delete(parseInt(id), req.user!.id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete contact error:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
export const DELETE = withAuth(deleteHandler);
