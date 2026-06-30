import { useEffect } from "react";
import { motion } from "motion/react";
import { useApp } from "@/providers/AppProvider";

// ── LogoMark ───────────────────────────────────────────────────────────────────
export function LogoMark({ size = 40, white = true }: { size?: number; white?: boolean }) {
  const c = white ? "white" : "#2563EB";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M5 18L20 8L35 18" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="7" y="18" width="26" height="16" rx="2.5" stroke={c} strokeWidth="2.2" fill="none" />
      <rect x="16" y="24" width="8" height="10" rx="1.5" fill={c} fillOpacity="0.45" />
      <rect x="9" y="20" width="6" height="5" rx="1" fill={c} fillOpacity="0.35" />
      <rect x="25" y="20" width="6" height="5" rx="1" fill={c} fillOpacity="0.35" />
      <circle cx="32" cy="10" r="4.5" fill="#0EA5E9" />
      <path d="M30.5 11.5L32 9.5L33.5 11.5M32 9.5V12.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogoSVG({ size = 40 }: { size?: number }) {
  return <LogoMark size={size} white />;
}

function BgPattern() {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.055 }} viewBox="0 0 390 844" fill="none" preserveAspectRatio="xMidYMid slice">
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={col * 70 + 20} cy={row * 110 + 40} r="1.5" fill="white" />
        ))
      )}
      <circle cx="390" cy="0" r="220" stroke="white" strokeWidth="1" fill="none" />
      <circle cx="390" cy="0" r="330" stroke="white" strokeWidth="0.5" fill="none" />
      <circle cx="0" cy="844" r="260" stroke="white" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const { t } = useApp();

  useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{
      height: "100%", width: "100%",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(155deg, #0F2A6E 0%, #1D4ED8 40%, #2563EB 70%, #0EA5E9 100%)",
      position: "relative", overflow: "hidden",
    }}>
      <BgPattern />

      {/* Glow blobs */}
      <div style={{ position: "absolute", top: -120, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(59,130,246,0.32)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(14,165,233,0.22)", filter: "blur(60px)", pointerEvents: "none" }} />

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Logo container */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
          style={{ marginBottom: 28 }}
        >
          <div style={{
            width: 88, height: 88, borderRadius: 26,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            border: "1.5px solid rgba(255,255,255,0.28)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
          }}>
            <LogoMark size={50} white />
          </div>
        </motion.div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.55 }}
          style={{ textAlign: "center", marginBottom: 18 }}
        >
          <h1 style={{
            color: "white", fontSize: 48, fontWeight: 800,
            lineHeight: 1.2, marginBottom: 16,
            textShadow: "0 4px 24px rgba(0,0,0,0.25)",
            whiteSpace: "nowrap"
          }}>
            {t.appName}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
            <div style={{ height: 1, width: 28, background: "rgba(255,255,255,0.32)", borderRadius: 1 }} />
            <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 13, fontWeight: 400, letterSpacing: "0.2px" }}>
              {t.tagline}
            </p>
            <div style={{ height: 1, width: 28, background: "rgba(255,255,255,0.32)", borderRadius: 1 }} />
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center", maxWidth: 280 }}
        >
          {(t.taglineSub || "مبيعات · مخزون · محاسبة · تقارير").split(" · ").map((label: string, i: number) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.68 + i * 0.07 }}
              style={{
                background: "rgba(255,255,255,0.13)",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.20)",
                borderRadius: 20, padding: "5px 13px",
                color: "rgba(255,255,255,0.88)", fontSize: 11.5, fontWeight: 500,
              }}
            >
              {label}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom: animated progress bar + version */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        style={{ position: "absolute", bottom: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
      >
        <div style={{ width: 52, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.15 }}
            style={{ width: "60%", height: "100%", background: "rgba(255,255,255,0.85)", borderRadius: 2 }}
          />
        </div>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: "0.5px" }}>v1.0.0</span>
      </motion.div>
    </div>
  );
}
