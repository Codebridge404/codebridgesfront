'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  DoorOpen,
  Users,
  Calendar,
  Flame,
} from 'lucide-react';
import {
  getMeetingStatsApi,
  getMeetingsApi,
  getMeetingRoomsApi,
  MeetingItem,
  MeetingRoomItem,
} from '@/lib/api/meetings';

export function MeetingAnalyticsView() {
  const [stats, setStats] = useState<any>({
    today_count: 0,
    upcoming_count: 0,
    completed_count: 0,
    total_rooms: 0,
  });
  const [rooms, setRooms] = useState<MeetingRoomItem[]>([]);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, roomsRes, meetingsRes] = await Promise.all([
          getMeetingStatsApi(),
          getMeetingRoomsApi(),
          getMeetingsApi(),
        ]);
        if (statsRes?.data) setStats(statsRes.data);
        if (roomsRes?.data) setRooms(roomsRes.data);
        if (meetingsRes?.data) setMeetings(meetingsRes.data);
      } catch (e) {
        console.error('Failed to load analytics:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute room utilization frequency
  const roomCounts: Record<number, number> = {};
  meetings.forEach((m) => {
    roomCounts[m.room_id] = (roomCounts[m.room_id] || 0) + 1;
  });

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const TIME_BLOCKS = ['09:00', '11:00', '13:00', '15:00', '17:00'];

  // Simulated heat values based on meeting start hours
  const getHeatLevel = (dayIdx: number, timeStr: string) => {
    const hour = parseInt(timeStr.split(':')[0], 10);
    const matches = meetings.filter((m) => {
      const d = new Date(m.start_time);
      const h = d.getHours();
      return (d.getDay() === dayIdx + 1 || dayIdx === 1) && Math.abs(h - hour) <= 1;
    });
    if (matches.length >= 3) return 'bg-rose-500 text-white';
    if (matches.length === 2) return 'bg-amber-400 text-amber-950';
    if (matches.length === 1) return 'bg-indigo-300 text-indigo-950';
    return 'bg-slate-100 text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Space Intelligence & Utilization Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Room demand patterns, hourly congestion metrics, and booking throughput
          </p>
        </div>
        <div className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Real-time Telemetry</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase text-slate-400">Total Bookings</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{meetings.length}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">Across all workspaces</p>
        </div>
        <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase text-slate-400">Active Rooms</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{rooms.length}</p>
          <p className="text-[10px] text-slate-500 font-bold mt-1">Conference facilities</p>
        </div>
        <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase text-slate-400">Scheduled Today</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.today_count || 0}</p>
          <p className="text-[10px] text-slate-500 font-bold mt-1">Sessions today</p>
        </div>
        <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase text-slate-400">Completed Sessions</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.completed_count || 0}</p>
          <p className="text-[10px] text-slate-500 font-bold mt-1">Archived minutes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Peak Congestion Heatmap */}
        <div className="p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>Weekly Congestion Heatmap (Mon–Fri)</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Peak hour detection</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead>
                <tr>
                  <th className="p-2 text-left text-[11px] font-extrabold text-slate-400">Hour</th>
                  {DAYS.map((day) => (
                    <th key={day} className="p-2 text-[11px] font-extrabold text-slate-600">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_BLOCKS.map((tb) => (
                  <tr key={tb} className="border-t border-slate-100">
                    <td className="p-2 text-left text-xs font-bold text-slate-500">{tb}</td>
                    {DAYS.map((_, dayIdx) => (
                      <td key={dayIdx} className="p-1">
                        <div
                          className={`h-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${getHeatLevel(
                            dayIdx,
                            tb
                          )}`}
                        >
                          ●
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-3 text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Low
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-300" /> Moderate
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Heavy
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Peak
            </span>
          </div>
        </div>

        {/* Room Fleet Utilization Ranking */}
        <div className="p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-indigo-600" />
              <span>Room Utilization Ranking</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Demand distribution</span>
          </div>

          <div className="space-y-3">
            {rooms.map((room) => {
              const count = roomCounts[room.id] || 0;
              const maxCount = Math.max(...Object.values(roomCounts), 1);
              const pct = Math.min(Math.round((count / maxCount) * 100), 100);

              return (
                <div key={room.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">{room.name}</span>
                    <span className="font-bold text-indigo-600">{count} bookings</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
