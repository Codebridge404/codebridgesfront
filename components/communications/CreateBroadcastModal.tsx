'use client';

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { createPlatformAnnouncementApi } from '@/lib/api/support';
import { useToast } from '@/components/common';

interface CreateBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateBroadcastModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateBroadcastModalProps) {
  const toast = useToast();
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<'info' | 'maintenance' | 'warning' | 'alert'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      setIsSubmitting(true);
      const severityMap: Record<string, 'info' | 'warning' | 'critical'> = {
        info: 'info',
        maintenance: 'warning',
        warning: 'warning',
        alert: 'critical',
      };
      await createPlatformAnnouncementApi({
        title: newTitle.trim(),
        message: newContent.trim(),
        severity: severityMap[newType] || 'info',
        target_audience: 'all_tenants',
      });

      toast.success('Broadcast announcement published successfully.');
      setNewTitle('');
      setNewContent('');
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to publish broadcast announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
        <h3 className="font-black text-base text-slate-900">Create Merchant Broadcast</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Broadcast Type</label>
            <select
              value={newType}
              onChange={(e: any) => setNewType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand cursor-pointer"
            >
              <option value="info">Platform Announcement (Info)</option>
              <option value="maintenance">Scheduled Maintenance Alert</option>
              <option value="warning">System Warning</option>
              <option value="alert">Critical Platform Alert</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. System Update: New Cashier Shortcuts"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Message Content</label>
            <textarea
              rows={4}
              required
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Type the message that merchants will see in their dashboard..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-black text-xs shadow-md shadow-brand/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Broadcast</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
