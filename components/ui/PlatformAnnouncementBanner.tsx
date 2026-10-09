'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, X, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import { getPlatformAnnouncementsApi, PlatformAnnouncement } from '@/lib/api';

export function PlatformAnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<PlatformAnnouncement | null>(null);
  const [dismissedId, setDismissedId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    async function checkAnnouncements() {
      try {
        const res = await getPlatformAnnouncementsApi(true);
        if (mounted && res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const latest = res.data[0];
          const storedDismiss = sessionStorage.getItem(`cb_announcement_dismissed_${latest.id}`);
          if (!storedDismiss) {
            setAnnouncement(latest);
          }
        }
      } catch {
        // Silent catch for resilience
      }
    }

    checkAnnouncements();
    return () => {
      mounted = false;
    };
  }, []);

  if (!announcement || dismissedId === announcement.id) return null;

  const handleDismiss = () => {
    setDismissedId(announcement.id);
    sessionStorage.setItem(`cb_announcement_dismissed_${announcement.id}`, 'true');
  };

  const getStyle = () => {
    switch (announcement.severity) {
      case 'critical':
        return {
          bg: 'bg-rose-600 text-white',
          icon: <AlertOctagon className="w-4 h-4 text-rose-200 shrink-0" />,
          badge: 'bg-rose-900/60 text-rose-100',
        };
      case 'warning':
        return {
          bg: 'bg-amber-600 text-white',
          icon: <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />,
          badge: 'bg-amber-900/60 text-amber-100',
        };
      default:
        return {
          bg: 'bg-brand text-white',
          icon: <Megaphone className="w-4 h-4 text-purple-200 shrink-0" />,
          badge: 'bg-purple-900/60 text-purple-100',
        };
    }
  };

  const style = getStyle();

  return (
    <div className={`${style.bg} px-4 py-2 text-xs font-bold shadow-md z-40 flex items-center justify-between`}>
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          {style.icon}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${style.badge}`}>
            {announcement.severity}
          </span>
          <span className="font-extrabold">{announcement.title}:</span>
          <span className="font-medium text-white/90">{announcement.message}</span>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
        title="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
