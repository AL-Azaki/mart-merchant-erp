import { useState } from "react";
import { motion } from "motion/react";
import { X, Check, ArrowDownRight, ArrowUpRight, FileText, LayoutList, Users, CreditCard, Hash, Printer } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";
import { MOCK_CURRENCIES } from "@/core/data/financeMockData";
import { SmartEntitySearch } from "./SmartEntitySearch";
import { ContactFormSheet } from "@/features/crm/components/ContactFormSheet";
import { useFinancialStore } from "@/core/engine/useFinancialStore";

interface TransactionFormSheetProps {
  initialType?: "income" | "expense";
  onClose: () => void;
  onSave: (data: any, print: boolean) => void;
  initialEntity?: {
    type: "customer" | "supplier" | "employee" | "general";
    name: string;
  };
  initialCategory?: string;
}

export function TransactionFormSheet({ initialType = "income", initialEntity, initialCategory, onClose, onSave }: TransactionFormSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const toast = useToast();
  const store = useFinancialStore();
  const [currentType, setCurrentType] = useState<"income" | "expense">(initialType);
  const [showContactForm, setShowContactForm] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    entity_type: initialEntity?.type || "general",
    entity_id: "",
    entity_name: initialEntity?.name || "",
    payment_method: "cash",
    reference: "",
    category: initialCategory || (currentType === "income" ? "sales" : "other_expense"),
    description: "",
  });
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  const defaultCurrency = MOCK_CURRENCIES.find(c => c.is_base_currency) || MOCK_CURRENCIES[0];
  const [currencyId, setCurrencyId] = useState<string>(defaultCurrency?.id || "");
  const [exchangeRate, setExchangeRate] = useState<number>(defaultCurrency?.exchange_rate || 1);
  const currencyObj = MOCK_CURRENCIES.find(c => c.id === currencyId) || defaultCurrency;
  const currency = currencyObj?.currency_symbol || "YER";

  const [printAfterSave, setPrintAfterSave] = useState(true);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";
  
  const isIncome = currentType === "income";
  const primaryColor = isIncome ? "#3B82F6" : "#EF4444";
  const title = isRTL ? "سند مالي جديد" : "New Financial Voucher";
  const Icon = isIncome ? ArrowUpRight : ArrowDownRight;

  const handleTypeToggle = (newType: "income" | "expense") => {
    setCurrentType(newType);
    setFormData(p => ({ ...p, category: newType === "income" ? "sales" : "other_expense" }));
  };

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
      type: currentType,
      amount: parseFloat(formData.amount),
      currency_id: currencyId,
      exchange_rate: exchangeRate,
      base_amount: parseFloat(formData.amount) * exchangeRate,
      entity_type: formData.entity_type,
      entity_id: formData.entity_id,
      entity_name: formData.entity_name,
      payment_method: formData.payment_method,
      reference: formData.reference,
      category: formData.category,
      description: formData.description,
      selected_invoices: selectedInvoiceIds,
    }, printAfterSave);
  };

  const renderField = (label: string, IconComponent: any, name: string, children: React.ReactNode) => {
    const isFocused = focusedInput === name;
    return (
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", color: isFocused ? primaryColor : ds.textSecondary, fontSize: 15, fontWeight: 800, marginBottom: 12, transition: "color 0.2s" }}>
          {label}
        </label>
        <div style={{ position: "relative" }}>
          {IconComponent && (
            <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: isFocused ? `${primaryColor}15` : "transparent", transition: "all 0.2s" }}>
              <IconComponent size={20} color={isFocused ? primaryColor : ds.textMuted} />
            </div>
          )}
          {children}
        </div>
      </div>
    );
  };

  const getInputStyle = (name: string) => ({
    width: "100%", boxSizing: "border-box" as const,
    paddingInlineStart: 56, paddingInlineEnd: 16, height: 60,
    background: isDark ? ds.surface2 : "#FFFFFF",
    border: `1.5px solid ${focusedInput === name ? primaryColor : (isDark ? ds.border : "#E2E8F0")}`,
    borderRadius: 14, color: ds.textPrimary, fontSize: 16, fontWeight: 700, outline: "none", fontFamily: "inherit",
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
        <div style={{ background: surface, padding: "24px", borderBottom: `1px solid ${border}`, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: isDark ? ds.surface2 : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={20} color={ds.textPrimary} strokeWidth={2.5} />
              </div>
              <div>
                <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, marginBottom: 2 }}>{title}</h2>
                <p style={{ color: ds.textSecondary, fontSize: 13 }}>{isRTL ? "حدد نوع السند (قبض / صرف) وأدخل التفاصيل" : "Select voucher type and enter details"}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: isDark ? ds.surface2 : "#F1F5F9", border: "none", width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = isDark ? ds.border : "#E2E8F0"} onMouseLeave={e => e.currentTarget.style.background = isDark ? ds.surface2 : "#F1F5F9"}>
              <X size={24} color={ds.textPrimary} />
            </button>
          </div>

          {/* Toggle Switch */}
          <div style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderRadius: 12, padding: 4, display: "flex", position: "relative" }}>
            <div style={{ position: "absolute", top: 4, bottom: 4, [isRTL ? "right" : "left"]: currentType === "income" ? 4 : "50%", width: "calc(50% - 4px)", background: surface, borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", border: `1px solid ${border}` }} />
            
            <button type="button" onClick={() => handleTypeToggle("income")} style={{ flex: 1, height: 56, background: "transparent", border: "none", borderRadius: 12, position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", color: currentType === "income" ? "#3B82F6" : ds.textSecondary, fontWeight: currentType === "income" ? 800 : 700, fontSize: 15, transition: "color 0.2s" }}>
              <ArrowUpRight size={22} strokeWidth={2.5} /> {isRTL ? "سند قبض (دخول)" : "Receipt (Income)"}
            </button>
            <button type="button" onClick={() => handleTypeToggle("expense")} style={{ flex: 1, height: 56, background: "transparent", border: "none", borderRadius: 12, position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", color: currentType === "expense" ? "#EF4444" : ds.textSecondary, fontWeight: currentType === "expense" ? 800 : 700, fontSize: 15, transition: "color 0.2s" }}>
              <ArrowDownRight size={22} strokeWidth={2.5} /> {isRTL ? "سند صرف (خروج)" : "Payment (Expense)"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          
          <div style={{ background: isDark ? ds.surface : "#F8FAFC", border: `1px solid ${border}`, borderRadius: 16, padding: "20px", marginBottom: 20 }}>
            <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 800, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <CreditCard size={18} color={primaryColor} /> 
              {isRTL ? "تفاصيل المبلغ وطريقة الدفع" : "Amount & Payment Details"}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", color: focusedInput === "amount" ? primaryColor : ds.textSecondary, fontSize: 15, fontWeight: 800, marginBottom: 12, transition: "color 0.2s" }}>
                  {isRTL ? "المبلغ" : "Amount"}
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: focusedInput === "amount" ? `${primaryColor}15` : "transparent", transition: "all 0.2s" }}>
                      <Icon size={20} color={focusedInput === "amount" ? primaryColor : ds.textMuted} />
                    </div>
                    <input type="number" name="amount" value={formData.amount} onChange={handleChange} onFocus={() => setFocusedInput("amount")} onBlur={() => setFocusedInput(null)} required placeholder="0.00" style={{ ...getInputStyle("amount"), fontSize: 24, fontWeight: 900, direction: "ltr", color: primaryColor }} />
                  </div>
                  
                  <select value={currencyId} onChange={(e) => {
                    const cur = MOCK_CURRENCIES.find(c => c.id === e.target.value);
                    if (cur) {
                      setCurrencyId(cur.id);
                      setExchangeRate(cur.exchange_rate);
                    }
                  }} style={{ ...getInputStyle("currency"), width: 100, paddingInlineStart: 12, paddingInlineEnd: 12, appearance: "none", textAlign: "center" }}>
                    {MOCK_CURRENCIES.map(c => <option key={c.id} value={c.id}>{c.currency_code}</option>)}
                  </select>
                </div>
                {currencyObj && !currencyObj.is_base_currency && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <span style={{ color: ds.textSecondary, fontSize: 12 }}>{isRTL ? "سعر الصرف:" : "Rate:"}</span>
                    <input type="number" value={exchangeRate} onChange={e => setExchangeRate(Number(e.target.value) || 1)} style={{ width: 60, height: 28, background: isDark ? ds.surface2 : "#F8FAFC", border: `1px solid ${ds.border}`, borderRadius: 6, color: ds.textPrimary, fontSize: 12, fontWeight: 700, outline: "none", textAlign: "center" }} />
                    <span style={{ color: ds.textSecondary, fontSize: 12 }}>
                      {isRTL ? `المعادل: ${(parseFloat(formData.amount || "0") * exchangeRate).toLocaleString()} ${defaultCurrency.currency_symbol} (سعر الصرف: ${exchangeRate})` : `Eqv: ${(parseFloat(formData.amount || "0") * exchangeRate).toLocaleString()} ${defaultCurrency.currency_symbol} (Rate: ${exchangeRate})`}
                    </span>
                  </div>
                )}
              </div>

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
              
              {renderField(isRTL ? "الجهة المختارة" : "Selected Entity", null, "entity_name",
                 <SmartEntitySearch 
                   entityType={formData.entity_type as any} 
                   value={formData.entity_id || formData.entity_name} 
                   onChange={(id, name) => setFormData(p => ({ ...p, entity_id: id, entity_name: name }))}
                   onSelectInvoices={setSelectedInvoiceIds}
                   onAddNew={() => setShowContactForm(true)}
                 />
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
                <textarea name="description" value={formData.description} onChange={handleChange} onFocus={() => setFocusedInput("description")} onBlur={() => setFocusedInput(null)} required rows={2} placeholder={isRTL ? "اكتب تفاصيل المعاملة هنا..." : "Write transaction details here..."} style={{ ...getInputStyle("description"), padding: "20px 16px 20px 56px", height: "auto", resize: "none" }} />
              )}
            </div>
          </div>

        </form>

        <div style={{ background: surface, borderTop: `1px solid ${border}`, padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, zIndex: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", color: ds.textPrimary, fontSize: 16, fontWeight: 800 }}>
            <input type="checkbox" checked={printAfterSave} onChange={(e) => setPrintAfterSave(e.target.checked)} style={{ width: 24, height: 24, accentColor: primaryColor, cursor: "pointer" }} />
            <Printer size={22} color={ds.textSecondary} />
            {isRTL ? "طباعة السند بعد الحفظ" : "Print voucher after saving"}
          </label>

          <div style={{ display: "flex", gap: 16, flex: 1, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "0 28px", height: 60, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 14, color: ds.textSecondary, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={handleSubmit}
              style={{ padding: "0 40px", height: 60, background: primaryColor, border: "none", borderRadius: 14, color: "white", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: `0 6px 20px ${primaryColor}40` }}
            >
              <Check size={24} strokeWidth={2.5} /> {isRTL ? "حفظ السند" : "Save"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {showContactForm && (
        <ContactFormSheet
          role={formData.entity_type as any}
          onClose={() => setShowContactForm(false)}
          onSave={(contact) => {
            const id = `${formData.entity_type}_${Date.now()}`;
            const newEntity = {
              ...contact,
              id,
              [`${formData.entity_type}_name`]: contact.customer_name || contact.supplier_name || contact.employee_name,
            };
            
            if (formData.entity_type === "customer") store.addCustomer(newEntity as any);
            else if (formData.entity_type === "supplier") store.addSupplier(newEntity as any);
            
            setFormData(p => ({ ...p, entity_id: id, entity_name: newEntity[`${formData.entity_type}_name`] }));
            setShowContactForm(false);
          }}
        />
      )}
    </div>
  );
}
