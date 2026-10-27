import { GlobalLoader } from '@/components/ui/GlobalLoader';

export default function ModulesLoading() {
  return (
    <GlobalLoader
      variant="fullscreen"
      text="Loading Workspace Module..."
      subtitle="Connecting to real-time operations engine and tenant permissions"
    />
  );
}
