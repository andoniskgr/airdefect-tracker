
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
import NotFound from "./pages/NotFound";
import ServiceOrder from "./pages/ServiceOrder";
import AircraftAdmin from "./pages/AircraftAdmin";
import ArchiveRecords from "./pages/ArchiveRecords";
import InternalNotices from "./pages/InternalNotices";
import UserProfile from "./pages/UserProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        {/* Moved TooltipProvider inside the AuthProvider and BrowserRouter */}
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/archive-records" element={
              <ProtectedRoute>
                <ArchiveRecords />
              </ProtectedRoute>
            } />
            <Route path="/internal-notices" element={
              <ProtectedRoute>
                <InternalNotices />
              </ProtectedRoute>
            } />
            <Route path="/service-order" element={
              <ProtectedRoute>
                <ServiceOrder />
              </ProtectedRoute>
            } />
            <Route path="/aircraft-admin" element={
              <ProtectedRoute>
                <AircraftAdmin />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
