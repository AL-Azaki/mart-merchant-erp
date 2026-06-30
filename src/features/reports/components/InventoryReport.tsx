import { useState } from "react";
import { motion } from "motion/react";
import { Package, Download, AlertTriangle } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

export function InventoryReport() {
  const { t, isDark, isRTL, ds } = useApp();
  const [warehouse, setWarehouse] = useState("all");

  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  // Mock Report Data
  const reportData = {
    totalValue: 1250000,
    totalItems: 8500,
    lowStockItems: 12,
    stockByCategory: [
      { name: "إلكترونيات", items: 3500, value: 800000 },
      { name: "إكسسوارات", items: 4000, value: 200000 },
      { name: "قطع غيار", items: 1000, value: 250000 },
    ],
    shortages: [
      { name: "شاشة آيفون 13", current: 2, min: 10 },
      { name: "بطارية سامسونج S22", current: 0, min: 5 },
      { name: "كابل شحن Type-C", current: 5, min: 50 },
    ]
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="report-container" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Toolbar - Hidden in Print */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexShrink: 0 }}>
        <h3 style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <Package size={24} color="#F59E0B" />
          {isRTL ? "تقرير المخزون" : "Inventory Report"}
        </h3>
        <div style={{ display: "flex", gap: 12 }}>
          <select value={warehouse} onChange={e => setWarehouse(e.target.value)} style={{ height: 40, padding: "0 16px", borderRadius: 10, border: `1px solid ${border}`, background: surface, color: ds.textPrimary, outline: "none", fontFamily: "inherit", fontWeight: 600 }}>
            <option value="all">{isRTL ? "جميع المستودعات" : "All Warehouses"}</option>
            <option value="main">{isRTL ? "المستودع الرئيسي" : "Main Warehouse"}</option>
          </select>
          <button onClick={handleExport} style={{ height: 40, padding: "0 16px", borderRadius: 10, border: `1px solid ${border}`, background: surface, color: ds.textPrimary, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>
            <Download size={16} /> {isRTL ? "تصدير PDF" : "Export PDF"}
          </button>
        </div>
      </div>

      <div className="print-content" style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        {/* Print Header */}
        <div className="only-print" style={{ display: "none", textAlign: "center", marginBottom: 30 }}>
          <h2>{isRTL ? "تقرير تقييم المخزون" : "Inventory Valuation Report"}</h2>
          <p>{new Date().toLocaleDateString()}</p>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{isRTL ? "إجمالي قيمة المخزون" : "Total Inventory Value"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 28, fontWeight: 800 }}>{reportData.totalValue.toLocaleString()}</div>
          </div>
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{isRTL ? "إجمالي الوحدات" : "Total Items"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 28, fontWeight: 800 }}>{reportData.totalItems.toLocaleString()}</div>
          </div>
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, borderRight: `4px solid #EF4444` }}>
            <div style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{isRTL ? "أصناف منخفضة الرصيد" : "Low Stock Items"}</div>
            <div style={{ color: "#EF4444", fontSize: 28, fontWeight: 800 }}>{reportData.lowStockItems}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Stock by Category */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
            <h4 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700, margin: "0 0 16px 0" }}>{isRTL ? "تقييم المخزون حسب الفئة" : "Valuation by Category"}</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}`, color: ds.textSecondary, fontSize: 13, textAlign: isRTL ? "right" : "left" }}>
                  <th style={{ padding: "8px 0" }}>{isRTL ? "الفئة" : "Category"}</th>
                  <th style={{ padding: "8px 0" }}>{isRTL ? "الوحدات" : "Items"}</th>
                  <th style={{ padding: "8px 0" }}>{isRTL ? "القيمة" : "Value"}</th>
                </tr>
              </thead>
              <tbody>
                {reportData.stockByCategory.map((cat, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${isDark ? ds.border : "#F1F5F9"}`, color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
                    <td style={{ padding: "12px 0" }}>{cat.name}</td>
                    <td style={{ padding: "12px 0" }}>{cat.items.toLocaleString()}</td>
                    <td style={{ padding: "12px 0" }}>{cat.value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Shortages Alerts */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
            <h4 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700, margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={18} color="#EF4444" />
              {isRTL ? "نواقص المخزون" : "Stock Shortages"}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {reportData.shortages.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: isDark ? ds.surface2 : "#FEF2F2", borderRadius: 10, border: `1px solid ${isDark ? ds.border : "#FECACA"}` }}>
                  <div>
                    <div style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
                    <div style={{ color: ds.textSecondary, fontSize: 12 }}>{isRTL ? "الحد الأدنى:" : "Min:"} {item.min}</div>
                  </div>
                  <div style={{ background: "#EF4444", color: "white", padding: "4px 12px", borderRadius: 8, fontSize: 14, fontWeight: 800 }}>
                    {item.current}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
