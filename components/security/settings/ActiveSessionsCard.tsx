'use client';

import React from 'react';
import { Laptop, RefreshCw, LogOut, Smartphone, Monitor, Trash2, Globe, Clock, ShieldCheck } from 'lucide-react';

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
    <div className="bg-white/50 backdrop-blur-2xl backdrop-saturate-180 border border-white/80 rounded-3xl p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20 shadow-xs">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900">Active Devices & Login Sessions</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold">
                {sessions.length} {sessions.length === 1 ? 'Device' : 'Devices'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Cryptographically signed tokens and active browser/device connections to your account
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loadingSessions}
            className="p-2 rounded-xl bg-white/70 hover:bg-white text-slate-600 transition-all border border-slate-200/80 shadow-xs cursor-pointer disabled:opacity-50 active:scale-95"
            title="Refresh active sessions"
          >
            <RefreshCw className={`w-4 h-4 ${loadingSessions ? 'animate-spin text-brand' : ''}`} />
          </button>
          <button
            onClick={onLogoutAllOther}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200/80 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout All Other Devices</span>
          </button>
        </div>
      </div>

      {loadingSessions ? (
        <div className="py-12 text-center text-xs text-slate-400 font-bold flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-brand" />
          <span>Auditing active device sessions...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400 font-semibold bg-slate-50/50 rounded-2xl border border-slate-100">
          No other active device sessions found.
        </div>
      ) : (
        <div className="divide-y divide-slate-100/80">
          {sessions.map((s) => {
            const isMobile = s.device_name?.includes('iPhone') || s.device_name?.includes('Android') || s.device_name?.includes('Mobile');

            return (
              <div key={s.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-white/40 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs ${
                    isMobile
                      ? 'bg-amber-500/10 border-amber-200/60 text-amber-600'
                      : 'bg-blue-500/10 border-blue-200/60 text-blue-600'
                  }`}>
                    {isMobile ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <Monitor className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-slate-900">{s.device_name || 'Web Browser Session'}</p>
                      {s.is_current && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-extrabold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Current Device
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        <Globe className="w-3 h-3 text-slate-400" /> {s.ip_address || '127.0.0.1'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {s.last_used_at ? new Date(s.last_used_at).toLocaleString() : 'Active now'}
                      </span>
                    </div>
                  </div>
                </div>

                {!s.is_current ? (
                  <button
                    onClick={() => onRevokeSession(s.id)}
                    className="p-2 rounded-xl bg-white/60 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/60 hover:border-rose-200 transition-all cursor-pointer shadow-xs active:scale-95"
                    title="Terminate this session immediately"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};