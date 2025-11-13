import { apiSlice } from './apiSlice';
import { Bid, CreateBidRequest, BidComparison, CreateTechnicalBidRequest, CreateFinancialBidRequest, CreateBidSecurityRequest } from '@/types/bid.types';

export const bidApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBidsByRFQ: builder.query<{ success: boolean; data: { bids: Bid[] } }, string>({
      query: (rfqId) => `/bids/rfqs/${rfqId}`,
      providesTags: (_result, _error, rfqId) => [{ type: 'Bid', id: rfqId }],
    }),
    getBid: builder.query<{ success: boolean; data: { bid: Bid } }, string>({
      query: (id) => `/bids/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Bid', id }],
    }),
    createBid: builder.mutation<{ success: boolean; data: { bid: Bid } }, CreateBidRequest>({
      query: (body) => ({
        url: `/bids/rfqs/${body.rfqId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { rfqId }) => [{ type: 'Bid', id: rfqId }, 'RFQ'],
    }),
    withdrawBid: builder.mutation<{ success: boolean; data: { bid: Bid } }, string>({
      query: (id) => ({
        url: `/bids/${id}/withdraw`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Bid', id }],
    }),
    getBidComparison: builder.query<{ success: boolean; data: { comparison: BidComparison[]; evaluationWeights: any } }, string>({
      query: (rfqId) => `/bids/rfqs/${rfqId}/comparison`,
      providesTags: (_result, _error, rfqId) => [{ type: 'Bid', id: rfqId }],
    }),
    createTechnicalBid: builder.mutation<{ success: boolean; data: { bid: Bid } }, CreateTechnicalBidRequest>({
      query: ({ rfqId, ...body }) => ({
        url: `/bids/rfqs/${rfqId}/technical`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { rfqId }) => [{ type: 'Bid', id: rfqId }, 'RFQ'],
    }),
    createFinancialBid: builder.mutation<{ success: boolean; data: { bid: Bid } }, CreateFinancialBidRequest>({
      query: ({ rfqId, ...body }) => ({
        url: `/bids/rfqs/${rfqId}/financial`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { rfqId }) => [{ type: 'Bid', id: rfqId }, 'RFQ'],
    }),
    uploadBidAttachment: builder.mutation<{ success: boolean; data: { bid: Bid } }, { bidId: string; files: FormData }>({
      query: ({ bidId, files }) => ({
        url: `/bids/${bidId}/attachments`,
        method: 'POST',
        body: files,
      }),
      invalidatesTags: (_result, _error, { bidId }) => [{ type: 'Bid', id: bidId }],
    }),
    createBidSecurity: builder.mutation<{ success: boolean; data: { bid: Bid } }, CreateBidSecurityRequest>({
      query: ({ rfqId, ...body }) => ({
        url: `/bids/rfqs/${rfqId}/security`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { rfqId }) => [{ type: 'Bid', id: rfqId }, 'RFQ'],
    }),
  }),
});

export const {
  useGetBidsByRFQQuery,
  useGetBidQuery,
  useCreateBidMutation,
  useWithdrawBidMutation,
  useGetBidComparisonQuery,
  useCreateTechnicalBidMutation,
  useCreateFinancialBidMutation,
  useUploadBidAttachmentMutation,
  useCreateBidSecurityMutation,
} = bidApi;






// Ecoinch.net 27-10-25/
// │
// ├── backend/
// │   ├── .env
// │   ├── package.json
// │   ├── package-lock.json
// │   ├── server.js
// │   ├── test-db.js
// │   └── src/
// │       ├── app.js
// │       ├── config/
// │       │   ├── app.js
// │       │   ├── cloudinary.js
// │       │   └── database.js
// │       ├── controllers/
// │       │   ├── adminController.js
// │       │   ├── authController.js
// │       │   ├── bidController.js
// │       │   ├── buildingController.js
// │       │   ├── categoryController.js
// │       │   ├── contractController.js
// │       │   ├── disputeController.js
// │       │   ├── invoiceController.js
// │       │   ├── organizationController.js
// │       │   ├── preBidQueryController.js
// │       │   ├── ratingController.js
// │       │   ├── rfqController.js
// │       │   ├── tenderDocumentTemplateController.js
// │       │   └── vendorController.js
// │       ├── middleware/
// │       │   ├── auth.js
// │       │   ├── errorHandler.js
// │       │   ├── rbac.js
// │       │   └── validation.js
// │       ├── models/
// │       │   ├── BOQ.js
// │       │   ├── Bid.js
// │       │   ├── Building.js
// │       │   ├── Category.js
// │       │   ├── Contract.js
// │       │   ├── Dispute.js
// │       │   ├── EvaluationCommittee.js
// │       │   ├── EvaluationReport.js
// │       │   ├── Invoice.js
// │       │   ├── Organization.js
// │       │   ├── PreBidQuery.js
// │       │   ├── RFQ.js
// │       │   ├── Rating.js
// │       │   ├── TenderDocumentTemplate.js
// │       │   ├── User.js
// │       │   └── Vendor.js
// │       ├── routes/
// │       │   ├── admin.js
// │       │   ├── auth.js
// │       │   ├── bids.js
// │       │   ├── buildings.js
// │       │   ├── categories.js
// │       │   ├── contracts.js
// │       │   ├── disputes.js
// │       │   ├── invoices.js
// │       │   ├── organizations.js
// │       │   ├── preBidQueries.js
// │       │   ├── ratings.js
// │       │   ├── rfqs.js
// │       │   ├── tenderDocumentTemplates.js
// │       │   └── vendors.js
// │       ├── services/
// │       │   ├── authService.js
// │       │   ├── emailService.js
// │       │   ├── fileService.js
// │       │   ├── notificationService.js
// │       │   └── validationService.js
// │       └── utils/
// │           ├── apiResponse.js
// │           ├── errorHandling.js
// │           └── logger.js
// │
// └── frontend2/
//     └── construct-deals/
//         ├── public/
//         └── src/
//             ├── App.css
//             ├── App.tsx
//             ├── components/
//             │   ├── auth/
//             │   │   ├── AuthProvider.tsx
//             │   │   └── ProtectedRoute.tsx
//             │   ├── layout/
//             │   │   └── DashboardLayout.tsx
//             │   ├── rfq/
//             │   │   └── PreBidQueries.tsx
//             │   
//             ├── hooks/
//             │   ├── useAuth.ts
//             │   └── useMediaQuery.ts
//             ├── lib/
//             │   └── utils.ts
//             ├── pages/
//             │   ├── Dashboard.tsx
//             │   ├── Index.tsx
//             │   ├── NotFound.tsx
//             │   ├── Unauthorized.tsx
//             │   ├── admin/
//             │   │   ├── TenderDocument.tsx
//             │   │   └── VendorVerification.tsx
//             │   ├── auth/
//             │   │   ├── ForgotPassword.tsx
//             │   │   ├── Login.tsx
//             │   │   └── Register.tsx
//             │   ├── bids/
//             │   │   ├── BidComparison.tsx
//             │   │   └── BidSubmissionEnhanced.tsx
//             │   ├── buildings/
//             │   │   ├── BuildingDetails.tsx
//             │   │   ├── BuildingForm.tsx
//             │   │   └── BuildingList.tsx
//             │   ├── contracts/
//             │   │   ├── ContractDetails.tsx
//             │   │   └── ContractList.tsx
//             │   ├── disputes/
//             │   │   ├── DisputeDetails.tsx
//             │   │   ├── DisputeForm.tsx
//             │   │   └── DisputeList.tsx
//             │   ├── invoices/
//             │   │   ├── InvoiceDetails.tsx
//             │   │   ├── InvoiceForm.tsx
//             │   │   └── InvoiceList.tsx
//             │   ├── organizations/
//             │   │   ├── OrganizationDetails.tsx
//             │   │   ├── OrganizationForm.tsx
//             │   │   └── OrganizationList.tsx
//             │   ├── ratings/
//             │   │   └── RatingForm.tsx
//             │   ├── rfqs/
//             │   │   ├── RFQDetails.tsx
//             │   │   ├── RFQForm.tsx
//             │   │   ├── RFQFormEnhanced.tsx
//             │   │   └── RFQList.tsx
//             │   └── vendors/
//             │       ├── VendorDetails.tsx
//             │       ├── VendorKYC.tsx
//             │       ├── VendorMarketplace.tsx
//             │       └── VendorProfile.tsx
//             ├── store/
//             │   ├── api/
//             │   │   └── bidApi.ts
//             │   ├── features/
//             │   │   ├── authSlice.ts
//             │   │   ├── bidSlice.ts
//             │   │   ├── contractSlice.ts
//             │   │   ├── notificationSlice.ts
//             │   │   └── uiSlice.ts
//             │   └── store.ts
//             ├── types/
//             │   ├── auth.types.ts
//             │   ├── bid.types.ts
//             │   ├── building.types.ts
//             │   ├── common.types.ts
//             │   ├── contract.types.ts
//             │   ├── dispute.types.ts
//             │   ├── invoice.types.ts
//             │   ├── organization.types.ts
//             │   ├── rfq.types.ts
//             │   ├── user.types.ts
//             │   └── vendor.types.ts
//             ├── index.css
//             ├── main.tsx
//             └── 