import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/organization',
        destination: '/organization/dashboard',
        permanent: false,
      },
      {
        source: '/inventory',
        destination: '/inventory/dashboard',
        permanent: false,
      },
      {
        source: '/pos',
        destination: '/pos/dashboard',
        permanent: false,
      },
      {
        source: '/pos/terminal',
        destination: '/pos/pos-terminal',
        permanent: false,
      },
      {
        source: '/pos/checkout-register',
        destination: '/pos/pos-terminal',
        permanent: false,
      },
      {
        source: '/pos/access',
        destination: '/organization/security',
        permanent: false,
      },
      {
        source: '/pos/security',
        destination: '/organization/security',
        permanent: false,
      },
      {
        source: '/pos/kds',
        destination: '/pos/kitchen-display',
        permanent: false,
      },
      {
        source: '/kds',
        destination: '/pos/kitchen-display',
        permanent: false,
      },
      {
        source: '/pos/stock',
        destination: '/inventory/stock-warehouses',
        permanent: false,
      },
      {
        source: '/pos/stock-warehouses',
        destination: '/inventory/stock-warehouses',
        permanent: false,
      },
      {
        source: '/pos/transfers',
        destination: '/inventory/transfers',
        permanent: false,
      },
      {
        source: '/pos/purchase-orders',
        destination: '/inventory/purchase-orders',
        permanent: false,
      },
      {
        source: '/super-admin',
        destination: '/super-admin/dashboard',
        permanent: false,
      },
      {
        source: '/hrm',
        destination: '/hrm/dashboard',
        permanent: false,
      },
      {
        source: '/accounting',
        destination: '/financial/dashboard',
        permanent: false,
      },
      {
        source: '/financial',
        destination: '/financial/dashboard',
        permanent: false,
      },
      {
        source: '/CodeBridgesOnboardingLaunchpad',
        destination: '/launchpad',
        permanent: false,
      },
      {
        source: '/inventory/checkout-register',
        destination: '/pos/pos-terminal',
        permanent: false,
      },
      {
        source: '/inventory/customer-display',
        destination: '/pos/customer-display',
        permanent: false,
      },
      {
        source: '/inventory/kitchen-display',
        destination: '/pos/kitchen-display',
        permanent: false,
      },
      {
        source: '/inventory/orders',
        destination: '/pos/orders',
        permanent: false,
      },
      {
        source: '/inventory/shifts',
        destination: '/pos/shifts',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
