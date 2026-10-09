'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Send, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { SupportTicket } from './types';

interface TicketReplyModalProps {
  ticket: SupportTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticketId: string, status: 'open' | 'in_progress' | 'resolved', responseNote: string) => Promise<void>;
}

export function TicketReplyModal({ ticket, isOpen, onClose, onSave }: TicketReplyModalProps) {
  const [status, setStatus] = useState<'open' | 'in_progress' | 'resolved'>('in_progress');
  const [responseNote, setResponseNote] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setResponseNote(ticket.response_note || '');
    }
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onSave(ticket.id, status, responseNote);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand to-brand-hover p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">Support Desk Action &amp; Reply</h3>
                <p className="text-xs text-purple-100">{ticket.id} • {ticket.tenant_name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-purple-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Subject & Details */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <p className="text-xs font-black text-slate-900">{ticket.subject}</p>
              {ticket.description && (
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{ticket.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-slate-500 font-bold">
                <span className="px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                  Requester: {ticket.requester_name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-brand-subtle text-brand border border-brand/20">
                  Category: {ticket.category}
                </span>
              </div>
            </div>

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Ticket Resolution Status</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('open')}
                  className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    status === 'open'
                      ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Open</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('in_progress')}
                  className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    status === 'in_progress'
                      ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>In Progress</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('resolved')}
                  className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    status === 'resolved'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolved</span>
                </button>
              </div>
            </div>

            {/* Reply Note */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Staff Internal Note / Merchant Resolution Message
              </label>
              <textarea
                rows={4}
                required
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                placeholder="Enter actions taken or communication to resolve this merchant inquiry..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Save Resolution</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
