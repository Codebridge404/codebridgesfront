'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  DoorOpen,
  Users,
  AlertTriangle,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  getMeetingsApi,
  approveMeetingApi,
  rejectMeetingApi,
  MeetingItem,
} from '@/lib/api/meetings';
import { cardStyles } from '@/lib/theme';
import { useToast } from '@/components/common';

export function BoardroomApprovalsView() {
  const toast = useToast();
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  // Reject modal
  const [rejectingMeeting, setRejectingMeeting] = useState<MeetingItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Room requested for executive priority session');

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const res = await getMeetingsApi();
      const list = Array.isArray(res) ? res : res?.data || [];
      setMeetings(list);
    } catch {
      toast.error('Failed to load pending approval requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const pendingApprovals = meetings.filter((m) => m.status === 'pending_approval');
  const pastDecisions = meetings.filter((m) => m.approved_at || m.status === 'rejected');

  const handleApprove = async (id: number) => {
    setActionInProgress(id);
    try {
      const res = await approveMeetingApi(id);
      if (res?.status === 'success') {
        toast.success('Meeting approved and room officially reserved.');
        loadApprovals();
      } else {
        throw new Error(res?.message || 'Approval failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve meeting.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingMeeting) return;
    setActionInProgress(rejectingMeeting.id);
    try {
      const res = await rejectMeetingApi(rejectingMeeting.id, rejectionReason);
      if (res?.status === 'success') {
        toast.success('Meeting rejected. Equipment restocked.');
        setRejectingMeeting(null);
        loadApprovals();
      } else {
        throw new Error(res?.message || 'Rejection failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject meeting.');
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-6 w-full pb-10 font-sans">
      {/* Header */}
      <div className={`${cardStyles.base} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
              Executive Governance
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Capacity Threshold Gate</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Boardroom Approvals Queue
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Review and adjudicate reservations for high-capacity conference spaces and executive boardrooms.
          </p>
        </div>

        <button
          type="button"
          onClick={loadApprovals}
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-2xs transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Pending Triage Queue */}
      <div className={`${cardStyles.base} p-5 space-y-4`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Pending Action ({pendingApprovals.length})
          </h2>
          <span className="text-xs text-slate-400 font-semibold">Immediate Review Required</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            Loading approval queue...
          </div>
        ) : pendingApprovals.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No Pending Requests</p>
            <p className="text-xs text-slate-500">
              All high-capacity boardroom bookings have been processed and confirmed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-slate-900 truncate">{m.title}</p>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-200 text-amber-900">
                      Threshold Gate
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-slate-200 text-slate-700">
                      {m.meeting_type}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 font-medium">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      {new Date(m.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      {new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &mdash;{' '}
                      {new Date(m.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                      {m.room_name} ({m.room_capacity} seats)
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Organizer: {m.organizer_name || 'Staff User'}
                    </span>
                  </div>

                  {m.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                      "{m.description}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setRejectingMeeting(m)}
                    disabled={actionInProgress === m.id}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApprove(m.id)}
                    disabled={actionInProgress === m.id}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Log of Past Decisions */}
      <div className={`${cardStyles.base} p-5 space-y-4`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Decision Audit History
          </h2>
          <span className="text-xs text-slate-400 font-semibold">Logged Governance Records</span>
        </div>

        {pastDecisions.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No past approval decisions recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {pastDecisions.slice(0, 10).map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800">{m.title}</span>
                  <span className="text-slate-400 text-[11px] ml-2">
                    in {m.room_name} • {new Date(m.start_time).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  {m.status === 'rejected' ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">
                      Rejected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Approved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Reason Dialog */}
      {rejectingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Reject Boardroom Booking</h3>
                <p className="text-xs text-slate-500">{rejectingMeeting.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setRejectingMeeting(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Rejection Explanation for Organizer</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-hidden resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingMeeting(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionInProgress === rejectingMeeting.id}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
              >
                Confirm Rejection &amp; Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
