import { useState } from "react";
import { AppProvider, useApp } from "@/providers/AppProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { SplashScreen } from "@/features/onboarding/screens/SplashScreen";
import { OnboardingScreen } from "@/features/onboarding/screens/OnboardingScreen";
import { AuthGateScreen } from "@/features/auth/screens/AuthGateScreen";
import { LoginScreen } from "@/features/auth/screens/LoginScreen";
import { RegisterScreen } from "@/features/auth/screens/RegisterScreen";
import { BusinessSetup } from "@/features/setup/screens/BusinessSetup";
import { BranchSetup } from "@/features/setup/screens/BranchSetup";
import { SuccessScreen } from "@/features/setup/screens/SuccessScreen";
import { Dashboard } from "@/features/dashboard/screens/Dashboard";

type Screen =
  | "splash" | "onboarding" | "authGate" | "login"
  | "register" | "business" | "branch" | "success" | "dashboard";

function AppShell() {
  const { isDark, isRTL, fontFamily } = useApp();
  const [screen, setScreen] = useState<Screen>("splash");
  const go = (s: Screen) => setScreen(s);

  const outerBg = isDark
    ? "radial-gradient(ellipse at top, #0C1929 0%, #060E1C 70%)"
    : "radial-gradient(ellipse at top, #C7D7F5 0%, #E8EDFA 70%)";

  // Splash, Auth, Setup, and Dashboard screens have dark gradient backgrounds at the top
  const statusMode = screen === "success" && !isDark ? "dark" : "light";

  // Tablet: Dashboard is full screen. Auth/Onboarding are in a beautifully centered modal-like card.
  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        width: "100vw", height: "100vh",
        background: isDark ? "#060E1C" : "#F4F7FF",
        overflow: "hidden",
        position: "relative", fontFamily,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center"
      }}
    >
      {screen === "dashboard" ? (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
          <Dashboard onLogout={() => go("authGate")} />
        </div>
      ) : (
        <div 
          style={{
            width: "100%", 
            maxWidth: 540, 
            height: "100%", 
            maxHeight: 900,
            background: isDark ? "#060E1C" : "#FFFFFF",
            boxShadow: isDark ? "0 24px 64px rgba(0,0,0,0.5)" : "0 32px 80px rgba(37,99,235,0.12)",
            borderRadius: "clamp(0px, 4vw, 32px)",
            overflow: "hidden",
            position: "relative",
            display: "flex", flexDirection: "column",
            paddingTop: "env(safe-area-inset-top)", 
            paddingBottom: "env(safe-area-inset-bottom)"
          }}
        >
          {screen === "splash"     && <SplashScreen     onComplete={() => go("onboarding")} />}
          {screen === "onboarding" && <OnboardingScreen onComplete={() => go("authGate")} />}
          {screen === "authGate"   && <AuthGateScreen   onStartTrial={() => go("register")} onSignIn={() => go("login")} />}
          {screen === "login"      && <LoginScreen       onLogin={() => go("dashboard")} onRegister={() => go("authGate")} />}
          {screen === "register"   && <RegisterScreen   onNext={() => go("business")} onBack={() => go("authGate")} />}
          {screen === "business"   && <BusinessSetup    onNext={() => go("branch")} onBack={() => go("register")} />}
          {screen === "branch"     && <BranchSetup      onNext={() => go("success")} onBack={() => go("business")} />}
          {screen === "success"    && <SuccessScreen    onComplete={() => go("dashboard")} />}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </AppProvider>
  );
}
