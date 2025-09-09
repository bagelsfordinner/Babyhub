import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const inviteCode = searchParams.get('invite_code') || searchParams.get('state');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // If there's an invite code, we need to update the user's role
      if (inviteCode) {
        try {
          console.log('Processing invite code:', inviteCode, 'for user:', data.user.id);
          
          const { data: inviteData, error: inviteError } = await supabase
            .from('invite_codes')
            .select('*')
            .eq('code', inviteCode.toUpperCase())
            .is('used_by', null)
            .gt('expires_at', new Date().toISOString())
            .single();

          if (inviteError) {
            console.error('Failed to fetch invite code:', inviteError);
          } else if (inviteData) {
            console.log('Found valid invite code:', inviteData.code, 'with role:', inviteData.role);
            
            // Wait a moment for the profile to be created by the trigger
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update user profile with role from invite code
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ 
                role: inviteData.role,
                display_name: data.user.user_metadata?.display_name || data.user.email?.split('@')[0]
              })
              .eq('id', data.user.id);

            if (profileError) {
              console.error('Failed to update profile:', profileError);
            } else {
              console.log('Successfully updated profile with role:', inviteData.role);
              
              // Mark invite code as used
              const { error: markUsedError } = await supabase
                .from('invite_codes')
                .update({ used_by: data.user.id })
                .eq('id', inviteData.id);

              if (markUsedError) {
                console.error('Failed to mark invite code as used:', markUsedError);
              } else {
                console.log('Successfully marked invite code as used');
              }
            }
          } else {
            console.error('No valid invite code found for:', inviteCode);
          }
        } catch (err) {
          console.error('Error processing invite code:', err);
        }
      }
    }

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?message=Authentication failed`);
}