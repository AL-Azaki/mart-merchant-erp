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
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";

export function ContactListScreen({ customers, onUpdateCustomers, onBack, initialShowForm = false }: { customers: Customer[], onUpdateCustomers: (c: Customer[]) => void, onBack?: () => void, initialShowForm?: boolean }) {
  const { t, isDark, isRTL, ds } = useApp();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(initialShowForm);
  const [editingContact, setEditingContact] = useState<Customer | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Customer | null>(null);
  


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

      {/* Contacts List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          <AnimatePresence>
            {contacts.map((c, i) => {
              // Now we don't have balance locally on Customer type natively from DB unless computed
              // We'll mock it here or remove the UI portion for now, but keeping simple for UI
              return (
                <motion.div key={c.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                  style={{ background: surface, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                  
                  <div style={{ padding: 16, display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <User size={24} color="#8B5CF6" />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 700, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {c.customer_name}
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {c.phone && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, color: ds.textSecondary, fontSize: 13 }}>
                            <Phone size={14} /> <span style={{ direction: "ltr" }}>{c.phone}</span>
                          </div>
                        )}
                        {c.email && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, color: ds.textSecondary, fontSize: 13 }}>
                            <Mail size={14} /> <span>{c.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "0 16px 16px" }}>
                     <div style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderRadius: 12, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                        <span style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>
                          {isRTL ? "الحد الائتماني" : "Credit Limit"}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 800 }}>
                            {c.credit_limit.toLocaleString()} {isRTL ? "ر.ي" : "YER"}
                          </span>
                        </div>
                     </div>
                  </div>

                  <div style={{ borderTop: `1px solid ${isDark ? ds.border : "#F1F5F9"}`, padding: "8px 16px", display: "flex", justifyContent: "flex-end", gap: 8, background: subtle }}>
                    <button title={isRTL ? "تعديل بيانات العميل" : "Edit Customer"} onClick={() => { setEditingContact(c); setShowForm(true); }} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <Edit size={16} color={ds.textSecondary} />
                    </button>
                    <button title={isRTL ? "حذف العميل" : "Delete Customer"} onClick={() => setContactToDelete(c)} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <Trash2 size={16} color="#EF4444" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
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
                  email: data.email || null,
                  address: data.address || null,
                  credit_limit: data.credit_limit || 0,
                  is_active: data.is_active ?? true,
                  created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null
                };
                onUpdateCustomers([newContact, ...customers]);
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
    </div>
  );
}
