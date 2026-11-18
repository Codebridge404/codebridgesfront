/**
 * Author: Antigravity Team
 * Date: 2026-11-17
 * Task: BD-0164 - Meeting Attachments Panel with Duplicate File Upload (409) Handling
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Paperclip, Upload, Trash2, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  AttachmentItem,
  getMeetingAttachmentsApi,
  uploadMeetingAttachmentApi,
  deleteMeetingAttachmentApi,
} from '@/lib/api/meetings';
import { cardStyles } from '@/lib/theme';

interface MeetingAttachmentsSectionProps {
  meetingId: number | string;
}

function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MeetingAttachmentsSection({ meetingId }: MeetingAttachmentsSectionProps) {
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const res = await getMeetingAttachmentsApi(meetingId);
      setAttachments(Array.isArray(res?.data) ? res.data : []);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to load attachments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (meetingId) {
      setDuplicateWarning(null);
      setErrorMsg(null);
      setSuccessMsg(null);
      loadAttachments();
    }
  }, [meetingId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setDuplicateWarning(null);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await uploadMeetingAttachmentApi(meetingId, file);
      setSuccessMsg(`"${file.name}" attached successfully.`);
      await loadAttachments();
    } catch (err: any) {
      if (err?.status === 409 || err?.code === 'DUPLICATE_FILE_UPLOAD') {
        const existingName = err?.payload?.data?.file_name || file.name;
        setDuplicateWarning(
          `Duplicate file prevented: "${existingName}" is already attached to this meeting.`
        );
      } else {
        setErrorMsg(err?.message || 'Failed to upload attachment.');
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (attachment: AttachmentItem) => {
    setErrorMsg(null);
    setDuplicateWarning(null);
    setSuccessMsg(null);
    try {
      await deleteMeetingAttachmentApi(meetingId, attachment.id);
      setAttachments((prev) => prev.filter((item) => item.id !== attachment.id));
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to delete attachment.');
    }
  };

  return (
    <div className={`${cardStyles.base} p-5 space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-brand" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Meeting Documents &amp; Attachments ({attachments.length})
          </h3>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id={`meeting-attachment-input-${meetingId}`}
          />
          <label
            htmlFor={`meeting-attachment-input-${meetingId}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              uploading
                ? 'bg-slate-100 text-slate-400 border-slate-200 pointer-events-none'
                : 'bg-brand/10 hover:bg-brand/20 text-brand border-brand/20'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Uploading...' : 'Attach File'}</span>
          </label>
        </div>
      </div>

      {duplicateWarning && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{duplicateWarning}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-slate-400">Loading attachments...</p>
      ) : attachments.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No documents attached to this meeting yet.</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="p-2.5 rounded-xl bg-white/70 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{att.file_name}</p>
                  <p className="text-[10px] text-slate-400">
                    {att.file_type || 'Document'} • {formatBytes(att.file_size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(att)}
                title="Remove attachment"
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
