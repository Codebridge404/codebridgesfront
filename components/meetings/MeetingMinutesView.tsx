'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Printer,
  Copy,
  Calendar,
  Layers,
  Clock,
  MapPin,
  Users,
  CheckSquare,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  getMeetingsApi,
  getMeetingMinutesApi,
  saveMeetingMinutesApi,
  getMeetingDetailsApi,
  MeetingItem,
} from '@/lib/api/meetings';
import { cardStyles } from '@/lib/theme';
import { useToast } from '@/components/common';

export function MeetingMinutesView() {
  const toast = useToast();
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);

  // Minutes Structured Fields
  const [agenda, setAgenda] = useState('');
  const [content, setContent] = useState('');
  const [keyDecisions, setKeyDecisions] = useState('');
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const res = await getMeetingsApi();
      const list = Array.isArray(res) ? res : res?.data || [];
      setMeetings(list);
      if (list.length > 0 && !selectedMeetingId) {
        setSelectedMeetingId(list[0].id);
      }
    } catch {
      toast.error('Failed to load meetings list.');
    }
  };

  useEffect(() => {
    if (selectedMeetingId) {
      loadMeetingAndMinutes(selectedMeetingId);
    }
  }, [selectedMeetingId]);

  const loadMeetingAndMinutes = async (mId: number) => {
    setLoading(true);
    try {
      const [mRes, minRes] = await Promise.allSettled([
        getMeetingDetailsApi(mId),
        getMeetingMinutesApi(mId),
      ]);

      if (mRes.status === 'fulfilled' && mRes.value?.data) {
        setSelectedMeeting(mRes.value.data.meeting || mRes.value.data);
      }

      if (minRes.status === 'fulfilled' && minRes.value?.data) {
        const data = minRes.value.data;
        setContent(data.content || '');
        setAgenda(data.agenda || '');
        setKeyDecisions(data.key_decisions || '');
        setActionItems(Array.isArray(data.action_items) ? data.action_items : []);
        setStatus(data.status || 'draft');
      } else {
        setContent('');
        setAgenda('');
        setKeyDecisions('');
        setActionItems([]);
        setStatus('draft');
      }
    } catch {
      setContent('');
      setActionItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActionItem = () => {
    setActionItems([
      ...actionItems,
      {
        id: String(Date.now()),
        title: '',
        assignee_name: '',
        due_date: new Date().toISOString().split('T')[0],
        status: 'pending',
      },
    ]);
  };

  const handleRemoveActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const handleActionItemChange = (index: number, field: string, val: any) => {
    setActionItems(
      actionItems.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const handleSave = async () => {
    if (!selectedMeetingId) return;
    setSaving(true);
    try {
      const res = await saveMeetingMinutesApi(selectedMeetingId, {
        content,
        agenda,
        key_decisions: keyDecisions,
        action_items: actionItems,
        status,
      });
      if (res?.status === 'success') {
        if (status === 'published') {
          toast.success('Official Minutes published and broadcast to all attendees!');
        } else {
          toast.success('Meeting minutes saved as draft.');
        }
      } else {
        toast.error('Failed to save minutes.');
      }
    } catch {
      toast.error('Error saving minutes.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyMarkdown = () => {
    const title = selectedMeeting?.title || 'Meeting';
    const room = selectedMeeting?.room_name || 'Designated Room';
    const date = selectedMeeting?.start_time ? new Date(selectedMeeting.start_time).toLocaleDateString() : '';

    let md = `# Official Minutes of Meeting (MOM)\n\n`;
    md += `**Title:** ${title}\n`;
    md += `**Date:** ${date}\n`;
    md += `**Location:** ${room}\n`;
    md += `**Status:** ${status.toUpperCase()}\n\n`;

    if (agenda) {
      md += `## 1. Agenda & Objectives\n${agenda}\n\n`;
    }
    if (content) {
      md += `## 2. Official Discussion & Summary\n${content}\n\n`;
    }
    if (keyDecisions) {
      md += `## 3. Key Decisions & Resolutions\n${keyDecisions}\n\n`;
    }
    if (actionItems.length > 0) {
      md += `## 4. Action Items & Deliverables\n`;
      md += `| Task | Assignee | Due Date | Status |\n`;
      md += `| :--- | :--- | :--- | :--- |\n`;
      actionItems.forEach((item) => {
        md += `| ${item.title || '-'} | ${item.assignee_name || '-'} | ${item.due_date || '-'} | ${item.status || 'pending'} |\n`;
      });
      md += `\n`;
    }

    navigator.clipboard.writeText(md);
    toast.success('Formatted MOM copied as Markdown!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 w-full pb-10 font-sans">
      {/* Top Banner */}
      <div className={`${cardStyles.base} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Governance &amp; Records
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Official Minutes of Meeting (MOM)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Meeting Minutes &amp; Executive Records
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Document discussions, log corporate resolutions, assign deliverables, and broadcast official notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            disabled={!selectedMeetingId}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            <span>Export / Print MOM</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !selectedMeetingId}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Minutes'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Meeting Select + Minutes Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Meeting Picker */}
        <div className={`${cardStyles.base} p-4 space-y-3 h-fit`}>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Select Meeting Session</h2>
          <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
            {meetings.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMeetingId(m.id)}
                className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer border ${
                  selectedMeetingId === m.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-slate-200/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold truncate">{m.title}</p>
                  {m.has_minutes && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                        selectedMeetingId === m.id ? 'bg-indigo-500 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      MOM Ready
                    </span>
                  )}
                </div>
                <p className={`text-[10px] mt-1 ${selectedMeetingId === m.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {new Date(m.start_time).toLocaleDateString()} • {m.room_name || 'Room'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Structured Minutes Sections */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header Metadata Bar */}
          {selectedMeeting && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <p className="font-extrabold text-slate-900">{selectedMeeting.title}</p>
                <p className="text-slate-500 text-[11px]">
                  Room: <span className="font-bold text-slate-700">{selectedMeeting.room_name || 'Designated'}</span> • Chair:{' '}
                  <span className="font-bold text-slate-700">{selectedMeeting.organizer_name || 'Organizer'}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold text-[11px]">Publication Status:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className={`px-3 py-1.5 rounded-xl border font-bold text-xs cursor-pointer ${
                    status === 'published'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <option value="draft">Draft (Internal Only)</option>
                  <option value="published">Official Published (Notify All Attendees)</option>
                </select>
              </div>
            </div>
          )}

          {/* Agenda & Objectives */}
          <div className={`${cardStyles.base} p-5 space-y-2`}>
            <label className="text-xs font-black uppercase tracking-wider text-slate-600">
              1. Meeting Agenda &amp; Objectives
            </label>
            <textarea
              rows={3}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="Outline meeting topics, target discussion points, and objectives..."
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans"
            />
          </div>

          {/* Official Discussion & Notes */}
          <div className={`${cardStyles.base} p-5 space-y-2`}>
            <label className="text-xs font-black uppercase tracking-wider text-slate-600">
              2. Official Discussion &amp; Executive Summary
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Record executive deliberations, presented arguments, and contextual notes..."
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans leading-relaxed"
            />
          </div>

          {/* Key Decisions & Resolutions */}
          <div className={`${cardStyles.base} p-5 space-y-2`}>
            <label className="text-xs font-black uppercase tracking-wider text-slate-600">
              3. Key Decisions &amp; Approved Resolutions
            </label>
            <textarea
              rows={3}
              value={keyDecisions}
              onChange={(e) => setKeyDecisions(e.target.value)}
              placeholder="Record ratified decisions, consensus reached, and policy motions passed..."
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans"
            />
          </div>

          {/* Action Items List */}
          <div className={`${cardStyles.base} p-5 space-y-3`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-600">
                  4. Action Items &amp; Deliverables
                </h2>
                <p className="text-[10px] text-slate-400">Accountability matrix for attendees</p>
              </div>
              <button
                type="button"
                onClick={handleAddActionItem}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>

            {actionItems.length === 0 ? (
              <p className="text-center py-6 text-slate-400 text-xs">
                No deliverables added. Click &quot;Add Task&quot; above to assign actionable items.
              </p>
            ) : (
              <div className="space-y-2">
                {actionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Task deliverable description..."
                      value={item.title || item.description || ''}
                      onChange={(e) => handleActionItemChange(idx, 'title', e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Assignee name..."
                      value={item.assignee_name || ''}
                      onChange={(e) => handleActionItemChange(idx, 'assignee_name', e.target.value)}
                      className="w-36 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                    />
                    <input
                      type="date"
                      value={item.due_date || ''}
                      onChange={(e) => handleActionItemChange(idx, 'due_date', e.target.value)}
                      className="w-36 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveActionItem(idx)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formal Executive Printable MOM Modal */}
      {showExportModal && selectedMeeting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 space-y-6 shadow-2xl border border-slate-200 font-sans">
            {/* Modal Controls Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">Official Minutes Document Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-indigo-600" /> Copy Markdown
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Corporate MOM Document Container */}
            <div className="space-y-6 text-slate-800">
              {/* Branded Header */}
              <div className="border-b-2 border-indigo-600 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">CodeBridges Enterprise</h1>
                  <p className="text-xs font-semibold text-slate-500">Corporate Conference &amp; Governance Center</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-[10px] uppercase">
                    Official Minutes (MOM)
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Date: {new Date(selectedMeeting.start_time).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Session Overview Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Session Title</p>
                  <p className="font-black text-slate-900 mt-0.5">{selectedMeeting.title}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Location / Facility</p>
                  <p className="font-black text-slate-900 mt-0.5">{selectedMeeting.room_name || 'Designated Suite'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Executive Chair</p>
                  <p className="font-black text-slate-900 mt-0.5">{selectedMeeting.organizer_name || 'Organizer'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                  <p className="font-black text-indigo-600 uppercase mt-0.5">{status}</p>
                </div>
              </div>

              {/* 1. Agenda */}
              {agenda && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black uppercase text-indigo-900 border-b border-slate-200 pb-1">
                    1. Agenda &amp; Meeting Objectives
                  </h4>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{agenda}</p>
                </div>
              )}

              {/* 2. Official Discussion & Notes */}
              {content && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black uppercase text-indigo-900 border-b border-slate-200 pb-1">
                    2. Official Discussion &amp; Executive Summary
                  </h4>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{content}</p>
                </div>
              )}

              {/* 3. Key Decisions */}
              {keyDecisions && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black uppercase text-indigo-900 border-b border-slate-200 pb-1">
                    3. Key Decisions &amp; Approved Resolutions
                  </h4>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-semibold">
                    {keyDecisions}
                  </p>
                </div>
              )}

              {/* 4. Action Items Table */}
              {actionItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-indigo-900 border-b border-slate-200 pb-1">
                    4. Deliverables &amp; Action Items Matrix
                  </h4>
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="p-2.5 font-bold">Deliverable</th>
                        <th className="p-2.5 font-bold">Assignee</th>
                        <th className="p-2.5 font-bold">Due Date</th>
                        <th className="p-2.5 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {actionItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-slate-900">{item.title || '-'}</td>
                          <td className="p-2.5 text-slate-600">{item.assignee_name || '-'}</td>
                          <td className="p-2.5 text-slate-600">{item.due_date || '-'}</td>
                          <td className="p-2.5 capitalize font-bold text-indigo-600">{item.status || 'pending'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Formal Sign-off Block */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
                <div className="space-y-8">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Prepared By:</p>
                  <div className="border-t border-slate-300 pt-1">
                    <p className="font-black text-slate-900">{selectedMeeting.organizer_name || 'Meeting Recorder'}</p>
                    <p className="text-[10px] text-slate-400">Meeting Secretary / Facilitator</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Ratified / Approved By:</p>
                  <div className="border-t border-slate-300 pt-1">
                    <p className="font-black text-slate-900">Executive Administration</p>
                    <p className="text-[10px] text-slate-400">Corporate Governance Committee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
