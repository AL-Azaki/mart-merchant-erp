import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, ArrowRight, User, ShoppingCart, ChevronDown,
  Trash2, CreditCard, Banknote, Smartphone, Clock, Check,
  Share2, Printer, X, Plus, Minus, Package, RotateCcw,
  ArrowUpRight, ArrowDownRight, FileText
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { SelectCustomerSheet } from "../components/SelectCustomerSheet";
import { ContactFormSheet } from "@/features/crm/components/ContactFormSheet";
import { TransactionFormSheet } from "@/features/finance/components/TransactionFormSheet";
import { ProductSelector } from "../components/ProductSelector";
import { SalesReturnsScreen } from "./SalesReturnsScreen";
import { 
  buildCartLine, 
  nextInvoiceNumber, 
  MOCK_SALES_INVOICES,
  MOCK_SALES_INVOICE_ITEMS,
  MOCK_INVENTORIES,
  MOCK_INVENTORY_TRANSACTIONS,
  MOCK_CUSTOMERS
} from "@/core/data/salesMockData";
import { MOCK_BUSINESS } from "@/core/data/mockData";
import type { Customer, CartLine } from "@/core/types/sales";
import type { PaymentMethodType } from "@/core/types/finance";
import { generateReceiptHTML, buildReceiptMessage } from "../utils/receiptUtils";
import { generateVoucherHTML } from "@/features/finance/utils/voucherReceiptUtils";
import { MOCK_CURRENCIES } from "@/core/data/financeMockData";
import { useFinancialStore } from "@/core/engine/useFinancialStore";

const PAY_METHODS: { key: PaymentMethodType; icon: any; labelKey: string; color: string }[] = [
  { key: "Cash",     icon: Banknote,   labelKey: "payCash",     color: "#16A34A" },
  { key: "Card",     icon: CreditCard, labelKey: "payCard",     color: "#2563EB" },
  { key: "Bank", icon: Smartphone, labelKey: "payTransfer", color: "#8B5CF6" },
  { key: "Other",   icon: Clock,      labelKey: "payCredit",   color: "#F59E0B" },
];

type Step = "build" | "payment" | "success";

export function NewInvoiceScreen({ customers = [], products = [], onSuccess, onReturnsClick }: { customers?: any[]; products?: any[]; onSuccess: () => void; onReturnsClick?: () => void }) {
  const { t, isDark, isRTL, ds } = useApp();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  
  const store = useFinancialStore();

  const [step, setStep] = useState<Step>("build");
  const [showCustomer, setShowCustomer] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showReturnsList, setShowReturnsList] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState<"income" | "expense" | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeMethods, setActiveMethods] = useState<PaymentMethodType[]>(["Cash"]);
  const [paymentAmounts, setPaymentAmounts] = useState<Record<PaymentMethodType, string>>({
    Cash: "", Card: "", Bank: "", Other: ""
  });

  const [globalDiscountType, setGlobalDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [globalDiscountValue, setGlobalDiscountValue] = useState("");

  // --- Hold Invoice State ---
  interface HeldInvoice {
    id: string;
    time: string;
    cart: CartLine[];
    customer: Customer | null;
  }
  const [heldInvoices, setHeldInvoices] = useState<HeldInvoice[]>([]);
  const [showHeldDrawer, setShowHeldDrawer] = useState(false);

  const holdCurrentInvoice = () => {
    if (cart.length === 0) return;
    setHeldInvoices(prev => [{
      id: `HLD-${Date.now().toString().slice(-6)}`,
      time: new Date().toLocaleTimeString(isRTL ? "ar-YE" : "en-US", { hour: "2-digit", minute: "2-digit" }),
      cart,
      customer
    }, ...prev]);
    setCart([]);
    setCustomer(null);
    setGlobalDiscountValue("");
  };

  const resumeInvoice = (held: HeldInvoice) => {
    setCart(held.cart);
    setCustomer(held.customer);
    setHeldInvoices(prev => prev.filter(h => h.id !== held.id));
    setShowHeldDrawer(false);
  };
  // --------------------------

  const defaultCurrency = MOCK_CURRENCIES.find(c => c.is_base_currency) || MOCK_CURRENCIES[0];
  const [currencyId, setCurrencyId] = useState<string>(defaultCurrency?.id || "");
  const [exchangeRate, setExchangeRate] = useState<number>(defaultCurrency?.exchange_rate || 1);
  const currencyObj = MOCK_CURRENCIES.find(c => c.id === currencyId) || defaultCurrency;
  const currency = currencyObj?.currency_symbol || "YER";
  
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
  const notes = ""; // We will keep notes empty string for now or let's declare it here to not lose it if we want.
  
  const totalPaid = activeMethods.filter(m => m !== "Other").reduce((sum, m) => sum + (parseFloat(paymentAmounts[m]) || 0), 0);
  const creditAmount = Math.max(0, totals.total_amount - totalPaid);
  const changeAmount = Math.max(0, totalPaid - totals.total_amount);
  
  const hasCredit = creditAmount > 0;
  const isValidToPay = cart.length > 0 && (!hasCredit || (hasCredit && customer !== null));

  const toggleMethod = (key: PaymentMethodType) => {
    if (key === "Other") {
      setActiveMethods(["Other"]);
      setPaymentAmounts({ Cash: "", Card: "", Bank: "", Other: "" });
      return;
    }
    setActiveMethods(prev => {
      let next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      next = next.filter(k => k !== "Other"); // Remove explicit Other if selecting a real method
      if (next.length === 0) next = [key]; 
      if (!next.includes(key)) {
        setPaymentAmounts(pa => ({ ...pa, [key]: "" }));
      }
      return next;
    });
  };

  const [invoiceNumber] = useState(() => nextInvoiceNumber(MOCK_SALES_INVOICES));

  const addItem = (item: CartLine) => setCart(p => [...p, item]);
  const updateQty = (id: string, delta: number) => setCart(p => p.map(i => i.product_unit.id !== id ? i : buildCartLine(i.product_unit, i.warehouse_id, Math.max(1, i.quantity + delta), i.unit_price, i.discount, (i.tax / i.line_total)*100 || 0)));
  const removeItem = (id: string) => setCart(p => p.filter(i => i.product_unit.id !== id));

  const formatDate = () => new Date().toLocaleDateString(isRTL ? "ar-YE" : "en-US", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const payLabel = (key: PaymentMethodType) => t[PAY_METHODS.find(m => m.key === key)?.labelKey || "payCash"];

  const handleCompleteSale = () => {
    const newInvoiceId = `si_mock_${Date.now()}`;
    const now = new Date().toISOString();
    const costTotal = cart.reduce((s, item) => s + ((item.product_unit?.cost_price || 0) * item.quantity), 0);

    // 1. Build immutable invoice record (payment fields are NOT stored here)
    const invoiceData = {
      id: newInvoiceId,
      business_id: "biz_001",
      branch_id: "br_001",
      customer_id: customer?.id || null,
      invoice_number: invoiceNumber,
      invoice_date: now,
      due_date: null,
      currency_id: currencyId,
      exchange_rate: exchangeRate,
      sub_total: totals.subtotal,
      discount_total: totals.total_discount,
      tax_total: totals.tax_amount,
      grand_total: totals.total_amount,
      base_sub_total: totals.subtotal * exchangeRate,
      base_discount_total: totals.total_discount * exchangeRate,
      base_tax_total: totals.tax_amount * exchangeRate,
      base_grand_total: totals.total_amount * exchangeRate,
      // These fields are kept for legacy display only; financial status is computed dynamically
      payment_status: totalPaid === 0 ? "Unpaid" : hasCredit ? "Partial" : "Paid",
      mock_paid_amount: totalPaid,
      status: "Posted",
      notes: notes || null,
      created_by: "usr_001",
      created_at: now,
      updated_at: now,
      deleted_at: null,
    } as any;

    // 2. Build invoice items + deduct inventory
    const newItems: any[] = [];
    cart.forEach(item => {
      newItems.push({
        id: `sii_mock_${Math.random()}`,
        sales_invoice_id: newInvoiceId,
        product_unit_id: item.product_unit.id,
        warehouse_id: item.warehouse_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        cost_price: item.product_unit.cost_price || 0,
        discount: item.discount,
        tax: item.tax,
        line_total: item.line_total,
        base_line_total: item.line_total * exchangeRate,
        cost_total: item.cost_total,
      });

      const invIdx = MOCK_INVENTORIES.findIndex(
        inv => inv.warehouse_id === item.warehouse_id && inv.product_unit_id === item.product_unit.id
      );
      if (invIdx >= 0) MOCK_INVENTORIES[invIdx].quantity -= item.quantity;

      MOCK_INVENTORY_TRANSACTIONS.push({
        id: `inv_tx_mock_${Math.random()}`,
        inventory_id: invIdx >= 0 ? MOCK_INVENTORIES[invIdx].id : "unknown",
        product_unit_id: item.product_unit.id,
        transaction_type: "Out",
        quantity: item.quantity,
        unit_cost: item.product_unit.cost_price || 0,
        reference_type: "SalesInvoice",
        reference_id: newInvoiceId,
        transaction_date: now,
      });
    });

    // 3. ✅ Single atomic call — posts invoice + GL journal entry + receipt voucher if paid
    store.addSalesInvoice(invoiceData, newItems, {
      invoiceId:      newInvoiceId,
      invoiceNumber:  invoiceNumber,
      grandTotal:     totals.total_amount,
      baseGrandTotal: totals.total_amount * exchangeRate,
      taxTotal:       totals.tax_amount,
      baseTaxTotal:   totals.tax_amount * exchangeRate,
      costTotal,
      baseCostTotal:  costTotal * exchangeRate,
      currencyId,
      exchangeRate,
      paidAmount:     totalPaid,
      basePaidAmount: totalPaid * exchangeRate,
      paymentMethod:  activeMethods[0] || "Cash",
      customerName:   customer?.customer_name,
    });

    setStep("success");
  };

  function handlePrint() {
    const w = window.open("", "", "width=900,height=700");
    if (!w) return;
    w.document.write(generateReceiptHTML({
      businessName: MOCK_BUSINESS.business_name,
      businessPhone: MOCK_BUSINESS.primary_phone ?? "",
      businessAddress: "صنعاء، اليمن",
      businessTaxId: "3004005001",
      businessCR: "1010101010",
      branchName: isRTL ? "الفرع الرئيسي" : "Main Branch",
      invoiceNumber,
      invoiceDate: new Date().toLocaleDateString(isRTL ? "ar-YE" : "en-US"),
      invoiceTime: new Date().toLocaleTimeString(isRTL ? "ar-YE" : "en-US", { hour: "2-digit", minute: "2-digit" }),
      invoiceStatus: hasCredit ? "Unpaid" : "Paid",
      customerName: customer?.customer_name ?? (isRTL ? "عميل نقدي" : "Cash Customer"),
      customerPhone: customer?.phone ?? undefined,
      customerCode: customer?.id,
      salesRep: isRTL ? "أحمد العُمري" : "Ahmed",
      items: cart.map(i => ({
        name: i.product_unit.product?.product_name || (isRTL ? "منتج" : "Product"),
        sku: i.product_unit.sku,
        unit: i.product_unit.unit?.unit_name || (isRTL ? "قطعة" : "PC"),
        qty: i.quantity,
        unitPrice: i.unit_price,
        discount: i.discount,
        tax: i.tax,
        totalBeforeTax: i.line_total - i.tax + i.discount,
        total: i.line_total
      })),
      subtotal: totals.subtotal,
      discountAmount: totals.total_discount > 0 ? totals.total_discount : undefined,
      taxAmount: totals.tax_amount > 0 ? totals.tax_amount : undefined,
      grandTotal: totals.total_amount,
      baseGrandTotal: totals.total_amount * exchangeRate,
      baseCurrency: defaultCurrency.currency_symbol,
      paidAmount: totalPaid,
      remainingAmount: creditAmount,
      paymentStatus: hasCredit ? "Unpaid" : "Paid",
      currency,
      paymentMethod: activeMethods.map(m => payLabel(m)).join(" + "),
      notes: notes || undefined,
      returnPolicy: isRTL ? "البضاعة المباعة ترد وتستبدل خلال 14 يوماً بشرط سلامة العبوة." : "Items can be returned within 14 days if packaging is intact.",
      isRTL,
      appName: isRTL ? "تاجر" : "Tajir"
    }));
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      w.close();
    }, 250);
  }

  function handleShare() {
    const text = buildReceiptMessage({
      businessName: MOCK_BUSINESS.business_name,
      businessPhone: MOCK_BUSINESS.primary_phone ?? "",
      businessAddress: "صنعاء، اليمن",
      invoiceNumber,
      invoiceDate: new Date().toLocaleDateString(isRTL ? "ar-YE" : "en-US"),
      customerName: customer?.customer_name ?? (isRTL ? "عميل نقدي" : "Cash Customer"),
      items: cart.map(i => ({ name: i.product_unit.product?.product_name || "منتج", qty: i.quantity, unitPrice: i.unit_price, total: i.line_total })),
      subtotal: totals.subtotal,
      discountAmount: totals.total_discount > 0 ? totals.total_discount : undefined,
      taxAmount: totals.tax_amount > 0 ? totals.tax_amount : undefined,
      grandTotal: totals.total_amount,
      currency,
      paymentMethod: activeMethods.map(m => payLabel(m)).join(" + "),
      notes: notes || undefined,
      isRTL,
      appName: isRTL ? "تاجر" : "Tajir"
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

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
        <motion.button whileTap={{ scale: 0.97 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} 
          onClick={() => {
            setStep("build");
            setCart([]);
            setCustomer(null);
            setPaymentAmounts({ Cash: "", Card: "", Bank: "", Other: "" });
            setActiveMethods(["Cash"]);
            setGlobalDiscountValue("");
          }}
          style={{ width: "100%", maxWidth: 360, height: 56, background: "linear-gradient(135deg,#1D4ED8,#2563EB)", border: "none", borderRadius: 16, color: "white", fontSize: 17, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: "0 8px 24px rgba(37,99,235,0.3)" }}>
          <ShoppingCart size={22} color="white" />{t.newSaleAfter}
        </motion.button>
      </div>
    );
  }

  // ── Main POS Layout (Build & Payment Modal) ─────────────────────────────────
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>

      {/* Top Action Bar (Redesigned for ERP Standards) */}
      <div style={{ background: surface, padding: "12px 24px", minHeight: 72, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, borderBottom: `1px solid ${border}`, flexShrink: 0, zIndex: 10 }}>
        
        {/* Context Group: Invoice Info & Customer */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
          
          {/* Invoice Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: isDark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF", border: `1px solid ${isDark ? "rgba(59, 130, 246, 0.3)" : "#BFDBFE"}`, padding: "8px 16px", borderRadius: 12 }}>
            <FileText size={18} color="#3B82F6" />
            <div>
              <p style={{ color: "#3B82F6", fontSize: 11, fontWeight: 700, margin: 0, marginBottom: 2 }}>{isRTL ? "رقم الفاتورة" : "Invoice No."}</p>
              <p style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 800, margin: 0, direction: "ltr", letterSpacing: "0.5px" }}>{invoiceNumber}</p>
            </div>
          </div>

          <div style={{ width: 1, height: 32, background: border, display: "block" }} />

          {/* Currency Selection Group */}
          <div style={{ display: "flex", alignItems: "center", border: `1px solid ${border}`, borderRadius: 12, background: isDark ? ds.surface2 : "#F8FAFC", overflow: "hidden", padding: "0 12px", height: 56 }}>
            <Banknote size={20} color={ds.textSecondary} style={{ marginInlineEnd: 12 }} />
            <select value={currencyId} onChange={(e) => {
              const cur = MOCK_CURRENCIES.find(c => c.id === e.target.value);
              if (cur) {
                setCurrencyId(cur.id);
                setExchangeRate(cur.exchange_rate);
              }
            }} style={{ height: "100%", background: "transparent", border: "none", color: ds.textPrimary, fontSize: 16, fontWeight: 700, outline: "none", cursor: "pointer", appearance: "none" }}>
              {MOCK_CURRENCIES.map(c => (
                <option key={c.id} value={c.id}>{c.currency_code}</option>
              ))}
            </select>
            {currencyObj && !currencyObj.is_base_currency && (
              <>
                <div style={{ width: 1, height: 24, background: border, margin: "0 12px" }} />
                <input 
                  type="number" 
                  value={exchangeRate} 
                  onChange={e => setExchangeRate(Number(e.target.value) || 1)} 
                  style={{ width: 70, height: "100%", background: "transparent", border: "none", color: ds.textPrimary, fontSize: 16, fontWeight: 700, outline: "none", textAlign: "center" }}
                  title={isRTL ? "سعر الصرف" : "Exchange Rate"}
                />
              </>
            )}
          </div>

          <div style={{ width: 1, height: 32, background: border, display: "block" }} />

          {/* Customer Selection Group */}
          <div style={{ display: "flex", alignItems: "center", border: `1px solid ${border}`, borderRadius: 12, background: isDark ? ds.surface2 : "#F8FAFC", overflow: "hidden", height: 56 }}>
            <button onClick={() => setShowCustomer(true)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 16px", height: "100%", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark?ds.border:"#F1F5F9"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: customer ? "rgba(16,185,129,0.15)" : (isDark ? ds.border : "#E2E8F0"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <User size={20} color={customer ? "#10B981" : ds.textSecondary} />
              </div>
              <div style={{ textAlign: isRTL ? "right" : "left", minWidth: 120 }}>
                <div style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 800, lineHeight: customer ? 1.2 : 1 }}>
                  {customer ? customer.customer_name : (isRTL ? "اختر العميل" : "Select Customer")}
                </div>
                {customer && (
                  <div style={{ color: ds.textSecondary, fontSize: 13, marginTop: 4 }}>
                    {customer.phone ?? "---"}
                  </div>
                )}
              </div>
              <ChevronDown size={18} color={ds.textMuted} style={{ marginInlineStart: 12 }} />
            </button>
            <div style={{ width: 1, background: border, alignSelf: "stretch" }} />
            <button onClick={() => setShowNewCustomer(true)} title={isRTL ? "إضافة عميل جديد" : "Add New Customer"} style={{ padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "transparent", border: "none", cursor: "pointer", transition: "0.15s" }} onMouseOver={e => e.currentTarget.style.background = isDark?ds.border:"#F1F5F9"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
              <Plus size={22} color="#10B981" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        
        {/* Action Buttons Group */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          
          {/* Add Voucher */}
          <button onClick={() => setShowTransactionForm("income")} style={{ display: "flex", alignItems: "center", gap: 8, height: 56, padding: "0 20px", background: "transparent", border: `1px solid ${border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 15, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }} onMouseOver={e=>{e.currentTarget.style.borderColor="#3B82F6"; e.currentTarget.style.color="#3B82F6"; e.currentTarget.style.background="rgba(59,130,246,0.05)"}} onMouseOut={e=>{e.currentTarget.style.borderColor=border; e.currentTarget.style.color=ds.textPrimary; e.currentTarget.style.background="transparent"}}>
            <Plus size={20} strokeWidth={2.5} /> <span className="hide-on-mobile">{isRTL ? "إضافة سند" : "Add Voucher"}</span>
          </button>

          <div style={{ width: 1, height: 32, background: border, display: "block" }} />

          {/* Held / Hold */}
          <div style={{ display: "flex", alignItems: "center", background: isDark ? ds.surface2 : "#F8FAFC", border: `1px solid ${border}`, borderRadius: 12, height: 56, padding: 4 }}>
            <button onClick={() => setShowHeldDrawer(true)} style={{ position: "relative", height: "100%", padding: "0 20px", background: "transparent", border: "none", color: ds.textPrimary, fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, borderRadius: 10, transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark?ds.border:"#E2E8F0"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
              <Clock size={20} color={ds.textSecondary} /> <span className="hide-on-mobile">{isRTL ? "المعلقة" : "Held"}</span>
              {heldInvoices.length > 0 && <div style={{ position: "absolute", top: -6, right: -6, background: "#EF4444", color: "white", fontSize: 12, fontWeight: 800, width: 24, height: 24, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${surface}`, boxShadow: "0 2px 4px rgba(239,68,68,0.3)" }}>{heldInvoices.length}</div>}
            </button>
            <div style={{ width: 1, height: 24, background: border, margin: "0 4px" }} />
            <button onClick={holdCurrentInvoice} disabled={cart.length === 0} style={{ height: "100%", padding: "0 20px", background: "transparent", border: "none", color: cart.length === 0 ? ds.textMuted : "#F59E0B", fontSize: 15, fontWeight: 800, cursor: cart.length === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, borderRadius: 10, transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background=cart.length>0?(isDark?ds.border:"#E2E8F0"):"transparent"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
              <Package size={20} /> <span className="hide-on-mobile">{isRTL ? "تعليق" : "Hold"}</span>
            </button>
          </div>

          <div style={{ width: 1, height: 32, background: border, display: "block" }} />

          {/* Returns */}
          <button onClick={() => setShowReturnsList(true)} style={{ display: "flex", alignItems: "center", gap: 8, height: 56, padding: "0 20px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 12, color: "#EF4444", fontSize: 15, fontWeight: 800, cursor: "pointer", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background="rgba(239, 68, 68, 0.1)"} onMouseOut={e=>e.currentTarget.style.background="rgba(239, 68, 68, 0.05)"}>
            <RotateCcw size={20} /> <span className="hide-on-mobile">{isRTL ? "المرتجعات" : "Returns"}</span>
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
                    <div style={{ textAlign: isRTL ? "left" : "right" }}>
                      <span style={{ color: "#2563EB", fontSize: 26, fontWeight: 900 }}>{totals.total_amount.toLocaleString()} <span style={{fontSize:16}}>{currency}</span></span>
                      {exchangeRate !== 1 && (
                        <div style={{ color: ds.textSecondary, fontSize: 13, marginTop: 4 }}>
                          {isRTL ? `المعادل: ${(totals.total_amount * exchangeRate).toLocaleString()} ${defaultCurrency.currency_symbol} (سعر الصرف: ${exchangeRate})` : `Eqv: ${(totals.total_amount * exchangeRate).toLocaleString()} ${defaultCurrency.currency_symbol} (Rate: ${exchangeRate})`}
                        </div>
                      )}
                    </div>
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
        {showCustomer && <SelectCustomerSheet customers={store.customers} selected={customer} onSelect={setCustomer} onClose={() => setShowCustomer(false)} onAddNew={() => { setShowCustomer(false); setShowNewCustomer(true); }} />}
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
              store.addCustomer(fullCustomer as Customer);
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
                      <div style={{ textAlign: isRTL ? "left" : "right" }}>
                        <span style={{ color: "#2563EB", fontSize: 24, fontWeight: 900 }}>{totals.total_amount.toLocaleString()} <span style={{fontSize: 14}}>{currency}</span></span>
                        {exchangeRate !== 1 && (
                          <div style={{ color: ds.textSecondary, fontSize: 12, marginTop: 2 }}>
                            {isRTL ? `المعادل: ${(totals.total_amount * exchangeRate).toLocaleString()} ${defaultCurrency.currency_symbol} (سعر الصرف: ${exchangeRate})` : `Eqv: ${(totals.total_amount * exchangeRate).toLocaleString()} ${defaultCurrency.currency_symbol} (Rate: ${exchangeRate})`}
                          </div>
                        )}
                      </div>
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
                      <label style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600 }}>{isRTL ? "طرق الدفع" : "Payment Methods"}</label>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                      {PAY_METHODS.map(m => {
                        const isActive = activeMethods.includes(m.key) || (m.key === "Other" && hasCredit);
                        return (
                          <motion.button key={m.key} whileTap={{ scale: 0.95 }} onClick={() => toggleMethod(m.key)}
                            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 8px", background: isActive ? `${m.color}18` : isDark ? ds.surface2 : "#F8FAFC", border: `2px solid ${isActive ? m.color : "transparent"}`, borderRadius: 16, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><m.icon size={22} color={m.color} strokeWidth={2.2} /></div>
                            <span style={{ color: isActive ? m.color : ds.textPrimary, fontSize: 14, fontWeight: 700 }}>{t[m.labelKey]}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Inputs for active methods */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                      {activeMethods.filter(m => m !== "Other").map(key => {
                        const m = PAY_METHODS.find(x => x.key === key)!;
                        return (
                          <motion.div key={key} initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}}>
                            <label style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>{isRTL ? `المبلغ المدفوع (${t[m.labelKey]})` : `Amount Paid (${t[m.labelKey]})`}</label>
                            <input type="number" value={paymentAmounts[key]} onChange={e => setPaymentAmounts({...paymentAmounts, [key]: e.target.value})} placeholder={totals.total_amount.toString()}
                              style={{ width: "100%", height: 56, boxSizing: "border-box", padding: "0 16px", background: isDark ? ds.surface2 : "#F8FAFC", border: `2px solid ${ds.border}`, borderRadius: 16, color: ds.textPrimary, fontSize: 22, fontWeight: 800, outline: "none", fontFamily: "inherit", direction: "ltr", transition: "border 0.2s" }} 
                              onFocus={e=>e.currentTarget.style.borderColor="#2563EB"} onBlur={e=>e.currentTarget.style.borderColor=ds.border} />
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Smart Summary Box */}
                    <div style={{ padding: "16px", background: isDark ? ds.surface2 : "#F8FAFC", borderRadius: 16, border: `1px solid ${ds.border}`, marginBottom: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: ds.textSecondary, fontWeight: 600 }}>
                        <span>{isRTL ? "الإجمالي المطلوب:" : "Total Required:"}</span>
                        <span>{totals.total_amount.toLocaleString()}</span>
                      </div>
                      
                      {totalPaid > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: ds.textPrimary, fontWeight: 700 }}>
                          <span>{isRTL ? "إجمالي المدفوع:" : "Total Paid:"}</span>
                          <span>{totalPaid.toLocaleString()}</span>
                        </div>
                      )}

                      {hasCredit && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: "#EF4444", fontWeight: 700 }}>
                          <span>{isRTL ? "المتبقي (آجل):" : "Remaining (Credit):"}</span>
                          <span>{creditAmount.toLocaleString()} {currency}</span>
                        </div>
                      )}

                      {changeAmount > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: "#16A34A", fontWeight: 700 }}>
                          <span>{isRTL ? "الباقي للعميل:" : "Change:"}</span>
                          <span>{changeAmount.toLocaleString()} {currency}</span>
                        </div>
                      )}

                      {hasCredit && customer === null && (
                         <div style={{ marginTop: 12, padding: "8px", background: "rgba(220, 38, 38, 0.1)", borderRadius: 8, color: "#DC2626", fontSize: 12, fontWeight: 700, textAlign: "center" }}>
                           {isRTL ? "⚠️ يجب اختيار العميل أولاً لحفظ المبالغ الآجلة." : "⚠️ Select a customer first to save credit amounts."}
                         </div>
                      )}
                    </div>

                    <div>
                      <label style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>{t.invoiceNotes}</label>
                      <textarea placeholder={isRTL ? "أضف أي ملاحظات هنا..." : "Add notes here..."}
                        style={{ width: "100%", boxSizing: "border-box", padding: "16px", background: isDark ? ds.surface2 : "#F8FAFC", border: `1.5px solid ${ds.border}`, borderRadius: 16, color: ds.textPrimary, fontSize: 14, outline: "none", fontFamily: "inherit", resize: "none", transition: "border 0.2s" }} 
                        onFocus={e=>e.currentTarget.style.borderColor="#2563EB"} onBlur={e=>e.currentTarget.style.borderColor=ds.border}/>
                    </div>
                  </div>

                  <div style={{ padding: "24px", borderTop: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", gap: 12, background: surface, boxShadow: "0 -4px 20px rgba(0,0,0,0.03)" }}>
                    <button onClick={() => setStep("build")} style={{ flex: 1, height: 56, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 16, color: ds.textSecondary, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark?ds.border:"#E2E8F0"} onMouseOut={e=>e.currentTarget.style.background=isDark?ds.surface2:"#F1F5F9"}>{t.saveAsDraft}</button>
                    <motion.button whileTap={{ scale: 0.97 }} disabled={!isValidToPay} onClick={handleCompleteSale}
                      style={{ flex: 2, height: 56, background: (!isValidToPay) ? (isDark ? ds.surface : "#E2E8F0") : "linear-gradient(135deg,#16A34A,#22C55E)", border: "none", borderRadius: 16, color: (!isValidToPay) ? ds.textMuted : "white", fontSize: 16, fontWeight: 800, cursor: (!isValidToPay) ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: (!isValidToPay) ? "none" : "0 8px 24px rgba(22,163,74,0.3)", transition: "all 0.2s" }}>
                      <Check size={22} color={(!isValidToPay) ? ds.textMuted : "white"} strokeWidth={2.5} />{t.confirmPayment}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHeldDrawer && (
          <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHeldDrawer(false)}
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ position: "relative", width: "100%", maxWidth: 480, maxHeight: "80vh", background: surface, borderRadius: 24, display: "flex", flexDirection: "column", boxShadow: "0 24px 50px rgba(0,0,0,0.3)", border: `1px solid ${isDark ? ds.border : "rgba(255,255,255,0.5)"}`, overflow: "hidden" }}>
              
              <div style={{ padding: "20px 24px", background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Clock size={24} color="#F59E0B" />
                  <span style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "الفواتير المعلقة" : "Held Invoices"}</span>
                </div>
                <button onClick={() => setShowHeldDrawer(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}><X size={20} color={ds.textSecondary} /></button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 24, background: isDark ? ds.bg : "#FFFFFF" }}>
                {heldInvoices.length === 0 ? (
                  <div style={{ textAlign: "center", color: ds.textMuted, padding: "40px 0" }}>
                    <Package size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                    <p style={{ fontSize: 16, fontWeight: 600 }}>{isRTL ? "لا توجد فواتير معلقة" : "No held invoices"}</p>
                  </div>
                ) : (
                  heldInvoices.map(hi => (
                    <div key={hi.id} style={{ marginBottom: 16, background: isDark ? ds.surface : "#F8FAFC", borderRadius: 16, padding: 16, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <span style={{ fontWeight: 800, color: ds.textPrimary, fontSize: 15 }}>{hi.id}</span>
                        <span style={{ fontSize: 12, color: ds.textSecondary, background: isDark ? ds.surface2 : "#E2E8F0", padding: "4px 8px", borderRadius: 6 }}>{hi.time}</span>
                      </div>
                      <div style={{ color: ds.textSecondary, fontSize: 13, marginBottom: 16 }}>
                        <p style={{ margin: "0 0 4px 0" }}>{isRTL ? "العميل:" : "Customer:"} <strong style={{ color: ds.textPrimary }}>{hi.customer?.customer_name || (isRTL ? "كاش" : "Cash")}</strong></p>
                        <p style={{ margin: 0 }}>{isRTL ? "عدد المنتجات:" : "Items:"} <strong style={{ color: ds.textPrimary }}>{hi.cart.length}</strong></p>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => resumeInvoice(hi)} style={{ flex: 1, height: 40, background: "#2563EB", color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>{isRTL ? "استكمال" : "Resume"}</button>
                        <button onClick={() => setHeldInvoices(p => p.filter(h => h.id !== hi.id))} style={{ width: 40, height: 40, background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "none", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReturnsList && (
          <SalesReturnsScreen onBack={() => setShowReturnsList(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTransactionForm && (
          <TransactionFormSheet
            key="transaction-form-sheet"
            initialType={showTransactionForm}
            onClose={() => setShowTransactionForm(null)}
            onSave={(data, print) => {
              // Close modal first
              setShowTransactionForm(null);

              if (print) {
                // Determine Category string
                const categories: Record<string, string> = {
                  sales: isRTL ? "إيرادات مبيعات" : "Sales Revenue",
                  services: isRTL ? "إيرادات خدمات" : "Service Revenue",
                  investments: isRTL ? "عوائد استثمار" : "Investment Returns",
                  other_income: isRTL ? "إيرادات أخرى" : "Other Income",
                  salaries: isRTL ? "رواتب وأجور" : "Salaries & Wages",
                  rent: isRTL ? "إيجارات" : "Rent",
                  utilities: isRTL ? "فواتير خدمات (كهرباء، ماء)" : "Utilities",
                  marketing: isRTL ? "تسويق وإعلان" : "Marketing & Ads",
                  maintenance: isRTL ? "صيانة وإصلاح" : "Maintenance",
                  office_supplies: isRTL ? "مستلزمات مكتبية" : "Office Supplies",
                  other_expense: isRTL ? "مصروفات أخرى" : "Other Expense"
                };
                const catStr = categories[data.category] || data.category;

                const w = window.open("", "", "width=900,height=800");
                if (w) {
                  w.document.write(generateVoucherHTML({
                    businessName: MOCK_BUSINESS.business_name,
                    businessPhone: MOCK_BUSINESS.primary_phone || "",
                    businessAddress: "المركز الرئيسي",
                    voucherType: data.type,
                    voucherNumber: `VCH-${Math.floor(10000 + Math.random() * 90000)}`,
                    voucherDate: new Date().toLocaleDateString(isRTL ? "ar-YE" : "en-US"),
                    voucherTime: new Date().toLocaleTimeString(isRTL ? "ar-YE" : "en-US"),
                    status: isRTL ? "معتمد" : "Approved",
                    entityType: data.entity_type,
                    entityName: data.entity_name || (isRTL ? "حساب عام" : "General Account"),
                    amount: data.amount,
                    currency: "YER",
                    paymentMethod: data.payment_method === "cash" ? (isRTL ? "نقداً (صندوق)" : "Cash") : (isRTL ? "تحويل بنكي" : "Bank Transfer"),
                    category: catStr,
                    createdBy: "الكاشير",
                    notes: data.description,
                    reference: data.reference,
                    isRTL,
                    appName: "Smart Merchant",
                  }));
                  w.document.close();
                }
              }
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
