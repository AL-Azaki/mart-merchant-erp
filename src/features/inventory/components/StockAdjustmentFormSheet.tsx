import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, FileText, CheckCircle, PackageSearch, Save, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

interface StockAdjustmentFormSheetProps {
  products: any[];
  onClose: () => void;
  onSave: (adjustment: any) => void;
}

export function StockAdjustmentFormSheet({ products, onClose, onSave }: StockAdjustmentFormSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";
  const primaryColor = "#3B82F6";

  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [lines, setLines] = useState<any[]>([]);

  const filteredProducts = products.filter(p => {
    const s = search.toLowerCase();
    return (
      (p.product_name && p.product_name.toLowerCase().includes(s)) || 
      (p.product_code && p.product_code.toLowerCase().includes(s))
    );
  });

  const addLine = (product: any) => {
    if (lines.find(l => l.product_id === product.id)) return;
    setLines([...lines, { 
      id: `tmp_${Date.now()}`,
      product_id: product.id,
      product: product,
      system_qty: 100, // In real app, fetch this from inventory stock DB
      physical_qty: "",
      discrepancy: 0
    }]);
    setSearch("");
  };

  const updateLine = (id: string, physical_qty: string) => {
    setLines(lines.map(l => {
      if (l.id === id) {
        const pQty = physical_qty === "" ? "" : parseFloat(physical_qty);
        const discrepancy = pQty === "" ? 0 : (pQty - l.system_qty);
        return { ...l, physical_qty: pQty, discrepancy };
      }
      return l;
    }));
  };

  const removeLine = (id: string) => setLines(lines.filter(l => l.id !== id));

  const handleSave = () => {
    const validLines = lines.filter(l => l.physical_qty !== "");
    if (validLines.length === 0) {
      alert("يرجى إدخال الجرد الفعلي لمنتج واحد على الأقل.");
      return;
    }
    const newAdj = {
      id: `adj_${Date.now()}`,
      adjustment_number: `SA-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      notes,
      lines: validLines.map(l => ({
        product_id: l.product_id,
        system_qty: l.system_qty,
        physical_qty: l.physical_qty,
        discrepancy: l.discrepancy
      }))
    };
    onSave(newAdj);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: isRTL ? "flex-start" : "flex-end" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} />
      
      <motion.div
        initial={{ x: isRTL ? "-100%" : "100%" }} animate={{ x: 0 }} exit={{ x: isRTL ? "-100%" : "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={{ position: "relative", width: "100%", maxWidth: 800, background: bg, display: "flex", flexDirection: "column", boxShadow: "-8px 0 24px rgba(0,0,0,0.1)" }}
      >
        <div style={{ padding: "20px 24px", background: surface, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, margin: "0 0 4px 0" }}>{isRTL ? "جرد تصحيحي جديد" : "New Stock Adjustment"}</h2>
            <p style={{ color: ds.textSecondary, fontSize: 13, margin: 0 }}>{isRTL ? "مطابقة الرصيد الدفتري مع الرصيد الفعلي" : "Reconcile system stock with physical count"}</p>
          </div>
          <button onClick={onClose} style={{ background: isDark ? ds.surface2 : "#F1F5F9", border: "none", width: 36, height: 36, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={18} color={ds.textPrimary} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 24 }}>
          
          <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: "20px" }}>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
              {isRTL ? "سبب التعديل / البيان" : "Reason / Notes"}
            </label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: 16, [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }}>
                <FileText size={18} color={ds.textMuted} />
              </div>
              <textarea
                value={notes} onChange={e => setNotes(e.target.value)}
                placeholder={isRTL ? "مثال: جرد نهاية الشهر، تسوية نقص مستودع..." : "e.g. End of month physical count..."}
                rows={2}
                style={{ width: "100%", boxSizing: "border-box", padding: "16px 16px 16px 48px", background: isDark ? ds.surface2 : "#FFFFFF", border: `1.5px solid ${border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, resize: "none", outline: "none", fontFamily: "inherit" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <PackageSearch size={18} color={primaryColor} /> {isRTL ? "البحث عن المنتجات للجرد" : "Search Products to Count"}
            </h3>
            <div style={{ position: "relative" }}>
              <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
              <input
                value={search} 
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder={isRTL ? "ابحث بالاسم أو الباركود أو انقر لعرض الكل..." : "Search or click to view all..."}
                style={{ width: "100%", boxSizing: "border-box", paddingInlineStart: 42, paddingInlineEnd: 16, height: 48, background: surface, border: `1px solid ${border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, outline: "none" }}
              />
              {(isSearchFocused || search) && filteredProducts.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: surface, border: `1px solid ${border}`, borderRadius: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", zIndex: 10, maxHeight: 200, overflowY: "auto" }}>
                  {filteredProducts.map(p => (
                    <div key={p.id} onClick={() => addLine(p)} style={{ padding: "12px 16px", borderBottom: `1px solid ${border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 32, height: 32, background: isDark ? ds.surface2 : "#F8FAFC", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                        {p.image_url ? <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} /> : "📦"}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: ds.textPrimary }}>{p.product_name}</div>
                        <div style={{ fontSize: 12, color: ds.textMuted }}>{p.product_code}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ flex: 1, background: surface, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr 40px", padding: "12px 16px", background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${border}`, fontSize: 13, fontWeight: 700, color: ds.textSecondary }}>
              <div>{isRTL ? "المنتج" : "Product"}</div>
              <div style={{ textAlign: "center" }}>{isRTL ? "النظام" : "System"}</div>
              <div style={{ textAlign: "center" }}>{isRTL ? "الفعلي" : "Physical"}</div>
              <div style={{ textAlign: "center" }}>{isRTL ? "الفارق" : "Diff"}</div>
              <div></div>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {lines.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: ds.textMuted, fontSize: 14 }}>
                  {isRTL ? "ابحث عن المنتجات وأضفها للبدء في الجرد" : "Search and add products to start counting"}
                </div>
              ) : (
                lines.map((line, idx) => (
                  <div key={line.id} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr 40px", padding: "16px", borderBottom: idx === lines.length - 1 ? "none" : `1px solid ${border}`, alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: ds.textPrimary, marginBottom: 2 }}>{line.product.product_name}</div>
                      <div style={{ fontSize: 12, color: ds.textMuted }}>{line.product.product_code}</div>
                    </div>
                    <div style={{ textAlign: "center", fontSize: 15, fontWeight: 700, color: ds.textSecondary }}>
                      {line.system_qty}
                    </div>
                    <div>
                      <input 
                        type="number" value={line.physical_qty} onChange={(e) => updateLine(line.id, e.target.value)}
                        placeholder="0"
                        style={{ width: "100%", height: 36, textAlign: "center", background: isDark ? ds.surface2 : "#F1F5F9", border: `1px solid ${border}`, borderRadius: 8, color: ds.textPrimary, fontSize: 15, fontWeight: 700, outline: "none" }}
                      />
                    </div>
                    <div style={{ textAlign: "center", display: "flex", justifyContent: "center" }}>
                      {line.physical_qty === "" ? <span style={{ color: ds.textMuted }}>-</span> : 
                        line.discrepancy === 0 ? <span style={{ color: ds.textMuted, fontWeight: 700 }}>0</span> :
                        line.discrepancy > 0 ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 2, color: "#10B981", fontSize: 14, fontWeight: 800, background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 8 }}>
                            <ArrowUpRight size={14} /> +{line.discrepancy}
                          </span>
                        ) : (
                          <span style={{ display: "flex", alignItems: "center", gap: 2, color: "#EF4444", fontSize: 14, fontWeight: 800, background: "rgba(239,68,68,0.1)", padding: "2px 8px", borderRadius: 8 }}>
                            <ArrowDownRight size={14} /> {line.discrepancy}
                          </span>
                        )
                      }
                    </div>
                    <button onClick={() => removeLine(line.id)} style={{ background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: ds.textMuted }}>
                      <X size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        <div style={{ padding: "16px 24px", background: surface, borderTop: `1px solid ${border}`, display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, height: 48, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {isRTL ? "إلغاء" : "Cancel"}
          </button>
          <button onClick={handleSave} style={{ flex: 2, height: 48, background: "linear-gradient(135deg, #3B82F6, #2563EB)", border: "none", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
            <Save size={18} /> {isRTL ? "حفظ وتسوية الفروقات" : "Save & Adjust"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
