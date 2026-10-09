'use client';

import React from 'react';
import { Laptop, RefreshCw, LogOut, Smartphone, Monitor, Trash2 } from 'lucide-react';

interface ActiveSessionsCardProps {
  sessions: any[];
  loadingSessions: boolean;
  onRefresh: () => void;
  onLogoutAllOther: () => void;
  onRevokeSession: (id: string | number) => void;
}

export const ActiveSessionsCard: React.FC<ActiveSessionsCardProps> = ({
  sessions,
  loadingSessions,
  onRefresh,
  onLogoutAllOther,
  onRevokeSession,
}) => {
  return (
    <div className="bg-transparent border border-slate-300/80 rounded-3xl p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Active Devices & Login Sessions</h2>
            <p className="text-xs text-slate-500 font-medium">
              Manage and terminate active Sanctum sessions logged into your account.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-200/50 hover:bg-slate-200 text-slate-600 transition-colors border border-slate-300/60 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loadingSessions ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onLogoutAllOther}
            className="px-3.5 py-2 rounded-xl bg-slate-200/50 hover:bg-red-50 hover:text-red-600 border border-slate-300/60 text-slate-700 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout All Other Devices</span>
          </button>
        </div>
      </div>

      {loadingSessions ? (
        <div className="p-8 text-center text-xs text-slate-400 font-bold">
          Loading active sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 font-bold">
          No active sessions found.
        </div>
      ) : (
        <div className="divide-y divide-slate-300/60">
          {sessions.map((s) => (
            <div key={s.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200/50 border border-slate-300/60 flex items-center justify-center text-slate-600">
                  {s.device_name?.includes('iPhone') || s.device_name?.includes('Android') ? (
                    <Smartphone className="w-4 h-4 text-brand" />
                  ) : (
                    <Monitor className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-extrabold text-slate-900">{s.device_name}</p>
                    {s.is_current && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                        Current Device
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    IP: {s.ip_address} • Last Active:{' '}
                    {s.last_used_at ? new Date(s.last_used_at).toLocaleDateString() : 'Just now'}
                  </p>
                </div>
              </div>

              {!s.is_current && (
                <button
                  onClick={() => onRevokeSession(s.id)}
                  className="p-2 rounded-xl bg-slate-200/50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-300/60 transition-colors cursor-pointer"
                  title="Terminate Session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
