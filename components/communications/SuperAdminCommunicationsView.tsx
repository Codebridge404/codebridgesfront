'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Radio, Plus, Loader2, Trash2, Power, AlertCircle } from 'lucide-react';
import {
  getPlatformAnnouncementsApi,
  togglePlatformAnnouncementApi,
  deletePlatformAnnouncementApi,
  PlatformAnnouncement,
} from '@/lib/api/support';
import { useToast } from '@/components/common';
import { CreateBroadcastModal } from './CreateBroadcastModal';

export function SuperAdminCommunicationsView() {
  const toast = useToast();
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPlatformAnnouncementsApi(false);
      setAnnouncements(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handleToggle = async (id: number) => {
    try {
      setTogglingId(id);
      await togglePlatformAnnouncementApi(id);
      toast.success('Broadcast status updated.');
      await loadAnnouncements();
    } catch {
      toast.error('Failed to update broadcast status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await deletePlatformAnnouncementApi(id);
      toast.success('Broadcast deleted.');
      await loadAnnouncements();
    } catch {
      toast.error('Failed to delete broadcast.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-subtle border border-brand/20 shadow-xs flex items-center justify-center">
            <Radio className="w-6 h-6 text-brand" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Global Merchant Broadcasts &amp; Announcements
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-subtle text-brand text-[10px] font-extrabold border border-brand/20 uppercase">
                Dynamic API
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Publish live in-app alerts, scheduled maintenance banners, and changelog updates to all tenant workspaces.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover text-white font-black text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Merchant Broadcast</span>
        </button>
      </div>

      {/* Broadcasts List */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/90 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading broadcasts from database...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/90 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Radio className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-900">No Broadcast Announcements Published</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first global merchant announcement above to broadcast live alerts and maintenance banners across all tenant workspaces.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((b) => (
            <div
              key={b.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      b.severity === 'critical'
                        ? 'bg-rose-100 text-rose-800'
                        : b.severity === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-brand/10 text-brand'
                    }`}
                  >
                    {b.severity}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID #{b.id} • {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Active'}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900">{b.title}</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{b.message}</p>

                <div className="pt-2 flex items-center gap-4 text-[11px] text-slate-400">
                  <span>
                    Status:{' '}
                    <strong className={b.is_active ? 'text-emerald-600 font-bold' : 'text-slate-400 font-bold'}>
                      {b.is_active ? 'Active & Broadcasting' : 'Paused / Inactive'}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggle(b.id)}
                  disabled={togglingId === b.id}
                  title={b.is_active ? 'Pause Announcement' : 'Activate Announcement'}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5 ${
                    b.is_active
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{b.is_active ? 'Active' : 'Paused'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(b.id)}
                  disabled={deletingId === b.id}
                  title="Delete Announcement"
                  className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateBroadcastModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadAnnouncements}
      />
    </div>
  );
}
