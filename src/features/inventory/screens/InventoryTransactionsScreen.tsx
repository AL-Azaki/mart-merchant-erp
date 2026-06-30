import { useState } from "react";
import { motion } from "motion/react";
import {
  Search, ArrowDownRight, ArrowUpRight, ArrowLeftRight, FileText, Calendar, Database, Package, Hash
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_INVENTORY_TRANSACTIONS, MOCK_PRODUCTS, MOCK_PRODUCT_UNITS, MOCK_UNITS } from "@/core/data/salesMockData";

export function InventoryTransactionsScreen() {
  const { t, isDark, isRTL, ds } = useApp();
  const [search, setSearch] = useState("");
  const [transactions] = useState(MOCK_INVENTORY_TRANSACTIONS);

  // Filter
  const filteredTx = transactions.filter(tx => {
    if (!search) return true;
    const q = search.toLowerCase();
    const pu = MOCK_PRODUCT_UNITS.find(u => u.id === tx.product_unit_id);
    const product = MOCK_PRODUCTS.find(p => p.id === pu?.product_id);
    return tx.reference_id.toLowerCase().includes(q) || (product?.product_name.toLowerCase().includes(q));
  });

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const subtle = isDark ? ds.surface2 : "#F1F5F9";
  const border = isDark ? ds.border : "#E2E8F0";

  const getTxTypeDetails = (type: string) => {
    switch(type) {
      case "In": return { color: "#3B82F6", bg: "rgba(59,130,246,0.1)", icon: ArrowDownRight, label: isRTL ? "دخول مستودع" : "Stock In" };
      case "Out": return { color: "#EF4444", bg: "rgba(239,68,68,0.1)", icon: ArrowUpRight, label: isRTL ? "خروج مستودع" : "Stock Out" };
      case "Adjust": return { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: ArrowLeftRight, label: isRTL ? "تسوية مخزنية" : "Adjustment" };
      default: return { color: ds.textSecondary, bg: subtle, icon: Database, label: type };
    }
  };

  const getRefTypeLabel = (refType: string) => {
    switch(refType) {
      case "SalesInvoice": return isRTL ? "فاتورة مبيعات" : "Sales Invoice";
      case "PurchaseInvoice": return isRTL ? "فاتورة مشتريات" : "Purchase Invoice";
      case "SalesReturn": return isRTL ? "مرتجع مبيعات" : "Sales Return";
      case "PurchaseReturn": return isRTL ? "مرتجع مشتريات" : "Purchase Return";
      case "Adjustment": return isRTL ? "مستند تسوية" : "Adjustment Doc";
      case "Transfer": return isRTL ? "سند تحويل" : "Transfer";
      default: return refType;
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", background: surface, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowLeftRight size={22} color="#F59E0B" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "حركات المخزون" : "Stock Movements"}</h2>
            <p style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 500 }}>{filteredTx.length} {isRTL ? "حركة" : "Transactions"}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: "16px 24px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isRTL ? "ابحث باسم المنتج أو رقم المرجع..." : "Search product or reference..."}
              style={{ width: "100%", height: 46, boxSizing: "border-box", paddingInlineStart: 44, paddingInlineEnd: 16, background: surface, border: `1px solid ${border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 20, overflow: "hidden" }}>
          {filteredTx.map((tx, idx) => {
            const pu = MOCK_PRODUCT_UNITS.find(u => u.id === tx.product_unit_id);
            const product = MOCK_PRODUCTS.find(p => p.id === pu?.product_id);
            const unitObj = MOCK_UNITS.find(u => u.id === pu?.unit_id);
            const { color, bg: txBg, icon: TxIcon, label: txLabel } = getTxTypeDetails(tx.transaction_type);
            
            return (
              <motion.div key={tx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottom: idx === filteredTx.length - 1 ? "none" : `1px solid ${border}` }}>
                
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: txBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TxIcon size={20} color={color} strokeWidth={2.5} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <h4 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 700 }}>{product?.product_name || "منتج غير معروف"}</h4>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 6, background: txBg, color: color }}>
                        {txLabel}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 16, color: ds.textSecondary, fontSize: 12, fontWeight: 500 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Package size={14} /> {getRefTypeLabel(tx.reference_type)}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Hash size={14} /> <span style={{ direction: "ltr" }}>{tx.reference_id}</span></span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={14} /> {new Date(tx.transaction_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: isRTL ? "left" : "right" }}>
                  <div style={{ color: tx.transaction_type === "In" ? "#3B82F6" : tx.transaction_type === "Out" ? "#EF4444" : "#F59E0B", fontSize: 18, fontWeight: 800 }}>
                    {tx.transaction_type === "In" ? "+" : ""}{tx.quantity} <span style={{ fontSize: 14 }}>{unitObj?.unit_name || "وحدة"}</span>
                  </div>
                  <div style={{ color: ds.textMuted, fontSize: 12, fontWeight: 500 }}>
                    {isRTL ? "التكلفة:" : "Cost:"} {tx.unit_cost.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            )
          })}
          {filteredTx.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: ds.textMuted, fontSize: 14, fontWeight: 500 }}>
              {isRTL ? "لا توجد حركات مخزون مطابقة" : "No stock movements found"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
