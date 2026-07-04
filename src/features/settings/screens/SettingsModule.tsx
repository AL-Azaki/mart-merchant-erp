import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building2, Users, Receipt, Palette, ChevronRight, LogOut, ArrowRight, ArrowLeft, Tag, Scale } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { SettingsBar } from "@/shared/components/SettingsBar";
import { UsersRolesModule } from "@/features/users/screens/UsersRolesModule";
import { CategoryListScreen } from "@/features/inventory/screens/CategoryListScreen";
import { UnitListScreen } from "@/features/inventory/screens/UnitListScreen";

// Dummy screens for inside settings
function BusinessProfileScreen() {
  const { t, isDark, isRTL, ds } = useApp();
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const getInputStyle = () => ({
    width: "100%", height: 48, padding: "0 16px",
    background: isDark ? ds.surface2 : "#FFFFFF",
    border: `1px solid ${border}`, borderRadius: 12,
    color: ds.textPrimary, fontSize: 14, fontWeight: 500,
    outline: "none", fontFamily: "inherit"
  });

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h3 style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800, marginBottom: 24 }}>{isRTL ? "معلومات المنشأة" : "Business Profile"}</h3>
      
      <div style={{ background: surface, borderRadius: 20, border: `1px solid ${border}`, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "اسم النشاط التجاري *" : "Business Name *"}</label>
            <input defaultValue="متجر التقنية الحديثة" style={getInputStyle()} />
          </div>
          <div>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "رقم السجل التجاري" : "CR Number"}</label>
            <input defaultValue="1010123456" style={getInputStyle()} />
          </div>
          <div>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "الرقم الضريبي (VAT)" : "VAT Number"}</label>
            <input defaultValue="300123456789003" style={getInputStyle()} />
          </div>
          <div>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "العملة الافتراضية" : "Default Currency"}</label>
            <select style={getInputStyle()}>
              <option value="SAR">SAR - ريال سعودي</option>
              <option value="YER">YER - ريال يمني</option>
              <option value="USD">USD - دولار أمريكي</option>
            </select>
          </div>
        </div>
        
        <div>
          <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "العنوان" : "Address"}</label>
          <textarea defaultValue="الرياض, شارع العليا العام" rows={3} style={{ ...getInputStyle(), height: "auto", padding: 16 }} />
        </div>

        <button style={{ height: 48, background: "#6366F1", border: "none", borderRadius: 12, padding: "0 24px", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start", marginTop: 8 }}>
          {isRTL ? "حفظ التغييرات" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function PrintSettingsScreen() {
  const { t, isDark, isRTL, ds } = useApp();
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const getInputStyle = () => ({
    width: "100%", height: 48, padding: "0 16px",
    background: isDark ? ds.surface2 : "#FFFFFF",
    border: `1px solid ${border}`, borderRadius: 12,
    color: ds.textPrimary, fontSize: 14, fontWeight: 500,
    outline: "none", fontFamily: "inherit"
  });

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h3 style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800, marginBottom: 24 }}>{isRTL ? "إعدادات الطباعة والفواتير" : "Print & Invoice Settings"}</h3>
      
      <div style={{ background: surface, borderRadius: 20, border: `1px solid ${border}`, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "مقاس الورق الافتراضي" : "Default Paper Size"}</label>
          <select style={getInputStyle()}>
            <option value="80mm">طابعة إيصالات (80mm Thermal)</option>
            <option value="A4">طابعة عادية (A4 Document)</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "تذييل الفاتورة (النص السفلي)" : "Invoice Footer Text"}</label>
          <textarea defaultValue="شكراً لتسوقكم معنا! البضاعة المباعة لا ترد ولا تستبدل بعد 3 أيام." rows={3} style={{ ...getInputStyle(), height: "auto", padding: 16 }} />
        </div>

        <div style={{ background: isDark ? ds.surface2 : "#F8FAFC", padding: 16, borderRadius: 12, border: `1px solid ${border}` }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
            <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: "#6366F1" }} />
            {isRTL ? "طباعة رمز الاستجابة السريع (QR Code) متوافق مع هيئة الزكاة" : "Print ZATCA compliant QR Code"}
          </label>
        </div>

        <button style={{ height: 48, background: "#6366F1", border: "none", borderRadius: 12, padding: "0 24px", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start", marginTop: 8 }}>
          {isRTL ? "حفظ التغييرات" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}


export function SettingsModule({ onLogout }: { onLogout: () => void }) {
  const { t, isDark, isRTL, ds } = useApp();
  const [activeScreen, setActiveScreen] = useState<string | null>(null);
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const settingsCards = [
    { id: "business", title: isRTL ? "معلومات المنشأة" : "Business Profile", desc: isRTL ? "الاسم، السجل التجاري، الرقم الضريبي" : "Name, CR, VAT number", icon: Building2, color: "#3B82F6" },
    { id: "users", title: isRTL ? "المستخدمين والصلاحيات" : "Users & Roles", desc: isRTL ? "إدارة الوصول وتعيين الأدوار" : "Manage access and roles", icon: Users, color: "#8B5CF6" },
    { id: "print", title: isRTL ? "الطباعة والفواتير" : "Print & Invoices", desc: isRTL ? "مقاس الطابعة، التذييل، والـ QR" : "Paper size, footers, QR config", icon: Receipt, color: "#F59E0B" },
    { id: "categories", title: isRTL ? "فئات المنتجات" : "Product Categories", desc: isRTL ? "إدارة وتصنيف السلع والخدمات" : "Manage product classifications", icon: Tag, color: "#10B981" },
    { id: "units", title: isRTL ? "وحدات القياس" : "Units of Measure", desc: isRTL ? "تعديل وتحديد الوحدات والافتراضيات" : "Configure package units and defaults", icon: Scale, color: "#EC4899" },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", background: surface, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {activeScreen && (
            <button title={isRTL ? "رجوع للإعدادات" : "Back to Settings"} onClick={() => setActiveScreen(null)} style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginInlineEnd: 8 }}>
              <BackIcon size={20} color={ds.textPrimary} />
            </button>
          )}
          {!activeScreen && (
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Palette size={22} color="#6366F1" strokeWidth={2.5} />
            </div>
          )}
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>
              {activeScreen === "business" ? (isRTL ? "معلومات المنشأة" : "Business Profile") :
               activeScreen === "users" ? (isRTL ? "إدارة المستخدمين" : "Users Management") :
               activeScreen === "print" ? (isRTL ? "إعدادات الطباعة" : "Print Settings") :
               activeScreen === "categories" ? (isRTL ? "فئات المنتجات" : "Product Categories") :
               activeScreen === "units" ? (isRTL ? "وحدات القياس" : "Units of Measure") :
               (isRTL ? "إعدادات النظام" : "System Settings")}
            </h2>
            {!activeScreen && (
              <p style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 500 }}>
                {isRTL ? "إدارة تفضيلات وخيارات النظام المتقدمة" : "Manage advanced system preferences"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          {!activeScreen ? (
            <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ height: "100%", overflowY: "auto", padding: 24 }}>
              
              <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <h4 style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>{isRTL ? "الإعدادات العامة" : "General Settings"}</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 32 }}>
                  {settingsCards.map(card => (
                    <motion.div key={card.id} whileHover={{ y: -2 }} onClick={() => setActiveScreen(card.id)}
                      style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${card.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <card.icon size={20} color={card.color} />
                        </div>
                        <div>
                          <h4 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 700, margin: "0 0 4px 0" }}>{card.title}</h4>
                          <p style={{ color: ds.textSecondary, fontSize: 12, margin: 0 }}>{card.desc}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} color={ds.textMuted} style={{ transform: isRTL ? "rotate(180deg)" : "none" }} />
                    </motion.div>
                  ))}
                </div>

                <h4 style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>{isRTL ? "تفضيلات الواجهة" : "UI Preferences"}</h4>
                <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, marginBottom: 32 }}>
                  <SettingsBar mode="list" variant="light" />
                </div>

                <button onClick={onLogout} style={{ width: "100%", height: 56, background: "rgba(239, 68, 68, 0.1)", border: `1px solid rgba(239, 68, 68, 0.2)`, borderRadius: 16, color: "#EF4444", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <LogOut size={20} />
                  {isRTL ? "تسجيل الخروج" : "Logout"}
                </button>

              </div>

            </motion.div>
          ) : (
            <motion.div key="screen" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ height: "100%", overflowY: "auto" }}>
              {activeScreen === "business" && <BusinessProfileScreen />}
              {activeScreen === "users" && <UsersRolesModule />}
              {activeScreen === "print" && <PrintSettingsScreen />}
              {activeScreen === "categories" && <CategoryListScreen />}
              {activeScreen === "units" && <UnitListScreen />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
