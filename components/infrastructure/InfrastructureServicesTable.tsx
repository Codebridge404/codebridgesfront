'use client';

import React, { useState } from 'react';
import { Server, CheckCircle2, AlertTriangle, XCircle, Cpu, HardDrive } from 'lucide-react';
import { ServiceStatus } from './types';

interface InfrastructureServicesTableProps {
  services: ServiceStatus[];
}

export function InfrastructureServicesTable({ services }: InfrastructureServicesTableProps) {
  const [filterScope, setFilterScope] = useState<'all' | 'auth' | 'operations' | 'infra'>('all');

  const filteredServices = services.filter((s) => {
    if (filterScope === 'auth') return s.id.includes('auth');
    if (filterScope === 'operations') return s.id.includes('operations');
    if (filterScope === 'infra') return s.id.includes('gateway') || s.id.includes('minio');
    return true;
  });

  return (
    <div className="bg-white/50 backdrop-blur-2xl backdrop-saturate-180 rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(31,38,135,0.05)] overflow-hidden space-y-2 p-1">
      {/* Scope Sub-filter */}
      <div className="p-3 pb-1 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All Services', count: services.length },
            { id: 'auth', label: 'Auth Subsystem', count: services.filter((s) => s.id.includes('auth')).length },
            { id: 'operations', label: 'Operations Subsystem', count: services.filter((s) => s.id.includes('operations')).length },
            { id: 'infra', label: 'Gateway & Storage', count: services.filter((s) => s.id.includes('gateway') || s.id.includes('minio')).length },
          ].map((scope) => (
            <button
              key={scope.id}
              type="button"
              onClick={() => setFilterScope(scope.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterScope === scope.id
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-white/60 hover:bg-white text-slate-700 border border-white/80'
              }`}
            >
              <span>{scope.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  filterScope === scope.id ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-700'
                }`}
              >
                {scope.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/70 bg-white/40 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3.5">Service Node</th>
              <th className="px-5 py-3.5">Subsystem Scope</th>
              <th className="px-5 py-3.5">Docker Container</th>
              <th className="px-5 py-3.5">Round-Trip Latency</th>
              <th className="px-5 py-3.5">Memory &amp; CPU Footprint</th>
              <th className="px-5 py-3.5">Active Pool</th>
              <th className="px-5 py-3.5 text-right">Node Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/50 text-xs font-semibold text-slate-700">
            {filteredServices.map((s) => {
              const isHealthy = s.status === 'healthy';
              const isDegraded = s.status === 'degraded';

              const isAuth = s.id.includes('auth');
              const isOps = s.id.includes('operations');

              return (
                <tr key={s.id} className="hover:bg-white/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/70 border border-white/90 text-brand flex items-center justify-center font-bold shadow-2xs backdrop-blur-md shrink-0">
                        <Server className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 truncate">{s.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">Port :{s.port} &bull; {s.version}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${
                        isAuth
                          ? 'bg-blue-50/80 text-blue-700 border-blue-200/80'
                          : isOps
                          ? 'bg-purple-50/80 text-purple-700 border-purple-200/80'
                          : 'bg-slate-100/80 text-slate-700 border-slate-200/60'
                      }`}
                    >
                      {s.service || (isAuth ? 'Auth Service' : isOps ? 'Operations Service' : 'Platform Infra')}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                    <span className="px-2 py-0.5 rounded-lg bg-white/60 border border-white/80 text-slate-700 text-[10px] font-semibold">
                      {s.container}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`font-mono font-extrabold px-2 py-0.5 rounded-lg text-xs ${
                        s.latency <= 15
                          ? 'text-emerald-700 bg-emerald-50/80 border border-emerald-200/60'
                          : s.latency <= 50
                          ? 'text-amber-700 bg-amber-50/80 border border-amber-200/60'
                          : 'text-rose-700 bg-rose-50/80 border border-rose-200/60'
                      }`}
                    >
                      {s.latency} ms
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{s.memory}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-slate-300 shrink-0" />
                        <span>CPU: {s.cpu}</span>
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 font-bold text-slate-800 font-mono">
                    {s.connections} <span className="text-[10px] font-normal text-slate-400 font-sans">threads</span>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase border inline-flex items-center gap-1.5 backdrop-blur-md ${
                        isHealthy
                          ? 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80 shadow-2xs'
                          : isDegraded
                          ? 'bg-amber-50/90 text-amber-700 border-amber-200/80 shadow-2xs'
                          : 'bg-rose-50/90 text-rose-700 border-rose-200/80 shadow-2xs'
                      }`}
                    >
                      {isHealthy ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Online</span>
                        </>
                      ) : isDegraded ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Degraded</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Offline</span>
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
