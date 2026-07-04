import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, RotateCcw } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { PurchaseListScreen } from "@/features/purchases/screens/PurchaseListScreen";
import { NewPurchaseScreen } from "@/features/purchases/screens/NewPurchaseScreen";
import { PurchaseReturnsScreen } from "@/features/purchases/screens/PurchaseReturnsScreen";
import { MOCK_PURCHASE_INVOICES } from "@/core/data/purchasesMockData";

interface PurchasesTabScreenProps {
  products: any[];
  suppliers: any[];
  initialAction?: "new" | null;
}

export function PurchasesTabScreen({
  products,
  suppliers,
  initialAction = null
}: PurchasesTabScreenProps) {
  const { isDark, isRTL, ds } = useApp();
  const [view, setView] = useState<"main" | "new">(initialAction === "new" ? "new" : "main");
  const [activeSubTab, setActiveSubTab] = useState<"invoices" | "returns">("invoices");
  const [localInvoices, setLocalInvoices] = useState<any[]>(MOCK_PURCHASE_INVOICES);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  return (
    <div style={{ height: "100%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", background: bg }}>
      <AnimatePresence mode="wait">
        {view === "main" && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}
          >
            {/* Sub-selector Bar */}
            <div style={{ padding: "16px 24px 0", background: surface, borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ 
                display: "flex", 
                background: isDark ? ds.surface2 : "#F1F5F9", 
                padding: 4, 
                borderRadius: 14, 
                width: "100%", 
                maxWidth: 400, 
                marginBottom: 16,
                border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`,
                position: "relative"
              }}>
                <button
                  onClick={() => setActiveSubTab("invoices")}
                  style={{
                    flex: 1,
                    height: 38,
                    border: "none",
                    background: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontFamily: "inherit",
                    fontSize: 14,
                    fontWeight: 700,
                    zIndex: 2,
                    color: activeSubTab === "invoices" ? (isDark ? "#FFFFFF" : ds.primary) : ds.textSecondary,
                    position: "relative",
                    transition: "color 0.2s"
                  }}
                >
                  <ShoppingCart size={16} strokeWidth={activeSubTab === "invoices" ? 2.5 : 2} />
                  {isRTL ? "فواتير المشتريات" : "Invoices"}
                  {activeSubTab === "invoices" && (
                    <motion.div
                      layoutId="activePurchaseSubTab"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: isDark ? "rgba(99, 102, 241, 0.2)" : "#FFFFFF",
                        border: isDark ? `1px solid rgba(99, 102, 241, 0.4)` : "1px solid rgba(0,0,0,0.05)",
                        borderRadius: 10,
                        boxShadow: isDark ? "none" : "0 2px 6px rgba(0,0,0,0.05)",
                        zIndex: -1
                      }}
                    />
                  )}
                </button>

                <button
                  onClick={() => setActiveSubTab("returns")}
                  style={{
                    flex: 1,
                    height: 38,
                    border: "none",
                    background: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontFamily: "inherit",
                    fontSize: 14,
                    fontWeight: 700,
                    zIndex: 2,
                    color: activeSubTab === "returns" ? (isDark ? "#FFFFFF" : ds.primary) : ds.textSecondary,
                    position: "relative",
                    transition: "color 0.2s"
                  }}
                >
                  <RotateCcw size={16} strokeWidth={activeSubTab === "returns" ? 2.5 : 2} />
                  {isRTL ? "مرتجع المشتريات" : "Returns"}
                  {activeSubTab === "returns" && (
                    <motion.div
                      layoutId="activePurchaseSubTab"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: isDark ? "rgba(99, 102, 241, 0.2)" : "#FFFFFF",
                        border: isDark ? `1px solid rgba(99, 102, 241, 0.4)` : "1px solid rgba(0,0,0,0.05)",
                        borderRadius: 10,
                        boxShadow: isDark ? "none" : "0 2px 6px rgba(0,0,0,0.05)",
                        zIndex: -1
                      }}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Sub-tab Content Area */}
            <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSubTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  style={{ position: "absolute", inset: 0 }}
                >
                  {activeSubTab === "invoices" ? (
                    <PurchaseListScreen 
                      invoices={localInvoices} 
                      suppliers={suppliers} 
                      onNewPurchase={() => setView("new")} 
                    />
                  ) : (
                    <PurchaseReturnsScreen />
                  )}
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
            <NewPurchaseScreen 
              suppliers={suppliers}
              products={products}
              onBack={() => setView("main")} 
              onSave={(newInvoice) => {
                setLocalInvoices(prev => [newInvoice, ...prev]);
                setView("main");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
