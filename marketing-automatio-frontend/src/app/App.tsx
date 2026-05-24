import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { AppProviders } from "./providers";
import { useAuthStore } from "../store/authStore";

const App = () => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Check authentication status on app mount
    checkAuth().catch((error) => {
      console.error('Failed to check authentication:', error);
    });
  }, [checkAuth]);

  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
};

export default App;
