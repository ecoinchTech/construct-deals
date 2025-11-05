import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useCreateRFQMutation } from '@/store/api/rfqApi';
import { useGetBuildingsQuery } from '@/store/api/buildingApi';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import { CreateRFQRequest, BOQItem, EligibilityCriteria } from '@/types/rfq.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, FileText, Building, Calendar, DollarSign } from 'lucide-react';
import React from 'react';

const RFQForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { data: buildingsData } = useGetBuildingsQuery({ page: 1, limit: 100 });
  const { data: categoriesData } = useGetCategoriesQuery();
  const [createRFQ, { isLoading }] = useCreateRFQMutation();

  const { register, handleSubmit, formState: { errors }, control, setValue, watch } = useForm<CreateRFQRequest>({
    defaultValues: {
      visibility: 'public',
      evaluationWeights: {
        priceWeight: 50,
        timelineWeight: 20,
        ratingWeight: 20,
        certificationWeight: 10,
        maxPrice: 0,
        maxTimeline: 90
      },
      boqItems: [{ description: '', unit: '', quantity: 0 }],
      eligibilityCriteria: []
    },
  });

  const { fields: boqFields, append: appendBOQ, remove: removeBOQ } = useFieldArray({
    control,
    name: 'boqItems',
  });

  const { fields: criteriaFields, append: appendCriteria, remove: removeCriteria } = useFieldArray({
    control,
    name: 'eligibilityCriteria',
  });

  const buildings = buildingsData?.data?.buildings || [];
  const categories = categoriesData?.data?.categories || [];

alert(buildings);
alert(categories);

  const watchBudgetMax = watch('estBudgetMax');

  // Update maxPrice when budget changes
  React.useEffect(() => {
    if (watchBudgetMax) {
      setValue('evaluationWeights.maxPrice', watchBudgetMax);
    }
  }, [watchBudgetMax, setValue]);

  const onSubmit = async (data: CreateRFQRequest) => {
    try {
       const result = await createRFQ(data).unwrap();
    toast.success('RFQ created successfully');
    navigate(`/rfqs/${result.data.rfq._id}`);
  } catch (error: any) {
    toast.error(error?.data?.message || 'Failed to create RFQ');
  }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>Provide the essential details for your RFQ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">RFQ Title *</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="e.g., HVAC System Installation"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              placeholder="Detailed description of the project requirements..."
              rows={5}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buildingId">Building *</Label>
              <Select onValueChange={(value) => setValue('buildingId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select building" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building._id} value={building._id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.buildingId && (
                <p className="text-sm text-destructive mt-1">Building is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="categoryId">Category *</Label>
              <Select onValueChange={(value) => setValue('categoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-destructive mt-1">Category is required</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estBudgetMin">Minimum Budget *</Label>
              <Input
                id="estBudgetMin"
                type="number"
                {...register('estBudgetMin', { 
                  required: 'Minimum budget is required',
                  valueAsNumber: true,
                })}
                placeholder="100000"
              />
              {errors.estBudgetMin && (
                <p className="text-sm text-destructive mt-1">{errors.estBudgetMin.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="estBudgetMax">Maximum Budget *</Label>
              <Input
                id="estBudgetMax"
                type="number"
                {...register('estBudgetMax', { 
                  required: 'Maximum budget is required',
                  valueAsNumber: true,
                })}
                placeholder="150000"
              />
              {errors.estBudgetMax && (
                <p className="text-sm text-destructive mt-1">{errors.estBudgetMax.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="closeDate">Close Date *</Label>
              <Input
                id="closeDate"
                type="datetime-local"
                {...register('closeDate', { required: 'Close date is required' })}
              />
              {errors.closeDate && (
                <p className="text-sm text-destructive mt-1">{errors.closeDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="preBidQueryDeadline">Pre-Bid Query Deadline</Label>
              <Input
                id="preBidQueryDeadline"
                type="datetime-local"
                {...register('preBidQueryDeadline')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="visibility">Visibility *</Label>
            <Select onValueChange={(value) => setValue('visibility', value as 'public' | 'private')} defaultValue="public">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => setStep(2)}>
          Next: Bill of Quantities
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bill of Quantities (BOQ)</CardTitle>
          <CardDescription>Define the items and quantities for this project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {boqFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Item {index + 1}</h4>
                {boqFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBOQ(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Description *</Label>
                  <Input
                    {...register(`boqItems.${index}.description`, { required: 'Description is required' })}
                    placeholder="Item description"
                  />
                </div>
                <div>
                  <Label>Unit *</Label>
                  <Input
                    {...register(`boqItems.${index}.unit`, { required: 'Unit is required' })}
                    placeholder="e.g., sqft, nos"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    {...register(`boqItems.${index}.quantity`, { 
                      required: 'Quantity is required',
                      valueAsNumber: true,
                    })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Baseline Rate</Label>
                  <Input
                    type="number"
                    {...register(`boqItems.${index}.unitPrice`, { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label>Specifications</Label>
                <Textarea
                  {...register(`boqItems.${index}.spec` as any)}
                  placeholder="Technical specifications..."
                  rows={2}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => appendBOQ({ description: '', unit: '', quantity: 0 })}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add BOQ Item
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evaluation Criteria</CardTitle>
          <CardDescription>Set weights for different evaluation parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="priceWeight">Price Weight (%)</Label>
              <Input
                id="priceWeight"
                type="number"
                {...register('evaluationWeights.priceWeight', { 
                  required: 'Price weight is required',
                  valueAsNumber: true,
                  min: 0,
                  max: 100
                })}
              />
            </div>
            <div>
              <Label htmlFor="timelineWeight">Timeline Weight (%)</Label>
              <Input
                id="timelineWeight"
                type="number"
                {...register('evaluationWeights.timelineWeight', { 
                  required: 'Timeline weight is required',
                  valueAsNumber: true,
                  min: 0,
                  max: 100
                })}
              />
            </div>
            <div>
              <Label htmlFor="ratingWeight">Rating Weight (%)</Label>
              <Input
                id="ratingWeight"
                type="number"
                {...register('evaluationWeights.ratingWeight', { 
                  required: 'Rating weight is required',
                  valueAsNumber: true,
                  min: 0,
                  max: 100
                })}
              />
            </div>
            <div>
              <Label htmlFor="certificationWeight">Certification Weight (%)</Label>
              <Input
                id="certificationWeight"
                type="number"
                {...register('evaluationWeights.certificationWeight', { 
                  required: 'Certification weight is required',
                  valueAsNumber: true,
                  min: 0,
                  max: 100
                })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxTimeline">Maximum Timeline (Days)</Label>
              <Input
                id="maxTimeline"
                type="number"
                {...register('evaluationWeights.maxTimeline', { 
                  required: 'Max timeline is required',
                  valueAsNumber: true,
                })}
              />
            </div>
            <div>
              <Label htmlFor="maxPrice">Maximum Price</Label>
              <Input
                id="maxPrice"
                type="number"
                {...register('evaluationWeights.maxPrice', { 
                  required: 'Max price is required',
                  valueAsNumber: true,
                })}
                value={watchBudgetMax || ''}
                readOnly
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          Previous
        </Button>
        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create RFQ
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Request for Quotation</h1>
        <p className="text-muted-foreground mt-2">
          Step {step} of 2
        </p>
      </div>

      <div className="flex gap-2">
        <div className={`flex-1 h-2 rounded ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`flex-1 h-2 rounded ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
      </div>

      {step === 1 ? renderStep1() : renderStep2()}
    </div>
  );
};

export default RFQForm;