'use client';

import React from 'react';
import { Megaphone, Plus, Trash2, Power, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { PlatformAnnouncement } from './types';

interface AnnouncementsTabProps {
  announcements: PlatformAnnouncement[];
  loading: boolean;
  onOpenCreateModal: () => void;
  onToggleActive: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function AnnouncementsTab({
  announcements,
  loading,
  onOpenCreateModal,
  onToggleActive,
  onDelete,
}: AnnouncementsTabProps) {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase flex items-center gap-1 border border-rose-200">
            <AlertOctagon className="w-3 h-3 text-rose-600" />
            <span>Critical</span>
          </span>
        );
      case 'warning':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase flex items-center gap-1 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Warning</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase flex items-center gap-1 border border-blue-200">
            <Info className="w-3 h-3 text-blue-600" />
            <span>Info</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-brand" />
            <span>Active Platform Broadcasts ({announcements.length})</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Broadcast messages shown in banner headers to all logged-in organization tenants.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Broadcast</span>
        </button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-medium text-xs">
          Loading platform announcements...
        </div>
      ) : announcements.length === 0 ? (
        <div className="py-16 text-center bg-slate-50 rounded-2xl border border-slate-200/80 p-8 space-y-2">
          <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="font-extrabold text-xs text-slate-800">No Broadcast Announcements Active</h4>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            You can publish maintenance schedules or critical system notices to all tenants from here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`p-5 rounded-2xl border transition-all ${
                a.is_active
                  ? 'bg-white border-slate-200 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(a.severity)}
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      Audience: {a.target_audience}
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-slate-900 mt-1">{a.title}</h4>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title={a.is_active ? 'Deactivate broadcast' : 'Activate broadcast'}
                    onClick={() => onToggleActive(a.id)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      a.is_active
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Delete announcement"
                    onClick={() => onDelete(a.id)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed">{a.message}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                <span>Published: {new Date(a.created_at).toLocaleString()}</span>
                <span className={a.is_active ? 'text-emerald-600 font-extrabold' : 'text-slate-400'}>
                  {a.is_active ? '● Live' : '○ Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
