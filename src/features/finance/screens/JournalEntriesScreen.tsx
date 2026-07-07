import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, FileText, CheckCircle, Clock, Download,
  ShoppingCart, Package, ArrowUpRight, ArrowDownRight,
  RotateCcw, ChevronRight, Scale, AlertTriangle,
  SlidersHorizontal, X, Calendar, ChevronDown,
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useAccountingStore } from "@/core/engine/accountingStore";
import { MOCK_CHART_OF_ACCOUNTS, MOCK_CURRENCIES } from "@/core/data/financeMockData";
import { JournalEntryFormSheet } from "../components/JournalEntryFormSheet";
import { JournalEntryDetailView } from "../components/JournalEntryDetailView";
import { exportToExcel } from "@/core/utils/exportUtils";
import { addPosting } from "@/core/engine/accountingStore";
import type { JournalEntry } from "@/core/types/finance";

// ─── Reference type config ────────────────────────────────────────────────────
const REF_CONFIG: Record<string, { icon: any; color: string; bg: string; label_ar: string; label_en: string }> = {
  SalesInvoice:    { icon: ShoppingCart,   color: "#3B82F6", bg: "rgba(59,130,246,0.12)",  label_ar: "فاتورة مبيعات",   label_en: "Sales Invoice" },
  SalesReturn:     { icon: RotateCcw,      color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  label_ar: "مرتجع مبيعات",   label_en: "Sales Return" },
  PurchaseInvoice: { icon: Package,        color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  label_ar: "فاتورة مشتريات", label_en: "Purchase Invoice" },
  PurchaseReturn:  { icon: RotateCcw,      color: "#EF4444", bg: "rgba(239,68,68,0.12)",   label_ar: "مرتجع مشتريات", label_en: "Purchase Return" },
  Payment:         { icon: ArrowUpRight,   color: "#10B981", bg: "rgba(16,185,129,0.12)",  label_ar: "سند مالي",        label_en: "Voucher" },
  Expense:         { icon: ArrowDownRight, color: "#EF4444", bg: "rgba(239,68,68,0.12)",   label_ar: "مصروف",           label_en: "Expense" },
  Manual:          { icon: FileText,       color: "#64748B", bg: "rgba(100,116,139,0.12)", label_ar: "قيد يدوي",        label_en: "Manual" },
  Income:          { icon: ArrowUpRight,   color: "#10B981", bg: "rgba(16,185,129,0.12)",  label_ar: "إيراد",           label_en: "Income" },
};

function getBaseCurrencySymbol(): string {
  return MOCK_CURRENCIES.find(c => c.is_base_currency)?.currency_symbol ?? "ر.ي";
}

export function JournalEntriesScreen({
  entries: _entries,
  lines: _lines,
  setEntries,
  setLines,
}: {
  entries?: JournalEntry[];
  lines?: any[];
  setEntries?: any;
  setLines?: any;
}) {
  const { isDark, isRTL, ds } = useApp();
  const store = useAccountingStore();

  const entries = store.entries;
  const lines   = store.lines;

  const [search, setSearch]               = useState("");
  const [filterType, setFilterType]       = useState("all");
  const [showForm, setShowForm]           = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  // ── Advanced filter state ──────────────────────────────────────────────────
  const [showAdvanced, setShowAdvanced]   = useState(false);
  const [filterStatus, setFilterStatus]   = useState("all");     // all | Posted | Draft
  const [filterBalance, setFilterBalance] = useState("all");     // all | balanced | unbalanced
  const [dateFrom, setDateFrom]           = useState("");
  const [dateTo, setDateTo]               = useState("");
  const [amountMin, setAmountMin]         = useState("");
  const [amountMax, setAmountMax]         = useState("");

  const hasActiveFilters = filterStatus !== "all" || filterBalance !== "all" || dateFrom || dateTo || amountMin || amountMax;

  function clearAllFilters() {
    setFilterStatus("all");
    setFilterBalance("all");
    setDateFrom("");
    setDateTo("");
    setAmountMin("");
    setAmountMax("");
    setSearch("");
    setFilterType("all");
  }

  const bg      = isDark ? ds.bg      : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border  = isDark ? ds.border  : "#E2E8F0";
  const baseSym = getBaseCurrencySymbol();

  // Enrich entries
  const enriched = useMemo(() => {
    return entries.map(e => {
      const eLines      = lines.filter(l => l.journal_entry_id === e.id);
      const totalDebit  = eLines.reduce((s: number, l: any) => s + (l.base_debit_amount  || l.debit_amount  || 0), 0);
      const totalCredit = eLines.reduce((s: number, l: any) => s + (l.base_credit_amount || l.credit_amount || 0), 0);
      const balanced    = Math.abs(totalDebit - totalCredit) < 0.01;
      return { ...e, totalDebit, totalCredit, balanced, linesCount: eLines.length };
    });
  }, [entries, lines]);

  const filterTabs = [
    { key: "all",            label: isRTL ? "الكل" : "All" },
    { key: "SalesInvoice",   label: isRTL ? "مبيعات" : "Sales" },
    { key: "PurchaseInvoice",label: isRTL ? "مشتريات" : "Purchases" },
    { key: "Payment",        label: isRTL ? "سندات" : "Vouchers" },
    { key: "Manual",         label: isRTL ? "يدوي" : "Manual" },
  ];

  const filtered = useMemo(() => {
    return enriched.filter(e => {
      const matchType    = filterType === "all" || e.reference_type === filterType;
      const matchSearch  = !search
        || e.journal_number.toLowerCase().includes(search.toLowerCase())
        || (e.notes || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus  = filterStatus === "all"  || e.status === filterStatus;
      const matchBalance = filterBalance === "all" || (filterBalance === "balanced" ? e.balanced : !e.balanced);
      const entryDate    = new Date(e.journal_date || Date.now()).getTime();
      const matchFrom    = !dateFrom || entryDate >= new Date(dateFrom).getTime();
      const matchTo      = !dateTo   || entryDate <= new Date(dateTo + "T23:59:59").getTime();
      const matchMin     = !amountMin || e.totalDebit >= parseFloat(amountMin);
      const matchMax     = !amountMax || e.totalDebit <= parseFloat(amountMax);
      return matchType && matchSearch && matchStatus && matchBalance && matchFrom && matchTo && matchMin && matchMax;
    });
  }, [enriched, search, filterType, filterStatus, filterBalance, dateFrom, dateTo, amountMin, amountMax]);

  const totalPosted     = enriched.filter(e => e.status === "Posted").length;
  const totalUnbalanced = enriched.filter(e => !e.balanced).length;
  const grandDebit      = enriched.reduce((s, e) => s + e.totalDebit, 0);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(isRTL ? "ar-YE" : "en-US", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>

      {/* ── Header ── */}
      <div style={{ padding: "16px 24px", background: surface, borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
        {/* KPI row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {[
            { label: isRTL ? "إجمالي القيود"    : "Total Entries", value: enriched.length,  unit: isRTL ? "قيد"  : "entries", color: "#3B82F6", icon: FileText     },
            { label: isRTL ? "مُرحَّل"            : "Posted",        value: totalPosted,      unit: isRTL ? "قيد"  : "entries", color: "#10B981", icon: CheckCircle  },
            { label: isRTL ? "المدين الكلي"      : "Total Debit",   value: grandDebit.toLocaleString(), unit: baseSym, color: "#8B5CF6", icon: Scale },
            { label: isRTL ? "غير متوازن"        : "Unbalanced",   value: totalUnbalanced,  unit: isRTL ? "قيد"  : "entries", color: totalUnbalanced > 0 ? "#EF4444" : "#10B981", icon: AlertTriangle },
          ].map(k => {
            const Icon = k.icon;
            return (
              <div key={k.label} style={{ flex: 1, background: isDark ? ds.surface2 : "#F8FAFC", borderRadius: 14, padding: "12px 14px", border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${k.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={17} color={k.color} />
                  </div>
                  <span style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>{k.label}</span>
                </div>
                <div style={{ textAlign: isRTL ? "left" : "right" }}>
                  <span style={{ color: k.color, fontSize: 16, fontWeight: 800 }}>{k.value}</span>
                  <span style={{ color: ds.textMuted, fontSize: 11, marginInlineStart: 4 }}>{k.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={16} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isRTL ? "ابحث برقم القيد أو البيان..." : "Search by number or description..."}
              style={{ width: "100%", height: 60, boxSizing: "border-box", paddingInlineStart: 44, paddingInlineEnd: 14, background: isDark ? ds.surface2 : "#FFFFFF", border: `1.5px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 14, color: ds.textPrimary, fontSize: 16, outline: "none", fontFamily: "inherit", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
            />
          </div>

          {/* ── Advanced Filter Button ── */}
          <button
            onClick={() => setShowAdvanced(v => !v)}
            style={{ height: 60, padding: "0 20px", borderRadius: 14, background: hasActiveFilters ? "rgba(59,130,246,0.12)" : (isDark ? ds.surface2 : "#F1F5F9"), border: `1.5px solid ${hasActiveFilters ? "#3B82F6" : border}`, color: hasActiveFilters ? "#3B82F6" : ds.textPrimary, fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", position: "relative" }}
          >
            <SlidersHorizontal size={20} />
            {isRTL ? "تصفية" : "Filter"}
            {hasActiveFilters && (
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#3B82F6", color: "white", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {[filterStatus !== "all", filterBalance !== "all", !!dateFrom, !!dateTo, !!amountMin, !!amountMax].filter(Boolean).length}
              </span>
            )}
            <ChevronDown size={14} style={{ transform: showAdvanced ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </button>

          <button
            onClick={() => {
              exportToExcel(filtered.map(e => ({
                journal_number: e.journal_number,
                journal_date:   new Date(e.journal_date || Date.now()).toLocaleDateString(),
                reference_type: e.reference_type || "Manual",
                notes:          e.notes || "",
                total_debit:    e.totalDebit,
                lines_count:    e.linesCount,
                status:         e.status,
                balanced:       e.balanced ? "✅" : "❌",
              })), "Journal_Entries");
            }}
            style={{ height: 60, padding: "0 20px", borderRadius: 14, background: isDark ? ds.surface2 : "#F1F5F9", border: `1.5px solid ${border}`, color: ds.textPrimary, fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
          >
            <Download size={20} />{isRTL ? "تصدير" : "Export"}
          </button>
          <button
            onClick={() => setShowForm(true)}
            style={{ height: 60, padding: "0 20px", borderRadius: 14, background: "linear-gradient(135deg,#10B981,#059669)", border: "none", color: "white", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            <Plus size={20} strokeWidth={2.5} />{isRTL ? "قيد يدوي" : "Manual Entry"}
          </button>
        </div>

        {/* ── Advanced Filter Panel (collapsible) ── */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ background: isDark ? ds.surface2 : "#F0F9FF", border: `1.5px solid ${isDark ? ds.border : "#BAE6FD"}`, borderRadius: 14, padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#0369A1", display: "flex", alignItems: "center", gap: 6 }}>
                    <SlidersHorizontal size={14} color="#0369A1" />
                    {isRTL ? "خيارات التصفية المتقدمة" : "Advanced Filter Options"}
                  </span>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <X size={12} /> {isRTL ? "مسح الكل" : "Clear All"}
                    </button>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  {/* Status */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: ds.textSecondary, marginBottom: 6 }}>{isRTL ? "الحالة" : "Status"}</label>
                    <select
                      value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                      style={{ width: "100%", height: 56, padding: "0 16px", borderRadius: 12, border: `1.5px solid ${filterStatus !== "all" ? "#3B82F6" : border}`, background: isDark ? ds.surface : "#fff", color: ds.textPrimary, fontFamily: "inherit", fontWeight: 700, fontSize: 15, outline: "none" }}
                    >
                      <option value="all">{isRTL ? "الكل" : "All"}</option>
                      <option value="Posted">{isRTL ? "مُرحَّل" : "Posted"}</option>
                      <option value="Draft">{isRTL ? "مسودة" : "Draft"}</option>
                      <option value="Reversed">{isRTL ? "مُعكوس" : "Reversed"}</option>
                    </select>
                  </div>

                  {/* Balance */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "التوازن" : "Balance"}</label>
                    <select
                      value={filterBalance} onChange={e => setFilterBalance(e.target.value)}
                      style={{ width: "100%", height: 56, padding: "0 16px", borderRadius: 12, border: `1.5px solid ${filterBalance !== "all" ? "#3B82F6" : border}`, background: isDark ? ds.surface : "#fff", color: ds.textPrimary, fontFamily: "inherit", fontWeight: 700, fontSize: 15, outline: "none" }}
                    >
                      <option value="all">{isRTL ? "الكل" : "All"}</option>
                      <option value="balanced">{isRTL ? "✅ متوازن" : "✅ Balanced"}</option>
                      <option value="unbalanced">{isRTL ? "⚠️ غير متوازن" : "⚠️ Unbalanced"}</option>
                    </select>
                  </div>

                  {/* Date From */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: ds.textSecondary, marginBottom: 8 }}>
                      <Calendar size={14} style={{ verticalAlign: "middle", marginInlineEnd: 4 }} />
                      {isRTL ? "من تاريخ" : "Date From"}
                    </label>
                    <input
                      type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                      style={{ width: "100%", height: 56, padding: "0 16px", borderRadius: 12, border: `1.5px solid ${dateFrom ? "#3B82F6" : border}`, background: isDark ? ds.surface : "#fff", color: ds.textPrimary, fontFamily: "inherit", fontSize: 15, fontWeight: 700, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: ds.textSecondary, marginBottom: 8 }}>
                      <Calendar size={14} style={{ verticalAlign: "middle", marginInlineEnd: 4 }} />
                      {isRTL ? "إلى تاريخ" : "Date To"}
                    </label>
                    <input
                      type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                      style={{ width: "100%", height: 56, padding: "0 16px", borderRadius: 12, border: `1.5px solid ${dateTo ? "#3B82F6" : border}`, background: isDark ? ds.surface : "#fff", color: ds.textPrimary, fontFamily: "inherit", fontSize: 15, fontWeight: 700, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Amount Min */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? `المدين من (${baseSym})` : `Min Debit (${baseSym})`}</label>
                    <input
                      type="number" value={amountMin} onChange={e => setAmountMin(e.target.value)}
                      placeholder="0"
                      style={{ width: "100%", height: 56, padding: "0 16px", borderRadius: 12, border: `1.5px solid ${amountMin ? "#3B82F6" : border}`, background: isDark ? ds.surface : "#fff", color: ds.textPrimary, fontFamily: "inherit", fontSize: 15, fontWeight: 700, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Amount Max */}
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? `المدين حتى (${baseSym})` : `Max Debit (${baseSym})`}</label>
                    <input
                      type="number" value={amountMax} onChange={e => setAmountMax(e.target.value)}
                      placeholder="∞"
                      style={{ width: "100%", height: 56, padding: "0 16px", borderRadius: 12, border: `1.5px solid ${amountMax ? "#3B82F6" : border}`, background: isDark ? ds.surface : "#fff", color: ds.textPrimary, fontFamily: "inherit", fontSize: 15, fontWeight: 700, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                {/* Active filter summary */}
                {hasActiveFilters && (
                  <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {filterStatus !== "all" && (
                      <span style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        {isRTL ? "الحالة:" : "Status:"} {filterStatus}
                        <button onClick={() => setFilterStatus("all")} style={{ background: "none", border: "none", cursor: "pointer", color: "#3B82F6", padding: 0, display: "flex" }}><X size={12} /></button>
                      </span>
                    )}
                    {filterBalance !== "all" && (
                      <span style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        {filterBalance === "balanced" ? (isRTL ? "✅ متوازن" : "✅ Balanced") : (isRTL ? "⚠️ غير متوازن" : "⚠️ Unbalanced")}
                        <button onClick={() => setFilterBalance("all")} style={{ background: "none", border: "none", cursor: "pointer", color: "#3B82F6", padding: 0, display: "flex" }}><X size={12} /></button>
                      </span>
                    )}
                    {dateFrom && (
                      <span style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        {isRTL ? "من:" : "From:"} {dateFrom}
                        <button onClick={() => setDateFrom("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#3B82F6", padding: 0, display: "flex" }}><X size={12} /></button>
                      </span>
                    )}
                    {dateTo && (
                      <span style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        {isRTL ? "إلى:" : "To:"} {dateTo}
                        <button onClick={() => setDateTo("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#3B82F6", padding: 0, display: "flex" }}><X size={12} /></button>
                      </span>
                    )}
                    {(amountMin || amountMax) && (
                      <span style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        {amountMin || "0"} → {amountMax || "∞"} {baseSym}
                        <button onClick={() => { setAmountMin(""); setAmountMax(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#3B82F6", padding: 0, display: "flex" }}><X size={12} /></button>
                      </span>
                    )}
                    <span style={{ color: ds.textMuted, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center" }}>
                      {isRTL ? `${filtered.length} نتيجة` : `${filtered.length} results`}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ padding: "12px 24px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {filterTabs.map(tab => (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterType(tab.key)}
              style={{ whiteSpace: "nowrap", padding: "7px 16px", background: filterType === tab.key ? "#10B981" : (isDark ? ds.surface : "#FFFFFF"), color: filterType === tab.key ? "white" : ds.textSecondary, border: `1px solid ${filterType === tab.key ? "#10B981" : (isDark ? ds.border : "#E2E8F0")}`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: filterType === tab.key ? "0 4px 12px rgba(16,185,129,0.28)" : "none", transition: "all 0.18s" }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 24px" }}>
        <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
          {filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center", gap: 12 }}>
              <div style={{ width: 72, height: 72, borderRadius: 24, background: isDark ? ds.surface2 : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={32} color={ds.textMuted} strokeWidth={1.5} />
              </div>
              <p style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700, margin: 0 }}>{isRTL ? "لا توجد قيود مطابقة" : "No journal entries found"}</p>
              <p style={{ color: ds.textSecondary, fontSize: 13, margin: 0 }}>{isRTL ? "أنشئ فاتورة بيع أو شراء أو سنداً مالياً ليظهر هنا تلقائياً" : "Create a sales/purchase invoice or financial voucher to see it here"}</p>
            </div>
          ) : (
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left", whiteSpace: "nowrap" }}>
                <thead>
                  <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `2px solid ${border}` }}>
                    <th style={{ padding: "20px", color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 16, fontWeight: 900 }}>{isRTL ? "رقم القيد" : "Entry #"}</th>
                    <th style={{ padding: "20px", color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 16, fontWeight: 900 }}>{isRTL ? "التاريخ" : "Date"}</th>
                    <th style={{ padding: "20px", color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 16, fontWeight: 900 }}>{isRTL ? "نوع العملية" : "Type"}</th>
                    <th style={{ padding: "20px", color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 16, fontWeight: 900 }}>{isRTL ? "البيان" : "Description"}</th>
                    <th style={{ padding: "20px", color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 16, fontWeight: 900 }}>{isRTL ? "الأسطر" : "Lines"}</th>
                    <th style={{ padding: "20px", color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 16, fontWeight: 900 }}>{isRTL ? "الحالة" : "Status"}</th>
                    <th style={{ padding: "20px", color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 16, fontWeight: 900, textAlign: isRTL ? "left" : "right" }}>{isRTL ? `المدين (${baseSym})` : `Debit (${baseSym})`}</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry, i) => {
                    const cfg  = REF_CONFIG[entry.reference_type || "Manual"] || REF_CONFIG.Manual;
                    const Icon = cfg.icon;
                    return (
                      <tr
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        style={{ cursor: "pointer", borderBottom: `1px solid ${isDark ? ds.border : "#F1F5F9"}`, transition: "background 0.15s", borderInlineStart: entry.balanced ? "none" : "3px solid #EF4444" }}
                        onMouseOver={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC"}
                        onMouseOut={e  => e.currentTarget.style.background = "transparent"}
                      >
                        {/* رقم القيد */}
                        <td style={{ padding: "20px", fontWeight: 800, color: ds.textPrimary, fontSize: 16, direction: "ltr", textAlign: isRTL ? "right" : "left" }}>
                          {entry.journal_number}
                        </td>
                        {/* التاريخ */}
                        <td style={{ padding: "20px", fontSize: 15, color: ds.textSecondary, fontWeight: 600 }}>
                          {formatDate(entry.journal_date || new Date().toISOString())}
                        </td>
                        {/* النوع */}
                        <td style={{ padding: "20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Icon size={18} color={cfg.color} />
                            </div>
                            <span style={{ fontSize: 15, fontWeight: 800, color: cfg.color }}>{isRTL ? cfg.label_ar : cfg.label_en}</span>
                          </div>
                        </td>
                        {/* البيان */}
                        <td style={{ padding: "20px", fontSize: 15, color: ds.textSecondary, fontWeight: 600, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {entry.notes || (isRTL ? "—" : "—")}
                        </td>
                        {/* الأسطر */}
                        <td style={{ padding: "20px", fontSize: 15, color: ds.textMuted, fontWeight: 700, textAlign: "center" }}>
                          {entry.linesCount}
                        </td>
                        {/* الحالة */}
                        <td style={{ padding: "20px" }}>
                          {entry.status === "Posted"
                            ? <span style={{ padding: "6px 14px", background: "rgba(16,185,129,0.1)", color: "#10B981", borderRadius: 10, fontSize: 14, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <CheckCircle size={14} />{isRTL ? "مُرحَّل" : "Posted"}
                              </span>
                            : <span style={{ padding: "6px 14px", background: "rgba(245,158,11,0.1)", color: "#F59E0B", borderRadius: 10, fontSize: 14, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <Clock size={14} />{isRTL ? "مسودة" : "Draft"}
                              </span>
                          }
                          {!entry.balanced && (
                            <span style={{ marginInlineStart: 6, padding: "6px 10px", background: "rgba(239,68,68,0.1)", color: "#EF4444", borderRadius: 10, fontSize: 14, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}>
                              ⚠️
                            </span>
                          )}
                        </td>
                        {/* المبلغ */}
                        <td style={{ padding: "20px", fontWeight: 900, color: ds.textPrimary, fontSize: 16, textAlign: isRTL ? "left" : "right" }}>
                          {entry.totalDebit.toLocaleString()}
                          <span style={{ fontSize: 14, fontWeight: 600, color: ds.textMuted, marginInlineStart: 4 }}>{baseSym}</span>
                        </td>
                        {/* Arrow */}
                        <td style={{ padding: "20px", textAlign: "center" }}>
                          <ChevronRight size={20} color={ds.textMuted} style={{ transform: isRTL ? "rotate(180deg)" : undefined }} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showForm && (
          <JournalEntryFormSheet
            key="form"
            onClose={() => setShowForm(false)}
            onSave={(entryData: any, newLines: any) => {
              const now = new Date().toISOString();
              const newEntry: JournalEntry = {
                id: `je_manual_${Date.now()}`,
                business_id:      "biz_001",
                fiscal_year_id:   "fy_2024",
                fiscal_period_id: "fp_2024_06",
                journal_number:   `JE-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
                journal_date:     now.split("T")[0],
                reference_type:   "Manual",
                reference_id:     `manual_${Date.now()}`,
                currency_id:      "cur_yer",
                exchange_rate:    1,
                status:           "Draft",
                notes:            entryData.description || null,
                created_by:       "usr_001",
                created_at:       now,
                updated_at:       now,
              };
              addPosting({ entry: newEntry, lines: newLines || [] });
              setShowForm(false);
            }}
          />
        )}
        {selectedEntry && (
          <JournalEntryDetailView
            key="detail"
            entry={selectedEntry}
            lines={lines || []}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
