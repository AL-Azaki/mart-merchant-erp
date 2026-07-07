import { MOCK_BUSINESS } from "@/core/data/mockData";
import { Employee } from "@/core/data/inventoryExtraMockData";

export interface EmployeePrintData {
  employee: Employee;
  extraData: {
    hireDate: string;
    yearsOfService: string;
    branch: string;
    department: string;
    manager: string;
  };
  isRTL: boolean;
  autoPrint?: boolean;
}

export function generateEmployeeHTML(data: EmployeePrintData) {
  const { employee, extraData, isRTL, autoPrint = false } = data;
  const dir = isRTL ? "rtl" : "ltr";
  const align = isRTL ? "right" : "left";
  
  const businessName = MOCK_BUSINESS.business_name;
  
  return `
    <!DOCTYPE html>
    <html lang="${isRTL ? 'ar' : 'en'}" dir="${dir}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isRTL ? 'ملف موظف' : 'Employee Profile'} - ${employee.name}</title>
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
          padding: 24px;
        }

        /* Hide scrollbar for iframe but allow scrolling */
        html, body { -ms-overflow-style: none; scrollbar-width: none; }
        ::-webkit-scrollbar { display: none; }

        .invoice-container { max-width: 100%; margin: 0 auto; }

        /* ── Header ── */
        .header-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr 1fr; 
          border-bottom: 2px solid #1E3A8A; 
          padding-bottom: 12px; 
          margin-bottom: 24px; 
        }
        .company-details { text-align: ${align}; }
        .company-name { font-size: 18px; font-weight: 900; color: #1E3A8A; margin-bottom: 4px; }
        .company-info-line { font-size: 11px; color: #475569; margin-bottom: 2px; }
        
        .invoice-title-container { text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; }
        .invoice-title { font-size: 20px; font-weight: 900; color: #1E3A8A; letter-spacing: -0.5px; border: 2px solid #1E3A8A; padding: 4px 16px; border-radius: 6px; display: inline-block; margin-bottom:8px; }
        
        .invoice-meta { text-align: ${align === 'right' ? 'left' : 'right'}; }
        .meta-table { width: 100%; border-collapse: collapse; }
        .meta-table td { padding: 3px 0; font-size: 11px; }
        .meta-label { font-weight: 700; color: #64748B; width: 45%; text-align: ${align}; }
        .meta-value { font-weight: 800; color: #0F172A; text-align: ${align === 'right' ? 'left' : 'right'}; }

        /* ── Section Titles ── */
        .section-title { font-size: 13px; font-weight: 900; color: #1E3A8A; border-bottom: 1px solid #CBD5E1; padding-bottom: 4px; margin-bottom: 12px; margin-top: 24px; text-transform: uppercase; }

        /* ── Profile Header ── */
        .profile-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .profile-avatar {
          width: 80px;
          height: 80px;
          background: #1E3A8A;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 32px;
          font-weight: 900;
        }
        .profile-name { font-size: 24px; font-weight: 900; color: #0F172A; margin: 0 0 4px 0; }
        .profile-job { font-size: 13px; font-weight: 700; color: #475569; margin: 0; }

        /* ── Info Grids ── */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .info-box {
          border: 1px solid #E2E8F0;
          background: #F8FAFC;
          padding: 12px;
          border-radius: 8px;
        }
        .info-label {
          font-size: 10px;
          color: #64748B;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .info-value {
          font-size: 13px;
          color: #0F172A;
          font-weight: 800;
        }

        /* ── Footer ── */
        .footer { border-top: 1px solid #E2E8F0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 9px; color: #94A3B8; margin-top: 32px; }

        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        
        <!-- Header -->
        <div class="header-grid">
          <div class="company-details">
            <div class="company-name">${businessName}</div>
            <div class="company-info-line">${isRTL ? "إدارة الموارد البشرية" : "Human Resources Department"}</div>
          </div>
          
          <div class="invoice-title-container">
            <div class="invoice-title">${isRTL ? 'ملف الموظف' : 'EMPLOYEE PROFILE'}</div>
            <div style="font-size:12px; font-weight:700; color:#475569;">${employee.name}</div>
          </div>
          
          <div class="invoice-meta">
            <table class="meta-table">
              <tr><td class="meta-label">${isRTL ? "الرقم الوظيفي:" : "Emp ID:"}</td><td class="meta-value">${employee.id}</td></tr>
              <tr><td class="meta-label">${isRTL ? "تاريخ الطباعة:" : "Print Date:"}</td><td class="meta-value">${new Date().toLocaleDateString(isRTL ? 'ar-YE' : 'en-US')}</td></tr>
            </table>
          </div>
        </div>

        <!-- Avatar Section -->
        <div class="profile-header">
          <div class="profile-avatar">
            ${employee.name.charAt(0)}
          </div>
          <div>
            <h2 class="profile-name">${employee.name}</h2>
            <p class="profile-job">${employee.job_title} • ${extraData.department}</p>
          </div>
        </div>

        <div class="section-title">${isRTL ? 'المعلومات الشخصية' : 'Personal Information'}</div>
        <div class="info-grid">
          <div class="info-box">
            <div class="info-label">${isRTL ? 'رقم الهاتف' : 'Phone Number'}</div>
            <div class="info-value" style="direction: ltr; text-align: ${align}">${employee.phone || '---'}</div>
          </div>
          <div class="info-box">
            <div class="info-label">${isRTL ? 'البريد الإلكتروني' : 'Email Address'}</div>
            <div class="info-value">${employee.email || '---'}</div>
          </div>
          <div class="info-box">
            <div class="info-label">${isRTL ? 'الحالة الوظيفية' : 'Status'}</div>
            <div class="info-value">${employee.status === 'active' ? (isRTL ? 'نشط' : 'Active') : employee.status === 'on_leave' ? (isRTL ? 'في إجازة' : 'On Leave') : (isRTL ? 'موقوف' : 'Inactive')}</div>
          </div>
        </div>

        <div class="section-title">${isRTL ? 'المعلومات الوظيفية' : 'Job Information'}</div>
        <div class="info-grid">
          <div class="info-box">
            <div class="info-label">${isRTL ? 'تاريخ التوظيف' : 'Hire Date'}</div>
            <div class="info-value">${extraData.hireDate}</div>
          </div>
          <div class="info-box">
            <div class="info-label">${isRTL ? 'الفرع / الموقع' : 'Branch / Location'}</div>
            <div class="info-value">${extraData.branch}</div>
          </div>
          <div class="info-box">
            <div class="info-label">${isRTL ? 'المدير المباشر' : 'Direct Manager'}</div>
            <div class="info-value">${extraData.manager}</div>
          </div>
          <div class="info-box">
            <div class="info-label">${isRTL ? 'الراتب الأساسي' : 'Basic Salary'}</div>
            <div class="info-value">${employee.salary.toLocaleString()} YER</div>
          </div>
        </div>

        <div class="footer">
          <div>${isRTL ? 'تاريخ الطباعة:' : 'Printed On:'} ${new Date().toLocaleString(isRTL ? 'ar-YE' : 'en-US')}</div>
          <div>${isRTL ? 'بواسطة النظام الذكي' : 'Generated by Smart ERP'}</div>
        </div>
      </div>
      ${autoPrint ? `<script>window.onload = () => { window.print(); window.close(); }</script>` : ''}
    </body>
    </html>
  `;
}
