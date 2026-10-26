'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChefHat,
  CheckCircle2,
  RefreshCw,
  Clock,
  Volume2,
  VolumeX,
  Keyboard,
  Flame,
  AlertTriangle,
  RotateCcw,
  X,
} from 'lucide-react';
import { getKdsTicketsApi, updateKdsStatusApi, bumpKdsTicketApi, getKdsStreamUrl } from '@/lib/api';
import { posAudio } from '@/hooks/usePosAudio';

export interface KdsTicket {
  id: string | number;
  ticket_number?: string;
  order_type?: string;
  table_name?: string;
  items: Array<{ name: string; quantity?: number; qty?: number; notes?: string }> | string;
  status: 'pending' | 'preparing' | 'ready' | 'bumped';
  created_at?: string;
  prep_time_minutes?: number;
}

export function KitchenDisplayView() {
  const [tickets, setTickets] = useState<KdsTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiveStream, setIsLiveStream] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');
  const [lastBumpedTicket, setLastBumpedTicket] = useState<KdsTicket | null>(null);
  const previousTicketIdsRef = useRef<Set<string | number>>(new Set());

  const parseItems = (raw: any): Array<{ name: string; qty: number }> => {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((i) => ({
        name: i.name || i.product_name || 'Item',
        qty: Number(i.quantity ?? i.qty ?? 1),
      }));
    }
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
          ? parsed.map((i) => ({ name: i.name || i.product_name || 'Item', qty: Number(i.quantity ?? i.qty ?? 1) }))
          : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const loadTickets = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await getKdsTicketsApi();
      const list: KdsTicket[] = Array.isArray(res) ? res : res?.data || [];

      // Check if any new ticket arrived to play kitchen order bell chime
      if (!isInitial) {
        const hasNewTicket = list.some((t) => !previousTicketIdsRef.current.has(t.id));
        if (hasNewTicket && soundEnabled) {
          posAudio.playKitchenOrderChime();
        }
      }

      previousTicketIdsRef.current = new Set(list.map((t) => t.id));
      setTickets(list);
    } catch (err) {
      console.error('Failed to load KDS tickets:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [soundEnabled]);

  // Real-time SSE Stream listener with resilient fallback polling
  useEffect(() => {
    loadTickets(true);

    let eventSource: EventSource | null = null;
    try {
      const sseUrl = getKdsStreamUrl();
      eventSource = new EventSource(sseUrl);

      eventSource.addEventListener('kds-update', (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const list: KdsTicket[] = Array.isArray(parsed?.data) ? parsed.data : (Array.isArray(parsed) ? parsed : []);

          const hasNewTicket = list.some((t) => !previousTicketIdsRef.current.has(t.id));
          if (hasNewTicket && soundEnabled) {
            posAudio.playKitchenOrderChime();
          }
          previousTicketIdsRef.current = new Set(list.map((t) => t.id));
          setTickets(list);
          setIsLiveStream(true);
          setLoading(false);
        } catch (e) {
          console.error('Error parsing SSE kds-update:', e);
        }
      });

      eventSource.addEventListener('ping', () => {
        setIsLiveStream(true);
      });

      eventSource.onerror = () => {
        setIsLiveStream(false);
      };
    } catch (sseErr) {
      console.warn('SSE stream failed to connect, falling back to polling:', sseErr);
      setIsLiveStream(false);
    }

    const interval = setInterval(() => {
      // Periodic fallback sync
      loadTickets(false);
    }, isLiveStream ? 25000 : 5000);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(interval);
    };
  }, [loadTickets, soundEnabled, isLiveStream]);

  const handleUpdateStatus = async (ticket: KdsTicket, nextStatus: 'preparing' | 'ready' | 'bumped') => {
    try {
      posAudio.playBumpChirp();
      if (nextStatus === 'bumped') {
        setLastBumpedTicket(ticket);
        await bumpKdsTicketApi(String(ticket.id));
      } else {
        await updateKdsStatusApi(String(ticket.id), nextStatus);
      }
      await loadTickets(false);
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  const handleRecallLastBumped = async () => {
    if (!lastBumpedTicket) return;
    try {
      posAudio.playBumpChirp();
      await updateKdsStatusApi(String(lastBumpedTicket.id), 'preparing');
      setLastBumpedTicket(null);
      await loadTickets(false);
    } catch (err) {
      console.error('Failed to recall ticket:', err);
    }
  };

  // Physical Bump Bar Keyboard Shortcuts (1-9, Space to bump #1, R to refresh)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Spacebar bumps oldest ticket
      if (e.code === 'Space') {
        e.preventDefault();
        const activeList = tickets.filter((t) => t.status !== 'bumped');
        if (activeList.length > 0) {
          handleUpdateStatus(activeList[0], 'ready');
        }
        return;
      }

      // Keys 1 through 9
      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 9) {
        e.preventDefault();
        const activeList = tickets.filter((t) => t.status !== 'bumped');
        const targetTicket = activeList[keyNum - 1];
        if (targetTicket) {
          const next = targetTicket.status === 'pending' ? 'preparing' : 'ready';
          handleUpdateStatus(targetTicket, next);
        }
        return;
      }

      // 'R' key for refresh
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        loadTickets(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tickets, loadTickets]);

  const getElapsedTimeInfo = (createdAt?: string) => {
    if (!createdAt) return { text: 'Just now', minutes: 0, level: 'normal' };
    const elapsedMs = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(elapsedMs / 60000);
    const seconds = Math.floor((elapsedMs % 60000) / 1000);
    const text = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (minutes >= 10) return { text, minutes, level: 'urgent' };
    if (minutes >= 5) return { text, minutes, level: 'warning' };
    return { text, minutes, level: 'normal' };
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'all') return t.status !== 'bumped';
    return t.status === statusFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans select-none pb-12">
      {/* Top Header Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <span>Kitchen Display System (KDS)</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                  Live Station Feed
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Physical bump bar shortcuts: [1-9] to bump tickets &bull; [Space] to bump first &bull; [R] to reload
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {lastBumpedTicket && (
            <button
              type="button"
              onClick={handleRecallLastBumped}
              className="px-3.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recall Last Ticket</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              soundEnabled
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-slate-400'
            }`}
            title={soundEnabled ? 'Kitchen Bell Sound On' : 'Kitchen Bell Sound Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-brand-subtle border border-brand/20 text-brand text-xs font-black flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
            <span>{filteredTickets.length} ACTIVE</span>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-2 ${
              isLiveStream
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
            title={isLiveStream ? 'Real-Time Server-Sent Events stream connected' : 'Fallback polling active'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveStream ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>{isLiveStream ? 'REAL-TIME SSE' : 'POLLING'}</span>
          </div>

          <button
            type="button"
            onClick={() => loadTickets(false)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Refresh KDS"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.opener) {
                window.close();
              } else {
                window.location.href = '/pos/settings?tab=terminals';
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-700 border border-slate-200 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Close Kitchen Display System"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close KDS</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['all', 'pending', 'preparing', 'ready'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black capitalize transition-all cursor-pointer ${
              statusFilter === st
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st} ({tickets.filter((t) => (st === 'all' ? t.status !== 'bumped' : t.status === st)).length})
          </button>
        ))}
      </div>

      {/* Ticket Grid */}
      {filteredTickets.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-black text-slate-800">All Orders Expedited!</h3>
          <p className="text-xs text-slate-400">No active kitchen orders in this view. Incoming tickets trigger sound alerts automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTickets.map((ticket, idx) => {
            const timeInfo = getElapsedTimeInfo(ticket.created_at);
            const items = parseItems(ticket.items);
            const shortcutNum = idx + 1 <= 9 ? idx + 1 : null;

            const timerBadgeColor =
              timeInfo.level === 'urgent'
                ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                : timeInfo.level === 'warning'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border-emerald-200';

            return (
              <div
                key={ticket.id}
                className={`bg-white rounded-3xl border shadow-xs overflow-hidden flex flex-col justify-between transition-all ${
                  timeInfo.level === 'urgent'
                    ? 'border-rose-400 ring-2 ring-rose-300/40'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Ticket Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                  <div className="flex items-center gap-2">
                    {shortcutNum && (
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono font-black text-xs flex items-center justify-center shadow-xs">
                        {shortcutNum}
                      </span>
                    )}
                    <div>
                      <span className="font-mono font-black text-sm text-slate-900 block leading-tight">
                        {ticket.ticket_number || `#${String(ticket.id).slice(0, 6)}`}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {ticket.table_name || 'Takeaway Counter'}
                      </span>
                    </div>
                  </div>

                  {/* Elapsed Timer Badge */}
                  <div className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono flex items-center gap-1 border ${timerBadgeColor}`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeInfo.text}</span>
                  </div>
                </div>

                {/* Ticket Line Items */}
                <div className="p-4 space-y-2 flex-1">
                  {items.length === 0 ? (
                    <div className="text-xs text-slate-400 font-semibold italic">Standard Table Order</div>
                  ) : (
                    items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between text-xs font-bold text-slate-800 pb-1.5 border-b border-slate-100 last:border-b-0"
                      >
                        <span className="flex-1 pr-2">{item.name}</span>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-900 font-black shrink-0">
                          x{item.qty}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Bump Action Footer */}
                <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  {ticket.status === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(ticket, 'preparing')}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Start Cooking</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(ticket, 'ready')}
                      className="flex-1 py-2 px-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Ready</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(ticket, 'bumped')}
                    className="py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    title="Bump order from screen"
                  >
                    Bump
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
