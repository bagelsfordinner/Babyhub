import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, updateUserRole } from '@/lib/admin';
import type { UserRole } from '@/types';

export async function GET() {
  try {
    // TODO: Verify the user is authenticated and has admin role
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, role } = await request.json();
    
    if (!userId || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
    }
    
    // TODO: Verify the user is authenticated and has admin role
    await updateUserRole(userId, role as UserRole);
    
    // Return updated user list
    const users = await getAllUsers();
    const updatedUser = users.find(user => user.id === userId);
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user role:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}