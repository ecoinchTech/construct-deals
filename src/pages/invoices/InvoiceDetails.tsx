import { useParams, useNavigate } from 'react-router-dom';
import { useGetInvoiceQuery, useApproveInvoiceMutation, useRejectInvoiceMutation, useMarkAsPaidMutation } from '@/store/api/invoiceApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function InvoiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetInvoiceQuery(id!);
  const [approveInvoice] = useApproveInvoiceMutation();
  const [rejectInvoice] = useRejectInvoiceMutation();
  const [markAsPaid] = useMarkAsPaidMutation();
  const [rejectionReason, setRejectionReason] = useState('');

  const { user } = useSelector((state: RootState) => state.auth);
  const invoice = data?.data?.invoice;

  const handleApprove = async () => {
    try {
      await approveInvoice(id!).unwrap();
      toast.success('Invoice approved successfully');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to approve invoice');
    }
  };

  const handleReject = async () => {
    try {
      await rejectInvoice({ id: id!, reason: rejectionReason }).unwrap();
      toast.success('Invoice rejected');
      setRejectionReason('');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to reject invoice');
    }
  };

  const handleMarkPaid = async () => {
    try {
      await markAsPaid(id!).unwrap();
      toast.success('Invoice marked as paid');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to mark invoice as paid');
    }
  };

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      draft: 'secondary',
      submitted: 'default',
      approved: 'outline',
      rejected: 'destructive',
      paid: 'default',
    };
    return colors[status] || 'secondary';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto py-8">
        <p>Invoice not found</p>
      </div>
    );
  }

  const isOrgUser = user?.role === 'org_owner' || user?.role === 'facility_manager';

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Invoice #{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground mt-2">
            {invoice.vendorName} → {invoice.organizationName}
          </p>
        </div>
        <Badge variant={getStatusColor(invoice.status)}>{invoice.status}</Badge>
      </div>

      {isOrgUser && invoice.status === 'submitted' && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Review</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={handleApprove}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Invoice
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Invoice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Invoice</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for rejecting this invoice
                  </DialogDescription>
                </DialogHeader>
                <div>
                  <Label>Rejection Reason</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                  />
                </div>
                <DialogFooter>
                  <Button variant="destructive" onClick={handleReject}>
                    Confirm Rejection
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {isOrgUser && invoice.status === 'approved' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Action</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleMarkPaid}>
              <DollarSign className="h-4 w-4 mr-2" />
              Mark as Paid
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Subtotal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{invoice.amount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">GST (18%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{invoice.gst.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{invoice.totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-semibold">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-semibold">{format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</p>
            </div>
          </div>
          {invoice.notes && (
            <div>
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="mt-1">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lineItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">₹{item.rate.toLocaleString()}</TableCell>
                  <TableCell className="text-right">₹{item.amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
