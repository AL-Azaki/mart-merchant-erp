import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, UserCheck, UserX, Phone, Mail, MapPin, DollarSign, Edit, Trash2 } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_EMPLOYEES, Employee } from "@/core/data/inventoryExtraMockData";
import { EmployeeFormSheet } from "../components/EmployeeFormSheet";
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";

export function EmployeeListScreen() {
  const { isRTL, isDark, ds } = useApp();
  
  const [search, setSearch] = useState("");
  const [localEmployees, setLocalEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

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

      {/* Grid List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, paddingBottom: 24 }}>
          {filteredEmployees.map(emp => {
            const isEmpActive = emp.status === "active";
            const isEmpLeave = emp.status === "on_leave";
            const badgeColor = isEmpActive ? "#10B981" : isEmpLeave ? "#F59E0B" : "#EF4444";
            const badgeBg = isEmpActive ? "rgba(16,185,129,0.1)" : isEmpLeave ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
            const badgeText = isEmpActive ? (isRTL ? "نشط" : "Active") : isEmpLeave ? (isRTL ? "في إجازة" : "On Leave") : (isRTL ? "موقوف" : "Inactive");

            return (
              <motion.div key={emp.id} layout
                style={{ background: surface, border: `1px solid ${border}`, borderRadius: 20, padding: 20, position: "relative", boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
                {/* Status Badge */}
                <span style={{ position: "absolute", top: 16, [isRTL ? "left" : "right"]: 16, fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: badgeBg, color: badgeColor }}>
                  {badgeText}
                </span>

                <h4 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 800, margin: "0 0 4px 0" }}>{emp.name}</h4>
                <div style={{ color: ds.textSecondary, fontSize: 12.5, fontWeight: 700, marginBottom: 16 }}>{emp.job_title}</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: `1px solid ${border}`, paddingTop: 14, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: ds.textSecondary, fontSize: 13 }}>
                    <MapPin size={15} color={ds.textMuted} />
                    <span>{emp.warehouse_name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: ds.textSecondary, fontSize: 13 }}>
                    <Phone size={15} color={ds.textMuted} />
                    <span>{emp.phone}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: ds.textPrimary, fontSize: 14, fontWeight: 700 }}>
                    <DollarSign size={15} color="#10B981" />
                    <span>{emp.salary.toLocaleString()} <span style={{ fontSize: 11, color: ds.textSecondary }}>YER</span></span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => { setEditingEmployee(emp); setShowForm(true); }}
                    style={{ background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Edit size={16} color={ds.textPrimary} />
                  </button>
                  <button onClick={() => setEmployeeToDelete(emp)}
                    style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Trash2 size={16} color="#EF4444" />
                  </button>
                </div>
              </motion.div>
            );
          })}
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
