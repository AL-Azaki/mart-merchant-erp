import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, ArrowLeft, Eye, EyeOff, Check, Globe } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { SettingsBar } from "@/shared/components/SettingsBar";
import { COUNTRIES_AR, COUNTRIES_EN } from "@/core/data/mockData";

interface RegisterScreenProps {
  onNext: () => void;
  onBack: () => void;
}

interface UserForm {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  preferred_language: "ar" | "en";
  country: string;
  accept_terms: boolean;
}

export function RegisterScreen({ onNext, onBack }: RegisterScreenProps) {
  const { t, isDark, isRTL, ds, language } = useApp();

  const [form, setForm] = useState<UserForm>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    preferred_language: language,
    country: isRTL ? "اليمن" : "Yemen",
    accept_terms: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const f = (key: keyof UserForm, val: string | boolean) =>
    setForm((p) => ({ ...p, [key]: val }));

  const countries = isRTL ? COUNTRIES_AR : COUNTRIES_EN;

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    padding: "12px 14px",
    background: ds.surface2,
    border: `1.5px solid ${focusedField === field ? ds.primary : ds.border}`,
    borderRadius: ds.radiusMd,
    color: ds.textPrimary,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
    boxShadow: focusedField === field ? `0 0 0 3px ${ds.primary}20` : "none",
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: ds.textMuted,
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 5,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("temp_user_email", form.email);
      localStorage.setItem("temp_user_password", form.password);
      setLoading(false);
      onNext();
    }, 900);
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

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
          padding: "56px 22px 62px",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
          }}
        />

        {/* Back + settings row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: ds.radiusMd,
              width: 38,
              height: 38,
              cursor: "pointer",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <BackIcon size={17} color="white" />
          </button>
          <SettingsBar mode="compact" variant="overlay" />
        </div>

        {/* Step indicators */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: 11,
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            {t.step} 1 {t.of} 3
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              marginBottom: 14,
            }}
          >
            {[0, 1, 2].map((s) => (
              <div
                key={s}
                style={{
                  width: s === 0 ? 26 : 8,
                  height: 6,
                  borderRadius: 3,
                  background: s === 0 ? "white" : "rgba(255,255,255,0.38)",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
          <h1
            style={{
              color: "white",
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            {t.createNewAccount}
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 12,
            }}
          >
            {t.registerSubtitle}
          </p>
        </div>
      </div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          flex: 1,
          background: isDark ? ds.surface : "#FFFFFF",
          borderRadius: "24px 24px 0 0",
          marginTop: -24,
          padding: "24px 20px 20px",
          overflowY: "auto",
        }}
      >
        {/* First + Last name */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div>
            <label style={labelStyle}>{t.firstName} *</label>
            <input
              style={inputStyle("first_name")}
              value={form.first_name}
              onChange={(e) => f("first_name", e.target.value)}
              onFocus={() => setFocusedField("first_name")}
              onBlur={() => setFocusedField(null)}
            />
          </div>
          <div>
            <label style={labelStyle}>{t.lastName} *</label>
            <input
              style={inputStyle("last_name")}
              value={form.last_name}
              onChange={(e) => f("last_name", e.target.value)}
              onFocus={() => setFocusedField("last_name")}
              onBlur={() => setFocusedField(null)}
            />
          </div>
        </div>

        {/* Username */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{t.username} *</label>
          <input
            style={{ ...inputStyle("username"), direction: "ltr" }}
            value={form.username}
            onChange={(e) => f("username", e.target.value)}
            onFocus={() => setFocusedField("username")}
            onBlur={() => setFocusedField(null)}
            placeholder="@username"
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{t.emailLabel} *</label>
          <input
            type="email"
            style={{ ...inputStyle("email"), direction: "ltr" }}
            value={form.email}
            onChange={(e) => f("email", e.target.value)}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            placeholder="email@example.com"
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{t.phone} *</label>
          <input
            type="tel"
            style={{ ...inputStyle("phone"), direction: "ltr" }}
            value={form.phone}
            onChange={(e) => f("phone", e.target.value)}
            onFocus={() => setFocusedField("phone")}
            onBlur={() => setFocusedField(null)}
            placeholder="+967 77..."
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{t.passwordLabel} *</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              style={{
                ...inputStyle("password"),
                paddingInlineEnd: 42,
              }}
              value={form.password}
              onChange={(e) => f("password", e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              placeholder="••••••••"
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
                padding: 4,
                display: "flex",
                alignItems: "center",
              }}
            >
              {showPass ? (
                <EyeOff size={15} color={ds.textMuted} />
              ) : (
                <Eye size={15} color={ds.textMuted} />
              )}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{t.confirmPassword} *</label>
          <input
            type="password"
            style={inputStyle("confirmPassword")}
            value={form.confirmPassword}
            onChange={(e) => f("confirmPassword", e.target.value)}
            onFocus={() => setFocusedField("confirmPassword")}
            onBlur={() => setFocusedField(null)}
            placeholder="••••••••"
          />
        </div>

        {/* Preferred language toggle */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>
            <Globe size={10} style={{ display: "inline", marginInlineEnd: 4 }} />
            {t.preferredLanguage}
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {(["ar", "en"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => f("preferred_language", lang)}
                style={{
                  flex: 1,
                  padding: "10px 8px",
                  background:
                    form.preferred_language === lang
                      ? isDark
                        ? ds.border
                        : "#EFF6FF"
                      : ds.surface2,
                  border: `1.5px solid ${
                    form.preferred_language === lang ? ds.primary : ds.border
                  }`,
                  borderRadius: ds.radiusMd,
                  color:
                    form.preferred_language === lang
                      ? ds.primary
                      : ds.textSecondary,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                {lang === "ar" ? "العربية" : "English"}
              </button>
            ))}
          </div>
        </div>

        {/* Country */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>{t.country}</label>
          <select
            style={{ ...inputStyle("country"), appearance: "none" as const }}
            value={form.country}
            onChange={(e) => f("country", e.target.value)}
            onFocus={() => setFocusedField("country")}
            onBlur={() => setFocusedField(null)}
          >
            {countries.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Accept terms */}
        <button
          onClick={() => f("accept_terms", !form.accept_terms)}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: ds.textSecondary,
            fontSize: 12,
            marginBottom: 20,
            width: "100%",
            textAlign: isRTL ? "right" : "left",
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              flexShrink: 0,
              marginTop: 1,
              border: `2px solid ${form.accept_terms ? ds.primary : ds.border}`,
              background: form.accept_terms ? ds.primary : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            {form.accept_terms && (
              <Check size={11} color="white" strokeWidth={2.5} />
            )}
          </div>
          <span style={{ lineHeight: 1.55 }}>{t.acceptTerms}</span>
        </button>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !form.accept_terms}
          style={{
            width: "100%",
            padding: "14px",
            background:
              !form.accept_terms || loading
                ? isDark
                  ? ds.surface2
                  : ds.surface2
                : "linear-gradient(135deg, #1D4ED8, #2563EB, #3B82F6)",
            color:
              !form.accept_terms || loading ? ds.textMuted : "white",
            border: "none",
            borderRadius: ds.radiusLg,
            fontSize: 14,
            fontWeight: 600,
            cursor:
              !form.accept_terms || loading ? "not-allowed" : "pointer",
            boxShadow:
              !form.accept_terms || loading ? "none" : ds.shadowPrimary,
            marginBottom: 14,
            transition: "all 0.2s",
            fontFamily: "inherit",
          }}
        >
          {loading ? t.loading : t.createAccount}
        </button>

        {/* Sign in link */}
        <div style={{ textAlign: "center" }}>
          <span style={{ color: ds.textSecondary, fontSize: 13 }}>
            {t.alreadyHaveAccount}{" "}
          </span>
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: ds.primary,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            {t.signIn}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
