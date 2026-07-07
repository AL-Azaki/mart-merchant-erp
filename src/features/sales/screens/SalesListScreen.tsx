import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Search, Filter, FileText, CheckCircle2, Clock, XCircle,
  AlertCircle, ChevronRight, TrendingUp, ArrowUpRight,
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_SALES_INVOICE_ITEMS, MOCK_CUSTOMERS } from "@/core/data/salesMockData";
import { MOCK_BUSINESS } from "@/core/data/mockData";
import type { SalesInvoiceWithDetails } from "@/core/types/sales";
import { useFinancialStore } from "@/core/engine/useFinancialStore";

interface SalesListScreenProps {
  onNewInvoice: () => void;
  onViewInvoice: (inv: SalesInvoiceWithDetails) => void;
}

type FilterTab = "all" | "paid" | "unpaid" | "draft" | "overdue" | "cancelled";

const STATUS_CONFIG: Record<string, { labelKey: string; color: string; bg: string; Icon: React.FC<{ size?: number; color?: string; strokeWidth?: number }> }> = {
  paid:      { labelKey: "invoicePaid",      color: "#16A34A", bg: "rgba(22, 163, 74, 0.12)",   Icon: CheckCircle2 },
  unpaid:    { labelKey: "invoiceUnpaid",    color: "#EF4444", bg: "rgba(239, 68, 68, 0.12)",   Icon: AlertCircle },
  draft:     { labelKey: "invoiceDraft",     color: "#64748B", bg: "rgba(100, 116, 139, 0.12)", Icon: FileText },
  confirmed: { labelKey: "invoiceConfirmed", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.12)",  Icon: CheckCircle2 },
  cancelled: { labelKey: "invoiceCancelled", color: "#EF4444", bg: "rgba(239, 68, 68, 0.12)",   Icon: XCircle },
};

export function SalesListScreen({ onNewInvoice, onViewInvoice }: SalesListScreenProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const store = useFinancialStore();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const business = MOCK_BUSINESS;
  const currency = business.default_currency === "YER" ? "ر.ي" : business.default_currency;

  // Filter tabs
  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all",    label: t.filterAll },
    { key: "paid",   label: t.filterPaid },
    { key: "unpaid", label: isRTL ? "غير مدفوعة (آجلة)" : "Unpaid" },
    { key: "draft",  label: t.filterDraft },
  ];

  const filtered = useMemo(() => {
    return store.invoices.filter((inv) => {
      const matchFilter =
        activeFilter === "all" ||
        (activeFilter === "paid" && inv.payment_status === "Paid") ||
        (activeFilter === "unpaid" && inv.payment_status === "Unpaid") ||
        (activeFilter === "draft" && inv.status === "Draft");
      const q = search.toLowerCase();

      const customerName = store.customers.find(c => c.id === inv.customer_id)?.customer_name || "";

      const matchSearch =
        !q ||
        inv.invoice_number.toLowerCase().includes(q) ||
        customerName.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [search, activeFilter, store.invoices]);

  // Summary stats — derived, never stored separately
  const todayTotal = store.invoices
    .filter((i) => i.payment_status === "Paid")
    .reduce((s, i) => s + i.grand_total, 0);
  const pendingCount = store.invoices.filter((i) => i.payment_status === "Unpaid").length;

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
        padding: "16px 24px",
        background: isDark ? ds.surface : "#FFFFFF",
        borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`,
        flexShrink: 0,
      }}>
        {/* Summary KPI cards */}
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
                {store.invoices.length}
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

      {/* Invoice Table Container */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }}>
        <div style={{ background: isDark ? ds.surface : "#FFFFFF", borderRadius: 16, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
        {filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center", gap: 12 }}>
            <div style={{ width: 72, height: 72, borderRadius: 24, background: isDark ? ds.surface2 : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left", whiteSpace: "nowrap" }}>
              <thead>
                <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                  <th style={{ padding: "14px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "15%" }}>{isRTL ? "رقم الفاتورة" : "Invoice"}</th>
                  <th style={{ padding: "14px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "20%" }}>{isRTL ? "التاريخ" : "Date"}</th>
                  <th style={{ padding: "14px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "30%" }}>{isRTL ? "العميل" : "Customer"}</th>
                  <th style={{ padding: "14px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "15%" }}>{isRTL ? "الحالة" : "Status"}</th>
                  <th style={{ padding: "14px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "15%", textAlign: isRTL ? "left" : "right" }}>{isRTL ? "الإجمالي" : "Total"}</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => {
                  let cfgKey: string = "draft";
                  if (inv.status === "Draft") cfgKey = "draft";
                  else if (inv.status === "Cancelled") cfgKey = "cancelled";
                  else if (inv.payment_status === "Paid") cfgKey = "paid";
                  else if (inv.payment_status === "Unpaid") cfgKey = "unpaid";
                  else cfgKey = "confirmed";

                  const cfg = STATUS_CONFIG[cfgKey];
                  const customerName = store.customers.find(c => c.id === inv.customer_id)?.customer_name || (isRTL ? "عميل نقدي (كاش)" : "Cash Customer");
                  const statusText = cfgKey === "unpaid" ? (isRTL ? "غير مدفوعة" : "Unpaid") : (cfgKey === "paid" ? (isRTL ? "مدفوعة" : "Paid") : t[cfg.labelKey] || cfgKey);

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => {
                        const items = MOCK_SALES_INVOICE_ITEMS.filter(it => it.sales_invoice_id === inv.id).map(it => ({
                          ...it,
                          product_unit: { product: { name: `منتج تجريبي ${it.product_unit_id}` } }
                        })) as any;
                        const customer = store.customers.find(c => c.id === inv.customer_id) || null;
                        onViewInvoice({ ...inv, items, customer } as any);
                      }}
                      style={{
                        cursor: "pointer",
                        borderBottom: `1px solid ${isDark ? ds.border : "#F1F5F9"}`,
                        transition: "background 0.2s",
                      }}
                      onMouseOver={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC"}
                      onMouseOut={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "16px 20px", fontWeight: 700, color: ds.textPrimary, direction: "ltr", textAlign: isRTL ? "right" : "left" }}>
                        {inv.invoice_number}
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: ds.textSecondary, fontWeight: 500 }}>
                        {formatDate(inv.invoice_date)}
                      </td>
                      <td style={{ padding: "16px 20px", fontWeight: 700, color: ds.textPrimary }}>
                        {customerName}
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ padding: "6px 12px", background: cfg.bg, color: cfg.color, borderRadius: 8, fontSize: 12, fontWeight: 800, display: "inline-block" }}>
                          {statusText}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px", fontWeight: 800, color: ds.textPrimary, fontSize: 15, textAlign: isRTL ? "left" : "right" }}>
                        {inv.grand_total.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 500, color: ds.textMuted }}>{currency}</span>
                      </td>
                      <td style={{ padding: "16px 20px", textAlign: "center" }}>
                        <ChevronRight size={18} color={ds.textMuted} style={{ transform: isRTL ? "rotate(180deg)" : undefined }} />
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
    </div>
  );
}
