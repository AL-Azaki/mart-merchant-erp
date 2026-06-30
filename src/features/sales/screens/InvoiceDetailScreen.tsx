import { motion } from "motion/react";
import {
  ArrowLeft, ArrowRight, Printer, Share2, CheckCircle2,
  Clock, AlertCircle, XCircle, User, Calendar, FileText
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import type { SalesInvoiceWithDetails } from "@/core/types/sales";
import { MOCK_BUSINESS } from "@/core/data/mockData";
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
  cash: "payCash", card: "payCard", transfer: "payTransfer", credit: "payCredit", multi: "payMulti", cheque: "payTransfer"
};

export function InvoiceDetailScreen({ invoice, onBack }: InvoiceDetailScreenProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  let cfgKey: keyof typeof STATUS_CONFIG = "draft";
  if (invoice.status === "Draft") cfgKey = "draft";
  else if (invoice.status === "Cancelled") cfgKey = "cancelled";
  else if (invoice.payment_status === "Paid") cfgKey = "paid";
  else if (invoice.payment_status === "Partial") cfgKey = "partially_paid";
  else cfgKey = "confirmed";
  
  const cfg = STATUS_CONFIG[cfgKey];
  const currency = MOCK_BUSINESS.default_currency === "YER" ? "ر.ي" : MOCK_BUSINESS.default_currency;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(isRTL ? "ar-YE" : "en-US", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  }

  function handlePrint() {
    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) return;
    
    const paymentMethodStr = invoice.payment_status === "Paid" 
      ? t.payCash // Assuming cash for now, since payments array is removed in v2
      : t.invoiceUnpaid;

    const html = generateReceiptHTML({
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
      currency,
      paymentMethod: paymentMethodStr,
      notes: invoice.notes || undefined,
      isRTL,
      appName: isRTL ? "تاجر" : "Tajir",
    });
    printWindow.document.write(html);
    printWindow.document.close();
  }

  function handleShare() {
    const paymentMethodStr = invoice.payment_status === "Paid" 
      ? t.payCash
      : t.invoiceUnpaid;
    const text = buildReceiptMessage({
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
      })),
      subtotal: invoice.sub_total,
      discountAmount: invoice.discount_total > 0 ? invoice.discount_total : undefined,
      taxAmount: invoice.tax_total > 0 ? invoice.tax_total : undefined,
      grandTotal: invoice.grand_total,
      currency,
      paymentMethod: paymentMethodStr,
      notes: invoice.notes || undefined,
      isRTL,
      appName: isRTL ? "تاجر" : "Tajir",
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
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
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 500 }}>{t.invoiceSummary}</p>
              <h2 style={{ color: "white", fontSize: 18, fontWeight: 800, direction: "ltr" }}>{invoice.invoice_number}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (Scrollable) */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        {/* Actions */}
        <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 400, marginBottom: 20 }}>
          <motion.button whileTap={{ scale: 0.96 }} onClick={handlePrint} style={{ flex: 1, height: 48, background: isDark ? ds.surface : "#FFFFFF", border: `1px solid ${ds.border}`, borderRadius: 14, color: ds.textPrimary, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <Printer size={18} color={ds.primary} /> {t.printReceipt}
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleShare} style={{ flex: 1, height: 48, background: "#25D366", border: "none", borderRadius: 14, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 12px rgba(37,211,102,0.3)" }}>
            <Share2 size={18} color="white" /> {t.shareReceipt}
          </motion.button>
        </div>

        {/* The Receipt / Invoice Card */}
        <div id="printable-receipt" style={{
          width: "100%", maxWidth: 400, background: isDark ? ds.surface : "#FFFFFF",
          borderRadius: 16, padding: "24px",
          boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 8px 30px rgba(0,0,0,0.08)",
          fontFamily: "monospace, sans-serif", // Gives it a receipt feel
        }}>
          {/* Receipt Header */}
          <div style={{ textAlign: "center", marginBottom: 24, borderBottom: `1px dashed ${isDark ? "#334155" : "#CBD5E1"}`, paddingBottom: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: ds.textPrimary, margin: "0 0 4px 0" }}>{MOCK_BUSINESS.business_name}</h2>
            <p style={{ fontSize: 12, color: ds.textSecondary, margin: "0 0 12px 0" }}>{MOCK_BUSINESS.primary_phone} | صنعاء، شارع حده</p>
            <div style={{ display: "inline-block", padding: "4px 12px", background: cfg.bg, color: cfg.color, borderRadius: 8, fontSize: 12, fontWeight: 800 }}>
              {t[cfg.labelKey]}
            </div>
          </div>

          {/* Receipt Meta */}
          <div style={{ marginBottom: 20, fontSize: 13, color: ds.textPrimary, lineHeight: 1.6 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: ds.textSecondary }}>{t.invoiceNumber}:</span>
              <strong style={{ direction: "ltr" }}>{invoice.invoice_number}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: ds.textSecondary }}>{t.invoiceDate}:</span>
              <strong>{formatDate(invoice.invoice_date)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: ds.textSecondary }}>{t.invoiceCustomer}:</span>
              <strong>{invoice.customer?.customer_name ?? t.cashCustomer}</strong>
            </div>
          </div>

          {/* Receipt Items Header */}
          <div style={{ display: "flex", borderBottom: `1px solid ${isDark ? "#334155" : "#E2E8F0"}`, paddingBottom: 8, marginBottom: 12, fontSize: 12, fontWeight: 700, color: ds.textSecondary }}>
            <div style={{ flex: 2 }}>{t.productName}</div>
            <div style={{ flex: 1, textAlign: "center" }}>{t.productQty}</div>
            <div style={{ flex: 1, textAlign: isRTL ? "left" : "right" }}>{t.invoiceTotal}</div>
          </div>

          {/* Receipt Items */}
          <div style={{ marginBottom: 20 }}>
            {(invoice.items || []).map((item, i) => (
              <div key={item.id || i} style={{ display: "flex", alignItems: "flex-start", marginBottom: 10, fontSize: 13, color: ds.textPrimary, fontWeight: 600 }}>
                <div style={{ flex: 2, paddingInlineEnd: 8 }}>
                  <div>{item.product_unit?.product?.name || "منتج غير معروف"}</div>
                  {item.discount > 0 && <div style={{ fontSize: 11, color: ds.textMuted, fontWeight: 400 }}>{t.productDiscount}: -{item.discount}</div>}
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>{item.quantity || 1}</div>
                <div style={{ flex: 1, textAlign: isRTL ? "left" : "right" }}>{(item.line_total || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* Receipt Totals */}
          <div style={{ borderTop: `1px dashed ${isDark ? "#334155" : "#CBD5E1"}`, paddingTop: 16, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: ds.textSecondary }}>
              <span>{t.invoiceSubtotal}</span>
              <span style={{ color: ds.textPrimary, fontWeight: 600 }}>{(invoice.sub_total || 0).toLocaleString()}</span>
            </div>
            {invoice.discount_total > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: ds.textSecondary }}>
                <span>{t.invoiceDiscount}</span>
                <span style={{ color: ds.textPrimary, fontWeight: 600 }}>-{invoice.discount_total.toLocaleString()}</span>
              </div>
            )}
            {invoice.tax_total > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: ds.textSecondary }}>
                <span>{t.invoiceTax}</span>
                <span style={{ color: ds.textPrimary, fontWeight: 600 }}>{invoice.tax_total.toLocaleString()}</span>
              </div>
            )}
            
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: `2px solid ${isDark ? "#334155" : "#E2E8F0"}`, fontSize: 16, fontWeight: 900, color: ds.textPrimary }}>
              <span>{t.invoiceGrandTotal}</span>
              <span>{(invoice.grand_total || 0).toLocaleString()} <span style={{ fontSize: 12 }}>{currency}</span></span>
            </div>
          </div>

          {/* Payments & Notes */}
          <div style={{ fontSize: 12, color: ds.textSecondary, textAlign: "center", lineHeight: 1.5 }}>
            {invoice.payment_status === "Paid" && (
              <div style={{ marginBottom: 16 }}>
                {t.paymentMethod}: {t.payCash}
              </div>
            )}
            {invoice.notes && (
              <div style={{ marginBottom: 16, fontStyle: "italic" }}>
                "{invoice.notes}"
              </div>
            )}
            
            <div>{isRTL ? "تم إصدار الفاتورة بواسطة:" : "Issued by:"} Tajir App</div>
            <div style={{ marginTop: 8, fontWeight: 700 }}>{isRTL ? "شكرًا لزيارتكم!" : "Thank You!"}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
