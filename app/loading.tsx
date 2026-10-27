import { GlobalLoader } from '@/components/ui/GlobalLoader';

export default function RootLoading() {
  return (
    <GlobalLoader
      variant="fullscreen"
      text="Loading CodeBridges..."
      subtitle="Initializing enterprise cloud workspace and security context"
    />
  );
}
