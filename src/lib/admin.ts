import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { UserRole } from '@/types';

// Create admin client with service role key for admin operations
async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export async function generateInviteCode(role: UserRole, expiresInDays: number = 30) {
  const supabase = await createAdminClient();
  
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
  const supabase = await createAdminClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getAllUsers() {
  const supabase = await createAdminClient();
  
  // First get all auth users using admin API
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    throw new Error(authError.message);
  }

  // Then get profile data for each user
  const usersWithProfiles = await Promise.all(
    authUsers.users.map(async (user) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          avatar_url,
          role,
          created_at
        `)
        .eq('id', user.id)
        .single();

      // Return user data with profile info, fallback to defaults if no profile
      return {
        id: user.id,
        display_name: profile?.display_name || user.email || 'Unknown User',
        avatar_url: profile?.avatar_url || null,
        role: profile?.role || 'friend',
        created_at: profile?.created_at || user.created_at,
      };
    })
  );

  // Sort by created_at descending
  return usersWithProfiles.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getAllInviteCodes() {
  const supabase = await createAdminClient();
  
  const { data, error } = await supabase
    .from('invite_codes')
    .select(`
      id,
      code,
      role,
      expires_at,
      used_by,
      created_at
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // For each invite code with a used_by ID, get the user's display name
  const enrichedData = await Promise.all(
    data.map(async (invite) => {
      if (invite.used_by) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', invite.used_by)
          .single();
        
        return {
          ...invite,
          profiles: profile ? { display_name: profile.display_name } : null
        };
      }
      
      return {
        ...invite,
        profiles: null
      };
    })
  );

  return enrichedData;
}

export async function deleteInviteCode(codeId: string) {
  const supabase = await createAdminClient();
  
  const { error } = await supabase
    .from('invite_codes')
    .delete()
    .eq('id', codeId);

  if (error) {
    throw new Error(error.message);
  }
}