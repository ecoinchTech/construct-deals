import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetAvailableProductsQuery, useGetVendorProductQuery, useCreateVendorProductMutation, useUpdateVendorProductMutation } from '@/store/api/vendorProductApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import RoleGuard from '@/components/common/RoleGuard';

interface VariantData {
  variant: string;
  price: number;
  compareAtPrice?: number;
  inventory: {
    quantity: number;
    trackQuantity: boolean;
    allowBackorder: boolean;
  };
  isActive: boolean;
}

interface DeliveryOption {
  name: string;
  estimatedDays: number;
  charges: number;
  isActive: boolean;
}

const VendorProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [selectedProductId, setSelectedProductId] = useState('');
  const [variants, setVariants] = useState<VariantData[]>([]);
  const [commissionRate, setCommissionRate] = useState(0.05);
  const [notes, setNotes] = useState('');
  const [returnDays, setReturnDays] = useState(7);
  const [returnConditions, setReturnConditions] = useState('');
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([
    { name: 'Standard Delivery', estimatedDays: 5, charges: 50, isActive: true },
  ]);

  const { data: availableProducts } = useGetAvailableProductsQuery({}, { skip: isEdit });
  const { data: vendorProduct } = useGetVendorProductQuery(id!, { skip: !isEdit });
  const [createVendorProduct, { isLoading: isCreating }] = useCreateVendorProductMutation();
  const [updateVendorProduct, { isLoading: isUpdating }] = useUpdateVendorProductMutation();

  useEffect(() => {
    if (vendorProduct?.data) {
      const vp = vendorProduct.data;
      setSelectedProductId(vp.product._id);
      setVariants(vp.variants.map(v => ({
        variant: v.variant._id,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        inventory: v.inventory,
        isActive: v.isActive,
      })));
      setCommissionRate(vp.commissionRate);
      setNotes(vp.notes || '');
      setReturnDays(vp.returnPolicy?.days || 7);
      setReturnConditions(vp.returnPolicy?.conditions || '');
      setDeliveryOptions(vp.deliveryOptions || []);
    }
  }, [vendorProduct]);

  const selectedProduct = availableProducts?.data.products.find(p => p._id === selectedProductId);

  const handleAddVariant = () => {
    if (!selectedProduct?.variants?.[0]) {
      toast.error('No variants available for this product');
      return;
    }

    setVariants([...variants, {
      variant: selectedProduct.variants[0]._id,
      price: 0,
      compareAtPrice: 0,
      inventory: {
        quantity: 0,
        trackQuantity: true,
        allowBackorder: false,
      },
      isActive: true,
    }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleAddDeliveryOption = () => {
    setDeliveryOptions([...deliveryOptions, {
      name: '',
      estimatedDays: 5,
      charges: 0,
      isActive: true,
    }]);
  };

  const handleRemoveDeliveryOption = (index: number) => {
    setDeliveryOptions(deliveryOptions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }

    if (variants.length === 0) {
      toast.error('Please add at least one variant');
      return;
    }

    const formData = {
      productId: selectedProductId,
      variants,
      commissionRate,
      notes,
      returnPolicy: {
        days: returnDays,
        conditions: returnConditions,
      },
      deliveryOptions,
    };

    try {
      if (isEdit) {
        await updateVendorProduct({ id: id!, ...formData }).unwrap();
        toast.success('Product updated successfully');
      } else {
        await createVendorProduct(formData).unwrap();
        toast.success('Product added to catalog successfully');
      }
      navigate('/vendors/products');
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to save product');
    }
  };

  return (
    <RoleGuard allowedRoles={['vendor']}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/vendors/products')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Update product details' : 'Add a new product to your catalog'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {!isEdit && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts?.data.products.map((product) => (
                        <SelectItem key={product._id} value={product._id}>
                          {product.name} - {product.sku}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Product Variants</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddVariant}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Variant
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Variant {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveVariant(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Variant</Label>
                        <Select
                          value={variant.variant}
                          onValueChange={(value) => {
                            const newVariants = [...variants];
                            newVariants[index].variant = value;
                            setVariants(newVariants);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedProduct?.variants?.map((v) => (
                              <SelectItem key={v._id} value={v._id}>
                                {v.name} - {v.sku}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Price (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => {
                            const newVariants = [...variants];
                            newVariants[index].price = parseFloat(e.target.value);
                            setVariants(newVariants);
                          }}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Compare At Price (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.compareAtPrice || ''}
                          onChange={(e) => {
                            const newVariants = [...variants];
                            newVariants[index].compareAtPrice = parseFloat(e.target.value);
                            setVariants(newVariants);
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="0"
                          value={variant.inventory.quantity}
                          onChange={(e) => {
                            const newVariants = [...variants];
                            newVariants[index].inventory.quantity = parseInt(e.target.value);
                            setVariants(newVariants);
                          }}
                          required
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`track-${index}`}
                            checked={variant.inventory.trackQuantity}
                            onCheckedChange={(checked) => {
                              const newVariants = [...variants];
                              newVariants[index].inventory.trackQuantity = checked as boolean;
                              setVariants(newVariants);
                            }}
                          />
                          <Label htmlFor={`track-${index}`}>Track Quantity</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`backorder-${index}`}
                            checked={variant.inventory.allowBackorder}
                            onCheckedChange={(checked) => {
                              const newVariants = [...variants];
                              newVariants[index].inventory.allowBackorder = checked as boolean;
                              setVariants(newVariants);
                            }}
                          />
                          <Label htmlFor={`backorder-${index}`}>Allow Backorder</Label>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`active-${index}`}
                          checked={variant.isActive}
                          onCheckedChange={(checked) => {
                            const newVariants = [...variants];
                            newVariants[index].isActive = checked as boolean;
                            setVariants(newVariants);
                          }}
                        />
                        <Label htmlFor={`active-${index}`}>Active</Label>
                      </div>
                    </div>
                  </div>
                ))}

                {variants.length === 0 && (
                  <p className="text-center text-muted-foreground">No variants added yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Delivery Options</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddDeliveryOption}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {deliveryOptions.map((option, index) => (
                  <div key={index} className="grid gap-4 rounded-lg border p-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={option.name}
                        onChange={(e) => {
                          const newOptions = [...deliveryOptions];
                          newOptions[index].name = e.target.value;
                          setDeliveryOptions(newOptions);
                        }}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Estimated Days</Label>
                      <Input
                        type="number"
                        min="1"
                        value={option.estimatedDays}
                        onChange={(e) => {
                          const newOptions = [...deliveryOptions];
                          newOptions[index].estimatedDays = parseInt(e.target.value);
                          setDeliveryOptions(newOptions);
                        }}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Charges (₹)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={option.charges}
                        onChange={(e) => {
                          const newOptions = [...deliveryOptions];
                          newOptions[index].charges= parseFloat(e.target.value);
                          setDeliveryOptions(newOptions);
                        }}
                        required
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`delivery-active-${index}`}
                          checked={option.isActive}
                          onCheckedChange={(checked) => {
                            const newOptions = [...deliveryOptions];
                            newOptions[index].isActive = checked as boolean;
                            setDeliveryOptions(newOptions);
                          }}
                        />
                        <Label htmlFor={`delivery-active-${index}`}>Active</Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDeliveryOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Commission Rate (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={commissionRate * 100}
                      onChange={(e) => setCommissionRate(parseFloat(e.target.value) / 100)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Return Days</Label>
                    <Input
                      type="number"
                      min="0"
                      value={returnDays}
                      onChange={(e) => setReturnDays(parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Return Conditions</Label>
                  <Textarea
                    value={returnConditions}
                    onChange={(e) => setReturnConditions(e.target.value)}
                    placeholder="Describe return policy conditions..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes about the product..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/vendors/products')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
};

export default VendorProductForm;
