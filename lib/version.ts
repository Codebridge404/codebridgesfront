import pkg from '../package.json';

/**
 * Authoritative Platform Version — Single Source of Truth
 * Derived from package.json ("1.0.0") or NEXT_PUBLIC_APP_VERSION environment override.
 */
export const SYSTEM_VERSION: string = process.env.NEXT_PUBLIC_APP_VERSION || pkg.version || '1.0.0';
export const SYSTEM_VERSION_DISPLAY: string = `v${SYSTEM_VERSION}`;

