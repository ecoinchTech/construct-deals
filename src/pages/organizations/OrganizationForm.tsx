import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCreateOrganizationMutation, useUpdateOrganizationMutation, useGetOrganizationQuery } from '@/store/api/organizationApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CreateOrganizationRequest } from '@/types/organization.types';

const OrganizationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: orgData } = useGetOrganizationQuery(id!, { skip: !id });
  const [createOrganization, { isLoading: isCreating }] = useCreateOrganizationMutation();
  const [updateOrganization, { isLoading: isUpdating }] = useUpdateOrganizationMutation();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateOrganizationRequest>({
    defaultValues: {
      defaultCurrency: 'INR',
    },
  });

  const selectedCurrency = watch('defaultCurrency');

  useEffect(() => {
    if (orgData?.data.organization) {
      const org = orgData.data.organization;
      setValue('name', org.name);
      setValue('gstNumber', org.gstNumber);
      setValue('address', org.address);
      setValue('defaultCurrency', org.defaultCurrency);
    }
  }, [orgData, setValue]);

  const onSubmit = async (data: CreateOrganizationRequest) => {
    try {
      if (isEdit && id) {
        await updateOrganization({ id, ...data }).unwrap();
        toast.success('Organization updated successfully');
      } else {
        const response = await createOrganization(data).unwrap();
        toast.success('Organization created successfully');
        navigate(`/organizations/${response.data.organization.id}`);
        return;
      }
      navigate(`/organizations/${id}`);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save organization');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/organizations')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {isEdit ? 'Edit Organization' : 'New Organization'}
              </h1>
              <p className="text-muted-foreground">
                {isEdit ? 'Update organization details' : 'Create a new organization profile'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Enter the basic information about your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  placeholder="ABC Developers Ltd."
                  {...register('name', { required: 'Organization name is required' })}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  placeholder="22ABCDE1234Z1A"
                  {...register('gstNumber', { required: 'GST number is required' })}
                />
                {errors.gstNumber && (
                  <p className="text-sm text-destructive">{errors.gstNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Business Park, City"
                  {...register('address', { required: 'Address is required' })}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select
                  value={selectedCurrency}
                  onValueChange={(value) => setValue('defaultCurrency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1"
                >
                  {isCreating || isUpdating
                    ? 'Saving...'
                    : isEdit
                    ? 'Update Organization'
                    : 'Create Organization'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/organizations')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OrganizationForm;
