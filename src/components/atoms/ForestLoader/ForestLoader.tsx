'use client';

import { Leaf, TreePine } from 'lucide-react';
import styles from './ForestLoader.module.css';

interface ForestLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function ForestLoader({ size = 'md', message }: ForestLoaderProps) {
  return (
    <div className={`${styles.loader} ${styles[size]}`}>
      <div className={styles.iconContainer}>
        <TreePine className={styles.tree} />
        <Leaf className={styles.leaf1} />
        <Leaf className={styles.leaf2} />
        <Leaf className={styles.leaf3} />
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}