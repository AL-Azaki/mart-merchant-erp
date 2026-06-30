import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Printer, FileText, User, Calendar, CheckCircle2, Clock } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { generateReceiptHTML } from "@/features/sales/utils/receiptUtils";
import { MOCK_BUSINESS } from "@/core/data/mockData";

export function PurchaseInvoiceDetailScreen({ invoice, supplier, onBack }: { invoice: any, supplier: any, onBack: () => void }) {
  const { t, isDark, isRTL, ds } = useApp();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const currency = "ر.ي";

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(isRTL ? "ar-YE" : "en-US", {
      day: "2-digit", month: "2-digit", year: "numeric"
    });
  }

  function handlePrint() {
    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) return;
    
    // We reuse the beautifully styled receiptUtils from sales!
    const html = generateReceiptHTML({
      businessName: MOCK_BUSINESS.business_name,
      businessPhone: MOCK_BUSINESS.primary_phone ?? "",
      businessAddress: "صنعاء، شارع حده",
      invoiceNumber: invoice.invoice_number,
      invoiceDate: formatDate(invoice.purchase_date),
      customerName: supplier?.supplier_name || (isRTL ? "مورد عام" : "General Supplier"),
      items: invoice.items?.length > 0 
        ? invoice.items.map((it: any) => ({
            name: it.product_name,
            qty: it.quantity,
            unitPrice: it.unit_price,
            total: it.total_price
          }))
        : [{ name: isRTL ? "إجمالي مشتريات (مجمعة)" : "Total Purchases", qty: 1, unitPrice: invoice.grand_total, total: invoice.grand_total }],
      subtotal: invoice.sub_total,
      discountAmount: invoice.discount_amount > 0 ? invoice.discount_amount : undefined,
      taxAmount: invoice.tax_amount > 0 ? invoice.tax_amount : undefined,
      grandTotal: invoice.grand_total,
      currency,
      paymentMethod: isRTL ? (invoice.payment_status === "Paid" ? "نقداً" : "آجل") : invoice.payment_status,
      notes: isRTL ? "فاتورة مشتريات (سند إدخال مخزني)" : "Purchase Invoice",
      isRTL,
      appName: isRTL ? "تاجر" : "Tajir",
    });
    printWindow.document.write(html);
    printWindow.document.close();
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: isDark ? ds.bg : "#F1F5F9" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(150deg,#1E3A8A,#2563EB)", padding: "56px 20px 24px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 13, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <BackIcon size={18} color="white" />
            </button>
            <div>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 500 }}>{isRTL ? "تفاصيل فاتورة المشتريات" : "Purchase Invoice Details"}</p>
              <h2 style={{ color: "white", fontSize: 18, fontWeight: 800, direction: "ltr" }}>{invoice.invoice_number}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        {/* Actions */}
        <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 400, marginBottom: 20 }}>
          <motion.button whileTap={{ scale: 0.96 }} onClick={handlePrint} style={{ flex: 1, height: 48, background: isDark ? ds.surface : "#FFFFFF", border: `1px solid ${ds.border}`, borderRadius: 14, color: ds.textPrimary, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <Printer size={18} color={ds.primary} /> {isRTL ? "طباعة الفاتورة" : "Print Invoice"}
          </motion.button>
        </div>

        {/* The Invoice Card */}
        <div style={{
          width: "100%", maxWidth: 400, background: isDark ? ds.surface : "#FFFFFF",
          borderRadius: 16, padding: "24px",
          boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 8px 30px rgba(0,0,0,0.08)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, borderBottom: `1px solid ${ds.border}`, paddingBottom: 16 }}>
             <div>
                <h3 style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{invoice.invoice_number}</h3>
                <div style={{ color: ds.textSecondary, fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}><Calendar size={14}/> {formatDate(invoice.purchase_date)}</div>
             </div>
             <div style={{ padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: invoice.status === "Posted" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: invoice.status === "Posted" ? "#10B981" : "#F59E0B" }}>
                {invoice.status === "Posted" ? (isRTL ? "مرحلة" : "Posted") : (isRTL ? "مسودة" : "Draft")}
             </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
             <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: isDark ? ds.surface2 : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={18} color={ds.textSecondary}/></div>
                <div>
                   <div style={{ color: ds.textSecondary, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{isRTL ? "المورد" : "Supplier"}</div>
                   <div style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700 }}>{supplier?.supplier_name || (isRTL ? "مورد عام" : "General Supplier")}</div>
                </div>
             </div>
          </div>

          {invoice.items?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>{isRTL ? "المنتجات" : "Items"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {invoice.items.map((it: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: idx === invoice.items.length - 1 ? "none" : `1px solid ${ds.border}` }}>
                    <div>
                      <div style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>{it.product_name}</div>
                      <div style={{ color: ds.textSecondary, fontSize: 12 }}>{it.quantity} x {it.unit_price.toLocaleString()} {currency}</div>
                    </div>
                    <div style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700 }}>{it.total_price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ borderTop: `1px dashed ${ds.border}`, paddingTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: ds.textSecondary }}>
              <span>{isRTL ? "المجموع" : "Subtotal"}</span>
              <span style={{ color: ds.textPrimary, fontWeight: 600 }}>{invoice.sub_total.toLocaleString()}</span>
            </div>
            {invoice.discount_amount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: ds.textSecondary }}>
                <span>{isRTL ? "الخصم" : "Discount"}</span>
                <span style={{ color: "#10B981", fontWeight: 600 }}>-{invoice.discount_amount.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, paddingTop: 16, borderTop: `1px solid ${ds.border}`, fontSize: 18, fontWeight: 900, color: ds.textPrimary }}>
              <span>{isRTL ? "الإجمالي النهائي" : "Grand Total"}</span>
              <span>{invoice.grand_total.toLocaleString()} <span style={{ fontSize: 12, color: ds.textSecondary }}>{currency}</span></span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
