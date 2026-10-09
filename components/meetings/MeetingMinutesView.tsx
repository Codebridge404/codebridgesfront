'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  User,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  getMeetingsApi,
  getMeetingMinutesApi,
  saveMeetingMinutesApi,
  MeetingItem,
} from '@/lib/api';
import { cardStyles } from '@/lib/theme';
import { useToast } from '@/components/common';

export function MeetingMinutesView() {
  const toast = useToast();
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
      toast.error('Failed to load meetings.');
    }
  };

  useEffect(() => {
    if (selectedMeetingId) {
      loadMinutes(selectedMeetingId);
    }
  }, [selectedMeetingId]);

  const loadMinutes = async (mId: number) => {
    setLoading(true);
    try {
      const res = await getMeetingMinutesApi(mId);
      const data = res?.data;
      if (data) {
        setContent(data.content || '');
        setActionItems(Array.isArray(data.action_items) ? data.action_items : []);
        setStatus(data.status || 'draft');
      } else {
        setContent('');
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
        action_items: actionItems,
        status,
      });
      if (res?.status === 'success') {
        toast.success('Meeting minutes and action items saved!');
      } else {
        toast.error('Failed to save minutes.');
      }
    } catch {
      toast.error('Error saving minutes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 w-full pb-10 font-sans">
      {/* Header */}
      <div className={`${cardStyles.base} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Meeting Minutes &amp; Action Items
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Record official discussions, executive decisions, and assign trackable deliverables.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !selectedMeetingId}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Minutes'}</span>
        </button>
      </div>

      {/* Main Grid: Meeting Select + Minutes Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Meeting Picker */}
        <div className={`${cardStyles.base} p-4 space-y-3 h-fit`}>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Select Session</h2>
          <div className="space-y-1.5 max-h-[70vh] overflow-y-auto">
            {meetings.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMeetingId(m.id)}
                className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                  selectedMeetingId === m.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <p className="text-xs font-bold truncate">{m.title}</p>
                <p className={`text-[10px] mt-0.5 ${selectedMeetingId === m.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {new Date(m.start_time).toLocaleDateString()} • {m.room_name || 'Room'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Minutes Editor & Action Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`${cardStyles.base} p-5 space-y-3`}>
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-600">Official Discussion Notes</h2>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Status:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white"
                >
                  <option value="draft">Draft Notes</option>
                  <option value="published">Official Published</option>
                </select>
              </div>
            </div>

            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Record executive discussions, key decisions, and meeting notes..."
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans"
            />
          </div>

          {/* Action Items List */}
          <div className={`${cardStyles.base} p-5 space-y-3`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-600">Action Items &amp; Deliverables</h2>
              <button
                type="button"
                onClick={handleAddActionItem}
                className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>

            {actionItems.length === 0 ? (
              <p className="text-center py-6 text-slate-400 text-xs">No action items added yet. Click &quot;Add Task&quot; above.</p>
            ) : (
              <div className="space-y-2">
                {actionItems.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      placeholder="Task description..."
                      value={item.title}
                      onChange={(e) => handleActionItemChange(idx, 'title', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Assignee name..."
                      value={item.assignee_name}
                      onChange={(e) => handleActionItemChange(idx, 'assignee_name', e.target.value)}
                      className="w-32 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                    />
                    <input
                      type="date"
                      value={item.due_date}
                      onChange={(e) => handleActionItemChange(idx, 'due_date', e.target.value)}
                      className="w-32 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveActionItem(idx)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
