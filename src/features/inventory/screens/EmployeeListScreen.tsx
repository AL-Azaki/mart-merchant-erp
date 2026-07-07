import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, UserCheck, UserX, Phone, Mail, MapPin, DollarSign, Edit, Trash2 } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_EMPLOYEES, Employee } from "@/core/data/inventoryExtraMockData";
import { EmployeeFormSheet } from "../components/EmployeeFormSheet";
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";
import { EmployeeDetailScreen } from "../components/EmployeeDetailScreen";

export function EmployeeListScreen() {
  const { isRTL, isDark, ds } = useApp();
  
  const [search, setSearch] = useState("");
  const [localEmployees, setLocalEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  // Filter
  const filteredEmployees = useMemo(() => {
    return localEmployees.filter(emp => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.job_title.toLowerCase().includes(q) ||
        emp.phone.includes(q)
      );
    });
  }, [search, localEmployees]);

  // Statistics
  const stats = useMemo(() => {
    const total = localEmployees.length;
    const active = localEmployees.filter(e => e.status === "active").length;
    const onLeave = localEmployees.filter(e => e.status === "on_leave").length;
    return { total, active, onLeave };
  }, [localEmployees]);

  const handleSave = (employeeData: any) => {
    if (editingEmployee) {
      setLocalEmployees(prev => prev.map(e => e.id === editingEmployee.id ? employeeData : e));
      setEditingEmployee(null);
    } else {
      setLocalEmployees(prev => [employeeData, ...prev]);
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (employeeToDelete) {
      setLocalEmployees(prev => prev.filter(e => e.id !== employeeToDelete.id));
      setEmployeeToDelete(null);
    }
  };

  if (selectedEmployee) {
    return <EmployeeDetailScreen employee={selectedEmployee} onBack={() => setSelectedEmployee(null)} />;
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg, padding: "24px" }}>
      {/* Header section with Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
        {/* Total Employees */}
        <div style={{ background: surface, padding: "16px 20px", borderRadius: 16, border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserCheck size={20} color="#6366F1" />
          </div>
          <div>
            <div style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>{isRTL ? "إجمالي الموظفين" : "Total Staff"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800, marginTop: 4 }}>{stats.total}</div>
          </div>
        </div>

        {/* Active Employees */}
        <div style={{ background: surface, padding: "16px 20px", borderRadius: 16, border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserCheck size={20} color="#10B981" />
          </div>
          <div>
            <div style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>{isRTL ? "الموظفون النشطون" : "Active Staff"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800, marginTop: 4 }}>{stats.active}</div>
          </div>
        </div>

        {/* On Leave Employees */}
        <div style={{ background: surface, padding: "16px 20px", borderRadius: 16, border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserX size={20} color="#F59E0B" />
          </div>
          <div>
            <div style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>{isRTL ? "في إجازة" : "On Leave"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800, marginTop: 4 }}>{stats.onLeave}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? "البحث عن موظف بالاسم، الرقم، المسمى الوظيفي..." : "Search employee..."}
            style={{ width: "100%", height: 46, boxSizing: "border-box", paddingInlineStart: 44, paddingInlineEnd: 16, background: surface, border: `1px solid ${border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit" }}
          />
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }} 
          onClick={() => { setEditingEmployee(null); setShowForm(true); }}
          style={{ height: 44, background: "linear-gradient(135deg, #10B981, #059669)", border: "none", borderRadius: 12, padding: "0 16px", color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit" }}
        >
          <Plus size={18} strokeWidth={2.5} />
          {isRTL ? "إضافة موظف" : "Add Employee"}
        </motion.button>
      </div>

      {/* Data Grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px 24px" }}>
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
            <thead>
              <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${border}` }}>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "30%" }}>{isRTL ? "الموظف" : "Employee"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "الوظيفة / القسم" : "Job / Dept"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "رقم الهاتف" : "Phone"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "الراتب" : "Salary"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "الحالة" : "Status"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, textAlign: "center" }}>{isRTL ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 40, textAlign: "center", color: ds.textMuted, fontSize: 14 }}>
                      {isRTL ? "لا يوجد موظفين مطابقين للبحث" : "No employees found matching your search"}
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, i) => {
                    const isEmpActive = emp.status === "active";
                    const isEmpLeave = emp.status === "on_leave";
                    const badgeColor = isEmpActive ? "#10B981" : isEmpLeave ? "#F59E0B" : "#EF4444";
                    const badgeBg = isEmpActive ? "rgba(16,185,129,0.1)" : isEmpLeave ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
                    const badgeText = isEmpActive ? (isRTL ? "نشط" : "Active") : isEmpLeave ? (isRTL ? "في إجازة" : "On Leave") : (isRTL ? "موقوف" : "Inactive");
                    
                    return (
                      <motion.tr key={emp.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedEmployee(emp)}
                        style={{ borderBottom: i === filteredEmployees.length - 1 ? "none" : `1px solid ${isDark ? ds.border : "#F1F5F9"}`, cursor: "pointer", transition: "background 0.2s" }}
                        onMouseOver={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC"}
                        onMouseOut={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <UserCheck size={20} color="#6366F1" />
                            </div>
                            <div>
                              <h3 style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700, margin: "0 0 4px 0" }}>{emp.name}</h3>
                              <div style={{ color: ds.textSecondary, fontSize: 12 }}>{emp.email || (isRTL ? "بدون بريد" : "No Email")}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
                          <div style={{ marginBottom: 4 }}>{emp.job_title}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, color: ds.textSecondary, fontSize: 12 }}>
                            <MapPin size={12} /> {emp.warehouse_name || (isRTL ? "الفرع الرئيسي" : "Main Branch")}
                          </div>
                        </td>

                        <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
                          {emp.phone ? <div style={{ display: "flex", alignItems: "center", gap: 6, direction: "ltr", justifyContent: isRTL ? "flex-end" : "flex-start" }}><Phone size={14} color={ds.textSecondary} /> {emp.phone}</div> : <span style={{ color: ds.textMuted }}>-</span>}
                        </td>

                        <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 15, fontWeight: 800 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <DollarSign size={14} color="#10B981" />
                            {emp.salary > 0 ? emp.salary.toLocaleString() : "-"}
                          </div>
                        </td>

                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: badgeBg, color: badgeColor }}>
                            {badgeText}
                          </span>
                        </td>

                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                            <button title={isRTL ? "تعديل الموظف" : "Edit Employee"} onClick={(e) => { e.stopPropagation(); setEditingEmployee(emp); setShowForm(true); }} style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.background = isDark ? ds.border : "#E2E8F0"} onMouseOut={e => e.currentTarget.style.background = isDark ? ds.surface2 : "#F1F5F9"}>
                              <Edit size={16} color={ds.textPrimary} />
                            </button>
                            <button title={isRTL ? "حذف الموظف" : "Delete Employee"} onClick={(e) => { e.stopPropagation(); setEmployeeToDelete(emp); }} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"} onMouseOut={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}>
                              <Trash2 size={16} color="#EF4444" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sheets & Modals */}
      <AnimatePresence>
        {(showForm || editingEmployee) && (
          <EmployeeFormSheet
            employee={editingEmployee}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditingEmployee(null); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {employeeToDelete && (
          <ConfirmDeleteModal
            title={isRTL ? "حذف موظف" : "Delete Employee"}
            message={isRTL ? `هل أنت متأكد من حذف الموظف "${employeeToDelete.name}"؟` : `Are you sure you want to delete employee "${employeeToDelete.name}"?`}
            onConfirm={handleDelete}
            onCancel={() => setEmployeeToDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
