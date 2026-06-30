import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, ArrowLeft, Info, Shield } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { SettingsBar } from "@/shared/components/SettingsBar";

interface BranchSetupProps {
  onNext: () => void;
  onBack: () => void;
}

interface BranchForm {
  name: string;
  code: string;
  phone: string;
  email: string;
  address: string;
  is_default: boolean;
}

// Purple gradient for BranchSetup
const HEADER_GRADIENT = "linear-gradient(160deg, #5B21B6 0%, #6D28D9 60%, #7C3AED 100%)";
const ACCENT = "#7C3AED";
const ACCENT_SHADOW = "0 4px 16px rgba(124,58,237,0.30)";

export function BranchSetup({ onNext, onBack }: BranchSetupProps) {
  const { t, isDark, isRTL, ds } = useApp();

  const [form, setForm] = useState<BranchForm>({
    name: "",
    code: "BR-001",
    phone: "",
    email: "",
    address: "",
    is_default: true,
  });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const f = (key: keyof BranchForm, val: string | boolean) =>
    setForm((p) => ({ ...p, [key]: val }));

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    padding: "12px 14px",
    background: ds.surface2,
    border: `1.5px solid ${focusedField === field ? ACCENT : ds.border}`,
    borderRadius: ds.radiusMd,
    color: ds.textPrimary,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: focusedField === field ? `0 0 0 3px ${ACCENT}20` : "none",
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

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: HEADER_GRADIENT,
      }}
    >
      {/* Gradient header */}
      <div
        style={{
          padding: "52px 22px 62px",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: -50,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
          }}
        />

        {/* Back + settings */}
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              flexShrink: 0,
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
            {t.step} 3 {t.of} 3
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
                  width: 26,
                  height: 6,
                  borderRadius: 3,
                  background: "white",
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
            {t.setupBranch}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
            {t.setupBranchSub}
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
        {/* Name + Code */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div>
            <label style={labelStyle}>{t.branchName} *</label>
            <input
              style={inputStyle("name")}
              value={form.name}
              onChange={(e) => f("name", e.target.value)}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              placeholder={isRTL ? "الفرع الرئيسي" : "Main Branch"}
            />
          </div>
          <div>
            <label style={labelStyle}>{t.branchCode} *</label>
            <input
              style={{ ...inputStyle("code"), direction: "ltr" }}
              value={form.code}
              onChange={(e) => f("code", e.target.value)}
              onFocus={() => setFocusedField("code")}
              onBlur={() => setFocusedField(null)}
              placeholder="BR-001"
            />
          </div>
        </div>

        {/* Phone */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{t.branchPhone}</label>
          <input
            type="tel"
            style={{ ...inputStyle("phone"), direction: "ltr" }}
            value={form.phone}
            onChange={(e) => f("phone", e.target.value)}
            onFocus={() => setFocusedField("phone")}
            onBlur={() => setFocusedField(null)}
            placeholder="+967..."
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{t.branchEmail}</label>
          <input
            type="email"
            style={{ ...inputStyle("email"), direction: "ltr" }}
            value={form.email}
            onChange={(e) => f("email", e.target.value)}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            placeholder="branch@example.com"
          />
        </div>

        {/* Address */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>{t.branchAddress}</label>
          <input
            style={inputStyle("address")}
            value={form.address}
            onChange={(e) => f("address", e.target.value)}
            onFocus={() => setFocusedField("address")}
            onBlur={() => setFocusedField(null)}
            placeholder={isRTL ? "عنوان الفرع" : "Branch address"}
          />
        </div>

        {/* Default branch toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            background: ds.surface2,
            borderRadius: ds.radiusMd,
            border: `1.5px solid ${ds.border}`,
            marginBottom: 14,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: ds.textPrimary,
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 2,
              }}
            >
              {t.isDefaultBranch}
            </div>
            <div style={{ color: ds.textSecondary, fontSize: 11 }}>
              {t.isDefaultBranchSub}
            </div>
          </div>
          <button
            onClick={() => f("is_default", !form.is_default)}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              background: form.is_default
                ? ACCENT
                : isDark
                ? ds.border
                : "#C8D4EC",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.25s",
              flexShrink: 0,
              marginInlineStart: 12,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "white",
                position: "absolute",
                top: 3,
                left: form.is_default ? 25 : 3,
                transition: "left 0.25s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
              }}
            />
          </button>
        </div>

        {/* Info note */}
        <div
          style={{
            background: isDark ? `${ACCENT}18` : "#F5F3FF",
            borderRadius: ds.radiusMd,
            padding: "12px 14px",
            marginBottom: 20,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            border: `1px solid ${isDark ? `${ACCENT}30` : "#DDD6FE"}`,
          }}
        >
          <div style={{ flexShrink: 0, marginTop: 1 }}>
            <Shield size={15} color={ACCENT} />
          </div>
          <p
            style={{
              color: isDark ? "#A78BFA" : "#5B21B6",
              fontSize: 11,
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {isRTL
              ? "سيتم إنشاء دور المالك (Owner) تلقائياً بصلاحيات كاملة على جميع وحدات النظام."
              : "Owner role will be created automatically with full permissions across all system modules."}
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              onNext();
            }, 900);
          }}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: loading
              ? isDark
                ? ds.surface2
                : "#EDE9FE"
              : `linear-gradient(135deg, #5B21B6, ${ACCENT})`,
            color: loading ? ds.textMuted : "white",
            border: "none",
            borderRadius: ds.radiusLg,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : ACCENT_SHADOW,
            fontFamily: "inherit",
            transition: "all 0.2s",
          }}
        >
          {loading ? t.loading : t.createBranchBtn}
        </button>
      </motion.div>
    </div>
  );
}
