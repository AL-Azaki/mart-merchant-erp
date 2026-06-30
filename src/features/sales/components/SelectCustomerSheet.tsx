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
}

export function SelectCustomerSheet({ customers, selected, onSelect, onClose }: SelectCustomerSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const [search, setSearch] = useState("");
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const filtered = useMemo(() =>
    customers.filter((c) =>
      !search || (c.customer_name && c.customer_name.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone ?? "").includes(search)
    ), [search, customers]);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      style={{
        position: "absolute", inset: 0, zIndex: 100,
        background: isDark ? ds.bg : "#F8FAFC",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ background: "linear-gradient(150deg,#1E3A8A,#2563EB)", padding: "56px 20px 24px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <BackIcon size={18} color="white" />
          </button>
          <h2 style={{ color: "white", fontSize: 20, fontWeight: 800 }}>{t.selectCustomer}</h2>
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
  );
}
