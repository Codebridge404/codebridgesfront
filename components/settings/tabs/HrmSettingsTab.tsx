'use client';

import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar, CheckCircle2, Save, ShieldCheck } from 'lucide-react';
import { buttonStyles } from '@/lib/theme';

export function HrmSettingsTab() {
  const [saved, setSaved] = useState(false);
  const [hrmConfig, setHrmConfig] = useState({
    standardWorkHours: '8',
    gracePeriodMinutes: '15',
    overtimeRateWeekday: '1.5',
    overtimeRateHoliday: '2.0',
    autoClockoutHours: '12',
    requireManagerApprovalForLeave: true,
    probationMonths: '3',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cb_hrm_settings');
      if (stored) {
        try {
          setHrmConfig(JSON.parse(stored));
        } catch {}
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_hrm_settings', JSON.stringify(hrmConfig));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand" />
            <span>Human Resource Management (HRM) Policies</span>
          </h2>
          <p className="text-xs text-slate-500">
            Define daily work schedules, attendance grace limits, overtime multipliers, and leave approval workflows
          </p>
        </div>

        <button
          type="submit"
          className={`${buttonStyles.primary} px-5 py-2 text-xs font-black shadow-xs flex items-center gap-1.5`}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save HR Policies</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Attendance & Shift Times */}
        <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
            <Clock className="w-4 h-4 text-brand" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Attendance &amp; Grace Period</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Standard Daily Work Shift (Hours)</label>
              <input
                type="number"
                value={hrmConfig.standardWorkHours}
                onChange={(e) => setHrmConfig({ ...hrmConfig, standardWorkHours: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300/80 bg-transparent text-slate-900 font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Late Check-In Grace Period (Minutes)</label>
              <input
                type="number"
                value={hrmConfig.gracePeriodMinutes}
                onChange={(e) => setHrmConfig({ ...hrmConfig, gracePeriodMinutes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300/80 bg-transparent text-slate-900 font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
              <p className="text-[11px] text-slate-400 mt-1">Arrivals within grace period are not penalized as tardy.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Auto Clock-Out Cap (Hours)</label>
              <input
                type="number"
                value={hrmConfig.autoClockoutHours}
                onChange={(e) => setHrmConfig({ ...hrmConfig, autoClockoutHours: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300/80 bg-transparent text-slate-900 font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>
          </div>
        </div>

        {/* Overtime & Approval Rules */}
        <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
            <Calendar className="w-4 h-4 text-brand" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Overtime &amp; Approvals</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Weekday Overtime Multiplier</label>
              <select
                value={hrmConfig.overtimeRateWeekday}
                onChange={(e) => setHrmConfig({ ...hrmConfig, overtimeRateWeekday: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300/80 bg-transparent text-slate-900 font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
              >
                <option value="1.5" className="text-slate-900 bg-white">1.5x Standard Hourly Wage</option>
                <option value="1.25" className="text-slate-900 bg-white">1.25x Standard Hourly Wage</option>
                <option value="2.0" className="text-slate-900 bg-white">2.0x Standard Hourly Wage</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Sunday &amp; Public Holiday Overtime</label>
              <select
                value={hrmConfig.overtimeRateHoliday}
                onChange={(e) => setHrmConfig({ ...hrmConfig, overtimeRateHoliday: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300/80 bg-transparent text-slate-900 font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
              >
                <option value="2.0" className="text-slate-900 bg-white">2.0x Double Time (Standard Cambodia Labor Law)</option>
                <option value="2.5" className="text-slate-900 bg-white">2.5x Standard Hourly Wage</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={hrmConfig.requireManagerApprovalForLeave}
                  onChange={(e) => setHrmConfig({ ...hrmConfig, requireManagerApprovalForLeave: e.target.checked })}
                  className="w-4 h-4 rounded text-brand focus:ring-brand"
                />
                <span>Require Direct Department Manager Approval for Annual Leave</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
