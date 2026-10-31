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
      <body className="min-h-full flex flex-col bg-canvas text-slate-800 relative selection:bg-brand selection:text-white" suppressHydrationWarning>
        <LaunchpadTechBackground />
        <AppProviders>{children}</AppProviders>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.warn('SW registration skipped:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
