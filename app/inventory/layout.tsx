'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  LayoutDashboard,
  Package,
  Warehouse,
  Truck,
  ShoppingCart,
  BarChart3,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { UniversalModuleLayout } from '@/components/module-shell';
import { getOutletsApi, getTransfersApi, getPurchaseOrdersApi } from '@/lib/api';

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  const [counts, setCounts] = useState({
    outlets: 1,
    activeTransfers: 0,
    activePos: 0,
  });

  useEffect(() => {
    async function loadLiveSidebarCounts() {
      try {
        const [outletsRes, transfersRes, posRes] = await Promise.allSettled([
          getOutletsApi(),
          getTransfersApi(),
          getPurchaseOrdersApi(),
        ]);

        const outletsList =
          outletsRes.status === 'fulfilled'
            ? Array.isArray(outletsRes.value)
              ? outletsRes.value
              : outletsRes.value?.data || []
            : [];
        const transfersList =
          transfersRes.status === 'fulfilled'
            ? Array.isArray(transfersRes.value)
              ? transfersRes.value
              : transfersRes.value?.data || []
            : [];
        const posList =
          posRes.status === 'fulfilled'
            ? Array.isArray(posRes.value)
              ? posRes.value
              : posRes.value?.data || []
            : [];

        const activeTransfers = transfersList.filter(
          (t: any) => t.status !== 'completed' && t.status !== 'received'
        ).length;
        const activePos = posList.filter(
          (p: any) => p.status !== 'completed' && p.status !== 'received'
        ).length;

        setCounts({
          outlets: Math.max(1, outletsList.length),
          activeTransfers,
          activePos,
        });
      } catch (err) {
        console.warn('Could not fetch sidebar counts:', err);
      }
    }

    loadLiveSidebarCounts();
  }, []);

  const inventorySidebarSections = [
    {
      items: [
        { label: 'Inventory Dashboard', href: '/inventory/dashboard', icon: LayoutDashboard },
        { label: 'Products & SKUs', href: '/inventory/products', icon: Package, badge: 'Live Catalog' },
      ],
    },
    {
      title: 'Warehousing & Supply Chain',
      items: [
        {
          label: 'Warehouse Stock Levels',
          href: '/inventory/stock-warehouses',
          icon: Warehouse,
          badge: `${counts.outlets} ${counts.outlets === 1 ? 'Hub' : 'Hubs'}`,
        },
        {
          label: 'Inter-Warehouse Transfers',
          href: '/inventory/transfers',
          icon: Truck,
          badge: counts.activeTransfers > 0 ? String(counts.activeTransfers) : undefined,
          badgeColor: 'bg-blue-100 text-blue-700',
        },
        {
          label: 'Purchase Orders (POs)',
          href: '/inventory/purchase-orders',
          icon: ShoppingCart,
          badge: counts.activePos > 0 ? String(counts.activePos) : undefined,
          badgeColor: 'bg-purple-100 text-purple-700',
        },
      ],
    },
    {
      title: 'Governance & Intelligence',
      items: [
        { label: 'Stock Valuation & Reports', href: '/inventory/reports', icon: BarChart3 },
        { label: 'Warehouse Access & RBAC', href: '/inventory/security', icon: ShieldCheck },
        { label: 'Inventory & Store Settings', href: '/inventory/settings', icon: Settings },
      ],
    },
  ];

  return (
    <UniversalModuleLayout
      currentModuleId="inventory"
      moduleTitle="Inventory & Supply Chain"
      moduleIcon={Boxes}
      moduleBadge="CORE"
      moduleBadgeColor="bg-emerald-100 text-emerald-800"
      sidebarSections={inventorySidebarSections}
    >
      {children}
    </UniversalModuleLayout>
  );
}
