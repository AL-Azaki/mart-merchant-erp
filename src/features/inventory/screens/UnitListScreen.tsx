import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Edit, Trash2, Scale, 
  ArrowRight, ArrowLeft
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_UNITS } from "@/core/data/salesMockData";
import type { Unit } from "@/core/types/sales";
import { UnitFormSheet } from "../components/UnitFormSheet";
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";

export function UnitListScreen() {
  const { t, isDark, isRTL, ds } = useApp();
  const [search, setSearch] = useState("");
  const [localUnits, setLocalUnits] = useState<Unit[]>(MOCK_UNITS);
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

  // Filter
  const units = localUnits.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || (u.name_en?.toLowerCase() || "").includes(q) || u.abbreviation.toLowerCase().includes(q);
  });

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const subtle = isDark ? ds.surface2 : "#F1F5F9";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", background: surface, borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Scale size={22} color="#3B82F6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "وحدات القياس" : "Measurement Units"}</h2>
            <p style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 500 }}>{units.length} {isRTL ? "وحدة" : "Units"}</p>
          </div>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }} 
          onClick={() => { setEditingUnit(null); setShowForm(true); }}
          style={{ height: 44, background: "linear-gradient(135deg, #3B82F6, #2563EB)", border: "none", borderRadius: 12, padding: "0 16px", color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(59,130,246,0.3)" }}
        >
          <Plus size={18} strokeWidth={2.5} />
          {isRTL ? "إضافة وحدة" : "Add Unit"}
        </motion.button>
      </div>

      {/* Toolbar */}
      <div style={{ padding: "16px 24px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isRTL ? "ابحث عن وحدة..." : "Search unit..."}
              style={{ width: "100%", height: 46, boxSizing: "border-box", paddingInlineStart: 44, paddingInlineEnd: 16, background: surface, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          <AnimatePresence>
            {units.map((u, i) => (
              <motion.div key={u.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                style={{ background: surface, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                
                <div style={{ padding: 16, display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: subtle, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, color: ds.textPrimary, fontWeight: 800, fontSize: 15 }}>
                    {u.abbreviation}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>{u.name}</h3>
                    <div style={{ color: ds.textSecondary, fontSize: 12 }}>
                      {u.name_en || "-"}
                    </div>
                  </div>
                  
                  <div style={{ padding: "4px 8px", borderRadius: 8, background: u.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: u.is_active ? "#10B981" : "#EF4444", fontSize: 12, fontWeight: 700 }}>
                    {u.is_active ? (isRTL ? "نشط" : "Active") : (isRTL ? "غير نشط" : "Inactive")}
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${isDark ? ds.border : "#F1F5F9"}`, padding: "8px 16px", display: "flex", justifyContent: "flex-end", gap: 8, background: subtle }}>
                  <button onClick={() => { setEditingUnit(u); setShowForm(true); }} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Edit size={16} color={ds.textSecondary} />
                  </button>
                  <button onClick={() => setUnitToDelete(u)} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Trash2 size={16} color="#EF4444" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <UnitFormSheet 
            unit={editingUnit} 
            onClose={() => setShowForm(false)} 
            onSave={(data) => {
              if (editingUnit) {
                setLocalUnits(prev => prev.map(u => u.id === editingUnit.id ? { ...u, ...data } : u));
              } else {
                const newUnit: Unit = {
                  id: `unit_${Date.now()}`, business_id: "biz_001",
                  name: data.name!, name_en: data.name_en || null, abbreviation: data.abbreviation!, is_active: data.is_active ?? true
                };
                setLocalUnits(prev => [newUnit, ...prev]);
              }
              setShowForm(false);
            }} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {unitToDelete && (
          <ConfirmDeleteModal 
            isOpen={true} 
            onClose={() => setUnitToDelete(null)}
            onConfirm={() => {
              setLocalUnits(prev => prev.filter(unit => unit.id !== unitToDelete.id));
            }}
            itemName={unitToDelete.name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
