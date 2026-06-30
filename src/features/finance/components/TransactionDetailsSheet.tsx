import { motion } from "motion/react";
import { X, Printer, Share2, FileText, Wallet, Calendar, Hash, User, LayoutList } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

interface TransactionDetailsSheetProps {
  transaction: any;
  onClose: () => void;
}

export function TransactionDetailsSheet({ transaction, onClose }: TransactionDetailsSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const isIncome = transaction.type === "income";
  const primaryColor = isIncome ? "#3B82F6" : "#EF4444";
  const title = isRTL ? (isIncome ? "سند قبض" : "سند صرف") : (isIncome ? "Income Voucher" : "Expense Voucher");

  const getCategoryName = (key: string) => {
    const categories: Record<string, string> = {
      sales: isRTL ? "إيرادات مبيعات" : "Sales Revenue",
      services: isRTL ? "إيرادات خدمات" : "Service Revenue",
      investments: isRTL ? "عوائد استثمار" : "Investment Returns",
      other_income: isRTL ? "إيرادات أخرى" : "Other Income",
      salaries: isRTL ? "رواتب وأجور" : "Salaries & Wages",
      rent: isRTL ? "إيجارات" : "Rent",
      utilities: isRTL ? "فواتير خدمات (كهرباء، ماء)" : "Utilities",
      marketing: isRTL ? "تسويق وإعلان" : "Marketing & Ads",
      maintenance: isRTL ? "صيانة وإصلاح" : "Maintenance",
      office_supplies: isRTL ? "مستلزمات مكتبية" : "Office Supplies",
      other_expense: isRTL ? "مصروفات أخرى" : "Other Expense"
    };
    return categories[key] || key;
  };

  const handlePrint = () => {
    window.print();
  };

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
        style={{ position: "relative", width: "100%", maxWidth: 500, maxHeight: "90vh", background: bg, borderRadius: 24, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", border: `1px solid ${isDark ? ds.border : "rgba(255,255,255,0.8)"}` }}
      >
        {/* Header */}
        <div style={{ background: surface, padding: "24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: `${primaryColor}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={20} color={primaryColor} strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, marginBottom: 2 }}>{title}</h2>
              <p style={{ color: ds.textSecondary, fontSize: 13 }}>{transaction.id}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: isDark ? ds.surface2 : "#F1F5F9", border: "none", width: 40, height: 40, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }}>
            <X size={20} color={ds.textPrimary} />
          </button>
        </div>

        {/* Content printable area */}
        <div id="voucher-print-area" style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
          
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: primaryColor, marginBottom: 8 }}>
              {transaction.amount.toLocaleString()} <span style={{ fontSize: 16 }}>{isRTL ? "ر.ي" : "YER"}</span>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: isDark ? ds.surface2 : "#F8FAFC", padding: "6px 16px", borderRadius: 20, fontSize: 13, color: ds.textSecondary, fontWeight: 600 }}>
              <Calendar size={14} /> {new Date(transaction.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
            </div>
          </div>

          <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: ds.textMuted, marginBottom: 4 }}>{isRTL ? "التصنيف" : "Category"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: ds.textPrimary }}>
                  <LayoutList size={14} color={ds.textSecondary} /> {getCategoryName(transaction.category)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: ds.textMuted, marginBottom: 4 }}>{isRTL ? "رقم المرجع" : "Ref No"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: ds.textPrimary }}>
                  <Hash size={14} color={ds.textSecondary} /> {transaction.reference || "---"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: ds.textMuted, marginBottom: 4 }}>{isRTL ? "نوع الجهة" : "Entity Type"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: ds.textPrimary }}>
                  <User size={14} color={ds.textSecondary} /> 
                  {transaction.entity_type === "customer" ? (isRTL ? "عميل" : "Customer") : 
                   transaction.entity_type === "supplier" ? (isRTL ? "مورد" : "Supplier") : 
                   transaction.entity_type === "employee" ? (isRTL ? "موظف" : "Employee") : 
                   (isRTL ? "عام" : "General")}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: ds.textMuted, marginBottom: 4 }}>{isRTL ? "اسم الجهة" : "Entity Name"}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: ds.textPrimary }}>
                  {transaction.entity_name || "---"}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: 16 }}>
            <div style={{ fontSize: 12, color: ds.textMuted, marginBottom: 8 }}>{isRTL ? "البيان / الوصف" : "Description"}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: ds.textPrimary, lineHeight: 1.6 }}>
              {transaction.description}
            </div>
          </div>
          
        </div>

        {/* Footer Actions */}
        <div style={{ background: surface, borderTop: `1px solid ${border}`, padding: "20px 24px", display: "flex", alignItems: "center", gap: 12, zIndex: 10 }}>
          <button onClick={handlePrint} style={{ flex: 1, height: 48, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", fontFamily: "inherit" }}>
            <Printer size={18} /> {isRTL ? "طباعة السند" : "Print Voucher"}
          </button>
          <button style={{ flex: 1, height: 48, background: "rgba(16,185,129,0.1)", border: "none", borderRadius: 12, color: "#10B981", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", fontFamily: "inherit" }}>
            <Share2 size={18} /> {isRTL ? "مشاركة" : "Share"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
