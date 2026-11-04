/**
 * Author: Antigravity Team
 * Date: 2026-11-04
 * Task: Meeting iCalendar (.ics) Export & RSVP (BD-0132)
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Download, ExternalLink, ChevronDown, Loader2 } from 'lucide-react';
import {
  MeetingItem,
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  downloadMeetingIcsApi,
  getMeetingIcsUrl,
} from '@/lib/api/meetings';

interface CalendarSyncDropdownProps {
  meeting: Partial<MeetingItem>;
}

export function CalendarSyncDropdown({ meeting }: CalendarSyncDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadingIcs, setDownloadingIcs] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const googleUrl = generateGoogleCalendarUrl(meeting);
  const outlookUrl = generateOutlookCalendarUrl(meeting);

  const handleDownloadIcs = async () => {
    if (!meeting.id) return;
    try {
      setDownloadingIcs(true);
      await downloadMeetingIcsApi(meeting.id, `meeting-${meeting.id}.ics`);
      setIsOpen(false);
    } catch {
      // Fallback to opening direct URL
      window.open(getMeetingIcsUrl(meeting.id), '_blank');
      setIsOpen(false);
    } finally {
      setDownloadingIcs(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
        title="Sync or Export to Calendar"
      >
        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
        <span className="hidden sm:inline">Sync</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-52 rounded-2xl bg-white border border-slate-200/90 shadow-xl p-1.5 text-xs animate-in fade-in zoom-in-95 duration-100">
          <p className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Export &amp; Sync Calendar
          </p>
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-semibold transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Google Calendar
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
          <a
            href={outlookUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-semibold transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              Outlook Online
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
          <button
            type="button"
            onClick={handleDownloadIcs}
            disabled={downloadingIcs}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-semibold transition-colors border-t border-slate-100 mt-1 cursor-pointer disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              {downloadingIcs ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              ) : (
                <Download className="w-3.5 h-3.5 text-indigo-500" />
              )}
              Apple / iCal (.ics)
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
