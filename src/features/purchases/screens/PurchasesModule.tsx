import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/providers/AppProvider";
import { PurchaseListScreen } from "./PurchaseListScreen";
import { NewPurchaseScreen } from "./NewPurchaseScreen";
import { PurchaseReturnsScreen } from "./PurchaseReturnsScreen";
import { SupplierListScreen } from "./SupplierListScreen";
import { ShoppingCart, RotateCcw, Building2 } from "lucide-react";
import { usePurchaseStore } from "@/core/engine/purchaseStore";

export function PurchasesModule({ products = [] }: { products?: any[] }) {
  const { t, isDark, isRTL, ds } = useApp();
  const [view, setView] = useState<"main" | "new">("main");
  const [activeTab, setActiveTab] = useState<"invoices" | "returns" | "suppliers">("invoices");
  const purchaseStore = usePurchaseStore();
  const localInvoices = purchaseStore.invoices;
  const localSuppliers = purchaseStore.suppliers;

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";

  const tabs = [
    { id: "invoices", label: isRTL ? "فواتير المشتريات" : "Purchase Invoices", icon: ShoppingCart },
    { id: "returns", label: isRTL ? "مرتجعات المشتريات" : "Purchase Returns", icon: RotateCcw },
    { id: "suppliers", label: isRTL ? "الموردين" : "Suppliers", icon: Building2 },
  ] as const;

  return (
    <div style={{ height: "100%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", background: bg }}>
      {/* Main View is always rendered underneath to allow Modals to overlay */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        {/* Header & Tabs */}
        <div style={{ background: surface, borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, padding: "16px 24px 0", flexShrink: 0 }}>
              <h1 style={{ color: ds.textPrimary, fontSize: 24, fontWeight: 800, marginBottom: 16 }}>
                {isRTL ? "المشتريات والموردين" : "Purchases & Suppliers"}
              </h1>
              
              <div style={{ display: "flex", gap: 24, overflowX: "auto", borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, marginBottom: "-1px" }}>
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
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
                          layoutId="purchasesTabIndicator"
                          style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 3, background: ds.primary, borderRadius: "3px 3px 0 0" }}
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
                  {activeTab === "invoices" && <PurchaseListScreen invoices={localInvoices} suppliers={localSuppliers} onNewPurchase={() => setView("new")} />}
                  {activeTab === "returns" && <PurchaseReturnsScreen />}
                  {activeTab === "suppliers" && <SupplierListScreen />}
                </motion.div>
              </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {view === "new" && (
          <NewPurchaseScreen 
              products={products}
              onBack={() => setView("main")} 
              onSave={(newInvoice) => {
                // The store is updated inside NewPurchaseScreen, it will handle its own success UI
              }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
