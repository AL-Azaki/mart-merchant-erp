import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Printer, UserCheck, Calendar, Briefcase, MapPin, Activity, User, Shield, Phone, Mail, DollarSign, ChevronRight, ChevronLeft, Search, X } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";
import { Employee, MOCK_EMPLOYEES } from "@/core/data/inventoryExtraMockData";
import { generateEmployeeHTML } from "./employeePrintUtils";
import { generateStatementHTML } from "@/features/crm/utils/statementUtils";
import { MOCK_BUSINESS } from "@/core/data/mockData";
import { TransactionFormSheet } from "@/features/finance/components/TransactionFormSheet";
import { AnimatePresence } from "motion/react";

export function EmployeeDetailScreen({ employee: initialEmployee, onBack }: { employee: Employee, onBack: () => void }) {
  const { isDark, isRTL, ds } = useApp();
  const toast = useToast();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  
  const [activeTab, setActiveTab] = useState<"overview" | "personal" | "job" | "ledger" | "activity" | "print_preview">("overview");
  
  // Transaction State
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const [currentEmployeeId, setCurrentEmployeeId] = useState(initialEmployee.id);
  const employee = MOCK_EMPLOYEES.find(e => e.id === currentEmployeeId) || initialEmployee;

  const currentIndex = MOCK_EMPLOYEES.findIndex(e => e.id === employee.id);
  const handlePrev = () => { if (currentIndex > 0) setCurrentEmployeeId(MOCK_EMPLOYEES[currentIndex - 1].id); };
  const handleNext = () => { if (currentIndex < MOCK_EMPLOYEES.length - 1) setCurrentEmployeeId(MOCK_EMPLOYEES[currentIndex + 1].id); };

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = MOCK_EMPLOYEES.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (e.phone && e.phone.includes(searchQuery))
  );

  // Mocking extra data since `Employee` type only has basic fields
  const extraData = {
    hireDate: "2023-01-15",
    yearsOfService: "1.5",
    branch: employee.warehouse_name || "الفرع الرئيسي",
    department: "المستودعات والمخزون",
    manager: "أحمد عبدالله (مدير الفرع)",
    activities: [
      { id: 1, date: "2024-06-15T09:00:00Z", type: "تسجيل دخول", desc: "تم تسجيل الدخول إلى النظام", by: employee.name },
      { id: 2, date: "2024-06-14T14:30:00Z", type: "تعديل بيانات", desc: "تم تحديث رقم الهاتف", by: "المدير النظام" },
      { id: 3, date: "2023-01-15T10:00:00Z", type: "إنشاء حساب", desc: "تم إضافة الموظف إلى النظام", by: "المدير النظام" }
    ],
    ledger: [
      { id: "1", date: "2024-05-31", type: "استحقاق راتب", desc: "راتب شهر مايو 2024", credit: 150000, debit: 0, balance: 150000 },
      { id: "2", date: "2024-06-05", type: "سلفة نقدية", desc: "سلفة نقدية من الصندوق", credit: 0, debit: 50000, balance: 100000 },
      { id: "3", date: "2024-06-30", type: "استحقاق راتب", desc: "راتب شهر يونيو 2024", credit: 150000, debit: 0, balance: 250000 },
      { id: "4", date: "2024-07-02", type: "صرف راتب", desc: "تسليم راتب نقدي", credit: 0, debit: 150000, balance: 100000 },
    ],
    summary: {
      totalEntitlements: 300000, // إجمالي المستحقات (دائن)
      totalDeductions: 200000,   // إجمالي السحبيات (مدين)
      currentBalance: 100000     // الرصيد المتبقي
    }
  };

  const htmlContent = generateEmployeeHTML({ employee, extraData, isRTL, autoPrint: false });

  function handlePrintProfile() {
    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) return;
    const printHtml = generateEmployeeHTML({ employee, extraData, isRTL, autoPrint: true });
    printWindow.document.write(printHtml);
    printWindow.document.close();
  }

  function handlePrintLedger() {
    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) return;
    
    const statementHtml = generateStatementHTML({
      businessName: MOCK_BUSINESS.business_name,
      customerName: employee.name,
      customerCode: employee.id,
      customerPhone: employee.phone,
      reportDate: new Date().toLocaleDateString(isRTL ? 'ar-YE' : 'en-US'),
      openingBalance: 0,
      totalSales: extraData.summary.totalEntitlements,
      totalPayments: extraData.summary.totalDeductions,
      totalReturns: 0,
      currentBalance: extraData.summary.currentBalance,
      invoicesCount: extraData.ledger.filter(t => t.credit > 0).length,
      paymentsCount: extraData.ledger.filter(t => t.debit > 0).length,
      transactions: extraData.ledger.map(t => ({
        date: t.date,
        type: t.type,
        ref: `#${t.id}`,
        description: t.desc,
        credit: t.credit,
        debit: t.debit,
        balance: t.balance
      })),
      currency: "YER",
      isRTL,
      appName: "Smart ERP",
      autoPrint: true,
      title: isRTL ? "كشف حساب موظف" : "EMPLOYEE STATEMENT",
      totalSalesLabel: isRTL ? "إجمالي المستحقات" : "Total Entitlements"
    });
    
    printWindow.document.write(statementHtml);
    printWindow.document.close();
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <motion.div 
         initial={{ opacity: 0, y: 30, scale: 0.98 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         exit={{ opacity: 0, y: 30, scale: 0.98 }}
         style={{
           width: "90%",
           maxWidth: "1400px",
           height: "92vh",
           background: isDark ? ds.bg : "#F8FAFC",
           borderRadius: 24,
           overflow: "hidden",
           display: "flex",
           flexDirection: "column",
           boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
           border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`,
           position: "relative"
         }}
      >
      {/* Header */}
      <div style={{ background: isDark ? ds.surface : "white", borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 50, height: 50, borderRadius: 16, background: "linear-gradient(135deg, #4F46E5, #4338CA)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={24} color="white" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h2 style={{ color: ds.textPrimary, fontSize: 22, fontWeight: 800, margin: "0" }}>{employee.name}</h2>
              <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: employee.status === 'active' ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: employee.status === 'active' ? "#10B981" : "#EF4444" }}>
                 {employee.status === 'active' ? (isRTL ? "نشط" : "Active") : (isRTL ? "موقوف" : "Inactive")}
              </span>
            </div>
            <p style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 500, margin: "4px 0 0 0" }}>{employee.job_title} • {employee.warehouse_name || extraData.department || "---"}</p>
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Navigation Controls */}
          <div style={{ display: "flex", alignItems: "center", background: isDark ? ds.surface2 : "#F1F5F9", borderRadius: 12, padding: "4px" }}>
            <button onClick={handlePrev} disabled={currentIndex === 0} style={{ width: 36, height: 36, borderRadius: 8, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: currentIndex === 0 ? "not-allowed" : "pointer", color: currentIndex === 0 ? ds.textMuted : ds.textPrimary, transition: "0.2s" }} onMouseOver={e=> {if (currentIndex>0) e.currentTarget.style.background=isDark?"rgba(255,255,255,0.05)":"white"}} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
              {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <div style={{ width: 1, height: 20, background: isDark ? ds.border : "#CBD5E1", margin: "0 4px" }} />
            <button onClick={handleNext} disabled={currentIndex === MOCK_EMPLOYEES.length - 1} style={{ width: 36, height: 36, borderRadius: 8, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: currentIndex === MOCK_EMPLOYEES.length - 1 ? "not-allowed" : "pointer", color: currentIndex === MOCK_EMPLOYEES.length - 1 ? ds.textMuted : ds.textPrimary, transition: "0.2s" }} onMouseOver={e=> {if (currentIndex < MOCK_EMPLOYEES.length - 1) e.currentTarget.style.background=isDark?"rgba(255,255,255,0.05)":"white"}} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
              {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
          
          <button onClick={() => setShowSearch(!showSearch)} style={{ width: 44, height: 44, borderRadius: 12, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", color: ds.textPrimary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,0.05)":"#E2E8F0"} onMouseOut={e=>e.currentTarget.style.background=isDark?ds.surface2:"#F1F5F9"}>
            <Search size={20} />
          </button>
          
          <div style={{ width: 1, height: 24, background: isDark ? ds.border : "#E2E8F0", margin: "0 4px" }} />
          
          <button onClick={onBack} style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "none", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background="rgba(239,68,68,0.2)"} onMouseOut={e=>e.currentTarget.style.background="rgba(239,68,68,0.1)"}>
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Search Dropdown Overlay */}
      {showSearch && (
        <div style={{ position: "absolute", top: 85, right: isRTL ? "auto" : 24, left: isRTL ? 24 : "auto", width: 350, background: isDark ? ds.surface : "white", border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 16, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", zIndex: 50, padding: 12 }}>
          <input 
            type="text" 
            placeholder={isRTL ? "ابحث عن موظف (الاسم، الهاتف)..." : "Search employee..."} 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
            style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1px solid ${isDark ? ds.border : "#CBD5E1"}`, background: isDark ? ds.surface2 : "#F8FAFC", color: ds.textPrimary, outline: "none", marginBottom: 8 }}
          />
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {searchResults.length === 0 ? (
              <div style={{ padding: 16, textAlign: "center", color: ds.textMuted, fontSize: 13 }}>{isRTL ? "لا يوجد نتائج" : "No results"}</div>
            ) : (
              searchResults.map(res => (
                <div key={res.id} onClick={() => { setCurrentEmployeeId(res.id); setShowSearch(false); setSearchQuery(""); }} style={{ padding: "12px", borderRadius: 8, cursor: "pointer", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark?ds.surface2:"#F1F5F9"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{ color: ds.textPrimary, fontWeight: 700, fontSize: 14 }}>{res.name}</div>
                  <div style={{ color: ds.textSecondary, fontSize: 12, marginTop: 4 }}>{res.phone || "---"}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: isDark ? ds.surface : "white", borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, padding: "0 24px", display: "flex", gap: 32 }}>
        {[
          { id: "overview", label: isRTL ? "نظرة عامة" : "Overview" },
          { id: "personal", label: isRTL ? "المعلومات الشخصية" : "Personal Info" },
          { id: "job", label: isRTL ? "المعلومات الوظيفية" : "Job Info" },
          { id: "ledger", label: isRTL ? "السجل المالي (كشف الحساب)" : "Financial Ledger" },
          { id: "activity", label: isRTL ? "سجل النشاط" : "Activity Log" },
          { id: "print_preview", label: isRTL ? "معاينة الطباعة" : "Print Preview" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: "none", border: "none", padding: "16px 0", cursor: "pointer",
              color: activeTab === tab.id ? "#4F46E5" : ds.textSecondary,
              fontSize: 15, fontWeight: activeTab === tab.id ? 800 : 600,
              borderBottom: activeTab === tab.id ? `3px solid #4F46E5` : "3px solid transparent",
              transition: "0.2s"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Quick Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <div style={{ background: isDark ? ds.surface : "white", padding: 20, borderRadius: 16, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Calendar size={20} color="#6366F1"/></div>
                <div>
                  <div style={{ fontSize: 13, color: ds.textSecondary, fontWeight: 600 }}>{isRTL ? "تاريخ التوظيف" : "Hire Date"}</div>
                  <div style={{ fontSize: 16, color: ds.textPrimary, fontWeight: 800, marginTop: 4 }}>{extraData.hireDate}</div>
                </div>
              </div>
              <div style={{ background: isDark ? ds.surface : "white", padding: 20, borderRadius: 16, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Briefcase size={20} color="#10B981"/></div>
                <div>
                  <div style={{ fontSize: 13, color: ds.textSecondary, fontWeight: 600 }}>{isRTL ? "سنوات الخدمة" : "Years of Service"}</div>
                  <div style={{ fontSize: 16, color: ds.textPrimary, fontWeight: 800, marginTop: 4 }}>{isRTL ? `${extraData.yearsOfService} سنة` : `${extraData.yearsOfService} Years`}</div>
                </div>
              </div>
              <div style={{ background: isDark ? ds.surface : "white", padding: 20, borderRadius: 16, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><UserCheck size={20} color="#F59E0B"/></div>
                <div>
                  <div style={{ fontSize: 13, color: ds.textSecondary, fontWeight: 600 }}>{isRTL ? "الحالة الوظيفية" : "Status"}</div>
                  <div style={{ fontSize: 16, color: employee.status === 'active' ? "#10B981" : employee.status === 'on_leave' ? "#F59E0B" : "#EF4444", fontWeight: 800, marginTop: 4 }}>
                    {employee.status === 'active' ? (isRTL ? "نشط" : "Active") : employee.status === 'on_leave' ? (isRTL ? "في إجازة" : "On Leave") : (isRTL ? "موقوف" : "Inactive")}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: isDark ? ds.surface : "white", padding: 24, borderRadius: 16, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                <h3 style={{ margin: "0 0 16px 0", color: ds.textPrimary, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}><MapPin size={18} color="#6366F1"/> {isRTL ? "معلومات الموقع" : "Location Info"}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 4 }}>{isRTL ? "الفرع / الموقع" : "Branch / Location"}</div>
                    <div style={{ fontSize: 15, color: ds.textPrimary, fontWeight: 600 }}>{extraData.branch}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 4 }}>{isRTL ? "القسم" : "Department"}</div>
                    <div style={{ fontSize: 15, color: ds.textPrimary, fontWeight: 600 }}>{extraData.department}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: isDark ? ds.surface : "white", padding: 24, borderRadius: 16, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                <h3 style={{ margin: "0 0 16px 0", color: ds.textPrimary, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}><Shield size={18} color="#10B981"/> {isRTL ? "معلومات إدارية" : "Admin Info"}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 4 }}>{isRTL ? "المدير المباشر" : "Direct Manager"}</div>
                    <div style={{ fontSize: 15, color: ds.textPrimary, fontWeight: 600 }}>{extraData.manager}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 4 }}>{isRTL ? "الراتب الأساسي" : "Basic Salary"}</div>
                    <div style={{ fontSize: 15, color: ds.textPrimary, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><DollarSign size={14} color="#10B981" /> {employee.salary.toLocaleString()} YER</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "personal" && (
          <div style={{ background: isDark ? ds.surface : "white", padding: 24, borderRadius: 16, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
            <h3 style={{ margin: "0 0 20px 0", color: ds.textPrimary }}>{isRTL ? "المعلومات الشخصية" : "Personal Information"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 6 }}>{isRTL ? "الاسم الكامل" : "Full Name"}</div>
                <div style={{ fontSize: 15, color: ds.textPrimary, fontWeight: 600 }}>{employee.name}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 6 }}>{isRTL ? "رقم الهاتف" : "Phone Number"}</div>
                <div style={{ fontSize: 15, color: ds.textPrimary, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><Phone size={14} color={ds.textMuted}/> {employee.phone}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 6 }}>{isRTL ? "البريد الإلكتروني" : "Email Address"}</div>
                <div style={{ fontSize: 15, color: ds.textPrimary, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><Mail size={14} color={ds.textMuted}/> {employee.email || "---"}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 6 }}>{isRTL ? "رقم الهوية / الجواز" : "ID / Passport"}</div>
                <div style={{ fontSize: 15, color: ds.textPrimary, fontWeight: 600 }}>{isRTL ? "غير متوفر في قاعدة البيانات" : "Not provided in DB"}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "job" && (
          <div style={{ background: isDark ? ds.surface : "white", padding: 24, borderRadius: 16, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
             <h3 style={{ margin: "0 0 20px 0", color: ds.textPrimary }}>{isRTL ? "المعلومات الوظيفية" : "Job Information"}</h3>
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 6 }}>{isRTL ? "المسمى الوظيفي" : "Job Title"}</div>
                <div style={{ fontSize: 15, color: ds.textPrimary, fontWeight: 600 }}>{employee.job_title}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 6 }}>{isRTL ? "القسم" : "Department"}</div>
                <div style={{ fontSize: 15, color: ds.textPrimary, fontWeight: 600 }}>{extraData.department}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 6 }}>{isRTL ? "الراتب الأساسي" : "Base Salary"}</div>
                <div style={{ fontSize: 15, color: ds.textPrimary, fontWeight: 600 }}>{employee.salary.toLocaleString()} YER</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 6 }}>{isRTL ? "المدير المباشر" : "Direct Manager"}</div>
                <div style={{ fontSize: 15, color: ds.textPrimary, fontWeight: 600 }}>{extraData.manager}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: ds.textSecondary, marginBottom: 6 }}>{isRTL ? "الفرع" : "Branch"}</div>
                <div style={{ fontSize: 15, color: ds.textPrimary, fontWeight: 600 }}>{extraData.branch}</div>
              </div>
             </div>
          </div>
        )}

        {activeTab === "ledger" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Action Buttons for Ledger */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <button 
                 onClick={handlePrintLedger}
                 style={{ height: 40, padding: "0 20px", borderRadius: 10, background: isDark ? ds.surface2 : "#F1F5F9", border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, color: ds.textPrimary, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", transition: "0.2s" }} 
                 onMouseOver={e=>e.currentTarget.style.background=isDark ? ds.border : "#E2E8F0"} onMouseOut={e=>e.currentTarget.style.background=isDark ? ds.surface2 : "#F1F5F9"}
                 title={isRTL ? "طباعة كشف الحساب المالي للموظف" : "Print Financial Statement"}>
                  <Printer size={18} /> {isRTL ? "طباعة كشف الحساب" : "Print Ledger"}
               </button>

               <button 
                 onClick={() => setShowTransactionForm(true)}
                 style={{ height: 40, padding: "0 20px", borderRadius: 10, background: "linear-gradient(135deg, #10B981, #059669)", border: "none", color: "white", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", boxShadow: "0 4px 12px rgba(16,185,129,0.2)" }} 
                 title={isRTL ? "تسجيل خروج أموال للموظف (سواء كانت سلفة أو تسليم راتب)" : "Issue a payment to the employee (Advance or Salary)"}>
                  <ArrowLeft size={18} /> {isRTL ? "إصدار سند صرف (سلفة / مستحقات)" : "Issue Payment (Advance/Salary)"}
               </button>
            </div>

            {/* Summary Cards with Tooltips */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <div title={isRTL ? "المبالغ التي تلتزم الشركة بدفعها للموظف مثل (الرواتب، المكافآت، البدلات). محاسبياً تسمى (الطرف الدائن)." : "Amounts the company owes the employee (Credits)"} style={{ background: isDark ? ds.surface : "white", padding: 20, borderRadius: 16, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, cursor: "help" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, color: ds.textSecondary, fontWeight: 700 }}>{isRTL ? "إجمالي المستحقات (له)" : "Total Entitlements"}</div>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(16,185,129,0.1)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900 }}>+</div>
                </div>
                <div style={{ fontSize: 24, color: "#10B981", fontWeight: 900 }}>{extraData.summary.totalEntitlements.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: ds.textMuted, marginTop: 4 }}>{isRTL ? "محاسبياً: دائن" : "Acc: Credit"}</div>
              </div>

              <div title={isRTL ? "المبالغ التي أخذها الموظف كـ (سلف، خصومات، أو رواتب مستلمة). محاسبياً تسمى (الطرف المدين)." : "Amounts withdrawn or deducted from the employee (Debits)"} style={{ background: isDark ? ds.surface : "white", padding: 20, borderRadius: 16, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, cursor: "help" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, color: ds.textSecondary, fontWeight: 700 }}>{isRTL ? "إجمالي السحبيات والخصومات (عليه)" : "Total Deductions & Advances"}</div>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(239,68,68,0.1)", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900 }}>-</div>
                </div>
                <div style={{ fontSize: 24, color: "#EF4444", fontWeight: 900 }}>{extraData.summary.totalDeductions.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: ds.textMuted, marginTop: 4 }}>{isRTL ? "محاسبياً: مدين" : "Acc: Debit"}</div>
              </div>

              <div title={isRTL ? "المبلغ النهائي المتبقي للموظف ليتم تسليمه له. (المستحقات ناقص السحبيات)." : "Final amount owed to the employee"} style={{ background: isDark ? ds.surface : "white", padding: 20, borderRadius: 16, border: `1px solid #4F46E5`, backgroundClip: "padding-box", cursor: "help", boxShadow: "0 4px 12px rgba(79,70,229,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, color: "#4F46E5", fontWeight: 800 }}>{isRTL ? "الرصيد المستحق الدفع (المتبقي)" : "Due Balance"}</div>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(79,70,229,0.1)", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900 }}>=</div>
                </div>
                <div style={{ fontSize: 28, color: ds.textPrimary, fontWeight: 900 }}>{extraData.summary.currentBalance.toLocaleString()} <span style={{ fontSize: 12, color: ds.textSecondary }}>YER</span></div>
              </div>
            </div>

            {/* Ledger Table */}
            <div style={{ background: isDark ? ds.surface : "white", borderRadius: 16, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
                <thead>
                  <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 12, fontWeight: 700 }}>{isRTL ? "التاريخ" : "Date"}</th>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 12, fontWeight: 700 }}>{isRTL ? "البيان" : "Description"}</th>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 12, fontWeight: 700 }} title={isRTL ? "ما للموظف (رواتب)" : "Owed to Employee"}>{isRTL ? "مستحقات (+)" : "Entitlements (+)"}</th>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 12, fontWeight: 700 }} title={isRTL ? "ما أخذه الموظف (سلف)" : "Taken by Employee"}>{isRTL ? "سحبيات (-)" : "Deductions (-)"}</th>
                    <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 12, fontWeight: 700, background: isDark ? "rgba(255,255,255,0.02)" : "#F1F5F9" }}>{isRTL ? "الرصيد" : "Balance"}</th>
                  </tr>
                </thead>
                <tbody>
                  {extraData.ledger.map((row, idx) => (
                    <tr key={row.id} style={{ borderBottom: idx === extraData.ledger.length - 1 ? "none" : `1px solid ${isDark ? ds.border : "#F1F5F9"}` }}>
                      <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 13, fontWeight: 600 }}>{row.date}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{row.type}</div>
                        <div style={{ color: ds.textSecondary, fontSize: 12 }}>{row.desc}</div>
                      </td>
                      <td style={{ padding: "16px 20px", color: "#10B981", fontSize: 14, fontWeight: 800 }}>{row.credit > 0 ? row.credit.toLocaleString() : "-"}</td>
                      <td style={{ padding: "16px 20px", color: "#EF4444", fontSize: 14, fontWeight: 800 }}>{row.debit > 0 ? row.debit.toLocaleString() : "-"}</td>
                      <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 15, fontWeight: 900, background: isDark ? "rgba(255,255,255,0.02)" : "#F1F5F9" }}>{row.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div style={{ background: isDark ? ds.surface : "white", borderRadius: 16, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, overflow: "hidden" }}>
             <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
              <thead>
                <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                  <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "التاريخ والوقت" : "Date & Time"}</th>
                  <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "نوع العملية" : "Action Type"}</th>
                  <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "الوصف" : "Description"}</th>
                  <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "بواسطة" : "By"}</th>
                </tr>
              </thead>
              <tbody>
                {extraData.activities.map((act, idx) => (
                  <tr key={act.id} style={{ borderBottom: idx === extraData.activities.length - 1 ? "none" : `1px solid ${isDark ? ds.border : "#F1F5F9"}` }}>
                    <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 14, fontWeight: 600, direction: "ltr", textAlign: isRTL ? "right" : "left" }}>
                      {new Date(act.date).toLocaleString(isRTL ? "ar-YE" : "en-US")}
                    </td>
                    <td style={{ padding: "16px 20px", color: "#4F46E5", fontSize: 13, fontWeight: 700 }}>
                      <span style={{ padding: "4px 8px", background: "rgba(79,70,229,0.1)", borderRadius: 6 }}>{act.type}</span>
                    </td>
                    <td style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 14 }}>{act.desc}</td>
                    <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 13, fontWeight: 600 }}>{act.by}</td>
                  </tr>
                ))}
              </tbody>
             </table>
          </div>
        )}

        {activeTab === "print_preview" && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 1000, background: isDark ? "#0F172A" : "#E2E8F0", padding: "16px", borderRadius: 16, display: "flex", justifyContent: "center", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)" }}>
              <iframe
                srcDoc={htmlContent}
                style={{
                  width: "100%", height: "70vh",
                  background: "white", border: "none",
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div style={{ background: isDark ? ds.surface : "white", borderTop: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <button onClick={onBack} style={{ height: 44, padding: "0 24px", borderRadius: 12, background: "transparent", border: `1px solid ${isDark ? ds.border : "#CBD5E1"}`, color: ds.textSecondary, fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark?ds.surface2:"#F8FAFC"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
          {isRTL ? "إغلاق" : "Close"}
        </button>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setShowTransactionForm(true)} style={{ height: 44, padding: "0 20px", borderRadius: 12, background: "#10B981", border: "none", color: "white", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, cursor: "pointer", transition: "0.2s", boxShadow: "0 4px 12px rgba(16,185,129,0.2)" }} onMouseOver={e=>e.currentTarget.style.transform="translateY(-1px)"} onMouseOut={e=>e.currentTarget.style.transform="none"}>
            <DollarSign size={18} /> {isRTL ? "إصدار راتب / سلفة" : "Issue Salary/Advance"}
          </button>
          <button onClick={handlePrintProfile} style={{ height: 44, padding: "0 20px", borderRadius: 12, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", color: ds.textPrimary, display: "flex", alignItems: "center", gap: 8, fontWeight: 700, cursor: "pointer", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,0.05)":"#E2E8F0"} onMouseOut={e=>e.currentTarget.style.background=isDark?ds.surface2:"#F1F5F9"}>
            <Printer size={18} /> {isRTL ? "طباعة" : "Print"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showTransactionForm && (
          <TransactionFormSheet
            initialType="expense"
            initialEntity={{ type: "employee", name: employee.name }}
            initialCategory="salaries"
            onClose={() => setShowTransactionForm(false)}
            onSave={(data, print) => {
              // In a real app, this would post to the backend, print the voucher, and refresh the ledger.
              toast.success(isRTL ? "تم حفظ سند الصرف بنجاح وتحديث الكشف." : "Voucher saved and ledger updated.");
              setShowTransactionForm(false);
            }}
          />
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
}
