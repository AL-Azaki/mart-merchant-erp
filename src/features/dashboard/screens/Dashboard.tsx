import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  ShoppingCart,
  Package,
  ShoppingBag,
  Settings,
  Bell,
  User,
  DollarSign,
  PieChart,
  Users,
  FileText,
  Plus,
  LogOut,
  ChevronRight,
  Box,
  CreditCard,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { SettingsBar } from "@/shared/components/SettingsBar";
import { SalesModule } from "@/features/sales/screens/SalesModule";
import { InventoryModule } from "@/features/inventory/screens/InventoryModule";
import { FinanceModule } from "@/features/finance/screens/FinanceModule";
import { UsersRolesModule } from "@/features/users/screens/UsersRolesModule";
import { ReportsModule } from "@/features/reports/screens/ReportsModule";
import { SettingsModule } from "@/features/settings/screens/SettingsModule";
import { DashboardAnalytics } from "../components/DashboardAnalytics";
import {
  MOCK_USER,
  MOCK_BUSINESS,
  MOCK_DASHBOARD_STATS,
  MOCK_BRANCHES,
} from "@/core/data/mockData";
import { MOCK_CUSTOMERS, MOCK_PRODUCTS } from "@/core/data/salesMockData";
import { MOCK_SUPPLIERS } from "@/core/data/purchasesMockData";

interface DashboardProps {
  onLogout?: () => void;
}

const CORE_NAV = [
  { id: "home", tabIndex: 0, Icon: Home, labelAr: "الرئيسية", labelEn: "Home" },
  { id: "sales", tabIndex: 1, Icon: ShoppingCart, labelAr: "المبيعات", labelEn: "Sales" },
  { id: "inventory", tabIndex: 2, Icon: Package, labelAr: "المخزون", labelEn: "Inventory" },
  { id: "finance", tabIndex: 3, Icon: DollarSign, labelAr: "المالية", labelEn: "Finance" },
  { id: "settings", tabIndex: 4, Icon: Settings, labelAr: "الإعدادات", labelEn: "Settings" },
];

export function Dashboard({ onLogout }: DashboardProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [settingsView, setSettingsView] = useState<"main" | "users">("main");
  const [customers, setCustomers] = useState<any[]>(MOCK_CUSTOMERS);
  const [products, setProducts] = useState<any[]>(MOCK_PRODUCTS);
  const [suppliers, setSuppliers] = useState<any[]>(MOCK_SUPPLIERS);
  const [quickAction, setQuickAction] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleQuickAction = (actionId: string, tabIndex: number) => {
    setQuickAction(actionId);
    setActiveTab(tabIndex);
    // Reset quick action after a short delay so if the user closes the form, returning to tab doesn't reopen it
    setTimeout(() => setQuickAction(null), 100);
  };

  const user = MOCK_USER;
  const business = MOCK_BUSINESS;
  const branch = MOCK_BRANCHES[0];
  const stats = MOCK_DASHBOARD_STATS;

  // ── Stat cards ──────────────────────────────────────────────────────────────
  const statCards = [
    {
      Icon: DollarSign,
      label: t.todaySales,
      value: stats.today_sales.toLocaleString(),
      unit: t.currencyYER,
      color: "#3B82F6",
      bg: isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF",
      border: isDark ? "rgba(59, 130, 246, 0.25)" : "#BFDBFE",
    },
    {
      Icon: TrendingDown,
      label: isRTL ? "ديون العملاء (لنا)" : "Receivables (Debts)",
      value: "850,000",
      unit: t.currencyYER,
      color: "#10B981",
      bg: isDark ? "rgba(16, 185, 129, 0.15)" : "#F0FDFA",
      border: isDark ? "rgba(16, 185, 129, 0.25)" : "#A7F3D0",
    },
    {
      Icon: TrendingUp,
      label: isRTL ? "ديون الموردين (علينا)" : "Supplier Payables",
      value: "420,000",
      unit: t.currencyYER,
      color: "#EF4444",
      bg: isDark ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2",
      border: isDark ? "rgba(239, 68, 68, 0.25)" : "#FCA5A5",
    },
    {
      Icon: CreditCard,
      label: isRTL ? "المصروفات التشغيلية" : "Operating Expenses",
      value: "120,000",
      unit: t.currencyYER,
      color: "#F59E0B",
      bg: isDark ? "rgba(245, 158, 11, 0.15)" : "#FFFBEB",
      border: isDark ? "rgba(245, 158, 11, 0.25)" : "#FDE68A",
    },
  ];

  // ── Quick actions (Ordered by priority) ──────────────────────────────────────
  const quickActions = [
    { id: "newSale", Icon: ShoppingCart, label: t.newSale, color: "#3B82F6", tab: 1 },
    { id: "addProduct", Icon: Plus, label: t.addProduct, color: "#10B981", tab: 2 },
    { id: "newCustomer", Icon: User, label: t.newCustomer, color: "#8B5CF6", tab: 2 },
    { id: "newPurchase", Icon: ShoppingBag, label: isRTL ? "شراء بضاعة" : "New Purchase", color: "#EC4899", tab: 2 },
    { id: "expenses", Icon: CreditCard, label: isRTL ? "صرفيات" : "Expenses", color: "#EF4444", tab: 3 },
  ];

  // ── Render: Home tab ────────────────────────────────────────────────────────
  const renderHome = () => (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px 20px 24px",
      }}
    >
      {/* Overview Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700 }}>
          {t.mainDashboard}
        </h3>
        <span style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 500 }}>
          {new Date().toLocaleDateString(isRTL ? "ar-YE" : "en-US", { day: "numeric", month: "long" })}
        </span>
      </div>

      {/* Stat cards in one row */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 24 }}
            whileHover={{ y: -1, boxShadow: ds.shadowMd }}
            style={{
              background: isDark ? ds.surface : "#FFFFFF",
              borderRadius: 16,
              padding: "12px",
              boxShadow: ds.shadowSm,
              border: `1px solid ${isDark ? ds.border : "#F1F5F9"}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              position: "relative",
              overflow: "hidden",
              flex: "1 0 160px",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: s.bg,
                border: `1px solid ${s.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <s.Icon size={16} color={s.color} strokeWidth={2.5} />
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: ds.textSecondary,
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    color: ds.textPrimary,
                    fontSize: 15,
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </span>
                <span style={{ color: ds.textMuted, fontSize: 10, fontWeight: 600 }}>
                  {s.unit}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: 28 }}>
        <h3
          style={{
            color: ds.textPrimary,
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          {t.quickActions}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
            gap: 10,
          }}
        >
          {quickActions.map((a, i) => (
            <motion.button
              key={i}
              onClick={() => handleQuickAction(a.id, a.tab)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08, type: "spring" }}
              whileTap={{ scale: 0.92 }}
              style={{
                padding: "16px 8px",
                background: isDark ? ds.surface : "#FFFFFF",
                border: `1px solid ${isDark ? ds.border : "#F1F5F9"}`,
                borderRadius: 20,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                boxShadow: ds.shadowSm,
                fontFamily: "inherit",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: isDark ? `${a.color}15` : `${a.color}10`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <a.Icon size={22} color={a.color} strokeWidth={2.2} />
              </div>
              <span
                style={{
                  color: ds.textPrimary,
                  fontSize: 11,
                  fontWeight: 600,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {a.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Analytics Charts */}
      <DashboardAnalytics />
      
    </div>
  );

  // ── Render: Settings tab ────────────────────────────────────────────────────
  const renderSettings = () => {
    return <SettingsModule onLogout={onLogout} />;
  };

  // ── Content routing ─────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case 0: return renderHome();
      case 1: return <SalesModule customers={customers} products={products} initialView={quickAction === "newSale" ? "new" : "main"} />;
      case 2: return (
        <InventoryModule 
          products={products} 
          onUpdateProducts={setProducts} 
          customers={customers}
          onUpdateCustomers={setCustomers}
          suppliers={suppliers}
          onUpdateSuppliers={setSuppliers}
          initialAction={
            quickAction === "addProduct" ? "new" : 
            quickAction === "newCustomer" ? "newCustomer" : 
            quickAction === "newPurchase" ? "newPurchase" : 
            null
          } 
        />
      );
      case 3: return <FinanceModule initialAction={quickAction === "expenses" ? "expense" : null} />;
      case 4: return settingsView === "users" ? <UsersRolesModule onBack={() => setSettingsView("main")} /> : renderSettings();
      default: return renderHome();
    }
  };

  return (
    <div
      style={{
        height: "100%",
        background: isDark ? ds.bg : "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        position: "relative"
      }}
    >
      {/* Top bar — Premium Horizontal Navbar */}
      <div
        style={{
          background: isDark ? ds.surface : "#FFFFFF",
          padding: "16px 24px",
          flexShrink: 0,
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`,
          boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 20px rgba(37,99,235,0.06)"
        }}
      >
        {/* Left: User Greeting & Business */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, overflow: "hidden", border: `2px solid ${isDark ? "rgba(99, 102, 241, 0.4)" : "#6366F1"}`, display: "flex", alignItems: "center", justifyContent: "center", background: ds.surface2 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: ds.primary }}>{(user.full_name || "").charAt(0)}</span>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 700 }}>{user.full_name || ""}</span>
              <span style={{ padding: "2px 8px", background: "rgba(99,102,241,0.15)", borderRadius: 6, color: ds.primary, fontSize: 10, fontWeight: 700 }}>{isRTL ? "مسؤول" : "Admin"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: ds.textSecondary, fontSize: 12, marginTop: 2 }}>
              <span>{business.name}</span>
              <span>•</span>
              <span>{branch.name}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Status badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: isDark ? ds.surface2 : "#F1F5F9", borderRadius: 12, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, marginRight: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "#10B981", boxShadow: "0 0 0 3px rgba(16,185,129,0.15)" }} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: ds.textSecondary }}>
              {isRTL ? "متصل بالشبكة" : "Online"}
            </span>
          </div>

          <button style={{ width: 44, height: 44, borderRadius: 14, background: isDark ? ds.surface2 : "#F8FAFC", border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = isDark ? ds.border : "#F1F5F9"} onMouseLeave={e => e.currentTarget.style.background = isDark ? ds.surface2 : "#F8FAFC"}>
            <Bell size={20} color={ds.textPrimary} />
            <div style={{ position: "absolute", top: 12, right: 12, width: 8, height: 8, borderRadius: 4, background: "#EF4444", border: `2px solid ${isDark ? ds.surface2 : "#F8FAFC"}` }} />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation - Classic 5 Items Dock */}
      <div
        style={{
          position: "absolute",
          bottom: 24, // Safe area padding
          left: 24,
          right: 24,
          background: isDark ? "rgba(12, 25, 41, 0.95)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
          borderRadius: 24,
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 16px",
          zIndex: 50,
          boxShadow: isDark ? "0 20px 40px rgba(0,0,0,0.5)" : "0 20px 40px rgba(15, 23, 42, 0.1)",
        }}
      >
        {CORE_NAV.map(({ id, tabIndex, Icon, labelAr, labelEn }) => {
          const isActive = activeTab === tabIndex;
          
          return (
            <button
              key={id}
              onClick={() => {
                setActiveTab(tabIndex);
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                position: "relative",
                fontFamily: "inherit",
                flex: 1,
                minWidth: 56,
                WebkitTapHighlightColor: "transparent"
              }}
            >
              <Icon
                size={24}
                color={isActive ? ds.primary : ds.textMuted}
                strokeWidth={isActive ? 2.5 : 2}
                style={{ transition: "color 0.2s" }}
              />
              <span style={{ 
                fontSize: 11, 
                fontWeight: isActive ? 800 : 600, 
                color: isActive ? ds.primary : ds.textMuted,
                transition: "color 0.2s"
              }}>
                {isRTL ? labelAr : labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
