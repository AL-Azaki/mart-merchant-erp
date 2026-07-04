import { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";
import type { Employee } from "@/core/data/inventoryExtraMockData";

interface EmployeeFormSheetProps {
  employee?: Employee | null;
  onSave: (employeeData: any) => void;
  onClose: () => void;
}

export function EmployeeFormSheet({ employee, onSave, onClose }: EmployeeFormSheetProps) {
  const { isDark, isRTL, ds } = useApp();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: employee?.name || "",
    job_title: employee?.job_title || "",
    phone: employee?.phone || "",
    warehouse_name: employee?.warehouse_name || "المستودع الرئيسي",
    salary: employee?.salary || 100000,
    status: employee?.status || "active",
  });

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: name === "salary" ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.warning(isRTL ? "يرجى إدخال اسم الموظف" : "Please enter employee name");
      return;
    }
    if (!formData.job_title) {
      toast.warning(isRTL ? "يرجى إدخال المسمى الوظيفي" : "Please enter job title");
      return;
    }
    onSave({
      id: employee?.id || `emp_${Date.now()}`,
      ...formData
    });
  };

  const getInputStyle = () => ({
    width: "100%", 
    height: 48, 
    padding: "0 16px",
    background: isDark ? ds.surface2 : "#FFFFFF",
    border: `1px solid ${border}`, 
    borderRadius: 12,
    color: ds.textPrimary, 
    fontSize: 14, 
    fontWeight: 500,
    outline: "none", 
    fontFamily: "inherit",
    boxSizing: "border-box" as const
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }} />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ position: "relative", width: "100%", maxWidth: 500, background: bg, borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
        
        {/* Header */}
        <div style={{ background: surface, padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 800, margin: 0 }}>
              {employee ? (isRTL ? "تعديل بيانات الموظف" : "Edit Employee") : (isRTL ? "إضافة موظف جديد" : "Add New Employee")}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: isDark ? ds.surface2 : "#F1F5F9", border: "none", width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} color={ds.textPrimary} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, maxHeight: "70vh", overflowY: "auto" }}>
          <div>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              {isRTL ? "اسم الموظف *" : "Employee Name *"}
            </label>
            <input name="name" value={formData.name} onChange={handleChange} style={getInputStyle()} placeholder={isRTL ? "أحمد محمد..." : "John Doe..."} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                {isRTL ? "المسمى الوظيفي *" : "Job Title *"}
              </label>
              <input name="job_title" value={formData.job_title} onChange={handleChange} style={getInputStyle()} placeholder={isRTL ? "مثال: كاشير" : "e.g. Cashier"} />
            </div>

            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                {isRTL ? "المستودع/الفرع" : "Warehouse/Branch"}
              </label>
              <select name="warehouse_name" value={formData.warehouse_name} onChange={handleChange} style={getInputStyle()}>
                <option value="المستودع الرئيسي">{isRTL ? "المستودع الرئيسي" : "Main Warehouse"}</option>
                <option value="مستودع الفروع">{isRTL ? "مستودع الفروع" : "Branches Warehouse"}</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                {isRTL ? "الراتب الشهري (YER)" : "Monthly Salary (YER)"}
              </label>
              <input name="salary" type="number" value={formData.salary} onChange={handleChange} style={getInputStyle()} />
            </div>

            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                {isRTL ? "الحالة" : "Status"}
              </label>
              <select name="status" value={formData.status} onChange={handleChange} style={getInputStyle()}>
                <option value="active">{isRTL ? "نشط" : "Active"}</option>
                <option value="on_leave">{isRTL ? "في إجازة" : "On Leave"}</option>
                <option value="inactive">{isRTL ? "موقوف" : "Inactive"}</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              {isRTL ? "رقم الهاتف" : "Phone"}
            </label>
            <input name="phone" value={formData.phone} onChange={handleChange} style={getInputStyle()} placeholder="+967..." />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button type="submit" style={{ flex: 1, height: 48, background: "linear-gradient(135deg, #10B981, #059669)", border: "none", borderRadius: 12, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              {isRTL ? "حفظ" : "Save"}
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, height: 48, background: isDark ? ds.surface2 : "#E2E8F0", border: "none", borderRadius: 12, color: ds.textPrimary, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
