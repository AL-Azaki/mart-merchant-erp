import { motion } from "motion/react";
import { X, Printer, Share2, FileText, CheckCircle, Clock } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_CHART_OF_ACCOUNTS } from "@/core/data/financeMockData";

interface JournalEntryDetailsSheetProps {
  entry: any;
  lines: any[];
  onClose: () => void;
}

export function JournalEntryDetailsSheet({ entry, lines, onClose }: JournalEntryDetailsSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const entryLines = lines.filter(l => l.journal_entry_id === entry.id);
  const totalDebit = entryLines.reduce((sum, l) => sum + (l.base_debit_amount || l.debit_amount || 0), 0);
  const totalCredit = entryLines.reduce((sum, l) => sum + (l.base_credit_amount || l.credit_amount || 0), 0);
  const isBalanced = totalDebit === totalCredit;

  const handlePrint = () => {
    window.print();
  };

  const getAccountName = (accId: string) => {
    const acc = MOCK_CHART_OF_ACCOUNTS.find(a => a.id === accId);
    return acc ? acc.account_name : accId;
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
        style={{ position: "relative", width: "100%", maxWidth: 650, maxHeight: "90vh", background: bg, borderRadius: 24, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", border: `1px solid ${isDark ? ds.border : "rgba(255,255,255,0.8)"}` }}
      >
        {/* Header */}
        <div style={{ background: surface, padding: "24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={20} color="#10B981" strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{ direction: "ltr", color: ds.textPrimary, fontSize: 18, fontWeight: 800, marginBottom: 2 }}>{entry.journal_number}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: ds.textSecondary, fontSize: 13 }}>{new Date(entry.journal_date || entry.date).toLocaleDateString()}</span>
                {entry.status === "Posted" ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "2px 6px", borderRadius: 6 }}>
                    <CheckCircle size={12} /> {isRTL ? "مُرحّل" : "Posted"}
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#F59E0B", background: "rgba(245,158,11,0.1)", padding: "2px 6px", borderRadius: 6 }}>
                    <Clock size={12} /> {isRTL ? "مسودة" : "Draft"}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: isDark ? ds.surface2 : "#F1F5F9", border: "none", width: 40, height: 40, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }}>
            <X size={20} color={ds.textPrimary} />
          </button>
        </div>

        {/* Content printable area */}
        <div id="journal-print-area" style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
          
          <div style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: 16 }}>
            <div style={{ fontSize: 12, color: ds.textMuted, marginBottom: 8 }}>{isRTL ? "البيان العام للقيد" : "General Description"}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: ds.textPrimary, lineHeight: 1.6 }}>
              {entry.notes || (isRTL ? "لا يوجد بيان" : "No description")}
            </div>
          </div>

          <div style={{ border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", background: surface }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${border}`, padding: "12px 16px", fontSize: 13, fontWeight: 700, color: ds.textSecondary }}>
              <div>{isRTL ? "الحساب / البيان" : "Account / Desc"}</div>
              <div style={{ textAlign: isRTL ? "left" : "right" }}>{isRTL ? "مدين (Debit)" : "Debit"}</div>
              <div style={{ textAlign: isRTL ? "left" : "right" }}>{isRTL ? "دائن (Credit)" : "Credit"}</div>
            </div>
            
            {entryLines.map((line: any, idx: number) => (
              <div key={line.id || idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", borderBottom: idx === entryLines.length - 1 ? "none" : `1px solid ${border}`, padding: "16px", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: ds.textPrimary, marginBottom: 4 }}>{getAccountName(line.account_id)}</div>
                  <div style={{ fontSize: 12, color: ds.textMuted }}>{line.description || "---"}</div>
                </div>
                <div style={{ textAlign: isRTL ? "left" : "right", fontSize: 15, fontWeight: 800, color: (line.base_debit_amount || line.debit_amount) > 0 ? "#10B981" : ds.textMuted }}>
                  {(line.base_debit_amount || line.debit_amount) ? (line.base_debit_amount || line.debit_amount).toLocaleString() : "0"}
                </div>
                <div style={{ textAlign: isRTL ? "left" : "right", fontSize: 15, fontWeight: 800, color: (line.base_credit_amount || line.credit_amount) > 0 ? "#EF4444" : ds.textMuted }}>
                  {(line.base_credit_amount || line.credit_amount) ? (line.base_credit_amount || line.credit_amount).toLocaleString() : "0"}
                </div>
              </div>
            ))}
            
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", background: isDark ? ds.surface2 : "#F8FAFC", borderTop: `2px solid ${border}`, padding: "16px", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: ds.textPrimary }}>{isRTL ? "الإجمالي:" : "Total:"}</div>
              <div style={{ textAlign: isRTL ? "left" : "right", fontSize: 16, fontWeight: 900, color: ds.textPrimary }}>
                {totalDebit.toLocaleString()}
              </div>
              <div style={{ textAlign: isRTL ? "left" : "right", fontSize: 16, fontWeight: 900, color: ds.textPrimary }}>
                {totalCredit.toLocaleString()}
              </div>
            </div>
          </div>

          {!isBalanced && (
            <div style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 700, textAlign: "center" }}>
              {isRTL ? "⚠️ تنبيه: القيد غير متوازن" : "⚠️ Warning: Entry is not balanced"}
            </div>
          )}
          
        </div>

        {/* Footer Actions */}
        <div style={{ background: surface, borderTop: `1px solid ${border}`, padding: "20px 24px", display: "flex", alignItems: "center", gap: 12, zIndex: 10 }}>
          <button onClick={handlePrint} style={{ flex: 1, height: 48, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", fontFamily: "inherit" }}>
            <Printer size={18} /> {isRTL ? "طباعة القيد" : "Print Entry"}
          </button>
          <button style={{ flex: 1, height: 48, background: "rgba(59,130,246,0.1)", border: "none", borderRadius: 12, color: "#3B82F6", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", fontFamily: "inherit" }}>
            <Share2 size={18} /> {isRTL ? "مشاركة" : "Share"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
