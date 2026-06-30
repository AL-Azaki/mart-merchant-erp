import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Edit, Trash2, Tag, 
  ArrowRight, ArrowLeft, FolderTree
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_CATEGORIES } from "@/core/data/salesMockData";
import type { Category } from "@/core/types/sales";
import { CategoryFormSheet } from "../components/CategoryFormSheet";
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";

export function CategoryListScreen() {
  const { t, isDark, isRTL, ds } = useApp();
  const [search, setSearch] = useState("");
  const [localCategories, setLocalCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Filter
  const categories = localCategories.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.name_en?.toLowerCase() || "").includes(q);
  });

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const subtle = isDark ? ds.surface2 : "#F1F5F9";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", background: surface, borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FolderTree size={22} color="#10B981" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "فئات المنتجات" : "Product Categories"}</h2>
            <p style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 500 }}>{categories.length} {isRTL ? "فئة" : "Categories"}</p>
          </div>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }} 
          onClick={() => { setEditingCategory(null); setShowForm(true); }}
          style={{ height: 44, background: "linear-gradient(135deg, #10B981, #059669)", border: "none", borderRadius: 12, padding: "0 16px", color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}
        >
          <Plus size={18} strokeWidth={2.5} />
          {isRTL ? "إضافة فئة" : "Add Category"}
        </motion.button>
      </div>

      {/* Toolbar */}
      <div style={{ padding: "16px 24px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isRTL ? "ابحث عن فئة..." : "Search category..."}
              style={{ width: "100%", height: 46, boxSizing: "border-box", paddingInlineStart: 44, paddingInlineEnd: 16, background: surface, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          <AnimatePresence>
            {categories.map((c, i) => (
              <motion.div key={c.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                style={{ background: surface, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                
                <div style={{ padding: 16, display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: subtle, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                    <Tag size={20} color={ds.textMuted} strokeWidth={2} />
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>{c.name}</h3>
                    <div style={{ color: ds.textSecondary, fontSize: 12 }}>
                      {c.name_en || "-"}
                    </div>
                  </div>
                  
                  <div style={{ padding: "4px 8px", borderRadius: 8, background: c.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: c.is_active ? "#10B981" : "#EF4444", fontSize: 12, fontWeight: 700 }}>
                    {c.is_active ? (isRTL ? "نشط" : "Active") : (isRTL ? "غير نشط" : "Inactive")}
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${isDark ? ds.border : "#F1F5F9"}`, padding: "8px 16px", display: "flex", justifyContent: "flex-end", gap: 8, background: subtle }}>
                  <button onClick={() => { setEditingCategory(c); setShowForm(true); }} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Edit size={16} color={ds.textSecondary} />
                  </button>
                  <button onClick={() => setCategoryToDelete(c)} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Trash2 size={16} color="#EF4444" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <CategoryFormSheet 
            category={editingCategory} 
            onClose={() => setShowForm(false)} 
            onSave={(data) => {
              if (editingCategory) {
                setLocalCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...data } : c));
              } else {
                const newCat: Category = {
                  id: `cat_${Date.now()}`, business_id: "biz_001",
                  name: data.name!, name_en: data.name_en || null, parent_id: null, sort_order: 1, is_active: data.is_active ?? true,
                  created_at: new Date().toISOString()
                };
                setLocalCategories(prev => [newCat, ...prev]);
              }
              setShowForm(false);
            }} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {categoryToDelete && (
          <ConfirmDeleteModal 
            isOpen={true} 
            onClose={() => setCategoryToDelete(null)}
            onConfirm={() => {
              setLocalCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
            }}
            itemName={categoryToDelete.name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
