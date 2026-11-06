'use client';

import React, { useState, useEffect } from 'react';
import { getAuthUser } from '@/lib/api';
import { UserProfileView } from '@/components/profile/UserProfileView';
import { Loader2 } from 'lucide-react';

export default function AdminProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getAuthUser();
    setUser(currentUser);

    const handleUserUpdate = (e: any) => {
      const updated = e?.detail?.user || getAuthUser();
      if (updated) setUser(updated);
    };

    window.addEventListener('cb_user_updated', handleUserUpdate);
    return () => window.removeEventListener('cb_user_updated', handleUserUpdate);
  }, []);

  if (!user) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      <div className="pb-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Profile</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage your platform root administrator credentials, security keys, and active device sessions
        </p>
      </div>
      <UserProfileView user={user} />
    </div>
  );
}