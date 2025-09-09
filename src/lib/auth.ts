import { createClient } from '@/lib/supabase/server';
import type { AuthUser, Profile } from '@/types';

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Fetch the user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    profile,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireRole(allowedRoles: string[]): Promise<AuthUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.profile.role)) {
    throw new Error('Insufficient permissions');
  }
  return user;
}

export async function verifyInviteCode(code: string) {
  const supabase = await createClient();
  
  const { data: inviteCode, error } = await supabase
    .from('invite_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .is('used_by', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !inviteCode) {
    return null;
  }

  return inviteCode;
}