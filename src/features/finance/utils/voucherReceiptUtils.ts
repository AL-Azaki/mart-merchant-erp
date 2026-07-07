/**
 * Shared HTML generator for financial vouchers (Receipt / Payment).
 * Produces a professional, A4-sized, clearly formatted official document.
 */

export interface VoucherPrintData {
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  businessEmail?: string;
  taxNumber?: string;
  crNumber?: string;
  
  voucherType: "income" | "expense";
  voucherNumber: string;
  voucherDate: string;
  voucherTime: string;
  status: string;
  
  entityType: string;
  entityName: string;
  entityPhone?: string;
  reference?: string;
  
  amount: number;
  currency: string;
  baseAmount?: number;
  baseCurrency?: string;
  paymentMethod: string;
  category: string;
  createdBy: string;
  
  notes?: string;
  isRTL: boolean;
  appName: string;
}

export function generateVoucherHTML(data: VoucherPrintData): string {
  const { isRTL } = data;
  const dir = isRTL ? "rtl" : "ltr";
  const alignEnd = isRTL ? "left" : "right";
  const alignStart = isRTL ? "right" : "left";
  
  const isIncome = data.voucherType === "income";
  const typeLabel = isRTL ? (isIncome ? "سند قبض" : "سند صرف") : (isIncome ? "Receipt Voucher" : "Payment Voucher");
  const primaryColor = isIncome ? "#3B82F6" : "#EF4444";
  const primaryLight = isIncome ? "#EFF6FF" : "#FEF2F2";

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${isRTL ? "ar" : "en"}">
<head>
  <meta charset="UTF-8" />
  <title>${typeLabel} - ${data.voucherNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;
      direction: ${dir};
      color: #000;
      background: #fff;
      font-size: 14px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .container {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
    }

    /* ── Header ── */
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      border-bottom: 3px solid ${primaryColor};
      padding-bottom: 16px;
    }
    .header-table td {
      vertical-align: top;
    }
    .company-col {
      width: 40%;
    }
    .company-name {
      font-size: 24px;
      font-weight: 900;
      color: ${primaryColor};
      margin-bottom: 4px;
    }
    .company-details {
      font-size: 13px;
      color: #333;
      line-height: 1.6;
    }
    .title-col {
      width: 20%;
      text-align: center;
      vertical-align: middle !important;
    }
    .voucher-title {
      font-size: 22px;
      font-weight: 900;
      color: #fff;
      background-color: ${primaryColor};
      padding: 8px 16px;
      border-radius: 4px;
      display: inline-block;
      white-space: nowrap;
    }
    .meta-col {
      width: 40%;
      text-align: ${alignEnd};
    }
    .meta-box {
      display: inline-block;
      border: 1px solid #ccc;
      background: #fdfdfd;
      padding: 10px 16px;
      border-radius: 4px;
      text-align: ${alignStart};
    }
    .meta-row {
      display: flex;
      gap: 12px;
      margin-bottom: 4px;
      font-size: 14px;
    }
    .meta-row:last-child { margin-bottom: 0; }
    .meta-label { font-weight: 700; color: #555; width: 60px; }
    .meta-value { font-weight: 800; color: #000; }

    /* ── Amount Block ── */
    .amount-block {
      background: ${primaryLight};
      border: 2px solid ${primaryColor};
      border-radius: 6px;
      padding: 16px 24px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .amount-text {
      font-size: 16px;
      font-weight: 800;
      color: #333;
    }
    .amount-value {
      font-size: 30px;
      font-weight: 900;
      color: ${primaryColor};
      direction: ltr;
    }
    .amount-currency {
      font-size: 18px;
      font-weight: 700;
    }

    /* ── Main Data Tables ── */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      border: 1px solid #ccc;
    }
    .data-table th, .data-table td {
      border: 1px solid #ccc;
      padding: 10px 14px;
    }
    .data-table th {
      background-color: #f8f9fa;
      color: #333;
      font-weight: 800;
      font-size: 14px;
      width: 25%;
      text-align: ${alignStart};
    }
    .data-table td {
      color: #000;
      font-weight: 600;
      font-size: 15px;
      background-color: #fff;
    }

    .section-header {
      background-color: #f1f5f9;
      padding: 8px 14px;
      font-size: 16px;
      font-weight: 800;
      color: ${primaryColor};
      border: 1px solid #ccc;
      border-bottom: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ── Details Box ── */
    .details-box {
      border: 1px solid #ccc;
      margin-bottom: 32px;
    }
    .details-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #ccc;
      padding: 8px 14px;
      font-weight: 800;
      font-size: 15px;
      color: #333;
    }
    .details-content {
      padding: 16px 14px;
      font-size: 15px;
      font-weight: 600;
      color: #000;
      white-space: pre-line;
      min-height: 80px;
    }

    /* ── Signatures ── */
    .signatures {
      display: table;
      width: 100%;
      margin-top: 40px;
      margin-bottom: 40px;
    }
    .sig-cell {
      display: table-cell;
      width: 33.33%;
      text-align: center;
      vertical-align: bottom;
    }
    .sig-line {
      border-bottom: 1px dashed #000;
      width: 60%;
      margin: 0 auto 8px auto;
      height: 40px;
    }
    .sig-title {
      font-size: 15px;
      font-weight: 800;
      color: #333;
    }

    /* ── Footer ── */
    .footer {
      border-top: 2px solid #eee;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #666;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Header -->
    <table class="header-table">
      <tr>
        <td class="company-col">
          <div class="company-name">${data.businessName}</div>
          <div class="company-details">
            ${data.businessAddress}<br>
            ${isRTL ? "هاتف:" : "Tel:"} <span dir="ltr">${data.businessPhone}</span><br>
            ${data.taxNumber ? `${isRTL ? "الرقم الضريبي:" : "Tax No:"} ${data.taxNumber}<br>` : ""}
            ${data.crNumber ? `${isRTL ? "سجل تجاري:" : "CR:"} ${data.crNumber}` : ""}
          </div>
        </td>
        <td class="title-col">
          <div class="voucher-title">${typeLabel}</div>
        </td>
        <td class="meta-col">
          <div class="meta-box">
            <div class="meta-row">
              <span class="meta-label">${isRTL ? "رقم السند:" : "No:"}</span>
              <span class="meta-value" dir="ltr">${data.voucherNumber}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">${isRTL ? "التاريخ:" : "Date:"}</span>
              <span class="meta-value" dir="ltr">${data.voucherDate}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">${isRTL ? "الحالة:" : "Status:"}</span>
              <span class="meta-value" style="color: #16A34A;">${data.status}</span>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Amount Highlight -->
    <div class="amount-block">
      <div class="amount-text">${isRTL ? "المبلغ أعلاه تم تسجيله رسمياً في النظام" : "Amount officially recorded in system"}</div>
      <div style="text-align: ${alignEnd}">
        <div class="amount-value">${data.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span class="amount-currency">${data.currency}</span></div>
        ${data.baseAmount && data.baseAmount !== data.amount ? `<div style="font-size: 14px; color: #555; margin-top: 4px;">${isRTL ? `المعادل: <b dir="ltr">${data.baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> ${data.baseCurrency} (سعر الصرف: ${data.amount > 0 ? (data.baseAmount / data.amount).toLocaleString() : 1})` : `Eqv: <b dir="ltr">${data.baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b> ${data.baseCurrency} (Rate: ${data.amount > 0 ? (data.baseAmount / data.amount).toLocaleString() : 1})`}</div>` : ""}
      </div>
    </div>

    <!-- Main Data Table -->
    <div class="section-header">
      ${isRTL ? "معلومات الطرف والعملية" : "Entity & Transaction Details"}
    </div>
    <table class="data-table">
      <tbody>
        <tr>
          <th>${isRTL ? (isIncome ? "استلمنا من السيد/ة:" : "صرفنا للسيد/ة:") : (isIncome ? "Received From:" : "Paid To:")}</th>
          <td>${data.entityName}</td>
          <th>${isRTL ? "رقم الهاتف:" : "Phone:"}</th>
          <td dir="ltr" style="text-align: ${alignStart};">${data.entityPhone || "---"}</td>
        </tr>
        <tr>
          <th>${isRTL ? "طريقة الدفع:" : "Payment Method:"}</th>
          <td>${data.paymentMethod}</td>
          <th>${isRTL ? "رقم المرجع:" : "Ref No:"}</th>
          <td>${data.reference || "---"}</td>
        </tr>
        <tr>
          <th>${isRTL ? "التصنيف المحاسبي:" : "Accounting Category:"}</th>
          <td colspan="3">${data.category}</td>
        </tr>
      </tbody>
    </table>

    <!-- Description -->
    <div class="details-box">
      <div class="details-header">${isRTL ? "البيان / الوصف" : "Description / Notes"}</div>
      <div class="details-content">${data.notes || (isRTL ? "لا توجد ملاحظات" : "No notes provided")}</div>
    </div>

    <!-- Signatures -->
    <div class="signatures">
      <div class="sig-cell">
        <div class="sig-line"></div>
        <div class="sig-title">${isRTL ? (isIncome ? "توقيع المستلم" : "توقيع المستفيد") : "Recipient Signature"}</div>
      </div>
      <div class="sig-cell">
        <div class="sig-line"></div>
        <div class="sig-title">${isRTL ? "توقيع المحاسب" : "Accountant Signature"}</div>
      </div>
      <div class="sig-cell">
        <div class="sig-line"></div>
        <div class="sig-title">${isRTL ? "ختم الشركة / الاعتماد" : "Company Stamp / Approval"}</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>
        ${isRTL ? "تم إنشاء هذا المستند إلكترونيًا بواسطة النظام." : "This document was generated electronically by the system."}<br>
        <strong style="color: ${primaryColor};">${data.appName}</strong> ERP
      </div>
      <div style="text-align: ${alignEnd};">
        ${isRTL ? "طبع في:" : "Printed On:"} <span dir="ltr">${new Date().toLocaleDateString(isRTL ? "en-GB" : "en-US")} ${new Date().toLocaleTimeString("en-US")}</span><br>
        ${isRTL ? "بواسطة:" : "By:"} ${data.createdBy}
      </div>
    </div>

  </div>
  
  <script>
    window.onload = function() {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>`;
}
