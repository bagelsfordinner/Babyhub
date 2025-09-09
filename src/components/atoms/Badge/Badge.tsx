import { type HTMLAttributes, type ReactNode } from 'react';
import styles from './Badge.module.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'admin' | 'family' | 'friend';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Badge({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const badgeClass = [
    styles.badge,
    styles[variant],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={badgeClass} {...props}>
      {children}
    </span>
  );
}