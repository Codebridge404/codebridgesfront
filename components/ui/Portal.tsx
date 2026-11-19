/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React, { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children: React.ReactNode;
}

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Renders children directly into `document.body` so full-screen modals, drawers,
 * dialogs, and backdrop blur overlays escape any ancestor `transform`,
 * `backdrop-filter`, `overflow`, or `space-y-*` containing/stacking contexts
 * and span 100% of the viewport edge-to-edge.
 */
export function Portal({ children }: PortalProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!isClient) return null;

  return createPortal(children, document.body);
}
