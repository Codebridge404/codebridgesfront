import { Crown, Store, User } from 'lucide-react';

export interface TenantOwner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  company_code: string;
  client_tier: 'free_personal' | 'business_runner' | 'enterprise_org';
  status: 'active' | 'suspended' | 'trial' | 'expired';
  email: string;
  phone: string;
  address: string;
  max_outlets: number;
  max_registers: number;
  max_users: number;
  trial_ends_at: string | null;
  created_at: string;
  owner?: TenantOwner | null;
  users_count?: number;
  outlets_count?: number;
  subscription?: {
    plan_name: string;
    price: number;
    billing_cycle: string;
    status: string;
    expires_at: string | null;
  };
  enabled_modules?: string[] | string | null;
}

export const TIER_CONFIG = {
  enterprise_org: {
    label: 'Enterprise',
    icon: Crown,
    color: 'bg-brand-subtle text-brand border-brand/20',
    badgeColor: 'bg-brand-subtle text-brand',
    dotColor: 'bg-brand',
  },
  business_runner: {
    label: 'Business Runner',
    icon: Store,
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    badgeColor: 'bg-amber-100 text-amber-800',
    dotColor: 'bg-amber-500',
  },
  free_personal: {
    label: 'Personal',
    icon: User,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeColor: 'bg-slate-100 text-slate-700',
    dotColor: 'bg-slate-400',
  },
};

export const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  trial: { label: 'Trial', color: 'bg-brand-subtle text-brand border-brand/20' },
  suspended: { label: 'Suspended', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  expired: { label: 'Expired', color: 'bg-amber-50 text-amber-800 border-amber-200' },
};

export interface TenantStats {
  total: number;
  active: number;
  trial: number;
  suspended: number;
  enterprise_org: number;
  business_runner: number;
  free_personal: number;
}

export interface TenantEditFormData {
  name: string;
  client_tier: string;
  status: string;
  email: string;
  phone: string;
  address: string;
  max_outlets: number;
  max_registers: number;
  max_users: number;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
}

