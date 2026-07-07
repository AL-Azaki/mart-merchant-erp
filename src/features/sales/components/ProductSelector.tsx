import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Minus, Package, Coffee, ShoppingBag,
  Utensils, Monitor, Droplet, PlusCircle, Trash2, Mic, MicOff, Filter
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_PRODUCT_UNITS, MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_INVENTORIES, buildCartLine, MOCK_UNITS } from "@/core/data/salesMockData";
import type { CartLine } from "@/core/types/sales";
import type { ProductUnit } from "@/core/types/catalog";

const CATEGORY_ICONS: Record<string, any> = {
  "مشروبات": Coffee,
  "مواد غذائية": Utensils,
  "منظفات": Droplet,
  "إلكترونيات": Monitor,
  "أخرى": ShoppingBag,
};

interface Props {
  cart: CartLine[];
  products?: any[];
  onAddItem: (item: CartLine) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export function ProductSelector({ cart, products = MOCK_PRODUCTS, onAddItem, onUpdateQty, onRemove }: Props) {
  const { t, isDark, isRTL, ds } = useApp();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = isRTL ? "ar-SA" : "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setSearch(transcript);
    };

    recognition.start();
  }, [isListening, isRTL]);

  const cartMap = useMemo(() => new Map(cart.map(i => [i.product_unit.id, i])), [cart]);

  function handleAdd(pu: ProductUnit) {
    const ex = cartMap.get(pu.id);
    if (ex) onUpdateQty(pu.id, 1);
    else onAddItem(buildCartLine(pu as any, "wh_001", 1, pu.selling_price, 0, 0));
  }

  // --- Barcode Scanner Logic ---
  const barcodeBuffer = useRef("");
  const barcodeTimeout = useRef<any>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Enter") {
        if (barcodeBuffer.current.length > 2) {
          const code = barcodeBuffer.current;
          barcodeBuffer.current = "";
          
          const allUnits = products.flatMap(p => {
            const units = p.mock_units || MOCK_PRODUCT_UNITS.filter(u => u.product_id === p.id);
            return units.map((u: any) => ({ ...u, _product: p }));
          });

          const foundUnit = allUnits.find(pu => pu.barcode === code || pu.sku === code);
          if (foundUnit) handleAdd(foundUnit);
        }
      } else if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
        if (barcodeTimeout.current) clearTimeout(barcodeTimeout.current);
        barcodeTimeout.current = setTimeout(() => {
          barcodeBuffer.current = "";
        }, 50);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [products, cartMap, onAddItem, onUpdateQty]);

  const displayUnits = useMemo(() => {
    // Collect all units from all products (including custom mock_units)
    const allUnits = products.flatMap(p => {
      const units = p.mock_units || MOCK_PRODUCT_UNITS.filter(u => u.product_id === p.id);
      return units.map((u: any) => ({ ...u, _product: p }));
    });

    return allUnits.filter(pu => {
      const p = pu._product;
      if (!p || (!pu.is_active && pu.is_active !== undefined)) return false;
      if (cat && p.category_id !== cat) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return p.product_name.toLowerCase().includes(q) || (pu.barcode ?? "").includes(q) || (pu.sku ?? "").toLowerCase().includes(q);
    });
  }, [search, cat, products]);

  const getStock = (puId: string) => {
     const inv = MOCK_INVENTORIES.filter(i => i.product_unit_id === puId);
     if (inv.length === 0) return 100; // Mock stock for new products
     return inv.reduce((s, i) => s + i.quantity, 0);
  }

  const isOut = (pu: ProductUnit) => getStock(pu.id) <= 0;
  const isLow = (pu: ProductUnit) => getStock(pu.id) > 0 && getStock(pu.id) <= 5;

  const surface = isDark ? ds.surface : "#FFFFFF";
  const subtle = isDark ? ds.surface2 : "#F8FAFC";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Sticky header */}
      <div style={{ padding: "16px 16px 0", background: isDark ? ds.bg : "#F8FAFC" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isListening ? (isRTL ? "🎙️ جار الاستماع..." : "🎙️ Listening...") : t.searchProducts}
              style={{
                width: "100%", height: 60, boxSizing: "border-box",
                paddingInlineStart: 46, paddingInlineEnd: 46,
                background: isListening ? (isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)") : surface,
                border: `1.5px solid ${isListening ? "#EF4444" : isDark ? ds.border : "#E2E8F0"}`,
                borderRadius: 14, color: ds.textPrimary, fontSize: 16, fontWeight: 700, outline: "none", fontFamily: "inherit",
                transition: "all 0.2s"
              }}
            />
            {/* Mic Button */}
            <button
              onClick={startVoiceSearch}
              style={{
                position: "absolute", top: "50%", transform: "translateY(-50%)",
                [isRTL ? "left" : "right"]: 8,
                width: 44, height: 44, borderRadius: 10,
                background: isListening ? "#EF4444" : "transparent",
                border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
              title={isRTL ? "البحث الصوتي" : "Voice Search"}
            >
              {isListening
                ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}><Mic size={20} color="white" strokeWidth={2.5} /></motion.div>
                : <Mic size={24} color={ds.textSecondary} strokeWidth={2.5} />
              }
            </button>
          </div>

          {/* Filter Toggle Button */}
          <button 
            title={isRTL ? "خيارات التصفية" : "Filters"} 
            onClick={() => setShowFilters(!showFilters)}
            style={{ 
              width: 60, height: 60, borderRadius: 14, flexShrink: 0,
              background: showFilters ? "rgba(16,185,129,0.1)" : surface, 
              border: `1px solid ${showFilters ? "#10B981" : (isDark ? ds.border : "#E2E8F0")}`, 
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", 
              color: showFilters ? "#10B981" : ds.textSecondary,
              transition: "all 0.2s"
            }}
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Collapsible Category Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: ds.textSecondary }}>
                {isRTL ? "تصفية حسب التصنيف:" : "Filter by Category:"}
              </div>
              <div className="scrollbar-hide" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
                <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}`}</style>
                {[{ id: null, category_name: t.filterAll }, ...MOCK_CATEGORIES].map(c => {
                  const active = cat === c.id;
                  return (
                    <motion.button key={String(c.id)} whileTap={{ scale: 0.95 }} onClick={() => setCat(c.id)}
                      style={{ 
                        flexShrink: 0, padding: "8px 16px", borderRadius: 10, 
                        border: `1px solid ${active ? "#10B981" : isDark ? ds.border : "#E2E8F0"}`, 
                        cursor: "pointer", fontFamily: "inherit", 
                        background: active ? "rgba(16,185,129,0.1)" : surface, 
                        color: active ? "#10B981" : ds.textSecondary, 
                        fontSize: 13, fontWeight: 600, transition: "all 0.2s" 
                      }}
                    >
                      {c.category_name}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Products ERP Data Grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        <div style={{ background: surface, borderRadius: 16, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
            <thead>
              <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `2px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                <th style={{ padding: "18px 20px", color: ds.textSecondary, fontSize: 16, fontWeight: 800 }}>{isRTL ? "المنتج والباركود" : "Product & Barcode"}</th>
                <th style={{ padding: "18px 20px", color: ds.textSecondary, fontSize: 16, fontWeight: 800 }}>{isRTL ? "الوحدة" : "Unit"}</th>
                <th style={{ padding: "18px 20px", color: ds.textSecondary, fontSize: 16, fontWeight: 800 }}>{isRTL ? "السعر" : "Price"}</th>
                <th style={{ padding: "18px 20px", color: ds.textSecondary, fontSize: 16, fontWeight: 800, textAlign: "center" }}>{isRTL ? "المخزون" : "Stock"}</th>
                <th style={{ padding: "18px 20px", color: ds.textSecondary, fontSize: 16, fontWeight: 800, textAlign: "center" }}>{isRTL ? "الإجراء" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {displayUnits.map((pu, i) => {
                  const p = (pu as any)._product;
                  if (!p) return null;
                  const inCart = cartMap.get(pu.id);
                  const out = isOut(pu as any);
                  const low = isLow(pu as any);
                  const unitName = MOCK_UNITS.find(u => u.id === pu.unit_id)?.unit_name || pu.unit_id || (isRTL ? "وحدة" : "Unit");
                  
                  return (
                    <motion.tr 
                      key={pu.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      onClick={() => { if (!out && !inCart) handleAdd(pu as any); }}
                      style={{ 
                        borderBottom: i === displayUnits.length - 1 ? "none" : `1px solid ${isDark ? ds.border : "#F1F5F9"}`,
                        background: inCart ? (isDark ? "rgba(37,99,235,0.05)" : "rgba(37,99,235,0.03)") : "transparent",
                        cursor: out ? "not-allowed" : "pointer",
                        opacity: out ? 0.6 : 1,
                        transition: "background 0.2s"
                      }}
                      onMouseOver={e => { if(!inCart && !out) e.currentTarget.style.background = isDark ? ds.surface2 : "#F8FAFC" }}
                      onMouseOut={e => { if(!inCart) e.currentTarget.style.background = "transparent" }}
                    >
                      <td style={{ padding: "18px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 12, background: isDark ? ds.surface2 : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Package size={24} color={ds.textMuted} />
                          </div>
                          <div>
                            <div style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 900, marginBottom: 4 }}>{p.product_name}</div>
                            <div style={{ color: ds.textSecondary, fontSize: 14, fontWeight: 600 }}>{pu.sku || pu.barcode || "-"}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "18px 20px", color: ds.textSecondary, fontSize: 16, fontWeight: 700 }}>
                        {unitName}
                      </td>
                      <td style={{ padding: "18px 20px", color: "#2563EB", fontSize: 17, fontWeight: 900 }}>
                        {pu.selling_price?.toLocaleString()}
                      </td>
                      <td style={{ padding: "14px 20px", textAlign: "center" }}>
                        <span style={{ 
                          padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 800,
                          background: out ? "rgba(239,68,68,0.1)" : low ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                          color: out ? "#EF4444" : low ? "#F59E0B" : "#10B981"
                        }}>
                          {out ? (isRTL ? "نفد" : "Out") : getStock(pu.id)}
                        </span>
                      </td>
                      <td style={{ padding: "18px 20px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
                        {inCart ? (
                          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: isDark ? ds.surface2 : "#F1F5F9", borderRadius: 12, padding: 6 }}>
                            <button onClick={() => onUpdateQty(pu.id, -1)} style={{ width: 44, height: 44, borderRadius: 10, background: surface, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark?ds.border:"#E2E8F0"} onMouseOut={e=>e.currentTarget.style.background=surface}><Minus size={20} color={ds.textPrimary} strokeWidth={2.5} /></button>
                            <span style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 900, minWidth: 40, textAlign: "center" }}>{inCart.quantity}</span>
                            <button onClick={() => onUpdateQty(pu.id, 1)} style={{ width: 44, height: 44, borderRadius: 10, background: "#2563EB", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background="#1D4ED8"} onMouseOut={e=>e.currentTarget.style.background="#2563EB"}><Plus size={20} color="white" strokeWidth={2.5} /></button>
                          </div>
                        ) : (
                          <button disabled={out} onClick={() => handleAdd(pu as any)} style={{ width: "100%", maxWidth: 120, height: 48, margin: "0 auto", borderRadius: 12, border: "none", background: out ? (isDark ? ds.surface2 : "#F1F5F9") : "rgba(37,99,235,0.1)", color: out ? ds.textMuted : "#2563EB", fontSize: 15, fontWeight: 800, cursor: out ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", transition: "0.2s" }} onMouseOver={e=>{if(!out) e.currentTarget.style.background="rgba(37,99,235,0.15)"}} onMouseOut={e=>{if(!out) e.currentTarget.style.background="rgba(37,99,235,0.1)"}}>
                            <PlusCircle size={20} strokeWidth={2.5} /> {isRTL ? "إضافة" : "Add"}
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
