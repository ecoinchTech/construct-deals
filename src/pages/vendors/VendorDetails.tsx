import { useParams, Link } from 'react-router-dom';
import { useGetVendorQuery } from '@/store/api/vendorApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Star, MapPin, Building2, Globe, FileText, Award, CheckCircle } from 'lucide-react';

const VendorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetVendorQuery(id!);

  const vendor = data?.data?.vendor;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vendor) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Vendor not found</p>
          <Button className="mt-4" asChild>
            <Link to="/marketplace/vendors">Back to Marketplace</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/marketplace/vendors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{vendor.companyName}</h1>
          <p className="text-muted-foreground mt-1">Vendor Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{vendor.companyName}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Star className="h-5 w-5 fill-warning text-warning" />
                    <span className="text-lg font-semibold">{vendor.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({vendor.reviewCount} reviews)</span>
                  </CardDescription>
                </div>
                {vendor.featured && (
                  <Badge variant="default" className="gap-1">
                    <Award className="h-4 w-4" />
                    Featured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  About
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {vendor.profileSummary}
                </p>
              </div>

              {vendor.kycStatus === 'approved' && (
                <div className="flex items-center gap-2 p-4 bg-success/10 border border-success/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-medium text-success">Verified Vendor</span>
                </div>
              )}
            </CardContent>
          </Card>

          {vendor.portfolioUrls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Portfolio & Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vendor.portfolioUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border rounded-lg hover:bg-muted transition-colors"
                    >
                      <p className="text-sm text-primary hover:underline">{url}</p>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {vendor.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Service Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {vendor.serviceCities.map((city) => (
                  <div key={city} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    {city}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">GST Number</p>
                <p className="font-mono text-sm">{vendor.gstNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PAN Number</p>
                <p className="font-mono text-sm">{vendor.panNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="text-sm">{new Date(vendor.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" size="lg">
            Contact Vendor
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;
