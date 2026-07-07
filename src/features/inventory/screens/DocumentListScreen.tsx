import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, FileText, Calendar, Eye, Download, Trash2, ShieldAlert, Award, FileCode, Check, X } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";
import { MOCK_DOCUMENTS, type DocumentItem } from "@/core/data/documentsMockData";
import { DocumentFormSheet } from "../components/DocumentFormSheet";
import { ConfirmDeleteModal } from "@/shared/components/ConfirmDeleteModal";

export function DocumentListScreen() {
  const { isDark, isRTL, ds } = useApp();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | DocumentItem["category"]>("all");
  const [documents, setDocuments] = useState<DocumentItem[]>(MOCK_DOCUMENTS);
  
  const [showForm, setShowForm] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";
  const subtle = isDark ? ds.surface2 : "#F1F5F9";

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase()) || doc.ref_number.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === "all" || doc.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [search, activeCategory, documents]);

  // Statistics
  const stats = useMemo(() => {
    const total = documents.length;
    const invoices = documents.filter(d => d.category === "invoice").length;
    
    // Calculate near expiry licenses/contracts
    const now = new Date();
    const nearExpiry = documents.filter(d => {
      if (!d.expiry_date) return false;
      const expiry = new Date(d.expiry_date);
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 30; // expires within 30 days
    }).length;

    return { total, invoices, nearExpiry };
  }, [documents]);

  const categories = [
    { id: "all", label: isRTL ? "الكل" : "All" },
    { id: "invoice", label: isRTL ? "فواتير مصورة" : "Scanned Invoices" },
    { id: "contract", label: isRTL ? "عقود" : "Contracts" },
    { id: "license", label: isRTL ? "تراخيص" : "Licenses" },
    { id: "other", label: isRTL ? "مستندات أخرى" : "Others" },
  ] as const;

  const getCategoryBadge = (cat: DocumentItem["category"]) => {
    switch (cat) {
      case "contract":
        return { label: isRTL ? "عقد" : "Contract", color: "#3B82F6", bg: "rgba(59,130,246,0.1)" };
      case "license":
        return { label: isRTL ? "ترخيص" : "License", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" };
      case "invoice":
        return { label: isRTL ? "فاتورة" : "Invoice", color: "#10B981", bg: "rgba(16,185,129,0.1)" };
      default:
        return { label: isRTL ? "أخرى" : "Other", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" };
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: bg }}>
      
      {/* Upper toolbar stats */}
      <div style={{ padding: "16px 24px", flexShrink: 0, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={18} color="#8B5CF6" />
          </div>
          <div>
            <div style={{ color: ds.textSecondary, fontSize: 11, fontWeight: 700 }}>{isRTL ? "المستندات المؤرشفة" : "Archived Docs"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 800, marginTop: 2 }}>{stats.total}</div>
          </div>
        </div>

        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Award size={18} color="#10B981" />
          </div>
          <div>
            <div style={{ color: ds.textSecondary, fontSize: 11, fontWeight: 700 }}>{isRTL ? "الفواتير المصورة" : "Scanned Invoices"}</div>
            <div style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 800, marginTop: 2 }}>{stats.invoices}</div>
          </div>
        </div>

        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: stats.nearExpiry > 0 ? "rgba(239,68,68,0.1)" : "rgba(148,163,184,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldAlert size={18} color={stats.nearExpiry > 0 ? "#EF4444" : ds.textMuted} />
          </div>
          <div>
            <div style={{ color: ds.textSecondary, fontSize: 11, fontWeight: 700 }}>{isRTL ? "تنبيهات انتهاء الصلاحية" : "Expiry Warnings"}</div>
            <div style={{ color: stats.nearExpiry > 0 ? "#EF4444" : ds.textPrimary, fontSize: 16, fontWeight: 800, marginTop: 2 }}>{stats.nearExpiry}</div>
          </div>
        </div>
      </div>

      {/* Header and Add button */}
      <div style={{ padding: "0 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 320, position: "relative" }}>
          <Search size={16} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 12, pointerEvents: "none" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? "ابحث باسم الوثيقة أو المرجع..." : "Search docs, ref..."}
            style={{ width: "100%", height: 38, paddingInlineStart: 38, paddingInlineEnd: 12, background: surface, border: `1px solid ${border}`, borderRadius: 10, color: ds.textPrimary, fontSize: 13, outline: "none", fontFamily: "inherit" }}
          />
        </div>

        <button
          onClick={() => setShowForm(true)}
          style={{ height: 38, background: "#8B5CF6", border: "none", borderRadius: 10, padding: "0 16px", color: "white", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "inherit" }}
        >
          <Plus size={16} strokeWidth={2.5} />
          {isRTL ? "أرشفة وثيقة" : "Archive Doc"}
        </button>
      </div>

      {/* Category selector */}
      <div style={{ padding: "0 24px 16px", display: "flex", gap: 8, flexShrink: 0, overflowX: "auto" }} className="hide-scroll">
        {categories.map(cat => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                border: "none",
                background: active ? "#8B5CF6" : subtle,
                color: active ? "white" : ds.textSecondary,
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                fontFamily: "inherit"
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Documents Data Grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: isRTL ? "right" : "left" }}>
            <thead>
              <tr style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${border}` }}>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, width: "35%" }}>{isRTL ? "الوثيقة والمرفق" : "Document & Attachment"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "رقم المرجع" : "Ref Number"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>{isRTL ? "التواريخ" : "Dates"}</th>
                <th style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 700, textAlign: "center" }}>{isRTL ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 40, textAlign: "center", color: ds.textMuted, fontSize: 14 }}>
                      {isRTL ? "لا توجد مستندات مؤرشفة تطابق البحث" : "No archived documents found"}
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc, i) => {
                    const badge = getCategoryBadge(doc.category);
                    const isExpired = doc.expiry_date ? new Date(doc.expiry_date) < new Date() : false;

                    return (
                      <motion.tr key={doc.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ delay: i * 0.03 }}
                        onClick={() => setPreviewDoc(doc)}
                        style={{ borderBottom: i === filteredDocuments.length - 1 ? "none" : `1px solid ${isDark ? ds.border : "#F1F5F9"}`, cursor: "pointer", transition: "background 0.2s" }}
                        onMouseOver={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC"}
                        onMouseOut={e => e.currentTarget.style.background = "transparent"}
                      >
                        {/* Doc Title & Thumbnail */}
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 10, background: isDark ? ds.surface2 : "#F8FAFC", border: `1px solid ${border}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {doc.file_url ? (
                                <img src={doc.file_url} alt={doc.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <FileText size={20} color={ds.textMuted} />
                              )}
                            </div>
                            <div>
                              <h3 style={{ color: ds.textPrimary, fontSize: 14, fontWeight: 700, margin: "0 0 4px 0", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.title}</h3>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: badge.bg, color: badge.color }}>
                                {badge.label}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Ref Number */}
                        <td style={{ padding: "16px 20px", color: ds.textPrimary, fontSize: 14, fontWeight: 600 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FileCode size={14} color={ds.textMuted} />
                            {doc.ref_number}
                          </div>
                        </td>

                        {/* Dates */}
                        <td style={{ padding: "16px 20px", color: ds.textSecondary, fontSize: 13, fontWeight: 600 }}>
                          <div style={{ marginBottom: 4 }}>
                            {isRTL ? "إصدار:" : "Issued:"} <span style={{ color: ds.textPrimary }}>{doc.issue_date}</span>
                          </div>
                          {doc.expiry_date && (
                            <div style={{ color: isExpired ? "#EF4444" : ds.textSecondary }}>
                              {isRTL ? "انتهاء:" : "Expires:"} {doc.expiry_date}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                            <button title={isRTL ? "معاينة الملف" : "Preview"} onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }} style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.background = isDark ? ds.border : "#E2E8F0"} onMouseOut={e => e.currentTarget.style.background = isDark ? ds.surface2 : "#F1F5F9"}>
                              <Eye size={16} color={ds.textPrimary} />
                            </button>
                            <a href={doc.file_url} download={doc.title} title={isRTL ? "تنزيل الملف" : "Download"} onClick={(e) => e.stopPropagation()} style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.background = isDark ? ds.border : "#E2E8F0"} onMouseOut={e => e.currentTarget.style.background = isDark ? ds.surface2 : "#F1F5F9"}>
                              <Download size={16} color={ds.textPrimary} />
                            </a>
                            <button title={isRTL ? "حذف المستند" : "Delete"} onClick={(e) => { e.stopPropagation(); setDocToDelete(doc); }} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"} onMouseOut={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}>
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

      {/* Add Document Sheet */}
      <AnimatePresence>
        {showForm && (
          <DocumentFormSheet
            onClose={() => setShowForm(false)}
            onSave={(data) => {
              const newDoc: DocumentItem = {
                id: `doc_${Date.now()}`,
                title: data.title!,
                category: data.category!,
                ref_number: data.ref_number || "REF-UNSPECIFIED",
                issue_date: data.issue_date!,
                expiry_date: data.expiry_date || null,
                file_url: data.file_url!,
                notes: data.notes || "",
                created_at: new Date().toISOString()
              };
              setDocuments(prev => [newDoc, ...prev]);
              setShowForm(false);
              toast.success(isRTL ? "تمت أرشفة المستند بنجاح" : "Document archived successfully");
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {docToDelete && (
          <ConfirmDeleteModal
            isOpen={true}
            itemName={docToDelete.title}
            onClose={() => setDocToDelete(null)}
            onConfirm={() => {
              setDocuments(prev => prev.filter(d => d.id !== docToDelete.id));
              setDocToDelete(null);
              toast.success(isRTL ? "تم حذف المستند من الأرشيف" : "Document deleted from archive");
            }}
          />
        )}
      </AnimatePresence>

      {/* Full Document Lightbox Preview overlay */}
      <AnimatePresence>
        {previewDoc && (
          <div style={{ position: "fixed", inset: 0, zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewDoc(null)}
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ position: "relative", background: surface, borderRadius: 20, maxWidth: 500, width: "100%", overflow: "hidden", display: "flex", flexDirection: "column", zIndex: 1 }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${border}` }}>
                <div>
                  <h3 style={{ color: ds.textPrimary, fontSize: 14.5, fontWeight: 800, margin: 0 }}>{previewDoc.title}</h3>
                  <span style={{ fontSize: 11.5, color: ds.textSecondary }}>{previewDoc.ref_number}</span>
                </div>
                <button onClick={() => setPreviewDoc(null)} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                  <X size={18} color={ds.textPrimary} />
                </button>
              </div>

              <div style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <img src={previewDoc.file_url} alt={previewDoc.title} style={{ maxWidth: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 8, border: `1px solid ${border}` }} />
                {previewDoc.notes && (
                  <p style={{ color: ds.textSecondary, fontSize: 12.5, lineHeight: 1.5, margin: 0, alignSelf: "flex-start", background: subtle, padding: 12, borderRadius: 10, width: "100%" }}>
                    <strong>{isRTL ? "ملاحظات الأرشيف:" : "Archive Notes:"} </strong>{previewDoc.notes}
                  </p>
                )}
              </div>

              <div style={{ padding: "12px 20px", background: subtle, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <a href={previewDoc.file_url} download={previewDoc.title} style={{ textDecoration: "none", background: "#8B5CF6", color: "white", padding: "8px 16px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <Download size={14} /> {isRTL ? "تحميل الصورة" : "Download File"}
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
