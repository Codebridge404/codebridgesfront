import React from 'react';
import { Metadata } from 'next';
import { SuperAdminSuppliersView } from '@/components/crm/suppliers';

export const metadata: Metadata = {
  title: 'Suppliers & Vendors Directory | Inventory Hub',
  description: 'Manage procurement vendors, supply partners, and contact profiles.',
};

export default function InventorySuppliersPage() {
  return <SuperAdminSuppliersView />;
}
