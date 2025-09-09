/**
 * Invite Codes Seeding Script
 * 
 * This script creates initial invite codes without requiring an admin user.
 * Run this to bootstrap the invite system.
 * 
 * Usage: npx tsx scripts/seed-invite-codes.ts
 */

import { createClient } from '@supabase/supabase-js';

async function seedInviteCodes() {
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
    console.log('🌱 Creating initial invite codes...');

    // Create initial invite codes
    const initialCodes = [
      { code: 'ADMIN1', role: 'admin' as const },
      { code: 'FAMILY', role: 'family' as const },
      { code: 'FRIEND', role: 'friend' as const },
    ];

    for (const codeData of initialCodes) {
      // Check if code already exists
      const { data: existing } = await supabase
        .from('invite_codes')
        .select('id')
        .eq('code', codeData.code)
        .single();

      if (existing) {
        console.log(`⚠️  Code ${codeData.code} already exists, skipping`);
        continue;
      }

      // Create a temporary system user UUID for bootstrap codes
      const systemUserId = '00000000-0000-0000-0000-000000000000';
      
      // Insert directly with raw SQL to bypass RLS constraints
      const { error: codeError } = await supabase.rpc('create_invite_code', {
        code_text: codeData.code,
        code_role: codeData.role,
        expires_timestamp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

      if (codeError) {
        console.warn(`⚠️  Could not create code ${codeData.code}: ${codeError.message}`);
      } else {
        console.log(`✅ Created invite code: ${codeData.code} (${codeData.role})`);
      }
    }

    // Display all invite codes
    const { data: codes } = await supabase
      .from('invite_codes')
      .select('code, role, expires_at')
      .order('created_at', { ascending: false });

    if (codes && codes.length > 0) {
      console.log('\n📧 Available Invite Codes:');
      codes.forEach(code => {
        const expiresAt = new Date(code.expires_at);
        const isExpired = expiresAt < new Date();
        console.log(`  ${code.code} (${code.role}) - ${isExpired ? 'EXPIRED' : 'expires ' + expiresAt.toLocaleDateString()}`);
      });
    }

    console.log('\n🚀 You can now use these invite codes:');
    console.log('1. /join?code=ADMIN1 - for admin access');
    console.log('2. /join?code=FAMILY - for family members');
    console.log('3. /join?code=FRIEND - for friends');

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

seedInviteCodes();