/**
 * Author: Antigravity Team
 * Date: 2026-11-17
 * Task: BD-0161 - FIDO2 / WebAuthn Browser Ceremony Helper
 */

export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.credentials !== 'undefined'
  );
}

export function base64UrlToBuffer(base64url: string): ArrayBuffer {
  const padded = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const base64 = padded + '='.repeat(padLen);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function bufferToBase64Url(buffer: ArrayBuffer | ArrayBufferView): string {
  const bytes = buffer instanceof ArrayBuffer
    ? new Uint8Array(buffer)
    : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function createPasskeyCredential(serverOptions: any): Promise<{
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
    transports?: string[];
  };
}> {
  if (!isWebAuthnSupported()) {
    throw new Error('Passkeys (WebAuthn) are not supported by this browser.');
  }

  const publicKey: PublicKeyCredentialCreationOptions = {
    ...serverOptions,
    challenge: base64UrlToBuffer(serverOptions.challenge),
    user: {
      ...serverOptions.user,
      id: base64UrlToBuffer(serverOptions.user.id),
    },
    excludeCredentials: Array.isArray(serverOptions.excludeCredentials)
      ? serverOptions.excludeCredentials.map((cred: any) => ({
          ...cred,
          id: base64UrlToBuffer(cred.id),
        }))
      : [],
  };

  const credential = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential | null;
  if (!credential) {
    throw new Error('Passkey registration was cancelled or timed out.');
  }

  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      attestationObject: bufferToBase64Url(response.attestationObject),
      transports: typeof response.getTransports === 'function' ? response.getTransports() : undefined,
    },
  };
}

export async function getPasskeyAssertion(serverOptions: any): Promise<{
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle: string | null;
  };
}> {
  if (!isWebAuthnSupported()) {
    throw new Error('Passkeys (WebAuthn) are not supported by this browser.');
  }

  const publicKey: PublicKeyCredentialRequestOptions = {
    ...serverOptions,
    challenge: base64UrlToBuffer(serverOptions.challenge),
    allowCredentials: Array.isArray(serverOptions.allowCredentials)
      ? serverOptions.allowCredentials.map((cred: any) => ({
          ...cred,
          id: base64UrlToBuffer(cred.id),
        }))
      : undefined,
  };

  const credential = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential | null;
  if (!credential) {
    throw new Error('Passkey authentication was cancelled or timed out.');
  }

  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      authenticatorData: bufferToBase64Url(response.authenticatorData),
      signature: bufferToBase64Url(response.signature),
      userHandle: response.userHandle ? bufferToBase64Url(response.userHandle) : null,
    },
  };
}
