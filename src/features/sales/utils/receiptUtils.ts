/**
 * Shared receipt HTML generator for print windows.
 * Produces a professional, clearly formatted invoice/receipt.
 */
export interface ReceiptData {
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  businessTaxId?: string;
  businessCR?: string;
  branchName?: string;
  
  invoiceNumber: string;
  invoiceDate: string;
  invoiceTime?: string;
  invoiceStatus?: string;
  
  customerName: string;
  customerPhone?: string;
  customerTaxId?: string;
  customerAddress?: string;
  customerCode?: string;
  salesRep?: string;
  
  items: {
    name: string;
    sku?: string;
    unit?: string;
    qty: number;
    unitPrice: number;
    discountPercent?: number;
    discount?: number;
    tax?: number;
    totalBeforeTax?: number;
    total: number;
  }[];
  
  subtotal: number;
  discountAmount?: number;
  taxAmount?: number;
  shippingCost?: number;
  grandTotal: number;
  baseGrandTotal?: number;
  baseCurrency?: string;
  
  paidAmount?: number;
  remainingAmount?: number;
  paymentStatus?: string;
  
  currency: string;
  paymentMethod: string;
  transactionNo?: string;
  bankName?: string;
  dueDate?: string;
  
  notes?: string;
  termsAndConditions?: string;
  returnPolicy?: string;
  
  printedBy?: string;
  isRTL: boolean;
  appName: string;
  autoPrint?: boolean;
  
  // Overrides for non-sales documents
  documentTitle?: string;
  entityLabel?: string;
  entityInfoTitle?: string;
}

export function generateReceiptHTML(data: ReceiptData): string {
  const { isRTL, currency } = data;
  const dir = isRTL ? "rtl" : "ltr";
  const alignEnd = isRTL ? "left" : "right";
  const alignStart = isRTL ? "right" : "left";

  const fallbackDate = new Date().toLocaleDateString(isRTL ? 'ar-YE' : 'en-US');
  const fallbackTime = new Date().toLocaleTimeString(isRTL ? 'ar-YE' : 'en-US');

  // Build Items Rows
  const itemRows = data.items.map((item, index) => {
    const sku = item.sku ? item.sku : "---";
    const unit = item.unit ? item.unit : "---";
    const discount = item.discount ? item.discount.toLocaleString() : "0";
    const tax = item.tax ? item.tax.toLocaleString() : "0";
    const totalBefore = item.totalBeforeTax ? item.totalBeforeTax.toLocaleString() : (item.qty * item.unitPrice).toLocaleString();
    
    return `
      <tr>
        <td>${index + 1}</td>
        <td class="text-start" style="font-weight:700;">${item.name}</td>
        <td>${sku}</td>
        <td>${unit}</td>
        <td style="font-weight:700;">${item.qty}</td>
        <td>${item.unitPrice.toLocaleString()}</td>
        <td>${discount}</td>
        <td>${tax}</td>
        <td>${totalBefore}</td>
        <td class="text-end" style="font-weight:800; color:#1E3A8A;">${item.total.toLocaleString()}</td>
      </tr>
    `;
  }).join("");

  const totalQty = data.items.reduce((sum, item) => sum + item.qty, 0);

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${isRTL ? "ar" : "en"}">
<head>
  <meta charset="UTF-8" />
  <title>${data.documentTitle || (isRTL ? "فاتورة مبيعات ضريبية" : "Tax Sales Invoice")} - ${data.invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
    
    @page {
      size: A4;
      margin: 10mm;
    }
    
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
    .header-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr 1fr; 
      border-bottom: 2px solid #1E3A8A; 
      padding-bottom: 12px; 
      margin-bottom: 16px; 
    }
    .company-details { text-align: ${alignStart}; }
    .company-name { font-size: 18px; font-weight: 900; color: #1E3A8A; margin-bottom: 4px; }
    .company-info-line { font-size: 11px; color: #475569; margin-bottom: 2px; }
    
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
    .info-row:last-child { margin-bottom: 0; }
    .info-lbl { width: 35%; font-weight: 700; color: #64748B; font-size: 10px; }
    .info-val { width: 65%; font-weight: 700; color: #0F172A; font-size: 11px; }

    /* ── Table ── */
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #CBD5E1; }
    .items-table th { background: #1E3A8A; color: white; font-weight: 700; padding: 8px 6px; font-size: 10px; border: 1px solid #CBD5E1; text-align: center; }
    .items-table td { padding: 8px 6px; font-size: 11px; border: 1px solid #E2E8F0; text-align: center; }
    .items-table tbody tr:nth-child(even) { background: #F8FAFC; }
    .items-table .text-start { text-align: ${alignStart}; }
    .items-table .text-end { text-align: ${alignEnd}; }
    
    /* ── Summary & Notes ── */
    .summary-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; page-break-inside: avoid; }
    .notes-box { font-size: 10px; color: #475569; border: 1px solid #E2E8F0; padding: 10px; border-radius: 6px; background: #F8FAFC; }
    .notes-box strong { color: #1E3A8A; display: block; margin-bottom: 4px; font-size: 11px; }
    
    .totals-table { width: 100%; border-collapse: collapse; border: 1px solid #E2E8F0; border-radius: 6px; overflow: hidden; }
    .totals-table td { padding: 6px 12px; border-bottom: 1px solid #E2E8F0; font-size: 11px; }
    .totals-lbl { font-weight: 700; color: #475569; text-align: ${alignStart}; background: #F8FAFC; width: 55%; }
    .totals-val { font-weight: 800; color: #0F172A; text-align: ${alignEnd}; }
    
    .grand-total-row td { background: #1E3A8A !important; color: white !important; font-size: 14px !important; font-weight: 900 !important; }
    
    /* ── Signatures ── */
    .signatures-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 32px; margin-bottom: 24px; page-break-inside: avoid; }
    .sig-box { text-align: center; }
    .sig-line { border-bottom: 1px dashed #94A3B8; margin-top: 30px; margin-bottom: 8px; height: 1px; width: 80%; margin-left: auto; margin-right: auto; }
    .sig-title { font-weight: 700; font-size: 11px; color: #475569; }
    
    /* ── Footer ── */
    .footer { border-top: 1px solid #E2E8F0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 9px; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="invoice-container">
    
    <!-- Header -->
    <div class="header-grid">
      <div class="company-details">
        <div class="company-name">${data.businessName}</div>
        ${data.businessPhone ? `<div class="company-info-line">هاتف: ${data.businessPhone}</div>` : ''}
        ${data.businessAddress ? `<div class="company-info-line">العنوان: ${data.businessAddress}</div>` : ''}
        ${data.businessTaxId ? `<div class="company-info-line">الرقم الضريبي: ${data.businessTaxId}</div>` : ''}
        ${data.businessCR ? `<div class="company-info-line">السجل التجاري: ${data.businessCR}</div>` : ''}
      </div>
      
      <div class="invoice-title-container">
        <div class="invoice-title">${data.documentTitle || (isRTL ? "فاتورة مبيعات" : "SALES INVOICE")}</div>
        <div class="invoice-status" style="background: ${data.paymentStatus === 'Unpaid' ? '#FEE2E2' : '#DCFCE7'}; color: ${data.paymentStatus === 'Unpaid' ? '#DC2626' : '#16A34A'};">
          ${data.paymentStatus === 'Paid' ? (isRTL ? 'مدفوعة' : 'Paid') : (data.paymentStatus === 'Unpaid' ? (isRTL ? 'غير مدفوعة / آجلة' : 'Unpaid') : (isRTL ? 'مدفوعة جزئياً' : 'Partial'))}
        </div>
      </div>
      
      <div class="invoice-meta">
        <table class="meta-table">
          <tr><td class="meta-label">${isRTL ? "رقم الفاتورة:" : "Invoice No:"}</td><td class="meta-value">${data.invoiceNumber}</td></tr>
          <tr><td class="meta-label">${isRTL ? "تاريخ الإصدار:" : "Date:"}</td><td class="meta-value">${data.invoiceDate || fallbackDate}</td></tr>
          <tr><td class="meta-label">${isRTL ? "وقت الإصدار:" : "Time:"}</td><td class="meta-value">${data.invoiceTime || fallbackTime}</td></tr>
          ${data.branchName ? `<tr><td class="meta-label">${isRTL ? "الفرع:" : "Branch:"}</td><td class="meta-value">${data.branchName}</td></tr>` : ''}
        </table>
      </div>
    </div>

    <!-- Customer/Supplier & Payment Info -->
    <div class="section-title">${data.entityInfoTitle || (isRTL ? "معلومات الفاتورة والعميل" : "Invoice & Customer Information")}</div>
    <div class="info-grid">
      <!-- Entity Info -->
      <div class="info-box">
        <div class="info-row"><div class="info-lbl">${data.entityLabel || (isRTL ? "اسم العميل:" : "Customer Name:")}</div><div class="info-val">${data.customerName}</div></div>
        ${data.customerCode ? `<div class="info-row"><div class="info-lbl">${isRTL ? "رقم الحساب:" : "Account No:"}</div><div class="info-val">${data.customerCode}</div></div>` : ''}
        ${data.customerPhone ? `<div class="info-row"><div class="info-lbl">${isRTL ? "رقم الهاتف:" : "Phone:"}</div><div class="info-val">${data.customerPhone}</div></div>` : ''}
        ${data.customerTaxId ? `<div class="info-row"><div class="info-lbl">${isRTL ? "الرقم الضريبي:" : "Tax ID:"}</div><div class="info-val">${data.customerTaxId}</div></div>` : ''}
        ${data.customerAddress ? `<div class="info-row"><div class="info-lbl">${isRTL ? "العنوان:" : "Address:"}</div><div class="info-val">${data.customerAddress}</div></div>` : ''}
      </div>
      
      <!-- Payment Info -->
      <div class="info-box">
        <div class="info-row"><div class="info-lbl">${isRTL ? "طريقة الدفع:" : "Payment Method:"}</div><div class="info-val">${data.paymentMethod}</div></div>
        ${data.bankName ? `<div class="info-row"><div class="info-lbl">${isRTL ? "البنك/الصندوق:" : "Bank/Cash:"}</div><div class="info-val">${data.bankName}</div></div>` : ''}
        ${data.transactionNo ? `<div class="info-row"><div class="info-lbl">${isRTL ? "رقم المرجع:" : "Ref No:"}</div><div class="info-val">${data.transactionNo}</div></div>` : ''}
        ${data.dueDate ? `<div class="info-row"><div class="info-lbl">${isRTL ? "تاريخ الاستحقاق:" : "Due Date:"}</div><div class="info-val">${data.dueDate}</div></div>` : ''}
        ${data.salesRep ? `<div class="info-row"><div class="info-lbl">${isRTL ? "البائع/المندوب:" : "Sales Rep:"}</div><div class="info-val">${data.salesRep}</div></div>` : ''}
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 5%;">${isRTL ? "رقم" : "#"}</th>
          <th class="text-start" style="width: 25%;">${isRTL ? "وصف المنتج" : "Description"}</th>
          <th style="width: 10%;">${isRTL ? "الباركود/SKU" : "SKU"}</th>
          <th style="width: 8%;">${isRTL ? "الوحدة" : "Unit"}</th>
          <th style="width: 8%;">${isRTL ? "الكمية" : "Qty"}</th>
          <th style="width: 10%;">${isRTL ? "سعر الوحدة" : "Unit Price"}</th>
          <th style="width: 8%;">${isRTL ? "الخصم" : "Discount"}</th>
          <th style="width: 8%;">${isRTL ? "الضريبة" : "Tax"}</th>
          <th style="width: 10%;">${isRTL ? "الإجمالي" : "Total"}</th>
          <th class="text-end" style="width: 12%;">${isRTL ? "الصافي" : "Net"}</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- Summary & Notes -->
    <div class="summary-grid">
      <div class="notes-box">
        <strong>${isRTL ? "ملاحظات الفاتورة والشروط:" : "Notes & Terms:"}</strong>
        <p style="margin-bottom: 8px;">${data.notes || (isRTL ? "لا توجد ملاحظات إضافية." : "No additional notes.")}</p>
        
        ${data.returnPolicy ? `
          <strong>${isRTL ? "سياسة الاسترجاع والاستبدال:" : "Return Policy:"}</strong>
          <p>${data.returnPolicy}</p>
        ` : ''}
      </div>
      
      <div>
        <table class="totals-table">
          <tr><td class="totals-lbl">${isRTL ? "إجمالي المنتجات:" : "Total Items:"}</td><td class="totals-val">${data.items.length} (${totalQty} ${isRTL ? "وحدة" : "Units"})</td></tr>
          <tr><td class="totals-lbl">${isRTL ? "المجموع الفرعي:" : "Subtotal:"}</td><td class="totals-val">${(data.subtotal || 0).toLocaleString()} ${currency}</td></tr>
          ${data.discountAmount ? `<tr><td class="totals-lbl">${isRTL ? "إجمالي الخصومات:" : "Total Discount:"}</td><td class="totals-val" style="color: #DC2626;">-${(data.discountAmount || 0).toLocaleString()} ${currency}</td></tr>` : ''}
          ${data.taxAmount ? `<tr><td class="totals-lbl">${isRTL ? "إجمالي الضرائب:" : "Total Tax:"}</td><td class="totals-val">${(data.taxAmount || 0).toLocaleString()} ${currency}</td></tr>` : ''}
          ${data.shippingCost ? `<tr><td class="totals-lbl">${isRTL ? "تكلفة الشحن:" : "Shipping:"}</td><td class="totals-val">${(data.shippingCost || 0).toLocaleString()} ${currency}</td></tr>` : ''}
          <tr class="grand-total-row">
            <td class="totals-lbl" style="background: transparent; color: white;">${isRTL ? "الإجمالي النهائي:" : "Grand Total:"}</td>
            <td class="totals-val" style="color: white;">
              ${data.grandTotal.toLocaleString()} ${currency}
              ${data.baseGrandTotal && data.baseGrandTotal !== data.grandTotal ? `<div style="font-size: 11px; color: #cbd5e1; margin-top: 4px; font-weight: normal;">${isRTL ? `المعادل: ${data.baseGrandTotal.toLocaleString()} ${data.baseCurrency} (سعر الصرف: ${data.grandTotal > 0 ? (data.baseGrandTotal / data.grandTotal).toLocaleString() : 1})` : `Eqv: ${data.baseGrandTotal.toLocaleString()} ${data.baseCurrency} (Rate: ${data.grandTotal > 0 ? (data.baseGrandTotal / data.grandTotal).toLocaleString() : 1})`}</div>` : ""}
            </td>
          </tr>
          
          ${data.paidAmount !== undefined ? `<tr><td class="totals-lbl">${isRTL ? "المبلغ المدفوع:" : "Amount Paid:"}</td><td class="totals-val" style="color: #16A34A;">${data.paidAmount.toLocaleString()} ${currency}</td></tr>` : ''}
          ${data.remainingAmount !== undefined && data.remainingAmount > 0 ? `<tr><td class="totals-lbl">${isRTL ? "المبلغ المتبقي:" : "Remaining Balance:"}</td><td class="totals-val" style="color: #DC2626;">${data.remainingAmount.toLocaleString()} ${currency}</td></tr>` : ''}
        </table>
      </div>
    </div>

    <!-- Signatures -->
    <div class="signatures-grid">
      <div class="sig-box">
        <div class="sig-title">${isRTL ? "توقيع البائع/المندوب" : "Seller Signature"}</div>
        <div class="sig-line"></div>
      </div>
      <div class="sig-box">
        <div class="sig-title">${isRTL ? "توقيع المستلم/العميل" : "Receiver Signature"}</div>
        <div class="sig-line"></div>
      </div>
      <div class="sig-box">
        <div class="sig-title">${isRTL ? "اعتماد الإدارة" : "Management Approval"}</div>
        <div class="sig-line"></div>
      </div>
      <div class="sig-box">
        <div class="sig-title">${isRTL ? "ختم الشركة" : "Company Seal"}</div>
        <div class="sig-line"></div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>${isRTL ? "تاريخ ووقت الطباعة:" : "Printed On:"} ${fallbackDate} ${fallbackTime}</div>
      <div>${isRTL ? "طبع بواسطة:" : "Printed By:"} ${data.printedBy || (isRTL ? 'مستخدم النظام' : 'System User')}</div>
      <div>${isRTL ? "نسخة أصلية" : "Original Document"}</div>
      <div>${isRTL ? "تم الإصدار إلكترونياً بواسطة" : "Electronically Generated by"} <strong>${data.appName}</strong></div>
    </div>

  </div>
  ${data.autoPrint ? `
  <script>
    window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 300); }
  </script>
  ` : ''}
</body>
</html>`;
}

export function buildReceiptMessage(data: ReceiptData): string {
  const { isRTL, currency } = data;
  const sep = "━━━━━━━━━━━━━━━━━━━━━";

  const itemLines = data.items.map(item => {
    const lineTotal = `${item.total.toLocaleString()} ${currency}`;
    return isRTL
      ? `• ${item.name}  ×${item.qty}  @${item.unitPrice.toLocaleString()}  =  ${lineTotal}`
      : `• ${item.name}  ×${item.qty}  @${item.unitPrice.toLocaleString()}  =  ${lineTotal}`;
  }).join("\n");

  if (isRTL) {
    return [
      `*${data.businessName}*`,
      sep,
      `*${data.documentTitle || (isRTL ? "فاتورة مبيعات رقم:" : "Invoice:")} ${data.invoiceNumber}*`,
      `${isRTL ? "التاريخ:" : "Date:"}     ${data.invoiceDate}`,
      `${data.entityLabel || (isRTL ? "العميل:" : "Customer:")} ${data.customerName}`,
      sep,
      `*${isRTL ? "تفاصيل المنتجات:" : "Items:"}*`,
      itemLines,
      sep,
      ...(data.discountAmount && data.discountAmount > 0 ? [`${isRTL ? "الخصم:" : "Discount:"} -${data.discountAmount.toLocaleString()} ${currency}`] : []),
      ...(data.taxAmount && data.taxAmount > 0 ? [`${isRTL ? "الضريبة:" : "Tax:"} ${data.taxAmount.toLocaleString()} ${currency}`] : []),
      `*${isRTL ? "الإجمالي النهائي:" : "Grand Total:"} ${data.grandTotal.toLocaleString()} ${currency}*`,
      `${isRTL ? "طريقة الدفع:" : "Payment:"} ${data.paymentMethod}`,
      ...(data.notes ? [`${isRTL ? "ملاحظات:" : "Notes:"} ${data.notes}`] : []),
      sep,
      isRTL
        ? `شكرًا لتعاملكم معنا، نرفق لكم الفاتورة عند الطلب.\n_تم الإصدار بواسطة نظام ${data.appName}_`
        : `Thank you for your business. PDF receipt available on request.\n_Issued via ${data.appName}_`,
    ].join("\n");
  } else {
    return [
      `*${data.businessName}*`,
      sep,
      `*${data.documentTitle || 'Invoice:'} ${data.invoiceNumber}*`,
      `Date:     ${data.invoiceDate}`,
      `${data.entityLabel || 'Customer:'} ${data.customerName}`,
      sep,
      `*Items:*`,
      itemLines,
      sep,
      ...(data.discountAmount && data.discountAmount > 0 ? [`Discount: -${data.discountAmount.toLocaleString()} ${currency}`] : []),
      ...(data.taxAmount && data.taxAmount > 0 ? [`Tax: ${data.taxAmount.toLocaleString()} ${currency}`] : []),
      `*Grand Total: ${data.grandTotal.toLocaleString()} ${currency}*`,
      `Payment: ${data.paymentMethod}`,
      ...(data.notes ? [`Notes: ${data.notes}`] : []),
      sep,
      `Thank you for your business. PDF receipt available on request.\n_Issued via ${data.appName}_`,
    ].join("\n");
  }
}
