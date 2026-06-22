import { createBrowserRouter } from "react-router-dom";
import { ErrorPage } from "./ErrorPage";
import { ProtectedRoute, PublicRoute } from "../components/ProtectedRoute";
import { LoginPage } from "../features/auth/LoginPage";
import { SignupPage } from "../features/auth/SignupPage";
import { OAuthSuccessPage } from "../features/auth/OAuthSuccessPage";
import { OAuthErrorPage } from "../features/auth/OAuthErrorPage";
import { OAuthSocialLoginCallback } from "../features/auth/OAuthSocialLoginCallback";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { LandingPage } from "../features/landing/LandingPage";
import { CreatePostPage } from "../features/posts/CreatePostPage";
import { SocialPostsPage } from "../features/posts/SocialPostsPage";
import { CalendarPage } from "../features/calendar/CalendarPage";
import { HistoryPage } from "../features/history/HistoryPage";
import { AuditLogPage } from "../features/history/AuditLogPage";
import { AccountsPage } from "../features/accounts/AccountsPage";
import { SettingsPage } from "../features/settings/SettingsPage";

export const router = createBrowserRouter([
  { 
    path: "/", 
    element: <LandingPage />, 
    errorElement: <ErrorPage /> 
  },
  { 
    path: "/login", 
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ), 
    errorElement: <ErrorPage /> 
  },
  { 
    path: "/signup", 
    element: (
      <PublicRoute>
        <SignupPage />
      </PublicRoute>
    ), 
    errorElement: <ErrorPage /> 
  },
  { 
    path: "/dashboard", 
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ), 
    errorElement: <ErrorPage /> 
  },
  { 
    path: "/dashboard/create", 
    element: (
      <ProtectedRoute>
        <CreatePostPage />
      </ProtectedRoute>
    ), 
    errorElement: <ErrorPage /> 
  },
  {
    path: "/dashboard/social-posts",
    element: (
      <ProtectedRoute>
        <SocialPostsPage />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
  },
  { 
    path: "/dashboard/calendar", 
    element: (
      <ProtectedRoute>
        <CalendarPage />
      </ProtectedRoute>
    ), 
    errorElement: <ErrorPage /> 
  },
  { 
    path: "/dashboard/history", 
    element: (
      <ProtectedRoute>
        <HistoryPage />
      </ProtectedRoute>
    ), 
    errorElement: <ErrorPage /> 
  },
  {
    path: "/dashboard/audit",
    element: (
      <ProtectedRoute>
        <AuditLogPage />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
  },
  { 
    path: "/auth/oauth-success", 
    element: (
      <ProtectedRoute>
        <OAuthSuccessPage />
      </ProtectedRoute>
    ), 
    errorElement: <ErrorPage /> 
  },
  { 
    path: "/auth/oauth-error", 
    element: (
      <ProtectedRoute>
        <OAuthErrorPage />
      </ProtectedRoute>
    ), 
    errorElement: <ErrorPage /> 
  },
  {
    // Public route — social login redirects here before user is authenticated
    path: "/auth/social-login-callback",
    element: <OAuthSocialLoginCallback />,
    errorElement: <ErrorPage />,
  },
  { 
    path: "/dashboard/accounts",
    element: (
      <ProtectedRoute>
        <AccountsPage />
      </ProtectedRoute>
    ), 
    errorElement: <ErrorPage /> 
  },
  {
    path: "/dashboard/settings",
    element: (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
  },
]);
