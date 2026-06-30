// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM — single source of truth for all design tokens
// Used across all components — no magic numbers anywhere else.
// ═══════════════════════════════════════════════════════════════════════════════

export interface DesignSystem {
  // ── Backgrounds ─────────────────────────────────────────────────────────────
  bg: string;
  surface: string;
  surface2: string;

  // ── Borders ─────────────────────────────────────────────────────────────────
  border: string;
  borderLight: string;

  // ── Text ────────────────────────────────────────────────────────────────────
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // ── Brand ───────────────────────────────────────────────────────────────────
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;

  // ── Semantic ─────────────────────────────────────────────────────────────────
  success: string;
  warning: string;
  error: string;

  // ── Shadows ──────────────────────────────────────────────────────────────────
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowPrimary: string;
  shadowSuccess: string;

  // ── Radii ────────────────────────────────────────────────────────────────────
  radiusSm: number;
  radiusMd: number;
  radiusLg: number;
  radiusXl: number;
  radiusXxl: number;
  radiusPill: number;
}

export function makeDs(isDark: boolean): DesignSystem {
  return {
    // Backgrounds
    bg:       isDark ? "#050B14" : "#F4F7FB",
    surface:  isDark ? "#0B1626" : "#FFFFFF",
    surface2: isDark ? "#122035" : "#EDF2F9",

    // Borders
    border:      isDark ? "#1A2E48" : "#E2E8F0",
    borderLight: isDark ? "#162540" : "#EDF2F9",

    // Text
    textPrimary:   isDark ? "#F8FAFC" : "#0F172A",
    textSecondary: isDark ? "#94A3B8" : "#475569",
    textMuted:     isDark ? "#475569" : "#94A3B8",

    // Brand
    primary:       "#2563EB",
    primaryDark:   "#1D4ED8",
    primaryLight:  "#3B82F6",
    secondary:     "#0EA5E9",
    secondaryDark: "#0284C7",

    // Semantic
    success: "#10B981",
    warning: "#F59E0B",
    error:   "#EF4444",

    // Shadows (Ultra premium, soft and diffused)
    shadowSm:      isDark ? "0 2px 8px rgba(0,0,0,0.2)" : "0 2px 10px rgba(15, 23, 42, 0.04)",
    shadowMd:      isDark ? "0 8px 24px rgba(0,0,0,0.3)" : "0 8px 30px rgba(15, 23, 42, 0.06)",
    shadowLg:      isDark ? "0 16px 40px rgba(0,0,0,0.4)" : "0 20px 40px rgba(15, 23, 42, 0.08)",
    shadowPrimary: "0 8px 24px rgba(37,99,235,0.25)",
    shadowSuccess: "0 8px 24px rgba(16,185,129,0.25)",

    // Radii (More rounded, modern Apple-like style)
    radiusSm:  10,
    radiusMd:  16,
    radiusLg:  24,
    radiusXl:  32,
    radiusXxl: 40,
    radiusPill: 999,
  };
}

// Legacy color shim — used by older components; prefer ds.* directly
export function getColors(isDark: boolean) {
  const ds = makeDs(isDark);
  return {
    bg:               ds.bg,
    surface:          ds.surface,
    surface2:         ds.surface2,
    textPrimary:      ds.textPrimary,
    textSecondary:    ds.textSecondary,
    border:           ds.border,
    inputBg:          ds.surface2,
    primary:          ds.primary,
    primaryLight:     isDark ? "#1A2E48" : "#EDF1FA",
    primaryContainer: isDark ? "#1A2E48" : "#DBEAFE",
    secondary:        ds.secondary,
    secondaryLight:   isDark ? "#122035" : "#EDF1FA",
    success:          ds.success,
    warning:          ds.warning,
    error:            ds.error,
  };
}
