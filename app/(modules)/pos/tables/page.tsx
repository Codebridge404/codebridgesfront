import React from 'react';
import { Metadata } from 'next';
import { PosTablesFloorPlanView } from '@/components/pos/tables/PosTablesFloorPlanView';

export const metadata: Metadata = {
  title: 'Restaurant Tables & Floor Plan | CodeBridges POS',
  description: 'Manage restaurant tables, floor plan zones, and live dining occupancy.',
};

export default function PosTablesPage() {
  return <PosTablesFloorPlanView />;
}
