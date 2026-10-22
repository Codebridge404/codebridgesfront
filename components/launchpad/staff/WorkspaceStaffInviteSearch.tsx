'use client';

import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Link2, Check, Copy, RefreshCw, Sparkles, UserPlus, Store, Shield, KeyRound, User } from 'lucide-react';
import { lookupUsersApi, attachUserApi, inviteStaffApi } from '@/lib/api';
import { useToast } from '@/components/common';

interface WorkspaceStaffInviteSearchProps {
  outlets: any[];
  availableRoles: Array<{ value: string; label: string; description?: string }>;
  onSuccess: (message: string) => void;
  onOpenCreateNew: () => void;
}

export function WorkspaceStaffInviteSearch({
  outlets,
  availableRoles,
  onSuccess,
  onOpenCreateNew,
}: WorkspaceStaffInviteSearchProps) {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [role, setRole] = useState('cashier');
  const [outletId, setOutletId] = useState('');
  const [pinCode, setPinCode] = useState('1234');

  const [submitting, setSubmitting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const isCashier = role === 'cashier';

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await lookupUsersApi(query.trim());
        const list = Array.isArray(res) ? res : res?.data || [];
        setResults(list);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectUser = (u: any) => {
    setSelectedUser(u);
    setInviteUrl(null);
  };

  const handleAttachDirectly = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const res = await attachUserApi({
        user_id: selectedUser.id,
        email: selectedUser.email,
        role,
        outlet_id: outletId || undefined,
        pin_code: isCashier ? (pinCode || '1234') : undefined,
      });
      if (res?.status === 'success') {
        onSuccess(`${selectedUser.name} (${selectedUser.email}) is now added to your workspace!`);
        setSelectedUser(null);
        setQuery('');
      } else {
        toast.error(res?.message || 'Failed to add user to workspace.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error attaching user to workspace.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateInvite = async () => {
    const targetEmail = selectedUser ? selectedUser.email : query.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      toast.error('Please enter a valid email address to invite.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await inviteStaffApi(targetEmail, role, outletId || undefined);
      if (res?.status === 'success' && res?.data?.invite_url) {
        setInviteUrl(`${window.location.origin}${res.data.invite_url}`);
        toast.success('Invitation link generated successfully!');
      } else {
        toast.error(res?.message || 'Failed to generate invitation link.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error generating invitation link.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    toast.success('Invitation link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Search Header Banner */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
          <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Find or Invite Registered Users</h3>
            <p className="text-xs text-slate-500 font-medium">Search existing platform user accounts by email or full name</p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type account email (e.g. member@company.com) or name..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-slate-300/80 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
          />
          {searching && <RefreshCw className="w-4 h-4 text-brand absolute right-4 top-3.5 animate-spin" />}
        </div>
      </div>

      {/* Autocomplete Search Results */}
      {query.trim().length >= 2 && !selectedUser && (
        <div className="space-y-3">
          <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
            Matching User Accounts
          </h4>

          {results.length === 0 && !searching ? (
            <div className="p-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">No account found for &ldquo;{query}&rdquo;</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5">
                  Send an email invitation link or create a brand new credentials profile for this staff member.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2.5 pt-2">
                {query.includes('@') && (
                  <button
                    type="button"
                    onClick={handleGenerateInvite}
                    disabled={submitting}
                    className="px-4 py-2 rounded-2xl border border-slate-300/80 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Invite &ldquo;{query}&rdquo;</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenCreateNew}
                  className="px-4 py-2 rounded-2xl bg-brand hover:bg-brand-hover text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
              {results.map((u) => (
                <div
                  key={u.id}
                  className="p-3.5 rounded-2xl border border-slate-300/80 bg-white hover:border-brand/50 hover:shadow-2xs flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {u.name ? u.name.slice(0, 2).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate">{u.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium truncate">{u.email}</p>
                    </div>
                  </div>

                  {u.is_already_member ? (
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-500 text-[10px] font-bold shrink-0">
                      Already in Team
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectUser(u)}
                      className="px-3 py-1.5 rounded-xl bg-brand text-white hover:bg-brand-hover text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                    >
                      Select
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected User Configuration */}
      {selectedUser && (
        <div className="p-6 rounded-3xl bg-brand-subtle/20 border border-brand/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center font-black text-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900">Configuring Access for: {selectedUser.name}</p>
                <p className="text-[11px] text-slate-500 font-medium">{selectedUser.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Change Account
            </button>
          </div>

          <div className={`grid grid-cols-1 ${isCashier ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assigned Role <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-300/80 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
                >
                  {availableRoles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store Outlet</label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={outletId}
                  onChange={(e) => setOutletId(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-300/80 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
                >
                  <option value="">Global / All Store Outlets</option>
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name || `Outlet #${o.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isCashier && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  <span>POS PIN</span>
                  <span className="text-[10px] text-amber-600 font-normal ml-1">(Cashier Register)</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    maxLength={4}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 1234"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-300/80 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleGenerateInvite}
              disabled={submitting}
              className="px-4 py-2 rounded-2xl border border-slate-300/80 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Generate Invite Link</span>
            </button>
            <button
              type="button"
              onClick={handleAttachDirectly}
              disabled={submitting}
              className="px-5 py-2 rounded-2xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>{submitting ? 'Adding...' : 'Add to Workspace Now'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Generated Invitation Link Notification */}
      {inviteUrl && (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 space-y-2.5">
          <p className="text-xs font-extrabold text-emerald-900 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Invitation Link Ready to Share!</span>
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl || ''}
              className="flex-1 px-3.5 py-2 rounded-2xl bg-white border border-emerald-300 text-xs font-mono text-slate-800 select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
          <p className="text-[11px] text-emerald-700">
            Share this link with your staff member to let them accept the invitation and activate their role immediately.
          </p>
        </div>
      )}
    </div>
  );
}
