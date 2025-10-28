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
