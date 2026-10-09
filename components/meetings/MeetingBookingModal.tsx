'use client';

import React, { useState, useEffect } from 'react';
import { X, CalendarClock, DoorOpen, Users, Video, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getMeetingRoomsApi, createMeetingApi, MeetingRoomItem } from '@/lib/api';
import { useToast } from '@/components/common';

interface MeetingBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialRoomId?: number;
  initialDate?: string;
  initialStartTime?: string;
}

export function MeetingBookingModal({
  isOpen,
  onClose,
  onSuccess,
  initialRoomId,
  initialDate,
  initialStartTime,
}: MeetingBookingModalProps) {
  const toast = useToast();
  const [rooms, setRooms] = useState<MeetingRoomItem[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    room_id: initialRoomId ? String(initialRoomId) : '',
    date: initialDate || new Date().toISOString().split('T')[0],
    start_hour: initialStartTime || '09:00',
    end_hour: initialStartTime
      ? `${String(parseInt(initialStartTime.split(':')[0], 10) + 1).padStart(2, '0')}:00`
      : '10:00',
    meeting_type: 'internal',
    meeting_link: '',
    attendee_name: '',
    attendee_email: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadRooms();
      setConflictError(null);
      setFormData((prev) => ({
        ...prev,
        room_id: initialRoomId ? String(initialRoomId) : prev.room_id,
        date: initialDate || prev.date,
        start_hour: initialStartTime || prev.start_hour,
        end_hour: initialStartTime
          ? `${String(parseInt(initialStartTime.split(':')[0], 10) + 1).padStart(2, '0')}:00`
          : prev.end_hour,
      }));
    }
  }, [isOpen, initialRoomId, initialDate, initialStartTime]);


  const loadRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await getMeetingRoomsApi();
      const list = Array.isArray(res) ? res : res?.data || [];
      setRooms(list);
      if (!formData.room_id && list.length > 0) {
        setFormData((prev) => ({ ...prev, room_id: String(list[0].id) }));
      }
    } catch {
      toast.error('Failed to load meeting rooms.');
    } finally {
      setLoadingRooms(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    setSubmitting(true);

    try {
      const startDateTime = `${formData.date} ${formData.start_hour}:00`;
      const endDateTime = `${formData.date} ${formData.end_hour}:00`;

      if (formData.start_hour >= formData.end_hour) {
        throw new Error('End time must be after start time.');
      }

      const attendees = [];
      if (formData.attendee_name || formData.attendee_email) {
        attendees.push({
          name: formData.attendee_name || 'Guest',
          email: formData.attendee_email || undefined,
          role: 'attendee',
        });
      }

      const payload = {
        room_id: Number(formData.room_id),
        title: formData.title,
        description: formData.description || undefined,
        start_time: startDateTime,
        end_time: endDateTime,
        meeting_type: formData.meeting_type as any,
        meeting_link: formData.meeting_link || undefined,
        attendees,
      };

      const res = await createMeetingApi(payload);
      if (res?.status === 'success' || res?.data) {
        toast.success(`Meeting "${formData.title}" booked successfully!`);
        onSuccess?.();
        onClose();
      } else {
        throw new Error(res?.message || 'Conflict detected or booking failed.');
      }
    } catch (err: any) {
      const msg = err.message || 'Room conflict detected during this time.';
      setConflictError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Schedule New Meeting</h3>
              <p className="text-xs text-slate-500">Zero-conflict conference room reservation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {conflictError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{conflictError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-semibold">
          {/* Meeting Title */}
          <div>
            <label className="block text-slate-700 mb-1">Meeting Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Q3 Strategic Planning & Budget Review"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Conference Room Selector */}
          <div>
            <label className="block text-slate-700 mb-1 flex items-center gap-1.5">
              <DoorOpen className="w-3.5 h-3.5 text-indigo-500" /> Target Conference Room *
            </label>
            <select
              value={formData.room_id}
              onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} &mdash; Floor: {r.floor || 'Main'} (Cap: {r.capacity} pax)
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time Range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={formData.start_hour}
                onChange={(e) => setFormData({ ...formData, start_hour: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">End Time *</label>
              <input
                type="time"
                required
                value={formData.end_hour}
                onChange={(e) => setFormData({ ...formData, end_hour: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          {/* Meeting Type & Virtual Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 mb-1">Meeting Category</label>
              <select
                value={formData.meeting_type}
                onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              >
                <option value="internal">Internal Team Meeting</option>
                <option value="client">Client Presentation</option>
                <option value="review">Sprint / Executive Review</option>
                <option value="training">Workshop &amp; Training</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 mb-1 flex items-center gap-1">
                <Video className="w-3.5 h-3.5 text-indigo-500" /> Virtual Video Link
              </label>
              <input
                type="text"
                value={formData.meeting_link}
                onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                placeholder="Google Meet or Zoom URL"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          {/* Additional Attendee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 mb-1">Key Attendee Name</label>
              <input
                type="text"
                value={formData.attendee_name}
                onChange={(e) => setFormData({ ...formData, attendee_name: e.target.value })}
                placeholder="e.g. Sokha Chan"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">Attendee Email</label>
              <input
                type="email"
                value={formData.attendee_email}
                onChange={(e) => setFormData({ ...formData, attendee_email: e.target.value })}
                placeholder="sokha@company.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rooms.length === 0}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold transition-all shadow-xs cursor-pointer"
            >
              {submitting ? 'Confirming...' : 'Book Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
