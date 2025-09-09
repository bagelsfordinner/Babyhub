'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Avatar, Badge, Button } from '@/components/atoms';
import type { AuthUser } from '@/types';
import styles from './Header.module.css';

interface HeaderProps {
  user: AuthUser | null;
}

export function Header({ user }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  const navigationItems = [
    { href: '/', label: 'Home' },
    { href: '/faq', label: 'FAQ' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/help', label: 'Help' },
    { href: '/vault', label: 'Vault' },
  ];

  const adminItems = [
    { href: '/admin', label: 'Admin' },
  ];

  const allItems = user?.profile.role === 'admin' 
    ? [...navigationItems, ...adminItems] 
    : navigationItems;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'admin';
      case 'family': return 'family';
      case 'friend': return 'friend';
      default: return 'default';
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>LL</div>
          Little Logbook
        </Link>

        {user && (
          <>
            {/* Desktop Navigation */}
            <nav className={styles.desktopNav}>
              <ul className={styles.navLinks}>
                {allItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className={styles.userMenu} ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={styles.userButton}
                >
                  <div className={styles.userInfo}>
                    <p className={styles.userName}>{user.profile.display_name}</p>
                    <p className={styles.userRole}>{user.profile.role}</p>
                  </div>
                  <Avatar
                    src={user.profile.avatar_url}
                    name={user.profile.display_name}
                    size="sm"
                    role={user.profile.role}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className={styles.dropdown}>
                    <Link href="/profile" className={styles.dropdownItem}>
                      <span>Profile Settings</span>
                    </Link>
                    <div className={styles.dropdownDivider} />
                    <button onClick={handleSignOut} className={styles.dropdownItem}>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile Navigation */}
            <nav className={styles.mobileNav} ref={mobileMenuRef}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`${styles.hamburger} ${isMobileMenuOpen ? styles.open : ''}`}
                aria-label="Toggle menu"
              >
                <span className={styles.hamburgerLine}></span>
                <span className={styles.hamburgerLine}></span>
                <span className={styles.hamburgerLine}></span>
              </button>

              {isMobileMenuOpen && (
                <div className={styles.mobileMenu}>
                  <div className={styles.mobileMenuContent}>
                    <div className={styles.mobileUserInfo}>
                      <Avatar
                        src={user.profile.avatar_url}
                        name={user.profile.display_name}
                        size="md"
                        role={user.profile.role}
                      />
                      <div className={styles.mobileUserDetails}>
                        <p className={styles.mobileUserName}>{user.profile.display_name}</p>
                        <p className={styles.mobileUserRole}>
                          <Badge variant={getRoleColor(user.profile.role)} size="sm">
                            {user.profile.role}
                          </Badge>
                        </p>
                      </div>
                    </div>

                    <ul className={styles.mobileNavLinks}>
                      {allItems.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`${styles.mobileNavLink} ${isActive(item.href) ? styles.active : ''}`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <div className={styles.mobileActions}>
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => router.push('/profile')}
                      >
                        Profile Settings
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </nav>
          </>
        )}

        {!user && (
          <div className={styles.desktopNav}>
            <Link href="/login" className={styles.navLink}>
              Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}