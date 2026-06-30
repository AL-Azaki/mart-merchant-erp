import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, RotateCcw, Plus, Eye } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { SalesReturnFormSheet } from "../components/SalesReturnFormSheet";

const MOCK_RETURNS = [
  { id: "ret_1", return_number: "RET-2023-0001", invoice_number: "INV-2023-1002", date: new Date().toISOString(), total: 150.0, status: "Completed" },
  { id: "ret_2", return_number: "RET-2023-0002", invoice_number: "INV-2023-1054", date: new Date(Date.now() - 86400000).toISOString(), total: 45.0, status: "Pending" },
];

export function SalesReturnsScreen() {
  const { t, isDark, isRTL, ds } = useApp();
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  return (
    <div style={{ padding: 24, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800, margin: "0 0 4px 0" }}>{isRTL ? "مرتجعات المبيعات" : "Sales Returns"}</h2>
          <p style={{ color: ds.textSecondary, fontSize: 13, margin: 0 }}>{isRTL ? "إدارة عمليات الاسترجاع وإصدار إشعارات دائنة" : "Manage return operations and issue credit notes"}</p>
        </div>
        <button 
          onClick={() => { setSelectedReturn(null); setIsFormOpen(true); }}
          style={{ height: 44, background: "linear-gradient(135deg, #EF4444, #DC2626)", border: "none", borderRadius: 12, padding: "0 16px", color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)" }}
        >
          <Plus size={18} strokeWidth={2.5} />
          {isRTL ? "مرتجع جديد" : "New Return"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isRTL ? "ابحث برقم الفاتورة أو المرتجع..." : "Search by invoice or return #..."}
            style={{ width: "100%", height: 48, paddingInlineStart: 44, paddingInlineEnd: 16, background: surface, border: `1px solid ${border}`, borderRadius: 14, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit" }} />
        </div>
        <button style={{ height: 48, width: 48, background: surface, border: `1px solid ${border}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: ds.textSecondary, cursor: "pointer" }}>
          <Filter size={20} />
        </button>
      </div>

      <div style={{ flex: 1, background: surface, border: `1px solid ${border}`, borderRadius: 20, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1.5fr 1fr 1fr 1fr", gap: 16, padding: "16px 20px", background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${border}`, color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>
          <div>{isRTL ? "رقم المرتجع" : "Return #"}</div>
          <div>{isRTL ? "رقم الفاتورة الأصلية" : "Original Invoice #"}</div>
          <div>{isRTL ? "التاريخ" : "Date"}</div>
          <div>{isRTL ? "الحالة" : "Status"}</div>
          <div>{isRTL ? "إجمالي المرتجع" : "Return Total"}</div>
          <div style={{ textAlign: "center" }}>{isRTL ? "إجراء" : "Action"}</div>
        </div>

        <div style={{ overflowY: "auto", height: "calc(100% - 50px)" }}>
          {MOCK_RETURNS.map((ret, idx) => {
            const isCompleted = ret.status === "Completed";
            return (
              <div key={ret.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1.5fr 1fr 1fr 1fr", gap: 16, padding: "16px 20px", borderBottom: `1px solid ${border}`, alignItems: "center" }}>
                <div style={{ fontWeight: 800, color: ds.textPrimary }}>{ret.return_number}</div>
                <div style={{ fontWeight: 600, color: ds.textSecondary }}>{ret.invoice_number}</div>
                <div style={{ color: ds.textSecondary, fontSize: 13 }}>{new Date(ret.date).toLocaleDateString()}</div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: isCompleted ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: isCompleted ? "#10B981" : "#F59E0B", fontSize: 12, fontWeight: 700 }}>
                    {ret.status}
                  </span>
                </div>
                <div style={{ fontWeight: 800, color: "#EF4444" }}>-{ret.total.toLocaleString()}</div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button onClick={() => { setSelectedReturn(ret); setIsFormOpen(true); }} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(99,102,241,0.1)", border: "none", color: "#6366F1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <SalesReturnFormSheet 
            returnRecord={selectedReturn}
            onClose={() => { setIsFormOpen(false); setSelectedReturn(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
