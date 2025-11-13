import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetQuotationQuery, useAcceptQuotationMutation, useRejectQuotationMutation } from '@/store/api/quotationApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Package, MapPin, Calendar, DollarSign, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const QuotationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetQuotationQuery(id!);
  const [acceptQuotation] = useAcceptQuotationMutation();
  const [rejectQuotation] = useRejectQuotationMutation();

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<string>('');

  const quotation = data?.data;

  const handleAcceptResponse = async (responseId: string) => {
    try {
      await acceptQuotation({ id: id!, responseId }).unwrap();
      toast.success('Quotation accepted! You can now proceed to place an order.');
      navigate('/orders');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to accept quotation');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await rejectQuotation({ id: id!, reason: rejectReason }).unwrap();
      toast.success('Quotation rejected');
      setShowRejectDialog(false);
      navigate('/quotations');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to reject quotation');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Quotation not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Quotation Request</h1>
          <p className="text-muted-foreground mt-1">
            Request ID: {quotation._id}
          </p>
        </div>
        <Badge
          variant={
            quotation.status === 'accepted' ? 'default' :
            quotation.status === 'responded' ? 'secondary' :
            quotation.status === 'rejected' || quotation.status === 'expired' ? 'destructive' :
            'outline'
          }
          className="text-base px-4 py-2"
        >
          {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <img
                  src={quotation.product.images?.[0]?.url || '/placeholder-product.png'}
                  alt={quotation.product.name}
                  className="w-32 h-32 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{quotation.product.name}</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>SKU:</strong> {quotation.product.sku}</p>
                    <p><strong>Variant:</strong> {quotation.variant.name}</p>
                    <p><strong>Quantity:</strong> {quotation.quantity}</p>
                    <p><strong>Vendor:</strong> {quotation.vendor.companyName}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{quotation.requirements}</p>
            </CardContent>
          </Card>

          {/* Vendor Responses */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Responses ({quotation.responses.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quotation.responses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3" />
                  <p>Waiting for vendor response...</p>
                </div>
              ) : (
                quotation.responses.map((response) => (
                  <Card
                    key={response._id}
                    className={quotation.selectedResponse === response._id ? 'border-primary' : ''}
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold">{response.vendor.companyName}</h4>
                          <p className="text-sm text-muted-foreground">{response.vendor.email}</p>
                        </div>
                        {quotation.selectedResponse === response._id && (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accepted
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                          <DollarSign className="h-6 w-6" />
                          ₹{response.price.toLocaleString()}
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">Message:</p>
                          <p className="text-sm text-muted-foreground">{response.message}</p>
                        </div>

                        <div className="text-sm">
                          <p><strong>Valid for:</strong> {response.validityDays} days</p>
                          <p className="text-muted-foreground">
                            Received on {format(new Date(response.createdAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>

                        {response.attachments && response.attachments.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-1">Attachments:</p>
                            <div className="space-y-1">
                              {response.attachments.map((attachment, idx) => (
                                <a
                                  key={idx}
                                  href={attachment}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline block"
                                >
                                  Attachment {idx + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {quotation.status === 'responded' && !quotation.selectedResponse && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => handleAcceptResponse(response._id)}
                              className="flex-1"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept This Quote
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{quotation.deliveryLocation.address}</p>
              <p>{quotation.deliveryLocation.city}, {quotation.deliveryLocation.state}</p>
              <p>PIN: {quotation.deliveryLocation.pincode}</p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Requested On</p>
                <p className="text-muted-foreground">
                  {format(new Date(quotation.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              {quotation.expectedDeliveryDate && (
                <div>
                  <p className="font-medium">Expected Delivery</p>
                  <p className="text-muted-foreground">
                    {format(new Date(quotation.expectedDeliveryDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
              {quotation.expiresAt && (
                <div>
                  <p className="font-medium">Expires On</p>
                  <p className="text-muted-foreground">
                    {format(new Date(quotation.expiresAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget */}
          {quotation.budget && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget Range
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Minimum:</span>
                  <span className="font-semibold">₹{quotation.budget.min.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Maximum:</span>
                  <span className="font-semibold">₹{quotation.budget.max.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {quotation.status === 'pending' || quotation.status === 'responded' && !quotation.selectedResponse && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Quotation
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Quotation Request</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this quotation request.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">Reason</Label>
            <Textarea
              id="reject-reason"
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject}>
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuotationDetails;
