// ═══════════════════════════════════════════════════════════════════════════════
// APP-WIDE CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

// ── App Identity ───────────────────────────────────────────────────────────────
export const APP_NAME = "تاجر";
export const APP_NAME_EN = "Tajir";
export const APP_VERSION = "1.0.0";

// ── Demo Credentials ──────────────────────────────────────────────────────────
export const DEMO_EMAIL = "demo@tajir.ye";
export const DEMO_PASSWORD = "123456";

// ── API ────────────────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
export const API_TIMEOUT_MS = 10_000;

// ── Local Storage Keys ────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  AUTH_TOKEN: "tajir_auth_token",
  LANGUAGE: "tajir_language",
  THEME: "tajir_theme",
  ONBOARDING_DONE: "tajir_onboarding_done",
} as const;

// ── Splash Duration ───────────────────────────────────────────────────────────
export const SPLASH_DURATION_MS = 2800;

// ── Business Types ────────────────────────────────────────────────────────────
export const BUSINESS_TYPES = [
  "grocery", "retail", "wholesale", "restaurant",
  "cafe", "pharmacy", "electronics", "fashion", "other",
] as const;

// ── Default Currency ──────────────────────────────────────────────────────────
export const DEFAULT_CURRENCY = "YER";

// ── Pagination ────────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
