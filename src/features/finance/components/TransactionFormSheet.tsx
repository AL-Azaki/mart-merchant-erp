import { useState } from "react";
import { motion } from "motion/react";
import { X, Check, ArrowDownRight, ArrowUpRight, FileText, LayoutList, Users, CreditCard, Hash, Printer } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";

interface TransactionFormSheetProps {
  type: "income" | "expense";
  onClose: () => void;
  onSave: (data: any, print: boolean) => void;
}

export function TransactionFormSheet({ type, onClose, onSave }: TransactionFormSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const toast = useToast();
  const [formData, setFormData] = useState({
    amount: "",
    entity_type: "general", // general, customer, supplier, employee
    entity_name: "", // customer/supplier name
    payment_method: "cash", // cash, bank
    reference: "",
    category: type === "income" ? "sales" : "other_expense",
    description: "",
  });

  const [printAfterSave, setPrintAfterSave] = useState(true);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";
  
  const isIncome = type === "income";
  const primaryColor = isIncome ? "#3B82F6" : "#EF4444";
  const title = isRTL ? (isIncome ? "سند قبض (إيراد)" : "سند صرف (مصروف)") : (isIncome ? "Add Income" : "Add Expense");
  const Icon = isIncome ? ArrowUpRight : ArrowDownRight;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) {
      toast.warning(isRTL ? "يرجى إدخال المبلغ" : "Please enter the amount");
      return;
    }
    if (!formData.category) {
      toast.warning(isRTL ? "يرجى اختيار التصنيف المالي" : "Please select a category");
      return;
    }
    if (!formData.description) {
      toast.warning(isRTL ? "يرجى إدخال البيان / الوصف" : "Please enter a description");
      return;
    }
    onSave({
      amount: parseFloat(formData.amount),
      entity_type: formData.entity_type,
      entity_name: formData.entity_name,
      payment_method: formData.payment_method,
      reference: formData.reference,
      category: formData.category,
      description: formData.description
    }, printAfterSave);
  };

  const renderField = (label: string, IconComponent: any, name: string, children: React.ReactNode) => {
    const isFocused = focusedInput === name;
    return (
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", color: isFocused ? primaryColor : ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8, transition: "color 0.2s" }}>
          {label}
        </label>
        <div style={{ position: "relative" }}>
          {IconComponent && (
            <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 10, background: isFocused ? `${primaryColor}15` : "transparent", transition: "all 0.2s" }}>
              <IconComponent size={18} color={isFocused ? primaryColor : ds.textMuted} />
            </div>
          )}
          {children}
        </div>
      </div>
    );
  };

  const getInputStyle = (name: string) => ({
    width: "100%", boxSizing: "border-box" as const,
    paddingInlineStart: 52, paddingInlineEnd: 16, height: 52,
    background: isDark ? ds.surface2 : "#FFFFFF",
    border: `1.5px solid ${focusedInput === name ? primaryColor : (isDark ? ds.border : "#E2E8F0")}`,
    borderRadius: 12, color: ds.textPrimary, fontSize: 15, fontWeight: 600, outline: "none", fontFamily: "inherit",
    transition: "all 0.2s",
    boxShadow: focusedInput === name ? `0 0 0 4px ${primaryColor}15` : "0 1px 2px rgba(0,0,0,0.02)"
  });

  const getSelectStyle = (name: string) => ({
    ...getInputStyle(name),
    paddingInlineStart: 52,
    appearance: "none" as const,
    cursor: "pointer",
  });

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
        style={{ position: "relative", width: "100%", maxWidth: 650, maxHeight: "90vh", background: bg, borderRadius: 24, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", border: `1px solid ${isDark ? ds.border : "rgba(255,255,255,0.8)"}` }}
      >
        {/* Header */}
        <div style={{ background: surface, padding: "24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: `${primaryColor}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={20} color={primaryColor} strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, marginBottom: 2 }}>{title}</h2>
              <p style={{ color: ds.textSecondary, fontSize: 13 }}>{isRTL ? "قم بإنشاء السند وربطه بالجهة الصحيحة" : "Create voucher and link it to the correct entity"}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: isDark ? ds.surface2 : "#F1F5F9", border: "none", width: 40, height: 40, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = isDark ? ds.border : "#E2E8F0"} onMouseLeave={e => e.currentTarget.style.background = isDark ? ds.surface2 : "#F1F5F9"}>
            <X size={20} color={ds.textPrimary} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          
          <div style={{ background: isDark ? ds.surface : "#F8FAFC", border: `1px solid ${border}`, borderRadius: 16, padding: "20px", marginBottom: 20 }}>
            <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 800, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <CreditCard size={18} color={primaryColor} /> 
              {isRTL ? "تفاصيل المبلغ وطريقة الدفع" : "Amount & Payment Details"}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {renderField(isRTL ? "المبلغ (ر.ي)" : "Amount", Icon, "amount", 
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} onFocus={() => setFocusedInput("amount")} onBlur={() => setFocusedInput(null)} required placeholder="0.00" style={{ ...getInputStyle("amount"), fontSize: 20, fontWeight: 800, direction: "ltr", color: primaryColor }} />
              )}
              {renderField(isRTL ? "طريقة الدفع" : "Payment Method", CreditCard, "payment_method",
                <select name="payment_method" value={formData.payment_method} onChange={handleChange} onFocus={() => setFocusedInput("payment_method")} onBlur={() => setFocusedInput(null)} style={getSelectStyle("payment_method")}>
                  <option value="cash">{isRTL ? "نقداً (صندوق)" : "Cash (Safe)"}</option>
                  <option value="bank">{isRTL ? "تحويل بنكي / شبكة" : "Bank Transfer"}</option>
                </select>
              )}
            </div>
          </div>

          <div style={{ background: isDark ? ds.surface : "#F8FAFC", border: `1px solid ${border}`, borderRadius: 16, padding: "20px", marginBottom: 20 }}>
            <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 800, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={18} color={primaryColor} /> 
              {isRTL ? "ارتباط الجهة والمعلومات" : "Entity & Information"}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {renderField(isRTL ? "نوع الجهة" : "Entity Type", Users, "entity_type",
                <select name="entity_type" value={formData.entity_type} onChange={handleChange} onFocus={() => setFocusedInput("entity_type")} onBlur={() => setFocusedInput(null)} style={getSelectStyle("entity_type")}>
                  <option value="general">{isRTL ? "عام (بدون ربط)" : "General (Unlinked)"}</option>
                  <option value="customer">{isRTL ? "عميل" : "Customer"}</option>
                  <option value="supplier">{isRTL ? "مورد" : "Supplier"}</option>
                  <option value="employee">{isRTL ? "موظف" : "Employee"}</option>
                </select>
              )}
              
              {renderField(isRTL ? "اسم الجهة" : "Entity Name", Users, "entity_name",
                 <input name="entity_name" value={formData.entity_name} onChange={handleChange} onFocus={() => setFocusedInput("entity_name")} onBlur={() => setFocusedInput(null)} placeholder={isRTL ? "الاسم..." : "Name..."} style={{...getInputStyle("entity_name"), opacity: formData.entity_type === "general" ? 0.6 : 1}} disabled={formData.entity_type === "general"} />
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
              {renderField(isRTL ? "رقم المرجع (اختياري)" : "Ref No", Hash, "reference",
                 <input name="reference" value={formData.reference} onChange={handleChange} onFocus={() => setFocusedInput("reference")} onBlur={() => setFocusedInput(null)} placeholder={isRTL ? "رقم السند/الفاتورة..." : "Invoice No..."} style={getInputStyle("reference")} />
              )}

              {renderField(isRTL ? "التصنيف المالي" : "Category", LayoutList, "category",
                 <select name="category" value={formData.category} onChange={handleChange} onFocus={() => setFocusedInput("category")} onBlur={() => setFocusedInput(null)} required style={getSelectStyle("category")}>
                   <option value="" disabled>{isRTL ? "اختر التصنيف..." : "Select Category..."}</option>
                   {isIncome ? (
                     <>
                       <option value="sales">{isRTL ? "إيرادات مبيعات" : "Sales Revenue"}</option>
                       <option value="services">{isRTL ? "إيرادات خدمات" : "Service Revenue"}</option>
                       <option value="investments">{isRTL ? "عوائد استثمار" : "Investment Returns"}</option>
                       <option value="other_income">{isRTL ? "إيرادات أخرى" : "Other Income"}</option>
                     </>
                   ) : (
                     <>
                       <option value="salaries">{isRTL ? "رواتب وأجور" : "Salaries & Wages"}</option>
                       <option value="rent">{isRTL ? "إيجارات" : "Rent"}</option>
                       <option value="utilities">{isRTL ? "فواتير خدمات (كهرباء، ماء)" : "Utilities"}</option>
                       <option value="marketing">{isRTL ? "تسويق وإعلان" : "Marketing & Ads"}</option>
                       <option value="maintenance">{isRTL ? "صيانة وإصلاح" : "Maintenance"}</option>
                       <option value="office_supplies">{isRTL ? "مستلزمات مكتبية" : "Office Supplies"}</option>
                       <option value="other_expense">{isRTL ? "مصروفات أخرى" : "Other Expense"}</option>
                     </>
                   )}
                 </select>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              {renderField(isRTL ? "البيان / الوصف" : "Description", FileText, "description",
                <textarea name="description" value={formData.description} onChange={handleChange} onFocus={() => setFocusedInput("description")} onBlur={() => setFocusedInput(null)} required rows={2} placeholder={isRTL ? "اكتب تفاصيل المعاملة هنا..." : "Write transaction details here..."} style={{ ...getInputStyle("description"), padding: "16px 16px 16px 52px", height: "auto", resize: "none" }} />
              )}
            </div>
          </div>

        </form>

        <div style={{ background: surface, borderTop: `1px solid ${border}`, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, zIndex: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
            <input type="checkbox" checked={printAfterSave} onChange={(e) => setPrintAfterSave(e.target.checked)} style={{ width: 18, height: 18, accentColor: primaryColor, cursor: "pointer" }} />
            <Printer size={18} color={ds.textSecondary} />
            {isRTL ? "طباعة السند بعد الحفظ" : "Print voucher after saving"}
          </label>

          <div style={{ display: "flex", gap: 12, flex: 1, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "0 24px", height: 52, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 14, color: ds.textSecondary, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={handleSubmit}
              style={{ padding: "0 32px", height: 52, background: primaryColor, border: "none", borderRadius: 14, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 6px 20px ${primaryColor}40` }}
            >
              <Check size={20} strokeWidth={2.5} /> {isRTL ? "حفظ السند" : "Save"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
