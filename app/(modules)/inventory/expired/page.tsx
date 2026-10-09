import React from 'react';
import { Metadata } from 'next';
import { SuperAdminExpiredView } from '@/components/inventory/expired';

export const metadata: Metadata = {
  title: 'Expired & Perishable Inventory | Inventory Hub',
  description: 'Monitor perishable batches, shelf expiration thresholds, and write-off disposal.',
};

export default function InventoryExpiredPage() {
  return <SuperAdminExpiredView />;
}
