'use client';

import { useState, useEffect } from 'react';
import styles from './help.module.css';

interface RegistryItem {
  id: string;
  name: string;
  icon: string;
  current: number;
  target: number;
  category: string;
}

interface ParentFavorite {
  parent: 'mom' | 'dad';
  category: string;
  item: string;
}

const defaultItems: RegistryItem[] = [
  { id: 'burp-cloths', name: 'Burp Cloths', icon: '🍼', current: 3, target: 12, category: 'feeding' },
  { id: 'onesies', name: 'Onesies (0-3m)', icon: '👶', current: 8, target: 15, category: 'clothing' },
  { id: 'diapers-nb', name: 'Newborn Diapers', icon: '👶', current: 2, target: 6, category: 'essentials' },
  { id: 'swaddles', name: 'Swaddle Blankets', icon: '🤱', current: 2, target: 8, category: 'sleep' },
  { id: 'bottles', name: 'Baby Bottles', icon: '🍼', current: 4, target: 8, category: 'feeding' },
  { id: 'bibs', name: 'Bibs', icon: '🥄', current: 6, target: 12, category: 'feeding' },
];

const parentFavorites: ParentFavorite[] = [
  { parent: 'mom', category: 'Favorite Candy', item: 'Dark Chocolate Sea Salt Caramels' },
  { parent: 'mom', category: 'Guilty Pleasure', item: 'True Crime Podcasts' },
  { parent: 'mom', category: 'Always Love', item: 'Fresh Flowers (especially peonies)' },
  { parent: 'dad', category: 'Favorite Candy', item: 'Sour Patch Kids' },
  { parent: 'dad', category: 'Guilty Pleasure', item: 'Fantasy Football Research' },
  { parent: 'dad', category: 'Always Love', item: 'Good Coffee Beans' },
];

export default function HelpPage() {
  const [items, setItems] = useState<RegistryItem[]>(defaultItems);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Load registry items from API
        const response = await fetch('/api/registry-items');
        if (response.ok) {
          const apiItems = await response.json();
          setItems(apiItems);
        }
        
        // Check if user is admin - this would normally come from your auth system
        // For now, we'll simulate it
        setIsAdmin(true); // Temporarily set to true for demo
      } catch (error) {
        console.error('Failed to load registry items:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializePage();
  }, []);

  const updateItemCount = async (itemId: string, newCount: number) => {
    setUpdatingItem(itemId);
    
    try {
      const response = await fetch('/api/registry-items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, current: newCount }),
      });
      
      if (response.ok) {
        const updatedItem = await response.json();
        setItems(prev => prev.map(item => 
          item.id === itemId ? updatedItem : item
        ));
        
        // Show success feedback briefly
        setTimeout(() => {
          setUpdatingItem(null);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to update item count:', error);
      setUpdatingItem(null);
    }
    
    setEditingItem(null);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'var(--success)';
    if (percentage >= 70) return 'var(--fern)';
    if (percentage >= 40) return 'var(--warning)';
    return 'var(--toadstool)';
  };

  return (
    <div className={styles.helpPage}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1>How You Can Help</h1>
          <p>Thank you for wanting to support our growing family! Here are some ways you can help make our baby's arrival even more special.</p>
        </div>

        <div className={styles.bentoGrid}>
          {/* Registry Section */}
          <div className={`${styles.bentoBox} ${styles.registryBox}`}>
            <div className={styles.boxHeader}>
              <div className={styles.iconWrapper}>
                <span className={styles.icon}>🎁</span>
              </div>
              <h2>Baby Registry</h2>
            </div>
            <p>We've put together a registry with all the essentials we'll need for our little one. From feeding supplies to cozy blankets, everything has been carefully selected.</p>
            <a 
              href="https://registry.example.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`${styles.registryLink} button-jelly`}
            >
              <span>View Our Registry</span>
              <span className={styles.externalIcon}>↗</span>
            </a>
          </div>

          {/* Helping Guidelines */}
          <div className={`${styles.bentoBox} ${styles.guidelinesBox}`}>
            <div className={styles.boxHeader}>
              <div className={styles.iconWrapper}>
                <span className={styles.icon}>💝</span>
              </div>
              <h2>Helping Guidelines</h2>
            </div>
            <div className={styles.guidelinesContent}>
              <p><strong>What helps us most:</strong></p>
              <ul>
                <li>Items from our registry (sized appropriately)</li>
                <li>Practical, everyday essentials</li>
                <li>Gift cards for future needs</li>
                <li>Your presence and support</li>
              </ul>
              
              <p><strong>Thoughtful considerations:</strong></p>
              <ul>
                <li>We prefer neutral colors and natural materials</li>
                <li>Space is limited, so practical over decorative</li>
                <li>Newborn sizes fill up quickly - 3-6m+ is great!</li>
              </ul>
            </div>
          </div>

          {/* Items Progress */}
          <div className={`${styles.bentoBox} ${styles.progressBox}`}>
            <div className={styles.boxHeader}>
              <div className={styles.iconWrapper}>
                <span className={styles.icon}>📊</span>
              </div>
              <h2>What We Still Need</h2>
              {isAdmin && (
                <span className={styles.adminBadge}>Admin</span>
              )}
            </div>
            <div className={styles.itemsGrid}>
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSkeleton}></div>
                  <div className={styles.loadingSkeleton}></div>
                  <div className={styles.loadingSkeleton}></div>
                </div>
              ) : (
                items.map((item) => {
                const percentage = getProgressPercentage(item.current, item.target);
                const progressColor = getProgressColor(percentage);
                
                return (
                  <div key={item.id} className={`${styles.progressItem} ${updatingItem === item.id ? styles.updating : ''}`}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemIcon}>{item.icon}</span>
                      <span className={styles.itemName}>{item.name}</span>
                    </div>
                    
                    <div className={styles.progressInfo}>
                      <div className={styles.counts}>
                        {isAdmin && editingItem === item.id ? (
                          <input
                            type="number"
                            value={item.current}
                            onChange={(e) => updateItemCount(item.id, parseInt(e.target.value) || 0)}
                            onBlur={() => setEditingItem(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingItem(null)}
                            className={styles.countInput}
                            autoFocus
                          />
                        ) : (
                          <span 
                            className={`${styles.currentCount} ${isAdmin ? styles.editable : ''}`}
                            onClick={() => isAdmin && setEditingItem(item.id)}
                          >
                            {item.current}
                          </span>
                        )}
                        <span className={styles.targetCount}>/ {item.target}</span>
                      </div>
                      
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill}
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: progressColor
                          }}
                        />
                      </div>
                      
                      <span className={styles.percentage}>
                        {Math.round(percentage)}%
                      </span>
                    </div>
                  </div>
                );
                })
              )}
            </div>
          </div>

          {/* Parent's Favorites */}
          <div className={`${styles.bentoBox} ${styles.favoritesBox}`}>
            <div className={styles.boxHeader}>
              <div className={styles.iconWrapper}>
                <span className={styles.icon}>❤️</span>
              </div>
              <h2>Parent's Favorites</h2>
            </div>
            <p className={styles.favoritesIntro}>
              For those who want to treat the parents too! These are some of our favorite things.
            </p>
            
            <div className={styles.favoritesGrid}>
              <div className={styles.parentSection}>
                <h3 className={styles.parentName}>
                  <span className={styles.parentIcon}>👩</span>
                  Mom's Favorites
                </h3>
                {parentFavorites
                  .filter(fav => fav.parent === 'mom')
                  .map((favorite, index) => (
                    <div key={index} className={styles.favoriteItem}>
                      <span className={styles.favoriteCategory}>{favorite.category}:</span>
                      <span className={styles.favoriteValue}>{favorite.item}</span>
                    </div>
                  ))}
              </div>
              
              <div className={styles.parentSection}>
                <h3 className={styles.parentName}>
                  <span className={styles.parentIcon}>👨</span>
                  Dad's Favorites
                </h3>
                {parentFavorites
                  .filter(fav => fav.parent === 'dad')
                  .map((favorite, index) => (
                    <div key={index} className={styles.favoriteItem}>
                      <span className={styles.favoriteCategory}>{favorite.category}:</span>
                      <span className={styles.favoriteValue}>{favorite.item}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}