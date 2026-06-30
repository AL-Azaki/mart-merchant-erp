import { useState } from "react";
import { motion } from "motion/react";
import { TrendingUp, Calendar, Download, Filter } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

export function SalesSummaryReport() {
  const { t, isDark, isRTL, ds } = useApp();
  const [dateRange, setDateRange] = useState("today");

  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  // Mock Report Data
  const reportData = {
    totalSales: 45000,
    totalOrders: 120,
    averageOrderValue: 375,
    topCategories: [
      { name: "إلكترونيات", sales: 25000, percentage: 55 },
      { name: "إكسسوارات", sales: 12000, percentage: 27 },
      { name: "قطع غيار", sales: 8000, percentage: 18 },
    ],
    recentDays: [
      { day: "السبت", sales: 5000 },
      { day: "الأحد", sales: 7500 },
      { day: "الإثنين", sales: 6200 },
      { day: "الثلاثاء", sales: 9000 },
      { day: "الأربعاء", sales: 8400 },
      { day: "الخميس", sales: 12000 },
    ]
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="report-container" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Toolbar */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexShrink: 0 }}>
        <h3 style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={24} color="#3B82F6" />
          {isRTL ? "ملخص المبيعات" : "Sales Summary"}
        </h3>
        <div style={{ display: "flex", gap: 12 }}>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ height: 40, padding: "0 16px", borderRadius: 10, border: `1px solid ${border}`, background: surface, color: ds.textPrimary, outline: "none", fontFamily: "inherit", fontWeight: 600 }}>
            <option value="today">{isRTL ? "اليوم" : "Today"}</option>
            <option value="week">{isRTL ? "هذا الأسبوع" : "This Week"}</option>
            <option value="month">{isRTL ? "هذا الشهر" : "This Month"}</option>
          </select>
          <button onClick={handleExport} style={{ height: 40, padding: "0 16px", borderRadius: 10, border: `1px solid ${border}`, background: surface, color: ds.textPrimary, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>
            <Download size={16} /> {isRTL ? "تصدير" : "Export PDF"}
          </button>
        </div>
      </div>

      <div className="print-content" style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        {/* Print Header */}
        <div className="only-print" style={{ display: "none", textAlign: "center", marginBottom: 30 }}>
          <h2>{isRTL ? "ملخص المبيعات" : "Sales Summary Report"}</h2>
          <p>{new Date().toLocaleDateString()}</p>
        </div>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{isRTL ? "إجمالي المبيعات" : "Total Sales"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 28, fontWeight: 800 }}>{reportData.totalSales.toLocaleString()}</div>
          </div>
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{isRTL ? "عدد الطلبات" : "Total Orders"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 28, fontWeight: 800 }}>{reportData.totalOrders}</div>
          </div>
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{isRTL ? "متوسط قيمة الطلب" : "Average Order Value"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 28, fontWeight: 800 }}>{reportData.averageOrderValue.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Categories Chart Mock */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
            <h4 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700, margin: "0 0 16px 0" }}>{isRTL ? "المبيعات حسب الفئة" : "Sales by Category"}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {reportData.topCategories.map(cat => (
                <div key={cat.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: ds.textSecondary, marginBottom: 4 }}>
                    <span>{cat.name}</span>
                    <span>{cat.sales.toLocaleString()} ({cat.percentage}%)</span>
                  </div>
                  <div style={{ height: 8, background: isDark ? ds.surface2 : "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${cat.percentage}%` }} transition={{ duration: 1, ease: "easeOut" }} style={{ height: "100%", background: "#3B82F6", borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Trend Mock */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
            <h4 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700, margin: "0 0 16px 0" }}>{isRTL ? "تريند المبيعات" : "Sales Trend"}</h4>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 150, paddingBottom: 24, position: "relative" }}>
              {reportData.recentDays.map((day, i) => {
                const max = Math.max(...reportData.recentDays.map(d => d.sales));
                const height = (day.sales / max) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 1, delay: i * 0.1 }} style={{ width: "100%", background: "linear-gradient(180deg, #3B82F6, rgba(59,130,246,0.2))", borderRadius: "6px 6px 0 0" }} />
                    <span style={{ position: "absolute", bottom: 0, fontSize: 11, color: ds.textMuted, fontWeight: 600 }}>{day.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
