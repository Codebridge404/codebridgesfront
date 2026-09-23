export * from './WorkspaceStaffDirectory';
export * from './WorkspaceStaffInviteSearch';
export * from './WorkspaceStaffCreateForm';

export const AVAILABLE_ROLES = [
  { value: 'cashier', label: 'Cashier (POS Operator)' },
  { value: 'supervisor', label: 'Shift Supervisor (Approvals & Voids)' },
  { value: 'outlet_manager', label: 'Store Manager (Store Ops)' },
  { value: 'inventory_clerk', label: 'Inventory Clerk (Stock & Transfers)' },
  { value: 'accountant', label: 'Accountant (Financials & Reports)' },
  { value: 'admin', label: 'Workspace Administrator' },
];
