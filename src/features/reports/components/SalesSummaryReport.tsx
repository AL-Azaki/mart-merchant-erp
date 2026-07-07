import { useState } from "react";
import { motion } from "motion/react";
import { TrendingUp, User, Package, Download } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { ReportFilterBar } from "./ReportFilterBar";

export function SalesSummaryReport() {
  const { isDark, isRTL, ds } = useApp();
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  // Mock Report Data
  const reportData = {
    totalSales: 45000,
    totalOrders: 120,
    averageOrderValue: 375,
    topCustomer: "أحمد عبدالله",
    topProduct: "لابتوب ديل XPS",
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
    ],
    invoices: [
      { id: "INV-001", customer: "أحمد عبدالله", date: "2023-11-01", total: 1500, status: "Paid" },
      { id: "INV-002", customer: "مؤسسة النور", date: "2023-11-02", total: 4500, status: "Unpaid" },
      { id: "INV-003", customer: "علي محمد", date: "2023-11-02", total: 300, status: "Paid" },
    ]
  };

  return (
    <div className="report-container" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TrendingUp size={24} color="#3B82F6" />
        </div>
        <div>
          <h2 style={{ margin: 0, color: ds.textPrimary, fontSize: 20, fontWeight: 800 }}>{isRTL ? "تقرير المبيعات الشامل" : "Comprehensive Sales Report"}</h2>
          <p style={{ margin: 0, color: ds.textSecondary, fontSize: 14, fontWeight: 600 }}>{isRTL ? "تحليل مبيعات الفروع والمنتجات" : "Branch and product sales analysis"}</p>
        </div>
      </div>

      <ReportFilterBar onRefresh={() => {}} onExport={() => window.print()} />

      <div className="print-content" style={{ flex: 1, overflowY: "auto", paddingBottom: 24, display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "إجمالي المبيعات" : "Total Sales"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 32, fontWeight: 900 }}>{reportData.totalSales.toLocaleString()} <span style={{ fontSize: 16 }}>{isRTL ? "ر.ي" : "YER"}</span></div>
          </div>
          <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "عدد الفواتير" : "Total Orders"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 32, fontWeight: 900 }}>{reportData.totalOrders}</div>
          </div>
          <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "متوسط الفاتورة" : "Average Order"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 32, fontWeight: 900 }}>{reportData.averageOrderValue.toLocaleString()}</div>
          </div>
          <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "أفضل عميل" : "Top Customer"}</div>
            <div style={{ color: "#3B82F6", fontSize: 24, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}><User size={20} /> {reportData.topCustomer}</div>
          </div>
          <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "أفضل منتج" : "Top Product"}</div>
            <div style={{ color: "#10B981", fontSize: 24, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}><Package size={20} /> {reportData.topProduct}</div>
          </div>
        </div>

        {/* Charts section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Trend Chart */}
          <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24 }}>
            <h4 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, margin: "0 0 24px 0" }}>{isRTL ? "تريند المبيعات" : "Sales Trend"}</h4>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200, paddingBottom: 24, position: "relative" }}>
              {reportData.recentDays.map((day, i) => {
                const max = Math.max(...reportData.recentDays.map(d => d.sales));
                const height = (day.sales / max) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 1, delay: i * 0.1 }} style={{ width: "100%", background: "linear-gradient(180deg, #3B82F6, rgba(59,130,246,0.1))", borderRadius: "8px 8px 0 0" }} />
                    <span style={{ position: "absolute", bottom: 0, fontSize: 13, color: ds.textSecondary, fontWeight: 700 }}>{day.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Category Chart */}
          <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 24 }}>
            <h4 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, margin: "0 0 24px 0" }}>{isRTL ? "المبيعات حسب الفئة" : "Sales by Category"}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {reportData.topCategories.map(cat => (
                <div key={cat.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, color: ds.textPrimary, marginBottom: 8 }}>
                    <span>{cat.name}</span>
                    <span style={{ color: ds.textSecondary }}>{cat.sales.toLocaleString()} ({cat.percentage}%)</span>
                  </div>
                  <div style={{ height: 12, background: isDark ? ds.surface2 : "#F1F5F9", borderRadius: 6, overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${cat.percentage}%` }} transition={{ duration: 1, ease: "easeOut" }} style={{ height: "100%", background: "#3B82F6", borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, overflow: "hidden" }}>
          <h4 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, margin: 0, padding: 24, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "تفاصيل الفواتير" : "Invoices Detail"}</h4>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
              <thead style={{ position: "sticky", top: 0, background: isDark ? ds.surface2 : "#F8FAFC", zIndex: 10 }}>
                <tr>
                  <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "رقم الفاتورة" : "Invoice No"}</th>
                  <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "العميل" : "Customer"}</th>
                  <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "التاريخ" : "Date"}</th>
                  <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "الإجمالي" : "Total"}</th>
                  <th style={{ padding: "16px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 800, borderBottom: `1.5px solid ${border}` }}>{isRTL ? "الحالة" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {reportData.invoices.map((inv, idx) => (
                  <tr key={inv.id} style={{ borderBottom: idx === reportData.invoices.length - 1 ? "none" : `1px solid ${border}`, transition: "background 0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark?ds.surface2:"#F8FAFC"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding: "20px 24px", color: ds.textPrimary, fontSize: 15, fontWeight: 800 }}>{inv.id}</td>
                    <td style={{ padding: "20px 24px", color: ds.textPrimary, fontSize: 15, fontWeight: 700 }}>{inv.customer}</td>
                    <td style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 15, fontWeight: 600 }}>{inv.date}</td>
                    <td style={{ padding: "20px 24px", color: ds.textPrimary, fontSize: 16, fontWeight: 800 }}>{inv.total.toLocaleString()}</td>
                    <td style={{ padding: "20px 24px" }}>
                      <span style={{ padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 800, background: inv.status === "Paid" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: inv.status === "Paid" ? "#10B981" : "#F59E0B" }}>
                        {inv.status}
                      </span>
                    </td>
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
