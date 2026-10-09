'use client';

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  CalendarCheck,
  Send,
  Tablet,
  CheckCircle2,
  FileText,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface MeetingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MeetingTourModal({ isOpen, onClose }: MeetingTourModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'booking' | 'signage' | 'telegram'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">MMS Knowledge Center & Guidelines</h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Standard operating procedures and zero-conflict policies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-5 gap-2 bg-slate-50/30">
          {[
            { id: 'overview', label: 'Overview & Roles', icon: Shield },
            { id: 'booking', label: 'Zero-Conflict Policy', icon: CalendarCheck },
            { id: 'signage', label: 'Door Tablets', icon: Tablet },
            { id: 'telegram', label: 'Telegram Bot', icon: Send },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  active
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900">Three Parent Roles in MMS</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                  <p className="font-extrabold text-indigo-900">1. Super Admin</p>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    Platform root governance. Manages tenant room quotas, global system settings, and inspects cross-tenant meeting audit logs.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="font-extrabold text-slate-900">2. Organization (Tenant Owner / Admin)</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Configures corporate conference rooms, registers amenities (4K displays, whiteboards), connects company Telegram alert bot, and manages staff permissions.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="font-extrabold text-slate-900">3. Employees & Dynamic Staff Roles</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Reserves meeting rooms, accepts RSVPs, writes shared minutes with action items, and checks in via door tablets.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900">Zero-Conflict Scheduling Engine</h3>
              <p>
                CodeBridges enforces mathematical interval exclusivity:{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 rounded text-indigo-600 font-mono font-bold">
                  (start &lt; existing_end) AND (end &gt; existing_start)
                </code>
                . Double bookings are rejected at the database transaction layer.
              </p>
              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>RFC 5545 iCalendar Export:</strong> Click the calendar icon on any confirmed meeting to download a universal <code>.ics</code> file compatible with Google, Outlook, and Apple Calendar.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Ghost Room Reclamation:</strong> If a scheduled meeting is not checked in within 15 minutes of its start time, the room is automatically released for colleagues.
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'signage' && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900">Digital Door Signage Tablets</h3>
              <p>
                Mount any tablet outside the conference entrance and navigate to{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 rounded text-indigo-600 font-mono font-bold">
                  /meetings/room-display/[id]
                </code>
                .
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                  <p className="font-extrabold text-emerald-700">Emerald Green Beacon</p>
                  <p className="text-[11px] mt-1">
                    Indicates room is free and ready. Shows next upcoming session start time.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950">
                  <p className="font-extrabold text-rose-700">Crimson Pulse Beacon</p>
                  <p className="text-[11px] mt-1">
                    Indicates session in progress. Shows live remaining countdown timer and 1-click Check-In button.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'telegram' && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900">Telegram Instant Alerts Integration</h3>
              <p>
                Keep attendees informed with instant push notifications dispatched directly from your company Telegram bot:
              </p>
              <ol className="list-decimal pl-4 space-y-1.5 pt-1">
                <li>Create a bot via <strong className="text-indigo-600">@BotFather</strong> on Telegram and copy the API Token.</li>
                <li>Add the bot to your company group chat or channel, or message it privately to get your Chat ID.</li>
                <li>Enter the Bot Token and Chat ID in <strong>Telegram & Alerts</strong> settings.</li>
                <li>Click <strong>Send Test Notification</strong> to verify instant connectivity!</li>
              </ol>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Got It, Close
          </button>
        </div>
      </div>
    </div>
  );
}
