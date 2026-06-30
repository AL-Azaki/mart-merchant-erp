import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, FileText, CheckCircle, Clock, Download } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_JOURNAL_ENTRIES, MOCK_JOURNAL_LINES } from "@/core/data/financeMockData";
import { JournalEntryFormSheet } from "../components/JournalEntryFormSheet";
import { JournalEntryDetailsSheet } from "../components/JournalEntryDetailsSheet";
import { exportToExcel } from "@/core/utils/exportUtils";
import type { JournalEntry } from "@/core/types/finance";

export function JournalEntriesScreen({ 
  entries = MOCK_JOURNAL_ENTRIES, 
  lines = MOCK_JOURNAL_LINES, 
  setEntries, 
  setLines 
}: { 
  entries?: JournalEntry[]; 
  lines?: any[]; 
  setEntries?: any; 
  setLines?: any; 
}) {
  const { t, isDark, isRTL, ds } = useApp();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const entriesWithDetails = entries.map(e => {
    const entryLines = lines.filter(l => l.journal_entry_id === e.id);
    const total_debit = entryLines.reduce((acc, curr) => acc + (curr.debit_amount || 0), 0);
    return { ...e, total_debit, linesCount: entryLines.length };
  });

  const filteredEntries = entriesWithDetails.filter(e => {
    if (!search) return true;
    return e.journal_number.toLowerCase().includes(search.toLowerCase()) || (e.notes && e.notes.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      <div style={{ padding: "20px 24px", background: surface, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, margin: "0 0 4px 0" }}>{isRTL ? "القيود اليومية" : "Journal Entries"}</h2>
          <p style={{ color: ds.textSecondary, fontSize: 13, margin: 0 }}>{isRTL ? "إدارة ومراجعة القيود المحاسبية" : "Manage and review accounting entries"}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button title={isRTL ? "تصدير إلى إكسل" : "Export to Excel"} 
            onClick={() => {
              const exportMap = isRTL ? {
                journal_number: "رقم القيد",
                journal_date: "تاريخ القيد",
                notes: "البيان",
                total_debit: "إجمالي القيد",
                status: "الحالة",
                linesCount: "عدد الأسطر"
              } : undefined;
              
              const formattedData = filteredEntries.map(e => ({
                journal_number: e.journal_number,
                journal_date: new Date(e.journal_date || e.date || Date.now()).toLocaleDateString(),
                notes: e.notes || "",
                total_debit: e.total_debit,
                status: e.status === "Posted" ? (isRTL ? "مُرحّل" : "Posted") : (isRTL ? "مسودة" : "Draft"),
                linesCount: e.linesCount
              }));
              exportToExcel(formattedData, "Journal_Entries", exportMap);
            }}
            style={{ height: 44, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 12, padding: "0 16px", color: ds.textPrimary, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit" }}>
            <Download size={18} strokeWidth={2.5} />
            {isRTL ? "تصدير" : "Export"}
          </button>
          <button title={isRTL ? "إنشاء قيد يومية جديد" : "Create New Journal Entry"} onClick={() => setShowForm(true)} style={{ height: 44, background: "linear-gradient(135deg, #10B981, #059669)", border: "none", borderRadius: 12, padding: "0 16px", color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <Plus size={18} strokeWidth={2.5} />
            {isRTL ? "إضافة قيد" : "Add Entry"}
          </button>
        </div>
      </div>

      <div style={{ padding: "16px 24px", background: surface, borderBottom: `1px solid ${border}` }}>
        <div style={{ position: "relative" }}>
          <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14 }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? "ابحث برقم القيد، الملاحظات..." : "Search entry number, notes..."}
            style={{ width: "100%", height: 46, paddingInlineStart: 44, paddingInlineEnd: 16, background: isDark ? ds.surface2 : "#F8FAFC", border: `1px solid ${border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit" }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredEntries.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedEntry(entry)}
              style={{ cursor: "pointer", background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: isDark ? ds.surface2 : "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText size={24} color="#10B981" />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: ds.textPrimary }}>
                      <span style={{ direction: "ltr", display: "inline-block" }}>{entry.journal_number}</span>
                    </h3>
                    {entry.status === "Posted" ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 8 }}>
                        <CheckCircle size={12} /> {isRTL ? "مُرحّل" : "Posted"}
                      </span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#F59E0B", background: "rgba(245,158,11,0.1)", padding: "2px 8px", borderRadius: 8 }}>
                        <Clock size={12} /> {isRTL ? "مسودة" : "Draft"}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: ds.textSecondary, fontWeight: 600 }}>
                    <span style={{ direction: "ltr", display: "inline-block" }}>{new Date(entry.journal_date || entry.date || Date.now()).toLocaleDateString()}</span> • {entry.notes || (isRTL ? "بدون ملاحظات" : "No notes")}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: isRTL ? "left" : "right" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: ds.textPrimary, marginBottom: 4 }}>
                  {entry.total_debit.toLocaleString()} <span style={{ fontSize: 12, color: ds.textSecondary }}>{isRTL ? "ر.ي" : "YER"}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: ds.textSecondary }}>
                  {isRTL ? "متوازن" : "Balanced"} ({entry.linesCount} {isRTL ? "أسطر" : "lines"})
                </div>
              </div>
            </motion.div>
          ))}
          {filteredEntries.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: ds.textMuted, fontSize: 14, fontWeight: 500 }}>
              {isRTL ? "لا توجد قيود يومية مطابقة" : "No journal entries found"}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <JournalEntryFormSheet 
            key="form"
            onClose={() => setShowForm(false)}
            onSave={(entryData, lines) => {
              const newEntry: JournalEntry = {
                id: `je_${Date.now()}`, business_id: "biz_001", fiscal_year_id: "fy_2024", fiscal_period_id: "fp_2024_06",
                journal_number: `JE-2024-${Math.floor(Math.random() * 10000)}`,
                journal_date: new Date().toISOString().split("T")[0],
                reference_type: null, reference_id: null,
                status: "Draft",
                notes: entryData.description,
                created_by: "usr_001",
                created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
                ...(entryData as any)
              };
              setEntries(prev => [newEntry, ...prev]);
              setShowForm(false);
            }} 
          />
        )}
        
        {selectedEntry && (
          <JournalEntryDetailsSheet 
            key="details"
            entry={selectedEntry} 
            lines={lines || []}
            onClose={() => setSelectedEntry(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
