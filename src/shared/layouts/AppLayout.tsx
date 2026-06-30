// ═══════════════════════════════════════════════════════════════════════════════
// SHARED LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════
import { ReactNode } from "react";
import { useApp } from "@/providers/AppProvider";
import { SettingsBar } from "@/shared/components/SettingsBar";

interface AppLayoutProps {
  children: ReactNode;
  showSettingsBar?: boolean;
}

export function AppLayout({ children, showSettingsBar = false }: AppLayoutProps) {
  const { isDark, isRTL, fontFamily } = useApp();

  const outerBg = isDark
    ? "radial-gradient(ellipse at top, #0C1929 0%, #060E1C 70%)"
    : "radial-gradient(ellipse at top, #C7D7F5 0%, #E8EDFA 70%)";

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: outerBg, fontFamily }}>
      <div
        dir={isRTL ? "rtl" : "ltr"}
        style={{
          width: 390, height: 844,
          background: isDark ? "#060E1C" : "#F4F7FF",
          borderRadius: 44, overflow: "hidden",
          boxShadow: isDark
            ? "0 32px 80px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,255,255,0.05)"
            : "0 32px 80px rgba(37,99,235,0.18), 0 0 0 1px rgba(255,255,255,0.9)",
          position: "relative", fontFamily,
          display: "flex", flexDirection: "column",
        }}
      >
        {showSettingsBar && (
          <div style={{ padding: "16px 20px", position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, display: "flex", justifyContent: "flex-end" }}>
            <SettingsBar variant="overlay" mode="compact" />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
