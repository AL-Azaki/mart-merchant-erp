// ═══════════════════════════════════════════════════════════════════════════════
// useFinancialStore — React hook for FinancialService
// ═══════════════════════════════════════════════════════════════════════════════
//
// A single React hook that subscribes to the FinancialService and exposes
// all read and write operations to React components.
// No component should import from salesStore or purchaseStore directly anymore.
//
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import {
  subscribe,
  getSalesInvoices,
  getSalesItems,
  getCustomers,
  getReceipts,
  getPurchaseInvoices,
  getPurchaseItems,
  getSuppliers,
  getPayments,
  computeCustomerLedger,
  computeCustomerBalance,
  computeSupplierLedger,
  computeSupplierBalance,
  computeSalesInvoiceStatus,
  computePurchaseInvoiceStatus,
  postNewSalesInvoice,
  recordCustomerReceipt,
  recordSupplierPayment,
  postNewPurchaseInvoice,
  upsertCustomer,
  upsertSupplier,
  deleteSupplier,
  type ReceiptVoucher,
  type PaymentVoucher,
  type LedgerRow,
  type InvoiceFinancialStatus,
} from "./financialService";
import type { SalesInvoice, SalesInvoiceItem, Customer } from "@/core/types/sales";
import type { PurchaseInvoice, PurchaseInvoiceItem, Supplier } from "@/core/types/purchases";
import type { SalesInvoicePostPayload, PurchaseInvoicePostPayload } from "./accountingPostingEngine";

export type { ReceiptVoucher, PaymentVoucher, LedgerRow, InvoiceFinancialStatus };

export function useFinancialStore() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    return subscribe(() => setTick(t => t + 1));
  }, []);

  // ── Read-only snapshots ────────────────────────────────────────────────────
  const invoices         = getSalesInvoices();
  const invoiceItems     = getSalesItems();
  const customers        = getCustomers();
  const receipts         = getReceipts();
  const purchaseInvoices = getPurchaseInvoices();
  const purchaseItems    = getPurchaseItems();
  const suppliers        = getSuppliers();
  const payments         = getPayments();

  // ── Write operations (memoized to avoid re-creating on every render) ────────
  const addSalesInvoice = useCallback(
    (inv: SalesInvoice, items: SalesInvoiceItem[], payload: SalesInvoicePostPayload) =>
      postNewSalesInvoice(inv, items, payload),
    []
  );

  const addReceiptVoucher = useCallback(
    (receipt: ReceiptVoucher) => recordCustomerReceipt(receipt),
    []
  );

  const addSupplierPayment = useCallback(
    (payment: PaymentVoucher) => recordSupplierPayment(payment),
    []
  );

  const addPurchaseInvoice = useCallback(
    (inv: PurchaseInvoice, items: PurchaseInvoiceItem[], payload: PurchaseInvoicePostPayload) =>
      postNewPurchaseInvoice(inv, items, payload),
    []
  );

  const addCustomer = useCallback(
    (customer: Customer) => upsertCustomer(customer),
    []
  );

  const addSupplier = useCallback(
    (supplier: Supplier) => upsertSupplier(supplier),
    []
  );

  const updateSupplier = useCallback(
    (supplier: Supplier) => upsertSupplier(supplier),
    []
  );

  const removeSupplier = useCallback(
    (id: string) => deleteSupplier(id),
    []
  );

  // ── Computed queries (called per-entity, not stored) ──────────────────────
  const getCustomerLedger = useCallback(
    (customerId: string): LedgerRow[] => computeCustomerLedger(customerId),
    [tick] // eslint-disable-line
  );

  const getCustomerBalance = useCallback(
    (customerId: string): number => computeCustomerBalance(customerId),
    [tick] // eslint-disable-line
  );

  const getSupplierLedger = useCallback(
    (supplierId: string): LedgerRow[] => computeSupplierLedger(supplierId),
    [tick] // eslint-disable-line
  );

  const getSupplierBalance = useCallback(
    (supplierId: string): number => computeSupplierBalance(supplierId),
    [tick] // eslint-disable-line
  );

  const getSalesInvoiceStatus = useCallback(
    (invoiceId: string): InvoiceFinancialStatus => computeSalesInvoiceStatus(invoiceId),
    [tick] // eslint-disable-line
  );

  const getPurchaseInvoiceStatus = useCallback(
    (invoiceId: string): InvoiceFinancialStatus => computePurchaseInvoiceStatus(invoiceId),
    [tick] // eslint-disable-line
  );

  // Legacy compat: getInvoiceTotalPaid for components still using it
  const getInvoiceTotalPaid = useCallback(
    (invoiceId: string): number => computeSalesInvoiceStatus(invoiceId).totalPaid,
    [tick] // eslint-disable-line
  );

  const getSupplierInvoiceTotalPaid = useCallback(
    (invoiceId: string): number => computePurchaseInvoiceStatus(invoiceId).totalPaid,
    [tick] // eslint-disable-line
  );

  return {
    // ── Data snapshots ───────────────────────────────────────────────────────
    invoices,          // sales invoices
    invoiceItems,
    customers,
    receipts,
    purchaseInvoices,
    purchaseItems,
    suppliers,
    payments,

    // ── Write operations ─────────────────────────────────────────────────────
    addSalesInvoice,
    addReceiptVoucher,
    addSupplierPayment,
    addPaymentVoucher: addSupplierPayment, // alias for backwards compat
    addPurchaseInvoice,
    addCustomer,
    addSupplier,
    updateSupplier,
    deleteSupplier: removeSupplier,

    // ── Computed queries ─────────────────────────────────────────────────────
    getCustomerLedger,
    getCustomerBalance,
    getSupplierLedger,
    getSupplierBalance,
    getSalesInvoiceStatus,
    getPurchaseInvoiceStatus,
    getInvoiceTotalPaid,
    getSupplierInvoiceTotalPaid,
  };
}
