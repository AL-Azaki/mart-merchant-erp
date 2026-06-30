import { useState } from "react";
import { motion } from "motion/react";
import { X, Check, Building2, User, Phone, MapPin } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import type { Supplier } from "@/core/types/purchases";

interface SupplierFormSheetProps {
  supplier?: Supplier | null;
  onClose: () => void;
  onSave: (data: Partial<Supplier>) => void;
}

interface InputWrapperProps {
  label: string;
  icon?: any;
  isFocused: boolean;
  isRTL: boolean;
  ds: any;
  children: React.ReactNode;
}

const InputWrapper = ({ label, icon: Icon, isFocused, isRTL, ds, children }: InputWrapperProps) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: "block", color: isFocused ? "#8B5CF6" : ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8, transition: "color 0.2s" }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      {Icon && (
        <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 10, background: isFocused ? "rgba(139,92,246,0.1)" : "transparent", transition: "all 0.2s" }}>
          <Icon size={18} color={isFocused ? "#8B5CF6" : ds.textMuted} />
        </div>
      )}
      {children}
    </div>
  </div>
);

export function SupplierFormSheet({ supplier, onClose, onSave }: SupplierFormSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const [formData, setFormData] = useState({
    supplier_name: supplier?.supplier_name || "",
    contact_person: supplier?.contact_person || "",
    phone: supplier?.phone || "",
    supplier_address: supplier?.supplier_address || "",
    is_active: supplier?.is_active ?? true,
  });

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const [focusedInput, setFocusedInput] = useState<string | null>(null);


  const getInputStyle = (name: string) => ({
    width: "100%", boxSizing: "border-box" as const,
    paddingInlineStart: 52, paddingInlineEnd: 16, height: 52,
    background: isDark ? ds.surface2 : "#F8FAFC",
    border: `1.5px solid ${focusedInput === name ? "#8B5CF6" : isDark ? ds.border : "#E2E8F0"}`,
    borderRadius: 14, color: ds.textPrimary, fontSize: 15, fontWeight: 600, outline: "none", fontFamily: "inherit",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: focusedInput === name ? "0 4px 12px rgba(139,92,246,0.15)" : "0 2px 4px rgba(0,0,0,0.02)"
  });

  const title = supplier 
    ? (isRTL ? "تعديل المورد" : "Edit Supplier")
    : (isRTL ? "إضافة مورد جديد" : "Add New Supplier");

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }} 
      />
      
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{ position: "relative", width: "100%", maxWidth: 600, maxHeight: "90vh", background: bg, borderRadius: 24, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", border: `1px solid ${isDark ? ds.border : "rgba(255,255,255,0.8)"}` }}
      >
        {/* Header */}
        <div style={{ background: surface, padding: "24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{title}</h2>
            <p style={{ color: ds.textSecondary, fontSize: 13 }}>{isRTL ? "أدخل تفاصيل المورد بدقة" : "Enter supplier details accurately"}</p>
          </div>
          <button onClick={onClose} style={{ background: isDark ? ds.surface2 : "#F1F5F9", border: "none", width: 40, height: 40, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = isDark ? ds.border : "#E2E8F0"} onMouseLeave={e => e.currentTarget.style.background = isDark ? ds.surface2 : "#F1F5F9"}>
            <X size={20} color={ds.textPrimary} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
          
          {/* Basic Info */}
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
               <Building2 size={18} color="#8B5CF6" />
               {isRTL ? "معلومات الشركة / المورد" : "Company / Supplier Info"}
            </h3>
            
            <InputWrapper label={isRTL ? "اسم المورد / الشركة *" : "Supplier / Company Name *"} icon={Building2} isFocused={focusedInput === "supplier_name"} isRTL={isRTL} ds={ds}>
              <input name="supplier_name" value={formData.supplier_name} onChange={handleChange} onFocus={() => setFocusedInput("supplier_name")} onBlur={() => setFocusedInput(null)} required style={getInputStyle("supplier_name")} placeholder={isRTL ? "مثال: شركة المراعي" : "e.g., Almarai Company"} />
            </InputWrapper>

            <InputWrapper label={isRTL ? "الشخص المسؤول (اختياري)" : "Contact Person (Optional)"} icon={User} isFocused={focusedInput === "contact_person"} isRTL={isRTL} ds={ds}>
              <input name="contact_person" value={formData.contact_person} onChange={handleChange} onFocus={() => setFocusedInput("contact_person")} onBlur={() => setFocusedInput(null)} style={getInputStyle("contact_person")} placeholder={isRTL ? "اسم المندوب أو المسؤول" : "Representative name"} />
            </InputWrapper>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <InputWrapper label={isRTL ? "رقم الهاتف" : "Phone Number"} icon={Phone} isFocused={focusedInput === "phone"} isRTL={isRTL} ds={ds}>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} onFocus={() => setFocusedInput("phone")} onBlur={() => setFocusedInput(null)} style={{ ...getInputStyle("phone"), direction: "ltr" }} placeholder="+967..." />
              </InputWrapper>
              
              <InputWrapper label={isRTL ? "العنوان" : "Address"} icon={MapPin} isFocused={focusedInput === "supplier_address"} isRTL={isRTL} ds={ds}>
                <input name="supplier_address" value={formData.supplier_address} onChange={handleChange} onFocus={() => setFocusedInput("supplier_address")} onBlur={() => setFocusedInput(null)} style={getInputStyle("supplier_address")} placeholder={isRTL ? "المدينة، الشارع" : "City, Street"} />
              </InputWrapper>
            </div>
          </div>
        </form>

        <div style={{ background: surface, borderTop: `1px solid ${border}`, padding: "20px 24px", display: "flex", gap: 12, zIndex: 10 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, height: 52, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 14, color: ds.textSecondary, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {isRTL ? "إلغاء" : "Cancel"}
          </button>
          <button type="button" disabled={!formData.supplier_name?.trim()} onClick={handleSubmit}
            style={{ flex: 2, height: 52, background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", border: "none", borderRadius: 14, color: "white", fontSize: 15, fontWeight: 700, cursor: formData.supplier_name?.trim() ? "pointer" : "not-allowed", opacity: formData.supplier_name?.trim() ? 1 : 0.6, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(139,92,246,0.3)" }}
          >
            <Check size={20} strokeWidth={2.5} /> {isRTL ? "حفظ البيانات" : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
