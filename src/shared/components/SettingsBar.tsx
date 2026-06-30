import { Globe, Sun, Moon, Monitor } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

interface SettingsBarProps {
  /**
   * compact  — icon-only frosted buttons (for gradient headers & onboarding top bar)
   * list     — full-width list rows (for Settings tab inside Dashboard)
   */
  mode?: "compact" | "list";
  /** overlay = white icons on gradient bg; light = themed icons on light bg */
  variant?: "overlay" | "light";
}

export function SettingsBar({ mode = "compact", variant = "overlay" }: SettingsBarProps) {
  const { theme, language, isDark, toggleLanguage, toggleTheme, ds } = useApp();
  const lang = language; // "ar" | "en"

  const isOverlay = variant === "overlay";

  // ── Compact mode (icon-only frosted buttons) ────────────────────────────────
  if (mode === "compact") {
    const btnBg = isOverlay ? "rgba(255,255,255,0.18)" : isDark ? ds.surface2 : ds.surface2;
    const btnBorder = isOverlay ? "rgba(255,255,255,0.28)" : ds.border;
    const iconColor = isOverlay ? "white" : ds.textSecondary;
    const backdropFilter = isOverlay ? "blur(10px)" : "none";

    const btnStyle: React.CSSProperties = {
      width: 36,
      height: 36,
      borderRadius: ds.radiusMd,
      background: btnBg,
      border: `1px solid ${btnBorder}`,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backdropFilter,
      WebkitBackdropFilter: backdropFilter,
      color: iconColor,
      transition: "background 0.18s",
      flexShrink: 0,
    };

    const ThemeIcon = theme === "dark" ? Moon : theme === "system" ? Monitor : Sun;

    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={toggleLanguage}
          title={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          style={btnStyle}
        >
          <Globe size={16} color={iconColor} />
        </button>
        <button
          onClick={toggleTheme}
          title={`Theme: ${theme}`}
          style={btnStyle}
        >
          <ThemeIcon size={16} color={iconColor} />
        </button>
      </div>
    );
  }

  // ── List mode (for Settings tab) ────────────────────────────────────────────
  const ThemeIcon = theme === "dark" ? Moon : theme === "system" ? Monitor : Sun;
  const themeLabel =
    theme === "dark"
      ? language === "ar" ? "داكن" : "Dark"
      : theme === "system"
      ? language === "ar" ? "تلقائي" : "System"
      : language === "ar" ? "فاتح" : "Light";

  const langLabel = lang === "ar" ? "العربية" : "English";

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 0",
    borderBottom: `1px solid ${ds.border}`,
    cursor: "pointer",
  };

  const iconBoxStyle = (bg: string): React.CSSProperties => ({
    width: 34,
    height: 34,
    borderRadius: ds.radiusSm,
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  });

  const labelStyle: React.CSSProperties = {
    color: ds.textPrimary,
    fontSize: 14,
    fontWeight: 500,
  };

  const valueStyle: React.CSSProperties = {
    color: ds.textSecondary,
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  return (
    <div>
      {/* Language row */}
      <div style={rowStyle} onClick={toggleLanguage}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={iconBoxStyle(isDark ? "#0C2040" : "#EDF1FA")}>
            <Globe size={17} color={ds.primary} />
          </div>
          <span style={labelStyle}>{lang === "ar" ? "اللغة" : "Language"}</span>
        </div>
        <span style={valueStyle}>
          {langLabel}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke={ds.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {/* Theme row */}
      <div style={{ ...rowStyle, borderBottom: "none" }} onClick={toggleTheme}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={iconBoxStyle(isDark ? "#0C2040" : "#EDF1FA")}>
            <ThemeIcon size={17} color={ds.primary} />
          </div>
          <span style={labelStyle}>{lang === "ar" ? "المظهر" : "Theme"}</span>
        </div>
        <span style={valueStyle}>
          {themeLabel}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke={ds.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}
