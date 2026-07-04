import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SalesListScreen } from "./SalesListScreen";
import { NewInvoiceScreen } from "./NewInvoiceScreen";
import { InvoiceDetailScreen } from "./InvoiceDetailScreen";
import { OrdersListScreen } from "./OrdersListScreen";
import { SalesReturnsScreen } from "./SalesReturnsScreen";
import type { SalesInvoiceWithDetails } from "@/core/types/sales";
import { useApp } from "@/providers/AppProvider";
import { Receipt, ShoppingBag, RotateCcw, Plus } from "lucide-react";

interface SalesModuleProps {
  initialView?: "main" | "new" | "detail";
  customers?: any[];
  products?: any[];
}

type SalesView = "main" | "new" | "detail";

export function SalesModule({ initialView = "main", customers = [], products = [] }: SalesModuleProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const [view, setView] = useState<SalesView>(initialView);
  const [activeTab, setActiveTab] = useState<"invoices" | "orders" | "returns">("invoices");
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoiceWithDetails | null>(null);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";

  const tabs = [
    { id: "invoices", label: isRTL ? "فواتير المبيعات" : "Sales Invoices", icon: Receipt },
    { id: "orders", label: isRTL ? "طلبات المتجر الإلكتروني" : "E-commerce Orders", icon: ShoppingBag },
    { id: "returns", label: isRTL ? "مرتجعات المبيعات" : "Sales Returns", icon: RotateCcw },
  ] as const;

  return (
    <div style={{ height: "100%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", background: bg }}>
      <AnimatePresence mode="wait">
        {view === "main" && (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}
          >
            {/* Module Header & Tabs */}
            <div style={{ background: surface, borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, padding: "16px 24px 0", flexShrink: 0 }}>
              <h1 style={{ color: ds.textPrimary, fontSize: 24, fontWeight: 800, marginBottom: 16 }}>
                {isRTL ? "المبيعات والطلبات" : "Sales & Orders"}
              </h1>

              {/* ─── Tab bar: CTA first, then nav tabs ───
                  Visible order: [فاتورة جديدة] | [فواتير المبيعات] [طلبات المتجر] [مرتجعات المبيعات]
              */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 12,
                  overflowX: "auto",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`,
                  marginBottom: "-1px",
                }}
              >
                {/* Hide webkit scrollbar specifically for this container */}
                <style>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>

                {/* PRIMARY CTA — فاتورة جديدة */}
                <button
                  onClick={() => setView("new")}
                  style={{
                    background: "none", border: "none",
                    padding: "12px 20px",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 10,
                    fontFamily: "inherit",
                    position: "relative",
                    color: ds.primary,
                    fontWeight: 700,
                    fontSize: 16,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    borderRadius: "12px 12px 0 0",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(37,99,235,0.05)"}
                  onMouseOut={(e) => e.currentTarget.style.background = "none"}
                >
                  <Plus size={20} strokeWidth={2.5} />
                  {isRTL ? "فاتورة جديدة" : "New Invoice"}
                </button>

                {/* Navigation Tabs */}
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        background: "none", border: "none",
                        padding: "12px 20px",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 10,
                        fontFamily: "inherit",
                        position: "relative",
                        color: isActive ? ds.primary : ds.textSecondary,
                        fontWeight: isActive ? 800 : 600,
                        fontSize: 16,
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        borderRadius: "12px 12px 0 0",
                      }}
                      onMouseOver={(e) => !isActive && (e.currentTarget.style.color = ds.textPrimary)}
                      onMouseOut={(e) => !isActive && (e.currentTarget.style.color = ds.textSecondary)}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      {tab.label}
                      {isActive && (
                        <motion.div
                          layoutId="salesTabIndicator"
                          style={{
                            position: "absolute",
                            bottom: -1, left: 0, right: 0,
                            height: 4,
                            background: ds.primary,
                            borderRadius: "4px 4px 0 0",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ position: "absolute", inset: 0 }}
                >
                  {activeTab === "invoices" && (
                    <SalesListScreen
                      onNewInvoice={() => setView("new")}
                      onViewInvoice={(inv) => {
                        setSelectedInvoice(inv);
                        setView("detail");
                      }}
                    />
                  )}
                  {activeTab === "orders" && <OrdersListScreen />}
                  {activeTab === "returns" && <SalesReturnsScreen />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {view === "new" && (
          <motion.div
            key="new"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.22 }}
            style={{ position: "absolute", inset: 0, zIndex: 10 }}
          >
            <NewInvoiceScreen
              customers={customers}
              products={products}
              onBack={() => setView("main")}
              onSuccess={() => setView("main")}
            />
          </motion.div>
        )}

        {view === "detail" && selectedInvoice && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.22 }}
            style={{ position: "absolute", inset: 0, zIndex: 10 }}
          >
            <InvoiceDetailScreen
              invoice={selectedInvoice}
              onBack={() => setView("main")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
