'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, Ban } from 'lucide-react';
import { cancelMeetingApi, MeetingItem } from '@/lib/api/meetings';
import { useToast } from '@/components/common';

interface MeetingCancelModalProps {
  isOpen: boolean;
  meeting: MeetingItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_REASONS = [
  'Organizer scheduling conflict',
  'Required attendees unavailable',
  'Postponed to another date',
  'Objective accomplished early',
  'Facility or technical constraints',
];

export function MeetingCancelModal({
  isOpen,
  meeting,
  onClose,
  onSuccess,
}: MeetingCancelModalProps) {
  const toast = useToast();
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !meeting) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const fullReason = customNote.trim()
        ? `${selectedReason}: ${customNote.trim()}`
        : selectedReason;

      const res = await cancelMeetingApi(meeting.id, fullReason);
      if (res?.status === 'success') {
        toast.success('Meeting cancelled and equipment restocked.');
        onSuccess();
        onClose();
      } else {
        throw new Error(res?.message || 'Cancellation failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel meeting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Cancel Meeting</h3>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">
                {meeting.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice of Equipment Auto-Restock */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Logistics &amp; Inventory Guarantee</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Cancelling this session immediately releases the room and returns all reserved AV &amp; catering equipment back to available inventory. Attendees will be notified.
            </p>
          </div>
        </div>

        {/* Reason Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Reason for Cancellation</label>
          <div className="space-y-1.5">
            {PRESET_REASONS.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedReason === reason
                    ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="cancellation_reason"
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="accent-indigo-600 w-3.5 h-3.5"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Optional Custom Note */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Additional Remarks (Optional)</label>
          <textarea
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Add context for invitees and administrators..."
            rows={2}
            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-hidden transition-all resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Keep Meeting
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
}
