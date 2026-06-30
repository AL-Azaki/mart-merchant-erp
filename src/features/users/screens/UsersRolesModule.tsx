import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "@/providers/AppProvider";
import { UserListScreen } from "./UserListScreen";
import { RoleListScreen } from "./RoleListScreen";
import { UserCircle, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

export function UsersRolesModule({ onBack }: { onBack?: () => void }) {
  const { t, isDark, isRTL, ds } = useApp();
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const subtle = isDark ? ds.surface2 : "#F1F5F9";

  const tabs = [
    { id: "users", label: isRTL ? "المستخدمين" : "Users", icon: UserCircle },
    { id: "roles", label: isRTL ? "الأدوار والصلاحيات" : "Roles & Permissions", icon: ShieldCheck },
  ] as const;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      {/* Top Header */}
      {onBack && (
        <div style={{ padding: "16px 24px", background: surface, borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 12, background: subtle, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <BackIcon size={20} color={ds.textPrimary} />
          </button>
          <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "إدارة الوصول" : "Access Management"}</h2>
        </div>
      )}

      {/* Tabs */}
      <div style={{ padding: "16px 24px 0", background: surface, borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", gap: 24 }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const activeColor = tab.id === "users" ? "#6366F1" : "#F59E0B";
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "0 4px 16px",
                background: "none", border: "none",
                cursor: "pointer", position: "relative",
                color: isActive ? activeColor : ds.textSecondary,
                fontWeight: isActive ? 700 : 600,
                fontSize: 15, fontFamily: "inherit",
              }}
            >
              <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {tab.label}
              {isActive && (
                <motion.div layoutId="urTabIndicator" style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 3, background: activeColor, borderRadius: "3px 3px 0 0" }} />
              )}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ height: "100%" }}>
            {activeTab === "users" && <UserListScreen />}
            {activeTab === "roles" && <RoleListScreen />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
