import { createContext, useContext, useReducer, ReactNode, useMemo, useEffect } from "react";
import { Language, ThemeMode } from "../core/types";
import { translations, TranslationDict } from "../core/i18n";
import { makeDs, getColors, DesignSystem } from "../core/design";
import { resolveIsDark } from "../utils/theme";
import { STORAGE_KEYS } from "../core/constants";

// ── State ──────────────────────────────────────────────────────────────────────
export interface AppState {
  language: Language;
  theme: ThemeMode;
  isDark: boolean;
}

type Action =
  | { type: "SET_LANGUAGE"; payload: Language }
  | { type: "SET_THEME"; payload: ThemeMode };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_LANGUAGE":
      return { ...state, language: action.payload };
    case "SET_THEME":
      return { ...state, theme: action.payload, isDark: resolveIsDark(action.payload) };
    default:
      return state;
  }
}

function getInitialState(): AppState {
  const savedLang = (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language) || "ar";
  const savedTheme = (localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode) || "light";
  return {
    language: savedLang,
    theme: savedTheme,
    isDark: resolveIsDark(savedTheme),
  };
}

// ── Context ────────────────────────────────────────────────────────────────────
export interface AppContextType extends AppState {
  isRTL: boolean;
  t: TranslationDict;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  fontFamily: string;
  colors: ReturnType<typeof getColors>;
  ds: DesignSystem;
}

const AppContext = createContext<AppContextType | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, getInitialState());

  const setLanguage = (lang: Language) => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    dispatch({ type: "SET_LANGUAGE", payload: lang });
  };

  const setTheme = (theme: ThemeMode) => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    dispatch({ type: "SET_THEME", payload: theme });
  };

  const toggleLanguage = () => setLanguage(state.language === "ar" ? "en" : "ar");
  const toggleTheme = () => {
    const next: ThemeMode = state.theme === "light" ? "dark" : state.theme === "dark" ? "system" : "light";
    setTheme(next);
  };

  const isRTL = state.language === "ar";
  const t = translations[state.language];
  const fontFamily = isRTL
    ? "'Alexandria', 'Outfit', sans-serif"
    : "'Outfit', 'Alexandria', sans-serif";

  const colors = useMemo(() => getColors(state.isDark), [state.isDark]);
  const ds = useMemo(() => makeDs(state.isDark), [state.isDark]);

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = state.language;
    if (state.isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isRTL, state.language, state.isDark]);

  const value: AppContextType = {
    ...state,
    isRTL,
    t,
    setLanguage,
    setTheme,
    toggleLanguage,
    toggleTheme,
    fontFamily,
    colors,
    ds,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
