import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Edit, Trash2, Shield, ShieldCheck, Check } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_ROLES } from "@/core/data/usersMockData";
import { RoleFormSheet } from "../components/RoleFormSheet";
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";
import type { Role } from "@/core/types/users";

export function RoleListScreen() {
  const { t, isDark, isRTL, ds } = useApp();
  const [search, setSearch] = useState("");
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const filteredRoles = roles.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.role_name.toLowerCase().includes(q);
  });

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";
  const subtle = isDark ? ds.surface2 : "#F1F5F9";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", background: surface, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={22} color="#F59E0B" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "الأدوار والصلاحيات" : "Roles & Permissions"}</h2>
            <p style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 500 }}>{filteredRoles.length} {isRTL ? "دور" : "Roles"}</p>
          </div>
        </div>
        <motion.button 
          title={isRTL ? "إضافة دور جديد" : "Add New Role"}
          whileTap={{ scale: 0.95 }} 
          onClick={() => { setEditingRole(null); setShowForm(true); }}
          style={{ height: 44, background: "linear-gradient(135deg, #F59E0B, #D97706)", border: "none", borderRadius: 12, padding: "0 16px", color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(245,158,11,0.3)" }}
        >
          <Plus size={18} strokeWidth={2.5} />
          {isRTL ? "إضافة دور" : "Add Role"}
        </motion.button>
      </div>

      {/* Toolbar */}
      <div style={{ padding: "16px 24px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isRTL ? "ابحث باسم الدور..." : "Search role name..."}
              style={{ width: "100%", height: 46, boxSizing: "border-box", paddingInlineStart: 44, paddingInlineEnd: 16, background: surface, border: `1px solid ${border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit" }}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filteredRoles.map((r, i) => (
            <motion.div key={r.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", position: "relative" }}>
              
              {r.is_system_role && (
                <div style={{ position: "absolute", top: 16, [isRTL ? "left" : "right"]: 16, background: "rgba(16,185,129,0.1)", color: "#10B981", padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  <Check size={12} strokeWidth={3} /> {isRTL ? "دور نظام" : "System Role"}
                </div>
              )}

              <div style={{ padding: 16, display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Shield size={24} color="#F59E0B" />
                </div>
                
                <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                  <h3 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700, margin: 0, marginBottom: 6 }}>{r.role_name}</h3>
                  <div style={{ color: ds.textSecondary, fontSize: 13, lineHeight: 1.4, marginBottom: 8 }}>{r.description || (isRTL ? "لا يوجد وصف" : "No description")}</div>
                  
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: isDark ? ds.surface2 : "#FFFBEB", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#D97706" }}>
                    <ShieldCheck size={12} /> {((r as any).permission_ids || []).length} {isRTL ? "صلاحيات" : "Permissions"}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${isDark ? ds.border : "#F1F5F9"}`, padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: subtle }}>
                <div style={{ padding: "4px 8px", borderRadius: 8, background: r.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: r.is_active ? "#10B981" : "#EF4444", fontSize: 12, fontWeight: 700 }}>
                  {r.is_active ? (isRTL ? "نشط" : "Active") : (isRTL ? "غير نشط" : "Inactive")}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button title={isRTL ? "تعديل الدور" : "Edit Role"} onClick={() => { setEditingRole(r); setShowForm(true); }} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Edit size={16} color={ds.textSecondary} />
                  </button>
                  <button title={isRTL ? "حذف الدور" : "Delete Role"} onClick={() => setRoleToDelete(r)} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} disabled={r.is_system_role}>
                    <Trash2 size={16} color={r.is_system_role ? ds.border : "#EF4444"} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <RoleFormSheet 
            role={editingRole} 
            onClose={() => setShowForm(false)} 
            onSave={(data) => {
              if (editingRole) {
                setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...r, ...data } : r));
              } else {
                const newRole: Role = {
                  id: `role_${Date.now()}`, business_id: "biz_001",
                  role_name: data.role_name!, description: data.description || null,
                  is_system_role: false, is_active: data.is_active ?? true,
                  created_at: new Date().toISOString()
                };
                (newRole as any).permission_ids = data.permission_ids || [];
                setRoles(prev => [newRole, ...prev]);
              }
              setShowForm(false);
            }} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {roleToDelete && (
          <ConfirmDeleteModal 
            isOpen={true} 
            onClose={() => setRoleToDelete(null)}
            onConfirm={() => {
              setRoles(prev => prev.filter(role => role.id !== roleToDelete.id));
              setRoleToDelete(null);
            }}
            itemName={roleToDelete.role_name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
