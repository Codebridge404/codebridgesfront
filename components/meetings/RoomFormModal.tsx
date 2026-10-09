'use client';

import React, { useState, useEffect } from 'react';
import { X, DoorOpen } from 'lucide-react';
import {
  createMeetingRoomApi,
  updateMeetingRoomApi,
  MeetingRoomItem,
} from '@/lib/api';
import { useToast } from '@/components/common';

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialRoom?: MeetingRoomItem | null;
}

export function RoomFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialRoom,
}: RoomFormModalProps) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    floor: 'Floor 1',
    capacity: 8,
    amenities: 'Projector, Whiteboard, Video Conference Camera',
  });

  useEffect(() => {
    if (initialRoom) {
      setFormData({
        name: initialRoom.name,
        code: initialRoom.code || '',
        floor: initialRoom.floor || 'Floor 1',
        capacity: initialRoom.capacity || 8,
        amenities: initialRoom.amenities || '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        floor: 'Floor 1',
        capacity: 8,
        amenities: 'Projector, Whiteboard, Video Conference Camera',
      });
    }
  }, [initialRoom, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (initialRoom) {
        await updateMeetingRoomApi(initialRoom.id, formData);
        toast.success(`Room "${formData.name}" updated!`);
      } else {
        await createMeetingRoomApi(formData);
        toast.success(`Room "${formData.name}" created!`);
      }
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to save room details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 select-none">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-indigo-600" />
            <span>{initialRoom ? 'Edit Conference Facility' : 'Add Conference Facility'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs font-semibold">
          <div>
            <label className="block text-slate-700 mb-1">Room Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Executive Boardroom Alpha"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-slate-700 mb-1">Floor Level</label>
              <input
                type="text"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                placeholder="e.g. Floor 2"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">Capacity (Pax) *</label>
              <input
                type="number"
                min={1}
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Amenities &amp; AV Equipment</label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              placeholder="e.g. 4K Display, Dual Microphones, Whiteboard"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
            >
              {submitting ? 'Saving...' : initialRoom ? 'Update Room' : 'Add Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
