import { motion } from "motion/react";
import { CheckCircle2, User, Building2, Store, Shield, ArrowLeft, ArrowRight, Sparkles, Clock } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

interface SuccessScreenProps {
  onComplete: () => void;
}

export function SuccessScreen({ onComplete }: SuccessScreenProps) {
  const { t, isDark, isRTL, ds } = useApp();

  const cards = [
    {
      Icon: User,
      title: t.successAccount,
      sub: t.successAccountSub,
      color: ds.primary,
      bg: isDark ? "#0A1A35" : "#EFF6FF",
    },
    {
      Icon: Building2,
      title: t.successBusiness,
      sub: t.successBusinessSub,
      color: "#0D9488",
      bg: isDark ? "#0A1E1C" : "#F0FDFA",
    },
    {
      Icon: Store,
      title: t.successBranch,
      sub: t.successBranchSub,
      color: "#7C3AED",
      bg: isDark ? "#1A0E2E" : "#F5F3FF",
    },
    {
      Icon: Shield,
      title: t.successPermissions,
      sub: t.successPermissionsSub,
      color: ds.success,
      bg: isDark ? "#0A1E10" : "#F0FDF4",
    },
  ];

  const DashArrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        background: isDark ? ds.bg : "#F0FDF4",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px 22px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background circles */}
      <div
        style={{
          position: "absolute",
          top: -70,
          left: -70,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: isDark ? "rgba(22,163,74,0.08)" : "rgba(22,163,74,0.10)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -90,
          right: -50,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: isDark ? "rgba(22,163,74,0.06)" : "rgba(22,163,74,0.07)",
        }}
      />

      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.55, duration: 0.85 }}
        style={{
          width: 100,
          height: 100,
          borderRadius: 32,
          background: "linear-gradient(135deg, #15803D, #16A34A, #22C55E)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          boxShadow: ds.shadowSuccess,
          position: "relative",
          zIndex: 1,
        }}
      >
        <CheckCircle2 size={50} color="white" strokeWidth={2} />
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{ position: "relative", zIndex: 1, width: "100%" }}
      >
        <h1
          style={{
            color: ds.textPrimary,
            fontSize: 26,
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          {t.congratulations}
        </h1>
        <p
          style={{
            color: ds.textPrimary,
            fontSize: 14,
            lineHeight: 1.6,
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          {t.successTitle}
        </p>
        <p
          style={{
            color: ds.textSecondary,
            fontSize: 12,
            lineHeight: 1.65,
            marginBottom: 16,
          }}
        >
          {t.successSubtitle}
        </p>

        {/* Trial started badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: isDark ? "#0A1E10" : "#F0FDF4",
            border: "1.5px solid #16A34A44",
            borderRadius: 12,
            padding: "10px 16px",
            marginBottom: 20,
          }}
        >
          <Sparkles size={15} color="#16A34A" />
          <span style={{ color: "#16A34A", fontSize: 13, fontWeight: 700 }}>
            {isRTL ? "بدأت تجربتك المجانية — ٧ أيام كاملة" : "Your free trial has started — 7 full days"}
          </span>
          <Clock size={14} color="#16A34A" />
        </motion.div>

        {/* Summary cards 2x2 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 28,
          }}
        >
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.5 + i * 0.1,
                type: "spring",
                bounce: 0.4,
              }}
              style={{
                background: isDark ? ds.surface : "#FFFFFF",
                borderRadius: ds.radiusLg,
                padding: "14px 10px",
                boxShadow: ds.shadowMd,
                border: `1px solid ${ds.border}`,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: ds.radiusSm,
                  background: card.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                  border: `1px solid ${card.color}22`,
                }}
              >
                <card.Icon size={17} color={card.color} />
              </div>
              <div
                style={{
                  color: ds.textPrimary,
                  fontSize: 11,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  color: ds.success,
                  fontSize: 10,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                }}
              >
                <CheckCircle2 size={10} color={ds.success} />
                {card.sub}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA button */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95 }}
          onClick={onComplete}
          style={{
            width: "100%",
            padding: "16px",
            background: "linear-gradient(135deg, #1D4ED8, #2563EB, #3B82F6)",
            color: "white",
            border: "none",
            borderRadius: ds.radiusXl,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: ds.shadowPrimary,
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {t.goToDashboard}
          <DashArrow size={16} color="white" />
        </motion.button>
      </motion.div>
    </div>
  );
}
