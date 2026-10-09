'use client';

import { useState } from 'react';

export interface PosCustomer {
  id: string | number;
  name: string;
  phone?: string;
  loyalty_points?: number;
  store_credit?: number;
  email?: string;
}

export interface PosTable {
  id: string | number;
  name: string;
  zone?: string;
  capacity?: number;
  status?: string;
}

export function usePosCustomerAndTable() {
  const [selectedCustomer, setSelectedCustomer] = useState<PosCustomer | null>(null);
  const [selectedTable, setSelectedTable] = useState<PosTable | null>(null);
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');

  const resetCustomerAndTable = () => {
    setSelectedCustomer(null);
    setSelectedTable(null);
    setOrderType('dine_in');
  };

  return {
    selectedCustomer,
    setSelectedCustomer,
    selectedTable,
    setSelectedTable,
    orderType,
    setOrderType,
    resetCustomerAndTable,
  };
}
