import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Cpu, Activity, AlertTriangle, Calendar, MapPin, DollarSign, Edit, Trash2 } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { MOCK_ASSETS, FixedAsset } from "@/core/data/inventoryExtraMockData";
import { FixedAssetFormSheet } from "../components/FixedAssetFormSheet";
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";

export function FixedAssetListScreen() {
  const { isRTL, isDark, ds } = useApp();

  const [search, setSearch] = useState("");
  const [localAssets, setLocalAssets] = useState<FixedAsset[]>(MOCK_ASSETS);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<FixedAsset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<FixedAsset | null>(null);

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
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, paddingBottom: 24 }}>
          {filteredAssets.map(asset => {
            const isExcellent = asset.status === "excellent";
            const isMaintenance = asset.status === "needs_maintenance";
            const color = isExcellent ? "#10B981" : isMaintenance ? "#F59E0B" : "#EF4444";
            const bg = isExcellent ? "rgba(16,185,129,0.1)" : isMaintenance ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
            const statusLabel = isExcellent ? (isRTL ? "ممتاز" : "Excellent") : isMaintenance ? (isRTL ? "صيانة" : "Maintenance") : (isRTL ? "تالف" : "Broken");

            return (
              <motion.div key={asset.id} layout
                style={{ background: surface, border: `1px solid ${border}`, borderRadius: 20, padding: 20, position: "relative", boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
                {/* Status Badge */}
                <span style={{ position: "absolute", top: 16, [isRTL ? "left" : "right"]: 16, fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 8, background: bg, color }}>
                  {statusLabel}
                </span>

                <h4 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 800, margin: "0 0 4px 0", maxWidth: "70%" }}>{asset.name}</h4>
                <div style={{ color: ds.textSecondary, fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 16 }}>{asset.code}</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: `1px solid ${border}`, paddingTop: 14, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: ds.textSecondary, fontSize: 13 }}>
                    <Cpu size={15} color={ds.textMuted} />
                    <span>{asset.category}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: ds.textSecondary, fontSize: 13 }}>
                    <MapPin size={15} color={ds.textMuted} />
                    <span>{asset.location}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: ds.textSecondary, fontSize: 13 }}>
                    <Calendar size={15} color={ds.textMuted} />
                    <span>{asset.purchase_date}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: ds.textPrimary, fontSize: 14, fontWeight: 700 }}>
                    <DollarSign size={15} color="#10B981" />
                    <span>{asset.cost.toLocaleString()} <span style={{ fontSize: 11, color: ds.textSecondary }}>YER</span></span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => { setEditingAsset(asset); setShowForm(true); }}
                    style={{ background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Edit size={16} color={ds.textPrimary} />
                  </button>
                  <button onClick={() => setAssetToDelete(asset)}
                    style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Trash2 size={16} color="#EF4444" />
                  </button>
                </div>
              </motion.div>
            );
          })}
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
    </div>
  );
}
