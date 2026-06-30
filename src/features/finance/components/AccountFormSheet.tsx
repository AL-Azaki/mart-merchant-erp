import { useState } from "react";
import { motion } from "motion/react";
import { X, Check, Network } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";
import type { ChartOfAccount } from "@/core/types/finance";
import { MOCK_CHART_OF_ACCOUNTS } from "@/core/data/financeMockData";

interface AccountFormSheetProps {
  account: ChartOfAccount | null;
  onClose: () => void;
  onSave: (data: Partial<ChartOfAccount>) => void;
}

export function AccountFormSheet({ account, onClose, onSave }: AccountFormSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    account_name: account?.account_name || "",
    account_code: account?.account_code || "",
    account_type: account?.account_type || "Asset",
    parent_account_id: account?.parent_account_id || "",
    allow_posting: account ? account.allow_posting : true,
    normal_balance: account?.normal_balance || "Debit",
  });

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.account_name || !formData.account_code) {
      toast.warning(isRTL ? "يرجى تعبئة الحقول الإلزامية" : "Please fill required fields");
      return;
    }

    onSave({
      account_name: formData.account_name,
      account_code: formData.account_code,
      account_type: formData.account_type as any,
      parent_account_id: formData.parent_account_id || null,
      allow_posting: formData.allow_posting,
      normal_balance: formData.normal_balance as any,
    });
  };

  const getInputStyle = () => ({
    width: "100%", height: 48, padding: "0 16px",
    background: isDark ? ds.surface2 : "#FFFFFF",
    border: `1px solid ${border}`, borderRadius: 12,
    color: ds.textPrimary, fontSize: 14, fontWeight: 500,
    outline: "none", fontFamily: "inherit"
  });

  const parentAccounts = MOCK_CHART_OF_ACCOUNTS.filter(a => !a.allow_posting);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }} />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ position: "relative", width: "100%", maxWidth: 500, maxHeight: "90vh", display: "flex", flexDirection: "column", background: bg, borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
        
        {/* Header */}
        <div style={{ background: surface, padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Network size={20} color="#3B82F6" />
            </div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>
              {account ? (isRTL ? "تعديل حساب" : "Edit Account") : (isRTL ? "إضافة حساب جديد" : "Add New Account")}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
            <X size={20} color={ds.textPrimary} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24, overflowY: "auto", flex: 1 }}>
          <div style={{ marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "رمز الحساب *" : "Account Code *"}</label>
              <input value={formData.account_code} onChange={e => setFormData(p => ({ ...p, account_code: e.target.value }))} required style={getInputStyle()} />
            </div>
            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "اسم الحساب *" : "Account Name *"}</label>
              <input value={formData.account_name} onChange={e => setFormData(p => ({ ...p, account_name: e.target.value }))} required style={getInputStyle()} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "الحساب الأب" : "Parent Account"}</label>
            <select value={formData.parent_account_id} onChange={e => setFormData(p => ({ ...p, parent_account_id: e.target.value }))} style={getInputStyle()}>
              <option value="">{isRTL ? "-- لا يوجد (حساب رئيسي) --" : "-- None (Root Account) --"}</option>
              {parentAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.account_code} - {a.account_name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "طبيعة الحساب" : "Account Type"}</label>
              <select value={formData.account_type} onChange={e => setFormData(p => ({ ...p, account_type: e.target.value }))} style={getInputStyle()}>
                <option value="Asset">{isRTL ? "أصول" : "Asset"}</option>
                <option value="Liability">{isRTL ? "خصوم" : "Liability"}</option>
                <option value="Equity">{isRTL ? "حقوق ملكية" : "Equity"}</option>
                <option value="Revenue">{isRTL ? "إيرادات" : "Revenue"}</option>
                <option value="Expense">{isRTL ? "مصروفات" : "Expense"}</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "الرصيد الطبيعي" : "Normal Balance"}</label>
              <select value={formData.normal_balance} onChange={e => setFormData(p => ({ ...p, normal_balance: e.target.value }))} style={getInputStyle()}>
                <option value="Debit">{isRTL ? "مدين" : "Debit"}</option>
                <option value="Credit">{isRTL ? "دائن" : "Credit"}</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 24, background: isDark ? ds.surface2 : "#F8FAFC", padding: 16, borderRadius: 12, border: `1px solid ${border}` }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
              <input type="checkbox" checked={formData.allow_posting} onChange={e => setFormData(p => ({ ...p, allow_posting: e.target.checked }))} style={{ width: 18, height: 18, accentColor: "#3B82F6" }} />
              {isRTL ? "حساب فرعي (يقبل القيود/التسجيل)" : "Leaf Account (Allows Posting)"}
            </label>
            <p style={{ margin: "8px 0 0 26px", fontSize: 12, color: ds.textSecondary }}>
              {isRTL ? "إذا لم تحدده، سيكون حساب تجميعي فقط." : "If unchecked, it will be a group/header account only."}
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, height: 48, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 12, color: ds.textSecondary, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button type="submit" style={{ flex: 1, height: 48, background: "#3B82F6", border: "none", borderRadius: 12, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Check size={18} strokeWidth={2.5} /> {isRTL ? "حفظ" : "Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
