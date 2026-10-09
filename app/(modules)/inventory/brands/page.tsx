import React from 'react';
import { Metadata } from 'next';
import { SuperAdminBrandsView } from '@/components/catalog/brands';

export const metadata: Metadata = {
  title: 'Brands Catalog | Inventory Hub',
  description: 'Manage manufacturer brands and product origin labeling.',
};

export default function InventoryBrandsPage() {
  return <SuperAdminBrandsView />;
}
