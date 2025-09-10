import { NextRequest, NextResponse } from 'next/server';
import { getAllInviteCodes, generateInviteCode, deleteInviteCode } from '@/lib/admin';
import type { UserRole } from '@/types';

export async function GET() {
  try {
    // TODO: Verify the user is authenticated and has admin role
    const invites = await getAllInviteCodes();
    return NextResponse.json(invites);
  } catch (error) {
    console.error('Failed to fetch invite codes:', error);
    return NextResponse.json({ error: 'Failed to fetch invite codes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { role, expiresInDays } = await request.json();
    
    if (!role || !expiresInDays) {
      return NextResponse.json({ error: 'Role and expiration days are required' }, { status: 400 });
    }
    
    // TODO: Verify the user is authenticated and has admin role
    const newInvite = await generateInviteCode(role as UserRole, expiresInDays);
    
    return NextResponse.json(newInvite);
  } catch (error) {
    console.error('Failed to generate invite code:', error);
    return NextResponse.json({ error: 'Failed to generate invite code' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get('id');
    
    if (!inviteId) {
      return NextResponse.json({ error: 'Invite ID is required' }, { status: 400 });
    }
    
    // TODO: Verify the user is authenticated and has admin role
    await deleteInviteCode(inviteId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete invite code:', error);
    return NextResponse.json({ error: 'Failed to delete invite code' }, { status: 500 });
  }
}