import { useApp } from "@/providers/AppProvider";
import { Calendar, MapPin, Package, User, CreditCard, RefreshCw, Download, FileText } from "lucide-react";

export function ReportFilterBar({ onRefresh, onExport }: { onRefresh?: () => void, onExport?: () => void }) {
  const { isDark, isRTL, ds } = useApp();
  
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const getSelectStyle = () => ({
    height: 48,
    background: isDark ? ds.surface2 : "#F8FAFC",
    border: `1.5px solid ${border}`,
    borderRadius: 12,
    color: ds.textPrimary,
    fontSize: 14,
    fontWeight: 700,
    padding: "0 16px",
    outline: "none",
    fontFamily: "inherit",
    minWidth: 140,
  });

  return (
    <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 20, padding: 20, marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select style={getSelectStyle()}>
            <option>{isRTL ? "اليوم" : "Today"}</option>
            <option>{isRTL ? "هذا الأسبوع" : "This Week"}</option>
            <option>{isRTL ? "هذا الشهر" : "This Month"}</option>
            <option>{isRTL ? "هذا العام" : "This Year"}</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select style={getSelectStyle()}>
            <option>{isRTL ? "كل الفروع" : "All Branches"}</option>
            <option>{isRTL ? "المركز الرئيسي" : "Main Branch"}</option>
            <option>{isRTL ? "فرع التجزئة" : "Retail Branch"}</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select style={getSelectStyle()}>
            <option>{isRTL ? "كل المستودعات" : "All Warehouses"}</option>
            <option>{isRTL ? "المستودع الرئيسي" : "Main Warehouse"}</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select style={getSelectStyle()}>
            <option>{isRTL ? "كل الموظفين" : "All Employees"}</option>
            <option>{isRTL ? "أحمد الكاشير" : "Ahmed Cashier"}</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select style={getSelectStyle()}>
            <option>{isRTL ? "كل الطرق" : "All Payment Methods"}</option>
            <option>{isRTL ? "نقدي" : "Cash"}</option>
            <option>{isRTL ? "شبكة" : "Card"}</option>
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onRefresh} style={{ height: 48, background: isDark ? ds.surface2 : "#F1F5F9", border: `1.5px solid ${border}`, borderRadius: 12, padding: "0 20px", display: "flex", alignItems: "center", gap: 8, color: ds.textPrimary, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
          <RefreshCw size={18} /> {isRTL ? "تحديث" : "Refresh"}
        </button>
        <button onClick={onExport} style={{ height: 48, background: "#10B981", border: "none", borderRadius: 12, padding: "0 20px", display: "flex", alignItems: "center", gap: 8, color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
          <Download size={18} /> {isRTL ? "تصدير" : "Export"}
        </button>
      </div>
    </div>
  );
}
