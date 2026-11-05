/**
 * Author: Antigravity Team
 * Date: 2026-11-05
 * Task: BD-0138
 */

'use client';

import React, { useState, useEffect } from 'react';
import { getAuthUser } from '@/lib/api';
import { UserProfileView } from '@/components/profile/UserProfileView';
import { Loader2 } from 'lucide-react';

export default function OrganizationProfilePage() {
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
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <UserProfileView user={user} />
    </div>
  );
}

