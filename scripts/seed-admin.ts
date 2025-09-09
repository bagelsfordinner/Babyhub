/**
 * Admin Seeding Script
 * 
 * This script promotes Jack to admin status and creates initial invite codes.
 * Run this after Jack has signed up through the normal authentication flow.
 * 
 * Usage: npx tsx scripts/seed-admin.ts
 */

import { createClient } from '@supabase/supabase-js';

const JACK_EMAIL = 'jackmanuelmanning@gmail.com';

async function seedAdmin() {
  // Initialize Supabase client with service role key (has admin privileges)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // This bypasses RLS
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    console.log('🌱 Starting admin seeding process...');

    // 1. Find Jack's user record
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    const jackUser = users.users.find(user => user.email === JACK_EMAIL);
    
    if (!jackUser) {
      throw new Error(`User with email ${JACK_EMAIL} not found. Please sign up first through the normal flow.`);
    }

    console.log(`✅ Found user: ${jackUser.email}`);

    // 2. Update Jack's profile to admin
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role: 'admin',
        display_name: 'Jack Manning'
      })
      .eq('id', jackUser.id);

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }

    console.log('✅ Updated profile to admin role');

    // 3. Create initial invite codes
    const initialCodes = [
      { code: 'ADMIN1', role: 'admin' as const },
      { code: 'FAMILY', role: 'family' as const },
      { code: 'FRIEND', role: 'friend' as const },
    ];

    for (const codeData of initialCodes) {
      const { error: codeError } = await supabase
        .from('invite_codes')
        .insert({
          code: codeData.code,
          role: codeData.role,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          created_by: jackUser.id,
        });

      if (codeError) {
        console.warn(`⚠️  Could not create code ${codeData.code}: ${codeError.message}`);
      } else {
        console.log(`✅ Created invite code: ${codeData.code} (${codeData.role})`);
      }
    }

    // 4. Verify everything worked
    const { data: profile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', jackUser.id)
      .single();

    if (verifyError) {
      throw new Error(`Failed to verify profile: ${verifyError.message}`);
    }

    console.log('🎉 Seeding completed successfully!');
    console.log('Profile:', {
      email: jackUser.email,
      displayName: profile.display_name,
      role: profile.role,
    });

    // Display created invite codes
    const { data: codes } = await supabase
      .from('invite_codes')
      .select('code, role, expires_at')
      .eq('created_by', jackUser.id)
      .order('created_at', { ascending: false });

    if (codes && codes.length > 0) {
      console.log('\n📧 Invite Codes Created:');
      codes.forEach(code => {
        console.log(`  ${code.code} (${code.role}) - expires ${new Date(code.expires_at).toLocaleDateString()}`);
      });
    }

    console.log('\n🚀 You can now:');
    console.log('1. Sign in as admin at /login');
    console.log('2. Access admin panel at /admin');
    console.log('3. Generate more invite codes');
    console.log('4. Manage user roles');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is required');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  console.error('This should be your Supabase service_role key (not anon key)');
  process.exit(1);
}

seedAdmin();