import type { User, Role, Permission } from "@/core/types/users";

export const MOCK_PERMISSIONS: Permission[] = [
  { id: "perm_1", module: "finance", action: "view", description: "View Finance" },
  { id: "perm_2", module: "finance", action: "edit", description: "Edit Finance" },
  { id: "perm_3", module: "inventory", action: "view", description: "View Inventory" },
  { id: "perm_4", module: "inventory", action: "edit", description: "Edit Inventory" },
];

export const MOCK_ROLES: Role[] = [
  {
    id: "role_admin",
    business_id: "biz_001",
    role_name: "Admin",
    description: "Administrator with full access",
    is_system_role: true,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "role_cashier",
    business_id: "biz_001",
    role_name: "Cashier",
    description: "Can only access sales POS",
    is_system_role: false,
    is_active: true,
    created_at: "2024-01-02T00:00:00Z"
  },
  {
    id: "role_inventory",
    business_id: "biz_001",
    role_name: "Inventory Manager",
    description: "Can access and edit inventory",
    is_system_role: false,
    is_active: true,
    created_at: "2024-01-03T00:00:00Z"
  }
];

export const MOCK_USERS: User[] = [
  {
    id: "usr_001",
    account_id: "acc_001",
    default_branch_id: "br_001",
    username: "admin_user",
    email: "admin@smartmerchant.com",
    full_name: "مدير النظام",
    phone: "0500000000",
    is_active: true,
    last_login_at: "2024-06-25T10:00:00Z",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-06-25T10:00:00Z",
    roles: [MOCK_ROLES[0]]
  },
  {
    id: "usr_002",
    account_id: "acc_001",
    default_branch_id: "br_001",
    username: "cashier1",
    email: "cashier1@smartmerchant.com",
    full_name: "كاشير الصباح",
    phone: "0500000001",
    is_active: true,
    last_login_at: "2024-06-25T08:00:00Z",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-06-25T08:00:00Z",
    roles: [MOCK_ROLES[1]]
  }
];
