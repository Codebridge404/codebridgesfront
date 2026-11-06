/**
 * Author: Antigravity Team
 * Date: 2026-11-06
 * Task: Asynchronous Tax Audit Export Queue & Downloader (BD-0150)
 */
'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  FileCheck2,
  Play,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  queueTaxAuditApi,
  getExportStatusApi,
  getDownloadExportUrl,
} from '@/lib/api/sales';
import { useToast } from '@/components/common';

interface AsyncExportQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  startDate?: string;
  endDate?: string;
  outletId?: string | number;
}

interface ExportJob {
  id: string;
  status: 'queued' | 'processing' | 'ready' | 'error';
  progress: number;
  startDate: string;
  endDate: string;
  queuedAt: string;
  downloadUrl?: string;
  filename?: string;
  errorMessage?: string;
}

export function AsyncExportQueueDrawer({
  isOpen,
  onClose,
  startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  endDate = new Date().toISOString().split('T')[0],
  outletId,
}: AsyncExportQueueDrawerProps) {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [dispatching, setDispatching] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load cached jobs from localStorage if any
    try {
      const stored = localStorage.getItem('cb_gdt_export_jobs');
      if (stored) {
        setJobs(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveJobs = (newJobs: ExportJob[]) => {
    setJobs(newJobs);
    try {
      localStorage.setItem('cb_gdt_export_jobs', JSON.stringify(newJobs));
    } catch {
      // ignore
    }
  };

  // Poll status for active jobs
  useEffect(() => {
    const activeJobs = jobs.filter((j) => j.status === 'queued' || j.status === 'processing');
    if (activeJobs.length === 0) return;

    const interval = setInterval(async () => {
      let updated = false;
      const nextJobs = await Promise.all(
        jobs.map(async (job) => {
          if (job.status !== 'queued' && job.status !== 'processing') return job;

          try {
            const res = await getExportStatusApi(job.id);
            if (res?.data) {
              updated = true;
              const serverStatus = res.data.status;
              return {
                ...job,
                status: serverStatus,
                progress: serverStatus === 'ready' ? 100 : res.data.progress || (job.progress + 15 > 90 ? 90 : job.progress + 15),
                downloadUrl: serverStatus === 'ready' ? getDownloadExportUrl(job.id) : undefined,
                filename: res.data.filename || `gdt_vat_audit_export_${job.id}.csv`,
                errorMessage: res.data.error,
              };
            }
          } catch {
            // ignore network glitch during poll
          }
          return job;
        })
      );

      if (updated) {
        saveJobs(nextJobs);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [jobs]);

  if (!isOpen || !mounted) return null;

  const handleDispatchJob = async () => {
    try {
      setDispatching(true);
      const res = await queueTaxAuditApi({
        start_date: startDate,
        end_date: endDate,
        outlet_id: outletId,
      });

      if (res?.data?.export_id) {
        const newJob: ExportJob = {
          id: res.data.export_id,
          status: 'queued',
          progress: 10,
          startDate,
          endDate,
          queuedAt: new Date().toLocaleTimeString(),
        };

        saveJobs([newJob, ...jobs]);
        toast.success('Heavy GDT Tax Audit export dispatched to background queue!');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to dispatch async export job.');
    } finally {
      setDispatching(false);
    }
  };

  const handleClearCompleted = () => {
    const filtered = jobs.filter((j) => j.status === 'queued' || j.status === 'processing');
    saveJobs(filtered);
    toast.success('Cleared completed export records.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-end font-sans">
      <div className="w-full max-w-md h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  GDT Tax Audit Exports
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  Worker Queue
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Asynchronous background job spooler for large audit CSV files.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Dispatch Card */}
        <div className="p-5 bg-slate-50/80 border-b border-slate-200/80 space-y-3 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Audit Date Span:</span>
            <span className="font-mono font-bold text-slate-900">
              {startDate} &rarr; {endDate}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDispatchJob}
            disabled={dispatching}
            className="w-full py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs shadow-md shadow-brand/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${dispatching ? 'animate-spin' : ''}`} />
            <span>{dispatching ? 'Queuing Worker...' : 'Queue GDT Tax Audit Export'}</span>
          </button>
        </div>

        {/* Job Queue List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>EXPORT WORKER JOBS ({jobs.length})</span>
            {jobs.length > 0 && (
              <button
                type="button"
                onClick={handleClearCompleted}
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer text-[11px]"
              >
                Clear Completed
              </button>
            )}
          </div>

          {jobs.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                No active or recent tax export jobs. Click &quot;Queue GDT Tax Audit Export&quot; above to run a background job.
              </p>
            </div>
          ) : (
            jobs.map((job) => {
              const isReady = job.status === 'ready';
              const isProcessing = job.status === 'processing' || job.status === 'queued';
              const isError = job.status === 'error';

              return (
                <div
                  key={job.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="font-mono font-extrabold text-xs text-slate-900 block">
                        JOB #{job.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Period: {job.startDate} to {job.endDate} &bull; Queued: {job.queuedAt}
                      </span>
                    </div>

                    {isReady ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Ready
                      </span>
                    ) : isProcessing ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200 shrink-0 inline-flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                        Processing ({job.progress}%)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                        Failed
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isReady
                          ? 'bg-emerald-500'
                          : isError
                          ? 'bg-rose-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>

                  {/* Download Action */}
                  {isReady && job.downloadUrl && (
                    <a
                      href={job.downloadUrl}
                      download={job.filename || 'gdt_tax_audit.csv'}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer block text-center"
                    >
                      <Download className="w-3.5 h-3.5 inline" />
                      <span>Download Tax Audit CSV</span>
                    </a>
                  )}

                  {isError && (
                    <p className="text-[11px] text-rose-600 font-medium">
                      {job.errorMessage || 'Worker execution failed. Please retry.'}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            Compliant with GDT Prakas on VAT Invoicing &bull; Cambodia
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

