import { useState } from "react";
import { useApp } from "@/providers/AppProvider";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LabelList } from "recharts";
import { motion } from "motion/react";
import { TrendingUp, Package, AlertCircle, Clock, ArrowUpRight, ArrowDownRight, User, Users, Box, CheckCircle } from "lucide-react";

// Localized Mock Data by Timeframe
const overviewData = {
  today: [
    { name: "08:00", sales: 1200 }, { name: "10:00", sales: 3000 }, { name: "12:00", sales: 2500 },
    { name: "14:00", sales: 4200 }, { name: "16:00", sales: 3800 }, { name: "18:00", sales: 6500 },
  ],
  weekly: [
    { name: "السبت", sales: 4000 }, { name: "الأحد", sales: 3000 }, { name: "الاثنين", sales: 5000 },
    { name: "الثلاثاء", sales: 2780 }, { name: "الأربعاء", sales: 8900 }, { name: "الخميس", sales: 6390 }, { name: "الجمعة", sales: 10400 },
  ],
  monthly: [
    { name: "الأسبوع 1", sales: 32000 }, { name: "الأسبوع 2", sales: 45000 },
    { name: "الأسبوع 3", sales: 29000 }, { name: "الأسبوع 4", sales: 51000 },
  ],
  yearly: [
    { name: "الربع 1", sales: 120000 }, { name: "الربع 2", sales: 185000 },
    { name: "الربع 3", sales: 150000 }, { name: "الربع 4", sales: 240000 },
  ]
};

const topProductsData = [
  { name: "لابتوب ديل XPS", value: 12 }, { name: "شاشة سامسونج", value: 8 },
  { name: "ماوس وايرلس", value: 25 }, { name: "لوحة مفاتيح", value: 15 },
];

const topCustomersData = [
  { name: "أحمد عبدالله", value: 150000 }, { name: "مؤسسة النور", value: 120000 },
  { name: "علي محمد", value: 85000 }, { name: "شركة التقنية", value: 65000 },
];

const lowStockData = [
  { id: "1", name: "شاشة آيفون 13", stock: 2, min: 10, type: "low" },
  { id: "2", name: "بطارية سامسونج", stock: 0, min: 5, type: "out" },
];

const dueAlertsData = [
  { id: "3", name: "مؤسسة النور", desc: "فاتورة متأخرة الدفع", amount: 45000, type: "warning" },
  { id: "4", name: "المورد: شركة أبل", desc: "دفعة مستحقة", amount: 120000, type: "danger" },
];

const recentTimeline = [
  { id: "1", title: "فاتورة مبيعات #1024", icon: ArrowUpRight, color: "#10B981", time: "منذ 10 دقائق", details: "مبيعات نقدية بقيمة 15,500 ر.ي" },
  { id: "2", title: "مشتريات مورد", icon: ArrowDownRight, color: "#EF4444", time: "منذ 45 دقيقة", details: "شركة المراعي بقيمة 45,000 ر.ي" },
  { id: "3", title: "إضافة عميل جديد", icon: User, color: "#3B82F6", time: "منذ ساعة", details: "تمت إضافة العميل: خالد محمود" },
  { id: "4", title: "تسوية جرد", icon: Box, color: "#F59E0B", time: "منذ ساعتين", details: "تسوية مخزون المستودع الرئيسي" },
];

export function DashboardAnalytics() {
  const { isDark, isRTL, ds } = useApp();
  const [timeframe, setTimeframe] = useState<"today" | "weekly" | "monthly" | "yearly">("weekly");
  
  const bg = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#F1F5F9";
  const textPrimary = ds.textPrimary;
  const textSecondary = ds.textSecondary;

  const currentChartData = overviewData[timeframe];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: isDark ? "#1E293B" : "#FFFFFF", border: `1.5px solid ${border}`, borderRadius: 16, padding: "12px 20px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
          <p style={{ color: textSecondary, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{label}</p>
          <p style={{ color: "#3B82F6", fontSize: 18, fontWeight: 900 }}>
            {payload[0].value.toLocaleString()} {isRTL ? "ر.ي" : "YER"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 8 }}>
      
      {/* 1. Business Overview Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 24, padding: 24, boxShadow: ds.shadowMd }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
          <div>
            <h3 style={{ color: textPrimary, fontSize: 18, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={24} color="#3B82F6" /> {isRTL ? "نظرة عامة على الأعمال" : "Business Overview"}
            </h3>
          </div>
          
          <div style={{ display: "flex", background: isDark ? ds.bg : "#F1F5F9", padding: 6, borderRadius: 16, gap: 4 }}>
            {(["today", "weekly", "monthly", "yearly"] as const).map((mode) => {
              const active = timeframe === mode;
              const modeLabel = { today: isRTL ? "اليوم" : "Today", weekly: isRTL ? "الأسبوع" : "Week", monthly: isRTL ? "الشهر" : "Month", yearly: isRTL ? "السنة" : "Year" }[mode];
              return (
                <button
                  key={mode} onClick={() => setTimeframe(mode)}
                  style={{
                    border: "none", background: active ? (isDark ? ds.surface2 : "#FFFFFF") : "transparent",
                    color: active ? "#3B82F6" : ds.textSecondary,
                    padding: "8px 20px", borderRadius: 12, fontSize: 14, fontWeight: 800,
                    cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
                    boxShadow: active ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  {modeLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ height: 260, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentChartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#E2E8F0"} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 600, fill: textSecondary }} dy={10} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)">
                <LabelList dataKey="sales" position="top" offset={10} style={{ fill: isDark ? "#F8FAFC" : "#1E293B", fontSize: 12, fontWeight: 800 }} formatter={(v: number) => v.toLocaleString()} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 2. Smart Widgets (Grid) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 24, padding: 24, boxShadow: ds.shadowMd }}
        >
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ color: textPrimary, fontSize: 18, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <Package size={22} color="#10B981" /> {isRTL ? "أفضل المنتجات مبيعاً" : "Top Products"}
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {topProductsData.map((item, i) => {
              const max = Math.max(...topProductsData.map(d => d.value));
              const pct = (item.value / max) * 100;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>
                    <span>{item.name}</span>
                    <span style={{ color: textSecondary }}>{item.value} {isRTL ? "قطعة" : "pcs"}</span>
                  </div>
                  <div style={{ height: 12, background: isDark ? ds.surface2 : "#F1F5F9", borderRadius: 6, overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} style={{ height: "100%", background: "#10B981", borderRadius: 6 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 24, padding: 24, boxShadow: ds.shadowMd }}
        >
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ color: textPrimary, fontSize: 18, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={22} color="#8B5CF6" /> {isRTL ? "أفضل العملاء" : "Top Customers"}
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {topCustomersData.map((item, i) => {
              const max = Math.max(...topCustomersData.map(d => d.value));
              const pct = (item.value / max) * 100;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>
                    <span>{item.name}</span>
                    <span style={{ color: textSecondary }}>{item.value.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 12, background: isDark ? ds.surface2 : "#F1F5F9", borderRadius: 6, overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} style={{ height: "100%", background: "#8B5CF6", borderRadius: 6 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* 3. Alerts Center & Recent Activities */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, paddingBottom: 80 }}>
        
        {/* Alerts Center */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 24, padding: 24, boxShadow: ds.shadowMd }}
        >
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: textPrimary, fontSize: 18, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={22} color="#EF4444" /> {isRTL ? "مركز التنبيهات" : "Alerts Center"}
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Stock Alerts */}
            {lowStockData.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, borderRadius: 16, background: isDark ? ds.surface2 : (item.type === "out" ? "#FEF2F2" : "#FFFBEB"), border: `1px solid ${item.type === "out" ? "#FECACA" : "#FDE68A"}` }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: item.type === "out" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={24} color={item.type === "out" ? "#EF4444" : "#F59E0B"} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: textPrimary, fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ color: textSecondary, fontSize: 13, fontWeight: 600 }}>{isRTL ? `رصيد: ${item.stock} | أدنى: ${item.min}` : `Stock: ${item.stock} | Min: ${item.min}`}</div>
                </div>
              </div>
            ))}
            {/* Due Alerts */}
            {dueAlertsData.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, borderRadius: 16, background: isDark ? ds.surface2 : (item.type === "danger" ? "#FEF2F2" : "#FFFBEB"), border: `1px solid ${item.type === "danger" ? "#FECACA" : "#FDE68A"}` }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: item.type === "danger" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertCircle size={24} color={item.type === "danger" ? "#EF4444" : "#F59E0B"} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: textPrimary, fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ color: textSecondary, fontSize: 13, fontWeight: 600 }}>{item.desc}</div>
                </div>
                <div style={{ color: item.type === "danger" ? "#EF4444" : "#F59E0B", fontSize: 18, fontWeight: 900 }}>
                  {item.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activities Timeline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 24, padding: 24, boxShadow: ds.shadowMd }}
        >
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: textPrimary, fontSize: 18, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={22} color="#14B8A6" /> {isRTL ? "آخر العمليات (Timeline)" : "Recent Activities"}
            </h3>
          </div>
          <div style={{ position: "relative", paddingLeft: isRTL ? 0 : 20, paddingRight: isRTL ? 20 : 0 }}>
            {/* Timeline line */}
            <div style={{ position: "absolute", top: 0, bottom: 0, [isRTL ? "right" : "left"]: isRTL ? 39 : 39, width: 2, background: isDark ? ds.border : "#E2E8F0" }} />
            
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {recentTimeline.map((item, i) => (
                <div key={item.id} style={{ display: "flex", gap: 16, position: "relative", zIndex: 1 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: bg, border: `2px solid ${item.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <item.icon size={20} color={item.color} />
                  </div>
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ color: textPrimary, fontSize: 15, fontWeight: 800 }}>{item.title}</div>
                      <div style={{ color: textSecondary, fontSize: 12, fontWeight: 700 }}>{item.time}</div>
                    </div>
                    <div style={{ color: textSecondary, fontSize: 14, fontWeight: 600 }}>{item.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>

    </div>
  );
}
