import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCreateBuildingMutation, useUpdateBuildingMutation, useGetBuildingQuery } from '@/store/api/buildingApi';
import { useGetOrganizationsQuery } from '@/store/api/organizationApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Building, ArrowLeft, X } from 'lucide-react';
import { CreateBuildingRequest } from '@/types/building.types';

const BuildingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const { data: buildingData } = useGetBuildingQuery(id!, { skip: !id });
  const { data: orgsData } = useGetOrganizationsQuery({ page: 1, limit: 100 });
  const [createBuilding, { isLoading: isCreating }] = useCreateBuildingMutation();
  const [updateBuilding, { isLoading: isUpdating }] = useUpdateBuildingMutation();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateBuildingRequest>();

  const selectedOrgId = watch('organizationId');
  const selectedType = watch('buildingType');

  useEffect(() => {
    if (buildingData?.data.building) {
      const building = buildingData.data.building;
      setValue('name', building.name);
      setValue('organizationId', building.organizationId);
      setValue('address', building.address);
      setValue('geo.lat', building.geo.lat);
      setValue('geo.lng', building.geo.lng);
      setValue('floorArea', building.floorArea);
      setValue('buildingType', building.buildingType);
      setTags(building.tags);
    }
  }, [buildingData, setValue]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: CreateBuildingRequest) => {
    const payload = { ...data, tags };

    try {
      if (isEdit && id) {
        await updateBuilding({ id, ...payload }).unwrap();
        toast.success('Building updated successfully');
      } else {
        const response = await createBuilding(payload).unwrap();
        toast.success('Building created successfully');
        navigate(`/buildings/${response.data.building._id}`);
        return;
      }
      navigate(`/buildings/${id}`);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save building');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/buildings')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Buildings
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg gradient-secondary flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {isEdit ? 'Edit Building' : 'New Building'}
              </h1>
              <p className="text-muted-foreground">
                {isEdit ? 'Update building details' : 'Add a new property to your portfolio'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Building Details</CardTitle>
            <CardDescription>
              Enter the information about the property
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="organizationId">Organization</Label>
                <Select
                  value={selectedOrgId}
                  onValueChange={(value) => setValue('organizationId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {orgsData?.data.organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.organizationId && (
                  <p className="text-sm text-destructive">{errors.organizationId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Building Name</Label>
                <Input
                  id="name"
                  placeholder="Alpha Tower"
                  {...register('name', { required: 'Building name is required' })}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 MG Road, City"
                  {...register('address', { required: 'Address is required' })}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    placeholder="12.9716"
                    {...register('geo.lat', { 
                      required: 'Latitude is required',
                      valueAsNumber: true 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    placeholder="77.5946"
                    {...register('geo.lng', { 
                      required: 'Longitude is required',
                      valueAsNumber: true 
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="floorArea">Floor Area (sq ft)</Label>
                <Input
                  id="floorArea"
                  type="number"
                  placeholder="25000"
                  {...register('floorArea', { 
                    required: 'Floor area is required',
                    valueAsNumber: true 
                  })}
                />
                {errors.floorArea && (
                  <p className="text-sm text-destructive">{errors.floorArea.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="buildingType">Building Type</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => setValue('buildingType', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="mixed">Mixed Use</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Add a tag (e.g., office, retail)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
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
                    ? 'Update Building'
                    : 'Create Building'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/buildings')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  );
};

export default BuildingForm;
