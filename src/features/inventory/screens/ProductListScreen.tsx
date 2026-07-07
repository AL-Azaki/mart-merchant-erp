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
import { ProductDetailScreen } from "../components/ProductDetailScreen";
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
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

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

      {/* Top Search Bar & Actions (Tablet First) */}
      <div style={{ padding: "24px", flexShrink: 0, display: "flex", gap: 16, flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={24} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 20, pointerEvents: "none" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isRTL ? "ابحث عن منتج، كود، أو باركود..." : "Search products, code, or barcode..."}
              style={{ width: "100%", height: 60, boxSizing: "border-box", paddingInlineStart: 56, paddingInlineEnd: 24, background: surface, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 16, color: ds.textPrimary, fontSize: 16, fontWeight: 600, outline: "none", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", transition: "0.2s" }}
            />
          </div>
          <motion.button 
            title={t.addProduct}
            whileTap={{ scale: 0.95 }} 
            onClick={() => { setEditingProduct(null); setShowForm(true); }}
            style={{ height: 60, background: "linear-gradient(135deg, #10B981, #059669)", border: "none", borderRadius: 16, padding: "0 32px", color: "white", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 20px rgba(16,185,129,0.3)" }}
          >
            <Plus size={24} strokeWidth={3} />
            {t.addProduct}
          </motion.button>
        </div>

        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }} className="scrollbar-hide">
          {[
            { id: "all", label: isRTL ? "جميع المنتجات" : "All Products" },
            { id: "in_stock", label: isRTL ? "متوفر" : "In Stock" },
            { id: "low_stock", label: isRTL ? "منخفض المخزون" : "Low Stock" },
            { id: "out_of_stock", label: isRTL ? "غير متوفر" : "Out of Stock" },
          ].map(chip => {
            const isActive = stockFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setStockFilter(chip.id as any)}
                style={{
                  height: 48, padding: "0 24px", borderRadius: 24, flexShrink: 0, cursor: "pointer",
                  fontSize: 15, fontWeight: 700, fontFamily: "inherit", border: "none", transition: "0.2s",
                  background: isActive ? "#3B82F6" : isDark ? ds.surface2 : "#E2E8F0",
                  color: isActive ? "white" : ds.textPrimary,
                  boxShadow: isActive ? "0 4px 12px rgba(59,130,246,0.3)" : "none"
                }}
              >
                {isActive && <span style={{ marginInlineEnd: 8 }}>✔</span>}
                {chip.label}
              </button>
            )
          })}
          
          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{ 
              height: 48, padding: "0 20px", borderRadius: 24, flexShrink: 0, cursor: "pointer",
              fontSize: 15, fontWeight: 700, fontFamily: "inherit", border: `1px solid ${showAdvancedFilters ? "#10B981" : (isDark ? ds.border : "#CBD5E1")}`, transition: "0.2s",
              background: showAdvancedFilters ? "rgba(16,185,129,0.1)" : "transparent",
              color: showAdvancedFilters ? "#10B981" : ds.textSecondary,
              display: "flex", alignItems: "center", gap: 8
            }}
          >
            <Filter size={18} />
            {isRTL ? "فلاتر وتصنيفات إضافية" : "More Filters"}
          </button>
        </div>
      </div>

        {/* Large KPI Cards (Tablet First) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, padding: "0 24px", marginBottom: 24 }}>
          {[
            { id: "all", label: isRTL ? "إجمالي المنتجات" : "Total Products", count: stats.total, color: "#3B82F6", bgTint: "rgba(59,130,246,0.08)" },
            { id: "in_stock", label: isRTL ? "متوفر" : "In Stock", count: stats.inStock, color: "#10B981", bgTint: "rgba(16,185,129,0.08)" },
            { id: "low_stock", label: isRTL ? "منخفض المخزون" : "Low Stock", count: stats.lowStock, color: "#F59E0B", bgTint: "rgba(245,158,11,0.08)" },
            { id: "out_of_stock", label: isRTL ? "غير متوفر" : "Out of Stock", count: stats.outOfStock, color: "#EF4444", bgTint: "rgba(239,68,68,0.08)" },
          ].map(card => {
            return (
              <div
                key={card.id}
                style={{
                  background: surface,
                  border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`,
                  borderRadius: 20,
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: ds.textSecondary }}>
                  {card.label}
                </span>
                <span style={{ fontSize: 32, fontWeight: 900, color: card.color }}>
                  {card.count}
                </span>
              </div>
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
              <div style={{ padding: "0 24px", marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: ds.textPrimary, marginBottom: 12 }}>
                  {isRTL ? "تصفية حسب التصنيف:" : "Filter by Category:"}
                </div>
                <div className="scrollbar-hide" style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
                  {[{ id: null, category_name: t.filterAll }, ...MOCK_CATEGORIES].map(c => {
                    const active = activeCat === c.id;
                    return (
                      <button key={String(c.id)} onClick={() => setActiveCat(c.id)}
                        style={{ flexShrink: 0, padding: "12px 24px", borderRadius: 14, border: `1px solid ${active ? "#10B981" : isDark ? ds.border : "#E2E8F0"}`, cursor: "pointer", fontFamily: "inherit", background: active ? "rgba(16,185,129,0.1)" : surface, color: active ? "#10B981" : ds.textSecondary, fontSize: 15, fontWeight: 700, transition: "0.2s" }}>
                        {c.category_name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Product Data Grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        <div style={{ background: surface, border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
            <thead>
              <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `2px solid ${isDark ? ds.border : "#E2E8F0"}` }}>
                <th style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 700 }}>{isRTL ? "المنتج" : "Product"}</th>
                <th style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 700 }}>{isRTL ? "الكود / الباركود" : "Code / Barcode"}</th>
                <th style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 700 }}>{isRTL ? "التصنيف" : "Category"}</th>
                <th style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 700 }}>{isRTL ? "سعر البيع الأساسي" : "Base Price"}</th>
                <th style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 700 }}>{isRTL ? "حالة المخزون" : "Stock Status"}</th>
                <th style={{ padding: "20px 24px", color: ds.textSecondary, fontSize: 14, fontWeight: 700, textAlign: "center" }}>{isRTL ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {finalFilteredAndSortedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 40, textAlign: "center", color: ds.textMuted, fontSize: 14 }}>
                      {isRTL ? "لا توجد منتجات تطابق بحثك" : "No products found"}
                    </td>
                  </tr>
                ) : (
                  finalFilteredAndSortedProducts.map((p, i) => {
                    const isOut = p.isOut;
                    const isLow = p.isLow;
                    
                    return (
                      <motion.tr key={p.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedProduct(p)}
                        style={{ borderBottom: i === finalFilteredAndSortedProducts.length - 1 ? "none" : `1px solid ${isDark ? ds.border : "#F1F5F9"}`, cursor: "pointer", transition: "background 0.2s" }}
                        onMouseOver={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC"}
                        onMouseOut={e => e.currentTarget.style.background = "transparent"}
                      >
                        {/* Product Info */}
                        <td style={{ padding: "20px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{ width: 56, height: 56, borderRadius: 12, background: isDark ? ds.surface2 : "#F8FAFC", border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Package size={28} color={ds.textMuted} strokeWidth={1.5} />
                            </div>
                            <div>
                              <h3 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 800, margin: "0 0 6px 0", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>{p.product_name}</h3>
                              <span style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                                <Database size={14} /> {p.unitsCount} {isRTL ? "وحدات تخزين" : "Units"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td style={{ padding: "20px 24px" }}>
                          <div style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 800 }}>{p.product_code}</div>
                          {p.baseUnit?.barcode && <div style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 600, marginTop: 6 }}>{p.baseUnit.barcode}</div>}
                        </td>

                        {/* Category */}
                        <td style={{ padding: "20px 24px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", background: isDark ? ds.surface2 : "#F1F5F9", color: ds.textSecondary, borderRadius: 8, fontSize: 14, fontWeight: 700 }}>
                            <Tag size={16} /> {p.category?.category_name || (isRTL ? "بدون فئة" : "Uncategorized")}
                          </span>
                        </td>

                        {/* Price */}
                        <td style={{ padding: "20px 24px" }}>
                          <div style={{ color: "#10B981", fontSize: 18, fontWeight: 900 }}>
                            {p.baseUnit ? p.baseUnit.selling_price.toLocaleString() : "0"} 
                            <span style={{ fontSize: 13, color: ds.textSecondary, marginInlineStart: 6 }}>{isRTL ? "ر.ي" : "YER"}</span>
                          </div>
                        </td>

                        {/* Stock */}
                        <td style={{ padding: "20px 24px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, fontSize: 15, fontWeight: 800, 
                            background: isOut ? "rgba(239,68,68,0.1)" : isLow ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                            color: isOut ? "#EF4444" : isLow ? "#F59E0B" : "#10B981"
                          }}>
                            {isOut || isLow ? <AlertTriangle size={18} /> : null}
                            {p.stockQuantity} {isRTL ? "متوفر" : "Avail."}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "20px 24px" }}>
                          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                            <button title={isRTL ? "تعديل" : "Edit"} onClick={(e) => { e.stopPropagation(); setEditingProduct(p); setShowForm(true); }} style={{ width: 44, height: 44, borderRadius: 12, background: isDark ? ds.surface2 : "#F8FAFC", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background=isDark?ds.border:"#E2E8F0"} onMouseOut={e=>e.currentTarget.style.background=isDark?ds.surface2:"#F8FAFC"}>
                              <Edit size={20} color={ds.textSecondary} />
                            </button>
                            <button title={isRTL ? "حذف" : "Delete"} onClick={(e) => { e.stopPropagation(); setProductToDelete(p); }} style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e=>e.currentTarget.style.background="rgba(239,68,68,0.15)"} onMouseOut={e=>e.currentTarget.style.background="rgba(239,68,68,0.1)"}>
                              <Trash2 size={20} color="#EF4444" />
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
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailScreen 
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            onEdit={() => {
              setEditingProduct(selectedProduct);
              setShowForm(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
