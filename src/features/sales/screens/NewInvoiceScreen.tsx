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

  const currency = "YER";
  
  // Calculate totals manually
  const totals = {
    subtotal: cart.reduce((s, i) => s + (i.unit_price * i.quantity), 0),
    discount_amount: cart.reduce((s, i) => s + i.discount, 0),
    tax_amount: cart.reduce((s, i) => s + i.tax, 0),
    total_amount: cart.reduce((s, i) => s + i.line_total, 0),
  };

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const cashNum = parseFloat(cashReceived) || 0;
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

  // ── Build step: Tablet two-column POS layout ─────────────────────────────────
  if (step === "build") return (
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
        {/* Customer picker in header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 46 }}>
          <button onClick={() => setShowCustomer(true)} style={{ height: "100%", display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 12, padding: "0 16px", cursor: "pointer", fontFamily: "inherit" }}>
            <User size={18} color="white" />
            <div style={{ textAlign: isRTL ? "right" : "left", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{customer ? customer.customer_name : (isRTL ? "اختر العميل" : "Select Customer")}</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 2 }}>{customer ? (customer.phone ?? (isRTL ? "بدون رقم" : "No Phone")) : (isRTL ? "اضغط للاختيار" : "Click to select")}</div>
            </div>
            <ChevronDown size={16} color="rgba(255,255,255,0.7)" style={{ marginInlineStart: 8 }} />
          </button>
          
          <button onClick={() => setShowNewCustomer(true)} title={isRTL ? "إضافة عميل" : "New Customer"} style={{ height: "100%", padding: "0 14px", display: "flex", alignItems: "center", gap: 6, justifyContent: "center", background: "linear-gradient(135deg, #10B981, #059669)", border: "none", borderRadius: 12, cursor: "pointer", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}>
            <Plus size={18} color="white" strokeWidth={3} />
            <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{isRTL ? "إضافة عميل" : "New"}</span>
          </button>
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
                    <ShoppingCart size={22} color="#2563EB" />
                    <span style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "مراجعة السلة" : "Review Cart"}</span>
                    <div style={{ background: "#2563EB", color: "white", fontSize: 12, fontWeight: 800, padding: "2px 8px", borderRadius: 12 }}>{totalItems}</div>
                  </div>
                  <button onClick={() => setShowCartDrawer(false)} style={{ background: isDark ? ds.surface2 : "#F1F5F9", border: "none", width: 36, height: 36, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <X size={18} color={ds.textPrimary} />
                  </button>
                </div>

                {/* Items */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                  {cart.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyItems: "center", height: "100%", justifyContent: "center", color: ds.textMuted, gap: 16 }}>
                      <ShoppingCart size={48} color={ds.textMuted} strokeWidth={1} />
                      <p style={{ fontSize: 15, fontWeight: 600 }}>{isRTL ? "السلة فارغة حالياً" : "Cart is empty"}</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.product_unit.id} style={{ marginBottom: 12, background: isDark ? ds.surface2 : "#F8FAFC", borderRadius: 16, padding: "16px", border: `1px solid ${isDark ? ds.border : "#F1F5F9"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 700, flex: 1, marginInlineEnd: 12, lineHeight: 1.4 }}>{item.product_unit.sku}</div>
                          <button onClick={() => removeItem(item.product_unit.id)} style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#EF4444" }}><Trash2 size={14} /></button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, background: surface, borderRadius: 10, padding: 4, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                            <button onClick={() => updateQty(item.product_unit.id, -1)} style={{ width: 32, height: 32, borderRadius: 8, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14} strokeWidth={2.5} color={ds.textPrimary} /></button>
                            <span style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 800, minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
                            <button onClick={() => updateQty(item.product_unit.id, 1)} style={{ width: 32, height: 32, borderRadius: 8, background: "#2563EB", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={14} strokeWidth={2.5} color="white" /></button>
                          </div>
                          <span style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 900 }}>{item.line_total.toLocaleString()} <span style={{ fontSize: 11, color: ds.textMuted }}>{currency}</span></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Drawer Footer (Totals & Pay) */}
                <div style={{ padding: "20px 24px 32px 24px", background: isDark ? ds.surface2 : "#F8FAFC", borderTop: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                  {[{ l: t.invoiceSubtotal, v: totals.subtotal }, ...(totals.tax_amount > 0 ? [{ l: t.invoiceTax, v: totals.tax_amount }] : [])].map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ color: ds.textSecondary, fontSize: 14 }}>{r.l}</span>
                      <span style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700 }}>{r.v.toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, paddingTop: 12, borderTop: `2px dashed ${isDark ? ds.border : "#CBD5E1"}` }}>
                    <span style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 900 }}>{t.invoiceGrandTotal}</span>
                    <span style={{ color: "#2563EB", fontSize: 24, fontWeight: 900 }}>{totals.total_amount.toLocaleString()} {currency}</span>
                  </div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => cart.length > 0 && setStep("payment")}
                    style={{ width: "100%", height: 56, background: cart.length === 0 ? (isDark ? ds.surface : "#E2E8F0") : "linear-gradient(135deg,#1D4ED8,#2563EB)", border: "none", borderRadius: 16, color: cart.length === 0 ? ds.textMuted : "white", fontSize: 17, fontWeight: 800, cursor: cart.length === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: cart.length > 0 ? "0 8px 24px rgba(37,99,235,0.3)" : "none" }}>
                    <CreditCard size={22} color={cart.length === 0 ? ds.textMuted : "white"} />
                    {t.confirmPayment}
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCustomer && <SelectCustomerSheet customers={customers} selected={customer} onSelect={setCustomer} onClose={() => setShowCustomer(false)} />}
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
    </div>
  );

  // ── Payment step ─────────────────────────────────────────────────────────────
  if (step === "payment") return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      <div style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB)", padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
        <button onClick={() => setStep("build")} style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.2)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <BackIcon size={20} color="white" />
        </button>
        <span style={{ color: "white", fontSize: 20, fontWeight: 800 }}>{t.paymentMethod}</span>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: invoice summary */}
        <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
          <div style={{ background: surface, borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <p style={{ color: ds.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 16 }}>{t.invoiceSummary}</p>
            <p style={{ color: ds.textSecondary, fontSize: 13, marginBottom: 8 }}>{invoiceNumber}</p>
            {cart.map(i => {
              const p = products?.find(p => p.id === i.product_unit.product_id);
              const productName = p ? p.product_name : i.product_unit.sku;
              return (
                <div key={i.product_unit.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
                  <span style={{ color: ds.textSecondary, flex: 1, paddingInlineEnd: 12, lineHeight: 1.4 }}>{productName} × {i.quantity}</span>
                  <span style={{ color: ds.textPrimary, fontWeight: 700 }}>{i.line_total.toLocaleString()}</span>
                </div>
              );
            })}
            <div style={{ borderTop: `2px solid ${isDark ? ds.border : "#E2E8F0"}`, paddingTop: 12, marginTop: 8, display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{t.invoiceGrandTotal}</span>
              <span style={{ color: "#2563EB", fontSize: 22, fontWeight: 900 }}>{totals.total_amount.toLocaleString()} {currency}</span>
            </div>
          </div>
        </div>

        {/* Right: payment options */}
        <div style={{ width: 360, flexShrink: 0, borderInlineStart: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {PAY_METHODS.map(m => (
                <motion.button key={m.key} whileTap={{ scale: 0.95 }} onClick={() => setPayMethod(m.key)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "18px 8px", background: payMethod === m.key ? `${m.color}18` : isDark ? ds.surface2 : "#F8FAFC", border: `2px solid ${payMethod === m.key ? m.color : "transparent"}`, borderRadius: 16, cursor: "pointer", fontFamily: "inherit" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><m.icon size={22} color={m.color} strokeWidth={2.2} /></div>
                  <span style={{ color: payMethod === m.key ? m.color : ds.textPrimary, fontSize: 13, fontWeight: 700 }}>{t[m.labelKey]}</span>
                </motion.button>
              ))}
            </div>

            {payMethod === "Cash" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>{t.amountPaid}</label>
                <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)} placeholder={totals.total_amount.toString()}
                  style={{ width: "100%", height: 52, boxSizing: "border-box", padding: "0 16px", background: surface, border: `2px solid ${ds.border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 20, fontWeight: 700, outline: "none", fontFamily: "inherit", direction: "ltr" }} />
                {cashNum >= totals.total_amount && cashNum > 0 && (
                  <div style={{ marginTop: 8, padding: "10px 14px", background: "rgba(22,163,74,0.1)", borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#16A34A", fontWeight: 600 }}>{t.amountChange}</span>
                    <span style={{ color: "#16A34A", fontWeight: 800 }}>{(cashNum - totals.total_amount).toLocaleString()} {currency}</span>
                  </div>
                )}
              </div>
            )}

            <div>
              <label style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>{t.invoiceNotes}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", background: surface, border: `1.5px solid ${ds.border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, outline: "none", fontFamily: "inherit", resize: "none" }} />
            </div>
          </div>

          <div style={{ padding: "16px 20px 140px 20px", borderTop: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", gap: 10 }}>
            <button onClick={() => setStep("build")} style={{ flex: 1, height: 50, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 13, color: ds.textSecondary, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{t.saveAsDraft}</button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep("success")}
              style={{ flex: 2, height: 50, background: "linear-gradient(135deg,#16A34A,#22C55E)", border: "none", borderRadius: 13, color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(22,163,74,0.3)" }}>
              <Check size={20} color="white" strokeWidth={2.5} />{t.confirmPayment}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Success step ─────────────────────────────────────────────────────────────
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
