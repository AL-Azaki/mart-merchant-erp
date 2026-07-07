import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, ArrowRight, Package, Tag, Database, DollarSign, 
  MapPin, Activity, Settings, PackageOpen, LayoutGrid, ScanBarcode, ArrowDownRight, ArrowUpRight, X
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_PRODUCT_UNITS, MOCK_INVENTORIES, MOCK_INVENTORY_TRANSACTIONS } from "@/core/data/salesMockData";
import type { Product } from "@/core/types/catalog";

interface ProductDetailScreenProps {
  product: Product & { category?: any; units?: any[]; baseUnit?: any; stockQuantity?: number };
  onBack: () => void;
  onEdit: () => void;
}

type TabType = "overview" | "units" | "warehouses" | "ledger";

export function ProductDetailScreen({ product, onBack, onEdit }: ProductDetailScreenProps) {
  const { isDark, isRTL, ds } = useApp();
  
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Get units for this product (handles mock_units array and actual DB data)
  const units = product.mock_units || product.units || MOCK_PRODUCT_UNITS.filter(u => u.product_id === product.id);
  
  // Get inventories (warehouses) for this product
  const inventories = useMemo(() => {
    return MOCK_INVENTORIES.filter(inv => units.some(u => u.id === inv.product_unit_id)).map(inv => {
      const unit = units.find(u => u.id === inv.product_unit_id);
      return { ...inv, unit_name: unit?.unit_name || "وحدة غير معروفة" };
    });
  }, [units]);

  // Get transaction ledger for this product
  const ledger = useMemo(() => {
    return MOCK_INVENTORY_TRANSACTIONS.filter(tx => units.some(u => u.id === tx.product_unit_id))
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  }, [units]);

  const bg = isDark ? ds.bg : "#F1F5F9";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 24px" }}>
      {/* Backdrop */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onBack}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} />
        
      {/* Modal Container */}
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ position: "relative", width: "100%", maxWidth: 1100, height: "90vh", display: "flex", flexDirection: "column", background: bg, borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
      
        {/* 1. Header Area */}
        <div style={{ background: "linear-gradient(135deg, #10B981, #059669)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Package size={28} color="white" />
            </div>
            
            <div>
              <h2 style={{ color: "white", fontSize: 24, fontWeight: 800, margin: "0 0 4px 0" }}>{product.product_name}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><ScanBarcode size={14} /> {product.product_code}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Tag size={14} /> {product.category?.category_name || "بدون فئة"}</span>
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={onEdit} style={{ padding: "8px 16px", borderRadius: 12, background: "rgba(255,255,255,0.2)", color: "white", border: "none", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background="rgba(255,255,255,0.3)"} onMouseOut={e=>e.currentTarget.style.background="rgba(255,255,255,0.2)"}>
              <Settings size={16} />
              {isRTL ? "تعديل المنتج" : "Edit Product"}
            </button>
            <button onClick={onBack} style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.2)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background="rgba(255,255,255,0.3)"} onMouseOut={e=>e.currentTarget.style.background="rgba(255,255,255,0.2)"}>
              <X size={20} color="white" />
            </button>
          </div>
        </div>

        {/* 2. Tabs */}
        <div style={{ background: surface, borderBottom: `1px solid ${border}`, padding: "0 24px", display: "flex", gap: 32, flexShrink: 0 }}>
          {[
            { id: "overview", label: isRTL ? "نظرة عامة" : "Overview", icon: LayoutGrid },
            { id: "units", label: isRTL ? "الوحدات والأسعار" : "Units & Pricing", icon: Database },
            { id: "warehouses", label: isRTL ? "المستودعات" : "Warehouses", icon: MapPin },
            { id: "ledger", label: isRTL ? "حركة الصنف" : "Item Ledger", icon: Activity },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                style={{
                  background: "none", border: "none", padding: "16px 0", cursor: "pointer",
                  color: active ? "#10B981" : ds.textSecondary,
                  fontSize: 15, fontWeight: active ? 800 : 600,
                  borderBottom: active ? `3px solid #10B981` : "3px solid transparent",
                  transition: "0.2s", display: "flex", alignItems: "center", gap: 8
                }}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* 3. Tab Content Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ background: surface, padding: 24, borderRadius: 16, border: `1px solid ${border}` }}>
                <h3 style={{ margin: "0 0 20px 0", color: ds.textPrimary, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <PackageOpen size={18} color="#10B981"/> {isRTL ? "المعلومات الأساسية" : "Basic Info"}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 4 }}>{isRTL ? "اسم المنتج" : "Product Name"}</div>
                    <div style={{ fontSize: 16, color: ds.textPrimary, fontWeight: 700 }}>{product.product_name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 4 }}>{isRTL ? "كود المنتج (SKU)" : "Product Code"}</div>
                    <div style={{ fontSize: 16, color: ds.textPrimary, fontWeight: 700 }}>{product.product_code}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 4 }}>{isRTL ? "وصف المنتج" : "Description"}</div>
                    <div style={{ fontSize: 15, color: ds.textPrimary, fontWeight: 500, lineHeight: 1.6 }}>{product.description || (isRTL ? "لا يوجد وصف" : "No description")}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: surface, padding: 24, borderRadius: 16, border: `1px solid ${border}` }}>
                <h3 style={{ margin: "0 0 20px 0", color: ds.textPrimary, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <Activity size={18} color="#3B82F6"/> {isRTL ? "ملخص الأرصدة" : "Balances Summary"}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ background: isDark ? ds.surface2 : "#F8FAFC", padding: 16, borderRadius: 12, border: `1px solid ${border}` }}>
                    <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "إجمالي الرصيد المتوفر" : "Total Available Stock"}</div>
                    <div style={{ fontSize: 28, color: "#10B981", fontWeight: 900 }}>{product.stockQuantity || 0} <span style={{ fontSize: 14, color: ds.textSecondary }}>{product.baseUnit?.unit_name}</span></div>
                  </div>
                  <div style={{ background: isDark ? ds.surface2 : "#F8FAFC", padding: 16, borderRadius: 12, border: `1px solid ${border}` }}>
                    <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "سعر البيع الافتراضي (الوحدة الأساسية)" : "Default Selling Price"}</div>
                    <div style={{ fontSize: 24, color: ds.textPrimary, fontWeight: 800 }}>{product.baseUnit?.selling_price.toLocaleString() || 0} <span style={{ fontSize: 12, color: ds.textSecondary }}>{isRTL ? "ر.ي" : "YER"}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* UNITS & PRICING TAB */}
          {activeTab === "units" && (
            <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
                <thead>
                  <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${border}` }}>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "اسم الوحدة" : "Unit Name"}</th>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "الباركود" : "Barcode"}</th>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "معامل التحويل" : "Conversion Factor"}</th>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "سعر التكلفة" : "Cost Price"}</th>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "سعر البيع" : "Selling Price"}</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((u, i) => (
                    <tr key={u.id || i} style={{ borderBottom: i === units.length - 1 ? "none" : `1px solid ${isDark ? ds.border : "#F1F5F9"}` }}>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700 }}>{u.unit_name || u.name || (isRTL ? "وحدة" : "Unit")}</span>
                          {u.is_base_unit && <span style={{ padding: "2px 8px", background: "rgba(16,185,129,0.1)", color: "#10B981", fontSize: 11, fontWeight: 700, borderRadius: 6 }}>{isRTL ? "أساسية" : "Base"}</span>}
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 14, fontWeight: 600 }}>{u.barcode || "-"}</td>
                      <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 14, fontWeight: 700 }}>{u.conversion_factor || 1}</td>
                      <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 14, fontWeight: 700 }}>{(u.cost_price || u.purchase_price || 0).toLocaleString()}</td>
                      <td style={{ padding: "16px 20px", color: "#3B82F6", fontSize: 15, fontWeight: 800 }}>{(u.selling_price || u.price || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* WAREHOUSES TAB */}
          {activeTab === "warehouses" && (
            <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, overflow: "hidden" }}>
               <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
                <thead>
                  <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${border}` }}>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "المستودع / الفرع" : "Warehouse"}</th>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "الوحدة المخزنية" : "Unit"}</th>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "الرصيد المتاح" : "Available Stock"}</th>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "نقطة إعادة الطلب" : "Reorder Level"}</th>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "حالة المخزون" : "Status"}</th>
                  </tr>
                </thead>
                <tbody>
                  {inventories.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: ds.textMuted }}>{isRTL ? "لا يوجد رصيد مخزني" : "No stock available"}</td></tr>
                  ) : (
                    inventories.map((inv, i) => {
                      const isOut = inv.quantity <= 0;
                      const isLow = inv.quantity > 0 && inv.quantity <= (inv.alert_quantity || 10);
                      return (
                        <tr key={inv.id} style={{ borderBottom: i === inventories.length - 1 ? "none" : `1px solid ${isDark ? ds.border : "#F1F5F9"}` }}>
                          <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 14, fontWeight: 700 }}>{inv.warehouse_id === "wh_001" ? "المستودع الرئيسي (المركز)" : "مستودع فرعي"}</td>
                          <td style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 14 }}>{inv.unit_name}</td>
                          <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 15, fontWeight: 800 }}>{inv.quantity}</td>
                          <td style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 14 }}>{inv.alert_quantity || 10}</td>
                          <td style={{ padding: "16px 20px" }}>
                             <span style={{ padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700, 
                               background: isOut ? "rgba(239,68,68,0.1)" : isLow ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                               color: isOut ? "#EF4444" : isLow ? "#F59E0B" : "#10B981"
                             }}>
                               {isOut ? (isRTL ? "نفد" : "Out of Stock") : isLow ? (isRTL ? "قليل" : "Low") : (isRTL ? "متوفر" : "In Stock")}
                             </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
               </table>
            </div>
          )}

          {/* LEDGER TAB */}
          {activeTab === "ledger" && (
            <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, overflow: "hidden" }}>
               <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
                <thead>
                  <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${border}` }}>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "التاريخ" : "Date"}</th>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "نوع الحركة" : "Type"}</th>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "المرجع" : "Reference"}</th>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, textAlign: "center" }}>{isRTL ? "الكمية" : "Qty"}</th>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, textAlign: "center" }}>{isRTL ? "الرصيد بعد" : "Balance"}</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: ds.textMuted }}>{isRTL ? "لا توجد حركات سابقة" : "No movements found"}</td></tr>
                  ) : (
                    ledger.map((tx, i) => {
                      const isPositive = tx.transaction_type === "IN" || tx.transaction_type === "TRANSFER_IN";
                      const Icon = isPositive ? ArrowDownRight : ArrowUpRight;
                      return (
                        <tr key={tx.id} style={{ borderBottom: i === ledger.length - 1 ? "none" : `1px solid ${isDark ? ds.border : "#F1F5F9"}` }}>
                          <td style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 14 }}>{new Date(tx.transaction_date).toLocaleString()}</td>
                          <td style={{ padding: "16px 20px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 4, color: isPositive ? "#10B981" : "#EF4444", fontSize: 13, fontWeight: 700 }}>
                              <Icon size={14} /> {tx.transaction_type}
                            </span>
                          </td>
                          <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>{tx.reference_id || "-"}</td>
                          <td style={{ padding: "16px 20px", color: isPositive ? "#10B981" : "#EF4444", fontSize: 15, fontWeight: 800, textAlign: "center" }}>
                            {isPositive ? "+" : "-"}{tx.quantity}
                          </td>
                          <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 15, fontWeight: 800, textAlign: "center" }}>
                            {tx.balance_after}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
               </table>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
