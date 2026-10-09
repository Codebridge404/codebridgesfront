import { Metadata } from 'next';
import { PosTerminalView } from '@/components/pos';

export const metadata: Metadata = {
  title: 'Frontline Cashier Terminal | CodeBridges POS',
  description: 'Dedicated frontline checkout terminal for cashiers',
};

export default function CashierPosTerminalPage() {
  return <PosTerminalView />;
}
