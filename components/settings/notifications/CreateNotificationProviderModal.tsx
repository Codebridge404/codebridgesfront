/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: Unified Multi-Tenant Notification Providers Studio (BD-0157)
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Mail,
  Send,
  Webhook,
  MessageSquare,
  Shield,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  NotificationProviderItem,
  NotificationChannel,
  NotificationEnvironment,
  CreateNotificationProviderPayload,
  createNotificationProviderApi,
  updateNotificationProviderApi,
} from '@/lib/api/notificationProviders';

interface CreateNotificationProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  providerToEdit?: NotificationProviderItem | null;
  isSuperAdmin?: boolean;
}

const CHANNELS: {
  id: NotificationChannel;
  name: string;
  defaultProvider: string;
  icon: any;
  color: string;
}[] = [
  {
    id: 'telegram',
    name: 'Telegram Bot',
    defaultProvider: 'telegram_bot',
    icon: Send,
    color: 'text-sky-600 bg-sky-50 border-sky-200',
  },
  {
    id: 'email',
    name: 'Email (SMTP)',
    defaultProvider: 'smtp',
    icon: Mail,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    id: 'slack',
    name: 'Slack Alerts',
    defaultProvider: 'slack_webhook',
    icon: Bell,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    id: 'webhook',
    name: 'Custom Webhook',
    defaultProvider: 'custom_webhook',
    icon: Webhook,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'sms',
    name: 'SMS Gateway',
    defaultProvider: 'plasgate',
    icon: MessageSquare,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
];

const ENVIRONMENTS: { id: NotificationEnvironment; label: string }[] = [
  { id: 'all', label: 'All Environments' },
  { id: 'production', label: 'Production' },
  { id: 'staging', label: 'Staging' },
  { id: 'demo', label: 'Demo' },
  { id: 'development', label: 'Development' },
];

export function CreateNotificationProviderModal({
  isOpen,
  onClose,
  onSuccess,
  providerToEdit,
  isSuperAdmin = false,
}: CreateNotificationProviderModalProps) {
  const isEditing = Boolean(providerToEdit);

  const [name, setName] = useState('');
  const [channel, setChannel] = useState<NotificationChannel>('telegram');
  const [provider, setProvider] = useState('telegram_bot');
  const [environment, setEnvironment] = useState<NotificationEnvironment>('all');
  const [isEnabled, setIsEnabled] = useState(true);
  const [tenantId, setTenantId] = useState<string>('');

  // Channel-specific credentials
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');

  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpEncryption, setSmtpEncryption] = useState('tls');
  const [smtpFromAddress, setSmtpFromAddress] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('');

  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [slackChannel, setSlackChannel] = useState('');

  const [smsApiKey, setSmsApiKey] = useState('');
  const [smsApiSecret, setSmsApiSecret] = useState('');
  const [smsSenderId, setSmsSenderId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (providerToEdit) {
      setName(providerToEdit.name || '');
      setChannel(providerToEdit.channel || 'telegram');
      setProvider(providerToEdit.provider || 'telegram_bot');
      setEnvironment(providerToEdit.environment || 'all');
      setIsEnabled(providerToEdit.is_enabled ?? true);
      setTenantId(providerToEdit.tenant_id ? String(providerToEdit.tenant_id) : '');
      // Note: Masked credentials are encrypted server-side; user enters new credentials only when rotating
    } else {
      setName('');
      setChannel('telegram');
      setProvider('telegram_bot');
      setEnvironment('all');
      setIsEnabled(true);
      setTenantId('');
      setTelegramToken('');
      setTelegramChatId('');
      setSmtpHost('');
      setSmtpPort('587');
      setSmtpUsername('');
      setSmtpPassword('');
      setSmtpEncryption('tls');
      setSmtpFromAddress('');
      setSmtpFromName('');
      setWebhookUrl('');
      setWebhookSecret('');
      setSlackChannel('');
      setSmsApiKey('');
      setSmsApiSecret('');
      setSmsSenderId('');
    }
    setError(null);
  }, [providerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChannelSelect = (ch: NotificationChannel) => {
    setChannel(ch);
    const def = CHANNELS.find((c) => c.id === ch);
    if (def) setProvider(def.defaultProvider);
  };

  const buildCredentials = (): Record<string, any> => {
    switch (channel) {
      case 'telegram':
        return {
          bot_token: telegramToken.trim(),
          chat_id: telegramChatId.trim(),
        };
      case 'email':
        return {
          host: smtpHost.trim(),
          port: parseInt(smtpPort, 10) || 587,
          username: smtpUsername.trim(),
          password: smtpPassword,
          encryption: smtpEncryption,
          from_address: smtpFromAddress.trim(),
          from_name: smtpFromName.trim() || undefined,
        };
      case 'slack':
        return {
          webhook_url: webhookUrl.trim(),
          channel: slackChannel.trim() || undefined,
        };
      case 'webhook':
        return {
          webhook_url: webhookUrl.trim(),
          secret: webhookSecret.trim() || undefined,
        };
      case 'sms':
        return {
          api_key: smsApiKey.trim(),
          api_secret: smsApiSecret.trim(),
          sender_id: smsSenderId.trim() || undefined,
        };
      default:
        return {};
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Provider name is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const credentials = buildCredentials();

      if (isEditing && providerToEdit) {
        // Only submit credentials if user typed something
        const payload: Partial<CreateNotificationProviderPayload> = {
          name: name.trim(),
          channel,
          provider: provider.trim(),
          environment,
          is_enabled: isEnabled,
        };
        const hasCredentials = Object.values(credentials).some((v) => Boolean(v));
        if (hasCredentials) {
          payload.credentials = credentials;
        }
        if (isSuperAdmin && tenantId) {
          payload.tenant_id = parseInt(tenantId, 10) || null;
        }
        await updateNotificationProviderApi(providerToEdit.id, payload);
      } else {
        const payload: CreateNotificationProviderPayload = {
          name: name.trim(),
          channel,
          provider: provider.trim(),
          environment,
          credentials,
          is_enabled: isEnabled,
          tenant_id: isSuperAdmin && tenantId ? parseInt(tenantId, 10) : undefined,
        };
        await createNotificationProviderApi(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to save notification provider configuration.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-subtle border border-brand/20 flex items-center justify-center text-brand">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {isEditing ? 'Configure Notification Provider' : 'Connect Notification Provider'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Register encrypted dispatch channels for system alerts, receipts, and security events.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Validation Error</p>
                <p className="mt-0.5 opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2">
              Notification Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CHANNELS.map((ch) => {
                const Icon = ch.icon;
                const isSelected = channel === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleChannelSelect(ch.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-brand bg-brand-subtle ring-2 ring-brand/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center border text-xs font-bold ${ch.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">{ch.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium capitalize">
                        {ch.defaultProvider}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">
                Provider Name / Identifier *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Operations Telegram Bot"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">
                Target Environment
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as NotificationEnvironment)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
              >
                {ENVIRONMENTS.map((env) => (
                  <option key={env.id} value={env.id}>
                    {env.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Super Admin Tenant Override */}
          {isSuperAdmin && (
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">
                Tenant Scoping (Super Admin Global or Tenant ID)
              </label>
              <input
                type="text"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                placeholder="Leave blank for platform-global dispatcher"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
              />
            </div>
          )}

          {/* Channel Specific Credentials */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800">
              <Shield className="w-4 h-4 text-brand" />
              <span>AES-256 Encrypted Channel Credentials</span>
            </div>

            {isEditing && (
              <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                Credentials are encrypted. Leave fields blank to keep existing configured keys.
              </p>
            )}

            {channel === 'telegram' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Telegram Bot Token *
                  </label>
                  <input
                    type="password"
                    required={!isEditing}
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                    placeholder="7823456789:AAHq..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Default Chat ID or Channel Username *
                  </label>
                  <input
                    type="text"
                    required={!isEditing}
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="-100123456789 or @company_alerts"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </div>
              </div>
            )}

            {channel === 'email' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      SMTP Host *
                    </label>
                    <input
                      type="text"
                      required={!isEditing}
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.mailgun.org"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Port</label>
                    <input
                      type="text"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="587"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Username / API User
                    </label>
                    <input
                      type="text"
                      value={smtpUsername}
                      onChange={(e) => setSmtpUsername(e.target.value)}
                      placeholder="postmaster@company.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Password / Secret
                    </label>
                    <input
                      type="password"
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      From Address *
                    </label>
                    <input
                      type="email"
                      required={!isEditing}
                      value={smtpFromAddress}
                      onChange={(e) => setSmtpFromAddress(e.target.value)}
                      placeholder="notifications@codebridge.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={smtpFromName}
                      onChange={(e) => setSmtpFromName(e.target.value)}
                      placeholder="CodeBridges Engine"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>
                </div>
              </div>
            )}

            {(channel === 'slack' || channel === 'webhook') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Webhook Destination URL *
                  </label>
                  <input
                    type="url"
                    required={!isEditing}
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.slack.com/services/... or https://api.endpoint.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </div>
                {channel === 'webhook' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Shared Secret Signature Token
                    </label>
                    <input
                      type="password"
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                      placeholder="whsec_..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>
                )}
              </div>
            )}

            {channel === 'sms' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      API Key *
                    </label>
                    <input
                      type="password"
                      required={!isEditing}
                      value={smsApiKey}
                      onChange={(e) => setSmsApiKey(e.target.value)}
                      placeholder="api_key_..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      API Secret
                    </label>
                    <input
                      type="password"
                      value={smsApiSecret}
                      onChange={(e) => setSmsApiSecret(e.target.value)}
                      placeholder="api_secret_..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Sender ID (Alphanumeric Mask)
                  </label>
                  <input
                    type="text"
                    value={smsSenderId}
                    onChange={(e) => setSmsSenderId(e.target.value)}
                    placeholder="CODEBRIDGE"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Active Status Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_enabled_toggle"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="w-4 h-4 rounded-sm border-slate-300 text-brand focus:ring-brand/20 cursor-pointer"
            />
            <label htmlFor="is_enabled_toggle" className="text-xs font-bold text-slate-700 cursor-pointer">
              Enable provider immediately for real-time dispatching
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Save Changes' : 'Register Provider'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

