import { Battery, Wifi, SignalHigh } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useEffect, useState } from "react";

export function StatusBar({ mode = "light" }: { mode?: "light" | "dark" }) {
  const { isRTL } = useApp();
  const [time, setTime] = useState("9:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
          .replace(" AM", "").replace(" PM", "")
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const color = mode === "dark" ? "#0A1525" : "#FFFFFF";

  return (
    <div
      style={{
        width: "100%",
        height: 44,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 24px",
        boxSizing: "border-box",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: "none",
        direction: "ltr", // Status bar is always LTR
      }}
    >
      {/* Time */}
      <span
        style={{
          color,
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "-0.3px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          marginTop: 2,
        }}
      >
        {time}
      </span>
      
      {/* Icons */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.9 }}>
        <SignalHigh size={15} color={color} strokeWidth={2.5} />
        <Wifi size={15} color={color} strokeWidth={2.5} />
        <Battery size={18} color={color} strokeWidth={2.5} />
      </div>
    </div>
  );
}
