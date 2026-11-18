/**
 * Author: Antigravity Team
 * Date: 2026-11-17
 * Task: BD-0161 - FIDO2 / WebAuthn Passkeys & Step-Up Reauthentication API Client
 */

import { apiFetch, setAuthToken, setRefreshToken, setAuthUser } from './client';

export interface PasskeyCredentialItem {
  id: number;
  credential_id: string;
  name: string | null;
  backup_eligible: boolean;
  backup_state: boolean;
  last_used_at: string | null;
  created_at: string;
}

export async function getPasskeysApi(): Promise<{
  status: string;
  data: PasskeyCredentialItem[];
  total: number;
}> {
  return apiFetch('/auth/passkeys');
}

export async function getPasskeyRegistrationOptionsApi(grantToken: string): Promise<{
  status: string;
  data: {
    challenge_id: string;
    options: any;
  };
}> {
  return apiFetch('/auth/passkeys/registration/options', {
    method: 'POST',
    headers: {
      'X-Grant-Token': grantToken,
    },
    body: JSON.stringify({ grant_token: grantToken }),
  });
}

export async function verifyPasskeyRegistrationApi(payload: {
  challenge_id: string;
  name?: string;
  id: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
    transports?: string[];
  };
}) {
  return apiFetch('/auth/passkeys/registration/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getPasskeyAuthOptionsApi(email?: string): Promise<{
  status: string;
  data: {
    challenge_id: string;
    options: any;
  };
}> {
  return apiFetch('/auth/passkeys/authentication/options', {
    method: 'POST',
    body: JSON.stringify(email ? { email } : {}),
  });
}

export async function verifyPasskeyAuthApi(payload: {
  challenge_id: string;
  device_name?: string;
  id: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string | null;
  };
}) {
  const res = await apiFetch('/auth/passkeys/authentication/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const authToken = res?.token || res?.access_token || res?.data?.access_token;
  const refreshToken = res?.refresh_token || res?.data?.refresh_token;
  const user = res?.user || res?.data?.user;

  if (authToken) {
    setAuthToken(authToken);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    if (user) {
      setAuthUser(user);
    }
    if (typeof window !== 'undefined') {
      const orgName = user?.tenant_name || user?.company_name;
      if (orgName) {
        localStorage.setItem('active_org', orgName);
        window.dispatchEvent(new CustomEvent('cb_org_changed', { detail: { orgName } }));
      }
    }
  }

  return res;
}

export async function renamePasskeyApi(credentialId: number | string, name: string) {
  return apiFetch(`/auth/passkeys/${credentialId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function deletePasskeyApi(credentialId: number | string, grantToken: string) {
  return apiFetch(`/auth/passkeys/${credentialId}`, {
    method: 'DELETE',
    headers: {
      'X-Grant-Token': grantToken,
    },
    body: JSON.stringify({ grant_token: grantToken }),
  });
}

export async function getReauthOptionsApi(purpose: 'passkey_enrollment' | 'credential_management' | 'security_action') {
  return apiFetch('/auth/reauthenticate/options', {
    method: 'POST',
    body: JSON.stringify({ purpose }),
  });
}

export async function verifyReauthPasswordApi(
  password: string,
  purpose: 'passkey_enrollment' | 'credential_management' | 'security_action'
): Promise<{
  status: string;
  data: {
    purpose: string;
    grant_token: string;
    expires_in: number;
  };
}> {
  return apiFetch('/auth/reauthenticate/verify', {
    method: 'POST',
    body: JSON.stringify({ password, purpose }),
  });
}

export async function verifyReauthPasskeyApi(
  payload: {
    challenge_id: string;
    purpose: 'passkey_enrollment' | 'credential_management' | 'security_action';
    id: string;
    response: {
      clientDataJSON: string;
      authenticatorData: string;
      signature: string;
      userHandle?: string | null;
    };
  }
) {
  return apiFetch('/auth/reauthenticate/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
