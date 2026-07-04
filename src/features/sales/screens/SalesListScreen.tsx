import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Search, Filter, FileText, CheckCircle2, Clock, XCircle,
  AlertCircle, ChevronRight, TrendingUp, ArrowUpRight,
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_SALES_INVOICES, MOCK_SALES_INVOICE_ITEMS, MOCK_CUSTOMERS } from "@/core/data/salesMockData";
import { MOCK_BUSINESS } from "@/core/data/mockData";
import type { SalesInvoiceWithDetails } from "@/core/types/sales";

interface SalesListScreenProps {
  onNewInvoice: () => void;
  onViewInvoice: (inv: SalesInvoiceWithDetails) => void;
}

type FilterTab = "all" | "paid" | "partially_paid" | "draft" | "overdue" | "cancelled";

const STATUS_CONFIG: Record<InvoiceStatus, { labelKey: string; color: string; bg: string; Icon: React.FC<{ size?: number; color?: string; strokeWidth?: number }> }> = {
  paid:           { labelKey: "invoicePaid",      color: "#16A34A", bg: "rgba(22, 163, 74, 0.12)",   Icon: CheckCircle2 },
  partially_paid: { labelKey: "invoicePartial",   color: "#F59E0B", bg: "rgba(245, 158, 11, 0.12)", Icon: Clock },
  draft:          { labelKey: "invoiceDraft",     color: "#64748B", bg: "rgba(100, 116, 139, 0.12)",Icon: FileText },
  confirmed:      { labelKey: "invoiceConfirmed", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.12)", Icon: CheckCircle2 },
  cancelled:      { labelKey: "invoiceCancelled", color: "#EF4444", bg: "rgba(239, 68, 68, 0.12)",  Icon: XCircle },
  overdue:        { labelKey: "invoiceOverdue",   color: "#DC2626", bg: "rgba(220, 38, 38, 0.12)",  Icon: AlertCircle },
};

export function SalesListScreen({ onNewInvoice, onViewInvoice }: SalesListScreenProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const business = MOCK_BUSINESS;
  const currency = business.default_currency === "YER" ? "ر.ي" : business.default_currency;

  // Filter tabs
  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all",           label: t.filterAll },
    { key: "paid",          label: t.filterPaid },
    { key: "partially_paid",label: t.filterUnpaid },
    { key: "draft",         label: t.filterDraft },
  ];

  const filtered = useMemo(() => {
    return MOCK_SALES_INVOICES.filter((inv) => {
      const matchFilter =
        activeFilter === "all" ||
        (activeFilter === "paid" && inv.payment_status === "Paid") ||
        (activeFilter === "partially_paid" && inv.payment_status === "Partial") ||
        (activeFilter === "draft" && inv.status === "Draft");
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        inv.invoice_number.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [search, activeFilter]);

  // Summary stats
  const todayTotal = MOCK_SALES_INVOICES
    .filter((i) => i.payment_status === "Paid" || i.payment_status === "Partial")
    .reduce((s, i) => s + i.grand_total, 0);
  const pendingCount = MOCK_SALES_INVOICES.filter((i) => i.payment_status === "Partial" || i.payment_status === "Unpaid").length;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(isRTL ? "ar-YE" : "en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: isDark ? ds.bg : "#F8FAFC" }}>

      {/* ═══════════════════════════════════════════════════
          HEADER — Title + Primary CTA in one prominent row
          ═══════════════════════════════════════════════════ */}
      <div style={{
        padding: "20px 24px 16px",
        background: isDark ? ds.surface : "#FFFFFF",
        borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`,
        flexShrink: 0,
      }}>
        {/* Row 1: Page title (left) + New Invoice CTA (right) — always visible, primary hierarchy */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>

          {/* Title block */}
          <div>
            <h1 style={{ color: ds.textPrimary, fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.3 }}>
              {t.allInvoices}
            </h1>
            <p style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 500, marginTop: 3, marginBottom: 0 }}>
              {t.salesTitle}
            </p>
          </div>
        </div>

        {/* Row 2: Summary KPI cards */}
        <div style={{ display: "flex", gap: 10 }}>

          {/* Revenue card */}
          <div style={{
            flex: 1,
            background: isDark ? ds.surface2 : "#F8FAFC",
            borderRadius: 14,
            padding: "12px 14px",
            border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: "rgba(16,185,129,0.13)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <TrendingUp size={17} color="#10B981" strokeWidth={2.5} />
              </div>
              <span style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>
                {isRTL ? "إجمالي الإيرادات" : "Total Revenue"}
              </span>
            </div>
            <div style={{ textAlign: isRTL ? "left" : "right" }}>
              <span style={{ color: "#10B981", fontSize: 16, fontWeight: 800 }}>
                {todayTotal.toLocaleString()}
              </span>
              <span style={{ color: ds.textMuted, fontSize: 11, marginInlineStart: 4 }}>{currency}</span>
            </div>
          </div>

          {/* Pending card */}
          <div style={{
            flex: 1,
            background: isDark ? ds.surface2 : "#F8FAFC",
            borderRadius: 14,
            padding: "12px 14px",
            border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: "rgba(245,158,11,0.13)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Clock size={17} color="#F59E0B" strokeWidth={2.5} />
              </div>
              <span style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>
                {isRTL ? "معلقة" : "Pending"}
              </span>
            </div>
            <div style={{ textAlign: isRTL ? "left" : "right" }}>
              <span style={{ color: "#F59E0B", fontSize: 16, fontWeight: 800 }}>{pendingCount}</span>
              <span style={{ color: ds.textMuted, fontSize: 11, marginInlineStart: 4 }}>{t.invoices}</span>
            </div>
          </div>

          {/* Total invoices card */}
          <div style={{
            flex: 1,
            background: isDark ? ds.surface2 : "#F8FAFC",
            borderRadius: 14,
            padding: "12px 14px",
            border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: "rgba(37,99,235,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ArrowUpRight size={17} color="#2563EB" strokeWidth={2.5} />
              </div>
              <span style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>
                {isRTL ? "الكل" : "All"}
              </span>
            </div>
            <div style={{ textAlign: isRTL ? "left" : "right" }}>
              <span style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 800 }}>
                {MOCK_SALES_INVOICES.length}
              </span>
              <span style={{ color: ds.textMuted, fontSize: 11, marginInlineStart: 4 }}>{t.invoices}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          SEARCH + FILTER TABS
          ═══════════════════════════════════════ */}
      <div style={{ padding: "16px 20px 0", flexShrink: 0 }}>

        {/* Search input */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search size={16} color={ds.textMuted} style={{
            position: "absolute", top: "50%", transform: "translateY(-50%)",
            [isRTL ? "right" : "left"]: 14, pointerEvents: "none",
          }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchInvoices}
            style={{
              width: "100%", height: 44, boxSizing: "border-box",
              paddingInlineStart: 44, paddingInlineEnd: 14,
              background: isDark ? ds.surface : "#FFFFFF",
              border: `1.5px solid ${isDark ? ds.border : "#E2E8F0"}`,
              borderRadius: 12,
              color: ds.textPrimary, fontSize: 14,
              outline: "none", fontFamily: "inherit",
              boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
            }}
          />
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {filterTabs.map((tab) => (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(tab.key)}
              style={{
                whiteSpace: "nowrap",
                padding: "7px 16px",
                background: activeFilter === tab.key ? "#2563EB" : isDark ? ds.surface : "#FFFFFF",
                color: activeFilter === tab.key ? "white" : ds.textSecondary,
                border: `1px solid ${activeFilter === tab.key ? "#2563EB" : isDark ? ds.border : "#E2E8F0"}`,
                borderRadius: 10, fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: activeFilter === tab.key ? "0 4px 12px rgba(37,99,235,0.28)" : "none",
                transition: "all 0.18s ease",
              }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Invoice list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }}>
        {filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", gap: 12 }}>
            <div style={{ width: 72, height: 72, borderRadius: 24, background: isDark ? ds.surface : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={32} color={ds.textMuted} strokeWidth={1.5} />
            </div>
            <p style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700 }}>{t.noInvoicesYet}</p>
            <p style={{ color: ds.textSecondary, fontSize: 13 }}>{t.noInvoicesDesc}</p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onNewInvoice}
              style={{
                marginTop: 8, padding: "12px 28px",
                background: "linear-gradient(135deg, #1D4ED8, #2563EB)",
                color: "white", border: "none", borderRadius: 14,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", boxShadow: "0 6px 20px rgba(37,99,235,0.3)",
              }}
            >
              {t.newInvoice}
            </motion.button>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((inv, i) => {
              // Map DB status to UI config keys
              let cfgKey: string = "draft";
              if (inv.status === "Draft") cfgKey = "draft";
              else if (inv.status === "Cancelled") cfgKey = "cancelled";
              else if (inv.payment_status === "Paid") cfgKey = "paid";
              else if (inv.payment_status === "Partial") cfgKey = "partially_paid";
              else cfgKey = "confirmed";

              const cfg = STATUS_CONFIG[cfgKey as keyof typeof STATUS_CONFIG];
              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Populate items for the detailed view
                    const items = MOCK_SALES_INVOICE_ITEMS.filter(it => it.sales_invoice_id === inv.id).map(it => ({
                      ...it,
                      product_unit: { product: { name: `منتج تجريبي ${it.product_unit_id}` } }
                    })) as any;
                    const customer = MOCK_CUSTOMERS.find(c => c.id === inv.customer_id) || null;
                    onViewInvoice({ ...inv, items, customer } as any);
                  }}
                  style={{
                    background: isDark ? ds.surface : "#FFFFFF",
                    borderRadius: 20, padding: "16px",
                    marginBottom: 12,
                    border: `1px solid ${isDark ? ds.border : "#F1F5F9"}`,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 14,
                  }}
                >
                  {/* Icon */}
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <cfg.Icon size={22} color={cfg.color} strokeWidth={2} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700, direction: "ltr" }}>
                        {inv.invoice_number}
                      </span>
                      <span style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 800 }}>
                        {inv.grand_total.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 500, color: ds.textMuted }}>{currency}</span>
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 500 }}>
                        {t.cashCustomer}
                      </span>
                      <span style={{ padding: "3px 10px", background: cfg.bg, color: cfg.color, borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                        {t[cfg.labelKey]}
                      </span>
                    </div>
                    <span style={{ color: ds.textMuted, fontSize: 11, marginTop: 4, display: "block" }}>
                      {formatDate(inv.invoice_date)}
                    </span>
                  </div>

                  <ChevronRight size={16} color={ds.textMuted} style={{ transform: isRTL ? "rotate(180deg)" : undefined, flexShrink: 0 }} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
