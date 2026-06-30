import { useState } from "react";
import { motion } from "motion/react";
import { DollarSign, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

export function FinanceReport() {
  const { t, isDark, isRTL, ds } = useApp();
  const [dateRange, setDateRange] = useState("month");

  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  // Mock Report Data
  const reportData = {
    totalRevenue: 250000,
    totalExpenses: 85000,
    netProfit: 165000,
    expensesByCategory: [
      { name: "رواتب", amount: 40000 },
      { name: "إيجارات", amount: 20000 },
      { name: "مرافق وخدمات", amount: 15000 },
      { name: "نثريات", amount: 10000 },
    ],
    cashFlow: [
      { date: "01/06", in: 15000, out: 2000 },
      { date: "08/06", in: 22000, out: 5000 },
      { date: "15/06", in: 18000, out: 3000 },
      { date: "22/06", in: 30000, out: 25000 },
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
          <DollarSign size={24} color="#10B981" />
          {isRTL ? "التقرير المالي" : "Financial Report"}
        </h3>
        <div style={{ display: "flex", gap: 12 }}>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ height: 40, padding: "0 16px", borderRadius: 10, border: `1px solid ${border}`, background: surface, color: ds.textPrimary, outline: "none", fontFamily: "inherit", fontWeight: 600 }}>
            <option value="month">{isRTL ? "هذا الشهر" : "This Month"}</option>
            <option value="quarter">{isRTL ? "الربع الحالي" : "This Quarter"}</option>
            <option value="year">{isRTL ? "هذا العام" : "This Year"}</option>
          </select>
          <button onClick={handleExport} style={{ height: 40, padding: "0 16px", borderRadius: 10, border: `1px solid ${border}`, background: surface, color: ds.textPrimary, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>
            <Download size={16} /> {isRTL ? "تصدير PDF" : "Export PDF"}
          </button>
        </div>
      </div>

      <div className="print-content" style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        {/* Print Header */}
        <div className="only-print" style={{ display: "none", textAlign: "center", marginBottom: 30 }}>
          <h2>{isRTL ? "تقرير الأرباح والخسائر" : "Profit & Loss Statement"}</h2>
          <p>{new Date().toLocaleDateString()}</p>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{isRTL ? "إجمالي الإيرادات" : "Total Revenue"}</div>
            <div style={{ color: "#10B981", fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              {reportData.totalRevenue.toLocaleString()} <ArrowUpRight size={24} />
            </div>
          </div>
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{isRTL ? "إجمالي المصروفات" : "Total Expenses"}</div>
            <div style={{ color: "#EF4444", fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              {reportData.totalExpenses.toLocaleString()} <ArrowDownRight size={24} />
            </div>
          </div>
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, borderTop: `4px solid #3B82F6` }}>
            <div style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{isRTL ? "صافي الربح" : "Net Profit"}</div>
            <div style={{ color: "#3B82F6", fontSize: 28, fontWeight: 800 }}>{reportData.netProfit.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Expenses Breakdown */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
            <h4 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700, margin: "0 0 16px 0" }}>{isRTL ? "تحليل المصروفات" : "Expenses Breakdown"}</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}`, color: ds.textSecondary, fontSize: 13, textAlign: isRTL ? "right" : "left" }}>
                  <th style={{ padding: "8px 0" }}>{isRTL ? "البند" : "Category"}</th>
                  <th style={{ padding: "8px 0" }}>{isRTL ? "المبلغ" : "Amount"}</th>
                  <th style={{ padding: "8px 0" }}>{isRTL ? "النسبة" : "%"}</th>
                </tr>
              </thead>
              <tbody>
                {reportData.expensesByCategory.map((exp, i) => {
                  const percentage = ((exp.amount / reportData.totalExpenses) * 100).toFixed(1);
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${isDark ? ds.border : "#F1F5F9"}`, color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
                      <td style={{ padding: "12px 0" }}>{exp.name}</td>
                      <td style={{ padding: "12px 0", color: "#EF4444" }}>{exp.amount.toLocaleString()}</td>
                      <td style={{ padding: "12px 0" }}>{percentage}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Cash Flow */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
            <h4 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700, margin: "0 0 16px 0" }}>{isRTL ? "حركة الخزينة" : "Cash Flow"}</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}`, color: ds.textSecondary, fontSize: 13, textAlign: isRTL ? "right" : "left" }}>
                  <th style={{ padding: "8px 0" }}>{isRTL ? "التاريخ" : "Date"}</th>
                  <th style={{ padding: "8px 0" }}>{isRTL ? "داخل" : "In"}</th>
                  <th style={{ padding: "8px 0" }}>{isRTL ? "خارج" : "Out"}</th>
                </tr>
              </thead>
              <tbody>
                {reportData.cashFlow.map((cf, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${isDark ? ds.border : "#F1F5F9"}`, color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
                    <td style={{ padding: "12px 0" }}>{cf.date}</td>
                    <td style={{ padding: "12px 0", color: "#10B981" }}>{cf.in.toLocaleString()}</td>
                    <td style={{ padding: "12px 0", color: "#EF4444" }}>{cf.out.toLocaleString()}</td>
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
