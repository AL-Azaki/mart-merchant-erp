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

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 20, overflow: "hidden" }}>
          {invoices.map((inv, idx) => {
            return (
              <motion.div key={inv.id} 
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedInvoice(inv)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottom: idx === invoices.length - 1 ? "none" : `1px solid ${border}`, cursor: "pointer" }}>
                
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ArrowDownRight size={20} color="#3B82F6" strokeWidth={2.5} />
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 800 }}>{inv.invoice_number}</span>
                      <span style={{ padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: inv.status === "Posted" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: inv.status === "Posted" ? "#10B981" : "#F59E0B" }}>
                        {inv.status === "Posted" ? (isRTL ? "مرحلة" : "Posted") : (isRTL ? "مسودة" : "Draft")}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, color: ds.textSecondary, fontSize: 13, marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}><User size={14}/> {suppliers.find(s => s.id === inv.supplier_id)?.supplier_name || (isRTL ? "مورد عام" : "General")}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={14}/> {new Date(inv.purchase_date).toLocaleDateString(isRTL ? "ar-YE" : "en-US")}</div>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: isRTL ? "left" : "right" }}>
                  <div style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>
                    {inv.grand_total.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            )
          })}
          {invoices.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: ds.textMuted, fontSize: 14, fontWeight: 500 }}>
              {isRTL ? "لا توجد فواتير مشتريات" : "No purchase invoices found"}
            </div>
          )}
        </div>
      </div>
      
      {/* Detail Screen Overlay */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{ position: "fixed", inset: 0, zIndex: 9999, background: isDark ? ds.bg : "#F1F5F9" }}
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
