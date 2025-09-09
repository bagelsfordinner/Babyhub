import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types';

export async function generateInviteCode(role: UserRole, expiresInDays: number = 30) {
  const supabase = createClient();
  
  // Generate a random 6-character code
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Keep generating until we get a unique code
  let code = generateCode();
  let isUnique = false;
  
  while (!isUnique) {
    const { data } = await supabase
      .from('invite_codes')
      .select('code')
      .eq('code', code)
      .single();
    
    if (!data) {
      isUnique = true;
    } else {
      code = generateCode();
    }
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const { data, error } = await supabase
    .from('invite_codes')
    .insert({
      code,
      role,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getAllUsers() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      display_name,
      avatar_url,
      role,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getAllInviteCodes() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('invite_codes')
    .select(`
      id,
      code,
      role,
      expires_at,
      used_by,
      created_at,
      profiles!invite_codes_used_by_fkey(display_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteInviteCode(codeId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('invite_codes')
    .delete()
    .eq('id', codeId);

  if (error) {
    throw new Error(error.message);
  }
}