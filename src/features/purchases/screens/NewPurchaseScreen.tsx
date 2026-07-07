import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, ArrowLeft, Plus, Trash2, Check, Save, FileText, Building2, Search, X, Printer, Share2, ShoppingCart
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_PRODUCTS, MOCK_PRODUCT_UNITS, MOCK_UNITS, MOCK_CATEGORIES } from "@/core/data/salesMockData";
import { useToast } from "@/providers/ToastProvider";
import { SupplierFormSheet } from "../components/SupplierFormSheet";
import { CategoryFormSheet } from "@/features/inventory/components/CategoryFormSheet";
import { UnitFormSheet } from "@/features/inventory/components/UnitFormSheet";
import { MOCK_CURRENCIES } from "@/core/data/financeMockData";
import { useFinancialStore } from "@/core/engine/useFinancialStore";
import { Banknote, CreditCard, Smartphone, Clock } from "lucide-react";
import type { PaymentMethodType } from "@/core/types/finance";

const PAY_METHODS: { key: PaymentMethodType; icon: any; labelKey: string; color: string }[] = [
  { key: "Cash",     icon: Banknote,   labelKey: "payCash",     color: "#16A34A" },
  { key: "Card",     icon: CreditCard, labelKey: "payCard",     color: "#2563EB" },
  { key: "Bank", icon: Smartphone, labelKey: "payTransfer", color: "#8B5CF6" },
  { key: "Other",   icon: Clock,      labelKey: "payCredit",   color: "#F59E0B" },
];

export interface InvoiceRow {
  id: string;
  product_id: string | null;
  barcode: string;
  product_name: string;
  category_id: string;
  unit_id: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  expiry_date: string;
}

export function NewPurchaseScreen({ products = [], onBack, onSave }: { products?: any[], onBack: () => void, onSave?: (invoice: any) => void }) {
  const toast = useToast();
  const { t, isDark, isRTL, ds } = useApp();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  
  const store = useFinancialStore();
  const suppliers = store.suppliers;

  const [invoiceRef, setInvoiceRef] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [step, setStep] = useState<"build" | "success">("build");
  const [finalInvoiceData, setFinalInvoiceData] = useState<any>(null);

  const [localCategories, setLocalCategories] = useState<any[]>(MOCK_CATEGORIES);
  const [localUnits, setLocalUnits] = useState<any[]>(MOCK_UNITS);
  const [showCategoryModalFor, setShowCategoryModalFor] = useState<string | null>(null);
  const [showUnitModalFor, setShowUnitModalFor] = useState<string | null>(null);

  const defaultCurrency = MOCK_CURRENCIES.find(c => c.is_base_currency) || MOCK_CURRENCIES[0];
  const [currencyId, setCurrencyId] = useState<string>(defaultCurrency?.id || "");
  const [exchangeRate, setExchangeRate] = useState<number>(defaultCurrency?.exchange_rate || 1);
  const [activeMethods, setActiveMethods] = useState<PaymentMethodType[]>(["Other"]);
  const [paymentAmounts, setPaymentAmounts] = useState<Record<PaymentMethodType, string>>({
    Cash: "", Card: "", Bank: "", Other: ""
  });

  const currencyObj = MOCK_CURRENCIES.find(c => c.id === currencyId) || defaultCurrency;
  const currency = currencyObj?.currency_symbol || "YER";

  // Map units to view models for auto-complete
  const allUnits = products.flatMap(p => {
    const units = p.mock_units || MOCK_PRODUCT_UNITS.filter(u => u.product_id === p.id);
    return units.map((u: any) => ({ ...u, _product: p }));
  });

  const getEmptyRow = (): InvoiceRow => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    product_id: null,
    barcode: "",
    product_name: "",
    category_id: "",
    unit_id: localUnits.find(u => u.is_default)?.id || "",
    quantity: 1,
    purchase_price: 0,
    selling_price: 0,
    expiry_date: ""
  });

  const [rows, setRows] = useState<InvoiceRow[]>([getEmptyRow()]);

  const addRow = () => {
    setRows([...rows, getEmptyRow()]);
  };

  const removeRow = (id: string) => {
    if (rows.length === 1) return;
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (id: string, field: keyof InvoiceRow, value: any) => {
    setRows(rows.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      
      // Auto-fill logic based on Barcode
      if (field === "barcode" && typeof value === "string") {
        const unit = allUnits.find(u => u.barcode === value);
        if (unit) {
          updated.product_id = unit._product.id;
          updated.product_name = unit._product.product_name;
          updated.category_id = unit._product.category_id || "";
          updated.unit_id = unit.unit_id;
          updated.purchase_price = unit.purchase_price || 0;
          updated.selling_price = unit.selling_price || 0;
        } else {
          updated.product_id = null; // New Product Mode
        }
      }
      
      // Auto-fill logic based on Product Name (if they type a known name)
      if (field === "product_name" && typeof value === "string" && !r.product_id) {
        const productMatch = products.find(p => p.product_name.toLowerCase() === value.toLowerCase());
        if (productMatch) {
          const unit = allUnits.find(u => u._product.id === productMatch.id);
          if (unit) {
             updated.product_id = unit._product.id;
             updated.barcode = unit.barcode || "";
             updated.category_id = unit._product.category_id || "";
             updated.unit_id = unit.unit_id;
             updated.purchase_price = unit.purchase_price || 0;
             updated.selling_price = unit.selling_price || 0;
          }
        } else {
          updated.product_id = null; // Remains new product
        }
      }
      
      return updated;
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string, isLastField: boolean) => {
    if (e.key === "Enter" && isLastField) {
      e.preventDefault();
      const rowIndex = rows.findIndex(r => r.id === id);
      if (rowIndex === rows.length - 1) {
        addRow();
      }
    }
  };

  const grandTotal = rows.reduce((sum, r) => sum + (r.quantity * r.purchase_price), 0);
  
  const totalPaid = activeMethods.filter(m => m !== "Other").reduce((sum, m) => sum + (parseFloat(paymentAmounts[m]) || 0), 0);
  const creditAmount = Math.max(0, grandTotal - totalPaid);
  const changeAmount = Math.max(0, totalPaid - grandTotal);
  const hasCredit = creditAmount > 0;
  
  const isValidToPay = rows.some(r => r.product_name && r.quantity > 0) && (!hasCredit || (hasCredit && selectedSupplierId !== ""));

  const toggleMethod = (key: PaymentMethodType) => {
    if (key === "Other") {
      setActiveMethods(["Other"]);
      setPaymentAmounts({ Cash: "", Card: "", Bank: "", Other: "" });
      return;
    }
    setActiveMethods(prev => {
      let next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      next = next.filter(k => k !== "Other"); 
      if (next.length === 0) next = [key]; 
      if (!next.includes(key)) {
        setPaymentAmounts(pa => ({ ...pa, [key]: "" }));
      }
      return next;
    });
  };

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const inputStyle = {
    width: "100%", height: 60, padding: "0 16px", 
    background: isDark ? "rgba(0,0,0,0.15)" : "#FFFFFF",
    border: `1px solid ${border}`, borderRadius: 12, color: isDark ? "white" : "#0F172A",
    fontSize: 18, fontWeight: 800, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const,
    transition: "all 0.2s", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
  };

  const activeInputStyle = {
    ...inputStyle,
    background: isDark ? ds.surface2 : "#FFFFFF",
    border: `1px solid ${ds.primary}`,
    boxShadow: `0 0 0 3px ${isDark ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.15)"}`
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (step === "success") {
    return createPortal(
      <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: bg, padding: "32px 24px", textAlign: "center" }}>
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }}
          style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg,#16A34A,#22C55E)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 12px 36px rgba(22,163,74,0.4)" }}>
          <Check size={50} color="white" strokeWidth={3} />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ color: ds.textPrimary, fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          {isRTL ? "تم إتمام عملية الشراء بنجاح!" : "Purchase Complete!"}
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ color: ds.textSecondary, fontSize: 15, marginBottom: 6, direction: "ltr" }}>{finalInvoiceData?.invoice_number}</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} style={{ color: "#16A34A", fontSize: 36, fontWeight: 900, marginBottom: 12 }}>
          {finalInvoiceData?.grand_total?.toLocaleString()} {currency}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32, background: isDark ? ds.surface2 : "#F8FAFC", padding: "16px", borderRadius: 12, minWidth: 280 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: ds.textPrimary, fontSize: 15, fontWeight: 700 }}>
            <span>{isRTL ? "المبلغ المدفوع:" : "Paid Amount:"}</span>
            <span style={{ color: "#16A34A" }}>{finalInvoiceData?._finalPaid?.toLocaleString()} {currency}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: (finalInvoiceData?._creditAmount || 0) > 0 ? "#DC2626" : ds.textPrimary, fontSize: 15, fontWeight: 700 }}>
            <span>{isRTL ? "المبلغ المتبقي:" : "Remaining Amount:"}</span>
            <span>{finalInvoiceData?._creditAmount?.toLocaleString()} {currency}</span>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ display: "flex", gap: 12, marginBottom: 14, maxWidth: 360, width: "100%" }}>
          <button onClick={() => toast.success(isRTL ? "جاري الطباعة..." : "Printing...")} style={{ flex: 1, height: 52, background: surface, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 14, color: ds.textPrimary, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Printer size={20} color="#2563EB" />{isRTL ? "طباعة الفاتورة" : "Print Invoice"}
          </button>
          <button onClick={() => toast.success(isRTL ? "تم النسخ للمشاركة!" : "Copied to share!")} style={{ flex: 1, height: 52, background: "#25D366", border: "none", borderRadius: 14, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Share2 size={20} color="white" />{isRTL ? "مشاركة الفاتورة" : "Share Invoice"}
          </button>
        </motion.div>
        <motion.button whileTap={{ scale: 0.97 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} 
          onClick={() => {
            setStep("build");
            setRows([getEmptyRow()]);
            setSelectedSupplierId("");
            setPaymentAmounts({ Cash: "", Card: "", Bank: "", Other: "" });
            setActiveMethods(["Other"]);
            setFinalInvoiceData(null);
          }}
          style={{ width: "100%", maxWidth: 360, height: 56, background: "linear-gradient(135deg,#1D4ED8,#2563EB)", border: "none", borderRadius: 16, color: "white", fontSize: 17, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: "0 8px 24px rgba(37,99,235,0.3)" }}>
          <ShoppingCart size={22} color="white" />{isRTL ? "فاتورة مشتريات جديدة" : "New Purchase"}
        </motion.button>
        
        <button onClick={onBack} style={{ marginTop: 24, background: "none", border: "none", color: ds.textSecondary, cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
          {isRTL ? "العودة للقائمة" : "Back to List"}
        </button>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }} onClick={onBack} />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", damping: 28, stiffness: 300 }} style={{ position: "relative", width: "100%", maxWidth: 1300, height: "95vh", background: bg, borderRadius: 24, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 50px rgba(0,0,0,0.3)", border: `1px solid ${border}` }}>
        {/* Header */}
        <div style={{ 
          padding: "24px 32px", 
          background: isDark ? "linear-gradient(135deg, rgba(30,41,59,1), rgba(15,23,42,1))" : "linear-gradient(135deg, #EFF6FF, #F8FAFC)", 
          borderBottom: `1px solid ${border}`, 
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button title={isRTL ? "إغلاق" : "Close"} onClick={onBack} style={{ width: 44, height: 44, borderRadius: 14, background: isDark ? "rgba(255,255,255,0.05)" : "white", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <X size={24} color={ds.textPrimary} />
            </button>
            <div>
              <h2 style={{ color: isDark ? "white" : "#1E293B", fontSize: 24, fontWeight: 900, margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: 8 }}>
                <ShoppingCart size={26} color="#3B82F6" />
                {isRTL ? "فاتورة مشتريات (إدخال سريع)" : "Purchase Invoice (Rapid Entry)"}
              </h2>
              <p style={{ color: isDark ? "#94A3B8" : "#475569", fontSize: 14, margin: 0, fontWeight: 600 }}>{isRTL ? "يمكنك إنشاء منتجات جديدة مباشرة من خلال الجدول لزيادة سرعة الإدخال" : "Create new products directly within the grid to speed up data entry"}</p>
            </div>
          </div>
        
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end" }}>
          
          {/* CURRENCY SELECTOR */}
          <div style={{ display: "flex", alignItems: "center", border: `1px solid ${border}`, borderRadius: 10, background: isDark ? ds.surface2 : "#F1F5F9", overflow: "hidden", padding: "0 8px" }}>
            <Banknote size={16} color={ds.textSecondary} style={{ marginInlineEnd: 4 }} />
            <select value={currencyId} onChange={(e) => {
              const cur = MOCK_CURRENCIES.find(c => c.id === e.target.value);
              if (cur) {
                setCurrencyId(cur.id);
                setExchangeRate(cur.exchange_rate);
              }
            }} style={{ height: 44, background: "transparent", border: "none", color: ds.textPrimary, fontSize: 13, fontWeight: 700, outline: "none", cursor: "pointer", appearance: "none" }}>
              {MOCK_CURRENCIES.map(c => (
                <option key={c.id} value={c.id}>{c.currency_code}</option>
              ))}
            </select>
            {currencyObj && !currencyObj.is_base_currency && (
              <>
                <div style={{ width: 1, height: 24, background: border, margin: "0 8px" }} />
                <input 
                  type="number" 
                  value={exchangeRate} 
                  onChange={e => setExchangeRate(Number(e.target.value) || 1)} 
                  style={{ width: 50, height: 44, background: "transparent", border: "none", color: ds.textPrimary, fontSize: 13, fontWeight: 700, outline: "none", textAlign: "center" }}
                  title={isRTL ? "سعر الصرف" : "Exchange Rate"}
                />
              </>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 350 }}>
            <div style={{ display: "flex", alignItems: "center", padding: "0 16px", background: isDark ? ds.surface2 : "#F1F5F9", border: `1px solid ${border}`, borderRadius: 12, flex: 1, height: 56 }}>
              <Building2 size={24} color={ds.textSecondary} style={{ marginInlineEnd: 12 }} />
              <input 
                list="suppliers-list"
                placeholder={isRTL ? "ابحث عن مورد..." : "Search Supplier..."}
                value={suppliers.find(s => s.id === selectedSupplierId)?.supplier_name || ""}
                onChange={e => {
                  const match = suppliers.find(s => s.supplier_name === e.target.value);
                  if (match) setSelectedSupplierId(match.id);
                  else setSelectedSupplierId("");
                }}
                style={{ width: "100%", height: "100%", background: "transparent", border: "none", color: ds.textPrimary, fontSize: 16, fontWeight: 700, outline: "none", fontFamily: "inherit" }}
              />
              <datalist id="suppliers-list">
                {suppliers.map(s => <option key={s.id} value={s.supplier_name} />)}
              </datalist>
            </div>
            <button title={isRTL ? "إضافة مورد جديد" : "Add new supplier"} onClick={() => setShowSupplierModal(true)} style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 12, background: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.2)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}>
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>
          <input 
            value={invoiceRef} onChange={e => setInvoiceRef(e.target.value)}
            placeholder={isRTL ? "رقم مرجع الفاتورة" : "Invoice Ref"}
            style={{ width: "100%", maxWidth: 200, height: 56, padding: "0 16px", background: isDark ? ds.surface2 : "#F1F5F9", border: `1px solid ${border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 16, fontWeight: 700, outline: "none", fontFamily: "inherit" }}
          />
        </div>
      </div>
      
      {/* Smart Supplier Info Panel */}
      <AnimatePresence>
        {selectedSupplierId && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 24px 16px", display: "flex", gap: 16, overflowX: "auto" }} className="scrollbar-hide">
              {[
                { label: isRTL ? "الهاتف" : "Phone", value: suppliers.find(s=>s.id===selectedSupplierId)?.contact_phone || (isRTL ? "غير متوفر" : "N/A"), icon: Smartphone },
                { label: isRTL ? "الرصيد الحالي" : "Current Balance", value: (suppliers.find(s=>s.id===selectedSupplierId)?.opening_balance || 0).toLocaleString() + " " + currency, icon: Banknote },
                { label: isRTL ? "آخر عملية شراء" : "Last Purchase", value: isRTL ? "منذ 3 أيام" : "3 days ago", icon: Clock },
                { label: isRTL ? "العملة" : "Currency", value: currency, icon: FileText },
              ].map((info, idx) => (
                <div key={idx} style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC", border: `1px solid ${border}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, minWidth: 200 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <info.icon size={20} color="#3B82F6" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: ds.textSecondary }}>{info.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: ds.textPrimary }}>{info.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px 24px", overflow: "hidden" }}>
        
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
          
          <div style={{ flex: 1, overflowX: "auto", overflowY: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ minWidth: 1650, display: "flex", flexDirection: "column", height: "100%" }}>
              {/* Table Header */}
              <div style={{ display: "grid", gridTemplateColumns: "180px 2fr 160px 140px 120px 150px 150px 170px 160px 70px", gap: 16, padding: "24px 24px", background: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9", borderBottom: `2px solid ${isDark ? ds.border : "#E2E8F0"}`, alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
                <div style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 18, fontWeight: 900 }}>{isRTL ? "الباركود أو SKU" : "Barcode / SKU"}</div>
                <div style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 18, fontWeight: 900 }}>{isRTL ? "اسم المنتج" : "Product Name"}</div>
                <div style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 18, fontWeight: 900 }}>{isRTL ? "التصنيف" : "Category"}</div>
                <div style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 18, fontWeight: 900 }}>{isRTL ? "الوحدة" : "Unit"}</div>
                <div style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 18, fontWeight: 900, textAlign: "center" }}>{isRTL ? "الكمية" : "Qty"}</div>
                <div style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 18, fontWeight: 900 }}>{isRTL ? "سعر الشراء" : "Cost"}</div>
                <div style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 18, fontWeight: 900 }}>{isRTL ? "سعر البيع" : "Sell Price"}</div>
                <div style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 18, fontWeight: 900 }}>{isRTL ? "تاريخ الانتهاء" : "Expiry"}</div>
                <div style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 18, fontWeight: 900, textAlign: isRTL ? "left" : "right" }}>{isRTL ? "الإجمالي" : "Total"}</div>
                <div style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 18, fontWeight: 900, textAlign: "center" }}>#</div>
              </div>

              {/* Table Body */}
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
                <datalist id="products-list">
                  {products.map(p => <option key={p.id} value={p.product_name} />)}
                </datalist>
                <datalist id="barcode-list">
                  {allUnits.map((u, i) => <option key={i} value={u.barcode || u.sku} />)}
                </datalist>
                <AnimatePresence>
                  {rows.map((row) => {
                    const total = row.quantity * row.purchase_price;
                    const isNew = row.product_id === null;
                    
                    return (
                      <motion.div 
                        key={row.id} 
                        layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        style={{ 
                          display: "grid", 
                          gridTemplateColumns: "180px 2fr 160px 140px 120px 150px 150px 170px 160px 70px", 
                          gap: 16, 
                          padding: "16px 4px", 
                          borderBottom: `1px solid ${isDark ? ds.border : "#F1F5F9"}`, 
                          alignItems: "center",
                          background: isNew && row.product_name ? "rgba(16,185,129,0.03)" : "transparent"
                        }}
                      >
                        {/* Barcode */}
                        <input 
                          list="barcode-list"
                          value={row.barcode} 
                          onChange={e => updateRow(row.id, "barcode", e.target.value)} 
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              document.getElementById(`qty-${row.id}`)?.focus();
                            }
                          }}
                          placeholder="123..." 
                          style={inputStyle}
                          onFocus={e => Object.assign(e.currentTarget.style, activeInputStyle)}
                          onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                        />
                        
                        {/* Product Name */}
                        <div style={{ position: "relative" }}>
                          {isNew && row.product_name.length > 0 && (
                            <div style={{ position: "absolute", top: -10, [isRTL ? "left" : "right"]: 8, background: "#10B981", color: "white", fontSize: 11, padding: "2px 8px", borderRadius: 6, fontWeight: 800, zIndex: 2 }}>
                              {isRTL ? "منتج جديد ➕" : "NEW ➕"}
                            </div>
                          )}
                          <input 
                            list="products-list"
                            value={row.product_name} 
                            onChange={e => updateRow(row.id, "product_name", e.target.value)} 
                            onKeyDown={e => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                document.getElementById(`qty-${row.id}`)?.focus();
                              }
                            }}
                            placeholder={isRTL ? "ابحث أو أضف منتج..." : "Search or add product..."} 
                            style={{ ...inputStyle, fontWeight: isNew ? 700 : 600, color: isNew ? "#10B981" : ds.textPrimary }}
                            onFocus={e => Object.assign(e.currentTarget.style, activeInputStyle)}
                            onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                          />
                        </div>
                        
                        {/* Category */}
                        <select 
                          value={row.category_id} 
                          onChange={e => {
                            if (e.target.value === "ADD_NEW") setShowCategoryModalFor(row.id);
                            else updateRow(row.id, "category_id", e.target.value);
                          }}
                          style={inputStyle}
                          onFocus={e => Object.assign(e.currentTarget.style, activeInputStyle)}
                          onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                        >
                          <option value="" disabled>{isRTL ? "التصنيف" : "Cat"}</option>
                          {localCategories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                          <option value="ADD_NEW" style={{ color: ds.primary, fontWeight: 800 }}>+ {isRTL ? "إضافة تصنيف" : "Add Cat"}</option>
                        </select>

                        {/* Unit */}
                        <select 
                          value={row.unit_id} 
                          onChange={e => {
                            if (e.target.value === "ADD_NEW") setShowUnitModalFor(row.id);
                            else updateRow(row.id, "unit_id", e.target.value);
                          }}
                          style={inputStyle}
                          onFocus={e => Object.assign(e.currentTarget.style, activeInputStyle)}
                          onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                        >
                          {localUnits.map(u => <option key={u.id} value={u.id}>{u.unit_name}</option>)}
                          <option value="ADD_NEW" style={{ color: ds.primary, fontWeight: 800 }}>+ {isRTL ? "إضافة وحدة" : "Add Unit"}</option>
                        </select>

                        {/* Quantity */}
                        <input 
                          id={`qty-${row.id}`}
                          type="number" min="1"
                          value={row.quantity || ""} 
                          onChange={e => updateRow(row.id, "quantity", Number(e.target.value) || 0)} 
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              document.getElementById(`cost-${row.id}`)?.focus();
                            }
                          }}
                          style={{ ...inputStyle, textAlign: "center", fontWeight: 800 }}
                          onFocus={e => Object.assign(e.currentTarget.style, activeInputStyle)}
                          onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                        />

                        {/* Purchase Price */}
                        <input 
                          id={`cost-${row.id}`}
                          type="number" min="0" step="0.01"
                          value={row.purchase_price || ""} 
                          onChange={e => updateRow(row.id, "purchase_price", Number(e.target.value) || 0)} 
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              document.getElementById(`sell-${row.id}`)?.focus();
                            }
                          }}
                          style={{ ...inputStyle, color: "#EF4444", fontWeight: 800 }}
                          onFocus={e => Object.assign(e.currentTarget.style, activeInputStyle)}
                          onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                        />

                        {/* Selling Price */}
                        <input 
                          id={`sell-${row.id}`}
                          type="number" min="0" step="0.01"
                          value={row.selling_price || ""} 
                          onChange={e => updateRow(row.id, "selling_price", Number(e.target.value) || 0)} 
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              document.getElementById(`expiry-${row.id}`)?.focus();
                            }
                          }}
                          style={{ ...inputStyle, color: "#10B981", fontWeight: 700 }}
                          onFocus={e => Object.assign(e.currentTarget.style, activeInputStyle)}
                          onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                        />

                        {/* Expiry Date */}
                        <input 
                          id={`expiry-${row.id}`}
                          type="date"
                          value={row.expiry_date} 
                          onChange={e => updateRow(row.id, "expiry_date", e.target.value)} 
                          style={{ ...inputStyle, fontSize: 13, fontWeight: 700 }}
                          onFocus={e => Object.assign(e.currentTarget.style, activeInputStyle)}
                          onBlur={e => Object.assign(e.currentTarget.style, inputStyle)}
                          onKeyDown={e => handleKeyDown(e, row.id, true)}
                        />

                        {/* Total */}
                        <div style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 800, textAlign: isRTL ? "left" : "right", padding: "0 8px" }}>
                          {total.toLocaleString()}
                        </div>

                        {/* Action */}
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <button onClick={() => removeRow(row.id)} disabled={rows.length === 1} style={{ background: "none", border: "none", cursor: rows.length === 1 ? "not-allowed" : "pointer", opacity: rows.length === 1 ? 0.3 : 1 }}>
                            <Trash2 size={20} color="#EF4444" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                <button onClick={addRow} style={{ marginTop: 24, height: 44, background: isDark ? ds.surface2 : "#F1F5F9", border: `2px dashed ${ds.border}`, borderRadius: 12, color: ds.primary, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", width: "100%", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(59,130,246,0.1)" : "#E0E7FF"} onMouseLeave={e => e.currentTarget.style.background = isDark ? ds.surface2 : "#F1F5F9"}>
                  <Plus size={20} /> {isRTL ? "إضافة سطر جديد" : "Add Row"}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Totals */}
          <div style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderTop: `1px solid ${border}`, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              <div>
                <div style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{isRTL ? "عدد الأصناف" : "Items Count"}</div>
                <div style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{rows.filter(r => r.product_name).length}</div>
              </div>
              <div>
                <div style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{isRTL ? "الأصناف الجديدة" : "New Products"}</div>
                <div style={{ color: "#10B981", fontSize: 18, fontWeight: 800 }}>{rows.filter(r => r.product_name && r.product_id === null).length}</div>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ textAlign: isRTL ? "left" : "right" }}>
                <div style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{isRTL ? "الإجمالي الكلي" : "Grand Total"}</div>
                <div style={{ color: ds.primary, fontSize: 26, fontWeight: 900 }}>{grandTotal.toLocaleString()} <span style={{ fontSize: 12 }}>{currency}</span></div>
                {exchangeRate !== 1 && (
                  <div style={{ color: ds.textSecondary, fontSize: 12, marginTop: 2 }}>
                    {isRTL ? `المعادل: ${(grandTotal * exchangeRate).toLocaleString()} ${defaultCurrency.currency_symbol} (سعر الصرف: ${exchangeRate})` : `Eqv: ${(grandTotal * exchangeRate).toLocaleString()} ${defaultCurrency.currency_symbol} (Rate: ${exchangeRate})`}
                  </div>
                )}
              </div>

              {/* Open Payment Modal Button */}
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const validRows = rows.filter(r => r.product_name && r.quantity > 0);
                  if (validRows.length === 0) {
                    toast.error(isRTL ? "يرجى إضافة أصناف للفاتورة" : "Please add items to invoice");
                    return;
                  }
                  if (!selectedSupplierId) {
                    toast.error(isRTL ? "يرجى اختيار المورد أولاً" : "Please select a supplier first");
                    return;
                  }
                  setShowPaymentModal(true);
                }} 
                style={{ height: 50, background: "linear-gradient(135deg, #3B82F6, #2563EB)", border: "none", borderRadius: 14, padding: "0 28px", color: "white", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", boxShadow: "0 6px 16px rgba(59,130,246,0.3)", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <Check size={20} />
                {isRTL ? "الدفع والحفظ" : "Pay & Save"}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setShowPaymentModal(false)}
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }} 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              style={{ position: "relative", width: "100%", maxWidth: 480, maxHeight: "90vh", background: surface, borderRadius: 24, display: "flex", flexDirection: "column", boxShadow: "0 24px 50px rgba(0,0,0,0.3)", border: `1px solid ${isDark ? ds.border : "rgba(255,255,255,0.5)"}`, overflow: "hidden" }}
            >
              <div style={{ padding: "20px 24px", background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Banknote size={24} color="#3B82F6" />
                  <span style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "طرق الدفع" : "Payment Methods"}</span>
                </div>
                <button onClick={() => setShowPaymentModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}><X size={20} color={ds.textSecondary} /></button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "24px", scrollbarWidth: "none" }}>
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

                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                  {activeMethods.filter(m => m !== "Other").map(key => {
                    const m = PAY_METHODS.find(x => x.key === key)!;
                    return (
                      <motion.div key={key} initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}}>
                        <label style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>{isRTL ? `المبلغ المدفوع (${t[m.labelKey]})` : `Amount Paid (${t[m.labelKey]})`}</label>
                        <input type="number" value={paymentAmounts[key]} onChange={e => setPaymentAmounts({...paymentAmounts, [key]: e.target.value})} placeholder={grandTotal.toString()}
                          style={{ width: "100%", height: 56, boxSizing: "border-box", padding: "0 16px", background: isDark ? ds.surface2 : "#F8FAFC", border: `2px solid ${ds.border}`, borderRadius: 16, color: ds.textPrimary, fontSize: 22, fontWeight: 800, outline: "none", fontFamily: "inherit", direction: "ltr", transition: "border 0.2s" }} 
                          onFocus={e=>e.currentTarget.style.borderColor="#2563EB"} onBlur={e=>e.currentTarget.style.borderColor=ds.border} />
                      </motion.div>
                    );
                  })}
                </div>

                {/* Smart Summary Box */}
                <div style={{ padding: "16px", background: isDark ? ds.surface2 : "#F8FAFC", borderRadius: 16, border: `1px solid ${ds.border}`, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: ds.textSecondary, fontWeight: 600 }}>
                    <span>{isRTL ? "الإجمالي المطلوب:" : "Total Required:"}</span>
                    <span>{grandTotal.toLocaleString()}</span>
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
                      <span>{isRTL ? "الباقي لك:" : "Change:"}</span>
                      <span>{changeAmount.toLocaleString()} {currency}</span>
                    </div>
                  )}

                  {hasCredit && selectedSupplierId === "" && (
                      <div style={{ marginTop: 12, padding: "8px", background: "rgba(220, 38, 38, 0.1)", borderRadius: 8, color: "#DC2626", fontSize: 12, fontWeight: 700, textAlign: "center" }}>
                        {isRTL ? "⚠️ يجب اختيار المورد أولاً لحفظ المبالغ الآجلة." : "⚠️ Select a supplier first to save credit amounts."}
                      </div>
                  )}
                </div>
              </div>

              <div style={{ padding: "24px", borderTop: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", gap: 12, background: surface, boxShadow: "0 -4px 20px rgba(0,0,0,0.03)" }}>
                <motion.button whileTap={{ scale: 0.97 }} disabled={!isValidToPay} 
                  onClick={() => {
                    const validRows = rows.filter(r => r.product_name && r.quantity > 0);
                    const paymentStatus = totalPaid >= grandTotal ? "Paid" : (totalPaid > 0 ? "Partial" : "Unpaid");

                    const newInvoice = {
                      id: `po_new_${Date.now()}`,
                      supplier_id: selectedSupplierId,
                  invoice_number: `PI-${Math.floor(Math.random() * 10000)}`,
                  purchase_date: new Date().toISOString(),
                  currency_id: currencyId,
                  exchange_rate: exchangeRate,
                  grand_total: grandTotal,
                  base_grand_total: grandTotal * exchangeRate,
                  sub_total: validRows.reduce((sum, r) => sum + (r.quantity * r.purchase_price), 0),
                  base_sub_total: validRows.reduce((sum, r) => sum + (r.quantity * r.purchase_price), 0) * exchangeRate,
                  discount_total: 0,
                  base_discount_total: 0,
                  tax_total: 0,
                  base_tax_total: 0,
                  status: "Posted",
                  payment_status: paymentStatus,
                  items: validRows.map((r, idx) => ({
                    id: `pii_${Date.now()}_${idx}`,
                    purchase_invoice_id: `pi_${Date.now()}`,
                    product_id: r.product_id || "new_product",
                    is_new: r.product_id === null,
                    product_name: r.product_name,
                    quantity: r.quantity,
                    unit_price: r.purchase_price,
                    selling_price: r.selling_price,
                    total_price: r.quantity * r.purchase_price,
                    base_total_price: (r.quantity * r.purchase_price) * exchangeRate,
                    expiry_date: r.expiry_date
                  }))
                };
                
                // Fix purchase_invoice_id reference since we computed `pi_${Date.now()}` twice differently
                const newInvId = `pi_${Date.now()}`;
                newInvoice.id = newInvId;
                newInvoice.items.forEach(i => i.purchase_invoice_id = newInvId);
                
                // ✅ ACCOUNTING: Post journal entry automatically
                try {
                  const isPaid = totalPaid > 0;
                  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
                  
                  const postingPayload = {
                    invoiceId:      newInvoice.id,
                    invoiceNumber:  newInvoice.invoice_number,
                    grandTotal:     newInvoice.grand_total,
                    baseGrandTotal: newInvoice.base_grand_total,
                    currencyId:     currencyId,
                    exchangeRate:   exchangeRate,
                    paidAmount:     totalPaid,
                    basePaidAmount: totalPaid * exchangeRate,
                    paymentMethod:  activeMethods.filter(m => m !== "Other")[0] || "Cash",
                    supplierName:   selectedSupplier?.supplier_name,
                  };

                  store.addPurchaseInvoice(newInvoice as any, newInvoice.items as any, postingPayload);

                } catch (err) {
                  console.error("[AccountingEngine] Failed to post purchase journal entry:", err);
                }

                if(onSave) onSave({ ...newInvoice, _finalPaid: totalPaid, _activeMethods: activeMethods });
                setShowPaymentModal(false);
                setFinalInvoiceData({ ...newInvoice, _finalPaid: totalPaid, _creditAmount: creditAmount });
                setStep("success");
                toast.success(isRTL ? "تم الحفظ والترحيل بنجاح!" : "Saved & Posted successfully!");
              }}
              style={{ flex: 1, height: 56, background: (!isValidToPay) ? (isDark ? ds.surface : "#E2E8F0") : "linear-gradient(135deg,#16A34A,#22C55E)", border: "none", borderRadius: 16, color: (!isValidToPay) ? ds.textMuted : "white", fontSize: 16, fontWeight: 800, cursor: (!isValidToPay) ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: (!isValidToPay) ? "none" : "0 8px 24px rgba(22,163,74,0.3)", transition: "all 0.2s" }}
            >
              <Save size={22} color={(!isValidToPay) ? ds.textMuted : "white"} strokeWidth={2.5} />
              {isRTL ? "تأكيد وحفظ" : "Confirm & Save"}
            </motion.button>
            </div>
          </motion.div>
        </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showSupplierModal && (
          <SupplierFormSheet
            onClose={() => setShowSupplierModal(false)}
            onSave={(data) => {
              const newSup = { 
                id: `sup_new_${Date.now()}`, 
                business_id: "biz_001",
                supplier_name: data.supplier_name!,
                contact_person: data.contact_person || null,
                phone: data.phone || null,
                supplier_address: data.supplier_address || null,
                is_active: data.is_active ?? true,
                created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null
              };
              purchaseStore.addSupplier(newSup as any);
              setSelectedSupplierId(newSup.id);
              setShowSupplierModal(false);
              toast.success(isRTL ? "تم إضافة المورد بنجاح" : "Supplier added successfully");
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCategoryModalFor && (
          <CategoryFormSheet
            onClose={() => setShowCategoryModalFor(null)}
            onSave={(data) => {
              const newCat = { id: `cat_new_${Date.now()}`, category_name: data.category_name };
              setLocalCategories(prev => [...prev, newCat]);
              updateRow(showCategoryModalFor, "category_id", newCat.id);
              setShowCategoryModalFor(null);
              toast.success(isRTL ? "تم إضافة التصنيف بنجاح" : "Category added successfully");
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUnitModalFor && (
          <UnitFormSheet
            onClose={() => setShowUnitModalFor(null)}
            onSave={(data) => {
              const newUnit = { id: `unit_new_${Date.now()}`, unit_name: data.unit_name, is_default: false };
              setLocalUnits(prev => [...prev, newUnit]);
              updateRow(showUnitModalFor, "unit_id", newUnit.id);
              setShowUnitModalFor(null);
              toast.success(isRTL ? "تم إضافة الوحدة بنجاح" : "Unit added successfully");
            }}
          />
        )}
      </AnimatePresence>

      </motion.div>
    </div>,
    document.body
  );
}
