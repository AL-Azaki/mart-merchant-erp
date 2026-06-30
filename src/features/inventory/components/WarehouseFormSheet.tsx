import { useState } from "react";
import { motion } from "motion/react";
import { X, Check, Building2, MapPin, Hash } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";
import type { Warehouse } from "@/core/types/sales";

interface WarehouseFormSheetProps {
  warehouse: Warehouse | null;
  onClose: () => void;
  onSave: (data: Partial<Warehouse>) => void;
}

export function WarehouseFormSheet({ warehouse, onClose, onSave }: WarehouseFormSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const toast = useToast();
  const [formData, setFormData] = useState({
    warehouse_name: warehouse?.warehouse_name || "",
    warehouse_code: warehouse?.warehouse_code || "",
    address: warehouse?.address || "",
    is_active: warehouse ? warehouse.is_active : true,
    is_default: warehouse ? warehouse.is_default : false,
  });

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.warehouse_name || !formData.warehouse_code) {
      toast.warning(isRTL ? "يرجى إدخال اسم المستودع والرمز" : "Please enter warehouse name and code");
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
        style={{ position: "relative", width: "100%", maxWidth: 500, background: bg, borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
        
        {/* Header */}
        <div style={{ background: surface, padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(139, 92, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={20} color="#8B5CF6" />
            </div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>
              {warehouse ? (isRTL ? "تعديل المستودع" : "Edit Warehouse") : (isRTL ? "إضافة مستودع جديد" : "Add New Warehouse")}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
            <X size={20} color={ds.textPrimary} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ marginBottom: 16, position: "relative" }}>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "اسم المستودع *" : "Warehouse Name *"}</label>
            <div style={{ position: "relative" }}>
              <Building2 size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
              <input name="warehouse_name" value={formData.warehouse_name} onChange={handleChange} required placeholder={isRTL ? "مثال: المستودع الرئيسي" : "e.g. Main Warehouse"} style={getInputStyle()} />
            </div>
          </div>
          <div style={{ marginBottom: 16, position: "relative" }}>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "رمز المستودع *" : "Warehouse Code *"}</label>
            <div style={{ position: "relative" }}>
              <Hash size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
              <input name="warehouse_code" value={formData.warehouse_code} onChange={handleChange} required placeholder={isRTL ? "مثال: WH-01" : "e.g. WH-01"} style={getInputStyle()} />
            </div>
          </div>
          <div style={{ marginBottom: 24, position: "relative" }}>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "العنوان" : "Address"}</label>
            <div style={{ position: "relative" }}>
              <MapPin size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
              <input name="address" value={formData.address} onChange={handleChange} placeholder={isRTL ? "عنوان المستودع" : "Warehouse Address"} style={getInputStyle()} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, background: isDark ? ds.surface2 : "#F8FAFC", padding: 16, borderRadius: 12, border: `1px solid ${border}` }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} style={{ width: 18, height: 18, accentColor: "#8B5CF6" }} />
              {isRTL ? "مستودع نشط" : "Active Warehouse"}
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
              <input type="checkbox" name="is_default" checked={formData.is_default} onChange={handleChange} style={{ width: 18, height: 18, accentColor: "#8B5CF6" }} />
              {isRTL ? "المستودع الافتراضي" : "Default Warehouse"}
            </label>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, height: 48, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 12, color: ds.textSecondary, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button type="submit" style={{ flex: 1, height: 48, background: "#8B5CF6", border: "none", borderRadius: 12, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Check size={18} strokeWidth={2.5} /> {isRTL ? "حفظ" : "Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
