import { useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { X, Check, User, Phone, MapPin, CreditCard } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import type { Customer } from "@/core/types/sales";

interface ContactFormSheetProps {
  contact?: Customer | null;
  role: "customer";
  onClose: () => void;
  onSave: (data: Partial<Customer>) => void;
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

export function ContactFormSheet({ contact, role, onClose, onSave }: ContactFormSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const [formData, setFormData] = useState({
    customer_name: contact?.customer_name || "",
    phone: contact?.phone || "",
    address: contact?.address || "",
    credit_limit: contact?.credit_limit?.toString() || "",
    opening_balance: contact?.opening_balance?.toString() || "",
    opening_balance_type: contact?.opening_balance_type || "debit",
    opening_balance_date: contact?.opening_balance_date || new Date().toISOString().split("T")[0],
    opening_balance_notes: contact?.opening_balance_notes || "",
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
    onSave({
      ...formData,
      credit_limit: parseFloat(formData.credit_limit) || 0,
      opening_balance: parseFloat(formData.opening_balance) || 0,
    });
  };

  const [focusedInput, setFocusedInput] = useState<string | null>(null);


  const getInputStyle = (name: string) => ({
    width: "100%", boxSizing: "border-box" as const,
    paddingInlineStart: 52, paddingInlineEnd: 16, height: 56,
    background: isDark ? ds.surface2 : "#F8FAFC",
    border: `1.5px solid ${focusedInput === name ? "#8B5CF6" : isDark ? ds.border : "#E2E8F0"}`,
    borderRadius: 14, color: ds.textPrimary, fontSize: 16, fontWeight: 700, outline: "none", fontFamily: "inherit",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: focusedInput === name ? "0 4px 12px rgba(139,92,246,0.15)" : "0 2px 4px rgba(0,0,0,0.02)"
  });

  const title = contact 
    ? (isRTL ? "تعديل بيانات العميل" : "Edit Customer")
    : (isRTL ? "إضافة عميل جديد" : "Add New Customer");

  const modalContent = (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
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
            <h2 style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{title}</h2>
            <p style={{ color: ds.textSecondary, fontSize: 14 }}>{isRTL ? "أدخل تفاصيل العميل بدقة" : "Enter customer details accurately"}</p>
          </div>
          <button onClick={onClose} style={{ background: isDark ? ds.surface2 : "#F1F5F9", border: "none", width: 44, height: 44, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = isDark ? ds.border : "#E2E8F0"} onMouseLeave={e => e.currentTarget.style.background = isDark ? ds.surface2 : "#F1F5F9"}>
            <X size={22} color={ds.textPrimary} />
          </button>
        </div>

      <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
        
        {/* Basic Info */}
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
             <User size={18} color="#8B5CF6" />
             {isRTL ? "المعلومات الأساسية" : "Basic Info"}
          </h3>
          
          <InputWrapper label={isRTL ? "اسم العميل *" : "Customer Name *"} icon={User} isFocused={focusedInput === "customer_name"} isRTL={isRTL} ds={ds}>
            <input name="customer_name" value={formData.customer_name} onChange={handleChange} onFocus={() => setFocusedInput("customer_name")} onBlur={() => setFocusedInput(null)} required style={getInputStyle("customer_name")} placeholder={isRTL ? "الاسم الكامل" : "Full Name"} />
          </InputWrapper>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <InputWrapper label={isRTL ? "رقم الهاتف" : "Phone Number"} icon={Phone} isFocused={focusedInput === "phone"} isRTL={isRTL} ds={ds}>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} onFocus={() => setFocusedInput("phone")} onBlur={() => setFocusedInput(null)} style={{ ...getInputStyle("phone"), direction: "ltr" }} placeholder="+967..." />
            </InputWrapper>
          
            <InputWrapper label={isRTL ? "العنوان" : "Address"} icon={MapPin} isFocused={focusedInput === "address"} isRTL={isRTL} ds={ds}>
              <input name="address" value={formData.address} onChange={handleChange} onFocus={() => setFocusedInput("address")} onBlur={() => setFocusedInput(null)} style={getInputStyle("address")} placeholder={isRTL ? "المدينة، الشارع" : "City, Street"} />
            </InputWrapper>
          </div>
        </div>

        {/* Financial Info */}
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <CreditCard size={18} color="#10B981" /> {isRTL ? "المعلومات المالية" : "Financial Info"}
          </h3>

          <InputWrapper label={isRTL ? "الحد الائتماني" : "Credit Limit"} icon={CreditCard} isFocused={focusedInput === "credit_limit"} isRTL={isRTL} ds={ds}>
            <input type="number" name="credit_limit" value={formData.credit_limit} onChange={handleChange} onFocus={() => setFocusedInput("credit_limit")} onBlur={() => setFocusedInput(null)} style={getInputStyle("credit_limit")} placeholder="0.00" />
          </InputWrapper>

          {/* Opening Balance Section */}
          <div style={{ borderTop: `1px solid ${isDark ? ds.border : "#F1F5F9"}`, paddingTop: 16, marginTop: 16 }}>
            <h4 style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
              {isRTL ? "الرصيد الافتتاحي (أول المدة)" : "Opening Balance"}
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <InputWrapper label={isRTL ? "مبلغ الرصيد الافتتاحي" : "Opening Balance Amount"} isFocused={focusedInput === "opening_balance"} isRTL={isRTL} ds={ds}>
                <input type="number" name="opening_balance" value={formData.opening_balance} onChange={handleChange} onFocus={() => setFocusedInput("opening_balance")} onBlur={() => setFocusedInput(null)} style={{ ...getInputStyle("opening_balance"), paddingInlineStart: 16 }} placeholder="0.00" />
              </InputWrapper>

              <InputWrapper label={isRTL ? "نوع الرصيد" : "Balance Type"} isFocused={focusedInput === "opening_balance_type"} isRTL={isRTL} ds={ds}>
                <select name="opening_balance_type" value={formData.opening_balance_type} onChange={handleChange} onFocus={() => setFocusedInput("opening_balance_type")} onBlur={() => setFocusedInput(null)} style={{ ...getInputStyle("opening_balance_type"), paddingInlineStart: 16 }}>
                  <option value="debit">{isRTL ? "مدين (لنا)" : "Debit (Receivable)"}</option>
                  <option value="credit">{isRTL ? "دائن (علينا)" : "Credit (Payable)"}</option>
                </select>
              </InputWrapper>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
              <InputWrapper label={isRTL ? "تاريخ إدخال الرصيد الافتتاحي" : "Opening Balance Date"} isFocused={focusedInput === "opening_balance_date"} isRTL={isRTL} ds={ds}>
                <input type="date" name="opening_balance_date" value={formData.opening_balance_date} onChange={handleChange} onFocus={() => setFocusedInput("opening_balance_date")} onBlur={() => setFocusedInput(null)} style={{ ...getInputStyle("opening_balance_date"), paddingInlineStart: 16 }} />
              </InputWrapper>
            </div>

            <div style={{ marginTop: 12 }}>
              <InputWrapper label={isRTL ? "البيان / تفاصيل الرصيد (اختياري)" : "Statement / Narration (Optional)"} isFocused={focusedInput === "opening_balance_notes"} isRTL={isRTL} ds={ds}>
                <input name="opening_balance_notes" value={formData.opening_balance_notes} onChange={handleChange} onFocus={() => setFocusedInput("opening_balance_notes")} onBlur={() => setFocusedInput(null)} style={{ ...getInputStyle("opening_balance_notes"), paddingInlineStart: 16 }} placeholder={isRTL ? "مثال: رصيد مرحل من الدفاتر السابقة" : "e.g. Balance carried forward"} />
              </InputWrapper>
            </div>
          </div>
        </div>
      </form>

      <div style={{ background: surface, borderTop: `1px solid ${border}`, padding: "20px 24px", display: "flex", gap: 16, zIndex: 10 }}>
        <button type="button" onClick={onClose} style={{ flex: 1, height: 60, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 14, color: ds.textSecondary, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
          {isRTL ? "إلغاء" : "Cancel"}
        </button>
        <button type="button" disabled={!formData.customer_name?.trim()} onClick={handleSubmit}
          style={{ flex: 2, height: 60, background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", border: "none", borderRadius: 14, color: "white", fontSize: 16, fontWeight: 800, cursor: formData.customer_name?.trim() ? "pointer" : "not-allowed", opacity: formData.customer_name?.trim() ? 1 : 0.6, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 6px 20px rgba(139,92,246,0.3)" }}
        >
          <Check size={24} strokeWidth={2.5} /> {isRTL ? "حفظ البيانات" : "Save"}
        </button>
      </div>
    </motion.div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
}
