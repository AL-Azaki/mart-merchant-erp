import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Minus, Package, Coffee, ShoppingBag,
  Utensils, Monitor, Droplet, PlusCircle, Trash2, Mic, MicOff
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
        {/* Search */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isListening ? (isRTL ? "🎙️ جار الاستماع..." : "🎙️ Listening...") : t.searchProducts}
            style={{
              width: "100%", height: 48, boxSizing: "border-box",
              paddingInlineStart: 46, paddingInlineEnd: 56,
              background: isListening ? (isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)") : surface,
              border: `1.5px solid ${isListening ? "#EF4444" : isDark ? ds.border : "#E2E8F0"}`,
              borderRadius: 14, color: ds.textPrimary, fontSize: 15, fontWeight: 500, outline: "none", fontFamily: "inherit",
              transition: "all 0.2s"
            }}
          />
          {/* Mic Button */}
          <button
            onClick={startVoiceSearch}
            style={{
              position: "absolute", top: "50%", transform: "translateY(-50%)",
              [isRTL ? "left" : "right"]: 10,
              width: 34, height: 34, borderRadius: 10,
              background: isListening ? "#EF4444" : isDark ? ds.surface2 : "#F1F5F9",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", boxShadow: isListening ? "0 0 0 4px rgba(239,68,68,0.2)" : "none",
            }}
            title={isRTL ? "البحث الصوتي" : "Voice Search"}
          >
            {isListening
              ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}><Mic size={16} color="white" strokeWidth={2.5} /></motion.div>
              : <Mic size={16} color={ds.textSecondary} strokeWidth={2.5} />
            }
          </button>
          {/* Active listening indicator strip */}
          {isListening && (
            <motion.div
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
              style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#EF4444,#F97316,#EF4444)", borderRadius: "0 0 14px 14px", transformOrigin: "left" }}
            />
          )}
        </div>

        {/* Categories */}
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 14, msOverflowStyle: "none", scrollbarWidth: "none" }}>
          <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}`}</style>
          {[{ id: null, name: t.filterAll, Icon: Package }, ...MOCK_CATEGORIES.map(c => ({ id: c.id, name: c.category_name, Icon: CATEGORY_ICONS[c.category_name] || ShoppingBag }))].map(c => {
            const active = cat === c.id;
            return (
              <motion.button key={String(c.id)} whileTap={{ scale: 0.94 }} onClick={() => setCat(c.id)}
                style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit", background: active ? "linear-gradient(135deg,#1D4ED8,#2563EB)" : surface, boxShadow: active ? "0 6px 16px rgba(37,99,235,0.3)" : "0 2px 8px rgba(0,0,0,0.04)", transition: "all 0.18s" }}>
                <c.Icon size={17} color={active ? "white" : ds.textSecondary} strokeWidth={2.5} />
                <span style={{ color: active ? "white" : ds.textPrimary, fontSize: 14, fontWeight: 700 }}>{c.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Products grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          <AnimatePresence>
            {displayUnits.map(pu => {
              const p = (pu as any)._product;
              if (!p) return null;
              const inCart = cartMap.get(pu.id);
              const out = isOut(pu as any);
              const low = isLow(pu as any);
              const unitName = MOCK_UNITS.find(u => u.id === pu.unit_id)?.unit_name || pu.unit_id || "وحدة";
              const PIcon = Package; // CATEGORY_ICONS[p.category?.name || ""] || Package;
              return (
                <motion.div key={pu.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  onClick={() => { if (!out && !inCart) handleAdd(pu as any); }}
                  style={{ background: surface, border: `2px solid ${inCart ? "#2563EB" : isDark ? ds.border : "transparent"}`, borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: inCart ? "0 4px 16px rgba(37,99,235,0.15)" : "0 2px 10px rgba(0,0,0,0.04)", opacity: out ? 0.55 : 1, cursor: out ? "not-allowed" : "pointer", position: "relative" }}>
                  {/* Image area */}
                  <div style={{ height: 96, background: subtle, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${isDark ? ds.border : "#F1F5F9"}` }}>
                    <PIcon size={34} color={ds.textMuted} strokeWidth={1} />
                      <div style={{ position: "absolute", top: 7, [isRTL ? "left" : "right"]: 7, background: out ? "#EF4444" : low ? "#F59E0B" : "rgba(255,255,255,0.88)", color: out || low ? "white" : ds.textPrimary, padding: "3px 7px", borderRadius: 8, fontSize: 11, fontWeight: 800, backdropFilter: "blur(4px)" }}>
                        {out ? (isRTL ? "نفد" : "Out") : getStock(pu.id)}
                      </div>
                  </div>
                  {/* Details */}
                  <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ color: ds.textPrimary, fontSize: 13, fontWeight: 700, marginBottom: 4, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.product_name} - {pu.sku}</div>
                    <div style={{ color: "#2563EB", fontSize: 15, fontWeight: 800, marginBottom: 10 }}>{pu.selling_price?.toLocaleString()}</div>
                    <div onClick={e => e.stopPropagation()}>
                      {inCart ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: subtle, borderRadius: 10, padding: 4 }}>
                          <button onClick={() => onUpdateQty(pu.id, -1)} style={{ width: 30, height: 30, borderRadius: 8, background: surface, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14} color={ds.textPrimary} strokeWidth={2.5} /></button>
                          <span style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 800 }}>{inCart.quantity}</span>
                          <button onClick={() => onUpdateQty(pu.id, 1)} style={{ width: 30, height: 30, borderRadius: 8, background: "#2563EB", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14} color="white" strokeWidth={2.5} /></button>
                        </div>
                      ) : (
                        <button disabled={out} onClick={() => handleAdd(pu as any)} style={{ width: "100%", height: 38, borderRadius: 10, border: "none", background: out ? subtle : "rgba(37,99,235,0.1)", color: out ? ds.textMuted : "#2563EB", fontSize: 13, fontWeight: 700, cursor: out ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "inherit" }}>
                          <PlusCircle size={15} strokeWidth={2.5} />{isRTL ? "إضافة" : "Add"}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
