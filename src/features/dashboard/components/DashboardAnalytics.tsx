import { useState, useMemo } from "react";
import { useApp } from "@/providers/AppProvider";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LabelList } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, Package, AlertCircle, Clock, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";

// Localized Mock Data by Timeframe
const weeklySalesData = [
  { name: "السبت", sales: 4000 },
  { name: "الأحد", sales: 3000 },
  { name: "الاثنين", sales: 5000 },
  { name: "الثلاثاء", sales: 2780 },
  { name: "الأربعاء", sales: 8900 },
  { name: "الخميس", sales: 6390 },
  { name: "الجمعة", sales: 10400 },
];

const monthlySalesData = [
  { name: "الأسبوع 1", sales: 32000 },
  { name: "الأسبوع 2", sales: 45000 },
  { name: "الأسبوع 3", sales: 29000 },
  { name: "الأسبوع 4", sales: 51000 },
];

const yearlySalesData = [
  { name: "الربع 1", sales: 120000 },
  { name: "الربع 2", sales: 185000 },
  { name: "الربع 3", sales: 150000 },
  { name: "الربع 4", sales: 240000 },
];

const topProductsData = [
  { name: "بيبسي كولا", value: 1200 },
  { name: "شيبس ليز", value: 800 },
  { name: "مياه معدنية 1 لتر", value: 650 },
  { name: "شوكولاتة جالاكسي", value: 400 },
];

const lowStockData = [
  { id: "1", name: "ريد بول 250 مل", stock: 5, min: 20 },
  { id: "2", name: "نسكافيه كلاسيك", stock: 2, min: 10 },
  { id: "3", name: "شاي ليبتون أحمر", stock: 0, min: 15 },
];

const recentTransactions = [
  { id: "1", title: "فاتورة مبيعات #1024", amount: 15500, type: "in", date: "منذ 10 دقائق" },
  { id: "2", title: "مشتريات مورد (شركة المراعي)", amount: 45000, type: "out", date: "منذ 45 دقيقة" },
  { id: "3", title: "فاتورة مبيعات #1025", amount: 8200, type: "in", date: "منذ ساعة" },
  { id: "4", title: "مصروفات (كهرباء)", amount: 12000, type: "out", date: "منذ ساعتين" },
];

export function DashboardAnalytics() {
  const { t, isDark, isRTL, ds } = useApp();
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "yearly">("weekly");
  
  const bg = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#F1F5F9";
  const textPrimary = ds.textPrimary;
  const textSecondary = ds.textSecondary;

  const currentChartData = useMemo(() => {
    switch (timeframe) {
      case "monthly": return monthlySalesData;
      case "yearly": return yearlySalesData;
      default: return weeklySalesData;
    }
  }, [timeframe]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: isDark ? "#1E293B" : "#FFFFFF", border: `1px solid ${border}`, borderRadius: 12, padding: "12px 16px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
          <p style={{ color: textSecondary, fontSize: 13, marginBottom: 4 }}>{label}</p>
          <p style={{ color: "#8B5CF6", fontSize: 16, fontWeight: 800 }}>
            {payload[0].value.toLocaleString()} {isRTL ? "ر.ي" : "YER"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 8 }}>
      {/* Weekly/Monthly/Yearly Sales Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        style={{ background: bg, border: `1px solid ${border}`, borderRadius: 24, padding: 20, boxShadow: ds.shadowMd }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
          <div>
            <h3 style={{ color: textPrimary, fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={18} color="#8B5CF6" /> {isRTL ? "تحليل المبيعات" : "Sales Analytics"}
            </h3>
            <p style={{ color: textSecondary, fontSize: 13, marginTop: 4 }}>
              {timeframe === "weekly" && (isRTL ? "إجمالي المبيعات الأسبوعية" : "Weekly sales analysis")}
              {timeframe === "monthly" && (isRTL ? "إجمالي المبيعات الشهرية" : "Monthly sales analysis")}
              {timeframe === "yearly" && (isRTL ? "إجمالي المبيعات السنوية" : "Yearly sales analysis")}
            </p>
          </div>
          
          {/* Timeframe Selector Button Group */}
          <div style={{ display: "flex", background: isDark ? ds.bg : "#F1F5F9", padding: 4, borderRadius: 12, gap: 4 }}>
            {(["weekly", "monthly", "yearly"] as const).map((mode) => {
              const active = timeframe === mode;
              const modeLabel = {
                weekly: isRTL ? "أسبوعي" : "Weekly",
                monthly: isRTL ? "شهري" : "Monthly",
                yearly: isRTL ? "سنوي" : "Yearly",
              }[mode];

              return (
                <button
                  key={mode}
                  onClick={() => setTimeframe(mode)}
                  style={{
                    border: "none",
                    background: active ? (isDark ? ds.surface2 : "#FFFFFF") : "transparent",
                    color: active ? "#8B5CF6" : ds.textSecondary,
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                    boxShadow: active ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  {modeLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ height: 240, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentChartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#E2E8F0"} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: textSecondary }} dy={10} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sales" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)">
                {/* Always visible data point labels */}
                <LabelList 
                  dataKey="sales" 
                  position="top" 
                  offset={10} 
                  style={{ fill: isDark ? "#F8FAFC" : "#1E293B", fontSize: 10, fontWeight: 800 }} 
                  formatter={(v: number) => `${v.toLocaleString()} ر.ي`} 
                />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Top Products */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        style={{ background: bg, border: `1px solid ${border}`, borderRadius: 24, padding: 20, boxShadow: ds.shadowMd }}
      >
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: textPrimary, fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
            <Package size={18} color="#10B981" /> {isRTL ? "الأكثر مبيعاً" : "Top Selling"}
          </h3>
          <p style={{ color: textSecondary, fontSize: 13, marginTop: 4 }}>{isRTL ? "أفضل المنتجات أداءً هذا الشهر" : "Best performing products this month"}</p>
        </div>

        <div style={{ height: 180, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: textPrimary, fontWeight: 600 }} width={isRTL ? 110 : 90} />
              <Tooltip cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                {topProductsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6"][index % 4]} />
                ))}
                {/* Show amounts directly on the bars */}
                <LabelList dataKey="value" position="right" style={{ fill: textPrimary, fontSize: 11, fontWeight: 700 }} formatter={(v: number) => `${v} قطعة`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Grid for Low Stock and Recent Transactions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        
        {/* Low Stock Alerts */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
          style={{ background: bg, border: `1px solid ${border}`, borderRadius: 24, padding: 20, boxShadow: ds.shadowMd }}
        >
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ color: textPrimary, fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={18} color="#EF4444" /> {isRTL ? "تنبيهات نواقص المخزون" : "Low Stock Alerts"}
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {lowStockData.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 16, background: isDark ? ds.surface2 : "#F8FAFC", border: `1px solid ${border}` }}>
                <div>
                  <div style={{ color: textPrimary, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ color: textSecondary, fontSize: 11 }}>{isRTL ? `الحد الأدنى: ${item.min}` : `Min: ${item.min}`}</div>
                </div>
                <div style={{ background: item.stock === 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)", color: item.stock === 0 ? "#EF4444" : "#F59E0B", padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 800 }}>
                  {item.stock} {isRTL ? "متبقي" : "Left"}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}
          style={{ background: bg, border: `1px solid ${border}`, borderRadius: 24, padding: 20, boxShadow: ds.shadowMd }}
        >
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ color: textPrimary, fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={18} color="#3B82F6" /> {isRTL ? "أحدث العمليات" : "Recent Transactions"}
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentTransactions.map(trx => (
              <div key={trx.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 16, background: isDark ? ds.surface2 : "#FFFFFF", border: `1px solid ${border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: trx.type === "in" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {trx.type === "in" ? <ArrowDownRight size={18} color="#10B981" /> : <ArrowUpRight size={18} color="#EF4444" />}
                  </div>
                  <div>
                    <div style={{ color: textPrimary, fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{trx.title}</div>
                    <div style={{ color: textSecondary, fontSize: 11 }}>{trx.date}</div>
                  </div>
                </div>
                <div style={{ color: trx.type === "in" ? "#10B981" : "#EF4444", fontSize: 14, fontWeight: 800 }}>
                  {trx.type === "in" ? "+" : "-"}{trx.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </div>
  );
}
