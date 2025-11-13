import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useCreateRFQMutation } from '@/store/api/rfqApi';
import { useGetBuildingsQuery } from '@/store/api/buildingApi';
import { useGetCategoriesQuery } from '@/store/api/categoryApi';
import { useGetTenderTemplatesQuery } from '@/store/api/tenderTemplateApi';
import { CreateRFQRequest, EligibilityCriteria, TechnicalSpecification } from '@/types/rfq.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, FileText, Building, Calendar, DollarSign, Shield, CheckSquare } from 'lucide-react';
import React from 'react';

const RFQFormEnhanced = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const { data: buildingsData } = useGetBuildingsQuery({ page: 1, limit: 100 });
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: templatesData } = useGetTenderTemplatesQuery();
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
      boqItems: [{ description: '', unit: '', quantity: 0, baselineRate: 0 }],
      eligibilityCriteria: [{ title: '', description: '', type: 'mandatory' }],
      technicalSpecifications: [{ title: '', description: '', isMandatory: true }],
    },
  });

  const { fields: boqFields, append: appendBoq, remove: removeBoq } = useFieldArray({
    control,
    name: 'boqItems',
  });

  const { fields: criteriaFields, append: appendCriteria, remove: removeCriteria } = useFieldArray({
    control,
    name: 'eligibilityCriteria',
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: 'technicalSpecifications',
  });

  const buildings = buildingsData?.data?.buildings || [];
  const categories = categoriesData?.data?.categories || [];
  const templates = templatesData?.data?.templates || [];

const onSubmit = async (data: CreateRFQRequest) => {
  try {
    // Validate that buildingId and categoryId are present
    if (!data.buildingId) {
      toast.error('Please select a building');
      return;
    }
    if (!data.categoryId) {
      toast.error('Please select a category');
      return;
    }

    // Transform data to match backend API structure - use buildingId and categoryId as per Postman
    const payload = {
      title: data.title,
      description: data.description,
      buildingId: data.buildingId, // Use buildingId (not building)
      categoryId: data.categoryId, // Use categoryId (not category)
      estBudgetMin: data.estBudgetMin,
      estBudgetMax: data.estBudgetMax,
      closeDate: data.closeDate,
      preBidQueryDeadline: data.preBidQueryDeadline,
      visibility: data.visibility,
      tenderDocumentTemplate: data.tenderDocumentTemplate,
      eligibilityCriteria: data.eligibilityCriteria.filter(criteria => 
        criteria.title && criteria.description // Remove empty criteria
      ),
      technicalSpecifications: data.technicalSpecifications.filter(spec => 
        spec.title && spec.description // Remove empty specs
      ),
      evaluationWeights: {
        ...data.evaluationWeights,
        maxPrice: data.estBudgetMax // Set maxPrice from estBudgetMax
      },
      boqItems: data.boqItems.map(item => ({
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        baselineRate: item.baselineRate || 0,
        spec: item.spec || ''
      }))
    };

    console.log('Submitting RFQ:', payload);
    const result = await createRFQ(payload).unwrap();
    toast.success('RFQ created successfully');
    navigate(`/rfqs/${result.data.rfq._id}`);
  } catch (error: any) {
    console.error('RFQ creation error:', error);
    toast.error(error?.data?.message || 'Failed to create RFQ');
  }
};

// Add this effect to update maxPrice when budget changes
React.useEffect(() => {
  const budgetMax = watch('estBudgetMax');
  if (budgetMax) {
    setValue('evaluationWeights.maxPrice', budgetMax);
  }
}, [watch('estBudgetMax'), setValue]);


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
                <p className="text-sm text-destructive mt-1">{errors.buildingId.message}</p>
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
                <p className="text-sm text-destructive mt-1">{errors.categoryId.message}</p>
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
              <p className="text-xs text-muted-foreground mt-1">
                Vendors can ask questions until this date
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="tenderDocumentTemplate">Tender Document Template (Optional)</Label>
            <Select onValueChange={(value) => setValue('tenderDocumentTemplate', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template or skip" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template._id} value={template._id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Select a pre-defined template to standardize RFQ documentation
            </p>
          </div>

          <div>
            <Label htmlFor="visibility">Visibility *</Label>
            <Select onValueChange={(value) => setValue('visibility', value as 'public' | 'private')} defaultValue="public">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Visible to all vendors</SelectItem>
                <SelectItem value="private">Private - Invite only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleNextToStep2}>
          Next: Eligibility & Specifications
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Eligibility Criteria
          </CardTitle>
          <CardDescription>Define vendor qualification requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {criteriaFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Criterion {index + 1}</h4>
                {criteriaFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCriteria(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Label>Title *</Label>
                  <Input
                    {...register(`eligibilityCriteria.${index}.title`, { required: true })}
                    placeholder="e.g., Minimum 5 Years Experience"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Description *</Label>
                  <Textarea
                    {...register(`eligibilityCriteria.${index}.description`, { required: true })}
                    placeholder="Detailed explanation of this requirement..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Type *</Label>
                  <Select
                    onValueChange={(value) => setValue(`eligibilityCriteria.${index}.type`, value as 'mandatory' | 'preferable')}
                    defaultValue="mandatory"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mandatory">Mandatory</SelectItem>
                      <SelectItem value="preferable">Preferable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => appendCriteria({ title: '', description: '', type: 'mandatory' })}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Eligibility Criterion
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Technical Specifications
          </CardTitle>
          <CardDescription>Define technical requirements for the project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {specFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Specification {index + 1}</h4>
                {specFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSpec(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label>Title *</Label>
                  <Input
                    {...register(`technicalSpecifications.${index}.title`, { required: true })}
                    placeholder="e.g., Equipment Warranty"
                  />
                </div>
                <div>
                  <Label>Description *</Label>
                  <Textarea
                    {...register(`technicalSpecifications.${index}.description`, { required: true })}
                    placeholder="Detailed technical requirement..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register(`technicalSpecifications.${index}.isMandatory`)}
                    id={`spec-mandatory-${index}`}
                    className="h-4 w-4"
                  />
                  <Label htmlFor={`spec-mandatory-${index}`}>This is a mandatory requirement</Label>
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => appendSpec({ title: '', description: '', isMandatory: true })}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Technical Specification
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          Previous
        </Button>
        <Button onClick={handleNextToStep3}>
          Next: Bill of Quantities
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
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
                    onClick={() => removeBoq(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Label>Description *</Label>
                  <Input
                    {...register(`boqItems.${index}.description`, { required: 'Description is required' })}
                    placeholder="Item description"
                  />
                  {errors.boqItems?.[index]?.description && (
                    <p className="text-sm text-destructive mt-1">{errors.boqItems[index]?.description?.message}</p>
                  )}
                </div>
                <div>
                  <Label>Unit *</Label>
                  <Input
                    {...register(`boqItems.${index}.unit`, { required: 'Unit is required' })}
                    placeholder="e.g., sqft, nos"
                  />
                  {errors.boqItems?.[index]?.unit && (
                    <p className="text-sm text-destructive mt-1">{errors.boqItems[index]?.unit?.message}</p>
                  )}
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
                      min: { value: 1, message: 'Quantity must be at least 1' }
                    })}
                    placeholder="0"
                  />
                  {errors.boqItems?.[index]?.quantity && (
                    <p className="text-sm text-destructive mt-1">{errors.boqItems[index]?.quantity?.message}</p>
                  )}
                </div>
                <div>
                  <Label>Baseline Rate *</Label>
                  <Input
                    type="number"
                    {...register(`boqItems.${index}.baselineRate`, {
                      required: 'Baseline rate is required',
                      valueAsNumber: true,
                      min: { value: 0, message: 'Rate cannot be negative' }
                    })}
                    placeholder="0"
                  />
                  {errors.boqItems?.[index]?.baselineRate && (
                    <p className="text-sm text-destructive mt-1">{errors.boqItems[index]?.baselineRate?.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Specifications (Optional)</Label>
                <Input
                  {...register(`boqItems.${index}.spec`)}
                  placeholder="Technical specifications..."
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => appendBoq({ description: '', unit: '', quantity: 0, baselineRate: 0 })}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add BOQ Item
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>
          Previous
        </Button>
        <Button onClick={handleSubmit(onSubmit)} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create RFQ
        </Button>
      </div>
    </div>

  );

// Update navigation validation to check for the correct field names
const handleNextToStep2 = () => {
  const basicFields = watch(['title', 'description', 'buildingId', 'categoryId', 'estBudgetMin', 'estBudgetMax', 'closeDate']);
  
  if (!basicFields[0] || !basicFields[1] || !basicFields[2] || !basicFields[3] || !basicFields[4] || !basicFields[5] || !basicFields[6]) {
    toast.error('Please fill all required fields in Basic Information');
    return;
  }
  setStep(2);
};


  const handleNextToStep3 = () => {
    setStep(3);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Request for Quotation</h1>
        <p className="text-muted-foreground mt-2">
          Step {step} of 3
        </p>
      </div>

      <div className="flex gap-2">
        <div className={`flex-1 h-2 rounded ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`flex-1 h-2 rounded ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`flex-1 h-2 rounded ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default RFQFormEnhanced;
