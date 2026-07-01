import { motion } from "motion/react";
import { X, ShoppingBag, Users, PieChart, Settings } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

interface MoreMenuSheetProps {
  activeTab: number;
  onSelectTab: (tabIndex: number) => void;
  onClose: () => void;
}

export function MoreMenuSheet({ activeTab, onSelectTab, onClose }: MoreMenuSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  
  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const REMAINING_NAV = [
    { id: "purchases", tabIndex: 3, Icon: ShoppingBag, labelAr: "المشتريات والموردين", labelEn: "Purchases", color: "#8B5CF6" },
    { id: "customers", tabIndex: 4, Icon: Users, labelAr: "العملاء", labelEn: "Customers", color: "#F59E0B" },
    { id: "reports", tabIndex: 6, Icon: PieChart, labelAr: "التقارير", labelEn: "Reports", color: "#10B981" },
    { id: "settings", tabIndex: 7, Icon: Settings, labelAr: "الإعدادات", labelEn: "Settings", color: "#64748B" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} 
      />
      
      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: "100%" }} 
        animate={{ y: 0 }} 
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={{ 
          position: "relative", 
          width: "100%", 
          maxWidth: 600, 
          background: bg, 
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          boxShadow: "0 -8px 24px rgba(0,0,0,0.1)",
          display: "flex", 
          flexDirection: "column",
          paddingBottom: "env(safe-area-inset-bottom, 24px)"
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px", background: surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, margin: "0 0 4px 0" }}>
              {isRTL ? "المزيد من الوحدات" : "More Modules"}
            </h2>
            <p style={{ color: ds.textSecondary, fontSize: 13, margin: 0 }}>
              {isRTL ? "الوصول السريع لبقية ميزات النظام" : "Quick access to remaining system features"}
            </p>
          </div>
          <button onClick={onClose} style={{ background: isDark ? ds.surface2 : "#F1F5F9", border: "none", width: 36, height: 36, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={18} color={ds.textPrimary} />
          </button>
        </div>

        {/* Grid */}
        <div style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 16 }}>
            {REMAINING_NAV.map(({ id, tabIndex, Icon, labelAr, labelEn, color }) => {
              const isActive = activeTab === tabIndex;
              return (
                <button
                  key={id}
                  onClick={() => onSelectTab(tabIndex)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    background: isActive ? `${color}15` : surface,
                    border: `1px solid ${isActive ? color : border}`,
                    borderRadius: 20,
                    padding: "20px 12px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: isActive ? `0 4px 12px ${color}20` : "0 2px 8px rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 14, 
                    background: isActive ? color : isDark ? ds.surface2 : "#F8FAFC", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    transition: "all 0.2s"
                  }}>
                    <Icon size={24} color={isActive ? "#FFFFFF" : color} />
                  </div>
                  <span style={{ 
                    fontSize: 14, 
                    fontWeight: isActive ? 800 : 700, 
                    color: isActive ? color : ds.textPrimary,
                    textAlign: "center"
                  }}>
                    {isRTL ? labelAr : labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
