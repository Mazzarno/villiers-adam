import type { UserRole } from './roles';

export const PERMISSIONS = {
  'users:create': ['SUPER_ADMIN', 'ADMIN_MAIRIE'],
  'users:read': ['SUPER_ADMIN', 'ADMIN_MAIRIE', 'AGENT'],
  'users:update': ['SUPER_ADMIN', 'ADMIN_MAIRIE'],
  'users:delete': ['SUPER_ADMIN'],

  'content:create': ['SUPER_ADMIN', 'ADMIN_MAIRIE', 'AGENT', 'CONTRIBUTOR'],
  'content:read': ['SUPER_ADMIN', 'ADMIN_MAIRIE', 'AGENT', 'CONTRIBUTOR', 'READER'],
  'content:update': ['SUPER_ADMIN', 'ADMIN_MAIRIE', 'AGENT'],
  'content:delete': ['SUPER_ADMIN', 'ADMIN_MAIRIE'],
  'content:publish': ['SUPER_ADMIN', 'ADMIN_MAIRIE', 'AGENT'],

  'media:create': ['SUPER_ADMIN', 'ADMIN_MAIRIE', 'AGENT'],
  'media:read': ['SUPER_ADMIN', 'ADMIN_MAIRIE', 'AGENT', 'CONTRIBUTOR', 'READER'],
  'media:update': ['SUPER_ADMIN', 'ADMIN_MAIRIE', 'AGENT'],
  'media:delete': ['SUPER_ADMIN', 'ADMIN_MAIRIE'],

  'settings:read': ['SUPER_ADMIN', 'ADMIN_MAIRIE', 'AGENT'],
  'settings:update': ['SUPER_ADMIN', 'ADMIN_MAIRIE'],

  'audit:read': ['SUPER_ADMIN', 'ADMIN_MAIRIE'],
} as const satisfies Record<string, UserRole[]>;

export type PermissionKey = keyof typeof PERMISSIONS;
