import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Printer, Download, TrendingUp, TrendingDown, DollarSign, FileText, User, HelpCircle, ChevronRight, ChevronLeft, Search, X } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_SALES_INVOICES, MOCK_SALES_INVOICE_ITEMS } from "@/core/data/salesMockData";
import { MOCK_BUSINESS } from "@/core/data/mockData";
import { generateStatementHTML, StatementData } from "../utils/statementUtils";
import { InvoiceDetailScreen } from "@/features/sales/screens/InvoiceDetailScreen";
import { useFinancialStore } from "@/core/engine/useFinancialStore";
import { useToast } from "@/providers/ToastProvider";
import { MOCK_CURRENCIES } from "@/core/data/financeMockData";

export function CustomerStatementScreen({ customer: initialCustomer, onBack }: { customer: any, onBack: () => void }) {
  const { t, isDark, isRTL, ds } = useApp();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const currency = "ر.ي";
  const [activeTab, setActiveTab] = useState<"overview" | "ledger" | "invoices">("overview");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const store = useFinancialStore();
  const toast = useToast();

  const [currentCustomerId, setCurrentCustomerId] = useState(initialCustomer.id);
  const customer = store.customers.find(c => c.id === currentCustomerId) || initialCustomer;

  const currentIndex = store.customers.findIndex(c => c.id === customer.id);
  const handlePrev = () => { if (currentIndex > 0) setCurrentCustomerId(store.customers[currentIndex - 1].id); };
  const handleNext = () => { if (currentIndex < store.customers.length - 1) setCurrentCustomerId(store.customers[currentIndex + 1].id); };

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = store.customers.filter(c => 
    c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.phone && c.phone.includes(searchQuery))
  );

  // Manual Receipt Voucher State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentRef, setPaymentRef] = useState("");
  
  const baseCurrency = MOCK_CURRENCIES.find(c => c.is_base_currency)?.id || "cur_yer";
  const [paymentCurrency, setPaymentCurrency] = useState(baseCurrency);

  const transactions = store.getCustomerLedger(customer.id).map(tx => ({
    ...tx,
    date: new Date(tx.date).toLocaleDateString(isRTL ? "ar-YE" : "en-US"),
    type: isRTL ? tx.type_ar : tx.type,
    description: isRTL ? tx.description_ar : tx.description
  }));

  const totalDebit = transactions.reduce((sum, tx) => sum + tx.debit, 0);
  const totalCredit = transactions.reduce((sum, tx) => sum + tx.credit, 0);
  const currentBalance = totalDebit - totalCredit;

  const customerInvoices = store.invoices.filter(i => i.customer_id === customer.id);

  const statementData: StatementData = {
    businessName: MOCK_BUSINESS.business_name,
    businessPhone: MOCK_BUSINESS.primary_phone ?? "",
    businessAddress: "صنعاء، شارع الزبيري",
    customerName: customer.customer_name,
    customerPhone: customer.phone,
    reportDate: new Date().toLocaleDateString(isRTL ? "ar-YE" : "en-US"),
    openingBalance: 0,
    totalSales: totalDebit,
    totalPayments: totalCredit,
    totalReturns: 0,
    currentBalance: currentBalance,
    invoicesCount: customerInvoices.length,
    paymentsCount: transactions.filter(t => t.credit > 0).length,
    transactions: transactions,
    currency,
    isRTL,
    appName: isRTL ? "تاجر" : "Tajir",
  };

  const htmlContent = generateStatementHTML({ ...statementData, autoPrint: false });

  function handlePrint() {
    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) return;
    const printHtml = generateStatementHTML({ ...statementData, autoPrint: true });
    printWindow.document.write(printHtml);
    printWindow.document.close();
  }

  function handleSaveReceipt() {
    const amt = parseFloat(paymentAmount);
    if (!(amt > 0)) return;

    const currencyObj = MOCK_CURRENCIES.find(c => c.id === paymentCurrency) || MOCK_CURRENCIES.find(c => c.is_base_currency);
    const exRate = currencyObj?.exchange_rate ?? 1;
    const baseAmt = amt * exRate;
    const receiptId = `rv_${Date.now()}`;

    // Find the oldest unpaid invoice to link against (optional)
    const unpaidInvoice = store.invoices.find(
      i => i.customer_id === customer.id && i.payment_status !== "Paid"
    );

    // ✅ Single call to the central service — it creates the GL entry internally
    store.addReceiptVoucher({
      id: receiptId,
      customer_id: customer.id,
      invoice_id: unpaidInvoice?.id,
      amount: amt,
      base_amount: baseAmt,
      currency_id: paymentCurrency,
      exchange_rate: exRate,
      method: paymentMethod,
      ref: paymentRef || `RV-${Date.now().toString().slice(-5)}`,
      date: new Date().toISOString(),
      notes: `تسديد مديونية - ${customer.customer_name}`,
    });

    toast.success(isRTL ? "تم حفظ سند القبض بنجاح" : "Receipt saved successfully");
    setPaymentAmount("");
    setPaymentRef("");
    setIsPaymentModalOpen(false);
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
          <div style={{ width: 50, height: 50, borderRadius: 16, background: "linear-gradient(135deg, #4338CA, #6D28D9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={24} color="white" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h2 style={{ color: ds.textPrimary, fontSize: 22, fontWeight: 800, margin: "0" }}>{customer.customer_name}</h2>
              <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: customer.is_active !== false ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: customer.is_active !== false ? "#10B981" : "#EF4444" }}>
                 {customer.is_active !== false ? (isRTL ? "نشط" : "Active") : (isRTL ? "موقوف" : "Inactive")}
              </span>
            </div>
            <p style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 500, margin: "4px 0 0 0" }}>{customer.phone || (isRTL ? "بدون هاتف" : "No Phone")} • {customer.email || (isRTL ? "بدون بريد" : "No Email")}</p>
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Navigation Controls */}
          <div style={{ display: "flex", alignItems: "center", background: isDark ? ds.surface2 : "#F1F5F9", borderRadius: 12, padding: "4px" }}>
            <button onClick={handlePrev} disabled={currentIndex === 0} style={{ width: 36, height: 36, borderRadius: 8, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: currentIndex === 0 ? "not-allowed" : "pointer", color: currentIndex === 0 ? ds.textMuted : ds.textPrimary, transition: "0.2s" }} onMouseOver={e=> {if (currentIndex>0) e.currentTarget.style.background=isDark?"rgba(255,255,255,0.05)":"white"}} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
              {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <div style={{ width: 1, height: 20, background: isDark ? ds.border : "#CBD5E1", margin: "0 4px" }} />
            <button onClick={handleNext} disabled={currentIndex === store.customers.length - 1} style={{ width: 36, height: 36, borderRadius: 8, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: currentIndex === store.customers.length - 1 ? "not-allowed" : "pointer", color: currentIndex === store.customers.length - 1 ? ds.textMuted : ds.textPrimary, transition: "0.2s" }} onMouseOver={e=> {if (currentIndex < store.customers.length - 1) e.currentTarget.style.background=isDark?"rgba(255,255,255,0.05)":"white"}} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
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
            placeholder={isRTL ? "ابحث عن عميل (الاسم، الهاتف)..." : "Search customer..."} 
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
                <div key={res.id} onClick={() => { setCurrentCustomerId(res.id); setShowSearch(false); setSearchQuery(""); }} style={{ padding: "12px", borderRadius: 8, cursor: "pointer", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark?ds.surface2:"#F1F5F9"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{ color: ds.textPrimary, fontWeight: 700, fontSize: 14 }}>{res.customer_name}</div>
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
          { id: "ledger", label: isRTL ? "كشف الحساب" : "Statement" },
          { id: "invoices", label: isRTL ? "الفواتير" : "Invoices" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: "none", border: "none", padding: "16px 0", cursor: "pointer",
              color: activeTab === tab.id ? ds.primary : ds.textSecondary,
              fontSize: 15, fontWeight: activeTab === tab.id ? 800 : 600,
              borderBottom: activeTab === tab.id ? `3px solid ${ds.primary}` : "3px solid transparent",
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

          <div style={{ display: "flex", gap: 20, flexDirection: "column" }}>
            {/* Summary Cards */}
            <div style={{ display: "flex", gap: 20 }}>
              <div style={{ flex: 1, background: isDark ? ds.surface : "white", borderRadius: 16, padding: 20, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><TrendingUp size={20} color="#3B82F6"/></div>
                    <span style={{ color: ds.textSecondary, fontSize: 14, fontWeight: 600 }}>{isRTL ? "إجمالي المبيعات" : "Total Sales"}</span>
                  </div>
                  <div title={isRTL ? "مجموع قيمة جميع فواتير البيع الصادرة لهذا العميل." : "Total value of all sales invoices issued for this customer."} style={{ cursor: "help", color: ds.textMuted }}>
                    <HelpCircle size={16} />
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: ds.textPrimary }}>{totalDebit.toLocaleString()} <span style={{ fontSize: 14, color: ds.textMuted }}>{currency}</span></div>
              </div>

              <div style={{ flex: 1, background: isDark ? ds.surface : "white", borderRadius: 16, padding: 20, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><TrendingDown size={20} color="#10B981"/></div>
                    <span style={{ color: ds.textSecondary, fontSize: 14, fontWeight: 600 }}>{isRTL ? "إجمالي المدفوعات" : "Total Payments"}</span>
                  </div>
                  <div title={isRTL ? "مجموع جميع المبالغ التي دفعها العميل حتى الآن." : "Total amount paid by the customer so far."} style={{ cursor: "help", color: ds.textMuted }}>
                    <HelpCircle size={16} />
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: ds.textPrimary }}>{totalCredit.toLocaleString()} <span style={{ fontSize: 14, color: ds.textMuted }}>{currency}</span></div>
              </div>

              <div style={{ flex: 1, background: isDark ? ds.surface : "white", borderRadius: 16, padding: 20, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><DollarSign size={20} color="#F59E0B"/></div>
                    <span style={{ color: ds.textSecondary, fontSize: 14, fontWeight: 600 }}>{isRTL ? "الرصيد المستحق" : "Due Balance"}</span>
                  </div>
                  <div title={isRTL ? "المبلغ الذي لا يزال على العميل سداده حتى هذه اللحظة." : "The remaining amount the customer still needs to pay."} style={{ cursor: "help", color: ds.textMuted }}>
                    <HelpCircle size={16} />
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: ds.textPrimary }}>{currentBalance.toLocaleString()} <span style={{ fontSize: 14, color: ds.textMuted }}>{currency}</span></div>
              </div>
            </div>
            
            <div style={{ background: isDark ? ds.surface : "white", borderRadius: 16, padding: 24, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
               <h3 style={{ margin: "0 0 16px 0", color: ds.textPrimary }}>{isRTL ? "معلومات إضافية" : "Additional Information"}</h3>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                 <div>
                    <p style={{ color: ds.textSecondary, fontSize: 13, marginBottom: 4 }}>{isRTL ? "الحد الائتماني" : "Credit Limit"}</p>
                    <p style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 700 }}>{customer.credit_limit.toLocaleString()} {currency}</p>
                 </div>
                 <div>
                    <p style={{ color: ds.textSecondary, fontSize: 13, marginBottom: 4 }}>{isRTL ? "حالة الحساب" : "Account Status"}</p>
                    <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: customer.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: customer.is_active ? "#10B981" : "#EF4444" }}>
                      {customer.is_active ? (isRTL ? "نشط" : "Active") : (isRTL ? "موقوف" : "Inactive")}
                    </span>
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === "ledger" && (
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

        {activeTab === "invoices" && (
          <div style={{ background: isDark ? ds.surface : "white", borderRadius: 16, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
              <thead>
                <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `2px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                  <th style={{ padding: "20px", color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 16, fontWeight: 900 }}>{isRTL ? "رقم الفاتورة" : "Invoice No"}</th>
                  <th style={{ padding: "20px", color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 16, fontWeight: 900 }}>{isRTL ? "التاريخ" : "Date"}</th>
                  <th style={{ padding: "20px", color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 16, fontWeight: 900 }}>{isRTL ? "الحالة" : "Status"}</th>
                  <th style={{ padding: "20px", color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 16, fontWeight: 900 }}>{isRTL ? "الإجمالي" : "Total"}</th>
                  <th style={{ padding: "20px", color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 16, fontWeight: 900 }}>{isRTL ? "المدفوع" : "Paid"}</th>
                  <th style={{ padding: "20px", color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 16, fontWeight: 900 }}>{isRTL ? "المتبقي" : "Remaining"}</th>
                  <th style={{ padding: "20px", color: isDark ? "#F8FAFC" : "#0F172A", fontSize: 16, fontWeight: 900 }}>{isRTL ? "طريقة الدفع" : "Method"}</th>
                </tr>
              </thead>
              <tbody>
                {customerInvoices.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: ds.textMuted }}>{isRTL ? "لا توجد فواتير لهذا العميل حتى الآن." : "No invoices found for this customer."}</td></tr>
                ) : (
                  (() => {
                    return customerInvoices.map((inv, idx) => {
                      const finalPaid = store.getInvoiceTotalPaid(inv.id);
                      const remaining = inv.grand_total - finalPaid;
                      const displayStatus = inv.payment_status;
                      
                      return (
                        <motion.tr key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                          onClick={() => {
                            const items = MOCK_SALES_INVOICE_ITEMS.filter(it => it.sales_invoice_id === inv.id).map(it => ({
                              ...it,
                              product_unit: { product: { product_name: `منتج تجريبي ${it.product_unit_id}` } }
                            })) as any;
                            setSelectedInvoice({ ...inv, items, customer, mock_paid_amount: finalPaid, payment_status: displayStatus });
                          }}
                          style={{ borderBottom: idx === customerInvoices.length - 1 ? "none" : `1px solid ${isDark ? ds.border : "#F1F5F9"}`, transition: "background 0.2s", cursor: "pointer" }}
                          onMouseOver={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC"}
                          onMouseOut={e => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "20px", color: ds.primary, fontSize: 16, fontWeight: 800, direction: "ltr", textAlign: isRTL ? "right" : "left" }}>{inv.invoice_number}</td>
                          <td style={{ padding: "20px", color: ds.textSecondary, fontSize: 15, fontWeight: 700 }}>{new Date(inv.invoice_date).toLocaleDateString(isRTL ? "ar-YE" : "en-US")}</td>
                          <td style={{ padding: "20px" }}>
                            <span style={{
                              padding: "6px 12px", borderRadius: 8, fontSize: 14, fontWeight: 800,
                              background: displayStatus === "Paid" ? "rgba(16,185,129,0.1)" : displayStatus === "Partial" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                              color: displayStatus === "Paid" ? "#10B981" : displayStatus === "Partial" ? "#F59E0B" : "#EF4444"
                            }}>
                              {isRTL ? (displayStatus === "Paid" ? "مدفوعة" : displayStatus === "Partial" ? "جزئي" : "غير مدفوعة") : displayStatus}
                            </span>
                          </td>
                          <td style={{ padding: "20px", color: ds.textPrimary, fontSize: 16, fontWeight: 900 }}>{inv.grand_total.toLocaleString()}</td>
                          <td style={{ padding: "20px", color: "#10B981", fontSize: 16, fontWeight: 900 }}>{finalPaid.toLocaleString()}</td>
                          <td style={{ padding: "20px", color: remaining > 0 ? "#EF4444" : ds.textMuted, fontSize: 16, fontWeight: 900 }}>{remaining.toLocaleString()}</td>
                          <td style={{ padding: "20px", color: ds.textSecondary, fontSize: 15, fontWeight: 700 }}>
                            {inv.payment_method === "Cash" ? (isRTL ? "نقدي" : "Cash") :
                             inv.payment_method === "Card" ? (isRTL ? "بطاقة" : "Card") :
                             inv.payment_method === "Bank" ? (isRTL ? "تحويل بنكي" : "Bank Transfer") :
                             inv.payment_method === "Credit" ? (isRTL ? "آجل (ذمة)" : "Credit") :
                             inv.payment_method || (isRTL ? "آجل" : "Credit")}
                          </td>
                        </motion.tr>
                      );
                    });
                  })()
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div style={{ background: isDark ? ds.surface : "white", borderTop: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <button onClick={onBack} style={{ height: 44, padding: "0 24px", borderRadius: 12, background: "transparent", border: `1px solid ${isDark ? ds.border : "#CBD5E1"}`, color: ds.textSecondary, fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark?ds.surface2:"#F8FAFC"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
          {isRTL ? "إغلاق" : "Close"}
        </button>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setIsPaymentModalOpen(true)} style={{ height: 44, padding: "0 20px", borderRadius: 12, background: "#10B981", border: "none", color: "white", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, cursor: "pointer", transition: "0.2s", boxShadow: "0 4px 12px rgba(16,185,129,0.2)" }} onMouseOver={e=>e.currentTarget.style.transform="translateY(-1px)"} onMouseOut={e=>e.currentTarget.style.transform="none"}>
            <DollarSign size={18} /> {isRTL ? "تسديد مديونية" : "Make Payment"}
          </button>
          <button onClick={handlePrint} style={{ height: 44, padding: "0 20px", borderRadius: 12, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", color: ds.textPrimary, display: "flex", alignItems: "center", gap: 8, fontWeight: 700, cursor: "pointer", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark?"rgba(255,255,255,0.05)":"#E2E8F0"} onMouseOut={e=>e.currentTarget.style.background=isDark?ds.surface2:"#F1F5F9"}>
            <Printer size={18} /> {isRTL ? "طباعة" : "Print"}
          </button>
        </div>
      </div>

      {selectedInvoice && (
        <InvoiceDetailScreen 
          invoice={selectedInvoice} 
          onBack={() => setSelectedInvoice(null)} 
        />
      )}

      {isPaymentModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ width: "100%", maxWidth: 400, background: isDark ? ds.surface : "white", borderRadius: 24, padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.2)", border: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
            <h3 style={{ margin: "0 0 24px 0", color: ds.textPrimary, fontSize: 20, fontWeight: 800 }}>{isRTL ? "تسديد مديونية (سند قبض)" : "Make Payment"}</h3>
            
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              <div style={{ flex: 2 }}>
                <label style={{ display: "block", marginBottom: 12, fontSize: 15, fontWeight: 800, color: ds.textSecondary }}>{isRTL ? "المبلغ المدفوع" : "Amount"}</label>
                <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)}
                  style={{ width: "100%", height: 60, boxSizing: "border-box", padding: "0 16px", borderRadius: 14, border: `1.5px solid ${isDark ? ds.border : "#CBD5E1"}`, background: isDark ? ds.surface2 : "white", color: ds.textPrimary, fontSize: 20, fontWeight: 900, outline: "none" }}
                  placeholder="0.00" autoFocus
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: 12, fontSize: 15, fontWeight: 800, color: ds.textSecondary }}>{isRTL ? "العملة" : "Currency"}</label>
                <select 
                  value={paymentCurrency} 
                  onChange={e => setPaymentCurrency(e.target.value)}
                  style={{ width: "100%", height: 60, boxSizing: "border-box", padding: "0 16px", borderRadius: 14, border: `1.5px solid ${isDark ? ds.border : "#CBD5E1"}`, background: isDark ? ds.surface2 : "white", color: ds.textPrimary, fontSize: 16, outline: "none", fontWeight: 800, appearance: "none" }}
                >
                  {MOCK_CURRENCIES.map(c => (
                    <option key={c.id} value={c.id}>{c.currency_symbol} ({c.currency_code})</option>
                  ))}
                </select>
              </div>
            </div>
            
            {(() => {
              const amt = parseFloat(paymentAmount || "0");
              const currObj = MOCK_CURRENCIES.find(c => c.id === paymentCurrency);
              if (amt > 0 && currObj && currObj.exchange_rate !== 1) {
                const baseAmt = amt * currObj.exchange_rate;
                const baseCurrencyObj = MOCK_CURRENCIES.find(c => c.is_base_currency);
                const baseSym = baseCurrencyObj?.currency_symbol || "ر.ي";
                return (
                  <div style={{ marginBottom: 20, padding: 12, background: isDark ? "rgba(16,185,129,0.1)" : "#ECFDF5", borderRadius: 12, border: `1px solid ${isDark ? "rgba(16,185,129,0.2)" : "#A7F3D0"}`, display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <DollarSign size={16} color="white" />
                    </div>
                    <div>
                      <p style={{ margin: 0, color: ds.textPrimary, fontSize: 14, fontWeight: 700 }}>
                        {isRTL ? "المعادل:" : "Equivalent:"} {baseAmt.toLocaleString()} {baseSym}
                      </p>
                      <p style={{ margin: "4px 0 0 0", color: ds.textSecondary, fontSize: 12 }}>
                        {isRTL ? "(سعر الصرف:" : "(Exchange Rate:"} {currObj.exchange_rate})
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 12, fontSize: 15, fontWeight: 800, color: ds.textSecondary }}>{isRTL ? "طريقة الدفع" : "Method"}</label>
              <div style={{ display: "flex", gap: 16 }}>
                {["Cash", "Bank"].map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    style={{ flex: 1, height: 60, borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: "pointer", transition: "0.2s",
                      background: paymentMethod === m ? ds.primary : (isDark ? ds.surface2 : "#F8FAFC"),
                      color: paymentMethod === m ? "white" : ds.textSecondary,
                      border: `1.5px solid ${paymentMethod === m ? ds.primary : (isDark ? ds.border : "#E2E8F0")}`
                    }}>
                    {m === "Cash" ? (isRTL ? "نقدي" : "Cash") : (isRTL ? "تحويل بنكي" : "Bank")}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "block", marginBottom: 12, fontSize: 15, fontWeight: 800, color: ds.textSecondary }}>{isRTL ? "رقم المرجع / الحوالة" : "Reference"}</label>
              <input type="text" value={paymentRef} onChange={e => setPaymentRef(e.target.value)}
                style={{ width: "100%", height: 60, boxSizing: "border-box", padding: "0 16px", borderRadius: 14, border: `1.5px solid ${isDark ? ds.border : "#CBD5E1"}`, background: isDark ? ds.surface2 : "white", color: ds.textPrimary, fontSize: 16, fontWeight: 700, outline: "none" }}
                placeholder={isRTL ? "اختياري" : "Optional"}
              />
            </div>

            <div style={{ display: "flex", gap: 16 }}>
              <button onClick={() => setIsPaymentModalOpen(false)} style={{ flex: 1, height: 60, borderRadius: 14, background: "transparent", border: `1.5px solid ${isDark ? ds.border : "#CBD5E1"}`, color: ds.textSecondary, fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button 
                onClick={handleSaveReceipt}
                style={{ flex: 2, height: 60, borderRadius: 14, background: ds.primary, border: "none", color: "white", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 6px 20px rgba(37,99,235,0.3)" }}>
                {isRTL ? "حفظ السند" : "Save Receipt"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </motion.div>
    </div>
  );
}
