import { Outlet } from 'react-router-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/store/api/authApi';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Building2,
  LayoutDashboard,
  Building,
  FileText,
  Users,
  Package,
  Receipt,
  Star,
  AlertCircle,
  ShieldCheck,
  Menu,
  LogOut,
  User as UserIcon,
  Settings,
  ChevronDown,
  Store,
  Briefcase,
} from 'lucide-react';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [logoutMutation] = useLogoutMutation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Define navigation based on user role
  const navSections = [
    {
      title: 'Main',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Management',
      items: [
        ...(user?.role !== 'vendor' ? [{ href: '/organizations', label: 'Organizations', icon: Briefcase }] : []),
        ...(user?.role !== 'vendor' ? [{ href: '/buildings', label: 'Buildings', icon: Building }] : []),
        { href: '/rfqs', label: 'RFQs', icon: FileText },
        ...(user?.role === 'vendor' ? [{ href: '/marketplace/vendors', label: 'Marketplace', icon: Store }] : []),
      ],
    },
    {
      title: 'Business',
      items: [
        ...(user?.role !== 'vendor' ? [{ href: '/vendors', label: 'Vendors', icon: Users }] : []),
        { href: '/contracts', label: 'Contracts', icon: Package },
        { href: '/invoices', label: 'Invoices', icon: Receipt },
      ],
    },
    {
      title: 'Support',
      items: [
        { href: '/ratings', label: 'Ratings', icon: Star },
        { href: '/disputes', label: 'Disputes', icon: AlertCircle },
      ],
    },
    ...(user?.role === 'super_admin' ? [{
      title: 'Admin',
      items: [
        { href: '/admin/vendors/pending', label: 'Vendor Verification', icon: ShieldCheck },
      ],
    }] : []),
  ];

  const NavContent = () => (
    <nav className="space-y-6">
      {navSections.map((section, idx) => (
        <div key={idx}>
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {section.title}
          </p>
          <div className="space-y-1">
            {section.items.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r bg-sidebar fixed left-0 top-0 bottom-0 overflow-y-auto">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">BidMarket</h1>
              <p className="text-xs text-muted-foreground">Construction Platform</p>
            </div>
          </Link>
        </div>

        <div className="px-3 pb-6">
          <NavContent />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 w-full">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-card shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="p-6">
                    <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                      <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-lg font-bold">BidMarket</h1>
                        <p className="text-xs text-muted-foreground">Construction Platform</p>
                      </div>
                    </Link>
                  </div>
                  <div className="px-3 pb-6">
                    <NavContent />
                  </div>
                </SheetContent>
              </Sheet>
              <h2 className="text-lg font-semibold hidden sm:block">
                {navSections
                  .flatMap((s) => s.items)
                  .find((item) => location.pathname === item.href || location.pathname.startsWith(item.href + '/'))?.label || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user?.name ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium">{user?.name}</span>
                    <ChevronDown className="h-4 w-4 hidden md:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.role === 'vendor' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/vendor/profile" className="cursor-pointer">
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/vendor/kyc" className="cursor-pointer">
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          <span>KYC Verification</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
