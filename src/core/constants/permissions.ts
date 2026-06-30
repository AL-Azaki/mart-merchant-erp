// ═══════════════════════════════════════════════════════════════════════════════
// PERMISSION CONSTANTS
// These must match the permissions seeded in the DB exactly.
// ═══════════════════════════════════════════════════════════════════════════════

import type { PermissionModule, PermissionAction } from "../types";

export type PermissionKey = `${PermissionModule}:${PermissionAction}`;

export const PERMISSIONS: Record<string, PermissionKey> = {
  // Sales
  SALES_CREATE: "sales:create",
  SALES_READ: "sales:read",
  SALES_UPDATE: "sales:update",
  SALES_DELETE: "sales:delete",

  // Inventory
  INVENTORY_CREATE: "inventory:create",
  INVENTORY_READ: "inventory:read",
  INVENTORY_UPDATE: "inventory:update",
  INVENTORY_DELETE: "inventory:delete",

  // Accounting
  ACCOUNTING_READ: "accounting:read",
  ACCOUNTING_CREATE: "accounting:create",

  // Reports
  REPORTS_READ: "reports:read",
  REPORTS_EXPORT: "reports:export",

  // Users
  USERS_CREATE: "users:create",
  USERS_READ: "users:read",
  USERS_UPDATE: "users:update",

  // Settings
  SETTINGS_READ: "settings:read",
  SETTINGS_UPDATE: "settings:update",
} as const;

// System role IDs (seeded in DB)
export const SYSTEM_ROLES = {
  OWNER: "role_owner",
  MANAGER: "role_manager",
  CASHIER: "role_cashier",
  ACCOUNTANT: "role_accountant",
} as const;
