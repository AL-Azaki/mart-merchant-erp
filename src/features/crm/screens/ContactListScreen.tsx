import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Users, Building2, User, 
  Phone, Mail, Edit, Trash2, ArrowLeft, ArrowRight,
  TrendingDown, TrendingUp, CreditCard
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_CUSTOMERS } from "@/core/data/salesMockData";
import type { Customer } from "@/core/types/sales";
import { ContactFormSheet } from "../components/ContactFormSheet";
import { CustomerStatementScreen } from "../components/CustomerStatementScreen";
import { useFinancialStore } from "@/core/engine/useFinancialStore";

export function ContactListScreen({ customers, onUpdateCustomers, onBack, initialShowForm = false }: { customers: Customer[], onUpdateCustomers: (c: Customer[]) => void, onBack?: () => void, initialShowForm?: boolean }) {
  const { t, isDark, isRTL, ds } = useApp();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(initialShowForm);
  const [editingContact, setEditingContact] = useState<Customer | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const store = useFinancialStore();

  const contacts = useMemo(() => {
    return customers.filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.customer_name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q));
    });
  }, [search, customers]);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const subtle = isDark ? ds.surface2 : "#F1F5F9";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", background: surface, borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {onBack && (
            <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginInlineEnd: 8 }}>
              <BackIcon size={20} color={ds.textPrimary} />
            </button>
          )}
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(139, 92, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={22} color="#8B5CF6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "العملاء" : "Customers"}</h2>
            <p style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 500 }}>{contacts.length} {isRTL ? "عميل" : "Customer"}</p>
          </div>
        </div>
        <motion.button title={isRTL ? "إضافة عميل جديد" : "Add New Customer"} whileTap={{ scale: 0.95 }} onClick={() => { setEditingContact(null); setShowForm(true); }}
          style={{ height: 44, background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", border: "none", borderRadius: 12, padding: "0 16px", color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(139,92,246,0.3)" }}>
          <Plus size={18} strokeWidth={2.5} />
          {isRTL ? "إضافة عميل" : "Add Customer"}
        </motion.button>
      </div>

      {/* Toolbar */}
      <div style={{ padding: "16px 24px 0", flexShrink: 0 }}>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? "ابحث بالاسم أو رقم الهاتف..." : "Search by name or phone..."}
            style={{ width: "100%", height: 46, boxSizing: "border-box", paddingInlineStart: 44, paddingInlineEnd: 16, background: surface, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}
          />
        </div>
      </div>

      {/* Contacts List (Professional Data Grid) */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        <div style={{ background: surface, borderRadius: 16, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
            <thead>
              <tr style={{ background: subtle, borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "30%" }}>{isRTL ? "اسم العميل / المؤسسة" : "Customer Name"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "20%" }}>{isRTL ? "معلومات التواصل" : "Contact Info"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "15%" }}>{isRTL ? "الحد الائتماني" : "Credit Limit"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "15%" }}>{isRTL ? "حالة الحساب" : "Status"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "10%", textAlign: "center" }}>{isRTL ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {contacts.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: ds.textMuted }}>{isRTL ? "لا يوجد عملاء." : "No customers found."}</td></tr>
                ) : (
                  contacts.map((c, i) => (
                    <motion.tr 
                      key={c.id} 
                      layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedCustomer(c)}
                      style={{ borderBottom: i === contacts.length - 1 ? "none" : `1px solid ${isDark ? ds.border : "#F1F5F9"}`, cursor: "pointer", transition: "background 0.2s" }}
                      onMouseOver={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC"}
                      onMouseOut={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <User size={20} color="#8B5CF6" />
                          </div>
                          <div>
                            <h3 style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700, margin: "0 0 4px 0" }}>{c.customer_name}</h3>
                            <div style={{ color: ds.textSecondary, fontSize: 12 }}>{c.address || (isRTL ? "بدون عنوان" : "No Address")}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
                        {c.phone ? <div style={{ display: "flex", alignItems: "center", gap: 6, direction: "ltr", justifyContent: isRTL ? "flex-end" : "flex-start" }}><Phone size={14} color={ds.textSecondary} /> {c.phone}</div> : <span style={{ color: ds.textMuted }}>-</span>}
                      </td>

                      <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 15, fontWeight: 800 }}>
                        {c.credit_limit > 0 ? c.credit_limit.toLocaleString() : "-"}
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: c.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: c.is_active ? "#10B981" : "#EF4444" }}>
                          {c.is_active ? (isRTL ? "نشط" : "Active") : (isRTL ? "موقوف" : "Inactive")}
                        </span>
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                          <button title={isRTL ? "تعديل بيانات العميل" : "Edit Customer"} onClick={(e) => { e.stopPropagation(); setEditingContact(c); setShowForm(true); }} style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.background = isDark ? ds.border : "#E2E8F0"} onMouseOut={e => e.currentTarget.style.background = isDark ? ds.surface2 : "#F1F5F9"}>
                            <Edit size={16} color={ds.textPrimary} />
                          </button>
                          <button title={isRTL ? "حذف العميل" : "Delete Customer"} onClick={(e) => { e.stopPropagation(); setContactToDelete(c); }} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"} onMouseOut={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}>
                            <Trash2 size={16} color="#EF4444" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <ContactFormSheet 
            role="customer"
            contact={editingContact}
            onClose={() => setShowForm(false)} 
            onSave={(data) => {
              if (editingContact) {
                onUpdateCustomers(customers.map(c => c.id === editingContact.id ? { ...c, ...data } as Customer : c));
              } else {
                const newContact: Customer = {
                  id: `cust_${Date.now()}`, business_id: "biz_001",
                  customer_name: data.customer_name!,
                  phone: data.phone || null,
                  address: data.address || null,
                  credit_limit: data.credit_limit || 0,
                  is_active: data.is_active ?? true,
                  created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null
                };
                onUpdateCustomers([newContact, ...customers]);
                store.addCustomer(newContact);
              }
              setShowForm(false);
            }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {contactToDelete && (
          <ConfirmDeleteModal 
            isOpen={true} 
            onClose={() => setContactToDelete(null)}
            onConfirm={() => {
              onUpdateCustomers(customers.filter(c => c.id !== contactToDelete.id));
            }}
            itemName={contactToDelete.customer_name}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            key="customer-statement"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            style={{ position: "fixed", inset: 0, zIndex: 9999 }}
          >
            <CustomerStatementScreen 
              customer={selectedCustomer} 
              onBack={() => setSelectedCustomer(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
