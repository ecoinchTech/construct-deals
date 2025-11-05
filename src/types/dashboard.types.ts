// src/types/dashboard.types.ts

export interface DashboardStats {
  totalRFQs: number;
  activeRFQs: number;
  completedRFQs: number;
  totalBids: number;
  activeBids: number;
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  totalBuildings?: number;
  totalVendors?: number;
  totalOrganizations?: number;
  pendingInvoices?: number;
  totalRevenue?: number;
  pendingDisputes?: number;
  averageRating?: number;
}

export interface RecentActivity {
  _id: string;
  type: 'rfq' | 'bid' | 'contract' | 'invoice' | 'dispute';
  title: string;
  description: string;
  date: string;
  status: string;
  link?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  upcomingMilestones?: Array<{
    _id: string;
    title: string;
    dueDate: string;
    contractTitle: string;
    status: string;
  }>;
  pendingApprovals?: Array<{
    _id: string;
    title: string;
    type: 'contract' | 'invoice' | 'dispute';
    date: string;
  }>;
}

export interface OrgOwnerDashboard extends DashboardData {
  topVendors: Array<{
    _id: string;
    companyName: string;
    rating: number;
    completedProjects: number;
  }>;
}

export interface VendorDashboard extends DashboardData {
  availableRFQs: Array<{
    _id: string;
    title: string;
    category: string;
    deadline: string;
    budget?: number;
  }>;
  earnings: {
    thisMonth: number;
    lastMonth: number;
    total: number;
  };
}

export interface AdminDashboard extends DashboardData {
  systemStats: {
    totalUsers: number;
    totalOrganizations: number;
    totalVendors: number;
    pendingVerifications: number;
  };
}
