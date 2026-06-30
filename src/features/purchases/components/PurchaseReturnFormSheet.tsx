import { useState } from "react";
import { motion } from "motion/react";
import { X, RotateCcw, Check, Search, FileText, Package, Database } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_BUSINESS } from "@/core/data/mockData";

interface PurchaseReturnFormSheetProps {
  returnRecord?: any;
  onClose: () => void;
}

export function PurchaseReturnFormSheet({ returnRecord, onClose }: PurchaseReturnFormSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const [step, setStep] = useState(returnRecord ? 2 : 1);
  const [invoiceNumber, setInvoiceNumber] = useState(returnRecord?.invoice_number || "");
  const currency = MOCK_BUSINESS.default_currency === "YER" ? "ر.ي" : MOCK_BUSINESS.default_currency;
  
  // Mock items aligned with new catalog (product units)
  const [items, setItems] = useState([
    { id: "pu_002", name: isRTL ? "مياه معدنية (كرتون)" : "Mineral Water (Box)", warehouse: isRTL ? "المستودع الرئيسي" : "Main WH", qty_bought: 50, qty_returned: returnRecord ? 10 : 0, price: 550 },
    { id: "pu_007", name: isRTL ? "سماعات بلوتوث (قطعة)" : "Bluetooth Headphones (PC)", warehouse: isRTL ? "المستودع الرئيسي" : "Main WH", qty_bought: 10, qty_returned: returnRecord ? 2 : 0, price: 8000 },
  ]);

  const [returnReason, setReturnReason] = useState("تالف");

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
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #F59E0B, #D97706)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)" }}>
              <RotateCcw size={22} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800, margin: "0 0 4px 0" }}>
                {returnRecord ? (isRTL ? "تفاصيل مرتجع المشتريات" : "Purchase Return Details") : (isRTL ? "إنشاء مرتجع لمورد" : "Create Return to Supplier")}
              </h2>
              <p style={{ color: ds.textSecondary, fontSize: 13, margin: 0 }}>
                {returnRecord ? returnRecord.return_number : (isRTL ? "إرجاع بضاعة واسترداد التكلفة" : "Return goods and recover cost")}
              </p>
            </div>
          </div>
          <button title={isRTL ? "إغلاق" : "Close"} onClick={onClose} style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? ds.surface2 : "#F8FAFC", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = isDark ? ds.border : "#E2E8F0"} onMouseLeave={e => e.currentTarget.style.background = isDark ? ds.surface2 : "#F8FAFC"}>
            <X size={20} color={ds.textPrimary} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          
          {step === 1 && !returnRecord && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 16, padding: 20, color: "#3B82F6", fontSize: 14, fontWeight: 600 }}>
                {isRTL ? "الخطوة 1: ابحث عن فاتورة المشتريات الأصلية المراد إرجاع بضاعة منها." : "Step 1: Search for the original purchase invoice."}
              </div>

              <div>
                <label style={{ display: "block", color: ds.textSecondary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "رقم فاتورة المشتريات *" : "Purchase Invoice Number *"}</label>
                <div style={{ position: "relative" }}>
                  <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: 15, [isRTL ? "right" : "left"]: 16 }} />
                  <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} style={{ ...getInputStyle(), paddingInlineStart: 44, direction: "ltr" }} placeholder="PINV-2024-XXXX" />
                </div>
              </div>

              <button 
                title={isRTL ? "البحث عن الفاتورة" : "Search Invoice"}
                disabled={!invoiceNumber}
                onClick={() => setStep(2)}
                style={{ height: 52, background: invoiceNumber ? "linear-gradient(135deg, #10B981, #059669)" : ds.surface2, border: "none", borderRadius: 14, color: invoiceNumber ? "white" : ds.textMuted, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: invoiceNumber ? "pointer" : "not-allowed", transition: "all 0.2s" }}
              >
                {isRTL ? "جلب فاتورة المورد" : "Fetch Supplier Invoice"}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Invoice Info Card */}
              <div style={{ background: surface, borderRadius: 20, border: `1px solid ${border}`, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText size={24} color="#10B981" />
                </div>
                <div>
                  <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 800, margin: "0 0 4px 0" }}>{isRTL ? "الفاتورة الأصلية" : "Original Invoice"}: <span style={{ direction: "ltr", display: "inline-block" }}>{invoiceNumber}</span></h3>
                  <p style={{ color: ds.textSecondary, fontSize: 13, margin: 0 }}>{isRTL ? "تاريخ الشراء" : "Purchase Date"}: 12 Oct 2024</p>
                </div>
              </div>

              {/* Items to Return */}
              <div>
                <h3 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 800, marginBottom: 16 }}>{isRTL ? "حدد الكميات المرتجعة للمورد من المستودع" : "Select Return Quantities to Supplier"}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {items.map(item => (
                    <div key={item.id} style={{ background: surface, borderRadius: 16, border: `1px solid ${border}`, padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: isDark ? ds.surface2 : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Package size={20} color={ds.textMuted} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
                        <div style={{ color: ds.textSecondary, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                          <Database size={12} /> {item.warehouse}
                        </div>
                        <div style={{ color: ds.textSecondary, fontSize: 12, marginTop: 4 }}>{item.price.toLocaleString()} {currency} ({isRTL ? "المشترى" : "Bought"}: {item.qty_bought})</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <label style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>{isRTL ? "إرجاع:" : "Return:"}</label>
                        <input 
                          type="number" 
                          min="0" 
                          max={item.qty_bought} 
                          value={item.qty_returned} 
                          onChange={e => handleQtyChange(item.id, e.target.value)}
                          disabled={!!returnRecord}
                          style={{ width: 60, height: 36, textAlign: "center", borderRadius: 8, border: `1px solid ${border}`, background: isDark ? ds.surface2 : "#FFFFFF", color: ds.textPrimary, fontWeight: 700, outline: "none", direction: "ltr" }} 
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
                  <option value="تالف">{isRTL ? "بضاعة تالفة" : "Damaged goods"}</option>
                  <option value="غير مطابق">{isRTL ? "مخالفة للمواصفات" : "Not matching specs"}</option>
                  <option value="زائدة">{isRTL ? "كمية زائدة عن الطلب" : "Excess quantity"}</option>
                </select>
              </div>

              {/* Total Card */}
              <div style={{ background: "rgba(245,158,11,0.05)", borderRadius: 16, border: `1px dashed rgba(245,158,11,0.3)`, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700 }}>{isRTL ? "إجمالي المبلغ المسترد من المورد" : "Total Refund from Supplier"}</span>
                <span style={{ color: "#F59E0B", fontSize: 24, fontWeight: 800 }}>{totalReturned.toLocaleString()} <span style={{ fontSize: 14 }}>{currency}</span></span>
              </div>

            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "20px 32px", background: surface, borderTop: `1px solid ${border}`, flexShrink: 0 }}>
          {!returnRecord ? (
            <button 
              title={isRTL ? "تأكيد إرجاع البضاعة للمورد واستلام المبلغ" : "Confirm returning goods to supplier and receiving refund"}
              onClick={onClose}
              disabled={step === 2 && totalReturned === 0}
              style={{ width: "100%", height: 56, background: totalReturned > 0 ? "linear-gradient(135deg, #10B981, #059669)" : ds.surface2, border: "none", borderRadius: 16, color: totalReturned > 0 ? "white" : ds.textMuted, fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: totalReturned > 0 ? "pointer" : "not-allowed", transition: "all 0.2s" }}
            >
              <Check size={22} strokeWidth={3} />
              {isRTL ? "تأكيد إرجاع البضاعة" : "Confirm Goods Return"}
            </button>
          ) : (
            <button 
              title={isRTL ? "إغلاق النافذة" : "Close Window"}
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
