'use client';

import React, { useState } from 'react';
import { X, Clock, LogIn, LogOut, Loader2, CheckCircle2 } from 'lucide-react';
import { clockInApi, clockOutApi } from '@/lib/api';

interface ClockInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: any;
  activeRecord?: any;
}

export function ClockInOutModal({ isOpen, onClose, onSuccess, user, activeRecord }: ClockInOutModalProps) {
  const isClockedIn = Boolean(activeRecord);
  const [action, setAction] = useState<'clock_in' | 'clock_out'>(isClockedIn ? 'clock_out' : 'clock_in');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (action === 'clock_in') {
        await clockInApi({
          user_id: user?.id,
          outlet_id: user?.outlet_id,
          notes: notes.trim() || 'Frontline Shift Started',
        });
      } else {
        await clockOutApi({
          attendance_id: activeRecord?.id,
          notes: notes.trim() || 'Frontline Shift Completed',
        });
      }
      setNotes('');
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || `Failed to ${action === 'clock_in' ? 'clock in' : 'clock out'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl text-white flex items-center justify-center shadow-xs ${
              action === 'clock_in' ? 'bg-emerald-600' : 'bg-amber-600'
            }`}>
              {action === 'clock_in' ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">
                {action === 'clock_in' ? 'Frontline Shift Clock-In' : 'Shift Clock-Out & Wrap-Up'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {user?.name ? `Staff: ${user.name}` : 'Staff Attendance Tracking'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Action Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
            <button
              type="button"
              onClick={() => setAction('clock_in')}
              className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                action === 'clock_in'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Clock In</span>
            </button>
            <button
              type="button"
              onClick={() => setAction('clock_out')}
              className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                action === 'clock_out'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Clock Out</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Current Timestamp</span>
            <div className="text-xl font-black text-slate-900 font-mono">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Shift Memo / Station Notes</label>
            <input
              type="text"
              placeholder="e.g. Station Terminal #01, Morning Shift"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 py-2.5 rounded-xl text-white text-xs font-black shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                action === 'clock_in'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
              }`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{action === 'clock_in' ? 'Confirm Clock-In' : 'Confirm Clock-Out'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClockInOutModal;
