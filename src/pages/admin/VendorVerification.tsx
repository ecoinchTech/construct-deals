import { useState } from 'react';
import { useGetPendingVendorsQuery, useApproveVendorMutation, useRejectVendorMutation } from '@/store/api/vendorApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye, Building2, FileText } from 'lucide-react';
import { Vendor } from '@/types/vendor.types';

const VendorVerification = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useGetPendingVendorsQuery({ page, limit: 10 });
  const [approveVendor] = useApproveVendorMutation();
  const [rejectVendor] = useRejectVendorMutation();
  
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const vendors = data?.data?.vendors || [];
  const pagination = data?.data?.pagination;

  const handleApprove = async (vendorId: string) => {
    try {
      await approveVendor(vendorId).unwrap();
      toast.success('Vendor approved successfully');
      refetch();
      setSelectedVendor(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to approve vendor');
    }
  };

  const handleReject = async () => {
    if (!selectedVendor || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await rejectVendor({ id: selectedVendor.id, reason: rejectionReason }).unwrap();
      toast.success('Vendor rejected');
      refetch();
      setRejectDialogOpen(false);
      setSelectedVendor(null);
      setRejectionReason('');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to reject vendor');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vendor Verification</h1>
        <p className="text-muted-foreground mt-2">
          Review and verify pending vendor applications
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No pending vendor applications</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {vendors.map((vendor) => (
              <Card key={vendor.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {vendor.companyName}
                      </CardTitle>
                      <CardDescription>
                        Applied on {new Date(vendor.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{vendor.kycStatus}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Categories</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {vendor.categories.slice(0, 3).map((cat, idx) => (
                          <Badge key={typeof cat === 'string' ? cat : (cat._id || idx)} variant="outline">{typeof cat === 'string' ? cat : cat.name}</Badge>
                        ))}
                        {vendor.categories.length > 3 && (
                          <Badge variant="outline">+{vendor.categories.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Service Cities</p>
                      <p className="text-sm mt-1">{vendor.serviceCities.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">GST Number</p>
                      <p className="font-mono text-sm mt-1">{vendor.gstNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">PAN Number</p>
                      <p className="font-mono text-sm mt-1">{vendor.panNumber}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Profile Summary</p>
                    <p className="text-sm line-clamp-2">{vendor.profileSummary}</p>
                  </div>

                  {vendor.kycDocuments.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        KYC Documents ({vendor.kycDocuments.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {vendor.kycDocuments.map((doc) => (
                          <Button key={doc.id} variant="outline" size="sm" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              View {doc.type}
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="default"
                      onClick={() => handleApprove(vendor.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setSelectedVendor(vendor);
                        setRejectDialogOpen(true);
                      }}
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
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
                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                disabled={page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vendor Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedVendor?.companyName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorVerification;
