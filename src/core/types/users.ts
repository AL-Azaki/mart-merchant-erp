// ═══════════════════════════════════════════════════════════════════════════════
// USERS TYPES — Domain 1 (Users subset)
// Mirrors DB schema exactly (smart_merchant_erp_schema.sql v2.0)
// Re-exports: Role, Permission, User, UserRole, RolePermission, UserBranch
// This file exists as a convenience re-export for feature/users imports.
// ═══════════════════════════════════════════════════════════════════════════════

export type {
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  UserBranch,
  UserWithRoles,
} from "./index";
