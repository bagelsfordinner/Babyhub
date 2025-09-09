import { createClient } from '@supabase/supabase-js';

async function fixFamilyUser() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    console.log('🔧 Fixing family user role...');
    
    // Find the family test user
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    const familyUser = users.users.find(user => user.email === 'jack.manning@colorado.edu');
    
    if (!familyUser) {
      console.log('❌ Family test user not found');
      return;
    }

    console.log(`✅ Found family test user: ${familyUser.email}`);

    // Update their role to family
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'family' })
      .eq('id', familyUser.id);

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }

    console.log('✅ Updated family test user role to "family"');

    // Mark the FAMILY invite code as used by this user
    const { error: codeError } = await supabase
      .from('invite_codes')
      .update({ used_by: familyUser.id })
      .eq('code', 'FAMILY');

    if (codeError) {
      console.warn(`⚠️  Could not mark FAMILY code as used: ${codeError.message}`);
    } else {
      console.log('✅ Marked FAMILY invite code as used');
    }

    // Verify the changes
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', familyUser.id)
      .single();

    console.log('📋 Final profile status:');
    console.log(`  Email: ${familyUser.email}`);
    console.log(`  Role: ${profile?.role}`);
    console.log(`  Display Name: ${profile?.display_name}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is required');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

fixFamilyUser();