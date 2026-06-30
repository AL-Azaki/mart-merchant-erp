import { motion } from "motion/react";
import { CheckCircle2, ArrowLeft, ArrowRight, Sparkles, TrendingUp, Package, Calculator, FileText, Users, Truck } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { LogoMark } from "@/features/onboarding/screens/SplashScreen";
import { SettingsBar } from "@/shared/components/SettingsBar";

interface AuthGateScreenProps {
  onStartTrial: () => void;
  onSignIn: () => void;
}

export function AuthGateScreen({ onStartTrial, onSignIn }: AuthGateScreenProps) {
  const { t, isDark, isRTL, ds } = useApp();

  const features = [t.trialFeature1, t.trialFeature2, t.trialFeature3];

  const modules = isRTL ? [
    { name: "مبيعات", icon: TrendingUp, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)" },
    { name: "مخزون", icon: Package, color: "#10B981", bg: "rgba(16, 185, 129, 0.15)" },
    { name: "محاسبة", icon: Calculator, color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.15)" },
    { name: "تقارير", icon: FileText, color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)" },
    { name: "عملاء", icon: Users, color: "#EC4899", bg: "rgba(236, 72, 153, 0.15)" },
    { name: "موردين", icon: Truck, color: "#6366F1", bg: "rgba(99, 102, 241, 0.15)" },
  ] : [
    { name: "Sales", icon: TrendingUp, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)" },
    { name: "Inventory", icon: Package, color: "#10B981", bg: "rgba(16, 185, 129, 0.15)" },
    { name: "Accounting", icon: Calculator, color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.15)" },
    { name: "Reports", icon: FileText, color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)" },
    { name: "Customers", icon: Users, color: "#EC4899", bg: "rgba(236, 72, 153, 0.15)" },
    { name: "Suppliers", icon: Truck, color: "#6366F1", bg: "rgba(99, 102, 241, 0.15)" },
  ];

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: isDark ? ds.bg : "#F4F7FF",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Top gradient hero area ──────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(155deg, #0F2A6E 0%, #1D4ED8 45%, #2563EB 75%, #0EA5E9 100%)",
          paddingTop: 56, // For safe area
          paddingBottom: 40,
          paddingLeft: 24,
          paddingRight: 24,
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* BG pattern */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.08 }}>
          <svg width="100%" height="100%" viewBox="0 0 390 320" fill="none" preserveAspectRatio="xMidYMid slice">
            {Array.from({ length: 4 }).map((_, row) =>
              Array.from({ length: 6 }).map((_, col) => (
                <circle key={`${row}-${col}`} cx={col * 70 + 20} cy={row * 80 + 30} r="1.5" fill="white" />
              ))
            )}
            <circle cx="390" cy="0" r="180" stroke="white" strokeWidth="1.5" fill="none" />
            <circle cx="0" cy="320" r="200" stroke="white" strokeWidth="1" fill="none" />
          </svg>
        </div>

        {/* Settings bar top-right */}
        <div style={{ position: "absolute", top: 40, [isRTL ? "left" : "right"]: 16, zIndex: 10 }}>
          <SettingsBar mode="compact" variant="overlay" />
        </div>

        {/* Header content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
            style={{ marginBottom: 18, marginTop: 10 }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 20,
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
              }}
            >
              <LogoMark size={38} white />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={{ textAlign: "center" }}
          >
            <h1
              style={{
                color: "white",
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.5px",
                lineHeight: 1.3,
                marginBottom: 8,
                textShadow: "0 2px 10px rgba(0,0,0,0.15)",
                padding: "0 10px"
              }}
            >
              {t.authGateTitle}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 1.6, padding: "0 20px" }}>
              {t.authGateSubtitle}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom content ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: isDark ? ds.surface : "#FFFFFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24, position: "relative", zIndex: 3, padding: "30px 24px 24px" }}>
        
        {/* Module Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
            marginBottom: 28,
          }}
        >
          {modules.map((mod, i) => (
            <motion.div
              key={mod.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                background: isDark ? ds.surface2 : "#F8FAFC",
                border: `1px solid ${isDark ? ds.border : "#F1F5F9"}`,
                borderRadius: 16,
                padding: "14px 8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: mod.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <mod.icon size={18} color={mod.color} strokeWidth={2.2} />
              </div>
              <span style={{ color: ds.textPrimary, fontSize: 12, fontWeight: 600 }}>
                {mod.name}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature checklist */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 28,
            padding: "0 8px",
          }}
        >
          {features.map((feat, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                textAlign: "center"
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: isDark ? "rgba(22, 163, 74, 0.2)" : "#DCFCE7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 size={12} color={isDark ? "#4ADE80" : "#16A34A"} strokeWidth={3} />
              </div>
              <span style={{ color: ds.textSecondary, fontSize: 11, fontWeight: 500, maxWidth: 80, lineHeight: 1.3 }}>
                {feat}
              </span>
            </div>
          ))}
        </motion.div>

        <div style={{ flex: 1 }} />

        {/* Primary CTA */}
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={onStartTrial}
          style={{
            width: "100%",
            padding: "16px",
            background: "linear-gradient(135deg, #1D4ED8, #2563EB, #3B82F6)",
            color: "white",
            border: "none",
            borderRadius: 16,
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(37,99,235,0.35)",
            fontFamily: "inherit",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "transform 0.1s, box-shadow 0.1s",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Sparkles size={18} color="white" />
          {t.startTrialBtn}
          <ArrowIcon size={18} color="white" strokeWidth={2.5} />
        </motion.button>

        {/* Sign in link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ textAlign: "center", paddingBottom: 8 }}
        >
          <span style={{ color: ds.textSecondary, fontSize: 14 }}>
            {t.haveAccount}{" "}
          </span>
          <button
            onClick={onSignIn}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: ds.primary,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "inherit",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {t.signInLink}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
