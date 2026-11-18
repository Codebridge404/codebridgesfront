/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: BD-0159
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  Globe,
  Terminal,
  Server,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  Layers,
} from 'lucide-react';
import { ApiRequestLogItem } from '@/lib/api';

interface RequestLogDetailModalProps {
  log: ApiRequestLogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RequestLogDetailModal({
  log,
  isOpen,
  onClose,
}: RequestLogDetailModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'payload' | 'params' | 'metadata'>('payload');

  if (!isOpen || !log) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isSuccess = log.status_code >= 200 && log.status_code < 300;
  const isError = log.status_code >= 400;
  const isSlow = log.duration_ms >= 500;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wider uppercase ${
                  log.method === 'GET'
                    ? 'bg-sky-100 text-sky-700 border border-sky-200'
                    : log.method === 'POST'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : log.method === 'PUT' || log.method === 'PATCH'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-rose-100 text-rose-700 border border-rose-200'
                }`}
              >
                {log.method}
              </span>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono ${
                  isSuccess
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isError
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {log.status_code}
              </span>
              <div className="truncate">
                <h3 className="text-sm font-black text-slate-900 font-mono truncate">
                  {log.path}
                </h3>
                {log.route_name && (
                  <p className="text-2xs text-slate-400 font-mono">
                    Route: {log.route_name}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3.5 bg-slate-50 border-b border-slate-200/80 text-xs">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${isSlow ? 'text-amber-500' : 'text-slate-400'}`} />
              <div>
                <p className="text-2xs text-slate-400 font-medium">Latency</p>
                <p className={`font-mono font-bold ${isSlow ? 'text-amber-600' : 'text-slate-800'}`}>
                  {log.duration_ms} ms {isSlow && '⚠️'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-2xs text-slate-400 font-medium">IP Address</p>
                <p className="font-mono font-semibold text-slate-800 truncate">
                  {log.ip_address}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-2xs text-slate-400 font-medium">Service / Env</p>
                <p className="font-semibold text-slate-800 truncate">
                  {log.service_name || 'auth-service'} ({log.environment || 'local'})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-2xs text-slate-400 font-medium">User / Client</p>
                <p className="font-semibold text-slate-800 truncate">
                  {log.user_name || (log.user_id ? `User #${log.user_id}` : 'Anonymous / Guest')}
                </p>
              </div>
            </div>
          </div>

          {/* Error Banner if Present */}
          {log.error_message && (
            <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/90 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-black text-rose-900">
                  {log.error_code || 'API Error'}: {log.error_message}
                </p>
              </div>
            </div>
          )}

          {/* Studio Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200/80">
            <button
              onClick={() => setActiveTab('payload')}
              className={`flex items-center gap-2 pb-2.5 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'payload'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4" />
              Request Payload / Body
            </button>
            <button
              onClick={() => setActiveTab('params')}
              className={`flex items-center gap-2 pb-2.5 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'params'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              Query & Route Parameters
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`flex items-center gap-2 pb-2.5 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'metadata'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Forensic Metadata
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
            {activeTab === 'payload' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                    Sanitized Request Body
                  </span>
                  {log.request_data && (
                    <button
                      onClick={() =>
                        handleCopy(JSON.stringify(log.request_data, null, 2), 'body')
                      }
                      className="flex items-center gap-1 text-2xs text-slate-500 hover:text-slate-800"
                    >
                      {copiedKey === 'body' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy JSON
                        </>
                      )}
                    </button>
                  )}
                </div>
                {log.request_data && Object.keys(log.request_data).length > 0 ? (
                  <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-2xs leading-relaxed overflow-x-auto">
                    {JSON.stringify(log.request_data, null, 2)}
                  </pre>
                ) : (
                  <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-400">
                    No body payload recorded for this request (GET or empty payload).
                  </div>
                )}
              </div>
            )}

            {activeTab === 'params' && (
              <div className="space-y-4">
                <div>
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Query Parameters
                  </span>
                  {log.query_params && Object.keys(log.query_params).length > 0 ? (
                    <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-2xs overflow-x-auto">
                      {JSON.stringify(log.query_params, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No query parameters.</p>
                  )}
                </div>

                <div>
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Route Parameters
                  </span>
                  {log.route_params && Object.keys(log.route_params).length > 0 ? (
                    <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-2xs overflow-x-auto">
                      {JSON.stringify(log.route_params, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No route parameters.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'metadata' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Request ID:</span>
                    <span className="font-mono text-slate-800 font-bold select-all">
                      {log.request_id}
                    </span>
                  </div>
                  {log.trace_id && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Trace ID:</span>
                      <span className="font-mono text-slate-800 select-all">{log.trace_id}</span>
                    </div>
                  )}
                  {log.span_id && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Span ID:</span>
                      <span className="font-mono text-slate-800 select-all">{log.span_id}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timestamp:</span>
                    <span className="text-slate-800">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  {log.tenant_id && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tenant ID:</span>
                      <span className="font-mono text-slate-800">Tenant #{log.tenant_id}</span>
                    </div>
                  )}
                  {log.user_agent && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block mb-1">User Agent:</span>
                      <p className="font-mono text-2xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 break-all">
                        {log.user_agent}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 transition-all cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

