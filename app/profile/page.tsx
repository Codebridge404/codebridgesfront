'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthUser, logoutApi } from '@/lib/api';
import { AppHeader } from '@/components/header/AppHeader';
import { UserProfileView } from '@/components/profile/UserProfileView';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getAuthUser();
    if (!currentUser) {
      router.push('/login?redirect=/profile');
      return;
    }
    setUser(currentUser);
    setLoading(false);

    const handleUserUpdate = (e: any) => {
      const updated = e?.detail?.user || getAuthUser();
      if (updated) setUser(updated);
    };

    window.addEventListener('cb_user_updated', handleUserUpdate);
    return () => window.removeEventListener('cb_user_updated', handleUserUpdate);
  }, [router]);

  const handleLogout = async () => {
    await logoutApi();
    router.push('/launchpad');
  };

  if (loading || !user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-canvas">
        <Loader2 className="w-6 h-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas font-sans text-slate-800 flex flex-col">
      <AppHeader user={user} handleLogout={handleLogout} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <UserProfileView user={user} />
      </main>
    </div>
  );
}
