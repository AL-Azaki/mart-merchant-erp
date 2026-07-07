import { useState, useRef } from "react";
import { motion } from "motion/react";
import { X, Check, FileText, Calendar, Lock, Image as ImageIcon, Camera } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useToast } from "@/providers/ToastProvider";
import type { DocumentItem } from "@/core/data/documentsMockData";

interface DocumentFormSheetProps {
  onClose: () => void;
  onSave: (data: Partial<DocumentItem>) => void;
}

export function DocumentFormSheet({ onClose, onSave }: DocumentFormSheetProps) {
  const { isDark, isRTL, ds } = useApp();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: "",
    category: "invoice" as DocumentItem["category"],
    ref_number: "",
    issue_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
    notes: "",
  });

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        toast.success(isRTL ? "تم إرفاق المستند بنجاح" : "Document attached successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.warning(isRTL ? "يرجى كتابة اسم المستند" : "Please enter document title");
      return;
    }

    onSave({
      ...formData,
      file_url: capturedImage || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%23F1F5F9" rx="8"/><text x="150" y="200" font-family="sans-serif" font-size="14" fill="%2394A3B8" text-anchor="middle">مستند أرشيفي</text></svg>`,
      expiry_date: formData.expiry_date || null
    });
  };

  const getInputStyle = () => ({
    width: "100%", height: 44, padding: "0 12px",
    background: isDark ? ds.surface2 : "#FFFFFF",
    border: `1px solid ${border}`, borderRadius: 10,
    color: ds.textPrimary, fontSize: 14, fontWeight: 500,
    outline: "none", fontFamily: "inherit",
    boxSizing: "border-box" as const
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }} />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ position: "relative", width: "100%", maxWidth: 500, maxHeight: "90vh", display: "flex", flexDirection: "column", background: bg, borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
        
        {/* Header */}
        <div style={{ background: surface, padding: "16px 20px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(139, 92, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={18} color="#8B5CF6" />
            </div>
            <h2 style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 800 }}>
              {isRTL ? "أرشفة مستند جديد" : "Archive New Document"}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
            <X size={20} color={ds.textPrimary} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
            
            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "اسم الوثيقة / المستند *" : "Document Title *"}</label>
              <input name="title" value={formData.title} onChange={handleChange} required placeholder={isRTL ? "مثال: رخصة مزاولة المهنة 2026" : "e.g. Business License 2026"} style={getInputStyle()} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", color: ds.textSecondary, fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "تصنيف المستند *" : "Category *"}</label>
                <select name="category" value={formData.category} onChange={handleChange} style={getInputStyle()}>
                  <option value="invoice">{isRTL ? "فاتورة مصورة" : "Scanned Invoice"}</option>
                  <option value="contract">{isRTL ? "عقود واتفاقيات" : "Contracts"}</option>
                  <option value="license">{isRTL ? "تراخيص وبطاقات" : "Licenses & Permits"}</option>
                  <option value="other">{isRTL ? "أخرى" : "Other"}</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", color: ds.textSecondary, fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "رقم المرجع / الوثيقة" : "Reference No."}</label>
                <input name="ref_number" value={formData.ref_number} onChange={handleChange} placeholder="REF-XXXX" style={getInputStyle()} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", color: ds.textSecondary, fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "تاريخ الإصدار" : "Issue Date"}</label>
                <input type="date" name="issue_date" value={formData.issue_date} onChange={handleChange} style={getInputStyle()} />
              </div>

              <div>
                <label style={{ display: "block", color: ds.textSecondary, fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "تاريخ الانتهاء (تنبيه)" : "Expiry Date (Alert)"}</label>
                <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} style={getInputStyle()} />
              </div>
            </div>

            {/* Document scan / photograph simulation */}
            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>{isRTL ? "صورة المستند / الفاتورة" : "Document / Invoice Image"}</label>
              
              <div style={{ border: `2px dashed ${border}`, borderRadius: 16, height: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: isDark ? ds.surface2 : "#F8FAFC", overflow: "hidden", position: "relative" }}>
                {capturedImage ? (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
                    <img src={capturedImage} alt="Captured preview" style={{ height: "80%", objectFit: "contain", borderRadius: 8, border: `1px solid ${border}` }} />
                    <div style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#10B981" }}>{isRTL ? "جاهز للأرشفة" : "Scanned Successfully"}</span>
                      <button type="button" onClick={() => setCapturedImage(null)} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#EF4444", fontSize: 11, fontWeight: 700, cursor: "pointer", padding: 0 }}>
                        {isRTL ? "حذف وإعادة تصوير" : "Delete & Recapture"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        ref={fileInputRef} 
                        style={{ display: "none" }} 
                        onChange={handleFileUpload} 
                      />
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        ref={cameraInputRef} 
                        style={{ display: "none" }} 
                        onChange={handleFileUpload} 
                      />
                      <button type="button" onClick={() => cameraInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "#8B5CF6", color: "white", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        <Camera size={14} /> {isRTL ? "تصوير بالكاميرا" : "Capture Photo"}
                      </button>
                      <button type="button" onClick={() => fileInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: isDark ? ds.surface : "#FFFFFF", color: ds.textPrimary, border: `1px solid ${border}`, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        <ImageIcon size={14} /> {isRTL ? "معرض الصور" : "Gallery Upload"}
                      </button>
                    </div>
                    <span style={{ fontSize: 11, color: ds.textMuted }}>{isRTL ? "صوّر الفاتورة أو العقد مباشرة أو ارفعه من جهازك" : "Scan documents and receipts or upload"}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: "block", color: ds.textSecondary, fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>{isRTL ? "ملاحظات إضافية" : "Additional Notes"}</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder={isRTL ? "أضف أي ملاحظات هامة حول هذا المستند..." : "Add document notes..."} style={{ ...getInputStyle(), height: 60, padding: 8, resize: "none" }} />
            </div>

          </div>

          {/* Footer actions */}
          <div style={{ padding: "12px 20px", background: surface, borderTop: `1px solid ${border}`, display: "flex", gap: 12, flexShrink: 0 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, height: 44, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 10, color: ds.textSecondary, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button type="submit" style={{ flex: 1, height: 44, background: "#8B5CF6", border: "none", borderRadius: 10, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Check size={16} strokeWidth={2.5} /> {isRTL ? "أرشفة الآن" : "Archive Document"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
