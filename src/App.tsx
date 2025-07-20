
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppErrorBoundary } from "@/components/error/AppErrorBoundary";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/NotFound";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Auth = lazy(() => import("@/pages/Auth"));
const Profile = lazy(() => import("@/pages/Profile"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const UserOrders = lazy(() => import("@/pages/UserOrders"));
const Shopping = lazy(() => import("@/pages/Shopping"));
const WishlistPage = lazy(() => import("@/pages/WishlistPage"));
const Settings = lazy(() => import("@/pages/Settings"));
const Customers = lazy(() => import("@/pages/Customers"));
const WorkOrders = lazy(() => import("@/pages/WorkOrders"));
const Inventory = lazy(() => import("@/pages/Inventory"));
const Calendar = lazy(() => import("@/pages/Calendar"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Unauthorized = lazy(() => import("@/pages/Unauthorized"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const LoadingFallback = () => (
  <div className="flex flex-col space-y-4 p-8">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

const App = () => {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
            <AuthErrorBoundary>
              <Routes>
                {/* Public routes */}
                <Route 
                  path="/auth" 
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Auth />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/unauthorized" 
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Unauthorized />
                    </Suspense>
                  } 
                />
                
                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                          <Dashboard />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                          <UserProfile />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shopping"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                          <Shopping />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                          <UserOrders />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                          <WishlistPage />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-reviews"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <div className="p-8">
                          <h1 className="text-2xl font-bold mb-4">My Reviews</h1>
                          <p className="text-gray-600">Review management feature coming soon...</p>
                        </div>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                          <Settings />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                          <Customers />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/work-orders"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                          <WorkOrders />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                          <Inventory />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                          <Calendar />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                          <Analytics />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                {/* Redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/signup" element={<Navigate to="/auth" replace />} />
                
                {/* 404 page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
