import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Cpu, Activity, AlertTriangle, Calendar, MapPin, DollarSign, Edit, Trash2 } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_ASSETS, FixedAsset } from "@/core/data/inventoryExtraMockData";
import { FixedAssetFormSheet } from "../components/FixedAssetFormSheet";
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";
import { FixedAssetDetailScreen } from "../components/FixedAssetDetailScreen";

export function FixedAssetListScreen() {
  const { isRTL, isDark, ds } = useApp();

  const [search, setSearch] = useState("");
  const [localAssets, setLocalAssets] = useState<FixedAsset[]>(MOCK_ASSETS);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<FixedAsset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<FixedAsset | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  // Filter
  const filteredAssets = useMemo(() => {
    return localAssets.filter(asset => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        asset.name.toLowerCase().includes(q) ||
        asset.code.toLowerCase().includes(q) ||
        asset.category.toLowerCase().includes(q) ||
        asset.location.toLowerCase().includes(q)
      );
    });
  }, [search, localAssets]);

  // Statistics
  const stats = useMemo(() => {
    const totalCost = localAssets.reduce((sum, item) => sum + item.cost, 0);
    const activeCount = localAssets.filter(a => a.status === "excellent").length;
    const maintenanceCount = localAssets.filter(a => a.status === "needs_maintenance").length;
    return { totalCost, activeCount, maintenanceCount };
  }, [localAssets]);

  const handleSave = (assetData: any) => {
    if (editingAsset) {
      setLocalAssets(prev => prev.map(a => a.id === editingAsset.id ? assetData : a));
      setEditingAsset(null);
    } else {
      setLocalAssets(prev => [assetData, ...prev]);
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (assetToDelete) {
      setLocalAssets(prev => prev.filter(a => a.id !== assetToDelete.id));
      setAssetToDelete(null);
    }
  };



  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg, padding: "24px" }}>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
        {/* Total Assets Capital */}
        <div style={{ background: surface, padding: "16px 20px", borderRadius: 16, border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DollarSign size={20} color="#10B981" />
          </div>
          <div>
            <div style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>{isRTL ? "إجمالي قيمة الأصول" : "Total Assets Value"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 18, fontWeight: 800, marginTop: 4 }}>{stats.totalCost.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 500 }}>YER</span></div>
          </div>
        </div>

        {/* Excellent Status */}
        <div style={{ background: surface, padding: "16px 20px", borderRadius: 16, border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={20} color="#6366F1" />
          </div>
          <div>
            <div style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>{isRTL ? "أصول ممتازة التشغيل" : "Operational Assets"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800, marginTop: 4 }}>{stats.activeCount}</div>
          </div>
        </div>

        {/* Needs Maintenance */}
        <div style={{ background: surface, padding: "16px 20px", borderRadius: 16, border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle size={20} color="#F59E0B" />
          </div>
          <div>
            <div style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>{isRTL ? "تحتاج صيانة" : "Needs Maintenance"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800, marginTop: 4 }}>{stats.maintenanceCount}</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14, pointerEvents: "none" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? "ابحث عن أصل بالاسم، الكود، الموقع..." : "Search assets by name, code..."}
            style={{ width: "100%", height: 46, boxSizing: "border-box", paddingInlineStart: 44, paddingInlineEnd: 16, background: surface, border: `1px solid ${border}`, borderRadius: 12, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit" }}
          />
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }} 
          onClick={() => { setEditingAsset(null); setShowForm(true); }}
          style={{ height: 44, background: "linear-gradient(135deg, #10B981, #059669)", border: "none", borderRadius: 12, padding: "0 16px", color: "white", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit" }}
        >
          <Plus size={18} strokeWidth={2.5} />
          {isRTL ? "إضافة أصل" : "Add Asset"}
        </motion.button>
      </div>

      {/* Assets Grid List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px 24px" }}>
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
            <thead>
              <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${border}` }}>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "30%" }}>{isRTL ? "الأصل الثابت" : "Fixed Asset"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "التصنيف / الموقع" : "Category / Location"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "تاريخ الشراء" : "Purchase Date"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "التكلفة" : "Cost"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "الحالة" : "Status"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, textAlign: "center" }}>{isRTL ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 40, textAlign: "center", color: ds.textMuted, fontSize: 14 }}>
                      {isRTL ? "لا توجد أصول مطابقة للبحث" : "No assets found matching your search"}
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset, i) => {
                    const isExcellent = asset.status === "excellent";
                    const isMaintenance = asset.status === "needs_maintenance";
                    const badgeColor = isExcellent ? "#10B981" : isMaintenance ? "#F59E0B" : "#EF4444";
                    const badgeBg = isExcellent ? "rgba(16,185,129,0.1)" : isMaintenance ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
                    const statusLabel = isExcellent ? (isRTL ? "ممتاز" : "Excellent") : isMaintenance ? (isRTL ? "صيانة" : "Maintenance") : (isRTL ? "تالف" : "Broken");

                    return (
                      <motion.tr key={asset.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedAsset(asset)}
                        style={{ borderBottom: i === filteredAssets.length - 1 ? "none" : `1px solid ${isDark ? ds.border : "#F1F5F9"}`, cursor: "pointer", transition: "background 0.2s" }}
                        onMouseOver={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC"}
                        onMouseOut={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: isDark ? ds.surface2 : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Cpu size={20} color={ds.textPrimary} />
                            </div>
                            <div>
                              <h3 style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700, margin: "0 0 4px 0" }}>{asset.name}</h3>
                              <div style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>{asset.code}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
                          <div style={{ marginBottom: 4 }}>{asset.category}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, color: ds.textSecondary, fontSize: 12 }}>
                            <MapPin size={12} /> {asset.location}
                          </div>
                        </td>

                        <td style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 600 }}>
                          {asset.purchase_date}
                        </td>

                        <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 15, fontWeight: 800 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <DollarSign size={14} color="#10B981" />
                            {asset.cost.toLocaleString()}
                          </div>
                        </td>

                        <td style={{ padding: "16px 20px" }}>
                          <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: badgeBg, color: badgeColor }}>
                            {statusLabel}
                          </span>
                        </td>

                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                            <button title={isRTL ? "تعديل الأصل" : "Edit Asset"} onClick={(e) => { e.stopPropagation(); setEditingAsset(asset); setShowForm(true); }} style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.background = isDark ? ds.border : "#E2E8F0"} onMouseOut={e => e.currentTarget.style.background = isDark ? ds.surface2 : "#F1F5F9"}>
                              <Edit size={16} color={ds.textPrimary} />
                            </button>
                            <button title={isRTL ? "حذف الأصل" : "Delete Asset"} onClick={(e) => { e.stopPropagation(); setAssetToDelete(asset); }} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"} onMouseOut={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}>
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

      {/* Forms & Modals */}
      <AnimatePresence>
        {(showForm || editingAsset) && (
          <FixedAssetFormSheet
            asset={editingAsset}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditingAsset(null); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {assetToDelete && (
          <ConfirmDeleteModal
            title={isRTL ? "حذف أصل ثابت" : "Delete Fixed Asset"}
            message={isRTL ? `هل أنت متأكد من حذف الأصل "${assetToDelete.name}"؟` : `Are you sure you want to delete asset "${assetToDelete.name}"?`}
            onConfirm={handleDelete}
            onCancel={() => setAssetToDelete(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedAsset && (
          <FixedAssetDetailScreen 
            initialAssetId={selectedAsset.id} 
            assets={localAssets} 
            onClose={() => setSelectedAsset(null)} 
            onEdit={(asset) => { setEditingAsset(asset); setShowForm(true); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
