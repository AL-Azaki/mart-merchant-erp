import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, X, Lock, Mail, AlertCircle, Check } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { SettingsBar } from "@/shared/components/SettingsBar";
import { LogoSVG } from "@/features/onboarding/screens/SplashScreen";
import { DEMO_CREDENTIALS } from "@/core/data/mockData";

interface LoginScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

export function LoginScreen({ onLogin, onRegister }: LoginScreenProps) {
  const { t, isDark, isRTL, ds } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDemo, setShowDemo] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setErrors({});
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = t.emailRequired;
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = t.invalidEmail;
    if (!password) e.password = t.passwordRequired;
    return e;
  };

  const handleLogin = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      const tempEmail = localStorage.getItem("temp_user_email");
      const tempPass = localStorage.getItem("temp_user_password");
      
      if (
        (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) ||
        (email === tempEmail && password === tempPass)
      ) {
        onLogin();
      } else {
        setErrors({ general: t.loginError });
        setLoading(false);
      }
    }, 1100);
  };

  const inputStyle = (field: string, hasError?: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "13px 16px",
    // email: icon on start side, password: toggle on end side
    paddingInlineStart: field === "email" ? 42 : 16,
    paddingInlineEnd: field === "password" ? 44 : 16,
    background: ds.surface2,
    border: `1.5px solid ${
      hasError ? ds.error : focusedField === field ? ds.primary : ds.border
    }`,
    borderRadius: ds.radiusMd,
    color: ds.textPrimary,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box" as const,
    direction: "ltr",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
    boxShadow:
      focusedField === field && !hasError
        ? `0 0 0 3px ${ds.primary}22`
        : hasError && focusedField === field
        ? `0 0 0 3px ${ds.error}22`
        : "none",
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: ds.textMuted,
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 6,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(160deg, #1D4ED8 0%, #2563EB 60%, #0EA5E9 100%)",
      }}
    >
      {/* Gradient header */}
      <div
        style={{
          padding: "56px 22px 68px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Decorative */}
        <div
          style={{
            position: "absolute",
            top: -70,
            right: -70,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: -40,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />

        {/* Top controls */}
        <div
          style={{
            position: "absolute",
            top: 20,
            [isRTL ? "left" : "right"]: 16,
            zIndex: 10,
          }}
        >
          <SettingsBar mode="compact" variant="overlay" />
        </div>

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 22,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            <LogoSVG size={42} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1
            style={{
              color: "white",
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            {t.welcomeBack}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 13 }}>
            {t.loginSubtitle}
          </p>
        </motion.div>
      </div>

      {/* Form card — slides up over gradient */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          flex: 1,
          background: isDark ? ds.surface : "#FFFFFF",
          borderRadius: "24px 24px 0 0",
          marginTop: -24,
          padding: "28px 22px 24px",
          overflowY: "auto",
        }}
      >
        {/* Demo credentials banner */}
        {showDemo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: isDark ? ds.surface2 : "#EFF6FF",
              border: `1.5px solid ${isDark ? ds.border : "#BAE6FD"}`,
              borderRadius: ds.radiusMd,
              padding: "12px 14px",
              marginBottom: 20,
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowDemo(false)}
              style={{
                position: "absolute",
                top: 8,
                [isRTL ? "left" : "right"]: 10,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: ds.textMuted,
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={14} color={ds.textMuted} />
            </button>
            <div
              style={{
                color: ds.secondaryDark,
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Lock size={12} color={ds.secondaryDark} />
              {t.demoCredentials}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "4px 10px",
                fontSize: 12,
                marginBottom: 10,
              }}
            >
              <span style={{ color: ds.textSecondary }}>Email:</span>
              <span
                style={{
                  color: ds.textPrimary,
                  fontFamily: "monospace",
                  direction: "ltr",
                }}
              >
                {t.demoEmail}
              </span>
              <span style={{ color: ds.textSecondary }}>Password:</span>
              <span
                style={{
                  color: ds.textPrimary,
                  fontFamily: "monospace",
                }}
              >
                {t.demoPassword}
              </span>
            </div>
            <button
              onClick={fillDemo}
              style={{
                width: "100%",
                padding: "8px",
                background: ds.secondaryDark,
                color: "white",
                border: "none",
                borderRadius: ds.radiusSm,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {isRTL ? "تعبئة البيانات تلقائياً" : "Auto-fill credentials"}
            </button>
          </motion.div>
        )}

        {/* General error */}
        {errors.general && (
          <div
            style={{
              background: isDark ? "#1A0A0A" : "#FEF2F2",
              border: `1.5px solid ${isDark ? "#5C1A1A" : "#FECACA"}`,
              borderRadius: ds.radiusMd,
              padding: "10px 14px",
              marginBottom: 16,
              color: ds.error,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertCircle size={14} color={ds.error} />
            {errors.general}
          </div>
        )}

        {/* Email field */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{t.emailLabel}</label>
          <div style={{ position: "relative" }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              placeholder="example@email.com"
              style={inputStyle("email", !!errors.email)}
            />
            {/* Icon on the logical START side (left in LTR) */}
            <div
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                opacity: focusedField === "email" ? 0.7 : 0.38,
                transition: "opacity 0.2s",
              }}
            >
              <Mail size={15} color={focusedField === "email" ? ds.primary : ds.textMuted} />
            </div>
          </div>
          {errors.email && (
            <p
              style={{
                color: ds.error,
                fontSize: 11,
                marginTop: 5,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <AlertCircle size={11} color={ds.error} /> {errors.email}
            </p>
          )}
        </div>

        {/* Password field */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{t.passwordLabel}</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              placeholder="••••••••"
              style={inputStyle("password", !!errors.password)}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              style={{
                position: "absolute",
                [isRTL ? "left" : "right"]: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: ds.textMuted,
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {showPass ? (
                <EyeOff size={16} color={ds.textMuted} />
              ) : (
                <Eye size={16} color={ds.textMuted} />
              )}
            </button>
          </div>
          {errors.password && (
            <p
              style={{
                color: ds.error,
                fontSize: 11,
                marginTop: 5,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <AlertCircle size={11} color={ds.error} /> {errors.password}
            </p>
          )}
        </div>

        {/* Remember + Forgot */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <button
            onClick={() => setRemember(!remember)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: ds.textSecondary,
              fontSize: 13,
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                border: `2px solid ${remember ? ds.primary : ds.border}`,
                background: remember ? ds.primary : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              {remember && <Check size={11} color="white" strokeWidth={2.5} />}
            </div>
            {t.rememberMe}
          </button>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: ds.primary,
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "inherit",
            }}
          >
            {t.forgotPassword}
          </button>
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            background: loading
              ? isDark
                ? "#1A2E48"
                : "#93C5FD"
              : "linear-gradient(135deg, #1D4ED8, #2563EB, #3B82F6)",
            color: "white",
            border: "none",
            borderRadius: ds.radiusLg,
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : ds.shadowPrimary,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.25s",
            fontFamily: "inherit",
          }}
        >
          {loading ? (
            <>
              <div
                style={{
                  width: 18,
                  height: 18,
                  border: "2.5px solid rgba(255,255,255,0.3)",
                  borderTop: "2.5px solid white",
                  borderRadius: "50%",
                  animation: "loginSpin 0.9s linear infinite",
                }}
              />
              <span>{t.loading}</span>
            </>
          ) : (
            t.loginBtn
          )}
        </button>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div style={{ flex: 1, height: 1, background: ds.border }} />
          <span style={{ color: ds.textMuted, fontSize: 12 }}>{t.or}</span>
          <div style={{ flex: 1, height: 1, background: ds.border }} />
        </div>

        {/* Register link */}
        <div style={{ textAlign: "center" }}>
          <span style={{ color: ds.textSecondary, fontSize: 14 }}>
            {t.noAccount}{" "}
          </span>
          <button
            onClick={onRegister}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: ds.primary,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            {t.createAccount}
          </button>
        </div>
      </motion.div>

      <style>{`@keyframes loginSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
