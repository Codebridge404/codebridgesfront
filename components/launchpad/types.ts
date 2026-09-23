import {
  Boxes,
  Users,
  DollarSign,
  Briefcase,
  Store,
  Activity,
  Zap,
} from 'lucide-react';

export interface CatalogModule {
  id: string;
  name: string;
  monogram: string;
  category: string;
  description: string;
  bgPill: string;
  icon: any;
  logoUrl?: string;
  href: string;
  isCore?: boolean;
}

export const CATALOG_MODULES: CatalogModule[] = [
  {
    id: 'pos-management',
    name: 'POS Management',
    monogram: 'POS',
    category: 'Core Commerce & Operations',
    description: 'Unified Cashier Terminal, Till Shifts & Float Auditing, Multi-Warehouse Stock, Kitchen Display (KDS) & Customer Display (CFD).',
    bgPill: 'bg-brand-subtle text-brand',
    icon: Store,
    logoUrl: '/module/pos.svg',
    href: '/pos/dashboard',
    isCore: false,
  },
  {
    id: 'inventory-suite',
    name: 'Inventory & Stock Logistics',
    monogram: 'IV',
    category: 'Supply Chain & Warehousing',
    description: 'Real-time multi-warehouse stock levels, transfers, safety buffers, supplier purchase orders, and stocktakes.',
    bgPill: 'bg-emerald-50 text-emerald-700',
    icon: Boxes,
    logoUrl: '/module/invetory.svg',
    href: '/inventory',
  },
  {
    id: 'staff-hrm',
    name: 'HRM, Staff & Payroll',
    monogram: 'HR',
    category: 'Workforce Management',
    description: 'Staff headcount directory, 4-digit POS register PIN quick-switch, timesheets, and payroll.',
    bgPill: 'bg-rose-50 text-rose-600',
    icon: Users,
    logoUrl: '/module/hr.svg',
    href: '/hrm',
  },
  {
    id: 'crm-loyalty',
    name: 'Customer CRM & Loyalty',
    monogram: 'CR',
    category: 'Customer Growth',
    description: 'Customer contact directory, wholesale B2B contracts, VIP loyalty points, and purchase history.',
    bgPill: 'bg-blue-50 text-blue-600',
    icon: Briefcase,
    logoUrl: '/module/management.svg',
    href: '/crm',
  },
  {
    id: 'financial-management',
    name: 'Financial & Accounting',
    monogram: 'FN',
    category: 'Financial Operations & Ledgers',
    description: 'General Ledger, Chart of Accounts (COA), Accounts Receivable (AR), Accounts Payable (AP), bank reconciliations, and P&L.',
    bgPill: 'bg-emerald-50 text-emerald-700',
    icon: DollarSign,
    logoUrl: '/module/financial.svg',
    href: '/financial',
  },
  {
    id: 'bill-subscription',
    name: 'Bill & SaaS Subscription',
    monogram: 'BS',
    category: 'Finance & Billing',
    description: 'Automate recurring customer invoices, subscription quotas, and failed payment retry webhooks.',
    bgPill: 'bg-slate-100 text-slate-900',
    icon: Zap,
    logoUrl: '/module/subscription.svg',
    href: '/super-admin/finance/billing',
  },
  {
    id: 'telemetry-hub',
    name: 'Platform Infrastructure Hub',
    monogram: 'TM',
    category: 'Platform Operations',
    description: 'Real-time microservices latency monitoring, connection pools, RabbitMQ, and Redis cache telemetry.',
    bgPill: 'bg-indigo-50 text-indigo-700',
    icon: Activity,
    href: '/super-admin/infrastructure',
  },
];
