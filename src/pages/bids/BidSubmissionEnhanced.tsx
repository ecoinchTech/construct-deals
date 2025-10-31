import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useGetRFQQuery } from '@/store/api/rfqApi';
import { useCreateTechnicalBidMutation, useCreateFinancialBidMutation } from '@/store/api/bidApi';
import { CreateTechnicalBidRequest, CreateFinancialBidRequest, TeamMember, PastProject, BidBreakdownItem } from '@/types/bid.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, ArrowLeft, ArrowRight, Users, Briefcase, DollarSign, FileText } from 'lucide-react';

const BidSubmissionEnhanced = () => {
  const { rfqId } = useParams<{ rfqId: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const { data, isLoading } = useGetRFQQuery(rfqId!);
  const [createTechnicalBid, { isLoading: isSubmittingTechnical }] = useCreateTechnicalBidMutation();
  const [createFinancialBid, { isLoading: isSubmittingFinancial }] = useCreateFinancialBidMutation();

  const technicalForm = useForm<CreateTechnicalBidRequest>({
    defaultValues: {
      rfqId: rfqId!,
      methodology: '',
      warranty: '',
      leadTime: '',
      technicalApproach: '',
      teamComposition: [{ name: '', role: '' }],
      pastProjects: [{ title: '', client: '' }],
    },
  });

  const { fields: teamFields, append: appendTeam, remove: removeTeam } = useFieldArray({
    control: technicalForm.control,
    name: 'teamComposition',
  });

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control: technicalForm.control,
    name: 'pastProjects',
  });

  const financialForm = useForm<CreateFinancialBidRequest>({
    defaultValues: {
      rfqId: rfqId!,
      totalAmount: 0,
      timelineDays: 0,
      validityDays: 60,
      breakdown: data?.data?.rfq?.boqItems?.map(item => ({
        description: item.description,
        rate: 0,
        quantity: item.quantity,
        subtotal: 0,
      })) || [],
      paymentTerms: '',
    },
  });

  const { fields: breakdownFields, update: updateBreakdown } = useFieldArray({
    control: financialForm.control,
    name: 'breakdown',
  });

  const rfq = data?.data?.rfq;

  const onSubmitTechnical = async (formData: CreateTechnicalBidRequest) => {
    try {
      await createTechnicalBid(formData).unwrap();
      toast.success('Technical bid submitted successfully');
      setStep(2);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to submit technical bid');
    }
  };

  const onSubmitFinancial = async (formData: CreateFinancialBidRequest) => {
    try {
      const totalAmount = formData.breakdown.reduce((sum, item) => sum + item.subtotal, 0);
      await createFinancialBid({ ...formData, totalAmount }).unwrap();
      toast.success('Financial bid submitted successfully! Your complete bid has been submitted.');
      navigate(`/rfqs/${rfqId}`);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to submit financial bid');
    }
  };

  const calculateSubtotal = (index: number, rate: number) => {
    const breakdown = financialForm.getValues('breakdown');
    const quantity = breakdown[index]?.quantity || 0;
    const subtotal = rate * quantity;
    updateBreakdown(index, { ...breakdown[index], rate, subtotal });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!rfq) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">RFQ not found</p>
        </CardContent>
      </Card>
    );
  }

  const renderTechnicalBid = () => (
    <form onSubmit={technicalForm.handleSubmit(onSubmitTechnical)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Technical Approach
          </CardTitle>
          <CardDescription>Describe your technical methodology and approach</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="methodology">Methodology *</Label>
            <Textarea
              id="methodology"
              {...technicalForm.register('methodology', { required: 'Methodology is required' })}
              placeholder="Describe your project execution methodology..."
              rows={4}
            />
            {technicalForm.formState.errors.methodology && (
              <p className="text-sm text-destructive mt-1">{technicalForm.formState.errors.methodology.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="technicalApproach">Technical Approach *</Label>
            <Textarea
              id="technicalApproach"
              {...technicalForm.register('technicalApproach', { required: 'Technical approach is required' })}
              placeholder="Detail your technical approach and implementation plan..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="warranty">Warranty Period *</Label>
              <Input
                id="warranty"
                {...technicalForm.register('warranty', { required: 'Warranty is required' })}
                placeholder="e.g., 5 years comprehensive warranty"
              />
            </div>
            <div>
              <Label htmlFor="leadTime">Lead Time *</Label>
              <Input
                id="leadTime"
                {...technicalForm.register('leadTime', { required: 'Lead time is required' })}
                placeholder="e.g., 2 weeks for mobilization"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Composition
          </CardTitle>
          <CardDescription>List key team members for this project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Team Member {index + 1}</h4>
                {teamFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTeam(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Name *</Label>
                  <Input
                    {...technicalForm.register(`teamComposition.${index}.name`, { required: true })}
                    placeholder="Team member name"
                  />
                </div>
                <div>
                  <Label>Role *</Label>
                  <Input
                    {...technicalForm.register(`teamComposition.${index}.role`, { required: true })}
                    placeholder="e.g., Project Manager"
                  />
                </div>
              </div>
              <div>
                <Label>Experience (Optional)</Label>
                <Input
                  {...technicalForm.register(`teamComposition.${index}.experience`)}
                  placeholder="Years of experience or qualifications"
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendTeam({ name: '', role: '' })}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Past Projects
          </CardTitle>
          <CardDescription>Showcase relevant past project experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {projectFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Project {index + 1}</h4>
                {projectFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProject(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Project Title *</Label>
                  <Input
                    {...technicalForm.register(`pastProjects.${index}.title`, { required: true })}
                    placeholder="Project name"
                  />
                </div>
                <div>
                  <Label>Client Name *</Label>
                  <Input
                    {...technicalForm.register(`pastProjects.${index}.client`, { required: true })}
                    placeholder="Client organization"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Project Value (Optional)</Label>
                  <Input
                    type="number"
                    {...technicalForm.register(`pastProjects.${index}.value`, { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Completion Date (Optional)</Label>
                  <Input
                    type="date"
                    {...technicalForm.register(`pastProjects.${index}.completionDate`)}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => appendProject({ title: '', client: '' })}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Past Project
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => navigate(`/rfqs/${rfqId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmittingTechnical}>
          {isSubmittingTechnical && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue to Financial Bid
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );

  const renderFinancialBid = () => (
    <form onSubmit={financialForm.handleSubmit(onSubmitFinancial)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Bill of Quantities Pricing
          </CardTitle>
          <CardDescription>Provide rates for each BOQ item</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Item</th>
                  <th className="text-left p-2">Unit</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">Rate *</th>
                  <th className="text-right p-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {breakdownFields.map((field, index) => {
                  const rate = financialForm.watch(`breakdown.${index}.rate`);
                  const subtotal = financialForm.watch(`breakdown.${index}.subtotal`);
                  return (
                    <tr key={field.id} className="border-b">
                      <td className="p-2">{field.description}</td>
                      <td className="p-2">{rfq.boqItems[index]?.unit || '-'}</td>
                      <td className="p-2 text-right">{field.quantity}</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          {...financialForm.register(`breakdown.${index}.rate`, {
                            required: true,
                            valueAsNumber: true,
                            onChange: (e) => calculateSubtotal(index, parseFloat(e.target.value) || 0),
                          })}
                          className="text-right"
                        />
                      </td>
                      <td className="p-2 text-right font-medium">${subtotal?.toFixed(2) || '0.00'}</td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 font-bold">
                  <td colSpan={4} className="p-2 text-right">Total Amount:</td>
                  <td className="p-2 text-right text-xl">
                    ${financialForm.watch('breakdown')?.reduce((sum, item) => sum + (item.subtotal || 0), 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline & Validity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timelineDays">Project Timeline (Days) *</Label>
              <Input
                id="timelineDays"
                type="number"
                {...financialForm.register('timelineDays', {
                  required: 'Timeline is required',
                  valueAsNumber: true,
                })}
                placeholder="90"
              />
            </div>
            <div>
              <Label htmlFor="validityDays">Bid Validity (Days) *</Label>
              <Input
                id="validityDays"
                type="number"
                {...financialForm.register('validityDays', {
                  required: 'Validity is required',
                  valueAsNumber: true,
                })}
                placeholder="60"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...financialForm.register('paymentTerms', { required: 'Payment terms are required' })}
            placeholder="Describe your payment terms and schedule..."
            rows={4}
          />
          {financialForm.formState.errors.paymentTerms && (
            <p className="text-sm text-destructive mt-1">{financialForm.formState.errors.paymentTerms.message}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Technical Bid
        </Button>
        <Button type="submit" disabled={isSubmittingFinancial}>
          {isSubmittingFinancial && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Complete Bid
        </Button>
      </div>
    </form>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submit Bid - {rfq.title}</h1>
        <p className="text-muted-foreground mt-2">
          Step {step} of 2: {step === 1 ? 'Technical Proposal' : 'Financial Bid'}
        </p>
      </div>

      <div className="flex gap-2">
        <div className={`flex-1 h-2 rounded ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`flex-1 h-2 rounded ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
      </div>

      {step === 1 ? renderTechnicalBid() : renderFinancialBid()}
    </div>
  );
};

export default BidSubmissionEnhanced;
