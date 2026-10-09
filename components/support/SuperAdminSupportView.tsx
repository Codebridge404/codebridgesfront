'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LifeBuoy, Search, Megaphone, MessageSquare } from 'lucide-react';
import { SupportTicket, PlatformAnnouncement, SupportStats } from './types';
import { TicketsTab } from './TicketsTab';
import { AnnouncementsTab } from './AnnouncementsTab';
import { TicketReplyModal } from './TicketReplyModal';
import { CreateAnnouncementModal } from './CreateAnnouncementModal';
import {
  getSupportTicketsApi,
  updateSupportTicketApi,
  getPlatformAnnouncementsApi,
  createPlatformAnnouncementApi,
  togglePlatformAnnouncementApi,
  deletePlatformAnnouncementApi,
} from '@/lib/api';

export function SuperAdminSupportView() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'announcements'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [replyTicket, setReplyTicket] = useState<SupportTicket | null>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSupportTicketsApi({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        q: searchTerm || undefined,
      });
      if (res?.success) {
        setTickets(res.data);
        setStats(res.stats);
      }
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, searchTerm]);

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPlatformAnnouncementsApi();
      if (res?.success) {
        setAnnouncements(res.data);
      }
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'tickets') {
      loadTickets();
    } else {
      loadAnnouncements();
    }
  }, [activeTab, loadTickets, loadAnnouncements]);

  const handleSaveTicketReply = async (
    ticketId: string,
    status: 'open' | 'in_progress' | 'resolved',
    responseNote: string
  ) => {
    const res = await updateSupportTicketApi(ticketId, {
      status,
      response_note: responseNote,
    });
    if (res?.success) {
      loadTickets();
    }
  };

  const handleCreateAnnouncement = async (data: {
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
    target_audience: string;
  }) => {
    const res = await createPlatformAnnouncementApi(data);
    if (res?.success) {
      loadAnnouncements();
    }
  };

  const handleToggleAnnouncement = async (id: number) => {
    await togglePlatformAnnouncementApi(id);
    loadAnnouncements();
  };

  const handleDeleteAnnouncement = async (id: number) => {
    await deletePlatformAnnouncementApi(id);
    loadAnnouncements();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand to-brand-hover p-0.5 shadow-md shadow-brand/15 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <LifeBuoy className="w-6 h-6 text-brand" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Global Support Desk &amp; Maintenance Broadcasts
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-subtle text-brand text-[10px] font-extrabold border border-brand/20 uppercase">
                Platform Operations
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Respond to cross-tenant issues, provide support resolutions, and publish system maintenance announcements.
            </p>
          </div>
        </div>

        {/* Tab & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('tickets')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tickets' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Merchant Tickets</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('announcements')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'announcements' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Announcements</span>
            </button>
          </div>

          {activeTab === 'tickets' && (
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tickets..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand text-slate-900 placeholder:text-slate-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        {activeTab === 'tickets' ? (
          <TicketsTab
            tickets={tickets}
            stats={stats}
            loading={loading}
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
            onOpenReply={(t) => setReplyTicket(t)}
          />
        ) : (
          <AnnouncementsTab
            announcements={announcements}
            loading={loading}
            onOpenCreateModal={() => setShowAnnouncementModal(true)}
            onToggleActive={handleToggleAnnouncement}
            onDelete={handleDeleteAnnouncement}
          />
        )}
      </div>

      {/* Reply Modal */}
      <TicketReplyModal
        ticket={replyTicket}
        isOpen={Boolean(replyTicket)}
        onClose={() => setReplyTicket(null)}
        onSave={handleSaveTicketReply}
      />

      {/* Create Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        onSubmit={handleCreateAnnouncement}
      />
    </div>
  );
}
