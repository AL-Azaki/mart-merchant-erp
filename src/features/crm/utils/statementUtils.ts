export interface StatementData {
  businessName: string;
  businessPhone?: string;
  businessAddress?: string;
  businessTaxId?: string;
  businessCR?: string;
  
  customerName: string;
  customerPhone?: string;
  customerCode?: string;
  
  reportDate: string;
  reportPeriod?: string;
  
  openingBalance: number;
  totalSales: number;
  totalPayments: number;
  totalReturns: number;
  currentBalance: number;
  
  invoicesCount: number;
  paymentsCount: number;
  
  transactions: {
    date: string;
    type: string;
    type_ar?: string;
    ref: string;
    description?: string;
    description_ar?: string;
    debit: number;
    credit: number;
    balance: number;
  }[];
  
  currency: string;
  isRTL: boolean;
  printedBy?: string;
  appName: string;
  autoPrint?: boolean;
  
  // Overrides for non-customer documents
  title?: string;
  totalSalesLabel?: string;
}

export function generateStatementHTML(data: StatementData): string {
  const { isRTL, currency } = data;
  const dir = isRTL ? "rtl" : "ltr";
  const alignEnd = isRTL ? "left" : "right";
  const alignStart = isRTL ? "right" : "left";

  const fallbackDate = new Date().toLocaleDateString(isRTL ? 'ar-YE' : 'en-US');
  const fallbackTime = new Date().toLocaleTimeString(isRTL ? 'ar-YE' : 'en-US');

  // Build Transaction Rows
  const txRows = data.transactions.map((tx) => {
    const txType = (isRTL && tx.type_ar) ? tx.type_ar : tx.type;
    const txDesc = (isRTL && tx.description_ar) ? tx.description_ar : (tx.description || "---");
    const debit = tx.debit > 0 ? tx.debit.toLocaleString() : "-";
    const credit = tx.credit > 0 ? tx.credit.toLocaleString() : "-";
    
    return `
      <tr>
        <td>${tx.date}</td>
        <td style="font-weight:700; color:#1E3A8A;">${txType}</td>
        <td class="text-start" style="direction:ltr; text-align:${alignStart};">${tx.ref}</td>
        <td>${txDesc}</td>
        <td style="color:#DC2626; font-weight:700;">${debit}</td>
        <td style="color:#16A34A; font-weight:700;">${credit}</td>
        <td class="text-end" style="font-weight:900; background:#F8FAFC;">${tx.balance.toLocaleString()}</td>
      </tr>
    `;
  }).join("");

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${isRTL ? "ar" : "en"}">
<head>
  <meta charset="UTF-8" />
  <title>${data.title || (isRTL ? "كشف حساب عميل" : "Customer Statement")} - ${data.customerName}</title>
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
    .invoice-title { font-size: 20px; font-weight: 900; color: #1E3A8A; letter-spacing: -0.5px; border: 2px solid #1E3A8A; padding: 4px 16px; border-radius: 6px; display: inline-block; margin-bottom:8px; }
    
    .invoice-meta { text-align: ${alignEnd}; }
    .meta-table { width: 100%; border-collapse: collapse; }
    .meta-table td { padding: 3px 0; font-size: 11px; }
    .meta-label { font-weight: 700; color: #64748B; width: 45%; text-align: ${alignStart}; }
    .meta-value { font-weight: 800; color: #0F172A; text-align: ${alignEnd}; }
    
    /* ── Section Titles ── */
    .section-title { font-size: 13px; font-weight: 900; color: #1E3A8A; border-bottom: 1px solid #CBD5E1; padding-bottom: 4px; margin-bottom: 8px; margin-top: 16px; text-transform: uppercase; }
    
    /* ── Summary Grids ── */
    .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
    .s-card { border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; background: #F8FAFC; text-align: center; }
    .s-lbl { font-size: 10px; color: #64748B; font-weight: 700; margin-bottom: 4px; }
    .s-val { font-size: 16px; color: #0F172A; font-weight: 900; }
    
    /* ── Table ── */
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #CBD5E1; }
    .items-table th { background: #1E3A8A; color: white; font-weight: 700; padding: 8px 6px; font-size: 10px; border: 1px solid #CBD5E1; text-align: center; }
    .items-table td { padding: 8px 6px; font-size: 11px; border: 1px solid #E2E8F0; text-align: center; }
    .items-table tbody tr:nth-child(even) { background: #F8FAFC; }
    .items-table .text-start { text-align: ${alignStart}; }
    .items-table .text-end { text-align: ${alignEnd}; }
    
    /* ── Footer ── */
    .footer { border-top: 1px solid #E2E8F0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 9px; color: #94A3B8; margin-top: 32px; }
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
        <div class="invoice-title">${data.title || (isRTL ? "كشف حساب" : "STATEMENT OF ACCOUNT")}</div>
        <div style="font-size:12px; font-weight:700; color:#475569;">${data.customerName}</div>
      </div>
      
      <div class="invoice-meta">
        <table class="meta-table">
          <tr><td class="meta-label">${isRTL ? "تاريخ التقرير:" : "Report Date:"}</td><td class="meta-value">${data.reportDate || fallbackDate}</td></tr>
          ${data.reportPeriod ? `<tr><td class="meta-label">${isRTL ? "الفترة:" : "Period:"}</td><td class="meta-value">${data.reportPeriod}</td></tr>` : ''}
          ${data.customerCode ? `<tr><td class="meta-label">${isRTL ? "رقم الحساب:" : "Acc No:"}</td><td class="meta-value">${data.customerCode}</td></tr>` : ''}
          ${data.customerPhone ? `<tr><td class="meta-label">${isRTL ? "الهاتف:" : "Phone:"}</td><td class="meta-value">${data.customerPhone}</td></tr>` : ''}
        </table>
      </div>
    </div>

    <div class="section-title">${isRTL ? "ملخص الحساب" : "Account Summary"}</div>
    <div class="summary-cards">
      <div class="s-card">
        <div class="s-lbl">${isRTL ? "الرصيد السابق" : "Previous Balance"}</div>
        <div class="s-val">${data.openingBalance.toLocaleString()}</div>
      </div>
      <div class="s-card" style="border-color:#3B82F6; background:#EFF6FF;">
        <div class="s-lbl" style="color:#2563EB;">${data.totalSalesLabel || (isRTL ? "إجمالي المبيعات" : "Total Sales")}</div>
        <div class="s-val" style="color:#1D4ED8;">${data.totalSales.toLocaleString()}</div>
      </div>
      <div class="s-card" style="border-color:#10B981; background:#ECFDF5;">
        <div class="s-lbl" style="color:#059669;">${isRTL ? "إجمالي المدفوعات" : "Total Payments"}</div>
        <div class="s-val" style="color:#047857;">${data.totalPayments.toLocaleString()}</div>
      </div>
      <div class="s-card" style="border-color:#F59E0B; background:#FFFBEB;">
        <div class="s-lbl" style="color:#D97706;">${isRTL ? "الرصيد المستحق" : "Due Balance"}</div>
        <div class="s-val" style="color:#B45309;">${data.currentBalance.toLocaleString()} <span style="font-size:10px;">${currency}</span></div>
      </div>
    </div>

    <!-- Details -->
    <div style="font-size:10px; color:#64748B; margin-bottom: 12px; display:flex; gap:16px;">
       <div><strong>${isRTL ? "إجمالي الحركات:" : "Total TX:"}</strong> ${data.transactions.length}</div>
       <div><strong>${isRTL ? "عدد الفواتير:" : "Invoices:"}</strong> ${data.invoicesCount}</div>
       <div><strong>${isRTL ? "عدد الدفعات:" : "Payments:"}</strong> ${data.paymentsCount}</div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 15%;">${isRTL ? "التاريخ" : "Date"}</th>
          <th style="width: 15%;">${isRTL ? "نوع الحركة" : "Type"}</th>
          <th class="text-start" style="width: 15%;">${isRTL ? "المرجع" : "Ref"}</th>
          <th style="width: 20%;">${isRTL ? "الوصف" : "Description"}</th>
          <th style="width: 11%;">${isRTL ? "مدين (له)" : "Debit"}</th>
          <th style="width: 11%;">${isRTL ? "دائن (عليه)" : "Credit"}</th>
          <th class="text-end" style="width: 13%;">${isRTL ? "الرصيد" : "Balance"}</th>
        </tr>
      </thead>
      <tbody>
        ${txRows}
      </tbody>
    </table>
    
    <!-- Footer -->
    <div class="footer">
      <div>${isRTL ? "تاريخ ووقت الطباعة:" : "Printed On:"} ${fallbackDate} ${fallbackTime}</div>
      <div>${isRTL ? "طبع بواسطة:" : "Printed By:"} ${data.printedBy || (isRTL ? 'مستخدم النظام' : 'System User')}</div>
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
