import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Package, Edit, Trash2, Tag, 
  Filter, AlertTriangle, Database
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_PRODUCT_UNITS, MOCK_INVENTORIES } from "@/core/data/salesMockData";
import type { Product } from "@/core/types/catalog";
import { ProductFormSheet } from "../components/ProductFormSheet";
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";
import { useToast } from "@/providers/ToastProvider";

export function ProductListScreen({ initialShowForm = false, products = MOCK_PRODUCTS, onUpdateProducts }: { initialShowForm?: boolean, products?: Product[], onUpdateProducts?: (p: Product[]) => void }) {
  const { t, isDark, isRTL, ds } = useApp();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(initialShowForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);

  // Advanced filters and sorting state
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const [sortBy, setSortBy] = useState<"default" | "name_asc" | "name_desc" | "stock_asc" | "stock_desc" | "price_asc" | "price_desc" | "units_desc">("default");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // 1. Calculate basic details for all products (no filters applied yet)
  const allProductsHydrated = useMemo(() => {
    return products.map(p => {
      const category = MOCK_CATEGORIES.find(c => c.id === p.category_id);
      const units = (p as any).mock_units || MOCK_PRODUCT_UNITS.filter(u => u.product_id === p.id);
      const baseUnit = units.find((u: any) => u.is_base_unit) || units[0];
      
      const invItems = MOCK_INVENTORIES.filter(inv => units.some(u => u.id === inv.product_unit_id));
      const stockQuantity = invItems.reduce((sum, inv) => sum + inv.quantity, 0);
      const alertQuantity = invItems.reduce((sum, inv) => sum + (inv.alert_quantity ?? 10), 0);
      
      const isOut = stockQuantity <= 0;
      const isLow = stockQuantity > 0 && stockQuantity <= (alertQuantity || 10);
      const isInStock = stockQuantity > (alertQuantity || 10);

      return {
        ...p,
        category,
        units,
        baseUnit,
        unitsCount: units.length,
        stockQuantity,
        alertQuantity,
        isOut,
        isLow,
        isInStock
      };
    });
  }, [products]);

  // 2. Filter products by search and category
  const filteredSearchAndCat = useMemo(() => {
    return allProductsHydrated.filter(p => {
      if (activeCat && p.category_id !== activeCat) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.product_name.toLowerCase().includes(q) || 
        (p.product_code ?? "").toLowerCase().includes(q) || 
        (p.baseUnit?.barcode ?? "").includes(q)
      );
    });
  }, [allProductsHydrated, search, activeCat]);

  // 3. Compute stats based on search & cat filter
  const stats = useMemo(() => {
    let total = filteredSearchAndCat.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    filteredSearchAndCat.forEach(p => {
      if (p.isOut) outOfStock++;
      else if (p.isLow) lowStock++;
      else inStock++;
    });

    return { total, inStock, lowStock, outOfStock };
  }, [filteredSearchAndCat]);

  // 4. Filter by Stock Status and then Sort
  const finalFilteredAndSortedProducts = useMemo(() => {
    let list = filteredSearchAndCat.filter(p => {
      if (stockFilter === "in_stock") return !p.isOut && !p.isLow;
      if (stockFilter === "low_stock") return p.isLow;
      if (stockFilter === "out_of_stock") return p.isOut;
      return true;
    });

    // Apply Sorting
    if (sortBy === "name_asc") {
      list.sort((a, b) => a.product_name.localeCompare(b.product_name, isRTL ? "ar" : "en"));
    } else if (sortBy === "name_desc") {
      list.sort((a, b) => b.product_name.localeCompare(a.product_name, isRTL ? "ar" : "en"));
    } else if (sortBy === "stock_desc") {
      list.sort((a, b) => b.stockQuantity - a.stockQuantity);
    } else if (sortBy === "stock_asc") {
      list.sort((a, b) => a.stockQuantity - b.stockQuantity);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => {
        const pA = a.baseUnit?.selling_price || 0;
        const pB = b.baseUnit?.selling_price || 0;
        return pB - pA;
      });
    } else if (sortBy === "price_asc") {
      list.sort((a, b) => {
        const pA = a.baseUnit?.selling_price || 0;
        const pB = b.baseUnit?.selling_price || 0;
        return pA - pB;
      });
    } else if (sortBy === "units_desc") {
      list.sort((a, b) => b.unitsCount - a.unitsCount);
    }

    return list;
  }, [filteredSearchAndCat, stockFilter, sortBy, isRTL]);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const subtle = isDark ? ds.surface2 : "#F1F5F9";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", background: surface, borderBottom: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Package size={22} color="#10B981" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>{isRTL ? "المنتجات والمخزون" : "Products & Inventory"}</h2>
            <p style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 500 }}>{finalFilteredAndSortedProducts.length} {isRTL ? "منتج" : "Products"}</p>
          </div>
        </div>
        <motion.button 
          title={t.addProduct}
          whileTap={{ scale: 0.95 }} 
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          style={{ height: 44, background: "linear-gradient(135deg, #10B981, #059669)", border: "none", borderRadius: 12, padding: "0 16px", color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}
        >
          <Plus size={18} strokeWidth={2.5} />
          {t.addProduct}
        </motion.button>
      </div>

      {/* Toolbar */}
      <div style={{ padding: "16px 24px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isRTL ? "ابحث عن منتج، كود، باركود..." : "Search products, code, barcode..."}
              style={{ width: "100%", height: 46, boxSizing: "border-box", paddingInlineStart: 44, paddingInlineEnd: 16, background: surface, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}
            />
          </div>
          
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            style={{
              height: 46, padding: "0 12px",
              background: surface,
              border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`,
              borderRadius: 12,
              color: ds.textPrimary,
              fontSize: 13,
              fontWeight: 600,
              outline: "none",
              fontFamily: "inherit",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
            }}
          >
            <option value="default">{isRTL ? "الترتيب الافتراضي" : "Default Sort"}</option>
            <option value="name_asc">{isRTL ? "الاسم (أ - ي)" : "Name (A - Z)"}</option>
            <option value="name_desc">{isRTL ? "الاسم (ي - أ)" : "Name (Z - A)"}</option>
            <option value="stock_desc">{isRTL ? "المخزون (الأكثر أولاً)" : "Stock (High to Low)"}</option>
            <option value="stock_asc">{isRTL ? "المخزون (الأقل أولاً)" : "Stock (Low to High)"}</option>
            <option value="price_desc">{isRTL ? "السعر (الأعلى أولاً)" : "Price (High to Low)"}</option>
            <option value="price_asc">{isRTL ? "السعر (الأقل أولاً)" : "Price (Low to High)"}</option>
            <option value="units_desc">{isRTL ? "عدد الوحدات (الأكثر أولاً)" : "Most Units"}</option>
          </select>

          <button 
            title={isRTL ? "خيارات التصفية" : "Filters"} 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{ 
              width: 46, height: 46, borderRadius: 12, 
              background: showAdvancedFilters ? "rgba(16,185,129,0.1)" : surface, 
              border: `1px solid ${showAdvancedFilters ? "#10B981" : (isDark ? ds.border : "#E2E8F0")}`, 
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", 
              boxShadow: "0 2px 6px rgba(0,0,0,0.02)", color: showAdvancedFilters ? "#10B981" : ds.textSecondary,
              transition: "all 0.2s"
            }}
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Quick Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 16 }}>
          {[
            { id: "all", label: isRTL ? "إجمالي المنتجات" : "Total Products", count: stats.total, color: "#3B82F6", bgTint: "rgba(59,130,246,0.08)" },
            { id: "in_stock", label: isRTL ? "متوفر" : "In Stock", count: stats.inStock, color: "#10B981", bgTint: "rgba(16,185,129,0.08)" },
            { id: "low_stock", label: isRTL ? "قريب من النفاد" : "Low Stock", count: stats.lowStock, color: "#F59E0B", bgTint: "rgba(245,158,11,0.08)" },
            { id: "out_of_stock", label: isRTL ? "غير متوفر" : "Out of Stock", count: stats.outOfStock, color: "#EF4444", bgTint: "rgba(239,68,68,0.08)" },
          ].map(card => {
            const isActive = stockFilter === card.id;
            return (
              <motion.button
                key={card.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStockFilter(card.id as any)}
                style={{
                  background: isActive ? card.bgTint : surface,
                  border: `1px solid ${isActive ? card.color : (isDark ? ds.border : "#E2E8F0")}`,
                  borderRadius: 14,
                  padding: "12px 16px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 4,
                  textAlign: isRTL ? "right" : "left",
                  transition: "all 0.2s",
                  boxShadow: isActive ? `0 4px 12px ${card.color}15` : "0 2px 6px rgba(0,0,0,0.02)"
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 800, color: card.color }}>
                  {card.count}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? card.color : ds.textSecondary }}>
                  {card.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Collapsible Category Filters */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: ds.textSecondary }}>
                {isRTL ? "تصفية حسب التصنيف:" : "Filter by Category:"}
              </div>
              <div className="scrollbar-hide" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
                {[{ id: null, category_name: t.filterAll }, ...MOCK_CATEGORIES].map(c => {
                  const active = activeCat === c.id;
                  return (
                    <motion.button key={String(c.id)} whileTap={{ scale: 0.95 }} onClick={() => setActiveCat(c.id)}
                      style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 10, border: `1px solid ${active ? "#10B981" : isDark ? ds.border : "#E2E8F0"}`, cursor: "pointer", fontFamily: "inherit", background: active ? "rgba(16,185,129,0.1)" : surface, color: active ? "#10B981" : ds.textSecondary, fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}>
                      {c.category_name}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          <AnimatePresence>
            {finalFilteredAndSortedProducts.map((p, i) => {
              const isOut = p.isOut;
              const isLow = p.isLow;
              
              return (
                <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                  style={{ background: surface, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", position: "relative" }}>
                  
                  <div style={{ padding: 16, display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 12, background: subtle, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                       <Package size={28} color={ds.textMuted} strokeWidth={1.5} />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                        <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.product_name}</h3>
                      </div>
                      <div style={{ color: ds.textSecondary, fontSize: 12, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        <Tag size={12} /> {p.category?.category_name || (isRTL ? "بدون فئة" : "Uncategorized")}
                        <div style={{ width: 4, height: 4, borderRadius: 2, background: ds.textMuted }} />
                        <Database size={12} /> {p.unitsCount} {isRTL ? "وحدات" : "Units"}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#10B981", fontSize: 16, fontWeight: 800 }}>
                          {p.baseUnit ? p.baseUnit.selling_price.toLocaleString() : "0"} 
                          <span style={{ fontSize: 11, color: ds.textSecondary, marginInlineStart: 4 }}>{isRTL ? "ر.ي" : "YER"}</span>
                        </span>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: 4, background: isOut ? "rgba(239,68,68,0.1)" : isLow ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)", padding: "4px 8px", borderRadius: 6, color: isOut ? "#EF4444" : isLow ? "#F59E0B" : "#10B981", fontSize: 12, fontWeight: 700 }}>
                          {isOut || isLow ? <AlertTriangle size={14} /> : null}
                          {p.stockQuantity}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: `1px solid ${isDark ? ds.border : "#F1F5F9"}`, padding: "8px 16px", display: "flex", justifyContent: "flex-end", gap: 8, background: subtle }}>
                    <button title={isRTL ? "تعديل" : "Edit"} onClick={() => { setEditingProduct(p); setShowForm(true); }} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <Edit size={16} color={ds.textSecondary} />
                    </button>
                    <button title={isRTL ? "حذف" : "Delete"} onClick={() => setProductToDelete(p)} style={{ width: 32, height: 32, borderRadius: 8, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
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
          <ProductFormSheet 
            product={editingProduct as any} 
            onClose={() => setShowForm(false)} 
            onSave={(data) => {
              if (editingProduct) {
                onUpdateProducts?.(products.map(p => p.id === editingProduct.id ? {
                  ...p,
                  product_name: data.name,
                  category_id: data.category_id || null,
                  brand_id: data.brand_id || null,
                  description: data.description,
                  is_active: data.is_active,
                  mock_units: data.units,
                } : p));
              } else {
                const newProduct: Product = {
                  id: `prod_${Date.now()}`,
                  business_id: "biz_001",
                  product_code: `PRD-${Math.floor(Math.random() * 10000)}`,
                  product_name: data.name,
                  category_id: data.category_id || null,
                  brand_id: data.brand_id || null,
                  description: data.description,
                  is_active: data.is_active,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  deleted_at: null,
                  mock_units: data.units,
                } as any;
                onUpdateProducts?.([newProduct, ...products]);
              }
              setShowForm(false);
              toast.success(isRTL ? "تم حفظ المنتج بنجاح!" : "Product saved successfully!");
            }} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {productToDelete && (
          <ConfirmDeleteModal 
            isOpen={true} 
            onClose={() => setProductToDelete(null)}
            onConfirm={() => {
              onUpdateProducts?.(products.filter(prod => prod.id !== productToDelete.id));
            }}
            itemName={productToDelete.product_name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
