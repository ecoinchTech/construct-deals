import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetVendorsQuery } from '@/store/api/vendorApi';
import { VendorFilters } from '@/types/vendor.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Star, MapPin, Award } from 'lucide-react';

const VendorMarketplace = () => {
  const [filters, setFilters] = useState<VendorFilters>({ page: 1, limit: 12 });
  const { data, isLoading } = useGetVendorsQuery(filters);

  const vendors = data?.data?.vendors || [];
  const pagination = data?.data?.pagination;

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search, page: 1 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vendor Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Find and connect with verified vendors
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors by name, category, or city..."
                className="pl-10"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Button variant="outline">
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No vendors found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Link key={vendor.id} to={`/marketplace/vendors/${vendor.id}`}>
                <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="line-clamp-1">{vendor.companyName}</CardTitle>
                      {vendor.isFeatured && (
                        <Badge variant="default" className="ml-2">
                          <Award className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-medium">{(vendor.ratingAvg ?? 0).toFixed(1)}</span>
                      <span className="text-muted-foreground">({vendor.totalRatings ?? 0} reviews)</span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {vendor.profileSummary}
                    </p>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {vendor.categories.slice(0, 3).map((cat) => (
                          <Badge key={cat._id} variant="secondary">
                            {cat.name}
                          </Badge>
                        ))}
                        {vendor.categories.length > 3 && (
                          <Badge variant="outline">+{vendor.categories.length - 3}</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">
                          {vendor.serviceCities?.slice(0, 2).join(', ')}
                          {vendor.serviceCities?.length > 2 && ` +${vendor.serviceCities.length - 2}`}
                        </span>
                      </div>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      className="w-full"
                    >
                      <Link to={`/marketplace/vendors/${vendor._id}`}>
                        View Profile
                      </Link>
                    </Button>

                  </CardContent>
                </Card>
              </Link>
            ))}

          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page! - 1) })}
                disabled={filters.page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2 px-4">
                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setFilters({ ...filters, page: Math.min(pagination.totalPages, filters.page! + 1) })}
                disabled={filters.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VendorMarketplace;
