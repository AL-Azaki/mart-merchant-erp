/**
 * Shared receipt HTML generator for print windows.
 * Produces a professional, clearly formatted invoice/receipt.
 */
export interface ReceiptData {
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  items: { name: string; qty: number; unitPrice: number; total: number; discount?: number }[];
  subtotal: number;
  discountAmount?: number;
  taxAmount?: number;
  grandTotal: number;
  currency: string;
  paymentMethod: string;
  notes?: string;
  isRTL: boolean;
  appName: string;
}

export function generateReceiptHTML(data: ReceiptData): string {
  const { isRTL } = data;
  const dir = isRTL ? "rtl" : "ltr";
  const alignEnd = isRTL ? "left" : "right";
  const alignStart = isRTL ? "right" : "left";

  const itemRows = data.items.map((item, i) => `
    <tr style="background: ${i % 2 === 0 ? "#FAFAFA" : "#FFFFFF"};">
      <td style="padding: 10px 12px; font-size: 13px; color: #111; border-bottom: 1px solid #EEE;">${item.name}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #111; border-bottom: 1px solid #EEE; text-align: center;">${item.qty}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #444; border-bottom: 1px solid #EEE; text-align: center;">${item.unitPrice.toLocaleString()}</td>
      <td style="padding: 10px 12px; font-size: 13px; font-weight: 700; color: #111; border-bottom: 1px solid #EEE; text-align: ${alignEnd};">${item.total.toLocaleString()}</td>
    </tr>
  `).join("");

  const totalsRows = [
    { label: isRTL ? "المجموع الفرعي" : "Subtotal", value: data.subtotal, color: "#444" },
    ...(data.discountAmount && data.discountAmount > 0 ? [{ label: isRTL ? "الخصم" : "Discount", value: -data.discountAmount, color: "#16A34A" }] : []),
    ...(data.taxAmount && data.taxAmount > 0 ? [{ label: isRTL ? "الضريبة" : "Tax", value: data.taxAmount, color: "#444" }] : []),
  ].map(row => `
    <tr>
      <td colspan="3" style="padding: 6px 12px; font-size: 13px; color: ${row.color}; text-align: ${alignEnd};">${row.label}</td>
      <td style="padding: 6px 12px; font-size: 13px; font-weight: 600; color: ${row.color}; text-align: ${alignEnd};">${row.value > 0 ? row.value.toLocaleString() : `-${Math.abs(row.value).toLocaleString()}`}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${isRTL ? "ar" : "en"}">
<head>
  <meta charset="UTF-8" />
  <title>${isRTL ? "فاتورة" : "Invoice"} - ${data.invoiceNumber}</title>
  <style>
    @page {
      size: A5;
      margin: 15mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      direction: ${dir};
      color: #111;
      background: #fff;
      font-size: 14px;
      line-height: 1.5;
    }

    /* ── Header ── */
    .inv-header {
      background: linear-gradient(135deg, #1E3A8A, #2563EB);
      color: white;
      padding: 28px 24px 24px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .inv-header h1 { font-size: 26px; font-weight: 900; margin-bottom: 6px; letter-spacing: -0.5px; }
    .inv-header p  { font-size: 12px; opacity: 0.85; }

    /* ── Meta row ── */
    .inv-meta {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-top: 3px solid #2563EB;
      padding: 16px 20px;
    }
    .inv-meta-block { display: flex; flex-direction: column; gap: 4px; }
    .inv-meta-label { font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
    .inv-meta-value { font-size: 13px; color: #111; font-weight: 700; }

    /* ── Table ── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0;
    }
    .table-wrapper {
      border: 1px solid #E2E8F0;
      border-radius: 0 0 0 0;
      overflow: hidden;
      margin-top: 0;
    }
    thead tr {
      background: #1E3A8A;
    }
    thead th {
      padding: 11px 12px;
      font-size: 12px;
      font-weight: 700;
      color: white;
      text-align: ${alignStart};
      letter-spacing: 0.3px;
    }
    thead th.center { text-align: center; }
    thead th.end    { text-align: ${alignEnd}; }

    /* ── Totals ── */
    .totals-section {
      border: 1px solid #E2E8F0;
      border-top: none;
      background: #FAFAFA;
    }
    .grand-total-row td {
      padding: 14px 12px;
      background: #1E3A8A;
      color: white;
      font-size: 16px;
      font-weight: 900;
    }

    /* ── Footer ── */
    .inv-footer {
      margin-top: 20px;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      overflow: hidden;
    }
    .inv-footer-inner {
      padding: 16px 20px;
      background: #F8FAFC;
    }
    .inv-footer-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 4px 0;
      color: #334155;
    }
    .inv-footer-row span:last-child { font-weight: 700; }
    .inv-thank {
      background: #1E3A8A;
      color: white;
      text-align: center;
      padding: 14px;
      font-size: 14px;
      font-weight: 700;
    }
    .inv-app-note {
      text-align: center;
      font-size: 11px;
      color: #94A3B8;
      padding: 10px;
      background: #F8FAFC;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="inv-header">
    <h1>${data.businessName}</h1>
    <p>${data.businessPhone} &nbsp;|&nbsp; ${data.businessAddress}</p>
  </div>

  <!-- Meta Info -->
  <div class="inv-meta">
    <div class="inv-meta-block">
      <span class="inv-meta-label">${isRTL ? "رقم الفاتورة" : "Invoice No."}</span>
      <span class="inv-meta-value" style="direction:ltr; unicode-bidi:isolate;">${data.invoiceNumber}</span>
    </div>
    <div class="inv-meta-block" style="text-align:center;">
      <span class="inv-meta-label">${isRTL ? "التاريخ والوقت" : "Date & Time"}</span>
      <span class="inv-meta-value">${data.invoiceDate}</span>
    </div>
    <div class="inv-meta-block" style="text-align:${alignEnd};">
      <span class="inv-meta-label">${isRTL ? "العميل" : "Customer"}</span>
      <span class="inv-meta-value">${data.customerName}</span>
    </div>
  </div>

  <!-- Items Table -->
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>${isRTL ? "المنتج" : "Product"}</th>
          <th class="center">${isRTL ? "الكمية" : "Qty"}</th>
          <th class="center">${isRTL ? "السعر" : "Price"}</th>
          <th class="end">${isRTL ? "الإجمالي" : "Total"}</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
  </div>

  <!-- Totals -->
  <div class="totals-section">
    <table>
      ${totalsRows}
      <tr class="grand-total-row">
        <td colspan="3" style="text-align:${alignEnd}; letter-spacing: 0.3px;">
          ${isRTL ? "الإجمالي النهائي" : "Grand Total"}
        </td>
        <td style="text-align:${alignEnd}; font-size:18px;">
          ${data.grandTotal.toLocaleString()} ${data.currency}
        </td>
      </tr>
    </table>
  </div>

  <!-- Footer -->
  <div class="inv-footer">
    <div class="inv-footer-inner">
      <div class="inv-footer-row">
        <span>${isRTL ? "طريقة الدفع" : "Payment Method"}</span>
        <span>${data.paymentMethod}</span>
      </div>
      ${data.notes ? `<div class="inv-footer-row" style="margin-top:6px; font-style:italic; color:#64748B;">
        <span>${isRTL ? "ملاحظات" : "Notes"}</span>
        <span>${data.notes}</span>
      </div>` : ""}
    </div>
    <div class="inv-thank">
      ${isRTL ? "شكرًا لتعاملكم معنا — نتمنى لكم يومًا سعيدًا" : "Thank You For Your Business — Have a Great Day!"}
    </div>
    <div class="inv-app-note">
      ${isRTL ? "تم الإصدار بواسطة نظام" : "Issued via"} <strong>${data.appName}</strong>
    </div>
  </div>

  <script>window.onload = () => { window.print(); window.close(); }</script>
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
      `*${isRTL ? "فاتورة مبيعات رقم:" : "Invoice:"} ${data.invoiceNumber}*`,
      `${isRTL ? "التاريخ:" : "Date:"}     ${data.invoiceDate}`,
      `${isRTL ? "العميل:" : "Customer:"} ${data.customerName}`,
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
      `*Invoice: ${data.invoiceNumber}*`,
      `Date:     ${data.invoiceDate}`,
      `Customer: ${data.customerName}`,
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
