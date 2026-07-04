import { useState } from "react";
import { motion } from "motion/react";
import { X, Check, Scale } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";
import type { Unit } from "@/core/types/sales";

interface UnitFormSheetProps {
  unit: Unit | null;
  onClose: () => void;
  onSave: (data: Partial<Unit>) => void;
}

export function UnitFormSheet({ unit, onClose, onSave }: UnitFormSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const toast = useToast();
  const [formData, setFormData] = useState({
    unit_name: unit?.unit_name || "",
    unit_symbol: unit?.unit_symbol || "",
    unit_description: unit?.unit_description || "",
    is_active: unit?.is_active ?? true,
    is_default: unit?.is_default ?? false,
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
    if (!formData.unit_name || !formData.unit_symbol) {
      toast.warning(isRTL ? "يرجى إدخال اسم الوحدة والرمز" : "Please enter unit name and symbol");
      return;
    }
    onSave(formData);
  };

  const getInputStyle = () => ({
    width: "100%", height: 48, padding: "0 16px",
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
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Scale size={20} color="#3B82F6" />
            </div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>
              {unit ? (isRTL ? "تعديل الوحدة" : "Edit Unit") : (isRTL ? "إضافة وحدة جديدة" : "Add New Unit")}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
            <X size={20} color={ds.textPrimary} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "اسم الوحدة *" : "Unit Name *"}</label>
            <input name="unit_name" value={formData.unit_name} onChange={handleChange} required placeholder={isRTL ? "مثال: قطعة، كرتون، كيلو" : "e.g. Piece, Carton, Kg"} style={getInputStyle()} />
          </div>
          <div style={{ marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "الرمز / الاختصار *" : "Symbol / Abbreviation *"}</label>
              <input name="unit_symbol" value={formData.unit_symbol} onChange={handleChange} required placeholder={isRTL ? "مثال: قطعة، كرتون، كغ" : "e.g. pcs, ctn, kg"} style={getInputStyle()} />
            </div>
            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "الوصف" : "Description"}</label>
              <input name="unit_description" value={formData.unit_description} onChange={handleChange} placeholder={isRTL ? "الوصف أو التفاصيل" : "Description or details"} style={getInputStyle()} />
            </div>
          </div>
          <div style={{ marginBottom: 24, display: "flex", gap: 24 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} style={{ width: 18, height: 18, accentColor: "#3B82F6" }} />
              {isRTL ? "وحدة نشطة" : "Active Unit"}
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
              <input type="checkbox" name="is_default" checked={formData.is_default} onChange={handleChange} style={{ width: 18, height: 18, accentColor: "#3B82F6" }} />
              {isRTL ? "افتراضية النظام" : "System Default"}
            </label>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, height: 48, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 12, color: ds.textSecondary, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button type="submit" style={{ flex: 1, height: 48, background: "#3B82F6", border: "none", borderRadius: 12, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Check size={18} strokeWidth={2.5} /> {isRTL ? "حفظ" : "Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
