import { createBrowserRouter, RouterProvider } from "react-router";
// import { AppLayout } from "@/shared/layouts/AppLayout";
// import { SplashScreen } from "@/features/onboarding/screens/SplashScreen";
// import { Dashboard } from "@/features/dashboard/screens/Dashboard";

// NOTE: The current application uses state-based routing inside App.tsx to maintain 
// the existing exact flow without breaking any UI logic. 
// This file is prepared for the future API integration phase where 
// we will switch to React Router.

export const router = createBrowserRouter([
  /*
  {
    path: "/",
    element: <AppLayout showSettingsBar={true}><SplashScreen onComplete={() => {}} /></AppLayout>,
  },
  {
    path: "/dashboard",
    element: <AppLayout><Dashboard /></AppLayout>,
  }
  */
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
