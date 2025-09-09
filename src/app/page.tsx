import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import styles from './home.module.css';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroImageContainer}>
          <div className={styles.heroImagePlaceholder}>
            <span className={styles.heroImageText}>Hero Photo Coming Soon</span>
          </div>
        </div>
        
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Courtney & Jack&apos;s<br />
            <span className={styles.heroTitleAccent}>Little Logbook</span>
          </h1>
          
          <div className={styles.dueDateContainer}>
            <p className={styles.dueDateText}>Coming</p>
            <p className={styles.dueDate}>February 12th</p>
          </div>
        </div>
      </section>

      {/* Navigation Links Section */}
      <section className={styles.linksSection}>
        <div className={styles.linksGrid}>
          <Link href="/faq" className={styles.linkCard}>
            <div className={styles.linkIcon}>❓</div>
            <h3 className={styles.linkTitle}>FAQ</h3>
            <p className={styles.linkDescription}>
              Frequently asked questions, visitation guidelines, and our goals for this journey
            </p>
          </Link>

          <Link href="/gallery" className={styles.linkCard}>
            <div className={styles.linkIcon}>📸</div>
            <h3 className={styles.linkTitle}>Gallery</h3>
            <p className={styles.linkDescription}>
              Precious moments and milestones captured throughout our pregnancy journey
            </p>
          </Link>

          <Link href="/help" className={styles.linkCard}>
            <div className={styles.linkIcon}>🤝</div>
            <h3 className={styles.linkTitle}>Help</h3>
            <p className={styles.linkDescription}>
              Ways you can support us during this special time and after baby arrives
            </p>
          </Link>

          <Link href="/vault" className={styles.linkCard}>
            <div className={styles.linkIcon}>💝</div>
            <h3 className={styles.linkTitle}>Vault</h3>
            <p className={styles.linkDescription}>
              Memory vault for sharing advice, well wishes, and special messages
            </p>
          </Link>

          {user.profile.role === 'admin' && (
            <Link href="/admin" className={`${styles.linkCard} ${styles.adminCard}`}>
              <div className={styles.linkIcon}>⚙️</div>
              <h3 className={styles.linkTitle}>Admin</h3>
              <p className={styles.linkDescription}>
                Manage users, invite codes, and site settings
              </p>
            </Link>
          )}
        </div>
      </section>

      {/* User Info Section */}
      <section className={styles.userSection}>
        <div className={styles.userInfo}>
          <p className={styles.welcomeText}>
            Welcome back, {user.profile.display_name}! You&apos;re signed in as a{' '}
            <span className={`${styles.userRole} ${styles[user.profile.role]}`}>
              {user.profile.role}
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}
