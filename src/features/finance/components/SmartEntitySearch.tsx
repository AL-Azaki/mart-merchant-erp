import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, User, Check, X, FileText, AlertCircle, Hash, Phone } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useFinancialStore } from "@/core/engine/useFinancialStore";

interface SmartEntitySearchProps {
  entityType: "customer" | "supplier" | "employee" | "general";
  value: string; // The ID of the selected entity (if selected) or the name if general
  onChange: (id: string, name: string) => void;
  onSelectInvoices?: (invoiceIds: string[]) => void;
  onAddNew?: () => void;
}

export function SmartEntitySearch({ entityType, value, onChange, onSelectInvoices, onAddNew }: SmartEntitySearchProps) {
  const { isRTL, isDark, ds } = useApp();
  const store = useFinancialStore();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getEntities = () => {
    if (entityType === "customer") return store.customers;
    if (entityType === "supplier") return store.suppliers;
    return [];
  };

  const getEntityName = (e: any) => {
    if (entityType === "customer") return e.customer_name || "";
    if (entityType === "supplier") return e.supplier_name || "";
    return "";
  };

  const getEntityCode = (e: any) => e.customer_code || e.supplier_code || e.id;
  const getEntityPhone = (e: any) => e.primary_phone || e.phone || "";

  // Set initial selected entity if value matches an ID
  useEffect(() => {
    if (value && entityType !== "general") {
      const match = getEntities().find(e => e.id === value);
      if (match && (!selectedEntity || selectedEntity.id !== match.id)) {
        setSelectedEntity(match);
        setQuery(getEntityName(match));
      } else if (!match && !selectedEntity) {
        setQuery(value);
      }
    } else if (entityType === "general") {
      setQuery(value);
    }
  }, [value, entityType]);

  const filteredEntities = getEntities().filter(e => {
    if (!query) return true;
    const q = query.toLowerCase();
    const name = getEntityName(e).toLowerCase();
    const code = getEntityCode(e).toLowerCase();
    const phone = getEntityPhone(e).toLowerCase();
    return name.includes(q) || code.includes(q) || phone.includes(q);
  }).slice(0, 50); // limit to 50 for performance

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") setIsOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(i => (i < filteredEntities.length - 1 ? i + 1 : i));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(i => (i > 0 ? i - 1 : i));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredEntities.length) {
        selectEntity(filteredEntities[focusedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const getUnpaidInvoices = (id: string) => {
    if (entityType === "customer") {
      return store.invoices.filter(i => i.customer_id === id && i.status === "Posted" && i.payment_status !== "Paid");
    }
    if (entityType === "supplier") {
      return store.purchaseInvoices.filter(i => i.supplier_id === id && i.status === "Posted");
    }
    return [];
  };

  const getBalance = (id: string) => {
    if (entityType === "customer") return store.getCustomerBalance(id);
    if (entityType === "supplier")  return store.getSupplierBalance(id);
    return 0;
  };

  const selectEntity = (entity: any) => {
    setSelectedEntity(entity);
    setQuery(getEntityName(entity));
    setIsOpen(false);
    onChange(entity.id, getEntityName(entity));
    setSelectedInvoiceIds([]);
    if (onSelectInvoices) onSelectInvoices([]);
  };

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e.target.value, e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedEntity(null);
    onChange("", "");
    setSelectedInvoiceIds([]);
    if (onSelectInvoices) onSelectInvoices([]);
    setIsOpen(true);
  };

  const toggleInvoice = (invId: string) => {
    setSelectedInvoiceIds(prev => {
      const next = prev.includes(invId) ? prev.filter(id => id !== invId) : [...prev, invId];
      if (onSelectInvoices) onSelectInvoices(next);
      return next;
    });
  };

  const primaryColor = entityType === "customer" ? "#3B82F6" : entityType === "supplier" ? "#EF4444" : "#10B981";

  if (entityType === "general") {
    return (
      <input 
        value={query} 
        onChange={handleGeneralChange} 
        placeholder={isRTL ? "اكتب الاسم هنا..." : "Type name here..."} 
        style={{ width: "100%", height: 52, paddingInlineStart: 52, paddingInlineEnd: 16, background: isDark ? ds.surface2 : "#FFFFFF", border: `1.5px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 12, color: ds.textPrimary, fontSize: 15, fontWeight: 600, outline: "none", fontFamily: "inherit" }} 
      />
    );
  }

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 10, background: isOpen ? `${primaryColor}15` : "transparent", transition: "all 0.2s" }}>
          <Search size={18} color={isOpen ? primaryColor : ds.textMuted} />
        </div>
        
        <input 
          value={query} 
          onChange={e => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
            if (selectedEntity && e.target.value !== getEntityName(selectedEntity)) {
              setSelectedEntity(null); // break connection
              onChange("", e.target.value);
            }
          }} 
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={isRTL ? "ابحث بالاسم، الكود، أو رقم الجوال..." : "Search by name, code, or phone..."} 
          style={{ width: "100%", boxSizing: "border-box", paddingInlineStart: 52, paddingInlineEnd: selectedEntity ? 44 : 16, height: 52, background: isDark ? ds.surface2 : "#FFFFFF", border: `1.5px solid ${isOpen ? primaryColor : (selectedEntity ? primaryColor : (isDark ? ds.border : "#E2E8F0"))}`, borderRadius: 12, color: ds.textPrimary, fontSize: 15, fontWeight: 600, outline: "none", fontFamily: "inherit", transition: "all 0.2s", boxShadow: isOpen ? `0 0 0 4px ${primaryColor}15` : "0 1px 2px rgba(0,0,0,0.02)" }} 
        />
        
        {selectedEntity && (
          <button type="button" onClick={handleClear} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "left" : "right"]: 14, background: isDark ? ds.surface : "#F1F5F9", border: "none", width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} color={ds.textSecondary} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
            style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 8, background: isDark ? ds.surface : "#FFFFFF", border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", zIndex: 50, maxHeight: 300, overflowY: "auto" }}
          >
            {filteredEntities.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: ds.textMuted, fontSize: 14 }}>
                <p style={{ margin: "0 0 12px 0" }}>{isRTL ? "لا توجد نتائج مطابقة" : "No results found"}</p>
                {onAddNew && (
                  <button 
                    onClick={() => { setIsOpen(false); onAddNew(); }}
                    style={{ background: primaryColor, color: "white", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    {isRTL ? `إضافة ${entityType === "customer" ? "عميل" : "مورد"} جديد` : `Add New ${entityType === "customer" ? "Customer" : "Supplier"}`}
                  </button>
                )}
              </div>
            ) : (
              <div style={{ padding: 8 }}>
                {filteredEntities.map((ent, idx) => {
                  const bal = getBalance(ent.id);
                  return (
                    <div 
                      key={ent.id}
                      onClick={() => selectEntity(ent)}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 8, background: focusedIndex === idx ? (isDark ? ds.surface2 : "#F8FAFC") : "transparent", cursor: "pointer", transition: "background 0.1s" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${primaryColor}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <User size={20} color={primaryColor} />
                        </div>
                        <div>
                          <div style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{getEntityName(ent)}</div>
                          <div style={{ display: "flex", gap: 12, color: ds.textSecondary, fontSize: 12 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Hash size={12} /> {getEntityCode(ent)}</span>
                            {getEntityPhone(ent) && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={12} /> {getEntityPhone(ent)}</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: isRTL ? "left" : "right" }}>
                        <div style={{ fontSize: 11, color: ds.textMuted, marginBottom: 2 }}>{isRTL ? "الرصيد" : "Balance"}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: bal > 0 ? (entityType === "customer" ? "#10B981" : "#EF4444") : ds.textPrimary, direction: "ltr" }}>
                          {bal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Entity Insights & Invoice Allocation */}
      <AnimatePresence>
        {selectedEntity && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ marginTop: 12, background: isDark ? ds.surface2 : "#F8FAFC", border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 12, padding: 16 }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: 13, color: ds.textSecondary, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertCircle size={16} color={primaryColor} /> 
                {isRTL ? "معلومات مالية سريعة" : "Financial Insights"}
              </h4>
              
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1, background: isDark ? ds.surface : "#FFFFFF", padding: 12, borderRadius: 10, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                  <div style={{ fontSize: 11, color: ds.textSecondary, marginBottom: 4 }}>{isRTL ? "الرصيد المستحق" : "Due Balance"}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: getBalance(selectedEntity.id) > 0 ? (entityType === "customer" ? "#10B981" : "#EF4444") : ds.textPrimary, direction: "ltr" }}>
                    {getBalance(selectedEntity.id).toLocaleString()}
                  </div>
                </div>
                <div style={{ flex: 1, background: isDark ? ds.surface : "#FFFFFF", padding: 12, borderRadius: 10, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                  <div style={{ fontSize: 11, color: ds.textSecondary, marginBottom: 4 }}>{isRTL ? "فواتير مستحقة" : "Unpaid Invoices"}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: ds.textPrimary }}>
                    {getUnpaidInvoices(selectedEntity.id).length}
                  </div>
                </div>
              </div>

              {getUnpaidInvoices(selectedEntity.id).length > 0 && onSelectInvoices && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: ds.textPrimary, marginBottom: 8 }}>{isRTL ? "اختر الفواتير المراد تسديدها:" : "Select invoices to pay:"}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 150, overflowY: "auto", padding: 4 }}>
                    {getUnpaidInvoices(selectedEntity.id).map(inv => {
                      const totalPaid = entityType === "customer" ? store.getInvoiceTotalPaid(inv.id) : store.getSupplierInvoiceTotalPaid(inv.id);
                      const rem = Math.max(0, inv.grand_total - totalPaid);
                      const isSelected = selectedInvoiceIds.includes(inv.id);
                      return (
                        <label key={inv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: isSelected ? `${primaryColor}15` : (isDark ? ds.surface : "#FFFFFF"), border: `1px solid ${isSelected ? primaryColor : (isDark ? ds.border : "#E2E8F0")}`, borderRadius: 8, cursor: "pointer", transition: "all 0.2s" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <input type="checkbox" checked={isSelected} onChange={() => toggleInvoice(inv.id)} style={{ width: 16, height: 16, accentColor: primaryColor }} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: ds.textPrimary, display: "flex", alignItems: "center", gap: 6 }}><FileText size={14} color={ds.textMuted} /> {inv.invoice_number}</div>
                              <div style={{ fontSize: 11, color: ds.textSecondary }}>{new Date(inv.invoice_date || inv.purchase_date || inv.created_at || "").toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: isRTL ? "left" : "right" }}>
                            <div style={{ fontSize: 10, color: ds.textMuted }}>{isRTL ? "المتبقي" : "Remaining"}</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: ds.textPrimary, direction: "ltr" }}>{rem.toLocaleString()}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
