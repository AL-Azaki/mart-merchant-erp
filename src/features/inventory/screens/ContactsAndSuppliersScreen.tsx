import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Building2 } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { ContactListScreen } from "@/features/crm/screens/ContactListScreen";
import { SupplierListScreen } from "@/features/purchases/screens/SupplierListScreen";

interface ContactsAndSuppliersScreenProps {
  customers: any[];
  onUpdateCustomers: (c: any[]) => void;
  suppliers: any[];
  onUpdateSuppliers: (s: any[]) => void;
  initialType?: "customers" | "suppliers";
  initialAction?: "newCustomer" | null;
}

export function ContactsAndSuppliersScreen({
  customers,
  onUpdateCustomers,
  suppliers,
  onUpdateSuppliers,
  initialType = "customers",
  initialAction = null
}: ContactsAndSuppliersScreenProps) {
  const { isDark, isRTL, ds } = useApp();
  const [activeType, setActiveType] = useState<"customers" | "suppliers">(initialType);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      {/* Selector bar */}
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
            onClick={() => setActiveType("customers")}
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
              color: activeType === "customers" ? (isDark ? "#FFFFFF" : ds.primary) : ds.textSecondary,
              position: "relative",
              transition: "color 0.2s"
            }}
          >
            <Users size={16} strokeWidth={activeType === "customers" ? 2.5 : 2} />
            {isRTL ? "العملاء" : "Customers"}
            {activeType === "customers" && (
              <motion.div
                layoutId="activeContactType"
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
            onClick={() => setActiveType("suppliers")}
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
              color: activeType === "suppliers" ? (isDark ? "#FFFFFF" : ds.primary) : ds.textSecondary,
              position: "relative",
              transition: "color 0.2s"
            }}
          >
            <Building2 size={16} strokeWidth={activeType === "suppliers" ? 2.5 : 2} />
            {isRTL ? "الموردين" : "Suppliers"}
            {activeType === "suppliers" && (
              <motion.div
                layoutId="activeContactType"
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

      {/* Screen container */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeType}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            style={{ position: "absolute", inset: 0 }}
          >
            {activeType === "customers" ? (
              <ContactListScreen 
                customers={customers} 
                onUpdateCustomers={onUpdateCustomers}
                initialShowForm={initialAction === "newCustomer"}
              />
            ) : (
              <SupplierListScreen 
                suppliers={suppliers} 
                onUpdateSuppliers={onUpdateSuppliers} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
