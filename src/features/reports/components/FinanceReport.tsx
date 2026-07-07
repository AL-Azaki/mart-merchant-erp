import { useState } from "react";
import { motion } from "motion/react";
import { DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { ReportFilterBar } from "./ReportFilterBar";

export function FinanceReport() {
  const { isDark, isRTL, ds } = useApp();
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  // Mock Report Data
  const reportData = {
    totalRevenue: 250000,
    totalExpenses: 85000,
    netProfit: 165000,
    profitMargin: 66,
    expensesByCategory: [
      { name: "رواتب", amount: 40000 },
      { name: "إيجارات", amount: 20000 },
      { name: "مرافق وخدمات", amount: 15000 },
      { name: "نثريات", amount: 10000 },
    ],
    cashFlow: [
      { id: "TRX-01", date: "2023-11-01", in: 15000, out: 2000, balance: 13000, notes: "مبيعات نقدية" },
      { id: "TRX-02", date: "2023-11-02", in: 22000, out: 5000, balance: 30000, notes: "تحصيل فواتير" },
      { id: "TRX-03", date: "2023-11-03", in: 18000, out: 3000, balance: 45000, notes: "مبيعات نقدية" },
      { id: "TRX-04", date: "2023-11-04", in: 30000, out: 25000, balance: 50000, notes: "دفع رواتب" },
    ]
  };

  return (
    <div className="report-container" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <DollarSign size={24} color="#10B981" />
        </div>
        <div>
          <h2 style={{ margin: 0, color: ds.textPrimary, fontSize: 20, fontWeight: 800 }}>{isRTL ? "تقرير الأرباح والخسائر وحركة الخزينة" : "P&L and Cash Flow Report"}</h2>
          <p style={{ margin: 0, color: ds.textSecondary, fontSize: 14, fontWeight: 600 }}>{isRTL ? "تحليل مالي متكامل وتدفقات نقدية" : "Comprehensive financial analysis and cash flows"}</p>
        </div>
      </div>

      <ReportFilterBar onRefresh={() => {}} onExport={() => window.print()} />

      <div className="print-content" style={{ flex: 1, overflowY: "auto", paddingBottom: 24, display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div style={{ background: surface, border: `1.5px solid rgba(16,185,129,0.3)`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "إجمالي الإيرادات" : "Total Revenue"}</div>
            <div style={{ color: "#10B981", fontSize: 32, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
              {reportData.totalRevenue.toLocaleString()} <ArrowUpRight size={24} />
            </div>
          </div>
          <div style={{ background: surface, border: `1.5px solid rgba(239,68,68,0.3)`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "إجمالي المصروفات" : "Total Expenses"}</div>
            <div style={{ color: "#EF4444", fontSize: 32, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
              {reportData.totalExpenses.toLocaleString()} <ArrowDownRight size={24} />
            </div>
          </div>
          <div style={{ background: surface, border: `1.5px solid rgba(59,130,246,0.3)`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "صافي الربح" : "Net Profit"}</div>
            <div style={{ color: "#3B82F6", fontSize: 32, fontWeight: 900 }}>{reportData.netProfit.toLocaleString()}</div>
          </div>
          <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "نسبة الربحية" : "Profit Margin"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 32, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
               {reportData.profitMargin}% <TrendingUp size={24} color="#3B82F6" />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Trend Chart (Cash Flow) */}
          <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24 }}>
            <h4 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, margin: "0 0 24px 0" }}>{isRTL ? "الرسم البياني للأرباح" : "Profit Trend"}</h4>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200, paddingBottom: 24, position: "relative" }}>
              {reportData.cashFlow.map((cf, i) => {
                const max = Math.max(...reportData.cashFlow.map(d => d.balance));
                const height = (cf.balance / max) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 1, delay: i * 0.1 }} style={{ width: "100%", background: "linear-gradient(180deg, #10B981, rgba(16,185,129,0.1))", borderRadius: "8px 8px 0 0" }} />
                    <span style={{ position: "absolute", bottom: 0, fontSize: 13, color: ds.textSecondary, fontWeight: 700 }}>{cf.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Category Chart (Expenses) */}
          <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24 }}>
            <h4 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, margin: "0 0 24px 0" }}>{isRTL ? "تحليل المصروفات" : "Expenses Breakdown"}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {reportData.expensesByCategory.map((exp, i) => {
                const percentage = (exp.amount / reportData.totalExpenses) * 100;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, color: ds.textPrimary, marginBottom: 8 }}>
                      <span>{exp.name}</span>
                      <span style={{ color: ds.textSecondary }}>{exp.amount.toLocaleString()} <span style={{ fontSize: 12 }}>({Math.round(percentage)}%)</span></span>
                    </div>
                    <div style={{ height: 12, background: isDark ? ds.surface2 : "#F1F5F9", borderRadius: 6, overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1 }} style={{ height: "100%", background: "#EF4444", borderRadius: 6 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, overflow: "hidden" }}>
          <h4 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, margin: 0, padding: 24, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "حركة الخزينة (Timeline)" : "Cash Flow Timeline"}</h4>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
              <thead style={{ position: "sticky", top: 0, background: isDark ? ds.surface2 : "#F8FAFC", zIndex: 10 }}>
                <tr>
                  <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "التاريخ" : "Date"}</th>
                  <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "البيان" : "Description"}</th>
                  <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "الداخل (قبض)" : "In"}</th>
                  <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "الخارج (صرف)" : "Out"}</th>
                  <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "الرصيد الحالي" : "Balance"}</th>
                </tr>
              </thead>
              <tbody>
                {reportData.cashFlow.map((cf, idx) => (
                  <tr key={cf.id} style={{ borderBottom: idx === reportData.cashFlow.length - 1 ? "none" : `1px solid ${border}`, transition: "background 0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark?ds.surface2:"#F8FAFC"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 15, fontWeight: 700 }}>{cf.date}</td>
                    <td style={{ padding: "20px 24px", color: ds.textPrimary, fontSize: 15, fontWeight: 800 }}>{cf.notes}</td>
                    <td style={{ padding: "20px 24px", color: "#10B981", fontSize: 16, fontWeight: 900 }}>{cf.in > 0 ? cf.in.toLocaleString() : "-"}</td>
                    <td style={{ padding: "20px 24px", color: "#EF4444", fontSize: 16, fontWeight: 900 }}>{cf.out > 0 ? cf.out.toLocaleString() : "-"}</td>
                    <td style={{ padding: "20px 24px", color: ds.textPrimary, fontSize: 16, fontWeight: 900 }}>{cf.balance.toLocaleString()}</td>
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
