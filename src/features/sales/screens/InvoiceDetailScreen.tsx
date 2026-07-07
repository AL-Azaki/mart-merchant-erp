import { motion } from "motion/react";
import {
  ArrowLeft, ArrowRight, Printer, Share2, CheckCircle2,
  Clock, AlertCircle, XCircle, User, Calendar, FileText
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import type { SalesInvoiceWithDetails } from "@/core/types/sales";
import { MOCK_BUSINESS } from "@/core/data/mockData";
import { MOCK_CURRENCIES } from "@/core/data/financeMockData";
import { useFinancialStore } from "@/core/engine/useFinancialStore";
import { generateReceiptHTML, buildReceiptMessage } from "../utils/receiptUtils";

interface InvoiceDetailScreenProps {
  invoice: SalesInvoiceWithDetails;
  onBack: () => void;
}

const STATUS_CONFIG = {
  paid:           { labelKey: "invoicePaid",      color: "#16A34A", bg: "rgba(22, 163, 74, 0.12)",   Icon: CheckCircle2 },
  partially_paid: { labelKey: "invoicePartial",   color: "#F59E0B", bg: "rgba(245, 158, 11, 0.12)", Icon: Clock },
  draft:          { labelKey: "invoiceDraft",     color: "#64748B", bg: "rgba(100, 116, 139, 0.12)",Icon: FileText },
  confirmed:      { labelKey: "invoiceConfirmed", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.12)", Icon: CheckCircle2 },
  cancelled:      { labelKey: "invoiceCancelled", color: "#EF4444", bg: "rgba(239, 68, 68, 0.12)",  Icon: XCircle },
  overdue:        { labelKey: "invoiceOverdue",   color: "#DC2626", bg: "rgba(220, 38, 38, 0.12)",  Icon: AlertCircle },
} as const;

const METHOD_LABELS: Record<string, string> = {
  Cash: "payCash", Card: "payCard", Bank: "payTransfer", Credit: "payCredit", Multi: "payMulti"
};

export function InvoiceDetailScreen({ invoice, onBack }: InvoiceDetailScreenProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const store = useFinancialStore();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  
  const paidAmount = store.getInvoiceTotalPaid(invoice.id);
  const remainingAmount = Math.max(0, invoice.grand_total - paidAmount);
  
  // Re-derive status just to be safe
  let actualPaymentStatus = invoice.payment_status;
  if (remainingAmount <= 0) actualPaymentStatus = "Paid";
  else if (paidAmount > 0) actualPaymentStatus = "Partial";
  else actualPaymentStatus = "Unpaid";

  let cfgKey: keyof typeof STATUS_CONFIG = "draft";
  if (invoice.status === "Draft") cfgKey = "draft";
  else if (invoice.status === "Cancelled") cfgKey = "cancelled";
  else if (actualPaymentStatus === "Paid") cfgKey = "paid";
  else if (actualPaymentStatus === "Partial") cfgKey = "partially_paid";
  else cfgKey = "confirmed";
  
  const cfg = STATUS_CONFIG[cfgKey];
  
  const invoiceCurrency = MOCK_CURRENCIES.find(c => c.id === invoice.currency_id) || MOCK_CURRENCIES.find(c => c.is_base_currency);
  const currency = invoiceCurrency ? invoiceCurrency.currency_symbol : "ر.ي";
  const baseCurrencyObj = MOCK_CURRENCIES.find(c => c.is_base_currency);
  const baseCurrency = baseCurrencyObj ? baseCurrencyObj.currency_symbol : "ر.ي";

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(isRTL ? "ar-YE" : "en-US", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  }

  const rawMethod = invoice.payment_method || "Credit";
  const paymentMethodStr = t[METHOD_LABELS[rawMethod]] || rawMethod;

  const receiptData = {
    businessName: MOCK_BUSINESS.business_name,
    businessPhone: MOCK_BUSINESS.primary_phone ?? "",
    businessAddress: "صنعاء، شارع حده",
    invoiceNumber: invoice.invoice_number,
    invoiceDate: formatDate(invoice.invoice_date),
    customerName: invoice.customer?.customer_name ?? t.cashCustomer,
    items: invoice.items.map(i => ({
      name: i.product_unit?.product?.name || "منتج غير معروف",
      qty: i.quantity || 1,
      unitPrice: i.unit_price || 0,
      total: i.line_total || 0,
      discount: i.discount > 0 ? i.discount : undefined,
    })),
    subtotal: invoice.sub_total,
    discountAmount: invoice.discount_total > 0 ? invoice.discount_total : undefined,
    taxAmount: invoice.tax_total > 0 ? invoice.tax_total : undefined,
    grandTotal: invoice.grand_total,
    baseGrandTotal: invoice.base_grand_total || (invoice.grand_total * (invoice.exchange_rate || 1)),
    baseCurrency,
    currency,
    paymentMethod: paymentMethodStr,
    paymentStatus: actualPaymentStatus,
    paidAmount: paidAmount,
    remainingAmount: remainingAmount,
    notes: invoice.notes || undefined,
    isRTL,
    appName: isRTL ? "تاجر" : "Tajir",
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
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600, margin: "0 0 4px 0" }}>{t.invoiceSummary}</p>
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
              <Printer size={22} color={ds.primary} /> {t.printReceipt}
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={handleShare} style={{ flex: 1, height: 60, background: "#25D366", border: "none", borderRadius: 14, color: "white", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 12px rgba(37,211,102,0.3)" }}>
              <Share2 size={22} color="white" /> {t.shareReceipt}
            </motion.button>
          </div>

          {/* The Receipt / Invoice Card Preview */}
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
