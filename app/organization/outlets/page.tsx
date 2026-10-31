'use client';

import React from 'react';
import { SuperAdminStoresView } from '@/components/security/stores';

export default function OrganizationOutletsPage() {
  return (
    <div className="space-y-6 w-full font-sans pb-10">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Store Outlets &amp; Hubs</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Manage physical store locations, warehouses, receipt headers, and branch credentials.
        </p>
      </div>

      <SuperAdminStoresView />
    </div>
  );
}
