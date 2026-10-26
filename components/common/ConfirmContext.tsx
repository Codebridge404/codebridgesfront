'use client';

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { ConfirmDialog, ConfirmDialogProps } from './ConfirmDialog';

export type ConfirmOptions = Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>;

export interface ModuleConfirmOptions {
  moduleName: string;
  enable: boolean;
  orgName: string;
  logoUrl?: string;
  profileTitle?: string;
  actionType?: 'activate' | 'subscribe';
  customDetails?: { label: string; value: React.ReactNode }[];
}

export type BaseConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

export type ConfirmFn = BaseConfirmFn & {
  moduleToggle: (options: ModuleConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<BaseConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
  }>({
    isOpen: false,
    options: {
      title: '',
      description: '',
    },
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialogState({
        isOpen: true,
        options,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }, []);

  const handleConfirm = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <ConfirmDialog
        {...dialogState.options}
        isOpen={dialogState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    </ConfirmContext.Provider>
  );
}

/**
 * Standard confirmation helper for enabling/disabling modules across CodeBridges.
 */
export function confirmModuleToggle(
  confirmFn: BaseConfirmFn,
  options: ModuleConfirmOptions
): Promise<boolean> {
  const { moduleName, enable, orgName, logoUrl, profileTitle, actionType = 'activate', customDetails } = options;
  const isSubscribe = actionType === 'subscribe';

  const details: { label: string; value: React.ReactNode }[] = [
    { label: isSubscribe ? 'Business Suite' : 'Module Suite', value: moduleName },
  ];
  if (profileTitle) {
    details.push({ label: 'Operating Profile', value: profileTitle });
  }
  details.push(
    { label: isSubscribe ? 'Workspace Organization' : 'Workspace', value: orgName },
    {
      label: isSubscribe ? 'Target Status' : 'Target State',
      value: enable ? (isSubscribe ? 'Active / Subscribed' : 'Active Running') : 'Deactivated',
    }
  );
  if (customDetails && customDetails.length > 0) {
    details.push(...customDetails);
  }

  const title = isSubscribe
    ? (enable ? `Subscribe to ${moduleName}?` : `Unsubscribe from ${moduleName}?`)
    : (enable ? `Activate ${moduleName}?` : `Deactivate ${moduleName}?`);

  const description = isSubscribe
    ? (enable
        ? `Are you sure you want to enable ${moduleName} for "${orgName}"? Authorized team members will gain immediate access to this business service suite.`
        : `Are you sure you want to deactivate ${moduleName} for "${orgName}"? Active sessions and navigation for this module will be suspended.`)
    : (enable
        ? `Are you sure you want to enable ${moduleName} for "${orgName}"? Authorized team members will gain access immediately.`
        : `Are you sure you want to deactivate ${moduleName} for "${orgName}"? Module navigation will be suspended.`);

  const confirmText = isSubscribe
    ? (enable ? 'Confirm & Subscribe' : 'Confirm & Unsubscribe')
    : (enable ? 'Activate Module' : 'Deactivate Module');

  return confirmFn({
    title,
    description,
    variant: enable ? 'brand' : 'warning',
    logoUrl,
    confirmText,
    cancelText: 'Cancel',
    details,
  });
}

/**
 * Global useConfirm hook with both raw confirm and confirm.moduleToggle().
 */
export function useConfirm(): ConfirmFn {
  const rawConfirm = useContext(ConfirmContext);
  if (!rawConfirm) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }

  const moduleToggle = useCallback(
    (options: ModuleConfirmOptions) => confirmModuleToggle(rawConfirm, options),
    [rawConfirm]
  );

  const confirmFn = useCallback(
    (options: ConfirmOptions) => rawConfirm(options),
    [rawConfirm]
  ) as ConfirmFn;

  confirmFn.moduleToggle = moduleToggle;

  return confirmFn;
}

/**
 * Specialized hook to directly confirm module activation / deactivation.
 */
export function useModuleConfirm() {
  const confirm = useConfirm();
  return confirm.moduleToggle;
}
