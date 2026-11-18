/**
 * Author: Antigravity Team
 * Date: 2026-11-17
 * Task: BD-0165 - Pending Staff Invitations Management UI
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Send, Trash2, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import {
  getInvitationsApi,
  resendInvitationApi,
  revokeInvitationApi,
} from '@/lib/api/auth';
import { useToast } from '@/components/common';

interface InvitationItem {
  id: number;
  email: string;
  role?: string;
  role_record?: { name?: string; slug?: string } | null;
  outlet?: { name?: string } | null;
  invited_by?: { name?: string } | null;
  expires_at?: string | null;
  accepted_at?: string | null;
  created_at?: string | null;
}

export function PendingInvitationsCard() {
  const toast = useToast();
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const res = await getInvitationsApi({ status: 'pending' });
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setInvitations(list);
    } catch (err: any) {
      console.warn('Could not load invitations:', err);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleResend = async (inv: InvitationItem) => {
    try {
      setBusyId(inv.id);
      await resendInvitationApi(inv.id);
      toast.success(`Invitation email resent to ${inv.email}.`);
      await loadInvitations();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resend invitation.');
    } finally {
      setBusyId(null);
    }
  };

  const handleRevoke = async (inv: InvitationItem) => {
    try {
      setBusyId(inv.id);
      await revokeInvitationApi(inv.id);
      toast.success(`Invitation for ${inv.email} revoked.`);
      setInvitations((prev) => prev.filter((item) => item.id !== inv.id));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to revoke invitation.');
    } finally {
      setBusyId(null);
    }
  };

  if (!loading && invitations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Pending Staff Invitations ({invitations.length})
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Track unaccepted workspace invites, resend onboarding links, or revoke expired tokens.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadInvitations}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          title="Refresh invitations"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {invitations.map((inv) => {
          const isExpired = inv.expires_at ? new Date(inv.expires_at) < new Date() : false;
          const roleLabel = inv.role_record?.name || inv.role || 'Staff';
          return (
            <div key={inv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 truncate">{inv.email}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {roleLabel}
                  </span>
                  {inv.accepted_at ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Accepted
                    </span>
                  ) : isExpired ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <XCircle className="w-3 h-3" /> Expired
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  {inv.outlet?.name ? `Outlet: ${inv.outlet.name} · ` : ''}
                  {inv.expires_at ? `Expires ${new Date(inv.expires_at).toLocaleDateString()}` : ''}
                </p>
              </div>

              {!inv.accepted_at && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={busyId === inv.id}
                    onClick={() => handleResend(inv)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>Resend</span>
                  </button>
                  <button
                    type="button"
                    disabled={busyId === inv.id}
                    onClick={() => handleRevoke(inv)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Revoke</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
