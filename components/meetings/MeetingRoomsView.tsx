'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DoorOpen,
  PlusCircle,
  Users,
  Clock,
  Layers,
  Sparkles,
  Pencil,
  Trash2,
  Tablet,
} from 'lucide-react';
import {
  getMeetingRoomsApi,
  deleteMeetingRoomApi,
  MeetingRoomItem,
} from '@/lib/api';
import { MeetingBookingModal } from './MeetingBookingModal';
import { RoomFormModal } from './RoomFormModal';
import { cardStyles } from '@/lib/theme';
import { useToast } from '@/components/common';

export function MeetingRoomsView() {
  const toast = useToast();
  const [rooms, setRooms] = useState<MeetingRoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<MeetingRoomItem | null>(null);
  const [selectedRoomIdForBooking, setSelectedRoomIdForBooking] = useState<number | undefined>(undefined);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const res = await getMeetingRoomsApi();
      const list = Array.isArray(res) ? res : res?.data || [];
      setRooms(list);
    } catch {
      toast.error('Failed to load meeting rooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setRoomModalOpen(true);
  };

  const handleOpenEdit = (room: MeetingRoomItem) => {
    setEditingRoom(room);
    setRoomModalOpen(true);
  };

  const handleDeleteRoom = async (id: number, name: string) => {
    if (!confirm(`Delete conference room "${name}"?`)) return;
    try {
      await deleteMeetingRoomApi(id);
      toast.success(`Room "${name}" deleted.`);
      loadRooms();
    } catch {
      toast.error('Failed to delete room.');
    }
  };

  const handleBookRoom = (roomId: number) => {
    setSelectedRoomIdForBooking(roomId);
    setBookingModalOpen(true);
  };

  return (
    <div className="space-y-5 w-full pb-10 font-sans">
      {/* Header */}
      <div className={`${cardStyles.base} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <DoorOpen className="w-6 h-6 text-indigo-600" />
            Conference Room Fleet
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Inspect real-time room availability, capacity limits, and tablet door signage.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Conference Room</span>
        </button>
      </div>

      {/* Room Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs font-semibold">Loading conference rooms...</div>
      ) : rooms.length === 0 ? (
        <div className={`${cardStyles.base} p-12 text-center space-y-3`}>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
            <DoorOpen className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-slate-800">No Conference Rooms Configured</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first conference room to start booking zero-conflict team meetings.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Create Room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`${cardStyles.base} p-5 space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{room.name}</h3>
                    <p className="text-[11px] text-slate-400 font-semibold">
                      {room.code || `ROOM-${room.id}`} • {room.floor || 'Floor 1'}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      room.is_occupied
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {room.is_occupied ? 'Occupied' : 'Free & Ready'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    Capacity: <strong>{room.capacity} pax</strong>
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    {room.floor || 'Main Level'}
                  </span>
                </div>

                {room.amenities && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Sparkles className="w-3 h-3 text-indigo-500 inline mr-1" />
                    {room.amenities}
                  </p>
                )}

                {room.is_occupied && room.active_meeting && (
                  <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 text-xs text-rose-800 space-y-0.5">
                    <p className="font-bold truncate">Current: {room.active_meeting.title}</p>
                    <p className="text-[10px] text-rose-600">Until {new Date(room.active_meeting.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleBookRoom(room.id)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Clock className="w-3.5 h-3.5" /> Book
                </button>
                <Link
                  href={`/meetings/room-display/${room.id}`}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Door Signage Tablet Kiosk"
                >
                  <Tablet className="w-3.5 h-3.5 text-indigo-600" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(room)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Edit Room"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRoom(room.id, room.name)}
                  className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete Room"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Room Modal */}
      <RoomFormModal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        onSuccess={loadRooms}
        initialRoom={editingRoom}
      />

      {/* Book Meeting Modal */}
      <MeetingBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onSuccess={loadRooms}
        initialRoomId={selectedRoomIdForBooking}
      />
    </div>
  );
}
