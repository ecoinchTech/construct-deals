import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useGetRFQQuery } from '@/store/api/rfqApi';
import { useCreateBidMutation } from '@/store/api/bidApi';
import { CreateBidRequest, BidBreakdownItem } from '@/types/bid.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Loader2, Calculator, FileText, Clock, Shield } from 'lucide-react';

const BidSubmission = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetRFQQuery(id!);
  const [createBid, { isLoading: isSubmitting }] = useCreateBidMutation();

  const rfq = data?.data?.rfq;

  const { register, handleSubmit, formState: { errors }, control, watch, setValue } = useForm<CreateBidRequest>({
    defaultValues: {
      rfqId: id!,
      breakdown: rfq?.boqItems.map(item => ({
        description: item.description,
        rate: 0,
        quantity: item.quantity,
        subtotal: 0,
      })) || [],
    },
  });

  const { fields } = useFieldArray({
    control,
    name: 'breakdown',
  });

  const breakdown = watch('breakdown');

  const calculateTotal = () => {
    return breakdown?.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0) || 0;
  };

  const onSubmit = async (data: CreateBidRequest) => {
    const total = calculateTotal();
    
    try {
      await createBid({
        ...data,
        totalAmount: total,
      }).unwrap();
      toast.success('Bid submitted successfully');
      navigate(`/rfqs/${id}`);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to submit bid');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submit Bid</h1>
        <p className="text-muted-foreground mt-2">{rfq.title}</p>
      </div>

      <Card className="bg-primary/5 border-primary">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Budget Range</p>
              <p className="font-medium">${rfq.estBudgetMin.toLocaleString()} - ${rfq.estBudgetMax.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Close Date</p>
              <p className="font-medium">{new Date(rfq.closeDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Bid Total</p>
              <p className="text-2xl font-bold text-primary">${calculateTotal().toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              BOQ Pricing
            </CardTitle>
            <CardDescription>Enter your rates for each item</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">#</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-center p-2">Unit</th>
                    <th className="text-right p-2">Quantity</th>
                    <th className="text-right p-2">Your Rate</th>
                    <th className="text-right p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {rfq.boqItems.map((item, index) => {
                    const quantity = item.quantity;
                    const rate = watch(`breakdown.${index}.rate`) || 0;
                    const subtotal = quantity * Number(rate);

                    return (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2">{item.description}</td>
                        <td className="p-2 text-center">{item.unit}</td>
                        <td className="p-2 text-right">{quantity}</td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`breakdown.${index}.rate`, {
                              required: 'Rate is required',
                              valueAsNumber: true,
                              onChange: (e) => {
                                const newSubtotal = quantity * Number(e.target.value);
                                setValue(`breakdown.${index}.subtotal`, newSubtotal);
                              }
                            })}
                            className="text-right"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="p-2 text-right font-medium">
                          ${subtotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 font-bold">
                    <td colSpan={5} className="p-2 text-right">Total Amount:</td>
                    <td className="p-2 text-right text-xl text-primary">
                      ${calculateTotal().toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline & Validity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timelineDays">Project Timeline (Days) *</Label>
                <Input
                  id="timelineDays"
                  type="number"
                  {...register('timelineDays', { 
                    required: 'Timeline is required',
                    valueAsNumber: true,
                  })}
                  placeholder="30"
                />
                {errors.timelineDays && (
                  <p className="text-sm text-destructive mt-1">{errors.timelineDays.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="validityDays">Bid Validity (Days) *</Label>
                <Input
                  id="validityDays"
                  type="number"
                  {...register('validityDays', { 
                    required: 'Validity is required',
                    valueAsNumber: true,
                  })}
                  placeholder="60"
                />
                {errors.validityDays && (
                  <p className="text-sm text-destructive mt-1">{errors.validityDays.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="leadTime">Lead Time</Label>
                <Input
                  id="leadTime"
                  {...register('leadTime')}
                  placeholder="2 weeks for material procurement"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Warranty & Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="warranty">Warranty Terms *</Label>
                <Textarea
                  id="warranty"
                  {...register('warranty', { required: 'Warranty terms are required' })}
                  placeholder="1 year comprehensive warranty on all materials and workmanship"
                  rows={3}
                />
                {errors.warranty && (
                  <p className="text-sm text-destructive mt-1">{errors.warranty.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="exclusions">Exclusions</Label>
                <Textarea
                  id="exclusions"
                  {...register('exclusions')}
                  placeholder="List any exclusions or items not covered in this bid"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Methodology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="methodology">Project Approach & Methodology *</Label>
              <Textarea
                id="methodology"
                {...register('methodology', { required: 'Methodology is required' })}
                placeholder="Describe your approach to executing this project, including key milestones and quality assurance measures..."
                rows={6}
              />
              {errors.methodology && (
                <p className="text-sm text-destructive mt-1">{errors.methodology.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/rfqs/${id}`)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Bid
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BidSubmission;
