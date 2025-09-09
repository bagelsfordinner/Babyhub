import { type HTMLAttributes } from 'react';
import Image from 'next/image';
import type { UserRole } from '@/types';
import styles from './Avatar.module.css';

export interface AvatarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  src?: string;
  alt?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  role?: UserRole;
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  role,
  className = '',
  ...props
}: AvatarProps) {
  const avatarClass = [
    styles.avatar,
    styles[size],
    role && styles[role],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Generate initials from name
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={avatarClass} {...props}>
      {src ? (
        <Image
          src={src}
          alt={alt || name}
          width={size === 'xs' ? 24 : size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 56 : 80}
          height={size === 'xs' ? 24 : size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 56 : 80}
          className={styles.image}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}