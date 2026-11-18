/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: BD-0159
 */

import { ApiRequestLogsStudioView } from '@/components/telemetry';

export default function ApiRequestLogsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          API Request Traffic & Latency Telemetry
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Real-time performance monitoring, forensic request inspection, and gateway traffic diagnostics.
        </p>
      </div>

      <ApiRequestLogsStudioView />
    </div>
  );
}

