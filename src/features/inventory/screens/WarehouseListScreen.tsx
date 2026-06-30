import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Edit, Trash2, Building2, MapPin, Hash, Check
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_WAREHOUSES } from "@/core/data/salesMockData";
import type { Warehouse } from "@/core/types/sales";
import { WarehouseFormSheet } from "../components/WarehouseFormSheet";
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";

export function WarehouseListScreen() {
  const { t, isDark, isRTL, ds } = useApp();
  const [search, setSearch] = useState("");
  const [localWarehouses, setLocalWarehouses] = useState<Warehouse[]>(MOCK_WAREHOUSES);
  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null);

  // Filter
  const warehouses = localWarehouses.filter(w => {
    if (!search) return true;
    const q = search.toLowerCase();
    return w.warehouse_name.toLowerCase().includes(q) || w.warehouse_code.toLowerCase().includes(q);
  });

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const subtle = isDark ? ds.surface2 : "#F1F5F9";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", background: surface, borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(139, 92, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={22} color="#8B5CF6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "المستودعات" : "Warehouses"}</h2>
            <p style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 500 }}>{warehouses.length} {isRTL ? "مستودع" : "Warehouses"}</p>
          </div>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }} 
          onClick={() => { setEditingWarehouse(null); setShowForm(true); }}
          style={{ height: 44, background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", border: "none", borderRadius: 12, padding: "0 16px", color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(139,92,246,0.3)" }}
        >
          <Plus size={18} strokeWidth={2.5} />
          {isRTL ? "إضافة مستودع" : "Add Warehouse"}
        </motion.button>
      </div>

      {/* Toolbar */}
      <div style={{ padding: "16px 24px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isRTL ? "ابحث برمز أو اسم المستودع..." : "Search warehouse..."}
              style={{ width: "100%", height: 46, boxSizing: "border-box", paddingInlineStart: 44, paddingInlineEnd: 16, background: surface, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          <AnimatePresence>
            {warehouses.map((w, i) => (
              <motion.div key={w.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                style={{ background: surface, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", position: "relative" }}>
                
                {w.is_default && (
                  <div style={{ position: "absolute", top: 16, [isRTL ? "left" : "right"]: 16, background: "rgba(16,185,129,0.1)", color: "#10B981", padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                    <Check size={12} strokeWidth={3} /> {isRTL ? "الافتراضي" : "Default"}
                  </div>
                )}

                <div style={{ padding: 16, display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: subtle, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                    <Building2 size={22} color={ds.textMuted} />
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                    <h3 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 6 }}>{w.warehouse_name}</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ color: ds.textSecondary, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                        <Hash size={14} /> <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{w.warehouse_code}</span>
                      </div>
                      {w.address && (
                        <div style={{ color: ds.textMuted, fontSize: 13, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          <MapPin size={14} /> {w.address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${isDark ? ds.border : "#F1F5F9"}`, padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: subtle }}>
                  <div style={{ padding: "4px 8px", borderRadius: 8, background: w.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: w.is_active ? "#10B981" : "#EF4444", fontSize: 12, fontWeight: 700 }}>
                    {w.is_active ? (isRTL ? "نشط" : "Active") : (isRTL ? "غير نشط" : "Inactive")}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button title={isRTL ? "تعديل" : "Edit"} onClick={() => { setEditingWarehouse(w); setShowForm(true); }} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <Edit size={16} color={ds.textSecondary} />
                    </button>
                    <button title={isRTL ? "حذف" : "Delete"} onClick={() => setWarehouseToDelete(w)} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} disabled={w.is_default}>
                      <Trash2 size={16} color={w.is_default ? ds.border : "#EF4444"} />
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
          <WarehouseFormSheet 
            warehouse={editingWarehouse} 
            onClose={() => setShowForm(false)} 
            onSave={(data) => {
              let updated = [...localWarehouses];
              
              // If setting as default, remove default from others
              if (data.is_default) {
                updated = updated.map(w => ({ ...w, is_default: false }));
              }

              if (editingWarehouse) {
                updated = updated.map(w => w.id === editingWarehouse.id ? { ...w, ...data } : w);
              } else {
                const newWh: Warehouse = {
                  id: `wh_${Date.now()}`, business_id: "biz_001", branch_id: "br_001",
                  warehouse_name: data.warehouse_name!, warehouse_code: data.warehouse_code!, address: data.address || null,
                  is_default: data.is_default ?? false, is_active: data.is_active ?? true,
                  created_at: new Date().toISOString()
                };
                updated = [newWh, ...updated];
              }
              setLocalWarehouses(updated);
              setShowForm(false);
            }} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {warehouseToDelete && (
          <ConfirmDeleteModal 
            isOpen={true} 
            onClose={() => setWarehouseToDelete(null)}
            onConfirm={() => {
              setLocalWarehouses(prev => prev.filter(wh => wh.id !== warehouseToDelete.id));
            }}
            itemName={warehouseToDelete.warehouse_name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
