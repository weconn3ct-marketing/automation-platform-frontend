import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { router } from "./router";
import { AppProviders } from "./providers";
import { useAuthStore } from "../store/authStore";

const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Check authentication status on app mount
    checkAuth();
  }, [checkAuth]);

  return (
    <AppProviders>
      <RouterProvider router={router} />
      <SpeedInsights />
    </AppProviders>
  );
};

export default App;
