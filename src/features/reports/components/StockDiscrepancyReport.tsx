import { useState } from "react";
import { motion } from "motion/react";
import { FileText, ArrowDown, ArrowUp, AlertCircle } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { ReportFilterBar } from "./ReportFilterBar";

export function StockDiscrepancyReport() {
  const { isDark, isRTL, ds } = useApp();
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  // Mock Report Data
  const reportData = {
    totalItems: 850,
    discrepancyCount: 15,
    totalDiscrepancyValue: -45000,
    maxShortage: { name: "لابتوب ماك بوك برو", qty: -2, value: -1200000 },
    maxSurplus: { name: "ماوس وايرلس", qty: 5, value: 25000 },
    discrepancies: [
      { id: "P-001", name: "لابتوب ماك بوك برو", systemQty: 10, actualQty: 8, diff: -2, diffValue: -1200000 },
      { id: "P-002", name: "شاشة سامسونج", systemQty: 15, actualQty: 14, diff: -1, diffValue: -75000 },
      { id: "P-003", name: "ماوس وايرلس", systemQty: 45, actualQty: 50, diff: 5, diffValue: 25000 },
      { id: "P-004", name: "كيبورد ميكانيكي", systemQty: 20, actualQty: 22, diff: 2, diffValue: 30000 },
    ]
  };

  return (
    <div className="report-container" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FileText size={24} color="#8B5CF6" />
        </div>
        <div>
          <h2 style={{ margin: 0, color: ds.textPrimary, fontSize: 20, fontWeight: 800 }}>{isRTL ? "تقرير الجرد والفروقات" : "Stocktaking & Discrepancy"}</h2>
          <p style={{ margin: 0, color: ds.textSecondary, fontSize: 14, fontWeight: 600 }}>{isRTL ? "ملخص تسويات المخزون الناتجة عن الجرد" : "Summary of inventory adjustments from stocktaking"}</p>
        </div>
      </div>

      <ReportFilterBar onRefresh={() => {}} onExport={() => window.print()} />

      <div className="print-content" style={{ flex: 1, overflowY: "auto", paddingBottom: 24, display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "الأصناف المجردة" : "Counted Items"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 32, fontWeight: 900 }}>{reportData.totalItems}</div>
          </div>
          <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "عدد الفروقات" : "Discrepancy Count"}</div>
            <div style={{ color: "#F59E0B", fontSize: 32, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}><AlertCircle size={24} /> {reportData.discrepancyCount}</div>
          </div>
          <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "صافي قيمة الفروقات" : "Net Discrepancy Value"}</div>
            <div style={{ color: reportData.totalDiscrepancyValue < 0 ? "#EF4444" : "#10B981", fontSize: 32, fontWeight: 900 }}>{reportData.totalDiscrepancyValue.toLocaleString()}</div>
          </div>
          <div style={{ background: surface, border: `1.5px solid rgba(239,68,68,0.3)`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "أكبر عجز" : "Max Shortage"}</div>
            <div style={{ color: "#EF4444", fontSize: 24, fontWeight: 900, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}><ArrowDown size={20} /> {reportData.maxShortage.value.toLocaleString()}</div>
            <div style={{ color: ds.textSecondary, fontSize: 14, fontWeight: 600 }}>{reportData.maxShortage.name}</div>
          </div>
          <div style={{ background: surface, border: `1.5px solid rgba(16,185,129,0.3)`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "أكبر زيادة" : "Max Surplus"}</div>
            <div style={{ color: "#10B981", fontSize: 24, fontWeight: 900, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}><ArrowUp size={20} /> +{reportData.maxSurplus.value.toLocaleString()}</div>
            <div style={{ color: ds.textSecondary, fontSize: 14, fontWeight: 600 }}>{reportData.maxSurplus.name}</div>
          </div>
        </div>

        {/* Detailed Table */}
        <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, overflow: "hidden" }}>
          <h4 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, margin: 0, padding: 24, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "تفاصيل الفروقات (عجز / زيادة)" : "Discrepancy Details"}</h4>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
              <thead style={{ position: "sticky", top: 0, background: isDark ? ds.surface2 : "#F8FAFC", zIndex: 10 }}>
                <tr>
                  <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "الصنف" : "Item"}</th>
                  <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "رصيد النظام" : "System Qty"}</th>
                  <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "الجرد الفعلي" : "Actual Qty"}</th>
                  <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "الفرق" : "Diff"}</th>
                  <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "قيمة الفرق" : "Diff Value"}</th>
                </tr>
              </thead>
              <tbody>
                {reportData.discrepancies.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: idx === reportData.discrepancies.length - 1 ? "none" : `1px solid ${border}`, transition: "background 0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark?ds.surface2:"#F8FAFC"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding: "20px 24px", color: ds.textPrimary, fontSize: 15, fontWeight: 800 }}>{item.name}</td>
                    <td style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 15, fontWeight: 700 }}>{item.systemQty}</td>
                    <td style={{ padding: "20px 24px", color: ds.textPrimary, fontSize: 16, fontWeight: 900 }}>{item.actualQty}</td>
                    <td style={{ padding: "20px 24px" }}>
                      <span style={{ padding: "6px 12px", borderRadius: 8, fontSize: 14, fontWeight: 900, background: item.diff < 0 ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", color: item.diff < 0 ? "#EF4444" : "#10B981" }}>
                        {item.diff > 0 ? `+${item.diff}` : item.diff}
                      </span>
                    </td>
                    <td style={{ padding: "20px 24px", color: item.diffValue < 0 ? "#EF4444" : "#10B981", fontSize: 16, fontWeight: 900 }}>{item.diffValue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
