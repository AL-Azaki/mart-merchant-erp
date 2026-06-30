import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PieChart, TrendingUp, Package, DollarSign, Calendar, ChevronRight, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { SalesSummaryReport } from "../components/SalesSummaryReport";
import { InventoryReport } from "../components/InventoryReport";
import { FinanceReport } from "../components/FinanceReport";
import { StockDiscrepancyReport } from "../components/StockDiscrepancyReport";

export function ReportsModule({ onBack }: { onBack?: () => void }) {
  const { t, isDark, isRTL, ds } = useApp();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const reportCategories = [
    {
      id: "sales",
      title: isRTL ? "تقارير المبيعات" : "Sales Reports",
      description: isRTL ? "تحليل المبيعات اليومية، والمنتجات الأكثر مبيعاً." : "Daily sales analysis and top selling products.",
      icon: TrendingUp,
      color: "#3B82F6",
      reports: [
        { id: "sales_summary", label: isRTL ? "ملخص المبيعات" : "Sales Summary" },
        { id: "top_products", label: isRTL ? "المنتجات الأكثر مبيعاً" : "Top Products" },
        { id: "sales_by_branch", label: isRTL ? "المبيعات حسب الفرع" : "Sales by Branch" }
      ]
    },
    {
      id: "inventory",
      title: isRTL ? "تقارير المخزون" : "Inventory Reports",
      description: isRTL ? "حركة المخزون، تقييم البضاعة، والنواقص." : "Stock movement, valuation, and shortages.",
      icon: Package,
      color: "#F59E0B",
      reports: [
        { id: "stock_balance", label: isRTL ? "أرصدة المخزون" : "Stock Balance" },
        { id: "inventory_valuation", label: isRTL ? "تقييم المخزون" : "Inventory Valuation" },
        { id: "stock_movement", label: isRTL ? "حركة المخزون" : "Stock Movement" },
        { id: "stock_adjustments", label: isRTL ? "فروقات الجرد" : "Stock Adjustments" }
      ]
    },
    {
      id: "finance",
      title: isRTL ? "التقارير المالية" : "Financial Reports",
      description: isRTL ? "حركة الخزينة، الأرباح والخسائر، وكشف حساب." : "Cash flow, profit & loss, and statements.",
      icon: DollarSign,
      color: "#10B981",
      reports: [
        { id: "cash_flow", label: isRTL ? "حركة الخزينة" : "Cash Flow" },
        { id: "profit_loss", label: isRTL ? "الأرباح والخسائر" : "Profit & Loss" },
        { id: "expense_summary", label: isRTL ? "ملخص المصروفات" : "Expense Summary" }
      ]
    }
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", background: surface, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {onBack && !activeCategory && (
            <button title={isRTL ? "رجوع" : "Back"} onClick={onBack} style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginInlineEnd: 8 }}>
              <BackIcon size={20} color={ds.textPrimary} />
            </button>
          )}
          {activeCategory && (
            <button title={isRTL ? "رجوع للتقارير" : "Back to Reports"} onClick={() => { setActiveCategory(null); setActiveReport(null); }} style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginInlineEnd: 8 }}>
              <BackIcon size={20} color={ds.textPrimary} />
            </button>
          )}
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(139, 92, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PieChart size={22} color="#8B5CF6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>
              {activeCategory ? reportCategories.find(c => c.id === activeCategory)?.title : (isRTL ? "التقارير والتحليلات" : "Reports & Analytics")}
            </h2>
            <p style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 500 }}>
              {isRTL ? "نظرة شاملة على أداء أعمالك" : "Comprehensive view of your business performance"}
            </p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          {!activeCategory ? (
            <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ height: "100%", overflowY: "auto", padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                {reportCategories.map(cat => (
                  <motion.div key={cat.id} whileHover={{ y: -4 }} onClick={() => { setActiveCategory(cat.id); setActiveReport(cat.reports[0].id); }}
                    style={{ background: surface, border: `1px solid ${border}`, borderRadius: 20, padding: 20, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${cat.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <cat.icon size={24} color={cat.color} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: ds.textPrimary }}>{cat.title}</h3>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: ds.textSecondary }}>{cat.reports.length} {isRTL ? "تقارير فرعية" : "Sub-reports"}</p>
                      </div>
                    </div>
                    <p style={{ color: ds.textSecondary, fontSize: 14, lineHeight: 1.5, marginBottom: 20, flex: 1 }}>{cat.description}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: cat.color, fontSize: 14, fontWeight: 700 }}>
                      {isRTL ? "عرض التقارير" : "View Reports"}
                      <ChevronRight size={18} style={{ transform: isRTL ? "rotate(180deg)" : "none" }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="report" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ height: "100%", display: "flex" }}>
              {/* Sidebar for Sub-reports */}
              <div style={{ width: 260, borderRight: isRTL ? "none" : `1px solid ${border}`, borderLeft: isRTL ? `1px solid ${border}` : "none", background: isDark ? ds.surface2 : "#F8FAFC", padding: 16, overflowY: "auto", flexShrink: 0 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: ds.textSecondary, marginBottom: 16, padding: "0 8px" }}>
                  {isRTL ? "التقارير الفرعية" : "Sub Reports"}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {reportCategories.find(c => c.id === activeCategory)?.reports.map(rep => (
                    <button
                      key={rep.id}
                      onClick={() => setActiveReport(rep.id)}
                      style={{
                        padding: "12px 16px", background: activeReport === rep.id ? ds.primary : "transparent",
                        color: activeReport === rep.id ? "#FFF" : ds.textPrimary,
                        border: "none", borderRadius: 12, textAlign: isRTL ? "right" : "left",
                        fontSize: 14, fontWeight: activeReport === rep.id ? 700 : 600, cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {rep.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Report Area */}
              <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
                {activeReport === "sales_summary" ? (
                  <SalesSummaryReport />
                ) : activeReport === "stock_balance" || activeReport === "inventory_valuation" ? (
                  <InventoryReport />
                ) : activeReport === "stock_adjustments" ? (
                  <StockDiscrepancyReport />
                ) : activeReport === "cash_flow" || activeReport === "profit_loss" ? (
                  <FinanceReport />
                ) : (
                  <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 20, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: ds.textSecondary }}>
                    <FileText size={64} color={border} style={{ marginBottom: 16 }} />
                    <h3 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "جاري بناء التقرير..." : "Building Report..."}</h3>
                    <p style={{ fontSize: 14, maxWidth: 300, textAlign: "center" }}>
                      {isRTL ? "سيتم عرض الجداول والرسوم البيانية هنا قريباً." : "Tables and charts will be displayed here soon."}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
