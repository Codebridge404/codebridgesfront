/**
 * Author: Antigravity Team
 * Date: 2026-11-05
 * Task: Resolve Media and User Avatar URLs across Hosting Environments (BD-0144)
 */

import { getApiUrl } from './api/client';

/**
 * Normalizes and resolves media/avatar URLs across local dev, Docker, and remote production hosting (e.g. Vercel).
 * 
 * Fixes the issue where images work on localhost but fail on server hosting:
 * 1. Resolves relative storage paths (/storage/avatars/...) to the remote backend origin.
 * 2. Rewrites obsolete localhost/127.0.0.1 URLs stored in databases to the live backend host.
 * 3. Preserves data: and blob: URLs without modification.
 */
export function resolveMediaUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // 1. Data URLs and Blobs are already self-contained
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Determine current backend origin (e.g., https://staging-codebridge-api.servicefixit.me)
  let backendOrigin = '';
  try {
    const apiUrl = getApiUrl();
    if (apiUrl) {
      const parsed = new URL(apiUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080');
      // Strip trailing /api/v1 or any subpath to get root origin
      backendOrigin = parsed.origin;
    }
  } catch {
    backendOrigin = '';
  }

  // 2. Relative storage paths (e.g. /storage/avatars/... or storage/avatars/...)
  if (trimmed.startsWith('/storage/') || trimmed.startsWith('storage/')) {
    const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    if (backendOrigin) {
      return `${backendOrigin}${normalizedPath}`;
    }
    return normalizedPath;
  }

  // Support optional dedicated MinIO / CDN storage URL override (e.g. https://storage.yourdomain.com)
  const storageOverride = process.env.NEXT_PUBLIC_STORAGE_URL || process.env.NEXT_PUBLIC_MINIO_URL || '';

  // 3. Handle localhost / 127.0.0.1 URLs when running on remote hosting (e.g. Vercel or live domain)
  const isHostedEnvironment =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !window.location.hostname.endsWith('.local');

  if (isHostedEnvironment) {
    try {
      const parsedUrl = new URL(trimmed);
      if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
        if (storageOverride) {
          const base = storageOverride.replace(/\/+$/, '');
          return `${base}${parsedUrl.pathname}${parsedUrl.search}`;
        }
        if (backendOrigin) {
          // If port was 9000 (MinIO standard port) and backend is on an IP address without HTTPS
          if (parsedUrl.port === '9000' && !backendOrigin.startsWith('https:')) {
            try {
              const bUrl = new URL(backendOrigin);
              return `${bUrl.protocol}//${bUrl.hostname}:9000${parsedUrl.pathname}${parsedUrl.search}`;
            } catch {
              // ignore
            }
          }
          return `${backendOrigin}${parsedUrl.pathname}${parsedUrl.search}`;
        }
      }
    } catch {
      // Not a valid URL, return trimmed as fallback
    }
  }

  return trimmed;
}

/**
 * Helper to extract initials for fallback user avatars.
 */
export function getUserInitials(name: string | null | undefined, fallback: string = 'US'): string {
  if (!name || typeof name !== 'string') return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

