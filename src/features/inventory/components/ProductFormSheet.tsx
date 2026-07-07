import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Package, Image as ImageIcon, Barcode, Plus, Layers, Store, MonitorSmartphone, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";
import { MOCK_CATEGORIES, MOCK_UNITS } from "@/core/data/salesMockData";
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";

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

function SmartInput({ label, value, onChange, options, placeholder, isRTL, ds, isDark, onAddNew }: any) {
  const [query, setQuery] = useState(() => options.find((o: any) => o.id === value)?.name || "");
  const isMatch = options.some((o: any) => o.name.toLowerCase() === query.toLowerCase());
  
  useEffect(() => {
    const matched = options.find((o: any) => o.name.toLowerCase() === query.toLowerCase());
    if (matched) onChange(matched.id);
    else onChange(""); // reset ID if not matched
  }, [query]);

  const listId = "list_" + label.replace(/\s+/g, '');

  return (
    <div>
      <label style={{ display: "block", color: ds.textSecondary, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{label}</label>
      <input 
        list={listId}
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", height: 56, padding: "0 16px", boxSizing: "border-box",
          background: isDark ? ds.surface2 : "#FFFFFF",
          border: `1px solid ${isDark ? ds.border : "#CBD5E1"}`, borderRadius: 12,
          color: ds.textPrimary, fontSize: 16, fontWeight: 600,
          outline: "none", fontFamily: "inherit", transition: "0.2s"
        }}
        onFocus={e => e.target.style.borderColor = "#10B981"}
        onBlur={e => e.target.style.borderColor = isDark ? ds.border : "#CBD5E1"}
      />
      <datalist id={listId}>
        {options.map((o: any) => <option key={o.id} value={o.name} />)}
      </datalist>
      {!isMatch && query.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          type="button"
          onClick={() => {
            onAddNew(query);
            // We pretend we added it and got an ID back for the demo
            const newId = `new_${Date.now()}`;
            options.push({ id: newId, name: query }); // Mutating just for UX demo
            onChange(newId);
          }}
          style={{
            marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", background: "rgba(16,185,129,0.1)", color: "#10B981",
            borderRadius: 8, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer"
          }}
        >
          <Plus size={16} /> {isRTL ? `إضافة "${query}" كجديد` : `Add "${query}" as new`}
        </motion.button>
      )}
    </div>
  );
}

export function ProductFormSheet({ product, onClose, onSave }: ProductFormSheetProps) {
  const { isDark, isRTL, ds } = useApp();
  const toast = useToast();
  
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

  const [showAdvancedUnits, setShowAdvancedUnits] = useState(formData.units.length > 1);
  const [showAdvancedChannels, setShowAdvancedChannels] = useState(formData.channels.some(c => c.is_enabled && c.channel_id !== "ch_pos"));
  const [unitToDelete, setUnitToDelete] = useState<string | null>(null);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const getInputStyle = () => ({
    width: "100%", height: 56, padding: "0 16px", boxSizing: "border-box",
    background: isDark ? ds.surface2 : "#FFFFFF",
    border: `1px solid ${border}`, borderRadius: 12,
    color: ds.textPrimary, fontSize: 16, fontWeight: 600,
    outline: "none", fontFamily: "inherit"
  });

  const catOptions = useMemo(() => MOCK_CATEGORIES.map(c => ({ id: c.id, name: c.category_name })), []);
  const brandOptions = useMemo(() => [{id: "b1", name: "Apple"}, {id: "b2", name: "Samsung"}], []);
  const unitOptions = useMemo(() => MOCK_UNITS.map(u => ({ id: u.id, name: u.unit_name })), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.warning(isRTL ? "يرجى إدخال اسم المنتج" : "Please enter product name");
      return;
    }
    onSave(formData);
  };

  const updateBaseUnit = (field: string, value: any) => {
    setFormData(prev => {
      const newUnits = [...prev.units];
      if (newUnits[0]) newUnits[0] = { ...newUnits[0], [field]: value };
      return { ...prev, units: newUnits };
    });
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

  const removeUnit = (id: string) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.filter(u => u.id !== id || u.is_base_unit)
    }));
  };

  const updateChannel = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.map(c => c.channel_id === id ? { ...c, [field]: value } : c)
    }));
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ position: "relative", width: "100%", maxWidth: 850, maxHeight: "90vh", display: "flex", flexDirection: "column", background: bg, borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
        
        {/* Header */}
        <div style={{ background: surface, padding: "24px", borderBottom: `1px solid ${border}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #4F46E5, #4338CA)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Package size={28} color="white" />
            </div>
            <div>
              <h2 style={{ color: ds.textPrimary, fontSize: 22, fontWeight: 900, margin: 0 }}>
                {product ? (isRTL ? "تعديل المنتج" : "Edit Product") : (isRTL ? "إضافة منتج جديد" : "Add New Product")}
              </h2>
              <p style={{ color: ds.textSecondary, fontSize: 14, margin: "4px 0 0 0", fontWeight: 600 }}>
                {isRTL ? "إدخال سريع وسلس عبر شاشة اللمس" : "Fast and seamless touch entry"}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={28} />
          </button>
        </div>

        {/* Progressive Form Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 32, display: "flex", flexDirection: "column", gap: 32 }}>
          
          {/* Step 1: Basic Essential Info */}
          <div>
            <h3 style={{ margin: "0 0 20px 0", fontSize: 18, fontWeight: 800, color: ds.textPrimary }}>{isRTL ? "1. المعلومات الأساسية" : "1. Basic Info"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label style={{ display: "block", color: ds.textSecondary, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "اسم المنتج *" : "Product Name *"}</label>
                <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required style={{...(getInputStyle() as any), fontSize: 18, fontWeight: 800, borderColor: "#6366F1"}} placeholder={isRTL ? "اسم المنتج بالعربية..." : "Product name..."} />
              </div>
              <div>
                <label style={{ display: "block", color: ds.textSecondary, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "الاسم بالإنجليزية" : "Name (English)"}</label>
                <input value={formData.name_en} onChange={e => setFormData(p => ({ ...p, name_en: e.target.value }))} style={getInputStyle() as any} placeholder="Product name in English..." dir="ltr" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 16 }}>
              <SmartInput 
                label={isRTL ? "التصنيف" : "Category"} 
                value={formData.category_id} 
                onChange={(v: string) => setFormData(p => ({ ...p, category_id: v }))} 
                options={catOptions} 
                placeholder={isRTL ? "اختر أو اكتب لإضافة تصنيف جديد..." : "Select or type new..."} 
                isRTL={isRTL} ds={ds} isDark={isDark} 
                onAddNew={(name: string) => toast.success(isRTL ? `تمت إضافة التصنيف ${name}` : `Added category ${name}`)}
              />
              <SmartInput 
                label={isRTL ? "الماركة (Brand)" : "Brand"} 
                value={formData.brand_id} 
                onChange={(v: string) => setFormData(p => ({ ...p, brand_id: v }))} 
                options={brandOptions} 
                placeholder={isRTL ? "اختر أو اكتب علامة تجارية..." : "Select or type brand..."} 
                isRTL={isRTL} ds={ds} isDark={isDark} 
                onAddNew={(name: string) => toast.success(isRTL ? `تمت إضافة الماركة ${name}` : `Added brand ${name}`)}
              />
            </div>
            
            <div style={{ marginTop: 8 }}>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "الوصف" : "Description"}</label>
              <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={2} style={{ ...(getInputStyle() as any), height: "auto", padding: 16 }} />
            </div>
          </div>

          <div style={{ width: "100%", height: 1, background: isDark ? ds.border : "#E2E8F0" }} />

          {/* Step 2: Pricing & Default Unit */}
          <div>
             <h3 style={{ margin: "0 0 20px 0", fontSize: 18, fontWeight: 800, color: ds.textPrimary }}>{isRTL ? "2. التسعير والوحدة الافتراضية" : "2. Pricing & Default Unit"}</h3>
             
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
                <SmartInput 
                  label={isRTL ? "الوحدة الافتراضية *" : "Default Unit *"} 
                  value={formData.units[0]?.unit_id} 
                  onChange={(v: string) => updateBaseUnit("unit_id", v)} 
                  options={unitOptions} 
                  placeholder={isRTL ? "مثال: حبة، كرتون..." : "e.g. Piece, Box..."} 
                  isRTL={isRTL} ds={ds} isDark={isDark} 
                  onAddNew={(name: string) => toast.success(isRTL ? `تمت إضافة الوحدة ${name}` : `Added unit ${name}`)}
                />
                <div>
                  <label style={{ display: "block", color: ds.textSecondary, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "الباركود" : "Barcode"}</label>
                  <div style={{ position: "relative" }}>
                    <Barcode size={24} color={ds.textMuted} style={{ position: "absolute", top: 16, [isRTL ? "right" : "left"]: 16 }} />
                    <input 
                      value={formData.units[0]?.barcode || ""} 
                      onChange={e => updateBaseUnit("barcode", e.target.value)}
                      style={{ ...(getInputStyle() as any), paddingInlineStart: 50, fontFamily: "monospace", fontSize: 18 }} 
                      placeholder="||||||||||||||" 
                    />
                  </div>
                </div>
             </div>

             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ background: "rgba(239,68,68,0.05)", padding: 20, borderRadius: 16, border: "1px solid rgba(239,68,68,0.2)" }}>
                  <label style={{ display: "block", color: "#EF4444", fontSize: 15, fontWeight: 800, marginBottom: 12 }}>{isRTL ? "سعر الشراء / التكلفة *" : "Purchase Cost *"}</label>
                  <input 
                    type="number" 
                    value={formData.units[0]?.purchase_price} 
                    onChange={e => updateBaseUnit("purchase_price", Number(e.target.value))}
                    style={{ width: "100%", height: 60, background: "white", border: "none", borderRadius: 12, fontSize: 24, fontWeight: 900, color: "#EF4444", padding: "0 16px", outline: "none", textAlign: "center", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)", boxSizing: "border-box" }}
                    placeholder="0.00"
                  />
                </div>
                <div style={{ background: "rgba(16,185,129,0.05)", padding: 20, borderRadius: 16, border: "1px solid rgba(16,185,129,0.2)" }}>
                  <label style={{ display: "block", color: "#10B981", fontSize: 15, fontWeight: 800, marginBottom: 12 }}>{isRTL ? "سعر البيع الافتراضي *" : "Default Selling Price *"}</label>
                  <input 
                    type="number" 
                    value={formData.units[0]?.selling_price} 
                    onChange={e => updateBaseUnit("selling_price", Number(e.target.value))}
                    style={{ width: "100%", height: 60, background: "white", border: "none", borderRadius: 12, fontSize: 24, fontWeight: 900, color: "#10B981", padding: "0 16px", outline: "none", textAlign: "center", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)", boxSizing: "border-box" }}
                    placeholder="0.00"
                  />
                </div>
             </div>
          </div>

          <div style={{ width: "100%", height: 1, background: isDark ? ds.border : "#E2E8F0" }} />

          {/* Step 3: Images */}
          <div>
             <h3 style={{ margin: "0 0 20px 0", fontSize: 18, fontWeight: 800, color: ds.textPrimary }}>{isRTL ? "3. صورة المنتج" : "3. Product Image"}</h3>
             <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
                <label style={{ width: 120, height: 120, borderRadius: 20, border: `3px dashed ${isDark ? ds.border : "#CBD5E1"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: ds.textSecondary, cursor: "pointer", flexShrink: 0, background: isDark ? ds.surface2 : "#F8FAFC", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.borderColor="#6366F1"} onMouseOut={e=>e.currentTarget.style.borderColor=isDark?ds.border:"#CBD5E1"}>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                    if(e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0];
                      const imageUrl = URL.createObjectURL(file);
                      setFormData(p => ({ ...p, images: [...(p.images || []), imageUrl] }));
                    }
                  }} />
                  <ImageIcon size={32} color={ds.textMuted} style={{ marginBottom: 8 }} />
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{isRTL ? "رفع صورة" : "Upload"}</span>
                </label>
                {formData.images?.map((img, idx) => (
                  <div key={idx} style={{ position: "relative", width: 120, height: 120, borderRadius: 20, border: `1px solid ${border}`, flexShrink: 0, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    <img src={img} alt={`Product ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button type="button" onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))} style={{ position: "absolute", top: 6, right: 6, width: 32, height: 32, borderRadius: "50%", background: "rgba(239, 68, 68, 0.9)", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <X size={18} />
                    </button>
                  </div>
                ))}
             </div>
          </div>

          <div style={{ width: "100%", height: 1, background: isDark ? ds.border : "#E2E8F0" }} />

          {/* Advanced: Units */}
          <div style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderRadius: 20, border: `1px solid ${border}`, overflow: "hidden" }}>
             <button type="button" onClick={() => setShowAdvancedUnits(!showAdvancedUnits)} style={{ width: "100%", padding: 24, display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer" }}>
               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                 <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <Layers size={22} color="#6366F1" />
                 </div>
                 <div style={{ textAlign: isRTL ? "right" : "left" }}>
                   <h3 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 800, color: ds.textPrimary }}>{isRTL ? "وحدات متعددة (اختياري)" : "Multiple Units (Optional)"}</h3>
                   <p style={{ margin: 0, fontSize: 13, color: ds.textSecondary, fontWeight: 600 }}>{isRTL ? "إضافة وحدات كبرى مثل (كرتون، درزن) مع تحديد معاملات التحويل." : "Add larger units (Box, Dozen) with conversion rates."}</p>
                 </div>
               </div>
               {showAdvancedUnits ? <ChevronUp size={24} color={ds.textMuted} /> : <ChevronDown size={24} color={ds.textMuted} />}
             </button>
             
             <AnimatePresence>
               {showAdvancedUnits && (
                 <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
                   <div style={{ padding: "0 24px 24px" }}>
                     {formData.units.slice(1).map((unit, index) => (
                       <div key={unit.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, marginBottom: 16, position: "relative" }}>
                         <button type="button" onClick={() => setUnitToDelete(unit.id)} style={{ position: "absolute", top: 20, [isRTL ? "left" : "right"]: 20, background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", zIndex: 2 }}>
                           <Trash2 size={20} color="#EF4444" />
                         </button>
                         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16, paddingInlineEnd: 48 }}>
                           <SmartInput 
                             label={isRTL ? "الوحدة الكبرى" : "Larger Unit"} 
                             value={unit.unit_id} 
                             onChange={(v: string) => updateUnit(unit.id, "unit_id", v)} 
                             options={unitOptions} 
                             placeholder={isRTL ? "مثال: كرتون" : "e.g. Box"} 
                             isRTL={isRTL} ds={ds} isDark={isDark} 
                             onAddNew={(name: string) => toast.success(isRTL ? `تمت إضافة الوحدة ${name}` : `Added unit ${name}`)}
                           />
                           <div>
                             <label style={{ display: "block", color: ds.textSecondary, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "يحتوي على كم وحدة أساسية؟" : "Equals how many base units?"}</label>
                             <input type="number" value={unit.conversion_factor} onChange={e => updateUnit(unit.id, "conversion_factor", Number(e.target.value))} required style={getInputStyle() as any} />
                           </div>
                         </div>
                         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                           <div>
                             <label style={{ display: "block", color: ds.textSecondary, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "سعر بيع الوحدة الكبرى" : "Large Unit Selling Price"}</label>
                             <input type="number" value={unit.selling_price || ""} onChange={e => updateUnit(unit.id, "selling_price", Number(e.target.value))} required style={{...(getInputStyle() as any), color: "#10B981", fontWeight: 800}} placeholder="0.00" />
                           </div>
                           <div>
                             <label style={{ display: "block", color: ds.textSecondary, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "باركود الوحدة الكبرى" : "Large Unit Barcode"}</label>
                             <input value={unit.barcode} onChange={e => updateUnit(unit.id, "barcode", e.target.value)} style={getInputStyle() as any} placeholder="||||||||||||||" />
                           </div>
                         </div>
                       </div>
                     ))}
                     <button type="button" onClick={addUnit} style={{ width: "100%", background: "transparent", border: `2px dashed ${border}`, borderRadius: 16, padding: 20, color: "#6366F1", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
                       <Plus size={24} strokeWidth={3} /> {isRTL ? "إضافة وحدة إضافية" : "Add Another Unit"}
                     </button>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
          
          {/* Advanced: Channels */}
          <div style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderRadius: 20, border: `1px solid ${border}`, overflow: "hidden" }}>
             <button type="button" onClick={() => setShowAdvancedChannels(!showAdvancedChannels)} style={{ width: "100%", padding: 24, display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer" }}>
               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                 <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <Store size={22} color="#10B981" />
                 </div>
                 <div style={{ textAlign: isRTL ? "right" : "left" }}>
                   <h3 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 800, color: ds.textPrimary }}>{isRTL ? "قنوات البيع (اختياري)" : "Sales Channels (Optional)"}</h3>
                   <p style={{ margin: 0, fontSize: 13, color: ds.textSecondary, fontWeight: 600 }}>{isRTL ? "تخصيص أسعار المنتجات للمتجر الإلكتروني أو التطبيق." : "Customize prices for Ecommerce or App."}</p>
                 </div>
               </div>
               {showAdvancedChannels ? <ChevronUp size={24} color={ds.textMuted} /> : <ChevronDown size={24} color={ds.textMuted} />}
             </button>
             
             <AnimatePresence>
               {showAdvancedChannels && (
                 <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
                   <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                     {formData.channels.map(channel => (
                       <div key={channel.channel_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: "20px 24px" }}>
                         <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                           <div style={{ width: 56, height: 56, borderRadius: 16, background: isDark ? ds.surface2 : "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${border}` }}>
                             {channel.channel_id === "ch_pos" ? <MonitorSmartphone size={28} color={ds.primary} /> : <Store size={28} color="#8B5CF6" />}
                           </div>
                           <div>
                             <h4 style={{ margin: "0 0 8px 0", color: ds.textPrimary, fontSize: 16, fontWeight: 800 }}>{channel.channel_name}</h4>
                             <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", color: ds.textSecondary, fontSize: 14, fontWeight: 700 }}>
                               <input type="checkbox" checked={channel.is_enabled} onChange={e => updateChannel(channel.channel_id, "is_enabled", e.target.checked)} style={{ width: 24, height: 24, accentColor: "#10B981" }} />
                               {isRTL ? "نشر في هذه القناة" : "Publish to channel"}
                             </label>
                           </div>
                         </div>
                         <div style={{ width: 180 }}>
                           <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "سعر البيع المخصص" : "Custom Price"}</label>
                           <input type="number" disabled={!channel.is_enabled} value={channel.sale_price || ""} onChange={e => updateChannel(channel.channel_id, "sale_price", Number(e.target.value))} style={{ ...(getInputStyle() as any), opacity: channel.is_enabled ? 1 : 0.4 }} placeholder={isRTL ? "السعر الافتراضي" : "Default"} />
                         </div>
                       </div>
                     ))}
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

        </div>

        {/* Sticky Footer */}
        <div style={{ padding: "24px 32px", background: surface, borderTop: `1px solid ${border}`, display: "flex", gap: 16, flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, height: 60, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 16, color: ds.textSecondary, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
            {isRTL ? "إلغاء" : "Cancel"}
          </button>
          <button type="button" onClick={handleSubmit} style={{ flex: 2, height: 60, background: "linear-gradient(135deg, #10B981, #059669)", border: "none", borderRadius: 16, color: "white", fontSize: 18, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: "0 8px 20px rgba(16,185,129,0.3)" }}>
            <Check size={24} strokeWidth={3} /> {isRTL ? "حفظ المنتج" : "Save Product"}
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
