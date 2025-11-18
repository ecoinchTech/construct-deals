import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  useGetProductCategoryTreeQuery,
  useCreateProductCategoryMutation,
  useUpdateProductCategoryMutation,
  useDeleteProductCategoryMutation,
  useAddCategoryAttributesMutation,
  useGetCategoryAttributesQuery,
} from '@/store/api/productCategoryApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, FolderTree, ChevronRight, ChevronDown, Settings } from 'lucide-react';
import RoleGuard from '@/components/common/RoleGuard';
import { UserRole } from '@/types/auth.types';
import { ProductCategory, CategoryAttribute } from '@/types/product.types';

const ProductCategoryManagement = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, isLoading, refetch } = useGetProductCategoryTreeQuery({});
  const [createCategory] = useCreateProductCategoryMutation();
  const [updateCategory] = useUpdateProductCategoryMutation();
  const [deleteCategory] = useDeleteProductCategoryMutation();
  const [addCategoryAttributes] = useAddCategoryAttributesMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAttributesDialogOpen, setIsAttributesDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategoryForAttributes, setSelectedCategoryForAttributes] = useState<ProductCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
    icon: '',
    image: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [attributes, setAttributes] = useState<CategoryAttribute[]>([
    { name: '', type: 'text', required: false, unit: '', options: [] }
  ]);

  // Extract categories from the API response
  const categories = data?.data || [];

  const handleOpenDialog = (category?: ProductCategory, parentId?: string) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        parentId: category.parentId || '',
        icon: category.icon || '',
        image: category.image || '',
        status: category.status,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        parentId: parentId || '',
        icon: '',
        image: '',
        status: 'active',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      parentId: '',
      icon: '',
      image: '',
      status: 'active',
    });
  };

  const handleSubmit = async () => {
    try {
      // Convert empty parentId to undefined for root categories
      const submissionData = {
        ...formData,
        parentId: formData.parentId && formData.parentId !== "none" ? formData.parentId : undefined,
      };

      if (editingCategory) {
        await updateCategory({
          id: editingCategory._id,
          ...submissionData,
        }).unwrap();
        toast.success('Category updated successfully');
      } else {
        await createCategory(submissionData).unwrap();
        toast.success('Category created successfully');
      }
      handleCloseDialog();
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Operation failed');
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteCategory(id).unwrap();
      toast.success('Category deleted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete category');
    }
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleOpenAttributesDialog = (category: ProductCategory) => {
    setSelectedCategoryForAttributes(category);
    if (category.attributes && category.attributes.length > 0) {
      setAttributes(category.attributes);
    } else {
      setAttributes([{ name: '', type: 'text', required: false, unit: '', options: [] }]);
    }
    setIsAttributesDialogOpen(true);
  };

  const handleCloseAttributesDialog = () => {
    setIsAttributesDialogOpen(false);
    setSelectedCategoryForAttributes(null);
    setAttributes([{ name: '', type: 'text', required: false, unit: '', options: [] }]);
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { name: '', type: 'text', required: false, unit: '', options: [] }]);
  };

  const handleRemoveAttribute = (index: number) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    setAttributes(newAttributes);
  };

  const handleAttributeChange = (index: number, field: keyof CategoryAttribute, value: any) => {
    const newAttributes = [...attributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    setAttributes(newAttributes);
  };

  const handleSaveAttributes = async () => {
    if (!selectedCategoryForAttributes) return;

    try {
      await addCategoryAttributes({
        id: selectedCategoryForAttributes._id,
        attributes: attributes.filter(attr => attr.name.trim() !== '')
      }).unwrap();
      toast.success('Attributes saved successfully');
      handleCloseAttributesDialog();
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save attributes');
    }
  };

  const renderCategoryTree = (categories: ProductCategory[], level = 0) => {
    return categories.map((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.has(category._id);

      return (
        <div key={category._id} className="border-l-2 border-border pl-4 mt-2">
          <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-md hover:bg-accent group">
            <div className="flex items-center gap-2 flex-1">
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(category._id)}
                  className="p-1 hover:bg-background rounded"
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              )}
              {!hasChildren && <div className="w-6" />}

              <FolderTree className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{category.name}</span>
                  <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                    {category.status}
                  </Badge>
                  {category.attributes && category.attributes.length > 0 && (
                    <Badge variant="outline">{category.attributes.length} attributes</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{category.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenDialog(undefined, category._id)}
                title="Add Subcategory"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenAttributesDialog(category)}
                title="Manage Attributes"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenDialog(category)}
                title="Edit Category"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(category._id)}
                title="Delete Category"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          {isExpanded && hasChildren && (
            <div className="ml-4 mt-1">
              {renderCategoryTree(category.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // Create a map of all categories for parent selection
  const createCategoryOptions = (categories: ProductCategory[], level = 0): JSX.Element[] => {
    let options: JSX.Element[] = [];

    categories.forEach((category) => {
      options.push(
        <SelectItem key={category._id} value={category._id}>
          {'  '.repeat(level) + category.name}
        </SelectItem>
      );

      if (category.children && category.children.length > 0) {
        options = [...options, ...createCategoryOptions(category.children, level + 1)];
      }
    });

    return options;
  };

  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Product Categories</h1>
            <p className="text-muted-foreground mt-1">
              Manage product categories and their hierarchical structure
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Category Tree</CardTitle>
            <CardDescription>
              View and manage the hierarchical structure of product categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No categories yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first product category to get started
                </p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Category
                </Button>
              </div>
            ) : (
              <div className="space-y-1">{renderCategoryTree(categories)}</div>
            )}
          </CardContent>
        </Card>

        {/* Category Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? 'Update the category information'
                  : 'Add a new product category'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Electrical Equipment"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the category"
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="parentId">Parent Category</Label>
                <Select
                  value={formData.parentId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root Category)</SelectItem>
                    {createCategoryOptions(categories)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="icon">Icon URL</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="Icon URL"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Image URL"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name || !formData.description}>
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Attributes Management Dialog */}
        <Dialog open={isAttributesDialogOpen} onOpenChange={setIsAttributesDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Manage Attributes for {selectedCategoryForAttributes?.name}
              </DialogTitle>
              <DialogDescription>
                Define product attributes that will be available for all products in this category
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {attributes.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-gray-500 mb-2">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium">No attributes yet</h3>
                    <p className="text-sm">Add your first attribute to define product specifications</p>
                  </div>
                  <Button onClick={handleAddAttribute} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Attribute
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Product Attributes ({attributes.length})</h3>
                    <Button onClick={handleAddAttribute} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Attribute
                    </Button>
                  </div>

                  {attributes.map((attribute, index) => (
                    <Card key={index} className="border shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base flex items-center gap-2">
                            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                              {index + 1}
                            </span>
                            {attribute.name || `Attribute ${index + 1}`}
                          </CardTitle>
                          {attributes.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAttribute(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`attribute-name-${index}`} className="text-sm font-medium">
                              Attribute Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id={`attribute-name-${index}`}
                              value={attribute.name}
                              onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                              placeholder="e.g., Voltage, Color, Size"
                              className="w-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`attribute-type-${index}`} className="text-sm font-medium">
                              Input Type <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={attribute.type}
                              onValueChange={(value) => handleAttributeChange(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select input type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text Input</SelectItem>
                                <SelectItem value="number">Number Input</SelectItem>
                                <SelectItem value="select">Single Select (Dropdown)</SelectItem>
                                <SelectItem value="multiselect">Multi Select (Checkboxes)</SelectItem>
                                <SelectItem value="boolean">Yes/No (Toggle)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`attribute-required-${index}`}
                            checked={attribute.required}
                            onChange={(e) => handleAttributeChange(index, 'required', e.target.checked)}
                            className="rounded h-4 w-4"
                          />
                          <Label htmlFor={`attribute-required-${index}`} className="text-sm">
                            This attribute is required for all products in this category
                          </Label>
                        </div>

                        {attribute.type === 'number' && (
                          <div className="space-y-2">
                            <Label htmlFor={`attribute-unit-${index}`} className="text-sm font-medium">
                              Unit of Measurement (Optional)
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id={`attribute-unit-${index}`}
                                value={attribute.unit || ''}
                                onChange={(e) => handleAttributeChange(index, 'unit', e.target.value)}
                                placeholder="e.g., V, kg, cm, inches"
                                className="flex-1"
                              />
                              <div className="bg-gray-100 px-3 py-2 rounded-md text-sm text-gray-600">
                                Examples: V, kg, cm, inches, %
                              </div>
                            </div>
                          </div>
                        )}

                        {(attribute.type === 'select' || attribute.type === 'multiselect') && (
                          <div className="space-y-2">
                            <Label htmlFor={`attribute-options-${index}`} className="text-sm font-medium">
                              Options <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id={`attribute-options-${index}`}
                              value={attribute.options ? attribute.options.join(', ') : ''}
                              onChange={(e) => handleAttributeChange(index, 'options', e.target.value.split(',').map(opt => opt.trim()))}
                              placeholder="Enter options separated by commas. Example: Red, Blue, Green"
                              rows={3}
                              className="w-full"
                            />
                            <p className="text-xs text-gray-500">
                              {attribute.type === 'select'
                                ? "Users will be able to select one option from a dropdown menu."
                                : "Users will be able to select multiple options using checkboxes."}
                            </p>
                          </div>
                        )}

                        {attribute.type === 'text' && (
                          <div className="bg-blue-50 p-3 rounded-md">
                            <p className="text-sm text-blue-700">
                              <strong>Text Input:</strong> Users will be able to enter any text value for this attribute.
                            </p>
                          </div>
                        )}

                        {attribute.type === 'boolean' && (
                          <div className="bg-green-50 p-3 rounded-md">
                            <p className="text-sm text-green-700">
                              <strong>Yes/No Toggle:</strong> Users will be able to select either Yes or No for this attribute.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button variant="outline" onClick={handleCloseAttributesDialog}>
                Cancel
              </Button>
              <Button onClick={handleSaveAttributes} disabled={attributes.length === 0 || !attributes.some(attr => attr.name.trim() !== '')}>
                Save Attributes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
};

export default ProductCategoryManagement;