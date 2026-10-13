'use client';

import React, { useState } from 'react';
import { X, Wrench, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  reportMeetingIssueApi,
  reportMeetingIssuePublicApi,
} from '@/lib/api/meetings';
import { useToast } from '@/components/common';

interface RoomIssueReportModalProps {
  isOpen: boolean;
  roomId: number;
  roomName?: string;
  isPublicKiosk?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { id: 'audio_visual', label: 'Audio / Visual (Projector, Microphones)' },
  { id: 'air_conditioning', label: 'Air Conditioning / HVAC' },
  { id: 'cleanliness', label: 'Cleanliness & Trash Disposal' },
  { id: 'network', label: 'Network & Wi-Fi Connectivity' },
  { id: 'furniture', label: 'Furniture & Seating Setup' },
];

const PRIORITIES = [
  { id: 'low', label: 'Low', color: 'border-slate-200 text-slate-700' },
  { id: 'medium', label: 'Medium', color: 'border-blue-200 text-blue-700 bg-blue-50/50' },
  { id: 'high', label: 'High', color: 'border-amber-200 text-amber-700 bg-amber-50/50' },
  { id: 'critical', label: 'Critical (Halts Meeting)', color: 'border-rose-200 text-rose-700 bg-rose-50/50' },
];

export function RoomIssueReportModal({
  isOpen,
  roomId,
  roomName,
  isPublicKiosk = false,
  onClose,
  onSuccess,
}: RoomIssueReportModalProps) {
  const toast = useToast();
  const [category, setCategory] = useState('audio_visual');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please describe the problem.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        category,
        priority,
        description: description.trim(),
      };

      const res = isPublicKiosk
        ? await reportMeetingIssuePublicApi(roomId, payload)
        : await reportMeetingIssueApi(roomId, payload);

      if (res?.status === 'success' || res?.data) {
        setSubmitted(true);
        toast.success('Facility defect reported. Maintenance alerted!');
        setTimeout(() => {
          setSubmitted(false);
          setDescription('');
          onSuccess?.();
          onClose();
        }, 1800);
      } else {
        throw new Error(res?.message || 'Report submission failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Report Room Defect</h3>
              <p className="text-xs font-semibold text-slate-500">
                {roomName || `Conference Room #${roomId}`}
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

        {submitted ? (
          <div className="py-8 text-center space-y-2 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-900">Defect Ticket Dispatched</p>
            <p className="text-xs text-slate-500">
              The facility operations crew has been notified to inspect {roomName || 'this room'}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Severity / Priority</label>
              <div className="grid grid-cols-2 gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left ${p.color} ${
                      priority === p.id
                        ? 'ring-2 ring-amber-500 shadow-2xs font-black'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Detailed Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., HDMI cable not sending signal to primary projector, remote AC batteries dead..."
                rows={3}
                required
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Defect Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
