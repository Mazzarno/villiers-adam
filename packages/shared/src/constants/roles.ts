export const USER_ROLES = [
  'SUPER_ADMIN',
  'ADMIN_MAIRIE',
  'AGENT',
  'CONTRIBUTOR',
  'READER',
] as const;

export type UserRole = (typeof USER_ROLES)[number];
