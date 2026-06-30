import { useState } from "react";
import { motion } from "motion/react";
import { X, RotateCcw, Check, Search, FileText, Package } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

interface SalesReturnFormSheetProps {
  returnRecord?: any;
  onClose: () => void;
}

export function SalesReturnFormSheet({ returnRecord, onClose }: SalesReturnFormSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const [step, setStep] = useState(returnRecord ? 2 : 1);
  const [invoiceNumber, setInvoiceNumber] = useState(returnRecord?.invoice_number || "");
  
  // Mock items from an invoice
  const [items, setItems] = useState([
    { id: "i1", name: isRTL ? "ايفون 15 برو" : "iPhone 15 Pro", qty_bought: 2, qty_returned: returnRecord ? 1 : 0, price: 4500 },
    { id: "i2", name: isRTL ? "شاحن جداري 20 واط" : "20W Wall Charger", qty_bought: 1, qty_returned: returnRecord ? 1 : 0, price: 99 },
  ]);

  const [returnReason, setReturnReason] = useState("عيب مصنعي");

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const getInputStyle = () => ({
    width: "100%", height: 48, padding: "0 16px",
    background: isDark ? ds.surface2 : "#FFFFFF",
    border: `1px solid ${border}`, borderRadius: 12,
    color: ds.textPrimary, fontSize: 14, fontWeight: 500,
    outline: "none", fontFamily: "inherit"
  });

  const handleQtyChange = (id: string, val: string) => {
    const num = parseInt(val) || 0;
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, qty_returned: Math.min(Math.max(num, 0), item.qty_bought) };
      }
      return item;
    }));
  };

  const totalReturned = items.reduce((sum, item) => sum + (item.qty_returned * item.price), 0);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: isRTL ? "flex-start" : "flex-end" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(6px)" }} />
      
      <motion.div initial={{ x: isRTL ? "-100%" : "100%" }} animate={{ x: 0 }} exit={{ x: isRTL ? "-100%" : "100%" }} transition={{ type: "spring", damping: 28, stiffness: 220 }}
        style={{ position: "relative", width: "100%", maxWidth: 650, background: bg, height: "100%", display: "flex", flexDirection: "column", boxShadow: "-10px 0 40px rgba(0,0,0,0.15)" }}>
        
        {/* Header */}
        <div style={{ padding: "24px 32px", background: surface, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #EF4444, #DC2626)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)" }}>
              <RotateCcw size={22} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800, margin: "0 0 4px 0" }}>
                {returnRecord ? (isRTL ? "تفاصيل المرتجع" : "Return Details") : (isRTL ? "إنشاء مرتجع جديد" : "Create New Return")}
              </h2>
              <p style={{ color: ds.textSecondary, fontSize: 13, margin: 0 }}>
                {returnRecord ? returnRecord.return_number : (isRTL ? "إرجاع منتجات وإصدار إشعار دائن" : "Return items and issue credit note")}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? ds.surface2 : "#F8FAFC", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={20} color={ds.textPrimary} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          
          {step === 1 && !returnRecord && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 16, padding: 20, color: "#3B82F6", fontSize: 14, fontWeight: 600 }}>
                {isRTL ? "الخطوة 1: ابحث عن الفاتورة الأصلية المراد إرجاع منتجات منها." : "Step 1: Search for the original invoice to return items from."}
              </div>

              <div>
                <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "رقم الفاتورة الأصلية *" : "Original Invoice Number *"}</label>
                <div style={{ position: "relative" }}>
                  <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: 15, [isRTL ? "right" : "left"]: 16 }} />
                  <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} style={{ ...getInputStyle(), paddingInlineStart: 44 }} placeholder="INV-2023-XXXX" />
                </div>
              </div>

              <button 
                disabled={!invoiceNumber}
                onClick={() => setStep(2)}
                style={{ height: 52, background: invoiceNumber ? "linear-gradient(135deg, #6366F1, #4F46E5)" : ds.surface2, border: "none", borderRadius: 14, color: invoiceNumber ? "white" : ds.textMuted, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: invoiceNumber ? "pointer" : "not-allowed", transition: "all 0.2s" }}
              >
                {isRTL ? "جلب الفاتورة" : "Fetch Invoice"}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Invoice Info Card */}
              <div style={{ background: surface, borderRadius: 20, border: `1px solid ${border}`, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText size={24} color="#6366F1" />
                </div>
                <div>
                  <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 800, margin: "0 0 4px 0" }}>{isRTL ? "الفاتورة الأصلية" : "Original Invoice"}: {invoiceNumber}</h3>
                  <p style={{ color: ds.textSecondary, fontSize: 13, margin: 0 }}>{isRTL ? "تاريخ الفاتورة" : "Invoice Date"}: 12 Oct 2023</p>
                </div>
              </div>

              {/* Items to Return */}
              <div>
                <h3 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 800, marginBottom: 16 }}>{isRTL ? "حدد الكميات المرتجعة" : "Select Return Quantities"}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {items.map(item => (
                    <div key={item.id} style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: isDark ? ds.surface2 : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Package size={20} color={ds.textMuted} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
                        <div style={{ color: ds.textSecondary, fontSize: 12 }}>{item.price.toLocaleString()} {isRTL ? "ريال" : "SAR"} (المشترى: {item.qty_bought})</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <label style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>{isRTL ? "المرتجع:" : "Return:"}</label>
                        <input 
                          type="number" 
                          min="0" 
                          max={item.qty_bought} 
                          value={item.qty_returned} 
                          onChange={e => handleQtyChange(item.id, e.target.value)}
                          disabled={!!returnRecord}
                          style={{ width: 60, height: 36, textAlign: "center", borderRadius: 8, border: `1px solid ${border}`, background: isDark ? ds.surface2 : "#FFFFFF", color: ds.textPrimary, fontWeight: 700, outline: "none" }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "سبب الإرجاع" : "Return Reason"}</label>
                <select 
                  value={returnReason} 
                  onChange={e => setReturnReason(e.target.value)} 
                  disabled={!!returnRecord}
                  style={getInputStyle()}
                >
                  <option value="عيب مصنعي">{isRTL ? "عيب مصنعي" : "Defective item"}</option>
                  <option value="غير مطابق">{isRTL ? "غير مطابق للمواصفات" : "Not as described"}</option>
                  <option value="تغيير رأي">{isRTL ? "تغيير رأي العميل" : "Customer changed mind"}</option>
                </select>
              </div>

              {/* Total Card */}
              <div style={{ background: "rgba(239,68,68,0.05)", borderRadius: 16, border: `1px dashed rgba(239,68,68,0.3)`, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700 }}>{isRTL ? "إجمالي المبلغ المسترد" : "Total Refund Amount"}</span>
                <span style={{ color: "#EF4444", fontSize: 24, fontWeight: 800 }}>{totalReturned.toLocaleString()} {isRTL ? "ريال" : "SAR"}</span>
              </div>

            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "20px 32px", background: surface, borderTop: `1px solid ${border}`, flexShrink: 0 }}>
          {!returnRecord ? (
            <button 
              onClick={onClose}
              disabled={step === 2 && totalReturned === 0}
              style={{ width: "100%", height: 56, background: totalReturned > 0 ? "linear-gradient(135deg, #EF4444, #DC2626)" : ds.surface2, border: "none", borderRadius: 16, color: totalReturned > 0 ? "white" : ds.textMuted, fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: totalReturned > 0 ? "pointer" : "not-allowed", transition: "all 0.2s" }}
            >
              <Check size={22} strokeWidth={3} />
              {isRTL ? "تأكيد المرتجع وإصدار الإشعار" : "Confirm Return & Issue Note"}
            </button>
          ) : (
            <button 
              onClick={onClose}
              style={{ width: "100%", height: 56, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 16, color: ds.textPrimary, fontSize: 16, fontWeight: 800, cursor: "pointer" }}
            >
              {isRTL ? "إغلاق" : "Close"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
