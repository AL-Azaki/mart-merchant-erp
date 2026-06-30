import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  ShoppingCart,
  Package,
  ShoppingBag,
  BarChart2,
  Settings,
  Bell,
  User,
  Building2,
  TrendingUp,
  DollarSign,
  PieChart,
  Users,
  FileText,
  Plus,
  Zap,
  LogOut,
  ChevronRight,
  TrendingDown,
  Box,
  CreditCard,
  MapPin,
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { SettingsBar } from "@/shared/components/SettingsBar";
import { LogoSVG } from "@/features/onboarding/screens/SplashScreen";
import { SalesModule } from "@/features/sales/screens/SalesModule";
import { InventoryModule } from "@/features/inventory/screens/InventoryModule";
import { ContactListScreen } from "@/features/crm/screens/ContactListScreen";
import { FinanceModule } from "@/features/finance/screens/FinanceModule";
import { PurchasesModule } from "@/features/purchases/screens/PurchasesModule";
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

interface DashboardProps {
  onLogout?: () => void;
}

const NAV_ITEMS = [
  { Icon: Home, labelKey: "navHome" },
  { Icon: ShoppingCart, labelKey: "navSales" },
  { Icon: Package, labelKey: "navInventory" },
  { Icon: ShoppingBag, labelKey: "navPurchases", fallbackLabel: "المشتريات" },
  { Icon: Users, labelKey: "navCustomers", fallbackLabel: "Customers" },
  { Icon: DollarSign, labelKey: "navFinance" },
  { Icon: PieChart, labelKey: "navReports", fallbackLabel: "التقارير" },
  { Icon: Settings, labelKey: "navSettings" },
];

export function Dashboard({ onLogout }: DashboardProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [settingsView, setSettingsView] = useState<"main" | "users">("main");
  const [customers, setCustomers] = useState<any[]>(MOCK_CUSTOMERS);
  const [products, setProducts] = useState<any[]>(MOCK_PRODUCTS);
  const [quickAction, setQuickAction] = useState<string | null>(null);

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
      Icon: FileText,
      label: t.totalInvoices,
      value: stats.today_invoices.toString(),
      unit: t.invoices,
      color: "#F59E0B",
      bg: isDark ? "rgba(245, 158, 11, 0.15)" : "#FFFBEB",
      border: isDark ? "rgba(245, 158, 11, 0.25)" : "#FDE68A",
    },
    {
      Icon: Box,
      label: t.totalProducts,
      value: stats.total_products.toString(),
      unit: t.items,
      color: "#10B981",
      bg: isDark ? "rgba(16, 185, 129, 0.15)" : "#F0FDFA",
      border: isDark ? "rgba(16, 185, 129, 0.25)" : "#A7F3D0",
    },
    {
      Icon: Users,
      label: t.totalCustomers,
      value: stats.total_customers.toString(),
      unit: t.clients,
      color: "#8B5CF6",
      bg: isDark ? "rgba(139, 92, 246, 0.15)" : "#F5F3FF",
      border: isDark ? "rgba(139, 92, 246, 0.25)" : "#DDD6FE",
    },
  ];

  // ── Quick actions (Ordered by priority) ──────────────────────────────────────
  const quickActions = [
    { id: "newSale", Icon: ShoppingCart, label: t.newSale, color: "#3B82F6", tab: 1 },
    { id: "addProduct", Icon: Plus, label: t.addProduct, color: "#10B981", tab: 2 },
    { id: "newCustomer", Icon: User, label: t.newCustomer, color: "#8B5CF6", tab: 4 },
    { id: "expenses", Icon: CreditCard, label: isRTL ? "صرفيات" : "Expenses", color: "#EF4444", tab: 5 },
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

      {/* Stat cards 2x2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 24 }}
            whileHover={{ y: -2, boxShadow: ds.shadowLg }}
            style={{
              background: isDark ? ds.surface : "#FFFFFF",
              borderRadius: 20,
              padding: "16px",
              boxShadow: ds.shadowMd,
              border: `1px solid ${isDark ? ds.border : "#F1F5F9"}`,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top Right Decoration */}
            <div style={{ position: "absolute", top: -15, right: -15, width: 60, height: 60, borderRadius: "50%", background: s.bg, opacity: 0.5, pointerEvents: "none" }} />
            
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: s.bg,
                border: `1px solid ${s.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
                position: "relative",
                zIndex: 1,
              }}
            >
              <s.Icon size={20} color={s.color} strokeWidth={2.2} />
            </div>
            
            <div
              style={{
                color: ds.textSecondary,
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 6,
                position: "relative",
                zIndex: 1,
              }}
            >
              {s.label}
            </div>
            
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
                position: "relative",
                zIndex: 1,
              }}
            >
              <span
                style={{
                  color: ds.textPrimary,
                  fontSize: 22,
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: "-0.5px",
                }}
              >
                {s.value}
              </span>
              <span style={{ color: ds.textMuted, fontSize: 11, fontWeight: 500 }}>
                {s.unit}
              </span>
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
            gridTemplateColumns: "repeat(4, 1fr)",
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

  // ── Render: Placeholder tab ─────────────────────────────────────────────────
  const renderPlaceholder = (Icon: React.FC<{ size?: number; color?: string; strokeWidth?: number }>, label: string) => (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring" }}
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          background: isDark ? "rgba(59, 130, 246, 0.1)" : "#EFF6FF",
          border: `1px dashed ${ds.primary}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Icon size={36} color={ds.primary} strokeWidth={1.5} />
      </motion.div>
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          color: ds.textPrimary,
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {label}
      </motion.p>
      <motion.p 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ color: ds.textSecondary, fontSize: 13, lineHeight: 1.6 }}
      >
        {t.comingSoon}
      </motion.p>
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
      case 2: return <InventoryModule products={products} onUpdateProducts={setProducts} initialAction={quickAction === "addProduct" ? "new" : null} />;
      case 3: return <PurchasesModule products={products} />;
      case 4: return <ContactListScreen customers={customers} onUpdateCustomers={setCustomers} initialShowForm={quickAction === "newCustomer"} />;
      case 5: return <FinanceModule initialAction={quickAction === "expenses" ? "expense" : null} />;
      case 6: return <ReportsModule />;
      case 7: return settingsView === "users" ? <UsersRolesModule onBack={() => setSettingsView("main")} /> : renderSettings();
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
          <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(135deg, #1D4ED8, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(37,99,235,0.25)" }}>
            <LogoSVG size={24} white />
          </div>
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 17, fontWeight: 800, marginBottom: 4, display: "flex", alignItems: "center", gap: 6, letterSpacing: "-0.3px" }}>
              {t.welcomeUser}، {user.first_name}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: ds.textSecondary, fontSize: 12.5, fontWeight: 600 }}>
              <Building2 size={14} color={ds.primary} />
              {business.name}
              <div style={{ width: 4, height: 4, borderRadius: 2, background: ds.textMuted, margin: "0 4px" }} />
              <MapPin size={13} color={ds.textMuted} /> {business.city}
              <div style={{ width: 4, height: 4, borderRadius: 2, background: ds.textMuted, margin: "0 4px" }} />
              <DollarSign size={13} color={ds.textMuted} /> {business.default_currency}
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

      {/* Bottom navigation - Floating Dock */}
      <div
        style={{
          position: "absolute",
          bottom: 24, // Safe area padding
          left: 24,
          right: 24,
          background: isDark ? "rgba(12, 25, 41, 0.85)" : "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
          borderRadius: 32,
          display: "flex",
          justifyContent: "space-around",
          padding: "8px 12px",
          zIndex: 50,
          boxShadow: isDark ? "0 20px 40px rgba(0,0,0,0.5)" : "0 20px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        {NAV_ITEMS.map(({ Icon, labelKey, fallbackLabel }, i) => {
          const isActive = activeTab === i;
          return (
            <button
              key={i}
              title={t[labelKey] || fallbackLabel || "Navigation Tab"}
              onClick={() => setActiveTab(i)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                position: "relative",
                fontFamily: "inherit",
                flex: 1,
                minWidth: 48,
                transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: isDark ? "rgba(59,130,246,0.15)" : "rgba(37,99,235,0.08)",
                    borderRadius: 24,
                    zIndex: 0
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div style={{ position: "relative", zIndex: 1 }}>
                <Icon
                  size={24}
                  color={isActive ? ds.primary : ds.textMuted}
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{ 
                    transition: "color 0.2s, transform 0.2s", 
                    transform: isActive ? "scale(1.1) translateY(-2px)" : "scale(1)" 
                  }}
                />
              </div>
              {isActive && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  style={{
                    position: "absolute",
                    bottom: -4,
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    background: ds.primary,
                    zIndex: 1
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
