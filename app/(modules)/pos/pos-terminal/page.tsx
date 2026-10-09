import { Metadata } from 'next';
import { PosTerminalView } from '@/components/pos';

export const metadata: Metadata = {
  title: 'POS Terminal | CodeBridges POS',
  description: 'Dedicated frontline checkout terminal and point of sale interface',
};

export default function PosTerminalPage() {
  return <PosTerminalView />;
}
