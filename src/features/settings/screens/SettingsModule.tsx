import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building2, Users, Receipt, Palette, ChevronRight, LogOut, ArrowRight, ArrowLeft, Tag, Scale, Shield, DollarSign, Percent, Store, Printer, Cloud, Activity, Camera, MapPin, Globe, Clock, UploadCloud, Eye } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";
import { SettingsBar } from "@/shared/components/SettingsBar";
import { UsersRolesModule } from "@/features/users/screens/UsersRolesModule";
import { CategoryListScreen } from "@/features/inventory/screens/CategoryListScreen";
import { UnitListScreen } from "@/features/inventory/screens/UnitListScreen";
import { MOCK_CURRENCIES } from "@/core/data/financeMockData";
import { CurrencyListScreen } from "./CurrencyListScreen";

// ─────────────────────────────────────────────────────────────────────────────
// Business Profile Screen (Tablet First)
// ─────────────────────────────────────────────────────────────────────────────
function BusinessProfileScreen() {
  const { isDark, isRTL, ds } = useApp();
  const { success } = useToast();
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const getInputStyle = () => ({
    width: "100%", height: 56, padding: "0 20px",
    background: isDark ? ds.surface2 : "#F8FAFC",
    border: `1.5px solid ${border}`, borderRadius: 16,
    color: ds.textPrimary, fontSize: 15, fontWeight: 700,
    outline: "none", fontFamily: "inherit"
  });

  const getLabelStyle = () => ({
    display: "block", color: ds.textSecondary, fontSize: 14, fontWeight: 800, marginBottom: 10
  });

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto", paddingBottom: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Building2 size={32} color="#3B82F6" />
        </div>
        <div>
          <h3 style={{ color: ds.textPrimary, fontSize: 24, fontWeight: 900, margin: 0 }}>{isRTL ? "معلومات المنشأة" : "Business Profile"}</h3>
          <p style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 600, margin: "4px 0 0 0" }}>{isRTL ? "إعدادات السجل التجاري والبيانات الأساسية" : "CR and basic company details"}</p>
        </div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32 }}>
        {/* Logo Section */}
        <div style={{ background: surface, borderRadius: 24, border: `1.5px solid ${border}`, padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, height: "fit-content" }}>
          <div style={{ width: 160, height: 160, borderRadius: 32, background: isDark ? ds.surface2 : "#F1F5F9", border: `2px dashed ${border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", color: ds.textMuted }}>
            <Camera size={40} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>{isRTL ? "تغيير الشعار" : "Change Logo"}</span>
          </div>
          <p style={{ color: ds.textSecondary, fontSize: 13, textAlign: "center", lineHeight: 1.5 }}>
            {isRTL ? "يُفضل استخدام صورة بخلفية شفافة بصيغة PNG وبحجم لا يتجاوز 2MB." : "Prefer transparent PNG under 2MB."}
          </p>
        </div>

        {/* Form Section */}
        <div style={{ background: surface, borderRadius: 24, border: `1.5px solid ${border}`, padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <label style={getLabelStyle()}>{isRTL ? "اسم المنشأة بالعربية *" : "Arabic Name *"}</label>
              <input defaultValue="مؤسسة التقنية المتقدمة" style={getInputStyle()} />
            </div>
            <div>
              <label style={getLabelStyle()}>{isRTL ? "اسم المنشأة بالإنجليزية" : "English Name"}</label>
              <input defaultValue="Advanced Tech Est." style={getInputStyle()} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <label style={getLabelStyle()}>{isRTL ? "رقم السجل التجاري" : "CR Number"}</label>
              <input defaultValue="1010123456" style={getInputStyle()} />
            </div>
            <div>
              <label style={getLabelStyle()}>{isRTL ? "الرقم الضريبي (VAT)" : "VAT Number"}</label>
              <input defaultValue="300123456789003" style={getInputStyle()} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <label style={getLabelStyle()}>{isRTL ? "رقم الهاتف" : "Phone Number"}</label>
              <input defaultValue="+966 50 123 4567" style={getInputStyle()} />
            </div>
            <div>
              <label style={getLabelStyle()}>{isRTL ? "البريد الإلكتروني" : "Email"}</label>
              <input defaultValue="info@adv-tech.com" style={getInputStyle()} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <label style={getLabelStyle()}>{isRTL ? "الموقع الإلكتروني" : "Website"}</label>
              <input defaultValue="www.adv-tech.com" style={getInputStyle()} />
            </div>
            <div>
              <label style={getLabelStyle()}>{isRTL ? "المنطقة الزمنية" : "Timezone"}</label>
              <div style={{ position: "relative" }}>
                <Clock size={20} color={ds.textMuted} style={{ position: "absolute", [isRTL?"right":"left"]: 16, top: 18 }} />
                <select style={{ ...getInputStyle(), paddingInlineStart: 48 }}>
                  <option>(GMT+03:00) Riyadh</option>
                  <option>(GMT+04:00) Dubai</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <label style={getLabelStyle()}>{isRTL ? "الدولة والمدينة" : "Country & City"}</label>
              <div style={{ position: "relative" }}>
                <Globe size={20} color={ds.textMuted} style={{ position: "absolute", [isRTL?"right":"left"]: 16, top: 18 }} />
                <input defaultValue="المملكة العربية السعودية، الرياض" style={{ ...getInputStyle(), paddingInlineStart: 48 }} />
              </div>
            </div>
            <div>
              <label style={getLabelStyle()}>{isRTL ? "العملة الافتراضية" : "Default Currency"}</label>
              <select style={getInputStyle()} defaultValue={MOCK_CURRENCIES.find(c => c.is_base_currency)?.id}>
                {MOCK_CURRENCIES.map(c => (
                  <option key={c.id} value={c.id}>{c.currency_code} - {isRTL ? c.currency_name_ar : c.currency_name_en}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={getLabelStyle()}>{isRTL ? "العنوان بالتفصيل" : "Full Address"}</label>
            <div style={{ position: "relative" }}>
              <MapPin size={20} color={ds.textMuted} style={{ position: "absolute", [isRTL?"right":"left"]: 16, top: 18 }} />
              <textarea defaultValue="الرياض, شارع العليا العام, مبنى رقم 12" rows={3} style={{ ...getInputStyle(), height: "auto", padding: "16px 20px", paddingInlineStart: 48 }} />
            </div>
          </div>

          <div style={{ borderTop: `1.5px solid ${border}`, paddingTop: 24, marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
            <button 
              onClick={() => success(isRTL ? "تم حفظ التغييرات بنجاح" : "Changes saved successfully")}
              style={{ height: 56, background: "#3B82F6", border: "none", borderRadius: 16, padding: "0 32px", color: "white", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(59,130,246,0.3)" }}
            >
              {isRTL ? "حفظ التغييرات" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Print Settings Screen (Tablet First)
// ─────────────────────────────────────────────────────────────────────────────
function PrintSettingsScreen() {
  const { isDark, isRTL, ds } = useApp();
  const { success } = useToast();
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const getInputStyle = () => ({
    width: "100%", height: 56, padding: "0 20px",
    background: isDark ? ds.surface2 : "#F8FAFC",
    border: `1.5px solid ${border}`, borderRadius: 16,
    color: ds.textPrimary, fontSize: 15, fontWeight: 700,
    outline: "none", fontFamily: "inherit"
  });

  const getLabelStyle = () => ({
    display: "block", color: ds.textSecondary, fontSize: 14, fontWeight: 800, marginBottom: 10
  });

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto", paddingBottom: 100 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Printer size={32} color="#10B981" />
          </div>
          <div>
            <h3 style={{ color: ds.textPrimary, fontSize: 24, fontWeight: 900, margin: 0 }}>{isRTL ? "إعدادات الطباعة والفواتير" : "Print & Invoice Settings"}</h3>
            <p style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 600, margin: "4px 0 0 0" }}>{isRTL ? "تخصيص شكل ومقاس فواتير البيع" : "Customize POS invoice layout"}</p>
          </div>
        </div>
        <button style={{ height: 56, background: isDark ? ds.surface2 : "#F1F5F9", border: `1.5px solid ${border}`, borderRadius: 16, padding: "0 24px", color: ds.textPrimary, fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
          <Eye size={20} />
          {isRTL ? "معاينة الفاتورة" : "Preview Invoice"}
        </button>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Print Options */}
          <div style={{ background: surface, borderRadius: 24, border: `1.5px solid ${border}`, padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <label style={getLabelStyle()}>{isRTL ? "مقاس الورق الافتراضي" : "Default Paper Size"}</label>
              <select style={getInputStyle()}>
                <option value="80mm">طابعة إيصالات (80mm Thermal)</option>
                <option value="58mm">طابعة إيصالات (58mm Thermal)</option>
                <option value="A4">طابعة عادية (A4 Document)</option>
              </select>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <label style={getLabelStyle()}>{isRTL ? "الطابعة الافتراضية" : "Default Printer"}</label>
                <select style={getInputStyle()}>
                  <option>EPSON TM-T20III</option>
                  <option>XP-80C Printer</option>
                  <option>Microsoft Print to PDF</option>
                </select>
              </div>
              <div>
                <label style={getLabelStyle()}>{isRTL ? "عدد النسخ الافتراضي" : "Default Copies"}</label>
                <input type="number" defaultValue="1" style={getInputStyle()} />
              </div>
            </div>

            <div style={{ background: isDark ? ds.surface2 : "#F8FAFC", padding: 20, borderRadius: 16, border: `1.5px solid ${border}` }}>
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", color: ds.textPrimary, fontSize: 15, fontWeight: 800 }}>
                <input type="checkbox" defaultChecked style={{ width: 24, height: 24, accentColor: "#10B981" }} />
                {isRTL ? "طباعة رمز الاستجابة السريع (QR Code) لهيئة الزكاة" : "Print ZATCA compliant QR Code"}
              </label>
            </div>
            
            <div style={{ background: isDark ? ds.surface2 : "#F8FAFC", padding: 20, borderRadius: 16, border: `1.5px solid ${border}` }}>
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", color: ds.textPrimary, fontSize: 15, fontWeight: 800 }}>
                <input type="checkbox" defaultChecked style={{ width: 24, height: 24, accentColor: "#10B981" }} />
                {isRTL ? "طباعة الفاتورة تلقائياً عند الدفع" : "Auto-print upon payment"}
              </label>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Invoice Customization */}
          <div style={{ background: surface, borderRadius: 24, border: `1.5px solid ${border}`, padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <label style={getLabelStyle()}>{isRTL ? "شعار الفاتورة" : "Invoice Logo"}</label>
              <div style={{ height: 80, borderRadius: 16, background: isDark ? ds.surface2 : "#F1F5F9", border: `2px dashed ${border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", color: ds.textMuted }}>
                <UploadCloud size={24} />
                <span style={{ fontSize: 14, fontWeight: 700 }}>{isRTL ? "رفع شعار أبيض وأسود للطباعة" : "Upload B/W logo for printing"}</span>
              </div>
            </div>

            <div>
              <label style={getLabelStyle()}>{isRTL ? "رأس الفاتورة (النص العلوي)" : "Invoice Header"}</label>
              <textarea defaultValue="فرع العليا - الرياض" rows={2} style={{ ...getInputStyle(), height: "auto", padding: "16px 20px" }} />
            </div>

            <div>
              <label style={getLabelStyle()}>{isRTL ? "تذييل الفاتورة (النص السفلي)" : "Invoice Footer Text"}</label>
              <textarea defaultValue="شكراً لتسوقكم معنا!\nالبضاعة المباعة لا ترد ولا تستبدل بعد 3 أيام." rows={4} style={{ ...getInputStyle(), height: "auto", padding: "16px 20px" }} />
            </div>

            <button 
              onClick={() => success(isRTL ? "تم حفظ التغييرات بنجاح" : "Changes saved successfully")}
              style={{ height: 56, background: "#10B981", border: "none", borderRadius: 16, padding: "0 32px", color: "white", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(16,185,129,0.3)", marginTop: 16 }}
            >
              {isRTL ? "حفظ التغييرات" : "Save Changes"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Main Settings Module (Tablet First Command Center)
// ─────────────────────────────────────────────────────────────────────────────
export function SettingsModule({ onLogout }: { onLogout: () => void }) {
  const { isDark, isRTL, ds } = useApp();
  const [activeScreen, setActiveScreen] = useState<string | null>(null);
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  // Grouped Settings Data
  const settingsGroups = [
    {
      title: isRTL ? "الإدارة والمستخدمين" : "Management & Users",
      cards: [
        { id: "business", title: isRTL ? "معلومات المنشأة" : "Company Profile", desc: isRTL ? "إدارة بيانات النشاط التجاري" : "Manage business details", icon: Building2, color: "#3B82F6", stats: [isRTL ? "المركز الرئيسي" : "Main Branch", isRTL ? "الرقم الضريبي مسجل" : "VAT Registered"] },
        { id: "users", title: isRTL ? "المستخدمون" : "Users", desc: isRTL ? "إدارة الحسابات وصلاحيات الوصول" : "Manage accounts and access", icon: Users, color: "#8B5CF6", stats: [isRTL ? "12 مستخدم" : "12 Users", isRTL ? "2 متصل حالياً" : "2 Online"] },
        { id: "roles", title: isRTL ? "الأدوار والصلاحيات" : "Roles & Permissions", desc: isRTL ? "تحديد الصلاحيات لكل دور" : "Define role permissions", icon: Shield, color: "#14B8A6", stats: [isRTL ? "4 أدوار نشطة" : "4 Active Roles", isRTL ? "120 صلاحية" : "120 Permissions"] }
      ]
    },
    {
      title: isRTL ? "المالية والمخزون" : "Finance & Inventory",
      cards: [
        { id: "currencies", title: isRTL ? "العملات والصرف" : "Currencies", desc: isRTL ? "إدارة العملات المحلية والأجنبية" : "Manage local and foreign currencies", icon: DollarSign, color: "#10B981", stats: [isRTL ? "3 عملات" : "3 Currencies", isRTL ? "الأساسية: YER" : "Base: YER"] },
        { id: "categories", title: isRTL ? "فئات المنتجات" : "Categories", desc: isRTL ? "تصنيف وتنظيم الأصناف" : "Classify and organize items", icon: Tag, color: "#F59E0B", stats: [isRTL ? "18 فئة" : "18 Categories", isRTL ? "420 منتج" : "420 Products"] },
        { id: "units", title: isRTL ? "وحدات القياس" : "Units of Measure", desc: isRTL ? "تعريف وحدات البيع والشراء" : "Define sales/purchase units", icon: Scale, color: "#EC4899", stats: [isRTL ? "12 وحدة" : "12 Units", isRTL ? "الافتراضية: قطعة" : "Default: Piece"] },
        { id: "taxes", title: isRTL ? "الضرائب والرسوم" : "Taxes & Fees", desc: isRTL ? "إعدادات ضريبة القيمة المضافة" : "VAT and tax settings", icon: Percent, color: "#EF4444", stats: [isRTL ? "القيمة المضافة 15%" : "VAT 15%", isRTL ? "مفعل" : "Enabled"] },
        { id: "warehouses", title: isRTL ? "المستودعات والفروع" : "Warehouses", desc: isRTL ? "إدارة الفروع ونقاط البيع" : "Manage branches and POS", icon: Store, color: "#6366F1", stats: [isRTL ? "3 فروع" : "3 Branches", isRTL ? "2 مستودع" : "2 Warehouses"] },
      ]
    },
    {
      title: isRTL ? "النظام والتفضيلات" : "System & Preferences",
      cards: [
        { id: "print", title: isRTL ? "إعدادات الطباعة" : "Printing", desc: isRTL ? "طابعات الفواتير والباركود" : "Invoice and barcode printers", icon: Printer, color: "#06B6D4", stats: [isRTL ? "طابعة حرارية 80mm" : "Thermal 80mm", isRTL ? "QR مفعل" : "QR Enabled"] },
        { id: "appearance", title: isRTL ? "المظهر واللغة" : "Appearance & Language", desc: isRTL ? "تخصيص الواجهة والترجمة" : "Customize UI and translation", icon: Palette, color: "#8B5CF6", stats: [isRTL ? "الوضع المظلم متوفر" : "Dark Mode Available", isRTL ? "العربية" : "Arabic"] },
        { id: "backup", title: isRTL ? "النسخ الاحتياطي" : "Backup", desc: isRTL ? "أخذ نسخة احتياطية من البيانات" : "Backup database", icon: Cloud, color: "#10B981", stats: [isRTL ? "تلقائي يومياً" : "Daily Auto", isRTL ? "آخر نسخة: اليوم" : "Last: Today"] },
        { id: "activity", title: isRTL ? "سجل النشاط" : "Activity Log", desc: isRTL ? "مراقبة حركات النظام" : "Monitor system actions", icon: Activity, color: "#F59E0B", stats: [isRTL ? "1,240 عملية اليوم" : "1,240 events today"] },
      ]
    }
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "24px 32px", background: surface, borderBottom: `1.5px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, boxShadow: ds.shadowSm }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {activeScreen && (
            <button title={isRTL ? "رجوع لمركز الإعدادات" : "Back to Control Center"} onClick={() => setActiveScreen(null)} style={{ width: 48, height: 48, borderRadius: 16, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginInlineEnd: 12 }}>
              <BackIcon size={24} color={ds.textPrimary} />
            </button>
          )}
          {!activeScreen && (
            <div style={{ width: 56, height: 56, borderRadius: 18, background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Palette size={28} color="#6366F1" strokeWidth={2.5} />
            </div>
          )}
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 22, fontWeight: 900, margin: 0 }}>
              {activeScreen === "business" ? (isRTL ? "معلومات المنشأة" : "Business Profile") :
               activeScreen === "users" ? (isRTL ? "إدارة المستخدمين" : "Users Management") :
               activeScreen === "roles" ? (isRTL ? "الأدوار والصلاحيات" : "Roles & Permissions") :
               activeScreen === "print" ? (isRTL ? "إعدادات الطباعة" : "Print Settings") :
               activeScreen === "categories" ? (isRTL ? "فئات المنتجات" : "Product Categories") :
               activeScreen === "units" ? (isRTL ? "وحدات القياس" : "Units of Measure") :
               activeScreen === "currencies" ? (isRTL ? "إعدادات العملات" : "Currency Settings") :
               activeScreen === "appearance" ? (isRTL ? "المظهر واللغة" : "Appearance & Language") :
               activeScreen ? (isRTL ? "إعدادات النظام" : "System Settings") :
               (isRTL ? "مركز الإعدادات (Control Center)" : "Settings Control Center")}
            </h2>
            {!activeScreen && (
              <p style={{ color: ds.textSecondary, fontSize: 15, fontWeight: 600, margin: "4px 0 0 0" }}>
                {isRTL ? "إدارة تفضيلات النظام، الفروع، والمستخدمين" : "Manage system preferences, branches, and users"}
              </p>
            )}
          </div>
        </div>
        
        {!activeScreen && (
          <button onClick={onLogout} style={{ height: 48, padding: "0 20px", background: "rgba(239, 68, 68, 0.1)", border: "none", borderRadius: 14, color: "#EF4444", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            <LogOut size={20} />
            {isRTL ? "تسجيل الخروج" : "Logout"}
          </button>
        )}
      </div>

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          {!activeScreen ? (
            <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ height: "100%", overflowY: "auto", padding: "32px" }}>
              
              <div style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: 100 }}>
                {settingsGroups.map((group, groupIndex) => (
                  <div key={groupIndex} style={{ marginBottom: 40 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                      <h4 style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 900, margin: 0 }}>{group.title}</h4>
                      <div style={{ flex: 1, height: 1.5, background: border }} />
                    </div>
                    
                    {/* Tablet First Grid: 3 cards per row on large screens, 2 on medium */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>
                      {group.cards.map(card => (
                        <motion.div key={card.id} whileHover={{ y: -4, boxShadow: ds.shadowMd }} onClick={() => setActiveScreen(card.id)}
                          style={{ 
                            background: surface, border: `1.5px solid ${border}`, borderRadius: 24, padding: 24, 
                            cursor: "pointer", display: "flex", flexDirection: "column", gap: 16, transition: "border-color 0.2s"
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = card.color}
                          onMouseLeave={e => e.currentTarget.style.borderColor = border}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${card.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <card.icon size={28} color={card.color} />
                              </div>
                              <div>
                                <h4 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 900, margin: "0 0 6px 0" }}>{card.title}</h4>
                                <p style={{ color: ds.textSecondary, fontSize: 14, fontWeight: 600, margin: 0 }}>{card.desc}</p>
                              </div>
                            </div>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? ds.surface2 : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <ChevronRight size={20} color={ds.textMuted} style={{ transform: isRTL ? "rotate(180deg)" : "none" }} />
                            </div>
                          </div>
                          
                          {card.stats && (
                            <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 16, borderTop: `1.5px dashed ${border}` }}>
                              {card.stats.map((stat, idx) => (
                                <div key={idx} style={{ padding: "6px 12px", borderRadius: 8, background: isDark ? ds.surface2 : "#F8FAFC", border: `1px solid ${border}`, color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>
                                  {stat}
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </motion.div>
          ) : (
            <motion.div key="screen" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ height: "100%", overflowY: "auto" }}>
              {activeScreen === "business" && <BusinessProfileScreen />}
              {activeScreen === "users" && <UsersRolesModule />}
              {activeScreen === "roles" && <UsersRolesModule />}
              {activeScreen === "print" && <PrintSettingsScreen />}
              {activeScreen === "categories" && <CategoryListScreen />}
              {activeScreen === "units" && <UnitListScreen />}
              {activeScreen === "currencies" && <CurrencyListScreen />}
              
              {/* Fallback for Appearance */}
              {activeScreen === "appearance" && (
                <div style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
                  <h3 style={{ color: ds.textPrimary, fontSize: 24, fontWeight: 900, marginBottom: 24 }}>{isRTL ? "المظهر واللغة" : "Appearance & Language"}</h3>
                  <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 24, padding: 32 }}>
                    <SettingsBar mode="list" variant="light" />
                  </div>
                </div>
              )}

              {/* Fallback for others (Mock) */}
              {["taxes", "warehouses", "backup", "activity"].includes(activeScreen) && (
                <div style={{ padding: 64, textAlign: "center" }}>
                  <h3 style={{ color: ds.textSecondary, fontSize: 24, fontWeight: 800 }}>
                    {isRTL ? "هذه الشاشة قيد التطوير للتصميم الجديد" : "This screen is under development for the new design"}
                  </h3>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
