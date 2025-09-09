import { createClient } from '@supabase/supabase-js';

const JACK_EMAIL = 'jackmanuelmanning@gmail.com';

async function checkUserStatus() {
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
    // 1. Find Jack's user record
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    const jackUser = users.users.find(user => user.email === JACK_EMAIL);
    
    if (!jackUser) {
      console.log(`❌ User with email ${JACK_EMAIL} not found`);
      return;
    }

    console.log(`✅ Found user: ${jackUser.email} (ID: ${jackUser.id})`);

    // 2. Check Jack's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', jackUser.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return;
    }

    console.log('👤 Profile Status:');
    console.log(`  Email: ${jackUser.email}`);
    console.log(`  Display Name: ${profile.display_name}`);
    console.log(`  Role: ${profile.role}`);
    console.log(`  Created: ${new Date(profile.created_at).toLocaleString()}`);

    // 3. Check which invite code was used (if any)
    const { data: usedCode, error: codeError } = await supabase
      .from('invite_codes')
      .select('code, role, used_by, created_at')
      .eq('used_by', jackUser.id)
      .single();

    if (codeError) {
      console.log('📧 No invite code found for this user');
    } else {
      console.log('📧 Used Invite Code:');
      console.log(`  Code: ${usedCode.code}`);
      console.log(`  Intended Role: ${usedCode.role}`);
      console.log(`  Used: ${new Date(usedCode.created_at).toLocaleString()}`);
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

checkUserStatus();