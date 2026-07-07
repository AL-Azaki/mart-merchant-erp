import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Search, Edit3, Trash2, X, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_CURRENCIES } from "@/core/data/financeMockData";

export function CurrencyListScreen() {
  const { t, isDark, isRTL, ds } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [currencies, setCurrencies] = useState([...MOCK_CURRENCIES]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    currency_code: "",
    currency_name_ar: "",
    currency_name_en: "",
    currency_symbol: "",
    exchange_rate: 1,
    is_base_currency: false,
    is_active: true
  });

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const filteredCurrencies = currencies.filter(c => 
    c.currency_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.currency_name_ar.includes(searchTerm) ||
    c.currency_name_en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (cur: any) => {
    setFormData({ ...cur });
    setEditingId(cur.id);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setFormData({
      id: `cur_${Date.now()}`,
      currency_code: "",
      currency_name_ar: "",
      currency_name_en: "",
      currency_symbol: "",
      exchange_rate: 1,
      is_base_currency: false,
      is_active: true
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.currency_code) return;

    if (editingId) {
      // Update existing
      const updated = currencies.map(c => c.id === editingId ? { ...formData } : c);
      setCurrencies(updated);
      
      // Update the mock reference too so other parts of app see it
      const idx = MOCK_CURRENCIES.findIndex(c => c.id === editingId);
      if (idx !== -1) MOCK_CURRENCIES[idx] = { ...formData };
    } else {
      // Add new
      const updated = [...currencies, { ...formData }];
      setCurrencies(updated);
      MOCK_CURRENCIES.push({ ...formData });
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(isRTL ? "هل أنت متأكد من حذف هذه العملة؟" : "Are you sure you want to delete this currency?")) {
      const isBase = currencies.find(c => c.id === id)?.is_base_currency;
      if (isBase) {
        alert(isRTL ? "لا يمكن حذف العملة الأساسية." : "Cannot delete base currency.");
        return;
      }
      
      const updated = currencies.filter(c => c.id !== id);
      setCurrencies(updated);
      
      // Update mock reference
      const idx = MOCK_CURRENCIES.findIndex(c => c.id === id);
      if (idx !== -1) MOCK_CURRENCIES.splice(idx, 1);
    }
  };

  const getInputStyle = () => ({
    width: "100%", height: 44, padding: "0 16px",
    background: isDark ? ds.surface2 : "#F8FAFC",
    border: `1px solid ${border}`, borderRadius: 12,
    color: ds.textPrimary, fontSize: 14, fontWeight: 500,
    outline: "none", fontFamily: "inherit"
  });

  return (
    <div style={{ height: "100%", padding: 24, maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 250 }}>
          <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: 13, left: isRTL ? "auto" : 16, right: isRTL ? 16 : "auto" }} />
          <input
            type="text"
            placeholder={isRTL ? "البحث عن عملة..." : "Search currency..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", height: 44, background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: isRTL ? "0 44px 0 16px" : "0 16px 0 44px", color: ds.textPrimary, outline: "none", fontSize: 14 }}
          />
        </div>
        <button onClick={handleAddNew} style={{ display: "flex", alignItems: "center", gap: 8, height: 44, padding: "0 20px", background: "#2563EB", border: "none", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          <Plus size={18} />
          {isRTL ? "إضافة عملة" : "Add Currency"}
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        <AnimatePresence>
          {filteredCurrencies.map(cur => (
            <motion.div key={cur.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, position: "relative", overflow: "hidden" }}>
              
              {/* Badge for Base Currency */}
              {cur.is_base_currency && (
                <div style={{ position: "absolute", top: 12, right: isRTL ? "auto" : 12, left: isRTL ? 12 : "auto", background: "rgba(16,185,129,0.15)", color: "#10B981", padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 800 }}>
                  {isRTL ? "العملة الأساسية" : "Base Currency"}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: isDark ? ds.surface2 : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: ds.primary }}>
                  {cur.currency_symbol}
                </div>
                <div>
                  <h3 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 800, margin: "0 0 4px 0" }}>{isRTL ? cur.currency_name_ar : cur.currency_name_en}</h3>
                  <p style={{ color: ds.textSecondary, fontSize: 13, margin: 0 }}>{cur.currency_code}</p>
                </div>
              </div>

              <div style={{ background: isDark ? ds.bg : "#F8FAFC", borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>{isRTL ? "سعر الصرف" : "Exchange Rate"}</span>
                <span style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 800 }}>{cur.exchange_rate.toLocaleString()}</span>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleEdit(cur)} style={{ flex: 1, height: 36, background: "rgba(59,130,246,0.1)", border: "none", borderRadius: 8, color: "#3B82F6", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Edit3 size={14} /> {isRTL ? "تعديل" : "Edit"}
                </button>
                {!cur.is_base_currency && (
                  <button onClick={() => handleDelete(cur.id)} style={{ width: 36, height: 36, background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ position: "relative", width: "100%", maxWidth: 500, background: surface, borderRadius: 24, padding: 24, boxShadow: "0 24px 48px rgba(0,0,0,0.2)", border: `1px solid ${border}` }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: ds.textPrimary, margin: 0 }}>
                  {editingId ? (isRTL ? "تعديل العملة" : "Edit Currency") : (isRTL ? "إضافة عملة جديدة" : "Add New Currency")}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ background: isDark ? ds.surface2 : "#F1F5F9", border: "none", width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <X size={18} color={ds.textPrimary} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "رمز العملة (مثل USD)" : "Currency Code (e.g. USD)"}</label>
                  <input type="text" value={formData.currency_code} onChange={e => setFormData(p => ({ ...p, currency_code: e.target.value.toUpperCase() }))} style={getInputStyle()} />
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "الاسم (عربي)" : "Name (AR)"}</label>
                    <input type="text" value={formData.currency_name_ar} onChange={e => setFormData(p => ({ ...p, currency_name_ar: e.target.value }))} style={getInputStyle()} />
                  </div>
                  <div>
                    <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "الاسم (إنجليزي)" : "Name (EN)"}</label>
                    <input type="text" value={formData.currency_name_en} onChange={e => setFormData(p => ({ ...p, currency_name_en: e.target.value }))} style={getInputStyle()} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "الرمز (مثل $)" : "Symbol (e.g. $)"}</label>
                    <input type="text" value={formData.currency_symbol} onChange={e => setFormData(p => ({ ...p, currency_symbol: e.target.value }))} style={getInputStyle()} />
                  </div>
                  <div>
                    <label style={{ display: "block", color: ds.textSecondary, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "سعر الصرف للأساسية" : "Exchange Rate to Base"}</label>
                    <input type="number" value={formData.exchange_rate} disabled={formData.is_base_currency} onChange={e => setFormData(p => ({ ...p, exchange_rate: parseFloat(e.target.value) || 1 }))} style={{ ...getInputStyle(), opacity: formData.is_base_currency ? 0.5 : 1 }} />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, height: 44, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button onClick={handleSave} style={{ flex: 1, height: 44, background: "#2563EB", border: "none", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Check size={18} /> {isRTL ? "حفظ العملة" : "Save Currency"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
