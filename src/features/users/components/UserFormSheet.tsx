import { useState } from "react";
import { motion } from "motion/react";
import { X, Check, UserCircle, Mail, Phone, Lock, MapPin } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";
import type { User } from "@/core/types/users";
import { MOCK_ROLES } from "@/core/data/usersMockData";
import { MOCK_BRANCHES } from "@/core/data/mockData";

interface UserFormSheetProps {
  user: User | null;
  onClose: () => void;
  onSave: (data: Partial<User>) => void;
}

export function UserFormSheet({ user, onClose, onSave }: UserFormSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const toast = useToast();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    username: user?.username || "",
    phone: user?.phone || "",
    password: "", // Only for new users or reset
    role_id: user?.roles?.[0]?.id || MOCK_ROLES[0].id,
    default_branch_id: user?.default_branch_id || MOCK_BRANCHES[0].id,
    is_active: user ? user.is_active : true,
  });

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.username) {
      toast.warning(isRTL ? "يرجى تعبئة جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }
    if (!user && !formData.password) {
      toast.warning(isRTL ? "كلمة المرور مطلوبة للمستخدم الجديد" : "Password is required for new user");
      return;
    }
    
    const selectedRole = MOCK_ROLES.find(r => r.id === formData.role_id);
    
    onSave({
      full_name: formData.full_name,
      username: formData.username,
      phone: formData.phone,
      is_active: formData.is_active,
      default_branch_id: formData.default_branch_id,
      roles: selectedRole ? [selectedRole] : [],
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

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }} />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ position: "relative", width: "100%", maxWidth: 500, maxHeight: "90vh", display: "flex", flexDirection: "column", background: bg, borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
        
        {/* Header */}
        <div style={{ background: surface, padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserCircle size={20} color="#6366F1" />
            </div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>
              {user ? (isRTL ? "تعديل المستخدم" : "Edit User") : (isRTL ? "إضافة مستخدم جديد" : "Add New User")}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
            <X size={20} color={ds.textPrimary} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24, overflowY: "auto", flex: 1 }}>
          <div style={{ marginBottom: 16, position: "relative" }}>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "الاسم الكامل *" : "Full Name *"}</label>
            <div style={{ position: "relative" }}>
              <UserCircle size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
              <input name="full_name" value={formData.full_name} onChange={handleChange} required placeholder={isRTL ? "مثال: أحمد محمد" : "e.g. Ahmed Ali"} style={getInputStyle()} />
            </div>
          </div>
          
          <div style={{ marginBottom: 16, position: "relative" }}>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "اسم المستخدم (للدخول) *" : "Username *"}</label>
            <div style={{ position: "relative" }}>
              <UserCircle size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
              <input name="username" value={formData.username} onChange={handleChange} required placeholder="ahmed_m" style={getInputStyle()} disabled={!!user} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "رقم الهاتف" : "Phone"}</label>
            <div style={{ position: "relative" }}>
              <Phone size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="05XXXXXXXX" style={getInputStyle()} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "كلمة المرور" : "Password"} {!user && "*"}</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
              <input type="password" name="password" value={formData.password} onChange={handleChange} required={!user} placeholder={user ? (isRTL ? "اترك فارغاً لعدم التغيير" : "Leave blank to keep current") : "*****"} style={getInputStyle()} />
            </div>
          </div>

          <div style={{ marginBottom: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "دور المستخدم (الصلاحيات) *" : "User Role *"}</label>
              <select name="role_id" value={formData.role_id} onChange={handleChange} style={{ width: "100%", height: 48, padding: "0 16px", background: isDark ? ds.surface2 : "#FFFFFF", border: `1px solid ${border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 600, outline: "none", fontFamily: "inherit" }}>
                {MOCK_ROLES.map(r => (
                  <option key={r.id} value={r.id}>{r.role_name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "الفرع المتاح *" : "Assigned Branch *"}</label>
              <select name="default_branch_id" value={formData.default_branch_id} onChange={handleChange} style={{ width: "100%", height: 48, padding: "0 16px", background: isDark ? ds.surface2 : "#FFFFFF", border: `1px solid ${border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 600, outline: "none", fontFamily: "inherit" }}>
                {MOCK_BRANCHES.map(b => (
                  <option key={b.id} value={b.id}>{b.branch_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 24, background: isDark ? ds.surface2 : "#F8FAFC", padding: 16, borderRadius: 12, border: `1px solid ${border}` }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} style={{ width: 18, height: 18, accentColor: "#6366F1" }} />
              {isRTL ? "حساب نشط" : "Active Account"}
            </label>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, height: 48, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 12, color: ds.textSecondary, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button type="submit" style={{ flex: 1, height: 48, background: "#6366F1", border: "none", borderRadius: 12, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Check size={18} strokeWidth={2.5} /> {isRTL ? "حفظ" : "Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
