// ═══════════════════════════════════════════════════════════════════════════════
// TYPES — Central Export
// Import everything from here: import type { X } from "@/core/types"
//
// File map (mirrors DB domains):
//   index.ts    → Domain 1: accounts, businesses, branches, plans, subscriptions,
//                           roles, permissions, users, user_roles, role_permissions,
//                           user_branches, system_settings, sequences
//   catalog.ts  → Domain 3: categories, brands, units, products, product_units,
//                           product_images
//   inventory.ts→ Domain 4: warehouses, inventories, inventory_transactions,
//                           inventory_transfers, inventory_transfer_items
//   sales.ts    → Domain 5: customers, channels, orders, order_items,
//                           sales_invoices, sales_invoice_items,
//                           sales_returns, sales_return_items
//   purchases.ts→ Domain 6: suppliers, purchase_invoices, purchase_invoice_items,
//                           purchase_returns, purchase_return_items
//   finance.ts  → Domain 7: currencies, payment_methods, fiscal_years,
//                           fiscal_periods, chart_of_accounts, journal_entries,
//                           journal_entry_lines, payments, expense_categories,
//                           expenses, opening_balances
//   channels.ts → Domain 8: product_channels, carts, cart_items
// ═══════════════════════════════════════════════════════════════════════════════

// Domain 1 — Core
export type {
  UUID,
  ISODateString,
  DateString,
  Language,
  ThemeMode,
  AccountStatus,
  Account,
  BusinessStatus,
  Business,
  Branch,
  Plan,
  SubscriptionStatus,
  Subscription,
  Role,
  Permission,
  User,
  UserRole,
  RolePermission,
  UserBranch,
  SystemSetting,
  SequenceDocumentType,
  Sequence,
  UserWithRoles,
  SubscriptionWithPlan,
} from "./index";

// Domain 3 — Catalog
export type {
  Category,
  Brand,
  Unit,
  Product,
  ProductUnit,
  ProductImage,
  ProductUnitWithDetails,
  ProductWithUnits,
  CategoryNode,
} from "./catalog";

// Domain 4 — Inventory
export type {
  Warehouse,
  Inventory,
  InventoryTransactionType,
  InventoryReferenceType,
  InventoryTransaction,
  InventoryTransferStatus,
  InventoryTransfer,
  InventoryTransferItem,
  InventoryWithDetails,
  InventoryTransferWithDetails,
} from "./inventory";

// Domain 5 — Sales
export type {
  Customer,
  ChannelType,
  Channel,
  OrderStatus,
  OrderPaymentStatus,
  Order,
  OrderItem,
  SalesInvoicePaymentStatus,
  SalesInvoiceStatus,
  SalesInvoice,
  SalesInvoiceItem,
  SalesReturnStatus,
  SalesReturn,
  SalesReturnItem,
  SalesInvoiceWithDetails,
  OrderWithDetails,
  SalesReturnWithDetails,
  CartLine,
} from "./sales";

// Domain 6 — Purchasing
export type {
  Supplier,
  PurchaseInvoiceStatus,
  PurchaseInvoice,
  PurchaseInvoiceItem,
  PurchaseReturnStatus,
  PurchaseReturn,
  PurchaseReturnItem,
  PurchaseInvoiceWithDetails,
  PurchaseReturnWithDetails,
  PurchaseLine,
} from "./purchases";

// Domain 7 — Finance
export type {
  Currency,
  PaymentMethodType,
  PaymentMethod,
  FiscalYearStatus,
  FiscalYear,
  FiscalPeriodStatus,
  FiscalPeriod,
  AccountType,
  NormalBalance,
  ChartOfAccount,
  JournalEntryStatus,
  JournalReferenceType,
  JournalEntry,
  JournalEntryLine,
  PaymentType,
  PaymentStatus,
  PaymentReferenceType,
  Payment,
  ExpenseCategory,
  ExpenseStatus,
  Expense,
  OpeningBalance,
  JournalEntryWithLines,
  ExpenseWithDetails,
  PaymentWithDetails,
  ChartOfAccountNode,
} from "./finance";

// Domain 8 — Channels
export type {
  ProductChannel,
  CartStatus,
  Cart,
  CartItem,
} from "./channels";
