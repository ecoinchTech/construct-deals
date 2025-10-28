import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/store/api/authApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, LogOut, Users, FileText, Package, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await logoutMutation({ refreshToken }).unwrap();
      }
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/auth/login');
    }
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      super_admin: 'Super Administrator',
      org_owner: 'Organization Owner',
      facility_manager: 'Facility Manager',
      vendor: 'Vendor',
    };
    return roleMap[role] || role;
  };

  const stats = [
    {
      title: 'Active Projects',
      value: '0',
      icon: Building2,
      description: 'No active projects yet',
    },
    {
      title: 'Open RFQs',
      value: '0',
      icon: FileText,
      description: 'Start creating RFQs',
    },
    {
      title: 'Vendors',
      value: '0',
      icon: Users,
      description: 'Build your vendor network',
    },
    {
      title: 'Contracts',
      value: '0',
      icon: Package,
      description: 'No contracts awarded',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">BidMarket</h1>
              <p className="text-xs text-muted-foreground">Construction Marketplace</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="ghost" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-muted-foreground">
            Role: <span className="font-medium text-foreground">{getRoleDisplay(user?.role || '')}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="transition-smooth hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Getting Started Card */}
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
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Add your buildings</p>
                      <p className="text-sm text-muted-foreground">Register properties you manage</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Create your first RFQ</p>
                      <p className="text-sm text-muted-foreground">Start receiving bids from qualified vendors</p>
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
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Upload KYC documents</p>
                      <p className="text-sm text-muted-foreground">Get verified to access more opportunities</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Browse available RFQs</p>
                      <p className="text-sm text-muted-foreground">Find projects and submit your bids</p>
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
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Create maintenance RFQs</p>
                      <p className="text-sm text-muted-foreground">Request quotes for facility work</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Manage active contracts</p>
                      <p className="text-sm text-muted-foreground">Track project progress and milestones</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
