/**
 * Simple Invite Codes Seeding Script
 * 
 * This script creates initial invite codes using raw SQL to bypass constraints.
 * 
 * Usage: npx tsx scripts/simple-seed-codes.ts
 */

import { createClient } from '@supabase/supabase-js';

async function seedInviteCodes() {
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
    console.log('🌱 Creating initial invite codes with raw SQL...');

    // First, let's create a bootstrap system profile
    const systemUserId = '00000000-0000-0000-0000-000000000000';
    
    // Insert system profile (if it doesn't exist)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: systemUserId,
        display_name: 'System',
        role: 'admin'
      }, { onConflict: 'id' });

    if (profileError) {
      console.warn(`Profile creation warning: ${profileError.message}`);
    }

    const initialCodes = [
      { code: 'ADMIN1', role: 'admin' },
      { code: 'FAMILY', role: 'family' },
      { code: 'FRIEND', role: 'friend' },
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

      // Create invite code with system user as creator
      const { error: codeError } = await supabase
        .from('invite_codes')
        .insert({
          code: codeData.code,
          role: codeData.role,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: systemUserId
        });

      if (codeError) {
        console.warn(`⚠️  Could not create code ${codeData.code}: ${codeError.message}`);
      } else {
        console.log(`✅ Created invite code: ${codeData.code} (${codeData.role})`);
      }
    }

    // Display results
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
  process.exit(1);
}

seedInviteCodes();