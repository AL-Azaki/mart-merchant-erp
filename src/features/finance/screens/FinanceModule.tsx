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
import { Network, FileText as FileTextIcon, Columns } from "lucide-react";
import { MOCK_JOURNAL_ENTRIES, MOCK_JOURNAL_LINES } from "@/core/data/financeMockData";
import type { JournalEntry, JournalLine } from "@/core/types/finance";
import { exportToExcel } from "@/core/utils/exportUtils";

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
  const [entries, setEntries] = useState<JournalEntry[]>(MOCK_JOURNAL_ENTRIES);
  const [lines, setLines] = useState<JournalLine[]>(MOCK_JOURNAL_LINES);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState<"income" | "expense" | null>(initialAction);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<"cash" | "coa" | "journal">("cash");

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
    { id: "cash", label: isRTL ? "الخزينة والمصروفات" : "Cash & Expenses", icon: Wallet, color: "#10B981" },
    { id: "coa", label: isRTL ? "دليل الحسابات" : "Chart of Accounts", icon: Network, color: "#3B82F6" },
    { id: "journal", label: isRTL ? "القيود اليومية" : "Journal Entries", icon: FileTextIcon, color: "#8B5CF6" },
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
          {activeTab === "cash" && (
            <motion.div key="cash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        {/* Overview Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          {/* Balance */}
          <div style={{ background: "linear-gradient(135deg, #10B981, #059669)", borderRadius: 20, padding: 20, color: "white", display: "flex", flexDirection: "column", boxShadow: "0 10px 25px rgba(16,185,129,0.3)" }}>
            <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 8 }}>{isRTL ? "رصيد الصندوق" : "Safe Balance"}</span>
            <span style={{ fontSize: 24, fontWeight: 800 }}>{balance.toLocaleString()} {isRTL ? "ر.ي" : "YER"}</span>
          </div>
          {/* Incomes */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 20, padding: 20, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowUpRight size={16} color="#3B82F6" /></div>
              <span style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600 }}>{isRTL ? "إجمالي الإيرادات" : "Total Income"}</span>
            </div>
            <span style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800 }}>{totalIncome.toLocaleString()}</span>
          </div>
          {/* Expenses */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 20, padding: 20, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowDownRight size={16} color="#EF4444" /></div>
              <span style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600 }}>{isRTL ? "إجمالي المصروفات" : "Total Expenses"}</span>
            </div>
            <span style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800 }}>{totalExpense.toLocaleString()}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isRTL ? "ابحث في العمليات المالية..." : "Search transactions..."}
              style={{ width: "100%", height: 48, boxSizing: "border-box", paddingInlineStart: 44, paddingInlineEnd: 16, background: surface, border: `1px solid ${border}`, borderRadius: 14, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit" }}
            />
          </div>
          <motion.button title={isRTL ? "إنشاء سند صرف جديد" : "Create New Expense"} whileTap={{ scale: 0.95 }} onClick={() => setShowForm("expense")}
            style={{ height: 48, background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "none", borderRadius: 14, padding: "0 16px", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit" }}>
            <ArrowDownRight size={18} strokeWidth={2.5} /> {isRTL ? "سند صرف" : "Expense"}
          </motion.button>
          <motion.button title={isRTL ? "إنشاء سند قبض جديد" : "Create New Income"} whileTap={{ scale: 0.95 }} onClick={() => setShowForm("income")}
            style={{ height: 48, background: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "none", borderRadius: 14, padding: "0 16px", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit" }}>
            <ArrowUpRight size={18} strokeWidth={2.5} /> {isRTL ? "سند قبض" : "Income"}
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
            style={{ height: 48, background: isDark ? ds.surface2 : "#F1F5F9", color: ds.textPrimary, border: "none", borderRadius: 14, padding: "0 16px", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit" }}>
            <Download size={18} strokeWidth={2.5} /> {isRTL ? "تصدير" : "Export"}
          </motion.button>
        </div>

        {/* Transactions List */}
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 20, overflow: "hidden" }}>
          {filteredData.map((trx, idx) => (
            <motion.div key={trx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedTransaction(trx)}
              style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottom: idx === filteredData.length - 1 ? "none" : `1px solid ${border}` }}>
              
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: trx.type === "income" ? "rgba(59,130,246,0.1)" : "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {trx.type === "income" ? <ArrowUpRight size={20} color="#3B82F6" /> : <ArrowDownRight size={20} color="#EF4444" />}
                </div>
                <div>
                  <h4 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{trx.description}</h4>
                  <div style={{ display: "flex", gap: 12, color: ds.textSecondary, fontSize: 12, fontWeight: 500 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FileText size={12} /> {getCategoryName(trx.category)}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} /> {new Date(trx.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ color: trx.type === "income" ? "#3B82F6" : "#EF4444", fontSize: 16, fontWeight: 800 }}>
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
              <JournalEntriesScreen entries={entries} lines={lines} setEntries={setEntries} setLines={setLines} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showForm && (
          <TransactionFormSheet 
            key="form"
            type={showForm} 
            onClose={() => setShowForm(null)}
            onSave={(data, print) => {
              const newTrx: Transaction = {
                id: `tx_${Date.now()}`, type: showForm, date: new Date().toISOString(), ...data
              };
              setTransactions([newTrx, ...transactions]);

              // Automatically create a Journal Entry for this transaction
              const jId = `je_${Date.now()}`;
              const newEntry: JournalEntry = {
                id: jId,
                journal_number: `JE-${Math.floor(1000 + Math.random() * 9000)}`,
                reference_type: showForm === "expense" ? "Expense" : "Income",
                reference_id: newTrx.id,
                journal_date: new Date().toISOString(),
                notes: data.description,
                status: "Posted",
                created_by: "system",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              
              // Determine the correct account IDs from MOCK_CHART_OF_ACCOUNTS
              // Cash account: coa_111
              // Income (Sales): coa_41
              // Expense (Operating): coa_52
              const cashAccountId = "coa_111";
              const counterpartAccountId = showForm === "income" ? "coa_41" : "coa_52";

              const newLines: JournalLine[] = [
                { id: `jl_${Date.now()}_1`, journal_entry_id: jId, account_id: counterpartAccountId, debit_amount: showForm === "expense" ? data.amount : 0, credit_amount: showForm === "income" ? data.amount : 0, description: data.description },
                { id: `jl_${Date.now()}_2`, journal_entry_id: jId, account_id: cashAccountId, debit_amount: showForm === "income" ? data.amount : 0, credit_amount: showForm === "expense" ? data.amount : 0, description: data.description }
              ];

              setEntries([newEntry, ...entries]);
              setLines([...newLines, ...lines]);

              setShowForm(null);
              if (print) {
                setTimeout(() => {
                  window.print();
                }, 300);
              }
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
