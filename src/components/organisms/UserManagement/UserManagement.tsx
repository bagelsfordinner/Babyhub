'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Avatar, Badge } from '@/components/atoms';
import { getAllUsers, getAllInviteCodes, generateInviteCode, updateUserRole, deleteInviteCode } from '@/lib/admin';
import type { UserRole, Profile, InviteCode } from '@/types';
import styles from './UserManagement.module.css';

const inviteFormSchema = z.object({
  role: z.enum(['admin', 'family', 'friend']),
  expiresInDays: z.number().min(1).max(365),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

interface ExtendedProfile extends Profile {
  // Add any additional fields if needed
}

interface ExtendedInviteCode extends InviteCode {
  profiles?: {
    display_name: string;
  } | null;
}

export function UserManagement() {
  const [users, setUsers] = useState<ExtendedProfile[]>([]);
  const [invites, setInvites] = useState<ExtendedInviteCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      role: 'friend',
      expiresInDays: 30,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const [usersData, invitesData] = await Promise.all([
        getAllUsers(),
        getAllInviteCodes(),
      ]);
      
      setUsers(usersData);
      setInvites(invitesData);
    } catch (err) {
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setSuccess('User role updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update user role');
      setTimeout(() => setError(''), 3000);
    }
  };

  const onSubmitInvite = async (data: InviteFormData) => {
    try {
      setIsGenerating(true);
      setError('');
      
      const newInvite = await generateInviteCode(data.role, data.expiresInDays);
      setInvites([newInvite, ...invites]);
      setSuccess(`Invite code ${newInvite.code} created successfully`);
      reset();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to generate invite code');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      const url = `${window.location.origin}/join/${code}`;
      await navigator.clipboard.writeText(url);
      setSuccess(`Invite link copied to clipboard!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to copy to clipboard');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteInvite = async (inviteId: string, code: string) => {
    if (!confirm(`Are you sure you want to delete invite code ${code}?`)) {
      return;
    }

    try {
      await deleteInviteCode(inviteId);
      setInvites(invites.filter(invite => invite.id !== inviteId));
      setSuccess('Invite code deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete invite code');
      setTimeout(() => setError(''), 3000);
    }
  };

  const isInviteExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'admin';
      case 'family': return 'family';
      case 'friend': return 'friend';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading user management...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>User Management</h1>
        <p className={styles.subtitle}>Manage user roles and create invite codes</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      {/* Users Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Users ({users.length})</h2>
        </div>
        <div className={styles.sectionContent}>
          {users.length === 0 ? (
            <div className={styles.emptyState}>No users found</div>
          ) : (
            <div className={styles.usersGrid}>
              {users.map((user) => (
                <div key={user.id} className={styles.userCard}>
                  <Avatar
                    src={user.avatar_url}
                    name={user.display_name}
                    size="md"
                    role={user.role}
                  />
                  <div className={styles.userInfo}>
                    <h3 className={styles.userName}>{user.display_name}</h3>
                    <p className={styles.userEmail}>
                      Member since {formatDate(user.created_at)}
                    </p>
                  </div>
                  <div className={styles.userActions}>
                    <Badge variant={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className={styles.roleSelect}
                    >
                      <option value="friend">Friend</option>
                      <option value="family">Family</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite Codes Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Invite Codes</h2>
        </div>
        <div className={styles.sectionContent}>
          {/* Generate New Invite Form */}
          <form onSubmit={handleSubmit(onSubmitInvite)} className={styles.inviteForm}>
            <div className={styles.inviteFormGroup}>
              <label htmlFor="role">Role</label>
              <select id="role" className={styles.roleSelect} {...register('role')}>
                <option value="friend">Friend</option>
                <option value="family">Family</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className={styles.inviteFormGroup}>
              <Input
                id="expiresInDays"
                label="Expires in (days)"
                type="number"
                min="1"
                max="365"
                errorText={errors.expiresInDays?.message}
                {...register('expiresInDays', { valueAsNumber: true })}
              />
            </div>
            <div className={styles.inviteFormActions}>
              <Button
                type="submit"
                loading={isGenerating}
                disabled={isGenerating}
              >
                Generate Code
              </Button>
            </div>
          </form>

          {/* Existing Invite Codes */}
          {invites.length === 0 ? (
            <div className={styles.emptyState}>No invite codes created yet</div>
          ) : (
            <div className={styles.invitesGrid}>
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className={`${styles.inviteCard} ${
                    isInviteExpired(invite.expires_at) ? styles.expired : ''
                  } ${invite.used_by ? styles.used : ''}`}
                >
                  <div className={styles.inviteInfo}>
                    <h3 className={styles.inviteCode}>{invite.code}</h3>
                    <div className={styles.inviteDetails}>
                      <Badge variant={getRoleColor(invite.role)} size="sm">
                        {invite.role}
                      </Badge>
                      <span className={styles.inviteDetail}>
                        Expires: {formatDate(invite.expires_at)}
                      </span>
                      {invite.used_by && invite.profiles && (
                        <span className={styles.inviteDetail}>
                          Used by: {invite.profiles.display_name}
                        </span>
                      )}
                      {isInviteExpired(invite.expires_at) && (
                        <span className={styles.inviteDetail}>
                          ⚠️ Expired
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.inviteActions}>
                    {!invite.used_by && !isInviteExpired(invite.expires_at) && (
                      <button
                        onClick={() => handleCopyCode(invite.code)}
                        className={styles.copyButton}
                      >
                        Copy Link
                      </button>
                    )}
                    {!invite.used_by && (
                      <button
                        onClick={() => handleDeleteInvite(invite.id, invite.code)}
                        className={styles.deleteButton}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}