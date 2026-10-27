'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GlobalLoader } from '@/components/ui/GlobalLoader';

export interface LoadingContextValue {
  /** Whether global loader is currently active */
  isLoading: boolean;
  /** Active primary loading label */
  loadingText: string;
  /** Active secondary subtitle */
  loadingSubtitle?: string;
  /** Trigger global fullscreen loader */
  startLoading: (text?: string, subtitle?: string) => void;
  /** Dismiss global fullscreen loader */
  stopLoading: () => void;
  /** Wrap an async promise with global loading lifecycle */
  withLoading: <T>(promise: Promise<T>, text?: string, subtitle?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Loading CodeBridges...');
  const [loadingSubtitle, setLoadingSubtitle] = useState<string | undefined>(
    'Synchronizing enterprise services and workspace context'
  );

  const startLoading = useCallback(
    (text?: string, subtitle?: string) => {
      if (text) setLoadingText(text);
      if (subtitle !== undefined) setLoadingSubtitle(subtitle);
      setIsLoading(true);
    },
    []
  );

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(
    async <T,>(promise: Promise<T>, text?: string, subtitle?: string): Promise<T> => {
      startLoading(text, subtitle);
      try {
        const result = await promise;
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  const value = useMemo<LoadingContextValue>(
    () => ({
      isLoading,
      loadingText,
      loadingSubtitle,
      startLoading,
      stopLoading,
      withLoading,
    }),
    [isLoading, loadingText, loadingSubtitle, startLoading, stopLoading, withLoading]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999]"
          >
            <GlobalLoader
              variant="fullscreen"
              text={loadingText}
              subtitle={loadingSubtitle}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
}

/**
 * Access the CodeBridges Global Loading controller
 * Usage:
 *   const { startLoading, stopLoading, withLoading } = useLoading();
 */
export function useLoading(): LoadingContextValue {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
