export type UserRole = 'admin' | 'family' | 'friend';

export interface InviteCode {
  id: string;
  code: string;
  role: UserRole;
  expires_at: string;
  used_by?: string;
  created_by: string;
  created_at: string;
}

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
}

export interface SignupFormData {
  email: string;
  password: string;
  displayName: string;
  inviteCode: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}