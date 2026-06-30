// ═══════════════════════════════════════════════════════════════════════════════
// FINANCE TYPES — Domain 7: Finance
// Mirrors DB schema exactly (smart_merchant_erp_schema.sql v2.0)
// Tables: currencies, payment_methods, fiscal_years, fiscal_periods,
//         chart_of_accounts, journal_entries, journal_entry_lines,
//         payments, expense_categories, expenses, opening_balances
// ═══════════════════════════════════════════════════════════════════════════════

import type { UUID, ISODateString, DateString } from "./index";

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: currencies
// Description: Global currencies (System-level, not per-business).
//   Only ONE record may have is_base_currency = TRUE.
// ═══════════════════════════════════════════════════════════════════════════════
export interface Currency {
  id:               UUID;
  currency_code:    string;      // e.g. "YER", "SAR", "USD"
  currency_name_ar: string;
  currency_name_en: string;
  currency_symbol:  string;      // e.g. "ر.ي", "$"
  decimal_places:   number;
  exchange_rate:    number;      // rate relative to base currency
  is_base_currency: boolean;
  is_active:        boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: payment_methods
// Description: Payment methods configured per business.
// ═══════════════════════════════════════════════════════════════════════════════
export type PaymentMethodType = "Cash" | "Bank" | "Card" | "DigitalWallet" | "Other";

export interface PaymentMethod {
  id:           UUID;
  business_id:  UUID;
  method_code:  string;
  method_name:  string;
  payment_type: PaymentMethodType;
  is_active:    boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: fiscal_years
// Description: Fiscal year per business.
// ═══════════════════════════════════════════════════════════════════════════════
export type FiscalYearStatus = "Open" | "Closed";

export interface FiscalYear {
  id:               UUID;
  business_id:      UUID;
  fiscal_year_code: string;      // e.g. "FY2026"
  start_date:       DateString;
  end_date:         DateString;
  status:           FiscalYearStatus;
  created_at:       ISODateString;
  updated_at:       ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: fiscal_periods
// Description: Monthly fiscal periods within a fiscal year.
// ═══════════════════════════════════════════════════════════════════════════════
export type FiscalPeriodStatus = "Open" | "Closed";

export interface FiscalPeriod {
  id:             UUID;
  fiscal_year_id: UUID;
  period_number:  number;        // 1–12
  start_date:     DateString;
  end_date:       DateString;
  status:         FiscalPeriodStatus;
  created_at:     ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: chart_of_accounts
// Description: Chart of accounts tree per business.
//   Code convention: 1xxx=Asset, 2xxx=Liability, 3xxx=Equity,
//                    4xxx=Revenue, 5xxx=Expense
// ═══════════════════════════════════════════════════════════════════════════════
export type AccountType    = "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
export type NormalBalance  = "Debit" | "Credit";

export interface ChartOfAccount {
  id:                UUID;
  business_id:       UUID;
  parent_account_id: UUID | null;     // self-referencing FK for tree
  currency_id:       UUID;
  account_code:      string;          // unique per business
  account_name:      string;
  account_type:      AccountType;
  account_category:  string | null;
  normal_balance:    NormalBalance;
  account_level:     number;
  allow_posting:     boolean;         // TRUE = leaf account (can post), FALSE = group
  is_system:         boolean;         // system accounts cannot be deleted
  is_active:         boolean;
  created_at:        ISODateString;
  updated_at:        ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: journal_entries
// Description: Accounting journal entry header.
//   RULE: SUM(debit_amount) MUST equal SUM(credit_amount) per entry.
// ═══════════════════════════════════════════════════════════════════════════════
export type JournalEntryStatus    = "Draft" | "Posted" | "Reversed";
export type JournalReferenceType  =
  | "SalesInvoice"    | "SalesReturn"
  | "PurchaseInvoice" | "PurchaseReturn"
  | "Payment"         | "Expense"
  | "Manual";

export interface JournalEntry {
  id:               UUID;
  business_id:      UUID;
  fiscal_year_id:   UUID;
  fiscal_period_id: UUID;
  journal_number:   string;
  journal_date:     DateString;
  reference_type:   JournalReferenceType;
  reference_id:     UUID;              // polymorphic FK — no DB constraint
  status:           JournalEntryStatus;
  notes:            string | null;
  created_by:       UUID;
  created_at:       ISODateString;
  updated_at:       ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: journal_entry_lines
// Description: Debit/Credit lines of a journal entry.
// ═══════════════════════════════════════════════════════════════════════════════
export interface JournalEntryLine {
  id:                  UUID;
  journal_entry_id:    UUID;
  chart_of_account_id: UUID;
  line_number:         number;
  debit_amount:        number;
  credit_amount:       number;
  description:         string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: payments
// Description: All financial receipts and disbursements.
//   Each payment is linked to a COA (cash/bank) account and a source document.
// ═══════════════════════════════════════════════════════════════════════════════
export type PaymentType          = "Receipt" | "Payment" | "Refund" | "Adjustment" | "Transfer";
export type PaymentStatus        = "Draft" | "Posted" | "Cancelled";
export type PaymentReferenceType =
  | "SalesInvoice"    | "PurchaseInvoice"
  | "SalesReturn"     | "PurchaseReturn"
  | "Expense"         | "Other";

export interface Payment {
  id:                  UUID;
  business_id:         UUID;
  branch_id:           UUID;
  payment_method_id:   UUID;
  currency_id:         UUID;
  chart_of_account_id: UUID;          // cash/bank account in COA
  payment_number:      string;
  payment_type:        PaymentType;
  reference_type:      PaymentReferenceType;
  reference_id:        UUID;
  reference_number:    string | null; // external reference (e.g. bank receipt)
  amount:              number;
  payment_date:        ISODateString;
  status:              PaymentStatus;
  notes:               string | null;
  created_by:          UUID;
  created_at:          ISODateString;
  updated_at:          ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: expense_categories
// Description: Expense classification categories per business.
// ═══════════════════════════════════════════════════════════════════════════════
export interface ExpenseCategory {
  id:            UUID;
  business_id:   UUID;
  category_name: string;
  is_active:     boolean;
  created_at:    ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: expenses
// Description: Administrative / operational expenses.
// ═══════════════════════════════════════════════════════════════════════════════
export type ExpenseStatus = "Draft" | "Posted" | "Cancelled";

export interface Expense {
  id:                UUID;
  business_id:       UUID;
  branch_id:         UUID;
  category_id:       UUID;
  payment_method_id: UUID;
  amount:            number;
  expense_date:      DateString;
  description:       string | null;
  status:            ExpenseStatus;
  created_by:        UUID;
  created_at:        ISODateString;
  updated_at:        ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE: opening_balances
// Description: Opening balances per account per fiscal year.
// ═══════════════════════════════════════════════════════════════════════════════
export interface OpeningBalance {
  id:                  UUID;
  business_id:         UUID;
  fiscal_year_id:      UUID;
  chart_of_account_id: UUID;
  currency_id:         UUID;
  debit_amount:        number;
  credit_amount:       number;
  created_by:          UUID;
  created_at:          ISODateString;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI-ONLY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Journal entry with its lines and account names hydrated */
export interface JournalEntryWithLines extends JournalEntry {
  fiscal_year:   FiscalYear;
  fiscal_period: FiscalPeriod;
  lines:         (JournalEntryLine & { account: ChartOfAccount })[];
}

/** Expense with category and payment method hydrated */
export interface ExpenseWithDetails extends Expense {
  category:       ExpenseCategory;
  payment_method: PaymentMethod;
}

/** Payment with method and account hydrated */
export interface PaymentWithDetails extends Payment {
  payment_method: PaymentMethod;
  account:        ChartOfAccount;
  currency:       Currency;
}

/** Chart of accounts tree node */
export interface ChartOfAccountNode extends ChartOfAccount {
  children: ChartOfAccountNode[];
}
