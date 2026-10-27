import { GlobalLoader } from '@/components/ui/GlobalLoader';

export default function LaunchpadLoading() {
  return (
    <GlobalLoader
      variant="fullscreen"
      text="Loading Launchpad..."
      subtitle="Loading subscribed modules, service catalog, and tenant entitlements"
    />
  );
}
