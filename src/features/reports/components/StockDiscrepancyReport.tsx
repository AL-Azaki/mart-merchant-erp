import { useState } from "react";
import { useApp } from "@/providers/AppProvider";
import { Download, ClipboardCheck, ArrowDownRight, ArrowUpRight, Filter } from "lucide-react";
import { exportToExcel } from "@/core/utils/exportUtils";

export function StockDiscrepancyReport() {
  const { t, isDark, isRTL, ds } = useApp();
  const [dateRange, setDateRange] = useState("this_month");

  // Mock data for discrepancies (In reality, this would be an aggregation of all Stock Adjustments)
  const discrepancies = [
    { id: 1, date: "2024-06-25", product_name: "مياه معدنية 1.5 لتر", product_code: "WTR-001", system_qty: 240, physical_qty: 235, discrepancy: -5, cost: 50, value: -250, notes: "جرد مستودع الروضة" },
    { id: 2, date: "2024-06-26", product_name: "صابون غسيل يدين", product_code: "SOP-001", system_qty: 150, physical_qty: 152, discrepancy: 2, cost: 250, value: 500, notes: "فائض بالكرتون" },
    { id: 3, date: "2024-06-28", product_name: "عصير برتقال 250مل", product_code: "JCE-001", system_qty: 100, physical_qty: 90, discrepancy: -10, cost: 120, value: -1200, notes: "عجز غير مبرر - مفقود" }
  ];

  const totalDeficit = discrepancies.filter(d => d.discrepancy < 0).reduce((acc, curr) => acc + Math.abs(curr.value), 0);
  const totalSurplus = discrepancies.filter(d => d.discrepancy > 0).reduce((acc, curr) => acc + curr.value, 0);

  const handleExport = () => {
    const exportMap = isRTL ? {
      date: "تاريخ الجرد",
      product_code: "كود المنتج",
      product_name: "اسم المنتج",
      system_qty: "الكمية الدفترية",
      physical_qty: "الكمية الفعلية",
      discrepancy: "الفارق",
      value: "قيمة الفارق (ر.ي)",
      notes: "الملاحظات"
    } : undefined;
    exportToExcel(discrepancies, "Stock_Discrepancies", exportMap);
  };

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 20 }}>
      {/* Header & Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: ds.textPrimary, margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <ClipboardCheck size={24} color="#3B82F6" />
            {isRTL ? "تقرير فروقات الجرد (التسويات)" : "Stock Discrepancies Report"}
          </h2>
          <p style={{ fontSize: 13, color: ds.textSecondary, margin: 0 }}>
            {isRTL ? "تحليل النواقص والزيادات الناتجة عن الجرد الفعلي وقيمتها المالية." : "Analysis of stock shortages/surplus from physical count and their financial value."}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Filter size={16} color={ds.textMuted} style={{ position: "absolute", [isRTL ? "right" : "left"]: 12, pointerEvents: "none" }} />
            <select
              value={dateRange} onChange={e => setDateRange(e.target.value)}
              style={{ padding: "0 12px", paddingInlineStart: 36, height: 40, background: surface, border: `1px solid ${border}`, borderRadius: 10, color: ds.textPrimary, fontSize: 13, fontWeight: 600, outline: "none", appearance: "none" }}
            >
              <option value="today">{isRTL ? "اليوم" : "Today"}</option>
              <option value="this_week">{isRTL ? "هذا الأسبوع" : "This Week"}</option>
              <option value="this_month">{isRTL ? "هذا الشهر" : "This Month"}</option>
              <option value="this_year">{isRTL ? "هذا العام" : "This Year"}</option>
            </select>
          </div>
          <button onClick={handleExport} style={{ height: 40, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 10, padding: "0 16px", color: ds.textPrimary, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit" }}>
            <Download size={16} /> {isRTL ? "تصدير" : "Export"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: ds.textSecondary, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <ArrowDownRight size={16} color="#EF4444" /> {isRTL ? "إجمالي العجز (خسائر)" : "Total Deficit (Losses)"}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: ds.textPrimary }}>
            {totalDeficit.toLocaleString()} <span style={{ fontSize: 13, color: ds.textMuted }}>{isRTL ? "ر.ي" : "YER"}</span>
          </div>
        </div>
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: ds.textSecondary, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <ArrowUpRight size={16} color="#10B981" /> {isRTL ? "إجمالي الزيادة (فائض)" : "Total Surplus"}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: ds.textPrimary }}>
            {totalSurplus.toLocaleString()} <span style={{ fontSize: 13, color: ds.textMuted }}>{isRTL ? "ر.ي" : "YER"}</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div style={{ flex: 1, background: surface, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${border}` }}>
                <th style={{ padding: "16px", textAlign: isRTL ? "right" : "left", fontSize: 13, fontWeight: 700, color: ds.textSecondary }}>{isRTL ? "التاريخ" : "Date"}</th>
                <th style={{ padding: "16px", textAlign: isRTL ? "right" : "left", fontSize: 13, fontWeight: 700, color: ds.textSecondary }}>{isRTL ? "المنتج" : "Product"}</th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: 13, fontWeight: 700, color: ds.textSecondary }}>{isRTL ? "الدفترى" : "System"}</th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: 13, fontWeight: 700, color: ds.textSecondary }}>{isRTL ? "الفعلي" : "Physical"}</th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: 13, fontWeight: 700, color: ds.textSecondary }}>{isRTL ? "الفارق" : "Diff"}</th>
                <th style={{ padding: "16px", textAlign: isRTL ? "left" : "right", fontSize: 13, fontWeight: 700, color: ds.textSecondary }}>{isRTL ? "القيمة (ر.ي)" : "Value"}</th>
                <th style={{ padding: "16px", textAlign: isRTL ? "right" : "left", fontSize: 13, fontWeight: 700, color: ds.textSecondary }}>{isRTL ? "ملاحظات" : "Notes"}</th>
              </tr>
            </thead>
            <tbody>
              {discrepancies.map((row) => (
                <tr key={row.id} style={{ borderBottom: `1px solid ${border}` }}>
                  <td style={{ padding: "16px", fontSize: 14, color: ds.textPrimary }}>{row.date}</td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: ds.textPrimary }}>{row.product_name}</div>
                    <div style={{ fontSize: 12, color: ds.textMuted }}>{row.product_code}</div>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center", fontSize: 14, color: ds.textSecondary, fontWeight: 600 }}>{row.system_qty}</td>
                  <td style={{ padding: "16px", textAlign: "center", fontSize: 14, color: ds.textPrimary, fontWeight: 700 }}>{row.physical_qty}</td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    {row.discrepancy < 0 ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(239,68,68,0.1)", color: "#EF4444", padding: "2px 8px", borderRadius: 8, fontSize: 13, fontWeight: 800 }}>
                        <ArrowDownRight size={14} /> {Math.abs(row.discrepancy)}
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(16,185,129,0.1)", color: "#10B981", padding: "2px 8px", borderRadius: 8, fontSize: 13, fontWeight: 800 }}>
                        <ArrowUpRight size={14} /> {row.discrepancy}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "16px", textAlign: isRTL ? "left" : "right", fontSize: 15, fontWeight: 800, color: row.value < 0 ? "#EF4444" : "#10B981" }}>
                    {row.value.toLocaleString()}
                  </td>
                  <td style={{ padding: "16px", fontSize: 13, color: ds.textSecondary }}>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
