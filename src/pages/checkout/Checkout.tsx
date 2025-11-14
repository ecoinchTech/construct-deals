import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCartQuery, useClearCartMutation } from '@/store/api/cartApi';
import { useCreateOrderMutation } from '@/store/api/orderApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Smartphone, Building2, Wallet, Banknote } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { data: cartData } = useGetCartQuery();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [clearCart] = useClearCartMutation();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'wallet' | 'cod'>('card');
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [notes, setNotes] = useState('');

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    phone: '',
  });

  const [billingAddress, setBillingAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    phone: '',
  });

  const handlePlaceOrder = async () => {
    // Validation
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode || !shippingAddress.phone) {
      toast.error('Please fill in all shipping address fields');
      return;
    }

    if (!sameAsShipping && (!billingAddress.street || !billingAddress.city || !billingAddress.state || !billingAddress.pincode || !billingAddress.phone)) {
      toast.error('Please fill in all billing address fields');
      return;
    }

    if (!cartData?.data.items || cartData.data.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      const orderData = {
        items: cartData.data.items.map((item) => ({
          productId: item.product._id,
          variantId: item.variant._id,
          vendorProductId: item.vendorProduct._id,
          quantity: item.quantity,
          deliveryOption: item.deliveryOption,
          type: item.type,
          quotationId: item.quotationId,
        })),
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod,
        notes,
      };

      const result = await createOrder(orderData).unwrap();
      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${result.data._id}`);
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to place order');
    }
  };

  if (!cartData?.data.items || cartData.data.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const paymentMethods = [
    { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { value: 'upi', label: 'UPI', icon: Smartphone },
    { value: 'netbanking', label: 'Net Banking', icon: Building2 },
    { value: 'wallet', label: 'Wallet', icon: Wallet },
    { value: 'cod', label: 'Cash on Delivery', icon: Banknote },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/cart')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">Complete your order</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="City"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                      placeholder="Pincode"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Billing Address</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="same-as-shipping"
                      checked={sameAsShipping}
                      onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
                    />
                    <Label htmlFor="same-as-shipping" className="cursor-pointer">
                      Same as shipping
                    </Label>
                  </div>
                </div>
              </CardHeader>
              {!sameAsShipping && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="billing-street">Street Address</Label>
                    <Input
                      id="billing-street"
                      value={billingAddress.street}
                      onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
                      placeholder="Enter your street address"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="billing-city">City</Label>
                      <Input
                        id="billing-city"
                        value={billingAddress.city}
                        onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                        placeholder="City"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billing-state">State</Label>
                      <Input
                        id="billing-state"
                        value={billingAddress.state}
                        onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                        placeholder="State"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="billing-pincode">Pincode</Label>
                      <Input
                        id="billing-pincode"
                        value={billingAddress.pincode}
                        onChange={(e) => setBillingAddress({ ...billingAddress, pincode: e.target.value })}
                        placeholder="Pincode"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billing-phone">Phone</Label>
                      <Input
                        id="billing-phone"
                        value={billingAddress.phone}
                        onChange={(e) => setBillingAddress({ ...billingAddress, phone: e.target.value })}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <div key={method.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={method.value} id={method.value} />
                          <Label
                            htmlFor={method.value}
                            className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border p-4"
                          >
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <span>{method.label}</span>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special instructions for your order..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{cartData.data.pricing.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Charges</span>
                  <span>₹{cartData.data.pricing.deliveryCharges.toLocaleString('en-IN')}</span>
                </div>
                {cartData.data.pricing.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{cartData.data.pricing.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>₹{cartData.data.pricing.tax.toLocaleString('en-IN')}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{cartData.data.pricing.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={isCreatingOrder}>
                {isCreatingOrder ? 'Processing...' : 'Place Order'}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By placing your order, you agree to our terms and conditions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
