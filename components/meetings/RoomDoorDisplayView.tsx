'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DoorOpen,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowLeft,
  Wrench,
} from 'lucide-react';
import {
  getMeetingRoomsApi,
  getMeetingsApi,
  checkInMeetingApi,
  MeetingRoomItem,
  MeetingItem,
} from '@/lib/api/meetings';
import { RoomIssueReportModal } from './RoomIssueReportModal';

interface RoomDoorDisplayViewProps {
  roomId: number;
}

export function RoomDoorDisplayView({ roomId }: RoomDoorDisplayViewProps) {
  const [room, setRoom] = useState<MeetingRoomItem | null>(null);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadRoomData = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [roomsRes, meetingsRes] = await Promise.all([
        getMeetingRoomsApi(),
        getMeetingsApi(todayStr, roomId),
      ]);

      if (roomsRes?.data) {
        const found = roomsRes.data.find((r: MeetingRoomItem) => r.id === roomId);
        if (found) setRoom(found);
      }
      if (meetingsRes?.data) {
        setMeetings(meetingsRes.data);
      }
    } catch (e) {
      console.error('Failed to load door signage data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoomData();
    const interval = setInterval(loadRoomData, 15000);
    return () => clearInterval(interval);
  }, [roomId]);

  const nowMs = currentTime.getTime();
  const activeMeeting = meetings.find((m) => {
    if (m.status === 'cancelled') return false;
    const startMs = new Date(m.start_time).getTime();
    const endMs = new Date(m.end_time).getTime();
    return nowMs >= startMs && nowMs <= endMs;
  });

  const nextMeeting = meetings.find((m) => {
    if (m.status === 'cancelled') return false;
    const startMs = new Date(m.start_time).getTime();
    return startMs > nowMs;
  });

  const isOccupied = !!activeMeeting;

  let remainingText = '';
  if (activeMeeting) {
    const diffMs = Math.max(0, new Date(activeMeeting.end_time).getTime() - nowMs);
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    remainingText = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  }

  const handleCheckIn = async () => {
    if (!activeMeeting) return;
    setCheckingIn(true);
    try {
      await checkInMeetingApi(activeMeeting.id);
      setCheckInSuccess(true);
      setTimeout(() => setCheckInSuccess(false), 3000);
      loadRoomData();
    } catch (e) {
      console.error('Check-in error:', e);
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div
      className={`min-h-screen text-slate-800 p-6 sm:p-10 flex flex-col justify-between transition-colors duration-700 select-none ${
        isOccupied
          ? 'bg-gradient-to-br from-rose-50/70 via-white to-slate-50'
          : 'bg-gradient-to-br from-emerald-50/70 via-white to-slate-50'
      }`}
    >
      {/* Top Bar: Room Title, Live Clock & Back Link */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/meetings/rooms"
            className="p-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors"
            title="Exit Kiosk Mode"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <DoorOpen className="w-8 h-8 text-indigo-600" />
              <span>{room?.name || `Conference Room #${roomId}`}</span>
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              {room?.floor || 'Main Facility'} • Capacity: {room?.capacity || 8} People
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-3xl sm:text-4xl font-mono font-black tracking-wider text-slate-900">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Main Status Beacon Panel */}
      <div className="my-auto py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Big Glowing Beacon */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3">
            <span
              className={`w-3.5 h-3.5 rounded-full animate-ping ${
                isOccupied ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            />
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border ${
                isOccupied
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {isOccupied ? 'Room In Session • Do Not Disturb' : 'Room Free • Ready For Booking'}
            </span>
          </div>

          <h2
            className={`text-5xl sm:text-6xl font-black tracking-tight uppercase leading-none ${
              isOccupied ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {isOccupied ? 'Occupied' : 'Available'}
          </h2>

          {isOccupied && activeMeeting ? (
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-rose-200 shadow-sm space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Session</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{activeMeeting.title}</h3>
                <p className="text-sm font-semibold text-slate-600 mt-1">
                  Organizer: {activeMeeting.organizer_name || 'Staff Member'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-500" />
                  Remaining: <strong className="text-rose-600">{remainingText}</strong>
                </span>
                <span>•</span>
                <span>
                  Ends at {new Date(activeMeeting.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Fast Check-In Button */}
              <div className="pt-2">
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn || checkInSuccess}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>
                    {checkInSuccess ? 'Checked In!' : checkingIn ? 'Confirming...' : 'Confirm Arrival / Check-In'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-200 shadow-sm space-y-3">
              <p className="text-sm text-slate-700 font-medium">
                {nextMeeting
                  ? `Next session starts at ${new Date(nextMeeting.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: "${nextMeeting.title}"`
                  : 'No upcoming meetings scheduled for the rest of today.'}
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                <Sparkles className="w-4 h-4" />
                <span>Instant reservation available via Mobile or Web Launchpad</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Daily Agenda Timeline */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Today's Room Schedule</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">{meetings.length} Sessions</span>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {meetings.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center font-medium">
                No meetings booked for today.
              </p>
            ) : (
              meetings.map((m) => {
                const isCurr = activeMeeting?.id === m.id;
                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded-2xl border transition-all text-xs ${
                      isCurr
                        ? 'bg-rose-50/80 border-rose-200 text-slate-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200/80 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="truncate max-w-[200px]">{m.title}</span>
                      <span className="font-mono text-[11px] text-slate-400 shrink-0">
                        {new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">
                      {m.organizer_name || 'Staff'} • {m.status}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer Notice & In-Room Support Actions */}
      <div className="border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 font-bold">
        <div className="flex items-center gap-3">
          <p>CodeBridges Enterprise Digital Door Signage Tablet Engine</p>
          <span className="hidden sm:inline">•</span>
          <button
            type="button"
            onClick={() => setIssueModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            <span>Report Room Defect</span>
          </button>
        </div>
        <p className="font-mono">Auto-refreshes every 15s • Syncs with Zero-Conflict Engine</p>
      </div>

      <RoomIssueReportModal
        isOpen={issueModalOpen}
        roomId={roomId}
        roomName={room?.name}
        isPublicKiosk={true}
        onClose={() => setIssueModalOpen(false)}
      />
    </div>
  );
}
