export type ReportType = 
  | 'rfq_summary' 
  | 'bid_analysis' 
  | 'contract_performance'
  | 'vendor_performance'
  | 'financial_summary'
  | 'dispute_report'
  | 'payment_report'
  | 'milestone_report';

export type ReportFormat = 'pdf' | 'excel' | 'csv';

export interface Report {
  _id: string;
  type: ReportType;
  title: string;
  description: string;
  format: ReportFormat;
  fileUrl: string;
  generatedBy: string;
  filters?: Record<string, any>;
  createdAt: string;
}

export interface GenerateReportRequest {
  type: ReportType;
  format: ReportFormat;
  startDate?: string;
  endDate?: string;
  organizationId?: string;
  vendorId?: string;
  filters?: Record<string, any>;
}

export interface ReportFilters {
  type?: ReportType;
  generatedBy?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
