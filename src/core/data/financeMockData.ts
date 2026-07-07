// ═══════════════════════════════════════════════════════════════════════════════
// FINANCE MOCK DATA — mirrors DB schema exactly (v3.0 — cleaned)
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  Currency, PaymentMethod, FiscalYear, FiscalPeriod,
  ChartOfAccount, JournalEntry, JournalEntryLine,
  Payment, ExpenseCategory, Expense, OpeningBalance
} from "@/core/types/finance";

// ─── Currencies (Global — mutable for live editing in Settings) ───────────────
export let MOCK_CURRENCIES: Currency[] = [
  { id: "cur_yer", currency_code: "YER", currency_name_ar: "ريال يمني",    currency_name_en: "Yemeni Rial",  currency_symbol: "ر.ي", decimal_places: 2, exchange_rate: 1.0,  is_base_currency: true,  is_active: true },
  { id: "cur_sar", currency_code: "SAR", currency_name_ar: "ريال سعودي",  currency_name_en: "Saudi Riyal",  currency_symbol: "ر.س", decimal_places: 2, exchange_rate: 140.0, is_base_currency: false, is_active: true },
  { id: "cur_usd", currency_code: "USD", currency_name_ar: "دولار أمريكي", currency_name_en: "US Dollar",    currency_symbol: "$",   decimal_places: 2, exchange_rate: 530.0, is_base_currency: false, is_active: true },
];

// ─── Payment Methods ──────────────────────────────────────────────────────────
export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm_cash", business_id: "biz_001", method_code: "CASH", method_name: "نقداً / كاش",  payment_type: "Cash", is_active: true },
  { id: "pm_bank", business_id: "biz_001", method_code: "BANK", method_name: "تحويل بنكي",   payment_type: "Bank", is_active: true },
  { id: "pm_card", business_id: "biz_001", method_code: "CARD", method_name: "بطاقة ائتمان", payment_type: "Card", is_active: true },
];

// ─── Fiscal Years ─────────────────────────────────────────────────────────────
export const MOCK_FISCAL_YEARS: FiscalYear[] = [
  { id: "fy_2024", business_id: "biz_001", fiscal_year_code: "FY-2024", start_date: "2024-01-01", end_date: "2024-12-31", status: "Open", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

// ─── Fiscal Periods ───────────────────────────────────────────────────────────
export const MOCK_FISCAL_PERIODS: FiscalPeriod[] = [
  { id: "fp_2024_01", fiscal_year_id: "fy_2024", period_number: 1, start_date: "2024-01-01", end_date: "2024-01-31", status: "Closed", created_at: "2024-01-01T00:00:00Z" },
  { id: "fp_2024_06", fiscal_year_id: "fy_2024", period_number: 6, start_date: "2024-06-01", end_date: "2024-06-30", status: "Open",   created_at: "2024-01-01T00:00:00Z" },
];

// ─── Expense Categories ───────────────────────────────────────────────────────
export const MOCK_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: "exc_001", business_id: "biz_001", category_name: "إيجارات",       is_active: true, created_at: "2024-01-15T00:00:00Z" },
  { id: "exc_002", business_id: "biz_001", category_name: "رواتب وأجور",   is_active: true, created_at: "2024-01-15T00:00:00Z" },
  { id: "exc_003", business_id: "biz_001", category_name: "صيانة وتشغيل",  is_active: true, created_at: "2024-01-15T00:00:00Z" },
  { id: "exc_004", business_id: "biz_001", category_name: "نثريات وضيافة", is_active: true, created_at: "2024-01-15T00:00:00Z" },
];

// ─── Chart of Accounts ────────────────────────────────────────────────────────
export const MOCK_CHART_OF_ACCOUNTS: ChartOfAccount[] = [
  // 1. Assets
  { id: "coa_1",   business_id: "biz_001", parent_account_id: null,      currency_id: "cur_yer", exchange_rate: 1, account_code: "1000", account_name: "الأصول",              account_type: "Asset",     account_category: "Assets",              normal_balance: "Debit",  account_level: 1, allow_posting: false, is_system: true,  is_active: true, created_at: "2024-01-15T00:00:00Z", updated_at: "2024-01-15T00:00:00Z" },
  { id: "coa_11",  business_id: "biz_001", parent_account_id: "coa_1",   currency_id: "cur_yer", exchange_rate: 1, account_code: "1100", account_name: "الأصول المتداولة",   account_type: "Asset",     account_category: "Current Assets",      normal_balance: "Debit",  account_level: 2, allow_posting: false, is_system: true,  is_active: true, created_at: "2024-01-15T00:00:00Z", updated_at: "2024-01-15T00:00:00Z" },
  { id: "coa_111", business_id: "biz_001", parent_account_id: "coa_11",  currency_id: "cur_yer", exchange_rate: 1, account_code: "1101", account_name: "الصندوق (النقدية)",  account_type: "Asset",     account_category: "Cash",                normal_balance: "Debit",  account_level: 3, allow_posting: true,  is_system: true,  is_active: true, created_at: "2024-01-15T00:00:00Z", updated_at: "2024-01-15T00:00:00Z" },
  { id: "coa_112", business_id: "biz_001", parent_account_id: "coa_11",  currency_id: "cur_yer", exchange_rate: 1, account_code: "1102", account_name: "بنك التضامن",         account_type: "Asset",     account_category: "Bank",                normal_balance: "Debit",  account_level: 3, allow_posting: true,  is_system: false, is_active: true, created_at: "2024-01-15T00:00:00Z", updated_at: "2024-01-15T00:00:00Z" },
  { id: "coa_113", business_id: "biz_001", parent_account_id: "coa_11",  currency_id: "cur_yer", exchange_rate: 1, account_code: "1103", account_name: "المدينون (العملاء)", account_type: "Asset",     account_category: "Receivables",         normal_balance: "Debit",  account_level: 3, allow_posting: true,  is_system: true,  is_active: true, created_at: "2024-01-15T00:00:00Z", updated_at: "2024-01-15T00:00:00Z" },
  // 2. Liabilities
  { id: "coa_2",   business_id: "biz_001", parent_account_id: null,      currency_id: "cur_yer", exchange_rate: 1, account_code: "2000", account_name: "الخصوم",              account_type: "Liability", account_category: "Liabilities",         normal_balance: "Credit", account_level: 1, allow_posting: false, is_system: true,  is_active: true, created_at: "2024-01-15T00:00:00Z", updated_at: "2024-01-15T00:00:00Z" },
  { id: "coa_21",  business_id: "biz_001", parent_account_id: "coa_2",   currency_id: "cur_yer", exchange_rate: 1, account_code: "2100", account_name: "الخصوم المتداولة",   account_type: "Liability", account_category: "Current Liabilities", normal_balance: "Credit", account_level: 2, allow_posting: false, is_system: true,  is_active: true, created_at: "2024-01-15T00:00:00Z", updated_at: "2024-01-15T00:00:00Z" },
  { id: "coa_211", business_id: "biz_001", parent_account_id: "coa_21",  currency_id: "cur_yer", exchange_rate: 1, account_code: "2101", account_name: "الموردون (الدائنون)",account_type: "Liability", account_category: "Accounts Payable",    normal_balance: "Credit", account_level: 3, allow_posting: true,  is_system: true,  is_active: true, created_at: "2024-01-15T00:00:00Z", updated_at: "2024-01-15T00:00:00Z" },
  // 3. Equity
  { id: "coa_3",   business_id: "biz_001", parent_account_id: null,      currency_id: "cur_yer", exchange_rate: 1, account_code: "3000", account_name: "حقوق الملكية",       account_type: "Equity",    account_category: "Equity",              normal_balance: "Credit", account_level: 1, allow_posting: false, is_system: true,  is_active: true, created_at: "2024-01-15T00:00:00Z", updated_at: "2024-01-15T00:00:00Z" },
  { id: "coa_31",  business_id: "biz_001", parent_account_id: "coa_3",   currency_id: "cur_yer", exchange_rate: 1, account_code: "3100", account_name: "رأس المال",           account_type: "Equity",    account_category: "Capital",             normal_balance: "Credit", account_level: 2, allow_posting: true,  is_system: true,  is_active: true, created_at: "2024-01-15T00:00:00Z", updated_at: "2024-01-15T00:00:00Z" },
  // 4. Revenue
  { id: "coa_4",   business_id: "biz_001", parent_account_id: null,      currency_id: "cur_yer", exchange_rate: 1, account_code: "4000", account_name: "الإيرادات",           account_type: "Revenue",   account_category: "Revenue",             normal_balance: "Credit", account_level: 1, allow_posting: false, is_system: true,  is_active: true, created_at: "2024-01-15T00:00:00Z", updated_at: "2024-01-15T00:00:00Z" },
  { id: "coa_41",  business_id: "biz_001", parent_account_id: "coa_4",   currency_id: "cur_yer", exchange_rate: 1, account_code: "4100", account_name: "إيرادات المبيعات",   account_type: "Revenue",   account_category: "Sales",               normal_balance: "Credit", account_level: 2, allow_posting: true,  is_system: true,  is_active: true, created_at: "2024-01-15T00:00:00Z", updated_at: "2024-01-15T00:00:00Z" },
  // 5. Expense
  { id: "coa_5",   business_id: "biz_001", parent_account_id: null,      currency_id: "cur_yer", exchange_rate: 1, account_code: "5000", account_name: "المصروفات",           account_type: "Expense",   account_category: "Expenses",            normal_balance: "Debit",  account_level: 1, allow_posting: false, is_system: true,  is_active: true, created_at: "2024-01-15T00:00:00Z", updated_at: "2024-01-15T00:00:00Z" },
  { id: "coa_51",  business_id: "biz_001", parent_account_id: "coa_5",   currency_id: "cur_yer", exchange_rate: 1, account_code: "5100", account_name: "تكلفة المبيعات",      account_type: "Expense",   account_category: "COGS",                normal_balance: "Debit",  account_level: 2, allow_posting: true,  is_system: true,  is_active: true, created_at: "2024-01-15T00:00:00Z", updated_at: "2024-01-15T00:00:00Z" },
  { id: "coa_52",  business_id: "biz_001", parent_account_id: "coa_5",   currency_id: "cur_yer", exchange_rate: 1, account_code: "5200", account_name: "مصروفات تشغيلية",     account_type: "Expense",   account_category: "Operating",           normal_balance: "Debit",  account_level: 2, allow_posting: true,  is_system: true,  is_active: true, created_at: "2024-01-15T00:00:00Z", updated_at: "2024-01-15T00:00:00Z" },
  { id: "coa_53",  business_id: "biz_001", parent_account_id: "coa_5",   currency_id: "cur_yer", exchange_rate: 1, account_code: "5300", account_name: "أرباح/خسائر فروق الصرف", account_type: "Expense", account_category: "FX",                normal_balance: "Debit",  account_level: 2, allow_posting: true,  is_system: true,  is_active: true, created_at: "2024-01-15T00:00:00Z", updated_at: "2024-01-15T00:00:00Z" },
];

// ─── Opening Balances ─────────────────────────────────────────────────────────
export const MOCK_OPENING_BALANCES: OpeningBalance[] = [
  { id: "ob_001", business_id: "biz_001", fiscal_year_id: "fy_2024", chart_of_account_id: "coa_111", currency_id: "cur_yer", exchange_rate: 1, debit_amount: 500000, base_debit_amount: 500000, credit_amount: 0, base_credit_amount: 0, created_by: "usr_001", created_at: "2024-01-01T00:00:00Z" },
  { id: "ob_002", business_id: "biz_001", fiscal_year_id: "fy_2024", chart_of_account_id: "coa_31",  currency_id: "cur_yer", exchange_rate: 1, debit_amount: 0,      base_debit_amount: 0,      credit_amount: 500000, base_credit_amount: 500000, created_by: "usr_001", created_at: "2024-01-01T00:00:00Z" },
];

// ─── Expenses ─────────────────────────────────────────────────────────────────
export const MOCK_EXPENSES: Expense[] = [
  { id: "exp_001", business_id: "biz_001", branch_id: "br_001", category_id: "exc_004", payment_method_id: "pm_cash", currency_id: "cur_yer", exchange_rate: 1, amount: 15000, base_amount: 15000, expense_date: "2024-06-25", description: "ضيافة للعملاء",      status: "Posted", created_by: "usr_001", created_at: "2024-06-25T10:00:00Z", updated_at: "2024-06-25T10:00:00Z" },
  { id: "exp_002", business_id: "biz_001", branch_id: "br_001", category_id: "exc_003", payment_method_id: "pm_cash", currency_id: "cur_yer", exchange_rate: 1, amount: 25000, base_amount: 25000, expense_date: "2024-06-26", description: "صيانة مكيف الصالة", status: "Draft",  created_by: "usr_001", created_at: "2024-06-26T14:00:00Z", updated_at: "2024-06-26T14:00:00Z" },
];

// ─── Payments ─────────────────────────────────────────────────────────────────
export const MOCK_PAYMENTS: Payment[] = [
  { id: "pay_001", business_id: "biz_001", branch_id: "br_001", payment_method_id: "pm_cash", currency_id: "cur_yer", exchange_rate: 1, chart_of_account_id: "coa_111", payment_number: "PAY-2024-001", payment_type: "Receipt", reference_type: "SalesInvoice", reference_id: "si_001", reference_number: null,      amount: 1700,  base_amount: 1700,  payment_date: "2024-06-25T10:30:00Z", status: "Posted", notes: null,          created_by: "usr_001", created_at: "2024-06-25T10:30:00Z", updated_at: "2024-06-25T10:30:00Z" },
  { id: "pay_002", business_id: "biz_001", branch_id: "br_001", payment_method_id: "pm_bank", currency_id: "cur_yer", exchange_rate: 1, chart_of_account_id: "coa_112", payment_number: "PAY-2024-002", payment_type: "Receipt", reference_type: "SalesInvoice", reference_id: "si_002", reference_number: "TR-987", amount: 10000, base_amount: 10000, payment_date: "2024-06-25T14:00:00Z", status: "Posted", notes: "دفعة أولى", created_by: "usr_001", created_at: "2024-06-25T14:00:00Z", updated_at: "2024-06-25T14:00:00Z" },
  { id: "pay_003", business_id: "biz_001", branch_id: "br_001", payment_method_id: "pm_cash", currency_id: "cur_yer", exchange_rate: 1, chart_of_account_id: "coa_111", payment_number: "PAY-2024-003", payment_type: "Payment", reference_type: "Expense",      reference_id: "exp_001",reference_number: null,      amount: 15000, base_amount: 15000, payment_date: "2024-06-25T10:00:00Z", status: "Posted", notes: null,          created_by: "usr_001", created_at: "2024-06-25T10:00:00Z", updated_at: "2024-06-25T10:00:00Z" },
];

// ─── Journal Entries ──────────────────────────────────────────────────────────
export const MOCK_JOURNAL_ENTRIES: JournalEntry[] = [
  { id: "je_001", business_id: "biz_001", fiscal_year_id: "fy_2024", fiscal_period_id: "fp_2024_06", journal_number: "JE-2024-001", journal_date: "2024-06-25", currency_id: "cur_yer", exchange_rate: 1, reference_type: "SalesInvoice", reference_id: "si_001", status: "Posted", notes: "إثبات مبيعات يومية - فاتورة رقم INV-2024-0001", created_by: "usr_001", created_at: "2024-06-25T10:30:00Z", updated_at: "2024-06-25T10:30:00Z" },
  { id: "je_002", business_id: "biz_001", fiscal_year_id: "fy_2024", fiscal_period_id: "fp_2024_06", journal_number: "JE-2024-002", journal_date: "2024-06-25", currency_id: "cur_yer", exchange_rate: 1, reference_type: "Expense",      reference_id: "exp_001", status: "Posted", notes: "سداد مصروف نثريات وضيافة",                      created_by: "usr_001", created_at: "2024-06-25T10:00:00Z", updated_at: "2024-06-25T10:00:00Z" },
];

// ─── Journal Entry Lines ──────────────────────────────────────────────────────
export const MOCK_JOURNAL_LINES: JournalEntryLine[] = [
  { id: "jel_001", journal_entry_id: "je_001", chart_of_account_id: "coa_111", line_number: 1, debit_amount: 1700,  base_debit_amount: 1700,  credit_amount: 0,     base_credit_amount: 0,    description: "استلام نقدية مبيعات" },
  { id: "jel_002", journal_entry_id: "je_001", chart_of_account_id: "coa_41",  line_number: 2, debit_amount: 0,     base_debit_amount: 0,     credit_amount: 1700,  base_credit_amount: 1700, description: "إيراد مبيعات فاتورة INV-2024-0001" },
  { id: "jel_003", journal_entry_id: "je_002", chart_of_account_id: "coa_52",  line_number: 1, debit_amount: 15000, base_debit_amount: 15000, credit_amount: 0,     base_credit_amount: 0,    description: "ضيافة للعملاء" },
  { id: "jel_004", journal_entry_id: "je_002", chart_of_account_id: "coa_111", line_number: 2, debit_amount: 0,     base_debit_amount: 0,     credit_amount: 15000, base_credit_amount: 15000, description: "سداد نقدي" },
];
