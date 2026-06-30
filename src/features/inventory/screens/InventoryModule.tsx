import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/providers/AppProvider";
import { ProductListScreen } from "./ProductListScreen";
import { CategoryListScreen } from "./CategoryListScreen";
import { UnitListScreen } from "./UnitListScreen";
import { WarehouseListScreen } from "./WarehouseListScreen";
import { InventoryTransactionsScreen } from "./InventoryTransactionsScreen";
import { StockAdjustmentsScreen } from "./StockAdjustmentsScreen";
import { Package, FolderTree, Scale, Building2, ArrowLeftRight, ClipboardCheck } from "lucide-react";

export function InventoryModule({ initialAction, products = [], onUpdateProducts }: { initialAction?: "new" | null, products?: any[], onUpdateProducts?: (p: any[]) => void }) {
  const { t, isDark, isRTL, ds } = useApp();
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "units" | "warehouses" | "transactions" | "adjustments">("products");

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";

  const tabs = [
    { id: "products", label: isRTL ? "المنتجات" : "Products", icon: Package },
    { id: "categories", label: isRTL ? "الفئات" : "Categories", icon: FolderTree },
    { id: "units", label: isRTL ? "وحدات القياس" : "Units", icon: Scale },
    { id: "warehouses", label: isRTL ? "المستودعات" : "Warehouses", icon: Building2 },
    { id: "transactions", label: isRTL ? "حركات المخزون" : "Stock Movements", icon: ArrowLeftRight },
    { id: "adjustments", label: isRTL ? "تسوية وجرد المخزون" : "Stock Adjustments", icon: ClipboardCheck },
  ] as const;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      <style>
        {`
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
      {/* Module Header & Tabs */}
      <div style={{ background: surface, borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, padding: "16px 24px 0", flexShrink: 0 }}>
        <h1 style={{ color: ds.textPrimary, fontSize: 24, fontWeight: 800, marginBottom: 16 }}>
          {isRTL ? "المخزون والمنتجات" : "Inventory & Products"}
        </h1>
        <div 
          className="hide-scroll"
          style={{ display: "flex", gap: 24, overflowX: "auto", borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, marginBottom: "-1px", paddingBottom: 2 }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: "none", border: "none", padding: "0 4px 12px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit",
                  position: "relative",
                  color: isActive ? ds.primary : ds.textSecondary,
                  fontWeight: isActive ? 700 : 600,
                  fontSize: 15, transition: "color 0.2s"
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="inventoryTabIndicator"
                    style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 3, background: ds.primary, borderRadius: "3px 3px 0 0" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Module Content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ position: "absolute", inset: 0 }}
          >
            {activeTab === "products" && <ProductListScreen products={products} onUpdateProducts={onUpdateProducts} initialShowForm={initialAction === "new"} />}
            {activeTab === "categories" && <CategoryListScreen />}
            {activeTab === "units" && <UnitListScreen />}
            {activeTab === "warehouses" && <WarehouseListScreen />}
            {activeTab === "transactions" && <InventoryTransactionsScreen />}
            {activeTab === "adjustments" && <StockAdjustmentsScreen products={products} />}
          </motion.div>
      </div>
    </div>
  );
}
