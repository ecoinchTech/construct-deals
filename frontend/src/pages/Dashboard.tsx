import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { 
  useGetOrgOwnerDashboardQuery, 
  useGetFacilityManagerDashboardQuery, 
  useGetVendorDashboardQuery, 
  useGetAdminDashboardQuery 
} from '@/store/api/dashboardApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Users, FileText, Package, TrendingUp, Clock, AlertCircle, CheckCircle, DollarSign, Star, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch dashboard data based on role
  const { data: orgOwnerData, isLoading: orgOwnerLoading } = useGetOrgOwnerDashboardQuery(undefined, {
    skip: user?.role !== 'org_owner',
  });
  const { data: facilityData, isLoading: facilityLoading } = useGetFacilityManagerDashboardQuery(undefined, {
    skip: user?.role !== 'facility_manager',
  });
  const { data: vendorData, isLoading: vendorLoading } = useGetVendorDashboardQuery(undefined, {
    skip: user?.role !== 'vendor',
  });
  const { data: adminData, isLoading: adminLoading } = useGetAdminDashboardQuery(undefined, {
    skip: user?.role !== 'super_admin',
  });

  const isLoading = orgOwnerLoading || facilityLoading || vendorLoading || adminLoading;
  const dashboardData = orgOwnerData || facilityData || vendorData || adminData;

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      super_admin: 'Super Administrator',
      org_owner: 'Organization Owner',
      facility_manager: 'Facility Manager',
      vendor: 'Vendor',
    };
    return roleMap[role] || role;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'rfq': return FileText;
      case 'bid': return Package;
      case 'contract': return CheckCircle;
      case 'invoice': return DollarSign;
      case 'dispute': return AlertCircle;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      draft: 'secondary',
      published: 'default',
      active: 'default',
      completed: 'outline',
      pending: 'secondary',
      approved: 'outline',
      rejected: 'destructive',
      awarded: 'default',
    };
    return colors[status] || 'secondary';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const stats = dashboardData?.data?.stats;
  const recentActivities = dashboardData?.data?.recentActivities || [];
  const upcomingMilestones = dashboardData?.data?.upcomingMilestones || [];
  const pendingApprovals = dashboardData?.data?.pendingApprovals || [];

  // Role-specific stats cards
  const getStatsCards = () => {
    if (user?.role === 'vendor') {
      const vendorDash = vendorData?.data as any;
      return [
        {
          title: 'Available RFQs',
          value: vendorDash?.availableRFQs?.length || 0,
          icon: FileText,
          description: 'New opportunities',
          link: '/rfqs',
        },
        {
          title: 'Active Bids',
          value: stats?.activeBids || 0,
          icon: Package,
          description: 'Bids in progress',
        },
        {
          title: 'Active Contracts',
          value: stats?.activeContracts || 0,
          icon: CheckCircle,
          description: 'Ongoing projects',
          link: '/contracts',
        },
        {
          title: 'This Month Earnings',
          value: `₹${(vendorDash?.earnings?.thisMonth || 0).toLocaleString()}`,
          icon: DollarSign,
          description: 'Revenue earned',
        },
      ];
    } else if (user?.role === 'super_admin') {
      const adminDash = adminData?.data as any;
      return [
        {
          title: 'Total Users',
          value: adminDash?.systemStats?.totalUsers || 0,
          icon: Users,
          description: 'Registered users',
        },
        {
          title: 'Organizations',
          value: adminDash?.systemStats?.totalOrganizations || 0,
          icon: Building2,
          description: 'Active organizations',
          link: '/organizations',
        },
        {
          title: 'Vendors',
          value: adminDash?.systemStats?.totalVendors || 0,
          icon: Users,
          description: 'Verified vendors',
          link: '/vendors',
        },
        {
          title: 'Pending Verifications',
          value: adminDash?.systemStats?.pendingVerifications || 0,
          icon: AlertCircle,
          description: 'Requires review',
          link: '/admin/vendors/pending',
        },
      ];
    } else {
      // org_owner or facility_manager
      return [
        {
          title: 'Active RFQs',
          value: stats?.activeRFQs || 0,
          icon: FileText,
          description: 'Open for bidding',
          link: '/rfqs',
        },
        {
          title: 'Total Bids',
          value: stats?.totalBids || 0,
          icon: Package,
          description: 'Received bids',
        },
        {
          title: 'Active Contracts',
          value: stats?.activeContracts || 0,
          icon: CheckCircle,
          description: 'Ongoing projects',
          link: '/contracts',
        },
        {
          title: 'Buildings',
          value: stats?.totalBuildings || 0,
          icon: Building2,
          description: 'Managed properties',
          link: '/buildings',
        },
      ];
    }
  };

  const statsCards = getStatsCards();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
        <p className="text-muted-foreground">
          Role: <span className="font-medium text-foreground">{getRoleDisplay(user?.role || '')}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className="transition-smooth hover:shadow-md cursor-pointer"
              onClick={() => stat.link && navigate(stat.link)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {stat.description}
                  {stat.link && <ArrowRight className="h-3 w-3" />}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest updates across your projects</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activities</p>
            ) : (
              <div className="space-y-4">
                {recentActivities.slice(0, 5).map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div 
                      key={activity._id} 
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth cursor-pointer"
                      onClick={() => activity.link && navigate(activity.link)}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{activity.title}</p>
                          <Badge variant={getStatusColor(activity.status)} className="text-xs">
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(activity.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Milestones or Available RFQs for Vendor */}
        {user?.role === 'vendor' ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Available RFQs
              </CardTitle>
              <CardDescription>New opportunities for bidding</CardDescription>
            </CardHeader>
            <CardContent>
              {(vendorData?.data as any)?.availableRFQs?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No RFQs available</p>
              ) : (
                <div className="space-y-3">
                  {((vendorData?.data as any)?.availableRFQs || []).slice(0, 5).map((rfq: any) => (
                    <div 
                      key={rfq._id}
                      className="p-3 rounded-lg border hover:border-primary transition-smooth cursor-pointer"
                      onClick={() => navigate(`/rfqs/${rfq._id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-sm">{rfq.title}</p>
                        <Badge variant="outline" className="text-xs">{rfq.category}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Deadline: {format(new Date(rfq.deadline), 'MMM dd')}</span>
                        {rfq.budget && <span>Budget: ₹{rfq.budget.toLocaleString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button className="w-full mt-4" variant="outline" onClick={() => navigate('/rfqs')}>
                View All RFQs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Upcoming Milestones
              </CardTitle>
              <CardDescription>Tasks requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingMilestones.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No upcoming milestones</p>
              ) : (
                <div className="space-y-3">
                  {upcomingMilestones.slice(0, 5).map((milestone) => (
                    <div 
                      key={milestone._id}
                      className="p-3 rounded-lg border hover:border-primary transition-smooth cursor-pointer"
                      onClick={() => navigate(`/contracts`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-sm">{milestone.title}</p>
                        <Badge variant={getStatusColor(milestone.status)} className="text-xs">
                          {milestone.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{milestone.contractTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {format(new Date(milestone.dueDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pending Approvals for Org Owner */}
      {(user?.role === 'org_owner' || user?.role === 'facility_manager') && pendingApprovals.length > 0 && (
        <Card className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Items requiring your review and approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map((approval) => (
                <div 
                  key={approval._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background border hover:border-primary transition-smooth cursor-pointer"
                  onClick={() => navigate(`/${approval.type}s/${approval._id}`)}
                >
                  <div>
                    <p className="font-medium text-sm">{approval.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{approval.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(approval.date), 'MMM dd, yyyy')}
                    </p>
                    <Button size="sm" variant="outline" className="mt-1">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Vendors for Org Owner */}
      {user?.role === 'org_owner' && (orgOwnerData?.data as any)?.topVendors && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Performing Vendors
            </CardTitle>
            <CardDescription>Your most reliable partners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {((orgOwnerData?.data as any)?.topVendors || []).map((vendor: any) => (
                <div 
                  key={vendor._id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:border-primary transition-smooth cursor-pointer"
                  onClick={() => navigate(`/marketplace/vendors/${vendor._id}`)}
                >
                  <div>
                    <p className="font-medium text-sm">{vendor.companyName}</p>
                    <p className="text-xs text-muted-foreground">{vendor.completedProjects} completed projects</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-sm">{vendor.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started Card for Empty State */}
      {!isLoading && stats && Object.values(stats).every(val => val === 0) && (
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Getting Started
            </CardTitle>
            <CardDescription>
              Complete these steps to get the most out of the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user?.role === 'org_owner' && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Create your organization</p>
                      <p className="text-sm text-muted-foreground">Set up your company profile and details</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/organizations/new')}>
                        Get Started
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Add your buildings</p>
                      <p className="text-sm text-muted-foreground">Register properties you manage</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/buildings/new')}>
                        Add Building
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Create your first RFQ</p>
                      <p className="text-sm text-muted-foreground">Start receiving bids from qualified vendors</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/rfqs/new')}>
                        Create RFQ
                      </Button>
                    </div>
                  </div>
                </>
              )}
              {user?.role === 'vendor' && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Complete your vendor profile</p>
                      <p className="text-sm text-muted-foreground">Add your company details and services</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/vendor/profile')}>
                        Update Profile
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Upload KYC documents</p>
                      <p className="text-sm text-muted-foreground">Get verified to access more opportunities</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/vendor/kyc')}>
                        Complete KYC
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Browse available RFQs</p>
                      <p className="text-sm text-muted-foreground">Find projects and submit your bids</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/rfqs')}>
                        Browse RFQs
                      </Button>
                    </div>
                  </div>
                </>
              )}
              {user?.role === 'facility_manager' && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Review assigned buildings</p>
                      <p className="text-sm text-muted-foreground">Check the facilities under your management</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/buildings')}>
                        View Buildings
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Create maintenance RFQs</p>
                      <p className="text-sm text-muted-foreground">Request quotes for facility work</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/rfqs/new')}>
                        Create RFQ
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Manage active contracts</p>
                      <p className="text-sm text-muted-foreground">Track project progress and milestones</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/contracts')}>
                        View Contracts
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
