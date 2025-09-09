import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import styles from './faq.module.css';

export default async function FAQPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Frequently Asked Questions</h1>
        <p className={styles.subtitle}>Everything you need to know about our little journey</p>
      </div>

      <div className={styles.bentoGrid}>
        <div className={`${styles.bentoCard} ${styles.faqCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>❓</div>
            <h2 className={styles.cardTitle}>Frequently Asked Questions</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>When is the baby due?</h3>
              <p className={styles.faqAnswer}>We&apos;re expecting our little one to arrive on February 12th! Of course, babies have their own timeline, so it could be a few days before or after.</p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>What are you having?</h3>
              <p className={styles.faqAnswer}>We&apos;re keeping it as a surprise! We can&apos;t wait to meet our little one and find out together.</p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Where will you be delivering?</h3>
              <p className={styles.faqAnswer}>We&apos;ll be welcoming our baby at [Hospital Name]. We&apos;ve had wonderful care throughout the pregnancy.</p>
            </div>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How can we help?</h3>
              <p className={styles.faqAnswer}>Your love and support mean everything to us! Check the Help section for specific ways you can contribute during this special time.</p>
            </div>
          </div>
        </div>

        <div className={`${styles.bentoCard} ${styles.visitationCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>🏥</div>
            <h2 className={styles.cardTitle}>Visitation Guidelines</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.guidelineItem}>
              <h3 className={styles.guidelineTitle}>Hospital Visits</h3>
              <p className={styles.guidelineText}>We&apos;ll be welcoming immediate family first, then close friends. We&apos;ll update everyone once we&apos;re ready for visitors!</p>
            </div>
            <div className={styles.guidelineItem}>
              <h3 className={styles.guidelineTitle}>Health & Safety</h3>
              <p className={styles.guidelineText}>Please ensure you're feeling well before visiting. If you have any cold symptoms, let's plan your visit for when you're feeling better.</p>
            </div>
            <div className={styles.guidelineItem}>
              <h3 className={styles.guidelineTitle}>Home Visits</h3>
              <p className={styles.guidelineText}>Once we&apos;re settled at home, we&apos;d love to have you over! We&apos;ll coordinate timing to make sure we&apos;re ready to receive visitors.</p>
            </div>
            <div className={styles.guidelineItem}>
              <h3 className={styles.guidelineTitle}>Photography</h3>
              <p className={styles.guidelineText}>We love capturing memories! Feel free to take photos, and we&apos;d appreciate you sharing them with us too.</p>
            </div>
          </div>
        </div>

        <div className={`${styles.bentoCard} ${styles.goalsCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>🌟</div>
            <h2 className={styles.cardTitle}>Goals & Aspirations</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.goalItem}>
              <h3 className={styles.goalTitle}>Our Parenting Philosophy</h3>
              <p className={styles.goalText}>We want to raise our child with love, curiosity, and kindness. We believe in fostering independence while providing a strong foundation of support.</p>
            </div>
            <div className={styles.goalItem}>
              <h3 className={styles.goalTitle}>Family Traditions</h3>
              <p className={styles.goalText}>We&apos;re excited to create new traditions while honoring the ones from our families. From holiday celebrations to weekend adventures, we can&apos;t wait to build memories.</p>
            </div>
            <div className={styles.goalItem}>
              <h3 className={styles.goalTitle}>Community & Connection</h3>
              <p className={styles.goalText}>We want our child to grow up surrounded by the amazing community of family and friends that we&apos;re so grateful to have. Thank you for being part of our journey!</p>
            </div>
            <div className={styles.goalItem}>
              <h3 className={styles.goalTitle}>Documentation</h3>
              <p className={styles.goalText}>This little logbook is our way of capturing all the precious moments and milestones. We hope it becomes a treasured keepsake for years to come.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}