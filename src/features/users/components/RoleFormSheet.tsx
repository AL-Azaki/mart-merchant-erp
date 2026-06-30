import { useState } from "react";
import { motion } from "motion/react";
import { X, Check, ShieldCheck, AlignLeft } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";
import type { Role } from "@/core/types/users";

interface RoleFormSheetProps {
  role: Role | null;
  onClose: () => void;
  onSave: (data: Partial<Role>) => void;
}

export function RoleFormSheet({ role, onClose, onSave }: RoleFormSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const toast = useToast();
  const [formData, setFormData] = useState({
    role_name: role?.role_name || "",
    description: role?.description || "",
    is_active: role ? role.is_active : true,
  });

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role_name) {
      toast.warning(isRTL ? "يرجى إدخال اسم الدور" : "Please enter role name");
      return;
    }
    
    onSave(formData);
  };

  const getInputStyle = () => ({
    width: "100%", height: 48, padding: "0 16px", paddingInlineStart: 44,
    background: isDark ? ds.surface2 : "#FFFFFF",
    border: `1px solid ${border}`, borderRadius: 12,
    color: ds.textPrimary, fontSize: 14, fontWeight: 500,
    outline: "none", fontFamily: "inherit"
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }} />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ position: "relative", width: "100%", maxWidth: 500, display: "flex", flexDirection: "column", background: bg, borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
        
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ marginBottom: 16, position: "relative" }}>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "اسم الدور *" : "Role Name *"}</label>
            <div style={{ position: "relative" }}>
              <ShieldCheck size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
              <input name="role_name" value={formData.role_name} onChange={handleChange} required placeholder={isRTL ? "مثال: محاسب" : "e.g. Accountant"} style={getInputStyle()} disabled={role?.is_system_role} />
            </div>
          </div>
          
          <div style={{ marginBottom: 24, position: "relative" }}>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "الوصف" : "Description"}</label>
            <div style={{ position: "relative" }}>
              <AlignLeft size={18} color={ds.textMuted} style={{ position: "absolute", top: 14, [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder={isRTL ? "وصف مهام هذا الدور..." : "Role description..."} style={{ ...getInputStyle(), height: 100, paddingTop: 14, resize: "none" }} disabled={role?.is_system_role} />
            </div>
          </div>

          <div style={{ marginBottom: 24, background: isDark ? ds.surface2 : "#F8FAFC", padding: 16, borderRadius: 12, border: `1px solid ${border}` }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: role?.is_system_role ? "not-allowed" : "pointer", color: ds.textPrimary, fontSize: 14, fontWeight: 600, opacity: role?.is_system_role ? 0.6 : 1 }}>
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} disabled={role?.is_system_role} style={{ width: 18, height: 18, accentColor: "#F59E0B" }} />
              {isRTL ? "دور نشط" : "Active Role"}
            </label>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
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
