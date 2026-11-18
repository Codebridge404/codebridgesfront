/**
 * Author: Antigravity Team
 * Date: 2026-11-17
 * Task: BD-0161 - FIDO2 / WebAuthn Passkey Management & Step-Up Reauthentication Card
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  Fingerprint,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  Cloud,
} from 'lucide-react';
import {
  PasskeyCredentialItem,
  getPasskeysApi,
  getPasskeyRegistrationOptionsApi,
  verifyPasskeyRegistrationApi,
  renamePasskeyApi,
  deletePasskeyApi,
  getReauthOptionsApi,
  verifyReauthPasswordApi,
  verifyReauthPasskeyApi,
} from '@/lib/api/passkeys';
import {
  createPasskeyCredential,
  getPasskeyAssertion,
  isWebAuthnSupported,
} from '@/lib/webauthn';

type ReauthAction =
  | { type: 'enroll' }
  | { type: 'delete'; credential: PasskeyCredentialItem };

export function PasskeyManagerCard() {
  const [supported, setSupported] = useState(false);
  const [passkeys, setPasskeys] = useState<PasskeyCredentialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Rename state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  // Step-up reauth modal state
  const [pendingAction, setPendingAction] = useState<ReauthAction | null>(null);
  const [reauthPassword, setReauthPassword] = useState('');
  const [newPasskeyName, setNewPasskeyName] = useState('');
  const [reauthLoading, setReauthLoading] = useState(false);
  const [reauthError, setReauthError] = useState<string | null>(null);

  const loadPasskeys = async () => {
    try {
      setLoading(true);
      const res = await getPasskeysApi();
      setPasskeys(Array.isArray(res?.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.message || 'Could not load passkeys.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSupported(isWebAuthnSupported());
    loadPasskeys();
  }, []);

  const executeWithGrantToken = async (grantToken: string, action: ReauthAction) => {
    if (action.type === 'enroll') {
      const optRes = await getPasskeyRegistrationOptionsApi(grantToken);
      const { challenge_id, options } = optRes.data;
      const credential = await createPasskeyCredential(options);
      await verifyPasskeyRegistrationApi({
        challenge_id,
        name: newPasskeyName.trim() || 'My Device Passkey',
        id: credential.id,
        response: credential.response,
      });
      setSuccessMsg('New passkey registered successfully.');
      setNewPasskeyName('');
      await loadPasskeys();
    } else if (action.type === 'delete') {
      await deletePasskeyApi(action.credential.id, grantToken);
      setSuccessMsg(`Passkey "${action.credential.name || 'Device Passkey'}" revoked.`);
      await loadPasskeys();
    }
  };

  const handlePasswordReauthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingAction || !reauthPassword) return;

    setReauthLoading(true);
    setReauthError(null);
    setError(null);
    setSuccessMsg(null);

    const purpose = pendingAction.type === 'enroll' ? 'passkey_enrollment' : 'credential_management';
    try {
      const verifyRes = await verifyReauthPasswordApi(reauthPassword, purpose);
      const grantToken = verifyRes.data.grant_token;
      await executeWithGrantToken(grantToken, pendingAction);
      setPendingAction(null);
      setReauthPassword('');
    } catch (err: any) {
      setReauthError(err?.message || 'Verification failed.');
    } finally {
      setReauthLoading(false);
    }
  };

  const handlePasskeyReauth = async () => {
    if (!pendingAction) return;

    setReauthLoading(true);
    setReauthError(null);
    setError(null);
    setSuccessMsg(null);

    const purpose = pendingAction.type === 'enroll' ? 'passkey_enrollment' : 'credential_management';
    try {
      const optRes = await getReauthOptionsApi(purpose);
      const { challenge_id, passkey_options } = optRes.data;
      const assertion = await getPasskeyAssertion(passkey_options);
      const verifyRes = await verifyReauthPasskeyApi({
        challenge_id,
        purpose,
        id: assertion.id,
        response: assertion.response,
      });
      const grantToken = verifyRes.data.grant_token;
      await executeWithGrantToken(grantToken, pendingAction);
      setPendingAction(null);
      setReauthPassword('');
    } catch (err: any) {
      setReauthError(err?.message || 'Passkey verification failed.');
    } finally {
      setReauthLoading(false);
    }
  };

  const handleRenameSave = async (id: number) => {
    if (!editName.trim()) return;
    try {
      await renamePasskeyApi(id, editName.trim());
      setEditingId(null);
      await loadPasskeys();
    } catch (err: any) {
      setError(err?.message || 'Failed to rename passkey.');
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-brand-subtle text-brand border border-brand/20 flex items-center justify-center shadow-xs shrink-0">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Passkeys &amp; Biometric Login (FIDO2)</h2>
            <p className="text-xs text-slate-500 font-medium">
              Sign in passwordlessly using Touch ID, Face ID, Windows Hello, or hardware security keys.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={!supported}
          onClick={() => {
            setError(null);
            setSuccessMsg(null);
            setReauthError(null);
            setReauthPassword('');
            setNewPasskeyName('');
            setPendingAction({ type: 'enroll' });
          }}
          className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 inline-flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Passkey</span>
        </button>
      </div>

      {!supported && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Your current browser or context does not support WebAuthn Passkeys.</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Enrolled Passkeys List */}
      <div className="space-y-2.5">
        {loading ? (
          <p className="text-xs text-slate-400 font-medium py-2">Loading enrolled passkeys...</p>
        ) : passkeys.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-dashed border-slate-300 text-center text-xs text-slate-500">
            No passkeys enrolled yet. Add a passkey for faster, phishing-resistant sign-in.
          </div>
        ) : (
          passkeys.map((pk) => (
            <div
              key={pk.id}
              className="p-3.5 rounded-2xl bg-white/60 border border-slate-200/80 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  {editingId === pk.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRenameSave(pk.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-extrabold text-slate-900 truncate">
                        {pk.name || 'Device Passkey'}
                      </p>
                      {pk.backup_state && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">
                          <Cloud className="w-2.5 h-2.5" /> Synced
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500">
                    Added {new Date(pk.created_at).toLocaleDateString()}
                    {pk.last_used_at ? ` · Last used ${new Date(pk.last_used_at).toLocaleString()}` : ' · Never used'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(pk.id);
                    setEditName(pk.name || '');
                  }}
                  title="Rename passkey"
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReauthError(null);
                    setReauthPassword('');
                    setPendingAction({ type: 'delete', credential: pk });
                  }}
                  title="Revoke passkey"
                  className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Step-Up Reauthentication Modal */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">
                {pendingAction.type === 'enroll' ? 'Enroll New Passkey' : 'Confirm Passkey Removal'}
              </h3>
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {pendingAction.type === 'enroll'
                ? 'Verify your identity to generate a step-up security grant before registering a new passkey.'
                : `Verify your identity to permanently revoke "${pendingAction.credential.name || 'Device Passkey'}".`}
            </p>

            {reauthError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {reauthError}
              </div>
            )}

            <form onSubmit={handlePasswordReauthSubmit} className="space-y-3">
              {pendingAction.type === 'enroll' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Passkey Label</label>
                  <input
                    type="text"
                    value={newPasskeyName}
                    onChange={(e) => setNewPasskeyName(e.target.value)}
                    placeholder="e.g. MacBook Touch ID or iPhone Face ID"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  placeholder="Enter your password to confirm"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="submit"
                  disabled={reauthLoading || !reauthPassword}
                  className="w-full py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {reauthLoading
                    ? 'Verifying...'
                    : pendingAction.type === 'enroll'
                    ? 'Verify & Register Passkey'
                    : 'Verify & Revoke Passkey'}
                </button>

                {passkeys.length > 0 && (
                  <button
                    type="button"
                    onClick={handlePasskeyReauth}
                    disabled={reauthLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                  >
                    <Fingerprint className="w-4 h-4 text-brand" />
                    <span>Or Verify with Existing Passkey</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
