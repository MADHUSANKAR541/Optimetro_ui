'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      router.push('/commuter/dashboard');
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="loading-overlay">
        <Loading size="lg" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
