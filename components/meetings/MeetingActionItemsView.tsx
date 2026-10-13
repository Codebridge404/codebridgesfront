'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Clock,
  Calendar,
  DoorOpen,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle,
  ListTodo,
  UserCheck,
} from 'lucide-react';
import {
  getMyActionItemsApi,
  updateActionItemStatusApi,
  getMeetingsApi,
  rsvpMeetingApi,
  ActionItem,
  MeetingItem,
} from '@/lib/api/meetings';
import { cardStyles } from '@/lib/theme';
import { useToast } from '@/components/common';

export function MeetingActionItemsView() {
  const toast = useToast();
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [actionsRes, meetingsRes] = await Promise.allSettled([
        getMyActionItemsApi(),
        getMeetingsApi(),
      ]);

      if (actionsRes.status === 'fulfilled' && actionsRes.value?.data) {
        setActionItems(actionsRes.value.data);
      }
      if (meetingsRes.status === 'fulfilled') {
        const d = meetingsRes.value?.data ?? meetingsRes.value;
        setMeetings(Array.isArray(d) ? d : []);
      }
    } catch {
      toast.error('Failed to load action items and RSVP inbox.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (item: ActionItem) => {
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';
    setUpdatingId(item.id);
    try {
      const res = await updateActionItemStatusApi(item.id, newStatus);
      if (res?.status === 'success') {
        setActionItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
        );
        toast.success(`Task marked as ${newStatus}.`);
      }
    } catch {
      toast.error('Failed to update task status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRsvp = async (meetingId: number, status: 'accepted' | 'declined') => {
    try {
      await rsvpMeetingApi(meetingId, status);
      toast.success(`RSVP updated: ${status}.`);
      loadData();
    } catch {
      toast.error('Failed to update RSVP.');
    }
  };

  const filteredItems = actionItems.filter((i) => {
    if (filter === 'pending') return i.status !== 'completed';
    if (filter === 'completed') return i.status === 'completed';
    return true;
  });

  const pendingCount = actionItems.filter((i) => i.status !== 'completed').length;
  const completedCount = actionItems.filter((i) => i.status === 'completed').length;

  return (
    <div className="space-y-6 w-full pb-10 font-sans">
      {/* Header Banner */}
      <div className={`${cardStyles.base} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Accountability Matrix
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Task &amp; RSVP Deliverables</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Action Items &amp; RSVP Inbox
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Track meeting follow-up tasks, toggle completion states, and respond to session invitations.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 transition-colors shadow-2xs cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid: Left Tasks, Right RSVP Invitations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Action Items Checklist (8 cols) */}
        <div className={`lg:col-span-8 ${cardStyles.base} p-5 space-y-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-extrabold text-slate-900">Assigned Action Items</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {pendingCount} Pending
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({actionItems.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('pending')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'pending'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('completed')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'completed'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400 font-semibold">
              Loading action items...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">All tasks completed!</p>
              <p className="text-[11px] text-slate-400">
                No outstanding action items assigned to you.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredItems.map((item) => {
                const isCompleted = item.status === 'completed';
                const isOverdue =
                  item.due_date &&
                  new Date(item.due_date).getTime() < new Date().getTime() &&
                  !isCompleted;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                      isCompleted
                        ? 'bg-slate-50/60 border-slate-200/60 opacity-60'
                        : 'bg-white border-slate-200/90 hover:border-indigo-300 shadow-2xs'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      disabled={updatingId === item.id}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                    >
                      {isCompleted ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 space-y-1">
                      <p
                        className={`text-xs font-bold text-slate-900 ${
                          isCompleted ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                        {item.meeting_title && (
                          <span className="flex items-center gap-1 font-semibold text-slate-600">
                            <Calendar className="w-3 h-3 text-indigo-500" />
                            From: {item.meeting_title}
                          </span>
                        )}
                        {item.due_date && (
                          <span
                            className={`flex items-center gap-1 font-semibold ${
                              isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            Due: {new Date(item.due_date).toLocaleDateString()}
                            {isOverdue && ' (Overdue)'}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RSVP Inbox (4 cols) */}
        <div className={`lg:col-span-4 ${cardStyles.base} p-5 space-y-4`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              RSVP Invitations
            </h2>
            <span className="text-[11px] text-slate-400 font-semibold">1-Click Responses</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {meetings.slice(0, 5).map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-slate-900 truncate">{m.title}</p>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(m.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">
                  {new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {m.room_name}
                </p>

                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleRsvp(m.id, 'declined')}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-[10px] transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRsvp(m.id, 'accepted')}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-2xs transition-colors cursor-pointer"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
