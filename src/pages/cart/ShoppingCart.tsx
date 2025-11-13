import { useNavigate } from 'react-router-dom';
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveFromCartMutation } from '@/store/api/cartApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ShoppingCart as CartIcon, Trash2, Package, ArrowRight } from 'lucide-react';

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetCartQuery();
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveFromCartMutation();

  const cart = data?.data;

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await updateItem({ itemId, quantity }).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update cart');
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeItem(itemId).unwrap();
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to remove item');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardContent className="text-center py-12">
            <CartIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add products to your cart to get started</p>
            <Button onClick={() => navigate('/products')}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item._id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <img
                    src={item.product.images?.[0]?.url || ''}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.variant.name}</p>
                        <p className="text-sm text-muted-foreground">by {item.vendor.companyName}</p>
                        <Badge className="mt-2" variant={item.type === 'standard' ? 'default' : 'secondary'}>
                          {item.type === 'standard' ? 'Standard Purchase' : 'Quotation Request'}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">₹{item.price}</p>
                        {item.compareAtPrice && (
                          <p className="text-sm text-muted-foreground line-through">
                            ₹{item.compareAtPrice}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item._id, Number(e.target.value))}
                          className="w-20 text-center"
                          min={1}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{cart.summary.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span>₹{cart.summary.deliveryCharges}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (GST)</span>
              <span>₹{cart.summary.tax}</span>
            </div>
            {cart.summary.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{cart.summary.discount}</span>
              </div>
            )}
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{cart.summary.total}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ShoppingCart;
