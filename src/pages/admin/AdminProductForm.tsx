import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetProductQuery, useCreateProductMutation, useUpdateProductMutation } from '@/store/api/productApi';
import { useGetProductCategoryTreeQuery } from '@/store/api/productCategoryApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import RoleGuard from '@/components/common/RoleGuard';

interface ProductVariant {
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  weight?: {
    value: number;
    unit: 'kg' | 'g' | 'lb' | 'oz';
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'm' | 'in' | 'ft';
  };
  attributes: Record<string, any>;
  inventory: {
    quantity: number;
    trackQuantity: boolean;
    allowBackorder: boolean;
  };
  isActive: boolean;
}

interface ProductImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [sku, setSku] = useState('');
  const [specifications, setSpecifications] = useState<Record<string, any>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [status, setStatus] = useState<'active' | 'inactive' | 'draft'>('draft');

  const { data: categoriesData } = useGetProductCategoryTreeQuery({});
  const { data: productData } = useGetProductQuery(id!, { skip: !isEdit });
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const categories = categoriesData?.data || [];
  const flattenCategories = (cats: any[]): any[] => {
    let result: any[] = [];
    cats.forEach((cat) => {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children));
      }
    });
    return result;
  };
  const flatCategories = flattenCategories(categories);

  useEffect(() => {
    if (productData?.data && isEdit) {
      const product = productData.data;
      setName(product.name);
      setDescription(product.description);
      setSelectedCategory(product.category._id);
      setBrand(product.brand);
      setModel(product.model);
      setSku(product.sku);
      setSpecifications(product.specifications);
      setTags(product.tags);
      setVariants(product.variants);
      setImages(product.images || []);
      setStatus(product.status);
    }
  }, [productData, isEdit]);

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        name: '',
        sku: '',
        price: 0,
        compareAtPrice: 0,
        costPrice: 0,
        weight: { value: 0, unit: 'kg' },
        dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
        attributes: {},
        inventory: {
          quantity: 0,
          trackQuantity: true,
          allowBackorder: false,
        },
        isActive: true,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newVariants[index] = {
        ...newVariants[index],
        [parent]: {
          ...newVariants[index][parent as keyof ProductVariant],
          [child]: value,
        },
      };
    } else {
      newVariants[index] = { ...newVariants[index], [field]: value };
    }
    setVariants(newVariants);
  };

  const handleAddImage = () => {
    setImages([
      ...images,
      { url: '', alt: '', isPrimary: images.length === 0 },
    ]);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // If we removed the primary image, make the first one primary
    if (images[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    setImages(newImages);
  };

  const handleImageChange = (index: number, field: string, value: any) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    
    // If setting isPrimary to true, set all others to false
    if (field === 'isPrimary' && value === true) {
      newImages.forEach((img, i) => {
        if (i !== index) img.isPrimary = false;
      });
    }
    
    setImages(newImages);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddSpecification = () => {
    setSpecifications({
      ...specifications,
      ['newSpec']: '',
    });
  };

  const handleSpecificationChange = (key: string, value: any) => {
    setSpecifications({
      ...specifications,
      [key]: value,
    });
  };

  const handleRemoveSpecification = (key: string) => {
    const newSpecs = { ...specifications };
    delete newSpecs[key];
    setSpecifications(newSpecs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !selectedCategory || !brand || !sku) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (variants.length === 0) {
      toast.error('Please add at least one variant');
      return;
    }

    const formData = {
      name,
      description,
      category: selectedCategory,
      brand,
      model,
      sku,
      specifications,
      tags,
      variants,
      images,
      status,
    };

    try {
      if (isEdit) {
        await updateProduct({ id: id!, ...formData }).unwrap();
        toast.success('Product updated successfully');
      } else {
        await createProduct(formData).unwrap();
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to save product');
    }
  };

  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isEdit ? 'Edit Product' : 'Create Product'}</h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Update product details' : 'Add a new product to the catalog'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="Enter SKU"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter product description"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {flatCategories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {'  '.repeat(cat.level - 1) + cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Enter brand"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="Enter model"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value: 'active' | 'inactive' | 'draft') => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {images.map((image, index) => (
                  <div key={index} className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Image URL</Label>
                      <Input
                        value={image.url}
                        onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                        placeholder="Enter image URL"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Alt Text</Label>
                      <Input
                        value={image.alt}
                        onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                        placeholder="Enter alt text"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`primary-${index}`}
                          checked={image.isPrimary}
                          onCheckedChange={(checked) => handleImageChange(index, 'isPrimary', checked)}
                        />
                        <Label htmlFor={`primary-${index}`}>Primary</Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={handleAddImage}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Image
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Specification Name</Label>
                      <Input
                        value={key}
                        onChange={(e) => {
                          const newSpecs = { ...specifications };
                          delete newSpecs[key];
                          newSpecs[e.target.value] = value;
                          setSpecifications(newSpecs);
                        }}
                        placeholder="Enter specification name"
                      />
                    </div>

                    <div className="space-y-2 flex gap-2">
                      <div className="flex-1">
                        <Label>Value</Label>
                        <Input
                          value={value}
                          onChange={(e) => handleSpecificationChange(key, e.target.value)}
                          placeholder="Enter value"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSpecification(key)}
                        className="mt-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={handleAddSpecification}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Specification
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Enter tag"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 rounded-full hover:bg-gray-200"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                        <Label>Variant Name</Label>
                        <Input
                          value={variant.name}
                          onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                          placeholder="Enter variant name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>SKU</Label>
                        <Input
                          value={variant.sku}
                          onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                          placeholder="Enter SKU"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value))}
                          placeholder="Enter price"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Compare At Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.compareAtPrice}
                          onChange={(e) => handleVariantChange(index, 'compareAtPrice', parseFloat(e.target.value))}
                          placeholder="Enter compare at price"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Cost Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.costPrice}
                          onChange={(e) => handleVariantChange(index, 'costPrice', parseFloat(e.target.value))}
                          placeholder="Enter cost price"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Weight</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.weight?.value || 0}
                            onChange={(e) => handleVariantChange(index, 'weight.value', parseFloat(e.target.value))}
                            placeholder="Value"
                          />
                          <Select
                            value={variant.weight?.unit || 'kg'}
                            onValueChange={(value) => handleVariantChange(index, 'weight.unit', value)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="g">g</SelectItem>
                              <SelectItem value="lb">lb</SelectItem>
                              <SelectItem value="oz">oz</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Dimensions</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.dimensions?.length || 0}
                            onChange={(e) => handleVariantChange(index, 'dimensions.length', parseFloat(e.target.value))}
                            placeholder="Length"
                          />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.dimensions?.width || 0}
                            onChange={(e) => handleVariantChange(index, 'dimensions.width', parseFloat(e.target.value))}
                            placeholder="Width"
                          />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.dimensions?.height || 0}
                            onChange={(e) => handleVariantChange(index, 'dimensions.height', parseFloat(e.target.value))}
                            placeholder="Height"
                          />
                          <Select
                            value={variant.dimensions?.unit || 'cm'}
                            onValueChange={(value) => handleVariantChange(index, 'dimensions.unit', value)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cm">cm</SelectItem>
                              <SelectItem value="m">m</SelectItem>
                              <SelectItem value="in">in</SelectItem>
                              <SelectItem value="ft">ft</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="0"
                          value={variant.inventory.quantity}
                          onChange={(e) => handleVariantChange(index, 'inventory.quantity', parseInt(e.target.value))}
                          placeholder="Enter quantity"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`track-${index}`}
                            checked={variant.inventory.trackQuantity}
                            onCheckedChange={(checked) => handleVariantChange(index, 'inventory.trackQuantity', checked)}
                          />
                          <Label htmlFor={`track-${index}`}>Track Quantity</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`backorder-${index}`}
                            checked={variant.inventory.allowBackorder}
                            onCheckedChange={(checked) => handleVariantChange(index, 'inventory.allowBackorder', checked)}
                          />
                          <Label htmlFor={`backorder-${index}`}>Allow Backorder</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`active-${index}`}
                            checked={variant.isActive}
                            onCheckedChange={(checked) => handleVariantChange(index, 'isActive', checked)}
                          />
                          <Label htmlFor={`active-${index}`}>Active</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {variants.length === 0 && (
                  <p className="text-center text-muted-foreground">No variants added yet</p>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
};

export default ProductForm;