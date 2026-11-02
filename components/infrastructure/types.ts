export interface ServiceStatus {
  id: string;
  name: string;
  service?: string;
  port: number;
  container: string;
  database: string;
  status: 'healthy' | 'degraded' | 'offline';
  latency: number;
  uptime: string;
  memory: string;
  cpu: string;
  connections: number;
  version: string;
}

export interface DatabaseTableInfo {
  name: string;
  rows: number;
  size_kb: number;
  updated_at: string;
}

export interface DatabaseClusterInfo {
  name: string;
  connected: boolean;
  version: string;
  latency: number;
  sizeMb: number;
  threadsConnected: number;
  tables: DatabaseTableInfo[];
}

export const INITIAL_SERVICES: ServiceStatus[] = [
  {
    id: 'gateway',
    name: 'Nginx API Gateway & Reverse Proxy',
    service: 'Edge Gateway',
    port: 8080,
    container: 'codebridge-api-gateway',
    database: 'Reverse Proxy / WAF Router',
    status: 'healthy',
    latency: 1,
    uptime: '99.99%',
    memory: '38.4 MB / 512 MB',
    cpu: '0.4%',
    connections: 142,
    version: 'Nginx 1.25 Alpine',
  },
  {
    id: 'auth-service',
    name: 'Auth & Identity Microservice',
    service: 'Auth Service',
    port: 8001,
    container: 'codebridge-auth-service',
    database: 'codebridge_auth (MySQL 8)',
    status: 'healthy',
    latency: 2,
    uptime: '99.98%',
    memory: '10 MB',
    cpu: '1.1%',
    connections: 2,
    version: 'Laravel 12 / PHP 8.4',
  },
  {
    id: 'operations-service',
    name: 'Operations, Inventory & Commerce Engine',
    service: 'Operations Service',
    port: 8003,
    container: 'codebridge-operations-service',
    database: 'codebridge_operations (MySQL 8)',
    status: 'healthy',
    latency: 2,
    uptime: '99.99%',
    memory: '128 MB',
    cpu: '1.5%',
    connections: 34,
    version: 'Laravel 12 / PHP 8.4',
  },
  {
    id: 'auth-mysql-db',
    name: 'Auth Database Cluster (MySQL 8)',
    service: 'Auth Service',
    port: 3307,
    container: 'codebridge-auth-mysql',
    database: 'codebridge_auth',
    status: 'healthy',
    latency: 2,
    uptime: '99.99%',
    memory: '2.92 MB data',
    cpu: '0.8%',
    connections: 2,
    version: 'MySQL 8.0',
  },
  {
    id: 'operations-mysql-db',
    name: 'Operations Database Cluster (MySQL 8)',
    service: 'Operations Service',
    port: 3308,
    container: 'codebridge-operations-mysql',
    database: 'codebridge_operations',
    status: 'healthy',
    latency: 2,
    uptime: '99.99%',
    memory: '1.98 MB data',
    cpu: '0.7%',
    connections: 18,
    version: 'MySQL 8.0',
  },
  {
    id: 'auth-redis-cache',
    name: 'Auth Redis Session & Token Blacklist',
    service: 'Auth Service',
    port: 6379,
    container: 'codebridge-auth-redis',
    database: 'In-Memory KeyStore',
    status: 'healthy',
    latency: 1,
    uptime: '99.99%',
    memory: '786 KB RAM',
    cpu: '0.2%',
    connections: 1,
    version: 'Redis 7.2 Alpine',
  },
  {
    id: 'operations-redis-cache',
    name: 'Operations Redis Queue & Offline Sync',
    service: 'Operations Service',
    port: 6380,
    container: 'codebridge-operations-redis',
    database: 'In-Memory Event Bus',
    status: 'healthy',
    latency: 1,
    uptime: '99.99%',
    memory: '1.4 MB RAM',
    cpu: '0.2%',
    connections: 2,
    version: 'Redis 7.2 Alpine',
  },
  {
    id: 'minio-storage',
    name: 'MinIO S3 Compatible Object Storage',
    service: 'Storage Engine',
    port: 9000,
    container: 'codebridge-minio',
    database: 'codebridge-operations S3 Bucket',
    status: 'healthy',
    latency: 1,
    uptime: '99.99%',
    memory: '84 MB',
    cpu: '0.3%',
    connections: 12,
    version: 'MinIO RELEASE.2024',
  },
];
