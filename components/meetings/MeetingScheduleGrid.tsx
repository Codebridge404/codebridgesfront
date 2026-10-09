'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  RefreshCw,
  DoorOpen,
  Users,
} from 'lucide-react';
import {
  getMeetingsApi,
  getMeetingRoomsApi,
  MeetingItem,
  MeetingRoomItem,
} from '@/lib/api/meetings';

const HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

interface MeetingScheduleGridProps {
  onSelectSlot?: (roomId: number, dateStr: string, timeStr: string) => void;
}

export function MeetingScheduleGrid({ onSelectSlot }: MeetingScheduleGridProps) {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [rooms, setRooms] = useState<MeetingRoomItem[]>([]);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, meetingsRes] = await Promise.all([
        getMeetingRoomsApi(),
        getMeetingsApi(selectedDate),
      ]);
      if (roomsRes?.data) setRooms(roomsRes.data);
      if (meetingsRes?.data) setMeetings(meetingsRes.data);
    } catch (e) {
      console.error('Failed to load schedule grid data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Find meeting active during a specific hour in a room
  const getMeetingForSlot = (roomId: number, hourStr: string) => {
    const slotHour = parseInt(hourStr.split(':')[0], 10);
    return meetings.find((m) => {
      if (m.room_id !== roomId || m.status === 'cancelled') return false;
      const startH = new Date(m.start_time).getHours();
      const endH = new Date(m.end_time).getHours();
      return slotHour >= startH && slotHour < (endH || startH + 1);
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <span>Room Timetable & Schedule Matrix</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Visual room availability engine across all conference suites
          </p>
        </div>

        {/* Date Navigator Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={() => changeDate(-1)}
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2 py-1 bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            />
            <button
              onClick={() => changeDate(1)}
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
            title="Refresh Matrix"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="p-3 text-left text-xs font-extrabold text-slate-500 w-24 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Time</span>
                  </div>
                </th>
                {rooms.map((room) => (
                  <th key={room.id} className="p-3 text-left border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-black text-slate-900 truncate max-w-[160px]">{room.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{room.floor || 'Level 1'}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center gap-1 shrink-0">
                        <Users className="w-3 h-3 text-slate-400" />
                        {room.capacity}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  {/* Time label */}
                  <td className="p-3 text-xs font-bold text-slate-500 sticky left-0 bg-white/95 z-10 border-r border-slate-200">
                    {hour}
                  </td>

                  {/* Room Slots */}
                  {rooms.map((room) => {
                    const meeting = getMeetingForSlot(room.id, hour);
                    return (
                      <td key={room.id} className="p-2 border-r border-slate-100 last:border-r-0 align-top">
                        {meeting ? (
                          <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 shadow-2xs">
                            <p className="text-xs font-extrabold truncate" title={meeting.title}>
                              {meeting.title}
                            </p>
                            <p className="text-[10px] text-indigo-600 font-medium truncate mt-0.5">
                              {meeting.organizer_name || 'Organizer'}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-[9px] font-semibold text-indigo-500">
                              <Clock className="w-2.5 h-2.5" />
                              <span>
                                {new Date(meeting.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                                {new Date(meeting.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => onSelectSlot && onSelectSlot(room.id, selectedDate, hour)}
                            className="w-full h-12 rounded-xl border border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-indigo-600 transition-all cursor-pointer group"
                            title={`Book ${room.name} at ${hour}`}
                          >
                            <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-[10px]">Available</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
