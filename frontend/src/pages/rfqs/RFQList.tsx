import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetRFQsQuery } from '@/store/api/rfqApi';
import { RFQFilters } from '@/types/rfq.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, FileText, Calendar, DollarSign, Building } from 'lucide-react';

const RFQList = () => {
  const [filters, setFilters] = useState<RFQFilters>({ page: 1, limit: 10 });
  const { data, isLoading } = useGetRFQsQuery(filters);

  const rfqs = data?.data?.rfqs || [];
  const pagination = data?.data?.pagination;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: 'outline',
      published: 'default',
      closed: 'secondary',
      awarded: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Request for Quotations</h1>
          <p className="text-muted-foreground mt-2">
            Manage your RFQs and track bidding activity
          </p>
        </div>
        <Button asChild>
          <Link to="/rfqs/new">
            <Plus className="mr-2 h-4 w-4" />
            Create RFQ
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search RFQs..."
                className="pl-10"
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : rfqs.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No RFQs found</p>
            <Button className="mt-4" asChild>
              <Link to="/rfqs/new">Create Your First RFQ</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {rfqs.map((rfq) => (
              <Link key={rfq._id} to={`/rfqs/${rfq._id}`}>
                <Card className="hover:shadow-lg transition-all hover:scale-[1.01]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-1">{rfq.title}</CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {rfq.description}
                        </CardDescription>
                      </div>
                      {getStatusBadge(rfq.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Budget</p>
                          <p className="font-medium">
                            ${rfq.estBudgetMin?.toLocaleString()} - ${rfq.estBudgetMax?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Close Date</p>
                          <p className="font-medium">
                            {new Date(rfq.closeDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">BOQ Items</p>
                          <p className="font-medium">{rfq.boqId?.items?.length || 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Building</p>
                          <p className="font-medium">{rfq.buildingId?.name}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
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
                  Page {pagination.page} of {pagination.pages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, filters.page! + 1) })}
                disabled={filters.page === pagination.pages}
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

export default RFQList;