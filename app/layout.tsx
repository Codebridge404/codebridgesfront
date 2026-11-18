/**
 * Author: Antigravity Team
 * Date: 2026-11-05
 * Task: BD-0138
 */

import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/common";
import { LaunchpadTechBackground } from "@/components/launchpad/LaunchpadTechBackground";

export const metadata: Metadata = {
  title: "CodeBridge@",
  description: "Unified Multi-Tenant Enterprise Cloud Suite — Launchpad, HRM, CRM, Financial Accounting, Inventory Logistics, Meeting Management (MMS) & Commerce",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo/Codebridge.svg", type: "image/svg+xml" },
      { url: "/logo/Codebridge.png", type: "image/png" },
    ],
    shortcut: "/logo/Codebridge.svg",
    apple: "/logo/Codebridge.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col text-slate-800 dark:text-slate-100 relative selection:bg-brand selection:text-white" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var raw = localStorage.getItem('cb_user_preferences');
                if (raw) {
                  var p = JSON.parse(raw);
                  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (p.theme === 'dark' || (p.theme === 'system' && prefersDark)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.style.colorScheme = 'light';
                    if (p.lightBgColor) {
                      document.documentElement.style.setProperty('--color-light-bg', p.lightBgColor);
                      document.documentElement.style.setProperty('--color-canvas', p.lightBgColor);
                    }
                  }
                  if (p.highContrast) document.documentElement.classList.add('high-contrast');
                  if (p.fontSize) document.documentElement.setAttribute('data-font-size', p.fontSize);
                  document.documentElement.setAttribute('data-canvas-style', p.canvasStyle || 'mesh');
                  if (p.accentColor) document.documentElement.style.setProperty('--color-brand', p.accentColor);
                } else {
                  document.documentElement.setAttribute('data-canvas-style', 'mesh');
                }
              } catch (e) {}
            `,
          }}
        />
        <LaunchpadTechBackground />
        <AppProviders>{children}</AppProviders>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  // In local development, unregister service workers to prevent dev server / HMR loops
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (var r of registrations) {
                      r.unregister();
                    }
                  });
                  if ('caches' in window) {
                    caches.keys().then(function(keys) {
                      for (var k of keys) {
                        caches.delete(k);
                      }
                    });
                  }
                } else {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').catch(function(err) {
                      console.warn('SW registration skipped:', err);
                    });
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
