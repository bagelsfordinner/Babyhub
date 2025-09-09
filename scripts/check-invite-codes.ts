import { createClient } from '@supabase/supabase-js';

async function checkInviteCodes() {
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

  console.log('📧 Current Invite Codes:');
  
  const { data: codes, error } = await supabase
    .from('invite_codes')
    .select('code, role, used_by, expires_at, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching codes:', error);
    return;
  }

  if (!codes || codes.length === 0) {
    console.log('No invite codes found');
    return;
  }

  codes.forEach(code => {
    const status = code.used_by ? '❌ USED' : '✅ AVAILABLE';
    const expires = new Date(code.expires_at).toLocaleDateString();
    console.log(`  ${code.code} (${code.role}) - ${status} - expires ${expires}`);
  });
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

checkInviteCodes();