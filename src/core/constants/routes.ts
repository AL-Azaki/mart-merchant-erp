// ═══════════════════════════════════════════════════════════════════════════════
// ROUTE CONSTANTS — single source of truth for all paths
// ═══════════════════════════════════════════════════════════════════════════════

export const ROUTES = {
  // ── Auth flow ───────────────────────────────────────────────────────────────
  SPLASH: "/splash",
  ONBOARDING: "/onboarding",
  AUTH_GATE: "/auth",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  BUSINESS_SETUP: "/setup/business",
  BRANCH_SETUP: "/setup/branch",
  SUCCESS: "/setup/success",

  // ── Main App ────────────────────────────────────────────────────────────────
  DASHBOARD: "/dashboard",
  SALES: "/dashboard/sales",
  INVENTORY: "/dashboard/inventory",
  FINANCE: "/dashboard/finance",
  SETTINGS: "/dashboard/settings",

  // ── Fallback ────────────────────────────────────────────────────────────────
  ROOT: "/",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
