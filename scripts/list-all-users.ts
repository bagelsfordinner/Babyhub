import { createClient } from '@supabase/supabase-js';

async function listAllUsers() {
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
    console.log('👥 All Users:');
    
    // Get all auth users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    for (const user of users.users) {
      console.log(`\n📧 ${user.email} (ID: ${user.id.slice(0, 8)}...)`);
      
      // Get profile for each user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.log('  ❌ No profile found');
      } else {
        console.log(`  👤 Display Name: ${profile.display_name}`);
        console.log(`  🎭 Role: ${profile.role}`);
        console.log(`  📅 Created: ${new Date(profile.created_at).toLocaleString()}`);
      }

      // Check if they used an invite code
      const { data: usedCode } = await supabase
        .from('invite_codes')
        .select('code, role')
        .eq('used_by', user.id)
        .single();

      if (usedCode) {
        console.log(`  📧 Used Code: ${usedCode.code} (${usedCode.role})`);
      } else {
        console.log(`  📧 No invite code used`);
      }
    }

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

listAllUsers();