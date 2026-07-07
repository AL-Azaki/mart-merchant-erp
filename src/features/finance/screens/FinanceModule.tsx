import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wallet, ArrowDownRight, ArrowUpRight, Plus, 
  Search, FileText, Calendar, Filter, ArrowRight, ArrowLeft, Download
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { TransactionFormSheet } from "../components/TransactionFormSheet";
import { TransactionDetailsSheet } from "../components/TransactionDetailsSheet";
import { ChartOfAccountsScreen } from "./ChartOfAccountsScreen";
import { JournalEntriesScreen } from "./JournalEntriesScreen";
import { JournalEntryFormSheet } from "../components/JournalEntryFormSheet";
import { ReportsModule } from "@/features/reports/screens/ReportsModule";
import { Network, FileText as FileTextIcon, Columns, PieChart } from "lucide-react";
import { MOCK_CURRENCIES } from "@/core/data/financeMockData";
import { useAccountingStore } from "@/core/engine/accountingStore";
import { postVoucher, validatePostingBalance } from "@/core/engine/accountingPostingEngine";
import { useFinancialStore } from "@/core/engine/useFinancialStore";
import { MOCK_BUSINESS } from "@/core/data/mockData";
import type { JournalEntry, JournalLine } from "@/core/types/finance";
import { exportToExcel } from "@/core/utils/exportUtils";
import { generateVoucherHTML } from "../utils/voucherReceiptUtils";

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
};

// Mock Initial Data
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "tx_1", type: "income", amount: 150000, category: "sales", description: "مبيعات الكاشير الوردية الصباحية", date: new Date().toISOString() },
  { id: "tx_2", type: "expense", amount: 12000, category: "utilities", description: "فاتورة كهرباء", date: new Date(Date.now() - 86400000).toISOString() },
  { id: "tx_3", type: "expense", amount: 5000, category: "other_expense", description: "ضيافة للعملاء", date: new Date(Date.now() - 172800000).toISOString() },
];

export function FinanceModule({ onBack, initialAction = null }: { onBack?: () => void, initialAction?: "income" | "expense" | null }) {
  const { t, isDark, isRTL, ds } = useApp();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const { entries, lines, addPosting: storeAddPosting } = useAccountingStore();
  const store = useFinancialStore();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState<"income" | "expense" | null>(initialAction);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "coa" | "journal" | "reports">("dashboard");
  const [showJournalForm, setShowJournalForm] = useState(false);

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      if (!search) return true;
      return t.description.includes(search) || t.category.includes(search);
    });
  }, [search, transactions]);

  const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const tabs = [
    { id: "dashboard", label: isRTL ? "لوحة التحكم" : "Dashboard", icon: Wallet, color: "#10B981" },
    { id: "coa", label: isRTL ? "دليل الحسابات" : "Chart of Accounts", icon: Network, color: "#3B82F6" },
    { id: "journal", label: isRTL ? "القيود اليومية" : "Journal Entries", icon: FileTextIcon, color: "#8B5CF6" },
    { id: "reports", label: isRTL ? "التقارير" : "Reports", icon: PieChart, color: "#EC4899" },
  ] as const;

  const getCategoryName = (key: string) => {
    const categories: Record<string, string> = {
      sales: isRTL ? "إيرادات مبيعات" : "Sales Revenue",
      services: isRTL ? "إيرادات خدمات" : "Service Revenue",
      investments: isRTL ? "عوائد استثمار" : "Investment Returns",
      other_income: isRTL ? "إيرادات أخرى" : "Other Income",
      salaries: isRTL ? "رواتب وأجور" : "Salaries & Wages",
      rent: isRTL ? "إيجارات" : "Rent",
      utilities: isRTL ? "فواتير خدمات (كهرباء، ماء)" : "Utilities",
      marketing: isRTL ? "تسويق وإعلان" : "Marketing & Ads",
      maintenance: isRTL ? "صيانة وإصلاح" : "Maintenance",
      office_supplies: isRTL ? "مستلزمات مكتبية" : "Office Supplies",
      other_expense: isRTL ? "مصروفات أخرى" : "Other Expense"
    };
    return categories[key] || key;
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", background: surface, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {onBack && (
            <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginInlineEnd: 8 }}>
              <BackIcon size={20} color={ds.textPrimary} />
            </button>
          )}
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Wallet size={22} color="#10B981" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "المالية والمحاسبة" : "Finance & Accounting"}</h2>
            <p style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 500 }}>{isRTL ? "إدارة الشؤون المالية والحسابات" : "Manage finance and accounts"}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "16px 24px 0", background: surface, borderBottom: `1px solid ${border}`, display: "flex", gap: 24 }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "0 4px 16px",
                background: "none", border: "none",
                cursor: "pointer", position: "relative",
                color: isActive ? tab.color : ds.textSecondary,
                fontWeight: isActive ? 700 : 600,
                fontSize: 15, fontFamily: "inherit",
              }}
            >
              <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {tab.label}
              {isActive && (
                <motion.div layoutId="financeTabIndicator" style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 3, background: tab.color, borderRadius: "3px 3px 0 0" }} />
              )}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                
                {/* Quick Actions */}
                <div style={{ display: "flex", gap: 16, marginBottom: 32, overflowX: "auto", paddingBottom: 8 }}>
                  <button onClick={() => setShowForm("income")} style={{ minWidth: 160, height: 60, background: isDark ? ds.surface2 : "#F1F5F9", border: `1.5px solid ${border}`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: ds.textPrimary, fontSize: 16, fontWeight: 800, cursor: "pointer", flexShrink: 0, transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.borderColor="#10B981"} onMouseOut={e=>e.currentTarget.style.borderColor=border}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowUpRight size={20} color="#10B981" /></div>
                    {isRTL ? "سند قبض" : "Receipt"}
                  </button>
                  <button onClick={() => setShowForm("expense")} style={{ minWidth: 160, height: 60, background: isDark ? ds.surface2 : "#F1F5F9", border: `1.5px solid ${border}`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: ds.textPrimary, fontSize: 16, fontWeight: 800, cursor: "pointer", flexShrink: 0, transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.borderColor="#EF4444"} onMouseOut={e=>e.currentTarget.style.borderColor=border}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowDownRight size={20} color="#EF4444" /></div>
                    {isRTL ? "سند صرف" : "Payment"}
                  </button>
                  <button onClick={() => setShowJournalForm(true)} style={{ minWidth: 160, height: 60, background: isDark ? ds.surface2 : "#F1F5F9", border: `1.5px solid ${border}`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: ds.textPrimary, fontSize: 16, fontWeight: 800, cursor: "pointer", flexShrink: 0, transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.borderColor="#8B5CF6"} onMouseOut={e=>e.currentTarget.style.borderColor=border}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><FileTextIcon size={20} color="#8B5CF6" /></div>
                    {isRTL ? "قيد يومي" : "Journal Entry"}
                  </button>
                  <button onClick={() => setActiveTab("coa")} style={{ minWidth: 160, height: 60, background: isDark ? ds.surface2 : "#F1F5F9", border: `1.5px solid ${border}`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: ds.textPrimary, fontSize: 16, fontWeight: 800, cursor: "pointer", flexShrink: 0, transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.borderColor="#3B82F6"} onMouseOut={e=>e.currentTarget.style.borderColor=border}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><Network size={20} color="#3B82F6" /></div>
                    {isRTL ? "دليل الحسابات" : "COA"}
                  </button>
                  <button onClick={() => setActiveTab("reports")} style={{ minWidth: 160, height: 60, background: isDark ? ds.surface2 : "#F1F5F9", border: `1.5px solid ${border}`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: ds.textPrimary, fontSize: 16, fontWeight: 800, cursor: "pointer", flexShrink: 0, transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.borderColor="#EC4899"} onMouseOut={e=>e.currentTarget.style.borderColor=border}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(236,72,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><PieChart size={20} color="#EC4899" /></div>
                    {isRTL ? "التقارير" : "Reports"}
                  </button>
                </div>

                {/* KPI Cards Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
                  <div style={{ background: "linear-gradient(135deg, #10B981, #059669)", borderRadius: 20, padding: 24, color: "white", display: "flex", flexDirection: "column", boxShadow: "0 10px 25px rgba(16,185,129,0.3)" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, opacity: 0.9, marginBottom: 8 }}>{isRTL ? "رصيد الصندوق" : "Safe Balance"}</span>
                    <span style={{ fontSize: 32, fontWeight: 900 }}>{balance.toLocaleString()} <span style={{ fontSize: 16, fontWeight: 700 }}>{isRTL ? "ر.ي" : "YER"}</span></span>
                  </div>
                  <div style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)", borderRadius: 20, padding: 24, color: "white", display: "flex", flexDirection: "column", boxShadow: "0 10px 25px rgba(59,130,246,0.3)" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, opacity: 0.9, marginBottom: 8 }}>{isRTL ? "رصيد البنك" : "Bank Balance"}</span>
                    <span style={{ fontSize: 32, fontWeight: 900 }}>1,450,000 <span style={{ fontSize: 16, fontWeight: 700 }}>{isRTL ? "ر.ي" : "YER"}</span></span>
                  </div>
                  <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowUpRight size={18} color="#3B82F6" /></div>
                      <span style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700 }}>{isRTL ? "إجمالي الإيرادات" : "Total Income"}</span>
                    </div>
                    <span style={{ color: ds.textPrimary, fontSize: 26, fontWeight: 900 }}>{totalIncome.toLocaleString()}</span>
                  </div>
                  <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowDownRight size={18} color="#EF4444" /></div>
                      <span style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700 }}>{isRTL ? "إجمالي المصروفات" : "Total Expenses"}</span>
                    </div>
                    <span style={{ color: ds.textPrimary, fontSize: 26, fontWeight: 900 }}>{totalExpense.toLocaleString()}</span>
                  </div>
                  <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24, display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "صافي الربح" : "Net Profit"}</span>
                    <span style={{ fontSize: 28, fontWeight: 900, color: balance >= 0 ? "#10B981" : "#EF4444" }}>{balance.toLocaleString()}</span>
                  </div>
                  <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24, display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "عدد القيود اليوم" : "Today's Entries"}</span>
                    <span style={{ fontSize: 28, fontWeight: 900, color: ds.textPrimary }}>{entries.length}</span>
                  </div>
                  <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24, display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "عدد السندات" : "Vouchers"}</span>
                    <span style={{ fontSize: 28, fontWeight: 900, color: ds.textPrimary }}>{transactions.length}</span>
                  </div>
                </div>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={22} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 16, pointerEvents: "none" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isRTL ? "ابحث في العمليات المالية..." : "Search transactions..."}
              style={{ width: "100%", height: 60, boxSizing: "border-box", paddingInlineStart: 50, paddingInlineEnd: 16, background: surface, border: `1.5px solid ${border}`, borderRadius: 14, color: ds.textPrimary, fontSize: 16, fontWeight: 700, outline: "none", fontFamily: "inherit" }}
            />
          </div>
          <motion.button title={isRTL ? "سند مالي جديد" : "New Voucher"} whileTap={{ scale: 0.95 }} onClick={() => setShowForm("income")}
            style={{ height: 60, background: "#3B82F6", color: "white", border: "none", borderRadius: 14, padding: "0 24px", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(59,130,246,0.3)" }}>
            <Plus size={22} strokeWidth={2.5} /> {isRTL ? "إضافة سند" : "New Voucher"}
          </motion.button>
          <motion.button title={isRTL ? "تصدير إلى إكسل" : "Export to Excel"} whileTap={{ scale: 0.95 }} 
            onClick={() => {
              const exportMap = isRTL ? {
                id: "رقم المرجع",
                type: "النوع",
                category: "التصنيف",
                description: "البيان",
                amount: "المبلغ",
                date: "التاريخ"
              } : undefined;
              
              const formattedData = filteredData.map(t => ({
                ...t,
                type: t.type === "income" ? (isRTL ? "قبض" : "Income") : (isRTL ? "صرف" : "Expense"),
                category: getCategoryName(t.category),
                date: new Date(t.date).toLocaleString()
              }));
              exportToExcel(formattedData, "Transactions", exportMap);
            }}
            style={{ height: 60, background: isDark ? ds.surface2 : "#F1F5F9", color: ds.textPrimary, border: "none", borderRadius: 14, padding: "0 20px", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: "inherit" }}>
            <Download size={22} strokeWidth={2.5} /> {isRTL ? "تصدير" : "Export"}
          </motion.button>
        </div>

        {/* Transactions List */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: ds.textPrimary }}>{isRTL ? "آخر العمليات" : "Recent Transactions"}</h3>
        </div>
        <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, overflow: "hidden" }}>
          {filteredData.map((trx, idx) => (
            <motion.div key={trx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedTransaction(trx)}
              style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottom: idx === filteredData.length - 1 ? "none" : `1px solid ${border}` }}>
              
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: trx.type === "income" ? "rgba(59,130,246,0.1)" : "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {trx.type === "income" ? <ArrowUpRight size={24} color="#3B82F6" /> : <ArrowDownRight size={24} color="#EF4444" />}
                </div>
                <div>
                  <h4 style={{ color: ds.textPrimary, fontSize: 17, fontWeight: 800, marginBottom: 6 }}>{trx.description}</h4>
                  <div style={{ display: "flex", gap: 16, color: ds.textSecondary, fontSize: 14, fontWeight: 600 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><FileText size={16} /> {getCategoryName(trx.category)}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Calendar size={16} /> {new Date(trx.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ color: trx.type === "income" ? "#3B82F6" : "#EF4444", fontSize: 18, fontWeight: 900 }}>
                {trx.type === "income" ? "+" : "-"}{trx.amount.toLocaleString()}
              </div>
            </motion.div>
          ))}
          {filteredData.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: ds.textMuted, fontSize: 14, fontWeight: 500 }}>
              {isRTL ? "لا توجد عمليات مالية" : "No transactions found"}
            </div>
          )}
        </div>
              </div>
            </motion.div>
          )}

          {activeTab === "coa" && (
            <motion.div key="coa" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ height: "100%" }}>
              <ChartOfAccountsScreen />
            </motion.div>
          )}

          {activeTab === "journal" && (
            <motion.div key="journal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ height: "100%" }}>
              <JournalEntriesScreen entries={entries} lines={lines} setEntries={() => {}} setLines={() => {}} />
            </motion.div>
          )}

          {activeTab === "reports" && (
            <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ height: "100%" }}>
              <ReportsModule />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showForm && (
          <TransactionFormSheet 
            key="form"
            initialType={showForm} 
            onClose={() => setShowForm(null)}
            onSave={(data, print) => {
              const newTrx: Transaction = {
                id: `tx_${Date.now()}`, type: data.type, date: new Date().toISOString(), ...data
              };
              setTransactions([newTrx, ...transactions]);

              // ✅ DOMAIN MODULE INTEGRATION: Create actual Vouchers if entity is linked
              const voucherNumber = `VCH-${Math.floor(10000 + Math.random() * 90000)}`;
              
              // ✅ Route customer receipts through the central financial service
              if (data.entity_type === "customer" && data.type === "income" && data.entity_id) {
                store.addReceiptVoucher({
                  id: newTrx.id,
                  customer_id: data.entity_id,
                  invoice_id: data.selected_invoices?.length > 0 ? data.selected_invoices[0] : undefined,
                  amount: data.amount,
                  base_amount: data.base_amount,
                  currency_id: data.currency_id,
                  exchange_rate: data.exchange_rate,
                  method: data.payment_method === "cash" ? "Cash" : "Bank Transfer",
                  ref: data.reference || voucherNumber,
                  date: new Date().toISOString(),
                  notes: data.description,
                });
              } else if (data.entity_type === "supplier" && data.type === "expense" && data.entity_id) {
                store.addSupplierPayment({
                  id: newTrx.id,
                  supplier_id: data.entity_id,
                  invoice_id: data.selected_invoices?.length > 0 ? data.selected_invoices[0] : undefined,
                  amount: data.amount,
                  base_amount: data.base_amount,
                  currency_id: data.currency_id,
                  exchange_rate: data.exchange_rate,
                  method: data.payment_method === "cash" ? "Cash" : "Bank Transfer",
                  ref: data.reference || voucherNumber,
                  date: new Date().toISOString(),
                  notes: data.description,
                });
              } else {
                // General voucher (not linked to customer/supplier) — post GL directly
                const finalCategory = data.category;
                try {
                  const postingResult = postVoucher({
                    voucherId:    newTrx.id,
                    voucherNumber,
                    type:         data.type,
                    amount:       data.amount,
                    baseAmount:   data.base_amount,
                    currencyId:   data.currency_id || MOCK_CURRENCIES[0].id,
                    exchangeRate: data.exchange_rate || 1,
                    category:     finalCategory,
                    entityName:   data.entity_name,
                    description:  data.description,
                  });
                  const { balanced } = validatePostingBalance(postingResult);
                  if (!balanced) console.warn("[AccountingEngine] Voucher not balanced:", voucherNumber);
                  storeAddPosting(postingResult);
                } catch (err) {
                  console.error("[AccountingEngine] Failed to post voucher:", err);
                }
              }
              
              if (print) {
                const w = window.open("", "", "width=900,height=800");
                if (w) {
                  w.document.write(generateVoucherHTML({
                    businessName: MOCK_BUSINESS.business_name,
                    businessPhone: MOCK_BUSINESS.primary_phone || "",
                    businessAddress: "المركز الرئيسي",
                    voucherType: data.type,
                    voucherNumber: `VCH-${Math.floor(10000 + Math.random() * 90000)}`,
                    voucherDate: new Date().toLocaleDateString(isRTL ? "ar-YE" : "en-US"),
                    voucherTime: new Date().toLocaleTimeString(isRTL ? "ar-YE" : "en-US"),
                    status: isRTL ? "معتمد" : "Approved",
                    entityType: data.entity_type,
                    entityName: data.entity_name || (isRTL ? "حساب عام" : "General Account"),
                    amount: data.amount,
                    currency: MOCK_CURRENCIES.find(c => c.id === data.currency_id)?.currency_symbol || "YER",
                    baseAmount: data.base_amount,
                    baseCurrency: MOCK_CURRENCIES.find(c => c.is_base_currency)?.currency_symbol || "YER",
                    paymentMethod: data.payment_method === "cash" ? (isRTL ? "نقداً (صندوق)" : "Cash") : (isRTL ? "تحويل بنكي" : "Bank Transfer"),
                    category: getCategoryName(data.category),
                    createdBy: "Admin",
                    notes: data.description,
                    reference: data.reference,
                    isRTL,
                    appName: "Smart Merchant",
                  }));
                  w.document.close();
                }
              }
              
              setShowForm(null);
            }} 
          />
        )}
        
        {showJournalForm && (
          <JournalEntryFormSheet 
            onClose={() => setShowJournalForm(false)} 
            onSave={(entry) => {
              storeAddPosting(entry as any);
              setShowJournalForm(false);
            }} 
          />
        )}

        {selectedTransaction && (
          <TransactionDetailsSheet 
            key="details"
            transaction={selectedTransaction} 
            onClose={() => setSelectedTransaction(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
