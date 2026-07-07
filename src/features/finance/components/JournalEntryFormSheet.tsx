import { useState } from "react";
import { motion } from "motion/react";
import { X, Check, FileText, Plus, Trash2 } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";
import { MOCK_CHART_OF_ACCOUNTS } from "@/core/data/financeMockData";
import type { JournalEntry, JournalEntryLine } from "@/core/types/finance";

interface JournalEntryFormSheetProps {
  onClose: () => void;
  onSave: (entryData: Partial<JournalEntry>, lines: Partial<JournalEntryLine>[]) => void;
}

export function JournalEntryFormSheet({ onClose, onSave }: JournalEntryFormSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const toast = useToast();
  
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");
  
  const [lines, setLines] = useState<Array<{ id: number; account_id: string; description: string; debit: number; credit: number }>>([
    { id: 1, account_id: "", description: "", debit: 0, credit: 0 },
    { id: 2, account_id: "", description: "", debit: 0, credit: 0 }
  ]);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const leafAccounts = MOCK_CHART_OF_ACCOUNTS.filter(a => a.allow_posting);

  const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const addLine = () => {
    setLines([...lines, { id: Date.now(), account_id: "", description: "", debit: 0, credit: 0 }]);
  };

  const updateLine = (id: number, field: string, value: any) => {
    setLines(lines.map(l => {
      if (l.id === id) {
        const newLine = { ...l, [field]: value };
        // Clear opposite side if entering value
        if (field === "debit" && Number(value) > 0) newLine.credit = 0;
        if (field === "credit" && Number(value) > 0) newLine.debit = 0;
        return newLine;
      }
      return l;
    }));
  };

  const removeLine = (id: number) => {
    if (lines.length > 2) setLines(lines.filter(l => l.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      toast.warning(isRTL ? "القيد غير متوازن!" : "Entry is not balanced!");
      return;
    }
    if (lines.some(l => !l.account_id)) {
      toast.warning(isRTL ? "يرجى تحديد حساب لكل سطر" : "Please select an account for each line");
      return;
    }

    onSave({
      description,
      entry_date: new Date(date).toISOString(),
      reference_number: reference || null,
      total_debit: totalDebit,
      total_credit: totalCredit,
      status: "Posted"
    }, lines);
  };

  const getInputStyle = () => ({
    width: "100%", height: 60, padding: "0 16px",
    background: isDark ? ds.surface2 : "#FFFFFF",
    border: `1.5px solid ${border}`, borderRadius: 14,
    color: ds.textPrimary, fontSize: 16, fontWeight: 700,
    outline: "none", fontFamily: "inherit"
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }} />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ position: "relative", width: "100%", maxWidth: 800, maxHeight: "90vh", display: "flex", flexDirection: "column", background: bg, borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
        
        {/* Header */}
        <div style={{ background: surface, padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={20} color="#10B981" />
            </div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>
              {isRTL ? "إضافة قيد يومية" : "Add Journal Entry"}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
            <X size={20} color={ds.textPrimary} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ padding: 24, borderBottom: `1px solid ${border}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", color: ds.textSecondary, fontSize: 15, fontWeight: 800, marginBottom: 12 }}>{isRTL ? "البيان / الوصف" : "Description"}</label>
                <input value={description} onChange={e => setDescription(e.target.value)} required style={getInputStyle()} placeholder={isRTL ? "مثال: إثبات فاتورة مشتريات" : "e.g. Record purchase invoice"} />
              </div>
              <div>
                <label style={{ display: "block", color: ds.textSecondary, fontSize: 15, fontWeight: 800, marginBottom: 12 }}>{isRTL ? "التاريخ" : "Date"}</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={getInputStyle()} />
              </div>
              <div>
                <label style={{ display: "block", color: ds.textSecondary, fontSize: 15, fontWeight: 800, marginBottom: 12 }}>{isRTL ? "رقم المرجع" : "Reference"}</label>
                <input value={reference} onChange={e => setReference(e.target.value)} style={getInputStyle()} placeholder="INV-001" />
              </div>
            </div>
          </div>

          <div style={{ padding: "20px 24px", background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${border}`, display: "flex", gap: 16, color: ds.textSecondary, fontSize: 16, fontWeight: 800 }}>
            <div style={{ flex: 2 }}>{isRTL ? "الحساب" : "Account"}</div>
            <div style={{ flex: 2 }}>{isRTL ? "البيان" : "Description"}</div>
            <div style={{ flex: 1, textAlign: "center" }}>{isRTL ? "مدين" : "Debit"}</div>
            <div style={{ flex: 1, textAlign: "center" }}>{isRTL ? "دائن" : "Credit"}</div>
            <div style={{ width: 32 }}></div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            {lines.map((line, idx) => (
              <div key={line.id} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ flex: 2 }}>
                  <select value={line.account_id} onChange={e => updateLine(line.id, "account_id", e.target.value)} required style={getInputStyle()}>
                    <option value="">{isRTL ? "اختر الحساب..." : "Select account..."}</option>
                    {leafAccounts.map(a => (
                      <option key={a.id} value={a.id}>{a.account_code} - {a.account_name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 2 }}>
                  <input value={line.description} onChange={e => updateLine(line.id, "description", e.target.value)} style={getInputStyle()} placeholder={isRTL ? "شرح السطر..." : "Line description..."} />
                </div>
                <div style={{ flex: 1 }}>
                  <input type="number" min="0" value={line.debit || ""} onChange={e => updateLine(line.id, "debit", e.target.value)} style={{ ...getInputStyle(), textAlign: "center", color: line.debit ? "#3B82F6" : ds.textPrimary, fontWeight: line.debit ? 800 : 500 }} placeholder="0" />
                </div>
                <div style={{ flex: 1 }}>
                  <input type="number" min="0" value={line.credit || ""} onChange={e => updateLine(line.id, "credit", e.target.value)} style={{ ...getInputStyle(), textAlign: "center", color: line.credit ? "#EF4444" : ds.textPrimary, fontWeight: line.credit ? 800 : 500 }} placeholder="0" />
                </div>
                <div style={{ width: 32, display: "flex", justifyContent: "center" }}>
                  <button type="button" onClick={() => removeLine(line.id)} disabled={lines.length <= 2} style={{ background: "none", border: "none", cursor: lines.length > 2 ? "pointer" : "not-allowed", opacity: lines.length > 2 ? 1 : 0.3 }}>
                    <Trash2 size={18} color="#EF4444" />
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addLine} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#10B981", display: "flex", alignItems: "center", gap: 12, fontWeight: 800, fontSize: 16, cursor: "pointer", marginTop: 8 }}>
              <Plus size={20} strokeWidth={2.5} /> {isRTL ? "إضافة سطر" : "Add Line"}
            </button>
          </div>

          <div style={{ padding: 24, background: surface, borderTop: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 32 }}>
              <div>
                <span style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>{isRTL ? "إجمالي المدين" : "Total Debit"}</span>
                <span style={{ color: "#3B82F6", fontSize: 20, fontWeight: 800 }}>{totalDebit.toLocaleString()}</span>
              </div>
              <div>
                <span style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>{isRTL ? "إجمالي الدائن" : "Total Credit"}</span>
                <span style={{ color: "#EF4444", fontSize: 20, fontWeight: 800 }}>{totalCredit.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                {isBalanced ? (
                  <span style={{ color: "#10B981", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, background: "rgba(16,185,129,0.1)", padding: "6px 12px", borderRadius: 8 }}><Check size={16} /> {isRTL ? "متوازن" : "Balanced"}</span>
                ) : (
                  <span style={{ color: "#EF4444", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,0.1)", padding: "6px 12px", borderRadius: 8 }}><X size={16} /> {isRTL ? "غير متوازن" : "Unbalanced"} ({Math.abs(totalDebit - totalCredit).toLocaleString()})</span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" onClick={onClose} style={{ height: 60, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 14, padding: "0 24px", color: ds.textSecondary, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button type="submit" disabled={!isBalanced} style={{ height: 60, background: isBalanced ? "#10B981" : ds.border, border: "none", borderRadius: 14, padding: "0 32px", color: "white", fontSize: 16, fontWeight: 800, cursor: isBalanced ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 10, boxShadow: isBalanced ? "0 6px 20px rgba(16,185,129,0.3)" : "none" }}>
                <Check size={20} strokeWidth={2.5} /> {isRTL ? "حفظ وترحيل" : "Post Entry"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
