import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import AuthProvider from "./components/auth/AuthProvider";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/layout/DashboardLayout";
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
import ContractList from "./pages/contracts/ContractList";
import ContractDetails from "./pages/contracts/ContractDetails";
import InvoiceList from "./pages/invoices/InvoiceList";
import InvoiceForm from "./pages/invoices/InvoiceForm";
import InvoiceDetails from "./pages/invoices/InvoiceDetails";
import DisputeList from "./pages/disputes/DisputeList";
import DisputeForm from "./pages/disputes/DisputeForm";
import DisputeDetails from "./pages/disputes/DisputeDetails";
import RatingForm from "./pages/ratings/RatingForm";
import RFQList from "./pages/rfqs/RFQList";
// import RFQForm from "./pages/rfqs/RFQForm";
import RFQFormEnhanced from "./pages/rfqs/RFQFormEnhanced";
import RFQDetails from "./pages/rfqs/RFQDetails";
import BidSubmissionEnhanced from "./pages/bids/BidSubmissionEnhanced";
import BidComparison from "./pages/bids/BidComparison";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import TenderDocumentTemplates from "./pages/admin/TenderDocument";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected routes with DashboardLayout */}
            <Route element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Organizations */}
              <Route path="/organizations" element={<OrganizationList />} />
              <Route path="/organizations/new" element={<OrganizationForm />} />
              <Route path="/organizations/:id" element={<OrganizationDetails />} />
              <Route path="/organizations/:id/edit" element={<OrganizationForm />} />
              
              {/* Buildings */}
              <Route path="/buildings" element={<BuildingList />} />
              <Route path="/buildings/new" element={<BuildingForm />} />
              <Route path="/buildings/:id" element={<BuildingDetails />} />
              <Route path="/buildings/:id/edit" element={<BuildingForm />} />
              
              {/* Vendors */}
              <Route path="/marketplace/vendors" element={<VendorMarketplace />} />
              <Route path="/marketplace/vendors/:id" element={<VendorDetails />} />
              <Route path="/vendors" element={<VendorMarketplace />} />
              
              {/* RFQs */}
              <Route path="/rfqs" element={<RFQList />} />
              <Route 
                path="/rfqs/new" 
                element={
                  <ProtectedRoute allowedRoles={['org_owner', 'facility_manager']}>
                    <RFQFormEnhanced />
                  </ProtectedRoute>
                } 
              />
              {/* <Route 
                path="/rfqs/new-legacy" 
                element={
                  <ProtectedRoute allowedRoles={['org_owner', 'facility_manager']}>
                    <RFQForm />
                  </ProtectedRoute>
                } 
              /> */}
              <Route path="/rfqs/:id" element={<RFQDetails />} />
              <Route 
                path="/rfqs/:id/submit-bid" 
                element={
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <BidSubmissionEnhanced />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rfqs/:id/bids" 
                element={
                  <ProtectedRoute allowedRoles={['org_owner', 'facility_manager']}>
                    <BidComparison />
                  </ProtectedRoute>
                } 
              />
              
              {/* Contracts */}
              <Route path="/contracts" element={<ContractList />} />
              <Route path="/contracts/:id" element={<ContractDetails />} />

              {/* Invoices */}
              <Route path="/contracts/:contractId/invoices" element={<InvoiceList />} />
              <Route path="/contracts/:contractId/invoices/new" element={<InvoiceForm />} />
              <Route path="/invoices/:id" element={<InvoiceDetails />} />

              {/* Ratings */}
              <Route path="/contracts/:contractId/rate" element={<RatingForm />} />

              {/* Disputes */}
              <Route path="/disputes" element={<DisputeList />} />
              <Route path="/disputes/new" element={<DisputeForm />} />
              <Route path="/disputes/:id" element={<DisputeDetails />} />
              
              {/* Admin */}
              <Route path="/admin/vendors/pending" element={<VendorVerification />} />
              <Route path="/admin/tender-templates" element={<TenderDocumentTemplates />} />
              
              {/* Settings - Placeholder */}
              <Route path="/settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground mt-2">Settings coming soon...</p></div>} />
            </Route>
            
            {/* Vendor Profile Routes - with role check */}
            <Route element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="/vendor/profile" element={<VendorProfile />} />
              <Route path="/vendor/kyc" element={<VendorKYC />} />
            </Route>
            
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;


// // src/App.js
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import TestMarketplace from './testing/TestMarketplace';
// import './index.css';

// function App() {
//   return (
//     <Router>
//       <div className="App">
//         <Routes>
//           <Route path="/" element={<TestMarketplace />} />
//           <Route path="/test" element={<TestMarketplace />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;