import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProductQuery } from '@/store/api/productApi';
import { useAddToCartMutation } from '@/store/api/cartApi';
import { useCreateQuotationMutation } from '@/store/api/quotationApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ShoppingCart, ArrowLeft, Star, Package, Truck, Shield, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetProductQuery(id!);
  const [addToCart] = useAddToCartMutation();

  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState<'standard' | 'quotation'>('standard');

  const product = data?.data;

  const handleAddToCart = async () => {
    if (!selectedVariant || !selectedVendor) {
      toast.error('Please select a variant and vendor');
      return;
    }

    try {
      await addToCart({
        productId: product!._id,
        variantId: selectedVariant,
        vendorProductId: selectedVendor,
        quantity,
        type: purchaseType,
      }).unwrap();
      toast.success('Added to cart');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to add to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div>Product not found</div>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <img
            src={product.images?.[0]?.url || ''}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
          />
          <div className="grid grid-cols-4 gap-2">
            {product.images?.slice(1, 5).map((img, i) => (
              <img key={i} src={img.url} alt={img.alt} className="w-full h-20 object-cover rounded" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              {product.averageRating && (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-medium">{product.averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
                </div>
              )}
              <Badge>{product.category.name}</Badge>
            </div>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Variant</label>
                <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.variants.map((v) => (
                      <SelectItem key={v._id} value={v._id}>
                        {v.name} - ₹{v.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select Vendor</label>
                <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.vendorProducts?.map((vp) => (
                      <SelectItem key={vp._id} value={vp._id}>
                        {vp.vendor.companyName} - ⭐ {vp.vendor.rating || 'N/A'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleAddToCart}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setPurchaseType('quotation')}>
                  Request Quote
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Fast Delivery</p>
            </Card>
            <Card className="p-4 text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Secure Payment</p>
            </Card>
            <Card className="p-4 text-center">
              <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Quality Assured</p>
            </Card>
          </div>
        </div>
      </div>

      <Tabs defaultValue="specifications">
        <TabsList>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="specifications" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-muted-foreground">{key}</dt>
                    <dd className="text-base">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="vendors">
          <div className="space-y-4">
            {product.vendorProducts?.map((vp) => (
              <Card key={vp._id}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{vp.vendor.companyName}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Rating: {vp.vendor.rating || 'N/A'} ⭐
                  </p>
                  <div className="space-y-2">
                    {vp.deliveryOptions.map((opt, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{opt.name}</span>
                        <span>₹{opt.charges} - {opt.estimatedDays} days</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="reviews">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Reviews coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductDetails;
