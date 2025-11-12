import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useCreateVendorMutation, useUpdateVendorMutation, useGetVendorQuery } from '@/store/api/vendorApi';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import { CreateVendorRequest } from '@/types/vendor.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Building2, FileText, ChevronDown, ChevronRight, Check } from 'lucide-react';

const VendorProfile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: vendorData, isLoading: isVendorLoading } = useGetVendorQuery(user?.id || '', {
    skip: !user?.id,
  });

  const { data: categoriesResponse } = useGetCategoriesQuery();
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CreateVendorRequest>();
  const vendor = vendorData?.data?.vendor ?? null;
  const categories = categoriesResponse?.data?.categories || [];
  
  // State for expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  // Organize categories into parent-child structure
  const organizeCategories = () => {
    const parentCategories: any[] = [];
    const childCategoriesMap: Record<string, any[]> = {};

    // First pass: identify parent categories and create a map of child categories
    categories.forEach((cat: any) => {
      if (!cat.parentId) {
        parentCategories.push(cat);
      } else {
        const parentId = cat.parentId._id || cat.parentId;
        if (!childCategoriesMap[parentId]) {
          childCategoriesMap[parentId] = [];
        }
        childCategoriesMap[parentId].push(cat);
      }
    });

    // Second pass: attach children to their parents
    return parentCategories.map(parent => ({
      ...parent,
      children: childCategoriesMap[parent._id] || []
    }));
  };

  const organizedCategories = organizeCategories();

  // DEBUG
  useEffect(() => {
    console.log("🧠 Vendor data from API:", vendorData);
    console.log("🧠 Parsed vendor:", vendor);
  }, [vendorData]);

  // Pre-fill form fields when vendor exists
  useEffect(() => {
    if (vendor) {
      console.log("📥 Pre-filling vendor form with:", vendor);
      setValue('companyName', vendor.companyName || '');
      setValue('gstNumber', vendor.gstNumber || '');
      setValue('panNumber', vendor.panNumber || '');
      setValue('profileSummary', vendor.profileSummary || '');

      setValue('serviceCities', Array.isArray(vendor.serviceCities)
        ? vendor.serviceCities.join(', ')
        : '');

      setValue('portfolioUrls', Array.isArray(vendor.portfolioUrls)
        ? vendor.portfolioUrls.join(', ')
        : '');

      const vendorCategories = Array.isArray(vendor.categories)
        ? vendor.categories.map((c: any) => c.id || c._id)
        : [];
      
      setValue('categories', vendorCategories);
      setSelectedCategories(new Set(vendorCategories));
    }
  }, [vendor, setValue]);

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Toggle category selection
  const toggleCategorySelection = (categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
    setValue('categories', Array.from(newSelected));
  };

  const onSubmit = async (data: CreateVendorRequest) => {
    try {
      const payload = {
        ...data,
        categories: Array.isArray(data.categories)
          ? data.categories
          : typeof data.categories === 'string'
            ? data.categories.split(',').map((c) => c.trim())
            : [],
        serviceCities: typeof data.serviceCities === 'string'
          ? data.serviceCities.split(',').map((c) => c.trim())
          : data.serviceCities || [],
        portfolioUrls: typeof data.portfolioUrls === 'string'
          ? data.portfolioUrls.split(',').map((c) => c.trim())
          : data.portfolioUrls || [],
      };

      console.log("🚀 Submitting payload:", payload);
      console.log("🧠 Current vendor object:", vendor);

      // ✅ Fallback order: vendor?.id → vendor?._id → user?.id (if vendor not created yet)
      const vendorId = vendor?.id || vendor?._id || null;

      if (vendorId) {
        console.log("🧩 Updating vendor with ID:", vendorId);
        await updateVendor({ id: vendorId, ...payload }).unwrap();
        toast.success('Vendor profile updated successfully');
      } else {
        console.log("🧩 Creating new vendor (no vendor ID yet)");
        await createVendor(payload).unwrap();
        toast.success('Vendor profile created successfully');
      }

      navigate('/vendor/kyc');
    } catch (error: any) {
      console.error("❌ Vendor profile save error:", error);
      toast.error(error?.data?.message || 'Failed to save vendor profile');
    }
  };

  if (isVendorLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="ml-2 text-muted-foreground">Loading vendor profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vendor Profile</h1>
        <p className="text-muted-foreground mt-2">
          {vendor ? 'Update your vendor profile information' : 'Create your vendor profile to start receiving RFQs'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>Basic details about your company</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                {...register('companyName', { required: 'Company name is required' })}
                placeholder="Your Company Ltd."
              />
              {errors.companyName && (
                <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gstNumber">GST Number *</Label>
                <Input
                  id="gstNumber"
                  {...register('gstNumber', { required: 'GST number is required' })}
                  placeholder="24AAACC1206D1ZM"
                />
                {errors.gstNumber && (
                  <p className="text-sm text-destructive mt-1">{errors.gstNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="panNumber">PAN Number *</Label>
                <Input
                  id="panNumber"
                  {...register('panNumber', { required: 'PAN number is required' })}
                  placeholder="ABCDE1234F"
                />
                {errors.panNumber && (
                  <p className="text-sm text-destructive mt-1">{errors.panNumber.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Service Details
            </CardTitle>
            <CardDescription>Information about your services and expertise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="profileSummary">Profile Summary *</Label>
              <Textarea
                id="profileSummary"
                {...register('profileSummary', { required: 'Profile summary is required' })}
                placeholder="Describe your company's expertise and services..."
                rows={4}
              />
              {errors.profileSummary && (
                <p className="text-sm text-destructive mt-1">{errors.profileSummary.message}</p>
              )}
            </div>

            {/* Improved Category Selection */}
            <div>
              <Label>Service Categories *</Label>
              <div className="mt-2 border rounded-md p-2 max-h-64 overflow-y-auto">
                {organizedCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No categories available</p>
                ) : (
                  organizedCategories.map((parent: any) => (
                    <div key={parent._id} className="mb-2">
                      <div 
                        className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                        onClick={() => toggleCategoryExpansion(parent._id)}
                      >
                        {parent.children.length > 0 && (
                          expandedCategories.has(parent._id) ? 
                            <ChevronDown className="h-4 w-4 mr-1" /> : 
                            <ChevronRight className="h-4 w-4 mr-1" />
                        )}
                        <span className="font-medium">{parent.name}</span>
                      </div>
                      
                      {expandedCategories.has(parent._id) && parent.children.length > 0 && (
                        <div className="ml-6 mt-1">
                          {parent.children.map((child: any) => (
                            <div 
                              key={child._id} 
                              className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                              onClick={() => toggleCategorySelection(child._id)}
                            >
                              <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${
                                selectedCategories.has(child._id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                              }`}>
                                {selectedCategories.has(child._id) && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <span className="text-sm">{child.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              <input
                type="hidden"
                {...register('categories', { 
                  validate: () => selectedCategories.size > 0 || 'Select at least one category' 
                })}
              />
              {errors.categories && (
                <p className="text-sm text-destructive mt-1">{errors.categories.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Click on parent categories to expand and select relevant subcategories
              </p>
            </div>

            <div>
              <Label htmlFor="serviceCities">Service Cities (comma-separated) *</Label>
              <Input
                id="serviceCities"
                {...register('serviceCities', {
                  required: 'At least one service city is required',
                  setValueAs: (v) => {
                    if (typeof v === 'string') {
                      return v.split(',').map((s) => s.trim()).filter(Boolean);
                    }
                    if (Array.isArray(v)) return v;
                    return [];
                  },
                })}
                placeholder="Bangalore, Mumbai, Delhi"
              />
              {errors.serviceCities && (
                <p className="text-sm text-destructive mt-1">{errors.serviceCities.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="portfolioUrls">Portfolio URLs (comma-separated)</Label>
              <Input
                id="portfolioUrls"
                {...register('portfolioUrls', {
                  setValueAs: (v) => {
                    if (typeof v === 'string') {
                      return v.split(',').map((s) => s.trim()).filter(Boolean);
                    }
                    if (Array.isArray(v)) return v;
                    return [];
                  },
                })}
                placeholder="https://example.com, https://portfolio.com"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isCreating || isUpdating} className="flex-1">
            {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {vendor ? 'Update Profile' : 'Create Profile'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VendorProfile;