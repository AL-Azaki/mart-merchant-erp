// ═══════════════════════════════════════════════════════════════════════════════
// CORE TYPES — Domain 1: Core
// Mirrors DB schema exactly (smart_merchant_erp_schema.sql v2.0)
// Tables: accounts, businesses, branches, plans, subscriptions,
//         roles, permissions, users, user_roles, role_permissions,
//         user_branches, system_settings, sequences
// ═══════════════════════════════════════════════════════════════════════════════

// ── Primitives ─────────────────────────────────────────────────────────────────
export type UUID          = string;
export type ISODateString = string;
export type DateString    = string; // YYYY-MM-DD (for DATE columns)
export type Language      = "ar" | "en";
export type ThemeMode     = "light" | "dark" | "system";

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: accounts
// Description: Top-level tenant. Root entity for all data.
// ═══════════════════════════════════════════════════════════════════════════════
export type AccountStatus = "Active" | "Suspended" | "Closed";

export interface Account {
  id:         UUID;
  name:       string;         // account / company display name
  owner_name: string;         // owner's full name
  email:      string;
  phone:      string | null;
  status:     AccountStatus;
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at: ISODateString | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: businesses
// Description: Business entity belonging to an account.
// ═══════════════════════════════════════════════════════════════════════════════
export type BusinessStatus = "Active" | "Inactive";

export interface Business {
  id:            UUID;
  account_id:    UUID;
  business_name: string;
  business_type: string | null; // grocery, retail, wholesale, restaurant, etc.
  primary_phone: string | null;
  primary_email: string | null;
  logo_path:     string | null;
  status:        BusinessStatus;
  created_at:    ISODateString;
  updated_at:    ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: branches
// Description: Branch belonging to a business.
// ═══════════════════════════════════════════════════════════════════════════════
export interface Branch {
  id:          UUID;
  business_id: UUID;
  branch_name: string;
  branch_code: string;
  phone:       string | null;
  email:       string | null;
  address:     string | null;
  is_default:  boolean;
  is_active:   boolean;
  created_at:  ISODateString;
  updated_at:  ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: plans
// Description: SaaS subscription plans.
// ═══════════════════════════════════════════════════════════════════════════════
export interface Plan {
  id:              UUID;
  plan_name:       string;
  billing_cycle:   string;   // "Monthly" | "Yearly"
  duration_months: number;
  price:           number;
  max_businesses:  number;
  max_branches:    number;
  max_users:       number;
  is_active:       boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: subscriptions
// Description: Account subscription to a plan.
// ═══════════════════════════════════════════════════════════════════════════════
export type SubscriptionStatus = "Active" | "Expired" | "Cancelled";

export interface Subscription {
  id:         UUID;
  account_id: UUID;
  plan_id:    UUID;
  start_date: DateString;
  end_date:   DateString;
  status:     SubscriptionStatus;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: roles
// Description: User roles per business (Sales Manager, Cashier, etc.).
// ═══════════════════════════════════════════════════════════════════════════════
export interface Role {
  id:             UUID;
  business_id:    UUID;
  role_name:      string;
  description:    string | null;
  is_system_role: boolean;
  is_active:      boolean;
  created_at:     ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: permissions
// Description: System-level permissions per module.
// ═══════════════════════════════════════════════════════════════════════════════
export interface Permission {
  id:              UUID;
  module:          string;          // sales, inventory, accounting, etc.
  permission_code: string;          // e.g. "sales.create"
  permission_name: string;
  description:     string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: users
// Description: System users with login access.
// ═══════════════════════════════════════════════════════════════════════════════
export interface User {
  id:                UUID;
  account_id:        UUID;
  default_branch_id: UUID | null;
  username:          string;
  email:             string;
  password_hash:     string;        // never expose in UI
  full_name:         string;
  phone:             string | null;
  is_active:         boolean;
  last_login_at:     ISODateString | null;
  created_at:        ISODateString;
  updated_at:        ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: user_roles  [Junction: users ↔ roles]
// ═══════════════════════════════════════════════════════════════════════════════
export interface UserRole {
  user_id:     UUID;
  role_id:     UUID;
  assigned_at: ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: role_permissions  [Junction: roles ↔ permissions]
// ═══════════════════════════════════════════════════════════════════════════════
export interface RolePermission {
  role_id:       UUID;
  permission_id: UUID;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: user_branches  [Junction: users ↔ branches]
// ═══════════════════════════════════════════════════════════════════════════════
export interface UserBranch {
  user_id:     UUID;
  branch_id:   UUID;
  is_active:   boolean;
  assigned_at: ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: system_settings
// Description: Key-value configuration per business.
// ═══════════════════════════════════════════════════════════════════════════════
export interface SystemSetting {
  id:            UUID;
  business_id:   UUID;
  setting_key:   string;
  setting_value: string | null;
  created_at:    ISODateString;
  updated_at:    ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: sequences
// Description: Document number sequence per business/branch/type.
// ═══════════════════════════════════════════════════════════════════════════════
export type SequenceDocumentType =
  | "SalesInvoice" | "PurchaseInvoice"
  | "SalesReturn"  | "PurchaseReturn"
  | "Order"        | "Payment"
  | "Expense"      | "Transfer"
  | "JournalEntry";

export interface Sequence {
  id:            UUID;
  business_id:   UUID;
  branch_id:     UUID | null;
  document_type: SequenceDocumentType;
  prefix:        string;
  next_number:   number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI-ONLY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** User with roles hydrated — for display in Users management */
export interface UserWithRoles extends User {
  roles: Role[];
  branch: Branch | null;
}

/** Subscription with plan hydrated */
export interface SubscriptionWithPlan extends Subscription {
  plan: Plan;
}
