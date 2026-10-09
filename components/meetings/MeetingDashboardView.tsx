'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  DoorOpen,
  Users,
  Video,
  Clock,
  CheckCircle2,
  PlusCircle,
  FileText,
  Calendar,
  ExternalLink,
  BookOpen,
  Download,
  Trash2,
} from 'lucide-react';
import {
  getMeetingsApi,
  getMeetingStatsApi,
  checkInMeetingApi,
  deleteMeetingApi,
  getMeetingIcsUrl,
  MeetingItem,
} from '@/lib/api';

import { MeetingBookingModal } from './MeetingBookingModal';
import { MeetingTourModal } from './MeetingTourModal';
import { cardStyles, badgeStyles } from '@/lib/theme';

export function MeetingDashboardView() {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [stats, setStats] = useState({
    today_count: 0,
    upcoming_count: 0,
    completed_count: 0,
    total_rooms: 0,
  });
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [tourModalOpen, setTourModalOpen] = useState(false);



  const loadData = async () => {
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [meetingsRes, statsRes] = await Promise.allSettled([
        getMeetingsApi(todayStr),
        getMeetingStatsApi(),
      ]);

      if (meetingsRes.status === 'fulfilled') {
        const d = meetingsRes.value?.data ?? meetingsRes.value;
        setMeetings(Array.isArray(d) ? d : []);
      }
      if (statsRes.status === 'fulfilled') {
        const d = statsRes.value?.data ?? statsRes.value;
        if (d) setStats(d);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-5 w-full pb-10 font-sans">
      {/* 1. Header Banner & Quick Action */}
      <div className={`${cardStyles.base} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              MMS Corporate Suite
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Zero-Conflict Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Meeting &amp; Space Intelligence
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage conference room reservations, agendas, action items, and live room occupancy.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setTourModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Guidelines &amp; SOPs</span>
          </button>
          <button
            type="button"
            onClick={() => setBookingModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:shadow-indigo-200 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Meeting</span>
          </button>
        </div>
      </div>


      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Meetings</p>
          <p className="text-2xl font-black text-slate-900">{stats.today_count}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Upcoming Schedule</p>
          <p className="text-2xl font-black text-indigo-600">{stats.upcoming_count}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Conference Rooms</p>
          <p className="text-2xl font-black text-emerald-600">{stats.total_rooms}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Sessions</p>
          <p className="text-2xl font-black text-slate-700">{stats.completed_count}</p>
        </div>
      </div>

      {/* 3. Today's Agenda Timeline */}
      <div className={`${cardStyles.base} p-5 space-y-4`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-indigo-600" />
            Today&apos;s Meeting Schedule
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">Loading agenda...</div>
        ) : meetings.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No Meetings Scheduled Today</p>
            <p className="text-xs text-slate-500">All conference rooms are currently open and free for booking.</p>
            <button
              onClick={() => setBookingModalOpen(true)}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Book First Session
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-slate-900">{m.title}</p>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-100/70 text-indigo-700">
                      {m.meeting_type}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      {formatTime(m.start_time)} &mdash; {formatTime(m.end_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                      {m.room_name || 'Room #1'} (Floor: {m.room_floor || 'Main'})
                    </span>
                    {m.attendees_count !== undefined && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {m.attendees_count} Attendees
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {m.meeting_link && (
                    <a
                      href={m.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                    >
                      <Video className="w-3.5 h-3.5 text-indigo-500" /> Join Call
                    </a>
                  )}

                  <a
                    href={getMeetingIcsUrl(m.id)}
                    download
                    className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-2xs"
                    title="Export RFC 5545 iCalendar (.ics)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  {m.status === 'scheduled' && (
                    <button
                      onClick={async () => {
                        await checkInMeetingApi(m.id);
                        loadData();
                      }}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-extrabold transition-colors cursor-pointer"
                      title="Check in to room"
                    >
                      Check In
                    </button>
                  )}

                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase ${
                      m.status === 'scheduled'
                        ? 'bg-emerald-100 text-emerald-800'
                        : m.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {m.status.replace('_', ' ')}
                  </span>

                  {m.status !== 'cancelled' && (
                    <button
                      onClick={async () => {
                        if (confirm(`Cancel meeting "${m.title}"?`)) {
                          await deleteMeetingApi(m.id);
                          loadData();
                        }
                      }}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Cancel Meeting"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            ))}
          </div>
        )}
      </div>

      <MeetingBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onSuccess={loadData}
      />

      <MeetingTourModal
        isOpen={tourModalOpen}
        onClose={() => setTourModalOpen(false)}
      />
    </div>
  );
}

