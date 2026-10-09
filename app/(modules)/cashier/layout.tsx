import React from 'react';

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800 select-none">
      {children}
    </div>
  );
}
