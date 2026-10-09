'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  Search,
  RotateCw,
  Loader2,
  Calendar,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { getAttendancesApi, clockOutApi, AttendanceRecord, getAuthUser } from '@/lib/api';
import { ClockInOutModal } from './ClockInOutModal';

export function HrmAttendanceTable() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [user, setUser] = useState<any>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  const loadAttendances = async () => {
    try {
      setLoading(true);
      const res = await getAttendancesApi({ date: date || undefined, q: search || undefined });
      const list = Array.isArray(res) ? res : res?.data || [];
      setRecords(list);
    } catch (err) {
      console.warn('Could not load attendances:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendances();
  }, [date]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAttendances();
  };

  const handleDirectClockOut = async (record: AttendanceRecord) => {
    try {
      setActionLoadingId(record.id);
      await clockOutApi({ attendance_id: record.id });
      loadAttendances();
    } catch (err: any) {
      alert(err.message || 'Failed to clock out');
    } finally {
      setActionLoadingId(null);
    }
  };

  const activeCount = records.filter((r) => !r.clock_out).length;
  const completedCount = records.filter((r) => Boolean(r.clock_out)).length;

  const formatTime = (ts?: string) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDuration = (inTime: string, outTime?: string) => {
    const start = new Date(inTime).getTime();
    const end = outTime ? new Date(outTime).getTime() : Date.now();
    const diffMins = Math.floor((end - start) / 60000);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="space-y-4 font-sans select-none text-slate-900">
      {/* 1. Header Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center font-bold shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Staff Attendance &amp; Shift Timesheets</h2>
            <p className="text-xs text-slate-500 font-medium">Clock-in logs, punctuality tracking, and shift duration records</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAttendances}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh attendances"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedRecord(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Clock In / Out</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-0.5">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Check-Ins</span>
          <div className="text-2xl font-black text-slate-900">{records.length}</div>
          <span className="text-[11px] text-slate-500 font-medium">Shift entries for selected date</span>
        </div>
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-0.5">
          <span className="text-[10px] font-extrabold uppercase text-emerald-700">Currently On Shift</span>
          <div className="text-2xl font-black text-emerald-800">{activeCount}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Active clock-ins without sign-off</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-0.5">
          <span className="text-[10px] font-extrabold uppercase text-slate-500">Completed Shifts</span>
          <div className="text-2xl font-black text-slate-900">{completedCount}</div>
          <span className="text-[11px] text-slate-500 font-medium">Closed and logged shifts</span>
        </div>
      </div>

      {/* 3. Search & Date Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search staff name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>
      </div>

      {/* 4. Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-5">Staff Member</th>
              <th className="py-3 px-4">Station / Outlet</th>
              <th className="py-3 px-4">Clock In</th>
              <th className="py-3 px-4">Clock Out</th>
              <th className="py-3 px-4 text-center">Duration</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-brand" />
                  <span>Loading attendance records...</span>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 space-y-1">
                  <p className="font-bold text-slate-700">No attendance records found</p>
                  <p className="text-[11px]">Click "Clock In / Out" above to record a shift.</p>
                </td>
              </tr>
            ) : (
              records.map((r) => {
                const isActive = !r.clock_out;
                return (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-5">
                      <div className="font-extrabold text-slate-900">{r.staff_name || 'Staff Member'}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{r.staff_email || '—'}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">{r.outlet_name || 'Main Outlet'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{formatTime(r.clock_in)}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{formatTime(r.clock_out)}</td>
                    <td className="py-3 px-4 font-mono text-center text-slate-700">
                      {calculateDuration(r.clock_in, r.clock_out)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {isActive ? 'On Shift' : 'Completed'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      {isActive ? (
                        <button
                          type="button"
                          disabled={actionLoadingId === r.id}
                          onClick={() => handleDirectClockOut(r)}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-extrabold text-[11px] cursor-pointer transition-colors"
                        >
                          {actionLoadingId === r.id ? 'Saving...' : 'Clock Out'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono italic">Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ClockInOutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadAttendances}
        user={user}
        activeRecord={selectedRecord}
      />
    </div>
  );
}

export default HrmAttendanceTable;
