import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Search, ClipboardCheck, ArrowUpRight, ArrowDownRight, Printer } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { StockAdjustmentFormSheet } from "../components/StockAdjustmentFormSheet";
import { exportToExcel } from "@/core/utils/exportUtils";

export function StockAdjustmentsScreen({ products }: { products: any[] }) {
  const { t, isDark, isRTL, ds } = useApp();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [adjustments, setAdjustments] = useState<any[]>([]); // Using local state for now until global state/db

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const filteredAdjustments = adjustments.filter(adj => 
    adj.adjustment_number.toLowerCase().includes(search.toLowerCase()) ||
    (adj.notes && adj.notes.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "24px", background: surface, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, margin: "0 0 4px 0" }}>{isRTL ? "تسويات وجرد المخزون" : "Stock Adjustments"}</h2>
          <p style={{ color: ds.textSecondary, fontSize: 13, margin: 0 }}>{isRTL ? "معالجة فروقات الجرد بين النظام والواقع الفعلي" : "Handle stock discrepancies between system and physical count"}</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ height: 44, background: "linear-gradient(135deg, #3B82F6, #2563EB)", border: "none", borderRadius: 12, padding: "0 16px", color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <Plus size={18} strokeWidth={2.5} />
          {isRTL ? "جرد جديد" : "New Adjustment"}
        </button>
      </div>

      <div style={{ padding: "16px 24px", background: surface, borderBottom: `1px solid ${border}` }}>
        <div style={{ position: "relative", maxWidth: 400 }}>
          <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? "ابحث برقم التسوية أو البيان..." : "Search by number or notes..."}
            style={{ width: "100%", boxSizing: "border-box", paddingInlineStart: 42, paddingInlineEnd: 16, height: 44, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 12, color: ds.textPrimary, fontSize: 14, outline: "none" }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        {filteredAdjustments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: 64, height: 64, background: isDark ? ds.surface2 : "#F1F5F9", borderRadius: 32, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <ClipboardCheck size={32} color={ds.textMuted} />
            </div>
            <h3 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "لا توجد تسويات مخزونية" : "No stock adjustments found"}</h3>
            <p style={{ color: ds.textSecondary, fontSize: 14, maxWidth: 300, margin: "0 auto" }}>
              {isRTL ? "قم بإجراء جرد تصحيحي لمعالجة العجز أو الزيادة في المخزون." : "Perform physical stocktaking to handle stock discrepancies."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredAdjustments.map((adj, idx) => (
              <motion.div key={adj.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: isDark ? ds.surface2 : "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ClipboardCheck size={24} color={ds.textSecondary} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <h3 style={{ direction: "ltr", color: ds.textPrimary, fontSize: 15, fontWeight: 800, margin: 0 }}>
                        {adj.adjustment_number}
                      </h3>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#3B82F6", background: "rgba(59,130,246,0.1)", padding: "2px 8px", borderRadius: 8 }}>
                        {new Date(adj.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: ds.textSecondary, fontWeight: 600 }}>
                      {adj.notes || (isRTL ? "بدون ملاحظات" : "No notes")}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: isRTL ? "left" : "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: ds.textSecondary, marginBottom: 4 }}>
                    {adj.lines.length} {isRTL ? "أصناف" : "Items"}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <StockAdjustmentFormSheet 
            key="form"
            products={products}
            onClose={() => setShowForm(false)}
            onSave={(newAdj) => {
              setAdjustments([newAdj, ...adjustments]);
              setShowForm(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
