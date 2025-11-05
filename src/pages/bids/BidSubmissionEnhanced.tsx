import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useGetRFQQuery } from '@/store/api/rfqApi';
import { useCreateTechnicalBidMutation, useCreateFinancialBidMutation, useCreateBidSecurityMutation, useGetBidsByRFQQuery } from '@/store/api/bidApi';
import { CreateTechnicalBidRequest, CreateFinancialBidRequest, CreateBidSecurityRequest } from '@/types/bid.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, ArrowLeft, Users, Briefcase, DollarSign, FileText, Shield, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const BidSubmissionEnhanced = () => {
  const { id: rfqId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('technical');

  const { data, isLoading } = useGetRFQQuery(rfqId!);
  const { data: bidsData, refetch: refetchBids } = useGetBidsByRFQQuery(rfqId!);
  const [createTechnicalBid, { isLoading: isSubmittingTechnical }] = useCreateTechnicalBidMutation();
  const [createFinancialBid, { isLoading: isSubmittingFinancial }] = useCreateFinancialBidMutation();
  const [createBidSecurity, { isLoading: isSubmittingBidSecurity }] = useCreateBidSecurityMutation();

  const rfq = data?.data?.rfq;
  const myBid = bidsData?.data?.bids?.find(bid => bid.rfqId === rfqId);

  const hasTechnicalBid = !!myBid?.technicalBid;
  const hasFinancialBid = !!myBid?.financialBid;
  const hasBidSecurity = !!myBid?.bidSecurity;

  const technicalForm = useForm<CreateTechnicalBidRequest>({
    defaultValues: {
      rfqId: rfqId!,
      methodology: myBid?.technicalBid?.methodology || '',
      warranty: myBid?.technicalBid?.warranty || '',
      leadTime: myBid?.technicalBid?.leadTime || '',
      technicalApproach: myBid?.technicalBid?.technicalApproach || '',
      teamComposition: myBid?.technicalBid?.teamComposition || [{ name: '', role: '' }],
      pastProjects: myBid?.technicalBid?.pastProjects || [{ title: '', client: '' }],
    },
  });

  useEffect(() => {
    if (myBid?.technicalBid) {
      technicalForm.reset({
        rfqId: rfqId!,
        methodology: myBid.technicalBid.methodology,
        warranty: myBid.technicalBid.warranty,
        leadTime: myBid.technicalBid.leadTime,
        technicalApproach: myBid.technicalBid.technicalApproach,
        teamComposition: myBid.technicalBid.teamComposition,
        pastProjects: myBid.technicalBid.pastProjects,
      });
    }
  }, [myBid, rfqId]);

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
      totalAmount: myBid?.financialBid?.totalAmount || 0,
      timelineDays: myBid?.financialBid?.timelineDays || 0,
      validityDays: myBid?.financialBid?.validityDays || 60,
      breakdown: myBid?.financialBid?.breakdown || [],
      paymentTerms: myBid?.financialBid?.paymentTerms || '',
    },
  });

  useEffect(() => {
    if (rfq?.boqId?.items && !myBid?.financialBid) {
      // Map BOQ items to breakdown with boqItemId
      const breakdown = rfq.boqId.items.map(item => ({
        boqItemId: item._id,  // Ensure this is included
        description: item.description,
        rate: 0,
        quantity: item.quantity,
        unit: item.unit,  // Include unit if needed
        subtotal: 0,
      }));
      financialForm.setValue('breakdown', breakdown);
    } else if (myBid?.financialBid) {
      // Ensure existing breakdown includes boqItemId
      const updatedBreakdown = myBid.financialBid.breakdown.map(item => ({
        ...item,
        boqItemId: item.boqItemId || `item_${Math.random().toString(36).substr(2, 9)}`, // Fallback ID if missing
      }));

      financialForm.reset({
        rfqId: rfqId!,
        totalAmount: myBid.financialBid.totalAmount,
        timelineDays: myBid.financialBid.timelineDays,
        validityDays: myBid.financialBid.validityDays,
        breakdown: updatedBreakdown,
        paymentTerms: myBid.financialBid.paymentTerms,
      });
    }
  }, [rfq, myBid, rfqId, financialForm]);

  const bidSecurityForm = useForm<CreateBidSecurityRequest>({
    defaultValues: {
      rfqId: rfqId!,
      type: myBid?.bidSecurity?.type || 'bank_guarantee',
      amount: myBid?.bidSecurity?.amount || 0,
      bankName: myBid?.bidSecurity?.bankName || '',
      guaranteeNumber: myBid?.bidSecurity?.guaranteeNumber || '',
      issueDate: myBid?.bidSecurity?.issueDate || '',
      expiryDate: myBid?.bidSecurity?.expiryDate || '',
    },
  });

  const { fields: breakdownFields, update: updateBreakdown } = useFieldArray({
    control: financialForm.control,
    name: 'breakdown',
  });

  const onSubmitTechnical = async (formData: CreateTechnicalBidRequest) => {
    try {
      await createTechnicalBid(formData).unwrap();
      toast.success(hasTechnicalBid ? 'Technical bid updated successfully' : 'Technical bid submitted successfully');
      refetchBids();
      setActiveTab('financial');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to submit technical bid');
    }
  };

  const onSubmitFinancial = async (formData: CreateFinancialBidRequest) => {
    try {
      // Calculate total amount from breakdown
      const totalAmount = formData.breakdown.reduce(
        (sum, item) => sum + (item.rate * item.quantity),
        0
      );

      // Prepare the payload
      const payload = {
        ...formData,
        totalAmount,
        breakdown: formData.breakdown.map(item => ({
          boqItemId: item.boqItemId,
          rate: Number(item.rate),
          quantity: Number(item.quantity),
          subtotal: Number(item.rate) * Number(item.quantity),
        })),
      };

      await createFinancialBid(payload).unwrap();
      toast.success('Financial bid submitted successfully!');
      refetchBids(); // Refresh bids to update UI
    } catch (error) {
      console.error('Error submitting financial bid:', error);
      toast.error('Failed to submit financial bid. Please try again.');
    }
  };

  const onSubmitBidSecurity = async (formData: CreateBidSecurityRequest) => {
    try {
      await createBidSecurity(formData).unwrap();
      toast.success(hasBidSecurity ? 'Bid security updated successfully' : 'Bid security submitted successfully');
      refetchBids();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to submit bid security');
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

  const getBidStatus = () => {
    if (hasTechnicalBid && hasFinancialBid && hasBidSecurity) {
      return { label: 'Complete Bid Submitted', variant: 'default' as const, icon: CheckCircle2 };
    }
    if (hasTechnicalBid && hasFinancialBid) {
      return { label: 'Bid Submitted (Security Pending)', variant: 'secondary' as const, icon: Clock };
    }
    if (hasTechnicalBid || hasFinancialBid) {
      return { label: 'Partial Submission', variant: 'outline' as const, icon: AlertCircle };
    }
    return { label: 'Not Submitted', variant: 'destructive' as const, icon: AlertCircle };
  };

  const status = getBidStatus();
  const StatusIcon = status.icon;

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
          Back to RFQ
        </Button>
        <Button type="submit" disabled={isSubmittingTechnical}>
          {isSubmittingTechnical && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {hasTechnicalBid ? 'Update' : 'Submit'} Technical Bid
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
                {breakdownFields.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No BOQ items found in this RFQ</p>
                      <p className="text-sm mt-1">Please contact the RFQ creator to add BOQ items</p>
                    </td>
                  </tr>
                ) : (

                  breakdownFields.map((field, index) => {
                    const rate = financialForm.watch(`breakdown.${index}.rate`);
                    const quantity = financialForm.watch(`breakdown.${index}.quantity`);
                    const subtotal = rate * quantity;

                    return (
                      <tr key={field.id} className="border-b">
                        <td className="p-2">
                          <input
                            type="hidden"
                            {...financialForm.register(`breakdown.${index}.boqItemId`)}
                            value={field.boqItemId}
                          />
                          {field.description}
                        </td>
                        <td className="p-2">{field.unit || '-'}</td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            {...financialForm.register(`breakdown.${index}.quantity`, {
                              required: 'Quantity is required',
                              valueAsNumber: true,
                              min: { value: 0, message: 'Must be positive' },
                            })}
                            className="w-24 text-right border rounded p-1"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            {...financialForm.register(`breakdown.${index}.rate`, {
                              required: 'Rate is required',
                              valueAsNumber: true,
                              min: { value: 0, message: 'Must be positive' },
                            })}
                            className="w-32 text-right border rounded p-1"
                          />
                        </td>
                        <td className="p-2 text-right font-medium">
                          ${subtotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })

                )}
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
        <Button type="button" variant="outline" onClick={() => navigate(`/rfqs/${rfqId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to RFQ
        </Button>
        <Button type="submit" disabled={isSubmittingFinancial}>
          {isSubmittingFinancial && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {hasFinancialBid ? 'Update' : 'Submit'} Financial Bid
        </Button>
      </div>
    </form>
  );

  const renderBidSecurity = () => (
    <form onSubmit={bidSecurityForm.handleSubmit(onSubmitBidSecurity)} className="space-y-6">
      {hasBidSecurity && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Bid security already submitted. You can update it below.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Earnest Money Deposit (EMD)
          </CardTitle>
          <CardDescription>Submit bid security details (Optional but recommended)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="securityType">Security Type *</Label>
            <Select
              defaultValue={bidSecurityForm.watch('type')}
              onValueChange={(value: any) => bidSecurityForm.setValue('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select security type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_guarantee">Bank Guarantee</SelectItem>
                <SelectItem value="demand_draft">Demand Draft</SelectItem>
                <SelectItem value="online_payment">Online Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              {...bidSecurityForm.register('amount', {
                required: 'Amount is required',
                valueAsNumber: true,
              })}
              placeholder="Enter EMD amount"
            />
            {bidSecurityForm.formState.errors.amount && (
              <p className="text-sm text-destructive mt-1">{bidSecurityForm.formState.errors.amount.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                {...bidSecurityForm.register('bankName')}
                placeholder="e.g., State Bank of India"
              />
            </div>
            <div>
              <Label htmlFor="guaranteeNumber">Guarantee/Reference Number</Label>
              <Input
                id="guaranteeNumber"
                {...bidSecurityForm.register('guaranteeNumber')}
                placeholder="e.g., BG123456789"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issueDate">Issue Date (Optional)</Label>
              <Input
                id="issueDate"
                type="date"
                {...bidSecurityForm.register('issueDate')}
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
              <Input
                id="expiryDate"
                type="date"
                {...bidSecurityForm.register('expiryDate')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => navigate(`/rfqs/${rfqId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to RFQ
        </Button>
        <Button type="submit" disabled={isSubmittingBidSecurity}>
          {isSubmittingBidSecurity && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {hasBidSecurity ? 'Update' : 'Submit'} Bid Security
        </Button>
      </div>
    </form>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Submit Bid - {rfq.title}</h1>
          <p className="text-muted-foreground mt-2">
            Submit your bid components flexibly - no specific order required
          </p>
        </div>
        <Badge variant={status.variant} className="flex items-center gap-2">
          <StatusIcon className="h-4 w-4" />
          {status.label}
        </Badge>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${hasTechnicalBid ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Technical Bid</p>
                <p className="text-sm text-muted-foreground">
                  {hasTechnicalBid ? 'Submitted' : 'Pending'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${hasFinancialBid ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Financial Bid</p>
                <p className="text-sm text-muted-foreground">
                  {hasFinancialBid ? 'Submitted' : 'Pending'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${hasBidSecurity ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Bid Security</p>
                <p className="text-sm text-muted-foreground">
                  {hasBidSecurity ? 'Submitted' : 'Optional'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="technical" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Technical
            {hasTechnicalBid && <CheckCircle2 className="h-3 w-3 text-green-600" />}
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial
            {hasFinancialBid && <CheckCircle2 className="h-3 w-3 text-green-600" />}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security (EMD)
            {hasBidSecurity && <CheckCircle2 className="h-3 w-3 text-green-600" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="technical">
          {hasTechnicalBid && (
            <Alert className="mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Technical bid already submitted. You can update it below.
              </AlertDescription>
            </Alert>
          )}
          {renderTechnicalBid()}
        </TabsContent>

        <TabsContent value="financial">
          {hasFinancialBid && (
            <Alert className="mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Financial bid already submitted. You can update it below.
              </AlertDescription>
            </Alert>
          )}
          {renderFinancialBid()}
        </TabsContent>

        <TabsContent value="security">
          {renderBidSecurity()}
        </TabsContent>
      </Tabs>

      {hasTechnicalBid && hasFinancialBid && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Bid Successfully Submitted!</p>
                  <p className="text-sm text-green-700">
                    Your technical and financial bids have been submitted. {!hasBidSecurity && 'You can optionally add bid security.'}
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate(`/rfqs/${rfqId}`)}>
                View RFQ Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BidSubmissionEnhanced;
