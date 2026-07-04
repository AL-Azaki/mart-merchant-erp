import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, ArrowRight, User, ShoppingCart, ChevronDown,
  Trash2, CreditCard, Banknote, Smartphone, Clock, Check,
  Share2, Printer, X, Plus, Minus
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { SelectCustomerSheet } from "../components/SelectCustomerSheet";
import { ContactFormSheet } from "@/features/crm/components/ContactFormSheet";
import { ProductSelector } from "../components/ProductSelector";
import { buildCartLine, nextInvoiceNumber, MOCK_SALES_INVOICES } from "@/core/data/salesMockData";
import { MOCK_BUSINESS } from "@/core/data/mockData";
import type { Customer, CartLine } from "@/core/types/sales";
import type { PaymentMethodType } from "@/core/types/finance";
import { generateReceiptHTML, buildReceiptMessage } from "../utils/receiptUtils";

const PAY_METHODS: { key: PaymentMethodType; icon: any; labelKey: string; color: string }[] = [
  { key: "Cash",     icon: Banknote,   labelKey: "payCash",     color: "#16A34A" },
  { key: "Card",     icon: CreditCard, labelKey: "payCard",     color: "#2563EB" },
  { key: "Bank", icon: Smartphone, labelKey: "payTransfer", color: "#8B5CF6" },
  { key: "Other",   icon: Clock,      labelKey: "payCredit",   color: "#F59E0B" },
];

type Step = "build" | "payment" | "success";

export function NewInvoiceScreen({ customers = [], products = [], onBack, onSuccess }: { customers?: any[]; products?: any[]; onBack: () => void; onSuccess: () => void }) {
  const { t, isDark, isRTL, ds } = useApp();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [step, setStep] = useState<Step>("build");
  const [showCustomer, setShowCustomer] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [payMethod, setPayMethod] = useState<PaymentMethodType>("Cash");
  const [cashReceived, setCashReceived] = useState("");
  const [notes, setNotes] = useState("");

  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [splitPayments, setSplitPayments] = useState<{ method: PaymentMethodType; amount: string }>([
    { method: "Cash", amount: "" },
    { method: "Card", amount: "" }
  ]);

  const [globalDiscountType, setGlobalDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [globalDiscountValue, setGlobalDiscountValue] = useState("");

  const currency = "YER";
  
  // Calculate totals manually
  const rawSubtotal = cart.reduce((s, i) => s + (i.unit_price * i.quantity), 0);
  const itemsDiscount = cart.reduce((s, i) => s + i.discount, 0);
  const subtotalAfterItems = rawSubtotal - itemsDiscount;
  
  const gdVal = parseFloat(globalDiscountValue) || 0;
  const globalDiscountAmount = globalDiscountType === "percentage" ? subtotalAfterItems * (gdVal / 100) : gdVal;
  const taxTotal = cart.reduce((s, i) => s + i.tax, 0);

  const totals = {
    subtotal: rawSubtotal,
    item_discount: itemsDiscount,
    global_discount: globalDiscountAmount,
    total_discount: itemsDiscount + globalDiscountAmount,
    tax_amount: taxTotal,
    total_amount: Math.max(0, subtotalAfterItems - globalDiscountAmount + taxTotal),
  };

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const cashNum = parseFloat(cashReceived) || 0;

  const splitTotal = splitPayments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const splitRemaining = totals.total_amount - splitTotal;

  const invoiceNumber = nextInvoiceNumber(MOCK_SALES_INVOICES);

  const addItem = (item: CartLine) => setCart(p => [...p, item]);
  const updateQty = (id: string, delta: number) => setCart(p => p.map(i => i.product_unit.id !== id ? i : buildCartLine(i.product_unit, i.warehouse_id, Math.max(1, i.quantity + delta), i.unit_price, i.discount, (i.tax / i.line_total)*100 || 0)));
  const removeItem = (id: string) => setCart(p => p.filter(i => i.product_unit.id !== id));

  const formatDate = () => new Date().toLocaleDateString(isRTL ? "ar-YE" : "en-US", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const payLabel = (key: PaymentMethodType) => t[PAY_METHODS.find(m => m.key === key)?.labelKey || "payCash"];

  function handlePrint() {
    const w = window.open("", "", "width=900,height=700");
    if (!w) return;
    w.document.write(generateReceiptHTML({ businessName: MOCK_BUSINESS.business_name, businessPhone: MOCK_BUSINESS.primary_phone ?? "", businessAddress: "صنعاء" ?? "", invoiceNumber, invoiceDate: formatDate(), customerName: customer?.customer_name ?? t.cashCustomer, items: cart.map(i => ({ name: "المنتج", qty: i.quantity, unitPrice: i.unit_price, total: i.line_total })), subtotal: totals.subtotal, taxAmount: totals.tax_amount > 0 ? totals.tax_amount : undefined, grandTotal: totals.total_amount, currency, paymentMethod: payLabel(payMethod), notes: notes || undefined, isRTL, appName: isRTL ? "تاجر" : "Tajir" }));
    w.document.close();
  }

  function handleShare() {
    const text = buildReceiptMessage({ businessName: MOCK_BUSINESS.business_name, businessPhone: MOCK_BUSINESS.primary_phone ?? "", businessAddress: "صنعاء" ?? "", invoiceNumber, invoiceDate: formatDate(), customerName: customer?.customer_name ?? t.cashCustomer, items: cart.map(i => ({ name: "المنتج", qty: i.quantity, unitPrice: i.unit_price, total: i.line_total })), subtotal: totals.subtotal, taxAmount: totals.tax_amount > 0 ? totals.tax_amount : undefined, grandTotal: totals.total_amount, currency, paymentMethod: payLabel(payMethod), notes: notes || undefined, isRTL, appName: isRTL ? "تاجر" : "Tajir" });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";

  // ── Success step (Early Return) ─────────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: bg, padding: "32px 24px", textAlign: "center" }}>
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }}
          style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg,#16A34A,#22C55E)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 12px 36px rgba(22,163,74,0.4)" }}>
          <Check size={50} color="white" strokeWidth={3} />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ color: ds.textPrimary, fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          {isRTL ? "تم إتمام البيع!" : "Sale Complete!"}
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ color: ds.textSecondary, fontSize: 15, marginBottom: 6, direction: "ltr" }}>{invoiceNumber}</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} style={{ color: "#16A34A", fontSize: 36, fontWeight: 900, marginBottom: 40 }}>
          {totals.total_amount.toLocaleString()} {currency}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ display: "flex", gap: 12, marginBottom: 14, maxWidth: 360, width: "100%" }}>
          <button onClick={handlePrint} style={{ flex: 1, height: 52, background: surface, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 14, color: ds.textPrimary, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Printer size={20} color="#2563EB" />{t.printReceipt}
          </button>
          <button onClick={handleShare} style={{ flex: 1, height: 52, background: "#25D366", border: "none", borderRadius: 14, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Share2 size={20} color="white" />{t.shareReceipt}
          </button>
        </motion.div>
        <motion.button whileTap={{ scale: 0.97 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} onClick={onSuccess}
          style={{ width: "100%", maxWidth: 360, height: 56, background: "linear-gradient(135deg,#1D4ED8,#2563EB)", border: "none", borderRadius: 16, color: "white", fontSize: 17, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: "0 8px 24px rgba(37,99,235,0.3)" }}>
          <ShoppingCart size={22} color="white" />{t.newSaleAfter}
        </motion.button>
      </div>
    );
  }

  // ── Main POS Layout (Build & Payment Modal) ─────────────────────────────────
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>

      {/* Top Bar */}
      <div style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB)", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, boxShadow: "0 2px 12px rgba(37,99,235,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.2)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <BackIcon size={20} color="white" />
          </button>
          <div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 500, margin: 0 }}>{t.newInvoice}</p>
            <p style={{ color: "white", fontSize: 16, fontWeight: 800, margin: 0, direction: "ltr" }}>{invoiceNumber}</p>
          </div>
        </div>
        {/* Customer picker in header — unified smart button */}
        <div style={{ display: "flex", alignItems: "center", height: 46 }}>
          <div style={{ display: "flex", alignItems: "stretch", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 14, overflow: "hidden", height: "100%" }}>
            {/* Main: Select Customer */}
            <button onClick={() => setShowCustomer(true)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 14px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: customer ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <User size={15} color="white" />
              </div>
              <div style={{ textAlign: isRTL ? "right" : "left" }}>
                <div style={{ color: "white", fontSize: 13, fontWeight: 700, lineHeight: 1 }}>
                  {customer ? customer.customer_name : (isRTL ? "اختر العميل" : "Select Customer")}
                </div>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 3 }}>
                  {customer ? (customer.phone ?? (isRTL ? "بدون رقم" : "No Phone")) : (isRTL ? "اضغط للاختيار • أو أضف +" : "Tap to select • or add +")}
                </div>
              </div>
              <ChevronDown size={14} color="rgba(255,255,255,0.6)" style={{ marginInlineStart: 4 }} />
            </button>
            {/* Divider */}
            <div style={{ width: 1, background: "rgba(255,255,255,0.2)", alignSelf: "stretch", margin: "8px 0" }} />
            {/* Mini + button */}
            <button
              onClick={() => setShowNewCustomer(true)}
              title={isRTL ? "إضافة عميل جديد" : "Add New Customer"}
              style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", transition: "background 0.15s" }}
              onMouseOver={e => e.currentTarget.style.background = "rgba(16,185,129,0.25)"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(16,185,129,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Plus size={14} color="white" strokeWidth={3} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Body: Full Screen Products */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        
        {/* Products Area (100% width) */}
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden", paddingBottom: 190 }}>
          <ProductSelector cart={cart} products={products} onAddItem={addItem} onUpdateQty={updateQty} onRemove={removeItem} />
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
              // Prevent opening drawer if they clicked the pay button
              if ((e.target as HTMLElement).closest('#pay-btn')) return;
              setShowCartDrawer(true);
            }}
          >
            {/* Left side: Cart Info */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 16px" }}>
              <div style={{ position: "relative" }}>
                <ShoppingCart size={24} color={ds.textPrimary} />
                {totalItems > 0 && (
                  <div style={{ position: "absolute", top: -8, right: -8, background: "#EF4444", color: "white", fontSize: 11, fontWeight: 800, width: 20, height: 20, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${isDark ? "#0C1929" : "#FFF"}` }}>
                    {totalItems}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>{isRTL ? "إجمالي السلة" : "Cart Total"}</span>
                <span style={{ color: ds.primary, fontSize: 18, fontWeight: 800 }}>{totals.total_amount.toLocaleString()} <span style={{ fontSize: 12 }}>{currency}</span></span>
              </div>
            </div>

            {/* Right side: Pay Button */}
            <button 
              id="pay-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (cart.length > 0) setStep("payment");
              }}
              style={{
                background: cart.length === 0 ? (isDark ? ds.surface2 : "#E2E8F0") : "linear-gradient(135deg,#1D4ED8,#2563EB)",
                border: "none",
                borderRadius: 16,
                padding: "0 32px",
                height: 52,
                color: cart.length === 0 ? ds.textMuted : "white",
                fontSize: 16,
                fontWeight: 800,
                cursor: cart.length === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s"
              }}
            >
              <CreditCard size={20} />
              {isRTL ? "الدفع السريع" : "Pay Now"}
            </button>
          </motion.div>
        </div>

        {/* Centered Modal for Cart Review */}
        <AnimatePresence>
          {showCartDrawer && (
            <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setShowCartDrawer(false)}
                style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }} 
              />
              
              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: "spring", damping: 26, stiffness: 300 }}
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 520,
                  maxHeight: "85vh",
                  background: surface,
                  borderRadius: 24,
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 24px 50px rgba(0,0,0,0.3)",
                  border: `1px solid ${isDark ? ds.border : "rgba(255,255,255,0.5)"}`,
                  overflow: "hidden"
                }}
              >
                {/* Header (Fixed) */}
                <div style={{ flexShrink: 0, zIndex: 10, padding: "20px 24px", background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ShoppingCart size={22} color="#2563EB" strokeWidth={2.5} />
                    </div>
                    <div>
                      <span style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, display: "block" }}>{isRTL ? "مراجعة السلة" : "Review Cart"}</span>
                      <span style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600 }}>{totalItems} {isRTL ? "عناصر" : "Items"}</span>
                    </div>
                  </div>
                  <button onClick={() => setShowCartDrawer(false)} style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#E2E8F0", border: "none", width: 36, height: 36, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={e=>(e.currentTarget.style.background="#EF4444", e.currentTarget.style.color="white")} onMouseOut={e=>(e.currentTarget.style.background=isDark?"rgba(255,255,255,0.05)":"#E2E8F0", e.currentTarget.style.color="")}>
                    <X size={18} color={ds.textPrimary} style={{ pointerEvents: "none" }} />
                  </button>
                </div>

                {/* Items (Scrollable) */}
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "24px", background: isDark ? ds.bg : "#FFFFFF", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  <style>{`div::-webkit-scrollbar { display: none; }`}</style>
                  {cart.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyItems: "center", height: "100%", justifyContent: "center", color: ds.textMuted, gap: 16, padding: "40px 0" }}>
                      <ShoppingCart size={56} color={ds.textMuted} strokeWidth={1} />
                      <p style={{ fontSize: 16, fontWeight: 600 }}>{isRTL ? "السلة فارغة حالياً" : "Cart is empty"}</p>
                    </div>
                  ) : (
                    cart.map(item => {
                      const p = products?.find(prod => prod.id === item.product_unit.product_id);
                      const productName = p ? p.product_name : item.product_unit.sku;
                      return (
                      <div key={item.product_unit.id} style={{ marginBottom: 16, background: isDark ? ds.surface : "#F8FAFC", borderRadius: 18, padding: "16px", border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                          <div style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700, flex: 1, marginInlineEnd: 12, lineHeight: 1.4 }}>{productName}</div>
                          <button onClick={() => removeItem(item.product_unit.id)} style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#EF4444", transition: "0.2s", flexShrink: 0 }} onMouseOver={e=>e.currentTarget.style.background="#EF4444"} onMouseOut={e=>e.currentTarget.style.background="rgba(239, 68, 68, 0.1)"}><Trash2 size={16} color="inherit" /></button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, background: isDark ? ds.surface2 : "#FFFFFF", borderRadius: 12, padding: 4, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                            <button onClick={() => updateQty(item.product_unit.id, -1)} style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? ds.surface : "#F1F5F9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark?ds.border:"#E2E8F0"} onMouseOut={e=>e.currentTarget.style.background=isDark?ds.surface:"#F1F5F9"}><Minus size={16} strokeWidth={2.5} color={ds.textPrimary} /></button>
                            <span style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, minWidth: 28, textAlign: "center" }}>{item.quantity}</span>
                            <button onClick={() => updateQty(item.product_unit.id, 1)} style={{ width: 36, height: 36, borderRadius: 10, background: "#2563EB", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background="#1D4ED8"} onMouseOut={e=>e.currentTarget.style.background="#2563EB"}><Plus size={16} strokeWidth={2.5} color="white" /></button>
                          </div>
                          <span style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 900 }}>{(item.unit_price * item.quantity).toLocaleString()} <span style={{ fontSize: 12, color: ds.textMuted }}>{currency}</span></span>
                        </div>
                        {/* Item Level Discount */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: isDark ? ds.bg : "#F1F5F9", padding: "6px 12px", borderRadius: 10 }}>
                          <span style={{ fontSize: 13, color: ds.textSecondary, fontWeight: 600 }}>{isRTL ? "الخصم (مبلغ ثابت):" : "Discount (Amount):"}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <input type="number" value={item.discount || ""} onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              setCart(p => p.map(i => i.product_unit.id === item.product_unit.id ? buildCartLine(i.product_unit, i.warehouse_id, i.quantity, i.unit_price, val, (i.tax / (i.line_total+i.discount))*100 || 0) : i));
                            }} placeholder="0" style={{ width: 70, background: isDark ? ds.surface : "#FFFFFF", border: `1px solid ${ds.border}`, borderRadius: 8, padding: "4px 8px", color: ds.primary, fontSize: 14, fontWeight: 700, outline: "none", textAlign: "center" }} />
                            <span style={{ fontSize: 12, color: ds.textMuted }}>{currency}</span>
                          </div>
                        </div>
                      </div>
                    )})
                  )}
                </div>

                {/* Footer (Fixed) */}
                <div style={{ flexShrink: 0, zIndex: 10, padding: "24px", background: isDark ? ds.surface2 : "#FFFFFF", borderTop: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, boxShadow: "0 -10px 30px rgba(0,0,0,0.06)" }}>
                  {/* Global Discount Input */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, background: isDark ? ds.surface : "#F8FAFC", padding: 12, borderRadius: 14, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: ds.textPrimary }}>{isRTL ? "خصم الفاتورة:" : "Invoice Discount:"}</span>
                      <div style={{ display: "flex", background: isDark ? ds.surface2 : "#E2E8F0", borderRadius: 8, overflow: "hidden" }}>
                        <button onClick={() => setGlobalDiscountType("percentage")} style={{ padding: "4px 8px", border: "none", background: globalDiscountType === "percentage" ? "#2563EB" : "transparent", color: globalDiscountType === "percentage" ? "white" : ds.textSecondary, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>%</button>
                        <button onClick={() => setGlobalDiscountType("fixed")} style={{ padding: "4px 8px", border: "none", background: globalDiscountType === "fixed" ? "#2563EB" : "transparent", color: globalDiscountType === "fixed" ? "white" : ds.textSecondary, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{currency}</button>
                      </div>
                    </div>
                    <input type="number" value={globalDiscountValue} onChange={e => setGlobalDiscountValue(e.target.value)} placeholder="0" style={{ width: 80, height: 32, background: isDark ? ds.bg : "#FFFFFF", border: `1px solid ${ds.border}`, borderRadius: 8, padding: "0 8px", color: ds.textPrimary, fontSize: 15, fontWeight: 700, textAlign: "center", outline: "none" }} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: ds.textSecondary, fontSize: 14, fontWeight: 600 }}>{t.invoiceSubtotal}</span>
                    <span style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 800 }}>{totals.subtotal.toLocaleString()}</span>
                  </div>
                  {totals.total_discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ color: "#EF4444", fontSize: 14, fontWeight: 600 }}>{isRTL ? "إجمالي الخصم" : "Total Discount"}</span>
                      <span style={{ color: "#EF4444", fontSize: 14, fontWeight: 800 }}>- {totals.total_discount.toLocaleString()}</span>
                    </div>
                  )}
                  {totals.tax_amount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ color: ds.textSecondary, fontSize: 14, fontWeight: 600 }}>{t.invoiceTax}</span>
                      <span style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 800 }}>{totals.tax_amount.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, paddingTop: 16, borderTop: `2px dashed ${isDark ? ds.border : "#CBD5E1"}` }}>
                    <span style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 900 }}>{t.invoiceGrandTotal}</span>
                    <span style={{ color: "#2563EB", fontSize: 26, fontWeight: 900 }}>{totals.total_amount.toLocaleString()} <span style={{fontSize:16}}>{currency}</span></span>
                  </div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => { if(cart.length > 0) { setShowCartDrawer(false); setTimeout(() => setStep("payment"), 200); } }}
                    style={{ width: "100%", height: 56, background: cart.length === 0 ? (isDark ? ds.surface : "#E2E8F0") : "linear-gradient(135deg,#1D4ED8,#2563EB)", border: "none", borderRadius: 16, color: cart.length === 0 ? ds.textMuted : "white", fontSize: 18, fontWeight: 800, cursor: cart.length === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: cart.length > 0 ? "0 8px 24px rgba(37,99,235,0.3)" : "none", transition: "all 0.2s" }}>
                    <CreditCard size={24} color={cart.length === 0 ? ds.textMuted : "white"} />
                    {t.confirmPayment}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCustomer && <SelectCustomerSheet customers={customers} selected={customer} onSelect={setCustomer} onClose={() => setShowCustomer(false)} onAddNew={() => { setShowCustomer(false); setShowNewCustomer(true); }} />}
        {showNewCustomer && (
          <ContactFormSheet 
            role="customer"
            onClose={() => setShowNewCustomer(false)}
            onSave={(newCust) => {
              const fullCustomer = {
                id: `cust_${Date.now()}`,
                business_id: "biz_001",
                customer_type: "Individual" as const,
                customer_name: newCust.customer_name || "",
                phone: newCust.phone || null,
                email: newCust.email || null,
                tax_number: newCust.tax_number || null,
                credit_limit: newCust.credit_limit || 0,
                opening_balance: newCust.opening_balance || 0,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              setCustomer(fullCustomer as Customer);
              setShowNewCustomer(false);
            }}
          />
        )}
      </AnimatePresence>
      {/* Centered Modal for Payment Step */}
      <AnimatePresence>
        {step === "payment" && (
          <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setStep("build")}
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }} 
            />
            
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              style={{
                position: "relative", width: "100%", maxWidth: 850, maxHeight: "85vh",
                background: surface, borderRadius: 24, display: "flex", flexDirection: "column",
                boxShadow: "0 24px 50px rgba(0,0,0,0.3)", border: `1px solid ${isDark ? ds.border : "rgba(255,255,255,0.5)"}`, overflow: "hidden"
              }}
            >
              {/* Header */}
              <div style={{ flexShrink: 0, padding: "20px 24px", background: "linear-gradient(135deg,#1E3A8A,#2563EB)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                   <CreditCard size={24} color="white" />
                   <span style={{ color: "white", fontSize: 20, fontWeight: 800 }}>{t.paymentMethod}</span>
                 </div>
                 <button onClick={() => setStep("build")} style={{ background: "rgba(255,255,255,0.15)", border: "none", width: 36, height: 36, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={e=>e.currentTarget.style.background="rgba(255,255,255,0.25)"} onMouseOut={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}>
                   <X size={18} color="white" />
                 </button>
              </div>

              {/* Body: Two columns */}
              <div style={{ flex: 1, display: "flex", overflow: "hidden", flexDirection: isRTL ? "row-reverse" : "row" }}>
                {/* Left: Invoice Summary */}
                <div style={{ flex: 1, overflowY: "auto", padding: 24, background: isDark ? ds.bg : "#F8FAFC" }}>
                  <div style={{ background: surface, borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                    <p style={{ color: ds.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 16 }}>{t.invoiceSummary}</p>
                    <p style={{ color: ds.textSecondary, fontSize: 13, marginBottom: 16 }}>{invoiceNumber}</p>
                    <div style={{ marginBottom: 16, borderBottom: `2px dashed ${isDark ? ds.border : "#E2E8F0"}`, paddingBottom: 16 }}>
                      {cart.map(i => {
                        const p = products?.find(prod => prod.id === i.product_unit.product_id);
                        const productName = p ? p.product_name : i.product_unit.sku;
                        return (
                          <div key={i.product_unit.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
                            <span style={{ color: ds.textSecondary, flex: 1, paddingInlineEnd: 12, lineHeight: 1.4 }}>{productName} × {i.quantity}</span>
                            <span style={{ color: ds.textPrimary, fontWeight: 700 }}>{i.line_total.toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600 }}>{t.invoiceSubtotal}</span>
                      <span style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 800 }}>{totals.subtotal.toLocaleString()}</span>
                    </div>
                    {totals.total_discount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ color: "#EF4444", fontSize: 13, fontWeight: 600 }}>{isRTL ? "الخصم" : "Discount"}</span>
                        <span style={{ color: "#EF4444", fontSize: 14, fontWeight: 800 }}>- {totals.total_discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                      <span style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{t.invoiceGrandTotal}</span>
                      <span style={{ color: "#2563EB", fontSize: 24, fontWeight: 900 }}>{totals.total_amount.toLocaleString()} <span style={{fontSize: 14}}>{currency}</span></span>
                    </div>
                  </div>
                </div>

                {/* Right: Payment Options */}
                <div style={{ width: 380, flexShrink: 0, borderInlineStart: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", flexDirection: "column", background: surface }}>
                  <div style={{ flex: 1, overflowY: "auto", padding: "24px", scrollbarWidth: "none" }}>
                    <style>{`div::-webkit-scrollbar { display: none; }`}</style>

                    {/* Customer Selection in Modal */}
                    <div style={{ marginBottom: 24 }}>
                      <label style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>{isRTL ? "العميل (المشتري)" : "Customer"}</label>
                      <button onClick={() => setShowCustomer(true)} 
                        style={{ width: "100%", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", background: isDark ? ds.surface2 : "#F8FAFC", border: `1.5px solid ${customer ? "#2563EB" : ds.border}`, borderRadius: 16, padding: "0 16px", cursor: "pointer", transition: "all 0.2s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: customer ? "rgba(37,99,235,0.1)" : isDark ? ds.surface : "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <User size={20} color={customer ? "#2563EB" : ds.textSecondary} />
                          </div>
                          <div style={{ textAlign: isRTL ? "right" : "left", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <span style={{ color: customer ? ds.textPrimary : ds.textSecondary, fontSize: 14, fontWeight: 700 }}>
                              {customer ? customer.customer_name : (isRTL ? "عميل نقدي (كاش)" : "Cash Customer")}
                            </span>
                            <span style={{ color: ds.textMuted, fontSize: 12, marginTop: 2 }}>
                              {customer ? (customer.phone ?? (isRTL ? "بدون رقم" : "No Phone")) : (isRTL ? "اضغط لاختيار عميل" : "Tap to select customer")}
                            </span>
                          </div>
                        </div>
                        <ChevronDown size={18} color={ds.textSecondary} />
                      </button>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <label style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600 }}>{isRTL ? "طريقة الدفع" : "Payment Method"}</label>
                      <button onClick={() => setIsSplitPayment(!isSplitPayment)} style={{ background: isSplitPayment ? "rgba(37,99,235,0.1)" : "transparent", color: isSplitPayment ? "#2563EB" : ds.textSecondary, border: `1.5px solid ${isSplitPayment ? "#2563EB" : ds.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                        <CreditCard size={14} /> {isRTL ? "دفع مقسم (كاش + شبكة)" : "Split Payment"}
                      </button>
                    </div>

                    {!isSplitPayment ? (
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                          {PAY_METHODS.map(m => (
                            <motion.button key={m.key} whileTap={{ scale: 0.95 }} onClick={() => setPayMethod(m.key)}
                              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 8px", background: payMethod === m.key ? `${m.color}18` : isDark ? ds.surface2 : "#F8FAFC", border: `2px solid ${payMethod === m.key ? m.color : "transparent"}`, borderRadius: 16, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                              <div style={{ width: 44, height: 44, borderRadius: 14, background: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><m.icon size={22} color={m.color} strokeWidth={2.2} /></div>
                              <span style={{ color: payMethod === m.key ? m.color : ds.textPrimary, fontSize: 14, fontWeight: 700 }}>{t[m.labelKey]}</span>
                            </motion.button>
                          ))}
                        </div>

                        {payMethod === "Cash" && (
                          <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} style={{ marginBottom: 24 }}>
                            <label style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>{t.amountPaid}</label>
                            <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder={totals.total_amount.toString()}
                              style={{ width: "100%", height: 56, boxSizing: "border-box", padding: "0 16px", background: isDark ? ds.surface2 : "#F8FAFC", border: `2px solid ${ds.border}`, borderRadius: 16, color: ds.textPrimary, fontSize: 22, fontWeight: 800, outline: "none", fontFamily: "inherit", direction: "ltr", transition: "border 0.2s" }} 
                              onFocus={e=>e.currentTarget.style.borderColor="#2563EB"} onBlur={e=>e.currentTarget.style.borderColor=ds.border} />
                            {cashNum >= totals.total_amount && cashNum > 0 && (
                              <div style={{ marginTop: 12, padding: "12px 16px", background: "rgba(22,163,74,0.1)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(22,163,74,0.2)" }}>
                                <span style={{ color: "#16A34A", fontWeight: 700, fontSize: 14 }}>{t.amountChange}</span>
                                <span style={{ color: "#16A34A", fontWeight: 900, fontSize: 18 }}>{(cashNum - totals.total_amount).toLocaleString()} {currency}</span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </>
                    ) : (
                      <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{ marginBottom: 24 }}>
                        {splitPayments.map((sp, idx) => (
                           <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                             <select value={sp.method} onChange={e => {
                               const newSp = [...splitPayments];
                               newSp[idx].method = e.target.value as PaymentMethodType;
                               setSplitPayments(newSp);
                             }} style={{ flex: 1, height: 48, borderRadius: 12, border: `1px solid ${ds.border}`, background: isDark ? ds.surface2 : "#F8FAFC", color: ds.textPrimary, padding: "0 12px", outline: "none", fontSize: 14, fontWeight: 700 }}>
                               {PAY_METHODS.map(m => <option key={m.key} value={m.key}>{t[m.labelKey]}</option>)}
                             </select>
                             <input type="number" value={sp.amount} onChange={e => {
                               const newSp = [...splitPayments];
                               newSp[idx].amount = e.target.value;
                               setSplitPayments(newSp);
                             }} placeholder="0" style={{ width: 100, height: 48, borderRadius: 12, border: `1px solid ${ds.border}`, background: isDark ? ds.surface2 : "#F8FAFC", color: ds.textPrimary, padding: "0 12px", outline: "none", fontSize: 16, fontWeight: 800, textAlign: "center" }} />
                             <button onClick={() => setSplitPayments(p => p.filter((_, i) => i !== idx))} style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Trash2 size={18} /></button>
                           </div>
                        ))}
                        <button onClick={() => setSplitPayments(p => [...p, { method: "Other", amount: "" }])} style={{ width: "100%", height: 48, borderRadius: 12, background: isDark ? ds.surface2 : "#F1F5F9", color: ds.textPrimary, border: `1.5px dashed ${ds.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, fontWeight: 700 }}>
                          <Plus size={18} /> {isRTL ? "إضافة طريقة دفع أخرى" : "Add Payment Method"}
                        </button>
                        
                        {/* Split Totals Summary */}
                        <div style={{ marginTop: 16, padding: "16px", background: isDark ? ds.surface2 : "#F8FAFC", borderRadius: 16, border: `1px solid ${ds.border}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: ds.textSecondary, fontWeight: 600 }}>
                            <span>{isRTL ? "الإجمالي المطلوب:" : "Total Required:"}</span>
                            <span>{totals.total_amount.toLocaleString()}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: ds.textPrimary, fontWeight: 700 }}>
                            <span>{isRTL ? "إجمالي المدفوع:" : "Total Paid:"}</span>
                            <span>{splitTotal.toLocaleString()}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: `1px dashed ${ds.border}`, fontSize: 16, fontWeight: 800, color: splitRemaining > 0 ? "#EF4444" : "#16A34A" }}>
                            <span>{splitRemaining > 0 ? (isRTL ? "المتبقي:" : "Remaining:") : (isRTL ? "الباقي للعميل:" : "Change:")}</span>
                            <span>{Math.abs(splitRemaining).toLocaleString()} {currency}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div>
                      <label style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>{t.invoiceNotes}</label>
                      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder={isRTL ? "أضف أي ملاحظات هنا..." : "Add notes here..."}
                        style={{ width: "100%", boxSizing: "border-box", padding: "16px", background: isDark ? ds.surface2 : "#F8FAFC", border: `1.5px solid ${ds.border}`, borderRadius: 16, color: ds.textPrimary, fontSize: 14, outline: "none", fontFamily: "inherit", resize: "none", transition: "border 0.2s" }} 
                        onFocus={e=>e.currentTarget.style.borderColor="#2563EB"} onBlur={e=>e.currentTarget.style.borderColor=ds.border}/>
                    </div>
                  </div>

                  <div style={{ padding: "24px", borderTop: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", gap: 12, background: surface, boxShadow: "0 -4px 20px rgba(0,0,0,0.03)" }}>
                    <button onClick={() => setStep("build")} style={{ flex: 1, height: 56, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 16, color: ds.textSecondary, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark?ds.border:"#E2E8F0"} onMouseOut={e=>e.currentTarget.style.background=isDark?ds.surface2:"#F1F5F9"}>{t.saveAsDraft}</button>
                    <motion.button whileTap={{ scale: 0.97 }} disabled={isSplitPayment && splitRemaining > 0} onClick={() => setStep("success")}
                      style={{ flex: 2, height: 56, background: (isSplitPayment && splitRemaining > 0) ? (isDark ? ds.surface : "#E2E8F0") : "linear-gradient(135deg,#16A34A,#22C55E)", border: "none", borderRadius: 16, color: (isSplitPayment && splitRemaining > 0) ? ds.textMuted : "white", fontSize: 16, fontWeight: 800, cursor: (isSplitPayment && splitRemaining > 0) ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: (isSplitPayment && splitRemaining > 0) ? "none" : "0 8px 24px rgba(22,163,74,0.3)", transition: "all 0.2s" }}>
                      <Check size={22} color={(isSplitPayment && splitRemaining > 0) ? ds.textMuted : "white"} strokeWidth={2.5} />{t.confirmPayment}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
