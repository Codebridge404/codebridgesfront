'use client';

import React from 'react';
import { MeetingTelegramSettings } from '@/components/meetings/MeetingTelegramSettings';

export function TelegramSettingsTab() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200/60">
        <h2 className="text-base font-extrabold text-slate-900">Telegram Bot &amp; Webhook Alerts</h2>
        <p className="text-xs text-slate-500">
          Configure Telegram bot tokens and chat webhooks for automated order dispatch notifications, shift summaries, and meeting governance
        </p>
      </div>

      <MeetingTelegramSettings />
    </div>
  );
}
