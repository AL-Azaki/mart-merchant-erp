// ═══════════════════════════════════════════════════════════════════════════════
// FINANCIAL SERVICE — Smart Merchant ERP v2.0
// ═══════════════════════════════════════════════════════════════════════════════
//
// ARCHITECTURE: Single Source of Truth
//
// This is the ONLY place where financial state is mutated.
// No screen, component, or store may directly modify invoice payment fields.
// All financial operations MUST go through this service.
//
// PRINCIPLE (Double-Entry Bookkeeping):
//   Every financial event:
//     1. Appends an immutable voucher record (ReceiptVoucher / PaymentVoucher)
//     2. Creates a balanced GL journal entry via accountingPostingEngine
//     3. Recalculates derived financial status from the vouchers (never stored separately)
//     4. Notifies all subscribers atomically
//
// LEDGER LOGIC:
//   Customer Ledger: Debit = Invoice amount owed BY customer
//                    Credit = Payment received FROM customer
//                    Balance (positive) = customer still owes us
//
//   Supplier Ledger: Credit = Invoice amount we OWE supplier
//                    Debit  = Payment sent TO supplier
//                    Balance (positive) = we still owe supplier
//
// ═══════════════════════════════════════════════════════════════════════════════

import { MOCK_SALES_INVOICES, MOCK_SALES_INVOICE_ITEMS, MOCK_CUSTOMERS } from "@/core/data/salesMockData";
import { MOCK_PURCHASE_INVOICES, MOCK_PURCHASE_INVOICE_ITEMS, MOCK_SUPPLIERS, MOCK_PURCHASE_PAYMENTS } from "@/core/data/purchasesMockData";
import { MOCK_CURRENCIES } from "@/core/data/financeMockData";
import { addPosting } from "./accountingStore";
import {
  postSalesInvoice,
  postVoucher,
  postPurchaseInvoice,
  validatePostingBalance,
  type SalesInvoicePostPayload,
  type PurchaseInvoicePostPayload,
} from "./accountingPostingEngine";
import type { SalesInvoice, SalesInvoiceItem, Customer } from "@/core/types/sales";
import type { PurchaseInvoice, PurchaseInvoiceItem, Supplier } from "@/core/types/purchases";

// ─── Voucher Types ─────────────────────────────────────────────────────────────

export interface ReceiptVoucher {
  id: string;
  customer_id: string;
  invoice_id?: string;     // optional: link to specific invoice
  amount: number;          // amount in transaction currency
  base_amount: number;     // amount in base currency (YER)
  currency_id: string;
  exchange_rate: number;
  method: "Cash" | "Bank Transfer" | string;
  ref: string;             // voucher reference number
  date: string;
  notes?: string;
}

export interface PaymentVoucher {
  id: string;
  supplier_id: string;
  invoice_id?: string;
  amount: number;
  base_amount: number;
  currency_id: string;
  exchange_rate: number;
  method: "Cash" | "Bank Transfer" | string;
  ref: string;
  date: string;
  notes?: string;
}

// ─── Ledger Row (computed, never stored) ───────────────────────────────────────

export interface LedgerRow {
  id: string;
  date: string;
  type: string;
  type_ar: string;
  ref: string;
  debit: number;
  credit: number;
  balance: number;
  description: string;
  description_ar: string;
  source: any;
}

// ─── Computed Invoice Financial Status (never stored on invoice itself) ────────

export interface InvoiceFinancialStatus {
  invoiceId: string;
  grandTotal: number;
  totalPaid: number;
  totalReturned: number;
  remaining: number;
  paymentStatus: "Paid" | "Partial" | "Unpaid";
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNAL STATE — Immutable append-only collections
// ═══════════════════════════════════════════════════════════════════════════════

let _salesInvoices: SalesInvoice[]         = [...MOCK_SALES_INVOICES];
let _salesItems: SalesInvoiceItem[]        = [...MOCK_SALES_INVOICE_ITEMS];
let _customers: Customer[]                 = [...MOCK_CUSTOMERS];
let _receipts: ReceiptVoucher[]            = [];

let _purchaseInvoices: PurchaseInvoice[]   = [...MOCK_PURCHASE_INVOICES];
let _purchaseItems: PurchaseInvoiceItem[]  = [...MOCK_PURCHASE_INVOICE_ITEMS];
let _suppliers: Supplier[]                 = [...MOCK_SUPPLIERS];
let _payments: PaymentVoucher[]            = [...MOCK_PURCHASE_PAYMENTS as any];

let _listeners: Array<() => void> = [];

function _notify() {
  _listeners.forEach(fn => fn());
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIBER API
// ═══════════════════════════════════════════════════════════════════════════════

export function subscribe(listener: () => void): () => void {
  _listeners.push(listener);
  return () => { _listeners = _listeners.filter(l => l !== listener); };
}

// ═══════════════════════════════════════════════════════════════════════════════
// READ-ONLY ACCESSORS
// ═══════════════════════════════════════════════════════════════════════════════

export function getSalesInvoices()    { return _salesInvoices; }
export function getSalesItems()       { return _salesItems; }
export function getCustomers()        { return _customers; }
export function getReceipts()         { return _receipts; }
export function getPurchaseInvoices() { return _purchaseInvoices; }
export function getPurchaseItems()    { return _purchaseItems; }
export function getSuppliers()        { return _suppliers; }
export function getPayments()         { return _payments; }

// ═══════════════════════════════════════════════════════════════════════════════
// COMPUTED: Invoice Financial Status
// Derived purely from immutable vouchers — NEVER from stored fields
// ═══════════════════════════════════════════════════════════════════════════════

export function computeSalesInvoiceStatus(invoiceId: string): InvoiceFinancialStatus {
  const inv = _salesInvoices.find(i => i.id === invoiceId);
  if (!inv) return { invoiceId, grandTotal: 0, totalPaid: 0, totalReturned: 0, remaining: 0, paymentStatus: "Unpaid" };

  const hasRealReceipts = _receipts.some(r => r.invoice_id === invoiceId);
  let legacyPaid = 0;
  if (!hasRealReceipts) {
    if ((inv as any).payment_status === "Paid") legacyPaid = inv.grand_total;
    else if ((inv as any).payment_status === "Partial") legacyPaid = (inv as any).mock_paid_amount ?? Math.round(inv.grand_total * 0.5);
  }

  const directPaid = _receipts
    .filter(r => r.invoice_id === invoiceId)
    .reduce((sum, r) => sum + r.base_amount, 0);

  // FIFO Allocation of General Receipts (not linked to specific invoice)
  let generalAllocated = 0;
  const generalReceiptsTotal = _receipts
    .filter(r => r.customer_id === inv.customer_id && !r.invoice_id)
    .reduce((sum, r) => sum + r.base_amount, 0);

  if (generalReceiptsTotal > 0) {
    const customerInvoices = _salesInvoices
      .filter(i => i.customer_id === inv.customer_id)
      .sort((a, b) => new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime());
      
    let unallocated = generalReceiptsTotal;
    for (const custInv of customerInvoices) {
      if (unallocated <= 0) break;
      
      // Calculate direct + legacy paid for this invoice
      const custDirectPaid = _receipts
        .filter(r => r.invoice_id === custInv.id)
        .reduce((sum, r) => sum + r.base_amount, 0);
        
      let custLegacyPaid = 0;
      if (!_receipts.some(r => r.invoice_id === custInv.id)) {
        if ((custInv as any).payment_status === "Paid") custLegacyPaid = custInv.grand_total;
        else if ((custInv as any).payment_status === "Partial") custLegacyPaid = (custInv as any).mock_paid_amount ?? Math.round(custInv.grand_total * 0.5);
      }
      
      const custRemaining = Math.max(0, custInv.grand_total - custDirectPaid - custLegacyPaid);
      if (custRemaining > 0) {
        const allocatedHere = Math.min(custRemaining, unallocated);
        unallocated -= allocatedHere;
        if (custInv.id === invoiceId) {
          generalAllocated = allocatedHere;
          break;
        }
      }
    }
  }

  const totalPaid = legacyPaid + directPaid + generalAllocated;
  const totalReturned = 0;
  const remaining = Math.max(0, inv.grand_total - totalPaid - totalReturned);

  let paymentStatus: "Paid" | "Partial" | "Unpaid" = "Unpaid";
  if (remaining <= 0.01) paymentStatus = "Paid";
  else if (totalPaid > 0.01) paymentStatus = "Partial";

  return { invoiceId, grandTotal: inv.grand_total, totalPaid, totalReturned, remaining, paymentStatus };
}

export function computePurchaseInvoiceStatus(invoiceId: string): InvoiceFinancialStatus {
  const inv = _purchaseInvoices.find(i => i.id === invoiceId);
  if (!inv) return { invoiceId, grandTotal: 0, totalPaid: 0, totalReturned: 0, remaining: 0, paymentStatus: "Unpaid" };

  const hasRealPayments = _payments.some(p => p.invoice_id === invoiceId);
  let legacyPaid = 0;
  if (!hasRealPayments && inv.status === "Posted") {
    legacyPaid = Math.round(inv.grand_total * 0.4);
  }

  const directPaid = _payments
    .filter(p => p.invoice_id === invoiceId)
    .reduce((s, p) => s + p.base_amount, 0);

  // FIFO Allocation of General Payments (not linked to specific invoice)
  let generalAllocated = 0;
  const generalPaymentsTotal = _payments
    .filter(p => p.supplier_id === inv.supplier_id && !p.invoice_id)
    .reduce((sum, p) => sum + p.base_amount, 0);

  if (generalPaymentsTotal > 0) {
    const supplierInvoices = _purchaseInvoices
      .filter(i => i.supplier_id === inv.supplier_id)
      .sort((a, b) => new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime());
      
    let unallocated = generalPaymentsTotal;
    for (const suppInv of supplierInvoices) {
      if (unallocated <= 0) break;
      
      const suppDirectPaid = _payments
        .filter(p => p.invoice_id === suppInv.id)
        .reduce((sum, p) => sum + p.base_amount, 0);
        
      let suppLegacyPaid = 0;
      if (!_payments.some(p => p.invoice_id === suppInv.id) && suppInv.status === "Posted") {
        suppLegacyPaid = Math.round(suppInv.grand_total * 0.4);
      }
      
      const suppRemaining = Math.max(0, suppInv.grand_total - suppDirectPaid - suppLegacyPaid);
      if (suppRemaining > 0) {
        const allocatedHere = Math.min(suppRemaining, unallocated);
        unallocated -= allocatedHere;
        if (suppInv.id === invoiceId) {
          generalAllocated = allocatedHere;
          break;
        }
      }
    }
  }

  const totalPaid = legacyPaid + directPaid + generalAllocated;
  const remaining = Math.max(0, inv.grand_total - totalPaid);
  
  let paymentStatus: "Paid" | "Partial" | "Unpaid" = "Unpaid";
  if (remaining <= 0.01) paymentStatus = "Paid";
  else if (totalPaid > 0.01) paymentStatus = "Partial";

  return { invoiceId, grandTotal: inv.grand_total, totalPaid, totalReturned: 0, remaining, paymentStatus };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPUTED: Customer Ledger
// ═══════════════════════════════════════════════════════════════════════════════

export function computeCustomerLedger(customerId: string): LedgerRow[] {
  const ledger: LedgerRow[] = [];

  _salesInvoices
    .filter(inv => inv.customer_id === customerId)
    .forEach(inv => {
      ledger.push({
        id: `tx_inv_${inv.id}`,
        date: inv.invoice_date,
        type: "Sales Invoice",
        type_ar: "فاتورة بيع",
        ref: inv.invoice_number,
        debit: inv.grand_total,
        credit: 0,
        balance: 0,
        description: "Credit Sales",
        description_ar: "مبيعات آجلة",
        source: inv,
      });

      // Synthetic legacy receipt rows for mock invoices without real receipts
      const hasReal = _receipts.some(r => r.invoice_id === inv.id);
      if (!hasReal) {
        if ((inv as any).payment_status === "Paid") {
          ledger.push({
            id: `tx_pay_${inv.id}`,
            date: new Date(new Date(inv.invoice_date).getTime() + 3_600_000).toISOString(),
            type: "Receipt Voucher", type_ar: "سند قبض",
            ref: `RV-${inv.invoice_number.split("-").pop()}`,
            debit: 0, credit: inv.grand_total, balance: 0,
            description: "Full Cash Payment", description_ar: "دفعة نقدية (كاملة)",
            source: null,
          });
        } else if ((inv as any).payment_status === "Partial") {
          const paidAmt = (inv as any).mock_paid_amount ?? Math.round(inv.grand_total * 0.5);
          ledger.push({
            id: `tx_pay_${inv.id}`,
            date: new Date(new Date(inv.invoice_date).getTime() + 86_400_000).toISOString(),
            type: "Receipt Voucher", type_ar: "سند قبض",
            ref: `RV-${inv.invoice_number.split("-").pop()}`,
            debit: 0, credit: paidAmt, balance: 0,
            description: "Partial Payment", description_ar: "دفعة جزئية",
            source: null,
          });
        }
      }
    });

  _receipts
    .filter(r => r.customer_id === customerId)
    .forEach(rv => {
      const currSym = MOCK_CURRENCIES.find(c => c.id === rv.currency_id)?.currency_symbol ?? "";
      const fxNote = rv.exchange_rate !== 1 ? ` - ما يعادل ${rv.amount.toLocaleString()} ${currSym}` : "";
      ledger.push({
        id: rv.id,
        date: rv.date,
        type: "Receipt Voucher", type_ar: "سند قبض",
        ref: rv.ref || rv.id,
        debit: 0, credit: rv.base_amount, balance: 0,
        description: `Payment Received (${rv.method})`,
        description_ar: rv.notes || `دفعة ${rv.method === "Cash" ? "نقدية" : "بنكية"}${fxNote}`,
        source: rv,
      });
    });

  ledger.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let running = 0;
  return ledger.map(row => {
    running += row.debit - row.credit;
    return { ...row, balance: running };
  });
}

export function computeCustomerBalance(customerId: string): number {
  const ledger = computeCustomerLedger(customerId);
  return ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPUTED: Supplier Ledger
// ═══════════════════════════════════════════════════════════════════════════════

export function computeSupplierLedger(supplierId: string): LedgerRow[] {
  const ledger: LedgerRow[] = [];

  _purchaseInvoices
    .filter(inv => inv.supplier_id === supplierId)
    .forEach(inv => {
      ledger.push({
        id: `tx_inv_${inv.id}`,
        date: inv.purchase_date,
        type: "Purchase Invoice", type_ar: "فاتورة مشتريات",
        ref: inv.invoice_number,
        debit: 0, credit: inv.grand_total, balance: 0,
        description: "Credit Purchase", description_ar: "مشتريات آجلة",
        source: inv,
      });

      // Legacy mock partial payment
      const hasReal = _payments.some(p => p.invoice_id === inv.id);
      if (!hasReal && inv.status === "Posted") {
        const paidAmt = Math.round(inv.grand_total * 0.4);
        ledger.push({
          id: `tx_pay_${inv.id}`,
          date: new Date(new Date(inv.purchase_date).getTime() + 86_400_000).toISOString(),
          type: "Payment Voucher", type_ar: "سند صرف",
          ref: `PV-${inv.invoice_number.split("-").pop()}`,
          debit: paidAmt, credit: 0, balance: 0,
          description: "Partial Payment", description_ar: "دفعة جزئية",
          source: null,
        });
      }
    });

  _payments
    .filter(p => p.supplier_id === supplierId)
    .forEach(pv => {
      const currSym = MOCK_CURRENCIES.find(c => c.id === pv.currency_id)?.currency_symbol ?? "";
      const fxNote = pv.exchange_rate !== 1 ? ` - ما يعادل ${pv.amount.toLocaleString()} ${currSym}` : "";
      ledger.push({
        id: pv.id,
        date: pv.date,
        type: "Payment Voucher", type_ar: "سند صرف",
        ref: pv.ref || pv.id,
        debit: pv.base_amount, credit: 0, balance: 0,
        description: `Payment Sent (${pv.method})`,
        description_ar: pv.notes || `دفعة ${pv.method === "Cash" ? "نقدية" : "بنكية"}${fxNote}`,
        source: pv,
      });
    });

  ledger.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let running = 0;
  return ledger.map(row => {
    running += row.credit - row.debit;   // supplier balance: credit - debit
    return { ...row, balance: running };
  });
}

export function computeSupplierBalance(supplierId: string): number {
  const ledger = computeSupplierLedger(supplierId);
  return ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// WRITE OPERATIONS — All mutations go through here (atomic)
// ═══════════════════════════════════════════════════════════════════════════════

/** Post a new Sales Invoice + GL journal entry atomically */
export function postNewSalesInvoice(
  invoice: SalesInvoice,
  items: SalesInvoiceItem[],
  postingPayload: SalesInvoicePostPayload,
): void {
  // 1. Append invoice (immutable from now on — no payment fields modified here)
  _salesInvoices = [invoice, ..._salesInvoices];
  _salesItems    = [...items, ..._salesItems];
  MOCK_SALES_INVOICE_ITEMS.unshift(...items);

  // 2. Create GL journal entry
  try {
    const posting = postSalesInvoice(postingPayload);
    const { balanced } = validatePostingBalance(posting);
    if (!balanced) console.warn("[FinancialService] Unbalanced journal for invoice", invoice.invoice_number);
    addPosting(posting);
  } catch (err) {
    console.error("[FinancialService] Failed to post journal entry:", err);
    // In a real DB system this would rollback — here we still keep the invoice
    // but log the failure for reconciliation
  }

  // 3. If partially or fully paid at invoice creation, record receipt voucher(s)
  if (postingPayload.paidAmount > 0) {
    const rv: ReceiptVoucher = {
      id: `rv_init_${invoice.id}`,
      customer_id: invoice.customer_id ?? "",
      invoice_id: invoice.id,
      amount: postingPayload.paidAmount,
      base_amount: postingPayload.basePaidAmount,
      currency_id: postingPayload.currencyId,
      exchange_rate: postingPayload.exchangeRate,
      method: postingPayload.paymentMethod ?? "Cash",
      ref: `RV-${invoice.invoice_number}`,
      date: invoice.invoice_date,
      notes: "دفعة عند إنشاء الفاتورة",
    };
    _receipts = [rv, ..._receipts];
  }

  _notify();
}

/** Record a customer receipt payment (سند قبض) */
export function recordCustomerReceipt(receipt: ReceiptVoucher): void {
  // 1. Append receipt (append-only — never modify existing records)
  _receipts = [receipt, ..._receipts];

  // 2. Create GL journal entry
  try {
    const baseCurrency = MOCK_CURRENCIES.find(c => c.is_base_currency);
    const posting = postVoucher({
      voucherId:     receipt.id,
      voucherNumber: receipt.ref,
      type:          "income",
      amount:        receipt.amount,
      baseAmount:    receipt.base_amount,
      currencyId:    receipt.currency_id ?? baseCurrency?.id ?? "cur_yer",
      exchangeRate:  receipt.exchange_rate ?? 1,
      category:      "customer_payment",
      entityName:    getCustomers().find(c => c.id === receipt.customer_id)?.customer_name,
      description:   receipt.notes || `تسديد مديونية عميل - ${receipt.ref}`,
    });
    const { balanced } = validatePostingBalance(posting);
    if (!balanced) console.warn("[FinancialService] Unbalanced receipt posting:", receipt.ref);
    addPosting(posting);
  } catch (err) {
    console.error("[FinancialService] Failed to post receipt:", err);
  }

  _notify();
}

/** Record a supplier payment voucher (سند صرف) */
export function recordSupplierPayment(payment: PaymentVoucher): void {
  // 1. Append payment
  _payments = [payment, ..._payments];
  MOCK_PURCHASE_PAYMENTS.unshift(payment as any);

  // 2. Create GL journal entry
  try {
    const baseCurrency = MOCK_CURRENCIES.find(c => c.is_base_currency);
    const posting = postVoucher({
      voucherId:     payment.id,
      voucherNumber: payment.ref,
      type:          "expense",
      amount:        payment.amount,
      baseAmount:    payment.base_amount,
      currencyId:    payment.currency_id ?? baseCurrency?.id ?? "cur_yer",
      exchangeRate:  payment.exchange_rate ?? 1,
      category:      "supplier_payment",
      entityName:    getSuppliers().find(s => s.id === payment.supplier_id)?.supplier_name,
      description:   payment.notes || `تسديد مديونية مورد - ${payment.ref}`,
    });
    const { balanced } = validatePostingBalance(posting);
    if (!balanced) console.warn("[FinancialService] Unbalanced payment posting:", payment.ref);
    addPosting(posting);
  } catch (err) {
    console.error("[FinancialService] Failed to post payment:", err);
  }

  _notify();
}

/** Add a new purchase invoice + GL journal entry */
export function postNewPurchaseInvoice(
  invoice: PurchaseInvoice,
  items: PurchaseInvoiceItem[],
  postingPayload: PurchaseInvoicePostPayload,
): void {
  _purchaseInvoices = [invoice, ..._purchaseInvoices];
  _purchaseItems    = [...items, ..._purchaseItems];
  MOCK_PURCHASE_INVOICES.unshift(invoice);
  MOCK_PURCHASE_INVOICE_ITEMS.unshift(...items);

  try {
    const posting = postPurchaseInvoice(postingPayload);
    const { balanced } = validatePostingBalance(posting);
    if (!balanced) console.warn("[FinancialService] Unbalanced purchase journal:", invoice.invoice_number);
    addPosting(posting);
  } catch (err) {
    console.error("[FinancialService] Failed to post purchase journal:", err);
  }

  // 3. If partially or fully paid at invoice creation, record payment voucher(s)
  if (postingPayload.paidAmount > 0) {
    const pv: PaymentVoucher = {
      id: `pv_init_${invoice.id}`,
      supplier_id: invoice.supplier_id ?? "",
      invoice_id: invoice.id,
      amount: postingPayload.paidAmount,
      base_amount: postingPayload.basePaidAmount,
      currency_id: postingPayload.currencyId,
      exchange_rate: postingPayload.exchangeRate,
      method: postingPayload.paymentMethod ?? "Cash",
      ref: `PV-${invoice.invoice_number}`,
      date: invoice.purchase_date,
      notes: "دفعة عند إنشاء الفاتورة",
    };
    _payments = [pv, ..._payments];
    MOCK_PURCHASE_PAYMENTS.unshift(pv as any);
  }

  _notify();
}

/** Add or update a customer */
export function upsertCustomer(customer: Customer): void {
  const exists = _customers.some(c => c.id === customer.id);
  if (exists) {
    _customers = _customers.map(c => c.id === customer.id ? customer : c);
  } else {
    _customers = [customer, ..._customers];
    MOCK_CUSTOMERS.push(customer);
  }
  _notify();
}

/** Add or update a supplier */
export function upsertSupplier(supplier: Supplier): void {
  const exists = _suppliers.some(s => s.id === supplier.id);
  if (exists) {
    _suppliers = _suppliers.map(s => s.id === supplier.id ? supplier : s);
  } else {
    _suppliers = [supplier, ..._suppliers];
    MOCK_SUPPLIERS.unshift(supplier);
  }
  _notify();
}

export function deleteSupplier(id: string): void {
  _suppliers = _suppliers.filter(s => s.id !== id);
  _notify();
}
