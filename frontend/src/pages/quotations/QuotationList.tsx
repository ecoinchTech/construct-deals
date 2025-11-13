import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetQuotationsQuery } from '@/store/api/quotationApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const QuotationList = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetQuotationsQuery({
    page,
    limit: 10,
    status: status || undefined,
  });

  const quotations = data?.data?.quotationRequests || [];
  const pagination = data?.data?.pagination;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'responded':
        return <AlertCircle className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'expired':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'responded':
        return 'secondary';
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'expired':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Quotation Requests</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your quotation requests
          </p>
        </div>
        <Button onClick={() => navigate('/marketplace/vendors')}>
          Browse Products
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="w-64">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotations List */}
      {quotations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No quotation requests yet</h2>
            <p className="text-muted-foreground mb-6">
              Start by browsing products and requesting quotations from vendors
            </p>
            <Button onClick={() => navigate('/marketplace/vendors')}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quotations.map((quotation) => (
            <Card key={quotation._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <img
                    src={quotation.product.images?.[0]?.url || '/placeholder-product.png'}
                    alt={quotation.product.name}
                    className="w-24 h-24 object-cover rounded"
                  />

                  {/* Quotation Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{quotation.product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {quotation.variant.name} • Qty: {quotation.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Vendor: {quotation.vendor.companyName}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(quotation.status) as any} className="flex items-center gap-1">
                        {getStatusIcon(quotation.status)}
                        {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Requirements snippet */}
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {quotation.requirements}
                    </p>

                    {/* Delivery Location */}
                    <div className="text-sm mb-3">
                      <span className="font-medium">Delivery to:</span>{' '}
                      {quotation.deliveryLocation.city}, {quotation.deliveryLocation.state}
                    </div>

                    {/* Response Info */}
                    {quotation.responses.length > 0 && (
                      <div className="bg-muted p-3 rounded mb-3">
                        <p className="text-sm font-medium mb-1">
                          {quotation.responses.length} Response(s) Received
                        </p>
                        {quotation.selectedResponse && (
                          <p className="text-sm text-muted-foreground">
                            Selected response from {quotation.responses.find(r => r._id === quotation.selectedResponse)?.vendor.companyName}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Requested on {format(new Date(quotation.createdAt), 'MMM dd, yyyy')}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/quotations/${quotation._id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <div className="flex items-center px-4">
            Page {page} of {pagination.pages}
          </div>
          <Button
            variant="outline"
            disabled={page === pagination.pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuotationList;
