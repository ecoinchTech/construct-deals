import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  useGetProductCategoryTreeQuery,
  useCreateProductCategoryMutation,
  useUpdateProductCategoryMutation,
  useDeleteProductCategoryMutation,
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
import { Plus, Pencil, Trash2, FolderTree, ChevronRight, ChevronDown } from 'lucide-react';
import RoleGuard from '@/components/common/RoleGuard';
import { UserRole } from '@/types/auth.types';
import { ProductCategory } from '@/types/product.types';

const ProductCategoryManagement = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, isLoading } = useGetProductCategoryTreeQuery({});
  const [createCategory] = useCreateProductCategoryMutation();
  const [updateCategory] = useUpdateProductCategoryMutation();
  const [deleteCategory] = useDeleteProductCategoryMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
    icon: '',
    image: '',
    status: 'active' as 'active' | 'inactive',
  });

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
      if (editingCategory) {
        await updateCategory({
          id: editingCategory._id,
          ...formData,
        }).unwrap();
        toast.success('Category updated successfully');
      } else {
        await createCategory(formData).unwrap();
        toast.success('Category created successfully');
      }
      handleCloseDialog();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteCategory(id).unwrap();
      toast.success('Category deleted successfully');
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
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenDialog(category)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(category._id)}
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
              <Button onClick={handleSubmit}>
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
};

export default ProductCategoryManagement;
