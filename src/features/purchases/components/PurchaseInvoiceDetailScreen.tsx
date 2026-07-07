import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Printer, FileText, User, Calendar, XCircle, Clock, Share2 } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { generateReceiptHTML, buildReceiptMessage } from "@/features/sales/utils/receiptUtils";
import { MOCK_BUSINESS } from "@/core/data/mockData";
import { MOCK_CURRENCIES } from "@/core/data/financeMockData";
import { useFinancialStore } from "@/core/engine/useFinancialStore";

export function PurchaseInvoiceDetailScreen({ invoice, supplier, onBack }: { invoice: any, supplier: any, onBack: () => void }) {
  const { t, isDark, isRTL, ds } = useApp();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  
  const store = useFinancialStore();
  const totalPaid = invoice.mock_paid_amount !== undefined ? invoice.mock_paid_amount : store.getSupplierInvoiceTotalPaid(invoice.id);
  const remainingAmount = Math.max(0, invoice.grand_total - totalPaid);

  const invoiceCurrency = MOCK_CURRENCIES.find(c => c.id === invoice.currency_id) || MOCK_CURRENCIES.find(c => c.is_base_currency);
  const currency = invoiceCurrency ? invoiceCurrency.currency_symbol : "ر.ي";
  const baseCurrencyObj = MOCK_CURRENCIES.find(c => c.is_base_currency);
  const baseCurrency = baseCurrencyObj ? baseCurrencyObj.currency_symbol : "ر.ي";

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(isRTL ? "ar-YE" : "en-US", {
      day: "2-digit", month: "2-digit", year: "numeric"
    });
  }

  const receiptData = {
    businessName: MOCK_BUSINESS.business_name,
    businessPhone: MOCK_BUSINESS.primary_phone ?? "",
    businessAddress: "صنعاء، شارع حده",
    invoiceNumber: invoice.invoice_number,
    invoiceDate: formatDate(invoice.purchase_date),
    customerName: supplier?.supplier_name || (isRTL ? "مورد عام" : "General Supplier"),
    items: invoice.items?.length > 0 
      ? invoice.items.map((it: any) => ({
          name: it.product_unit?.product?.product_name || it.product_name || (isRTL ? "منتج غير معروف" : "Unknown Product"),
          qty: it.quantity || 1,
          unitPrice: it.unit_price || 0,
          total: it.line_total || it.total_price || (it.quantity * it.unit_price) || 0
        }))
      : [{ name: isRTL ? "إجمالي مشتريات (مجمعة)" : "Total Purchases", qty: 1, unitPrice: invoice.grand_total || 0, total: invoice.grand_total || 0 }],
    subtotal: invoice.sub_total || 0,
    discountAmount: (invoice.discount_total || invoice.discount_amount) > 0 ? (invoice.discount_total || invoice.discount_amount) : undefined,
    taxAmount: (invoice.tax_total || invoice.tax_amount) > 0 ? (invoice.tax_total || invoice.tax_amount) : undefined,
    grandTotal: invoice.grand_total,
    baseGrandTotal: invoice.base_grand_total || (invoice.grand_total * (invoice.exchange_rate || 1)),
    baseCurrency,
    currency,
    paidAmount: totalPaid,
    remainingAmount: remainingAmount,
    paymentMethod: isRTL ? (invoice.payment_status === "Paid" ? "نقداً" : "آجل") : invoice.payment_status,
    notes: isRTL ? "فاتورة مشتريات (سند إدخال مخزني)" : "Purchase Invoice",
    isRTL,
    appName: isRTL ? "تاجر" : "Tajir",
    documentTitle: isRTL ? "فاتورة مشتريات" : "PURCHASE INVOICE",
    entityLabel: isRTL ? "المورد:" : "Supplier:",
    entityInfoTitle: isRTL ? "معلومات الفاتورة والمورد" : "Invoice & Supplier Information",
  };

  const htmlContent = generateReceiptHTML({ ...receiptData, autoPrint: false });

  function handlePrint() {
    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) return;
    
    const printHtml = generateReceiptHTML({ ...receiptData, autoPrint: true });
    printWindow.document.write(printHtml);
    printWindow.document.close();
  }

  function handleShare() {
    const text = buildReceiptMessage(receiptData);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      {/* Backdrop */}
      <div onClick={onBack} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
      
      {/* Modal Box */}
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} style={{ position: "relative", width: "100%", maxWidth: 800, maxHeight: "90vh", background: isDark ? ds.surface : "#F8FAFC", borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
        
        {/* Modal Header */}
        <div style={{ background: "linear-gradient(135deg, #1D4ED8, #2563EB)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600, margin: "0 0 4px 0" }}>{isRTL ? "تفاصيل فاتورة المشتريات" : "Purchase Invoice Details"}</p>
            <h2 style={{ color: "white", fontSize: 20, fontWeight: 800, margin: 0, direction: "ltr" }}>{invoice.invoice_number}</h2>
          </div>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.2)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"} onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}>
            <XCircle size={20} color="white" />
          </button>
        </div>

        {/* Modal Content (Scrollable) */}
        <div className="invoice-scroll-container" style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <style>{`.invoice-scroll-container::-webkit-scrollbar { display: none; }`}</style>
          
          {/* Actions */}
          <div style={{ display: "flex", gap: 16, width: "100%", marginBottom: 24 }}>
            <motion.button whileTap={{ scale: 0.96 }} onClick={handlePrint} style={{ flex: 1, height: 60, background: isDark ? ds.surface2 : "#FFFFFF", border: `1.5px solid ${ds.border}`, borderRadius: 14, color: ds.textPrimary, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <Printer size={22} color={ds.primary} /> {isRTL ? "طباعة الفاتورة" : "Print Invoice"}
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={handleShare} style={{ flex: 1, height: 60, background: "#25D366", border: "none", borderRadius: 14, color: "white", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 12px rgba(37,211,102,0.3)" }}>
              <Share2 size={22} color="white" /> {isRTL ? "مشاركة الإيصال" : "Share Receipt"}
            </motion.button>
          </div>

          {/* The Invoice Card Preview */}
          <div style={{ width: "100%", background: isDark ? "#0F172A" : "#E2E8F0", padding: "12px", borderRadius: 16, display: "flex", justifyContent: "center", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)" }}>
            <iframe
              srcDoc={htmlContent}
              style={{
                width: "100%", height: "55vh",
                background: "white", border: "none",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
          </div>

        </div>
      </motion.div>
    </div>
  );
}
