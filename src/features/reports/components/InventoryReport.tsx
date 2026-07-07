import { useState } from "react";
import { motion } from "motion/react";
import { Package, AlertTriangle, Activity } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { ReportFilterBar } from "./ReportFilterBar";

export function InventoryReport() {
  const { isDark, isRTL, ds } = useApp();
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  // Mock Report Data
  const reportData = {
    totalValue: 1250000,
    totalItems: 8500,
    lowStockItems: 12,
    outOfStock: 3,
    stockByCategory: [
      { name: "إلكترونيات", items: 3500, value: 800000 },
      { name: "إكسسوارات", items: 4000, value: 200000 },
      { name: "قطع غيار", items: 1000, value: 250000 },
    ],
    shortages: [
      { id: "P-100", name: "شاشة آيفون 13", current: 2, min: 10, value: 15000 },
      { id: "P-105", name: "بطارية سامسونج S22", current: 0, min: 5, value: 0 },
      { id: "P-202", name: "كابل شحن Type-C", current: 5, min: 50, value: 2500 },
    ]
  };

  return (
    <div className="report-container" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Package size={24} color="#F59E0B" />
        </div>
        <div>
          <h2 style={{ margin: 0, color: ds.textPrimary, fontSize: 20, fontWeight: 800 }}>{isRTL ? "تقرير تقييم وحركة المخزون" : "Inventory Valuation & Movement Report"}</h2>
          <p style={{ margin: 0, color: ds.textSecondary, fontSize: 14, fontWeight: 600 }}>{isRTL ? "تحليل شامل لقيمة البضاعة والنواقص" : "Comprehensive analysis of goods value and shortages"}</p>
        </div>
      </div>

      <ReportFilterBar onRefresh={() => {}} onExport={() => window.print()} />

      <div className="print-content" style={{ flex: 1, overflowY: "auto", paddingBottom: 24, display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "قيمة المخزون" : "Inventory Value"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 32, fontWeight: 900 }}>{reportData.totalValue.toLocaleString()} <span style={{ fontSize: 16 }}>{isRTL ? "ر.ي" : "YER"}</span></div>
          </div>
          <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "عدد المنتجات" : "Total Products"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 32, fontWeight: 900 }}>{reportData.totalItems.toLocaleString()}</div>
          </div>
          <div style={{ background: surface, border: `1.5px solid rgba(245,158,11,0.3)`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "منخفض المخزون" : "Low Stock"}</div>
            <div style={{ color: "#F59E0B", fontSize: 32, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}><Activity size={24} /> {reportData.lowStockItems}</div>
          </div>
          <div style={{ background: surface, border: `1.5px solid rgba(239,68,68,0.3)`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "غير متوفر" : "Out of Stock"}</div>
            <div style={{ color: "#EF4444", fontSize: 32, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}><AlertTriangle size={24} /> {reportData.outOfStock}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Stock by Category */}
          <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24 }}>
            <h4 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, margin: "0 0 24px 0" }}>{isRTL ? "تقييم المخزون حسب الفئة" : "Valuation by Category"}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {reportData.stockByCategory.map((cat, i) => {
                const percentage = (cat.value / reportData.totalValue) * 100;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, color: ds.textPrimary, marginBottom: 8 }}>
                      <span>{cat.name}</span>
                      <span style={{ color: ds.textSecondary }}>{cat.value.toLocaleString()} <span style={{ fontSize: 12 }}>({Math.round(percentage)}%)</span></span>
                    </div>
                    <div style={{ height: 12, background: isDark ? ds.surface2 : "#F1F5F9", borderRadius: 6, overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1 }} style={{ height: "100%", background: "#F59E0B", borderRadius: 6 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Table */}
          <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <h4 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, margin: 0, padding: 24, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "تنبيهات النواقص" : "Shortage Alerts"}</h4>
            <div style={{ overflowX: "auto", flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
                <thead style={{ position: "sticky", top: 0, background: isDark ? ds.surface2 : "#F8FAFC", zIndex: 10 }}>
                  <tr>
                    <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "المنتج" : "Product"}</th>
                    <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "الرصيد" : "Current"}</th>
                    <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "الأدنى" : "Min"}</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.shortages.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: idx === reportData.shortages.length - 1 ? "none" : `1px solid ${border}` }}>
                      <td style={{ padding: "20px 24px", color: ds.textPrimary, fontSize: 15, fontWeight: 800 }}>{item.name}</td>
                      <td style={{ padding: "20px 24px" }}>
                        <span style={{ padding: "6px 12px", borderRadius: 8, fontSize: 14, fontWeight: 900, background: item.current === 0 ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)", color: item.current === 0 ? "#EF4444" : "#F59E0B" }}>
                          {item.current}
                        </span>
                      </td>
                      <td style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 15, fontWeight: 700 }}>{item.min}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
