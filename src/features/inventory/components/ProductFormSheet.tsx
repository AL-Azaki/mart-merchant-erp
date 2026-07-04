import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Package, Image as ImageIcon, Barcode, Tag, Plus, Info, Layers, Store, MonitorSmartphone, Trash2 } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";
import { MOCK_CATEGORIES, MOCK_UNITS } from "@/core/data/salesMockData";
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";

// Expanded Type for Form
export interface ProductFormData {
  id?: string;
  name: string;
  name_en: string;
  category_id: string;
  brand_id: string;
  description: string;
  is_active: boolean;
  images: string[];
  track_stock: boolean;
  units: {
    id: string;
    unit_id: string;
    is_base_unit: boolean;
    conversion_factor: number;
    barcode: string;
    sku: string;
    purchase_price: number;
    selling_price: number;
    minimum_price: number;
  }[];
  channels: {
    channel_id: string;
    channel_name: string;
    is_enabled: boolean;
    sale_price: number;
  }[];
}

interface ProductFormSheetProps {
  product?: any | null;
  onClose: () => void;
  onSave: (product: ProductFormData) => void;
}

export function ProductFormSheet({ product, onClose, onSave }: ProductFormSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"basic" | "units" | "channels">("basic");
  const [unitToDelete, setUnitToDelete] = useState<string | null>(null);

  const defaultSysUnit = MOCK_UNITS.find(u => u.is_default) || MOCK_UNITS[0];
  const defaultUnitId = defaultSysUnit?.id || "";

  const [formData, setFormData] = useState<ProductFormData>({
    id: product?.id,
    name: product?.product_name || product?.name || "",
    name_en: product?.name_en || "",
    category_id: product?.category_id || "",
    brand_id: product?.brand_id || "",
    description: product?.description || "",
    is_active: product?.is_active ?? true,
    images: product?.images || [],
    track_stock: product?.track_stock ?? true,
    units: product?.units || [
      { id: Date.now().toString(), unit_id: defaultUnitId, is_base_unit: true, conversion_factor: 1, barcode: "", sku: "", purchase_price: 0, selling_price: 0, minimum_price: 0 }
    ],
    channels: product?.channels || [
      { channel_id: "ch_pos", channel_name: isRTL ? "نقطة البيع (POS)" : "POS", is_enabled: true, sale_price: 0 },
      { channel_id: "ch_web", channel_name: isRTL ? "المتجر الإلكتروني (Web)" : "E-commerce", is_enabled: false, sale_price: 0 },
      { channel_id: "ch_app", channel_name: isRTL ? "تطبيق العملاء (App)" : "Mobile App", is_enabled: false, sale_price: 0 }
    ]
  });

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const getInputStyle = () => ({
    width: "100%", height: 44, padding: "0 12px",
    background: isDark ? ds.surface2 : "#FFFFFF",
    border: `1px solid ${border}`, borderRadius: 10,
    color: ds.textPrimary, fontSize: 13, fontWeight: 500,
    outline: "none", fontFamily: "inherit"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.warning(isRTL ? "يرجى إدخال اسم المنتج" : "Please enter product name");
      return;
    }
    onSave(formData);
  };

  const addUnit = () => {
    setFormData(prev => ({
      ...prev,
      units: [
        ...prev.units,
        { id: Date.now().toString(), unit_id: "", is_base_unit: false, conversion_factor: 1, barcode: "", sku: "", purchase_price: 0, selling_price: 0, minimum_price: 0 }
      ]
    }));
  };

  const updateUnit = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.map(u => u.id === id ? { ...u, [field]: value } : u)
    }));
  };

  const setAsBaseUnit = (id: string) => {
    setFormData(prev => {
      const updatedUnits = prev.units.map(u => {
        if (u.id === id) {
          return { ...u, is_base_unit: true, conversion_factor: 1 };
        } else {
          return { ...u, is_base_unit: false };
        }
      });
      // Move the base unit to index 0
      const baseIdx = updatedUnits.findIndex(u => u.is_base_unit);
      if (baseIdx > 0) {
        const [base] = updatedUnits.splice(baseIdx, 1);
        updatedUnits.unshift(base);
      }
      return { ...prev, units: updatedUnits };
    });
    toast.success(isRTL ? "تم تعيين الوحدة الأساسية للمنتج!" : "Base unit of product set!");
  };

  const removeUnit = (id: string) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.filter(u => u.id !== id || u.is_base_unit) // Prevent removing base unit
    }));
  };

  const updateChannel = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.map(c => c.channel_id === id ? { ...c, [field]: value } : c)
    }));
  };

  const tabs = [
    { id: "basic", label: isRTL ? "البيانات الأساسية" : "Basic Info", icon: Info },
    { id: "units", label: isRTL ? "الوحدات والأسعار" : "Units & Prices", icon: Layers },
    { id: "channels", label: isRTL ? "قنوات البيع" : "Sales Channels", icon: Store }
  ] as const;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ position: "relative", width: "100%", maxWidth: 900, maxHeight: "90vh", display: "flex", flexDirection: "column", background: bg, borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
        
        {/* Header */}
        <div style={{ background: surface, padding: "20px 24px 0", borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Package size={22} color="#6366F1" />
              </div>
              <div>
                <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, margin: 0 }}>
                  {product ? (isRTL ? "تعديل المنتج" : "Edit Product") : (isRTL ? "إضافة منتج جديد" : "Add New Product")}
                </h2>
                <p style={{ color: ds.textSecondary, fontSize: 13, margin: 0 }}>
                  {isRTL ? "إعدادات المنتج المتقدمة لجميع قنوات البيع" : "Advanced product settings for all channels"}
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
              <X size={24} color={ds.textPrimary} />
            </button>
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "0 4px 16px", background: "none", border: "none",
                    cursor: "pointer", position: "relative", color: isActive ? "#6366F1" : ds.textSecondary,
                    fontWeight: isActive ? 700 : 600, fontSize: 14, fontFamily: "inherit",
                  }}>
                  <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {tab.label}
                  {isActive && <motion.div layoutId="productTabIndicator" style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 3, background: "#6366F1", borderRadius: "3px 3px 0 0" }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <AnimatePresence mode="wait">
            {activeTab === "basic" && (
              <motion.div key="basic" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "اسم المنتج *" : "Product Name *"}</label>
                    <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required style={getInputStyle()} placeholder={isRTL ? "مثال: ايفون 15 برو" : "e.g. iPhone 15 Pro"} />
                  </div>
                  <div>
                    <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "الاسم بالإنجليزية" : "Name (English)"}</label>
                    <input value={formData.name_en} onChange={e => setFormData(p => ({ ...p, name_en: e.target.value }))} style={getInputStyle()} placeholder="iPhone 15 Pro" dir="ltr" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "التصنيف" : "Category"}</label>
                    <select value={formData.category_id} onChange={e => setFormData(p => ({ ...p, category_id: e.target.value }))} style={getInputStyle()}>
                      <option value="">{isRTL ? "اختر تصنيف..." : "Select category..."}</option>
                      {MOCK_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "الماركة (Brand)" : "Brand"}</label>
                    <select value={formData.brand_id} onChange={e => setFormData(p => ({ ...p, brand_id: e.target.value }))} style={getInputStyle()}>
                      <option value="">{isRTL ? "بدون ماركة" : "No Brand"}</option>
                      <option value="b1">Apple</option>
                      <option value="b2">Samsung</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "الوصف" : "Description"}</label>
                  <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...getInputStyle(), height: "auto", padding: 12 }} />
                </div>

                {/* Base Unit Pricing Quick Section */}
                <div style={{ background: isDark ? ds.surface2 : "#F1F5F9", padding: 20, borderRadius: 16, border: `1px solid ${border}`, display: "flex", flexDirection: "column", gap: 16 }}>
                  <h3 style={{ margin: 0, color: ds.textPrimary, fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                    <Layers size={18} color="#6366F1" />
                    {isRTL ? "بيانات التسعير والوحدة الافتراضية للمنتج" : "Pricing & Product Default Unit"}
                  </h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "الوحدة الافتراضية للمنتج *" : "Product Default Unit *"}</label>
                      <select 
                        value={formData.units[0]?.unit_id || ""} 
                        onChange={e => {
                          const val = e.target.value;
                          setFormData(prev => {
                            const newUnits = [...prev.units];
                            if (newUnits[0]) newUnits[0].unit_id = val;
                            return { ...prev, units: newUnits };
                          });
                        }} 
                        required 
                        style={getInputStyle()}
                      >
                        <option value="">{isRTL ? "اختر الوحدة..." : "Select unit..."}</option>
                        {MOCK_UNITS.map(u => <option key={u.id} value={u.id}>{u.unit_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "الباركود" : "Barcode"}</label>
                      <div style={{ position: "relative" }}>
                        <Barcode size={16} color={ds.textMuted} style={{ position: "absolute", top: 14, [isRTL ? "right" : "left"]: 12 }} />
                        <input 
                          value={formData.units[0]?.barcode || ""} 
                          onChange={e => {
                            const val = e.target.value;
                            setFormData(prev => {
                              const newUnits = [...prev.units];
                              if (newUnits[0]) newUnits[0].barcode = val;
                              return { ...prev, units: newUnits };
                            });
                          }} 
                          style={{ ...getInputStyle(), paddingInlineStart: 36 }} 
                          placeholder="123456789" 
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "سعر الشراء / التكلفة *" : "Purchase Cost *"}</label>
                      <input 
                        type="number" 
                        value={formData.units[0]?.purchase_price || ""} 
                        onChange={e => {
                          const val = Number(e.target.value);
                          setFormData(prev => {
                            const newUnits = [...prev.units];
                            if (newUnits[0]) newUnits[0].purchase_price = val;
                            return { ...prev, units: newUnits };
                          });
                        }} 
                        required 
                        style={{ ...getInputStyle(), color: "#EF4444", fontWeight: 700 }} 
                        placeholder="0.00" 
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "سعر البيع *" : "Selling Price *"}</label>
                      <input 
                        type="number" 
                        value={formData.units[0]?.selling_price || ""} 
                        onChange={e => {
                          const val = Number(e.target.value);
                          setFormData(prev => {
                            const newUnits = [...prev.units];
                            if (newUnits[0]) newUnits[0].selling_price = val;
                            return { ...prev, units: newUnits };
                          });
                        }} 
                        required 
                        style={{ ...getInputStyle(), color: "#10B981", fontWeight: 700 }} 
                        placeholder="0.00" 
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "الحد الأدنى للسعر" : "Minimum Price"}</label>
                      <input 
                        type="number" 
                        value={formData.units[0]?.minimum_price || ""} 
                        onChange={e => {
                          const val = Number(e.target.value);
                          setFormData(prev => {
                            const newUnits = [...prev.units];
                            if (newUnits[0]) newUnits[0].minimum_price = val;
                            return { ...prev, units: newUnits };
                          });
                        }} 
                        style={getInputStyle()} 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "صور المنتج" : "Product Images"}</label>
                  <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
                    <label style={{ width: 100, height: 100, borderRadius: 12, border: `2px dashed ${border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: ds.textSecondary, cursor: "pointer", flexShrink: 0 }}>
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                        if(e.target.files && e.target.files.length > 0) {
                          const file = e.target.files[0];
                          const imageUrl = URL.createObjectURL(file);
                          setFormData(p => ({ ...p, images: [...(p.images || []), imageUrl] }));
                          toast.success(isRTL ? "تم تحميل الصورة بنجاح للمعاينة!" : "Image uploaded successfully for preview!");
                        }
                      }} />
                      <ImageIcon size={24} style={{ marginBottom: 4 }} />
                      <span style={{ fontSize: 11, fontWeight: 600 }}>{isRTL ? "رفع صورة" : "Upload"}</span>
                    </label>
                    {/* Render actual uploaded images */}
                    {formData.images?.map((img, idx) => (
                      <div key={idx} style={{ position: "relative", width: 100, height: 100, borderRadius: 12, border: `1px solid ${border}`, flexShrink: 0, overflow: "hidden" }}>
                        <img src={img} alt={`Product ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button type="button" onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))} style={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: "50%", background: "rgba(239, 68, 68, 0.9)", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: isDark ? ds.surface2 : "#F8FAFC", padding: 16, borderRadius: 12, border: `1px solid ${border}` }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
                    <input type="checkbox" checked={formData.track_stock} onChange={e => setFormData(p => ({ ...p, track_stock: e.target.checked }))} style={{ width: 18, height: 18, accentColor: "#6366F1" }} />
                    {isRTL ? "تتبع المخزون لهذا المنتج" : "Track inventory stock for this product"}
                  </label>
                </div>
              </motion.div>
            )}

            {activeTab === "units" && (
              <motion.div key="units" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ background: "rgba(59,130,246,0.1)", padding: 16, borderRadius: 12, color: "#3B82F6", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <Info size={18} />
                  {isRTL ? "يجب أن يحتوي المنتج على وحدة أساسية واحدة على الأقل. يمكنك إضافة وحدات كبرى (مثل كرتون) وتحديد معامل التحويل." : "Product must have at least one base unit. You can add larger units (e.g. Box) with conversion factors."}
                </div>

                {formData.units.map((unit, index) => (
                  <div key={unit.id} style={{ background: surface, border: `1px solid ${unit.is_base_unit ? "#10B981" : border}`, borderRadius: 16, padding: 20, position: "relative", boxShadow: unit.is_base_unit ? "0 4px 12px rgba(16,185,129,0.08)" : "none" }}>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      {unit.is_base_unit ? (
                        <div style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                          <Check size={14} strokeWidth={3} />
                          {isRTL ? "الوحدة الأساسية الافتراضية" : "Default Base Unit"}
                        </div>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => setAsBaseUnit(unit.id)}
                          style={{ background: isDark ? ds.surface2 : "#F8FAFC", border: `1px solid ${border}`, color: "#6366F1", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = isDark ? ds.surface2 : "#F8FAFC"; }}
                        >
                          {isRTL ? "تعيين كوحدة أساسية" : "Set as Base"}
                        </button>
                      )}
                      
                      {!unit.is_base_unit && (
                        <button type="button" onClick={() => setUnitToDelete(unit.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                          <Trash2 size={18} color="#EF4444" />
                        </button>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                      <div>
                        <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "الوحدة" : "Unit"}</label>
                        <select value={unit.unit_id} onChange={e => updateUnit(unit.id, "unit_id", e.target.value)} required style={getInputStyle()}>
                          <option value="">{isRTL ? "اختر الوحدة..." : "Select unit..."}</option>
                          {MOCK_UNITS.map(u => <option key={u.id} value={u.id}>{u.unit_name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "معامل التحويل" : "Conversion Factor"}</label>
                        <input type="number" value={unit.conversion_factor} disabled={unit.is_base_unit} onChange={e => updateUnit(unit.id, "conversion_factor", Number(e.target.value))} required style={{ ...getInputStyle(), background: unit.is_base_unit ? (isDark ? ds.surface2 : "#F1F5F9") : undefined }} />
                      </div>
                      <div>
                        <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "الباركود" : "Barcode"}</label>
                        <div style={{ position: "relative" }}>
                          <Barcode size={16} color={ds.textMuted} style={{ position: "absolute", top: 14, [isRTL ? "right" : "left"]: 12 }} />
                          <input value={unit.barcode} onChange={e => updateUnit(unit.id, "barcode", e.target.value)} style={{ ...getInputStyle(), paddingInlineStart: 36 }} placeholder="123456789" />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "سعر التكلفة" : "Purchase Price"}</label>
                        <input type="number" value={unit.purchase_price || ""} onChange={e => updateUnit(unit.id, "purchase_price", Number(e.target.value))} required style={{ ...getInputStyle(), color: "#EF4444", fontWeight: 700 }} placeholder="0.00" />
                      </div>
                      <div>
                        <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "سعر البيع" : "Selling Price"}</label>
                        <input type="number" value={unit.selling_price || ""} onChange={e => updateUnit(unit.id, "selling_price", Number(e.target.value))} required style={{ ...getInputStyle(), color: "#10B981", fontWeight: 700 }} placeholder="0.00" />
                      </div>
                      <div>
                        <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "الحد الأدنى للسعر" : "Minimum Price"}</label>
                        <input type="number" value={unit.minimum_price || ""} onChange={e => updateUnit(unit.id, "minimum_price", Number(e.target.value))} required style={getInputStyle()} placeholder="0.00" />
                      </div>
                    </div>
                  </div>
                ))}

                <button type="button" onClick={addUnit} style={{ background: "none", border: `2px dashed ${border}`, borderRadius: 12, padding: 16, color: "#6366F1", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
                  <Plus size={18} /> {isRTL ? "إضافة وحدة جديدة (مثل كرتون)" : "Add New Unit (e.g. Box)"}
                </button>
              </motion.div>
            )}

            {activeTab === "channels" && (
              <motion.div key="channels" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "rgba(16,185,129,0.1)", padding: 16, borderRadius: 12, color: "#10B981", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <Info size={18} />
                  {isRTL ? "حدد أين ترغب بعرض هذا المنتج، وما هو سعر البيع المخصص لكل منصة." : "Select where to display this product and its custom price per channel."}
                </div>

                {formData.channels.map(channel => (
                  <div key={channel.channel_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: isDark ? ds.surface2 : "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {channel.channel_id === "ch_pos" ? <MonitorSmartphone size={24} color={ds.primary} /> : <Store size={24} color="#8B5CF6" />}
                      </div>
                      <div>
                        <h4 style={{ margin: "0 0 4px 0", color: ds.textPrimary, fontSize: 15, fontWeight: 800 }}>{channel.channel_name}</h4>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>
                          <input type="checkbox" checked={channel.is_enabled} onChange={e => updateChannel(channel.channel_id, "is_enabled", e.target.checked)} style={{ width: 16, height: 16, accentColor: "#10B981" }} />
                          {isRTL ? "نشر المنتج في هذه القناة" : "Publish to this channel"}
                        </label>
                      </div>
                    </div>

                    <div style={{ width: 150 }}>
                      <label style={{ display: "block", color: ds.textSecondary, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{isRTL ? "سعر البيع المخصص" : "Custom Price"}</label>
                      <input type="number" disabled={!channel.is_enabled} value={channel.sale_price || ""} onChange={e => updateChannel(channel.channel_id, "sale_price", Number(e.target.value))} style={{ ...getInputStyle(), opacity: channel.is_enabled ? 1 : 0.5 }} placeholder={isRTL ? "السعر الافتراضي" : "Default"} />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", background: surface, borderTop: `1px solid ${border}`, display: "flex", gap: 12, flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, height: 48, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 12, color: ds.textSecondary, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            {isRTL ? "إلغاء" : "Cancel"}
          </button>
          <button type="button" onClick={handleSubmit} style={{ flex: 2, height: 48, background: "#6366F1", border: "none", borderRadius: 12, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Check size={20} strokeWidth={2.5} /> {isRTL ? "حفظ بيانات المنتج" : "Save Product Data"}
          </button>
        </div>
      </motion.div>
      <AnimatePresence>
        {unitToDelete && (
          <ConfirmDeleteModal 
            isOpen={true} 
            onClose={() => setUnitToDelete(null)}
            onConfirm={() => {
              removeUnit(unitToDelete);
              setUnitToDelete(null);
            }}
            itemName={isRTL ? "هذه الوحدة" : "this unit"}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
