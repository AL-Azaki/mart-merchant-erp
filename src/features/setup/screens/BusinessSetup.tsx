import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  Package,
  Utensils,
  Coffee,
  Pill,
  Smartphone,
  Shirt,
  Building2,
  Store,
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { SettingsBar } from "@/shared/components/SettingsBar";
import {
  COUNTRIES_AR,
  COUNTRIES_EN,
  CURRENCIES,
  TIMEZONES,
  FISCAL_MONTHS_AR,
  FISCAL_MONTHS_EN,
} from "@/core/data/mockData";

interface BusinessSetupProps {
  onNext: () => void;
  onBack: () => void;
}

interface BusinessForm {
  name: string;
  business_type: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  address: string;
  timezone: string;
  default_currency: string;
  fiscal_year_start_month: string;
}

const BUSINESS_TYPES = [
  { value: "grocery", Icon: ShoppingCart, labelKey: "businessTypeGrocery" },
  { value: "retail", Icon: Store, labelKey: "businessTypeRetail" },
  { value: "wholesale", Icon: Package, labelKey: "businessTypeWholesale" },
  { value: "restaurant", Icon: Utensils, labelKey: "businessTypeRestaurant" },
  { value: "cafe", Icon: Coffee, labelKey: "businessTypeCafe" },
  { value: "pharmacy", Icon: Pill, labelKey: "businessTypePharmacy" },
  { value: "electronics", Icon: Smartphone, labelKey: "businessTypeElectronics" },
  { value: "fashion", Icon: Shirt, labelKey: "businessTypeFashion" },
  { value: "other", Icon: Building2, labelKey: "businessTypeOther" },
];

// Teal/green gradient for BusinessSetup
const HEADER_GRADIENT = "linear-gradient(160deg, #0C8A7E 0%, #0D9488 60%, #14B8A6 100%)";
const ACCENT = "#0D9488";
const ACCENT_SHADOW = "0 4px 16px rgba(13,148,136,0.30)";

export function BusinessSetup({ onNext, onBack }: BusinessSetupProps) {
  const { t, isDark, isRTL, ds, language } = useApp();

  const [form, setForm] = useState<BusinessForm>({
    name: "",
    business_type: "retail",
    phone: "",
    email: "",
    country: isRTL ? "اليمن" : "Yemen",
    city: isRTL ? "صنعاء" : "Sanaa",
    address: "",
    timezone: "Asia/Aden",
    default_currency: "YER",
    fiscal_year_start_month: "1",
  });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const f = (key: keyof BusinessForm, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const countries = isRTL ? COUNTRIES_AR : COUNTRIES_EN;
  const fiscalMonths = isRTL ? FISCAL_MONTHS_AR : FISCAL_MONTHS_EN;

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
          padding: "56px 22px 62px",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            left: -60,
            width: 200,
            height: 200,
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
            {t.step} 2 {t.of} 3
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
                  width: s <= 1 ? 26 : 8,
                  height: 6,
                  borderRadius: 3,
                  background: s <= 1 ? "white" : "rgba(255,255,255,0.38)",
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
            {t.setupBusiness}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
            {t.setupBusinessSub}
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
        {/* Business type grid */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{t.businessType} *</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            {BUSINESS_TYPES.map(({ value, Icon, labelKey }) => {
              const isSelected = form.business_type === value;
              return (
                <button
                  key={value}
                  onClick={() => f("business_type", value)}
                  style={{
                    padding: "10px 6px",
                    background: isSelected
                      ? isDark
                        ? `${ACCENT}22`
                        : "#F0FDFA"
                      : ds.surface2,
                    border: `1.5px solid ${isSelected ? ACCENT : ds.border}`,
                    borderRadius: ds.radiusMd,
                    color: isSelected ? ACCENT : ds.textSecondary,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 5,
                    fontFamily: "inherit",
                  }}
                >
                  <Icon
                    size={17}
                    color={isSelected ? ACCENT : ds.textMuted}
                  />
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: isSelected ? 600 : 400,
                      textAlign: "center",
                      lineHeight: 1.3,
                    }}
                  >
                    {t[labelKey] ?? value}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Business name */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{t.businessName} *</label>
          <input
            style={inputStyle("name")}
            value={form.name}
            onChange={(e) => f("name", e.target.value)}
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField(null)}
            placeholder={isRTL ? "مثال: متجر النور" : "e.g. Al-Noor Store"}
          />
        </div>

        {/* Phone + Email */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div>
            <label style={labelStyle}>{t.businessPhone}</label>
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
          <div>
            <label style={labelStyle}>{t.businessEmail}</label>
            <input
              type="email"
              style={{ ...inputStyle("email"), direction: "ltr" }}
              value={form.email}
              onChange={(e) => f("email", e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              placeholder="biz@..."
            />
          </div>
        </div>

        {/* Country + City */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div>
            <label style={labelStyle}>{t.country} *</label>
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
          <div>
            <label style={labelStyle}>{t.city} *</label>
            <input
              style={inputStyle("city")}
              value={form.city}
              onChange={(e) => f("city", e.target.value)}
              onFocus={() => setFocusedField("city")}
              onBlur={() => setFocusedField(null)}
            />
          </div>
        </div>

        {/* Address */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{t.address}</label>
          <input
            style={inputStyle("address")}
            value={form.address}
            onChange={(e) => f("address", e.target.value)}
            onFocus={() => setFocusedField("address")}
            onBlur={() => setFocusedField(null)}
            placeholder={
              isRTL ? "شارع، حي، مبنى..." : "Street, district..."
            }
          />
        </div>

        {/* Timezone */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{t.timezone}</label>
          <select
            style={{
              ...inputStyle("timezone"),
              appearance: "none" as const,
              direction: "ltr",
            }}
            value={form.timezone}
            onChange={(e) => f("timezone", e.target.value)}
            onFocus={() => setFocusedField("timezone")}
            onBlur={() => setFocusedField(null)}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {language === "ar" ? tz.label_ar : tz.label_en}
              </option>
            ))}
          </select>
        </div>

        {/* Currency + Fiscal year */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <div>
            <label style={labelStyle}>{t.currency} *</label>
            <select
              style={{
                ...inputStyle("default_currency"),
                appearance: "none" as const,
                direction: "ltr",
              }}
              value={form.default_currency}
              onChange={(e) => f("default_currency", e.target.value)}
              onFocus={() => setFocusedField("default_currency")}
              onBlur={() => setFocusedField(null)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {language === "ar" ? c.name_ar : c.name_en}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>{t.fiscalYear}</label>
            <select
              style={{ ...inputStyle("fiscal_year_start_month"), appearance: "none" as const }}
              value={form.fiscal_year_start_month}
              onChange={(e) => f("fiscal_year_start_month", e.target.value)}
              onFocus={() => setFocusedField("fiscal_year_start_month")}
              onBlur={() => setFocusedField(null)}
            >
              {fiscalMonths.map((m, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              onNext();
            }, 800);
          }}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: loading
              ? isDark
                ? ds.surface2
                : "#CCFBF1"
              : `linear-gradient(135deg, #0C8A7E, ${ACCENT})`,
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
          {loading ? t.loading : t.continue}
        </button>
      </motion.div>
    </div>
  );
}
