import type { User, Role, Permission } from "@/core/types/users";

export const MOCK_PERMISSIONS: Permission[] = [
  { id: "perm_sales_view", module: "sales", permission_code: "sales.view", permission_name: "عرض المبيعات", description: "عرض فواتير المبيعات والطلبات" },
  { id: "perm_sales_create", module: "sales", permission_code: "sales.create", permission_name: "إنشاء فواتير المبيعات", description: "إمكانية بيع وإنشاء فواتير جديدة" },
  { id: "perm_purchases_view", module: "purchases", permission_code: "purchases.view", permission_name: "عرض المشتريات", description: "عرض فواتير المشتريات والموردين" },
  { id: "perm_purchases_create", module: "purchases", permission_code: "purchases.create", permission_name: "إدارة المشتريات", description: "إنشاء فواتير شراء بضاعة مرتجعاتها" },
  { id: "perm_inventory_view", module: "inventory", permission_code: "inventory.view", permission_name: "عرض المخزون", description: "تصفح قائمة المنتجات والمستودعات" },
  { id: "perm_inventory_edit", module: "inventory", permission_code: "inventory.edit", permission_name: "تعديل المخزون والمنتجات", description: "إضافة وتعديل المنتجات والأصول وجرد المخزون" },
  { id: "perm_finance_view", module: "finance", permission_code: "finance.view", permission_name: "عرض المالية", description: "عرض الخزينة والحسابات المالية" },
  { id: "perm_finance_edit", module: "finance", permission_code: "finance.edit", permission_name: "إدارة المالية والمصاريف", description: "سندات الصرف والقبض وإدخال المصاريف" },
  { id: "perm_users_manage", module: "users", permission_code: "users.manage", permission_name: "إدارة المستخدمين والصلاحيات", description: "إضافة مستخدمين وتعديل أدوارهم وصلاحياتهم" },
];

export interface RoleWithPermissionIds extends Role {
  permission_ids?: string[];
}

export const MOCK_ROLES: RoleWithPermissionIds[] = [
  {
    id: "role_admin",
    business_id: "biz_001",
    role_name: "مدير النظام (Admin)",
    description: "كامل صلاحيات الوصول والإدارة لكل موديولات النظام والفروع",
    is_system_role: true,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    permission_ids: MOCK_PERMISSIONS.map(p => p.id)
  },
  {
    id: "role_cashier",
    business_id: "biz_001",
    role_name: "كاشير مبيعات (Cashier)",
    description: "صلاحيات تصفح المبيعات وإنشاء الفواتير فقط",
    is_system_role: false,
    is_active: true,
    created_at: "2024-01-02T00:00:00Z",
    permission_ids: ["perm_sales_view", "perm_sales_create"]
  },
  {
    id: "role_inventory",
    business_id: "biz_001",
    role_name: "أمين مخزن (Inventory Manager)",
    description: "صلاحية إدارة المنتجات، الأصول الثابتة، المستودعات وجرد المخزون",
    is_system_role: false,
    is_active: true,
    created_at: "2024-01-03T00:00:00Z",
    permission_ids: ["perm_inventory_view", "perm_inventory_edit", "perm_purchases_view"]
  }
];

export const MOCK_USERS: User[] = [
  {
    id: "usr_001",
    account_id: "acc_001",
    default_branch_id: "br_001",
    username: "admin_user",
    email: "admin@tajir.ye",
    password_hash: "[hashed]",
    full_name: "أحمد محمد العمري",
    phone: "771234567",
    is_active: true,
    last_login_at: "2024-06-25T10:00:00Z",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-06-25T10:00:00Z",
    roles: [MOCK_ROLES[0]]
  },
  {
    id: "usr_002",
    account_id: "acc_001",
    default_branch_id: "br_002",
    username: "cashier1",
    email: "cashier1@tajir.ye",
    password_hash: "[hashed]",
    full_name: "كاشير الصباح",
    phone: "773456789",
    is_active: true,
    last_login_at: "2024-06-25T08:00:00Z",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-06-25T08:00:00Z",
    roles: [MOCK_ROLES[1]]
  }
];
