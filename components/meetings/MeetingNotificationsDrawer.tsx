'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Calendar,
  AlertCircle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {
  getMeetingNotificationsApi,
  markMeetingNotificationReadApi,
  markAllMeetingNotificationsReadApi,
  MeetingNotificationItem,
} from '@/lib/api/meetings';

interface MeetingNotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MeetingNotificationsDrawer({
  isOpen,
  onClose,
}: MeetingNotificationsDrawerProps) {
  const [notifications, setNotifications] = useState<MeetingNotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await getMeetingNotificationsApi();
      if (res?.data) {
        setNotifications(res.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  const handleMarkRead = async (id: number) => {
    try {
      await markMeetingNotificationReadApi(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n))
      );
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllMeetingNotificationsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
    } catch {}
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl border-l border-slate-200/90 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Meeting Alerts</h3>
              <p className="text-[11px] font-semibold text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread notices` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1 cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-semibold">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">No meeting notifications</p>
              <p className="text-[11px] text-slate-400">You will receive alerts here for booking changes and approvals.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => n.status === 'unread' && handleMarkRead(n.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  n.status === 'unread'
                    ? 'bg-indigo-50/40 border-indigo-200/80 shadow-2xs'
                    : 'bg-white border-slate-200/70 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">{getTypeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black text-slate-900 truncate">{n.title}</p>
                      {n.status === 'unread' && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1.5">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                      {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
          <p className="text-[10px] font-bold text-slate-400">
            Real-time In-App Notification Hub
          </p>
        </div>
      </div>
    </div>
  );
}
