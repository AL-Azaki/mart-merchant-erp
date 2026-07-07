import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Filter, ArrowDownRight, Package, User, Calendar, Check
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import type { PurchaseInvoice, Supplier } from "@/core/types/purchases";
import { PurchaseInvoiceDetailScreen } from "../components/PurchaseInvoiceDetailScreen";

export function PurchaseListScreen({ invoices: initialInvoices, suppliers, onNewPurchase }: { invoices: PurchaseInvoice[], suppliers: Supplier[], onNewPurchase: () => void }) {
  const { t, isDark, isRTL, ds } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const invoices = useMemo(() => {
    return initialInvoices.filter(inv => {
      if (statusFilter && inv.status !== statusFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      const supplier = suppliers.find(c => c.id === inv.supplier_id);
      return inv.invoice_number.toLowerCase().includes(q) || (supplier?.supplier_name?.toLowerCase().includes(q));
    });
  }, [search, statusFilter, initialInvoices, suppliers]);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", background: surface, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowDownRight size={22} color="#3B82F6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "فواتير المشتريات" : "Purchase Invoices"}</h2>
            <p style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 500 }}>{invoices.length} {isRTL ? "فاتورة" : "Invoices"}</p>
          </div>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }} 
          onClick={onNewPurchase}
          style={{ height: 44, background: "linear-gradient(135deg, #3B82F6, #2563EB)", border: "none", borderRadius: 12, padding: "0 16px", color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(59,130,246,0.3)" }}
        >
          <Plus size={18} strokeWidth={2.5} />
          {isRTL ? "فاتورة مشتريات جديدة" : "New Purchase"}
        </motion.button>
      </div>

      {/* Toolbar */}
      <div style={{ padding: "16px 24px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isRTL ? "ابحث برقم الفاتورة أو المورد..." : "Search invoice or supplier..."}
              style={{ width: "100%", height: 46, boxSizing: "border-box", paddingInlineStart: 44, paddingInlineEnd: 16, background: surface, border: `1px solid ${border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit" }}
            />
          </div>
          <button style={{ width: 46, height: 46, borderRadius: 12, background: surface, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Filter size={20} color={ds.textSecondary} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 16 }}>
          {[{ id: null, label: isRTL ? "الكل" : "All" }, { id: "Draft", label: isRTL ? "مسودة" : "Draft" }, { id: "Posted", label: isRTL ? "مرحلة" : "Posted" }, { id: "Cancelled", label: isRTL ? "ملغاة" : "Cancelled" }].map(c => {
            const active = statusFilter === c.id;
            return (
              <motion.button key={String(c.id)} whileTap={{ scale: 0.95 }} onClick={() => setStatusFilter(c.id)}
                style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 10, border: `1px solid ${active ? "#3B82F6" : border}`, cursor: "pointer", fontFamily: "inherit", background: active ? "rgba(59,130,246,0.1)" : surface, color: active ? "#3B82F6" : ds.textSecondary, fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}>
                {c.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* List Table Container */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 24px" }}>
        <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
          {invoices.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 72, height: 72, borderRadius: 24, background: isDark ? ds.surface2 : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Package size={32} color={ds.textMuted} strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700 }}>{isRTL ? "لا توجد فواتير مشتريات" : "No purchase invoices"}</p>
                <p style={{ color: ds.textSecondary, fontSize: 13, marginTop: 4 }}>{isRTL ? "قم بإنشاء فاتورة مشتريات جديدة لإضافتها هنا." : "Create a new purchase invoice to see it here."}</p>
              </div>
            </div>
          ) : (
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left", whiteSpace: "nowrap" }}>
                <thead>
                  <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${border}` }}>
                    <th style={{ padding: "14px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "15%" }}>{isRTL ? "رقم الفاتورة" : "Invoice"}</th>
                    <th style={{ padding: "14px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "20%" }}>{isRTL ? "التاريخ" : "Date"}</th>
                    <th style={{ padding: "14px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "30%" }}>{isRTL ? "المورد" : "Supplier"}</th>
                    <th style={{ padding: "14px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "15%" }}>{isRTL ? "الحالة" : "Status"}</th>
                    <th style={{ padding: "14px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "15%", textAlign: isRTL ? "left" : "right" }}>{isRTL ? "الإجمالي" : "Total"}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const supplierName = suppliers.find(s => s.id === inv.supplier_id)?.supplier_name || (isRTL ? "مورد عام" : "General");
                    const isPosted = inv.status === "Posted";
                    
                    return (
                      <tr
                        key={inv.id}
                        onClick={() => setSelectedInvoice(inv)}
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
                          {new Date(inv.purchase_date).toLocaleDateString(isRTL ? "ar-YE" : "en-US")}
                        </td>
                        <td style={{ padding: "16px 20px", fontWeight: 700, color: ds.textPrimary }}>
                          {supplierName}
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ padding: "6px 12px", background: isPosted ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", color: isPosted ? "#16A34A" : "#F59E0B", borderRadius: 8, fontSize: 12, fontWeight: 800, display: "inline-block" }}>
                            {isPosted ? (isRTL ? "مرحلة" : "Posted") : (isRTL ? "مسودة" : "Draft")}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px", fontWeight: 800, color: ds.textPrimary, fontSize: 15, textAlign: isRTL ? "left" : "right" }}>
                          {inv.grand_total.toLocaleString()}
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
      
      {/* Detail Screen Overlay */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            key="purchase-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: "fixed", inset: 0, zIndex: 9999 }}
          >
            <PurchaseInvoiceDetailScreen 
              invoice={selectedInvoice}
              supplier={suppliers.find(s => s.id === selectedInvoice.supplier_id)}
              onBack={() => setSelectedInvoice(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
