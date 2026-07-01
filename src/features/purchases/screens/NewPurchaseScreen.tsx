import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, ArrowLeft, Search, Plus, Trash2, Check, Package, FileText, ShoppingBag, Database, X, CreditCard
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_PRODUCTS, MOCK_PRODUCT_UNITS, MOCK_INVENTORIES, MOCK_UNITS, MOCK_CATEGORIES } from "@/core/data/salesMockData";
import { MOCK_SUPPLIERS } from "@/core/data/purchasesMockData";
import { useToast } from "@/providers/ToastProvider";

export function NewPurchaseScreen({ suppliers, products = [], onBack, onSave }: { suppliers: any[], products?: any[], onBack: () => void, onSave?: (invoice: any) => void }) {
  const toast = useToast();
  const { t, isDark, isRTL, ds } = useApp();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [invoiceRef, setInvoiceRef] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || "");
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // Map units to view models
  const allUnits = products.flatMap(p => {
    const units = p.mock_units || MOCK_PRODUCT_UNITS.filter(u => u.product_id === p.id);
    return units.map((u: any) => ({ ...u, _product: p }));
  });

  const productUnits = allUnits.map(pu => {
    const product = (pu as any)._product;
    const unitObj = MOCK_UNITS.find(u => u.id === pu.unit_id);
    // get available stock
    const inv = MOCK_INVENTORIES.filter(i => i.product_unit_id === pu.id);
    const available_stock = inv.length === 0 ? 100 : inv.reduce((sum, i) => sum + i.quantity, 0);
    return {
      ...pu,
      product_name: product?.product_name || "",
      category_id: product?.category_id || null,
      unit_name: unitObj?.unit_name || pu.unit_id || "وحدة",
      available_stock
    };
  });

  const displayProducts = productUnits.filter(pu => {
    if (cat && pu.category_id !== cat) return false;
    return pu.product_name.toLowerCase().includes(search.toLowerCase()) || 
      pu.sku.toLowerCase().includes(search.toLowerCase()) || 
      (pu.barcode && pu.barcode.includes(search));
  });

  const addToCart = (productUnit: any) => {
    const existing = cart.find(c => c.productUnit.id === productUnit.id);
    if (existing) {
      setCart(cart.map(c => c.productUnit.id === productUnit.id ? { ...c, quantity: c.quantity + 1, total: (c.quantity + 1) * c.unit_cost } : c));
    } else {
      setCart([...cart, { productUnit, quantity: 1, unit_cost: productUnit.purchase_price, total: productUnit.purchase_price }]);
    }
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) return;
    setCart(cart.map(c => c.productUnit.id === id ? { ...c, quantity: qty, total: qty * c.unit_cost } : c));
  };

  const updateCost = (id: string, cost: number) => {
    if (cost < 0) return;
    setCart(cart.map(c => c.productUnit.id === id ? { ...c, unit_cost: cost, total: c.quantity * cost } : c));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.productUnit.id !== id));
  };

  const grandTotal = cart.reduce((acc, curr) => acc + curr.total, 0);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", background: surface, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button title={isRTL ? "رجوع" : "Back"} onClick={onBack} style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <BackIcon size={20} color={ds.textPrimary} />
          </button>
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "فاتورة مشتريات جديدة" : "New Purchase Invoice"}</h2>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <select 
            value={selectedSupplierId} 
            onChange={e => setSelectedSupplierId(e.target.value)}
            style={{ width: 220, height: 40, padding: "0 12px", background: isDark ? ds.surface2 : "#F1F5F9", border: `1px solid ${border}`, borderRadius: 10, color: ds.textPrimary, fontSize: 13, outline: "none", fontFamily: "inherit" }}
          >
            <option value="" disabled>{isRTL ? "اختر المورد..." : "Select Supplier..."}</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.supplier_name}</option>
            ))}
          </select>
          <input 
            value={invoiceRef} onChange={e => setInvoiceRef(e.target.value)}
            placeholder={isRTL ? "رقم مرجع الفاتورة" : "Invoice Ref"}
            style={{ width: 160, height: 40, padding: "0 12px", background: isDark ? ds.surface2 : "#F1F5F9", border: `1px solid ${border}`, borderRadius: 10, color: ds.textPrimary, fontSize: 13, outline: "none", fontFamily: "inherit" }}
          />
        </div>
      </div>

      {/* Body: Full Screen Products */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        
        {/* Left Side - Product Selection */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingBottom: 190 }}>
          <div style={{ padding: "16px 16px 0 16px" }}>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder={isRTL ? "ابحث عن منتج بالاسم أو الباركود..." : "Search product by name or barcode..."}
                style={{ width: "100%", height: 48, boxSizing: "border-box", paddingInlineStart: 44, paddingInlineEnd: 16, background: surface, border: `1px solid ${border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit" }}
              />
            </div>
            
            {/* Categories */}
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 14, msOverflowStyle: "none", scrollbarWidth: "none" }}>
              <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}`}</style>
              {[{ id: null, category_name: t.filterAll }, ...MOCK_CATEGORIES].map(c => {
                const active = cat === c.id;
                return (
                  <motion.button key={String(c.id)} whileTap={{ scale: 0.94 }} onClick={() => setCat(c.id)}
                    style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit", background: active ? "#3B82F6" : surface, color: active ? "white" : ds.textPrimary, boxShadow: active ? "0 4px 12px rgba(59,130,246,0.3)" : `inset 0 0 0 1px ${border}`, fontWeight: 700, fontSize: 13, transition: "all 0.18s" }}>
                    {c.category_name}
                  </motion.button>
                );
              })}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {displayProducts.map(pu => (
                <motion.div key={pu.id} whileHover={{ y: -2 }} onClick={() => addToCart(pu)}
                  style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 12, cursor: "pointer", display: "flex", flexDirection: "column", gap: 8 }}>
                  <h4 style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700, margin: 0 }}>{pu.product_name}</h4>
                  <div style={{ color: ds.textSecondary, fontSize: 12, display: "flex", gap: 4 }}><Package size={12}/> {pu.unit_name}</div>
                  <div style={{ color: ds.textSecondary, fontSize: 12 }}>{isRTL ? "التكلفة السابقة:" : "Last Cost:"} {pu.purchase_price}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                    <span style={{ fontSize: 12, background: "rgba(59,130,246,0.1)", color: "#3B82F6", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                      {pu.available_stock} {isRTL ? "متوفر" : "In Stock"}
                    </span>
                    <Plus size={16} color="#3B82F6" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Smart Cart Bar */}
        <div style={{ position: "absolute", bottom: 120, left: 24, right: 24, display: "flex", justifyContent: "center", zIndex: 40, pointerEvents: "none" }}>
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            style={{ 
              background: isDark ? "rgba(12, 25, 41, 0.95)" : "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
              borderRadius: 24,
              padding: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              width: "100%",
              maxWidth: 600,
              pointerEvents: "auto",
              cursor: "pointer"
            }}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('#pay-btn')) return;
              setShowCartDrawer(true);
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 16px" }}>
              <div style={{ position: "relative" }}>
                <ShoppingBag size={24} color={ds.textPrimary} />
                {cart.length > 0 && (
                  <div style={{ position: "absolute", top: -8, right: -8, background: "#3B82F6", color: "white", fontSize: 11, fontWeight: 800, width: 20, height: 20, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${isDark ? "#0C1929" : "#FFF"}` }}>
                    {cart.reduce((sum, i) => sum + i.quantity, 0)}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>{isRTL ? "إجمالي الفاتورة" : "Invoice Total"}</span>
                <span style={{ color: ds.primary, fontSize: 18, fontWeight: 800 }}>{grandTotal.toLocaleString()} <span style={{ fontSize: 12 }}>YER</span></span>
              </div>
            </div>

            <button 
              id="pay-btn"
              onClick={(e) => {
                e.stopPropagation();
                if(cart.length > 0) setShowCartDrawer(true);
              }}
              style={{
                background: cart.length === 0 ? (isDark ? ds.surface2 : "#E2E8F0") : "#3B82F6",
                border: "none",
                borderRadius: 16,
                padding: "0 32px",
                height: 52,
                color: cart.length === 0 ? ds.textMuted : "white",
                fontSize: 15,
                fontWeight: 800,
                cursor: cart.length === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s"
              }}
            >
              <FileText size={20} />
              {isRTL ? "مراجعة المشتريات" : "Review"}
            </button>
          </motion.div>
        </div>

        {/* Side Drawer for Cart */}
        <AnimatePresence>
          {showCartDrawer && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setShowCartDrawer(false)}
                style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 50 }} 
              />
              
              {/* Drawer */}
              <motion.div
                initial={{ x: isRTL ? "-100%" : "100%" }} 
                animate={{ x: 0 }} 
                exit={{ x: isRTL ? "-100%" : "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  [isRTL ? "left" : "right"]: 0,
                  width: "100%",
                  maxWidth: 400,
                  background: surface,
                  zIndex: 60,
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: isRTL ? "10px 0 30px rgba(0,0,0,0.2)" : "-10px 0 30px rgba(0,0,0,0.2)",
                  borderInlineStart: `1px solid ${isDark ? ds.border : "#E2E8F0"}`
                }}
              >
                {/* Header */}
                <div style={{ padding: "20px 24px", borderBottom: `1px solid ${isDark ? ds.border : "#F1F5F9"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <ShoppingBag size={22} color="#3B82F6" />
                    <span style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "عناصر الفاتورة" : "Invoice Items"}</span>
                  </div>
                  <button onClick={() => setShowCartDrawer(false)} style={{ background: isDark ? ds.surface2 : "#F1F5F9", border: "none", width: 36, height: 36, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <X size={18} color={ds.textPrimary} />
                  </button>
                </div>

                {/* Items */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                  <AnimatePresence>
                    {cart.map(item => (
                      <motion.div key={item.productUnit.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        style={{ background: isDark ? ds.surface2 : "#F8FAFC", border: `1px solid ${border}`, borderRadius: 12, padding: 12, marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700 }}>{item.productUnit.product_name} <span style={{ color: ds.textMuted, fontWeight: 500 }}>({item.productUnit.unit_name})</span></span>
                          <button title={isRTL ? "حذف" : "Remove"} onClick={() => removeFromCart(item.productUnit.id)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 size={16} color="#EF4444" /></button>
                        </div>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 11, color: ds.textSecondary, marginBottom: 4, display: "block" }}>{isRTL ? "الكمية" : "Qty"}</label>
                            <input type="number" value={item.quantity} onChange={e => updateQuantity(item.productUnit.id, parseInt(e.target.value) || 0)} style={{ width: "100%", height: 36, borderRadius: 8, border: `1px solid ${border}`, background: surface, padding: "0 8px", color: ds.textPrimary, outline: "none" }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 11, color: ds.textSecondary, marginBottom: 4, display: "block" }}>{isRTL ? "تكلفة الوحدة" : "Unit Cost"}</label>
                            <input type="number" value={item.unit_cost} onChange={e => updateCost(item.productUnit.id, parseFloat(e.target.value) || 0)} style={{ width: "100%", height: 36, borderRadius: 8, border: `1px solid ${border}`, background: surface, padding: "0 8px", color: ds.textPrimary, outline: "none" }} />
                          </div>
                          <div style={{ flex: 1, textAlign: isRTL ? "left" : "right" }}>
                            <label style={{ fontSize: 11, color: ds.textSecondary, marginBottom: 4, display: "block" }}>{isRTL ? "المجموع" : "Total"}</label>
                            <div style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 800, lineHeight: "36px" }}>{item.total.toLocaleString()}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {cart.length === 0 && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyItems: "center", height: "100%", justifyContent: "center", color: ds.textMuted, gap: 16, marginTop: 40 }}>
                        <ShoppingBag size={48} color={ds.textMuted} strokeWidth={1} />
                        <p style={{ fontSize: 15, fontWeight: 600 }}>{isRTL ? "لم يتم إضافة أي منتج" : "No products added"}</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Drawer Footer (Totals & Save) */}
                <div style={{ padding: "20px 24px 32px 24px", background: isDark ? ds.surface2 : "#F8FAFC", borderTop: `1px solid ${border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <span style={{ color: ds.textSecondary, fontSize: 16, fontWeight: 600 }}>{isRTL ? "الإجمالي" : "Grand Total"}</span>
                    <span style={{ color: ds.primary, fontSize: 24, fontWeight: 900 }}>{grandTotal.toLocaleString()}</span>
                  </div>
                  <motion.button title={isRTL ? "حفظ وترحيل الفاتورة" : "Save & Post Invoice"} whileTap={{ scale: 0.98 }} onClick={() => {
                      if(cart.length > 0) {
                        if (onSave) {
                          const newInvoice = {
                            id: `po_new_${Date.now()}`,
                            business_id: "biz_001",
                            branch_id: "br_001",
                            supplier_id: selectedSupplierId || suppliers[0]?.id,
                            warehouse_id: "wh_001",
                            invoice_number: `PI-${Math.floor(Math.random() * 10000)}`,
                            purchase_date: new Date().toISOString(),
                            due_date: null,
                            sub_total: grandTotal,
                            discount_amount: 0,
                            tax_amount: 0,
                            grand_total: grandTotal,
                            status: "Posted",
                            payment_status: "Paid",
                            notes: "تمت الإضافة من الشاشة الجديدة",
                            items: cart.map(c => ({
                              product_name: c.productUnit.product_name,
                              unit_name: c.productUnit.unit_name,
                              quantity: c.quantity,
                              unit_price: c.unit_cost,
                              total_price: c.total
                            })),
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                          };
                          onSave(newInvoice);
                          toast.success(isRTL ? "تم حفظ الفاتورة بنجاح!" : "Invoice saved successfully!");
                        } else {
                          onBack();
                        }
                      }
                    }}
                    style={{ width: "100%", height: 56, background: cart.length > 0 ? "#3B82F6" : ds.border, color: cart.length > 0 ? "white" : ds.textMuted, border: "none", borderRadius: 16, fontSize: 17, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, cursor: cart.length > 0 ? "pointer" : "not-allowed", boxShadow: cart.length > 0 ? "0 8px 24px rgba(59,130,246,0.3)" : "none" }}>
                    <Check size={22} /> {isRTL ? "حفظ وترحيل الفاتورة" : "Save & Post Invoice"}
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
