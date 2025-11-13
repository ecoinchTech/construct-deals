import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, CheckCircle2, TrendingUp, Shield, Users, FileText } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container relative mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Building2 className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Revolutionize Construction Project Management
            </h1>
            <p className="text-xl lg:text-2xl mb-10 text-white/90 max-w-3xl mx-auto">
              Connect building owners with verified vendors. Streamline RFQs, manage bids, and execute projects with complete transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Manage Projects</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A complete platform for construction bidding, contract management, and project execution
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl shadow-soft transition-smooth hover:shadow-lg">
              <div className="h-14 w-14 rounded-lg gradient-primary flex items-center justify-center mb-6">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart RFQ Management</h3>
              <p className="text-muted-foreground">
                Create detailed Request for Quotations with dynamic BOQs, attach specifications, and manage the entire tendering process efficiently.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-soft transition-smooth hover:shadow-lg">
              <div className="h-14 w-14 rounded-lg gradient-secondary flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Vendor Network</h3>
              <p className="text-muted-foreground">
                Access a curated network of verified contractors, consultants, and suppliers with KYC validation and performance ratings.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-soft transition-smooth hover:shadow-lg">
              <div className="h-14 w-14 rounded-lg bg-accent flex items-center justify-center mb-6">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparent Bidding</h3>
              <p className="text-muted-foreground">
                Compare bids side-by-side with customizable evaluation criteria, ensuring you select the best vendor for your project.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-soft transition-smooth hover:shadow-lg">
              <div className="h-14 w-14 rounded-lg gradient-primary flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Contract Management</h3>
              <p className="text-muted-foreground">
                Track milestones, manage documentation, approve progress, and ensure projects stay on schedule and budget.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-soft transition-smooth hover:shadow-lg">
              <div className="h-14 w-14 rounded-lg gradient-secondary flex items-center justify-center mb-6">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Invoice & Payments</h3>
              <p className="text-muted-foreground">
                Streamline financial workflows with integrated invoicing, milestone-based payments, and automatic GST calculations.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-soft transition-smooth hover:shadow-lg">
              <div className="h-14 w-14 rounded-lg bg-accent flex items-center justify-center mb-6">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Multi-Property Support</h3>
              <p className="text-muted-foreground">
                Manage multiple buildings and facilities from a single dashboard, with role-based access for your entire team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container relative mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your Project Management?
            </h2>
            <p className="text-xl mb-10 text-white/90">
              Join building owners, facility managers, and vendors who trust our platform for their construction projects.
            </p>
            <Link to="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-10">
                Create Your Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg">BidMarket</p>
                <p className="text-sm text-muted-foreground">Construction Marketplace</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 BidMarket. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
