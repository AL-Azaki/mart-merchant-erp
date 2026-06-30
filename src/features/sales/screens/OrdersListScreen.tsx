import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, ShoppingBag, Eye, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { OrderDetailSheet } from "../components/OrderDetailSheet";

const MOCK_ORDERS = [
  { id: "ord_1", order_number: "ORD-2023-0001", customer: "أحمد محمد", date: new Date().toISOString(), total: 450.0, status: "Pending", channel: "Web" },
  { id: "ord_2", order_number: "ORD-2023-0002", customer: "شركة الأفق", date: new Date(Date.now() - 86400000).toISOString(), total: 1250.0, status: "Processing", channel: "App" },
  { id: "ord_3", order_number: "ORD-2023-0003", customer: "سارة خالد", date: new Date(Date.now() - 172800000).toISOString(), total: 320.0, status: "Shipped", channel: "Web" },
  { id: "ord_4", order_number: "ORD-2023-0004", customer: "خالد عبدالله", date: new Date(Date.now() - 259200000).toISOString(), total: 890.0, status: "Delivered", channel: "App" },
];

export function OrdersListScreen() {
  const { t, isDark, isRTL, ds } = useApp();
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const bg = isDark ? ds.bg : "#F8FAFC";
  const surface = isDark ? ds.surface : "#FFFFFF";
  const border = isDark ? ds.border : "#E2E8F0";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return { bg: "rgba(245,158,11,0.1)", color: "#F59E0B", icon: Clock, label: isRTL ? "قيد الانتظار" : "Pending" };
      case "Processing": return { bg: "rgba(59,130,246,0.1)", color: "#3B82F6", icon: ShoppingBag, label: isRTL ? "جاري التجهيز" : "Processing" };
      case "Shipped": return { bg: "rgba(139,92,246,0.1)", color: "#8B5CF6", icon: Truck, label: isRTL ? "تم الشحن" : "Shipped" };
      case "Delivered": return { bg: "rgba(16,185,129,0.1)", color: "#10B981", icon: CheckCircle, label: isRTL ? "تم التوصيل" : "Delivered" };
      case "Cancelled": return { bg: "rgba(239,68,68,0.1)", color: "#EF4444", icon: XCircle, label: isRTL ? "ملغي" : "Cancelled" };
      default: return { bg: ds.surface2, color: ds.textSecondary, icon: Clock, label: status };
    }
  };

  return (
    <div style={{ padding: 24, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: ds.textPrimary, fontSize: 20, fontWeight: 800, margin: "0 0 4px 0" }}>{isRTL ? "طلبات المتجر الإلكتروني" : "E-commerce Orders"}</h2>
          <p style={{ color: ds.textSecondary, fontSize: 13, margin: 0 }}>{isRTL ? "إدارة ومعالجة الطلبات الواردة من المتجر والتطبيق" : "Manage and process incoming web and app orders"}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={18} color={ds.textMuted} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRTL ? "right" : "left"]: 14 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isRTL ? "ابحث برقم الطلب أو العميل..." : "Search by order # or customer..."}
            style={{ width: "100%", height: 48, paddingInlineStart: 44, paddingInlineEnd: 16, background: surface, border: `1px solid ${border}`, borderRadius: 14, color: ds.textPrimary, fontSize: 14, fontWeight: 500, outline: "none", fontFamily: "inherit" }} />
        </div>
        <button style={{ height: 48, width: 48, background: surface, border: `1px solid ${border}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: ds.textSecondary, cursor: "pointer" }}>
          <Filter size={20} />
        </button>
      </div>

      <div style={{ flex: 1, background: surface, border: `1px solid ${border}`, borderRadius: 20, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1.5fr 1fr 1fr", gap: 16, padding: "16px 20px", background: isDark ? ds.surface2 : "#F8FAFC", borderBottom: `1px solid ${border}`, color: ds.textSecondary, fontSize: 13, fontWeight: 700 }}>
          <div>{isRTL ? "رقم الطلب" : "Order #"}</div>
          <div>{isRTL ? "العميل" : "Customer"}</div>
          <div>{isRTL ? "القناة" : "Channel"}</div>
          <div>{isRTL ? "الحالة" : "Status"}</div>
          <div>{isRTL ? "الإجمالي" : "Total"}</div>
          <div style={{ textAlign: "center" }}>{isRTL ? "إجراء" : "Action"}</div>
        </div>

        <div style={{ overflowY: "auto", height: "calc(100% - 50px)" }}>
          {MOCK_ORDERS.map((ord, idx) => {
            const status = getStatusColor(ord.status);
            const StatusIcon = status.icon;
            return (
              <div key={ord.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1.5fr 1fr 1fr", gap: 16, padding: "16px 20px", borderBottom: `1px solid ${border}`, alignItems: "center" }}>
                <div style={{ fontWeight: 800, color: ds.textPrimary }}>{ord.order_number}</div>
                <div style={{ fontWeight: 600, color: ds.textSecondary }}>{ord.customer}</div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: ds.surface2, color: ds.textSecondary }}>{ord.channel}</span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: status.bg, color: status.color, fontSize: 12, fontWeight: 700 }}>
                    <StatusIcon size={14} /> {status.label}
                  </span>
                </div>
                <div style={{ fontWeight: 800, color: ds.textPrimary }}>{ord.total.toLocaleString()}</div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button onClick={() => setSelectedOrder(ord)} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(59,130,246,0.1)", border: "none", color: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailSheet 
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
