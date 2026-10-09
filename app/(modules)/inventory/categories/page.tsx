import React from 'react';
import { Metadata } from 'next';
import { SuperAdminCategoriesView } from '@/components/catalog/categories';

export const metadata: Metadata = {
  title: 'Categories & Taxonomy | Inventory Hub',
  description: 'Manage product hierarchies, categories, and SKU taxonomies.',
};

export default function InventoryCategoriesPage() {
  return <SuperAdminCategoriesView />;
}
