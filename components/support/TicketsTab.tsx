'use client';

import React from 'react';
import { MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { SupportTicket, SupportStats } from './types';

interface TicketsTabProps {
  tickets: SupportTicket[];
  stats: SupportStats | null;
  loading: boolean;
  selectedStatus: string;
  onSelectStatus: (st: string) => void;
  onOpenReply: (ticket: SupportTicket) => void;
}

export function TicketsTab({
  tickets,
  stats,
  loading,
  selectedStatus,
  onSelectStatus,
  onOpenReply,
}: TicketsTabProps) {
  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand" />
          <span>Active Merchant Inquiries ({tickets.length})</span>
        </h3>

        <div className="flex items-center gap-1.5 text-xs font-bold overflow-x-auto">
          {[
            { id: 'all', label: 'All', count: stats?.total },
            { id: 'open', label: 'Open', count: stats?.open },
            { id: 'in_progress', label: 'In Progress', count: stats?.in_progress },
            { id: 'resolved', label: 'Resolved', count: stats?.resolved },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelectStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedStatus === st.id
                  ? 'bg-slate-900 text-white shadow-2xs font-extrabold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{st.label}</span>
              {st.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  selectedStatus === st.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {st.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
        <table className="w-full text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-400 uppercase font-black text-[10px] tracking-wider">
            <tr>
              <th className="px-5 py-3.5 text-left">Ticket &amp; Inquiry</th>
              <th className="px-5 py-3.5 text-left">Tenant Organization</th>
              <th className="px-5 py-3.5 text-left">Category</th>
              <th className="px-5 py-3.5 text-left">Priority</th>
              <th className="px-5 py-3.5 text-left">Status</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400 font-bold">
                  Loading support tickets from cloud database...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400 font-bold">
                  No support tickets found matching the selected criteria.
                </td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-extrabold text-slate-900">{t.subject}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {t.id} • {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-800">{t.tenant_name}</p>
                    <p className="text-[10px] text-slate-400">{t.requester_name}</p>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-600">{t.category}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        t.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : t.priority === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 w-fit ${
                        t.status === 'open'
                          ? 'bg-blue-100 text-blue-800'
                          : t.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {t.status === 'open' ? (
                        <AlertCircle className="w-2.5 h-2.5" />
                      ) : (
                        <Clock className="w-2.5 h-2.5" />
                      )}
                      <span>{t.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onOpenReply(t)}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-subtle hover:bg-brand hover:text-white text-brand border border-brand/20 font-extrabold text-xs transition-colors cursor-pointer"
                    >
                      {t.response_note ? 'View / Update' : 'Reply'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
