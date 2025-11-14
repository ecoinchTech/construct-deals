import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetOrderQuery, useCancelOrderMutation, useUpdateOrderStatusMutation } from '@/store/api/orderApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ArrowLeft, Package, MapPin, CreditCard, Truck, XCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const { data, isLoading } = useGetOrderQuery(id!);
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      await cancelOrder({ orderId: id!, reason: cancelReason }).unwrap();
      toast.success('Order cancelled successfully');
      setCancelDialogOpen(false);
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to cancel order');
    }
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      await updateStatus({ orderId: id!, status: status as any }).unwrap();
      toast.success('Order status updated successfully');
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!data?.data) {
    return <div>Order not found</div>;
  }

  const order = data.data;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      confirmed: 'default',
      processing: 'default',
      shipped: 'default',
      delivered: 'default',
      cancelled: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const canCancel = order.status === 'pending' || order.status === 'confirmed';
  const isVendor = user?.role === 'vendor';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
            {getStatusBadge(order.status)}
          </div>
          <p className="text-muted-foreground">
            Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy • hh:mm a')}
          </p>
        </div>
        {canCancel && !isVendor && (
          <Button variant="destructive" onClick={() => setCancelDialogOpen(true)}>
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Order
          </Button>
        )}
        {isVendor && order.status === 'confirmed' && (
          <Button onClick={() => handleStatusUpdate('processing')}>
            Mark as Processing
          </Button>
        )}
        {isVendor && order.status === 'processing' && (
          <Button onClick={() => handleStatusUpdate('shipped')}>
            Mark as Shipped
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item._id} className="flex gap-4 rounded-lg border p-4">
                    {item.product.images?.[0] && (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="h-20 w-20 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Variant: {item.variant.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vendor: {item.vendor.companyName}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm">Quantity: {item.quantity}</p>
                        <p className="font-semibold">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline">{item.status}</Badge>
                        {item.tracking && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            Tracking: {item.tracking.number}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.pricing.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Charges</span>
                  <span>₹{order.pricing.deliveryCharges.toLocaleString('en-IN')}</span>
                </div>
                {order.pricing.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.pricing.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>₹{order.pricing.tax.toLocaleString('en-IN')}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{order.pricing.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p>{order.user.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </p>
                <p>
                  {order.shippingAddress.pincode}, {order.shippingAddress.country}
                </p>
                <p className="pt-2">Phone: {order.shippingAddress.phone}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p>{order.user.name}</p>
                <p>{order.billingAddress.street}</p>
                <p>
                  {order.billingAddress.city}, {order.billingAddress.state}
                </p>
                <p>
                  {order.billingAddress.pincode}, {order.billingAddress.country}
                </p>
                <p className="pt-2">Phone: {order.billingAddress.phone}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="uppercase">{order.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant={
                      order.payment.status === 'completed'
                        ? 'default'
                        : order.payment.status === 'failed'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {order.payment.status}
                  </Badge>
                </div>
                {order.payment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-xs">{order.payment.transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Amount</span>
                  <span>₹{order.payment.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Cancellation Reason</Label>
              <Textarea
                id="reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter your reason for cancellation..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Order
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetails;
