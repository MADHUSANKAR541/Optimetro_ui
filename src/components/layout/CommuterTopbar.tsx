'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/lib/theme';
import { Button } from '@/components/ui/Button';
import { FiSun, FiMoon, FiBell } from 'react-icons/fi';
import styles from './Topbar.module.scss';

export function CommuterTopbar() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <h1 className={styles.title}>Commuter Dashboard</h1>
      </div>
      
      <div className={styles.right}>
        <Button
          variant="ghost"
          size="sm"
          icon={<FiBell />}
          className={styles.notificationButton}
        />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          icon={theme === 'light' ? <FiMoon /> : <FiSun />}
          className={styles.themeToggle}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => logout()}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
