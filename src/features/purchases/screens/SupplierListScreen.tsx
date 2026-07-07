import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Phone, Edit, Trash2, Building2, User } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_SUPPLIERS } from "@/core/data/purchasesMockData";
import type { Supplier } from "@/core/types/purchases";
import { SupplierFormSheet } from "../components/SupplierFormSheet";
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";
import { SupplierStatementScreen } from "../components/SupplierStatementScreen";
import { usePurchaseStore } from "@/core/engine/purchaseStore";

export function SupplierListScreen() {
  const { isDark, isRTL, ds } = useApp();
  const purchaseStore = usePurchaseStore();
  
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  
  // Statement Modal State
  const [selectedSupplierForStatement, setSelectedSupplierForStatement] = useState<Supplier | null>(null);

  const filteredSuppliers = useMemo(() => {
    const data = purchaseStore.suppliers;
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(s => 
      s.supplier_name.toLowerCase().includes(q) || 
      (s.phone && s.phone.includes(q)) ||
      (s.contact_person && s.contact_person.toLowerCase().includes(q))
    );
  }, [search, purchaseStore.suppliers]);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  if (selectedSupplierForStatement) {
    return <SupplierStatementScreen supplier={selectedSupplierForStatement} onBack={() => setSelectedSupplierForStatement(null)} />;
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      
      {/* Toolbar */}
      <div style={{ padding: "20px 24px", flexShrink: 0, display: "flex", gap: 16, alignItems: "center", borderBottom: `1px solid ${border}` }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
          <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? "ابحث عن مورد بالاسم، الهاتف..." : "Search supplier by name, phone..."}
            style={{ width: "100%", height: 44, boxSizing: "border-box", paddingInlineStart: 44, paddingInlineEnd: 16, background: isDark ? ds.surface2 : "#FFFFFF", border: `1px solid ${border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, outline: "none", transition: "0.2s" }}
          />
        </div>
        <div style={{ flex: 1 }} />
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => { setEditingSupplier(null); setShowForm(true); }}
          style={{ height: 44, background: "#047857", border: "none", borderRadius: 12, padding: "0 20px", color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", boxShadow: "0 4px 12px rgba(4,120,87,0.3)" }}>
          <Plus size={18} strokeWidth={2.5} />
          {isRTL ? "إضافة مورد جديد" : "Add Supplier"}
        </motion.button>
      </div>

      {/* Data Grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
            <thead>
              <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${border}` }}>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "35%" }}>{isRTL ? "المورد" : "Supplier"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "مسؤول التواصل" : "Contact Person"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "رقم الهاتف" : "Phone"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "الحالة" : "Status"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, textAlign: "center" }}>{isRTL ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 40, textAlign: "center", color: ds.textMuted, fontSize: 14 }}>
                      {isRTL ? "لا يوجد موردين مطابقين للبحث" : "No suppliers found matching your search"}
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((s, i) => (
                    <motion.tr key={s.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedSupplierForStatement(s)}
                      style={{ borderBottom: i === filteredSuppliers.length - 1 ? "none" : `1px solid ${isDark ? ds.border : "#F1F5F9"}`, cursor: "pointer", transition: "background 0.2s" }}
                      onMouseOver={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC"}
                      onMouseOut={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Building2 size={20} color="#10B981" />
                          </div>
                          <div>
                            <h3 style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700, margin: "0 0 4px 0" }}>{s.supplier_name}</h3>
                            <div style={{ color: ds.textSecondary, fontSize: 12 }}>{s.supplier_address || (isRTL ? "بدون عنوان" : "No Address")}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
                        {s.contact_person ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}><User size={14} color={ds.textSecondary} /> {s.contact_person}</div> : <span style={{ color: ds.textMuted }}>-</span>}
                      </td>

                      <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
                        {s.phone ? <div style={{ display: "flex", alignItems: "center", gap: 6, direction: "ltr", justifyContent: isRTL ? "flex-end" : "flex-start" }}><Phone size={14} color={ds.textSecondary} /> {s.phone}</div> : <span style={{ color: ds.textMuted }}>-</span>}
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: s.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: s.is_active ? "#10B981" : "#EF4444" }}>
                          {s.is_active ? (isRTL ? "نشط" : "Active") : (isRTL ? "موقوف" : "Inactive")}
                        </span>
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                          <button title={isRTL ? "تعديل بيانات المورد" : "Edit Supplier"} onClick={(e) => { e.stopPropagation(); setEditingSupplier(s); setShowForm(true); }} style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.background = isDark ? ds.border : "#E2E8F0"} onMouseOut={e => e.currentTarget.style.background = isDark ? ds.surface2 : "#F1F5F9"}>
                            <Edit size={16} color={ds.textPrimary} />
                          </button>
                          <button title={isRTL ? "حذف المورد" : "Delete Supplier"} onClick={(e) => { e.stopPropagation(); setSupplierToDelete(s); }} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"} onMouseOut={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}>
                            <Trash2 size={16} color="#EF4444" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <SupplierFormSheet 
            supplier={editingSupplier}
            onClose={() => setShowForm(false)} 
            onSave={(data) => {
              if (editingSupplier) {
                purchaseStore.updateSupplier({ ...editingSupplier, ...data } as Supplier);
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
                purchaseStore.addSupplier(newSupplier);
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
              if (supplierToDelete) {
                purchaseStore.deleteSupplier(supplierToDelete.id);
                setSupplierToDelete(null);
              }
            }}
            itemName={supplierToDelete.supplier_name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
