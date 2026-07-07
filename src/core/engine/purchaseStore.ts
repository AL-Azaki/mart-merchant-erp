// ═══════════════════════════════════════════════════════════════════════════════
// purchaseStore.ts — Compatibility Facade
// ═══════════════════════════════════════════════════════════════════════════════
//
// This file is now a thin facade over financialService.ts.
// All real logic lives in financialService.ts (Single Source of Truth).
//
// ═══════════════════════════════════════════════════════════════════════════════

export type { PaymentVoucher } from "./financialService";

export {
  getPurchaseInvoices,
  getPurchaseItems,
  getSuppliers,
  getPayments,
  computeSupplierLedger  as getSupplierLedger,
  computeSupplierBalance as getSupplierBalance,
  computePurchaseInvoiceStatus,
  upsertSupplier   as addSupplier,
  upsertSupplier   as updateSupplier,
  deleteSupplier,
  recordSupplierPayment as addPaymentVoucher,
  postNewPurchaseInvoice as addPurchaseInvoice,
} from "./financialService";

// Re-export the React hook under its old name
export { useFinancialStore as usePurchaseStore } from "./useFinancialStore";
