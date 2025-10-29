import { useEffect } from 'react';
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
import { Loader2, Building2, MapPin, FileText, Globe } from 'lucide-react';

const VendorProfile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: vendorData } = useGetVendorQuery(user?.id || '', { skip: !user?.id });
  const { data: categoriesData } = useGetCategoriesQuery();
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CreateVendorRequest>();
  const vendor = vendorData?.data?.vendor;

  useEffect(() => {
    if (vendor) {
      setValue('companyName', vendor.companyName);
      setValue('gstNumber', vendor.gstNumber);
      setValue('panNumber', vendor.panNumber);
      setValue('profileSummary', vendor.profileSummary);
      setValue('serviceCities', vendor.serviceCities);
      setValue('categories', vendor.categories);
      setValue('portfolioUrls', vendor.portfolioUrls);
    }
  }, [vendor, setValue]);

  const onSubmit = async (data: CreateVendorRequest) => {
    try {
      if (vendor) {
        await updateVendor({ id: vendor.id, ...data }).unwrap();
        toast.success('Vendor profile updated successfully');
      } else {
        await createVendor(data).unwrap();
        toast.success('Vendor profile created successfully');
      }
      navigate('/vendor/kyc');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save vendor profile');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vendor Profile</h1>
        <p className="text-muted-foreground mt-2">
          {vendor ? 'Update your vendor profile information' : 'Create your vendor profile to start receiving RFQs'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  placeholder="22ABCDE1234Z1A"
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

            <div>
              <Label htmlFor="categories">Categories (comma-separated) *</Label>
              <Input
                id="categories"
                {...register('categories', {
                  required: 'At least one category is required',
                  setValueAs: (v) => v.split(',').map((s: string) => s.trim()).filter(Boolean),
                })}
                placeholder="HVAC, Electrical, Plumbing"
              />
              {errors.categories && (
                <p className="text-sm text-destructive mt-1">{errors.categories.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="serviceCities">Service Cities (comma-separated) *</Label>
              <Input
                id="serviceCities"
                {...register('serviceCities', {
                  required: 'At least one service city is required',
                  setValueAs: (v) => v.split(',').map((s: string) => s.trim()).filter(Boolean),
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
                  setValueAs: (v) => v ? v.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
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
