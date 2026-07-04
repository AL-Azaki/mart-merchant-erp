import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Edit, Trash2, Scale, Star
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_UNITS } from "@/core/data/salesMockData";
import type { Unit } from "@/core/types/catalog";
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
    return (
      (u.unit_name || "").toLowerCase().includes(q) || 
      (u.unit_description || "").toLowerCase().includes(q) || 
      (u.unit_symbol || "").toLowerCase().includes(q)
    );
  });

  const handleSetDefault = (unitId: string) => {
    setLocalUnits(prev => prev.map(u => ({
      ...u,
      is_default: u.id === unitId
    })));
  };

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
                style={{ background: surface, border: `1px solid ${u.is_default ? "#F59E0B" : (isDark ? ds.border : "#E2E8F0")}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: u.is_default ? "0 4px 14px rgba(245,158,11,0.15)" : "0 2px 8px rgba(0,0,0,0.03)", position: "relative" }}>
                
                {u.is_default && (
                  <div style={{ position: "absolute", top: 12, [isRTL ? "left" : "right"]: 12, display: "flex", alignItems: "center", gap: 4, background: "rgba(245,158,11,0.1)", color: "#F59E0B", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    <Star size={12} fill="#F59E0B" />
                    {isRTL ? "افتراضية النظام" : "System Default"}
                  </div>
                )}

                <div style={{ padding: 16, display: "flex", gap: 16, alignItems: "center", marginTop: u.is_default ? 20 : 0 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: subtle, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, color: ds.textPrimary, fontWeight: 800, fontSize: 15 }}>
                    {u.unit_symbol}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>{u.unit_name}</h3>
                    <div style={{ color: ds.textSecondary, fontSize: 12 }}>
                      {u.unit_description || "-"}
                    </div>
                  </div>
                  
                  <div style={{ padding: "4px 8px", borderRadius: 8, background: u.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: u.is_active ? "#10B981" : "#EF4444", fontSize: 12, fontWeight: 700 }}>
                    {u.is_active ? (isRTL ? "نشط" : "Active") : (isRTL ? "غير نشط" : "Inactive")}
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${isDark ? ds.border : "#F1F5F9"}`, padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: subtle }}>
                  <div>
                    {!u.is_default && (
                      <button 
                        onClick={() => handleSetDefault(u.id)}
                        style={{ background: "none", border: "none", color: ds.textSecondary, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", padding: "4px 8px", borderRadius: 6, transition: "all 0.2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#F59E0B"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = ds.textSecondary; }}
                      >
                        <Star size={14} />
                        {isRTL ? "تعيين كافتراضية" : "Set as Default"}
                      </button>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setEditingUnit(u); setShowForm(true); }} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <Edit size={16} color={ds.textSecondary} />
                    </button>
                    <button onClick={() => setUnitToDelete(u)} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <Trash2 size={16} color="#EF4444" />
                    </button>
                  </div>
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
                setLocalUnits(prev => {
                  let next = prev.map(u => u.id === editingUnit.id ? { ...u, ...data } : u);
                  if (data.is_default) {
                    next = next.map(u => u.id === editingUnit.id ? u : { ...u, is_default: false });
                  }
                  return next;
                });
              } else {
                const newUnit: Unit = {
                  id: `unit_${Date.now()}`,
                  unit_name: data.unit_name!,
                  unit_symbol: data.unit_symbol!,
                  unit_description: data.unit_description || null,
                  is_active: data.is_active ?? true,
                  is_default: data.is_default ?? false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                } as any;
                setLocalUnits(prev => {
                  let next = [...prev];
                  if (data.is_default) {
                    next = next.map(u => ({ ...u, is_default: false }));
                  }
                  return [newUnit, ...next];
                });
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
            itemName={unitToDelete.unit_name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
