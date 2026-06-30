import { useState } from "react";
import { motion } from "motion/react";
import { X, ShoppingBag, Truck, CheckCircle, Clock, MapPin, User, Phone, FileText, Check, Copy, Package } from "lucide-react";
import { useApp } from "@/providers/AppProvider";

interface OrderDetailSheetProps {
  order: any;
  onClose: () => void;
}

export function OrderDetailSheet({ order, onClose }: OrderDetailSheetProps) {
  const { t, isDark, isRTL, ds } = useApp();
  const [currentStatus, setCurrentStatus] = useState(order.status);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  // Mock Items
  const items = [
    { id: "i1", name: isRTL ? "ايفون 15 برو ماكس 256 جيجا" : "iPhone 15 Pro Max 256GB", qty: 1, price: 4500, total: 4500, color: "التيتانيوم الطبيعي" },
    { id: "i2", name: isRTL ? "سماعة ايربودز 3" : "AirPods Gen 3", qty: 2, price: 750, total: 1500, color: "أبيض" }
  ];

  const subtotal = 6000;
  const shippingFee = 50;
  const vat = subtotal * 0.15;
  const grandTotal = subtotal + shippingFee + vat;

  const STATUSES = ["Pending", "Processing", "Shipped", "Delivered"];
  const currentStepIndex = STATUSES.indexOf(currentStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return { bg: "rgba(245,158,11,0.15)", color: "#F59E0B", icon: Clock, label: isRTL ? "قيد الانتظار" : "Pending" };
      case "Processing": return { bg: "rgba(59,130,246,0.15)", color: "#3B82F6", icon: Package, label: isRTL ? "جاري التجهيز" : "Processing" };
      case "Shipped": return { bg: "rgba(139,92,246,0.15)", color: "#8B5CF6", icon: Truck, label: isRTL ? "تم الشحن" : "Shipped" };
      case "Delivered": return { bg: "rgba(16,185,129,0.15)", color: "#10B981", icon: CheckCircle, label: isRTL ? "تم التوصيل" : "Delivered" };
      default: return { bg: ds.surface2, color: ds.textSecondary, icon: Clock, label: status };
    }
  };

  const statusInfo = getStatusColor(currentStatus);
  const StatusIcon = statusInfo.icon;

  const nextStatus = currentStepIndex < STATUSES.length - 1 ? STATUSES[currentStepIndex + 1] : null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: isRTL ? "flex-start" : "flex-end" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(6px)" }} />
      
      <motion.div initial={{ x: isRTL ? "-100%" : "100%" }} animate={{ x: 0 }} exit={{ x: isRTL ? "-100%" : "100%" }} transition={{ type: "spring", damping: 28, stiffness: 220 }}
        style={{ position: "relative", width: "100%", maxWidth: 650, background: bg, height: "100%", display: "flex", flexDirection: "column", boxShadow: "-10px 0 40px rgba(0,0,0,0.15)" }}>
        
        {/* Elegant Header */}
        <div style={{ padding: "24px 32px", background: surface, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #6366F1, #4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)" }}>
                <ShoppingBag size={22} color="white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800, margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                  {order.order_number}
                  <button style={{ width: 24, height: 24, borderRadius: 6, background: ds.surface2, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Copy">
                    <Copy size={12} color={ds.textSecondary} />
                  </button>
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 500 }}>{new Date(order.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: ds.textMuted }} />
                  <span style={{ color: ds.textSecondary, fontSize: 13, fontWeight: 500 }}>{order.channel}</span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? ds.surface2 : "#F8FAFC", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}>
            <X size={20} color={ds.textPrimary} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          
          {/* Status Timeline Progress */}
          <div style={{ background: surface, borderRadius: 20, border: `1px solid ${border}`, padding: "24px 32px", marginBottom: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              {/* Connecting Line */}
              <div style={{ position: "absolute", top: 16, left: 24, right: 24, height: 2, background: isDark ? ds.surface2 : "#F1F5F9", zIndex: 0 }} />
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${(currentStepIndex / (STATUSES.length - 1)) * 100}%` }} transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ position: "absolute", top: 16, left: isRTL ? "auto" : 24, right: isRTL ? 24 : "auto", height: 2, background: "#10B981", zIndex: 1 }} 
              />

              {STATUSES.map((status, index) => {
                const info = getStatusColor(status);
                const Icon = info.icon;
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div key={status} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, gap: 8 }}>
                    <motion.div 
                      initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                      style={{ 
                        width: 34, height: 34, borderRadius: "50%", 
                        background: isCompleted ? "#10B981" : (isDark ? ds.surface2 : "#F8FAFC"),
                        border: `2px solid ${surface}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: isCompleted ? "white" : ds.textMuted,
                        boxShadow: isCurrent ? "0 0 0 4px rgba(16,185,129,0.2)" : "none"
                      }}
                    >
                      <Icon size={16} strokeWidth={isCompleted ? 2.5 : 2} />
                    </motion.div>
                    <span style={{ fontSize: 12, fontWeight: isCurrent ? 800 : 600, color: isCompleted ? ds.textPrimary : ds.textMuted }}>
                      {info.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer & Delivery Card */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            {/* Customer */}
            <div style={{ background: surface, borderRadius: 20, border: `1px solid ${border}`, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <User size={18} color="#6366F1" />
                </div>
                <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 800, margin: 0 }}>{isRTL ? "العميل" : "Customer"}</h3>
              </div>
              <p style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 700, margin: "0 0 8px 0" }}>{order.customer}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: ds.textSecondary, fontSize: 13, fontWeight: 500 }}>
                <Phone size={14} /> <span style={{ direction: "ltr" }}>+966 50 123 4567</span>
              </div>
            </div>

            {/* Address */}
            <div style={{ background: surface, borderRadius: 20, border: `1px solid ${border}`, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MapPin size={18} color="#F59E0B" />
                </div>
                <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 800, margin: 0 }}>{isRTL ? "التوصيل" : "Delivery"}</h3>
              </div>
              <p style={{ color: ds.textSecondary, fontSize: 14, fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
                الرياض، حي الملقا<br/>
                شارع الأمير محمد بن سعد، مبنى 12
              </p>
            </div>
          </div>

          {/* Items & Financials */}
          <div style={{ background: surface, borderRadius: 20, border: `1px solid ${border}`, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${border}`, background: isDark ? ds.surface2 : "#F8FAFC", display: "flex", alignItems: "center", gap: 10 }}>
              <FileText size={18} color={ds.primary} />
              <h3 style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 800, margin: 0 }}>{isRTL ? "المنتجات والفاتورة" : "Items & Invoice"}</h3>
            </div>
            
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: "flex", gap: 16, alignItems: "center", paddingBottom: 16, borderBottom: `1px dashed ${border}` }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, background: isDark ? ds.surface2 : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Package size={24} color={ds.textMuted} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: ds.textPrimary, fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
                      <div style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>اللون: {item.color}</div>
                    </div>
                    <div style={{ textAlign: isRTL ? "left" : "right" }}>
                      <div style={{ color: ds.textPrimary, fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{item.total.toLocaleString()}</div>
                      <div style={{ color: ds.textSecondary, fontSize: 12, fontWeight: 600 }}>{item.qty} × {item.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div style={{ background: isDark ? ds.surface2 : "#F8FAFC", borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: ds.textSecondary, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                  <span>{isRTL ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span>{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: ds.textSecondary, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                  <span>{isRTL ? "رسوم التوصيل" : "Shipping Fee"}</span>
                  <span>{shippingFee.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: ds.textSecondary, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
                  <span>{isRTL ? "الضريبة (15%)" : "VAT (15%)"}</span>
                  <span>{vat.toLocaleString()}</span>
                </div>
                <div style={{ borderTop: `1px dashed ${ds.textMuted}`, margin: "0 0 16px 0", opacity: 0.3 }} />
                <div style={{ display: "flex", justifyContent: "space-between", color: ds.primary, fontSize: 20, fontWeight: 800 }}>
                  <span>{isRTL ? "الإجمالي الكلي" : "Grand Total"}</span>
                  <span>{grandTotal.toLocaleString()} {isRTL ? "ر.س" : "SAR"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Footer */}
        <div style={{ padding: "20px 32px", background: surface, borderTop: `1px solid ${border}`, flexShrink: 0, boxShadow: "0 -4px 16px rgba(0,0,0,0.02)" }}>
          {nextStatus ? (
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentStatus(nextStatus)}
              style={{ width: "100%", height: 56, background: "linear-gradient(135deg, #10B981, #059669)", border: "none", borderRadius: 16, color: "white", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)" }}
            >
              <Check size={22} strokeWidth={3} />
              {isRTL ? `ترقية الحالة إلى: ${getStatusColor(nextStatus).label}` : `Upgrade Status to: ${getStatusColor(nextStatus).label}`}
            </motion.button>
          ) : (
            <div style={{ width: "100%", height: 56, background: "rgba(16,185,129,0.1)", border: `1px solid rgba(16,185,129,0.2)`, borderRadius: 16, color: "#10B981", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <CheckCircle size={22} color="#10B981" /> {isRTL ? "الطلب مكتمل ومُغلق بنجاح" : "Order is fully completed"}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
