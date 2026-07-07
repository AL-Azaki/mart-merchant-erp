import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft, ArrowRight, Printer, Share2, X,
  CheckCircle, Clock, FileText, Scale, AlertTriangle,
  ShoppingCart, Package, ArrowUpRight, ArrowDownRight, RotateCcw
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_CHART_OF_ACCOUNTS, MOCK_CURRENCIES } from "@/core/data/financeMockData";
import { MOCK_BUSINESS } from "@/core/data/mockData";
import { MOCK_SALES_INVOICE_ITEMS, MOCK_CUSTOMERS, MOCK_PRODUCTS, MOCK_PRODUCT_UNITS } from "@/core/data/salesMockData";
import { MOCK_PURCHASE_INVOICES, MOCK_PURCHASE_INVOICE_ITEMS, MOCK_SUPPLIERS } from "@/core/data/purchasesMockData";
import { generateReceiptHTML } from "@/features/sales/utils/receiptUtils";
import { generateVoucherHTML } from "@/features/finance/utils/voucherReceiptUtils";
import { useFinancialStore } from "@/core/engine/useFinancialStore";

interface Props {
  entry: any;
  lines: any[];
  onClose: () => void;
}

function getOriginalDocumentHTML(entry: any, isRTL: boolean, businessName: string, baseSym: string, store: ReturnType<typeof useFinancialStore>): string | null {
  // If this is a Payment, check if it's tied to a Sales Invoice. If so, we want to show the Original Invoice.
  let targetRefType = entry.reference_type;
  let targetRefId = entry.reference_id;
  let receiptObj = null;

  if (targetRefType === "Payment") {
    const receipt = store.receipts?.find(r => r.id === targetRefId);
    const payment = store.payments?.find(p => p.id === targetRefId);

    if (receipt) {
      receiptObj = receipt;
      let linkedInvoiceId = receipt.invoice_id;
      if (!linkedInvoiceId) {
        const custInvoice = store.invoices.find(i => i.customer_id === receipt.customer_id);
        if (custInvoice) linkedInvoiceId = custInvoice.id;
      }
      if (linkedInvoiceId) {
        targetRefType = "SalesInvoice";
        targetRefId = linkedInvoiceId;
      }
    } else if (payment) {
      receiptObj = payment;
      let linkedInvoiceId = payment.invoice_id;
      if (!linkedInvoiceId) {
        const suppInvoice = store.purchaseInvoices.find(i => i.supplier_id === payment.supplier_id);
        if (suppInvoice) linkedInvoiceId = suppInvoice.id;
      }
      if (linkedInvoiceId) {
        targetRefType = "PurchaseInvoice";
        targetRefId = linkedInvoiceId;
      }
    }
  }

  if (targetRefType === "SalesInvoice") {
    const inv = store.invoices.find(i => i.id === targetRefId || i.invoice_number === targetRefId);
    if (!inv) return null;
    
    const customer = store.customers.find(c => c.id === inv.customer_id);
    const items = store.invoiceItems.filter(i => i.sales_invoice_id === inv.id);
    
    const paidAmount = store.getInvoiceTotalPaid(inv.id);
    const remainingAmount = Math.max(0, inv.grand_total - paidAmount);
    
    let actualPaymentStatus = inv.payment_status;
    if (remainingAmount <= 0) actualPaymentStatus = "Paid";
    else if (paidAmount > 0) actualPaymentStatus = "Partial";
    else actualPaymentStatus = "Unpaid";

    const METHOD_LABELS: Record<string, string> = { Cash: "نقداً", Card: "بطاقة", Bank: "تحويل", Credit: "آجل", Multi: "متعدد" };
    const rawMethod = inv.payment_method || "Credit";
    const methodStr = isRTL ? (METHOD_LABELS[rawMethod] || rawMethod) : rawMethod;
    
    return generateReceiptHTML({
      businessName,
      businessPhone: MOCK_BUSINESS.primary_phone ?? "",
      businessAddress: "صنعاء، اليمن",
      invoiceNumber: inv.invoice_number,
      invoiceDate: new Date(inv.invoice_date).toLocaleDateString(isRTL ? "ar-YE" : "en-US"),
      customerName: customer?.customer_name ?? (isRTL ? "عميل نقدي" : "Cash Customer"),
      items: items.map(i => ({
        name: i.product_unit?.product?.name || (isRTL ? "منتج مباع" : "Sold Item"), 
        qty: i.quantity,
        unitPrice: i.unit_price,
        discount: i.discount,
        tax: i.tax,
        total: i.line_total
      })),
      subtotal: inv.sub_total,
      discountAmount: inv.discount_total > 0 ? inv.discount_total : undefined,
      taxAmount: inv.tax_total > 0 ? inv.tax_total : undefined,
      grandTotal: inv.grand_total,
      baseGrandTotal: inv.base_grand_total,
      baseCurrency: baseSym,
      currency: baseSym,
      paymentMethod: methodStr,
      paymentStatus: actualPaymentStatus,
      paidAmount: paidAmount,
      remainingAmount: remainingAmount,
      notes: inv.notes || undefined,
      isRTL,
      appName: isRTL ? "تاجر" : "Tajir",
      documentTitle: isRTL ? "فاتورة مبيعات" : "Sales Invoice",
      entityLabel: isRTL ? "اسم العميل:" : "Customer Name:"
    });
  }
  
  if (targetRefType === "PurchaseInvoice") {
    const inv = store.purchaseInvoices.find(i => i.id === targetRefId || i.invoice_number === targetRefId);
    if (!inv) return null;
    
    const supplier = store.suppliers.find(s => s.id === inv.supplier_id);
    const items = store.purchaseItems.filter(i => i.purchase_invoice_id === inv.id);
    const status = store.getPurchaseInvoiceStatus(inv.id);
    
    const METHOD_LABELS: Record<string, string> = { Cash: "نقداً", Card: "بطاقة", Bank: "تحويل", Credit: "آجل", Multi: "متعدد" };
    // We try to guess the method from store.payments if there is a payment, otherwise "Credit" or "Cash"
    const payments = store.payments?.filter(p => p.invoice_id === inv.id) || [];
    let rawMethod = "Credit";
    if (payments.length === 1) rawMethod = payments[0].method;
    else if (payments.length > 1) rawMethod = "Multi";
    else if (status.paymentStatus === "Paid") rawMethod = "Cash";
    const methodStr = isRTL ? (METHOD_LABELS[rawMethod] || rawMethod) : rawMethod;

    return generateReceiptHTML({
      businessName,
      businessPhone: MOCK_BUSINESS.primary_phone ?? "",
      businessAddress: "صنعاء، اليمن",
      invoiceNumber: inv.invoice_number,
      invoiceDate: new Date(inv.purchase_date).toLocaleDateString(isRTL ? "ar-YE" : "en-US"),
      customerName: supplier?.supplier_name ?? (isRTL ? "مورد نقدي" : "Cash Supplier"),
      items: items.map(i => {
        let name = (i as any).product_name;
        if (!name && (i as any).product_id) {
          const p = MOCK_PRODUCTS.find(p => p.id === (i as any).product_id);
          if (p) name = p.name;
        }
        if (!name && i.product_unit_id) {
          const pu = MOCK_PRODUCT_UNITS.find(u => u.id === i.product_unit_id);
          if (pu) {
            const p = MOCK_PRODUCTS.find(p => p.id === pu.product_id);
            if (p) name = p.name;
          }
        }
        return {
          name: name || (isRTL ? "مادة مشتراة" : "Purchased Item"), 
          qty: i.quantity,
          unitPrice: i.unit_price,
          discount: i.discount || 0,
          tax: i.tax || 0,
          total: (i as any).total_price || i.line_total
        };
      }),
      subtotal: inv.sub_total,
      discountAmount: inv.discount_total > 0 ? inv.discount_total : undefined,
      taxAmount: inv.tax_total > 0 ? inv.tax_total : undefined,
      grandTotal: inv.grand_total,
      baseGrandTotal: inv.base_grand_total,
      baseCurrency: baseSym,
      currency: baseSym,
      paymentMethod: methodStr,
      paymentStatus: status.paymentStatus,
      paidAmount: status.totalPaid,
      remainingAmount: status.remaining,
      notes: inv.notes || undefined,
      isRTL,
      appName: isRTL ? "تاجر" : "Tajir",
      documentTitle: isRTL ? "فاتورة مشتريات" : "Purchase Invoice",
      entityLabel: isRTL ? "اسم المورد:" : "Supplier Name:"
    });
  }
  
  if (targetRefType === "Payment") {
    // If we reach here, it's a standalone voucher not tied to a specific invoice
    if (receiptObj) {
      const isSupplierPayment = "supplier_id" in receiptObj;
      const entity = isSupplierPayment
        ? store.suppliers.find(s => s.id === receiptObj.supplier_id)
        : store.customers.find(c => c.id === receiptObj.customer_id);
      
      const METHOD_LABELS: Record<string, string> = { Cash: "نقداً", Card: "بطاقة", Bank: "تحويل", Credit: "آجل", Multi: "متعدد" };
      const rawMethod = receiptObj.method || "Cash";
      const methodStr = isRTL ? (METHOD_LABELS[rawMethod] || rawMethod) : rawMethod;

      return generateVoucherHTML({
        businessName,
        businessPhone: MOCK_BUSINESS.primary_phone ?? "",
        businessAddress: "صنعاء، اليمن",
        
        voucherType: isSupplierPayment ? "expense" : "income",
        voucherNumber: receiptObj.id.startsWith("rec_") ? receiptObj.id.replace("rec_", "RV-") : receiptObj.id.replace("pv_", "PV-"),
        voucherDate: new Date(receiptObj.date).toLocaleDateString(isRTL ? "ar-YE" : "en-US"),
        voucherTime: new Date(receiptObj.date).toLocaleTimeString(isRTL ? "ar-YE" : "en-US", { hour: '2-digit', minute: '2-digit' }),
        status: isRTL ? "معتمد" : "Approved",
        
        entityType: isSupplierPayment ? (isRTL ? "مورد" : "Supplier") : (isRTL ? "عميل" : "Customer"),
        entityName: (entity as any)?.customer_name || (entity as any)?.supplier_name || (isRTL ? "جهة عامة" : "General Entity"),
        entityPhone: (entity as any)?.phone || "",
        reference: receiptObj.ref || "",
        
        amount: receiptObj.amount,
        currency: baseSym,
        baseAmount: receiptObj.base_amount || receiptObj.amount,
        baseCurrency: baseSym,
        paymentMethod: methodStr,
        category: isSupplierPayment ? (isRTL ? "دفع موردين" : "Supplier Payment") : (isRTL ? "مقبوضات عملاء" : "Customer Receipt"),
        createdBy: "مدير النظام",
        
        notes: receiptObj.notes || "",
        isRTL,
        appName: isRTL ? "تاجر" : "Tajir"
      });
    }
  }
  
  return null;
}

const REF_CONFIG: Record<string, { color: string; bg: string; label_ar: string; label_en: string; icon: any }> = {
  SalesInvoice:    { color: "#3B82F6", bg: "rgba(59,130,246,0.12)",  label_ar: "فاتورة مبيعات",   label_en: "Sales Invoice",    icon: ShoppingCart    },
  SalesReturn:     { color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  label_ar: "مرتجع مبيعات",   label_en: "Sales Return",     icon: RotateCcw       },
  PurchaseInvoice: { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  label_ar: "فاتورة مشتريات", label_en: "Purchase Invoice", icon: Package         },
  PurchaseReturn:  { color: "#EF4444", bg: "rgba(239,68,68,0.12)",   label_ar: "مرتجع مشتريات", label_en: "Purchase Return",  icon: RotateCcw       },
  Payment:         { color: "#10B981", bg: "rgba(16,185,129,0.12)",  label_ar: "سند مالي",        label_en: "Voucher",          icon: ArrowUpRight    },
  Expense:         { color: "#EF4444", bg: "rgba(239,68,68,0.12)",   label_ar: "مصروف",           label_en: "Expense",          icon: ArrowDownRight  },
  Manual:          { color: "#64748B", bg: "rgba(100,116,139,0.12)", label_ar: "قيد يدوي",        label_en: "Manual Entry",     icon: FileText        },
  Income:          { color: "#10B981", bg: "rgba(16,185,129,0.12)",  label_ar: "إيراد",           label_en: "Income",           icon: ArrowUpRight    },
};

function getAccountName(id: string): string {
  return MOCK_CHART_OF_ACCOUNTS.find(a => a.id === id)?.account_name ?? id;
}

function buildJournalHTML(entry: any, entryLines: any[], isRTL: boolean, businessName: string, baseSym: string): string {
  const cfg = REF_CONFIG[entry.reference_type || "Manual"] || REF_CONFIG.Manual;
  const totalDebit  = entryLines.reduce((s, l) => s + (l.base_debit_amount  || l.debit_amount  || 0), 0);
  const totalCredit = entryLines.reduce((s, l) => s + (l.base_credit_amount || l.credit_amount || 0), 0);
  const balanced    = Math.abs(totalDebit - totalCredit) < 0.01;

  const dir = isRTL ? "rtl" : "ltr";
  const alignStart = isRTL ? "right" : "left";
  const alignEnd   = isRTL ? "left" : "right";
  
  const date = new Date(entry.journal_date || Date.now()).toLocaleDateString(isRTL ? "ar-YE" : "en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
  const time = new Date(entry.created_at || Date.now()).toLocaleTimeString(isRTL ? "ar-YE" : "en-US", { hour: "2-digit", minute: "2-digit" });
  
  const createdBy = entry.created_by === "usr_001" ? "محمد أحمد" : "مدير الحسابات";
  const postedBy = entry.status === "Posted" ? "مدير الحسابات" : "—";
  const postedTime = entry.status === "Posted" ? time : "—";
  
  const uniqueAccounts = new Set(entryLines.map(l => l.chart_of_account_id)).size;

  const lineRows = entryLines.map((l, idx) => {
    const dr = l.base_debit_amount  || l.debit_amount  || 0;
    const cr = l.base_credit_amount || l.credit_amount || 0;
    return `
      <tr>
        <td>${idx + 1}</td>
        <td class="text-start" style="font-weight:700;">${l.chart_of_account_id.substring(0, 8).toUpperCase()}</td>
        <td class="text-start" style="font-weight:700;">${getAccountName(l.chart_of_account_id)}</td>
        <td class="text-start" style="color:#475569;">${l.description || "—"}</td>
        <td style="font-weight:700; color:${dr > 0 ? '#16A34A' : '#94A3B8'};">${dr > 0 ? dr.toLocaleString() : "—"}</td>
        <td style="font-weight:700; color:${cr > 0 ? '#DC2626' : '#94A3B8'};">${cr > 0 ? cr.toLocaleString() : "—"}</td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${isRTL ? "ar" : "en"}">
<head>
  <meta charset="UTF-8"/>
  <title>${isRTL ? "تفاصيل القيد المحاسبي" : "Journal Entry"} - ${entry.journal_number}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
    
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Cairo', sans-serif;
      direction: ${dir};
      color: #0F172A;
      background: #fff;
      font-size: 11px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    /* Hide scrollbar for iframe but allow scrolling */
    html, body { -ms-overflow-style: none; scrollbar-width: none; }
    ::-webkit-scrollbar { display: none; }
    
    .invoice-container { max-width: 100%; margin: 0 auto; padding: 24px; }
    
    /* ── Header ── */
    .header-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; border-bottom: 2px solid #1E3A8A; padding-bottom: 12px; margin-bottom: 16px; }
    .company-details { text-align: ${alignStart}; }
    .company-name { font-size: 18px; font-weight: 900; color: #1E3A8A; margin-bottom: 4px; }
    
    .invoice-title-container { text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; }
    .invoice-title { font-size: 20px; font-weight: 900; color: #1E3A8A; letter-spacing: -0.5px; border: 2px solid #1E3A8A; padding: 4px 16px; border-radius: 6px; display: inline-block; }
    .invoice-status { margin-top: 6px; font-size: 12px; font-weight: 800; color: #16A34A; background: #DCFCE7; padding: 2px 12px; border-radius: 12px; }
    
    .invoice-meta { text-align: ${alignEnd}; }
    .meta-table { width: 100%; border-collapse: collapse; }
    .meta-table td { padding: 3px 0; font-size: 11px; }
    .meta-label { font-weight: 700; color: #64748B; width: 45%; text-align: ${alignStart}; }
    .meta-value { font-weight: 800; color: #0F172A; text-align: ${alignEnd}; }
    
    /* ── Section Titles ── */
    .section-title { font-size: 13px; font-weight: 900; color: #1E3A8A; border-bottom: 1px solid #CBD5E1; padding-bottom: 4px; margin-bottom: 8px; margin-top: 16px; text-transform: uppercase; }
    
    /* ── Info Grids ── */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .info-box { border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px; background: #F8FAFC; }
    .info-row { display: flex; margin-bottom: 4px; }
    .info-lbl { width: 35%; font-weight: 700; color: #64748B; font-size: 10px; }
    .info-val { width: 65%; font-weight: 700; color: #0F172A; font-size: 11px; }

    /* ── Table ── */
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #CBD5E1; }
    .items-table th { background: #1E3A8A; color: white; font-weight: 700; padding: 8px 6px; font-size: 11px; border: 1px solid #CBD5E1; text-align: center; }
    .items-table td { padding: 8px 6px; font-size: 12px; border: 1px solid #E2E8F0; text-align: center; font-weight: 600; }
    .items-table tbody tr:nth-child(even) { background: #F8FAFC; }
    .items-table .text-start { text-align: ${alignStart}; }
    .items-table .text-end { text-align: ${alignEnd}; }
    
    /* ── Summary & Notes ── */
    .totals-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; }
    .notes-box { font-size: 11px; color: #475569; border: 1px solid #E2E8F0; padding: 10px; border-radius: 6px; background: #F8FAFC; }
    .notes-box strong { color: #1E3A8A; display: block; margin-bottom: 4px; font-size: 11px; }
    
    .totals-table { width: 100%; border-collapse: collapse; border: 1px solid #E2E8F0; border-radius: 6px; overflow: hidden; }
    .totals-table td { padding: 8px 12px; border-bottom: 1px solid #E2E8F0; font-size: 12px; }
    .totals-lbl { font-weight: 700; color: #475569; text-align: ${alignStart}; background: #F8FAFC; width: 55%; }
    .totals-val { font-weight: 900; color: #0F172A; text-align: ${alignEnd}; }
    
    .grand-total-row td { background: #1E3A8A !important; color: white !important; font-size: 15px !important; font-weight: 900 !important; }
    .unbalanced-row td { background: #DC2626 !important; color: white !important; }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header-grid">
      <div class="company-details">
        <div class="company-name">${businessName}</div>
      </div>
      <div class="invoice-title-container">
        <div class="invoice-title">${isRTL ? "قيد محاسبي" : "JOURNAL ENTRY"}</div>
        <div class="invoice-status" style="background: ${entry.status === 'Posted' ? '#DCFCE7' : '#F1F5F9'}; color: ${entry.status === 'Posted' ? '#16A34A' : '#475569'};">
          ${entry.status === 'Posted' ? (isRTL ? "مُرحَّل" : "Posted") : (isRTL ? "مسودة" : "Draft")}
        </div>
      </div>
      <div class="invoice-meta">
        <table class="meta-table">
          <tr><td class="meta-label">${isRTL ? "رقم القيد:" : "Entry No:"}</td><td class="meta-value" style="direction:ltr;">${entry.journal_number}</td></tr>
          <tr><td class="meta-label">${isRTL ? "التاريخ:" : "Date:"}</td><td class="meta-value">${date}</td></tr>
          <tr><td class="meta-label">${isRTL ? "نوع المرجع:" : "Ref Type:"}</td><td class="meta-value">${isRTL ? cfg.label_ar : cfg.label_en}</td></tr>
        </table>
      </div>
    </div>

    <div class="section-title">${isRTL ? "معلومات التدقيق والعملية (Audit Information)" : "Audit & Transaction Information"}</div>
    <div class="info-grid" style="grid-template-columns: 1fr 1fr 1fr;">
      <div class="info-box">
        <div class="info-row"><div class="info-lbl">${isRTL ? "مصدر القيد:" : "Source:"}</div><div class="info-val">${isRTL ? cfg.label_ar : cfg.label_en}</div></div>
        <div class="info-row"><div class="info-lbl">${isRTL ? "رقم المرجع:" : "Reference ID:"}</div><div class="info-val" style="direction:ltr; text-align:${alignStart};">${entry.reference_id || "---"}</div></div>
        <div class="info-row"><div class="info-lbl">${isRTL ? "الفرع/الشركة:" : "Branch:"}</div><div class="info-val">${businessName}</div></div>
        <div class="info-row"><div class="info-lbl">${isRTL ? "نوع العملة:" : "Currency:"}</div><div class="info-val">${baseSym}</div></div>
      </div>
      <div class="info-box">
        <div class="info-row"><div class="info-lbl">${isRTL ? "أنشئ بواسطة:" : "Created By:"}</div><div class="info-val">${createdBy}</div></div>
        <div class="info-row"><div class="info-lbl">${isRTL ? "تاريخ الإنشاء:" : "Created Date:"}</div><div class="info-val">${date}</div></div>
        <div class="info-row"><div class="info-lbl">${isRTL ? "وقت الإنشاء:" : "Created Time:"}</div><div class="info-val" style="direction:ltr; text-align:${alignStart};">${time}</div></div>
        <div class="info-row"><div class="info-lbl">${isRTL ? "آخر تعديل:" : "Last Modified:"}</div><div class="info-val" style="direction:ltr; text-align:${alignStart};">${new Date(entry.updated_at || Date.now()).toLocaleString(isRTL ? "ar-YE" : "en-US")}</div></div>
      </div>
      <div class="info-box">
        <div class="info-row"><div class="info-lbl">${isRTL ? "تم الترحيل بواسطة:" : "Posted By:"}</div><div class="info-val">${postedBy}</div></div>
        <div class="info-row"><div class="info-lbl">${isRTL ? "وقت الترحيل:" : "Posted Time:"}</div><div class="info-val" style="direction:ltr; text-align:${alignStart};">${postedTime}</div></div>
        <div class="info-row"><div class="info-lbl">${isRTL ? "حالة التوازن:" : "Balance Status:"}</div><div class="info-val" style="color: ${balanced ? '#16A34A' : '#DC2626'};">${balanced ? (isRTL ? "متوازن ✅" : "Balanced ✅") : (isRTL ? "غير متوازن ⚠️" : "Unbalanced ⚠️")}</div></div>
        <div class="info-row"><div class="info-lbl">${isRTL ? "إجمالي الأسطر:" : "Total Lines:"}</div><div class="info-val">${entryLines.length}</div></div>
      </div>
    </div>

    <div class="section-title">${isRTL ? "تفاصيل الأسطر (المدين والدائن)" : "Entry Lines (Debit & Credit)"}</div>
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 5%;">#</th>
          <th class="text-start" style="width: 15%;">${isRTL ? "رمز الحساب" : "Account Code"}</th>
          <th class="text-start" style="width: 25%;">${isRTL ? "اسم الحساب" : "Account Name"}</th>
          <th class="text-start" style="width: 25%;">${isRTL ? "البيان" : "Description"}</th>
          <th style="width: 15%;">${isRTL ? `مدين (${baseSym})` : `Debit (${baseSym})`}</th>
          <th style="width: 15%;">${isRTL ? `دائن (${baseSym})` : `Credit (${baseSym})`}</th>
        </tr>
      </thead>
      <tbody>
        ${lineRows}
      </tbody>
    </table>

    <div class="totals-grid">
      <div class="notes-box">
        <strong>${isRTL ? "إحصائيات إضافية:" : "Additional Stats:"}</strong>
        <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
          <span>${isRTL ? "عدد الحسابات المستخدمة:" : "Accounts Used:"} <b>${uniqueAccounts} ${isRTL ? "حسابات" : "accounts"}</b></span>
          <span>${isRTL ? "نوع العملية:" : "Operation Type:"} <b>${isRTL ? cfg.label_ar : cfg.label_en}</b></span>
        </div>
        <strong>${isRTL ? "ملاحظات القيد والبيان العام:" : "Journal Notes & Description:"}</strong>
        ${entry.notes || (isRTL ? "لا توجد ملاحظات إضافية." : "No additional notes.")}
      </div>
      <div>
        <table class="totals-table">
          <tr><td class="totals-lbl">${isRTL ? "إجمالي المدين:" : "Total Debit:"}</td><td class="totals-val" style="color:#16A34A;">${totalDebit.toLocaleString()}</td></tr>
          <tr><td class="totals-lbl">${isRTL ? "إجمالي الدائن:" : "Total Credit:"}</td><td class="totals-val" style="color:#DC2626;">${totalCredit.toLocaleString()}</td></tr>
          <tr class="${balanced ? 'grand-total-row' : 'grand-total-row unbalanced-row'}">
            <td class="totals-lbl" style="background:transparent;">${isRTL ? "الفرق:" : "Difference:"}</td>
            <td class="totals-val" style="background:transparent;">${Math.abs(totalDebit - totalCredit).toLocaleString()} ${baseSym}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function JournalEntryDetailView({ entry, lines, onClose }: Props) {
  const { isDark, isRTL, ds } = useApp();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  
  const [previewMode, setPreviewMode] = useState<"journal" | "document">("journal");

  const entryLines = lines.filter(l => l.journal_entry_id === entry.id);
  const totalDebit  = entryLines.reduce((s, l) => s + (l.base_debit_amount  || l.debit_amount  || 0), 0);
  const totalCredit = entryLines.reduce((s, l) => s + (l.base_credit_amount || l.credit_amount || 0), 0);
  const balanced    = Math.abs(totalDebit - totalCredit) < 0.01;

  const cfg     = REF_CONFIG[entry.reference_type || "Manual"] || REF_CONFIG.Manual;
  const Icon    = cfg.icon;
  const baseSym = MOCK_CURRENCIES.find(c => c.is_base_currency)?.currency_symbol ?? "ر.ي";
  const businessName = MOCK_BUSINESS.business_name;

  const store = useFinancialStore();

  const journalHtmlContent = buildJournalHTML(entry, entryLines, isRTL, businessName, baseSym);
  
  const originalDocHtml = useMemo(() => getOriginalDocumentHTML(entry, isRTL, businessName, baseSym, store), [entry, isRTL, businessName, baseSym, store]);
  const hasOriginalDoc = !!originalDocHtml;

  const htmlContent = previewMode === "document" && hasOriginalDoc ? originalDocHtml : journalHtmlContent;

  function handlePrint() {
    const w = window.open("", "", "width=900,height=700");
    if (!w) return;
    w.document.write(htmlContent);
    w.document.close();
    setTimeout(() => w.print(), 400);
  }

  function handleShare() {
    const lines_text = entryLines.map(l => {
      const dr = l.base_debit_amount || l.debit_amount || 0;
      const cr = l.base_credit_amount || l.credit_amount || 0;
      const acc = getAccountName(l.chart_of_account_id);
      return dr > 0 ? `  د/ ${acc}: ${dr.toLocaleString()} ${baseSym}` : `  ك/ ${acc}: ${cr.toLocaleString()} ${baseSym}`;
    }).join("\n");

    const text = `📋 ${isRTL ? "قيد محاسبي" : "Journal Entry"}: ${entry.journal_number}\n` +
      `📅 ${new Date(entry.journal_date || Date.now()).toLocaleDateString()}\n` +
      `🏷 ${isRTL ? cfg.label_ar : cfg.label_en}\n\n` +
      `${lines_text}\n\n` +
      `💰 ${isRTL ? "المدين" : "Debit"}: ${totalDebit.toLocaleString()} ${baseSym}\n` +
      `💰 ${isRTL ? "الدائن" : "Credit"}: ${totalCredit.toLocaleString()} ${baseSym}\n` +
      `${balanced ? "✅ " + (isRTL ? "متوازن" : "Balanced") : "⚠️ " + (isRTL ? "غير متوازن" : "Unbalanced")}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        style={{ position: "relative", width: "100%", maxWidth: 800, maxHeight: "90vh", background: isDark ? ds.surface : "#F8FAFC", borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
      >
        {/* Modal Header */}
        <div style={{ background: "linear-gradient(135deg, #1D4ED8, #2563EB)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600, margin: "0 0 4px 0" }}>
              {isRTL ? "تفاصيل القيد المحاسبي" : "Journal Entry Details"}
            </p>
            <h2 style={{ color: "white", fontSize: 20, fontWeight: 800, margin: 0, direction: "ltr" }}>{entry.journal_number}</h2>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {hasOriginalDoc && (
              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 12, display: "flex", padding: 4, marginRight: 16 }}>
                <button
                  onClick={() => setPreviewMode("journal")}
                  style={{ background: previewMode === "journal" ? "white" : "transparent", color: previewMode === "journal" ? "#1D4ED8" : "white", border: "none", padding: "10px 20px", borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}
                >
                  {isRTL ? "عرض القيد" : "Journal"}
                </button>
                <button
                  onClick={() => setPreviewMode("document")}
                  style={{ background: previewMode === "document" ? "white" : "transparent", color: previewMode === "document" ? "#1D4ED8" : "white", border: "none", padding: "10px 20px", borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}
                >
                  {isRTL ? "الفاتورة الأصلية" : "Original Doc"}
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.2)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
              onMouseOut={e  => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            >
              <X size={24} color="white" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", alignItems: "center", scrollbarWidth: "none" }}>
          <style>{`.je-scroll::-webkit-scrollbar{display:none}`}</style>

          {/* Action Buttons — same pattern as InvoiceDetailScreen */}
          <div style={{ display: "flex", gap: 12, width: "100%", marginBottom: 24 }}>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handlePrint}
              style={{ flex: 1, height: 60, background: isDark ? ds.surface2 : "#FFFFFF", border: `1.5px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 14, color: ds.textPrimary, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}
            >
              <Printer size={22} color="#3B82F6" /> 
              {previewMode === "document" ? (isRTL ? "طباعة الفاتورة" : "Print Invoice") : (isRTL ? "طباعة القيد" : "Print Entry")}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleShare}
              style={{ flex: 1, height: 60, background: "#25D366", border: "none", borderRadius: 14, color: "white", fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 6px 20px rgba(37,211,102,0.3)" }}
            >
              <Share2 size={22} color="white" /> {isRTL ? "مشاركة واتساب" : "Share WhatsApp"}
            </motion.button>
          </div>

          {/* Preview iframe — same as InvoiceDetailScreen */}
          <div style={{ width: "100%", background: isDark ? "#0F172A" : "#E2E8F0", padding: 12, borderRadius: 16, display: "flex", justifyContent: "center", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)" }}>
            <iframe
              srcDoc={htmlContent}
              style={{ width: "100%", height: "55vh", background: "white", border: "none", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            />
          </div>

          {/* Quick stats below iframe */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, width: "100%", marginTop: 20 }}>
            {[
              { label: isRTL ? "نوع العملية" : "Type", value: isRTL ? cfg.label_ar : cfg.label_en, color: cfg.color },
              { label: isRTL ? "عدد الأسطر" : "Lines", value: `${entryLines.length} ${isRTL ? "سطر" : "lines"}`, color: "#3B82F6" },
              { label: isRTL ? "التوازن" : "Balance", value: balanced ? (isRTL ? "✅ متوازن" : "✅ Balanced") : (isRTL ? "⚠️ خلل" : "⚠️ Off"), color: balanced ? "#10B981" : "#EF4444" },
            ].map(s => (
              <div key={s.label} style={{ background: isDark ? ds.surface2 : "#FFFFFF", border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: ds.textMuted, fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
