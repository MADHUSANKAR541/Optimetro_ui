'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CommuterLayout } from '@/components/layout/CommuterLayout';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/contexts/AuthContext';

export default function CommuterLayoutWrapper({
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
    
    if (user.role !== 'commuter') {
      router.push('/admin/dashboard/induction');
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

  if (!user || user.role !== 'commuter') {
    return null;
  }

  return <CommuterLayout>{children}</CommuterLayout>;
}
