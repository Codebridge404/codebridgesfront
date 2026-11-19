/**
 * Author: Antigravity Team
 * Date: 2026-11-18
 * Task: BD-0171 - Global Notification Center (Meetings, POS Shift Variances & System Announcements)
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Calendar,
  Clock,
  ShieldAlert,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import {
  getMeetingNotificationsApi,
  markMeetingNotificationReadApi,
  markAllMeetingNotificationsReadApi,
  MeetingNotificationItem,
} from '@/lib/api/meetings';
import { getVarianceAlertsApi } from '@/lib/api/shifts';
import { getPlatformAnnouncementsApi } from '@/lib/api/support';
import { Portal } from '@/components/ui/Portal';

interface GlobalNotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type NotificationCategory = 'all' | 'meetings' | 'pos' | 'system';

interface UnifiedNotificationItem {
  uid: string;
  category: 'meetings' | 'pos' | 'system';
  rawId?: number;
  title: string;
  message: string;
  type: string;
  isUnread: boolean;
  createdAt?: string;
}

export function GlobalNotificationsDrawer({
  isOpen,
  onClose,
}: GlobalNotificationsDrawerProps) {
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [items, setItems] = useState<UnifiedNotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [meetingRes, shiftRes, systemRes] = await Promise.all([
        getMeetingNotificationsApi().catch(() => null),
        getVarianceAlertsApi().catch(() => null),
        getPlatformAnnouncementsApi(true).catch(() => null),
      ]);

      const unified: UnifiedNotificationItem[] = [];

      const meetingList: MeetingNotificationItem[] = Array.isArray(meetingRes?.data)
        ? meetingRes.data
        : [];
      for (const m of meetingList) {
        unified.push({
          uid: `meeting-${m.id}`,
          category: 'meetings',
          rawId: m.id,
          title: m.title,
          message: m.message,
          type: m.type || 'info',
          isUnread: m.status === 'unread',
          createdAt: m.created_at,
        });
      }

      const shiftList = Array.isArray(shiftRes?.data)
        ? shiftRes.data
        : Array.isArray(shiftRes?.alerts)
        ? shiftRes.alerts
        : [];
      for (const s of shiftList) {
        const varianceAmt = Number(s.variance ?? s.variance_amount ?? 0);
        unified.push({
          uid: `pos-${s.id}`,
          category: 'pos',
          title: `Shift Variance Alert (#${s.shift_id || s.id})`,
          message:
            s.notes ||
            `Cash drawer variance of $${Math.abs(varianceAmt).toFixed(2)} detected (${s.status || 'pending'}).`,
          type: 'variance',
          isUnread: s.status === 'pending' || s.status === 'flagged',
          createdAt: s.created_at,
        });
      }

      const systemList = Array.isArray(systemRes?.data) ? systemRes.data : [];
      for (const a of systemList) {
        unified.push({
          uid: `system-${a.id}`,
          category: 'system',
          title: a.title || 'System Announcement',
          message: a.message || '',
          type: a.severity || 'announcement',
          isUnread: false,
          createdAt: a.created_at,
        });
      }

      unified.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });

      setItems(unified);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return items;
    return items.filter((item) => item.category === activeCategory);
  }, [items, activeCategory]);

  if (!isOpen) return null;

  const unreadCount = items.filter((n) => n.isUnread).length;
  const hasUnreadMeetings = items.some((n) => n.category === 'meetings' && n.isUnread);

  const handleMarkRead = async (item: UnifiedNotificationItem) => {
    if (item.category !== 'meetings' || !item.rawId) return;
    try {
      await markMeetingNotificationReadApi(item.rawId);
      setItems((prev) =>
        prev.map((n) => (n.uid === item.uid ? { ...n, isUnread: false } : n))
      );
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllMeetingNotificationsReadApi();
      setItems((prev) =>
        prev.map((n) => (n.category === 'meetings' ? { ...n, isUnread: false } : n))
      );
    } catch {}
  };

  const getItemIcon = (item: UnifiedNotificationItem) => {
    if (item.category === 'pos') {
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
    if (item.category === 'system') {
      return <Radio className="w-4 h-4 text-brand" />;
    }
    switch (item.type) {
      case 'needs_approval':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'approved':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'ended_early':
        return <Clock className="w-4 h-4 text-indigo-500" />;
      default:
        return <Calendar className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <Portal><div className="fixed inset-0 z-[9999] flex justify-end cb-modal-backdrop animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl border-l border-slate-200/90 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Notifications</h3>
                <p className="text-[11px] font-semibold text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} unread notices` : 'All caught up'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {hasUnreadMeetings && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-brand hover:bg-brand/10 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark All Read</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'meetings', label: 'Meetings' },
                { id: 'pos', label: 'POS & Shifts' },
                { id: 'system', label: 'System' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                  activeCategory === tab.id
                    ? 'bg-brand text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-semibold">
              Loading notifications...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-xs font-extrabold text-slate-600">No notifications yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Meeting alerts, POS shift variance warnings, and system broadcasts will appear here.
              </p>
            </div>
          ) : (
            filteredItems.map((n) => (
              <div
                key={n.uid}
                className={`p-3.5 rounded-2xl border transition-all text-xs space-y-1.5 relative group ${
                  n.isUnread
                    ? 'bg-brand/5 border-brand/20 shadow-2xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getItemIcon(n)}
                    <span
                      className={`font-extrabold ${
                        n.isUnread ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {n.title}
                    </span>
                  </div>
                  {n.isUnread && n.category === 'meetings' && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n)}
                      className="p-1 rounded-md text-brand hover:bg-brand/10 transition-colors cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  {n.message}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {n.category === 'pos' ? 'POS & Shifts' : n.category}
                  </span>
                  {n.createdAt && (
                    <span className="text-[10px] font-medium text-slate-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div></Portal>
  );
}
