import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, ArrowRight, Search, User, Users, X, Check,
  ChevronRight, Building2,
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_CUSTOMERS } from "@/core/data/salesMockData";
import type { Customer } from "@/core/types/sales";

interface SelectCustomerSheetProps {
  customers: any[];
  selected: Customer | null;
  onSelect: (c: Customer | null) => void;
  onClose: () => void;
  onAddNew?: () => void;
}

export function SelectCustomerSheet({ customers, selected, onSelect, onClose, onAddNew }: SelectCustomerSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const [search, setSearch] = useState("");
  const BackIcon = X;

  const filtered = useMemo(() =>
    customers.filter((c) =>
      !search || (c.customer_name && c.customer_name.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone ?? "").includes(search)
    ), [search, customers]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        style={{
          position: "relative", width: "100%", maxWidth: 500, maxHeight: "85vh",
          background: isDark ? ds.bg : "#F8FAFC",
          borderRadius: 24, display: "flex", flexDirection: "column",
          boxShadow: "0 24px 50px rgba(0,0,0,0.3)", border: `1px solid ${isDark ? ds.border : "rgba(255,255,255,0.5)"}`, overflow: "hidden"
        }}
      >
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB)", padding: "20px 24px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users size={20} color="white" />
              </div>
              <h2 style={{ color: "white", fontSize: 20, fontWeight: 800, margin: 0 }}>{t.selectCustomer}</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {onAddNew && (
                <button onClick={onAddNew} style={{ width: 36, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.15)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background="rgba(255,255,255,0.25)"} onMouseOut={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              )}
              <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background="rgba(239,68,68,0.8)"} onMouseOut={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}>
                <BackIcon size={18} color="white" />
              </button>
            </div>
          </div>
        <div style={{ position: "relative" }}>
          <Search size={15} color="rgba(255,255,255,0.7)" style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchCustomer}
            style={{ width: "100%", height: 44, boxSizing: "border-box", paddingInlineStart: 44, paddingInlineEnd: 16, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 12, color: "white", fontSize: 14, outline: "none", fontFamily: "inherit" }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }}>
        {/* Walk-in option */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { onSelect(null); onClose(); }}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 14,
            background: isDark ? ds.surface : "#FFFFFF", border: `1.5px dashed ${ds.border}`,
            borderRadius: 18, padding: "14px 16px", cursor: "pointer",
            fontFamily: "inherit", marginBottom: 16, textAlign: "start",
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={22} color="#2563EB" strokeWidth={2} />
          </div>
          <div>
            <div style={{ color: "#2563EB", fontSize: 14, fontWeight: 700 }}>{t.walkInCustomer}</div>
            <div style={{ color: ds.textMuted, fontSize: 12 }}>{isRTL ? "بيع نقدي بدون تسجيل عميل" : "Cash sale without customer record"}</div>
          </div>
          {selected === null && <Check size={18} color="#2563EB" style={{ marginInlineStart: "auto" }} />}
        </motion.button>

        <div style={{ color: ds.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
          {t.customersTitle} ({filtered.length})
        </div>

        {filtered.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { onSelect(c); onClose(); }}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 14,
              background: isDark ? ds.surface : "#FFFFFF",
              border: `1px solid ${selected?.id === c.id ? "#2563EB" : isDark ? ds.border : "#F1F5F9"}`,
              borderRadius: 18, padding: "14px 16px", cursor: "pointer",
              fontFamily: "inherit", marginBottom: 10, textAlign: "start",
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 14, background: c.type === "company" ? "rgba(139,92,246,0.1)" : "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {c.type === "company" ? <Building2 size={22} color="#8B5CF6" strokeWidth={2} /> : <Users size={22} color="#10B981" strokeWidth={2} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{c.customer_name}</div>
              <div style={{ color: ds.textSecondary, fontSize: 12 }}>{c.phone ?? ""}</div>
              {c.balance !== 0 && (
                <div style={{ color: c.balance < 0 ? "#EF4444" : "#16A34A", fontSize: 11, fontWeight: 600, marginTop: 2 }}>
                  {isRTL ? "الرصيد:" : "Balance:"} {Math.abs(c.balance).toLocaleString()} {c.balance < 0 ? (isRTL ? "عليه" : "owes") : (isRTL ? "له" : "credit")}
                </div>
              )}
            </div>
            {selected?.id === c.id
              ? <Check size={18} color="#2563EB" />
              : <ChevronRight size={16} color={ds.textMuted} style={{ transform: isRTL ? "rotate(180deg)" : undefined }} />}
          </motion.button>
        ))}
      </div>
      </motion.div>
    </div>
  );
}
