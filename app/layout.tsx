import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/common";

export const metadata: Metadata = {
  title: "CodeBridge@ — Multi-Tenant Enterprise Platform",
  description: "Unified Multi-Tenant Enterprise Cloud Suite — Launchpad, HRM, CRM, Financial Accounting, Inventory Logistics, Meeting Management (MMS) & Commerce",
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
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
