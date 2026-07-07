// ═══════════════════════════════════════════════════════════════════════════════
// ACCOUNTING POSTING ENGINE — Smart Merchant ERP v1.0
// ═══════════════════════════════════════════════════════════════════════════════
//
// PRINCIPLE: Every financial event creates a balanced double-entry journal entry.
//            No financial operation can exist without an accounting journal entry.
//            All amounts are stored in BOTH the transaction currency AND base currency.
//
// USAGE: Import postXxx() functions and call them AFTER saving the source document.
//        Each function returns the new JournalEntry and JournalEntryLine[] to be
//        appended to the global journal store.
//
// ═══════════════════════════════════════════════════════════════════════════════

import type { JournalEntry, JournalEntryLine } from "@/core/types/finance";
import { MOCK_CURRENCIES, MOCK_CHART_OF_ACCOUNTS } from "@/core/data/financeMockData";

// ─── COA Account IDs ──────────────────────────────────────────────────────────
// These are resolved from MOCK_CHART_OF_ACCOUNTS by category — NOT hardcoded.
function getAccountByCategory(category: string): string {
  const acc = MOCK_CHART_OF_ACCOUNTS.find(a => a.account_category === category && a.allow_posting);
  if (!acc) throw new Error(`[AccountingEngine] No account found for category: "${category}"`);
  return acc.id;
}

// ─── Journal Number Generator ─────────────────────────────────────────────────
let _jeCounter = 1000;
export function generateJournalNumber(): string {
  _jeCounter += 1;
  const now = new Date();
  return `JE-${now.getFullYear()}-${String(_jeCounter).padStart(4, "0")}`;
}

// ─── Posting Result ───────────────────────────────────────────────────────────
export interface PostingResult {
  entry: JournalEntry;
  lines: JournalEntryLine[];
}

// ─── Shared Entry Builder ─────────────────────────────────────────────────────
function buildEntry(
  referenceType: JournalEntry["reference_type"],
  referenceId: string,
  currencyId: string,
  exchangeRate: number,
  notes: string
): JournalEntry {
  const now = new Date().toISOString();
  return {
    id: `je_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    business_id:      "biz_001",
    fiscal_year_id:   "fy_2024",
    fiscal_period_id: "fp_2024_06",
    journal_number:   generateJournalNumber(),
    journal_date:     now.split("T")[0],
    currency_id:      currencyId,
    exchange_rate:    exchangeRate,
    reference_type:   referenceType,
    reference_id:     referenceId,
    status:           "Posted",
    notes,
    created_by:       "usr_001",
    created_at:       now,
    updated_at:       now,
  };
}

function buildLine(
  journalEntryId: string,
  lineNumber: number,
  accountId: string,
  debit: number,
  credit: number,
  baseDebit: number,
  baseCredit: number,
  description: string
): JournalEntryLine {
  return {
    id:                  `jel_${Date.now()}_${lineNumber}_${Math.random().toString(36).slice(2, 5)}`,
    journal_entry_id:    journalEntryId,
    chart_of_account_id: accountId,
    line_number:         lineNumber,
    debit_amount:        debit,
    credit_amount:       credit,
    base_debit_amount:   baseDebit,
    base_credit_amount:  baseCredit,
    description,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. SALES INVOICE POSTING
// ═══════════════════════════════════════════════════════════════════════════════
//
// Accounting logic:
//   CASH sale:    Dr Cash/Bank                    | Cr Sales Revenue
//   CREDIT sale:  Dr Accounts Receivable (Debtor) | Cr Sales Revenue
//   With tax:     Extra line Dr nothing           | Cr Tax Payable
//   COGS:         Dr Cost of Goods Sold           | Cr Inventory
//
// All base_amounts = amount × exchange_rate (in base currency YER).
//
export interface SalesInvoicePostPayload {
  invoiceId:     string;
  invoiceNumber: string;
  grandTotal:    number;
  baseGrandTotal:number;
  taxTotal:      number;
  baseTaxTotal:  number;
  costTotal:     number;   // estimated COGS (sum of purchase prices of items sold)
  baseCostTotal: number;
  currencyId:    string;
  exchangeRate:  number;
  paidAmount:    number;
  basePaidAmount:number;
  paymentMethod?:string;
  customerName?: string;
}

export function postSalesInvoice(payload: SalesInvoicePostPayload): PostingResult {
  const {
    invoiceId, invoiceNumber, grandTotal, baseGrandTotal,
    taxTotal, baseTaxTotal, costTotal, baseCostTotal,
    currencyId, exchangeRate, paidAmount, basePaidAmount, paymentMethod, customerName
  } = payload;

  const entry = buildEntry(
    "SalesInvoice",
    invoiceId,
    currencyId,
    exchangeRate,
    `فاتورة مبيعات رقم ${invoiceNumber}${customerName ? ` - ${customerName}` : ""}`
  );

  const cashAccountId       = getAccountByCategory("Cash");
  const bankAccountId       = getAccountByCategory("Bank");
  const receivablesAccountId= getAccountByCategory("Receivables");
  const salesAccountId      = getAccountByCategory("Sales");
  const cogsAccountId       = getAccountByCategory("COGS");

  const lines: JournalEntryLine[] = [];
  const revenueAmount     = grandTotal - taxTotal;
  const baseRevenueAmount = baseGrandTotal - baseTaxTotal;

  // Determine Cash/Bank account based on payment method
  const activeCashAccountId = paymentMethod === "Bank" ? bankAccountId : cashAccountId;
  let currentLine = 1;

  if (paidAmount >= grandTotal) {
    // Fully Paid
    lines.push(buildLine(entry.id, currentLine++, activeCashAccountId, grandTotal, 0, baseGrandTotal, 0, "استلام نقدية مبيعات"));
  } else if (paidAmount === 0) {
    // Fully Credit
    lines.push(buildLine(entry.id, currentLine++, receivablesAccountId, grandTotal, 0, baseGrandTotal, 0, "مديونية عميل - مبيعات آجلة"));
  } else {
    // Partial Payment
    lines.push(buildLine(entry.id, currentLine++, activeCashAccountId, paidAmount, 0, basePaidAmount, 0, "دفعة مقدمة - مبيعات"));
    const remaining = grandTotal - paidAmount;
    const baseRemaining = baseGrandTotal - basePaidAmount;
    lines.push(buildLine(entry.id, currentLine++, receivablesAccountId, remaining, 0, baseRemaining, 0, "باقي مديونية عميل - مبيعات جزئية"));
  }

  // Sales Revenue (Cr)
  lines.push(buildLine(entry.id, currentLine++, salesAccountId, 0, revenueAmount, 0, baseRevenueAmount, `إيراد مبيعات - ${invoiceNumber}`));

  // Line 3 (optional): Tax Payable (Cr)
  if (taxTotal > 0) {
    try {
      const taxAccountId = getAccountByCategory("Tax Payable");
      lines.push(buildLine(entry.id, currentLine++, taxAccountId, 0, taxTotal, 0, baseTaxTotal, "ضريبة المبيعات"));
    } catch {
      // Tax account not defined — add to revenue
      const revenueLine = lines.find(l => l.chart_of_account_id === salesAccountId);
      if (revenueLine) {
        revenueLine.credit_amount      += taxTotal;
        revenueLine.base_credit_amount += baseTaxTotal;
      }
    }
  }

  // Lines 4+: Cost of Goods Sold (if cost available)
  if (costTotal > 0) {
    try {
      const inventoryAccountId = getAccountByCategory("Inventory");
      lines.push(buildLine(entry.id, currentLine++,   cogsAccountId,      costTotal, 0,         baseCostTotal, 0,             "تكلفة البضاعة المباعة (COGS)"));
      lines.push(buildLine(entry.id, currentLine++, inventoryAccountId, 0,         costTotal, 0,             baseCostTotal, "تخفيض المخزون لعملية البيع"));
    } catch {
      // Inventory account not defined — skip COGS entry
    }
  }

  return { entry, lines };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. PURCHASE INVOICE POSTING
// ═══════════════════════════════════════════════════════════════════════════════
//
// Accounting logic:
//   CASH purchase:   Dr Inventory | Cr Cash/Bank
//   CREDIT purchase: Dr Inventory | Cr Accounts Payable (Supplier)
//
export interface PurchaseInvoicePostPayload {
  invoiceId:      string;
  invoiceNumber:  string;
  grandTotal:     number;
  baseGrandTotal: number;
  currencyId:     string;
  exchangeRate:   number;
  paidAmount:     number;
  basePaidAmount: number;
  paymentMethod?: string;
  bankAccountId?: string;
  cashAccountId?: string;
  supplierName?:  string;
}

export function postPurchaseInvoice(payload: PurchaseInvoicePostPayload): PostingResult {
  const { invoiceId, invoiceNumber, grandTotal, baseGrandTotal, currencyId, exchangeRate, paidAmount, basePaidAmount, paymentMethod, bankAccountId, cashAccountId: explicitCashAccountId, supplierName } = payload;

  const entry = buildEntry(
    "PurchaseInvoice",
    invoiceId,
    currencyId,
    exchangeRate,
    `فاتورة مشتريات رقم ${invoiceNumber}${supplierName ? ` - ${supplierName}` : ""}`
  );

  const cashAccountId      = explicitCashAccountId || getAccountByCategory("Cash");
  const bankAccountIdActual= bankAccountId || getAccountByCategory("Bank");
  const payablesAccountId  = getAccountByCategory("Accounts Payable");

  const activeCashAccountId = paymentMethod === "Bank" ? bankAccountIdActual : cashAccountId;

  // Try to use Inventory account, fall back to COGS
  let drAccountId: string;
  let drDesc: string;
  try {
    drAccountId = getAccountByCategory("Inventory");
    drDesc = "إضافة للمخزون";
  } catch {
    drAccountId = getAccountByCategory("COGS");
    drDesc = "تكلفة مشتريات";
  }

  const lines: JournalEntryLine[] = [];
  let currentLine = 1;

  // Debit: Inventory / Expense
  lines.push(buildLine(entry.id, currentLine++, drAccountId, grandTotal, 0, baseGrandTotal, 0, drDesc));

  if (paidAmount >= grandTotal) {
    // Fully Paid
    lines.push(buildLine(entry.id, currentLine++, activeCashAccountId, 0, grandTotal, 0, baseGrandTotal, "سداد نقدي للمورد بالكامل"));
  } else if (paidAmount === 0) {
    // Fully Credit
    lines.push(buildLine(entry.id, currentLine++, payablesAccountId, 0, grandTotal, 0, baseGrandTotal, "مديونية مورد - مشتريات آجلة"));
  } else {
    // Partial Payment
    lines.push(buildLine(entry.id, currentLine++, activeCashAccountId, 0, paidAmount, 0, basePaidAmount, "دفعة مقدمة - مشتريات"));
    const remaining = grandTotal - paidAmount;
    const baseRemaining = baseGrandTotal - basePaidAmount;
    lines.push(buildLine(entry.id, currentLine++, payablesAccountId, 0, remaining, 0, baseRemaining, "باقي مديونية مورد - مشتريات جزئية"));
  }

  return { entry, lines };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. PAYMENT VOUCHER POSTING (Receipt سند قبض / Payment سند صرف)
// ═══════════════════════════════════════════════════════════════════════════════
//
// Receipt (income):  Dr Cash/Bank | Cr Revenue (or Customer Liability)
// Payment (expense): Dr Expense   | Cr Cash/Bank
//
// FX Gain/Loss: If baseAmount != original base — creates a 3rd balancing line.
//
export interface VoucherPostPayload {
  voucherId:      string;
  voucherNumber:  string;
  type:           "income" | "expense";
  amount:         number;
  baseAmount:     number;
  currencyId:     string;
  exchangeRate:   number;
  category:       string;        // e.g. "sales", "salaries", "rent"
  entityName?:    string;
  description:    string;
  originalBaseAmount?: number;   // for FX gain/loss calculation
}

export function postVoucher(payload: VoucherPostPayload): PostingResult {
  const {
    voucherId, voucherNumber, type, amount, baseAmount,
    currencyId, exchangeRate, category, entityName, description,
    originalBaseAmount
  } = payload;

  const entry = buildEntry(
    "Payment",
    voucherId,
    currencyId,
    exchangeRate,
    `${type === "income" ? "سند قبض" : "سند صرف"} رقم ${voucherNumber}${entityName ? ` - ${entityName}` : ""}`
  );

  const cashAccountId = getAccountByCategory("Cash");

  // Map category to COA account
  const revenueCategories: Record<string, string> = {
    sales: "Sales", services: "Sales", investments: "Sales", other_income: "Sales"
  };
  const expenseCategories: Record<string, string> = {
    salaries: "Operating", rent: "Operating", utilities: "Operating",
    marketing: "Operating", maintenance: "Operating",
    office_supplies: "Operating", other_expense: "Operating"
  };

  let counterpartAccountId: string;
  try {
    if (category === "customer_payment") {
      counterpartAccountId = getAccountByCategory("Receivables");
    } else if (category === "supplier_payment") {
      counterpartAccountId = getAccountByCategory("Accounts Payable");
    } else {
      const mappedCategory = type === "income"
        ? (revenueCategories[category] || "Sales")
        : (expenseCategories[category] || "Operating");
      counterpartAccountId = getAccountByCategory(mappedCategory);
    }
  } catch {
    counterpartAccountId = type === "income"
      ? getAccountByCategory("Sales")
      : getAccountByCategory("Operating");
  }

  const lines: JournalEntryLine[] = [];

  if (type === "income") {
    // Dr Cash, Cr Revenue
    lines.push(buildLine(entry.id, 1, cashAccountId,          amount, 0,      baseAmount, 0,          `قبض نقدي - ${description}`));
    const descSuffix = category === "customer_payment" ? "تسديد مديونية عميل" : "إيراد";
    lines.push(buildLine(entry.id, 2, counterpartAccountId,   0,      amount, 0,          baseAmount, `${descSuffix} - ${description}`));
  } else {
    // Dr Expense/Liability, Cr Cash
    const descPrefix = category === "supplier_payment" ? "تسديد مديونية مورد" : "مصروف";
    lines.push(buildLine(entry.id, 1, counterpartAccountId,   amount, 0,      baseAmount, 0,          `${descPrefix} - ${description}`));
    lines.push(buildLine(entry.id, 2, cashAccountId,          0,      amount, 0,          baseAmount, `سداد نقدي - ${description}`));
  }

  // FX Gain/Loss line (if receiving payment at different rate than invoice rate)
  if (originalBaseAmount !== undefined && Math.abs(baseAmount - originalBaseAmount) > 0.01) {
    const fxDiff = baseAmount - originalBaseAmount;
    const fxAccountId = getAccountByCategory("FX");
    if (fxDiff > 0) {
      // FX Gain: Cr FX account (reduces expense / increases income)
      lines.push(buildLine(entry.id, lines.length + 1, fxAccountId, 0, fxDiff, 0, fxDiff, "أرباح فروق أسعار الصرف"));
    } else {
      // FX Loss: Dr FX account
      lines.push(buildLine(entry.id, lines.length + 1, fxAccountId, Math.abs(fxDiff), 0, Math.abs(fxDiff), 0, "خسائر فروق أسعار الصرف"));
    }
  }

  return { entry, lines };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. SALES RETURN POSTING
// ═══════════════════════════════════════════════════════════════════════════════
export interface SalesReturnPostPayload {
  returnId:       string;
  returnNumber:   string;
  grandTotal:     number;
  baseGrandTotal: number;
  currencyId:     string;
  exchangeRate:   number;
  customerName?:  string;
}

export function postSalesReturn(payload: SalesReturnPostPayload): PostingResult {
  const { returnId, returnNumber, grandTotal, baseGrandTotal, currencyId, exchangeRate, customerName } = payload;

  const entry = buildEntry(
    "SalesReturn",
    returnId,
    currencyId,
    exchangeRate,
    `مرتجع مبيعات رقم ${returnNumber}${customerName ? ` - ${customerName}` : ""}`
  );

  const cashAccountId  = getAccountByCategory("Cash");
  const salesAccountId = getAccountByCategory("Sales");

  const lines: JournalEntryLine[] = [
    buildLine(entry.id, 1, salesAccountId, grandTotal, 0,          baseGrandTotal, 0,             "عكس إيراد مبيعات - مرتجع"),
    buildLine(entry.id, 2, cashAccountId,  0,          grandTotal, 0,             baseGrandTotal, "إعادة نقدية للعميل - مرتجع"),
  ];

  return { entry, lines };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PURCHASE RETURN POSTING
// ═══════════════════════════════════════════════════════════════════════════════
export interface PurchaseReturnPostPayload {
  returnId:       string;
  returnNumber:   string;
  grandTotal:     number;
  baseGrandTotal: number;
  currencyId:     string;
  exchangeRate:   number;
  supplierName?:  string;
}

export function postPurchaseReturn(payload: PurchaseReturnPostPayload): PostingResult {
  const { returnId, returnNumber, grandTotal, baseGrandTotal, currencyId, exchangeRate, supplierName } = payload;

  const entry = buildEntry(
    "PurchaseReturn",
    returnId,
    currencyId,
    exchangeRate,
    `مرتجع مشتريات رقم ${returnNumber}${supplierName ? ` - ${supplierName}` : ""}`
  );

  const cashAccountId     = getAccountByCategory("Cash");
  const payablesAccountId = getAccountByCategory("Accounts Payable");

  let inventoryAccountId: string;
  try {
    inventoryAccountId = getAccountByCategory("Inventory");
  } catch {
    inventoryAccountId = getAccountByCategory("COGS");
  }

  const lines: JournalEntryLine[] = [
    buildLine(entry.id, 1, cashAccountId || payablesAccountId, grandTotal, 0,          baseGrandTotal, 0,             "استرداد نقدي من المورد - مرتجع"),
    buildLine(entry.id, 2, inventoryAccountId,                 0,          grandTotal, 0,             baseGrandTotal, "عكس إضافة المخزون - مرتجع مشتريات"),
  ];

  return { entry, lines };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. INVENTORY ADJUSTMENT POSTING
// ═══════════════════════════════════════════════════════════════════════════════
export interface InventoryAdjustmentPostPayload {
  adjustmentId:   string;
  adjustmentRef:  string;
  totalValue:     number;
  isIncrease:     boolean;  // true = stock count increased, false = decreased (writeoff)
  reason:         string;
}

export function postInventoryAdjustment(payload: InventoryAdjustmentPostPayload): PostingResult {
  const { adjustmentId, adjustmentRef, totalValue, isIncrease, reason } = payload;

  const entry = buildEntry(
    "Manual",
    adjustmentId,
    MOCK_CURRENCIES.find(c => c.is_base_currency)?.id || "cur_yer",
    1,
    `تعديل مخزن - ${adjustmentRef} - ${reason}`
  );

  let inventoryAccountId: string;
  try {
    inventoryAccountId = getAccountByCategory("Inventory");
  } catch {
    inventoryAccountId = getAccountByCategory("COGS");
  }
  const adjustmentAccountId = getAccountByCategory("Operating");

  const lines: JournalEntryLine[] = isIncrease
    ? [
        buildLine(entry.id, 1, inventoryAccountId,    totalValue, 0,          totalValue, 0,          `زيادة مخزن - ${reason}`),
        buildLine(entry.id, 2, adjustmentAccountId,   0,          totalValue, 0,          totalValue, `مقابل تعديل المخزن`),
      ]
    : [
        buildLine(entry.id, 1, adjustmentAccountId,   totalValue, 0,          totalValue, 0,          `خسارة مخزن / إتلاف - ${reason}`),
        buildLine(entry.id, 2, inventoryAccountId,    0,          totalValue, 0,          totalValue, `تخفيض مخزن - ${reason}`),
      ];

  return { entry, lines };
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATOR: Verify journal entry is balanced (Debit == Credit in base currency)
// ═══════════════════════════════════════════════════════════════════════════════
export function validatePostingBalance(result: PostingResult): { balanced: boolean; diff: number } {
  const totalBaseDebit  = result.lines.reduce((s, l) => s + (l.base_debit_amount  || 0), 0);
  const totalBaseCredit = result.lines.reduce((s, l) => s + (l.base_credit_amount || 0), 0);
  const diff = Math.abs(totalBaseDebit - totalBaseCredit);
  return { balanced: diff < 0.01, diff };
}
