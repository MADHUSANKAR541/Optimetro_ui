'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';

export default function GuestCommuterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loginAsGuest = async () => {
      try {
        console.log('🎫 Logging in as guest commuter...');
        
        const response = await fetch('/api/guest/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: 'commuter' }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log('✅ Guest commuter login successful');
          // Use window.location for reliable redirect
          window.location.href = '/commuter/dashboard';
        } else {
          console.error('❌ Guest commuter login failed:', data.error);
          setError(data.error || 'Login failed');
        }
      } catch (error) {
        console.error('❌ Guest commuter login error:', error);
        setError('An error occurred during login');
      } finally {
        setLoading(false);
      }
    };

    loginAsGuest();
  }, [router]);

  if (loading) {
    return (
      <div className="loading-overlay">
        <Loading size="lg" />
        <div className="loading-message">
          Logging you in as guest commuter...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h1>Login Error</h1>
        <p>{error}</p>
        <button onClick={() => window.location.href = '/'}>
          Return to Home
        </button>
      </div>
    );
  }

  return null;
}
