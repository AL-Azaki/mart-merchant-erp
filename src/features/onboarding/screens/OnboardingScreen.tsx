import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart,
  Package,
  BookOpen,
  BarChart3,
  Users2,
  Truck,
  Store,
  Utensils,
  Coffee,
  Pill,
  Smartphone,
  Shirt,
  ShoppingBasket,
  Zap,
  Shield,
  Globe2,
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { SettingsBar } from "@/shared/components/SettingsBar";
import { LogoMark } from "@/features/onboarding/screens/SplashScreen";

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Brand Identity
// Full-screen brand moment, no illustrations needed
// ═══════════════════════════════════════════════════════════════════════════════
function Slide1Brand({ isRTL, ds, isDark, t }: { isRTL: boolean; ds: any; isDark: boolean; t: Record<string, string> }) {
  const values = isRTL
    ? [
        { Icon: Zap, label: "سريع", sub: "عمليات فورية" },
        { Icon: Shield, label: "آمن", sub: "بياناتك محمية" },
        { Icon: Globe2, label: "عربي", sub: "RTL أولاً" },
      ]
    : [
        { Icon: Zap, label: "Fast", sub: "Instant operations" },
        { Icon: Shield, label: "Secure", sub: "Your data protected" },
        { Icon: Globe2, label: "Arabic", sub: "RTL first" },
      ];

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 28px",
        textAlign: "center",
      }}
    >
      {/* Large logo mark */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        style={{ marginBottom: 20 }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 28,
            background: "linear-gradient(135deg, #1D4ED8, #2563EB, #0EA5E9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 16px 48px rgba(37,99,235,0.38)",
          }}
        >
          <LogoMark size={56} white />
        </div>
      </motion.div>

      {/* App name */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.45 }}
        style={{ marginBottom: 12 }}
      >
        <h1
          style={{
            color: ds.textPrimary,
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: "-2px",
            lineHeight: 1,
            marginBottom: 12,
          }}
        >
          {t.appName}
        </h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div style={{ height: 1.5, width: 24, background: ds.border }} />
          <p style={{ color: ds.textSecondary, fontSize: 13.5, fontWeight: 400 }}>
            {t.tagline}
          </p>
          <div style={{ height: 1.5, width: 24, background: ds.border }} />
        </div>
      </motion.div>

      {/* Value props */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.45 }}
        style={{ display: "flex", gap: 10, marginTop: 8 }}
      >
        {values.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.65 + i * 0.08 }}
            style={{
              flex: 1,
              background: isDark ? ds.surface2 : "#FFFFFF",
              border: `1px solid ${ds.border}`,
              borderRadius: 14,
              padding: "12px 8px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#EFF6FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px",
              }}
            >
              <v.Icon size={17} color="#2563EB" />
            </div>
            <div style={{ color: ds.textPrimary, fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
              {v.label}
            </div>
            <div style={{ color: ds.textMuted, fontSize: 10 }}>{v.sub}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — The Complete System
// 6 module cards — concept icons only, ZERO fake data
// ═══════════════════════════════════════════════════════════════════════════════
function Slide2Modules({ isRTL, ds, isDark }: { isRTL: boolean; ds: any; isDark: boolean }) {
  const modules = [
    {
      Icon: ShoppingCart,
      color: "#2563EB",
      bg: "#EFF6FF",
      labelAr: "المبيعات",
      labelEn: "Sales",
      descAr: "فواتير وعمليات البيع",
      descEn: "Invoicing & POS",
    },
    {
      Icon: Package,
      color: "#0D9488",
      bg: "#F0FDFA",
      labelAr: "المخزون",
      labelEn: "Inventory",
      descAr: "المنتجات والمستودعات",
      descEn: "Products & warehouses",
    },
    {
      Icon: BookOpen,
      color: "#7C3AED",
      bg: "#F5F3FF",
      labelAr: "المحاسبة",
      labelEn: "Accounting",
      descAr: "قيود وحسابات",
      descEn: "Journal & accounts",
    },
    {
      Icon: BarChart3,
      color: "#D97706",
      bg: "#FFFBEB",
      labelAr: "التقارير",
      labelEn: "Reports",
      descAr: "أرباح وتحليلات",
      descEn: "Profits & analytics",
    },
    {
      Icon: Users2,
      color: "#0284C7",
      bg: "#F0F9FF",
      labelAr: "العملاء",
      labelEn: "Customers",
      descAr: "قاعدة عملائك",
      descEn: "Your client base",
    },
    {
      Icon: Truck,
      color: "#16A34A",
      bg: "#F0FDF4",
      labelAr: "الموردون",
      labelEn: "Suppliers",
      descAr: "موردون ومشتريات",
      descEn: "Vendors & purchases",
    },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 4px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 9,
        }}
      >
        {modules.map((mod, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07, type: "spring", bounce: 0.35 }}
            style={{
              background: isDark ? ds.surface : "#FFFFFF",
              border: `1px solid ${ds.border}`,
              borderRadius: 14,
              padding: "13px 8px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: isDark ? ds.surface2 : mod.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px",
                border: `1px solid ${mod.color}22`,
              }}
            >
              <mod.Icon size={18} color={mod.color} />
            </div>
            <div style={{ color: ds.textPrimary, fontSize: 11.5, fontWeight: 700, marginBottom: 3 }}>
              {isRTL ? mod.labelAr : mod.labelEn}
            </div>
            <div style={{ color: ds.textMuted, fontSize: 9.5, lineHeight: 1.4 }}>
              {isRTL ? mod.descAr : mod.descEn}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — Built for Yemeni Merchants
// Business types grid — no data, just identity
// ═══════════════════════════════════════════════════════════════════════════════
function Slide3ForYou({ isRTL, ds, isDark }: { isRTL: boolean; ds: any; isDark: boolean }) {
  const types = [
    { Icon: ShoppingBasket, labelAr: "بقالة", labelEn: "Grocery", color: "#16A34A" },
    { Icon: Store,          labelAr: "تجزئة", labelEn: "Retail",  color: "#2563EB" },
    { Icon: Utensils,       labelAr: "مطعم",  labelEn: "Restaurant", color: "#DC2626" },
    { Icon: Coffee,         labelAr: "مقهى",  labelEn: "Café",    color: "#92400E" },
    { Icon: Pill,           labelAr: "صيدلية",labelEn: "Pharmacy",color: "#7C3AED" },
    { Icon: Package,        labelAr: "جملة",  labelEn: "Wholesale",color: "#0D9488" },
    { Icon: Smartphone,     labelAr: "إلكترونيات", labelEn: "Electronics", color: "#0284C7" },
    { Icon: Shirt,          labelAr: "أزياء", labelEn: "Fashion", color: "#DB2777" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 9 }}>
        {types.map((bt, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 + i * 0.06, type: "spring", bounce: 0.38 }}
            style={{
              background: isDark ? ds.surface : "#FFFFFF",
              border: `1px solid ${ds.border}`,
              borderRadius: 13,
              padding: "11px 6px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: isDark ? ds.surface2 : bt.color + "14",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 7px",
              }}
            >
              <bt.Icon size={17} color={bt.color} />
            </div>
            <div style={{ color: ds.textPrimary, fontSize: 10.5, fontWeight: 600 }}>
              {isRTL ? bt.labelAr : bt.labelEn}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
interface SlideConfig {
  titleKey: string;
  descKey: string;
  accent: string;
  SlideContent: React.FC<{ isRTL: boolean; ds: any; isDark: boolean; t: Record<string, string> }>;
}

const SLIDES: SlideConfig[] = [
  {
    titleKey: "ob1Title",
    descKey: "ob1Desc",
    accent: "#2563EB",
    SlideContent: Slide1Brand,
  },
  {
    titleKey: "ob2Title",
    descKey: "ob2Desc",
    accent: "#0D9488",
    SlideContent: Slide2Modules,
  },
  {
    titleKey: "ob3Title",
    descKey: "ob3Desc",
    accent: "#7C3AED",
    SlideContent: Slide3ForYou,
  },
];

// Inline slide text (not in translations — kept with logic for clarity)
const SLIDE_COPY = {
  ar: [
    {
      title: "مرحباً بك في تاجر",
      desc: "نظام إدارة الأعمال المتكامل للتجار في اليمن — سريع، آمن، وسهل الاستخدام.",
    },
    {
      title: "كل ما تحتاجه في مكانٍ واحد",
      desc: "مبيعات، مخزون، محاسبة، عملاء، موردون، وتقارير — نظام متكامل يدير كل جوانب تجارتك.",
    },
    {
      title: "مصمم لكل أنواع الأعمال",
      desc: "سواء كنت تمتلك بقالة أو مطعماً أو صيدلية أو محل جملة — تاجر مصمم خصيصاً لك.",
    },
  ],
  en: [
    {
      title: "Welcome to Tajir",
      desc: "The complete business management system for merchants — fast, secure, and easy to use.",
    },
    {
      title: "Everything You Need, In One Place",
      desc: "Sales, inventory, accounting, customers, suppliers, and reports — a complete system for your business.",
    },
    {
      title: "Built for Every Business Type",
      desc: "Whether you own a grocery, restaurant, pharmacy, or wholesale shop — Tajir is designed for you.",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [current, setCurrent] = useState(0);
  const { isDark, isRTL, ds } = useApp();

  // Use language-specific copy
  const lang = isRTL ? "ar" : "en";
  const copy = SLIDE_COPY[lang];
  const slide = SLIDES[current];

  const handleNext = () => {
    if (current < SLIDES.length - 1) setCurrent(current + 1);
    else onComplete();
  };

  const skipLabel = isRTL ? "تخطى" : "Skip";
  const nextLabel = isRTL ? "التالي" : "Next";
  const startLabel = isRTL ? "ابدأ" : "Get Started";

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: isDark ? ds.bg : "#F4F7FF",
        overflow: "hidden",
      }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 20px 0",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(37,99,235,0.30)",
          }}
        >
          <LogoMark size={20} white />
        </div>
        <SettingsBar mode="compact" variant="light" />
      </div>

      {/* ── Slide content ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: "16px 20px 0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: isRTL ? -24 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 24 : -24 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            <slide.SlideContent isRTL={isRTL} ds={ds} isDark={isDark} t={{}} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Text + nav ───────────────────────────────────────────────────────── */}
      <div style={{ padding: "16px 22px 28px", flexShrink: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: 16, textAlign: "center" }}
          >
            <h2
              style={{
                color: ds.textPrimary,
                fontSize: 19,
                fontWeight: 700,
                marginBottom: 7,
                lineHeight: 1.4,
                letterSpacing: "-0.2px",
              }}
            >
              {copy[current].title}
            </h2>
            <p
              style={{
                color: ds.textSecondary,
                fontSize: 13,
                lineHeight: 1.72,
              }}
            >
              {copy[current].desc}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: 16 }}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                height: 7,
                borderRadius: 4,
                cursor: "pointer",
                width: i === current ? 26 : 7,
                background: i === current ? slide.accent : (isDark ? ds.border : "#C8D4EC"),
                transition: "all 0.32s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          {current < SLIDES.length - 1 && (
            <button
              onClick={onComplete}
              style={{
                padding: "13px 18px",
                background: isDark ? ds.surface2 : ds.surface2,
                color: ds.textSecondary,
                borderRadius: ds.radiusLg,
                border: `1px solid ${ds.border}`,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                flexShrink: 0,
              }}
            >
              {skipLabel}
            </button>
          )}
          <button
            onClick={handleNext}
            style={{
              flex: 1,
              padding: "14px",
              background: `linear-gradient(135deg, ${
                slide.accent === "#2563EB" ? "#1D4ED8" :
                slide.accent === "#0D9488" ? "#0F766E" : "#6D28D9"
              }, ${slide.accent})`,
              color: "white",
              borderRadius: ds.radiusLg,
              border: "none",
              fontSize: 14.5,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: `0 6px 22px ${slide.accent}42`,
              fontFamily: "inherit",
            }}
          >
            {current === SLIDES.length - 1 ? startLabel : nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
