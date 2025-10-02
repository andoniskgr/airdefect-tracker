import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PendingApproval from "./pages/PendingApproval";
import NotFound from "./pages/NotFound";
import ServiceOrder from "./pages/ServiceOrder";
import AircraftAdmin from "./pages/AircraftAdmin";
import ArchiveRecords from "./pages/ArchiveRecords";
import InternalNotices from "./pages/InternalNotices";
import UserProfile from "./pages/UserProfile";
import UserManagement from "./pages/UserManagement";
import AdminSetup from "./pages/AdminSetup";
import TestPage from "./pages/TestPage";
import ACARSProxy from "./pages/ACARSProxy";
import ARINCDataExtractor from "./pages/ARINCDataExtractor";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            {/* Moved TooltipProvider inside the AuthProvider and BrowserRouter */}
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Navbar />
              <Routes>
                <Route path="/test" element={<TestPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/pending-approval" element={<PendingApproval />} />
                <Route path="/admin-setup" element={<AdminSetup />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/archive-records"
                  element={
                    <ProtectedRoute>
                      <ArchiveRecords />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/internal-notices"
                  element={
                    <ProtectedRoute>
                      <InternalNotices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/service-order"
                  element={
                    <ProtectedRoute>
                      <ServiceOrder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/aircraft-admin"
                  element={
                    <ProtectedRoute>
                      <AircraftAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-management"
                  element={
                    <ProtectedRoute>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/acars"
                  element={
                    <ProtectedRoute>
                      <ACARSProxy />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/arinc-data"
                  element={
                    <ProtectedRoute>
                      <ARINCDataExtractor />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
