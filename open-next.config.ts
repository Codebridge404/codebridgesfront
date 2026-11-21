/**
 * Author: Antigravity Team
 * Date: 2026-11-21
 * Task: BD-0173 - OpenNext Cloudflare Workers Adapter Configuration
 */
import { defineCloudflareConfig } from '@opennextjs/cloudflare';

const openNextConfig = {
  ...defineCloudflareConfig({}),
  buildCommand: 'npm run build:next',
};

export default openNextConfig;
