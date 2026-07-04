import { useState } from "react";
import { motion } from "motion/react";
import { X, Check, ShieldCheck, AlignLeft, Lock } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";
import type { Role } from "@/core/types/users";
import { MOCK_PERMISSIONS } from "@/core/data/usersMockData";

interface RoleFormSheetProps {
  role: Role | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function RoleFormSheet({ role, onClose, onSave }: RoleFormSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const toast = useToast();

  const [formData, setFormData] = useState({
    role_name: role?.role_name || "",
    description: role?.description || "",
    is_active: role ? role.is_active : true,
  });

  // cast role to read permission_ids
  const initialPermissionIds = (role as any)?.permission_ids || [];
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(initialPermissionIds);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleTogglePermission = (id: string) => {
    if (role?.is_system_role) return; // System roles have locked permissions
    setSelectedPermissionIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role_name) {
      toast.warning(isRTL ? "يرجى إدخال اسم الدور" : "Please enter role name");
      return;
    }
    
    onSave({
      ...formData,
      permission_ids: selectedPermissionIds
    });
  };

  const getInputStyle = () => ({
    width: "100%", height: 48, padding: "0 16px", paddingInlineStart: 44,
    background: isDark ? ds.surface2 : "#FFFFFF",
    border: `1px solid ${border}`, borderRadius: 12,
    color: ds.textPrimary, fontSize: 14, fontWeight: 500,
    outline: "none", fontFamily: "inherit",
    boxSizing: "border-box" as const
  });

  // Group permissions by module
  const modules = Array.from(new Set(MOCK_PERMISSIONS.map(p => p.module)));
  const getModuleLabel = (moduleName: string) => {
    switch (moduleName) {
      case "sales": return isRTL ? "المبيعات" : "Sales";
      case "purchases": return isRTL ? "المشتريات والموردين" : "Purchases & Suppliers";
      case "inventory": return isRTL ? "المخزون والمنتجات" : "Inventory & Products";
      case "finance": return isRTL ? "المالية والحسابات" : "Finance & Accounts";
      case "users": return isRTL ? "المستخدمين والصلاحيات" : "Users & Roles";
      default: return moduleName;
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }} />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ position: "relative", width: "100%", maxWidth: 600, maxHeight: "90vh", display: "flex", flexDirection: "column", background: bg, borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
        
        {/* Header */}
        <div style={{ background: surface, padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={20} color="#F59E0B" />
            </div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>
              {role ? (isRTL ? "تعديل الدور" : "Edit Role") : (isRTL ? "إضافة دور جديد" : "Add New Role")}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
            <X size={20} color={ds.textPrimary} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "اسم الدور *" : "Role Name *"}</label>
                <div style={{ position: "relative" }}>
                  <ShieldCheck size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
                  <input name="role_name" value={formData.role_name} onChange={handleChange} required placeholder={isRTL ? "مثال: محاسب" : "e.g. Accountant"} style={getInputStyle()} disabled={role?.is_system_role} />
                </div>
              </div>
              
              <div style={{ position: "relative" }}>
                <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "الوصف" : "Description"}</label>
                <div style={{ position: "relative" }}>
                  <AlignLeft size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
                  <input name="description" value={formData.description} onChange={handleChange} placeholder={isRTL ? "وصف الصلاحيات..." : "Role description..."} style={getInputStyle()} disabled={role?.is_system_role} />
                </div>
              </div>
            </div>

            {/* Locked note if system role */}
            {role?.is_system_role && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(245,158,11,0.08)", border: `1px solid rgba(245,158,11,0.2)`, borderRadius: 12, padding: "12px 16px", color: "#D97706", fontSize: 12.5, fontWeight: 700 }}>
                <Lock size={15} />
                <span>{isRTL ? "هذا دور نظام محمي. لا يمكن تعديل اسم الدور أو صلاحياته." : "This is a protected system role. Permissions cannot be modified."}</span>
              </div>
            )}

            {/* Checklist Header */}
            <div style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 800, marginTop: 8, borderBottom: `1px solid ${border}`, paddingBottom: 8 }}>
              {isRTL ? "صلاحيات الوصول (Permissions Checklist)" : "Access Permissions Checklist"}
            </div>

            {/* Permission Checkboxes grouped by modules */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {modules.map(moduleName => {
                const modulePerms = MOCK_PERMISSIONS.filter(p => p.module === moduleName);
                return (
                  <div key={moduleName} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: ds.primary, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {getModuleLabel(moduleName)}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {modulePerms.map(perm => {
                        const checked = selectedPermissionIds.includes(perm.id);
                        return (
                          <label key={perm.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: role?.is_system_role ? "not-allowed" : "pointer", padding: 8, borderRadius: 8, background: checked ? (isDark ? "rgba(99,102,241,0.1)" : "#F5F3FF") : "transparent", transition: "all 0.15s" }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={role?.is_system_role}
                              onChange={() => handleTogglePermission(perm.id)}
                              style={{ width: 16, height: 16, marginTop: 2, accentColor: "#6366F1" }}
                            />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: ds.textPrimary }}>{perm.permission_name}</div>
                              <div style={{ fontSize: 11, color: ds.textSecondary, marginTop: 2 }}>{perm.description}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: isDark ? ds.surface2 : "#F8FAFC", padding: 16, borderRadius: 12, border: `1px solid ${border}` }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: role?.is_system_role ? "not-allowed" : "pointer", color: ds.textPrimary, fontSize: 14, fontWeight: 600, opacity: role?.is_system_role ? 0.6 : 1 }}>
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} disabled={role?.is_system_role} style={{ width: 18, height: 18, accentColor: "#F59E0B" }} />
                {isRTL ? "دور نشط" : "Active Role"}
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ padding: "16px 24px", background: surface, borderTop: `1px solid ${border}`, display: "flex", gap: 12, flexShrink: 0 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, height: 48, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 12, color: ds.textSecondary, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button type="submit" style={{ flex: 1, height: 48, background: "#F59E0B", border: "none", borderRadius: 12, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Check size={18} strokeWidth={2.5} /> {isRTL ? "حفظ" : "Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
