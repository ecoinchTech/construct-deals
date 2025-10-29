import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import OrganizationList from "./pages/organizations/OrganizationList";
import OrganizationForm from "./pages/organizations/OrganizationForm";
import OrganizationDetails from "./pages/organizations/OrganizationDetails";
import BuildingList from "./pages/buildings/BuildingList";
import BuildingForm from "./pages/buildings/BuildingForm";
import BuildingDetails from "./pages/buildings/BuildingDetails";
import VendorProfile from "./pages/vendors/VendorProfile";
import VendorKYC from "./pages/vendors/VendorKYC";
import VendorMarketplace from "./pages/vendors/VendorMarketplace";
import VendorDetails from "./pages/vendors/VendorDetails";
import VendorVerification from "./pages/admin/VendorVerification";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizations"
              element={
                <ProtectedRoute>
                  <OrganizationList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizations/new"
              element={
                <ProtectedRoute>
                  <OrganizationForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizations/:id"
              element={
                <ProtectedRoute>
                  <OrganizationDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizations/:id/edit"
              element={
                <ProtectedRoute>
                  <OrganizationForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buildings"
              element={
                <ProtectedRoute>
                  <BuildingList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buildings/new"
              element={
                <ProtectedRoute>
                  <BuildingForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buildings/:id"
              element={
                <ProtectedRoute>
                  <BuildingDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buildings/:id/edit"
              element={
                <ProtectedRoute>
                  <BuildingForm />
                </ProtectedRoute>
              }
            />
            
            {/* Vendor Routes */}
            <Route
              path="/vendor/profile"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/kyc"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorKYC />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace/vendors"
              element={
                <ProtectedRoute>
                  <VendorMarketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace/vendors/:id"
              element={
                <ProtectedRoute>
                  <VendorDetails />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin/vendors/pending"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <VendorVerification />
                </ProtectedRoute>
              }
            />
            
            <Route path="/unauthorized" element={<Unauthorized />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
