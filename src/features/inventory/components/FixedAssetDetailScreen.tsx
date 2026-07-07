import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, ArrowRight, Cpu, MapPin, Calendar, DollarSign, Activity, Settings, 
  Wrench, TrendingDown, FileCheck, X, ChevronRight, ChevronLeft, Search, 
  Printer, Archive, AlertTriangle, Paperclip, FileText, ArrowRightLeft,
  Banknote, Edit, EyeOff, CheckCircle, Plus
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { FixedAsset } from "@/core/data/inventoryExtraMockData";
import { PurchaseInvoiceDetailScreen } from "@/features/purchases/components/PurchaseInvoiceDetailScreen";
import { useToast } from "@/providers/ToastProvider";

interface FixedAssetDetailScreenProps {
  initialAssetId: string;
  assets: FixedAsset[];
  onClose: () => void;
  onEdit: (asset: FixedAsset) => void;
}

export function FixedAssetDetailScreen({ initialAssetId, assets, onClose, onEdit }: FixedAssetDetailScreenProps) {
  const { isDark, isRTL, ds } = useApp();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState<"overview" | "financial" | "depreciation" | "maintenance" | "movements" | "attachments" | "notes">("overview");
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentAssetId, setCurrentAssetId] = useState(initialAssetId);

  const currentIndex = assets.findIndex(a => a.id === currentAssetId);
  const asset = assets[currentIndex] || assets[0];

  useEffect(() => {
    // If user searches and presses Enter or selects, we could change currentAssetId. 
    // For now, let's keep it simple: smart search filters a dropdown or auto-selects if exact match.
    if (searchQuery.length > 2) {
      const match = assets.find(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (match && match.id !== currentAssetId) {
        setCurrentAssetId(match.id);
      }
    }
  }, [searchQuery, assets, currentAssetId]);

  const handleNext = () => {
    if (currentIndex < assets.length - 1) {
      setCurrentAssetId(assets[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentAssetId(assets[currentIndex - 1].id);
    }
  };

  // Mock Extra Data
  const maintenanceLogs = [
    { id: 1, date: "2024-03-15", type: "Routine", cost: 15000, desc: "تغيير قطع استهلاكية وفحص شامل", technician: "شركة الصيانة المعتمدة" },
    { id: 2, date: "2023-11-02", type: "Repair", cost: 45000, desc: "إصلاح عطل مفاجئ في لوحة التحكم", technician: "م. أحمد عبدالسلام" }
  ];

  const depreciationSchedule = [
    { year: 2023, value_start: asset.cost, depreciation_amount: asset.cost * 0.15, value_end: asset.cost * 0.85 },
    { year: 2024, value_start: asset.cost * 0.85, depreciation_amount: asset.cost * 0.15, value_end: asset.cost * 0.70 },
    { year: 2025, value_start: asset.cost * 0.70, depreciation_amount: asset.cost * 0.15, value_end: asset.cost * 0.55 },
  ];

  const movements = [
    { id: 1, date: "2023-01-10", type: "purchase", label: isRTL ? "شراء الأصل" : "Asset Purchase", ref: "INV-2023-001" },
    { id: 2, date: "2023-11-02", type: "maintenance", label: isRTL ? "صيانة إصلاح" : "Repair Maintenance", ref: "MN-2023-045" },
    { id: 3, date: "2024-01-15", type: "transfer", label: isRTL ? "نقل إلى الفرع الرئيسي" : "Transfer to Main Branch", ref: "TR-2024-012" },
  ];

  const attachments = [
    { id: 1, name: "فاتورة الشراء.pdf", size: "2.4 MB", date: "2023-01-10" },
    { id: 2, name: "شهادة الضمان.pdf", size: "1.1 MB", date: "2023-01-12" },
    { id: 3, name: "صورة_الأصل.jpg", size: "4.5 MB", date: "2023-01-10" },
  ];

  const mockInvoice = {
    invoice_number: `INV-FA-${asset.id}`,
    supplier_id: "s_1",
    purchase_date: asset.purchase_date,
    payment_method: "أجل",
    payment_status: "Paid",
    status: "partially_paid",
    sub_total: asset.cost,
    grand_total: asset.cost,
    items: [{ product_name: asset.name, quantity: 1, unit_price: asset.cost, line_total: asset.cost }]
  };

  const mockSupplier = {
    id: "s_1", supplier_name: "شركة التوريدات التقنية / أثاث مكتبي", phone: "967771234567"
  };

  const isExcellent = asset.status === 'excellent';
  const isMaintenance = asset.status === 'needs_maintenance';
  const statusLabel = isExcellent ? (isRTL ? "ممتاز" : "Excellent") : isMaintenance ? (isRTL ? "صيانة" : "Maintenance") : (isRTL ? "تالف" : "Broken");
  const statusColor = isExcellent ? "#10B981" : isMaintenance ? "#F59E0B" : "#EF4444";
  const statusBg = isExcellent ? "rgba(16,185,129,0.15)" : isMaintenance ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)";

  const surfaceColor = isDark ? ds.surface : "#FFFFFF";
  const borderColor = isDark ? ds.border : "#E2E8F0";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", padding: 16 }}>
      {/* Backdrop */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }} />
      
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{ position: "relative", width: "100%", maxWidth: 1200, height: "92vh", background: isDark ? ds.bg : "#F8FAFC", borderRadius: 24, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.3)", border: `1px solid ${borderColor}` }}
      >
        
        {/* Header - Top Row with Search and Nav */}
        <div style={{ background: surfaceColor, padding: "16px 24px", borderBottom: `1px solid ${borderColor}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={onClose} style={{ width: 48, height: 48, borderRadius: 14, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark ? ds.border : "#E2E8F0"} onMouseOut={e=>e.currentTarget.style.background=isDark ? ds.surface2 : "#F1F5F9"}>
              <X size={24} color={ds.textPrimary} />
            </button>
            <div style={{ position: "relative", width: 300 }}>
              <Search size={20} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 16, pointerEvents: "none" }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={isRTL ? "بحث ذكي عن أصل..." : "Smart search asset..."} style={{ width: "100%", height: 48, boxSizing: "border-box", paddingInlineStart: 48, paddingInlineEnd: 16, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 14, color: ds.textPrimary, fontSize: 15, fontWeight: 600, outline: "none", fontFamily: "inherit" }} />
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", background: isDark ? ds.surface2 : "#F1F5F9", borderRadius: 14, padding: 4 }}>
              <button onClick={handlePrev} disabled={currentIndex === 0} style={{ width: 40, height: 40, borderRadius: 10, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: currentIndex === 0 ? "not-allowed" : "pointer", opacity: currentIndex === 0 ? 0.3 : 1, transition: "0.2s" }} onMouseOver={e=> currentIndex !== 0 && (e.currentTarget.style.background = isDark ? ds.border : "#E2E8F0")} onMouseOut={e=> e.currentTarget.style.background = "transparent"}>
                {isRTL ? <ChevronRight size={22} color={ds.textPrimary} /> : <ChevronLeft size={22} color={ds.textPrimary} />}
              </button>
              <div style={{ padding: "0 12px", color: ds.textSecondary, fontSize: 14, fontWeight: 700 }}>
                {currentIndex + 1} / {assets.length}
              </div>
              <button onClick={handleNext} disabled={currentIndex === assets.length - 1} style={{ width: 40, height: 40, borderRadius: 10, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: currentIndex === assets.length - 1 ? "not-allowed" : "pointer", opacity: currentIndex === assets.length - 1 ? 0.3 : 1, transition: "0.2s" }} onMouseOver={e=> currentIndex !== assets.length - 1 && (e.currentTarget.style.background = isDark ? ds.border : "#E2E8F0")} onMouseOut={e=> e.currentTarget.style.background = "transparent"}>
                {isRTL ? <ChevronLeft size={22} color={ds.textPrimary} /> : <ChevronRight size={22} color={ds.textPrimary} />}
              </button>
            </div>
          </div>
        </div>

        {/* Asset Header Info */}
        <div style={{ background: surfaceColor, padding: "24px", borderBottom: `1px solid ${borderColor}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg, #10B981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(16,185,129,0.3)" }}>
              <Cpu size={40} color="white" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <h2 style={{ color: ds.textPrimary, fontSize: 28, fontWeight: 900, margin: 0 }}>{asset.name}</h2>
                <span style={{ padding: "6px 12px", borderRadius: 10, background: statusBg, color: statusColor, fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                  <Activity size={16} strokeWidth={2.5} /> {statusLabel}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 24, color: ds.textSecondary, fontSize: 15, fontWeight: 600 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Search size={16} /> {isRTL ? "الكود:" : "Code:"} <span style={{ color: ds.textPrimary, fontWeight: 800 }}>{asset.code}</span></span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Settings size={16} /> {isRTL ? "النوع:" : "Type:"} <span style={{ color: ds.textPrimary, fontWeight: 800 }}>{asset.category}</span></span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={16} /> {isRTL ? "الموقع:" : "Location:"} <span style={{ color: ds.textPrimary, fontWeight: 800 }}>{asset.location}</span></span>
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 450 }}>
            <button onClick={() => onEdit(asset)} style={{ height: 48, background: isDark ? ds.surface2 : "#F1F5F9", border: `1.5px solid ${borderColor}`, borderRadius: 12, padding: "0 16px", color: ds.textPrimary, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <Edit size={18} /> {isRTL ? "تعديل" : "Edit"}
            </button>
            <button onClick={() => toast.info(isRTL ? "سيتم تفعيل طباعة البطاقة قريباً" : "Print Card feature coming soon")} style={{ height: 48, background: isDark ? ds.surface2 : "#F1F5F9", border: `1.5px solid ${borderColor}`, borderRadius: 12, padding: "0 16px", color: ds.textPrimary, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <Printer size={18} /> {isRTL ? "بطاقة الأصل" : "Print Card"}
            </button>
            <button onClick={() => toast.info(isRTL ? "ميزة النقل ستتوفر قريباً" : "Transfer feature coming soon")} style={{ height: 48, background: "rgba(59,130,246,0.1)", border: `1.5px solid rgba(59,130,246,0.2)`, borderRadius: 12, padding: "0 16px", color: "#3B82F6", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <ArrowRightLeft size={18} /> {isRTL ? "نقل" : "Transfer"}
            </button>
            <button onClick={() => toast.info(isRTL ? "ميزة الصيانة ستتوفر قريباً" : "Maintenance feature coming soon")} style={{ height: 48, background: "rgba(245,158,11,0.1)", border: `1.5px solid rgba(245,158,11,0.2)`, borderRadius: 12, padding: "0 16px", color: "#F59E0B", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <Wrench size={18} /> {isRTL ? "صيانة" : "Maintenance"}
            </button>
            <button onClick={() => toast.info(isRTL ? "ميزة البيع ستتوفر قريباً" : "Sell feature coming soon")} style={{ height: 48, background: "rgba(16,185,129,0.1)", border: `1.5px solid rgba(16,185,129,0.2)`, borderRadius: 12, padding: "0 16px", color: "#10B981", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <Banknote size={18} /> {isRTL ? "بيع" : "Sell"}
            </button>
            <button onClick={() => toast.info(isRTL ? "ميزة الإيقاف ستتوفر قريباً" : "Suspend feature coming soon")} style={{ height: 48, background: "rgba(239,68,68,0.1)", border: `1.5px solid rgba(239,68,68,0.2)`, borderRadius: 12, padding: "0 16px", color: "#EF4444", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <EyeOff size={18} /> {isRTL ? "إيقاف" : "Suspend"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: surfaceColor, borderBottom: `1.5px solid ${borderColor}`, padding: "0 24px", display: "flex", gap: 24, overflowX: "auto" }}>
          {[
            { id: "overview", label: isRTL ? "نظرة عامة" : "Overview", icon: Settings },
            { id: "financial", label: isRTL ? "المعلومات المالية" : "Financial Info", icon: DollarSign },
            { id: "depreciation", label: isRTL ? "الإهلاك" : "Depreciation", icon: TrendingDown },
            { id: "maintenance", label: isRTL ? "الصيانة" : "Maintenance", icon: Wrench },
            { id: "movements", label: isRTL ? "الحركات" : "Movements", icon: ArrowRightLeft },
            { id: "attachments", label: isRTL ? "المرفقات" : "Attachments", icon: Paperclip },
            { id: "notes", label: isRTL ? "الملاحظات" : "Notes", icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: "none", border: "none", padding: "20px 4px", cursor: "pointer", position: "relative",
                  color: isActive ? "#10B981" : ds.textSecondary,
                  fontSize: 16, fontWeight: isActive ? 800 : 700,
                  display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", transition: "color 0.2s"
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} /> {tab.label}
                {isActive && <motion.div layoutId="faTabId" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "#10B981", borderRadius: "4px 4px 0 0" }} />}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 32, background: isDark ? ds.bg : "#F8FAFC" }}>
          
          {activeTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
              <div style={{ background: surfaceColor, padding: 24, borderRadius: 20, border: `1.5px solid ${borderColor}`, display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "تكلفة الشراء الأصلية" : "Original Purchase Cost"}</span>
                <span style={{ fontSize: 32, fontWeight: 900, color: ds.textPrimary }}>{asset.cost.toLocaleString()} <span style={{ fontSize: 16, color: ds.textMuted }}>YER</span></span>
              </div>
              <div style={{ background: surfaceColor, padding: 24, borderRadius: 20, border: `1.5px solid ${borderColor}`, display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "مجمع الإهلاك" : "Accumulated Depreciation"}</span>
                <span style={{ fontSize: 32, fontWeight: 900, color: "#EF4444" }}>{(asset.cost * 0.45).toLocaleString()} <span style={{ fontSize: 16, color: ds.textMuted }}>YER</span></span>
              </div>
              <div style={{ background: surfaceColor, padding: 24, borderRadius: 20, border: `1.5px solid ${borderColor}`, display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "صافي القيمة الدفترية" : "Net Book Value"}</span>
                <span style={{ fontSize: 32, fontWeight: 900, color: "#10B981" }}>{(asset.cost * 0.55).toLocaleString()} <span style={{ fontSize: 16, color: ds.textMuted }}>YER</span></span>
              </div>
              <div style={{ background: surfaceColor, padding: 24, borderRadius: 20, border: `1.5px solid ${borderColor}`, display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "العمر الإنتاجي المتبقي" : "Remaining Life"}</span>
                <span style={{ fontSize: 32, fontWeight: 900, color: ds.textPrimary }}>{isRTL ? "3 سنوات" : "3 Years"}</span>
              </div>
              <div style={{ background: surfaceColor, padding: 24, borderRadius: 20, border: `1.5px solid ${borderColor}`, display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "إجمالي عمليات الصيانة" : "Total Maintenance"}</span>
                <span style={{ fontSize: 32, fontWeight: 900, color: "#F59E0B" }}>{maintenanceLogs.length} <span style={{ fontSize: 16, color: ds.textMuted }}>{isRTL ? "عمليات" : "Logs"}</span></span>
              </div>
              <div style={{ background: surfaceColor, padding: 24, borderRadius: 20, border: `1.5px solid ${borderColor}`, display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "نسبة الإهلاك السنوي" : "Annual Dep. Rate"}</span>
                <span style={{ fontSize: 32, fontWeight: 900, color: ds.textPrimary }}>15%</span>
              </div>
            </div>
          )}

          {activeTab === "financial" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: surfaceColor, padding: 32, borderRadius: 20, border: `1.5px solid ${borderColor}` }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: ds.textPrimary, margin: "0 0 24px 0" }}>{isRTL ? "تفاصيل الشراء والمالية" : "Purchase & Financial Details"}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                  <div>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "رقم فاتورة الشراء" : "Purchase Invoice No"}</span>
                    <span style={{ display: "block", fontSize: 18, fontWeight: 800, color: ds.textPrimary, cursor: "pointer", textDecoration: "underline" }} onClick={() => setSelectedInvoice(mockInvoice)}>{mockInvoice.invoice_number}</span>
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "المورد" : "Supplier"}</span>
                    <span style={{ display: "block", fontSize: 18, fontWeight: 800, color: ds.textPrimary }}>{mockSupplier.supplier_name}</span>
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "تاريخ الشراء" : "Purchase Date"}</span>
                    <span style={{ display: "block", fontSize: 18, fontWeight: 800, color: ds.textPrimary }}>{asset.purchase_date}</span>
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "الحساب المحاسبي للأصل" : "Asset GL Account"}</span>
                    <span style={{ display: "block", fontSize: 18, fontWeight: 800, color: ds.textPrimary }}>120100 - آلات ومعدات</span>
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "حساب مجمع الإهلاك" : "Accumulated Dep. GL"}</span>
                    <span style={{ display: "block", fontSize: 18, fontWeight: 800, color: ds.textPrimary }}>120199 - مجمع إهلاك آلات ومعدات</span>
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: ds.textSecondary, marginBottom: 8 }}>{isRTL ? "مركز التكلفة" : "Cost Center"}</span>
                    <span style={{ display: "block", fontSize: 18, fontWeight: 800, color: ds.textPrimary }}>CC-001 (الإدارة العامة)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "depreciation" && (
            <div style={{ background: surfaceColor, borderRadius: 20, border: `1.5px solid ${borderColor}`, overflow: "hidden" }}>
              <div style={{ padding: "24px", borderBottom: `1.5px solid ${borderColor}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "جدول الإهلاك السنوي (تقديري 15%)" : "Annual Depreciation Schedule (Est. 15%)"}</h3>
                <button onClick={() => toast.info(isRTL ? "جاري تجهيز الطباعة..." : "Preparing to print...")} style={{ height: 48, background: isDark ? ds.surface2 : "#F1F5F9", border: `1.5px solid ${borderColor}`, borderRadius: 12, padding: "0 20px", color: ds.textPrimary, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <Printer size={20} /> {isRTL ? "طباعة الجدول" : "Print Schedule"}
                </button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
               <thead>
                 <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1.5px solid ${borderColor}` }}>
                   <th style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 15, fontWeight: 800 }}>{isRTL ? "السنة" : "Year"}</th>
                   <th style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 15, fontWeight: 800 }}>{isRTL ? "القيمة بداية السنة" : "Value (Start)"}</th>
                   <th style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 15, fontWeight: 800 }}>{isRTL ? "قيمة الإهلاك المخصوم" : "Depreciation Amount"}</th>
                   <th style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 15, fontWeight: 800 }}>{isRTL ? "القيمة الدفترية المتبقية" : "Book Value (End)"}</th>
                 </tr>
               </thead>
               <tbody>
                 {depreciationSchedule.map((row, idx) => (
                   <tr key={idx} style={{ borderBottom: idx === depreciationSchedule.length - 1 ? "none" : `1px solid ${borderColor}` }}>
                     <td style={{ padding: "20px 24px", color: ds.textPrimary, fontSize: 16, fontWeight: 900 }}>{row.year}</td>
                     <td style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 16, fontWeight: 700 }}>{row.value_start.toLocaleString()}</td>
                     <td style={{ padding: "20px 24px", color: "#EF4444", fontSize: 16, fontWeight: 800 }}>- {row.depreciation_amount.toLocaleString()}</td>
                     <td style={{ padding: "20px 24px", color: "#10B981", fontSize: 16, fontWeight: 900 }}>{row.value_end.toLocaleString()}</td>
                   </tr>
                 ))}
               </tbody>
              </table>
            </div>
          )}

          {activeTab === "maintenance" && (
            <div style={{ background: surfaceColor, borderRadius: 20, border: `1.5px solid ${borderColor}`, overflow: "hidden" }}>
              <div style={{ padding: "24px", borderBottom: `1.5px solid ${borderColor}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "سجل الصيانة" : "Maintenance Logs"}</h3>
                <button onClick={() => toast.info(isRTL ? "ميزة تسجيل صيانة ستتوفر قريباً" : "Log Maintenance coming soon")} style={{ height: 48, background: "#10B981", border: "none", borderRadius: 12, padding: "0 20px", color: "white", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <Plus size={20} /> {isRTL ? "تسجيل صيانة جديدة" : "Log Maintenance"}
                </button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
               <thead>
                 <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1.5px solid ${borderColor}` }}>
                   <th style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 15, fontWeight: 800 }}>{isRTL ? "التاريخ" : "Date"}</th>
                   <th style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 15, fontWeight: 800 }}>{isRTL ? "نوع الصيانة" : "Type"}</th>
                   <th style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 15, fontWeight: 800 }}>{isRTL ? "الوصف" : "Description"}</th>
                   <th style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 15, fontWeight: 800 }}>{isRTL ? "الفني / الجهة" : "Technician"}</th>
                   <th style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 15, fontWeight: 800 }}>{isRTL ? "التكلفة" : "Cost"}</th>
                 </tr>
               </thead>
               <tbody>
                 {maintenanceLogs.map((log, idx) => (
                   <tr key={log.id} style={{ borderBottom: idx === maintenanceLogs.length - 1 ? "none" : `1px solid ${borderColor}` }}>
                     <td style={{ padding: "20px 24px", color: ds.textPrimary, fontSize: 16, fontWeight: 700 }}>{log.date}</td>
                     <td style={{ padding: "20px 24px" }}>
                        <span style={{ padding: "6px 12px", background: log.type === 'Routine' ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: log.type === 'Routine' ? "#10B981" : "#F59E0B", borderRadius: 10, fontSize: 14, fontWeight: 800 }}>
                          {log.type}
                        </span>
                     </td>
                     <td style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 15, fontWeight: 600 }}>{log.desc}</td>
                     <td style={{ padding: "20px 24px", color: ds.textPrimary, fontSize: 15, fontWeight: 700 }}>{log.technician}</td>
                     <td style={{ padding: "20px 24px", color: ds.textPrimary, fontSize: 16, fontWeight: 900 }}>{log.cost.toLocaleString()} YER</td>
                   </tr>
                 ))}
               </tbody>
              </table>
            </div>
          )}

          {activeTab === "movements" && (
            <div style={{ background: surfaceColor, borderRadius: 20, border: `1.5px solid ${borderColor}`, padding: 32 }}>
              <h3 style={{ margin: "0 0 32px 0", color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "الخط الزمني للحركات" : "Movements Timeline"}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 32, position: "relative" }}>
                <div style={{ position: "absolute", top: 0, bottom: 0, [isRTL ? "right" : "left"]: 23, width: 2, background: isDark ? ds.surface2 : "#E2E8F0" }} />
                {movements.map((mov, idx) => (
                  <div key={mov.id} style={{ display: "flex", gap: 24, position: "relative", zIndex: 1 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 24, background: mov.type === "purchase" ? "#3B82F6" : mov.type === "maintenance" ? "#F59E0B" : "#10B981", display: "flex", alignItems: "center", justifyContent: "center", border: `4px solid ${surfaceColor}` }}>
                      {mov.type === "purchase" ? <CheckCircle size={20} color="white" /> : mov.type === "maintenance" ? <Wrench size={20} color="white" /> : <ArrowRightLeft size={20} color="white" />}
                    </div>
                    <div style={{ paddingTop: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: ds.textPrimary }}>{mov.label}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: ds.textMuted }}>• {mov.ref}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: ds.textSecondary }}>{mov.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "attachments" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {attachments.map(att => (
                <div key={att.id} style={{ background: surfaceColor, border: `1.5px solid ${borderColor}`, borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileText size={28} color="#3B82F6" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 800, color: ds.textPrimary }}>{att.name}</h4>
                    <div style={{ fontSize: 13, fontWeight: 600, color: ds.textSecondary }}>{att.size} • {att.date}</div>
                  </div>
                </div>
              ))}
              <div onClick={() => toast.info(isRTL ? "إضافة المرفقات ستتوفر قريباً" : "Attachments coming soon")} style={{ background: isDark ? ds.surface2 : "#F8FAFC", border: `1.5px dashed ${borderColor}`, borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer" }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plus size={28} color="#10B981" />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: ds.textPrimary }}>{isRTL ? "إضافة مرفق جديد" : "Add New Attachment"}</span>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div style={{ background: surfaceColor, borderRadius: 20, border: `1.5px solid ${borderColor}`, padding: 32 }}>
              <h3 style={{ margin: "0 0 24px 0", color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "الملاحظات الإضافية" : "Additional Notes"}</h3>
              <p style={{ fontSize: 16, fontWeight: 600, color: ds.textSecondary, lineHeight: 1.8 }}>
                {isRTL ? "هذا الأصل مصنف كأصل استراتيجي هام لعمليات الفرع الرئيسي. يجب إجراء صيانة دورية كل 6 أشهر للتأكد من الجاهزية التشغيلية القصوى. الضمان ساري حتى نهاية عام 2025." : "This asset is classified as a strategic asset for main branch operations. Routine maintenance is required every 6 months to ensure maximum operational readiness. Warranty is valid until end of 2025."}
              </p>
            </div>
          )}

        </div>
      </motion.div>

      <AnimatePresence>
        {selectedInvoice && (
          <motion.div key="asset-purchase-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
            <PurchaseInvoiceDetailScreen 
              invoice={selectedInvoice}
              supplier={mockSupplier}
              onBack={() => setSelectedInvoice(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
