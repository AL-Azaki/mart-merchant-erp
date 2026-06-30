import { motion } from "motion/react";
import { AlertTriangle, X } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, message, itemName }: ConfirmDeleteModalProps) {
  const { t, isDark, isRTL, ds } = useApp();
  
  if (!isOpen) return null;

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const defaultTitle = isRTL ? "تأكيد الحذف" : "Confirm Delete";
  const defaultMessage = isRTL 
    ? `هل أنت متأكد من أنك تريد حذف${itemName ? ` "${itemName}"` : " هذا العنصر"}؟ لا يمكن التراجع عن هذا الإجراء.` 
    : `Are you sure you want to delete${itemName ? ` "${itemName}"` : " this item"}? This action cannot be undone.`;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} 
      />
      
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{ position: "relative", width: "100%", maxWidth: 400, background: surface, borderRadius: 24, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)", textAlign: isRTL ? "right" : "left" }}
      >
        <div style={{ padding: "24px 24px 16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertTriangle size={24} color="#EF4444" strokeWidth={2} />
            </div>
            <div style={{ flex: 1, paddingTop: 2 }}>
              <h3 style={{ margin: "0 0 8px 0", color: ds.textPrimary, fontSize: 18, fontWeight: 800 }}>
                {title || defaultTitle}
              </h3>
              <p style={{ margin: 0, color: ds.textSecondary, fontSize: 14, lineHeight: 1.5 }}>
                {message || defaultMessage}
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 24px 24px", display: "flex", gap: 12 }}>
          <button onClick={onClose}
            style={{ flex: 1, height: 46, background: isDark ? ds.surface2 : "#F1F5F9", border: "none", borderRadius: 14, color: ds.textPrimary, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? ds.border : "#E2E8F0"}
            onMouseLeave={e => e.currentTarget.style.background = isDark ? ds.surface2 : "#F1F5F9"}
          >
            {isRTL ? "إلغاء" : "Cancel"}
          </button>
          <button onClick={() => { onConfirm(); onClose(); }}
            style={{ flex: 1, height: 46, background: "#EF4444", border: "none", borderRadius: 14, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#DC2626"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#EF4444"; e.currentTarget.style.transform = "none"; }}
            onMouseDown={e => e.currentTarget.style.transform = "translateY(1px)"}
          >
            {isRTL ? "حذف نهائي" : "Delete"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
