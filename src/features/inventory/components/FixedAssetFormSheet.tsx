import { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";
import type { FixedAsset } from "@/core/data/inventoryExtraMockData";

interface FixedAssetFormSheetProps {
  asset?: FixedAsset | null;
  onSave: (assetData: any) => void;
  onClose: () => void;
}

export function FixedAssetFormSheet({ asset, onSave, onClose }: FixedAssetFormSheetProps) {
  const { isDark, isRTL, ds } = useApp();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: asset?.name || "",
    code: asset?.code || "",
    category: asset?.category || "أجهزة إلكترونية",
    purchase_date: asset?.purchase_date || new Date().toISOString().split("T")[0],
    cost: asset?.cost || 50000,
    location: asset?.location || "المستودع الرئيسي",
    status: asset?.status || "excellent",
  });

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: name === "cost" ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.warning(isRTL ? "يرجى إدخال اسم الأصل" : "Please enter asset name");
      return;
    }
    if (!formData.code) {
      toast.warning(isRTL ? "يرجى إدخال كود الأصل" : "Please enter asset code/serial");
      return;
    }
    onSave({
      id: asset?.id || `ast_${Date.now()}`,
      ...formData
    });
  };

  const getInputStyle = () => ({
    width: "100%", 
    height: 60, 
    padding: "0 20px",
    background: isDark ? ds.surface2 : "#FFFFFF",
    border: `1.5px solid ${border}`, 
    borderRadius: 14,
    color: ds.textPrimary, 
    fontSize: 14, 
    fontWeight: 500,
    outline: "none", 
    fontFamily: "inherit",
    boxSizing: "border-box" as const
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }} />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ position: "relative", width: "100%", maxWidth: 500, background: bg, borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
        
        {/* Header */}
        <div style={{ background: surface, padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 800, margin: 0 }}>
              {asset ? (isRTL ? "تعديل بيانات الأصل" : "Edit Asset") : (isRTL ? "تسجيل أصل ثابت جديد" : "Register Fixed Asset")}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: isDark ? ds.surface2 : "#F1F5F9", border: "none", width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} color={ds.textPrimary} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, maxHeight: "70vh", overflowY: "auto" }}>
          <div>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              {isRTL ? "اسم الأصل *" : "Asset Name *"}
            </label>
            <input name="name" value={formData.name} onChange={handleChange} style={getInputStyle()} placeholder={isRTL ? "طابعة، مكيف، سيارة..." : "Printer, AC, Car..."} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                {isRTL ? "الكود / الرقم التسلسلي *" : "Code/Serial Number *"}
              </label>
              <input name="code" value={formData.code} onChange={handleChange} style={getInputStyle()} placeholder="EQP-..." />
            </div>

            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                {isRTL ? "التصنيف" : "Category"}
              </label>
              <select name="category" value={formData.category} onChange={handleChange} style={getInputStyle()}>
                <option value="أجهزة إلكترونية">{isRTL ? "أجهزة إلكترونية" : "Electronics"}</option>
                <option value="أثاث ومعدات">{isRTL ? "أثاث ومعدات" : "Furniture & Equipment"}</option>
                <option value="مركبات ووسائل نقل">{isRTL ? "مركبات ووسائل نقل" : "Vehicles & Transport"}</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                {isRTL ? "تكلفة الشراء (YER)" : "Purchase Cost (YER)"}
              </label>
              <input name="cost" type="number" value={formData.cost} onChange={handleChange} style={getInputStyle()} />
            </div>

            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                {isRTL ? "تاريخ الشراء" : "Purchase Date"}
              </label>
              <input name="purchase_date" type="date" value={formData.purchase_date} onChange={handleChange} style={getInputStyle()} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                {isRTL ? "موقع الأصل / المستودع" : "Asset Location / Warehouse"}
              </label>
              <select name="location" value={formData.location} onChange={handleChange} style={getInputStyle()}>
                <option value="المستودع الرئيسي">{isRTL ? "المستودع الرئيسي" : "Main Warehouse"}</option>
                <option value="مستودع الفروع">{isRTL ? "مستودع الفروع" : "Branches Warehouse"}</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                {isRTL ? "حالة التشغيل" : "Operational Status"}
              </label>
              <select name="status" value={formData.status} onChange={handleChange} style={getInputStyle()}>
                <option value="excellent">{isRTL ? "يعمل بممتاز" : "Excellent"}</option>
                <option value="needs_maintenance">{isRTL ? "يحتاج صيانة" : "Needs Maintenance"}</option>
                <option value="broken">{isRTL ? "خارج الخدمة / تالف" : "Broken/Scrap"}</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            <button type="submit" style={{ flex: 1, height: 60, background: "linear-gradient(135deg, #10B981, #059669)", border: "none", borderRadius: 14, color: "white", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
              {isRTL ? "حفظ" : "Save"}
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, height: 60, background: isDark ? ds.surface2 : "#E2E8F0", border: "none", borderRadius: 14, color: ds.textPrimary, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
