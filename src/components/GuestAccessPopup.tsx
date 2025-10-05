'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './GuestAccessPopup.module.scss';

export function GuestAccessPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show popup after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleAdminDashboard = () => {
    console.log('🔵 Admin button clicked');
    setIsVisible(false);
    // Redirect to guest admin page which will auto-login
    router.push('/guest/admin');
  };

  const handleCommuterDashboard = () => {
    console.log('🟢 Commuter button clicked');
    setIsVisible(false);
    // Redirect to guest commuter page which will auto-login
    router.push('/guest/commuter');
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>
        
        <div className={styles.content}>
          <h2 className={styles.title}>Guest Access</h2>
          
          <div className={styles.welcomeMessage}>
            ✨ Welcome, SIH Evaluator
          </div>
          
          <div className={styles.description}>
            <p>We know your time is valuable, and you have many teams to review.</p>
            <p>A quick guest access has been provided so you can immediately explore Optimetro's features — no sign-up required!</p>
          </div>
          
          <div className={styles.buttonContainer}>
            <div className={styles.buttonGroup}>
              <button 
                className={styles.adminButton} 
                onClick={handleAdminDashboard}
              >
                Admin Dashboard
              </button>
              <p className={styles.buttonDescription}>
                Explore full operations dashboard.
              </p>
            </div>
            
            <div className={styles.buttonGroup}>
              <button 
                className={styles.commuterButton} 
                onClick={handleCommuterDashboard}
              >
                Commuter Dashboard
              </button>
              <p className={styles.buttonDescription}>
                Explore our special add-on features for commuters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
