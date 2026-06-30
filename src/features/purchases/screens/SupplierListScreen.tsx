import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Building2, Phone, Edit, Trash2, User } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_SUPPLIERS } from "@/core/data/purchasesMockData";
import type { Supplier } from "@/core/types/purchases";
import { SupplierFormSheet } from "../components/SupplierFormSheet";
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";

export function SupplierListScreen({ suppliers, onUpdateSuppliers }: { suppliers: Supplier[], onUpdateSuppliers: (v: any) => void }) {
  const { isDark, isRTL, ds } = useApp();
  
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const filteredSuppliers = useMemo(() => {
    if (!search) return suppliers;
    const q = search.toLowerCase();
    return suppliers.filter(s => 
      s.supplier_name.toLowerCase().includes(q) || 
      (s.phone && s.phone.includes(q)) ||
      (s.contact_person && s.contact_person.toLowerCase().includes(q))
    );
  }, [search, suppliers]);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const subtle = isDark ? ds.surface2 : "#F1F5F9";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      
      {/* Toolbar */}
      <div style={{ padding: "16px 24px", flexShrink: 0, display: "flex", gap: 12 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? "ابحث عن مورد بالاسم أو الهاتف..." : "Search supplier by name or phone..."}
            style={{ width: "100%", height: 46, boxSizing: "border-box", paddingInlineStart: 44, paddingInlineEnd: 16, background: surface, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}
          />
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setEditingSupplier(null); setShowForm(true); }}
          style={{ height: 46, background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", border: "none", borderRadius: 12, padding: "0 20px", color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(139,92,246,0.3)" }}>
          <Plus size={18} strokeWidth={2.5} />
          {isRTL ? "إضافة مورد" : "Add Supplier"}
        </motion.button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          <AnimatePresence>
            {filteredSuppliers.map((s, i) => (
              <motion.div key={s.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                style={{ background: surface, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                
                <div style={{ padding: 16, display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Building2 size={24} color="#8B5CF6" />
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 700, margin: "0 0 8px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.supplier_name}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {s.contact_person && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: ds.textSecondary, fontSize: 13 }}>
                          <User size={14} color={ds.textMuted} /> <span>{s.contact_person}</span>
                        </div>
                      )}
                      {s.phone && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: ds.textSecondary, fontSize: 13 }}>
                          <Phone size={14} color={ds.textMuted} /> <span style={{ direction: "ltr" }}>{s.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${isDark ? ds.border : "#F1F5F9"}`, padding: "8px 16px", display: "flex", justifyContent: "flex-end", gap: 8, background: subtle }}>
                  <button onClick={() => { setEditingSupplier(s); setShowForm(true); }} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Edit size={16} color={ds.textSecondary} />
                  </button>
                  <button onClick={() => setSupplierToDelete(s)} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Trash2 size={16} color="#EF4444" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {filteredSuppliers.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: ds.textMuted, fontSize: 14, fontWeight: 500 }}>
            {isRTL ? "لا يوجد موردين مطابقين للبحث" : "No suppliers found matching your search"}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <SupplierFormSheet 
            supplier={editingSupplier}
            onClose={() => setShowForm(false)} 
            onSave={(data) => {
              if (editingSupplier) {
                onUpdateSuppliers(suppliers.map(s => s.id === editingSupplier.id ? { ...s, ...data } as Supplier : s));
              } else {
                const newSupplier: Supplier = {
                  id: `sup_${Date.now()}`, business_id: "biz_001",
                  supplier_name: data.supplier_name!,
                  contact_person: data.contact_person || null,
                  phone: data.phone || null,
                  supplier_address: data.supplier_address || null,
                  is_active: data.is_active ?? true,
                  created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null
                };
                onUpdateSuppliers([newSupplier, ...suppliers]);
              }
              setShowForm(false);
            }} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {supplierToDelete && (
          <ConfirmDeleteModal 
            isOpen={true} 
            onClose={() => setSupplierToDelete(null)}
            onConfirm={() => {
              onUpdateSuppliers(suppliers.filter(sup => sup.id !== supplierToDelete.id));
            }}
            itemName={supplierToDelete.supplier_name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
