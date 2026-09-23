'use client';

import React, { useState } from 'react';
import {
  LifeBuoy,
  Search,
  MessageSquare,
} from 'lucide-react';
import { SupportTicket, SAMPLE_TICKETS } from './types';

export function SuperAdminSupportView() {
  const [tickets, setTickets] = useState<SupportTicket[]>(SAMPLE_TICKETS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-3 w-full font-sans pb-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand to-brand-hover p-0.5 shadow-md shadow-brand/15 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <LifeBuoy className="w-6 h-6 text-brand" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Merchant Support Desk &amp; Error Stream
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-subtle text-brand text-[10px] font-extrabold border border-brand/20 uppercase">
                Merchant Care
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Respond to customer inquiries, resolve technical issues, and monitor real-time exception logs across all tenants.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets..."
            className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand" />
            <span>Active Merchant Tickets ({filteredTickets.length})</span>
          </h3>

          <div className="flex items-center gap-1.5 text-xs font-bold">
            {['all', 'open', 'in_progress', 'resolved'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 rounded-xl transition-all capitalize cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black">
              <tr>
                <th className="px-4 py-3 text-left">Ticket ID &amp; Subject</th>
                <th className="px-4 py-3 text-left">Tenant Organization</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-extrabold text-slate-900">{t.subject}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{t.id} • {t.createdAt}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-800">{t.tenantName}</p>
                    <p className="text-[10px] text-slate-400">{t.requester}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-600">{t.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        t.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : t.priority === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        t.status === 'open'
                          ? 'bg-blue-100 text-blue-800'
                          : t.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-subtle hover:text-brand font-extrabold text-xs transition-colors cursor-pointer">
                      Reply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
