/**
 * Author: Antigravity Team
 * Date: 2026-11-17
 * Task: BD-0166 - Refresh Tokens Lineage & Revocation Console
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { KeyRound, RefreshCw, Ban, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import {
  RefreshTokenItem,
  RefreshTokenStats,
  getRefreshTokenStatsApi,
  getRefreshTokensApi,
  revokeRefreshTokenApi,
} from '@/lib/api/refreshTokens';
import { useToast } from '@/components/common';

export function RefreshTokensPanel() {
  const toast = useToast();
  const [stats, setStats] = useState<RefreshTokenStats | null>(null);
  const [tokens, setTokens] = useState<RefreshTokenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, listRes] = await Promise.all([
        getRefreshTokenStatsApi().catch(() => null),
        getRefreshTokensApi({ status: statusFilter, per_page: 25 }),
      ]);
      if (statsRes?.data) setStats(statsRes.data);
      setTokens(Array.isArray(listRes?.data) ? listRes.data : []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load refresh tokens.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRevoke = async (token: RefreshTokenItem) => {
    try {
      setRevokingId(token.id);
      await revokeRefreshTokenApi(token.id);
      toast.success(`Refresh token #${token.id} and its family revoked.`);
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to revoke refresh token.');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Total Tokens</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_tokens ?? 0}</p>
          </div>
          <div className="bg-white/80 p-4 rounded-2xl border border-emerald-200/80 shadow-2xs">
            <p className="text-[11px] font-bold text-emerald-600 uppercase">Active</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{stats.active_tokens ?? 0}</p>
          </div>
          <div className="bg-white/80 p-4 rounded-2xl border border-sky-200/80 shadow-2xs">
            <p className="text-[11px] font-bold text-sky-600 uppercase">Rotated</p>
            <p className="text-2xl font-black text-sky-700 mt-1">{stats.rotated_tokens ?? 0}</p>
          </div>
          <div className="bg-white/80 p-4 rounded-2xl border border-rose-200/80 shadow-2xs">
            <p className="text-[11px] font-bold text-rose-600 uppercase">Revoked</p>
            <p className="text-2xl font-black text-rose-700 mt-1">{stats.revoked_tokens ?? 0}</p>
          </div>
        </div>
      )}

      {/* Filter + Refresh */}
      <div className="bg-white/80 rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-extrabold text-slate-900">Rotating Refresh Token Lineage</h3>
          </div>
          <div className="flex items-center gap-2">
            {['all', 'active', 'rotated', 'revoked'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize cursor-pointer transition-colors ${
                  statusFilter === st
                    ? 'bg-brand text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
            <button
              type="button"
              onClick={loadData}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-black">
              <tr>
                <th className="px-4 py-3">User / Device</th>
                <th className="px-4 py-3">Token Family</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Loading refresh tokens...
                  </td>
                </tr>
              ) : tokens.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No refresh tokens found for this filter.
                  </td>
                </tr>
              ) : (
                tokens.map((t) => {
                  const isRevoked = Boolean(t.revoked_at) || t.status === 'revoked';
                  const isUsed = Boolean(t.used_at) || t.status === 'rotated';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900">{t.session?.user?.name || `Session #${t.session_id}`}</p>
                        <p className="text-[11px] text-slate-500">
                          {t.session?.device_name || 'Web Browser'} · {t.session?.ip_address || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                        {t.token_family ? `${t.token_family.slice(0, 12)}…` : `#${t.id}`}
                      </td>
                      <td className="px-4 py-3">
                        {isRevoked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            <ShieldAlert className="w-3 h-3" /> Revoked
                          </span>
                        ) : isUsed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">
                            <Clock className="w-3 h-3" /> Rotated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {t.expires_at ? new Date(t.expires_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isRevoked && (
                          <button
                            type="button"
                            disabled={revokingId === t.id}
                            onClick={() => handleRevoke(t)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px] cursor-pointer disabled:opacity-50"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Revoke</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
