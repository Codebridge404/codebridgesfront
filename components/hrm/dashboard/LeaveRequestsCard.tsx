'use client';

import React, { useState } from 'react';
import { Calendar, Check, X, CheckCircle2, User } from 'lucide-react';

interface LeaveRequest {
  id: string;
  name: string;
  department: string;
  type: 'Annual Leave' | 'Sick Leave' | 'Emergency Leave';
  dates: string;
  days: number;
}

export function LeaveRequestsCard() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setToastMessage(`Leave request ${action} successfully.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="bg-white p-5 rounded-2xl space-y-3 relative">
      {toastMessage && (
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold shadow-lg flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-extrabold text-sm">Leave Management</h3>
          <p className="text-xs text-text-secondary font-medium">Employee vacation requests, sick notes, and manager approvals</p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700">
          {requests.length} Pending
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="py-8 text-center text-xs font-semibold text-slate-400 space-y-1">
          <p>No pending leave requests requiring review.</p>
          <p className="text-[11px] text-slate-300">All employee vacation &amp; sick leaves are settled.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {requests.map((r) => (
            <div key={r.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900 truncate">{r.name}</span>
                  <span className="px-2 py-0.2 rounded text-[9px] font-extrabold bg-slate-100 text-slate-700">
                    {r.type} ({r.days}d)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">{r.department}</p>
                <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5 text-slate-400" />
                  <span>{r.dates}</span>
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleAction(r.id, 'approved')}
                  className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                  title="Approve Leave"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAction(r.id, 'rejected')}
                  className="p-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                  title="Decline Leave"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
