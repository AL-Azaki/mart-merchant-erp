// ═══════════════════════════════════════════════════════════════════════════════
// salesStore.ts — Compatibility Facade
// ═══════════════════════════════════════════════════════════════════════════════
//
// This file is now a thin facade over financialService.ts.
// All real logic lives in financialService.ts (Single Source of Truth).
// This file exists only for backwards compatibility with components that
// still import from "@/core/engine/salesStore".
//
// Prefer importing useFinancialStore from "@/core/engine/useFinancialStore"
// in new or refactored components.
//
// ═══════════════════════════════════════════════════════════════════════════════

export type { ReceiptVoucher } from "./financialService";

export {
  getSalesInvoices,
  getSalesItems,
  getCustomers,
  getReceipts,
  computeCustomerLedger  as getCustomerLedger,
  computeCustomerBalance as getCustomerBalance,
  computeSalesInvoiceStatus,
  upsertCustomer         as addCustomer,
} from "./financialService";

// Re-export the React hook under its old name
export { useFinancialStore as useSalesStore } from "./useFinancialStore";
