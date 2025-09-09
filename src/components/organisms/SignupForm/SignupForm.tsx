'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Badge } from '@/components/atoms';
import type { InviteCode } from '@/types';
import styles from './SignupForm.module.css';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  inviteCode?: string;
}

export function SignupForm({ inviteCode }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [inviteData, setInviteData] = useState<InviteCode | null>(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // Verify invite code on component mount
  useEffect(() => {
    if (inviteCode) {
      verifyInviteCode(inviteCode);
    }
  }, [inviteCode]);

  const verifyInviteCode = async (code: string) => {
    setIsVerifyingCode(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .is('used_by', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        setError('Invalid or expired invite code. Please check the code and try again.');
        return;
      }

      setInviteData(data);
    } catch (err) {
      setError('Failed to verify invite code. Please try again.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    if (!inviteData) {
      setError('Please provide a valid invite code.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(signUpError.message);
        }
        return;
      }

      if (!authData.user) {
        setError('Failed to create account. Please try again.');
        return;
      }

      // Update the user's profile with the role from the invite code
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: inviteData.role,
          display_name: data.displayName,
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // Mark invite code as used
      const { error: inviteError } = await supabase
        .from('invite_codes')
        .update({ used_by: authData.user.id })
        .eq('id', inviteData.id);

      if (inviteError) {
        console.error('Invite code update error:', inviteError);
      }

      // Check if email confirmation is required
      if (!authData.session) {
        setSuccess('Account created! Please check your email to confirm your account before signing in.');
      } else {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!inviteData) {
      setError('Please provide a valid invite code first.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?invite_code=${inviteData.code}`,
        },
      });

      if (error) {
        setError('Failed to sign up with Google. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'admin';
      case 'family': return 'family';
      case 'friend': return 'friend';
      default: return 'default';
    }
  };

  if (isVerifyingCode) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <h1 className={styles.logo}>Little Logbook</h1>
            <p className={styles.subtitle}>Verifying your invitation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (inviteCode && !inviteData && !isVerifyingCode) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <h1 className={styles.logo}>Little Logbook</h1>
            <p className={styles.subtitle}>Invalid Invitation</p>
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.footer}>
            <p className={styles.footerText}>
              <Link href="/login" className={styles.footerLink}>
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1 className={styles.logo}>Little Logbook</h1>
          <p className={styles.subtitle}>
            {inviteData ? 'Complete your account setup' : 'Join our family journey'}
          </p>
        </div>

        {inviteData && (
          <div className={styles.inviteCodeDisplay}>
            <div className={styles.inviteCode}>{inviteData.code}</div>
            <p className={styles.inviteCodeLabel}>
              Invite Code • <Badge variant={getRoleColor(inviteData.role)} size="sm">
                {inviteData.role}
              </Badge>
            </p>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.inputGroup}>
            <Input
              id="displayName"
              label="Display Name"
              type="text"
              placeholder="How should we address you?"
              errorText={errors.displayName?.message}
              disabled={isLoading}
              required
              {...register('displayName')}
            />

            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              errorText={errors.email?.message}
              disabled={isLoading}
              required
              {...register('email')}
            />

            <div className={styles.twoColumn}>
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="Create password"
                errorText={errors.password?.message}
                disabled={isLoading}
                required
                {...register('password')}
              />

              <Input
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                errorText={errors.confirmPassword?.message}
                disabled={isLoading}
                required
                {...register('confirmPassword')}
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={!inviteData}
          >
            Create Account
          </Button>
        </form>

        {inviteData && (
          <>
            <div className={styles.divider}>
              <span className={styles.dividerText}>or</span>
            </div>

            <button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className={styles.googleButton}
            >
              <svg className={styles.googleIcon} viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </>
        )}

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link href="/login" className={styles.footerLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}